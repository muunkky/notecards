# 2025-09 Core Functionality Recovery Plan

_Last updated: 2025-09-10_

## Why this document exists
- Restore deck and card CRUD so the app is usable before layering new features.
- Drive the work with documentation-as-code and TDD: describe behaviour, add failing tests, then implement.
- Provide a single source of truth for the current sprint, replacing outdated handoff notes.

## Current ground truth (validated 2025-09-10)
- `createCard` omits `deckId`, so `useCards` filters out every snapshot (src/firebase/firestore.ts:255, src/hooks/useCards.ts:82).
- `updateCard` / `toggleFavorite` / `archiveCard` etc. fail because the Firestore helper expects a deck id (src/hooks/useCardOperations.ts:40, src/features/cards/CardScreen.tsx:338).
- `useCards` never tears down listeners on deck change, causing duplicate subscriptions (src/hooks/useCards.ts:122).
- UI copy and README contain corrupted glyphs (README.md:1, src/features/decks/DeckScreen.tsx:45).
- `complete-service-integration.test.ts` masks real failures by returning early when auth is missing (src/test/e2e/complete-service-integration.test.ts:45).

## Guiding workflow
1. Update the relevant spec section in this document (or linked docs) with the intended behaviour.
2. Add or update automated tests that fail against the current implementation.
3. Implement the fix/feature until tests pass.
4. Record the outcome here (notes, follow-up tasks, open questions).

Each task below lists: **Spec -> Tests -> Implementation -> Notes**. Keep the checklist updated as work progresses.

## Task backlog

### 1. Card persistence fixes (blocker)
- **Spec:** Cards created via UI must persist deck ownership and appear immediately in `CardScreen`.
- **Tests to add:**
  - Unit: extend Firestore wrapper tests to assert `deckId` is stored and returned.
  - Integration: mount `CardScreen` with mocked Firestore to confirm new card shows.
- **Implementation outline:**
  - Include `deckId` when creating cards (`CardData` / Firestore schema).
  - Allow `useCards` snapshot filter to accept documents lacking `deckId` during migration.
  - Provide migration script/test fixture to backfill existing cards.
- **Notes:** Collect data migration impact before deployment.
- **Progress 2025-09-10:** Firestore now stores deckId on card creation and useCards falls back to the active deck when legacy data omits it. Migration tooling still pending.

### 2. Card update API contract
- **Spec:** All write operations (`updateCard`, `toggleFavorite`, `archiveCard`, `duplicateCard`, etc.) must supply deck context so Firestore helpers succeed.
- **Tests to add:**
  - Unit tests for `useCardOperations` verifying deck id is passed (mocks).
  - Regression test for edit modal round-trip in `CardScreen` (component/E2E).
- **Implementation outline:**
  - Change hook signatures to accept `{ card, deckId }` or derive deck id internally.
  - Update all call sites and shared types.
  - Ensure optimistic UI handles errors gracefully.
- **Notes:** Update docs for hook API usage.

### 3. Subscription lifecycle hygiene
- **Spec:** Changing decks tears down old Firestore listeners and establishes only one active subscription.
- **Tests to add:**
  - Hook-level test using mocked `onSnapshot` verifying cleanup is invoked on dependency change.
- **Implementation outline:**
  - Capture unsubscribe synchronously in `useEffect` return.
  - Guard against race conditions during async deck ownership check.

### 4. Copy clean-up and accessibility
- **Spec:** Remove corrupted glyphs from README/UI strings; ensure aria-labels use plain ASCII or intended characters.
- **Tests to add:**
  - Optional lint/test: search CI for non-ASCII glyphs in critical files (script or unit test).
- **Implementation outline:**
  - Audit key files, replace glyphs with meaningful text.
  - Update branding messaging as needed.

### 5. E2E guard rails
- **Spec:** E2E suite must fail when prerequisites (auth, data) are missing, and cover deck/card CRUD happy path once fixed.
- **Tests to add:**
  - Update existing E2E to assert on create/edit/delete via UI.
  - Ensure helper throws instead of returning early on auth failure.
- **Implementation outline:**
  - Harden `complete-service-integration.test.ts` and add new journeys once CRUD fixed.

### 6. Follow-up / nice-to-have
- Data migration script or admin command for historical documents.
- Automated content lint to prevent glyph regression.
- Updated public roadmap once blockers resolved.

## Running log
| Date | Update |
|------|--------|
| 2025-09-10 | Document created; baseline issues captured. |
| 2025-09-10 | Card persistence tests added; deckId stored and reader fallback implemented. |

