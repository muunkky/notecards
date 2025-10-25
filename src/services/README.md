# Writer Services - Firebase Data Layer

This directory contains the Firebase data layer for the Writer's Tool.

## Architecture

### Data Flow
```
Writer UI Components (NoteCard, WriterDeck)
           ↕ (adapters)
    writer-services.ts
           ↕ (Firebase SDK)
      Firestore Database
```

### Files

- **writer-services.ts**: Writer-specific CRUD operations and data adapters
  - Deck operations: `getWriterDecks`, `createWriterDeck`, `updateWriterDeck`, `deleteWriterDeck`
  - Card operations: `getWriterCards`, `createWriterCard`, `updateWriterCard`, `deleteWriterCard`
  - Adapters: `cardToNoteCard`, `noteCardToCardData`, `deckToWriterDeck`

## Data Models

### Writer UI Models (screens/)
- `NoteCard`: `{ id, title, content, category }`
- `WriterDeck`: `{ id, title, cardCount, lastUpdated }`

### Firebase Models (types/)
- `Card`: `{ id, deckId, title, body, orderIndex, category?, ... }`
- `Deck`: `{ id, title, ownerId, createdAt, updatedAt, ... }`

### Field Mappings
- `NoteCard.content` ↔ `Card.body`
- `WriterDeck.lastUpdated` ↔ `Deck.updatedAt`
- `WriterDeck.cardCount` ← calculated from query

## Usage Example

```typescript
import { auth } from '../firebase/firebase';
import {
  getWriterDecks,
  createWriterDeck,
  getWriterCards,
  createWriterCard,
  updateWriterCard,
  deleteWriterCard
} from '../services/writer-services';

// Requires authenticated user
const userId = auth.currentUser?.uid;
if (!userId) throw new Error('User not authenticated');

// Get all decks
const decks = await getWriterDecks(userId);

// Create new deck
const deckId = await createWriterDeck(userId, 'My Screenplay');

// Get cards in a deck
const cards = await getWriterCards(deckId);

// Create card
const cardId = await createWriterCard(deckId, {
  title: 'INT. COFFEE SHOP - DAY',
  category: 'location',
  content: 'A bustling urban coffee shop...'
});

// Update card
await updateWriterCard(cardId, {
  title: 'INT. COFFEE SHOP - MORNING',
  content: 'Updated content...'
});

// Delete card
await deleteWriterCard(cardId, deckId);
```

## Integration with WriterDemo

To integrate Firebase with WriterDemo:

1. **Add auth check**:
```typescript
import { auth } from '../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      setUserId(user.uid);
    }
  });
  return () => unsubscribe();
}, []);
```

2. **Replace in-memory state with Firebase calls**:
```typescript
// Instead of:
const [decks, setDecks] = useState<Deck[]>(sampleDecks);

// Use:
useEffect(() => {
  if (userId) {
    getWriterDecks(userId).then(setDecks);
  }
}, [userId]);
```

3. **Replace handlers**:
```typescript
// Instead of:
const handleAddDeck = () => {
  const title = prompt('Enter deck name:');
  if (title) {
    setDecks([...decks, newDeck]);
  }
};

// Use:
const handleAddDeck = async () => {
  const title = prompt('Enter deck name:');
  if (title && userId) {
    await createWriterDeck(userId, title);
    // Refetch decks
    const updated = await getWriterDecks(userId);
    setDecks(updated);
  }
};
```

## Testing

Writer services require Firebase emulators for local testing:

```bash
# Start emulators
npm run emulators:start

# Run tests (in separate terminal)
npm run test:unit -- writer-services
```

## Future Enhancements

- Real-time subscriptions using `onSnapshot()` for live updates
- Optimistic UI updates with local state + background sync
- Offline support using Firebase offline persistence
- Batch operations for better performance
- Error handling and retry logic
