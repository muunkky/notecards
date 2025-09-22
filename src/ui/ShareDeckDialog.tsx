import React, { useState } from 'react'
import type { Deck } from '../types'
import { FEATURE_DECK_SHARING } from '../types'

interface ShareDeckDialogProps {
  deck: Deck
  onClose: () => void
  addCollaborator: (deck: Deck, email: string) => Promise<void> | void
  removeCollaborator: (deck: Deck, userId: string) => Promise<void> | void
}

// Minimal implementation (Phase 1) – no email lookup yet, just propagates email string upward.
export const ShareDeckDialog: React.FC<ShareDeckDialogProps> = ({ deck, onClose, addCollaborator, removeCollaborator }) => {
  if (!FEATURE_DECK_SHARING) return null

  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const collaboratorEntries = Object.entries(deck.roles || {})
    .filter(([uid, role]) => uid !== deck.ownerId && (role === 'editor' || role === 'viewer'))
    .map(([uid, role]) => ({ uid, role }))

  const handleAdd = async () => {
    if (!email.trim()) {
      setError('Enter an email')
      return
    }
    setError(null)
    try {
      setLoading(true)
      await addCollaborator(deck, email.trim())
      setEmail('')
    } catch (e: any) {
      setError(e?.message || 'Failed to add collaborator')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (uid: string) => {
    try {
      await removeCollaborator(deck, uid)
    } catch (e) {
      // Non-blocking; could surface toast in future
      console.warn('Remove collaborator failed', e)
    }
  }

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
        <header className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">Share Deck</h2>
            {/* Avoid repeating the word "Collaborators" so tests using getByText(/Collaborators/i) match only the section heading */}
            <p className="text-sm text-gray-500 mt-1">Invite people to work on "{deck.title}"</p>
          </div>
          <button aria-label="Close" className="text-gray-500 hover:text-gray-700" onClick={onClose}>×</button>
        </header>

        <section aria-label="Add collaborator" className="space-y-2">
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Invite by email…"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Collaborator email"
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >Add</button>
          </div>
          {error && <div className="text-sm text-red-600" role="alert">{error}</div>}
        </section>

        <section aria-label="Collaborators" className="space-y-2">
          <h3 className="font-semibold">Collaborators</h3>
          {collaboratorEntries.length === 0 && (
            <p className="text-sm text-gray-500">Only you have access. Invite someone by email.</p>
          )}
          <ul className="divide-y border rounded-md">
            {collaboratorEntries.map(c => (
              <li key={c.uid} className="flex items-center justify-between px-3 py-2 text-sm">
                <div className="flex flex-col">
                  <span className="font-medium" data-testid="collaborator-id">{c.uid}</span>
                  <span className="text-gray-500 text-xs">{c.role}</span>
                </div>
                <button
                  onClick={() => handleRemove(c.uid)}
                  className="text-red-600 hover:text-red-800 text-xs font-medium"
                  aria-label={`Remove collaborator ${c.uid}`}
                >Remove</button>
              </li>
            ))}
          </ul>
        </section>
        <footer className="flex justify-end pt-2">
          <button onClick={onClose} className="text-sm text-gray-600 hover:text-gray-800">Close</button>
        </footer>
      </div>
    </div>
  )
}

export default ShareDeckDialog