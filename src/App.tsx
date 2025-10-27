import { useState } from "react";
import { useAuth } from "./providers/AuthProvider";
import LoginScreen from "./features/auth/LoginScreen";
import { DeckListScreen } from "./screens/DeckListScreen";
import { CardListScreen, NoteCard } from "./screens/CardListScreen";
import { CardEditorScreen } from "./screens/CardEditorScreen";
import { CategoryValue } from "./domain/categories";
import { OfflineIndicator } from "./components/OfflineIndicator";

// Loading component for auth loading
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
    <div className="flex items-center space-x-3 text-white">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      <span className="text-lg font-medium">Loading...</span>
    </div>
  </div>
);

// Navigation state management (Writer theme: instant state changes, zero animations)
type Screen = 'deckList' | 'cardList' | 'cardEditor';

interface NavigationState {
  screen: Screen;
  deckId: string | null;
  deckTitle: string | null;
  cardId: string | null;
  editorMode: 'create' | 'edit';
  initialCardData: {
    title: string;
    category: CategoryValue;
    content: string;
  } | null;
}

function App() {
  const { user, loading } = useAuth();

  // Navigation state (Writer theme: instant state changes, zero animations)
  const [navState, setNavState] = useState<NavigationState>({
    screen: 'deckList',
    deckId: null,
    deckTitle: null,
    cardId: null,
    editorMode: 'create',
    initialCardData: null,
  });

  // Mock data (will be replaced with Firebase data in card integration)
  const mockDecks = [
    { id: 'deck-1', title: 'Story Project Alpha', cardCount: 12, lastUpdated: new Date(Date.now() - 1000 * 60 * 30) },
    { id: 'deck-2', title: 'Character Development', cardCount: 8, lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 2) },
    { id: 'deck-3', title: 'World Building', cardCount: 15, lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) },
  ];

  const mockCards: NoteCard[] = [
    { id: 'card-1', title: 'Opening Scene', category: 'action' as CategoryValue, content: 'The protagonist enters the abandoned warehouse...' },
    { id: 'card-2', title: 'Main Character Arc', category: 'character' as CategoryValue, content: 'Sarah begins as a skeptic but learns to trust...' },
    { id: 'card-3', title: 'Central Conflict', category: 'conflict' as CategoryValue, content: 'The tension between duty and personal freedom...' },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <header role="banner" className="sr-only">
          <h1>Notecards</h1>
        </header>
        <main role="main">
          <LoginScreen />
        </main>
      </div>
    );
  }

  // Navigation functions (instant state changes, no animations)
  const navigateToDeckList = () => {
    setNavState({
      screen: 'deckList',
      deckId: null,
      deckTitle: null,
      cardId: null,
      editorMode: 'create',
      initialCardData: null,
    });
  };

  const navigateToCardList = (deckId: string, deckTitle: string) => {
    setNavState({
      screen: 'cardList',
      deckId,
      deckTitle,
      cardId: null,
      editorMode: 'create',
      initialCardData: null,
    });
  };

  const navigateToCardEditor = (
    deckId: string,
    mode: 'create' | 'edit',
    cardId?: string,
    initialData?: { title: string; category: CategoryValue; content: string }
  ) => {
    setNavState({
      screen: 'cardEditor',
      deckId,
      deckTitle: navState.deckTitle,
      cardId: cardId || null,
      editorMode: mode,
      initialCardData: initialData || null,
    });
  };

  // Screen-specific handlers
  const handleAddDeck = (name: string) => {
    // TODO: Create deck in Firebase
    console.log('Create deck:', name);
    // For now, just log. When Firebase integration is complete,
    // the deck will be created and instantly appear in the list
  };

  const handleRenameDeck = (deckId: string, newTitle: string) => {
    // TODO: Update deck in Firebase
    console.log('Rename deck:', deckId, newTitle);
  };

  const handleDeleteDeck = (deckId: string) => {
    // TODO: Delete deck from Firebase
    console.log('Delete deck:', deckId);
  };

  const handleAddCard = () => {
    if (navState.deckId) {
      navigateToCardEditor(navState.deckId, 'create');
    }
  };

  const handleEditCard = (cardId: string) => {
    if (navState.deckId) {
      // Find card data (mock for now)
      const card = mockCards.find(c => c.id === cardId);
      if (card) {
        navigateToCardEditor(navState.deckId, 'edit', cardId, {
          title: card.title,
          category: card.category,
          content: card.content,
        });
      }
    }
  };

  const handleDeleteCard = (cardId: string) => {
    // TODO: Delete card from Firebase
    console.log('Delete card:', cardId);
  };

  const handleSaveCard = (data: { title: string; category: CategoryValue; content: string }) => {
    if (navState.editorMode === 'create') {
      // TODO: Create card in Firebase
      console.log('Create card:', data);
    } else {
      // TODO: Update card in Firebase
      console.log('Update card:', navState.cardId, data);
    }
    // Navigate back to card list
    if (navState.deckId && navState.deckTitle) {
      navigateToCardList(navState.deckId, navState.deckTitle);
    }
  };

  const handleCancelEditor = () => {
    // Navigate back to card list
    if (navState.deckId && navState.deckTitle) {
      navigateToCardList(navState.deckId, navState.deckTitle);
    }
  };

  // Render current screen (instant state changes, zero animations)
  const renderScreen = () => {
    switch (navState.screen) {
      case 'deckList':
        return (
          <DeckListScreen
            decks={mockDecks}
            onSelectDeck={(deckId) => {
              const deck = mockDecks.find(d => d.id === deckId);
              if (deck) navigateToCardList(deckId, deck.title);
            }}
            onAddDeck={handleAddDeck}
            onRenameDeck={handleRenameDeck}
            onDeleteDeck={handleDeleteDeck}
          />
        );

      case 'cardList':
        return (
          <CardListScreen
            deckTitle={navState.deckTitle || 'Untitled Deck'}
            cards={mockCards}
            onBack={navigateToDeckList}
            onAddCard={handleAddCard}
            onEditCard={handleEditCard}
            onDeleteCard={handleDeleteCard}
          />
        );

      case 'cardEditor':
        return (
          <CardEditorScreen
            mode={navState.editorMode}
            initialTitle={navState.initialCardData?.title}
            initialCategory={navState.initialCardData?.category}
            initialContent={navState.initialCardData?.content}
            onSave={handleSaveCard}
            onCancel={handleCancelEditor}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <OfflineIndicator />
      {renderScreen()}
    </>
  );
}

export default App;