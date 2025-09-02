import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { Card } from '../../../types'

const mockUseCards = vi.hoisted(() => vi.fn())
const mockUseCardOperations = vi.hoisted(() => vi.fn())
const mockUseAuth = vi.hoisted(() => vi.fn())

// Firestore snapshot functions
const mockSaveOrderSnapshot = vi.hoisted(() => vi.fn())
const mockGetOrderSnapshots = vi.hoisted(() => vi.fn())

// Place mocks BEFORE importing the component under test so they take effect
vi.mock('../../../hooks/useCards', () => ({ useCards: mockUseCards }))
vi.mock('../../../hooks/useCardOperations', () => ({ useCardOperations: mockUseCardOperations }))
vi.mock('../../../providers/AuthProvider', () => ({ useAuth: mockUseAuth }))
vi.mock('../../../firebase/firestore', () => ({
  saveOrderSnapshot: mockSaveOrderSnapshot,
  getOrderSnapshots: mockGetOrderSnapshots,
  shuffleArray: (arr: any[]) => arr, // noop for deterministic tests
}))

import CardScreen from '../../../features/cards/CardScreen'

describe('CardScreen - Snapshot selection UI', () => {
  const deckId = 'deck-snapshots'
  const cards: Card[] = [
    { id: 'c1', deckId, title: 'One', body: 'Body one', orderIndex: 0, createdAt: new Date(), updatedAt: new Date() },
    { id: 'c2', deckId, title: 'Two', body: 'Body two', orderIndex: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: 'c3', deckId, title: 'Three', body: 'Body three', orderIndex: 2, createdAt: new Date(), updatedAt: new Date() },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({ user: { uid: 'u1' }, loading: false })
    mockUseCards.mockReturnValue({ cards, loading: false, error: null })
    mockUseCardOperations.mockReturnValue({
      createCard: vi.fn(), updateCard: vi.fn(), deleteCard: vi.fn(),
      moveCardUp: vi.fn(), moveCardDown: vi.fn(), reorderByDrag: vi.fn(),
      duplicateCard: vi.fn(), toggleFavorite: vi.fn(), archiveCard: vi.fn(), unarchiveCard: vi.fn(),
      loading: false, error: null
    })
    mockGetOrderSnapshots.mockResolvedValue({ success: true, data: [
      { id: 's1', deckId, name: 'Baseline', cardOrder: ['c2','c3','c1'], createdAt: new Date() },
      { id: 's2', deckId, name: 'Alternate', cardOrder: ['c3','c1','c2'], createdAt: new Date() }
    ] })
  })

  it('lists snapshots after load and applies chosen snapshot order when a snapshot button is clicked', async () => {
    render(<CardScreen deckId={deckId} />)
    // Load snapshots (will also auto-apply the first one under current implementation)
    const loadBtn = screen.getByRole('button', { name: /load snapshot/i })
    fireEvent.click(loadBtn)

    // Expect snapshot buttons rendered
    const baselineBtn = await screen.findByRole('button', { name: /apply snapshot baseline/i })
    const altBtn = await screen.findByRole('button', { name: /apply snapshot alternate/i })
    expect(baselineBtn).toBeInTheDocument()
    expect(altBtn).toBeInTheDocument()

    // Click Alternate snapshot to apply its order (c3 first -> title Three)
    fireEvent.click(altBtn)
    const firstCard = screen.getAllByTestId(/card-item-/)[0]
    expect(firstCard).toHaveTextContent('Three')
  })
})
