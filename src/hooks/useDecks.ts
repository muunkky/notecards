import { useState, useEffect } from 'react';
import { Deck } from '../types';
import { deckOperations } from '../firebase/firestore';
import { useAuthContext } from '../providers/AuthProvider';

export const useDecks = () => {
  const { user } = useAuthContext();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setDecks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Subscribe to real-time updates
    const unsubscribe = deckOperations.subscribeToUserDecks(
      user.uid,
      (updatedDecks) => {
        setDecks(updatedDecks);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [user]);

  return {
    decks,
    loading,
    error,
  };
};
