/**
 * Local Storage Service Tests
 *
 * TDD tests for high-level local storage service.
 * Tests deck/card CRUD operations and sync queue management.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalStorageService } from '../../services/storage/local-storage';
import { CategoryValue } from '../../domain/categories';

describe('Local Storage Service', () => {
  let storage: LocalStorageService;
  const testUserId = 'test-user-123';

  beforeEach(async () => {
    storage = new LocalStorageService();
    await storage.initialize();
  });

  afterEach(async () => {
    await storage.close();
    await storage.clearAll();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const newStorage = new LocalStorageService();
      await expect(newStorage.initialize()).resolves.not.toThrow();
      await newStorage.close();
    });
  });

  describe('Deck Operations', () => {
    describe('Create Deck', () => {
      it('should create deck with generated ID', async () => {
        const deck = await storage.createDeck(testUserId, 'Test Deck');

        expect(deck).toHaveProperty('id');
        expect(deck.title).toBe('Test Deck');
        expect(deck.userId).toBe(testUserId);
        expect(deck.cardCount).toBe(0);
        expect(deck.synced).toBe(false);
        expect(deck.pendingChanges).toBe(true);
      });

      it('should create deck with custom ID', async () => {
        const customId = 'custom-deck-id';
        const deck = await storage.createDeck(testUserId, 'Test Deck', customId);

        expect(deck.id).toBe(customId);
      });

      it('should set creation and update timestamps', async () => {
        const before = Date.now();
        const deck = await storage.createDeck(testUserId, 'Test Deck');
        const after = Date.now();

        expect(deck.createdAt).toBeGreaterThanOrEqual(before);
        expect(deck.createdAt).toBeLessThanOrEqual(after);
        expect(deck.lastUpdated).toBe(deck.createdAt);
      });
    });

    describe('Get Deck', () => {
      it('should get deck by ID', async () => {
        const created = await storage.createDeck(testUserId, 'Test Deck');
        const fetched = await storage.getDeck(created.id);

        expect(fetched).toEqual(created);
      });

      it('should return null for non-existent deck', async () => {
        const result = await storage.getDeck('non-existent-id');
        expect(result).toBeNull();
      });
    });

    describe('Get All Decks', () => {
      it('should get all decks for user', async () => {
        await storage.createDeck(testUserId, 'Deck 1');
        await storage.createDeck(testUserId, 'Deck 2');
        await storage.createDeck('other-user', 'Other Deck');

        const decks = await storage.getAllDecks(testUserId);

        expect(decks).toHaveLength(2);
        expect(decks.map(d => d.title)).toEqual(['Deck 1', 'Deck 2']);
      });

      it('should return empty array when no decks', async () => {
        const decks = await storage.getAllDecks(testUserId);
        expect(decks).toEqual([]);
      });

      it('should sort decks by lastUpdated descending', async () => {
        const deck1 = await storage.createDeck(testUserId, 'Oldest');
        await new Promise(resolve => setTimeout(resolve, 10));
        const deck2 = await storage.createDeck(testUserId, 'Newest');

        const decks = await storage.getAllDecks(testUserId);

        expect(decks[0].id).toBe(deck2.id);
        expect(decks[1].id).toBe(deck1.id);
      });
    });

    describe('Update Deck', () => {
      it('should update deck title', async () => {
        const deck = await storage.createDeck(testUserId, 'Original Title');
        const updated = await storage.updateDeck(deck.id, { title: 'Updated Title' });

        expect(updated.title).toBe('Updated Title');
        expect(updated.lastUpdated).toBeGreaterThan(deck.lastUpdated);
      });

      it('should mark deck as pending changes', async () => {
        const deck = await storage.createDeck(testUserId, 'Test Deck');
        // Simulate synced state
        await storage.updateDeck(deck.id, { synced: true, pendingChanges: false });

        const updated = await storage.updateDeck(deck.id, { title: 'New Title' });

        expect(updated.synced).toBe(false);
        expect(updated.pendingChanges).toBe(true);
      });

      it('should throw error for non-existent deck', async () => {
        await expect(storage.updateDeck('non-existent', { title: 'New' }))
          .rejects.toThrow('Deck not found');
      });
    });

    describe('Delete Deck', () => {
      it('should delete deck by ID', async () => {
        const deck = await storage.createDeck(testUserId, 'Test Deck');
        await storage.deleteDeck(deck.id);

        const result = await storage.getDeck(deck.id);
        expect(result).toBeNull();
      });

      it('should delete associated cards when deleting deck', async () => {
        const deck = await storage.createDeck(testUserId, 'Test Deck');
        await storage.createCard(testUserId, deck.id, 'Card 1', 'action' as CategoryValue, 'Content');

        await storage.deleteDeck(deck.id);

        const cards = await storage.getCardsByDeckId(deck.id);
        expect(cards).toHaveLength(0);
      });
    });
  });

  describe('Card Operations', () => {
    let testDeckId: string;

    beforeEach(async () => {
      const deck = await storage.createDeck(testUserId, 'Test Deck');
      testDeckId = deck.id;
    });

    describe('Create Card', () => {
      it('should create card with generated ID', async () => {
        const card = await storage.createCard(
          testUserId,
          testDeckId,
          'Test Card',
          'action' as CategoryValue,
          'Test content'
        );

        expect(card).toHaveProperty('id');
        expect(card.title).toBe('Test Card');
        expect(card.deckId).toBe(testDeckId);
        expect(card.category).toBe('action');
        expect(card.content).toBe('Test content');
        expect(card.synced).toBe(false);
        expect(card.pendingChanges).toBe(true);
      });

      it('should create card with custom ID', async () => {
        const customId = 'custom-card-id';
        const card = await storage.createCard(
          testUserId,
          testDeckId,
          'Test Card',
          'character' as CategoryValue,
          'Content',
          customId
        );

        expect(card.id).toBe(customId);
      });

      it('should update deck card count', async () => {
        await storage.createCard(testUserId, testDeckId, 'Card 1', 'action' as CategoryValue, 'Content');

        const deck = await storage.getDeck(testDeckId);
        expect(deck?.cardCount).toBe(1);
      });
    });

    describe('Get Card', () => {
      it('should get card by ID', async () => {
        const created = await storage.createCard(
          testUserId,
          testDeckId,
          'Test Card',
          'action' as CategoryValue,
          'Content'
        );
        const fetched = await storage.getCard(created.id);

        expect(fetched).toEqual(created);
      });

      it('should return null for non-existent card', async () => {
        const result = await storage.getCard('non-existent-id');
        expect(result).toBeNull();
      });
    });

    describe('Get Cards By Deck', () => {
      it('should get all cards for deck', async () => {
        await storage.createCard(testUserId, testDeckId, 'Card 1', 'action' as CategoryValue, 'Content 1');
        await storage.createCard(testUserId, testDeckId, 'Card 2', 'character' as CategoryValue, 'Content 2');

        // Create card in different deck
        const otherDeck = await storage.createDeck(testUserId, 'Other Deck');
        await storage.createCard(testUserId, otherDeck.id, 'Other Card', 'action' as CategoryValue, 'Content');

        const cards = await storage.getCardsByDeckId(testDeckId);

        expect(cards).toHaveLength(2);
        expect(cards.map(c => c.title)).toEqual(['Card 1', 'Card 2']);
      });

      it('should return empty array when no cards', async () => {
        const cards = await storage.getCardsByDeckId(testDeckId);
        expect(cards).toEqual([]);
      });
    });

    describe('Update Card', () => {
      it('should update card properties', async () => {
        const card = await storage.createCard(
          testUserId,
          testDeckId,
          'Original',
          'action' as CategoryValue,
          'Original content'
        );

        const updated = await storage.updateCard(card.id, {
          title: 'Updated',
          content: 'Updated content',
        });

        expect(updated.title).toBe('Updated');
        expect(updated.content).toBe('Updated content');
        expect(updated.updatedAt).toBeGreaterThan(card.updatedAt);
      });

      it('should mark card as pending changes', async () => {
        const card = await storage.createCard(
          testUserId,
          testDeckId,
          'Test',
          'action' as CategoryValue,
          'Content'
        );

        // Simulate synced state
        await storage.updateCard(card.id, { synced: true, pendingChanges: false });

        const updated = await storage.updateCard(card.id, { title: 'New' });

        expect(updated.synced).toBe(false);
        expect(updated.pendingChanges).toBe(true);
      });

      it('should throw error for non-existent card', async () => {
        await expect(storage.updateCard('non-existent', { title: 'New' }))
          .rejects.toThrow('Card not found');
      });
    });

    describe('Delete Card', () => {
      it('should delete card by ID', async () => {
        const card = await storage.createCard(
          testUserId,
          testDeckId,
          'Test',
          'action' as CategoryValue,
          'Content'
        );

        await storage.deleteCard(card.id);

        const result = await storage.getCard(card.id);
        expect(result).toBeNull();
      });

      it('should update deck card count', async () => {
        const card1 = await storage.createCard(testUserId, testDeckId, 'Card 1', 'action' as CategoryValue, 'Content');
        await storage.createCard(testUserId, testDeckId, 'Card 2', 'action' as CategoryValue, 'Content');

        await storage.deleteCard(card1.id);

        const deck = await storage.getDeck(testDeckId);
        expect(deck?.cardCount).toBe(1);
      });
    });
  });

  describe('Sync Queue Operations', () => {
    it('should add deck creation to sync queue', async () => {
      const deck = await storage.createDeck(testUserId, 'Test Deck');

      const queue = await storage.getSyncQueue();

      expect(queue).toHaveLength(1);
      expect(queue[0].entityType).toBe('deck');
      expect(queue[0].operation).toBe('create');
      expect(queue[0].entityId).toBe(deck.id);
    });

    it('should add card creation to sync queue', async () => {
      const deck = await storage.createDeck(testUserId, 'Test Deck');
      const card = await storage.createCard(testUserId, deck.id, 'Card', 'action' as CategoryValue, 'Content');

      const queue = await storage.getSyncQueue();

      expect(queue.length).toBeGreaterThanOrEqual(2); // Deck + Card
      const cardEntry = queue.find(e => e.entityId === card.id);
      expect(cardEntry).toBeDefined();
      expect(cardEntry?.operation).toBe('create');
    });

    it('should clear sync queue', async () => {
      await storage.createDeck(testUserId, 'Test Deck');
      await storage.clearSyncQueue();

      const queue = await storage.getSyncQueue();
      expect(queue).toHaveLength(0);
    });

    it('should remove specific entry from sync queue', async () => {
      const deck = await storage.createDeck(testUserId, 'Test Deck');
      const queue = await storage.getSyncQueue();
      const entry = queue[0];

      await storage.removeSyncQueueEntry(entry.id);

      const updatedQueue = await storage.getSyncQueue();
      expect(updatedQueue.find(e => e.id === entry.id)).toBeUndefined();
    });
  });
});
