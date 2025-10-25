/**
 * Writer Theme Demo Page
 *
 * Showcases CardListScreen and CardEditorScreen with navigation.
 * Demonstrates the brutalist aesthetic and Writer theme in action.
 *
 * Features demonstrated:
 * - Collapsible card list with 4px category decorators
 * - Sticky header with monospace title
 * - Floating action button
 * - Full-screen card editor
 * - Category picker with color previews
 * - 6 category types with color-coded strips
 * - Zero animations (instant state changes)
 * - Sharp edges, flat design
 */

import * as React from 'react';
import { useState, useEffect } from 'react';
import { CardListScreen, NoteCard } from '../screens/CardListScreen';
import { CardEditorScreen } from '../screens/CardEditorScreen';
import { sampleScreenplayCards } from '../data/sampleCards';
import { themeManager } from '../design-system/theme/theme-manager';

type Screen = 'list' | 'editor';

export const WriterDemo: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('list');
  const [cards, setCards] = useState<NoteCard[]>(sampleScreenplayCards);
  const [editingCard, setEditingCard] = useState<NoteCard | null>(null);

  // Ensure Writer theme is active
  useEffect(() => {
    const activateTheme = async () => {
      await themeManager.switchTheme('writer');
      console.log('Writer theme activated for demo');
    };

    activateTheme();
  }, []);

  const handleBack = () => {
    console.log('Back button clicked - would navigate to deck list');
    alert('Back to Deck List (not implemented in demo)');
  };

  const handleAddCard = () => {
    console.log('Add card button clicked');
    setEditingCard(null);
    setCurrentScreen('editor');
  };

  const handleEditCard = (cardId: string) => {
    console.log('Edit card:', cardId);
    const card = cards.find((c) => c.id === cardId);
    if (card) {
      setEditingCard(card);
      setCurrentScreen('editor');
    }
  };

  const handleDeleteCard = (cardId: string) => {
    console.log('Delete card:', cardId);
    if (confirm('Delete this card?')) {
      setCards((prev) => prev.filter((c) => c.id !== cardId));
    }
  };

  const handleSaveCard = (data: { title: string; category: NoteCard['category']; content: string }) => {
    if (editingCard) {
      // Update existing card
      setCards((prev) =>
        prev.map((c) =>
          c.id === editingCard.id
            ? { ...c, title: data.title, category: data.category, content: data.content }
            : c
        )
      );
    } else {
      // Create new card
      const newCard: NoteCard = {
        id: `card-${Date.now()}`,
        title: data.title,
        category: data.category,
        content: data.content,
      };
      setCards((prev) => [...prev, newCard]);
    }
    setCurrentScreen('list');
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
    setCurrentScreen('list');
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

  return (
    <CardListScreen
      deckTitle="My Screenplay"
      cards={cards}
      onBack={handleBack}
      onAddCard={handleAddCard}
      onEditCard={handleEditCard}
      onDeleteCard={handleDeleteCard}
    />
  );
};

export default WriterDemo;
