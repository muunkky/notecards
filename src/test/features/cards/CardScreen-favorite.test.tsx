import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CardScreen from '../../../features/cards/CardScreen'
import type { Card } from '../../../types'

const mockUseCards = vi.hoisted(() => vi.fn())
const mockUseCardOperations = vi.hoisted(() => vi.fn())
const mockUseAuth = vi.hoisted(() => vi.fn())

vi.mock('../../../hooks/useCards', () => ({ useCards: mockUseCards }))
vi.mock('../../../hooks/useCardOperations', () => ({ useCardOperations: mockUseCardOperations }))
vi.mock('../../../providers/AuthProvider', () => ({ useAuth: mockUseAuth }))

describe('CardScreen Favorite UI', () => {
  const deckId = 'deck-fav-ui'
  const baseCard: Card = {
    id: 'card-1',
    deckId,
    title: 'Fav Card',
    body: 'Body',
    orderIndex: 0,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    favorite: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({ user: { uid: 'u1' }, loading: false })
    mockUseCards.mockReturnValue({ cards: [baseCard], loading: false, error: null })
    mockUseCardOperations.mockReturnValue({
      createCard: vi.fn(),
      updateCard: vi.fn(),
      deleteCard: vi.fn(),
      moveCardUp: vi.fn(),
      moveCardDown: vi.fn(),
      reorderByDrag: vi.fn(),
      duplicateCard: vi.fn(),
      toggleFavorite: vi.fn(),
      loading: false,
      error: null
    })
  })

  it('renders favorite toggle button for each card', async () => {
    render(<CardScreen deckId={deckId} />)
    await waitFor(() => {
      expect(screen.getByLabelText(/favorite card-1/i)).toBeInTheDocument()
    })
  })

  it('calls toggleFavorite when favorite button clicked', async () => {
    const toggleSpy = vi.fn()
    mockUseCardOperations.mockReturnValue({
      createCard: vi.fn(),
      updateCard: vi.fn(),
      deleteCard: vi.fn(),
      moveCardUp: vi.fn(),
      moveCardDown: vi.fn(),
      reorderByDrag: vi.fn(),
      duplicateCard: vi.fn(),
      toggleFavorite: toggleSpy,
      loading: false,
      error: null
    })

    render(<CardScreen deckId={deckId} />)
    const favBtn = await screen.findByLabelText(/favorite card-1/i)
    fireEvent.click(favBtn)

    await waitFor(() => expect(toggleSpy).toHaveBeenCalledTimes(1))
    const args = toggleSpy.mock.calls[0]
    expect(args[0]).toMatchObject({ id: 'card-1', favorite: false })
  })
})
