import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCardOperations } from '../../hooks/useCardOperations'
import type { Card } from '../../types'

// Hoisted mocks
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

describe('useCardOperations - archive/unarchive', () => {
  const deckId = 'deck-arch-1'
  let card: Card

  beforeEach(() => {
    vi.clearAllMocks()
    card = {
      id: 'card-1',
      deckId,
      title: 'Archive Me',
      body: 'Body',
      orderIndex: 0,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      // @ts-expect-error archived will be added via TDD
      archived: false
    }
  })

  it('archives an active card', async () => {
    mockUpdateCardInDeck.mockResolvedValue(undefined)
    const { result } = renderHook(() => useCardOperations())
    expect(typeof (result.current as any).archiveCard).toBe('function') // fails until implemented

    await act(async () => {
      await (result.current as any).archiveCard(card)
    })

    expect(mockUpdateCardInDeck).toHaveBeenCalledTimes(1)
    const call = mockUpdateCardInDeck.mock.calls[0]
    expect(call[0]).toBe(card.id)
    expect(call[1]).toMatchObject({ deckId, archived: true })
  })

  it('unarchives an archived card', async () => {
    mockUpdateCardInDeck.mockResolvedValue(undefined)
    const archivedCard = { ...card, archived: true }
    const { result } = renderHook(() => useCardOperations())

    await act(async () => {
      await (result.current as any).unarchiveCard(archivedCard)
    })

    expect(mockUpdateCardInDeck).toHaveBeenCalledTimes(1)
    const call = mockUpdateCardInDeck.mock.calls[0]
    expect(call[1]).toMatchObject({ deckId, archived: false })
  })

  it('propagates errors', async () => {
    mockUpdateCardInDeck.mockRejectedValue(new Error('Update failed'))
    const { result } = renderHook(() => useCardOperations())

    await expect(async () => {
      await act(async () => {
        await (result.current as any).archiveCard(card)
      })
    }).rejects.toThrow('Update failed')
  })
})
