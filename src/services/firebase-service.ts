/**
 * Firebase Service Interface
 *
 * Abstraction layer for Firebase operations.
 * Allows for easy mocking in tests.
 */

import { collection, doc, getDocs, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { LocalDeck, LocalCard } from './storage/schema';

/**
 * Get all decks for a user from Firebase
 */
export async function getUserDecks(userId: string): Promise<LocalDeck[]> {
  const decksRef = collection(db, 'decks');
  const q = query(decksRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => doc.data() as LocalDeck);
}

/**
 * Get all cards for a user from Firebase
 */
export async function getUserCards(userId: string): Promise<LocalCard[]> {
  const cardsRef = collection(db, 'cards');
  const q = query(cardsRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => doc.data() as LocalCard);
}

/**
 * Set (create or update) deck in Firebase
 */
export async function setDeck(userId: string, deckId: string, deck: LocalDeck): Promise<void> {
  const deckRef = doc(db, 'decks', deckId);
  await setDoc(deckRef, deck);
}

/**
 * Delete deck from Firebase
 */
export async function deleteDeck(userId: string, deckId: string): Promise<void> {
  const deckRef = doc(db, 'decks', deckId);
  await deleteDoc(deckRef);
}

/**
 * Set (create or update) card in Firebase
 */
export async function setCard(userId: string, cardId: string, card: LocalCard): Promise<void> {
  const cardRef = doc(db, 'cards', cardId);
  await setDoc(cardRef, card);
}

/**
 * Delete card from Firebase
 */
export async function deleteCard(userId: string, cardId: string): Promise<void> {
  const cardRef = doc(db, 'cards', cardId);
  await deleteDoc(cardRef);
}
