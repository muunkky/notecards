import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCardOperations } from '../../hooks/useCardOperations'
import type { Card } from '../../types'

// Hoisted mocks for firestore wrapper functions
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

describe('useCardOperations - toggleFavorite', () => {
  const deckId = 'deck-fav-1'
  let card: Card

  beforeEach(() => {
    vi.clearAllMocks()
    card = {
      id: 'card-1',
      deckId,
      title: 'Favorite Card',
      body: 'Body',
      orderIndex: 0,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      // @ts-expect-error favorite will be added via TDD type extension
      favorite: false
    }
  })

  it('toggles favorite from false to true', async () => {
    mockUpdateCardInDeck.mockResolvedValue(undefined)
    const { result } = renderHook(() => useCardOperations())

    expect(typeof (result.current as any).toggleFavorite).toBe('function') // Will fail until implemented

    await act(async () => {
      await (result.current as any).toggleFavorite(card)
    })

    expect(mockUpdateCardInDeck).toHaveBeenCalledTimes(1)
    const call = mockUpdateCardInDeck.mock.calls[0]
    expect(call[0]).toBe(card.id)
    expect(call[1]).toMatchObject({ deckId, favorite: true })
  })

  it('propagates errors from updateCardInDeck', async () => {
    mockUpdateCardInDeck.mockRejectedValue(new Error('Update failed'))
    const { result } = renderHook(() => useCardOperations())

    await expect(async () => {
      await act(async () => {
        await (result.current as any).toggleFavorite(card)
      })
    }).rejects.toThrow('Update failed')
  })
})
