import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { useAuth } from '../providers/AuthProvider'
import type { Deck } from '../types'

// TDD: Implementation driven by our comprehensive test suite

interface UseDecksResult {
  decks: Deck[]
  loading: boolean
  error: string | null
}

export const useDecks = (): UseDecksResult => {
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(false) // Start as false, will be set to true only when user exists
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    // If no user, return empty state
    if (!user) {
      setLoading(false)
      setDecks([])
      setError(null)
      return
    }

    // User exists, start loading
    setLoading(true)

    try {
      // Set up Firestore query for user's decks
      const decksRef = collection(db, 'decks')
      const q = query(
        decksRef,
        where('ownerId', '==', user.uid),
        orderBy('updatedAt', 'desc')
      )

      // Subscribe to real-time updates
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          try {
            const deckData: Deck[] = []
            
            snapshot.docs.forEach((doc) => {
              const data = doc.data()

              // Validate required fields to handle malformed data
              if (data.title && data.ownerId && data.createdAt && data.updatedAt) {
                // Include sharing fields (Phase 1 feature) if present so Share dialog reflects current state.
                // These are optional and absent for decks created before sharing fields were added.
                deckData.push({
                  id: doc.id,
                  title: data.title,
                  ownerId: data.ownerId,
                  createdAt: data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt,
                  updatedAt: data.updatedAt.toDate ? data.updatedAt.toDate() : data.updatedAt,
                  cardCount: data.cardCount || 0,
                  collaboratorIds: data.collaboratorIds || [],
                  roles: data.roles || undefined
                })
              }
            })

            setDecks(deckData)
            setLoading(false)
            setError(null)
          } catch (err) {
            console.error('Error processing deck data:', err)
            setError('Error processing deck data')
            setLoading(false)
          }
        },
        (err) => {
          console.error('Firestore subscription error:', err)
          setError(err.message || 'Firestore connection failed')
          setLoading(false)
          setDecks([])
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
  }, [user])

  return { decks, loading, error }
}
