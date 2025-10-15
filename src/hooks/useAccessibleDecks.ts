import { useEffect, useRef, useState } from 'react'
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { useAuth } from '../providers/AuthProvider'
import type { Deck } from '../types'

/**
 * useAccessibleDecks
 * Returns all decks the current user can access (owner or collaborator).
 * Implementation strategy: maintain two real-time listeners (owned + collaborating),
 * merge results in-memory, compute effectiveRole, then sort by updatedAt desc.
 *
 * NOTE: This intentionally avoids a third aggregation collection until scale demands it.
 */
export interface UseAccessibleDecksResult {
  decks: Deck[]
  loading: boolean
  error: string | null
}

interface InternalDeckMap { [deckId: string]: Deck }

export function useAccessibleDecks(): UseAccessibleDecksResult {
  const { user } = useAuth()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [decks, setDecks] = useState<Deck[]>([])

  // Maintain separate maps for debug clarity (could collapse later)
  const ownedMap = useRef<InternalDeckMap>({})
  const collabMap = useRef<InternalDeckMap>({})

  useEffect(() => {
    if (!user) {
      setLoading(false)
      setError(null)
      setDecks([])
      ownedMap.current = {}
      collabMap.current = {}
      return
    }

    setLoading(true)
    setError(null)

    const decksRef = collection(db, 'decks')

    // Listener A: Owned decks
    const ownedQuery = query(
      decksRef,
      where('ownerId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    )

    const unsubOwned = onSnapshot(ownedQuery, snap => {
      try {
        const next: InternalDeckMap = { ...ownedMap.current }
        // Remove those no longer present
        Object.keys(next).forEach(id => { if (!snap.docs.find(d => d.id === id)) delete next[id] })
        snap.docs.forEach(docSnap => {
          const data = docSnap.data()
          if (!data.title || !data.ownerId || !data.createdAt || !data.updatedAt) return
          next[docSnap.id] = {
            id: docSnap.id,
            title: data.title,
            ownerId: data.ownerId,
            createdAt: data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt.toDate ? data.updatedAt.toDate() : data.updatedAt,
            cardCount: data.cardCount || 0,
            collaboratorIds: data.collaboratorIds || [],
            roles: data.roles || {},
            effectiveRole: 'owner'
          }
        })
        ownedMap.current = next
        recompute()
      } catch (e: any) {
        console.error('Owned decks snapshot error', e)
        setError('Failed processing owned decks')
      }
    }, err => {
      console.error('Owned decks listener error', err)
      setError(err.message || 'Owned decks listener failed')
      ownedMap.current = {}
      recompute()
    })

    // Listener B: Collaborator decks (exclude those we own; query ensures different ownerId)
    // Query using roles map field to match security rules authorization
    const collabQuery = query(
      decksRef,
      where(`roles.${user.uid}`, 'in', ['editor', 'viewer']),
      orderBy('updatedAt', 'desc')
    )

    const unsubCollab = onSnapshot(collabQuery, snap => {
      try {
        const next: InternalDeckMap = { ...collabMap.current }
        Object.keys(next).forEach(id => { if (!snap.docs.find(d => d.id === id)) delete next[id] })
        snap.docs.forEach(docSnap => {
          const data = docSnap.data()
          if (!data.title || !data.ownerId || !data.createdAt || !data.updatedAt) return
          // Skip if actually owned (shouldn't typically happen in this query) – falls back to ownedMap record
          if (data.ownerId === user.uid) return
          const role = data.roles && data.roles[user.uid] ? data.roles[user.uid] : 'viewer'
          next[docSnap.id] = {
            id: docSnap.id,
            title: data.title,
            ownerId: data.ownerId,
            createdAt: data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt.toDate ? data.updatedAt.toDate() : data.updatedAt,
            cardCount: data.cardCount || 0,
            collaboratorIds: data.collaboratorIds || [],
            roles: data.roles || {},
            effectiveRole: role
          }
        })
        collabMap.current = next
        recompute()
      } catch (e: any) {
        console.error('Collaborator decks snapshot error', e)
        setError('Failed processing collaborator decks')
      }
    }, err => {
      console.error('Collaborator decks listener error (gracefully degrading to owned-only)', err)
      // Don't set error state - gracefully degrade to owned decks only
      // This handles cases where Firestore indexes aren't ready yet
      collabMap.current = {}
      recompute()
    })

    function recompute() {
      // Merge; owned has precedence for effectiveRole 'owner'
      const merged: { [id: string]: Deck } = { ...collabMap.current, ...ownedMap.current }
      const arr = Object.values(merged).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      setDecks(arr)
      setLoading(false)
    }

    return () => {
      unsubOwned()
      unsubCollab()
    }
  }, [user])

  return { decks, loading, error }
}
