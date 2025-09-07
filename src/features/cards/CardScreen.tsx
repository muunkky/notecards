import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { useCards } from '../../hooks/useCards'
import { useCardOperations } from '../../hooks/useCardOperations'
import type { Card } from '../../types'
import { shuffleArray, saveOrderSnapshot, getOrderSnapshots, updateOrderSnapshotName, deleteOrderSnapshot } from '../../firebase/firestore'

// TDD: Connect our CardScreen to real Firestore data via useCards hook

interface CardListItemProps {
  card: Card
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate?: (id: string) => void
  onToggleFavorite?: (id: string) => void
  onArchive?: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  canMoveUp: boolean
  canMoveDown: boolean
  isReordering: boolean
  expandedOverride?: boolean | null
}

interface CardScreenProps {
  deckId: string
  deckTitle?: string | null
  onBack?: () => void
}

// TDD: Implement CardListItem component first
export const CardListItem: React.FC<CardListItemProps> = ({ 
  card, 
  onEdit, 
  onDelete, 
  onDuplicate,
  onToggleFavorite,
  onArchive,
  onMoveUp, 
  onMoveDown, 
  canMoveUp, 
  canMoveDown, 
  isReordering,
  expandedOverride = null
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // Respond to bulk expand/collapse overrides
  React.useEffect(() => {
    if (expandedOverride === true) setIsExpanded(true)
    else if (expandedOverride === false) setIsExpanded(false)
  }, [expandedOverride])

  const truncateBody = (body: string, maxLength: number = 120) => {
    if (body.length <= maxLength) return body
    return body.substring(0, maxLength) + '...'
  }

  // Error handling wrapper for button actions
  const safeHandleClick = (callback: () => void) => {
    try {
      callback()
    } catch (error) {
      console.error('Button action failed:', error)
    }
  }

  // Keyboard event handler for accessibility
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      e.stopPropagation()
      safeHandleClick(action)
    }
  }

  return (
    <div 
      data-testid={`card-item-${card.id}`}
      className="bg-white border border-gray-200 rounded-lg p-6 hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:shadow-md transform hover:-translate-y-1"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 leading-tight">
            {card.title}
          </h3>
          <div className="text-gray-700 leading-relaxed">
            {isExpanded ? (
              <div className="whitespace-pre-wrap">{card.body || 'No description'}</div>
            ) : (
              <div>
                {truncateBody(card.body || 'No description')}
                {!isExpanded && card.body && card.body.length > 120 && (
                  <span className="text-blue-600 font-medium ml-2">Click to expand...</span>
                )}
              </div>
            )}
          </div>
          {isExpanded && (
            <div className="mt-3 text-sm text-gray-500">
              Created: {card.createdAt.toLocaleDateString()}
              {card.updatedAt.getTime() !== card.createdAt.getTime() && (
                <span className="ml-4">
                  Updated: {card.updatedAt.toLocaleDateString()}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-1">
          {/* Reorder Buttons */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              safeHandleClick(() => onMoveUp(card.id))
            }}
            onKeyDown={(e) => handleKeyDown(e, () => onMoveUp(card.id))}
            disabled={!canMoveUp || isReordering}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              canMoveUp && !isReordering
                ? 'text-gray-400 hover:text-blue-600 hover:bg-blue-100 active:bg-blue-200'
                : 'text-gray-200 cursor-not-allowed'
            } ${isReordering ? 'opacity-50' : ''}`}
            aria-label={`move "${card.title}" up`}
            aria-disabled={(!canMoveUp || isReordering) ? 'true' : undefined}
            title="Move card up"
          >
            <span className="text-lg">⬆️</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              safeHandleClick(() => onMoveDown(card.id))
            }}
            onKeyDown={(e) => handleKeyDown(e, () => onMoveDown(card.id))}
            disabled={!canMoveDown || isReordering}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              canMoveDown && !isReordering
                ? 'text-gray-400 hover:text-blue-600 hover:bg-blue-100 active:bg-blue-200'
                : 'text-gray-200 cursor-not-allowed'
            } ${isReordering ? 'opacity-50' : ''}`}
            aria-label={`move "${card.title}" down`}
            aria-disabled={(!canMoveDown || isReordering) ? 'true' : undefined}
            title="Move card down"
          >
            <span className="text-lg">⬇️</span>
          </button>
          
          {/* Existing Edit/Delete Buttons - These should NOT be disabled during reordering */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              safeHandleClick(() => onEdit(card.id))
            }}
            onKeyDown={(e) => handleKeyDown(e, () => onEdit(card.id))}
            className="p-2 rounded-lg transition-colors duration-200 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
            aria-label={`edit ${card.id}`}
            title="Edit card"
          >
            <span className="text-lg">✏️</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              safeHandleClick(() => onDelete(card.id))
            }}
            onKeyDown={(e) => handleKeyDown(e, () => onDelete(card.id))}
            className="p-2 rounded-lg transition-colors duration-200 text-gray-400 hover:text-red-600 hover:bg-red-50"
            aria-label={`delete ${card.id}`}
            title="Delete card"
          >
            <span className="text-lg">🗑️</span>
          </button>
          {onDuplicate && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                safeHandleClick(() => onDuplicate(card.id))
              }}
              onKeyDown={(e) => handleKeyDown(e, () => onDuplicate(card.id))}
              className="p-2 rounded-lg transition-colors duration-200 text-gray-400 hover:text-green-600 hover:bg-green-50"
              aria-label={`duplicate ${card.id}`}
              title="Duplicate card"
            >
              <span className="text-lg">📄</span>
            </button>
          )}
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                safeHandleClick(() => onToggleFavorite(card.id))
              }}
              onKeyDown={(e) => handleKeyDown(e, () => onToggleFavorite(card.id))}
              className={`p-2 rounded-lg transition-colors duration-200 ${card.favorite ? 'text-yellow-400 hover:text-yellow-500 hover:bg-yellow-50' : 'text-gray-300 hover:text-yellow-400 hover:bg-yellow-50'}`}
              aria-label={`favorite ${card.id}`}
              title={card.favorite ? 'Unfavorite card' : 'Favorite card'}
            >
              <span className="text-lg">⭐</span>
            </button>
          )}
          {onArchive && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                safeHandleClick(() => onArchive(card.id))
              }}
              onKeyDown={(e) => handleKeyDown(e, () => onArchive(card.id))}
              className="p-2 rounded-lg transition-colors duration-200 text-gray-300 hover:text-purple-600 hover:bg-purple-50"
              aria-label={`${card.archived ? 'unarchive' : 'archive'} ${card.id}`}
              title={card.archived ? 'Unarchive card' : 'Archive card'}
            >
              <span className="text-lg">{card.archived ? '📦' : '🗃️'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// TDD: Implement CardScreen component to make tests pass
export default function CardScreen({ deckId, deckTitle, onBack }: CardScreenProps) {
  const { cards, loading, error } = useCards(deckId)
  const {
    createCard,
    updateCard,
    deleteCard,
    moveCardUp,
    moveCardDown,
    reorderByDrag,
  duplicateCard,
  toggleFavorite,
  archiveCard,
  unarchiveCard,
    loading: operationLoading,
    error: operationError
  } = useCardOperations()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [newCardBody, setNewCardBody] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')
  
  // TDD Phase 2A.1: Advanced Card Filtering State
  const [searchQuery, setSearchQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false) // Hidden by default
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  // Local view state (shuffle / snapshot application) separate from canonical cards
  const [cardsView, setCardsView] = useState<Card[]>([])
  const [bulkExpandState, setBulkExpandState] = useState<null | boolean>(null)
  const [snapshots, setSnapshots] = useState<{ id: string, name: string, cardOrder: string[] }[]>([])
  const [snapshotLoading, setSnapshotLoading] = useState(false)

  // Sync cards from source when underlying data changes (unless a snapshot or shuffle has different ordering requirement) – for simplicity always resync when length changes
  useEffect(() => {
    setCardsView(cards)
  }, [cards])

  // Deck-scoped persisted filter preferences (one-time load + reactive save)
  useEffect(() => {
    try {
      const favStored = localStorage.getItem(`cardFilters.${deckId}.showFavoritesOnly`)
      const archStored = localStorage.getItem(`cardFilters.${deckId}.showArchived`)
      if (favStored === 'true') setShowFavoritesOnly(true)
      if (archStored === 'true') setShowArchived(true)
    } catch { /* ignore storage errors */ }
  }, [deckId])

  // Persist changes to deck-scoped keys ONLY (leave any legacy global keys untouched to avoid stale overrides)
  useEffect(() => {
    try { localStorage.setItem(`cardFilters.${deckId}.showFavoritesOnly`, String(showFavoritesOnly)) } catch { /* ignore */ }
  }, [showFavoritesOnly, deckId])
  useEffect(() => {
    try { localStorage.setItem(`cardFilters.${deckId}.showArchived`, String(showArchived)) } catch { /* ignore */ }
  }, [showArchived, deckId])

  // TDD Phase 2A.1: Filter cards based on favorites / archived / search
  const filteredCards = React.useMemo(() => {
    let working = [...cardsView]

    if (!showArchived) {
      working = working.filter(c => !c.archived)
    }

    if (showFavoritesOnly) {
      working = working.filter(c => c.favorite)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      working = working.filter(card => 
        card.title.toLowerCase().includes(query) ||
        card.body.toLowerCase().includes(query)
      )
    }

    return working
  }, [cards, cardsView, showArchived, showFavoritesOnly, searchQuery])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading cards...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error loading cards: {error}</div>
      </div>
    )
  }

  const handleCreateCard = async () => {
    if (newCardTitle.trim()) {
      try {
  await createCard(deckId, newCardTitle.trim(), newCardBody.trim())
        console.log('Successfully created card:', newCardTitle)
        setNewCardTitle('')
        setNewCardBody('')
        setShowCreateModal(false)
      } catch (error) {
        console.error('Failed to create card:', error)
      }
    }
  }

  const handleEditCard = async () => {
    if (selectedCard && editTitle.trim()) {
      try {
  await updateCard(selectedCard.id, {
          title: editTitle.trim(),
          body: editBody.trim()
        })
        console.log('Successfully updated card:', selectedCard.id)
        setEditTitle('')
        setEditBody('')
        setShowEditModal(false)
        setSelectedCard(null)
      } catch (error) {
        console.error('Failed to update card:', error)
      }
    }
  }

  const handleDeleteCard = async () => {
    if (selectedCard) {
      try {
  await deleteCard(selectedCard.id, deckId)
        console.log('Successfully deleted card:', selectedCard.id)
        setShowDeleteModal(false)
        setSelectedCard(null)
      } catch (error) {
        console.error('Failed to delete card:', error)
      }
    }
  }

  const openEditModal = (card: Card) => {
    setSelectedCard(card)
    setEditTitle(card.title)
    setEditBody(card.body)
    setShowEditModal(true)
  }

  const openDeleteModal = (card: Card) => {
    setSelectedCard(card)
    setShowDeleteModal(true)
  }

  const handleCardEdit = (cardId: string) => {
    const card = cards.find(c => c.id === cardId)
    if (card) {
      openEditModal(card)
    }
  }

  const handleCardDelete = (cardId: string) => {
    const card = cards.find(c => c.id === cardId)
    if (card) {
      openDeleteModal(card)
    }
  }

  const handleCardDuplicate = async (cardId: string) => {
    const card = cards.find(c => c.id === cardId)
    if (!card) return
    try {
      await duplicateCard(deckId, card)
      console.log('Duplicated card:', cardId)
    } catch (err) {
      console.error('Failed to duplicate card:', err)
    }
  }

  const handleToggleFavorite = async (cardId: string) => {
    const card = cards.find(c => c.id === cardId)
    if (!card) return
    try {
      await toggleFavorite(card)
      console.log('Toggled favorite:', cardId)
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
    }
  }

  const handleArchive = async (cardId: string) => {
    const card = cards.find(c => c.id === cardId)
    if (!card) return
    try {
      if (card.archived) {
        await unarchiveCard(card)
        console.log('Unarchived card:', cardId)
      } else {
        await archiveCard(card)
        console.log('Archived card:', cardId)
      }
    } catch (err) {
      console.error('Archive/unarchive failed:', err)
    }
  }

  const handleMoveCardUp = async (cardId: string) => {
    try {
      await moveCardUp(cardId, filteredCards)
      console.log('Successfully moved card up:', cardId)
    } catch (error) {
      console.error('Failed to move card up:', error)
    }
  }

  const handleMoveCardDown = async (cardId: string) => {
    try {
      await moveCardDown(cardId, filteredCards)
      console.log('Successfully moved card down:', cardId)
    } catch (error) {
      console.error('Failed to move card down:', error)
    }
  }

  // Drag-and-drop handler
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return
    // Disable drag reorder when search filter active (to avoid inconsistent index mapping)
    if (searchQuery.trim()) return
    try {
      await reorderByDrag(result.source.index, result.destination.index, cards)
    } catch (err) {
      console.error('Drag reorder failed:', err)
    }
  }

  // Shuffle local order (non-persistent)
  const handleShuffle = () => {
    setCardsView(cv => shuffleArray(cv))
  }

  const handleExpandAll = () => setBulkExpandState(true)
  const handleCollapseAll = () => setBulkExpandState(false)

  // Save snapshot (prompt for name); in tests window.prompt mocked
  const handleSaveSnapshot = async () => {
    try {
      const name = window.prompt('Snapshot name?')
      if (!name) return
      const order = cardsView.map(c => c.id)
      await saveOrderSnapshot(deckId, name, order)
    } catch (err) {
      console.error('Snapshot save failed', err)
    }
  }

  const handleLoadSnapshot = async () => {
    try {
      setSnapshotLoading(true)
      const res = await getOrderSnapshots(deckId)
      if (!res.success || !res.data) return
      setSnapshots(res.data.map(s => ({ id: s.id, name: s.name, cardOrder: s.cardOrder })))
      const first = res.data[0]
      if (first) {
        // Reorder local view according to snapshot
        const idToCard = new Map(cards.map(c => [c.id, c]))
        const ordered: Card[] = []
        first.cardOrder.forEach(id => { const c = idToCard.get(id); if (c) ordered.push(c) })
        // Append any missing (safety)
        cards.forEach(c => { if (!first.cardOrder.includes(c.id)) ordered.push(c) })
        setCardsView(ordered)
      }
    } catch (err) {
      console.error('Snapshot load failed', err)
    } finally {
      setSnapshotLoading(false)
    }
  }

  // Apply an already-fetched snapshot order (pure client-side reordering)
  const applySnapshot = (snapshot: { id: string, name: string, cardOrder: string[] }) => {
    try {
      const idToCard = new Map(cards.map(c => [c.id, c]))
      const ordered: Card[] = []
      snapshot.cardOrder.forEach(id => { const c = idToCard.get(id); if (c) ordered.push(c) })
      cards.forEach(c => { if (!snapshot.cardOrder.includes(c.id)) ordered.push(c) })
      setCardsView(ordered)
    } catch (err) {
      console.error('Apply snapshot failed', err)
    }
  }

  // Rename snapshot (prompt for new name)
  const handleRenameSnapshot = async (snapshotId: string) => {
    try {
      const snap = snapshots.find(s => s.id === snapshotId)
      if (!snap) return
      const newName = window.prompt('New snapshot name?', snap.name)
      if (!newName || newName.trim() === '' || newName.trim() === snap.name) return
      const res = await updateOrderSnapshotName(deckId, snapshotId, newName.trim())
      if (res.success) {
        setSnapshots(prev => prev.map(s => s.id === snapshotId ? { ...s, name: newName.trim() } : s))
      }
    } catch (err) {
      console.error('Rename snapshot failed', err)
    }
  }

  // Delete snapshot (confirm)
  const handleDeleteSnapshot = async (snapshotId: string) => {
    try {
      const snap = snapshots.find(s => s.id === snapshotId)
      if (!snap) return
      if (!window.confirm(`Delete snapshot "${snap.name}"?`)) return
      const res = await deleteOrderSnapshot(deckId, snapshotId)
      if (res.success) {
        setSnapshots(prev => prev.filter(s => s.id !== snapshotId))
      }
    } catch (err) {
      console.error('Delete snapshot failed', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Enhanced Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center text-white mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-blue-300 hover:text-blue-100 transition-colors duration-200"
            aria-label="Back to all decks"
          >
            <span className="mr-2 text-lg" aria-hidden="true">←</span>
            <span className="hover:underline">All Decks</span>
          </button>
          <span className="mx-3 text-gray-400 text-lg" aria-hidden="true">/</span>
          <span className="text-gray-300 font-medium">
            {deckTitle || 'Cards'}
          </span>
        </nav>

        {/* Enhanced Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {deckTitle ? `${deckTitle}` : 'Deck Cards'}
            </h1>
            <p className="text-gray-300">
              {filteredCards.length} {filteredCards.length === 1 ? 'card' : 'cards'}
              {searchQuery && (
                <span className="ml-2 text-blue-300">
                  {filteredCards.length !== cards.length && `(${cards.length} total)`}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
            aria-label="Create new card"
          >
            Create New Card
          </button>
        </header>

        {/* TDD Phase 2A.1: Advanced Search/Filter Bar + Filter Toggles */}
        <section aria-label="Card filters and search">
        {cards.length > 0 && (
          <div className="mb-6 space-y-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                aria-label="Toggle favorites filter"
                onClick={() => setShowFavoritesOnly(v => !v)}
                aria-pressed={showFavoritesOnly ? 'true' : 'false'}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border ${showFavoritesOnly ? 'bg-yellow-400 text-slate-900 border-yellow-500' : 'bg-white/10 text-yellow-300 border-yellow-500/30 hover:bg-white/20'}`}
              >
                {showFavoritesOnly ? '⭐ Favorites Only' : '☆ All Cards'}
              </button>
              <button
                type="button"
                aria-label="Toggle archived visibility"
                onClick={() => setShowArchived(v => !v)}
                aria-pressed={showArchived ? 'true' : 'false'}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border ${showArchived ? 'bg-purple-400 text-slate-900 border-purple-500' : 'bg-white/10 text-purple-300 border-purple-500/30 hover:bg-white/20'}`}
              >
                {showArchived ? '📦 Showing Archived' : '🗃️ Hide Archived'}
              </button>
              <button
                type="button"
                aria-label="Shuffle cards"
                onClick={handleShuffle}
                className="px-3 py-1 rounded-full text-sm font-medium transition-colors border bg-white/10 text-blue-300 border-blue-500/30 hover:bg-white/20"
              >
                🔀 Shuffle
              </button>
              <button
                type="button"
                aria-label="Expand all"
                onClick={handleExpandAll}
                className="px-3 py-1 rounded-full text-sm font-medium transition-colors border bg-white/10 text-green-300 border-green-500/30 hover:bg-white/20"
              >
                ⬇️ Expand All
              </button>
              <button
                type="button"
                aria-label="Collapse all"
                onClick={handleCollapseAll}
                className="px-3 py-1 rounded-full text-sm font-medium transition-colors border bg-white/10 text-red-300 border-red-500/30 hover:bg-white/20"
              >
                ⬆️ Collapse All
              </button>
              <button
                type="button"
                aria-label="Save order snapshot"
                onClick={handleSaveSnapshot}
                className="px-3 py-1 rounded-full text-sm font-medium transition-colors border bg-white/10 text-cyan-300 border-cyan-500/30 hover:bg-white/20"
              >
                💾 Save Snapshot
              </button>
              <button
                type="button"
                aria-label="Load snapshot"
                disabled={snapshotLoading}
                onClick={handleLoadSnapshot}
                className="px-3 py-1 rounded-full text-sm font-medium transition-colors border bg-white/10 text-cyan-300 border-cyan-500/30 hover:bg-white/20 disabled:opacity-40"
              >
                📂 Load Snapshot
              </button>
            </div>
            {/* Snapshot list (appears after loading) */}
            {snapshots.length > 0 && (
              <div className="flex flex-wrap gap-2" data-testid="snapshot-list">
                {snapshots.map(s => (
                  <div key={s.id} className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Apply snapshot ${s.name}`}
                      onClick={() => applySnapshot(s)}
                      className="px-2 py-1 rounded-full text-xs font-medium transition-colors border bg-white/10 text-cyan-200 border-cyan-500/30 hover:bg-white/20"
                    >
                      Apply Snapshot {s.name}
                    </button>
                    <button
                      type="button"
                      aria-label={`Rename snapshot ${s.name}`}
                      onClick={() => handleRenameSnapshot(s.id)}
                      className="px-2 py-1 rounded-full text-xs font-medium transition-colors border bg-white/10 text-amber-200 border-amber-500/30 hover:bg-white/20"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete snapshot ${s.name}`}
                      onClick={() => handleDeleteSnapshot(s.id)}
                      className="px-2 py-1 rounded-full text-xs font-medium transition-colors border bg-white/10 text-red-200 border-red-500/30 hover:bg-white/20"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400 text-lg">🔍</span>
              </div>
              <input
                type="text"
                placeholder="Search cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <span className="text-lg">✕</span>
                </button>
              )}
            </div>
          </div>
        )}
        </section>

        {/* Enhanced Card List */}
        <section aria-label="Card list" role="main">
  <div className="space-y-4">
          {cards.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📝</span>
              </div>
              <div className="text-white text-xl mb-4 font-medium">No cards yet</div>
              <div className="text-gray-300 mb-8 max-w-md mx-auto leading-relaxed">
                Start building your {deckTitle || 'deck'} by creating your first card. Add questions, notes, or any content you want to study.
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Create Your First Card
              </button>
            </div>
          ) : filteredCards.length === 0 ? (
            // TDD Phase 2A.1: No search results state
            <div className="text-center py-16">
              <div className="bg-white/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🔍</span>
              </div>
              <div className="text-white text-xl mb-4 font-medium">No cards match your search</div>
              <div className="text-gray-300 mb-8 max-w-md mx-auto leading-relaxed">
                Try a different search term or{' '}
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-blue-300 hover:text-blue-100 underline"
                >
                  clear your search
                </button>
                {' '}to see all cards.
              </div>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="card-list">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-4 ${snapshot.isDraggingOver ? 'bg-white/5 rounded-lg p-2 transition-colors' : ''}`}
                    data-testid="card-droppable"
                  >
                    {filteredCards.map((card, index) => {
                      // When filtering is active, disable drag interaction to avoid inconsistent reorders vs full list
                      const dragDisabled = !!searchQuery.trim()
                      return (
                        <Draggable key={card.id} draggableId={card.id} index={index} isDragDisabled={dragDisabled}>
                          {(dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              className={`animate-fadeIn ${dragSnapshot.isDragging ? 'ring-2 ring-blue-400' : ''}`}
                              style={{
                                ...dragProvided.draggableProps.style,
                                animationDelay: `${index * 50}ms`
                              }}
                              data-testid={`draggable-card-${card.id}`}
                            >
                              <CardListItem
                                card={card}
                                onEdit={handleCardEdit}
                                onDelete={handleCardDelete}
                                onDuplicate={handleCardDuplicate}
                                onToggleFavorite={handleToggleFavorite}
                                onMoveUp={handleMoveCardUp}
                                onMoveDown={handleMoveCardDown}
                                canMoveUp={index > 0}
                                canMoveDown={index < filteredCards.length - 1}
                                isReordering={operationLoading}
                                onArchive={handleArchive}
                              />
                            </div>
                          )}
                        </Draggable>
                      )
                    })}
                    {provided.placeholder}
                    {searchQuery.trim() && (
                      <div className="text-xs text-blue-300 mt-2" data-testid="drag-disabled-notice">
                        Drag-and-drop disabled while filtering. Clear search to reorder.
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
        </section>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4">Create New Card</h2>
              <input
                type="text"
                placeholder="Card title"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                autoFocus
              />
              <textarea
                placeholder="Card body (optional)"
                value={newCardBody}
                onChange={(e) => setNewCardBody(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 resize-none"
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewCardTitle('')
                    setNewCardBody('')
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCard}
                  disabled={!newCardTitle.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedCard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4">Edit Card</h2>
              <input
                type="text"
                placeholder="Card title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                autoFocus
              />
              <textarea
                placeholder="Card body"
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 resize-none"
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditTitle('')
                    setEditBody('')
                    setSelectedCard(null)
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditCard}
                  disabled={!editTitle.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedCard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4">Delete Card</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{selectedCard.title}"? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setSelectedCard(null)
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCard}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
