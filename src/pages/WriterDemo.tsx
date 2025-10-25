/**
 * Writer Theme Demo Page
 *
 * Showcases full navigation: DeckListScreen → CardListScreen → CardEditorScreen.
 * Demonstrates the brutalist aesthetic and Writer theme in action.
 *
 * Features demonstrated:
 * - Deck list home view (all story projects)
 * - Collapsible card list with 4px category decorators
 * - Sticky headers with monospace titles
 * - Floating action buttons
 * - Full-screen card editor
 * - Category picker with color previews
 * - 6 category types with color-coded strips
 * - Zero animations (instant state changes)
 * - Sharp edges, flat design
 * - Full CRUD operations
 */

import * as React from 'react';
import { useState, useEffect } from 'react';
import { DeckListScreen, Deck } from '../screens/DeckListScreen';
import { CardListScreen, NoteCard } from '../screens/CardListScreen';
import { CardEditorScreen } from '../screens/CardEditorScreen';
import { sampleDecks, cardsByDeck } from '../data/sampleDecks';
import { themeManager } from '../design-system/theme/theme-manager';

type Screen = 'decks' | 'cards' | 'editor';

export const WriterDemo: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('decks');
  const [decks, setDecks] = useState<Deck[]>(sampleDecks);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [cardsByDeckState, setCardsByDeckState] = useState<Record<string, NoteCard[]>>(cardsByDeck);
  const [editingCard, setEditingCard] = useState<NoteCard | null>(null);

  // Ensure Writer theme is active
  useEffect(() => {
    const activateTheme = async () => {
      await themeManager.switchTheme('writer');
      console.log('Writer theme activated for demo');
    };

    activateTheme();
  }, []);

  // Get current deck and cards
  const selectedDeck = decks.find((d) => d.id === selectedDeckId);
  const currentCards = selectedDeckId ? cardsByDeckState[selectedDeckId] || [] : [];

  const handleSelectDeck = (deckId: string) => {
    setSelectedDeckId(deckId);
    setCurrentScreen('cards');
  };

  const handleAddDeck = () => {
    const title = prompt('Enter deck name:');
    if (title && title.trim()) {
      const newDeck: Deck = {
        id: `deck-${Date.now()}`,
        title: title.trim(),
        cardCount: 0,
        lastUpdated: new Date(),
      };
      setDecks((prev) => [...prev, newDeck]);
      setCardsByDeckState((prev) => ({ ...prev, [newDeck.id]: [] }));
    }
  };

  const handleBackToDecks = () => {
    setSelectedDeckId(null);
    setCurrentScreen('decks');
  };

  const handleAddCard = () => {
    if (!selectedDeckId) return;
    setEditingCard(null);
    setCurrentScreen('editor');
  };

  const handleEditCard = (cardId: string) => {
    if (!selectedDeckId) return;
    const card = currentCards.find((c) => c.id === cardId);
    if (card) {
      setEditingCard(card);
      setCurrentScreen('editor');
    }
  };

  const handleDeleteCard = (cardId: string) => {
    if (!selectedDeckId) return;
    if (confirm('Delete this card?')) {
      setCardsByDeckState((prev) => ({
        ...prev,
        [selectedDeckId]: prev[selectedDeckId].filter((c) => c.id !== cardId),
      }));

      // Update deck metadata
      setDecks((prev) =>
        prev.map((d) =>
          d.id === selectedDeckId
            ? { ...d, cardCount: d.cardCount - 1, lastUpdated: new Date() }
            : d
        )
      );
    }
  };

  const handleSaveCard = (data: { title: string; category: NoteCard['category']; content: string }) => {
    if (!selectedDeckId) return;

    if (editingCard) {
      // Update existing card
      setCardsByDeckState((prev) => ({
        ...prev,
        [selectedDeckId]: prev[selectedDeckId].map((c) =>
          c.id === editingCard.id
            ? { ...c, title: data.title, category: data.category, content: data.content }
            : c
        ),
      }));
    } else {
      // Create new card
      const newCard: NoteCard = {
        id: `card-${Date.now()}`,
        title: data.title,
        category: data.category,
        content: data.content,
      };
      setCardsByDeckState((prev) => ({
        ...prev,
        [selectedDeckId]: [...(prev[selectedDeckId] || []), newCard],
      }));

      // Update deck metadata
      setDecks((prev) =>
        prev.map((d) =>
          d.id === selectedDeckId
            ? { ...d, cardCount: d.cardCount + 1, lastUpdated: new Date() }
            : d
        )
      );
    }

    // Update deck last updated time
    setDecks((prev) =>
      prev.map((d) => (d.id === selectedDeckId ? { ...d, lastUpdated: new Date() } : d))
    );

    setCurrentScreen('cards');
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
    setCurrentScreen('cards');
  };

  // Render appropriate screen
  if (currentScreen === 'editor') {
    return (
      <CardEditorScreen
        mode={editingCard ? 'edit' : 'create'}
        initialTitle={editingCard?.title}
        initialCategory={editingCard?.category}
        initialContent={editingCard?.content}
        onSave={handleSaveCard}
        onCancel={handleCancelEdit}
      />
    );
  }

  if (currentScreen === 'cards' && selectedDeck) {
    return (
      <CardListScreen
        deckTitle={selectedDeck.title}
        cards={currentCards}
        onBack={handleBackToDecks}
        onAddCard={handleAddCard}
        onEditCard={handleEditCard}
        onDeleteCard={handleDeleteCard}
      />
    );
  }

  // Default: show deck list
  return (
    <DeckListScreen
      decks={decks}
      onSelectDeck={handleSelectDeck}
      onAddDeck={handleAddDeck}
    />
  );
};

export default WriterDemo;
