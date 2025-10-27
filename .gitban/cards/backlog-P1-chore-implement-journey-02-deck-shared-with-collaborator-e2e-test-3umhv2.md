# Journey 02: Deck Shared with Collaborator

## Overview
Implement e2e test for deck sharing functionality - critical for collaboration use cases.

**Why it matters:**
- **User Need:** "I want to collaborate with my writing partner on the same project"
- **Business Value:** Collaboration features drive retention and word-of-mouth
- **Writer Thesis:** "Collaboration as design principle - Built for creative partnerships"

## Documentation
See full journey specification: `docs/testing/critical-user-journeys.md` - Core Journey 2

## Acceptance Criteria
- [ ] Test creates deck as User A
- [ ] Test opens share dialog
- [ ] Test enters User B email
- [ ] Test grants "can edit" permission
- [ ] Test verifies share success message
- [ ] Test signs in as User B (second browser context)
- [ ] Test verifies User B can see shared deck
- [ ] Test verifies User B can edit cards
- [ ] Test runs in under 45 seconds

## Implementation Notes
- Use Puppeteer with two browser contexts (User A, User B)
- Requires Firebase security rules testing
- Test both "view" and "edit" permissions
- Performance budget: 500ms for share operation
- Must test real-time sync between users

## Test Location
Create at: `src/test/e2e/journeys/02-deck-shared.test.ts`
