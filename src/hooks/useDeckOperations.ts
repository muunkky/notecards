import { useState } from 'react';
import { Deck } from '../types';
import { deckOperations } from '../firebase/firestore';

export const useDeckOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDeck = async (deckData: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const id = await deckOperations.create(deckData);
      return id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create deck';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDeck = async (id: string, updates: Partial<Omit<Deck, 'id' | 'createdAt' | 'userId'>>) => {
    setLoading(true);
    setError(null);
    
    try {
      await deckOperations.update(id, updates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update deck';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDeck = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await deckOperations.delete(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete deck';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createDeck,
    updateDeck,
    deleteDeck,
    loading,
    error,
  };
};
