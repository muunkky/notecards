import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'

// Mock Firebase Firestore functions using vi.hoisted() to ensure proper hoisting
const {
  mockAddDoc,
  mockSetDoc,
  mockUpdateDoc,
  mockDeleteDoc,
  mockGetDocs,
  mockGetDoc,
  mockCollection,
  mockDoc,
  mockQuery,
  mockWhere,
  mockOrderBy,
  mockWriteBatch,
  mockServerTimestamp,
  mockCollectionRef,
  mockDocRef
} = vi.hoisted(() => {
  const mockCollectionRef = { _type: 'collection' }
  const mockDocRef = { _type: 'doc', id: 'mock-doc-id' }
  const mockQueryRef = { _type: 'query' }
  
  const mockGetDoc = vi.fn()
  const mockGetDocs = vi.fn()
  
  return {
    mockAddDoc: vi.fn(),
    mockSetDoc: vi.fn(),
    mockUpdateDoc: vi.fn(),
    mockDeleteDoc: vi.fn(),
    mockGetDocs,
    mockGetDoc,
    mockCollection: vi.fn(() => mockCollectionRef),
    mockDoc: vi.fn(() => mockDocRef),
    mockQuery: vi.fn(() => mockQueryRef),
    mockWhere: vi.fn(() => mockQueryRef),
    mockOrderBy: vi.fn(() => mockQueryRef),
    mockWriteBatch: vi.fn(() => ({
      update: vi.fn(),
      delete: vi.fn(),
      commit: vi.fn().mockResolvedValue(undefined)
    })),
    mockServerTimestamp: vi.fn(() => new Date()),
    mockCollectionRef,
    mockDocRef
  }
})

vi.mock('firebase/firestore', () => ({
  collection: mockCollection,
  doc: mockDoc,
  addDoc: mockAddDoc,
  setDoc: mockSetDoc,
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  getDocs: mockGetDocs,
  getDoc: mockGetDoc,
  query: mockQuery,
  where: mockWhere,
  orderBy: mockOrderBy,
  writeBatch: mockWriteBatch,
  serverTimestamp: mockServerTimestamp,
  Timestamp: {
    fromDate: (date: Date) => ({ toDate: () => date }),
  },
}))

// Mock the Firebase config
vi.mock('../../firebase/firebase', () => ({
  db: { _type: 'firestore' },
  auth: { _type: 'auth' },
}))

// Now import the modules that depend on the mocks
import {
  createDeck,
  updateDeck,
  deleteDeck,
  getUserDecks,
  createCard,
  updateCard,
  deleteCard,
  getDeckCards,
  reorderCards,
  saveOrderSnapshot,
  getOrderSnapshots,
  deleteOrderSnapshot,
  shuffleArray,
  createUserDocument,
  getUserDocument
} from '../../firebase/firestore'
import {
  createMockDeck,
  createMockCard,
  createMockOrderSnapshot,
  createMockUserData,
  createMockQuerySnapshot,
  createMockDocSnapshot,
  createSuccessResponse,
  createErrorResponse
} from '../utils/test-factories'

describe('Firestore Service Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('User Services', () => {
    describe('createUserDocument', () => {
      it('should create user document successfully', async () => {
        const userData = createMockUserData()
        mockSetDoc.mockResolvedValue(undefined)

        const result = await createUserDocument('user-123', userData)

        expect(result.success).toBe(true)
        expect(mockSetDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            ...userData,
            createdAt: expect.any(Date)
          }),
          { merge: true }
        )
      })

      it('should handle errors when creating user document', async () => {
        const userData = createMockUserData()
        const error = new Error('Firestore error')
        mockSetDoc.mockRejectedValue(error)

        const result = await createUserDocument('user-123', userData)

        expect(result.success).toBe(false)
        expect(result.error?.message).toBe('Firestore error')
      })
    })

    describe('getUserDocument', () => {
      it('should get user document successfully', async () => {
        const userData = createMockUserData()
        const mockSnapshot = createMockDocSnapshot('user-123', userData, true)
        mockGetDoc.mockResolvedValue(mockSnapshot)

        const result = await getUserDocument('user-123')

        expect(result.success).toBe(true)
        expect(result.data).toEqual(expect.objectContaining({
          email: userData.email,
          displayName: userData.displayName
        }))
      })

      it('should handle user not found', async () => {
        const mockSnapshot = createMockDocSnapshot('user-123', null, false)
        mockGetDoc.mockResolvedValue(mockSnapshot)

        const result = await getUserDocument('user-123')

        expect(result.success).toBe(false)
        expect(result.error?.code).toBe('not-found')
      })
    })
  })

  describe('Deck Services', () => {
    describe('createDeck', () => {
      it('should create deck successfully', async () => {
        const newDeckId = 'new-deck-123'
        mockAddDoc.mockResolvedValue({ id: newDeckId })

        const result = await createDeck('user-123', 'Test Deck')

        expect(result.success).toBe(true)
        expect(result.data).toBe(newDeckId)
        
        // TDD: First verify what's actually being called, then we'll fix the expectations
        console.log('Mock calls:', mockAddDoc.mock.calls[0])
        expect(mockAddDoc).toHaveBeenCalled()
        expect(mockAddDoc.mock.calls[0][1]).toEqual(expect.objectContaining({
          title: 'Test Deck',
          ownerId: 'user-123',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        }))
      })

      it('should trim deck title when creating', async () => {
        mockAddDoc.mockResolvedValue({ id: 'deck-123' })

        await createDeck('user-123', '  Test Deck  ')

        expect(mockAddDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            title: 'Test Deck'
          })
        )
      })

      it('should handle errors when creating deck', async () => {
        const error = new Error('Permission denied')
        mockAddDoc.mockRejectedValue(error)

        const result = await createDeck('user-123', 'Test Deck')

        expect(result.success).toBe(false)
        expect(result.error?.message).toBe('Permission denied')
      })
    })

    describe('updateDeck', () => {
      it('should update deck successfully', async () => {
        mockUpdateDoc.mockResolvedValue(undefined)

        const result = await updateDeck('deck-123', { title: 'Updated Title' })

        expect(result.success).toBe(true)
        expect(mockUpdateDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            title: 'Updated Title',
            updatedAt: expect.any(Date)
          })
        )
      })

      it('should handle errors when updating deck', async () => {
        const error = new Error('Document not found')
        mockUpdateDoc.mockRejectedValue(error)

        const result = await updateDeck('deck-123', { title: 'Updated Title' })

        expect(result.success).toBe(false)
        expect(result.error?.message).toBe('Document not found')
      })
    })

    describe('deleteDeck', () => {
      it('should delete deck and its subcollections successfully', async () => {
        const mockBatch = {
          update: vi.fn(), // ensure shape matches reorderCards expectations elsewhere
          delete: vi.fn(),
          commit: vi.fn().mockResolvedValue(undefined)
        }
        mockWriteBatch.mockReturnValue(mockBatch)

        // Mock empty subcollections
        mockGetDocs.mockResolvedValue(createMockQuerySnapshot([]))

        const result = await deleteDeck('deck-123')

        expect(result.success).toBe(true)
        expect(mockBatch.commit).toHaveBeenCalled()
      })

      it('should handle errors when deleting deck', async () => {
        const error = new Error('Permission denied')
        mockGetDocs.mockRejectedValue(error)

        const result = await deleteDeck('deck-123')

        expect(result.success).toBe(false)
        expect(result.error?.message).toBe('Permission denied')
      })
    })

    describe('getUserDecks', () => {
      it('should get user decks successfully', async () => {
        const mockDecks = [
          { id: 'deck-1', data: { title: 'Deck 1', ownerId: 'user-123', createdAt: new Date(), updatedAt: new Date() } },
          { id: 'deck-2', data: { title: 'Deck 2', ownerId: 'user-123', createdAt: new Date(), updatedAt: new Date() } }
        ]
        mockGetDocs.mockResolvedValue(createMockQuerySnapshot(mockDecks))

        const result = await getUserDecks('user-123')

        expect(result.success).toBe(true)
        expect(result.data).toHaveLength(2)
        expect(result.data?.[0].title).toBe('Deck 1')
        expect(result.data?.[1].title).toBe('Deck 2')
      })

      it('should handle errors when getting user decks', async () => {
        const error = new Error('Network error')
        mockGetDocs.mockRejectedValue(error)

        const result = await getUserDecks('user-123')

        expect(result.success).toBe(false)
        expect(result.error?.message).toBe('Network error')
      })
    })
  })

  describe('Card Services', () => {
    describe('createCard', () => {
      it('should create card with correct order index', async () => {
        const newCardId = 'new-card-123'
        mockAddDoc.mockResolvedValue({ id: newCardId })
        
        // Mock existing cards count
        mockGetDocs.mockResolvedValue({ size: 3 })
        mockUpdateDoc.mockResolvedValue(undefined) // For deck update

        const result = await createCard('deck-123', 'Test Card', 'Test body')

        expect(result.success).toBe(true)
        expect(result.data).toBe(newCardId)
        expect(mockAddDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            title: 'Test Card',
            body: 'Test body',
            orderIndex: 3, // Should be at the end
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date)
          })
        )
      })

      it('should create card with empty body by default', async () => {
        mockAddDoc.mockResolvedValue({ id: 'card-123' })
        mockGetDocs.mockResolvedValue({ size: 0 })
        mockUpdateDoc.mockResolvedValue(undefined)

        await createCard('deck-123', 'Test Card')

        expect(mockAddDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            title: 'Test Card',
            body: '',
            orderIndex: 0
          })
        )
      })

      it('should include deckId when creating a card', async () => {
        mockAddDoc.mockResolvedValue({ id: 'card-123' })
        mockGetDocs.mockResolvedValue({ size: 0 })
        mockUpdateDoc.mockResolvedValue(undefined)

        await createCard('deck-123', 'Decked Card', 'Body content')

        expect(mockAddDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            deckId: 'deck-123',
            title: 'Decked Card'
          })
        )
      })

      it('should trim card title and body', async () => {
        mockAddDoc.mockResolvedValue({ id: 'card-123' })
        mockGetDocs.mockResolvedValue({ size: 0 })
        mockUpdateDoc.mockResolvedValue(undefined)

        await createCard('deck-123', '  Test Card  ', '  Test body  ')

        expect(mockAddDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            title: 'Test Card',
            body: 'Test body'
          })
        )
      })
    })

    describe('updateCard', () => {
      it('should update card and deck timestamp', async () => {
        mockUpdateDoc.mockResolvedValue(undefined)

        const result = await updateCard('deck-123', 'card-123', { 
          title: 'Updated Card',
          body: 'Updated body'
        })

        expect(result.success).toBe(true)
        expect(mockUpdateDoc).toHaveBeenCalledTimes(2) // Card + deck update
      })
    })

    describe('deleteCard', () => {
      it('should delete card and update deck timestamp', async () => {
        mockDeleteDoc.mockResolvedValue(undefined)
        mockUpdateDoc.mockResolvedValue(undefined)

        const result = await deleteCard('deck-123', 'card-123')

        expect(result.success).toBe(true)
        expect(mockDeleteDoc).toHaveBeenCalled()
        expect(mockUpdateDoc).toHaveBeenCalled() // Deck timestamp update
      })
    })

    describe('getDeckCards', () => {
      it('should get deck cards in order', async () => {
        const mockCards = [
          { id: 'card-1', data: { title: 'Card 1', body: 'Body 1', orderIndex: 0, createdAt: new Date(), updatedAt: new Date() } },
          { id: 'card-2', data: { title: 'Card 2', body: 'Body 2', orderIndex: 1, createdAt: new Date(), updatedAt: new Date() } }
        ]
        mockGetDocs.mockResolvedValue(createMockQuerySnapshot(mockCards))

        const result = await getDeckCards('deck-123')

        expect(result.success).toBe(true)
        expect(result.data).toHaveLength(2)
        expect(result.data?.[0].deckId).toBe('deck-123')
        expect(result.data?.[0].title).toBe('Card 1')
      })
    })

    describe('reorderCards', () => {
      it('should batch update card order indices', async () => {
        const mockBatch = {
          update: vi.fn(),
          delete: vi.fn(), // align with type requiring delete
          commit: vi.fn().mockResolvedValue(undefined)
        }
        mockWriteBatch.mockReturnValue(mockBatch)

        const cardUpdates = [
          { cardId: 'card-1', orderIndex: 1 },
          { cardId: 'card-2', orderIndex: 0 }
        ]

        const result = await reorderCards('deck-123', cardUpdates)

        expect(result.success).toBe(true)
        expect(mockBatch.update).toHaveBeenCalledTimes(3) // 2 cards + 1 deck
        expect(mockBatch.commit).toHaveBeenCalled()
      })
    })
  })

  describe('Order Snapshot Services', () => {
    describe('saveOrderSnapshot', () => {
      it('should save order snapshot successfully', async () => {
        const snapshotId = 'snapshot-123'
        mockAddDoc.mockResolvedValue({ id: snapshotId })

        const cardOrder = ['card-1', 'card-2', 'card-3']
        const result = await saveOrderSnapshot('deck-123', 'Test Snapshot', cardOrder)

        expect(result.success).toBe(true)
        expect(result.data).toBe(snapshotId)
        expect(mockAddDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            name: 'Test Snapshot',
            cardOrder,
            createdAt: expect.any(Date)
          })
        )
      })

      it('should trim snapshot name', async () => {
        mockAddDoc.mockResolvedValue({ id: 'snapshot-123' })

        await saveOrderSnapshot('deck-123', '  Test Snapshot  ', ['card-1'])

        expect(mockAddDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            name: 'Test Snapshot'
          })
        )
      })
    })

    describe('getOrderSnapshots', () => {
      it('should get order snapshots successfully', async () => {
        const mockSnapshots = [
          { id: 'snap-1', data: { name: 'Snapshot 1', cardOrder: ['card-1'], createdAt: new Date() } },
          { id: 'snap-2', data: { name: 'Snapshot 2', cardOrder: ['card-2'], createdAt: new Date() } }
        ]
        mockGetDocs.mockResolvedValue(createMockQuerySnapshot(mockSnapshots))

        const result = await getOrderSnapshots('deck-123')

        expect(result.success).toBe(true)
        expect(result.data).toHaveLength(2)
        expect(result.data?.[0].deckId).toBe('deck-123')
        expect(result.data?.[0].name).toBe('Snapshot 1')
      })
    })

    describe('deleteOrderSnapshot', () => {
      it('should delete order snapshot successfully', async () => {
        mockDeleteDoc.mockResolvedValue(undefined)

        const result = await deleteOrderSnapshot('deck-123', 'snapshot-123')

        expect(result.success).toBe(true)
        expect(mockDeleteDoc).toHaveBeenCalled()
      })
    })
  })

  describe('Utility Functions', () => {
    describe('shuffleArray', () => {
      it('should shuffle array without modifying original', () => {
        const original = [1, 2, 3, 4, 5]
        const shuffled = shuffleArray(original)

        expect(shuffled).toHaveLength(original.length)
        expect(shuffled).not.toBe(original) // Different reference
        expect(shuffled.sort()).toEqual(original.sort()) // Same elements
      })

      it('should handle empty array', () => {
        const result = shuffleArray([])
        expect(result).toEqual([])
      })

      it('should handle single element array', () => {
        const result = shuffleArray([1])
        expect(result).toEqual([1])
      })
    })
  })
})
