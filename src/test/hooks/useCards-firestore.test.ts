import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useCards } from '../../hooks/useCards'

const {
  mockDoc,
  mockGetDoc,
  mockCollection,
  mockQuery,
  mockOrderBy,
  mockOnSnapshot,
  mockUseAuth
} = vi.hoisted(() => {
  const mockDoc = vi.fn()
  const mockGetDoc = vi.fn()
  const mockCollection = vi.fn(() => ({ _type: 'collection' }))
  const mockQuery = vi.fn(() => ({ _type: 'query' }))
  const mockOrderBy = vi.fn(() => ({ _type: 'orderBy' }))
  const mockOnSnapshot = vi.fn()
  const mockUseAuth = vi.fn()

  return {
    mockDoc,
    mockGetDoc,
    mockCollection,
    mockQuery,
    mockOrderBy,
    mockOnSnapshot,
    mockUseAuth
  }
})

vi.mock('firebase/firestore', () => ({
  doc: mockDoc,
  getDoc: mockGetDoc,
  collection: mockCollection,
  query: mockQuery,
  orderBy: mockOrderBy,
  onSnapshot: mockOnSnapshot
}))

vi.mock('../../firebase/firebase', () => ({
  db: {}
}))

vi.mock('../../providers/AuthProvider', () => ({
  useAuth: mockUseAuth
}))

describe('useCards Firestore integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: { uid: 'user-123' },
      loading: false
    })

    mockDoc.mockImplementation((...segments: string[]) => ({ path: segments.join('/') }))
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ ownerId: 'user-123' })
    })
  })

  it('falls back to current deck id when Firestore card is missing deckId', async () => {
    const deckId = 'deck-123'
    let snapshotCallback: ((snapshot: any) => void) | undefined

    mockOnSnapshot.mockImplementation((_query, callback) => {
      snapshotCallback = callback
      return () => {}
    })

    const { result } = renderHook(() => useCards(deckId))

    await waitFor(() => {
      expect(mockOnSnapshot).toHaveBeenCalled()
    })

    const firestoreCard = {
      id: 'card-1',
      data: () => ({
        title: 'Untethered card',
        body: 'Body',
        orderIndex: 0,
        createdAt: { toDate: () => new Date('2025-01-01T00:00:00Z') },
        updatedAt: { toDate: () => new Date('2025-01-01T00:00:00Z') }
        // deckId intentionally missing
      })
    }

    snapshotCallback?.({ docs: [firestoreCard], empty: false })

    await waitFor(() => {
      expect(result.current.cards).toHaveLength(1)
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.cards[0]).toEqual(
      expect.objectContaining({
        id: 'card-1',
        deckId,
        title: 'Untethered card'
      })
    )
  })
})
