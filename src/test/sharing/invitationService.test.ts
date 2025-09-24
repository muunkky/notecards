import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createInvite,
  listPendingInvites,
  revokeInvite,
  type Invite,
  EmailAlreadyInvitedError,
  InviteLimitExceededError
} from '../../sharing/invitationService'

// Mock Firestore in standard unit tests: see src/test/setup.ts

describe('invitationService', () => {
  const deckId = 'deck-1'
  const inviterId = 'owner-1'
  const email = 'NewUser@example.com'
  const emailLower = 'newuser@example.com'

  beforeEach(() => {
    vi.resetModules()
  })

  it('normalizes email to lowercase and creates a pending invite', async () => {
    // Arrange: mock firestore calls
    const fakeDocRef = { id: 'invite-1' }
    const addDoc = vi.mocked((await import('firebase/firestore')).addDoc)
    const collection = vi.mocked((await import('firebase/firestore')).collection)
    const serverTimestamp = vi.mocked((await import('firebase/firestore')).serverTimestamp)

    collection.mockReturnValue({} as any)
    serverTimestamp.mockReturnValue(new Date())
    addDoc.mockResolvedValue(fakeDocRef as any)

    // Act
    const created = await createInvite(deckId, inviterId, email, 'viewer')

    // Assert
    expect(created.emailLower).toBe(emailLower)
    expect(created.status).toBe('pending')
    expect(created.roleRequested).toBe('viewer')
  })

  it('lists only pending invites for a deck', async () => {
    const getDocs = vi.mocked((await import('firebase/firestore')).getDocs)
    const query = vi.mocked((await import('firebase/firestore')).query)
    const where = vi.mocked((await import('firebase/firestore')).where)
    const collection = vi.mocked((await import('firebase/firestore')).collection)

    collection.mockReturnValue({} as any)
    where.mockImplementation(((field: any, op: any, value: any) => ({ field, op, value })) as any)
    query.mockReturnValue({} as any)
    getDocs.mockResolvedValue({
      empty: false,
      docs: [
        {
          id: 'i1',
          data: () => ({ deckId, inviterId, emailLower, roleRequested: 'editor', status: 'pending', createdAt: new Date(), updatedAt: new Date() })
        }
      ]
    } as any)

    const invites = await listPendingInvites(deckId)
    expect(invites).toHaveLength(1)
    expect(invites[0].id).toBe('i1')
    expect(invites[0].status).toBe('pending')
  })

  it('revokeInvite updates status to revoked', async () => {
    const updateDoc = vi.mocked((await import('firebase/firestore')).updateDoc)
    const doc = vi.mocked((await import('firebase/firestore')).doc)
    const serverTimestamp = vi.mocked((await import('firebase/firestore')).serverTimestamp)
    doc.mockReturnValue({} as any)
    serverTimestamp.mockReturnValue(new Date())
    updateDoc.mockResolvedValue()

    await revokeInvite('invite-xyz', inviterId)
    expect(updateDoc).toHaveBeenCalled()
  })

  it('prevents creating a duplicate pending invite for same email+deck', async () => {
    const getDocs = vi.mocked((await import('firebase/firestore')).getDocs)
    const query = vi.mocked((await import('firebase/firestore')).query)
    const where = vi.mocked((await import('firebase/firestore')).where)
    const collection = vi.mocked((await import('firebase/firestore')).collection)

    collection.mockReturnValue({} as any)
    where.mockImplementation(((field: any, op: any, value: any) => ({ field, op, value })) as any)
    query.mockReturnValue({} as any)
    getDocs.mockResolvedValue({
      empty: false,
      docs: [
        { id: 'i-dupe', data: () => ({ deckId, emailLower, status: 'pending' }) }
      ]
    } as any)

    await expect(createInvite(deckId, inviterId, email, 'editor')).rejects.toBeInstanceOf(EmailAlreadyInvitedError)
  })

  it('enforces a soft limit on combined collaborators + invites', async () => {
    // Simulate listPendingInvites returning many records and deck roles having many members
    const getDocs = vi.mocked((await import('firebase/firestore')).getDocs)
    const query = vi.mocked((await import('firebase/firestore')).query)
    const where = vi.mocked((await import('firebase/firestore')).where)
    const collection = vi.mocked((await import('firebase/firestore')).collection)
    const getDoc = vi.mocked((await import('firebase/firestore')).getDoc)
    const doc = vi.mocked((await import('firebase/firestore')).doc)

    collection.mockReturnValue({} as any)
    where.mockImplementation(((field: any, op: any, value: any) => ({ field, op, value })) as any)
    query.mockReturnValue({} as any)
    // 20 existing invites
    getDocs.mockResolvedValue({ empty: false, docs: new Array(20).fill(0).map((_, i) => ({ id: 'i'+i, data: () => ({}) })) } as any)
    doc.mockReturnValue({} as any)
    // 10 collaborators on deck
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ collaboratorIds: new Array(10).fill(0).map((_, i) => 'u'+i) }) } as any)

    await expect(createInvite(deckId, inviterId, 'someone@example.com', 'viewer')).rejects.toBeInstanceOf(InviteLimitExceededError)
  })
})
