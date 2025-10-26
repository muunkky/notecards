# Implement Offline Support Local First With Sync

**Type:** Feature
**Priority:** P1
**Status:** backlog
**Created:** Generated via MCP

## Description
Implement offline support - local-first with sync

## Tasks

### Phase 1: Online/Offline Detection ✅ COMPLETE
- [x] Write TDD tests for network status detection (17 tests)
- [x] Implement network status detector service
  - `src/services/network-status.ts` - NetworkStatusDetector class
  - Singleton pattern with global `networkStatus` instance
  - Detects online/offline status via `navigator.onLine`
  - Detects connection quality via Network Information API
  - Event listeners for online/offline changes
  - Callback system with unsubscribe functions
- [x] Write TDD tests for useNetworkStatus hook (15 tests)
- [x] Implement useNetworkStatus React hook
  - `src/hooks/useNetworkStatus.ts`
  - Wraps networkStatus service for React components
  - Automatic re-renders on network changes
  - Returns complete status snapshot
- [x] Write TDD tests for OfflineIndicator component (15 tests)
- [x] Implement OfflineIndicator component
  - `src/components/OfflineIndicator.tsx`
  - Brutalist styling matching Writer theme
  - Shows offline banner when disconnected
  - Shows slow connection warning (2g/slow-2g)
  - Accessible with aria-live region
  - Fixed position, mobile-first design
- [x] Integrate OfflineIndicator into main App

**Phase 1 Test Coverage:** 47 tests passing

### Phase 2: Local Storage Layer ✅ COMPLETE
- [x] Design IndexedDB schema for decks and cards
  - `src/services/storage/schema.ts`
  - Three object stores: decks, cards, syncQueue
  - Indexes for efficient querying (userId, deckId, timestamps)
  - Sync tracking (synced, pendingChanges flags)
- [x] Write TDD tests for IndexedDB wrapper (20 tests)
- [x] Implement IndexedDB wrapper
  - `src/services/storage/indexeddb-wrapper.ts`
  - Promise-based async API
  - CRUD operations (get, getAll, put, delete)
  - Index queries and counting
  - Batch operations (putMany, deleteMany)
  - Transaction management
  - Error handling
- [x] Write TDD tests for local storage service (30 tests)
- [x] Implement local storage service
  - `src/services/storage/local-storage.ts`
  - Deck CRUD operations with card count tracking
  - Card CRUD operations with deck relationship
  - Automatic sync queue management
  - Referential integrity (cascade deletes)
  - UUID generation for IDs

**Phase 2 Test Coverage:** 50 tests passing (20 + 30)

### Phase 3: Sync Manager ✅ COMPLETE
- [x] Write TDD tests for sync manager (22 tests)
- [x] Implement Firebase sync service abstraction
  - `src/services/firebase-service.ts`
  - Mockable interface for testing
  - Functions for decks and cards CRUD
- [x] Implement SyncManager class
  - `src/services/storage/sync-manager.ts`
  - Two-phase sync: upload pending changes, download remote changes
  - Network status monitoring with auto-sync on reconnect
  - Last-write-wins conflict resolution using timestamps
  - Retry logic with exponential backoff (3 retries max, 1s base delay)
  - Status callbacks: onSyncStart, onSyncComplete, onSyncError
  - Manual sync trigger: `syncNow()`
- [x] Write TDD tests for sync status indicator (17 tests)
- [x] Implement SyncStatusIndicator component
  - `src/components/SyncStatusIndicator.tsx`
  - Three states: syncing, success, error
  - Auto-hide success after 3 seconds
  - Persistent error display (no auto-hide)
  - Brutalist styling with state-specific colors
  - Positioned above offline indicator
  - Accessibility: role="status", aria-live="polite"

**Phase 3 Test Coverage:** 39 tests passing (22 + 17)

## Implementation Summary

**Total Test Coverage:** 136 tests passing
- Phase 1 (Network Detection): 47 tests
- Phase 2 (Local Storage): 50 tests
- Phase 3 (Sync Manager): 39 tests

**Key Deliverables:**
1. Complete offline-first architecture with automatic Firebase sync
2. Network status detection with connection quality monitoring
3. IndexedDB-based local storage with sync queue
4. SyncManager with conflict resolution and retry logic
5. UI components: OfflineIndicator and SyncStatusIndicator
6. Comprehensive TDD test coverage (136 tests)

**Files Created:**
- `src/services/network-status.ts` - Network detection service
- `src/hooks/useNetworkStatus.ts` - React hook wrapper
- `src/components/OfflineIndicator.tsx` - Offline banner
- `src/services/storage/schema.ts` - IndexedDB schema
- `src/services/storage/indexeddb-wrapper.ts` - Low-level DB wrapper
- `src/services/storage/local-storage.ts` - High-level storage service
- `src/services/firebase-service.ts` - Firebase abstraction
- `src/services/storage/sync-manager.ts` - Sync orchestration
- `src/components/SyncStatusIndicator.tsx` - Sync status UI
- Plus 9 test files with comprehensive coverage

**Git Commits:**
- Phase 1: commit 76779473
- Phase 2: commit 1abb5432
- Phase 3: commit e47f273d

**Status:** ✅ COMPLETE - All 3 phases implemented with TDD discipline
