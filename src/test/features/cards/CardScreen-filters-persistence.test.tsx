import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import CardScreen from '../../../features/cards/CardScreen'
import type { Card } from '../../../types'

const mockUseCards = vi.hoisted(() => vi.fn())
const mockUseCardOperations = vi.hoisted(() => vi.fn())
const mockUseAuth = vi.hoisted(() => vi.fn())

vi.mock('../../../hooks/useCards', () => ({ useCards: mockUseCards }))
vi.mock('../../../hooks/useCardOperations', () => ({ useCardOperations: mockUseCardOperations }))
vi.mock('../../../providers/AuthProvider', () => ({ useAuth: mockUseAuth }))

describe('CardScreen Filter Persistence & Accessibility', () => {
  const deckId = 'deck-filters-persist'
  const cards: Card[] = [
    { id: 'c1', deckId, title: 'Alpha', body: 'One', orderIndex: 0, createdAt: new Date(), updatedAt: new Date(), favorite: true, archived: false },
    { id: 'c2', deckId, title: 'Beta', body: 'Two', orderIndex: 1, createdAt: new Date(), updatedAt: new Date(), favorite: false, archived: true }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    cleanup()
    localStorage.clear()
    mockUseAuth.mockReturnValue({ user: { uid: 'u1' }, loading: false })
    mockUseCards.mockReturnValue({ cards, loading: false, error: null })
    mockUseCardOperations.mockReturnValue({
      createCard: vi.fn(), updateCard: vi.fn(), deleteCard: vi.fn(), moveCardUp: vi.fn(), moveCardDown: vi.fn(),
      reorderByDrag: vi.fn(), duplicateCard: vi.fn(), toggleFavorite: vi.fn(), archiveCard: vi.fn(), unarchiveCard: vi.fn(),
      loading: false, error: null
    })
  })

  it('restores prior toggle states from localStorage (deck-scoped) on initial render', () => {
    localStorage.setItem(`cardFilters.${deckId}.showFavoritesOnly`, 'true')
    localStorage.setItem(`cardFilters.${deckId}.showArchived`, 'true')

    render(<CardScreen deckId={deckId} />)

    // Favorites only ON should hide non-favorite even though archived show is ON
    expect(screen.queryByText('Beta')).not.toBeInTheDocument()
    // Archived favorite card would appear if existed; ensure archived visibility toggle reflected aria-pressed state
    const favoritesBtn = screen.getByRole('button', { name: /toggle favorites filter/i })
    const archivedBtn = screen.getByRole('button', { name: /toggle archived visibility/i })
    expect(favoritesBtn).toHaveAttribute('aria-pressed', 'true')
    expect(archivedBtn).toHaveAttribute('aria-pressed', 'true')
  })

  it('persists toggle changes to localStorage using deck-scoped keys', () => {
    render(<CardScreen deckId={deckId} />)
    const favoritesBtn = screen.getByRole('button', { name: /toggle favorites filter/i })
    const archivedBtn = screen.getByRole('button', { name: /toggle archived visibility/i })

    fireEvent.click(favoritesBtn)
    fireEvent.click(archivedBtn)

  expect(localStorage.getItem(`cardFilters.${deckId}.showFavoritesOnly`)).toBe('true')
  expect(localStorage.getItem(`cardFilters.${deckId}.showArchived`)).toBe('true')
  // Old global keys should remain unset
  expect(localStorage.getItem('cardFilters.showFavoritesOnly')).toBeNull()
  expect(localStorage.getItem('cardFilters.showArchived')).toBeNull()
  })

  it('reflects current toggle state with aria-pressed for accessibility', () => {
    render(<CardScreen deckId={deckId} />)
    const favoritesBtn = screen.getByRole('button', { name: /toggle favorites filter/i })
    expect(favoritesBtn).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(favoritesBtn)
    expect(favoritesBtn).toHaveAttribute('aria-pressed', 'true')
  })
})
