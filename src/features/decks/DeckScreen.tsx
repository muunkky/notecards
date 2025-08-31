import React, { useState, useEffect } from 'react'
import { useDecks } from '../../hooks/useDecks'
import { useDeckOperations } from '../../hooks/useDeckOperations'
import { useAuth } from '../../providers/AuthProvider'
import type { Deck } from '../../types'

// TDD: Connect our beautiful DeckScreen to real Firestore data via useDecks hook

interface DeckListItemProps {
  deck: Deck
  onSelect: (id: string) => void
  onMenu: (id: string) => void
}

interface DeckScreenProps {
  onSelectDeck?: (deckId: string, deckTitle: string) => void
}

// TDD: Implement DeckListItem component first
export const DeckListItem: React.FC<DeckListItemProps> = ({ deck, onSelect, onMenu }) => {
  return (
    <div 
      data-testid="deck-item"
      className="group flex items-center justify-between p-6 bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/95 hover:shadow-lg hover:scale-[1.02] cursor-pointer transition-all duration-200"
      onClick={() => onSelect(deck.id)}
    >
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
          {deck.title.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
            {deck.title}
          </h3>
          <p className="text-sm text-gray-500 flex items-center space-x-1">
            <span>📝</span>
            <span>{deck.cardCount} {deck.cardCount === 1 ? 'card' : 'cards'}</span>
          </p>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onMenu(deck.id)
        }}
        className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
        aria-label="menu"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>
    </div>
  )
}

// TDD: Implement DeckScreen component to make tests pass
export default function DeckScreen({ onSelectDeck }: DeckScreenProps) {
  const { decks, loading, error } = useDecks()
  const { createDeck, updateDeck, deleteDeck, loading: operationLoading, error: operationError } = useDeckOperations()
  const { user, signOut } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
  const [newDeckTitle, setNewDeckTitle] = useState('')
  const [renameTitle, setRenameTitle] = useState('')

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading decks...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error loading decks: {error}</div>
      </div>
    )
  }

  const handleCreateDeck = async () => {
    if (newDeckTitle.trim()) {
      try {
        await createDeck(newDeckTitle.trim())
        console.log('Successfully created deck:', newDeckTitle)
        setNewDeckTitle('')
        setShowCreateModal(false)
      } catch (error) {
        console.error('Failed to create deck:', error)
      }
    }
  }

  const handleRenameDeck = async () => {
    if (selectedDeck && renameTitle.trim()) {
      try {
        await updateDeck(selectedDeck.id, { title: renameTitle.trim() })
        console.log('Successfully renamed deck:', selectedDeck.id)
        setRenameTitle('')
        setShowRenameModal(false)
        setSelectedDeck(null)
      } catch (error) {
        console.error('Failed to rename deck:', error)
      }
    }
  }

  const handleDeleteDeck = async () => {
    if (selectedDeck) {
      try {
        await deleteDeck(selectedDeck.id)
        console.log('Successfully deleted deck:', selectedDeck.id)
        setShowDeleteModal(false)
        setSelectedDeck(null)
      } catch (error) {
        console.error('Failed to delete deck:', error)
      }
    }
  }

  const openRenameModal = (deck: Deck) => {
    setSelectedDeck(deck)
    setRenameTitle(deck.title)
    setShowRenameModal(true)
  }

  const openDeleteModal = (deck: Deck) => {
    setSelectedDeck(deck)
    setShowDeleteModal(true)
  }

  const handleDeckSelect = (deckId: string) => {
    console.log('Selected deck:', deckId)
    if (onSelectDeck) {
      const deck = decks.find(d => d.id === deckId)
      onSelectDeck(deckId, deck?.title || 'Unknown Deck')
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setShowUserMenu(false)
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  const handleDeckMenu = (deckId: string) => {
    const deck = decks.find(d => d.id === deckId)
    if (deck) {
      // For now, let's implement a simple context menu
      const action = window.confirm(`What would you like to do with "${deck.title}"?\n\nOK = Rename\nCancel = Delete`)
      if (action) {
        openRenameModal(deck)
      } else {
        openDeleteModal(deck)
      }
    }
  }

  // Click outside handler for user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showUserMenu && !target.closest('[data-user-menu]')) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserMenu])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl">
        {/* Enhanced Header with User Menu */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">My Decks</h1>
            <p className="text-gray-300 text-sm sm:text-base">Organize your study materials into focused collections</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              + Create New Deck
            </button>
            
            {/* User Menu */}
            <div className="relative" data-user-menu>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg transition-all duration-200"
                aria-label="User menu"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <svg className={`w-4 h-4 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.displayName || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Deck List */}
        <div className="space-y-4">
          {decks.length === 0 ? (
            <div className="text-center py-16 animate-fadeIn">
              <div className="bg-white/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📚</span>
              </div>
              <div className="text-white text-xl mb-4 font-medium">No decks yet</div>
              <div className="text-gray-300 mb-8 max-w-md mx-auto leading-relaxed">
                Get started by creating your first deck of cards. Perfect for studying, memorizing, or organizing any kind of information.
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Create Your First Deck
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {decks.map((deck, index) => (
                <div
                  key={deck.id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <DeckListItem
                    deck={deck}
                    onSelect={handleDeckSelect}
                    onMenu={handleDeckMenu}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4">Create New Deck</h2>
              <input
                type="text"
                placeholder="Enter deck title"
                value={newDeckTitle}
                onChange={(e) => setNewDeckTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                autoFocus
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewDeckTitle('')
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateDeck}
                  disabled={!newDeckTitle.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rename Modal */}
        {showRenameModal && selectedDeck && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4">Rename Deck</h2>
              <input
                type="text"
                placeholder="Enter new deck title"
                value={renameTitle}
                onChange={(e) => setRenameTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                autoFocus
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowRenameModal(false)
                    setRenameTitle('')
                    setSelectedDeck(null)
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRenameDeck}
                  disabled={!renameTitle.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Rename
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedDeck && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4">Delete Deck</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{selectedDeck.title}"? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setSelectedDeck(null)
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteDeck}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}