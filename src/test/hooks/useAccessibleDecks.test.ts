import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAccessibleDecks } from '../../hooks/useAccessibleDecks'
import type { User } from 'firebase/auth'
import type { Deck } from '../../types'

// Hoisted mocks - must be declared before vi.mock() calls
const {
  mockOnSnapshot,
  mockCollection,
  mockQuery,
  mockWhere,
  mockOrderBy,
  mockUseAuth,
  mockGetFirestore
} = vi.hoisted(() => {
  const mockUseAuth = vi.fn()
  const mockGetFirestore = vi.fn()

  return {
    mockOnSnapshot: vi.fn(),
    mockCollection: vi.fn(() => ({ _type: 'collection' })),
    mockQuery: vi.fn((...args: any[]) => ({ _type: 'query', _args: args })),
    mockWhere: vi.fn((field: string, op: string, value: any) => ({
      _type: 'where',
      field,
      op,
      value
    })),
    mockOrderBy: vi.fn((field: string, direction: string) => ({
      _type: 'orderBy',
      field,
      direction
    })),
    mockUseAuth,
    mockGetFirestore
  }
})

// Mock firebase/firestore
vi.mock('firebase/firestore', () => ({
  collection: mockCollection,
  query: mockQuery,
  where: mockWhere,
  orderBy: mockOrderBy,
  onSnapshot: mockOnSnapshot,
  getFirestore: mockGetFirestore
}))

// Mock AuthProvider
vi.mock('../../providers/AuthProvider', () => ({
  useAuth: mockUseAuth
}))

describe('useAccessibleDecks Hook - TDD', () => {
  let mockUser: User

  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = { uid: 'test-user-123' } as User
    mockGetFirestore.mockReturnValue({})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should return loading state initially when user is authenticated', () => {
      mockUseAuth.mockReturnValue({ user: mockUser })
      mockOnSnapshot.mockImplementation(() => () => {})

      const { result } = renderHook(() => useAccessibleDecks())

      expect(result.current.loading).toBe(true)
      expect(result.current.decks).toEqual([])
      expect(result.current.error).toBeNull()
    })

    it('should return empty state when user is null', () => {
      mockUseAuth.mockReturnValue({ user: null })

      const { result } = renderHook(() => useAccessibleDecks())

      expect(result.current.loading).toBe(false)
      expect(result.current.decks).toEqual([])
      expect(result.current.error).toBeNull()
    })

    it('should not set up listeners when user is null', () => {
      mockUseAuth.mockReturnValue({ user: null })

      renderHook(() => useAccessibleDecks())

      expect(mockOnSnapshot).not.toHaveBeenCalled()
    })
  })

  describe('Authentication State Transitions', () => {
    it('should set up listeners when user transitions from null to authenticated', async () => {
      const { rerender } = renderHook(() => useAccessibleDecks())

      // Start with null user
      mockUseAuth.mockReturnValue({ user: null })
      rerender()

      expect(mockOnSnapshot).not.toHaveBeenCalled()

      // Transition to authenticated user
      mockUseAuth.mockReturnValue({ user: mockUser })
      mockOnSnapshot.mockImplementation(() => () => {})
      rerender()

      await waitFor(() => {
        expect(mockOnSnapshot).toHaveBeenCalled()
      })
    })

    it('should clean up listeners when user transitions from authenticated to null', async () => {
      const unsubOwned = vi.fn()
      const unsubCollab = vi.fn()
      let callCount = 0

      mockOnSnapshot.mockImplementation(() => {
        callCount++
        return callCount === 1 ? unsubOwned : unsubCollab
      })

      mockUseAuth.mockReturnValue({ user: mockUser })
      const { result, rerender } = renderHook(() => useAccessibleDecks())

      await waitFor(() => {
        expect(mockOnSnapshot).toHaveBeenCalled()
      })

      // Transition to null user
      mockUseAuth.mockReturnValue({ user: null })
      rerender()

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.decks).toEqual([])
        expect(result.current.error).toBeNull()
      })

      expect(unsubOwned).toHaveBeenCalled()
      expect(unsubCollab).toHaveBeenCalled()
    })

    it('should reset state when user changes', async () => {
      const unsubOwned = vi.fn()
      const unsubCollab = vi.fn()
      let callCount = 0

      mockOnSnapshot.mockImplementation(() => {
        callCount++
        return callCount <= 2 ? (callCount === 1 ? unsubOwned : unsubCollab) : () => {}
      })

      mockUseAuth.mockReturnValue({ user: mockUser })
      const { rerender } = renderHook(() => useAccessibleDecks())

      await waitFor(() => {
        expect(mockOnSnapshot).toHaveBeenCalled()
      })

      // Change to different user
      const newUser = { uid: 'different-user-456' } as User
      mockUseAuth.mockReturnValue({ user: newUser })
      rerender()

      await waitFor(() => {
        expect(unsubOwned).toHaveBeenCalled()
        expect(unsubCollab).toHaveBeenCalled()
      })
    })
  })

  describe('Firestore Query Setup', () => {
    it('should set up owned decks query with correct parameters', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser })
      mockOnSnapshot.mockImplementation(() => () => {})

      renderHook(() => useAccessibleDecks())

      await waitFor(() => {
        expect(mockWhere).toHaveBeenCalledWith('ownerId', '==', 'test-user-123')
        expect(mockOrderBy).toHaveBeenCalledWith('updatedAt', 'desc')
      })
    })

    it('should set up collaboration decks query with correct parameters', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser })
      mockOnSnapshot.mockImplementation(() => () => {})

      renderHook(() => useAccessibleDecks())

      await waitFor(() => {
        expect(mockWhere).toHaveBeenCalledWith(
          'roles.test-user-123',
          'in',
          ['editor', 'viewer']
        )
      })
    })

    it('should set up two separate onSnapshot listeners', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser })
      mockOnSnapshot.mockImplementation(() => () => {})

      renderHook(() => useAccessibleDecks())

      await waitFor(() => {
        expect(mockOnSnapshot).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Owned Decks Loading', () => {
    it('should load a single owned deck', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser })

      const mockDeck: Deck = {
        id: 'deck-1',
        title: 'My Deck',
        ownerId: 'test-user-123',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        roles: {}
      }

      mockOnSnapshot.mockImplementation((query: any, callback: any) => {
        // First call is owned decks listener
        if (mockOnSnapshot.mock.calls.length === 1) {
          setTimeout(() => {
            callback({
              docs: [
                {
                  id: 'deck-1',
                  data: () => ({
                    title: 'My Deck',
                    ownerId: 'test-user-123',
                    createdAt: { toDate: () => new Date('2024-01-01') },
                    updatedAt: { toDate: () => new Date('2024-01-02') },
                    roles: {}
                  })
                }
              ]
            })
          }, 0)
        }
        return () => {}
      })

      const { result } = renderHook(() => useAccessibleDecks())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.decks).toHaveLength(1)
        expect(result.current.decks[0].id).toBe('deck-1')
        expect(result.current.decks[0].title).toBe('My Deck')
        expect(result.current.decks[0].effectiveRole).toBe('owner')
      })
    })

    it('should load multiple owned decks sorted by updatedAt desc', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser })

      mockOnSnapshot.mockImplementation((query: any, callback: any) => {
        if (mockOnSnapshot.mock.calls.length === 1) {
          setTimeout(() => {
            callback({
              docs: [
                {
                  id: 'deck-1',
                  data: () => ({
                    title: 'Older Deck',
                    ownerId: 'test-user-123',
                    createdAt: { toDate: () => new Date('2024-01-01') },
                    updatedAt: { toDate: () => new Date('2024-01-01') },
                    roles: {}
                  })
                },
                {
                  id: 'deck-2',
                  data: () => ({
                    title: 'Newer Deck',
                    ownerId: 'test-user-123',
                    createdAt: { toDate: () => new Date('2024-01-02') },
                    updatedAt: { toDate: () => new Date('2024-01-03') },
                    roles: {}
                  })
                }
              ]
            })
          }, 0)
        }
        return () => {}
      })

      const { result } = renderHook(() => useAccessibleDecks())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.decks).toHaveLength(2)
        expect(result.current.decks[0].title).toBe('Newer Deck')
        expect(result.current.decks[1].title).toBe('Older Deck')
      })
    })

    it('should handle empty owned decks result', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser })

      mockOnSnapshot.mockImplementation((query: any, callback: any) => {
        if (mockOnSnapshot.mock.calls.length === 1) {
          setTimeout(() => {
            callback({ docs: [] })
          }, 0)
        }
        return () => {}
      })

      const { result } = renderHook(() => useAccessibleDecks())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.decks).toEqual([])
      })
    })
  })

  describe('Collaboration Decks Loading', () => {
    it('should load a single collaboration deck as editor', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser })

      mockOnSnapshot.mockImplementation((query: any, callback: any) => {
        // Second call is collaboration listener
        if (mockOnSnapshot.mock.calls.length === 2) {
          setTimeout(() => {
            callback({
              docs: [
                {
                  id: 'deck-collab-1',
                  data: () => ({
                    title: 'Shared Deck',
                    ownerId: 'other-user-456',
                    createdAt: { toDate: () => new Date('2024-01-01') },
                    updatedAt: { toDate: () => new Date('2024-01-02') },
                    roles: {
                      'test-user-123': 'editor'
                    }
                  })
                }
              ]
            })
          }, 0)
        }
        return () => {}
      })

      const { result } = renderHook(() => useAccessibleDecks())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.decks).toHaveLength(1)
        expect(result.current.decks[0].id).toBe('deck-collab-1')
        expect(result.current.decks[0].effectiveRole).toBe('editor')
      })
    })

    it('should load a single collaboration deck as viewer', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser })

      mockOnSnapshot.mockImplementation((query: any, callback: any) => {
        if (mockOnSnapshot.mock.calls.length === 2) {
          setTimeout(() => {
            callback({
              docs: [
                {
                  id: 'deck-collab-1',
                  data: () => ({
                    title: 'View-Only Deck',
                    ownerId: 'other-user-456',
                    createdAt: { toDate: () => new Date('2024-01-01') },
                    updatedAt: { toDate: () => new Date('2024-01-02') },
                    roles: {
                      'test-user-123': 'viewer'
                    }
                  })
                }
              ]
            })
          }, 0)
        }
        return () => {}
      })

      const { result } = renderHook(() => useAccessibleDecks())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.decks[0].effectiveRole).toBe('viewer')
      })
    })

    it('should load multiple collaboration decks with different roles', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser })

      mockOnSnapshot.mockImplementation((query: any, callback: any) => {
        if (mockOnSnapshot.mock.calls.length === 2) {
          setTimeout(() => {
            callback({
              docs: [
                {
                  id: 'deck-editor',
                  data: () => ({
                    title: 'Editor Deck',
                    ownerId: 'other-user-456',
                    createdAt: { toDate: () => new Date('2024-01-01') },
                    updatedAt: { toDate: () => new Date('2024-01-02') },
                    roles: { 'test-user-123': 'editor' }
                  })
                },
                {
                  id: 'deck-viewer',
                  data: () => ({
                    title: 'Viewer Deck',
                    ownerId: 'other-user-789',
                    createdAt: { toDate: () => new Date('2024-01-01') },
                    updatedAt: { toDate: () => new Date('2024-01-03') },
                    roles: { 'test-user-123': 'viewer' }
                  })
                }
              ]
            })
          }, 0)
        }
        return () => {}
      })

      const { result } = renderHook(() => useAccessibleDecks())

      await waitFor(() => {
        expect(result.current.decks).toHaveLength(2)
        const editorDeck = result.current.decks.find(d => d.id === 'deck-editor')
        const viewerDeck = result.current.decks.find(d => d.id === 'deck-viewer')
        expect(editorDeck?.effectiveRole).toBe('editor')
        expect(viewerDeck?.effectiveRole).toBe('viewer')
      })
    })

    it('should handle empty collaboration decks result', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser })

      mockOnSnapshot.mockImplementation((query: any, callback: any) => {
        setTimeout(() => {
          callback({ docs: [] })
        }, 0)
        return () => {}
      })

      const { result } = renderHook(() => useAccessibleDecks())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.decks).toEqual([])
      })
    })
  })

  describe('Merge Logic and Precedence', () => {
    it('should merge owned and collaboration decks', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser })

      mockOnSnapshot.mockImplementation((query: any, callback: any) => {
        const callNum = mockOnSnapshot.mock.calls.length
        setTimeout(() => {
          if (callNum === 1) {
            // Owned deck
            callback({
              docs: [
                {
                  id: 'deck-owned',
                  data: () => ({
                    title: 'My Deck',
                    ownerId: 'test-user-123',
                    createdAt: { toDate: () => new Date('2024-01-01') },
                    updatedAt: { toDate: () => new Date('2024-01-02') },
                    roles: {}
                  })
                }
              ]
            })
          } else if (callNum === 2) {
            // Collab deck
            callback({
              docs: [
                {
                  id: 'deck-collab',
                  data: () => ({
                    title: 'Shared Deck',
                    ownerId: 'other-user-456',
                    createdAt: { toDate: () => new Date('2024-01-01') },
                    updatedAt: { toDate: () => new Date('2024-01-03') },
                    roles: { 'test-user-123': 'editor' }
                  })
                }
              ]
            })
          }
        }, 0)
        return () => {}
      })

      const { result } = renderHook(() => useAccessibleDecks())

      await waitFor(() => {
        expect(result.current.decks).toHaveLength(2)
        const ownedDeck = result.current.decks.find(d => d.id === 'deck-owned')
        const collabDeck = result.current.decks.find(d => d.id === 'deck-collab')
        expect(ownedDeck?.effectiveRole).toBe('owner')
        expect(collabDeck?.effectiveRole).toBe('editor')
      })
    })

    it('should give owned decks precedence when same deck appears in both queries', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser })

      mockOnSnapshot.mockImplementation((query: any, callback: any) => {
        const callNum = mockOnSnapshot.mock.calls.length
        setTimeout(() => {
          if (callNum === 1) {
            // Owned deck
            callback({
              docs: [
                {
                  id: 'deck-same',
                  data: () => ({
                    title: 'Same Deck',
                    ownerId: 'test-user-123',
                    createdAt: { toDate: () => new Date('2024-01-01') },
                    updatedAt: { toDate: () => new Date('2024-01-02') },
                    roles: { 'other-user-456': 'editor' }
                  })
                }
              ]
            })
          } else if (callNum === 2) {
            // Same deck in collab (shouldn't happen in practice, but handle it)
            callback({
              docs: [
                {
                  id: 'deck-same',
                  data: () => ({
                    title: 'Same Deck',
                    ownerId: 'test-user-123',
                    createdAt: { toDate: () => new Date('2024-01-01') },
                    updatedAt: { toDate: () => new Date('2024-01-02') },
                    roles: { 'test-user-123': 'editor' }
                  })
                }
              ]
            })
          }
        }, 0)
        return () => {}
      })

      const { result } = renderHook(() => useAccessibleDecks())

      await waitFor(() => {
        expect(result.current.decks).toHaveLength(1)
        expect(result.current.decks[0].effectiveRole).toBe('owner')
      })
    })

    it('should maintain correct sort order after merging', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser })

      mockOnSnapshot.mockImplementation((query: any, callback: any) => {
        const callNum = mockOnSnapshot.mock.calls.length
        setTimeout(() => {
          if (callNum === 1) {
            callback({
              docs: [
                {
                  id: 'deck-owned-old',
                  data: () => ({
                    title: 'Old Owned',
                    ownerId: 'test-user-123',
                    createdAt: { toDate: () => new Date('2024-01-01') },
                    updatedAt: { toDate: () => new Date('2024-01-01') },
                    roles: {}
                  })
                }
              ]
            })
          } else if (callNum === 2) {
            callback({
              docs: [
                {
                  id: 'deck-collab-new',
                  data: () => ({
                    title: 'New Collab',
                    ownerId: 'other-user-456',
                    createdAt: { toDate: () => new Date('2024-01-02') },
                    updatedAt: { toDate: () => new Date('2024-01-05') },
                    roles: { 'test-user-123': 'editor' }
                  })
                }
              ]
            })
          }
        }, 0)
        return () => {}
      })

      const { result } = renderHook(() => useAccessibleDecks())

      await waitFor(() => {
        expect(result.current.decks).toHaveLength(2)
        expect(result.current.decks[0].id).toBe('deck-collab-new')
        expect(result.current.decks[1].id).toBe('deck-owned-old')
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle owned query error and set error state', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser })

      mockOnSnapshot.mockImplementation((query: any, callback: any, errorCallback: any) => {
        const callNum = mockOnSnapshot.mock.calls.length
        if (callNum === 1 && errorCallback) {
          setTimeout(() => {
            errorCallback(new Error('Firestore owned query failed'))
          }, 0)
        }
        return () => {}
      })

      const { result } = renderHook(() => useAccessibleDecks())

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
        expect(result.current.error).toContain('owned')
      })
    })

    it('should gracefully degrade when collaboration query fails (index not ready)', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser })

      mockOnSnapshot.mockImplementation((query: any, callback: any, errorCallback: any) => {
        const callNum = mockOnSnapshot.mock.calls.length
        setTimeout(() => {
          if (callNum === 1) {
            // Owned query succeeds
            callback({
              docs: [
                {
                  id: 'deck-owned',
                  data: () => ({
                    title: 'My Deck',
                    ownerId: 'test-user-123',
                    createdAt: { toDate: () => new Date('2024-01-01') },
                    updatedAt: { toDate: () => new Date('2024-01-02') },
                    roles: {}
                  })
                }
              ]
            })
          } else if (callNum === 2 && errorCallback) {
            // Collab query fails (index not ready)
            errorCallback(new Error('Index not ready'))
          }
        }, 0)
        return () => {}
      })

      const { result } = renderHook(() => useAccessibleDecks())

      await waitFor(() => {
        // Should still show owned decks despite collab failure
        expect(result.current.decks).toHaveLength(1)
        expect(result.current.decks[0].id).toBe('deck-owned')
        // Error should not block the entire hook
        expect(result.current.loading).toBe(false)
      })
    })

    it('should handle errors in both queries', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser })

      mockOnSnapshot.mockImplementation((query: any, callback: any, errorCallback: any) => {
        if (errorCallback) {
          setTimeout(() => {
            errorCallback(new Error('Firestore error'))
          }, 0)
        }
        return () => {}
      })

      const { result } = renderHook(() => useAccessibleDecks())

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
      })
    })
  })

  describe('Subscription Cleanup', () => {
    it('should unsubscribe from both listeners on unmount', () => {
      const unsubOwned = vi.fn()
      const unsubCollab = vi.fn()
      let callCount = 0

      mockUseAuth.mockReturnValue({ user: mockUser })
      mockOnSnapshot.mockImplementation(() => {
        callCount++
        return callCount === 1 ? unsubOwned : unsubCollab
      })

      const { unmount } = renderHook(() => useAccessibleDecks())

      unmount()

      expect(unsubOwned).toHaveBeenCalled()
      expect(unsubCollab).toHaveBeenCalled()
    })

    it('should not leave dangling listeners after multiple rerenders', () => {
      const unsubscribers: Array<() => void> = []

      mockUseAuth.mockReturnValue({ user: mockUser })
      mockOnSnapshot.mockImplementation(() => {
        const unsub = vi.fn()
        unsubscribers.push(unsub)
        return unsub
      })

      const { rerender, unmount } = renderHook(() => useAccessibleDecks())

      rerender()
      rerender()
      rerender()

      unmount()

      // Should have cleaned up all listeners
      unsubscribers.forEach(unsub => {
        expect(unsub).toHaveBeenCalled()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle malformed deck data gracefully', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser })

      mockOnSnapshot.mockImplementation((query: any, callback: any) => {
        const callNum = mockOnSnapshot.mock.calls.length
        if (callNum === 1) {
          setTimeout(() => {
            callback({
              docs: [
                {
                  id: 'deck-malformed',
                  data: () => ({
                    // Missing required fields
                    title: 'Malformed Deck'
                    // No ownerId, createdAt, updatedAt
                  })
                }
              ]
            })
          }, 0)
        }
        return () => {}
      })

      const { result } = renderHook(() => useAccessibleDecks())

      await waitFor(() => {
        // Should not crash, may show empty or handle gracefully
        expect(result.current.loading).toBe(false)
      })
    })

    it('should handle rapid authentication changes', async () => {
      const unsubscribers: Array<() => void> = []

      mockOnSnapshot.mockImplementation(() => {
        const unsub = vi.fn()
        unsubscribers.push(unsub)
        return unsub
      })

      mockUseAuth.mockReturnValue({ user: mockUser })
      const { rerender } = renderHook(() => useAccessibleDecks())

      // Rapid auth changes
      mockUseAuth.mockReturnValue({ user: null })
      rerender()

      mockUseAuth.mockReturnValue({ user: { uid: 'user-2' } as User })
      rerender()

      mockUseAuth.mockReturnValue({ user: null })
      rerender()

      mockUseAuth.mockReturnValue({ user: mockUser })
      rerender()

      await waitFor(() => {
        // Should have cleaned up previous listeners
        expect(unsubscribers.length).toBeGreaterThan(0)
      })
    })

    it('should handle empty roles object in collaboration deck', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser })

      mockOnSnapshot.mockImplementation((query: any, callback: any) => {
        const callNum = mockOnSnapshot.mock.calls.length
        if (callNum === 2) {
          setTimeout(() => {
            callback({
              docs: [
                {
                  id: 'deck-no-role',
                  data: () => ({
                    title: 'No Role Deck',
                    ownerId: 'other-user-456',
                    createdAt: { toDate: () => new Date('2024-01-01') },
                    updatedAt: { toDate: () => new Date('2024-01-02') },
                    roles: {} // Empty roles object
                  })
                }
              ]
            })
          }, 0)
        }
        return () => {}
      })

      const { result } = renderHook(() => useAccessibleDecks())

      await waitFor(() => {
        // Should handle gracefully, possibly filter out or default role
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('Real-time Updates', () => {
    it('should update when owned deck is added', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser })

      let ownedCallback: any

      mockOnSnapshot.mockImplementation((query: any, callback: any) => {
        const callNum = mockOnSnapshot.mock.calls.length
        if (callNum === 1) {
          ownedCallback = callback
          setTimeout(() => {
            callback({ docs: [] })
          }, 0)
        }
        return () => {}
      })

      const { result } = renderHook(() => useAccessibleDecks())

      await waitFor(() => {
        expect(result.current.decks).toEqual([])
      })

      // Simulate new deck added
      ownedCallback({
        docs: [
          {
            id: 'deck-new',
            data: () => ({
              title: 'New Deck',
              ownerId: 'test-user-123',
              createdAt: { toDate: () => new Date('2024-01-01') },
              updatedAt: { toDate: () => new Date('2024-01-02') },
              roles: {}
            })
          }
        ]
      })

      await waitFor(() => {
        expect(result.current.decks).toHaveLength(1)
        expect(result.current.decks[0].id).toBe('deck-new')
      })
    })

    it('should update when collaboration deck is added', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser })

      let collabCallback: any

      mockOnSnapshot.mockImplementation((query: any, callback: any) => {
        const callNum = mockOnSnapshot.mock.calls.length
        if (callNum === 2) {
          collabCallback = callback
          setTimeout(() => {
            callback({ docs: [] })
          }, 0)
        } else {
          setTimeout(() => {
            callback({ docs: [] })
          }, 0)
        }
        return () => {}
      })

      const { result } = renderHook(() => useAccessibleDecks())

      await waitFor(() => {
        expect(result.current.decks).toEqual([])
      })

      // Simulate collaboration added
      collabCallback({
        docs: [
          {
            id: 'deck-collab-new',
            data: () => ({
              title: 'New Shared Deck',
              ownerId: 'other-user-456',
              createdAt: { toDate: () => new Date('2024-01-01') },
              updatedAt: { toDate: () => new Date('2024-01-02') },
              roles: { 'test-user-123': 'editor' }
            })
          }
        ]
      })

      await waitFor(() => {
        expect(result.current.decks).toHaveLength(1)
        expect(result.current.decks[0].id).toBe('deck-collab-new')
        expect(result.current.decks[0].effectiveRole).toBe('editor')
      })
    })
  })
})
