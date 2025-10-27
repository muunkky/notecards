# Journey 01: First Card Created

## Overview
Implement e2e test for the most critical user journey - first-time user creating their first card.

**Why it matters:**
- **User Need:** "I want to start writing immediately without setup overhead"
- **Business Value:** First-run experience determines if users stick or bounce
- **Writer Thesis:** "Gets out of the way - The work is what matters, not the tool"

## Documentation
See full journey specification: `docs/testing/critical-user-journeys.md` - Core Journey 1

## Acceptance Criteria
- [ ] Test signs in with service account
- [ ] Test creates a deck named "My First Story"
- [ ] Test creates first card with title "Opening scene"
- [ ] Test verifies card appears in card list
- [ ] Test verifies card can be clicked to view
- [ ] Test runs in under 30 seconds
- [ ] Test follows Writer UX principles (instant feedback, no loading states)

## Implementation Notes
- Use Puppeteer for browser automation
- Use Firebase service account for authentication
- Target production URL (notecards-1b054.web.app)
- Follow test pattern from `critical-user-journeys.md`
- Performance budget: 300ms for card creation

## Test Location
Create at: `src/test/e2e/journeys/01-first-card-created.test.ts`

## TDD Progress

### Test Created ✅
- `/src/test/e2e/journeys/01-first-card-created.test.ts`
- Status: Red (failing as expected)
- Performance budgets defined: 30s total, 300ms card creation

### Production Code Changes (Green Phase)

- ✅ Added `data-testid="create-deck-button"` to DeckListScreen:243
- ✅ Added `data-testid="deck-card"` with `data-deck-name` to deck items
- ✅ Created CreateDeckDialog component with testids (src/ui/CreateDeckDialog.tsx)
  - `data-testid="deck-name-input"` - Input field
  - `data-testid="create-deck-submit"` - Submit button
- ✅ Integrated CreateDeckDialog into DeckListScreen
- ✅ Updated DeckListScreen interface to accept deck name parameter
- ✅ Updated App.tsx handleAddDeck to accept name parameter

### Next Steps (To Make Test Green)

1. ✅ Add deck creation dialog/modal with testids
2. ✅ Add card creation UI with testids
3. ✅ Add card list/detail views with testids
4. 🟡 Run test to verify all selectors work
5. 🟡 Add Firebase integration to actually create deck/card data
6. 🟡 Fix any remaining test failures
7. 🟡 Verify performance budgets are met
