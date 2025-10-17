import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { readFileSync } from 'node:fs'
import { doc, setDoc, getDoc, collection, addDoc, updateDoc } from 'firebase/firestore'

let testEnv: RulesTestEnvironment | null = null
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'notecards-1b054'

export async function initTestEnv() {
  if (testEnv) return testEnv
  // Provide explicit host/port (needed in some environments even when FIRESTORE_EMULATOR_HOST is set)
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { host: '127.0.0.1', port: 8080, rules: readFileSync('firestore.rules', 'utf8') }
  })
  return testEnv
}

export async function getDbFor(uid?: string) {
  const env = await initTestEnv()
  if (uid) return env.authenticatedContext(uid).firestore()
  return env.unauthenticatedContext().firestore()
}

export async function seedDeck(ownerId: string, data?: Partial<any>) {
  const db = await getDbFor(ownerId)
  const ref = doc(collection(db, 'decks'))
  const deck = { title: 'Seed Deck', ownerId, roles: { [ownerId]: 'owner' }, collaboratorIds: [], createdAt: new Date(), updatedAt: new Date(), ...(data || {}) }
  await setDoc(ref, deck)
  return ref.id
}

export async function addRoles(deckId: string, roles: Record<string, string>, collaboratorIds?: string[]) {
  const db = await getDbFor(Object.keys(roles)[0])
  const ref = doc(db, 'decks', deckId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Deck missing to add roles')
  await updateDoc(ref, { roles, collaboratorIds: collaboratorIds || Object.keys(roles).filter(u => u !== snap.data().ownerId) })
}

export async function attemptReadDeck(deckId: string, uid?: string): Promise<boolean> {
  try { const db = await getDbFor(uid); await getDoc(doc(db, 'decks', deckId)); return true } catch { return false }
}

export async function attemptUpdateDeckTitle(deckId: string, uid: string): Promise<boolean> {
  try { const db = await getDbFor(uid); await updateDoc(doc(db, 'decks', deckId), { title: 'Updated Title' }); return true } catch { return false }
}

export async function seedCard(deckId: string, ownerId: string) {
  const db = await getDbFor(ownerId)
  const ref = await addDoc(collection(doc(db, 'decks', deckId), 'cards'), { title: 'Card 1', body: 'Body', orderIndex: 0, createdAt: new Date(), updatedAt: new Date() })
  return ref.id
}

export async function attemptUpdateCard(deckId: string, cardId: string, uid: string): Promise<boolean> {
  try { const db = await getDbFor(uid); await updateDoc(doc(doc(db, 'decks', deckId), 'cards', cardId), { title: 'New Card Title' }); return true } catch { return false }
}

export async function cleanupEnv() { if (testEnv) await testEnv.clearFirestore() }
