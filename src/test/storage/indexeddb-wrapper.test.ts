/**
 * IndexedDB Wrapper Tests
 *
 * TDD tests for low-level IndexedDB wrapper utility.
 * Tests basic CRUD operations and transaction handling.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { IndexedDBWrapper } from '../../services/storage/indexeddb-wrapper';
import { DB_NAME, DB_VERSION, STORES } from '../../services/storage/schema';

describe('IndexedDB Wrapper', () => {
  let db: IndexedDBWrapper;

  beforeEach(async () => {
    // Create fresh database instance for each test
    db = new IndexedDBWrapper(DB_NAME, DB_VERSION);
    await db.open();
  });

  afterEach(async () => {
    // Clean up database after each test
    if (db) {
      await db.close();
      await db.deleteDatabase();
    }
  });

  describe('Database Operations', () => {
    it('should open database successfully', async () => {
      const wrapper = new IndexedDBWrapper(DB_NAME, DB_VERSION);
      await expect(wrapper.open()).resolves.not.toThrow();
      await wrapper.close();
      await wrapper.deleteDatabase();
    });

    it('should close database successfully', async () => {
      await expect(db.close()).resolves.not.toThrow();
    });

    it('should delete database successfully', async () => {
      await db.close();
      await expect(db.deleteDatabase()).resolves.not.toThrow();
    });

    it('should check if database is open', async () => {
      expect(db.isOpen()).toBe(true);
      await db.close();
      expect(db.isOpen()).toBe(false);
    });
  });

  describe('Create Operations', () => {
    it('should add item to store', async () => {
      const testDeck = {
        id: 'deck-1',
        title: 'Test Deck',
        cardCount: 0,
        lastUpdated: Date.now(),
        userId: 'user-1',
        createdAt: Date.now(),
        synced: false,
        pendingChanges: false,
      };

      await expect(db.put(STORES.DECKS, testDeck)).resolves.toBe('deck-1');
    });

    it('should add multiple items to store', async () => {
      const items = [
        { id: 'deck-1', title: 'Deck 1', cardCount: 0, lastUpdated: Date.now(), userId: 'user-1', createdAt: Date.now(), synced: false, pendingChanges: false },
        { id: 'deck-2', title: 'Deck 2', cardCount: 0, lastUpdated: Date.now(), userId: 'user-1', createdAt: Date.now(), synced: false, pendingChanges: false },
      ];

      await expect(db.putMany(STORES.DECKS, items)).resolves.toEqual(['deck-1', 'deck-2']);
    });

    it('should overwrite existing item with same key', async () => {
      const original = {
        id: 'deck-1',
        title: 'Original Title',
        cardCount: 0,
        lastUpdated: Date.now(),
        userId: 'user-1',
        createdAt: Date.now(),
        synced: false,
        pendingChanges: false,
      };

      const updated = { ...original, title: 'Updated Title' };

      await db.put(STORES.DECKS, original);
      await db.put(STORES.DECKS, updated);

      const result = await db.get(STORES.DECKS, 'deck-1');
      expect(result.title).toBe('Updated Title');
    });
  });

  describe('Read Operations', () => {
    it('should get item by key', async () => {
      const testDeck = {
        id: 'deck-1',
        title: 'Test Deck',
        cardCount: 0,
        lastUpdated: Date.now(),
        userId: 'user-1',
        createdAt: Date.now(),
        synced: false,
        pendingChanges: false,
      };

      await db.put(STORES.DECKS, testDeck);
      const result = await db.get(STORES.DECKS, 'deck-1');

      expect(result).toEqual(testDeck);
    });

    it('should return undefined for non-existent key', async () => {
      const result = await db.get(STORES.DECKS, 'non-existent');
      expect(result).toBeUndefined();
    });

    it('should get all items from store', async () => {
      const items = [
        { id: 'deck-1', title: 'Deck 1', cardCount: 0, lastUpdated: Date.now(), userId: 'user-1', createdAt: Date.now(), synced: false, pendingChanges: false },
        { id: 'deck-2', title: 'Deck 2', cardCount: 0, lastUpdated: Date.now(), userId: 'user-1', createdAt: Date.now(), synced: false, pendingChanges: false },
      ];

      await db.putMany(STORES.DECKS, items);
      const results = await db.getAll(STORES.DECKS);

      expect(results).toHaveLength(2);
      expect(results.map(r => r.id)).toEqual(['deck-1', 'deck-2']);
    });

    it('should get items by index', async () => {
      const cards = [
        { id: 'card-1', deckId: 'deck-1', title: 'Card 1', category: 'action' as const, content: 'Content 1', createdAt: Date.now(), updatedAt: Date.now(), userId: 'user-1', synced: false, pendingChanges: false },
        { id: 'card-2', deckId: 'deck-1', title: 'Card 2', category: 'character' as const, content: 'Content 2', createdAt: Date.now(), updatedAt: Date.now(), userId: 'user-1', synced: false, pendingChanges: false },
        { id: 'card-3', deckId: 'deck-2', title: 'Card 3', category: 'action' as const, content: 'Content 3', createdAt: Date.now(), updatedAt: Date.now(), userId: 'user-1', synced: false, pendingChanges: false },
      ];

      await db.putMany(STORES.CARDS, cards);
      const results = await db.getAllByIndex(STORES.CARDS, 'deckId', 'deck-1');

      expect(results).toHaveLength(2);
      expect(results.map(r => r.id)).toEqual(['card-1', 'card-2']);
    });
  });

  describe('Update Operations', () => {
    it('should update existing item', async () => {
      const original = {
        id: 'deck-1',
        title: 'Original',
        cardCount: 0,
        lastUpdated: Date.now(),
        userId: 'user-1',
        createdAt: Date.now(),
        synced: false,
        pendingChanges: false,
      };

      await db.put(STORES.DECKS, original);

      const updated = { ...original, title: 'Updated', cardCount: 5 };
      await db.put(STORES.DECKS, updated);

      const result = await db.get(STORES.DECKS, 'deck-1');
      expect(result.title).toBe('Updated');
      expect(result.cardCount).toBe(5);
    });
  });

  describe('Delete Operations', () => {
    it('should delete item by key', async () => {
      const testDeck = {
        id: 'deck-1',
        title: 'Test Deck',
        cardCount: 0,
        lastUpdated: Date.now(),
        userId: 'user-1',
        createdAt: Date.now(),
        synced: false,
        pendingChanges: false,
      };

      await db.put(STORES.DECKS, testDeck);
      await db.delete(STORES.DECKS, 'deck-1');

      const result = await db.get(STORES.DECKS, 'deck-1');
      expect(result).toBeUndefined();
    });

    it('should delete multiple items by keys', async () => {
      const items = [
        { id: 'deck-1', title: 'Deck 1', cardCount: 0, lastUpdated: Date.now(), userId: 'user-1', createdAt: Date.now(), synced: false, pendingChanges: false },
        { id: 'deck-2', title: 'Deck 2', cardCount: 0, lastUpdated: Date.now(), userId: 'user-1', createdAt: Date.now(), synced: false, pendingChanges: false },
        { id: 'deck-3', title: 'Deck 3', cardCount: 0, lastUpdated: Date.now(), userId: 'user-1', createdAt: Date.now(), synced: false, pendingChanges: false },
      ];

      await db.putMany(STORES.DECKS, items);
      await db.deleteMany(STORES.DECKS, ['deck-1', 'deck-3']);

      const remaining = await db.getAll(STORES.DECKS);
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe('deck-2');
    });

    it('should clear all items from store', async () => {
      const items = [
        { id: 'deck-1', title: 'Deck 1', cardCount: 0, lastUpdated: Date.now(), userId: 'user-1', createdAt: Date.now(), synced: false, pendingChanges: false },
        { id: 'deck-2', title: 'Deck 2', cardCount: 0, lastUpdated: Date.now(), userId: 'user-1', createdAt: Date.now(), synced: false, pendingChanges: false },
      ];

      await db.putMany(STORES.DECKS, items);
      await db.clear(STORES.DECKS);

      const results = await db.getAll(STORES.DECKS);
      expect(results).toHaveLength(0);
    });
  });

  describe('Count Operations', () => {
    it('should count all items in store', async () => {
      const items = [
        { id: 'deck-1', title: 'Deck 1', cardCount: 0, lastUpdated: Date.now(), userId: 'user-1', createdAt: Date.now(), synced: false, pendingChanges: false },
        { id: 'deck-2', title: 'Deck 2', cardCount: 0, lastUpdated: Date.now(), userId: 'user-1', createdAt: Date.now(), synced: false, pendingChanges: false },
      ];

      await db.putMany(STORES.DECKS, items);
      const count = await db.count(STORES.DECKS);

      expect(count).toBe(2);
    });

    it('should count items by index', async () => {
      const cards = [
        { id: 'card-1', deckId: 'deck-1', title: 'Card 1', category: 'action' as const, content: 'Content 1', createdAt: Date.now(), updatedAt: Date.now(), userId: 'user-1', synced: false, pendingChanges: false },
        { id: 'card-2', deckId: 'deck-1', title: 'Card 2', category: 'character' as const, content: 'Content 2', createdAt: Date.now(), updatedAt: Date.now(), userId: 'user-1', synced: false, pendingChanges: false },
        { id: 'card-3', deckId: 'deck-2', title: 'Card 3', category: 'action' as const, content: 'Content 3', createdAt: Date.now(), updatedAt: Date.now(), userId: 'user-1', synced: false, pendingChanges: false },
      ];

      await db.putMany(STORES.CARDS, cards);
      const count = await db.countByIndex(STORES.CARDS, 'deckId', 'deck-1');

      expect(count).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when operating on closed database', async () => {
      await db.close();
      await expect(db.get(STORES.DECKS, 'deck-1')).rejects.toThrow();
    });

    it('should handle invalid store name', async () => {
      await expect(db.get('invalid-store', 'key-1')).rejects.toThrow();
    });

    it('should handle transaction errors gracefully', async () => {
      // Try to put invalid data (missing required fields)
      await expect(db.put(STORES.DECKS, { invalid: 'data' })).rejects.toThrow();
    });
  });
});
