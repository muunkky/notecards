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

### Phase 3: Sync Manager (PENDING)
- [ ] Write TDD tests for sync manager
- [ ] Implement Firebase sync when online
  - Detect when online via networkStatus
  - Upload pending changes from sync queue
  - Download remote changes from Firebase
  - Handle conflicts (last-write-wins strategy)
- [ ] Implement retry logic for failed syncs
- [ ] Add sync status indicator to UI

**Total Test Coverage:** 97 tests passing (47 + 50)

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
  - Added to `src/App.tsx` for global display

**Phase 1 Test Coverage:** 47 tests passing (17 + 15 + 15)

### Phase 2: Local Storage Layer (PENDING)
- [ ] Design IndexedDB schema for decks and cards
- [ ] Write TDD tests for IndexedDB wrapper
- [ ] Implement local storage layer
  - Deck CRUD operations
  - Card CRUD operations
  - Query and filter operations
- [ ] Queue pending changes for sync

### Phase 3: Sync Manager (PENDING)
- [ ] Write TDD tests for sync manager
- [ ] Implement Firebase sync when online
  - Detect when online
  - Upload pending changes
  - Download remote changes
  - Handle conflicts (last-write-wins)
- [ ] Implement retry logic for failed syncs
- [ ] Add sync status indicator

## Notes
*Add any relevant notes here*
