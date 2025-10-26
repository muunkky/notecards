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
import { BottomSheet } from '../design-system/components/BottomSheet';
import { sampleDecks, cardsByDeck } from '../data/sampleDecks';
import { themeManager } from '../design-system/theme/theme-manager';

type Screen = 'decks' | 'cards' | 'editor';

export const WriterDemo: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('decks');
  const [decks, setDecks] = useState<Deck[]>(sampleDecks);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [cardsByDeckState, setCardsByDeckState] = useState<Record<string, NoteCard[]>>(cardsByDeck);
  const [editingCard, setEditingCard] = useState<NoteCard | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState<boolean>(false);

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

  const handleRenameDeck = (deckId: string, newTitle: string) => {
    setDecks((prev) =>
      prev.map((d) =>
        d.id === deckId
          ? { ...d, title: newTitle, lastUpdated: new Date() }
          : d
      )
    );
  };

  const handleDeleteDeck = (deckId: string) => {
    // Remove deck
    setDecks((prev) => prev.filter((d) => d.id !== deckId));
    // Remove cards for this deck
    setCardsByDeckState((prev) => {
      const { [deckId]: _, ...rest } = prev;
      return rest;
    });
    // If we're currently viewing this deck, go back to deck list
    if (selectedDeckId === deckId) {
      setSelectedDeckId(null);
      setCurrentScreen('decks');
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

  // Demo button styles (fixed bottom-left corner)
  const demoButtonStyles: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    background: 'var(--primitive-black)',
    color: 'var(--primitive-white)',
    border: '2px solid var(--primitive-black)',
    borderRadius: 'var(--primitive-radii-none)', // 0px
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    zIndex: 999,
    fontFamily: 'var(--semantic-typography-font-primary)',
    transition: 'var(--primitive-transitions-none)', // 0ms
  };

  // Default: show deck list
  return (
    <>
      <DeckListScreen
        decks={decks}
        onSelectDeck={handleSelectDeck}
        onAddDeck={handleAddDeck}
        onRenameDeck={handleRenameDeck}
        onDeleteDeck={handleDeleteDeck}
      />

      {/* Demo button to test BottomSheet */}
      <button
        style={demoButtonStyles}
        onClick={() => setIsBottomSheetOpen(true)}
        aria-label="Open BottomSheet Demo"
      >
        🎨 BottomSheet Demo
      </button>

      {/* BottomSheet Demo */}
      <BottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        title="BottomSheet Component"
      >
        <div style={{ fontFamily: 'var(--semantic-typography-font-primary)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px' }}>
            Mobile-Native Action Sheet
          </h3>
          <p style={{ marginBottom: '16px', lineHeight: 1.6 }}>
            This is a BottomSheet component following the Writer theme brutalist design philosophy:
          </p>
          <ul style={{ marginBottom: '16px', lineHeight: 1.8 }}>
            <li>Zero animations (instant appear/disappear)</li>
            <li>Sharp edges (0px border radius)</li>
            <li>75% black scrim backdrop</li>
            <li>Dismissible via backdrop tap, ESC key, or close button</li>
            <li>Full-width mobile design</li>
            <li>Accessible (ARIA labels, focus management)</li>
          </ul>
          <p style={{ color: 'var(--primitive-gray-600)', fontSize: '14px', marginBottom: 0 }}>
            Try tapping the backdrop or pressing ESC to dismiss.
          </p>
        </div>
      </BottomSheet>
    </>
  );
};

export default WriterDemo;
