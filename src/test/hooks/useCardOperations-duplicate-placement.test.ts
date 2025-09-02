import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCardOperations } from '../../hooks/useCardOperations'
import type { Card } from '../../types'

// Hoisted mocks
const mockCreateCardInDeck = vi.hoisted(() => vi.fn())
const mockCreateCardInDeckWithId = vi.hoisted(() => vi.fn())
const mockUpdateCardInDeck = vi.hoisted(() => vi.fn())
const mockDeleteCardFromDeck = vi.hoisted(() => vi.fn())
const mockMoveCardInDeck = vi.hoisted(() => vi.fn())
const mockReorderCards = vi.hoisted(() => vi.fn())

vi.mock('../../firebase/firestore', () => ({
  createCardInDeck: mockCreateCardInDeck,
  createCardInDeckWithId: mockCreateCardInDeckWithId,
  updateCardInDeck: mockUpdateCardInDeck,
  deleteCardFromDeck: mockDeleteCardFromDeck,
  moveCardInDeck: mockMoveCardInDeck,
  reorderCards: mockReorderCards
}))

describe('useCardOperations - duplicate adjacency', () => {
  const deckId = 'deck-x'
  const cards: Card[] = [
    { id: 'c1', deckId, title: 'One', body: 'B1', orderIndex: 0, createdAt: new Date(), updatedAt: new Date() },
    { id: 'c2', deckId, title: 'Two', body: 'B2', orderIndex: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: 'c3', deckId, title: 'Three', body: 'B3', orderIndex: 2, createdAt: new Date(), updatedAt: new Date() }
  ]
  beforeEach(() => {
    vi.clearAllMocks()
  mockCreateCardInDeck.mockResolvedValue(undefined)
  mockCreateCardInDeckWithId.mockResolvedValue('new-card-id')
    mockReorderCards.mockResolvedValue({ success: true })
  })

  it('creates duplicate then reorders so duplicate appears immediately after source', async () => {
    const { result } = renderHook(() => useCardOperations())
    const source = cards[1] // c2
    await act(async () => {
      // @ts-expect-error new method added via TDD
      await result.current.duplicateCardAdjacent(deckId, source, cards)
    })

  // Should have used ID-returning create wrapper
  expect(mockCreateCardInDeckWithId).toHaveBeenCalledTimes(1)
    // reorderCards called with updated order placing new card after c2
    expect(mockReorderCards).toHaveBeenCalledTimes(1)
    const reorderArg = mockReorderCards.mock.calls[0][1]
    const idsInOrder = reorderArg.map((u: any) => u.cardId)
    const idxC2 = idsInOrder.indexOf('c2')
    expect(idsInOrder[idxC2 + 1]).toBe('new-card-id')
  })
})
