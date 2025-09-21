#!/usr/bin/env node
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { readFileSync } from 'node:fs'
import { doc, setDoc, getDoc, collection, addDoc, updateDoc } from 'firebase/firestore'

// Standalone Firestore security rules verification (no Vitest).
// Assumes Firestore emulator already running at FIRESTORE_EMULATOR_HOST (127.0.0.1:8080) or default.

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'notecards-1b054'
const HOSTPORT = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080'

function log(msg) { console.log(`[rules-verify] ${msg}`) }
function fail(msg) { console.error(`[FAIL] ${msg}`) }
function pass(msg) { console.log(`[PASS] ${msg}`) }

async function main() {
  log(`Connecting to emulator ${HOSTPORT} (project ${PROJECT_ID})`)
  let env
  try {
    env = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: { host: HOSTPORT.split(':')[0], port: Number(HOSTPORT.split(':')[1]), rules: readFileSync('firestore.rules', 'utf8') }
    })
  } catch (e) {
    fail(`initializeTestEnvironment failed: ${e.message}`)
    process.exit(1)
  }

  const OWNER = 'owner_user'
  const EDITOR = 'editor_user'
  const VIEWER = 'viewer_user'
  const OUTSIDER = 'outsider_user'

  let failures = 0
  const results = []

  async function dbFor(uid) { return uid ? env.authenticatedContext(uid).firestore() : env.unauthenticatedContext().firestore() }

  async function seedDeck(ownerId) {
    const db = await dbFor(ownerId)
    const ref = doc(collection(db, 'decks'))
    const now = new Date()
    await setDoc(ref, { title: 'Seed Deck', ownerId, roles: { [ownerId]: 'owner' }, collaboratorIds: [], createdAt: now, updatedAt: now })
    return ref.id
  }
  async function seedCard(deckId, ownerId) {
    const db = await dbFor(ownerId)
    const ref = await addDoc(collection(doc(db, 'decks', deckId), 'cards'), { title: 'Card 1', body: 'Body', orderIndex: 0, createdAt: new Date(), updatedAt: new Date() })
    return ref.id
  }
  async function addRoles(deckId, roles) {
    const db = await dbFor(Object.keys(roles)[0])
    const ref = doc(await dbFor(OWNER), 'decks', deckId) // use owner context for read to fetch owner id
    const ownerSnap = await getDoc(ref)
    const updateDb = await dbFor(Object.keys(roles)[0])
    await updateDoc(doc(updateDb, 'decks', deckId), { roles, collaboratorIds: Object.keys(roles).filter(u => u !== ownerSnap.data().ownerId) })
  }
  async function canRead(deckId, uid) {
    try { const db = await dbFor(uid); await getDoc(doc(db, 'decks', deckId)); return true } catch { return false }
  }
  async function canUpdateCard(deckId, cardId, uid) {
    try { const db = await dbFor(uid); await updateDoc(doc(doc(db, 'decks', deckId), 'cards', cardId), { title: 'New Card Title' }); return true } catch { return false }
  }
  async function canUpdateTitle(deckId, uid) {
    try { const db = await dbFor(uid); await updateDoc(doc(db, 'decks', deckId), { title: 'Updated Title' }); return true } catch { return false }
  }
  async function attemptChangeCreatedAt(deckId, uid) {
    try { const db = await dbFor(uid); await updateDoc(doc(db, 'decks', deckId), { createdAt: new Date() }); return true } catch { return false }
  }
  async function attemptChangeOwnerId(deckId, uid) {
    try { const db = await dbFor(uid); await updateDoc(doc(db, 'decks', deckId), { ownerId: 'different_user' }); return true } catch { return false }
  }
  async function editorAttemptsRoleMutation(deckId) {
    try { const db = await dbFor(EDITOR); await updateDoc(doc(db, 'decks', deckId), { roles: { [OWNER]: 'owner', [EDITOR]: 'owner' } }); return true } catch { return false }
  }
  async function viewerAttemptsCreateCard(deckId) {
    try { const db = await dbFor(VIEWER); await addDoc(collection(doc(db, 'decks', deckId), 'cards'), { title: 'Should Fail', createdAt: new Date(), updatedAt: new Date() }); return true } catch { return false }
  }

  const deckId = await seedDeck(OWNER)
  const cardId = await seedCard(deckId, OWNER)

  async function check(name, expected, fn) {
    let ok = false
    try { ok = await fn() } catch { ok = false }
    if (ok === expected) { pass(name) } else { fail(`${name} (expected ${expected}, got ${ok})`); failures++; }
    results.push({ name, expected, ok })
  }

  await check('owner can read deck', true, () => canRead(deckId, OWNER))
  await check('outsider cannot read deck', false, () => canRead(deckId, OUTSIDER))

  await addRoles(deckId, { [OWNER]: 'owner', [EDITOR]: 'editor' })
  await check('editor can read deck', true, () => canRead(deckId, EDITOR))
  await check('editor can update card', true, () => canUpdateCard(deckId, cardId, EDITOR))
  await check('editor can update title', true, () => canUpdateTitle(deckId, EDITOR))

  await addRoles(deckId, { [OWNER]: 'owner', [VIEWER]: 'viewer' })
  await check('viewer can read deck', true, () => canRead(deckId, VIEWER))
  await check('viewer cannot update card', false, () => canUpdateCard(deckId, cardId, VIEWER))
  await check('viewer cannot update title', false, () => canUpdateTitle(deckId, VIEWER))

  // Immutable + privilege negative cases
  await check('owner cannot change createdAt', false, () => attemptChangeCreatedAt(deckId, OWNER))
  await check('owner cannot change ownerId', false, () => attemptChangeOwnerId(deckId, OWNER))
  await addRoles(deckId, { [OWNER]: 'owner', [EDITOR]: 'editor' })
  await check('editor cannot change createdAt', false, () => attemptChangeCreatedAt(deckId, EDITOR))
  await check('editor cannot change ownerId', false, () => attemptChangeOwnerId(deckId, EDITOR))
  await check('editor cannot escalate role to owner', false, () => editorAttemptsRoleMutation(deckId))
  await addRoles(deckId, { [OWNER]: 'owner', [VIEWER]: 'viewer' })
  await check('viewer cannot create card', false, () => viewerAttemptsCreateCard(deckId))

  log('Summary:')
  results.forEach(r => console.log(` - ${r.name}: ${r.ok ? 'ALLOWED' : 'DENIED'} (expected ${r.expected ? 'ALLOW' : 'DENY'})`))
  if (failures) {
    fail(`${failures} rule assertions failed`)
    await env.cleanup().catch(()=>{})
    process.exit(1)
  } else {
    pass('All rule assertions passed')
    await env.cleanup().catch(()=>{})
    process.exit(0)
  }
}
main().catch(async e => {
  console.error(e)
  try { if (globalThis.env) await globalThis.env.cleanup() } catch {}
  process.exit(1)
})
