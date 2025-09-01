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
  createUserDocument,
  getUserDocument,
  moveCardInDeck,
  createCardInDeck,
  updateCardInDeck,
  deleteCardFromDeck,
} from '../../firebase/firestore';
import { db } from '../../firebase/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { Card } from '../../types';

// Mock Firebase Firestore
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: vi.fn(),
    doc: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    getDocs: vi.fn(),
    getDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    writeBatch: vi.fn(),
    serverTimestamp: vi.fn(() => ({ seconds: 1234567890, nanoseconds: 0 })),
  };
});

// Mock Firebase configuration
vi.mock('../../firebase/firebase', () => ({
  db: 'mocked-db',
}));

describe('Firestore Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Deck Operations', () => {
    describe('createDeck', () => {
      it('should create a deck successfully', async () => {
        const mockDocRef = { id: 'deck-123' };
        vi.mocked(addDoc).mockResolvedValueOnce(mockDocRef as any);
        vi.mocked(collection).mockReturnValueOnce('mocked-collection' as any);

        const result = await createDeck('user-123', 'Test Deck');

        expect(result.success).toBe(true);
        expect(result.data).toBe('deck-123');
        expect(addDoc).toHaveBeenCalledWith('mocked-collection', {
          title: 'Test Deck',
          ownerId: 'user-123',
          createdAt: { seconds: 1234567890, nanoseconds: 0 },
          updatedAt: { seconds: 1234567890, nanoseconds: 0 },
        });
      });

      it('should handle errors when creating a deck', async () => {
        const error = new Error('Firestore error');
        vi.mocked(addDoc).mockRejectedValueOnce(error);

        const result = await createDeck('user-123', 'Test Deck');

        expect(result.success).toBe(false);
        expect(result.error?.message).toBe('Firestore error');
      });
    });

    describe('updateDeck', () => {
      it('should update a deck successfully', async () => {
        vi.mocked(doc).mockReturnValueOnce('mocked-doc-ref' as any);
        vi.mocked(updateDoc).mockResolvedValueOnce(undefined);

        const result = await updateDeck('deck-123', { title: 'Updated Title' });

        expect(result.success).toBe(true);
        expect(updateDoc).toHaveBeenCalledWith('mocked-doc-ref', {
          title: 'Updated Title',
          updatedAt: { seconds: 1234567890, nanoseconds: 0 },
        });
      });

      it('should handle errors when updating a deck', async () => {
        const error = new Error('Update failed');
        vi.mocked(updateDoc).mockRejectedValueOnce(error);

        const result = await updateDeck('deck-123', { title: 'Updated Title' });

        expect(result.success).toBe(false);
        expect(result.error?.message).toBe('Update failed');
      });
    });

    describe('getUserDecks', () => {
      it('should get user decks successfully', async () => {
        const mockQuerySnapshot = {
          docs: [
            {
              id: 'deck-1',
              data: () => ({
                title: 'Deck 1',
                ownerId: 'user-123',
                createdAt: new Date('2023-01-01'),
                updatedAt: new Date('2023-01-02'),
              }),
            },
            {
              id: 'deck-2',
              data: () => ({
                title: 'Deck 2',
                ownerId: 'user-123',
                createdAt: new Date('2023-01-03'),
                updatedAt: new Date('2023-01-04'),
              }),
            },
          ],
        };

        vi.mocked(getDocs).mockResolvedValueOnce(mockQuerySnapshot as any);
        vi.mocked(query).mockReturnValueOnce('mocked-query' as any);
        vi.mocked(collection).mockReturnValueOnce('mocked-collection' as any);
        vi.mocked(where).mockReturnValueOnce('mocked-where' as any);
        vi.mocked(orderBy).mockReturnValueOnce('mocked-orderBy' as any);

        const result = await getUserDecks('user-123');

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(2);
        expect(result.data?.[0]).toEqual({
          id: 'deck-1',
          title: 'Deck 1',
          ownerId: 'user-123',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-02'),
        });
      });

      it('should handle errors when getting user decks', async () => {
        const error = new Error('Query failed');
        vi.mocked(getDocs).mockRejectedValueOnce(error);

        const result = await getUserDecks('user-123');

        expect(result.success).toBe(false);
        expect(result.error?.message).toBe('Query failed');
      });
    });

    describe('deleteDeck', () => {
      it('should delete a deck and all its data successfully', async () => {
        const mockBatch = {
          delete: vi.fn(),
          commit: vi.fn().mockResolvedValueOnce(undefined),
        };
        const mockCardsSnapshot = {
          forEach: vi.fn((callback: any) => {
            callback({ ref: 'card-ref-1' });
            callback({ ref: 'card-ref-2' });
          }),
        };
        const mockSnapshotsSnapshot = {
          forEach: vi.fn((callback: any) => {
            callback({ ref: 'snapshot-ref-1' });
          }),
        };

        vi.mocked(writeBatch).mockReturnValueOnce(mockBatch as any);
        vi.mocked(getDocs)
          .mockResolvedValueOnce(mockCardsSnapshot as any)
          .mockResolvedValueOnce(mockSnapshotsSnapshot as any);

        const result = await deleteDeck('deck-123');

        expect(result.success).toBe(true);
        expect(mockBatch.delete).toHaveBeenCalledTimes(4); // 1 deck + 2 cards + 1 snapshot
        expect(mockBatch.commit).toHaveBeenCalledOnce();
      });

      it('should handle errors when deleting a deck', async () => {
        const error = new Error('Delete failed');
        vi.mocked(writeBatch).mockImplementationOnce(() => {
          throw error;
        });

        const result = await deleteDeck('deck-123');

        expect(result.success).toBe(false);
        expect(result.error?.message).toBe('Delete failed');
      });
    });
  });

  describe('Card Operations', () => {
    describe('createCard', () => {
      it('should create a card successfully', async () => {
        const mockDocRef = { id: 'card-123' };
        const mockQuerySnapshot = { size: 2 }; // 2 existing cards

        vi.mocked(getDocs).mockResolvedValueOnce(mockQuerySnapshot as any);
        vi.mocked(addDoc).mockResolvedValueOnce(mockDocRef as any);
        vi.mocked(collection).mockReturnValue('mocked-collection' as any);
        vi.mocked(query).mockReturnValue('mocked-query' as any);
        vi.mocked(doc).mockReturnValue('mocked-doc-ref' as any);
        vi.mocked(updateDoc).mockResolvedValue(undefined);

        const result = await createCard('deck-123', 'Test Card', 'Test Content');

        expect(result.success).toBe(true);
        expect(result.data).toBe('card-123');
        expect(addDoc).toHaveBeenCalledWith('mocked-collection', {
          title: 'Test Card',
          body: 'Test Content',
          orderIndex: 2, // Should be at the end
          createdAt: { seconds: 1234567890, nanoseconds: 0 },
          updatedAt: { seconds: 1234567890, nanoseconds: 0 },
        });
      });

      it('should handle errors when creating a card', async () => {
        const error = new Error('Create failed');
        vi.mocked(getDocs).mockRejectedValueOnce(error);

        const result = await createCard('deck-123', 'Test Card');

        expect(result.success).toBe(false);
        expect(result.error?.message).toBe('Create failed');
      });
    });

    describe('updateCard', () => {
      it('should update a card successfully', async () => {
        vi.mocked(doc).mockReturnValue('mocked-doc-ref' as any);
        vi.mocked(updateDoc).mockResolvedValue(undefined);

        const result = await updateCard('deck-123', 'card-123', {
          title: 'Updated Title',
          body: 'Updated Body',
        });

        expect(result.success).toBe(true);
        expect(updateDoc).toHaveBeenCalledWith('mocked-doc-ref', {
          title: 'Updated Title',
          body: 'Updated Body',
          updatedAt: { seconds: 1234567890, nanoseconds: 0 },
        });
      });

      it('should handle errors when updating a card', async () => {
        const error = new Error('Update failed');
        vi.mocked(updateDoc).mockRejectedValueOnce(error);

        const result = await updateCard('deck-123', 'card-123', { title: 'Updated' });

        expect(result.success).toBe(false);
        expect(result.error?.message).toBe('Update failed');
      });
    });

    describe('deleteCard', () => {
      it('should delete a card successfully', async () => {
        vi.mocked(doc).mockReturnValue('mocked-doc-ref' as any);
        vi.mocked(deleteDoc).mockResolvedValue(undefined);
        vi.mocked(updateDoc).mockResolvedValue(undefined);

        const result = await deleteCard('deck-123', 'card-123');

        expect(result.success).toBe(true);
        expect(deleteDoc).toHaveBeenCalledWith('mocked-doc-ref');
      });

      it('should handle errors when deleting a card', async () => {
        const error = new Error('Delete failed');
        vi.mocked(deleteDoc).mockRejectedValueOnce(error);

        const result = await deleteCard('deck-123', 'card-123');

        expect(result.success).toBe(false);
        expect(result.error?.message).toBe('Delete failed');
      });
    });

    describe('getDeckCards', () => {
      it('should get deck cards successfully', async () => {
        const mockQuerySnapshot = {
          docs: [
            {
              id: 'card-1',
              data: () => ({
                title: 'Card 1',
                body: 'Content 1',
                orderIndex: 0,
                createdAt: new Date('2023-01-01'),
                updatedAt: new Date('2023-01-02'),
              }),
            },
            {
              id: 'card-2',
              data: () => ({
                title: 'Card 2',
                body: 'Content 2',
                orderIndex: 1,
                createdAt: new Date('2023-01-03'),
                updatedAt: new Date('2023-01-04'),
              }),
            },
          ],
        };

        vi.mocked(getDocs).mockResolvedValueOnce(mockQuerySnapshot as any);
        vi.mocked(query).mockReturnValue('mocked-query' as any);
        vi.mocked(collection).mockReturnValue('mocked-collection' as any);
        vi.mocked(orderBy).mockReturnValue('mocked-orderBy' as any);

        const result = await getDeckCards('deck-123');

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(2);
        expect(result.data?.[0]).toEqual({
          id: 'card-1',
          deckId: 'deck-123',
          title: 'Card 1',
          body: 'Content 1',
          orderIndex: 0,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-02'),
        });
      });

      it('should handle errors when getting deck cards', async () => {
        const error = new Error('Query failed');
        vi.mocked(getDocs).mockRejectedValueOnce(error);

        const result = await getDeckCards('deck-123');

        expect(result.success).toBe(false);
        expect(result.error?.message).toBe('Query failed');
      });
    });

    describe('reorderCards', () => {
      it('should batch update card order indices', async () => {
        const mockBatch = {
          update: vi.fn(),
          commit: vi.fn().mockResolvedValue(undefined),
        };

        vi.mocked(writeBatch).mockReturnValue(mockBatch as any);
        vi.mocked(doc).mockReturnValue('mocked-doc-ref' as any);

        const cardUpdates = [
          { cardId: 'card-1', orderIndex: 1 },
          { cardId: 'card-2', orderIndex: 0 },
        ];

        const result = await reorderCards('deck-123', cardUpdates);

        expect(result.success).toBe(true);
        expect(mockBatch.update).toHaveBeenCalledTimes(3); // 2 cards + 1 deck
        expect(mockBatch.commit).toHaveBeenCalledOnce();
      });

      it('should handle errors when reordering cards', async () => {
        const error = new Error('Batch failed');
        const mockBatch = {
          update: vi.fn(),
          commit: vi.fn().mockRejectedValue(error),
        };

        vi.mocked(writeBatch).mockReturnValue(mockBatch as any);

        const result = await reorderCards('deck-123', [
          { cardId: 'card-1', orderIndex: 1 },
        ]);

        expect(result.success).toBe(false);
        expect(result.error?.message).toBe('Batch failed');
      });
    });
  });

  describe('Order Snapshot Operations', () => {
    describe('saveOrderSnapshot', () => {
      it('should save an order snapshot successfully', async () => {
        const mockDocRef = { id: 'snapshot-123' };
        vi.mocked(addDoc).mockResolvedValueOnce(mockDocRef as any);
        vi.mocked(collection).mockReturnValue('mocked-collection' as any);

        const result = await saveOrderSnapshot('deck-123', 'Snapshot 1', [
          'card-1',
          'card-2',
        ]);

        expect(result.success).toBe(true);
        expect(result.data).toBe('snapshot-123');
        expect(addDoc).toHaveBeenCalledWith('mocked-collection', {
          name: 'Snapshot 1',
          cardOrder: ['card-1', 'card-2'],
          createdAt: { seconds: 1234567890, nanoseconds: 0 },
        });
      });

      it('should handle errors when saving an order snapshot', async () => {
        const error = new Error('Save failed');
        vi.mocked(addDoc).mockRejectedValueOnce(error);

        const result = await saveOrderSnapshot('deck-123', 'Snapshot 1', ['card-1']);

        expect(result.success).toBe(false);
        expect(result.error?.message).toBe('Save failed');
      });
    });

    describe('getOrderSnapshots', () => {
      it('should get order snapshots successfully', async () => {
        const mockQuerySnapshot = {
          docs: [
            {
              id: 'snapshot-1',
              data: () => ({
                name: 'Snapshot 1',
                cardOrder: ['card-1', 'card-2'],
                createdAt: new Date('2023-01-01'),
              }),
            },
          ],
        };

        vi.mocked(getDocs).mockResolvedValueOnce(mockQuerySnapshot as any);
        vi.mocked(query).mockReturnValue('mocked-query' as any);
        vi.mocked(collection).mockReturnValue('mocked-collection' as any);
        vi.mocked(orderBy).mockReturnValue('mocked-orderBy' as any);

        const result = await getOrderSnapshots('deck-123');

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(1);
        expect(result.data?.[0]).toEqual({
          id: 'snapshot-1',
          deckId: 'deck-123',
          name: 'Snapshot 1',
          cardOrder: ['card-1', 'card-2'],
          createdAt: new Date('2023-01-01'),
        });
      });

      it('should handle errors when getting order snapshots', async () => {
        const error = new Error('Query failed');
        vi.mocked(getDocs).mockRejectedValueOnce(error);

        const result = await getOrderSnapshots('deck-123');

        expect(result.success).toBe(false);
        expect(result.error?.message).toBe('Query failed');
      });
    });

    describe('deleteOrderSnapshot', () => {
      it('should delete an order snapshot successfully', async () => {
        vi.mocked(doc).mockReturnValue('mocked-doc-ref' as any);
        vi.mocked(deleteDoc).mockResolvedValue(undefined);

        const result = await deleteOrderSnapshot('deck-123', 'snapshot-123');

        expect(result.success).toBe(true);
        expect(deleteDoc).toHaveBeenCalledWith('mocked-doc-ref');
      });

      it('should handle errors when deleting an order snapshot', async () => {
        const error = new Error('Delete failed');
        vi.mocked(deleteDoc).mockRejectedValueOnce(error);

        const result = await deleteOrderSnapshot('deck-123', 'snapshot-123');

        expect(result.success).toBe(false);
        expect(result.error?.message).toBe('Delete failed');
      });
    });
  });

  describe('User Operations', () => {
    describe('createUserDocument', () => {
      it('should create a user document successfully', async () => {
        vi.mocked(doc).mockReturnValue('mocked-doc-ref' as any);
        vi.mocked(updateDoc).mockResolvedValue(undefined);

        const userData = {
          email: 'test@example.com',
          displayName: 'Test User',
          createdAt: new Date(),
        };

        const result = await createUserDocument('user-123', userData);

        expect(result.success).toBe(true);
        expect(updateDoc).toHaveBeenCalledWith('mocked-doc-ref', {
          ...userData,
          createdAt: { seconds: 1234567890, nanoseconds: 0 },
        });
      });

      it('should handle errors when creating a user document', async () => {
        const error = new Error('Create failed');
        vi.mocked(updateDoc).mockRejectedValueOnce(error);

        const result = await createUserDocument('user-123', {
          email: 'test@example.com',
          displayName: 'Test User',
          createdAt: new Date(),
        });

        expect(result.success).toBe(false);
        expect(result.error?.message).toBe('Create failed');
      });
    });

    describe('getUserDocument', () => {
      it('should get a user document successfully', async () => {
        const mockDocSnap = {
          exists: () => true,
          data: () => ({
            email: 'test@example.com',
            displayName: 'Test User',
            createdAt: new Date('2023-01-01'),
          }),
        };

        vi.mocked(doc).mockReturnValue('mocked-doc-ref' as any);
        vi.mocked(getDoc).mockResolvedValue(mockDocSnap as any);

        const result = await getUserDocument('user-123');

        expect(result.success).toBe(true);
        expect(result.data).toEqual({
          email: 'test@example.com',
          displayName: 'Test User',
          createdAt: new Date('2023-01-01'),
        });
      });

      it('should handle user not found', async () => {
        const mockDocSnap = {
          exists: () => false,
        };

        vi.mocked(getDoc).mockResolvedValue(mockDocSnap as any);

        const result = await getUserDocument('user-123');

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('not-found');
        expect(result.error?.message).toBe('User not found');
      });

      it('should handle errors when getting a user document', async () => {
        const error = new Error('Get failed');
        vi.mocked(getDoc).mockRejectedValueOnce(error);

        const result = await getUserDocument('user-123');

        expect(result.success).toBe(false);
        expect(result.error?.message).toBe('Get failed');
      });
    });
  });

  describe('Card Operation Wrappers', () => {
    describe('moveCardInDeck', () => {
      const mockCards: Card[] = [
        {
          id: 'card-1',
          deckId: 'deck-123',
          title: 'Card 1',
          body: 'Content 1',
          orderIndex: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'card-2',
          deckId: 'deck-123',
          title: 'Card 2',
          body: 'Content 2',
          orderIndex: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'card-3',
          deckId: 'deck-123',
          title: 'Card 3',
          body: 'Content 3',
          orderIndex: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      beforeEach(() => {
        const mockBatch = {
          update: vi.fn(),
          commit: vi.fn().mockResolvedValue(undefined),
        };
        vi.mocked(writeBatch).mockReturnValue(mockBatch as any);
        vi.mocked(doc).mockReturnValue('mocked-doc-ref' as any);
      });

      it('should move card up successfully', async () => {
        await expect(moveCardInDeck('card-2', mockCards, 'up')).resolves.not.toThrow();
      });

      it('should move card down successfully', async () => {
        await expect(moveCardInDeck('card-2', mockCards, 'down')).resolves.not.toThrow();
      });

      it('should throw error when moving first card up', async () => {
        await expect(moveCardInDeck('card-1', mockCards, 'up')).rejects.toThrow(
          'Card cannot be moved up'
        );
      });

      it('should throw error when moving last card down', async () => {
        await expect(moveCardInDeck('card-3', mockCards, 'down')).rejects.toThrow(
          'Card cannot be moved down'
        );
      });

      it('should throw error when card not found (moving up)', async () => {
        await expect(moveCardInDeck('nonexistent', mockCards, 'up')).rejects.toThrow(
          'Card cannot be moved up'
        );
      });

      it('should throw error when card not found (moving down)', async () => {
        await expect(moveCardInDeck('nonexistent', mockCards, 'down')).rejects.toThrow(
          'Card cannot be moved down'
        );
      });

      it('should throw error when deck ID not found', async () => {
        const cardsWithoutDeckId = mockCards.map(card => ({ ...card, deckId: '' }));
        await expect(moveCardInDeck('card-1', cardsWithoutDeckId, 'up')).rejects.toThrow(
          'Deck ID not found'
        );
      });
    });

    describe('createCardInDeck', () => {
      it('should create card successfully', async () => {
        const mockDocRef = { id: 'card-123' };
        const mockQuerySnapshot = { size: 0 };

        vi.mocked(getDocs).mockResolvedValueOnce(mockQuerySnapshot as any);
        vi.mocked(addDoc).mockResolvedValueOnce(mockDocRef as any);
        vi.mocked(collection).mockReturnValue('mocked-collection' as any);
        vi.mocked(query).mockReturnValue('mocked-query' as any);
        vi.mocked(doc).mockReturnValue('mocked-doc-ref' as any);
        vi.mocked(updateDoc).mockResolvedValue(undefined);

        await expect(createCardInDeck('deck-123', 'Test Card', 'Content')).resolves.not.toThrow();
      });

      it('should throw error when creation fails', async () => {
        const error = new Error('Create failed');
        vi.mocked(getDocs).mockRejectedValueOnce(error);

        await expect(createCardInDeck('deck-123', 'Test Card')).rejects.toThrow(
          'Create failed'
        );
      });
    });

    describe('updateCardInDeck', () => {
      it('should update card successfully', async () => {
        vi.mocked(doc).mockReturnValue('mocked-doc-ref' as any);
        vi.mocked(updateDoc).mockResolvedValue(undefined);

        const updates = { deckId: 'deck-123', title: 'Updated Title' };
        await expect(updateCardInDeck('card-123', updates)).resolves.not.toThrow();
      });

      it('should throw error when deck ID is missing', async () => {
        const updates = { title: 'Updated Title' };
        await expect(updateCardInDeck('card-123', updates)).rejects.toThrow(
          'Deck ID is required for card updates'
        );
      });

      it('should throw error when update fails', async () => {
        const error = new Error('Update failed');
        vi.mocked(updateDoc).mockRejectedValueOnce(error);

        const updates = { deckId: 'deck-123', title: 'Updated Title' };
        await expect(updateCardInDeck('card-123', updates)).rejects.toThrow(
          'Update failed'
        );
      });
    });

    describe('deleteCardFromDeck', () => {
      it('should delete card successfully', async () => {
        vi.mocked(doc).mockReturnValue('mocked-doc-ref' as any);
        vi.mocked(deleteDoc).mockResolvedValue(undefined);
        vi.mocked(updateDoc).mockResolvedValue(undefined);

        await expect(deleteCardFromDeck('card-123', 'deck-123')).resolves.not.toThrow();
      });

      it('should throw error when deletion fails', async () => {
        const error = new Error('Delete failed');
        vi.mocked(deleteDoc).mockRejectedValueOnce(error);

        await expect(deleteCardFromDeck('card-123', 'deck-123')).rejects.toThrow(
          'Delete failed'
        );
      });
    });
  });
});
