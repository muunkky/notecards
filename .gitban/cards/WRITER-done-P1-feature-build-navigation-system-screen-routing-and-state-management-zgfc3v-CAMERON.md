# Build Navigation System - Screen Routing and State Management

**Type:** Feature  
**Priority:** P1  
**Status:** Done  
**Owner:** CAMERON

## Summary

Implemented a simple, state-based navigation system for Writer's Tool that connects DeckListScreen, CardListScreen, and CardEditorScreen with instant state changes (0ms) following brutalist design philosophy. Removed all transition animations for immediate screen transitions.

## Implementation Details

### Navigation Architecture
Built a minimalist navigation system using React state (no router library):

**NavigationState Interface:**
```typescript
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
```

**Navigation Functions:**
```typescript
navigateToDeckList()
navigateToCardList(deckId: string, deckTitle: string)
navigateToCardEditor(
  deckId: string,
  mode: 'create' | 'edit',
  cardId?: string,
  initialData?: { title: string; category: CategoryValue; content: string }
)
```

### Screen Flow

**Primary Navigation Paths:**
1. **DeckList → CardList**: User taps deck card
   - Stores deckId and deckTitle
   - Navigates to cardList screen
   - Shows cards for selected deck

2. **CardList → CardEditor (Create)**: User taps + FAB button
   - Sets editorMode to 'create'
   - Clears initialCardData
   - Opens cardEditor screen

3. **CardList → CardEditor (Edit)**: User taps Edit on card
   - Sets editorMode to 'edit'
   - Stores cardId
   - Loads initialCardData (title, category, content)
   - Opens cardEditor screen

4. **CardEditor → CardList**: User taps Save or Cancel
   - If Save: Processes card data (create or update)
   - Navigates back to cardList screen
   - Preserves deckId and deckTitle

5. **CardList → DeckList**: User taps back button (←)
   - Clears deck context
   - Returns to deckList screen

### Screen Integration

**DeckListScreen Wiring:**
```typescript
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
```

**CardListScreen Wiring:**
```typescript
<CardListScreen
  deckTitle={navState.deckTitle || 'Untitled Deck'}
  cards={mockCards}
  onBack={navigateToDeckList}
  onAddCard={handleAddCard}
  onEditCard={handleEditCard}
  onDeleteCard={handleDeleteCard}
/>
```

**CardEditorScreen Wiring:**
```typescript
<CardEditorScreen
  mode={navState.editorMode}
  initialTitle={navState.initialCardData?.title}
  initialCategory={navState.initialCardData?.category}
  initialContent={navState.initialCardData?.content}
  onSave={handleSaveCard}
  onCancel={handleCancelEditor}
/>
```

### Handler Functions

**Deck Operations:**
```typescript
handleAddDeck() - Prompt for title, create deck
handleRenameDeck(deckId, newTitle) - Update deck title
handleDeleteDeck(deckId) - Delete deck
```

**Card Operations:**
```typescript
handleAddCard() - Navigate to editor (create mode)
handleEditCard(cardId) - Find card, navigate to editor (edit mode)
handleDeleteCard(cardId) - Delete card
handleSaveCard(data) - Create or update card, navigate back
handleCancelEditor() - Navigate back to card list
```

### Files Modified
- ✅ `src/App.tsx` - Complete navigation system rewrite (+235 lines, -132 lines)

## Completed Tasks
- [x] Review existing screens and their navigation needs
- [x] Design navigation state structure (screen stack, params)
- [x] Update App.tsx with navigation system
- [x] Wire up DeckListScreen with navigation callbacks
- [x] Wire up CardListScreen with navigation callbacks
- [x] Wire up CardEditorScreen with navigation callbacks
- [x] Remove transition animations (150ms delays)
- [x] Add mock data for testing (3 decks, 3 cards)
- [x] Test navigation flows (deck → cards → editor)
- [x] Test TypeScript compilation
- [x] Commit changes and update gitban card

## Design Philosophy

### Why State-Based Navigation?
1. **Simplicity**: No heavy router library (React Router, etc.)
2. **Instant state changes**: Zero animations, immediate transitions
3. **Type-safe**: NavigationState interface ensures correctness
4. **Testable**: Pure state updates, easy to test
5. **Mobile-native feel**: Like native app navigation (instant)
6. **Writer theme aligned**: Minimalist, no decoration

### Why Remove Transition Animations?
The original App.tsx had 150ms transition delays with opacity animations:
```typescript
setTimeout(() => {
  setAppState({ ... });
}, 150); // ❌ Removed
```

Writer theme requires instant state changes:
- No setTimeout delays
- No loading spinners between screens
- No opacity transitions
- Immediate screen rendering

**Benefits:**
- Snappier feel (no waiting)
- Reduced cognitive load
- Better performance (no animation calculations)
- Accessibility (no motion triggers)

### Why Not React Router?
- **Overkill**: Only 3 screens with linear flow
- **Bundle size**: Adds unnecessary weight
- **Complexity**: URL routing not needed for mobile PWA
- **Performance**: Direct state updates faster
- **Control**: Full control over navigation behavior

## Mock Data for Testing

**Mock Decks (3):**
```typescript
{ id: 'deck-1', title: 'Story Project Alpha', cardCount: 12, lastUpdated: 30m ago }
{ id: 'deck-2', title: 'Character Development', cardCount: 8, lastUpdated: 2h ago }
{ id: 'deck-3', title: 'World Building', cardCount: 15, lastUpdated: 3d ago }
```

**Mock Cards (3):**
```typescript
{ id: 'card-1', title: 'Opening Scene', category: 'action', content: '...' }
{ id: 'card-2', title: 'Main Character Arc', category: 'character', content: '...' }
{ id: 'card-3', title: 'Central Conflict', category: 'conflict', content: '...' }
```

These will be replaced with Firebase data in the card data layer integration (card pqln2i is done, just needs App.tsx wiring).

## User Experience

### Navigation Flow
1. User opens app → sees DeckListScreen
2. User taps "Story Project Alpha" deck → instantly shows CardListScreen
3. User taps + button → instantly shows CardEditorScreen (create mode)
4. User enters title, category, content, taps Save → instantly returns to CardListScreen
5. User taps Edit on "Opening Scene" card → instantly shows CardEditorScreen (edit mode)
6. User modifies content, taps Cancel → prompts "Discard changes?" → returns to CardListScreen
7. User taps ← button → instantly returns to DeckListScreen

**Zero Delays:**
- All transitions are instant (0ms)
- No loading spinners
- No opacity fades
- No setTimeout delays
- Immediate DOM updates

### Accessibility
- **Keyboard navigation**: All screens support keyboard
- **Screen readers**: ARIA labels on all interactive elements
- **High contrast**: Black/white brutalist aesthetic
- **No motion**: Zero animations safe for all users
- **Clear affordances**: Buttons, links, back arrows

## Benefits Over Previous Navigation

### Before (Old App.tsx)
```typescript
// ❌ Transition delays (150ms)
setTimeout(() => { setAppState({ ... }); }, 150);

// ❌ Loading spinners between screens
if (appState.isTransitioning) return <LoadingSpinner />;

// ❌ Opacity transitions
className={appState.isTransitioning ? "opacity-50" : ""}

// ❌ Only 2 screens (decks, cards)
type Screen = 'decks' | 'cards'

// ❌ Used old DeckScreen/CardScreen components
<DeckScreen onSelectDeck={...} />
```

### After (New App.tsx)
```typescript
// ✅ Instant state changes (0ms)
setNavState({ screen: 'cardList', ... });

// ✅ No loading spinners
return <>{renderScreen()}</>;

// ✅ No transitions
// (removed all opacity/animation classes)

// ✅ 3 screens (deckList, cardList, cardEditor)
type Screen = 'deckList' | 'cardList' | 'cardEditor'

// ✅ Uses Writer screens
<DeckListScreen decks={...} />
<CardListScreen cards={...} />
<CardEditorScreen mode={...} />
```

### Improvements
- **3x more screens**: Now supports card editor
- **Instant transitions**: Removed 150ms delays
- **Better state management**: NavigationState tracks all context
- **Type safety**: Strong TypeScript typing throughout
- **Cleaner code**: Removed transition complexity
- **Better UX**: No waiting for animations

## Technical Implementation

### State Management
```typescript
const [navState, setNavState] = useState<NavigationState>({
  screen: 'deckList',
  deckId: null,
  deckTitle: null,
  cardId: null,
  editorMode: 'create',
  initialCardData: null,
});
```

### Navigation Pattern
All navigation functions use direct state updates:
```typescript
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
```

No setTimeout, no transitions, no loading states - just instant updates.

### Render Pattern
```typescript
const renderScreen = () => {
  switch (navState.screen) {
    case 'deckList': return <DeckListScreen {...props} />;
    case 'cardList': return <CardListScreen {...props} />;
    case 'cardEditor': return <CardEditorScreen {...props} />;
  }
};

return <>{renderScreen()}</>;
```

Simple, direct, instant.

## Testing
- TypeScript compilation: ✅ Passed
- Manual testing: Navigation flow
- DeckList → CardList: Works instantly
- CardList → CardEditor (create): Works instantly
- CardList → CardEditor (edit): Works instantly, loads initial data
- CardEditor → CardList: Works instantly
- CardList → DeckList: Works instantly
- State preservation: DeckId, deckTitle carried through navigation
- Editor modes: Create/edit distinguished correctly
- Cancel with unsaved changes: Prompts confirmation

## Future Enhancements

### Deep Linking (PWA)
When converting to full PWA, add URL support:
```typescript
// Read URL params on mount
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const deckId = params.get('deck');
  if (deckId) navigateToCardList(deckId, 'Deck');
}, []);

// Update URL on navigation (without page reload)
const navigateToCardList = (deckId, deckTitle) => {
  window.history.pushState({}, '', `?deck=${deckId}`);
  setNavState({ ... });
};
```

### Navigation History
Add back button support for browser:
```typescript
const [history, setHistory] = useState<NavigationState[]>([]);

const navigate = (newState: NavigationState) => {
  setHistory([...history, navState]);
  setNavState(newState);
};

window.onpopstate = () => {
  if (history.length > 0) {
    setNavState(history.pop()!);
  }
};
```

### Transition Hooks (Optional)
For future native app integration:
```typescript
onBeforeNavigate?: () => void;
onAfterNavigate?: () => void;

// Could trigger native haptics, analytics, etc.
```

## Integration Points

### Firebase Data Layer (Next)
Replace mock data with Firebase queries:
```typescript
// TODO: Import from card data layer (card pqln2i)
import { useDecks, useCards } from './hooks/useFirebaseData';

const { decks, loading } = useDecks();
const { cards, loading: cardsLoading } = useCards(navState.deckId);
```

### Touch Gestures (Future)
Navigation can be triggered by gestures:
```typescript
// Swipe right on CardListScreen → navigateToDeckList()
// Swipe left on card → handleDeleteCard()
```

### Deep Linking (Future)
URLs can map to navigation state:
```typescript
// /decks → deckList screen
// /decks/abc123 → cardList screen for deck abc123
// /decks/abc123/cards/def456 → cardEditor screen for card def456
```

## Design Rationale

### Why Document This?
Navigation is the backbone of the app. Comprehensive documentation ensures:
- New developers understand navigation flow
- State structure is clear and maintainable
- Zero animation philosophy is preserved
- Integration points are well-defined
- Future enhancements have clear patterns

### Why This Architecture?
- **State-based**: Simplest approach for 3 screens
- **Instant**: Aligns with Writer theme brutalism
- **Type-safe**: TypeScript ensures correctness
- **Testable**: Pure state updates, no side effects
- **Scalable**: Easy to add more screens later

### Why Mock Data?
- Allows testing navigation without Firebase dependency
- Demonstrates data structure for screens
- Provides immediate visual feedback
- Will be replaced with Firebase hooks

## Next Steps
This completes the navigation system:
1. ✅ State-based navigation (3 screens)
2. ✅ Instant state changes (0ms)
3. ✅ All screens wired up
4. ✅ Create/edit modes supported
5. ✅ Back navigation working

Remaining integrations:
- Replace mock data with Firebase (card pqln2i already done)
- Add touch gestures (card 010j1e)
- Add swipe to delete (card j4u6ru)
- Add card reordering (card tsc2ox)
