import { addDoc, collection, serverTimestamp, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import type { DeckRole } from '../types'

export interface Invite {
  id: string
  deckId: string
  inviterId: string
  emailLower: string
  roleRequested: Exclude<DeckRole, 'owner'>
  status: 'pending' | 'revoked' | 'accepted' | 'expired'
  // hashed token for acceptance lookup (sha256 hex). Not exposed externally except in specialized admin flows.
  tokenHash?: string
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

export class EmailAlreadyInvitedError extends Error { constructor(msg = 'Email already has a pending invite for this deck') { super(msg); this.name = 'EmailAlreadyInvitedError' } }
export class InviteLimitExceededError extends Error { constructor(msg = 'Invite/collaborator limit exceeded for this deck') { super(msg); this.name = 'InviteLimitExceededError' } }

const INVITE_LIMIT_SOFT = 25 // combined collaborators + pending invites
const INVITE_TTL_MS = 1000 * 60 * 60 * 24 * 14 // 14 days

async function sha256Hex(input: string): Promise<string> {
  if (typeof window !== 'undefined' && (window as any).crypto?.subtle) {
    const enc = new TextEncoder().encode(input)
    const digest = await (window as any).crypto.subtle.digest('SHA-256', enc)
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')
  }
  // Node path (tests / SSR)
  const { createHash } = await import('crypto')
  return createHash('sha256').update(input).digest('hex')
}

function randomTokenHex(bytes = 32): string {
  if (typeof window !== 'undefined' && (window as any).crypto?.getRandomValues) {
    const arr = new Uint8Array(bytes)
    ;(window as any).crypto.getRandomValues(arr)
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
  }
  const { randomBytes } = require('crypto')
  return randomBytes(bytes).toString('hex')
}

export async function createInvite(deckId: string, inviterId: string, email: string, role: Exclude<DeckRole,'owner'>): Promise<Invite & { tokenPlain: string }> {
  const emailLower = email.trim().toLowerCase()

  // prevent duplicate pending invite for same deck+email
  const invitesRef = collection(db, 'deckInvites')
  const dupeQ = query(invitesRef, where('deckId', '==', deckId), where('emailLower', '==', emailLower), where('status', '==', 'pending'))
  const dupeSnap = await getDocs(dupeQ)
  if (!dupeSnap.empty) {
    throw new EmailAlreadyInvitedError()
  }

  // soft-limit guard: count pending invites + collaborators on deck
  const pendingQ = query(invitesRef, where('deckId', '==', deckId), where('status', '==', 'pending'))
  const pendingSnap = await getDocs(pendingQ)
  const deckRef = doc(db, 'decks', deckId)
  const deckSnap = await getDoc(deckRef)
  const collabCount = deckSnap.exists() ? (deckSnap.data()?.collaboratorIds?.length || 0) : 0
  if ((pendingSnap.size || 0) + collabCount >= INVITE_LIMIT_SOFT) {
    throw new InviteLimitExceededError()
  }

  const now = serverTimestamp()
  const tokenPlain = randomTokenHex(32)
  const tokenHash = await sha256Hex(tokenPlain)
  const expiresAtDate = new Date(Date.now() + INVITE_TTL_MS)
  const docRef = await addDoc(invitesRef, {
    deckId,
    inviterId,
    emailLower,
    roleRequested: role,
    status: 'pending',
    tokenHash,
    expiresAt: expiresAtDate,
    createdAt: now,
    updatedAt: now
  } as any)

  // Return a plain object; callers needing live timestamps will re-fetch
  return {
    id: docRef.id,
    deckId,
    inviterId,
    emailLower,
    roleRequested: role,
    status: 'pending',
    tokenHash,
    expiresAt: expiresAtDate,
    createdAt: new Date(),
    updatedAt: new Date(),
    tokenPlain
  }
}

export async function listPendingInvites(deckId: string): Promise<Invite[]> {
  const invitesRef = collection(db, 'deckInvites')
  const q = query(invitesRef, where('deckId', '==', deckId), where('status', '==', 'pending'))
  const snap = await getDocs(q)
  if (snap.empty) return []
  return snap.docs.map(d => {
    const data: any = d.data()
    return {
      id: d.id,
      deckId: data.deckId,
      inviterId: data.inviterId,
      emailLower: data.emailLower,
      roleRequested: data.roleRequested,
      status: data.status,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt?.toDate?.() || undefined,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as Invite
  })
}

export async function revokeInvite(inviteId: string, actorUid: string): Promise<void> {
  const inviteRef = doc(db, 'deckInvites', inviteId)
  await updateDoc(inviteRef, { status: 'revoked', revokedBy: actorUid, revokedAt: serverTimestamp(), updatedAt: serverTimestamp() } as any)
}
