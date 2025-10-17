import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CardScreen from '../../../features/cards/CardScreen'
import type { Card } from '../../../types'

const mockUseCards = vi.hoisted(() => vi.fn())
const mockUseCardOperations = vi.hoisted(() => vi.fn())
const mockUseAuth = vi.hoisted(() => vi.fn())

// Firestore snapshot functions
const mockSaveOrderSnapshot = vi.hoisted(() => vi.fn())
const mockGetOrderSnapshots = vi.hoisted(() => vi.fn())

vi.mock('../../../hooks/useCards', () => ({ useCards: mockUseCards }))
vi.mock('../../../hooks/useCardOperations', () => ({ useCardOperations: mockUseCardOperations }))
vi.mock('../../../providers/AuthProvider', () => ({ useAuth: mockUseAuth }))
vi.mock('../../../firebase/firestore', () => ({
  saveOrderSnapshot: mockSaveOrderSnapshot,
  getOrderSnapshots: mockGetOrderSnapshots,
  shuffleArray: (arr: any[]) => arr, // will override in implementation test when needed
}))

describe('CardScreen - Shuffle / Collapse-Expand / Order Snapshots (TDD New Features)', () => {
  const deckId = 'deck-new-features'
  const cards: Card[] = [
    { id: 'c1', deckId, title: 'First', body: 'First body content', orderIndex: 0, createdAt: new Date(), updatedAt: new Date() },
    { id: 'c2', deckId, title: 'Second', body: 'Second body content', orderIndex: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: 'c3', deckId, title: 'Third', body: 'Third body content', orderIndex: 2, createdAt: new Date(), updatedAt: new Date() },
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
    mockSaveOrderSnapshot.mockResolvedValue({ success: true, data: 'snap1' })
    mockGetOrderSnapshots.mockResolvedValue({ success: true, data: [ { id: 'snap1', deckId, name: 'Baseline', cardOrder: ['c3','c1','c2'], createdAt: new Date() } ] })
  })

  it('shuffles cards locally without calling reorder persistence', () => {
    render(<CardScreen deckId={deckId} />)
    const before = screen.getAllByTestId(/card-item-/).map(el => el.textContent)
    const shuffleBtn = screen.getByRole('button', { name: /shuffle cards/i })
    fireEvent.click(shuffleBtn)
    const after = screen.getAllByTestId(/card-item-/).map(el => el.textContent)
    // Order should differ (non-deterministic; allow rare collision by checking not strictly equal)
    expect(after.join('|')).not.toBe(before.join('|'))
    // Ensure no reorder persistence called
    expect(mockUseCardOperations().reorderByDrag).not.toHaveBeenCalled()
  })

  it('expands and collapses all cards via global controls', () => {
    render(<CardScreen deckId={deckId} />)
    const expandBtn = screen.getByRole('button', { name: /expand all/i })
    const collapseBtn = screen.getByRole('button', { name: /collapse all/i })

    fireEvent.click(expandBtn)
    // Bodies should now show full content (look for a body substring that is truncated when collapsed)
    expect(screen.getByText('First body content')).toBeInTheDocument()
    expect(screen.getByText('Second body content')).toBeInTheDocument()

    fireEvent.click(collapseBtn)
    // After collapse we expect the truncated indicator or absence of full body text
    expect(screen.queryByText('First body content')).not.toBeInTheDocument()
  })

  it('saves order snapshot and loads snapshot applying new order', async () => {
    // mock prompt
    const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('Baseline')
    render(<CardScreen deckId={deckId} />)
    const saveBtn = screen.getByRole('button', { name: /save order snapshot/i })
    fireEvent.click(saveBtn)
    expect(mockSaveOrderSnapshot).toHaveBeenCalledTimes(1)
    const loadBtn = screen.getByRole('button', { name: /load snapshot/i })
    fireEvent.click(loadBtn)
    // After loading snapshot, first card in UI should be the snapshot first id (c3 -> title Third)
    const firstTitle = screen.getAllByTestId(/card-item-/)[0]
    expect(firstTitle).toHaveTextContent('Third')
    promptSpy.mockRestore()
  })
})
