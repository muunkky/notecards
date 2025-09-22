import { doc, runTransaction, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import type { Deck, DeckRole } from '../types'

export class UserNotFoundError extends Error {
  constructor(message = 'User not found') {
    super(message)
    this.name = 'UserNotFoundError'
  }
}

// Utility to lookup a user by email. Assumes a 'users' collection keyed by uid with email field.
// Returns user UID or throws UserNotFoundError if not found.
export async function lookupUserIdByEmail(email: string): Promise<string> {
  const usersRef = collection(db, 'users')
  const q = query(usersRef, where('email', '==', email.toLowerCase()))
  const snap = await getDocs(q)
  if (snap.empty) {
    throw new UserNotFoundError()
  }
  // If multiple, take first (emails should be unique)
  return snap.docs[0].id
}

interface CollaboratorUpdateResult {
  deck: Deck
  added?: { uid: string; role: DeckRole }
  removed?: { uid: string }
}

export async function addCollaboratorFirestore(deckId: string, email: string, defaultRole: DeckRole = 'editor'): Promise<CollaboratorUpdateResult> {
  const uid = await lookupUserIdByEmail(email)
  if (!uid) throw new UserNotFoundError()
  const deckRef = doc(db, 'decks', deckId)

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(deckRef)
    if (!snap.exists()) throw new Error('Deck does not exist')
    const data: any = snap.data()
    const roles: Record<string, DeckRole> = { ...(data.roles || {}) }
    if (uid === data.ownerId) throw new Error('Owner already has access')
    if (roles[uid]) {
      // Already present; no-op
      return
    }
    roles[uid] = defaultRole
    const collaboratorIds: string[] = Array.from(new Set([...(data.collaboratorIds || []), uid]))
    tx.update(deckRef, { roles, collaboratorIds, updatedAt: serverTimestamp() })
  })

  // Fetch updated deck to return (non-transactionally)
  const updated = await getDoc(deckRef)
  const deckData: any = updated.data()
  return {
    deck: {
      id: updated.id,
      title: deckData.title,
      ownerId: deckData.ownerId,
      createdAt: deckData.createdAt?.toDate?.() || new Date(),
      updatedAt: deckData.updatedAt?.toDate?.() || new Date(),
      cardCount: deckData.cardCount,
      collaboratorIds: deckData.collaboratorIds,
      roles: deckData.roles
    },
    added: { uid, role: deckData.roles?.[uid] }
  }
}

export async function removeCollaboratorFirestore(deckId: string, uid: string): Promise<CollaboratorUpdateResult> {
  const deckRef = doc(db, 'decks', deckId)
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(deckRef)
    if (!snap.exists()) throw new Error('Deck does not exist')
    const data: any = snap.data()
    if (uid === data.ownerId) throw new Error('Cannot remove owner')
    const roles: Record<string, DeckRole> = { ...(data.roles || {}) }
    if (!roles[uid]) return // no-op if not present
    delete roles[uid]
    const collaboratorIds: string[] = (data.collaboratorIds || []).filter((id: string) => id !== uid)
    tx.update(deckRef, { roles, collaboratorIds, updatedAt: serverTimestamp() })
  })

  const updated = await getDoc(deckRef)
  const deckData: any = updated.data()
  return {
    deck: {
      id: updated.id,
      title: deckData.title,
      ownerId: deckData.ownerId,
      createdAt: deckData.createdAt?.toDate?.() || new Date(),
      updatedAt: deckData.updatedAt?.toDate?.() || new Date(),
      cardCount: deckData.cardCount,
      collaboratorIds: deckData.collaboratorIds,
      roles: deckData.roles
    },
    removed: { uid }
  }
}
