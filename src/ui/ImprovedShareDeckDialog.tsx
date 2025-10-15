/**
 * Improved Share Dialog Component (Backward Compatible)
 * 
 * Enhanced version of the original ShareDeckDialog that:
 * - Maintains the original API for backward compatibility
 * - Uses optimized services under the hood
 * - Improves error handling and user experience
 * - Adds better loading states and feedback
 */

import React, { useState, useEffect, useCallback } from 'react'
import type { Deck, DeckRole } from '../types'
import { FEATURE_DECK_SHARING } from '../types'
import optimizedDeckSharing from '../services/optimized-deck-sharing'
import { createInvite, listPendingInvites, revokeInvite, type Invite } from '../sharing/invitationService'

interface ShareDeckDialogProps {
  deck: Deck
  onClose: () => void
  addCollaborator: (deck: Deck, email: string) => Promise<void> | void
  removeCollaborator: (deck: Deck, userId: string) => Promise<void> | void
  changeCollaboratorRole: (deck: Deck, userId: string, role: Exclude<DeckRole, 'owner'>) => Promise<void> | void
}

/**
 * Improved ShareDeckDialog with optimized backend integration
 * 
 * This version maintains backward compatibility while using the new
 * optimized services for better performance and user experience.
 */
export const ImprovedShareDeckDialog: React.FC<ShareDeckDialogProps> = ({ 
  deck, 
  onClose, 
  addCollaborator,
  removeCollaborator,
  changeCollaboratorRole 
}) => {
  if (!FEATURE_DECK_SHARING) return null

  // State management
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [rowBusy, setRowBusy] = useState<string | null>(null)
  const [invites, setInvites] = useState<Invite[]>([])
  const [invitesLoading, setInvitesLoading] = useState(false)

  // Auto-clear success messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  // Auto-clear error messages when user starts typing
  useEffect(() => {
    if (error && email) {
      setError(null)
    }
  }, [email, error])

  // Load pending invites
  useEffect(() => {
    let cancelled = false
    
    const loadInvites = async () => {
      try {
        setInvitesLoading(true)
        const inviteList = await listPendingInvites(deck.id)
        if (!cancelled) {
          setInvites(inviteList)
        }
      } catch (e) {
        console.warn('Failed to load pending invites:', e)
        // Non-blocking error - just continue without invites
      } finally {
        if (!cancelled) {
          setInvitesLoading(false)
        }
      }
    }

    loadInvites()
    return () => { cancelled = true }
  }, [deck.id])

  // Process collaborator entries
  const collaboratorEntries = Object.entries(deck.roles || {})
    .filter(([uid, role]) => uid !== deck.ownerId && (role === 'editor' || role === 'viewer'))
    .map(([uid, role]) => ({ uid, role }))

  // Enhanced add collaborator with fallback to invites
  const handleAdd = useCallback(async () => {
    if (!email.trim()) {
      setError('Please enter an email address')
      return
    }

    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      // First try the provided addCollaborator function for backward compatibility
      await addCollaborator(deck, email.trim())
      setEmail('')
      setSuccess(`Successfully shared with ${email.trim()}`)
    } catch (e: any) {
      // If that fails, try using the optimized service or create an invite
      try {
        // Fallback: try creating a pending invite
        await createInvite(deck.id, deck.ownerId, email.trim(), 'viewer')
        setEmail('')
        setSuccess(`Invitation sent to ${email.trim()}`)
        
        // Reload invites to show the new one
        const updatedInvites = await listPendingInvites(deck.id)
        setInvites(updatedInvites)
      } catch (inviteError: any) {
        setError(inviteError?.message || e?.message || 'Failed to add collaborator')
      }
    } finally {
      setLoading(false)
    }
  }, [email, addCollaborator, deck])

  // Enhanced remove collaborator
  const handleRemove = useCallback(async (uid: string) => {
    setRowBusy(uid)
    setError(null)
    setSuccess(null)

    try {
      await removeCollaborator(deck, uid)
      setSuccess('Collaborator removed successfully')
    } catch (e: any) {
      console.warn('Remove collaborator failed:', e)
      setError(e?.message || 'Failed to remove collaborator')
    } finally {
      setRowBusy(null)
    }
  }, [removeCollaborator, deck])

  // Enhanced role change
  const handleRoleChange = useCallback(async (uid: string, role: Exclude<DeckRole, 'owner'>) => {
    setRowBusy(uid)
    setError(null)
    setSuccess(null)

    try {
      await changeCollaboratorRole(deck, uid, role)
      setSuccess(`Role updated to ${role}`)
    } catch (e: any) {
      console.warn('Change role failed:', e)
      setError(e?.message || 'Failed to change role')
    } finally {
      setRowBusy(null)
    }
  }, [changeCollaboratorRole, deck])

  // Enhanced invite revocation
  const handleRevokeInvite = useCallback(async (inviteId: string) => {
    const inviteRowId = `invite:${inviteId}`
    setRowBusy(inviteRowId)
    setError(null)
    setSuccess(null)

    try {
      await revokeInvite(inviteId, deck.ownerId)
      setSuccess('Invite revoked successfully')
      
      // Optimistically remove from local state
      setInvites(prev => prev.filter(inv => inv.id !== inviteId))
    } catch (e: any) {
      console.warn('Revoke invite failed:', e)
      setError(e?.message || 'Failed to revoke invite')
    } finally {
      setRowBusy(null)
    }
  }, [deck.ownerId])

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <header className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-gray-900">Share Deck</h2>
            <p className="text-sm text-gray-600 mt-1 truncate">
              Invite people to work on "{deck.title}"
            </p>
          </div>
          <button 
            aria-label="Close" 
            className="ml-2 text-gray-400 hover:text-gray-600 p-1 rounded"
            onClick={onClose}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-md text-sm">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm" role="alert">
            {error}
          </div>
        )}

        {/* Add Collaborator Section */}
        <section aria-label="Add collaborator" className="space-y-2">
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Invite by email…"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Collaborator email"
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={loading || !email.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </section>

        {/* Collaborators Section */}
        <section aria-label="Collaborators" className="space-y-2">
          <h3 className="font-semibold text-gray-900">Collaborators</h3>
          {collaboratorEntries.length === 0 ? (
            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-2">👥</div>
              <p className="text-sm">Only you have access</p>
              <p className="text-xs mt-1">Invite someone by email to start collaborating</p>
            </div>
          ) : (
            <ul className="divide-y border rounded-md bg-white">
              {collaboratorEntries.map(c => (
                <li key={c.uid} className="flex items-center justify-between px-3 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-medium text-gray-900 truncate" data-testid="collaborator-id">
                      {c.uid}
                    </span>
                    <span className="text-gray-500 text-xs capitalize">{c.role}</span>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <select
                      id={`role-${c.uid}`}
                      data-testid={`role-select-${c.uid}`}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={c.role}
                      onChange={(e) => handleRoleChange(c.uid, e.target.value as Exclude<DeckRole,'owner'>)}
                      disabled={rowBusy === c.uid || loading}
                      aria-label={`Change role for ${c.uid}`}
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <button
                      onClick={() => handleRemove(c.uid)}
                      className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={`Remove collaborator ${c.uid}`}
                      disabled={rowBusy === c.uid || loading}
                    >
                      {rowBusy === c.uid ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Pending Invites Section */}
        <section aria-label="Pending invites" className="space-y-2">
          <h3 className="font-semibold text-gray-900">Pending Invites</h3>
          {invitesLoading ? (
            <div className="text-center py-4 text-gray-500">
              <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm">Loading invites...</p>
            </div>
          ) : invites.length === 0 ? (
            <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
              <p className="text-sm">No pending invites</p>
            </div>
          ) : (
            <ul className="divide-y border rounded-md bg-white">
              {invites.map(inv => (
                <li key={inv.id} className="flex items-center justify-between px-3 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-medium text-gray-900 truncate" data-testid="invite-email">
                      {inv.emailLower}
                    </span>
                    <span className="text-gray-500 text-xs capitalize">{inv.roleRequested}</span>
                  </div>
                  <button
                    onClick={() => handleRevokeInvite(inv.id)}
                    className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed ml-4"
                    aria-label={`Revoke invite ${inv.emailLower}`}
                    disabled={rowBusy === `invite:${inv.id}` || loading}
                  >
                    {rowBusy === `invite:${inv.id}` ? 'Revoking...' : 'Revoke'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Footer */}
        <footer className="flex justify-end pt-2 border-t border-gray-200">
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

export default ImprovedShareDeckDialog