# Production Smoke Test Checklist (Deck Sharing Release)

Date: {{DATE}}
Target Branch: feature/deck-sharing -> main
Deployment Type: Firebase Hosting + Firestore Rules

## 1. Environment Sanity
- [ ] Confirm site loads: Open production URL (firebaseapp.com / web.app) and see login screen or decks list.
- [ ] Open DevTools console: No red (error) logs on initial load.
- [ ] Network tab: index.html, main JS, Firebase SDKs load with 200 responses.

## 2. Authentication
- [ ] Sign in with existing test user (email/password or service account assisted flow).
- [ ] Post-login redirect shows deck list (or empty state) without errors.
- [ ] Sign out and sign back in (session persistence check).

## 3. Deck CRUD (Owner)
- [ ] Create a new deck ("Smoke Deck").
- [ ] Add at least 2 cards (front/back distinct values).
- [ ] Reorder cards if feature is present (drag-and-drop) and verify new order persists on refresh.
- [ ] Edit deck title and confirm updated title persists after page reload.

## 4. Sharing UI (Owner Perspective)
- [ ] Open deck -> click Share button (feature flag enabled in production build).
- [ ] Add collaborator A as editor (valid registered user email) -> dialog updates list.
- [ ] Add collaborator B as viewer.
- [ ] Close and reopen dialog: roles persist.
- [ ] Attempt to add same email again -> appropriate duplicate handling (either prevented or clearly surfaced).

## 5. Collaborator (Editor) Permissions
Using separate browser session or private window as collaborator A:
- [ ] Log in as collaborator A.
- [ ] Shared deck appears in list (without ownership indicator if one exists).
- [ ] Open deck: Can read all cards.
- [ ] Edit a card front/back -> change persists after reload.
- [ ] Add a new card -> appears for owner after owner reloads.
- [ ] Attempt to change roles (no UI or action denied).
- [ ] Attempt to change deck title (allowed? Confirm expected rule: editors CAN update title) -> persists.

## 6. Collaborator (Viewer) Permissions
As collaborator B:
- [ ] Deck visible in list.
- [ ] Can open deck and read cards.
- [ ] UI hides card creation / edit actions OR actions fail gracefully.
- [ ] Cannot change deck title.
- [ ] Cannot open share dialog (if UI allows opening, role mutation must fail silently with message).

## 7. Security Rule Negative Scenarios (Manual Spot Checks)
(Use browser DevTools or crafted fetch calls if UI doesn’t expose):
- [ ] Viewer attempt to POST/PUT a new card results in permission denied (403 in Firestore SDK error).
- [ ] Editor attempt to modify roles map denied.
- [ ] Any non-collaborator user cannot read deck (permission denied in console / network error details).

## 8. Data Integrity
- [ ] createdAt timestamp unchanged after editor updates deck title.
- [ ] ownerId unchanged after any collaborator actions.
- [ ] Roles map only modified by owner actions.

## 9. Regression Checks
- [ ] Existing (non-shared) decks still load and can be edited by their owners.
- [ ] Global navigation / layout unaffected (no layout shifts from Share button).
- [ ] Card study/review flow (if present) still functions.

## 10. Performance / Bundle Quick Look
- [ ] Initial load under acceptable range (<3s on cold cache broadband) – subjective quick eye test.
- [ ] No massive console warnings besides known chunk size notice.

## 11. Analytics / Logging (If Applicable)
- [ ] No unexpected verbose logging leaking PII.

## 12. Cleanup
- [ ] Remove temporary smoke test decks or cards if they clutter production data.
- [ ] Document any anomalies in RELEASE-NOTES or follow-up ticket.

## 13. Pass/Fail Summary
Overall Result: [PASS | FAIL]
Blocking Issues:
- (list)
Follow-up Tasks:
- (list)

---
Generated as part of deck sharing deployment workflow. Update {{DATE}} and mark checkboxes during live verification.
