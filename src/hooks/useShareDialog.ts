/**
 * Share Dialog Hook
 * 
 * Simplifies integration of the share dialog by providing a single hook
 * that handles all sharing operations with optimized services.
 */

import { useCallback } from 'react'
import optimizedDeckSharing from '../services/optimized-deck-sharing'
import type { Deck, DeckRole } from '../types'

interface UseShareDialogOptions {
  onSuccess?: (message: string) => void
  onError?: (error: string) => void
}

interface UseShareDialogResult {
  shareWithUser: (deck: Deck, email: string, role?: Exclude<DeckRole, 'owner'>) => Promise<void>
  removeUserAccess: (deck: Deck, userId: string) => Promise<void>
  updateUserRole: (deck: Deck, userId: string, role: Exclude<DeckRole, 'owner'>) => Promise<void>
  batchShare: (deck: Deck, shares: Array<{ email: string; role: Exclude<DeckRole, 'owner'> }>) => Promise<void>
}

/**
 * Hook for managing deck sharing operations
 * 
 * Provides a simplified interface for sharing operations that integrates
 * with optimized services and provides consistent error handling.
 */
export function useShareDialog(
  currentUserId: string,
  options: UseShareDialogOptions = {}
): UseShareDialogResult {
  const { onSuccess, onError } = options

  const shareWithUser = useCallback(async (
    deck: Deck, 
    email: string, 
    role: Exclude<DeckRole, 'owner'> = 'viewer'
  ) => {
    try {
      const result = await optimizedDeckSharing.shareWithUser(
        { deckId: deck.id, userEmail: email, role },
        currentUserId
      )

      if (result.success) {
        onSuccess?.(`Successfully shared "${deck.title}" with ${email}`)
      } else {
        onError?.(result.error || 'Failed to share deck')
      }
    } catch (error: any) {
      onError?.(error.message || 'Failed to share deck')
    }
  }, [currentUserId, onSuccess, onError])

  const removeUserAccess = useCallback(async (deck: Deck, userId: string) => {
    try {
      const result = await optimizedDeckSharing.removeUserAccess(deck.id, userId, currentUserId)
      
      if (result.success) {
        onSuccess?.('Collaborator access removed')
      } else {
        onError?.(result.error || 'Failed to remove access')
      }
    } catch (error: any) {
      onError?.(error.message || 'Failed to remove access')
    }
  }, [currentUserId, onSuccess, onError])

  const updateUserRole = useCallback(async (
    deck: Deck, 
    userId: string, 
    role: Exclude<DeckRole, 'owner'>
  ) => {
    try {
      const result = await optimizedDeckSharing.updateUserRole(deck.id, userId, role, currentUserId)
      
      if (result.success) {
        onSuccess?.(`Role updated to ${role}`)
      } else {
        onError?.(result.error || 'Failed to update role')
      }
    } catch (error: any) {
      onError?.(error.message || 'Failed to update role')
    }
  }, [currentUserId, onSuccess, onError])

  const batchShare = useCallback(async (
    deck: Deck, 
    shares: Array<{ email: string; role: Exclude<DeckRole, 'owner'> }>
  ) => {
    try {
      // Convert to the format expected by the service
      const serviceShares = shares.map(share => ({
        userEmail: share.email,
        role: share.role
      }))

      const result = await optimizedDeckSharing.batchShareDeck(
        { deckId: deck.id, shares: serviceShares },
        currentUserId
      )

      const { successful, failed } = result
      
      if (successful.length > 0) {
        onSuccess?.(
          `Successfully shared with ${successful.length} ${successful.length === 1 ? 'person' : 'people'}`
        )
      }
      
      if (failed.length > 0) {
        const failedEmails = failed.map(f => f.userEmail).join(', ')
        onError?.(
          `Failed to share with: ${failedEmails}`
        )
      }
    } catch (error: any) {
      onError?.(error.message || 'Failed to share deck')
    }
  }, [currentUserId, onSuccess, onError])

  return {
    shareWithUser,
    removeUserAccess,
    updateUserRole,
    batchShare
  }
}

export default useShareDialog