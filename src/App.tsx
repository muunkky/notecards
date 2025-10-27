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
import { Timestamp, doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase/firebase";

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

  // Real card state from Firebase (for current deck)
  const [cards, setCards] = useState<NoteCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);

  // Load decks from Firebase when user is authenticated
  useEffect(() => {
    if (user) {
      loadDecks();
    }
  }, [user]);

  // Load cards when navigating to a deck
  useEffect(() => {
    if (user && navState.deckId && navState.screen === 'cardList') {
      loadCards(navState.deckId);
    }
  }, [user, navState.deckId, navState.screen]);

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

  const loadCards = async (deckId: string) => {
    if (!user) return;

    try {
      setCardsLoading(true);
      // Query cards subcollection under deck
      const cardsRef = collection(db, 'decks', deckId, 'cards');
      const snapshot = await getDocs(cardsRef);

      const deckCards: NoteCard[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || '',
          category: data.category || 'other',
          content: data.content || '',
          order: data.order || 0, // Add order field
        };
      });

      // Sort by order field, then by creation time
      deckCards.sort((a, b) => (a.order || 0) - (b.order || 0));

      setCards(deckCards);
    } catch (error) {
      console.error('Failed to load cards:', error);
    } finally {
      setCardsLoading(false);
    }
  };

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

      // Firestore document (matches security rules schema)
      const firestoreDeck = {
        ownerId: user.uid,  // Security rules expect 'ownerId', not 'userId'
        title: name,
        createdAt: Timestamp.fromMillis(now),  // Firestore Timestamp type
        updatedAt: Timestamp.fromMillis(now),
      };

      // Save to Firebase
      await setDeck(user.uid, deckId, firestoreDeck as any);

      // Local state representation (for UI)
      const localDeck: LocalDeck = {
        id: deckId,
        title: name,
        cardCount: 0,
        lastUpdated: now,
        userId: user.uid,
        createdAt: now,
        synced: true,
        pendingChanges: false,
      };

      // Update local state for instant UI feedback
      setDecks(prevDecks => [...prevDecks, localDeck]);

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
      // Find card data from real cards state
      const card = cards.find((c: NoteCard) => c.id === cardId);
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

  const handleMoveCardUp = async (cardId: string, currentIndex: number) => {
    if (!user || !navState.deckId || currentIndex <= 0) return;

    try {
      // Find the two cards to swap
      const currentCard = cards[currentIndex];
      const previousCard = cards[currentIndex - 1];

      if (!currentCard || !previousCard) return;

      // Swap order values
      const currentOrder = currentCard.order ?? currentIndex;
      const previousOrder = previousCard.order ?? currentIndex - 1;

      // Update both cards in Firebase
      const currentCardRef = doc(db, 'decks', navState.deckId, 'cards', currentCard.id);
      const previousCardRef = doc(db, 'decks', navState.deckId, 'cards', previousCard.id);

      await setDoc(currentCardRef, { order: previousOrder }, { merge: true });
      await setDoc(previousCardRef, { order: currentOrder }, { merge: true });

      // Update local state for instant feedback
      const newCards = [...cards];
      newCards[currentIndex] = previousCard;
      newCards[currentIndex - 1] = currentCard;
      newCards[currentIndex].order = currentOrder;
      newCards[currentIndex - 1].order = previousOrder;
      setCards(newCards);

      console.log(`✅ Moved card up: ${currentCard.title}`);
    } catch (error) {
      console.error('Failed to move card up:', error);
    }
  };

  const handleMoveCardDown = async (cardId: string, currentIndex: number) => {
    if (!user || !navState.deckId || currentIndex >= cards.length - 1) return;

    try {
      // Find the two cards to swap
      const currentCard = cards[currentIndex];
      const nextCard = cards[currentIndex + 1];

      if (!currentCard || !nextCard) return;

      // Swap order values
      const currentOrder = currentCard.order ?? currentIndex;
      const nextOrder = nextCard.order ?? currentIndex + 1;

      // Update both cards in Firebase
      const currentCardRef = doc(db, 'decks', navState.deckId, 'cards', currentCard.id);
      const nextCardRef = doc(db, 'decks', navState.deckId, 'cards', nextCard.id);

      await setDoc(currentCardRef, { order: nextOrder }, { merge: true });
      await setDoc(nextCardRef, { order: currentOrder }, { merge: true });

      // Update local state for instant feedback
      const newCards = [...cards];
      newCards[currentIndex] = nextCard;
      newCards[currentIndex + 1] = currentCard;
      newCards[currentIndex].order = currentOrder;
      newCards[currentIndex + 1].order = nextOrder;
      setCards(newCards);

      console.log(`✅ Moved card down: ${currentCard.title}`);
    } catch (error) {
      console.error('Failed to move card down:', error);
    }
  };

  const handleSaveCard = async (data: { title: string; category: CategoryValue; content: string }) => {
    if (!user || !navState.deckId) return;

    try {
      if (navState.editorMode === 'create') {
        // Create card in Firebase subcollection
        const cardId = `card-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const now = Timestamp.now();

        // Calculate next order value (max + 1)
        const maxOrder = cards.reduce((max, card) => Math.max(max, card.order ?? 0), -1);
        const newOrder = maxOrder + 1;

        const cardRef = doc(db, 'decks', navState.deckId, 'cards', cardId);
        await setDoc(cardRef, {
          title: data.title,
          category: data.category,
          content: data.content,
          order: newOrder,
          createdAt: now,
          updatedAt: now,
        });

        // Update local state for instant UI feedback
        const newCard: NoteCard = {
          id: cardId,
          title: data.title,
          category: data.category,
          content: data.content,
          order: newOrder,
        };
        setCards(prevCards => [...prevCards, newCard]);

        console.log('✅ Card created:', data.title, cardId);
      } else {
        // TODO: Update card in Firebase
        console.log('Update card:', navState.cardId, data);
      }

      // Navigate back to card list
      if (navState.deckId && navState.deckTitle) {
        navigateToCardList(navState.deckId, navState.deckTitle);
      }
    } catch (error) {
      console.error('Failed to save card:', error);
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
            cards={cards}
            onBack={navigateToDeckList}
            onAddCard={handleAddCard}
            onEditCard={handleEditCard}
            onDeleteCard={handleDeleteCard}
            onMoveCardUp={handleMoveCardUp}
            onMoveCardDown={handleMoveCardDown}
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