/**
 * Sync Manager
 *
 * Manages synchronization between local IndexedDB and Firebase.
 * Monitors network status and syncs when online.
 *
 * DESIGN PHILOSOPHY - LOCAL-FIRST:
 * - Monitor network status automatically
 * - Upload pending changes from sync queue
 * - Download remote changes
 * - Last-write-wins conflict resolution
 * - Retry failed operations
 * - Status callbacks for UI
 *
 * TDD: Built to pass sync-manager.test.ts
 */

import { LocalStorageService } from './local-storage';
import { LocalDeck, LocalCard, SyncQueueEntry } from './schema';
import { networkStatus } from '../network-status';
import * as firebaseService from '../firebase-service';

export interface SyncResult {
  success: boolean;
  itemsSynced: number;
  error?: Error;
}

type SyncStartCallback = () => void;
type SyncCompleteCallback = (result: SyncResult) => void;
type SyncErrorCallback = (error: Error) => void;

export class SyncManager {
  private localStorage: LocalStorageService;
  private userId: string;
  private running: boolean = false;
  private syncInProgress: boolean = false;
  private unsubscribeNetwork?: () => void;

  private startCallbacks: Set<SyncStartCallback> = new Set();
  private completeCallbacks: Set<SyncCompleteCallback> = new Set();
  private errorCallbacks: Set<SyncErrorCallback> = new Set();

  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 1000;

  constructor(localStorage: LocalStorageService, userId: string) {
    this.localStorage = localStorage;
    this.userId = userId;
  }

  /**
   * Start monitoring network and auto-syncing
   */
  async start(): Promise<void> {
    if (this.running) return;

    this.running = true;

    // Listen for online events
    this.unsubscribeNetwork = networkStatus.onOnline(() => {
      if (this.running) {
        this.syncNow();
      }
    });

    // Trigger initial sync if online
    if (networkStatus.isOnline()) {
      await this.syncNow();
    }
  }

  /**
   * Stop monitoring and syncing
   */
  async stop(): Promise<void> {
    this.running = false;

    if (this.unsubscribeNetwork) {
      this.unsubscribeNetwork();
      this.unsubscribeNetwork = undefined;
    }
  }

  /**
   * Check if sync manager is running
   */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * Manually trigger sync now
   */
  async syncNow(): Promise<SyncResult> {
    // Don't sync if offline
    if (!networkStatus.isOnline()) {
      return { success: false, itemsSynced: 0, error: new Error('Offline') };
    }

    // Don't start new sync if one is in progress
    if (this.syncInProgress) {
      return { success: false, itemsSynced: 0, error: new Error('Sync already in progress') };
    }

    this.syncInProgress = true;
    this.notifySyncStart();

    try {
      let itemsSynced = 0;

      // Phase 1: Upload pending changes
      const uploadedCount = await this.uploadPendingChanges();
      itemsSynced += uploadedCount;

      // Phase 2: Download remote changes
      const downloadedCount = await this.downloadRemoteChanges();
      itemsSynced += downloadedCount;

      const result: SyncResult = { success: true, itemsSynced };
      this.notifySyncComplete(result);
      return result;
    } catch (error) {
      const syncError = error as Error;
      this.notifySyncError(syncError);
      return { success: false, itemsSynced: 0, error: syncError };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Upload pending changes from sync queue
   */
  private async uploadPendingChanges(): Promise<number> {
    const queue = await this.localStorage.getSyncQueue();
    let synced = 0;

    for (const entry of queue) {
      try {
        await this.syncEntry(entry);
        await this.localStorage.removeSyncQueueEntry(entry.id);
        synced++;
      } catch (error) {
        // Retry logic
        const retrySuccess = await this.retryWithBackoff(
          () => this.syncEntry(entry),
          this.MAX_RETRIES
        );

        if (retrySuccess) {
          await this.localStorage.removeSyncQueueEntry(entry.id);
          synced++;
        } else {
          // Keep in queue for next sync attempt
          console.error('Failed to sync entry after retries:', entry, error);
        }
      }
    }

    return synced;
  }

  /**
   * Sync a single queue entry
   */
  private async syncEntry(entry: SyncQueueEntry): Promise<void> {
    if (entry.entityType === 'deck') {
      await this.syncDeckEntry(entry);
    } else if (entry.entityType === 'card') {
      await this.syncCardEntry(entry);
    }
  }

  /**
   * Sync deck entry
   */
  private async syncDeckEntry(entry: SyncQueueEntry): Promise<void> {
    if (entry.operation === 'delete') {
      await firebaseService.deleteDeck(this.userId, entry.entityId);
    } else {
      // create or update
      const deck = entry.data as LocalDeck;
      if (deck) {
        await firebaseService.setDeck(this.userId, deck.id, deck);

        // Mark as synced locally
        await this.localStorage.updateDeck(deck.id, {
          synced: true,
          pendingChanges: false,
        });
      }
    }
  }

  /**
   * Sync card entry
   */
  private async syncCardEntry(entry: SyncQueueEntry): Promise<void> {
    if (entry.operation === 'delete') {
      await firebaseService.deleteCard(this.userId, entry.entityId);
    } else {
      // create or update
      const card = entry.data as LocalCard;
      if (card) {
        await firebaseService.setCard(this.userId, card.id, card);

        // Mark as synced locally
        await this.localStorage.updateCard(card.id, {
          synced: true,
          pendingChanges: false,
        });
      }
    }
  }

  /**
   * Download remote changes from Firebase
   */
  private async downloadRemoteChanges(): Promise<number> {
    let downloaded = 0;

    // Download decks
    const remoteDecks = await firebaseService.getUserDecks(this.userId);
    for (const remoteDeck of remoteDecks) {
      const localDeck = await this.localStorage.getDeck(remoteDeck.id);

      if (!localDeck) {
        // New deck from remote - create locally
        const deck: LocalDeck = {
          ...remoteDeck,
          synced: true,
          pendingChanges: false,
        };
        await this.localStorage.createDeck(this.userId, deck.title, deck.id);
        await this.localStorage.updateDeck(deck.id, { synced: true, pendingChanges: false });
        downloaded++;
      } else {
        // Conflict resolution: last-write-wins
        if (remoteDeck.lastUpdated > localDeck.lastUpdated) {
          await this.localStorage.updateDeck(localDeck.id, {
            ...remoteDeck,
            synced: true,
            pendingChanges: false,
          });
          downloaded++;
        }
      }
    }

    // Download cards
    const remoteCards = await firebaseService.getUserCards(this.userId);
    for (const remoteCard of remoteCards) {
      const localCard = await this.localStorage.getCard(remoteCard.id);

      if (!localCard) {
        // New card from remote - create locally
        const card: LocalCard = {
          ...remoteCard,
          synced: true,
          pendingChanges: false,
        };
        await this.localStorage.createCard(
          this.userId,
          card.deckId,
          card.title,
          card.category,
          card.content,
          card.id
        );
        await this.localStorage.updateCard(card.id, { synced: true, pendingChanges: false });
        downloaded++;
      } else {
        // Conflict resolution: last-write-wins
        if (remoteCard.updatedAt > localCard.updatedAt) {
          await this.localStorage.updateCard(localCard.id, {
            ...remoteCard,
            synced: true,
            pendingChanges: false,
          });
          downloaded++;
        }
      }
    }

    return downloaded;
  }

  /**
   * Retry operation with exponential backoff
   */
  private async retryWithBackoff(
    operation: () => Promise<void>,
    maxRetries: number
  ): Promise<boolean> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await operation();
        return true;
      } catch (error) {
        if (attempt < maxRetries - 1) {
          // Wait before retry with exponential backoff
          const delay = this.RETRY_DELAY_MS * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    return false;
  }

  /**
   * Register callback for sync start
   */
  onSyncStart(callback: SyncStartCallback): void {
    this.startCallbacks.add(callback);
  }

  /**
   * Register callback for sync complete
   */
  onSyncComplete(callback: SyncCompleteCallback): void {
    this.completeCallbacks.add(callback);
  }

  /**
   * Register callback for sync error
   */
  onSyncError(callback: SyncErrorCallback): void {
    this.errorCallbacks.add(callback);
  }

  /**
   * Notify all start callbacks
   */
  private notifySyncStart(): void {
    this.startCallbacks.forEach(callback => callback());
  }

  /**
   * Notify all complete callbacks
   */
  private notifySyncComplete(result: SyncResult): void {
    this.completeCallbacks.forEach(callback => callback(result));
  }

  /**
   * Notify all error callbacks
   */
  private notifySyncError(error: Error): void {
    this.errorCallbacks.forEach(callback => callback(error));
  }
}
