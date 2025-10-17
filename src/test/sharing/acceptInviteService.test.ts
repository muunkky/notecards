import { describe, it, expect, vi, beforeEach } from 'vitest'
import { acceptInvite, sha256HexAsync, InviteError } from '../../sharing/acceptInviteService'
import { getDocs, getDoc, runTransaction, Timestamp } from 'firebase/firestore'

vi.mock('firebase/firestore')
vi.mock('../../firebase/firebase', () => ({ db: {} }))

describe('acceptInviteService (client-side)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('validates required fields', async () => {
    await expect(acceptInvite({ deckId: '', tokenPlain: 'token' }, 'uid1')).rejects.toThrow(InviteError)
    await expect(acceptInvite({ deckId: 'd1', tokenPlain: '' }, 'uid1')).rejects.toThrow(InviteError)
    await expect(acceptInvite({ deckId: 'd1', tokenPlain: 'token' }, '')).rejects.toThrow(InviteError)
  })

  it('throws invite/not-found when invite does not exist', async () => {
    vi.mocked(getDocs).mockResolvedValue({ empty: true, docs: [] } as any)
    
    await expect(acceptInvite({ deckId: 'd1', tokenPlain: 'token' }, 'uid1'))
      .rejects.toThrow('Invite not found')
  })

  it('throws invite/revoked when invite is revoked', async () => {
    const inviteDoc = {
      ref: {},
      data: () => ({ status: 'revoked', roleRequested: 'viewer' })
    }
    vi.mocked(getDocs).mockResolvedValue({ empty: false, docs: [inviteDoc] } as any)
    
    await expect(acceptInvite({ deckId: 'd1', tokenPlain: 'token' }, 'uid1'))
      .rejects.toThrow('Invite has been revoked')
  })

  it('throws invite/expired when invite is expired', async () => {
    const expiredTimestamp = { toDate: () => new Date(Date.now() - 1000) } as Timestamp
    const inviteDoc = {
      ref: {},
      data: () => ({ status: 'pending', roleRequested: 'viewer', expiresAt: expiredTimestamp })
    }
    vi.mocked(getDocs).mockResolvedValue({ empty: false, docs: [inviteDoc] } as any)
    
    await expect(acceptInvite({ deckId: 'd1', tokenPlain: 'token' }, 'uid1'))
      .rejects.toThrow('Invite has expired')
  })

  it('grants role when valid invite exists', async () => {
    const inviteDoc = {
      ref: { id: 'invite1' },
      data: () => ({ status: 'pending', roleRequested: 'editor', deckId: 'd1' })
    }
    vi.mocked(getDocs).mockResolvedValue({ empty: false, docs: [inviteDoc] } as any)
    
    const mockTransaction = vi.fn(async (callback: any) => {
      const inviteSnap = { exists: () => true, data: () => ({ status: 'pending', roleRequested: 'editor' }) }
      const deckSnap = { exists: () => true, data: () => ({ roles: {}, collaboratorIds: [] }) }
      const tx = { get: vi.fn().mockResolvedValue(inviteSnap), update: vi.fn() }
      
      // First call returns invite, second returns deck
      tx.get.mockResolvedValueOnce(inviteSnap).mockResolvedValueOnce(deckSnap)
      
      return await callback(tx)
    })
    vi.mocked(runTransaction).mockImplementation(mockTransaction as any)
    
    const result = await acceptInvite({ deckId: 'd1', tokenPlain: 'token' }, 'uid1')
    
    expect(result.deckId).toBe('d1')
    expect(result.roleGranted).toBe('editor')
    expect(result.alreadyHadRole).toBe(false)
  })

  it('returns alreadyHadRole when user already has equal or higher role', async () => {
    const inviteDoc = {
      ref: { id: 'invite1' },
      data: () => ({ status: 'pending', roleRequested: 'viewer', deckId: 'd1' })
    }
    vi.mocked(getDocs).mockResolvedValue({ empty: false, docs: [inviteDoc] } as any)
    
    const mockTransaction = vi.fn(async (callback: any) => {
      const inviteSnap = { exists: () => true, data: () => ({ status: 'pending', roleRequested: 'viewer' }) }
      const deckSnap = { exists: () => true, data: () => ({ roles: { uid1: 'editor' }, collaboratorIds: ['uid1'] }) }
      const tx = { get: vi.fn(), update: vi.fn() }
      
      tx.get.mockResolvedValueOnce(inviteSnap).mockResolvedValueOnce(deckSnap)
      
      return await callback(tx)
    })
    vi.mocked(runTransaction).mockImplementation(mockTransaction as any)
    
    const result = await acceptInvite({ deckId: 'd1', tokenPlain: 'token' }, 'uid1')
    
    expect(result.deckId).toBe('d1')
    expect(result.alreadyHadRole).toBe(true)
    expect(result.roleGranted).toBeUndefined()
  })
})
