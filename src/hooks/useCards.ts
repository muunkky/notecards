import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore'
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
    console.log('useCards: Effect triggered', { user: !!user, deckId, userId: user?.uid })
    
    // If no user or deckId, return empty state
    if (!user || !deckId) {
      console.log('useCards: Missing user or deckId', { user: !!user, deckId })
      setLoading(false)
      setCards([])
      setError(null)
      return
    }

    // User exists and deckId provided, start loading
    console.log('useCards: Starting to load cards', { deckId, userId: user.uid })
    setLoading(true)

    const checkDeckAndSetupSubscription = async () => {
      try {
        // First, verify deck ownership
        console.log('useCards: Checking deck ownership for deck:', deckId)
        const deckRef = doc(db, 'decks', deckId)
        const deckDoc = await getDoc(deckRef)
        
        if (!deckDoc.exists()) {
          console.error('useCards: Deck does not exist:', deckId)
          setError('Deck not found')
          setLoading(false)
          return
        }
        
        const deckData = deckDoc.data()
        console.log('useCards: Deck data:', { ownerId: deckData.ownerId, currentUser: user.uid })
        
        if (deckData.ownerId !== user.uid) {
          console.error('useCards: User does not own this deck', { ownerId: deckData.ownerId, userId: user.uid })
          setError('You do not have permission to access this deck')
          setLoading(false)
          return
        }
        
        console.log('useCards: Deck ownership verified, proceeding to load cards')

        // Set up Firestore query for deck's cards (subcollection)
        console.log('useCards: Setting up Firestore query for path:', `decks/${deckId}/cards`)
        const cardsRef = collection(db, 'decks', deckId, 'cards')
        console.log('useCards: cardsRef created successfully')
        const q = query(
          cardsRef,
          orderBy('orderIndex', 'asc')
        )
        console.log('useCards: query created successfully')

        // Subscribe to real-time updates
        console.log('useCards: About to call onSnapshot...')
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            try {
              console.log('useCards: Snapshot received!', { numDocs: snapshot.docs.length, deckId })
              const cardData: Card[] = []

              snapshot.docs.forEach((doc) => {
                const data = doc.data()
                
                // Validate required fields to handle malformed data
                const snapshotDeckId = typeof data.deckId === 'string' && data.deckId.trim() ? data.deckId : deckId

                if (data.title && snapshotDeckId && data.createdAt && data.updatedAt && typeof data.orderIndex === 'number') {
                  cardData.push({
                    id: doc.id,
                    deckId: snapshotDeckId,
                    title: data.title,
                    body: data.body || '',
                    orderIndex: data.orderIndex,
                    createdAt: data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt,
                    updatedAt: data.updatedAt.toDate ? data.updatedAt.toDate() : data.updatedAt
                  })
                }
              })

              console.log('useCards: Setting cards state', { numCards: cardData.length, cardTitles: cardData.map(c => c.title) })
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
            console.error('Error details:', { code: err.code, message: err.message, stack: err.stack })
            setError(err.message || 'Firestore connection failed')
            setLoading(false)
            setCards([])
          }
        )

        console.log('useCards: onSnapshot registered, unsubscribe function obtained:', typeof unsubscribe)

        // Return cleanup function
        return unsubscribe
      } catch (err: any) {
        console.error('Error setting up Firestore subscription:', err)
        setError(err.message || 'Failed to set up real-time updates')
        setLoading(false)
      }
    }

    // Store unsubscribe function for cleanup
    let unsubscribeFn: (() => void) | undefined

    checkDeckAndSetupSubscription().then((unsubscribe) => {
      // Store cleanup function for useEffect cleanup
      unsubscribeFn = unsubscribe
    }).catch((err) => {
      console.error('Error in checkDeckAndSetupSubscription:', err)
      setError('Failed to load cards')
      setLoading(false)
    })

    // Return cleanup function that calls the stored unsubscribe
    return () => {
      if (unsubscribeFn) {
        console.log('useCards: Cleaning up subscription')
        unsubscribeFn()
      }
    }
  }, [user, deckId])

  return { cards, loading, error }
}
