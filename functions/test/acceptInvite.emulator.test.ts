import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import * as admin from 'firebase-admin'
import { acceptInviteCore } from '../src/acceptInviteCore'

const PROJECT_ID = 'notecards-1b054'
const db = () => admin.firestore()

async function seedDeck(deckId: string, ownerId: string, roles: Record<string,string> = { [ownerId]: 'owner' }, collaboratorIds: string[] = []) {
  await db().collection('decks').doc(deckId).set({
    title: 'Deck',
    ownerId,
    roles,
    collaboratorIds,
    createdAt: admin.firestore.Timestamp.fromDate(new Date()),
    updatedAt: admin.firestore.Timestamp.fromDate(new Date())
  })
}

async function seedInvite(inviteId: string, data: Partial<{
  deckId: string
  inviterId: string
  emailLower: string
  roleRequested: string
  status: string
  tokenHash: string
  expiresAt: Date
}> & { deckId: string; inviterId: string; emailLower: string; roleRequested: string; status?: string; tokenHash: string; expiresAt?: Date }) {
  const { deckId, inviterId, emailLower, roleRequested, tokenHash } = data
  await db().collection('deckInvites').doc(inviteId).set({
    deckId,
    inviterId,
    emailLower,
    roleRequested,
    status: data.status || 'pending',
    tokenHash,
    expiresAt: admin.firestore.Timestamp.fromDate(data.expiresAt || new Date(Date.now() + 1000*60*60)),
    createdAt: admin.firestore.Timestamp.fromDate(new Date()),
    updatedAt: admin.firestore.Timestamp.fromDate(new Date())
  })
}

beforeAll(() => {
  process.env.GCLOUD_PROJECT = PROJECT_ID
  process.env.GOOGLE_CLOUD_PROJECT = PROJECT_ID
  // Ensure the Admin SDK talks to the local emulator, not production
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
  }
  try { admin.app() } catch { admin.initializeApp({ projectId: PROJECT_ID }) }
  // Additionally force settings for some environments where env var is ignored
  const host = (process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080')
  try {
    admin.firestore().settings({ host, ssl: false })
  } catch {}
})

afterAll(async () => {
  const apps = (admin.apps || []).filter(Boolean)
  await Promise.all(apps.map(a => a!.delete()))
})

describe('acceptInviteCore (emulator)', () => {
  it('sanity: connects to firestore emulator (write/read)', async () => {
    // Log emulator host for diagnostics
    // eslint-disable-next-line no-console
    console.log('FIRESTORE_EMULATOR_HOST =', process.env.FIRESTORE_EMULATOR_HOST)
  const ref = db().collection('sanity_tests').doc('ping')
    await ref.set({ ok: true, ts: admin.firestore.Timestamp.now() })
    const got = await ref.get()
    expect(got.exists).toBe(true)
    expect(got.data()?.ok).toBe(true)
  }, 20000)
  it('accepts a pending invite and grants role', async () => {
    const deckId = 'deck_a'
    const owner = 'owner_a'
    const invitee = 'user_new'
    await seedDeck(deckId, owner)
    await seedInvite('inv1', { deckId, inviterId: owner, emailLower: 'user_new@example.com', roleRequested: 'viewer', tokenHash: 'hash_viewer_1' })

    await expect(acceptInviteCore({ deckId, tokenHash: 'hash_viewer_1', uid: invitee }))
      .resolves.toMatchObject({ ok: true, roleGranted: 'viewer', alreadyMember: false })
  }, 20000)

  it('errors for unknown tokenHash', async () => {
    await seedDeck('deck_unknown', 'owner_x')
    await expect(acceptInviteCore({ deckId: 'deck_unknown', tokenHash: 'nope_hash', uid: 'u1' }))
      .rejects.toHaveProperty('code', 'invite/not-found')
  }, 20000)

  it('errors for expired invite', async () => {
    const deckId = 'deck_expired'
    const owner = 'owner_e'
    await seedDeck(deckId, owner)
    await seedInvite('inv_exp', { deckId, inviterId: owner, emailLower: 'x@example.com', roleRequested: 'viewer', tokenHash: 'hash_exp', expiresAt: new Date(Date.now() - 1000) })
    await expect(acceptInviteCore({ deckId, tokenHash: 'hash_exp', uid: 'uZ' }))
      .rejects.toHaveProperty('code', 'invite/expired')
  }, 20000)

  it('errors for revoked invite', async () => {
    const deckId = 'deck_rev'
    const owner = 'owner_r'
    await seedDeck(deckId, owner)
    await seedInvite('inv_rev', { deckId, inviterId: owner, emailLower: 'y@example.com', roleRequested: 'viewer', tokenHash: 'hash_rev', status: 'revoked' })
    await expect(acceptInviteCore({ deckId, tokenHash: 'hash_rev', uid: 'uY' }))
      .rejects.toHaveProperty('code', 'invite/revoked')
  }, 20000)

  it('returns alreadyMember true when user already has equal or higher role', async () => {
    const deckId = 'deck_existing'
    const owner = 'owner_ex'
    const user = 'uEditor'
    await seedDeck(deckId, owner, { [owner]: 'owner', [user]: 'editor' }, [user])
    await seedInvite('inv_exist', { deckId, inviterId: owner, emailLower: 'uEditor@example.com', roleRequested: 'viewer', tokenHash: 'hash_exist' })
    await expect(acceptInviteCore({ deckId, tokenHash: 'hash_exist', uid: user }))
      .resolves.toMatchObject({ ok: true, alreadyMember: true })
  }, 20000)

  it('is idempotent accepting the same invite twice', async () => {
    const deckId = 'deck_idem'
    const owner = 'owner_idem'
    const user = 'uIdem'
    await seedDeck(deckId, owner)
    await seedInvite('inv_idem', { deckId, inviterId: owner, emailLower: 'idem@example.com', roleRequested: 'viewer', tokenHash: 'hash_idem' })
    await acceptInviteCore({ deckId, tokenHash: 'hash_idem', uid: user })
    await expect(acceptInviteCore({ deckId, tokenHash: 'hash_idem', uid: user }))
      .resolves.toMatchObject({ ok: true, alreadyMember: true })
  }, 20000)
})
