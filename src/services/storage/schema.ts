/**
 * IndexedDB Schema Definition
 *
 * Local-first storage schema for decks, cards, and sync queue.
 * Designed for offline-first architecture with Firebase sync.
 *
 * DESIGN PHILOSOPHY - LOCAL-FIRST:
 * - Store everything locally in IndexedDB
 * - Sync to Firebase when online
 * - Track pending changes for sync
 * - Support offline CRUD operations
 */

import { CategoryValue } from '../../domain/categories';

/**
 * Database configuration
 */
export const DB_NAME = 'writer-app-db';
export const DB_VERSION = 1;

/**
 * Object store names
 */
export const STORES = {
  DECKS: 'decks',
  CARDS: 'cards',
  SYNC_QUEUE: 'syncQueue',
} as const;

/**
 * Deck stored in local IndexedDB
 */
export interface LocalDeck {
  id: string; // UUID or Firebase ID
  title: string;
  cardCount: number;
  lastUpdated: number; // timestamp
  userId: string;
  createdAt: number; // timestamp
  synced: boolean; // true if synced to Firebase
  pendingChanges: boolean; // true if has unsaved changes
}

/**
 * Card stored in local IndexedDB
 */
export interface LocalCard {
  id: string; // UUID or Firebase ID
  deckId: string; // Foreign key to deck
  title: string;
  category: CategoryValue;
  content: string;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
  userId: string;
  synced: boolean; // true if synced to Firebase
  pendingChanges: boolean; // true if has unsaved changes
}

/**
 * Sync queue entry for tracking pending operations
 */
export interface SyncQueueEntry {
  id: string; // UUID
  entityType: 'deck' | 'card';
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  timestamp: number;
  data: LocalDeck | LocalCard | null; // null for delete operations
}

/**
 * Initialize IndexedDB database with schema
 */
export function initializeDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open database'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create decks store
      if (!db.objectStoreNames.contains(STORES.DECKS)) {
        const deckStore = db.createObjectStore(STORES.DECKS, { keyPath: 'id' });
        deckStore.createIndex('userId', 'userId', { unique: false });
        deckStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
        deckStore.createIndex('synced', 'synced', { unique: false });
      }

      // Create cards store
      if (!db.objectStoreNames.contains(STORES.CARDS)) {
        const cardStore = db.createObjectStore(STORES.CARDS, { keyPath: 'id' });
        cardStore.createIndex('deckId', 'deckId', { unique: false });
        cardStore.createIndex('userId', 'userId', { unique: false });
        cardStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        cardStore.createIndex('synced', 'synced', { unique: false });
      }

      // Create sync queue store
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' });
        syncStore.createIndex('entityType', 'entityType', { unique: false });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}
