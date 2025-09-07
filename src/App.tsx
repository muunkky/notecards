import { useState } from "react";
import { useAuth } from "./providers/AuthProvider";
import LoginScreen from "./features/auth/LoginScreen";
import DeckScreen from "./features/decks/DeckScreen";
import CardScreen from "./features/cards/CardScreen";

// Loading component for smooth transitions
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
    <div className="flex items-center space-x-3 text-white">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      <span className="text-lg font-medium">Loading...</span>
    </div>
  </div>
);

// Simple navigation state management
type Screen = 'decks' | 'cards'

interface AppState {
  currentScreen: Screen
  selectedDeckId: string | null
  selectedDeckTitle: string | null
  isTransitioning: boolean
}

function App() {
  const { user, loading } = useAuth();
  const [appState, setAppState] = useState<AppState>({
    currentScreen: 'decks',
    selectedDeckId: null,
    selectedDeckTitle: null,
    isTransitioning: false
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <header role="banner" className="sr-only">
          <h1>Notecards Study App</h1>
        </header>
        <main role="main">
          <LoginScreen />
        </main>
      </div>
    );
  }

  // Enhanced navigation with smooth transitions
  const navigateToCards = (deckId: string, deckTitle: string) => {
    setAppState(prev => ({ ...prev, isTransitioning: true }));
    
    setTimeout(() => {
      setAppState({
        currentScreen: 'cards',
        selectedDeckId: deckId,
        selectedDeckTitle: deckTitle,
        isTransitioning: false
      });
    }, 150); // Short transition delay
  };

  const navigateToDecks = () => {
    setAppState(prev => ({ ...prev, isTransitioning: true }));
    
    setTimeout(() => {
      setAppState({
        currentScreen: 'decks',
        selectedDeckId: null,
        selectedDeckTitle: null,
        isTransitioning: false
      });
    }, 150); // Short transition delay
  };

  // Show loading during transitions
  if (appState.isTransitioning) {
    return <LoadingSpinner />;
  }

  // Render appropriate screen based on state with transitions
  const currentContent = () => {
    switch (appState.currentScreen) {
      case 'cards':
        return (
          <CardScreen 
            deckId={appState.selectedDeckId!}
            deckTitle={appState.selectedDeckTitle}
            onBack={navigateToDecks}
          />
        );
      case 'decks':
      default:
        return (
          <DeckScreen onSelectDeck={navigateToCards} />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Skip Links for Accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-3 z-50 rounded-br"
      >
        Skip to main content
      </a>
      
      <header role="banner" className="sr-only">
        <h1>Notecards Study App</h1>
        <nav role="navigation" aria-label="Main navigation">
          {/* Navigation will be handled by individual screens */}
        </nav>
      </header>
      
      <main role="main" id="main-content" className={appState.isTransitioning ? "opacity-50 transition-opacity" : "transition-opacity"}>
        {currentContent()}
      </main>
      
      <footer role="contentinfo" className="sr-only">
        <p>Notecards Study App - Organize your learning materials</p>
      </footer>
    </div>
  );
}

export default App;