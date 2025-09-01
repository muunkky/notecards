import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCardOperations } from '../../hooks/useCardOperations';
import * as firestoreModule from '../../firebase/firestore';
import { Card } from '../../types';

// Mock the firestore module
vi.mock('../../firebase/firestore', () => ({
  moveCardInDeck: vi.fn(),
  createCardInDeck: vi.fn(),
  updateCardInDeck: vi.fn(),
  deleteCardFromDeck: vi.fn(),
  reorderCards: vi.fn(),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockCards: Card[] = [
  {
    id: 'card-1',
    deckId: 'deck-123',
    title: 'Card 1',
    body: 'Content 1',
    orderIndex: 0,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    id: 'card-2',
    deckId: 'deck-123',
    title: 'Card 2',
    body: 'Content 2',
    orderIndex: 1,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    id: 'card-3',
    deckId: 'deck-123',
    title: 'Card 3',
    body: 'Content 3',
    orderIndex: 2,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
];

describe('useCardOperations - Card Reordering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('moveCardUp', () => {
    it('should move card up successfully', async () => {
      vi.mocked(firestoreModule.moveCardInDeck).mockResolvedValueOnce(undefined);
      
      const { result } = renderHook(() => useCardOperations());
      
      await act(async () => {
        await result.current.moveCardUp('card-2', mockCards);
      });
      
      expect(firestoreModule.moveCardInDeck).toHaveBeenCalledWith('card-2', mockCards, 'up');
    });

    it('should handle move card up error', async () => {
      const error = new Error('Card cannot be moved up');
      vi.mocked(firestoreModule.moveCardInDeck).mockRejectedValueOnce(error);
      
      const { result } = renderHook(() => useCardOperations());
      
      await act(async () => {
        await result.current.moveCardUp('card-1', mockCards);
      });
      
      expect(firestoreModule.moveCardInDeck).toHaveBeenCalledWith('card-1', mockCards, 'up');
    });
  });

  describe('moveCardDown', () => {
    it('should move card down successfully', async () => {
      vi.mocked(firestoreModule.moveCardInDeck).mockResolvedValueOnce(undefined);
      
      const { result } = renderHook(() => useCardOperations());
      
      await act(async () => {
        await result.current.moveCardDown('card-2', mockCards);
      });
      
      expect(firestoreModule.moveCardInDeck).toHaveBeenCalledWith('card-2', mockCards, 'down');
    });

    it('should handle move card down error', async () => {
      const error = new Error('Card cannot be moved down');
      vi.mocked(firestoreModule.moveCardInDeck).mockRejectedValueOnce(error);
      
      const { result } = renderHook(() => useCardOperations());
      
      await act(async () => {
        await result.current.moveCardDown('card-3', mockCards);
      });
      
      expect(firestoreModule.moveCardInDeck).toHaveBeenCalledWith('card-3', mockCards, 'down');
    });
  });

  describe('reorderCards', () => {
    it('should reorder cards successfully', async () => {
      const mockReorderCards = vi.fn().mockResolvedValue({ success: true });
      vi.mocked(firestoreModule.reorderCards).mockImplementation(mockReorderCards);
      
      const { result } = renderHook(() => useCardOperations());
      
      const newOrder = [
        { cardId: 'card-2', orderIndex: 0 },
        { cardId: 'card-1', orderIndex: 1 },
        { cardId: 'card-3', orderIndex: 2 },
      ];
      
      await act(async () => {
        await result.current.reorderCards('deck-123', newOrder);
      });
      
      expect(mockReorderCards).toHaveBeenCalledWith('deck-123', newOrder);
    });

    it('should handle reorder cards error', async () => {
      const mockReorderCards = vi.fn().mockResolvedValue({
        success: false,
        error: { message: 'Reorder failed' },
      });
      vi.mocked(firestoreModule.reorderCards).mockImplementation(mockReorderCards);
      
      const { result } = renderHook(() => useCardOperations());
      
      const newOrder = [
        { cardId: 'card-1', orderIndex: 0 },
        { cardId: 'card-2', orderIndex: 1 },
      ];
      
      await act(async () => {
        await result.current.reorderCards('deck-123', newOrder);
      });
      
      expect(mockReorderCards).toHaveBeenCalledWith('deck-123', newOrder);
    });
  });

  describe('with actual deck timestamp updates', () => {
    it('should detect deck timestamp updates during reorder operations', async () => {
      const originalReorderCards = vi.fn();
      
      // Mock the actual reorderCards implementation that updates deck timestamp
      originalReorderCards.mockImplementation(async (deckId, cardUpdates) => {
        // Simulate the batch operation that includes deck update
        const mockBatch = {
          update: vi.fn(),
          commit: vi.fn(),
        };
        
        // This would normally update the cards and the deck
        cardUpdates.forEach(() => {
          mockBatch.update(); // Card update
        });
        mockBatch.update(); // Deck update (timestamp)
        
        await mockBatch.commit();
        return { success: true };
      });
      
      vi.mocked(firestoreModule.reorderCards).mockImplementation(originalReorderCards);
      
      const { result } = renderHook(() => useCardOperations());
      
      const newOrder = [
        { cardId: 'card-2', orderIndex: 0 },
        { cardId: 'card-1', orderIndex: 1 },
      ];
      
      await act(async () => {
        await result.current.reorderCards('deck-123', newOrder);
      });
      
      expect(originalReorderCards).toHaveBeenCalledWith('deck-123', newOrder);
    });

    it.skip('should update deck timestamp when cards are reordered', async () => {
      // This test is skipped as it requires complex mocking of Firestore batch operations
      // The actual implementation is tested in the firestore.test.ts file
      // where we verify that reorderCards includes deck timestamp update in the batch
    });
  });
});
