import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CardScreen from '../../../features/cards/CardScreen'
import type { Card } from '../../../types'

const mockUseCards = vi.hoisted(() => vi.fn())
const mockUseCardOperations = vi.hoisted(() => vi.fn())
const mockUseAuth = vi.hoisted(() => vi.fn())

vi.mock('../../../hooks/useCards', () => ({ useCards: mockUseCards }))
vi.mock('../../../hooks/useCardOperations', () => ({ useCardOperations: mockUseCardOperations }))
vi.mock('../../../providers/AuthProvider', () => ({ useAuth: mockUseAuth }))

describe('CardScreen Filters (Favorites / Archived)', () => {
  const deckId = 'deck-filters'
  const baseCards: Card[] = [
    {
      id: 'card-1',
      deckId,
      title: 'Active Regular',
      body: 'Body 1',
      orderIndex: 0,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      favorite: false,
      archived: false
    },
    {
      id: 'card-2',
      deckId,
      title: 'Active Favorite',
      body: 'Body 2',
      orderIndex: 1,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      favorite: true,
      archived: false
    },
    {
      id: 'card-3',
      deckId,
      title: 'Archived Regular',
      body: 'Body 3',
      orderIndex: 2,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      favorite: false,
      archived: true
    },
    {
      id: 'card-4',
      deckId,
      title: 'Archived Favorite',
      body: 'Body 4',
      orderIndex: 3,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      favorite: true,
      archived: true
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  // Ensure persistence from prior tests (localStorage) does not leak and affect expectations
  localStorage.clear()
    mockUseAuth.mockReturnValue({ user: { uid: 'u1' }, loading: false })
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

  it('hides archived cards by default', () => {
    mockUseCards.mockReturnValue({ cards: baseCards, loading: false, error: null })
    render(<CardScreen deckId={deckId} />)

    expect(screen.getByText('Active Regular')).toBeInTheDocument()
    expect(screen.getByText('Active Favorite')).toBeInTheDocument()
    expect(screen.queryByText('Archived Regular')).not.toBeInTheDocument()
    expect(screen.queryByText('Archived Favorite')).not.toBeInTheDocument()
  })

  it('shows archived cards after toggling archived visibility', () => {
    mockUseCards.mockReturnValue({ cards: baseCards, loading: false, error: null })
    render(<CardScreen deckId={deckId} />)

    const toggleArchivedBtn = screen.getByRole('button', { name: /toggle archived visibility/i })
    fireEvent.click(toggleArchivedBtn)

    expect(screen.getByText('Archived Regular')).toBeInTheDocument()
    expect(screen.getByText('Archived Favorite')).toBeInTheDocument()
  })

  it('filters to favorites only when favorites toggle enabled', () => {
    mockUseCards.mockReturnValue({ cards: baseCards, loading: false, error: null })
    render(<CardScreen deckId={deckId} />)

    const toggleFavoritesBtn = screen.getByRole('button', { name: /toggle favorites filter/i })
    fireEvent.click(toggleFavoritesBtn)

    expect(screen.getByText('Active Favorite')).toBeInTheDocument()
    // Archived favorite still hidden because archived hidden by default
    expect(screen.queryByText('Archived Favorite')).not.toBeInTheDocument()
    expect(screen.queryByText('Active Regular')).not.toBeInTheDocument()
  })

  it('combines favorites + show archived to display archived favorites', () => {
    mockUseCards.mockReturnValue({ cards: baseCards, loading: false, error: null })
    render(<CardScreen deckId={deckId} />)

    const toggleFavoritesBtn = screen.getByRole('button', { name: /toggle favorites filter/i })
    const toggleArchivedBtn = screen.getByRole('button', { name: /toggle archived visibility/i })

    fireEvent.click(toggleFavoritesBtn)
    fireEvent.click(toggleArchivedBtn)

    expect(screen.getByText('Active Favorite')).toBeInTheDocument()
    expect(screen.getByText('Archived Favorite')).toBeInTheDocument()
    // Non-favorite cards excluded even though archived shown
    expect(screen.queryByText('Active Regular')).not.toBeInTheDocument()
    expect(screen.queryByText('Archived Regular')).not.toBeInTheDocument()
  })
})
