import React, { useState } from 'react';
import { useAuthContext } from '../../providers/AuthProvider';
import { useDecks } from '../../hooks/useDecks';
import { useDeckOperations } from '../../hooks/useDeckOperations';
import { Deck } from '../../types';

export const DeckScreen: React.FC = () => {
  const { user, signOut } = useAuthContext();
  const { decks, loading } = useDecks();
  const { createDeck } = useDeckOperations();
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim() || !user) return;

    try {
      await createDeck({
        name: newDeckName.trim(),
        description: newDeckDescription.trim() || undefined,
        userId: user.uid,
      });
      setNewDeckName('');
      setNewDeckDescription('');
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating deck:', error);
    }
  };

  const handleSelectDeck = (deck: Deck) => {
    setSelectedDeck(deck);
    console.log('Selected deck:', deck.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">Loading decks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">My Decks</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setIsCreating(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Create New Deck
              </button>
              <button
                onClick={signOut}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Create Deck Form */}
        {isCreating && (
          <div className="mb-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Deck</h2>
              <form onSubmit={handleCreateDeck} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Deck Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter deck name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description (optional)
                  </label>
                  <textarea
                    id="description"
                    value={newDeckDescription}
                    onChange={(e) => setNewDeckDescription(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter deck description"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setNewDeckName('');
                      setNewDeckDescription('');
                    }}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Create Deck
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Selected Deck Info */}
        {selectedDeck && (
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-900">Selected Deck</h3>
              <p className="text-blue-700">{selectedDeck.name}</p>
              {selectedDeck.description && (
                <p className="text-sm text-blue-600 mt-1">{selectedDeck.description}</p>
              )}
            </div>
          </div>
        )}

        {/* Decks Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <div key={deck.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-indigo-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {deck.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {deck.name}
                    </h3>
                    {deck.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {deck.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => handleSelectDeck(deck)}
                    className={`w-full text-center py-2 px-4 rounded-md text-sm font-medium ${
                      selectedDeck?.id === deck.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    }`}
                  >
                    {selectedDeck?.id === deck.id ? 'Selected' : 'Select Deck'}
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Created: {deck.createdAt.toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {decks.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No decks yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first deck.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create your first deck
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
