/**
 * Refactored Share Dialog Architecture
 * 
 * Modernized component structure with improved performance, maintainability,
 * and user experience. Integrates with optimized services for better performance.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import type { Deck, DeckRole } from '../types'
import { FEATURE_DECK_SHARING } from '../types'
import optimizedDeckSharing from '../services/optimized-deck-sharing'
import { createInvite, listPendingInvites, revokeInvite, type Invite } from '../sharing/invitationService'

// =============================================================================
// Types and Interfaces
// =============================================================================

interface ShareDeckDialogProps {
  deck: Deck
  onClose: () => void
  currentUserId: string
}

interface CollaboratorEntry {
  uid: string
  role: Exclude<DeckRole, 'owner'>
  displayName?: string
  email?: string
}

interface ShareDialogState {
  loading: boolean
  error: string | null
  success: string | null
  rowBusy: Set<string>
  invites: Invite[]
  invitesLoading: boolean
}

// =============================================================================
// Hooks for State Management
// =============================================================================

/**
 * Custom hook for managing share dialog state
 */
function useShareDialogState(): [ShareDialogState, {
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSuccess: (success: string | null) => void
  setRowBusy: (id: string, busy: boolean) => void
  setInvites: (invites: Invite[]) => void
  setInvitesLoading: (loading: boolean) => void
  clearMessages: () => void
}] {
  const [state, setState] = useState<ShareDialogState>({
    loading: false,
    error: null,
    success: null,
    rowBusy: new Set(),
    invites: [],
    invitesLoading: false
  })

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, success: null }))
  }, [])

  const setSuccess = useCallback((success: string | null) => {
    setState(prev => ({ ...prev, success, error: null }))
  }, [])

  const setRowBusy = useCallback((id: string, busy: boolean) => {
    setState(prev => {
      const newRowBusy = new Set(prev.rowBusy)
      if (busy) {
        newRowBusy.add(id)
      } else {
        newRowBusy.delete(id)
      }
      return { ...prev, rowBusy: newRowBusy }
    })
  }, [])

  const setInvites = useCallback((invites: Invite[]) => {
    setState(prev => ({ ...prev, invites }))
  }, [])

  const setInvitesLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, invitesLoading: loading }))
  }, [])

  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, error: null, success: null }))
  }, [])

  return [state, {
    setLoading,
    setError,
    setSuccess,
    setRowBusy,
    setInvites,
    setInvitesLoading,
    clearMessages
  }]
}

/**
 * Custom hook for loading pending invites
 */
function usePendingInvites(deckId: string) {
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadInvites = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const inviteList = await listPendingInvites(deckId)
      setInvites(inviteList)
    } catch (e: any) {
      console.warn('Failed to load pending invites:', e)
      setError(e.message || 'Failed to load invites')
    } finally {
      setLoading(false)
    }
  }, [deckId])

  useEffect(() => {
    loadInvites()
  }, [loadInvites])

  return { invites, loading, error, reload: loadInvites, setInvites }
}

// =============================================================================
// Sub-Components
// =============================================================================

/**
 * Add Collaborator Form Component
 */
interface AddCollaboratorFormProps {
  onAdd: (email: string) => Promise<void>
  loading: boolean
  error: string | null
}

const AddCollaboratorForm: React.FC<AddCollaboratorFormProps> = ({
  onAdd,
  loading,
  error
}) => {
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    try {
      await onAdd(email.trim())
      setEmail('')
    } catch (err) {
      // Error handled by parent
    }
  }

  return (
    <section aria-label="Add collaborator" className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          placeholder="Invite by email…"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Collaborator email"
          disabled={loading}
          required
        />
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
      </form>
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md" role="alert">
          {error}
        </div>
      )}
    </section>
  )
}

/**
 * Collaborator List Component
 */
interface CollaboratorListProps {
  collaborators: CollaboratorEntry[]
  onRemove: (uid: string) => Promise<void>
  onRoleChange: (uid: string, role: Exclude<DeckRole, 'owner'>) => Promise<void>
  busyRows: Set<string>
}

const CollaboratorList: React.FC<CollaboratorListProps> = ({
  collaborators,
  onRemove,
  onRoleChange,
  busyRows
}) => {
  if (collaborators.length === 0) {
    return (
      <section aria-label="Collaborators" className="space-y-3">
        <h3 className="font-semibold text-gray-900">Collaborators</h3>
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          <div className="text-2xl mb-2">👥</div>
          <p className="text-sm">Only you have access</p>
          <p className="text-xs mt-1">Invite someone by email to start collaborating</p>
        </div>
      </section>
    )
  }

  return (
    <section aria-label="Collaborators" className="space-y-3">
      <h3 className="font-semibold text-gray-900">Collaborators ({collaborators.length})</h3>
      <div className="border rounded-lg divide-y divide-gray-200">
        {collaborators.map(collaborator => (
          <CollaboratorItem
            key={collaborator.uid}
            collaborator={collaborator}
            onRemove={onRemove}
            onRoleChange={onRoleChange}
            busy={busyRows.has(collaborator.uid)}
          />
        ))}
      </div>
    </section>
  )
}

/**
 * Individual Collaborator Item Component
 */
interface CollaboratorItemProps {
  collaborator: CollaboratorEntry
  onRemove: (uid: string) => Promise<void>
  onRoleChange: (uid: string, role: Exclude<DeckRole, 'owner'>) => Promise<void>
  busy: boolean
}

const CollaboratorItem: React.FC<CollaboratorItemProps> = ({
  collaborator,
  onRemove,
  onRoleChange,
  busy
}) => {
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as Exclude<DeckRole, 'owner'>
    onRoleChange(collaborator.uid, newRole)
  }

  const handleRemove = () => {
    onRemove(collaborator.uid)
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-700">
              {(collaborator.displayName || collaborator.uid)[0].toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {collaborator.displayName || collaborator.uid}
            </p>
            {collaborator.email && (
              <p className="text-xs text-gray-500 truncate">{collaborator.email}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 ml-4">
        <select
          value={collaborator.role}
          onChange={handleRoleChange}
          disabled={busy}
          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          aria-label={`Role for ${collaborator.displayName || collaborator.uid}`}
        >
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
        
        <button
          onClick={handleRemove}
          disabled={busy}
          className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`Remove ${collaborator.displayName || collaborator.uid}`}
        >
          {busy ? 'Removing...' : 'Remove'}
        </button>
      </div>
    </div>
  )
}

/**
 * Pending Invites Component
 */
interface PendingInvitesProps {
  invites: Invite[]
  onRevoke: (inviteId: string) => Promise<void>
  loading: boolean
  busyRows: Set<string>
}

const PendingInvites: React.FC<PendingInvitesProps> = ({
  invites,
  onRevoke,
  loading,
  busyRows
}) => {
  if (loading) {
    return (
      <section aria-label="Pending invites" className="space-y-3">
        <h3 className="font-semibold text-gray-900">Pending Invites</h3>
        <div className="text-center py-4 text-gray-500">
          <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm">Loading invites...</p>
        </div>
      </section>
    )
  }

  if (invites.length === 0) {
    return (
      <section aria-label="Pending invites" className="space-y-3">
        <h3 className="font-semibold text-gray-900">Pending Invites</h3>
        <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
          <p className="text-sm">No pending invites</p>
        </div>
      </section>
    )
  }

  return (
    <section aria-label="Pending invites" className="space-y-3">
      <h3 className="font-semibold text-gray-900">Pending Invites ({invites.length})</h3>
      <div className="border rounded-lg divide-y divide-gray-200">
        {invites.map(invite => (
          <PendingInviteItem
            key={invite.id}
            invite={invite}
            onRevoke={onRevoke}
            busy={busyRows.has(`invite:${invite.id}`)}
          />
        ))}
      </div>
    </section>
  )
}

/**
 * Individual Pending Invite Item Component
 */
interface PendingInviteItemProps {
  invite: Invite
  onRevoke: (inviteId: string) => Promise<void>
  busy: boolean
}

const PendingInviteItem: React.FC<PendingInviteItemProps> = ({
  invite,
  onRevoke,
  busy
}) => {
  const handleRevoke = () => {
    onRevoke(invite.id)
  }

  const timeAgo = useMemo(() => {
    const now = new Date()
    const created = invite.createdAt
    const diffMs = now.getTime() - created.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    return `${diffDays} days ago`
  }, [invite.createdAt])

  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-amber-700">📧</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {invite.emailLower}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="capitalize">{invite.roleRequested}</span>
              <span>•</span>
              <span>Sent {timeAgo}</span>
            </div>
          </div>
        </div>
      </div>
      
      <button
        onClick={handleRevoke}
        disabled={busy}
        className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed ml-4"
        aria-label={`Revoke invite for ${invite.emailLower}`}
      >
        {busy ? 'Revoking...' : 'Revoke'}
      </button>
    </div>
  )
}

// =============================================================================
// Main Dialog Component
// =============================================================================

/**
 * Refactored Share Deck Dialog
 * 
 * Modern, performant, and user-friendly sharing interface with:
 * - Optimized service integration
 * - Better error handling and user feedback
 * - Improved loading states
 * - Modular component architecture
 */
export const RefactoredShareDeckDialog: React.FC<ShareDeckDialogProps> = ({
  deck,
  onClose,
  currentUserId
}) => {
  // Feature flag check
  if (!FEATURE_DECK_SHARING) return null

  // State management
  const [state, actions] = useShareDialogState()
  const { invites, loading: invitesLoading, reload: reloadInvites, setInvites } = usePendingInvites(deck.id)

  // Processed collaborator data
  const collaborators = useMemo((): CollaboratorEntry[] => {
    return Object.entries(deck.roles || {})
      .filter(([uid, role]) => uid !== deck.ownerId && (role === 'editor' || role === 'viewer'))
      .map(([uid, role]) => ({
        uid,
        role: role as Exclude<DeckRole, 'owner'>
        // TODO: Could enhance with user lookup for display names/emails
      }))
  }, [deck.roles, deck.ownerId])

  // Add collaborator handler
  const handleAddCollaborator = useCallback(async (email: string) => {
    actions.setLoading(true)
    actions.clearMessages()

    try {
      const result = await optimizedDeckSharing.shareWithUser(
        { deckId: deck.id, userEmail: email, role: 'viewer' },
        currentUserId
      )

      if (result.success) {
        actions.setSuccess(`Successfully shared with ${email}`)
        // Refresh invites in case it created a pending invite
        reloadInvites()
      } else {
        // Try creating an invite if user doesn't exist
        try {
          await createInvite(deck.id, currentUserId, email, 'viewer')
          actions.setSuccess(`Invitation sent to ${email}`)
          reloadInvites()
        } catch (inviteError: any) {
          actions.setError(result.error || 'Failed to add collaborator')
        }
      }
    } catch (error: any) {
      actions.setError(error.message || 'Failed to add collaborator')
    } finally {
      actions.setLoading(false)
    }
  }, [deck.id, currentUserId, actions, reloadInvites])

  // Remove collaborator handler
  const handleRemoveCollaborator = useCallback(async (uid: string) => {
    actions.setRowBusy(uid, true)
    actions.clearMessages()

    try {
      const result = await optimizedDeckSharing.removeUserAccess(deck.id, uid, currentUserId)
      
      if (result.success) {
        actions.setSuccess('Collaborator removed')
      } else {
        actions.setError(result.error || 'Failed to remove collaborator')
      }
    } catch (error: any) {
      actions.setError(error.message || 'Failed to remove collaborator')
    } finally {
      actions.setRowBusy(uid, false)
    }
  }, [deck.id, currentUserId, actions])

  // Change role handler
  const handleRoleChange = useCallback(async (uid: string, newRole: Exclude<DeckRole, 'owner'>) => {
    actions.setRowBusy(uid, true)
    actions.clearMessages()

    try {
      const result = await optimizedDeckSharing.updateUserRole(deck.id, uid, newRole, currentUserId)
      
      if (result.success) {
        actions.setSuccess(`Role updated to ${newRole}`)
      } else {
        actions.setError(result.error || 'Failed to update role')
      }
    } catch (error: any) {
      actions.setError(error.message || 'Failed to update role')
    } finally {
      actions.setRowBusy(uid, false)
    }
  }, [deck.id, currentUserId, actions])

  // Revoke invite handler
  const handleRevokeInvite = useCallback(async (inviteId: string) => {
    const inviteRowId = `invite:${inviteId}`
    actions.setRowBusy(inviteRowId, true)
    actions.clearMessages()

    try {
      await revokeInvite(inviteId, currentUserId)
      actions.setSuccess('Invite revoked')
      
      // Optimistically remove from local state
      setInvites(prev => prev.filter(inv => inv.id !== inviteId))
    } catch (error: any) {
      actions.setError(error.message || 'Failed to revoke invite')
    } finally {
      actions.setRowBusy(inviteRowId, false)
    }
  }, [currentUserId, actions, setInvites])

  // Auto-clear success messages
  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => actions.clearMessages(), 3000)
      return () => clearTimeout(timer)
    }
  }, [state.success, actions])

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="share-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="min-w-0 flex-1">
            <h2 id="share-dialog-title" className="text-xl font-bold text-gray-900">
              Share Deck
            </h2>
            <p className="text-sm text-gray-600 mt-1 truncate">
              Collaborate on "{deck.title}"
            </p>
          </div>
          <button 
            onClick={onClose}
            className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Success/Error Messages */}
          {state.success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {state.success}
            </div>
          )}

          {/* Add Collaborator Form */}
          <AddCollaboratorForm
            onAdd={handleAddCollaborator}
            loading={state.loading}
            error={state.error}
          />

          {/* Collaborators List */}
          <CollaboratorList
            collaborators={collaborators}
            onRemove={handleRemoveCollaborator}
            onRoleChange={handleRoleChange}
            busyRows={state.rowBusy}
          />

          {/* Pending Invites */}
          <PendingInvites
            invites={invites}
            onRevoke={handleRevokeInvite}
            loading={invitesLoading}
            busyRows={state.rowBusy}
          />
        </div>

        {/* Footer */}
        <footer className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Done
          </button>
        </footer>
      </div>
    </div>
  )
}

export default RefactoredShareDeckDialog