import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCardOperations } from '../../hooks/useCardOperations'
import type { Card } from '../../types'

// Use vi.hoisted to ensure mocks are defined before the mock factory executes
const mockCreateCardInDeck = vi.hoisted(() => vi.fn())
const mockUpdateCardInDeck = vi.hoisted(() => vi.fn())
const mockDeleteCardFromDeck = vi.hoisted(() => vi.fn())
const mockMoveCardInDeck = vi.hoisted(() => vi.fn())
const mockReorderCards = vi.hoisted(() => vi.fn())

vi.mock('../../firebase/firestore', () => ({
  createCardInDeck: mockCreateCardInDeck,
  updateCardInDeck: mockUpdateCardInDeck,
  deleteCardFromDeck: mockDeleteCardFromDeck,
  moveCardInDeck: mockMoveCardInDeck,
  reorderCards: mockReorderCards
}))

describe('useCardOperations - duplicateCard', () => {
  const deckId = 'deck-123'
  const baseCard: Card = {
    id: 'card-1',
    deckId,
    title: 'Original Title',
    body: 'Some body text',
    orderIndex: 0,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a duplicate card with (Copy) suffix and same body', async () => {
    mockCreateCardInDeck.mockResolvedValue(undefined)
    const { result } = renderHook(() => useCardOperations())

    await act(async () => {
      // @ts-expect-error duplicateCard will be added via TDD
      await result.current.duplicateCard(deckId, baseCard)
    })

    expect(mockCreateCardInDeck).toHaveBeenCalledWith(deckId, 'Original Title (Copy)', 'Some body text')
  })

  it('should surface errors from createCardInDeck', async () => {
    mockCreateCardInDeck.mockRejectedValue(new Error('Create failed'))
    const { result } = renderHook(() => useCardOperations())

    await expect(async () => {
      await act(async () => {
        // @ts-expect-error duplicateCard will be added via TDD
        await result.current.duplicateCard(deckId, baseCard)
      })
    }).rejects.toThrow('Create failed')
  })
})
