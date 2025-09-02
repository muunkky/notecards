import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { Card } from '../../../types'

const mockUseCards = vi.hoisted(() => vi.fn())
const mockUseCardOperations = vi.hoisted(() => vi.fn())
const mockUseAuth = vi.hoisted(() => vi.fn())

// Snapshot functions
const mockSaveOrderSnapshot = vi.hoisted(() => vi.fn())
const mockGetOrderSnapshots = vi.hoisted(() => vi.fn())
const mockDeleteOrderSnapshot = vi.hoisted(() => vi.fn())
const mockUpdateOrderSnapshotName = vi.hoisted(() => vi.fn())

vi.mock('../../../hooks/useCards', () => ({ useCards: mockUseCards }))
vi.mock('../../../hooks/useCardOperations', () => ({ useCardOperations: mockUseCardOperations }))
vi.mock('../../../providers/AuthProvider', () => ({ useAuth: mockUseAuth }))
vi.mock('../../../firebase/firestore', () => ({
  saveOrderSnapshot: mockSaveOrderSnapshot,
  getOrderSnapshots: mockGetOrderSnapshots,
  deleteOrderSnapshot: mockDeleteOrderSnapshot,
  updateOrderSnapshotName: mockUpdateOrderSnapshotName,
  shuffleArray: (a: any[]) => a,
}))

import CardScreen from '../../../features/cards/CardScreen'

describe('CardScreen - Snapshot management (rename/delete)', () => {
  const deckId = 'deck-snap-mgmt'
  const cards: Card[] = [
    { id: 'c1', deckId, title: 'A', body: 'A body', orderIndex: 0, createdAt: new Date(), updatedAt: new Date() },
    { id: 'c2', deckId, title: 'B', body: 'B body', orderIndex: 1, createdAt: new Date(), updatedAt: new Date() },
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
      { id: 's1', deckId, name: 'Baseline', cardOrder: ['c1','c2'], createdAt: new Date() },
      { id: 's2', deckId, name: 'Alt', cardOrder: ['c2','c1'], createdAt: new Date() },
    ] })
    mockUpdateOrderSnapshotName.mockResolvedValue({ success: true })
    mockDeleteOrderSnapshot.mockResolvedValue({ success: true })
  })

  it('renames a snapshot and updates UI list', async () => {
    const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('Renamed Name')
    render(<CardScreen deckId={deckId} />)
    fireEvent.click(screen.getByRole('button', { name: /load snapshot/i }))
    const renameBtn = await screen.findByRole('button', { name: /rename snapshot baseline/i })
    fireEvent.click(renameBtn)
    expect(mockUpdateOrderSnapshotName).toHaveBeenCalledWith(deckId, 's1', 'Renamed Name')
    // After rename, an apply button with new name should appear
    const renamedApply = await screen.findByRole('button', { name: /apply snapshot renamed name/i })
    expect(renamedApply).toBeInTheDocument()
    promptSpy.mockRestore()
  })

  it('deletes a snapshot and removes it from UI list', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<CardScreen deckId={deckId} />)
    fireEvent.click(screen.getByRole('button', { name: /load snapshot/i }))
    const deleteBtn = await screen.findByRole('button', { name: /delete snapshot alt/i })
    fireEvent.click(deleteBtn)
    expect(mockDeleteOrderSnapshot).toHaveBeenCalledWith(deckId, 's2')
    // Alt apply snapshot button should disappear
    expect(screen.queryByRole('button', { name: /apply snapshot alt/i })).toBeNull()
    confirmSpy.mockRestore()
  })
})
