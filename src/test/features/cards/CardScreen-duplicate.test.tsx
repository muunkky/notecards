import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CardScreen from '../../../features/cards/CardScreen'
import type { Card } from '../../../types'

// Hoisted mocks
const mockUseCards = vi.hoisted(() => vi.fn())
const mockUseCardOperations = vi.hoisted(() => vi.fn())
const mockUseAuth = vi.hoisted(() => vi.fn())

vi.mock('../../../hooks/useCards', () => ({
  useCards: mockUseCards
}))

vi.mock('../../../hooks/useCardOperations', () => ({
  useCardOperations: mockUseCardOperations
}))

vi.mock('../../../providers/AuthProvider', () => ({
  useAuth: mockUseAuth
}))

describe('CardScreen Duplicate Card UI', () => {
  const deckId = 'deck-dup-1'
  const cards: Card[] = [
    {
      id: 'card-1',
      deckId,
      title: 'Original Card',
      body: 'Body text',
      orderIndex: 0,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01')
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({ user: { uid: 'u1', email: 't@example.com' }, loading: false })
    mockUseCards.mockReturnValue({ cards, loading: false, error: null })
    mockUseCardOperations.mockReturnValue({
      createCard: vi.fn(),
      updateCard: vi.fn(),
      deleteCard: vi.fn(),
      moveCardUp: vi.fn(),
      moveCardDown: vi.fn(),
      reorderByDrag: vi.fn(),
      duplicateCard: vi.fn(),
      loading: false,
      error: null
    })
  })

  it('renders a duplicate button for each card', async () => {
    render(<CardScreen deckId={deckId} />)
    await waitFor(() => {
      expect(screen.getByLabelText(/duplicate card-1/i)).toBeInTheDocument()
    })
  })

  it('calls duplicateCard with deckId and source card when duplicate button clicked', async () => {
    const duplicateSpy = vi.fn()
    mockUseCardOperations.mockReturnValue({
      createCard: vi.fn(),
      updateCard: vi.fn(),
      deleteCard: vi.fn(),
      moveCardUp: vi.fn(),
      moveCardDown: vi.fn(),
      reorderByDrag: vi.fn(),
      duplicateCard: duplicateSpy,
      loading: false,
      error: null
    })

    render(<CardScreen deckId={deckId} />)

    const dupButton = await screen.findByLabelText(/duplicate card-1/i)
    fireEvent.click(dupButton)

    await waitFor(() => {
      expect(duplicateSpy).toHaveBeenCalledTimes(1)
    })
    // Expect called with deckId and object having id 'card-1'
    const callArgs = duplicateSpy.mock.calls[0]
    expect(callArgs[0]).toBe(deckId)
    expect(callArgs[1]).toMatchObject({ id: 'card-1', title: 'Original Card' })
  })
})
