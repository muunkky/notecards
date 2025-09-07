import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { useAuth } from '../providers/AuthProvider'
import type { Card } from '../types'

// TDD: Implementation driven by our comprehensive test suite

interface UseCardsResult {
  cards: Card[]
  loading: boolean
  error: string | null
}

export const useCards = (deckId: string): UseCardsResult => {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    // If no user or deckId, return empty state
    if (!user || !deckId) {
      setLoading(false)
      setCards([])
      setError(null)
      return
    }

    // User exists and deckId provided, start loading
    setLoading(true)

    try {
      // Set up Firestore query for deck's cards (subcollection)
      const cardsRef = collection(db, 'decks', deckId, 'cards')
      const q = query(
        cardsRef,
        orderBy('orderIndex', 'asc')
      )

      // Subscribe to real-time updates
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          try {
            const cardData: Card[] = []
            
            snapshot.docs.forEach((doc) => {
              const data = doc.data()
              
              // Validate required fields to handle malformed data
              if (data.title && data.deckId && data.createdAt && data.updatedAt && typeof data.orderIndex === 'number') {
                cardData.push({
                  id: doc.id,
                  deckId: data.deckId,
                  title: data.title,
                  body: data.body || '',
                  orderIndex: data.orderIndex,
                  createdAt: data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt,
                  updatedAt: data.updatedAt.toDate ? data.updatedAt.toDate() : data.updatedAt
                })
              }
            })

            setCards(cardData)
            setLoading(false)
            setError(null)
          } catch (err) {
            console.error('Error processing card data:', err)
            setError('Error processing card data')
            setLoading(false)
          }
        },
        (err) => {
          console.error('Firestore subscription error:', err)
          setError(err.message || 'Firestore connection failed')
          setLoading(false)
          setCards([])
        }
      )

      // Cleanup subscription on unmount
      return () => {
        unsubscribe()
      }
    } catch (err: any) {
      console.error('Error setting up Firestore subscription:', err)
      setError(err.message || 'Failed to set up real-time updates')
      setLoading(false)
    }
  }, [user, deckId])

  return { cards, loading, error }
}
