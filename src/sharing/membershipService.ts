import { doc, runTransaction, getDoc, serverTimestamp, collection, query, where, getDocs, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import type { DeckRole, Deck } from '../types'

// Error Types
export class UserNotFoundError extends Error { constructor(msg = 'User not found') { super(msg); this.name = 'UserNotFoundError' } }
export class InvalidRoleTransitionError extends Error { constructor(msg = 'Invalid role transition') { super(msg); this.name = 'InvalidRoleTransitionError' } }
export class OwnerRemovalError extends Error { constructor(msg = 'Cannot remove owner') { super(msg); this.name = 'OwnerRemovalError' } }

// Lookup user by email (existing account required for Phase 1)
export async function lookupUserIdByEmail(email: string): Promise<string> {
  const usersRef = collection(db, 'users')
  const q = query(usersRef, where('email', '==', email.toLowerCase()))
  const snap = await getDocs(q)
  if (snap.empty) throw new UserNotFoundError()
  return snap.docs[0].id
}

// Validate role transition for an existing collaborator.
export function validateRoleTransition(current: DeckRole | undefined, target: DeckRole | null): boolean {
  if (current === 'owner') return false // cannot change owner
  if (current === target) return true // no-op allowed
  if (target === null) return true // removal allowed (handled separately)
  if (!['editor','viewer','owner'].includes(target)) return false
  if (target === 'owner') return false // cannot promote
  return true
}

interface MembershipResult { deck: Deck; added?: { uid: string; role: DeckRole }; removed?: { uid: string }; changed?: { uid: string; from: DeckRole; to: DeckRole } }

function mapDeck(id: string, data: any): Deck {
  return {
    id,
    title: data.title,
    ownerId: data.ownerId,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
    cardCount: data.cardCount,
    collaboratorIds: data.collaboratorIds,
    roles: data.roles
  }
}

// Add collaborator with default role (editor if omitted)
export async function addCollaborator(deckId: string, email: string, defaultRole: DeckRole = 'editor'): Promise<MembershipResult> {
  const uid = await lookupUserIdByEmail(email)
  const deckRef = doc(db, 'decks', deckId)
  await runTransaction(db, async tx => {
    const snap = await tx.get(deckRef)
    if (!snap.exists()) throw new Error('Deck does not exist')
    const data: any = snap.data()
    if (uid === data.ownerId) throw new Error('Owner already has access')
    const roles: Record<string, DeckRole> = { ...(data.roles || {}) }
    if (roles[uid]) return // no-op
    roles[uid] = defaultRole
    const collaboratorIds: string[] = Array.from(new Set([...(data.collaboratorIds || []), uid]))
    tx.update(deckRef, { roles, collaboratorIds, updatedAt: serverTimestamp() })
  })
  const updated = await getDoc(deckRef)
  const data: any = updated.data()
  return { deck: mapDeck(updated.id, data), added: { uid, role: data.roles?.[uid] } }
}

// Remove collaborator by uid (cannot remove owner)
export async function removeCollaborator(deckId: string, uid: string): Promise<MembershipResult> {
  const deckRef = doc(db, 'decks', deckId)
  await runTransaction(db, async tx => {
    const snap = await tx.get(deckRef)
    if (!snap.exists()) throw new Error('Deck does not exist')
    const data: any = snap.data()
    if (uid === data.ownerId) throw new OwnerRemovalError()
    const roles: Record<string, DeckRole> = { ...(data.roles || {}) }
    if (!roles[uid]) return
    delete roles[uid]
    const collaboratorIds: string[] = (data.collaboratorIds || []).filter((id: string) => id !== uid)
    tx.update(deckRef, { roles, collaboratorIds, updatedAt: serverTimestamp() })
  })
  const updated = await getDoc(deckRef)
  const data: any = updated.data()
  return { deck: mapDeck(updated.id, data), removed: { uid } }
}

// Change collaborator role (editor <-> viewer). Pass targetRole=null to remove.
export async function changeCollaboratorRole(deckId: string, uid: string, targetRole: DeckRole | null): Promise<MembershipResult> {
  const deckRef = doc(db, 'decks', deckId)
  let result: MembershipResult | null = null
  await runTransaction(db, async tx => {
    const snap = await tx.get(deckRef)
    if (!snap.exists()) throw new Error('Deck does not exist')
    const data: any = snap.data()
    if (uid === data.ownerId) throw new OwnerRemovalError('Cannot modify owner role')
    const roles: Record<string, DeckRole> = { ...(data.roles || {}) }
    const current = roles[uid]
    if (!current && targetRole === null) { return } // no-op remove absent
    if (!current && targetRole) {
      // treat as add if absent
      roles[uid] = targetRole
      const collaboratorIds: string[] = Array.from(new Set([...(data.collaboratorIds || []), uid]))
      tx.update(deckRef, { roles, collaboratorIds, updatedAt: serverTimestamp() })
      result = { deck: mapDeck(deckRef.id, { ...data, roles, collaboratorIds }), added: { uid, role: targetRole } }
      return
    }
    if (!validateRoleTransition(current, targetRole)) throw new InvalidRoleTransitionError()
    if (targetRole === null) {
      delete roles[uid]
      const collaboratorIds: string[] = (data.collaboratorIds || []).filter((id: string) => id !== uid)
      tx.update(deckRef, { roles, collaboratorIds, updatedAt: serverTimestamp() })
      result = { deck: mapDeck(deckRef.id, { ...data, roles, collaboratorIds }), removed: { uid } }
      return
    }
    roles[uid] = targetRole
    tx.update(deckRef, { roles, updatedAt: serverTimestamp() })
    result = { deck: mapDeck(deckRef.id, { ...data, roles }), changed: { uid, from: current!, to: targetRole } }
  })
  if (!result) {
    // fetch deck when operation was a no-op but we still want deck shape
    const updated = await getDoc(deckRef)
    const data: any = updated.data()
    return { deck: mapDeck(updated.id, data) }
  }
  // Ensure deck snapshot reflects committed transaction values
  const updated = await getDoc(deckRef)
  const data: any = updated.data()
  return { ...result, deck: mapDeck(updated.id, data) }
}

// Utility for tests to directly set a collaborator role (bypassing email lookup)
export async function setCollaboratorRoleDirect(deckId: string, uid: string, role: DeckRole) {
  const deckRef = doc(db, 'decks', deckId)
  await runTransaction(db, async tx => {
    const snap = await tx.get(deckRef)
    if (!snap.exists()) throw new Error('Deck does not exist')
    const data: any = snap.data()
    const roles: Record<string, DeckRole> = { ...(data.roles || {}) }
    roles[uid] = role
    const collaboratorIds: string[] = Array.from(new Set([...(data.collaboratorIds || []), uid]))
    tx.update(deckRef, { roles, collaboratorIds, updatedAt: serverTimestamp() })
  })
  // return nothing
}
