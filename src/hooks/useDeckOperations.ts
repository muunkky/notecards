import { useState } from 'react'
import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { useAuth } from '../providers/AuthProvider'
import type { Deck } from '../types'

// TDD: Implementation driven by our comprehensive test suite

interface UseDeckOperationsResult {
  createDeck: (title: string) => Promise<Deck>
  updateDeck: (deckId: string, updates: Partial<Omit<Deck, 'id' | 'ownerId' | 'createdAt'>>) => Promise<void>
  deleteDeck: (deckId: string) => Promise<void>
  loading: boolean
  error: string | null
}

export const useDeckOperations = (): UseDeckOperationsResult => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const createDeck = async (title: string): Promise<Deck> => {
    if (!user) {
      throw new Error('User must be authenticated')
    }

    if (!title.trim()) {
      throw new Error('Deck title is required')
    }

    setLoading(true)
    setError(null)

    try {
      // Create deck in Firestore
      const deckData = {
        title: title.trim(),
        ownerId: user.uid,
        cardCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      const docRef = await addDoc(collection(db, 'decks'), deckData)
      
      const newDeck: Deck = {
        id: docRef.id,
        title: title.trim(),
        ownerId: user.uid,
        cardCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      console.log('Created deck in Firestore:', newDeck);
      setLoading(false)
      setError(null)
      return newDeck
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create deck'
      setError(errorMessage)
      setLoading(false)
      throw err
    }
  }

  const updateDeck = async (deckId: string, updates: Partial<Omit<Deck, 'id' | 'ownerId' | 'createdAt'>>): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated')
    }

    if (!deckId.trim()) {
      throw new Error('Deck ID is required')
    }

    setLoading(true)
    setError(null)

    try {
      // Update deck in Firestore
      const deckRef = doc(db, 'decks', deckId)
      
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      }

      await updateDoc(deckRef, updateData)
      console.log('Updated deck in Firestore:', deckId, 'with', updates);
      
      setLoading(false)
      setError(null)
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update deck'
      setError(errorMessage)
      setLoading(false)
      throw err
    }
  }

  const deleteDeck = async (deckId: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated')
    }

    if (!deckId.trim()) {
      throw new Error('Deck ID is required')
    }

    setLoading(true)
    setError(null)

    try {
      // Delete deck from Firestore
      const deckRef = doc(db, 'decks', deckId)
      await deleteDoc(deckRef)
      console.log('Deleted deck from Firestore:', deckId);
      
      setLoading(false)
      setError(null)
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete deck'
      setError(errorMessage)
      setLoading(false)
      throw err
    }
  }

  return {
    createDeck,
    updateDeck,
    deleteDeck,
    loading,
    error
  }
}
