# Journey 05: Offline Card Creation

## Overview
Implement e2e test for offline-first functionality - creating cards without network connection.

**Why it matters:**
- **User Need:** "I want to write on the subway/plane without internet"
- **Business Value:** Resilience differentiator - never lose work
- **Writer Thesis:** "Works anywhere - Internet is not a prerequisite for creativity"

## Documentation
See full journey specification: `docs/testing/critical-user-journeys.md` - Resilience Journey 5

## Acceptance Criteria
- [ ] Test signs in and creates deck while online
- [ ] Test simulates network offline (page.setOfflineMode(true))
- [ ] Test creates card while offline
- [ ] Test verifies card appears in local UI
- [ ] Test restores network connection
- [ ] Test verifies card syncs to Firestore
- [ ] Test verifies card persists after page reload
- [ ] Test runs in under 40 seconds

## Implementation Notes
- Use Puppeteer's offline mode simulation
- Verify IndexedDB/local storage usage
- Test sync behavior when network returns
- Performance budget: 200ms for offline write
- Must verify data persistence across reload

## Test Location
Create at: `src/test/e2e/journeys/05-offline-card-creation.test.ts`
