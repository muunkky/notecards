import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useDecks } from '../../hooks/useDecks'

// TDD: Test-drive the useDecks hook for real-time Firestore integration
const { 
  mockOnSnapshot, 
  mockCollection, 
  mockQuery, 
  mockWhere, 
  mockOrderBy,
  mockUseAuth
} = vi.hoisted(() => {
  const mockUseAuth = vi.fn()
  
  return {
    mockOnSnapshot: vi.fn(),
    mockCollection: vi.fn(() => ({ _type: 'collection' })),
    mockQuery: vi.fn(() => ({ _type: 'query' })),
    mockWhere: vi.fn(() => ({ _type: 'where' })),
    mockOrderBy: vi.fn(() => ({ _type: 'orderBy' })),
    mockUseAuth
  }
})

vi.mock('firebase/firestore', () => ({
  collection: mockCollection,
  query: mockQuery,
  where: mockWhere,
  orderBy: mockOrderBy,
  onSnapshot: mockOnSnapshot,
}))

vi.mock('../../firebase/firebase', () => ({
  db: {},
}))

// Mock AuthProvider
let mockUser: { uid: string } | null = { uid: 'test-user-123' }
vi.mock('../../providers/AuthProvider', () => ({
  useAuth: mockUseAuth
}))

describe('useDecks Hook - TDD', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset to authenticated user by default
    mockUser = { uid: 'test-user-123' }
    mockUseAuth.mockReturnValue({ user: mockUser })
  })

  describe('Initial State', () => {
    it('should return loading state initially', () => {
      mockOnSnapshot.mockImplementation(() => () => {}) // Mock unsubscribe

      const { result } = renderHook(() => useDecks())

      expect(result.current.loading).toBe(true)
      expect(result.current.decks).toEqual([])
      expect(result.current.error).toBeNull()
    })

    it('should set up Firestore subscription with correct query', () => {
      mockOnSnapshot.mockImplementation(() => () => {})

      renderHook(() => useDecks())

      expect(mockCollection).toHaveBeenCalledWith({}, 'decks')
      expect(mockQuery).toHaveBeenCalled()
      expect(mockWhere).toHaveBeenCalledWith('ownerId', '==', 'test-user-123')
      expect(mockOrderBy).toHaveBeenCalledWith('updatedAt', 'desc')
      expect(mockOnSnapshot).toHaveBeenCalled()
    })
  })

  describe('Data Loading', () => {
    it('should update decks when Firestore data changes', async () => {
      const mockDeckData = [
        {
          id: 'deck-1',
          data: () => ({
            title: 'Test Deck 1',
            ownerId: 'test-user-123',
            createdAt: { toDate: () => new Date('2025-01-01') },
            updatedAt: { toDate: () => new Date('2025-01-02') }
          })
        },
        {
          id: 'deck-2', 
          data: () => ({
            title: 'Test Deck 2',
            ownerId: 'test-user-123',
            createdAt: { toDate: () => new Date('2025-01-03') },
            updatedAt: { toDate: () => new Date('2025-01-04') }
          })
        }
      ]

      let snapshotCallback: (snapshot: any) => void
      mockOnSnapshot.mockImplementation((query, callback) => {
        snapshotCallback = callback
        return () => {} // unsubscribe
      })

      const { result } = renderHook(() => useDecks())

      // Simulate Firestore snapshot
      const mockSnapshot = {
        docs: mockDeckData,
        empty: false
      }
      
      snapshotCallback!(mockSnapshot)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.decks).toHaveLength(2)
        expect(result.current.decks[0]).toEqual(expect.objectContaining({
          id: 'deck-1',
          title: 'Test Deck 1',
          ownerId: 'test-user-123'
        }))
        expect(result.current.error).toBeNull()
      })
    })

    it('should handle empty deck list', async () => {
      let snapshotCallback: (snapshot: any) => void
      mockOnSnapshot.mockImplementation((query, callback) => {
        snapshotCallback = callback
        return () => {}
      })

      const { result } = renderHook(() => useDecks())

      // Simulate empty Firestore snapshot
      const mockSnapshot = {
        docs: [],
        empty: true
      }
      
      snapshotCallback!(mockSnapshot)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.decks).toEqual([])
        expect(result.current.error).toBeNull()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle Firestore errors gracefully', async () => {
      const mockError = new Error('Firestore connection failed')
      
      mockOnSnapshot.mockImplementation((query, callback, errorCallback) => {
        errorCallback(mockError)
        return () => {}
      })

      const { result } = renderHook(() => useDecks())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.decks).toEqual([])
        expect(result.current.error).toBe('Firestore connection failed')
      })
    })

    it('should handle permission errors', async () => {
      const permissionError = { code: 'permission-denied', message: 'Missing permissions' }
      
      mockOnSnapshot.mockImplementation((query, callback, errorCallback) => {
        errorCallback(permissionError)
        return () => {}
      })

      const { result } = renderHook(() => useDecks())

      await waitFor(() => {
        expect(result.current.error).toBe('Missing permissions')
      })
    })
  })

  describe('Cleanup', () => {
    it('should unsubscribe from Firestore when unmounted', () => {
      const mockUnsubscribe = vi.fn()
      mockOnSnapshot.mockReturnValue(mockUnsubscribe)

      const { unmount } = renderHook(() => useDecks())

      unmount()

      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })

  describe('Real-time Updates', () => {
    it('should update when decks are added in real-time', async () => {
      let snapshotCallback: (snapshot: any) => void
      mockOnSnapshot.mockImplementation((query, callback) => {
        snapshotCallback = callback
        return () => {}
      })

      const { result } = renderHook(() => useDecks())

      // Initial empty state
      snapshotCallback!({ docs: [], empty: true })
      
      await waitFor(() => {
        expect(result.current.decks).toHaveLength(0)
      })

      // Add a deck in real-time
      const newDeck = {
        id: 'new-deck',
        data: () => ({
          title: 'New Real-time Deck',
          ownerId: 'test-user-123',
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() }
        })
      }

      snapshotCallback!({ docs: [newDeck], empty: false })

      await waitFor(() => {
        expect(result.current.decks).toHaveLength(1)
        expect(result.current.decks[0].title).toBe('New Real-time Deck')
      })
    })

    it('should update when decks are modified in real-time', async () => {
      let snapshotCallback: (snapshot: any) => void
      mockOnSnapshot.mockImplementation((query, callback) => {
        snapshotCallback = callback
        return () => {}
      })

      const { result } = renderHook(() => useDecks())

      // Initial deck
      const initialDeck = {
        id: 'deck-1',
        data: () => ({
          title: 'Original Title',
          ownerId: 'test-user-123',
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() }
        })
      }

      snapshotCallback!({ docs: [initialDeck], empty: false })
      
      await waitFor(() => {
        expect(result.current.decks[0].title).toBe('Original Title')
      })

      // Update deck title
      const updatedDeck = {
        id: 'deck-1',
        data: () => ({
          title: 'Updated Title',
          ownerId: 'test-user-123',
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() }
        })
      }

      snapshotCallback!({ docs: [updatedDeck], empty: false })

      await waitFor(() => {
        expect(result.current.decks[0].title).toBe('Updated Title')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle malformed Firestore data', async () => {
      let snapshotCallback: (snapshot: any) => void
      mockOnSnapshot.mockImplementation((query, callback) => {
        snapshotCallback = callback
        return () => {}
      })

      const { result } = renderHook(() => useDecks())

      // Malformed data (missing required fields)
      const malformedDeck = {
        id: 'malformed-deck',
        data: () => ({
          // Missing title, ownerId, etc.
          someField: 'value'
        })
      }

      snapshotCallback!({ docs: [malformedDeck], empty: false })

      await waitFor(() => {
        // Should filter out malformed data or handle gracefully
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBeNull()
      })
    })

    it('should handle user without authentication', () => {
      // Mock unauthenticated user for this test
      mockUseAuth.mockReturnValue({ user: null })

      const { result } = renderHook(() => useDecks())

      expect(result.current.loading).toBe(false)
      expect(result.current.decks).toEqual([])
      expect(result.current.error).toBeNull()
      expect(mockOnSnapshot).not.toHaveBeenCalled()
    })
  })
})
