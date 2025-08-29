import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';
import { Deck, Notecard, StudySession } from '../types';

// Helper function to convert Firestore document to Deck
const convertToDeck = (doc: QueryDocumentSnapshot<DocumentData>): Deck => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    description: data.description,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    userId: data.userId
  };
};

// Helper function to convert Firestore document to Notecard
const convertToNotecard = (doc: QueryDocumentSnapshot<DocumentData>): Notecard => {
  const data = doc.data();
  return {
    id: doc.id,
    deckId: data.deckId,
    front: data.front,
    back: data.back,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    userId: data.userId
  };
};

// Deck operations
export const deckOperations = {
  // Create a new deck
  async create(deck: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, 'decks'), {
      ...deck,
      createdAt: now,
      updatedAt: now
    });
    return docRef.id;
  },

  // Get all decks for a user
  async getByUserId(userId: string): Promise<Deck[]> {
    const q = query(
      collection(db, 'decks'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertToDeck);
  },

  // Subscribe to real-time updates for user's decks
  subscribeToUserDecks(userId: string, callback: (decks: Deck[]) => void): () => void {
    const q = query(
      collection(db, 'decks'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const decks = querySnapshot.docs.map(convertToDeck);
      callback(decks);
    });
  },

  // Update a deck
  async update(id: string, updates: Partial<Omit<Deck, 'id' | 'createdAt' | 'userId'>>): Promise<void> {
    const deckRef = doc(db, 'decks', id);
    await updateDoc(deckRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  },

  // Delete a deck
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'decks', id));
  }
};

// Notecard operations
export const notecardOperations = {
  // Create a new notecard
  async create(notecard: Omit<Notecard, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, 'notecards'), {
      ...notecard,
      createdAt: now,
      updatedAt: now
    });
    return docRef.id;
  },

  // Get all notecards for a deck
  async getByDeckId(deckId: string): Promise<Notecard[]> {
    const q = query(
      collection(db, 'notecards'),
      where('deckId', '==', deckId),
      orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertToNotecard);
  },

  // Subscribe to real-time updates for deck's notecards
  subscribeToDeckNotecards(deckId: string, callback: (notecards: Notecard[]) => void): () => void {
    const q = query(
      collection(db, 'notecards'),
      where('deckId', '==', deckId),
      orderBy('createdAt', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const notecards = querySnapshot.docs.map(convertToNotecard);
      callback(notecards);
    });
  },

  // Update a notecard
  async update(id: string, updates: Partial<Omit<Notecard, 'id' | 'createdAt' | 'deckId' | 'userId'>>): Promise<void> {
    const notecardRef = doc(db, 'notecards', id);
    await updateDoc(notecardRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  },

  // Delete a notecard
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'notecards', id));
  }
};

// Study session operations
export const studySessionOperations = {
  // Create a new study session
  async create(session: Omit<StudySession, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'studySessions'), {
      ...session,
      startedAt: Timestamp.fromDate(session.startedAt),
      completedAt: session.completedAt ? Timestamp.fromDate(session.completedAt) : null
    });
    return docRef.id;
  },

  // Get study sessions for a user
  async getByUserId(userId: string): Promise<StudySession[]> {
    const q = query(
      collection(db, 'studySessions'),
      where('userId', '==', userId),
      orderBy('startedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        deckId: data.deckId,
        userId: data.userId,
        startedAt: data.startedAt?.toDate() || new Date(),
        completedAt: data.completedAt?.toDate(),
        score: data.score,
        totalCards: data.totalCards,
        correctAnswers: data.correctAnswers
      };
    });
  },

  // Update a study session
  async update(id: string, updates: Partial<Omit<StudySession, 'id' | 'userId' | 'deckId'>>): Promise<void> {
    const sessionRef = doc(db, 'studySessions', id);
    const updateData: any = { ...updates };
    
    if (updates.startedAt) {
      updateData.startedAt = Timestamp.fromDate(updates.startedAt);
    }
    if (updates.completedAt) {
      updateData.completedAt = Timestamp.fromDate(updates.completedAt);
    }
    
    await updateDoc(sessionRef, updateData);
  }
};
