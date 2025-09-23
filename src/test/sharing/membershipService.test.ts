import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { setDoc, doc, collection, getDoc } from 'firebase/firestore'
import { addCollaborator, removeCollaborator, changeCollaboratorRole, validateRoleTransition, setCollaboratorRoleDirect, UserNotFoundError } from '../../sharing/membershipService'
import { db as prodDb } from '../../firebase/firebase'

// NOTE: This test uses the real membershipService which depends on firebase/firestore client SDK.
// For TDD of pure logic we exercise validateRoleTransition directly and perform a light integration path
// for addCollaborator/changeCollaboratorRole with a seeded deck & fake user docs.

let testEnv: RulesTestEnvironment
const PROJECT_ID = 'notecards-1b054'

async function setupEnv() {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { host: '127.0.0.1', port: 8080 }
  })
}

function getDb(uid?: string) {
  if (uid) return testEnv.authenticatedContext(uid).firestore()
  return testEnv.unauthenticatedContext().firestore()
}

async function seedUser(uid: string, email: string) {
  const db = getDb(uid)
  await setDoc(doc(db, 'users', uid), { email, displayName: email.split('@')[0], createdAt: new Date() })
}

async function seedDeck(ownerId: string) {
  const db = getDb(ownerId)
  const ref = doc(collection(db, 'decks'))
  await setDoc(ref, { title: 'Deck', ownerId, roles: { [ownerId]: 'owner' }, collaboratorIds: [], createdAt: new Date(), updatedAt: new Date() })
  return ref.id
}

describe('membershipService', () => {
  beforeAll(async () => {
    await setupEnv()
  })

  afterAll(async () => {
    await testEnv?.cleanup()
  })

  it('validateRoleTransition basics', () => {
    expect(validateRoleTransition('editor','viewer')).toBe(true)
    expect(validateRoleTransition('viewer','editor')).toBe(true)
    expect(validateRoleTransition('owner','editor')).toBe(false)
    expect(validateRoleTransition('editor','owner')).toBe(false)
    expect(validateRoleTransition('editor', null)).toBe(true)
  })

  it('add collaborator then change role and remove', async () => {
    const owner = 'owner_1'
    const collab = 'user_2'
    await seedUser(owner, 'owner@example.com')
    await seedUser(collab, 'collab@example.com')
    const deckId = await seedDeck(owner)

    // add via email
    const addResult = await addCollaborator(deckId, 'collab@example.com')
    expect(addResult.added?.uid).toBe(collab)
    // change role to viewer
    const change = await changeCollaboratorRole(deckId, collab, 'viewer')
    expect(change.changed?.from).toBe('editor')
    expect(change.changed?.to).toBe('viewer')
    // remove
    const removed = await changeCollaboratorRole(deckId, collab, null)
    expect(removed.removed?.uid).toBe(collab)
  })

  it('setCollaboratorRoleDirect helper works for tests', async () => {
    const owner = 'o2'
    const collab = 'u3'
    await seedUser(owner, 'o2@example.com')
    await seedUser(collab, 'u3@example.com')
    const deckId = await seedDeck(owner)
    await setCollaboratorRoleDirect(deckId, collab, 'viewer')
    // verify deck has role
    const db = getDb(owner)
    const snap = await getDoc(doc(db, 'decks', deckId))
    expect(snap.data()?.roles[collab]).toBe('viewer')
  })

  it('throws UserNotFoundError for unknown email', async () => {
    const owner = 'o3'
    await seedUser(owner, 'o3@example.com')
    const deckId = await seedDeck(owner)
    await expect(addCollaborator(deckId, 'missing@example.com')).rejects.toBeInstanceOf(UserNotFoundError)
  })
})
