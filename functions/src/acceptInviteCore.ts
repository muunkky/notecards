import * as admin from 'firebase-admin'

export interface AcceptInviteResult {
  ok: true
  roleGranted?: string
  alreadyMember?: boolean
}

export class InviteError extends Error { constructor(public code: string, message: string){ super(message) } }

type Role = 'viewer' | 'editor' | 'owner'
const roleRank: Record<Role, number> = { viewer: 1, editor: 2, owner: 3 }

function hasAtLeast(current?: string, required?: string): boolean {
  if (!required) return true
  if (!current) return false
  const c = (current as Role)
  const r = (required as Role)
  if (!(c in roleRank) || !(r in roleRank)) return false
  return roleRank[c] >= roleRank[r]
}

export async function acceptInviteCore(params: { deckId: string; tokenHash: string; uid: string }): Promise<AcceptInviteResult> {
  const { deckId, tokenHash, uid } = params
  if (!deckId || !tokenHash || !uid) {
    throw new InviteError('invalid-argument','Missing required fields')
  }

  const db = admin.firestore()

  // Find the invite by deckId + tokenHash (any status)
  const inviteSnap = await db.collection('deckInvites')
    .where('deckId', '==', deckId)
    .where('tokenHash', '==', tokenHash)
    .limit(1)
    .get()

  if (inviteSnap.empty) {
    throw new InviteError('invite/not-found', 'Invite not found')
  }

  const inviteDoc = inviteSnap.docs[0]
  const inviteRef = inviteDoc.ref
  const invite = inviteDoc.data() as any
  const status: string = invite.status || 'pending'
  const roleRequested: Role = (invite.roleRequested || 'viewer')
  const expiresAt: admin.firestore.Timestamp | undefined = invite.expiresAt

  if (status === 'revoked') {
    throw new InviteError('invite/revoked', 'Invite has been revoked')
  }

  // Expiry check based on timestamp in doc
  if (expiresAt && expiresAt.toDate().getTime() < Date.now()) {
    throw new InviteError('invite/expired', 'Invite has expired')
  }

  const deckRef = db.collection('decks').doc(deckId)

  // Execute transaction to ensure atomic update of deck + invite
  const result = await db.runTransaction(async (tx): Promise<AcceptInviteResult> => {
    const [inviteLatestSnap, deckSnap] = await Promise.all([tx.get(inviteRef), tx.get(deckRef)])

    if (!inviteLatestSnap.exists) {
      throw new InviteError('invite/not-found', 'Invite not found')
    }
    const inv = inviteLatestSnap.data() as any
    const invStatus: string = inv.status || 'pending'
    const invRole: Role = (inv.roleRequested || roleRequested)
    const invExpires: admin.firestore.Timestamp | undefined = inv.expiresAt

    if (invStatus === 'revoked') {
      throw new InviteError('invite/revoked', 'Invite has been revoked')
    }
    if (invExpires && invExpires.toDate().getTime() < Date.now()) {
      throw new InviteError('invite/expired', 'Invite has expired')
    }

    if (!deckSnap.exists) {
      // Deck missing; treat as not-found to avoid leaking info
      throw new InviteError('invite/not-found', 'Invite not found')
    }

    const deck = deckSnap.data() as any
    const roles: Record<string, string> = deck.roles || {}
    const collaboratorIds: string[] = Array.isArray(deck.collaboratorIds) ? deck.collaboratorIds : []
    const currentRole = roles[uid]

    // If the invite was already accepted, return idempotent success
    if (invStatus === 'accepted') {
      return { ok: true, alreadyMember: true }
    }

    // If the user already has equal or higher role, just mark invite accepted and return alreadyMember
    if (hasAtLeast(currentRole, invRole)) {
      tx.update(inviteRef, {
        status: 'accepted',
        acceptedBy: uid,
        acceptedAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      })
      return { ok: true, alreadyMember: true }
    }

    // Otherwise, grant the requested role
    const newRoles = { ...roles, [uid]: invRole }
    const newCollaboratorIds = collaboratorIds.includes(uid) ? collaboratorIds : [...collaboratorIds, uid]

    tx.update(deckRef, {
      roles: newRoles,
      collaboratorIds: newCollaboratorIds,
      updatedAt: admin.firestore.Timestamp.now(),
    })

    tx.update(inviteRef, {
      status: 'accepted',
      acceptedBy: uid,
      acceptedAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    })

    return { ok: true, roleGranted: invRole, alreadyMember: false }
  })

  return result
}
