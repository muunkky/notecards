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

describe('CardScreen Archive UI', () => {
  const deckId = 'deck-arch-ui'
  const baseCard: Card = {
    id: 'card-1',
    deckId,
    title: 'Archivable',
    body: 'Body',
    orderIndex: 0,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    favorite: false,
    archived: false
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
      archiveCard: vi.fn(),
      unarchiveCard: vi.fn(),
      loading: false,
      error: null
    })
  })

  it('renders archive button for active card', async () => {
    render(<CardScreen deckId={deckId} />)
    await waitFor(() => {
      expect(screen.getByLabelText(/archive card-1/i)).toBeInTheDocument()
    })
  })

  it('calls archiveCard when archive clicked', async () => {
    const archiveSpy = vi.fn()
    mockUseCardOperations.mockReturnValue({
      createCard: vi.fn(),
      updateCard: vi.fn(),
      deleteCard: vi.fn(),
      moveCardUp: vi.fn(),
      moveCardDown: vi.fn(),
      reorderByDrag: vi.fn(),
      duplicateCard: vi.fn(),
      toggleFavorite: vi.fn(),
      archiveCard: archiveSpy,
      unarchiveCard: vi.fn(),
      loading: false,
      error: null
    })
    render(<CardScreen deckId={deckId} />)
    const btn = await screen.findByLabelText(/archive card-1/i)
    fireEvent.click(btn)
    await waitFor(() => expect(archiveSpy).toHaveBeenCalledTimes(1))
    const args = archiveSpy.mock.calls[0]
    expect(args[0]).toMatchObject({ id: 'card-1', archived: false })
  })
})
