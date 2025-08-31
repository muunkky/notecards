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
  orderBy,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  Deck,
  Card,
  OrderSnapshot,
  DeckData,
  CardData,
  OrderSnapshotData,
  UserData,
  ApiResponse,
  FirestoreError,
} from '../types';

// Collection references
const USERS_COLLECTION = 'users';
const DECKS_COLLECTION = 'decks';
const CARDS_COLLECTION = 'cards';
const ORDER_SNAPSHOTS_COLLECTION = 'orderSnapshots';

// Helper function to convert Firestore timestamp to Date
const convertTimestamp = (timestamp: any): Date => {
  // Handle test environment where Timestamp might not be a proper constructor
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  // Fallback for test environment or invalid timestamps
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return timestamp || new Date();
};

// Helper function to handle Firestore errors
const handleFirestoreError = (error: any): FirestoreError => {
  console.error('Firestore error:', error);
  return {
    code: error.code || 'unknown',
    message: error.message || 'An unknown error occurred',
  };
};

// User Services
export const createUserDocument = async (
  userId: string,
  userData: UserData
): Promise<ApiResponse<void>> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: handleFirestoreError(error) };
  }
};

export const getUserDocument = async (userId: string): Promise<ApiResponse<UserData>> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        success: true,
        data: {
          email: data.email,
          displayName: data.displayName,
          createdAt: convertTimestamp(data.createdAt),
        },
      };
    } else {
      return { success: false, error: { code: 'not-found', message: 'User not found' } };
    }
  } catch (error) {
    return { success: false, error: handleFirestoreError(error) };
  }
};

// Deck Services
export const createDeck = async (
  userId: string,
  title: string
): Promise<ApiResponse<string>> => {
  try {
    const trimmedTitle = title.trim();
    const deckData: DeckData = {
      title: trimmedTitle,
      ownerId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, DECKS_COLLECTION), deckData);
    return { success: true, data: docRef.id };
  } catch (error) {
    return { success: false, error: handleFirestoreError(error) };
  }
};

export const updateDeck = async (
  deckId: string,
  updates: Partial<DeckData>
): Promise<ApiResponse<void>> => {
  try {
    const deckRef = doc(db, DECKS_COLLECTION, deckId);
    await updateDoc(deckRef, {
      ...updates,
      title: updates.title?.trim(),
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: handleFirestoreError(error) };
  }
};

export const deleteDeck = async (deckId: string): Promise<ApiResponse<void>> => {
  try {
    // First delete all cards in the deck
    const cardsQuery = query(
      collection(db, CARDS_COLLECTION),
      where('deckId', '==', deckId)
    );
    const cardsSnapshot = await getDocs(cardsQuery);

    // Delete all order snapshots for this deck
    const snapshotsQuery = query(
      collection(db, ORDER_SNAPSHOTS_COLLECTION),
      where('deckId', '==', deckId)
    );
    const snapshotsSnapshot = await getDocs(snapshotsQuery);

    // Use batch to delete everything
    const batch = writeBatch(db);

    // Delete all cards
    cardsSnapshot.forEach((cardDoc) => {
      batch.delete(cardDoc.ref);
    });

    // Delete all snapshots
    snapshotsSnapshot.forEach((snapshotDoc) => {
      batch.delete(snapshotDoc.ref);
    });

    // Delete the deck itself
    const deckRef = doc(db, DECKS_COLLECTION, deckId);
    batch.delete(deckRef);

    await batch.commit();
    return { success: true };
  } catch (error) {
    return { success: false, error: handleFirestoreError(error) };
  }
};

export const getUserDecks = async (userId: string): Promise<ApiResponse<Deck[]>> => {
  try {
    const decksQuery = query(
      collection(db, DECKS_COLLECTION),
      where('ownerId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(decksQuery);
    const decks: Deck[] = [];

    for (const deckDoc of querySnapshot.docs) {
      const deckData = deckDoc.data();
      
      // Count cards in this deck
      const cardsQuery = query(
        collection(db, CARDS_COLLECTION),
        where('deckId', '==', deckDoc.id)
      );
      const cardsSnapshot = await getDocs(cardsQuery);
      const cardCount = cardsSnapshot.size;

      const deck: Deck = {
        id: deckDoc.id,
        title: deckData.title,
        ownerId: deckData.ownerId,
        createdAt: convertTimestamp(deckData.createdAt),
        updatedAt: convertTimestamp(deckData.updatedAt),
        cardCount,
      };

      decks.push(deck);
    }

    return { success: true, data: decks };
  } catch (error) {
    return { success: false, error: handleFirestoreError(error) };
  }
};

// Card Services
export const createCard = async (
  deckId: string,
  title: string,
  body: string = ''
): Promise<ApiResponse<string>> => {
  try {
    // Get the current card count to determine the order index
    const cardsQuery = query(
      collection(db, CARDS_COLLECTION),
      where('deckId', '==', deckId)
    );
    const cardsSnapshot = await getDocs(cardsQuery);
    const orderIndex = cardsSnapshot.size;

    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();

    const cardData: CardData = {
      title: trimmedTitle,
      body: trimmedBody,
      orderIndex,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, CARDS_COLLECTION), cardData);
    
    // Update deck's updatedAt timestamp
    const deckRef = doc(db, DECKS_COLLECTION, deckId);
    await updateDoc(deckRef, { updatedAt: serverTimestamp() });

    return { success: true, data: docRef.id };
  } catch (error) {
    return { success: false, error: handleFirestoreError(error) };
  }
};

export const updateCard = async (
  deckId: string,
  cardId: string,
  updates: Partial<CardData>
): Promise<ApiResponse<void>> => {
  try {
    const cardRef = doc(db, CARDS_COLLECTION, cardId);
    await updateDoc(cardRef, {
      ...updates,
      title: updates.title?.trim(),
      body: updates.body?.trim(),
      updatedAt: serverTimestamp(),
    });

    // Update deck's updatedAt timestamp
    const deckRef = doc(db, DECKS_COLLECTION, deckId);
    await updateDoc(deckRef, { updatedAt: serverTimestamp() });

    return { success: true };
  } catch (error) {
    return { success: false, error: handleFirestoreError(error) };
  }
};

export const deleteCard = async (
  deckId: string,
  cardId: string
): Promise<ApiResponse<void>> => {
  try {
    const cardRef = doc(db, CARDS_COLLECTION, cardId);
    await deleteDoc(cardRef);

    // Update deck's updatedAt timestamp
    const deckRef = doc(db, DECKS_COLLECTION, deckId);
    await updateDoc(deckRef, { updatedAt: serverTimestamp() });

    return { success: true };
  } catch (error) {
    return { success: false, error: handleFirestoreError(error) };
  }
};

export const getDeckCards = async (deckId: string): Promise<ApiResponse<Card[]>> => {
  try {
    const cardsQuery = query(
      collection(db, CARDS_COLLECTION),
      where('deckId', '==', deckId),
      orderBy('orderIndex', 'asc')
    );

    const querySnapshot = await getDocs(cardsQuery);
    const cards: Card[] = querySnapshot.docs.map(cardDoc => {
      const cardData = cardDoc.data();
      return {
        id: cardDoc.id,
        deckId,
        title: cardData.title,
        body: cardData.body,
        orderIndex: cardData.orderIndex,
        createdAt: convertTimestamp(cardData.createdAt),
        updatedAt: convertTimestamp(cardData.updatedAt),
      };
    });

    return { success: true, data: cards };
  } catch (error) {
    return { success: false, error: handleFirestoreError(error) };
  }
};

export const reorderCards = async (
  cardUpdates: Array<{ id: string; orderIndex: number }>
): Promise<ApiResponse<void>> => {
  try {
    const batch = writeBatch(db);

    cardUpdates.forEach(({ id, orderIndex }) => {
      const cardRef = doc(db, CARDS_COLLECTION, id);
      batch.update(cardRef, { 
        orderIndex,
        updatedAt: serverTimestamp() 
      });
    });

    await batch.commit();
    return { success: true };
  } catch (error) {
    return { success: false, error: handleFirestoreError(error) };
  }
};

// Order Snapshot Services
export const saveOrderSnapshot = async (
  deckId: string,
  name: string,
  cardOrder: string[]
): Promise<ApiResponse<string>> => {
  try {
    const trimmedName = name.trim();
    const snapshotData: OrderSnapshotData = {
      name: trimmedName,
      cardOrder,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, ORDER_SNAPSHOTS_COLLECTION), snapshotData);
    return { success: true, data: docRef.id };
  } catch (error) {
    return { success: false, error: handleFirestoreError(error) };
  }
};

export const getOrderSnapshots = async (deckId: string): Promise<ApiResponse<OrderSnapshot[]>> => {
  try {
    const snapshotsQuery = query(
      collection(db, ORDER_SNAPSHOTS_COLLECTION),
      where('deckId', '==', deckId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(snapshotsQuery);
    const snapshots: OrderSnapshot[] = querySnapshot.docs.map(snapshotDoc => {
      const snapshotData = snapshotDoc.data();
      return {
        id: snapshotDoc.id,
        deckId,
        name: snapshotData.name,
        cardOrder: snapshotData.cardOrder,
        createdAt: convertTimestamp(snapshotData.createdAt),
      };
    });

    return { success: true, data: snapshots };
  } catch (error) {
    return { success: false, error: handleFirestoreError(error) };
  }
};

export const deleteOrderSnapshot = async (snapshotId: string): Promise<ApiResponse<void>> => {
  try {
    const snapshotRef = doc(db, ORDER_SNAPSHOTS_COLLECTION, snapshotId);
    await deleteDoc(snapshotRef);
    return { success: true };
  } catch (error) {
    return { success: false, error: handleFirestoreError(error) };
  }
};

// Utility Functions
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
