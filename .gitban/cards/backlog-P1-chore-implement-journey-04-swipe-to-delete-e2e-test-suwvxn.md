# Journey 04: Swipe to Delete

## Overview
Implement e2e test for mobile-first swipe gesture for deleting cards with undo safety net.

**Why it matters:**
- **User Need:** "I want to delete cards as easily as I create them"
- **Business Value:** Mobile-first UX differentiator - natural gesture interaction
- **Writer Thesis:** "Mobile-first design - Touch is the primary input method"

## Documentation
See full journey specification: `docs/testing/critical-user-journeys.md` - Mobile-First Journey 4

## Acceptance Criteria
- [ ] Test creates deck with 2 cards
- [ ] Test simulates left swipe gesture on Card 2
- [ ] Test verifies delete confirmation appears
- [ ] Test confirms deletion
- [ ] Test verifies undo toast appears
- [ ] Test verifies card is removed from list
- [ ] Test verifies remaining card count is 1
- [ ] Test runs in under 20 seconds
- [ ] Must test on mobile viewport (375x667)

## Implementation Notes
- Use Puppeteer touch emulation
- Simulate swipe with touchstart/touchmove/touchend events
- Test undo mechanism (toast with undo button)
- Performance budget: 150ms for swipe response
- Must verify soft delete (recoverable via undo)

## Test Location
Create at: `src/test/e2e/journeys/04-swipe-to-delete.test.ts`
