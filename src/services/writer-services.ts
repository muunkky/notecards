/**
 * Writer Services - Firebase Data Layer for Writer's Tool
 *
 * This service layer provides Writer-specific CRUD operations that bridge
 * the Writer UI components (NoteCard, Deck) with the existing Firebase
 * infrastructure (Card, Deck).
 *
 * Architecture:
 * - Adapters: Convert between Writer's NoteCard and Firebase Card models
 * - Services: Writer-specific CRUD operations using existing Firebase functions
 * - Type-safe: Uses centralized category system and existing types
 *
 * Design Philosophy:
 * - Reuse existing Firebase infrastructure (firestore.ts)
 * - Non-breaking: category field is optional on Card model
 * - Minimal duplication: Wraps existing CRUD functions
 * - Writer-focused: API matches Writer screen interfaces
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy as firestoreOrderBy,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { Card, Deck } from '../types';
import type { NoteCard } from '../screens/CardListScreen';
import type { Deck as WriterDeck } from '../screens/DeckListScreen';
import type { CategoryValue, DEFAULT_CATEGORY } from '../domain/categories';

// Collection references
const DECKS_COLLECTION = 'decks';
const CARDS_COLLECTION = 'cards';

/**
 * Helper: Convert Firestore Timestamp to Date
 */
const timestampToDate = (timestamp: any): Date => {
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date();
};

// ============================================================================
// Data Adapters: Convert between Writer UI models and Firebase models
// ============================================================================

/**
 * Convert Firebase Card to Writer NoteCard
 * Maps: body → content, adds category with fallback
 */
export function cardToNoteCard(card: Card): NoteCard {
  return {
    id: card.id,
    title: card.title,
    content: card.body, // body → content
    category: (card.category as CategoryValue) || 'conflict', // Fallback to conflict
  };
}

/**
 * Convert Writer NoteCard to Firebase Card data
 * Maps: content → body, includes category
 */
export function noteCardToCardData(
  noteCard: Partial<NoteCard>,
  deckId: string,
  orderIndex: number
): Partial<Card> {
  return {
    ...(noteCard.title !== undefined && { title: noteCard.title }),
    ...(noteCard.content !== undefined && { body: noteCard.content }), // content → body
    ...(noteCard.category !== undefined && { category: noteCard.category }),
    deckId,
    orderIndex,
  };
}

/**
 * Convert Firebase Deck to Writer Deck
 * Maps: updatedAt → lastUpdated, adds cardCount
 */
export function deckToWriterDeck(deck: Deck, cardCount: number = 0): WriterDeck {
  return {
    id: deck.id,
    title: deck.title,
    cardCount,
    lastUpdated: deck.updatedAt,
  };
}

// ============================================================================
// Writer Deck Services
// ============================================================================

/**
 * Get all decks for current user with card counts
 * Returns Writer Deck format with cardCount populated
 */
export async function getWriterDecks(userId: string): Promise<WriterDeck[]> {
  try {
    // Get all decks owned by user
    const decksRef = collection(db, DECKS_COLLECTION);
    const decksQuery = query(
      decksRef,
      where('ownerId', '==', userId),
      firestoreOrderBy('updatedAt', 'desc')
    );
    const decksSnapshot = await getDocs(decksQuery);

    // Get cards for each deck to calculate counts
    const decks: WriterDeck[] = [];
    for (const deckDoc of decksSnapshot.docs) {
      const deckData = deckDoc.data() as Deck;
      const deck: Deck = {
        id: deckDoc.id,
        title: deckData.title,
        ownerId: deckData.ownerId,
        createdAt: timestampToDate(deckData.createdAt),
        updatedAt: timestampToDate(deckData.updatedAt),
      };

      // Count cards in this deck
      const cardsRef = collection(db, CARDS_COLLECTION);
      const cardsQuery = query(cardsRef, where('deckId', '==', deckDoc.id));
      const cardsSnapshot = await getDocs(cardsQuery);
      const cardCount = cardsSnapshot.size;

      decks.push(deckToWriterDeck(deck, cardCount));
    }

    return decks;
  } catch (error) {
    console.error('Error getting writer decks:', error);
    throw error;
  }
}

/**
 * Create a new deck
 * Returns the new deck ID
 */
export async function createWriterDeck(userId: string, title: string): Promise<string> {
  try {
    const decksRef = collection(db, DECKS_COLLECTION);
    const deckDoc = await addDoc(decksRef, {
      title,
      ownerId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return deckDoc.id;
  } catch (error) {
    console.error('Error creating writer deck:', error);
    throw error;
  }
}

/**
 * Update deck title
 */
export async function updateWriterDeck(deckId: string, title: string): Promise<void> {
  try {
    const deckRef = doc(db, DECKS_COLLECTION, deckId);
    await updateDoc(deckRef, {
      title,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating writer deck:', error);
    throw error;
  }
}

/**
 * Delete a deck and all its cards
 */
export async function deleteWriterDeck(deckId: string): Promise<void> {
  try {
    const batch = writeBatch(db);

    // Delete all cards in the deck
    const cardsRef = collection(db, CARDS_COLLECTION);
    const cardsQuery = query(cardsRef, where('deckId', '==', deckId));
    const cardsSnapshot = await getDocs(cardsQuery);
    cardsSnapshot.docs.forEach((cardDoc) => {
      batch.delete(cardDoc.ref);
    });

    // Delete the deck
    const deckRef = doc(db, DECKS_COLLECTION, deckId);
    batch.delete(deckRef);

    await batch.commit();
  } catch (error) {
    console.error('Error deleting writer deck:', error);
    throw error;
  }
}

// ============================================================================
// Writer Card Services
// ============================================================================

/**
 * Get all cards for a deck
 * Returns Writer NoteCard format sorted by orderIndex
 */
export async function getWriterCards(deckId: string): Promise<NoteCard[]> {
  try {
    const cardsRef = collection(db, CARDS_COLLECTION);
    const cardsQuery = query(
      cardsRef,
      where('deckId', '==', deckId),
      firestoreOrderBy('orderIndex', 'asc')
    );
    const cardsSnapshot = await getDocs(cardsQuery);

    return cardsSnapshot.docs.map((cardDoc) => {
      const cardData = cardDoc.data() as Card;
      const card: Card = {
        id: cardDoc.id,
        deckId: cardData.deckId,
        title: cardData.title,
        body: cardData.body,
        orderIndex: cardData.orderIndex,
        createdAt: timestampToDate(cardData.createdAt),
        updatedAt: timestampToDate(cardData.updatedAt),
        category: cardData.category,
      };
      return cardToNoteCard(card);
    });
  } catch (error) {
    console.error('Error getting writer cards:', error);
    throw error;
  }
}

/**
 * Create a new card in a deck
 * Returns the new card ID
 */
export async function createWriterCard(
  deckId: string,
  noteCard: { title: string; category: CategoryValue; content: string }
): Promise<string> {
  try {
    // Get current card count to set orderIndex
    const cardsRef = collection(db, CARDS_COLLECTION);
    const cardsQuery = query(cardsRef, where('deckId', '==', deckId));
    const cardsSnapshot = await getDocs(cardsQuery);
    const orderIndex = cardsSnapshot.size;

    // Create the card
    const cardDoc = await addDoc(cardsRef, {
      deckId,
      title: noteCard.title,
      body: noteCard.content, // content → body
      category: noteCard.category,
      orderIndex,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update deck's updatedAt timestamp
    const deckRef = doc(db, DECKS_COLLECTION, deckId);
    await updateDoc(deckRef, {
      updatedAt: serverTimestamp(),
    });

    return cardDoc.id;
  } catch (error) {
    console.error('Error creating writer card:', error);
    throw error;
  }
}

/**
 * Update an existing card
 */
export async function updateWriterCard(
  cardId: string,
  updates: { title?: string; category?: CategoryValue; content?: string }
): Promise<void> {
  try {
    const cardRef = doc(db, CARDS_COLLECTION, cardId);

    // Get current card to get deckId
    const cardDoc = await getDoc(cardRef);
    if (!cardDoc.exists()) {
      throw new Error('Card not found');
    }
    const cardData = cardDoc.data() as Card;

    // Update card
    await updateDoc(cardRef, {
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.content !== undefined && { body: updates.content }), // content → body
      ...(updates.category !== undefined && { category: updates.category }),
      updatedAt: serverTimestamp(),
    });

    // Update deck's updatedAt timestamp
    const deckRef = doc(db, DECKS_COLLECTION, cardData.deckId);
    await updateDoc(deckRef, {
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating writer card:', error);
    throw error;
  }
}

/**
 * Delete a card from a deck
 */
export async function deleteWriterCard(cardId: string, deckId: string): Promise<void> {
  try {
    const batch = writeBatch(db);

    // Delete the card
    const cardRef = doc(db, CARDS_COLLECTION, cardId);
    batch.delete(cardRef);

    // Update deck's updatedAt timestamp
    const deckRef = doc(db, DECKS_COLLECTION, deckId);
    batch.update(deckRef, {
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
  } catch (error) {
    console.error('Error deleting writer card:', error);
    throw error;
  }
}
