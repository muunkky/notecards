/**
 * Local Storage Service
 *
 * High-level service for local-first deck and card storage.
 * Provides CRUD operations and sync queue management.
 *
 * DESIGN PHILOSOPHY - LOCAL-FIRST:
 * - All operations work offline
 * - Automatic sync queue for Firebase
 * - Track pending changes
 * - Maintain referential integrity
 *
 * TDD: Built to pass local-storage.test.ts
 */

import { IndexedDBWrapper } from './indexeddb-wrapper';
import { DB_NAME, DB_VERSION, STORES, LocalDeck, LocalCard, SyncQueueEntry } from './schema';
import { CategoryValue } from '../../domain/categories';
import { v4 as uuidv4 } from 'uuid';

export class LocalStorageService {
  private db: IndexedDBWrapper;

  constructor() {
    this.db = new IndexedDBWrapper(DB_NAME, DB_VERSION);
  }

  /**
   * Initialize database
   */
  async initialize(): Promise<void> {
    await this.db.open();
  }

  /**
   * Close database
   */
  async close(): Promise<void> {
    await this.db.close();
  }

  /**
   * Clear all data (for testing)
   */
  async clearAll(): Promise<void> {
    await this.db.clear(STORES.DECKS);
    await this.db.clear(STORES.CARDS);
    await this.db.clear(STORES.SYNC_QUEUE);
  }

  // ==================== Deck Operations ====================

  /**
   * Create new deck
   */
  async createDeck(userId: string, title: string, id?: string): Promise<LocalDeck> {
    const now = Date.now();
    const deck: LocalDeck = {
      id: id || uuidv4(),
      title,
      cardCount: 0,
      lastUpdated: now,
      userId,
      createdAt: now,
      synced: false,
      pendingChanges: true,
    };

    await this.db.put(STORES.DECKS, deck);
    await this.addToSyncQueue('deck', deck.id, 'create', deck);

    return deck;
  }

  /**
   * Get deck by ID
   */
  async getDeck(id: string): Promise<LocalDeck | null> {
    const deck = await this.db.get<LocalDeck>(STORES.DECKS, id);
    return deck || null;
  }

  /**
   * Get all decks for user (sorted by lastUpdated desc)
   */
  async getAllDecks(userId: string): Promise<LocalDeck[]> {
    const allDecks = await this.db.getAllByIndex<LocalDeck>(STORES.DECKS, 'userId', userId);

    // Sort by lastUpdated descending
    return allDecks.sort((a, b) => b.lastUpdated - a.lastUpdated);
  }

  /**
   * Update deck
   */
  async updateDeck(id: string, updates: Partial<LocalDeck>): Promise<LocalDeck> {
    const existing = await this.getDeck(id);
    if (!existing) {
      throw new Error('Deck not found');
    }

    const updated: LocalDeck = {
      ...existing,
      ...updates,
      lastUpdated: Date.now(),
      synced: false,
      pendingChanges: true,
    };

    await this.db.put(STORES.DECKS, updated);
    await this.addToSyncQueue('deck', id, 'update', updated);

    return updated;
  }

  /**
   * Delete deck and all its cards
   */
  async deleteDeck(id: string): Promise<void> {
    // Delete all cards in deck
    const cards = await this.getCardsByDeckId(id);
    for (const card of cards) {
      await this.db.delete(STORES.CARDS, card.id);
    }

    // Delete deck
    await this.db.delete(STORES.DECKS, id);
    await this.addToSyncQueue('deck', id, 'delete', null);
  }

  // ==================== Card Operations ====================

  /**
   * Create new card
   */
  async createCard(
    userId: string,
    deckId: string,
    title: string,
    category: CategoryValue,
    content: string,
    id?: string
  ): Promise<LocalCard> {
    const now = Date.now();
    const card: LocalCard = {
      id: id || uuidv4(),
      deckId,
      title,
      category,
      content,
      createdAt: now,
      updatedAt: now,
      userId,
      synced: false,
      pendingChanges: true,
    };

    await this.db.put(STORES.CARDS, card);
    await this.addToSyncQueue('card', card.id, 'create', card);

    // Update deck card count
    await this.updateDeckCardCount(deckId);

    return card;
  }

  /**
   * Get card by ID
   */
  async getCard(id: string): Promise<LocalCard | null> {
    const card = await this.db.get<LocalCard>(STORES.CARDS, id);
    return card || null;
  }

  /**
   * Get all cards for deck
   */
  async getCardsByDeckId(deckId: string): Promise<LocalCard[]> {
    return this.db.getAllByIndex<LocalCard>(STORES.CARDS, 'deckId', deckId);
  }

  /**
   * Update card
   */
  async updateCard(id: string, updates: Partial<LocalCard>): Promise<LocalCard> {
    const existing = await this.getCard(id);
    if (!existing) {
      throw new Error('Card not found');
    }

    const updated: LocalCard = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
      synced: false,
      pendingChanges: true,
    };

    await this.db.put(STORES.CARDS, updated);
    await this.addToSyncQueue('card', id, 'update', updated);

    return updated;
  }

  /**
   * Delete card
   */
  async deleteCard(id: string): Promise<void> {
    const card = await this.getCard(id);
    if (!card) {
      return;
    }

    await this.db.delete(STORES.CARDS, id);
    await this.addToSyncQueue('card', id, 'delete', null);

    // Update deck card count
    await this.updateDeckCardCount(card.deckId);
  }

  // ==================== Helper Methods ====================

  /**
   * Update deck card count
   */
  private async updateDeckCardCount(deckId: string): Promise<void> {
    const count = await this.db.countByIndex(STORES.CARDS, 'deckId', deckId);
    const deck = await this.getDeck(deckId);

    if (deck) {
      // Update without marking as pending (internal operation)
      const updated = { ...deck, cardCount: count, lastUpdated: Date.now() };
      await this.db.put(STORES.DECKS, updated);
    }
  }

  // ==================== Sync Queue Operations ====================

  /**
   * Add operation to sync queue
   */
  private async addToSyncQueue(
    entityType: 'deck' | 'card',
    entityId: string,
    operation: 'create' | 'update' | 'delete',
    data: LocalDeck | LocalCard | null
  ): Promise<void> {
    const entry: SyncQueueEntry = {
      id: uuidv4(),
      entityType,
      entityId,
      operation,
      timestamp: Date.now(),
      data,
    };

    await this.db.put(STORES.SYNC_QUEUE, entry);
  }

  /**
   * Get all pending sync operations
   */
  async getSyncQueue(): Promise<SyncQueueEntry[]> {
    const queue = await this.db.getAll<SyncQueueEntry>(STORES.SYNC_QUEUE);

    // Sort by timestamp ascending (oldest first)
    return queue.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Clear sync queue (after successful sync)
   */
  async clearSyncQueue(): Promise<void> {
    await this.db.clear(STORES.SYNC_QUEUE);
  }

  /**
   * Remove specific entry from sync queue
   */
  async removeSyncQueueEntry(entryId: string): Promise<void> {
    await this.db.delete(STORES.SYNC_QUEUE, entryId);
  }
}
