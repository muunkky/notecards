# Journey 03: Card Reordering Drag-Free

## Overview
Implement e2e test for Writer's signature drag-free card reordering with tap-to-move interface.

**Why it matters:**
- **User Need:** "I want to reorder scenes without interrupting my creative flow"
- **Business Value:** Core differentiator - Writer's unique approach to reordering
- **Writer Thesis:** "Preserves flow state - No context switches, no cognitive load"

## Documentation
See full journey specification: `docs/testing/critical-user-journeys.md` - Flow Journey 3

## Acceptance Criteria
- [ ] Test creates deck with 3 cards
- [ ] Test taps reorder mode button
- [ ] Test verifies reorder UI appears (move up/down buttons)
- [ ] Test taps "Move up" on Card 3
- [ ] Test verifies card order changes
- [ ] Test exits reorder mode
- [ ] Test verifies final order is preserved
- [ ] Test runs in under 25 seconds
- [ ] No drag-and-drop gestures used (tap-based only)

## Implementation Notes
- Use Puppeteer for browser automation
- Test the tap-to-move interface (not drag-and-drop)
- Verify order changes with data-testid attributes
- Performance budget: 100ms for reorder operation
- Must test both mobile and desktop viewports

## Test Location
Create at: `src/test/e2e/journeys/03-card-reordering.test.ts`
