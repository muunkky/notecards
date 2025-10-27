# Critical User Journeys - E2E Test Coverage

**Version:** 1.0
**Last Updated:** October 27, 2025
**Status:** Living Document - Test Planning & Coverage Map

---

## Purpose of This Document

This document maps **critical user journeys** to **e2e tests**, ensuring we maintain coverage of the experiences that matter most to writers using Notecards. Each journey is documented with:

1. **Why it matters** - The user need and business value
2. **User story** - What the user is trying to accomplish
3. **Journey steps** - The specific actions and interactions
4. **Test coverage** - Which e2e test validates this journey
5. **Design principles** - Which Writer thesis principles this embodies

---

## Journey Categories

### 🎯 Core Journeys (Must Work)
Essential workflows that define the product. If these fail, the product is unusable.

### 🚀 Flow Journeys (Must Feel Good)
Interactions that enable "flow state" - where the tool gets out of the way and writing happens.

### 📱 Mobile-First Journeys (Must Be Touch-Native)
Touch interactions that feel natural on mobile, not like desktop-with-fingers.

### 💾 Resilience Journeys (Must Be Reliable)
Offline-first, data persistence, error recovery - the infrastructure that builds trust.

---

## 🎯 Core Journey 1: First Card Created

### Why It Matters
**User Need:** "I want to start writing immediately without setup overhead."
**Business Value:** First-run experience determines if users stick or bounce.
**Writer Thesis Principle:** "Gets out of the way - The work is what matters, not the tool"

### User Story
> As a screenwriter starting a new project, I want to create my first scene card immediately after signing in, so I can capture my idea before it fades.

### Journey Steps

```
1. User signs in (email/password or Google)
   └─ Expected: Redirects to DeckList screen
   └─ UX: No loading spinners > 300ms, no tutorial modals

2. User sees empty state: "Create your first deck"
   └─ Expected: Single clear CTA button, not buried in menu
   └─ UX: Button labeled "New Deck" (not "Create" or "Add")

3. User taps "New Deck"
   └─ Expected: Bottom sheet appears with title input
   └─ UX: Keyboard auto-focuses, no animation delay

4. User types deck name "Pilot Episode" and confirms
   └─ Expected: Deck created, navigates to CardList screen
   └─ UX: Instant transition (0ms), no fade/slide

5. User sees empty deck: "Add your first card"
   └─ Expected: Floating action button (FAB) bottom-right
   └─ UX: Tap target ≥48px, positioned for thumb reach

6. User taps FAB
   └─ Expected: Full-screen card editor appears
   └─ UX: Title field focused, category picker visible

7. User types card title "INT. COFFEE SHOP - DAY"
   └─ Expected: Title updates in real-time
   └─ UX: Monospace font, high contrast, no autocorrect

8. User selects category "Location" (amber decorator)
   └─ Expected: 4px amber strip appears on card preview
   └─ UX: Color picker bottom sheet, single tap selection

9. User types card content (scene description)
   └─ Expected: Content area expands, no character limit
   └─ UX: Same monospace font, vertical scroll only

10. User saves card
    └─ Expected: Returns to CardList, card visible immediately
    └─ UX: No confirmation modal, no loading state
```

### Test Coverage

**Status:** ⚠️ **Partial Coverage**

| Test File | Coverage | Notes |
|-----------|----------|-------|
| `real-browser-ui.test.ts` | ✅ Steps 1-2 | Tests sign-in and DeckList load |
| `user-journeys.test.ts` | ⏸️ Skipped | Would cover steps 3-10 (needs implementation) |
| **MISSING** | ❌ No test | Steps 5-10 (card creation UX) not covered |

### Required E2E Test

**File:** `src/test/e2e/journeys/01-first-card-created.test.ts`

```typescript
test('Journey: First card created - Happy path', async () => {
  // Setup: Clean user state
  await signInAsNewUser();

  // Step 1-2: Verify empty state
  await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
  await expect(page.locator('button:has-text("New Deck")')).toBeVisible();

  // Step 3-4: Create deck
  await page.click('button:has-text("New Deck")');
  await page.fill('input[name="deckTitle"]', 'Pilot Episode');
  await page.click('button:has-text("Create")');

  // Step 5: Verify FAB present
  await expect(page.locator('[data-testid="add-card-fab"]')).toBeVisible();

  // Step 6-10: Create card
  await page.click('[data-testid="add-card-fab"]');
  await page.fill('[data-testid="card-title"]', 'INT. COFFEE SHOP - DAY');
  await page.click('[data-testid="category-location"]');
  await page.fill('[data-testid="card-content"]', 'Sarah sits alone...');
  await page.click('[data-testid="save-card"]');

  // Verify: Card visible with amber decorator
  await expect(page.locator('[data-testid="card-item"]')).toBeVisible();
  await expect(page.locator('.decorator-strip.category-location')).toBeVisible();
});
```

---

## 🎯 Core Journey 2: Deck Shared with Collaborator

### Why It Matters
**User Need:** "I want to share my story cards with my writing partner."
**Business Value:** Collaboration is a key differentiator vs physical index cards.
**Writer Thesis Principle:** "Respects the craft - Writers are making something real"

### User Story
> As a screenwriter working with a co-writer, I want to share my deck so we can both add cards and rearrange the story structure together.

### Journey Steps

```
1. User opens deck "Pilot Episode"
   └─ Expected: CardList screen shows all cards
   └─ UX: Cards render < 100ms, virtualized if > 100 cards

2. User opens deck menu (three-dot icon, top-right)
   └─ Expected: Overlay menu appears with options
   └─ UX: 75% black scrim, menu slides from right, 200ms

3. User taps "Share Deck"
   └─ Expected: Bottom sheet with email input
   └─ UX: Keyboard auto-focuses, email validation visible

4. User types collaborator email "partner@example.com"
   └─ Expected: Email validates in real-time
   └─ UX: Green check on valid, red X on invalid

5. User taps "Send Invite"
   └─ Expected: Toast confirmation "Invite sent"
   └─ UX: Toast appears bottom-center, 3s duration

6. User sees deck badge "Shared with 1"
   └─ Expected: Badge appears on deck in DeckList
   └─ UX: Gray badge with person icon, not intrusive

7. Collaborator receives email notification
   └─ Expected: Email with "Accept Invite" link
   └─ UX: Link opens app, not browser landing page

8. Collaborator taps "Accept Invite"
   └─ Expected: Deck appears in their DeckList
   └─ UX: Deck labeled "Shared by [Owner Name]"

9. Both users see real-time updates
   └─ Expected: Card added by one appears for other < 1s
   └─ UX: New card fades in, no jarring pop-in
```

### Test Coverage

**Status:** ❌ **No Coverage**

| Test File | Coverage | Notes |
|-----------|----------|-------|
| **MISSING** | ❌ No test | No e2e test for sharing flow exists |
| `sharing-rules.test.ts` | 🔒 Unit | Tests Firestore security rules only, not UX |

### Required E2E Test

**File:** `src/test/e2e/journeys/02-deck-shared.test.ts`

```typescript
test('Journey: Deck shared with collaborator', async () => {
  // Setup: Two authenticated users
  const owner = await signInAsUser('owner@test.com');
  const collab = await signInAsUser('collab@test.com');

  // Owner creates and shares deck
  await owner.page.createDeck('Pilot Episode');
  await owner.page.openDeckMenu();
  await owner.page.click('button:has-text("Share Deck")');
  await owner.page.fill('input[type="email"]', 'collab@test.com');
  await owner.page.click('button:has-text("Send Invite")');

  // Verify toast confirmation
  await expect(owner.page.locator('.toast:has-text("Invite sent")')).toBeVisible();

  // Collaborator accepts invite
  const inviteId = await getLatestInviteId('collab@test.com');
  await collab.page.goto(`/invite/${inviteId}`);
  await collab.page.click('button:has-text("Accept Invite")');

  // Verify deck appears in collaborator's list
  await expect(collab.page.locator('.deck-item:has-text("Pilot Episode")')).toBeVisible();

  // Test real-time sync
  await collab.page.addCard('New scene idea');
  await owner.page.waitForSelector('.card-item:has-text("New scene idea")', { timeout: 2000 });
});
```

---

## 🚀 Flow Journey 3: Card Reordering (Drag-Free)

### Why It Matters
**User Need:** "I want to rearrange my story structure quickly without fighting with drag-and-drop."
**Business Value:** Reordering is the core interaction - if it's clunky, writers abandon the tool.
**Writer Thesis Principle:** "Feels like infrastructure - Solid, reliable, honest about what it is"

### User Story
> As a screenwriter restructuring Act 2, I want to move Scene 12 to position 8 using keyboard shortcuts, so I can reorganize without lifting my thumbs from the screen.

### Journey Steps

```
1. User views CardList with 20+ cards
   └─ Expected: All cards visible, scroll smooth
   └─ UX: Virtualized list, 60fps scroll

2. User long-presses card to enter ReorderMode
   └─ Expected: Card scales slightly, haptic feedback
   └─ UX: All cards show reorder handles (left edge)

3. User sees visual feedback: "ReorderMode Active"
   └─ Expected: Toast or banner at top
   └─ UX: Subtle, not blocking content

4. User taps ↑ button on card (move up)
   └─ Expected: Card swaps with card above, instant
   └─ UX: No animation, cards physically swap positions

5. User taps ↑ button 4 more times
   └─ Expected: Card moves up 4 positions total
   └─ UX: Each tap = instant swap, no rate limiting

6. User exits ReorderMode (tap "Done" or outside)
   └─ Expected: Reorder handles disappear, order saved
   └─ UX: Firestore write batched, no loading spinner

7. User refreshes page
   └─ Expected: Cards load in new order
   └─ UX: Order persisted, no rollback
```

### Test Coverage

**Status:** ❌ **No Coverage**

| Test File | Coverage | Notes |
|-----------|----------|-------|
| **MISSING** | ❌ No test | No e2e test for reorder interaction |
| `VirtualizedCardList.test.tsx` | 🧪 Unit | Tests rendering only, not reorder UX |

### Required E2E Test

**File:** `src/test/e2e/journeys/03-card-reordering.test.ts`

```typescript
test('Journey: Card reordering - Keyboard-first', async () => {
  // Setup: Deck with 10 cards
  await signInAndOpenDeck('Test Deck', { cardCount: 10 });

  // Get initial order
  const initialOrder = await getCardOrder();
  const targetCard = initialOrder[8]; // Card at position 9 (0-indexed)

  // Enter reorder mode
  await page.locator(`[data-card-id="${targetCard.id}"]`).longPress();
  await expect(page.locator('[data-testid="reorder-mode-active"]')).toBeVisible();

  // Move card up 5 positions (9 → 4)
  for (let i = 0; i < 5; i++) {
    await page.click(`[data-card-id="${targetCard.id}"] [data-testid="move-up"]`);
    await page.waitForTimeout(50); // Brief pause between taps
  }

  // Exit reorder mode
  await page.click('[data-testid="exit-reorder"]');

  // Verify new order
  const newOrder = await getCardOrder();
  expect(newOrder[3].id).toBe(targetCard.id); // Card now at position 4 (0-indexed)

  // Verify persistence
  await page.reload();
  const persistedOrder = await getCardOrder();
  expect(persistedOrder[3].id).toBe(targetCard.id);
});
```

---

## 📱 Mobile-First Journey 4: Swipe to Delete

### Why It Matters
**User Need:** "I want to delete bad ideas quickly without confirmation dialogs."
**Business Value:** Fast deletion = less friction = more willingness to experiment.
**Writer Thesis Principle:** "Preserves flow state - No interruptions, no decoration"

### User Story
> As a screenwriter editing my outline, I want to swipe left on a card to delete it with undo option, just like iOS Mail, so I can quickly remove scenes that don't work.

### Journey Steps

```
1. User views CardList
   └─ Expected: All cards scrollable
   └─ UX: Touch scroll, momentum scrolling

2. User swipes left on card
   └─ Expected: Card slides left, red delete button reveals
   └─ UX: Follows finger, 1:1 tracking, no lag

3. User continues swipe past threshold (50% width)
   └─ Expected: Card "commits" to delete, haptic feedback
   └─ UX: Slight resistance at threshold, then easy completion

4. User releases touch
   └─ Expected: Card animates out (fade + collapse)
   └─ UX: 200ms animation, cards below slide up

5. Toast appears: "Card deleted • UNDO"
   └─ Expected: Toast at bottom with undo button
   └─ UX: 5s timeout, tapping outside dismisses

6. User taps UNDO (within 5s)
   └─ Expected: Card reappears in original position
   └─ UX: Fade in, cards below slide down

7. Alternative: User doesn't tap UNDO
   └─ Expected: Card permanently deleted from Firestore
   └─ UX: Happens silently after 5s
```

### Test Coverage

**Status:** ⚠️ **Partial Coverage**

| Test File | Coverage | Notes |
|-----------|----------|-------|
| `useSwipe.test.ts` | 🧪 Unit | Tests hook logic, not gesture UX |
| **MISSING** | ❌ No test | No e2e test for swipe gesture + undo |

### Required E2E Test

**File:** `src/test/e2e/journeys/04-swipe-to-delete.test.ts`

```typescript
test('Journey: Swipe to delete with undo', async () => {
  // Setup: Deck with 5 cards
  await signInAndOpenDeck('Test Deck', { cardCount: 5 });

  const targetCard = await page.locator('[data-testid="card-item"]').first();
  const cardText = await targetCard.textContent();

  // Swipe left to delete
  await targetCard.swipe('left', { distance: 200 });

  // Verify card removed from view
  await expect(targetCard).not.toBeVisible({ timeout: 500 });

  // Verify undo toast appears
  await expect(page.locator('.toast:has-text("UNDO")')).toBeVisible();

  // Tap undo
  await page.click('button:has-text("UNDO")');

  // Verify card restored
  await expect(page.locator(`.card-item:has-text("${cardText}")`)).toBeVisible();

  // Delete again without undo
  await targetCard.swipe('left', { distance: 200 });
  await page.waitForTimeout(6000); // Wait past undo timeout

  // Verify card permanently deleted
  await page.reload();
  await expect(page.locator(`.card-item:has-text("${cardText}")`)).not.toBeVisible();
});
```

---

## 💾 Resilience Journey 5: Offline Card Creation

### Why It Matters
**User Need:** "I want to write on the subway/plane without internet."
**Business Value:** Offline-first = mobile-first = writer-first.
**Writer Thesis Principle:** "Mobile-only - Designed for one context"

### User Story
> As a screenwriter on a flight, I want to create new cards without internet connection, and have them sync automatically when I land, so I never lose work.

### Journey Steps

```
1. User opens app with internet connection
   └─ Expected: All decks load from Firestore
   └─ UX: IndexedDB cache updated

2. User loses internet (airplane mode)
   └─ Expected: Banner appears "Offline Mode"
   └─ UX: Subtle, gray banner at top, not blocking

3. User creates new card
   └─ Expected: Card appears immediately in list
   └─ UX: No different from online experience

4. User sees offline indicator on card
   └─ Expected: Small cloud icon with "↑" arrow
   └─ UX: Gray icon, not alarming, positioned bottom-right

5. User creates 5 more cards offline
   └─ Expected: All cards appear, all show offline indicator
   └─ UX: No degradation in performance

6. User regains internet connection
   └─ Expected: Banner changes to "Syncing..."
   └─ UX: Cloud icons change to spinner, sequential sync

7. Cards sync to Firestore
   └─ Expected: Cloud icons turn green ✓, then disappear
   └─ UX: Syncs in order created, 1-2s per card

8. User on different device sees new cards
   └─ Expected: Cards appear via real-time listener
   └─ UX: Fade in animation, ordered correctly
```

### Test Coverage

**Status:** ❌ **No Coverage**

| Test File | Coverage | Notes |
|-----------|----------|-------|
| `network-status.test.ts` | 🧪 Unit | Tests hook only, not offline behavior |
| **MISSING** | ❌ No test | No e2e test for offline mode + sync |

### Required E2E Test

**File:** `src/test/e2e/journeys/05-offline-card-creation.test.ts`

```typescript
test('Journey: Offline card creation + sync', async () => {
  // Setup: Online with existing deck
  await signInAndOpenDeck('Test Deck');

  // Simulate going offline
  await page.context().setOffline(true);

  // Verify offline banner
  await expect(page.locator('[data-testid="offline-banner"]')).toBeVisible();

  // Create 3 cards offline
  const offlineCards = ['Card A', 'Card B', 'Card C'];
  for (const title of offlineCards) {
    await page.click('[data-testid="add-card-fab"]');
    await page.fill('[data-testid="card-title"]', title);
    await page.click('[data-testid="save-card"]');

    // Verify offline indicator
    await expect(page.locator(`.card-item:has-text("${title}") .offline-icon`)).toBeVisible();
  }

  // Go back online
  await page.context().setOffline(false);

  // Verify syncing banner
  await expect(page.locator('[data-testid="syncing-banner"]')).toBeVisible();

  // Wait for sync to complete
  for (const title of offlineCards) {
    await expect(page.locator(`.card-item:has-text("${title}") .offline-icon`)).not.toBeVisible({ timeout: 5000 });
  }

  // Verify persistence on second device
  const secondBrowser = await launchSecondBrowser();
  await secondBrowser.signInAndOpenDeck('Test Deck');
  for (const title of offlineCards) {
    await expect(secondBrowser.page.locator(`.card-item:has-text("${title}")`)).toBeVisible();
  }
});
```

---

## Coverage Summary

| Journey | Priority | Status | Test File | Notes |
|---------|----------|--------|-----------|-------|
| First Card Created | 🎯 Core | ⚠️ Partial | Need `01-first-card-created.test.ts` | Steps 1-2 covered, 5-10 missing |
| Deck Shared | 🎯 Core | ❌ None | Need `02-deck-shared.test.ts` | Security rules tested, not UX |
| Card Reordering | 🚀 Flow | ❌ None | Need `03-card-reordering.test.ts` | Critical for writer workflow |
| Swipe to Delete | 📱 Mobile | ⚠️ Partial | Need `04-swipe-to-delete.test.ts` | Hook tested, not gesture |
| Offline Creation | 💾 Resilience | ❌ None | Need `05-offline-card-creation.test.ts` | PWA infrastructure untested |

**Overall Coverage:** 10% (1/10 steps fully tested)
**Target:** 80% (8/10 steps tested before next deployment)

---

## Next Steps

### Phase 1: Commit Current E2E Infrastructure ✅
- [x] Fixed Firebase window exposure
- [x] Added production smoke test (`test:e2e:prod`)
- [x] Created e2e test guide
- [x] This document created

### Phase 2: Build Core Journey Tests (P0)
- [ ] Create `01-first-card-created.test.ts`
- [ ] Create `03-card-reordering.test.ts`
- [ ] Create `05-offline-card-creation.test.ts`

### Phase 3: Build Collaboration + Mobile Tests (P1)
- [ ] Create `02-deck-shared.test.ts`
- [ ] Create `04-swipe-to-delete.test.ts`

### Phase 4: Deployment
- [ ] All 5 journey tests passing
- [ ] Deploy with confidence

---

## Test Writing Guidelines

### Follow Writer Thesis Principles

Every test should validate **UX principles**, not just functionality:

```typescript
// ❌ BAD: Only tests functionality
test('Card creation works', async () => {
  await page.click('#create-button');
  await page.fill('#title', 'Test');
  await page.click('#save');
  expect(await page.locator('.card').count()).toBe(1);
});

// ✅ GOOD: Tests functionality + UX principles
test('Card creation - Fast, uninterrupted flow', async () => {
  const startTime = Date.now();

  // Principle: "Gets out of the way"
  await page.click('[data-testid="add-card-fab"]');
  const modalAppearTime = Date.now() - startTime;
  expect(modalAppearTime).toBeLessThan(100); // No animation delay

  // Principle: "Preserves flow state"
  await expect(page.locator('[data-testid="card-title"]')).toBeFocused(); // Keyboard ready

  await page.fill('[data-testid="card-title"]', 'Test');
  await page.click('[data-testid="save-card"]');

  // Principle: "Feels like infrastructure" (instant, no loading)
  await expect(page.locator('.card-item')).toBeVisible({ timeout: 100 });
  expect(await page.locator('.loading-spinner').count()).toBe(0); // No loading state
});
```

### Test Data Philosophy

Use **realistic screenwriting data**, not lorem ipsum:

```typescript
// ❌ BAD: Meaningless test data
const cards = ['Test 1', 'Test 2', 'Test 3'];

// ✅ GOOD: Realistic screenwriting data
const cards = [
  { title: 'INT. COFFEE SHOP - DAY', category: 'location' },
  { title: 'Sarah discovers the truth', category: 'conflict' },
  { title: 'Theme: Trust vs paranoia', category: 'theme' }
];
```

### Performance Budgets

Every test should enforce performance budgets:

| Interaction | Budget | Rationale |
|-------------|--------|-----------|
| Card appears after save | < 100ms | "Instant" = no perceived delay |
| Scroll 60fps | 16.6ms/frame | Native scroll feel |
| Swipe gesture response | < 16ms | 1:1 finger tracking |
| Offline indicator appears | < 50ms | Immediate feedback |
| Sync completes per card | < 2s | Acceptable wait time |

---

## Maintenance

This document should be updated when:
- ✏️ New critical journey identified
- ✅ Test implementation completed
- 🐛 Journey step changes due to UX improvements
- 📊 Coverage metrics change significantly

**Document Owner:** Engineering Team
**Review Cadence:** Before each deployment
