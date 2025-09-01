import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCardOperations } from '../../hooks/useCardOperations'
import { 
  createReorderTestCards, 
  createExpectedMoveUpOrder, 
  createExpectedMoveDownOrder 
} from '../utils/test-factories'
import { mockUser } from '../utils/test-utils'

// Mock Firebase imports with proper vi.hoisted setup
const mockWriteBatch = vi.hoisted(() => vi.fn())
const mockDoc = vi.hoisted(() => vi.fn())
const mockCollection = vi.hoisted(() => vi.fn())
const mockUpdateDoc = vi.hoisted(() => vi.fn())
const mockAddDoc = vi.hoisted(() => vi.fn())
const mockDeleteDoc = vi.hoisted(() => vi.fn())
const mockServerTimestamp = vi.hoisted(() => vi.fn())
const mockQuery = vi.hoisted(() => vi.fn())
const mockWhere = vi.hoisted(() => vi.fn())
const mockGetDocs = vi.hoisted(() => vi.fn())

vi.mock('../../firebase/firebase', () => ({
  db: {}
}))

vi.mock('firebase/firestore', () => ({
  collection: mockCollection,
  doc: mockDoc,
  addDoc: mockAddDoc,
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  serverTimestamp: mockServerTimestamp,
  writeBatch: mockWriteBatch,
  query: mockQuery,
  where: mockWhere,
  getDocs: mockGetDocs
}))

// Mock AuthProvider
vi.mock('../../providers/AuthProvider', () => ({
  useAuth: () => ({ user: mockUser })
}))

describe('useCardOperations - Reorder Functionality', () => {
  const deckId = 'test-deck-123'
  let mockBatch: any
  
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Set up mock batch operations
    mockBatch = {
      update: vi.fn(),
      commit: vi.fn().mockResolvedValue(undefined)
    }
    
    // Configure mocks
    mockWriteBatch.mockReturnValue(mockBatch)
    mockServerTimestamp.mockReturnValue({ seconds: 1234567890, nanoseconds: 0 })
    mockDoc.mockImplementation((db, collection, ...path) => ({ 
      toString: () => `${collection}/${path.join('/')}`
    }))
    mockCollection.mockImplementation((db, name) => ({ name }))
    mockGetDocs.mockResolvedValue({ docs: [], size: 0 })
  })

  describe('moveCardUp', () => {
    it('should move a card up one position', async () => {
  const { result } = renderHook(() => useCardOperations())
      const testCards = createReorderTestCards()
      const cardToMove = testCards[2] // Third card (index 2)
      
      await act(async () => {
        await result.current.moveCardUp(cardToMove.id, testCards)
      })
      
      // Verify batch operations were called correctly
      expect(mockBatch.update).toHaveBeenCalledTimes(5) // 4 cards + 1 deck update
      expect(mockBatch.commit).toHaveBeenCalledTimes(1)
      expect(result.current.error).toBeNull()
    })

    it('should not move the first card up', async () => {
      const { result } = renderHook(() => useCardOperations(deckId))
      const testCards = createReorderTestCards()
      const firstCard = testCards[0]
      
      await act(async () => {
        await expect(result.current.moveCardUp(firstCard.id, testCards))
          .rejects.toThrow('Card cannot be moved up')
      })
      
      expect(mockBatch.update).not.toHaveBeenCalled()
      expect(mockBatch.commit).not.toHaveBeenCalled()
    })

    it('should handle moveCardUp with correct order indices', async () => {
      const { result } = renderHook(() => useCardOperations(deckId))
      const testCards = createReorderTestCards()
      const expectedOrder = createExpectedMoveUpOrder('card-3', testCards)
      
      await act(async () => {
        await result.current.moveCardUp('card-3', testCards)
      })
      
      // Verify the correct card IDs and order indices were used
      const cardUpdateCalls = mockBatch.update.mock.calls.filter((call: any) => 
        call[0] && call[1] && call[1].orderIndex !== undefined
      )
      
      expect(cardUpdateCalls).toHaveLength(4)
      
      // Check that the order indices match expected reordered state
      expectedOrder.forEach((card, index) => {
        const matchingCall = cardUpdateCalls.find((call: any) => 
          call[0].toString().includes(card.id)
        )
        if (matchingCall) {
          expect(matchingCall[1].orderIndex).toBe(index)
        }
      })
    })

    it('should surface underlying moveCardUp error (e.g., authentication)', async () => {
      const testCards = createReorderTestCards()
      // Force batch commit to throw (simulating auth / permission issue)
      mockBatch.commit.mockRejectedValueOnce(new Error('Authentication required'))
      const { result } = renderHook(() => useCardOperations(deckId))

      await act(async () => {
        await expect(result.current.moveCardUp('card-2', testCards))
          .rejects.toThrow('Authentication required')
      })

      expect(result.current.error).toBe('Authentication required')
    })
  })

  describe('moveCardDown', () => {
    it('should move a card down one position', async () => {
      const { result } = renderHook(() => useCardOperations(deckId))
      const testCards = createReorderTestCards()
      const cardToMove = testCards[1] // Second card (index 1)
      
      await act(async () => {
        await result.current.moveCardDown(cardToMove.id, testCards)
      })
      
      // Verify batch operations were called correctly
      expect(mockBatch.update).toHaveBeenCalledTimes(5) // 4 cards + 1 deck update
      expect(mockBatch.commit).toHaveBeenCalledTimes(1)
      expect(result.current.error).toBeNull()
    })

    it('should not move the last card down', async () => {
      const { result } = renderHook(() => useCardOperations(deckId))
      const testCards = createReorderTestCards()
      const lastCard = testCards[testCards.length - 1]
      
      await act(async () => {
        await expect(result.current.moveCardDown(lastCard.id, testCards))
          .rejects.toThrow('Card cannot be moved down')
      })
      
      expect(mockBatch.update).not.toHaveBeenCalled()
      expect(mockBatch.commit).not.toHaveBeenCalled()
    })

    it('should handle moveCardDown with correct order indices', async () => {
      const { result } = renderHook(() => useCardOperations(deckId))
      const testCards = createReorderTestCards()
      const expectedOrder = createExpectedMoveDownOrder('card-2', testCards)
      
      await act(async () => {
        await result.current.moveCardDown('card-2', testCards)
      })
      
      // Verify the correct card IDs and order indices were used
      const cardUpdateCalls = mockBatch.update.mock.calls.filter((call: any) => 
        call[0] && call[1] && call[1].orderIndex !== undefined
      )
      
      expect(cardUpdateCalls).toHaveLength(4)
      
      // Check that the order indices match expected reordered state
      expectedOrder.forEach((card, index) => {
        const matchingCall = cardUpdateCalls.find((call: any) => 
          call[0].toString().includes(card.id)
        )
        if (matchingCall) {
          expect(matchingCall[1].orderIndex).toBe(index)
        }
      })
    })

    it('should handle invalid card ID', async () => {
      const { result } = renderHook(() => useCardOperations(deckId))
      const testCards = createReorderTestCards()
      
      await act(async () => {
        await expect(result.current.moveCardDown('invalid-card-id', testCards))
          .rejects.toThrow('Card cannot be moved down')
      })
      
      expect(mockBatch.update).not.toHaveBeenCalled()
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle Firestore batch commit failure', async () => {
      mockBatch.commit.mockRejectedValue(new Error('Firestore error'))
      
      const { result } = renderHook(() => useCardOperations(deckId))
      const testCards = createReorderTestCards()
      
      await act(async () => {
        await expect(result.current.moveCardUp('card-2', testCards))
          .rejects.toThrow('Firestore error')
      })
      
      expect(result.current.error).toBe('Firestore error')  // The actual error message passed through
      expect(result.current.loading).toBe(false)
    })

    it('should handle single card deck (no reordering possible)', async () => {
      const { result } = renderHook(() => useCardOperations(deckId))
      const singleCard = [createReorderTestCards()[0]]
      
      await act(async () => {
        await expect(result.current.moveCardUp(singleCard[0].id, singleCard))
          .rejects.toThrow('Card cannot be moved up')
        
        await expect(result.current.moveCardDown(singleCard[0].id, singleCard))
          .rejects.toThrow('Card cannot be moved down')
      })
    })

    it('should handle empty card array', async () => {
      const { result } = renderHook(() => useCardOperations(deckId))
      
      await act(async () => {
        await expect(result.current.moveCardUp('any-id', []))
          .rejects.toThrow('Card cannot be moved up')
        
        await expect(result.current.moveCardDown('any-id', []))
          .rejects.toThrow('Card cannot be moved down')
      })
    })

    it('should set loading state correctly during operations', async () => {
      const { result } = renderHook(() => useCardOperations(deckId))
      const testCards = createReorderTestCards()
      
      expect(result.current.loading).toBe(false)
      
      const movePromise = act(async () => {
        await result.current.moveCardUp('card-2', testCards)
      })
      
      await movePromise
      expect(result.current.loading).toBe(false)
    })
  })

  describe('Performance and Optimization', () => {
    it('should use batch operations for efficiency', async () => {
      const { result } = renderHook(() => useCardOperations(deckId))
      const testCards = createReorderTestCards()
      
      await act(async () => {
        await result.current.moveCardUp('card-3', testCards)
      })
      
      // Verify that writeBatch was used instead of individual updates
      expect(mockWriteBatch).toHaveBeenCalledTimes(1)
      expect(mockBatch.commit).toHaveBeenCalledTimes(1)
    })

    it('should update deck timestamp with card reordering', async () => {
      const { result } = renderHook(() => useCardOperations(deckId))
      const testCards = createReorderTestCards()
      
      await act(async () => {
        await result.current.moveCardDown('card-1', testCards)
      })
      
      // Verify we have the expected number of batch updates
      expect(mockBatch.update).toHaveBeenCalledTimes(5) // 4 cards + 1 deck
      
      // Find the deck update by looking for the call that only updates 'updatedAt'
      const deckUpdateCall = mockBatch.update.mock.calls.find((call: any) => {
        const updateData = call[1]
        return updateData && Object.keys(updateData).length === 1 && updateData.updatedAt
      })
      
      expect(deckUpdateCall).toBeDefined()
      expect(deckUpdateCall[1]).toHaveProperty('updatedAt')
    })
  })
})
