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
