import { useState } from 'react'
import { Card } from '../types'
import { moveCardInDeck, createCardInDeck, updateCardInDeck, deleteCardFromDeck, reorderCards } from '../firebase/firestore'

export interface UseCardOperationsResult {
  createCard: (deckId: string, title: string, content: string) => Promise<void>
  updateCard: (cardId: string, updates: Partial<Card>) => Promise<void>
  deleteCard: (cardId: string, deckId: string) => Promise<void>
  moveCardUp: (cardId: string, cards: Card[]) => Promise<void>
  moveCardDown: (cardId: string, cards: Card[]) => Promise<void>
  reorderByDrag: (sourceIndex: number, destinationIndex: number, cards: Card[]) => Promise<void>
  duplicateCard: (deckId: string, sourceCard: Card) => Promise<void>
  toggleFavorite: (card: Card) => Promise<void>
  archiveCard: (card: Card) => Promise<void>
  unarchiveCard: (card: Card) => Promise<void>
  loading: boolean
  error: string | null
}

export function useCardOperations(): UseCardOperationsResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createCard = async (deckId: string, title: string, content: string): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      await createCardInDeck(deckId, title, content)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create card'
      setError(errorMessage)
      console.error('Failed to create card:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateCard = async (cardId: string, updates: Partial<Card>): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      await updateCardInDeck(cardId, updates)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update card'
      setError(errorMessage)
      console.error('Failed to update card:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteCard = async (cardId: string, deckId: string): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      await deleteCardFromDeck(cardId, deckId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete card'
      setError(errorMessage)
      console.error('Failed to delete card:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const moveCardUp = async (cardId: string, cards: Card[]): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      console.log('Successfully moved card up:', cardId)
      await moveCardInDeck(cardId, cards, 'up')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to move card up'
      setError(errorMessage)
      console.error('Failed to move card up:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const moveCardDown = async (cardId: string, cards: Card[]): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      console.log('Successfully moved card down:', cardId)
      await moveCardInDeck(cardId, cards, 'down')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to move card down'
      setError(errorMessage)
      console.error('Failed to move card down:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Generic drag-and-drop reorder (sourceIndex -> destinationIndex) operating on the full cards array
  const reorderByDrag = async (sourceIndex: number, destinationIndex: number, cards: Card[]): Promise<void> => {
    // Ignore no-op
    if (sourceIndex === destinationIndex) return
    if (sourceIndex < 0 || destinationIndex < 0 || sourceIndex >= cards.length || destinationIndex >= cards.length) return
    setLoading(true)
    setError(null)
    try {
      const deckId = cards[0]?.deckId
      if (!deckId) throw new Error('Deck ID not found for drag reorder')
      const reordered = [...cards]
      const [moved] = reordered.splice(sourceIndex, 1)
      reordered.splice(destinationIndex, 0, moved)
      const updates = reordered.map((c, idx) => ({ cardId: c.id, orderIndex: idx }))
      const res = await reorderCards(deckId, updates)
      if (!res.success) throw new Error(res.error?.message || 'Failed to reorder cards by drag')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reorder cards by drag'
      setError(errorMessage)
      console.error('Failed to reorder cards by drag:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Duplicate a card placing the copy at end of deck (simple baseline implementation)
  const duplicateCard = async (deckId: string, sourceCard: Card): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const newTitle = `${sourceCard.title} (Copy)`
      await createCardInDeck(deckId, newTitle, sourceCard.body)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate card'
      setError(errorMessage)
      console.error('Failed to duplicate card:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async (card: Card): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      await updateCardInDeck(card.id, { deckId: card.deckId, favorite: !card.favorite })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle favorite'
      setError(errorMessage)
      console.error('Failed to toggle favorite:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const archiveCard = async (card: Card): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      await updateCardInDeck(card.id, { deckId: card.deckId, archived: true })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to archive card'
      setError(errorMessage)
      console.error('Failed to archive card:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const unarchiveCard = async (card: Card): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      await updateCardInDeck(card.id, { deckId: card.deckId, archived: false })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unarchive card'
      setError(errorMessage)
      console.error('Failed to unarchive card:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
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
    loading,
    error
  }
}
