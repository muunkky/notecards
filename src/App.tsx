import { useState, useEffect } from "react";
import { useAuth } from "./providers/AuthProvider";
import LoginScreen from "./features/auth/LoginScreen";
import { DeckListScreen } from "./screens/DeckListScreen";
import { CardListScreen, NoteCard } from "./screens/CardListScreen";
import { CardEditorScreen } from "./screens/CardEditorScreen";
import { CategoryValue } from "./domain/categories";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { getUserDecks, setDeck } from "./services/firebase-service";
import { LocalDeck } from "./services/storage/schema";

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

  // Real deck state from Firebase
  const [decks, setDecks] = useState<LocalDeck[]>([]);
  const [decksLoading, setDecksLoading] = useState(true);

  // Load decks from Firebase when user is authenticated
  useEffect(() => {
    if (user) {
      loadDecks();
    }
  }, [user]);

  const loadDecks = async () => {
    if (!user) return;

    try {
      setDecksLoading(true);
      const userDecks = await getUserDecks(user.uid);
      setDecks(userDecks);
    } catch (error) {
      console.error('Failed to load decks:', error);
    } finally {
      setDecksLoading(false);
    }
  };

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
  const handleAddDeck = async (name: string) => {
    if (!user) return;

    try {
      // Generate new deck ID
      const deckId = `deck-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const now = Date.now();

      const newDeck: LocalDeck = {
        id: deckId,
        title: name,
        cardCount: 0,
        lastUpdated: now,
        userId: user.uid,
        createdAt: now,
        synced: true,
        pendingChanges: false,
      };

      // Save to Firebase
      await setDeck(user.uid, deckId, newDeck);

      // Update local state for instant UI feedback
      setDecks(prevDecks => [...prevDecks, newDeck]);

      console.log('✅ Deck created:', name, deckId);
    } catch (error) {
      console.error('Failed to create deck:', error);
    }
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

  // Convert LocalDeck to DeckListScreen Deck format
  const convertToDisplayDecks = (localDecks: LocalDeck[]) => {
    return localDecks.map(deck => ({
      id: deck.id,
      title: deck.title,
      cardCount: deck.cardCount,
      lastUpdated: new Date(deck.lastUpdated)
    }));
  };

  // Render current screen (instant state changes, zero animations)
  const renderScreen = () => {
    switch (navState.screen) {
      case 'deckList':
        return (
          <DeckListScreen
            decks={convertToDisplayDecks(decks)}
            onSelectDeck={(deckId) => {
              const deck = decks.find(d => d.id === deckId);
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