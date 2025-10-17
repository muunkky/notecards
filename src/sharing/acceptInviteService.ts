import { collection, query, where, limit, getDocs, doc, getDoc, runTransaction, Timestamp } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import type { DeckRole } from '../types'

/**
 * AcceptInviteRequest
 * deckId: Target deck to accept invitation for
 * tokenPlain: The invitation token from the email/link (client hashes it before sending)
 */
export interface AcceptInviteRequest {
  deckId: string
  tokenPlain: string
}

/**
 * AcceptInviteResponse
 * deckId: Deck ID the invite applies to
 * roleGranted: Granted role, if an upgrade/addition occurred (undefined if already had equal/higher role)
 * alreadyHadRole: True if user already had equal/higher access; server marks invite accepted idempotently
 */
export interface AcceptInviteResponse {
  deckId: string
  roleGranted?: 'editor' | 'viewer'
  alreadyHadRole: boolean
}

export class InviteError extends Error {
  constructor(public code: string, message: string) {
    super(message)
    this.name = 'InviteError'
  }
}

const roleRank: Record<DeckRole, number> = { viewer: 1, editor: 2, owner: 3 }

function hasAtLeast(current?: DeckRole, required?: DeckRole): boolean {
  if (!required) return true
  if (!current) return false
  if (!(current in roleRank) || !(required in roleRank)) return false
  return roleRank[current] >= roleRank[required]
}

export async function sha256HexAsync(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const subtle = typeof globalThis !== 'undefined' && (globalThis as any).crypto && (globalThis as any).crypto.subtle
  if (!subtle) throw new Error('crypto.subtle not available')
  const data = encoder.encode(input)
  const digest = await subtle.digest('SHA-256', data)
  const hex = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2,'0')).join('')
  return hex
}

/**
 * acceptInvite - Client-side implementation (no Cloud Functions required)
 * Hashes the plain invite token client-side, finds the invite, validates it,
 * and grants access to the deck using Firestore transactions.
 */
export async function acceptInvite({ deckId, tokenPlain }: AcceptInviteRequest, uid: string): Promise<AcceptInviteResponse> {
  if (!deckId || !tokenPlain || !uid) {
    throw new InviteError('invalid-argument', 'Missing required fields')
  }

  const tokenHash = await sha256HexAsync(tokenPlain)

  // Find the invite by deckId + tokenHash
  const invitesRef = collection(db, 'deckInvites')
  const inviteQuery = query(invitesRef, where('deckId', '==', deckId), where('tokenHash', '==', tokenHash), limit(1))
  const inviteSnap = await getDocs(inviteQuery)

  if (inviteSnap.empty) {
    throw new InviteError('invite/not-found', 'Invite not found')
  }

  const inviteDoc = inviteSnap.docs[0]
  const inviteRef = inviteDoc.ref
  const invite = inviteDoc.data() as any
  const status: string = invite.status || 'pending'
  const roleRequested: DeckRole = (invite.roleRequested || 'viewer') as DeckRole
  const expiresAt: Timestamp | undefined = invite.expiresAt

  if (status === 'revoked') {
    throw new InviteError('invite/revoked', 'Invite has been revoked')
  }

  // Expiry check
  if (expiresAt && expiresAt.toDate().getTime() < Date.now()) {
    throw new InviteError('invite/expired', 'Invite has expired')
  }

  const deckRef = doc(db, 'decks', deckId)

  // Execute transaction to ensure atomic update of deck + invite
  const result = await runTransaction(db, async (tx): Promise<AcceptInviteResponse> => {
    const [inviteLatestSnap, deckSnap] = await Promise.all([tx.get(inviteRef), tx.get(deckRef)])

    if (!inviteLatestSnap.exists()) {
      throw new InviteError('invite/not-found', 'Invite not found')
    }

    const inv = inviteLatestSnap.data() as any
    const invStatus: string = inv.status || 'pending'
    const invRole: DeckRole = (inv.roleRequested || roleRequested) as DeckRole
    const invExpires: Timestamp | undefined = inv.expiresAt

    if (invStatus === 'revoked') {
      throw new InviteError('invite/revoked', 'Invite has been revoked')
    }
    if (invExpires && invExpires.toDate().getTime() < Date.now()) {
      throw new InviteError('invite/expired', 'Invite has expired')
    }

    if (!deckSnap.exists()) {
      throw new InviteError('invite/not-found', 'Invite not found')
    }

    const deck = deckSnap.data() as any
    const roles: Record<string, DeckRole> = deck.roles || {}
    const collaboratorIds: string[] = Array.isArray(deck.collaboratorIds) ? deck.collaboratorIds : []
    const currentRole = roles[uid] as DeckRole | undefined

    // If the invite was already accepted, return idempotent success
    if (invStatus === 'accepted') {
      return { deckId, alreadyHadRole: true }
    }

    // If the user already has equal or higher role, just mark invite accepted
    if (hasAtLeast(currentRole, invRole)) {
      tx.update(inviteRef, {
        status: 'accepted',
        acceptedBy: uid,
        acceptedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      return { deckId, alreadyHadRole: true }
    }

    // Grant the requested role
    const newRoles = { ...roles, [uid]: invRole }
    const newCollaboratorIds = collaboratorIds.includes(uid) ? collaboratorIds : [...collaboratorIds, uid]

    tx.update(deckRef, {
      roles: newRoles,
      collaboratorIds: newCollaboratorIds,
      updatedAt: Timestamp.now(),
    })

    tx.update(inviteRef, {
      status: 'accepted',
      acceptedBy: uid,
      acceptedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })

    return { deckId, roleGranted: invRole as 'editor' | 'viewer', alreadyHadRole: false }
  })

  return result
}
