import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as functions from 'firebase/functions'
import { acceptInvite, sha256HexAsync } from '../../sharing/acceptInviteService'

describe('acceptInviteService (client)', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('hashes token and calls callable function with tokenHash', async () => {
    // Mock hashing
    const hashSpy = vi.spyOn(await import('../../sharing/acceptInviteService'), 'sha256HexAsync').mockResolvedValue('deadbeefhash')
    // Mock callable
    const getFunctions = vi.spyOn(functions, 'getFunctions').mockReturnValue({} as any)
    const callableMock = vi.fn().mockResolvedValue({ data: { deckId: 'd1', roleGranted: 'viewer', alreadyHadRole: false } })
    const httpsCallableSpy = vi.spyOn(functions, 'httpsCallable').mockReturnValue(callableMock as any)

    const res = await acceptInvite({ deckId: 'd1', tokenPlain: 'plain-token' })
    expect(hashSpy).toHaveBeenCalledWith('plain-token')
    expect(httpsCallableSpy).toHaveBeenCalled()
    expect(callableMock).toHaveBeenCalledWith({ deckId: 'd1', tokenHash: 'deadbeefhash' })
    expect(res.roleGranted).toBe('viewer')
  })

  it('bubbles errors from callable', async () => {
    vi.spyOn(await import('../../sharing/acceptInviteService'), 'sha256HexAsync').mockResolvedValue('h')
    vi.spyOn(functions, 'getFunctions').mockReturnValue({} as any)
    const err = new Error('invite/not-found')
    vi.spyOn(functions, 'httpsCallable').mockReturnValue(vi.fn().mockRejectedValue(err) as any)
    await expect(acceptInvite({ deckId: 'd1', tokenPlain: 'x' })).rejects.toThrow(/invite\/not-found/)
  })
})
