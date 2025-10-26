/**
 * Sync Manager Tests
 *
 * TDD tests for Firebase sync manager.
 * Tests sync operations, conflict resolution, and retry logic.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SyncManager } from '../../services/storage/sync-manager';
import { LocalStorageService } from '../../services/storage/local-storage';
import { networkStatus } from '../../services/network-status';

// Mock Firebase - using vi.hoisted to ensure these are available before mock
const { mockFirebaseGet, mockFirebaseSet, mockFirebaseDelete, mockGetUserDecks, mockGetUserCards } = vi.hoisted(() => ({
  mockFirebaseGet: vi.fn(),
  mockFirebaseSet: vi.fn(),
  mockFirebaseDelete: vi.fn(),
  mockGetUserDecks: vi.fn(),
  mockGetUserCards: vi.fn(),
}));

vi.mock('../../services/firebase-service', () => ({
  getUserDecks: mockGetUserDecks,
  getUserCards: mockGetUserCards,
  setDeck: mockFirebaseSet,
  deleteDeck: mockFirebaseDelete,
  setCard: mockFirebaseSet,
  deleteCard: mockFirebaseDelete,
}));

describe('Sync Manager', () => {
  let syncManager: SyncManager;
  let localStorage: LocalStorageService;
  const testUserId = 'test-user-123';

  beforeEach(async () => {
    localStorage = new LocalStorageService();
    await localStorage.initialize();

    syncManager = new SyncManager(localStorage, testUserId);

    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
      configurable: true,
    });

    // Clear mocks
    mockGetUserDecks.mockClear();
    mockGetUserCards.mockClear();
    mockFirebaseSet.mockClear();
    mockFirebaseDelete.mockClear();

    // Default empty responses for get operations
    mockGetUserDecks.mockResolvedValue([]);
    mockGetUserCards.mockResolvedValue([]);
  });

  afterEach(async () => {
    await syncManager.stop();
    await localStorage.close();
    await localStorage.clearAll();
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize without starting sync', () => {
      expect(syncManager.isRunning()).toBe(false);
    });

    it('should start sync monitoring', async () => {
      await syncManager.start();
      expect(syncManager.isRunning()).toBe(true);
    });

    it('should stop sync monitoring', async () => {
      await syncManager.start();
      await syncManager.stop();
      expect(syncManager.isRunning()).toBe(false);
    });
  });

  describe('Network Status Monitoring', () => {
    it('should trigger sync when going online', async () => {
      const syncSpy = vi.spyOn(syncManager, 'syncNow');

      await syncManager.start();

      // Simulate going offline then online
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      window.dispatchEvent(new Event('offline'));

      await new Promise(resolve => setTimeout(resolve, 10));

      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      window.dispatchEvent(new Event('online'));

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(syncSpy).toHaveBeenCalled();
    });

    it('should not sync when offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

      const syncSpy = vi.spyOn(syncManager, 'syncNow');

      await syncManager.start();
      await syncManager.syncNow();

      expect(syncSpy).toHaveBeenCalled();
      expect(mockFirebaseSet).not.toHaveBeenCalled();
    });
  });

  describe('Upload Pending Changes', () => {
    it('should upload created deck to Firebase', async () => {
      mockFirebaseSet.mockResolvedValue(undefined);

      const deck = await localStorage.createDeck(testUserId, 'Test Deck');

      await syncManager.start();
      await syncManager.syncNow();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockFirebaseSet).toHaveBeenCalledWith(
        testUserId,
        deck.id,
        expect.objectContaining({
          id: deck.id,
          title: 'Test Deck',
        })
      );
    });

    it('should upload created card to Firebase', async () => {
      mockFirebaseSet.mockResolvedValue(undefined);

      const deck = await localStorage.createDeck(testUserId, 'Test Deck');
      const card = await localStorage.createCard(
        testUserId,
        deck.id,
        'Test Card',
        'action' as any,
        'Content'
      );

      await syncManager.start();
      await syncManager.syncNow();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockFirebaseSet).toHaveBeenCalledWith(
        testUserId,
        card.id,
        expect.objectContaining({
          id: card.id,
          title: 'Test Card',
        })
      );
    });

    it('should delete deck from Firebase', async () => {
      mockFirebaseDelete.mockResolvedValue(undefined);

      const deck = await localStorage.createDeck(testUserId, 'Test Deck');
      await localStorage.deleteDeck(deck.id);

      await syncManager.start();
      await syncManager.syncNow();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockFirebaseDelete).toHaveBeenCalledWith(
        testUserId,
        deck.id
      );
    });

    it('should mark synced items as synced', async () => {
      mockFirebaseSet.mockResolvedValue(undefined);

      const deck = await localStorage.createDeck(testUserId, 'Test Deck');

      expect(deck.synced).toBe(false);

      await syncManager.start();
      await syncManager.syncNow();

      await new Promise(resolve => setTimeout(resolve, 100));

      const updated = await localStorage.getDeck(deck.id);
      expect(updated?.synced).toBe(true);
      expect(updated?.pendingChanges).toBe(false);
    });

    it('should clear sync queue after successful sync', async () => {
      mockFirebaseSet.mockResolvedValue(undefined);

      await localStorage.createDeck(testUserId, 'Deck 1');
      await localStorage.createDeck(testUserId, 'Deck 2');

      const queueBefore = await localStorage.getSyncQueue();
      expect(queueBefore.length).toBeGreaterThan(0);

      await syncManager.start();
      await syncManager.syncNow();

      await new Promise(resolve => setTimeout(resolve, 100));

      const queueAfter = await localStorage.getSyncQueue();
      expect(queueAfter).toHaveLength(0);
    });
  });

  describe('Download Remote Changes', () => {
    it('should download remote decks on sync', async () => {
      const remoteDeck = {
        id: 'remote-deck-1',
        title: 'Remote Deck',
        cardCount: 0,
        lastUpdated: Date.now(),
        userId: testUserId,
        createdAt: Date.now(),
      };

      mockGetUserDecks.mockResolvedValue([remoteDeck]);
      mockFirebaseSet.mockResolvedValue(undefined);

      await syncManager.start();
      await syncManager.syncNow();

      await new Promise(resolve => setTimeout(resolve, 100));

      const localDeck = await localStorage.getDeck('remote-deck-1');
      expect(localDeck).toBeDefined();
      expect(localDeck?.title).toBe('Remote Deck');
      expect(localDeck?.synced).toBe(true);
    });

    it('should download remote cards on sync', async () => {
      const deck = await localStorage.createDeck(testUserId, 'Test Deck');

      const remoteCard = {
        id: 'remote-card-1',
        deckId: deck.id,
        title: 'Remote Card',
        category: 'action' as any,
        content: 'Remote content',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        userId: testUserId,
      };

      mockGetUserCards.mockResolvedValue([remoteCard]);
      mockFirebaseSet.mockResolvedValue(undefined);

      await syncManager.start();
      await syncManager.syncNow();

      await new Promise(resolve => setTimeout(resolve, 100));

      const localCard = await localStorage.getCard('remote-card-1');
      expect(localCard).toBeDefined();
      expect(localCard?.title).toBe('Remote Card');
      expect(localCard?.synced).toBe(true);
    });
  });

  describe('Conflict Resolution', () => {
    it('should use last-write-wins for conflicts', async () => {
      // Create local deck
      const localDeck = await localStorage.createDeck(testUserId, 'Local Title');

      // Simulate remote deck with same ID but newer timestamp
      const remoteDeck = {
        ...localDeck,
        title: 'Remote Title (Newer)',
        lastUpdated: Date.now() + 1000,
      };

      mockGetUserDecks.mockResolvedValue([remoteDeck]);
      mockFirebaseSet.mockResolvedValue(undefined);

      await syncManager.start();
      await syncManager.syncNow();

      await new Promise(resolve => setTimeout(resolve, 100));

      const result = await localStorage.getDeck(localDeck.id);
      expect(result?.title).toBe('Remote Title (Newer)');
    });

    it('should keep local changes if newer than remote', async () => {
      // Simulate remote deck with old timestamp
      const remoteDeck = {
        id: 'deck-1',
        title: 'Remote Title (Old)',
        cardCount: 0,
        lastUpdated: Date.now() - 10000,
        userId: testUserId,
        createdAt: Date.now() - 10000,
      };

      mockGetUserDecks.mockResolvedValue([remoteDeck]);

      // Create local deck with same ID but newer timestamp
      const localDeck = await localStorage.createDeck(testUserId, 'Local Title (Newer)', 'deck-1');

      mockFirebaseSet.mockResolvedValue(undefined);

      await syncManager.start();
      await syncManager.syncNow();

      await new Promise(resolve => setTimeout(resolve, 100));

      const result = await localStorage.getDeck('deck-1');
      expect(result?.title).toBe('Local Title (Newer)');
    });
  });

  describe('Retry Logic', () => {
    it('should retry failed sync operations', async () => {
      mockFirebaseSet
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(undefined);

      await localStorage.createDeck(testUserId, 'Test Deck');

      await syncManager.start();
      await syncManager.syncNow();

      await new Promise(resolve => setTimeout(resolve, 100));

      // Should retry and eventually succeed
      expect(mockFirebaseSet).toHaveBeenCalledTimes(2);
    });

    it('should give up after max retries', async () => {
      mockFirebaseSet.mockRejectedValue(new Error('Network error'));

      await localStorage.createDeck(testUserId, 'Test Deck');

      await syncManager.start();
      await syncManager.syncNow();

      await new Promise(resolve => setTimeout(resolve, 500));

      // Should try initial + 3 retries = 4 total
      expect(mockFirebaseSet.mock.calls.length).toBeLessThanOrEqual(4);
    });
  });

  describe('Sync Status Callbacks', () => {
    it('should call onSyncStart callback', async () => {
      const onSyncStart = vi.fn();
      syncManager.onSyncStart(onSyncStart);

      await syncManager.start();
      await syncManager.syncNow();

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(onSyncStart).toHaveBeenCalled();
    });

    it('should call onSyncComplete callback', async () => {
      mockFirebaseSet.mockResolvedValue(undefined);

      const onSyncComplete = vi.fn();
      syncManager.onSyncComplete(onSyncComplete);

      await localStorage.createDeck(testUserId, 'Test Deck');

      await syncManager.start();
      await syncManager.syncNow();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(onSyncComplete).toHaveBeenCalledWith({ success: true, itemsSynced: expect.any(Number) });
    });

    it('should call onSyncError callback on failure', async () => {
      mockFirebaseSet.mockRejectedValue(new Error('Sync failed'));

      const onSyncError = vi.fn();
      syncManager.onSyncError(onSyncError);

      await localStorage.createDeck(testUserId, 'Test Deck');

      await syncManager.start();
      await syncManager.syncNow();

      await new Promise(resolve => setTimeout(resolve, 500));

      expect(onSyncError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('Manual Sync', () => {
    it('should allow manual sync trigger', async () => {
      mockFirebaseSet.mockResolvedValue(undefined);

      await localStorage.createDeck(testUserId, 'Test Deck');

      // Don't start automatic sync, just trigger manually
      await syncManager.syncNow();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockFirebaseSet).toHaveBeenCalled();
    });

    it('should return sync status from manual trigger', async () => {
      mockFirebaseSet.mockResolvedValue(undefined);

      await localStorage.createDeck(testUserId, 'Test Deck');

      const result = await syncManager.syncNow();

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('itemsSynced');
    });
  });

  describe('Performance', () => {
    it('should handle batch sync efficiently', async () => {
      mockFirebaseSet.mockResolvedValue(undefined);

      // Create multiple items
      for (let i = 0; i < 10; i++) {
        await localStorage.createDeck(testUserId, `Deck ${i}`);
      }

      const startTime = Date.now();

      await syncManager.start();
      await syncManager.syncNow();

      await new Promise(resolve => setTimeout(resolve, 200));

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (< 1 second for 10 items)
      expect(duration).toBeLessThan(1000);
      expect(mockFirebaseSet).toHaveBeenCalledTimes(10);
    });
  });
});
