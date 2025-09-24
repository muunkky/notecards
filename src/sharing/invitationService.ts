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
  createdAt: Date
  updatedAt: Date
}

export class EmailAlreadyInvitedError extends Error { constructor(msg = 'Email already has a pending invite for this deck') { super(msg); this.name = 'EmailAlreadyInvitedError' } }
export class InviteLimitExceededError extends Error { constructor(msg = 'Invite/collaborator limit exceeded for this deck') { super(msg); this.name = 'InviteLimitExceededError' } }

const INVITE_LIMIT_SOFT = 25 // combined collaborators + pending invites

export async function createInvite(deckId: string, inviterId: string, email: string, role: Exclude<DeckRole,'owner'>): Promise<Invite> {
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
  const docRef = await addDoc(invitesRef, {
    deckId,
    inviterId,
    emailLower,
    roleRequested: role,
    status: 'pending',
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
    createdAt: new Date(),
    updatedAt: new Date()
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
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as Invite
  })
}

export async function revokeInvite(inviteId: string, actorUid: string): Promise<void> {
  const inviteRef = doc(db, 'deckInvites', inviteId)
  await updateDoc(inviteRef, { status: 'revoked', revokedBy: actorUid, revokedAt: serverTimestamp(), updatedAt: serverTimestamp() } as any)
}
