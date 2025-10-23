# Deployment Smoke Test Checklist

Post-deployment verification checklist for the Notecards application.

## Purpose

This checklist ensures critical functionality works after every production deployment. Execute these tests immediately after deployment completes to catch issues before users are affected.

**Execution Time**: 5-10 minutes
**Frequency**: After every production deployment
**Executor**: Developer who deployed or QA team member

---

## Quick Reference

```markdown
## Smoke Test Status

Deployment: <version/commit>
Date: <YYYY-MM-DD>
Tester: <name>
Environment: Production (https://notecards-1b054.web.app)

Status: ⚠️ IN PROGRESS / ✅ PASSED / ❌ FAILED

Critical Issues Found: <count>
Minor Issues Found: <count>
```

---

## Pre-Test Setup

### 1. Environment Verification

```bash
# Verify deployment completed
gh run list --workflow=prod-deploy.yml --limit 1

# Expected: Status "completed" with green checkmark

# Verify live site responding
curl -I https://notecards-1b054.web.app

# Expected: HTTP/2 200
```

- [ ] Deployment workflow completed successfully
- [ ] Site returns HTTP 200
- [ ] No error alerts in Firebase Console

### 2. Test Account Preparation

**Use Test Account**:
- Email: `test@notecards-app.com` (or create new test account)
- Password: <secure test password>
- Purpose: Avoid affecting personal data during testing

**Prepare Test Data**:
- [ ] Test account has 0-2 existing decks (clean slate)
- [ ] Browser cache cleared (Ctrl+Shift+Delete)
- [ ] Open incognito/private window for clean session

---

## Critical Path Tests

### Test 1: Site Loads

**Steps**:
1. Navigate to https://notecards-1b054.web.app
2. Wait for page to fully load

**Expected Results**:
- [ ] Page loads within 3 seconds
- [ ] No console errors (F12 → Console tab)
- [ ] Logo and navigation visible
- [ ] "Sign In with Google" button visible

**If Failed**:
- Screenshot console errors
- Check Network tab for failed requests
- Execute rollback immediately (see [rollback-procedures.md](./rollback-procedures.md))

---

### Test 2: Authentication (Sign In)

**Steps**:
1. Click "Sign In with Google"
2. Select test account (or enter credentials)
3. Wait for redirect back to app

**Expected Results**:
- [ ] Google OAuth popup opens
- [ ] After sign-in, redirected to app
- [ ] User email displayed in navigation/header
- [ ] "Sign Out" button visible

**If Failed**:
- Check Firebase Console → Authentication
- Verify OAuth configuration
- Consider rollback if authentication completely broken

---

### Test 3: Create Deck

**Steps**:
1. Click "Create New Deck" (or equivalent button)
2. Enter deck title: "Smoke Test Deck [timestamp]"
3. Click "Create" or "Save"

**Expected Results**:
- [ ] Deck creation form opens
- [ ] Deck title input accepts text
- [ ] Deck created successfully (confirmation message)
- [ ] New deck appears in deck list
- [ ] Deck shows correct title

**If Failed**:
- Check Console for Firestore errors
- Verify Firestore rules (firebase firestore:rules)
- May indicate rules deployment issue

---

### Test 4: View Deck

**Steps**:
1. Click on newly created "Smoke Test Deck"
2. Wait for deck details to load

**Expected Results**:
- [ ] Deck detail view opens
- [ ] Deck title displayed correctly
- [ ] "Add Card" button visible
- [ ] Empty state message (if no cards yet)

**If Failed**:
- Check routing (browser URL should change)
- Check Firestore read permissions
- Verify deck data structure

---

### Test 5: Create Card

**Steps**:
1. Click "Add Card" or "Create Card"
2. Enter front: "Test Question [timestamp]"
3. Enter back: "Test Answer [timestamp]"
4. Click "Save" or "Create"

**Expected Results**:
- [ ] Card creation form opens
- [ ] Both front and back fields accept text
- [ ] Card created successfully
- [ ] Card appears in deck card list
- [ ] Card shows correct content (front text visible)

**If Failed**:
- Check Firestore permissions (cards subcollection)
- Verify card data structure
- Check for validation errors

---

### Test 6: Edit Card

**Steps**:
1. Click on created card or "Edit" button
2. Modify front text: "Updated Question [timestamp]"
3. Click "Save"

**Expected Results**:
- [ ] Edit form opens with existing content
- [ ] Text can be modified
- [ ] Changes saved successfully
- [ ] Updated text displayed in card list

**If Failed**:
- Check Firestore update permissions
- Verify `updatedAt` timestamp logic
- Check for race conditions

---

### Test 7: Flip Card (Front/Back)

**Steps**:
1. Click on card to view
2. Click "Flip" or tap card area
3. Verify back content displays

**Expected Results**:
- [ ] Card flips to show back content
- [ ] Back text matches what was entered
- [ ] Flip animation works (if applicable)
- [ ] Can flip back to front

**If Failed**:
- Check component state management
- Verify card content rendering
- May be CSS/styling issue (low priority)

---

### Test 8: Start Study Session

**Steps**:
1. Navigate back to deck view
2. Click "Study" or "Start Study Session"
3. Observe study interface

**Expected Results**:
- [ ] Study session starts
- [ ] First card displayed
- [ ] Navigation buttons visible (Next, Previous, Flip)
- [ ] Progress indicator visible (e.g., "1 / 1")

**If Failed**:
- Check study mode routing
- Verify card fetching logic
- Check state management for study session

---

### Test 9: Delete Card

**Steps**:
1. Return to deck view
2. Select card created in Test 5
3. Click "Delete" or trash icon
4. Confirm deletion

**Expected Results**:
- [ ] Delete confirmation prompt appears
- [ ] After confirming, card deleted
- [ ] Card removed from list
- [ ] Deck shows updated card count

**If Failed**:
- Check Firestore delete permissions
- Verify cascade delete logic (if any)
- Check optimistic UI updates

---

### Test 10: Delete Deck

**Steps**:
1. Navigate to deck list
2. Select "Smoke Test Deck"
3. Click "Delete Deck" (or menu → Delete)
4. Confirm deletion

**Expected Results**:
- [ ] Delete confirmation prompt appears
- [ ] After confirming, deck deleted
- [ ] Deck removed from list
- [ ] Redirected to deck list or home

**If Failed**:
- Check Firestore delete permissions (deck + cards)
- Verify cascade delete for cards
- Check for orphaned data

---

### Test 11: Sign Out

**Steps**:
1. Click user menu or profile icon
2. Click "Sign Out"
3. Confirm sign out if prompted

**Expected Results**:
- [ ] User signed out successfully
- [ ] Redirected to landing/login page
- [ ] No user info displayed
- [ ] "Sign In" button visible again

**If Failed**:
- Check Firebase Auth signOut logic
- Verify session management
- Check protected route handling

---

## Secondary Tests (If Time Permits)

### Test 12: Data Persistence

**Steps**:
1. Sign in (if signed out)
2. Create a deck and card
3. Sign out
4. Sign in again
5. Verify deck and card still exist

**Expected Results**:
- [ ] Deck persists after sign out/in
- [ ] Card content unchanged
- [ ] All data intact

---

### Test 13: Multiple Decks

**Steps**:
1. Create 3 decks with different titles
2. Verify all appear in list
3. Verify correct sorting (by updatedAt or title)

**Expected Results**:
- [ ] All decks created successfully
- [ ] Decks displayed in correct order
- [ ] No duplicate deck IDs

---

### Test 14: Multiple Cards in Deck

**Steps**:
1. Create deck
2. Add 5 cards with different content
3. View all cards in deck

**Expected Results**:
- [ ] All cards created
- [ ] Cards displayed in correct order
- [ ] Card count accurate
- [ ] Study session works with multiple cards

---

### Test 15: Performance Check

**Steps**:
1. Open DevTools (F12)
2. Navigate to Network tab
3. Reload page (Ctrl+R)
4. Check performance metrics

**Expected Results**:
- [ ] Page load time <3 seconds
- [ ] DOMContentLoaded <1 second
- [ ] All assets load (no 404s)
- [ ] Bundle size reasonable (<2MB total)

---

### Test 16: Mobile Responsiveness

**Steps**:
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test on iPhone 12 Pro viewport
4. Repeat critical tests (create deck, card)

**Expected Results**:
- [ ] UI responsive on mobile viewport
- [ ] No horizontal scrolling
- [ ] Buttons accessible (not cut off)
- [ ] Text readable (not too small)

---

### Test 17: Browser Compatibility

**Test in multiple browsers**:
- [ ] Chrome (primary)
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Edge

**Expected Results**:
- [ ] Core functionality works in all browsers
- [ ] No browser-specific errors
- [ ] Consistent UX across browsers

---

## Edge Cases (Optional)

### Test 18: Empty States

**Steps**:
1. Sign in with new test account (no decks)
2. Observe empty state

**Expected Results**:
- [ ] Empty state message displayed
- [ ] "Create Deck" call-to-action visible
- [ ] No errors in console

---

### Test 19: Long Content

**Steps**:
1. Create card with very long front text (500+ characters)
2. Create card with very long back text (500+ characters)
3. View and flip card

**Expected Results**:
- [ ] Long text accepted (no truncation in edit)
- [ ] Text displayed properly (may scroll or truncate in view)
- [ ] No layout breaking

---

### Test 20: Special Characters

**Steps**:
1. Create deck with special characters: "Test Déck 日本語 🎉"
2. Create card with emoji and symbols: "Question 🤔" / "Answer ✅ 👍"

**Expected Results**:
- [ ] Special characters saved correctly
- [ ] Unicode characters display properly
- [ ] Emoji render correctly

---

## Firestore Rules Verification

### Test 21: Security Rules

**Steps**:
1. Sign out
2. Try to access deck directly via URL
3. Verify redirected to sign-in

**Expected Results**:
- [ ] Unauthenticated users cannot access decks
- [ ] Redirected to sign-in page
- [ ] No data leaked in console errors

**Manual Rule Check**:
```bash
# Verify rules deployed
firebase firestore:rules --project notecards-1b054

# Expected: Rules file matches latest version in repo
```

---

## Post-Test Actions

### If All Tests Pass ✅

```markdown
## Smoke Test Results

Deployment: <version/commit>
Date: <YYYY-MM-DD HH:MM>
Tester: <name>

Status: ✅ PASSED

Critical Tests: 11/11 passing
Secondary Tests: <X>/<Y> passing

Notes:
- All critical functionality working
- No regressions detected
- Deployment approved for production traffic

Next Steps:
- Monitor Firebase Console for errors
- Watch for user reports
- Continue with normal operations
```

**Actions**:
1. Document results in deployment log
2. Notify team of successful deployment
3. Monitor Firebase Console for 1 hour post-deployment

---

### If Any Tests Fail ❌

```markdown
## Smoke Test Results

Deployment: <version/commit>
Date: <YYYY-MM-DD HH:MM>
Tester: <name>

Status: ❌ FAILED

Critical Tests: <X>/11 passing
Failed Tests:
- Test <#>: <name> - <brief description of failure>

Critical Issues Found: <count>
Minor Issues Found: <count>

Next Steps:
- Rollback initiated: <yes/no>
- Issue tracking card: <card ID>
```

**Immediate Actions**:

1. **Assess Severity**:
   - Critical (auth, data loss, site down) → Rollback immediately
   - Minor (UI bug, performance degradation) → Consider hotfix

2. **Execute Rollback if Needed**:
   ```bash
   # Quick rollback (2-5 min)
   # See rollback-procedures.md
   ```

3. **Document Failure**:
   - Screenshot errors
   - Save console logs
   - Record failed test steps
   - Create bug card with P0 priority

4. **Notify Team**:
   - Post in team channel
   - Tag relevant developers
   - Include severity and actions taken

---

## Automation (Future Enhancement)

### Automated Smoke Tests

```bash
# Conceptual automated test script
npm run smoke-test:production

# Would execute:
# - Puppeteer/Playwright tests
# - Critical path automation
# - Screenshot comparison
# - Performance benchmarks
```

**Benefits**:
- Faster execution (2-3 min vs 10 min manual)
- Consistent testing
- Can run on every deployment automatically
- Historical test result tracking

**Implementation**: Track in future card

---

## Checklist Template (Copy-Paste)

```markdown
# Smoke Test: Production Deployment

**Deployment Details**:
- Version/Commit: _______________________
- Deploy Date: _________________________
- Deploy Time: _________________________
- Deployed By: _________________________
- Tester: ______________________________

**Environment**: Production (https://notecards-1b054.web.app)

---

## Critical Path Tests

- [ ] Test 1: Site Loads
- [ ] Test 2: Authentication (Sign In)
- [ ] Test 3: Create Deck
- [ ] Test 4: View Deck
- [ ] Test 5: Create Card
- [ ] Test 6: Edit Card
- [ ] Test 7: Flip Card (Front/Back)
- [ ] Test 8: Start Study Session
- [ ] Test 9: Delete Card
- [ ] Test 10: Delete Deck
- [ ] Test 11: Sign Out

**Critical Tests Result**: ___/11 passing

---

## Status

Overall Status: ⚠️ IN PROGRESS / ✅ PASSED / ❌ FAILED

**Critical Issues**: 0
**Minor Issues**: 0

**Notes**:
<Add any observations or issues found>

**Action Taken**:
- [ ] Deployment approved
- [ ] Rollback initiated
- [ ] Hotfix required

**Next Steps**:
<What happens next?>
```

---

## Resources

**Documentation**:
- [Deployment Guide](./deployment-guide.md) - Deployment procedures
- [Rollback Procedures](./rollback-procedures.md) - Emergency rollback
- [Troubleshooting Guide](./troubleshooting.md) - Common issues

**Tools**:
- Firebase Console: https://console.firebase.google.com/project/notecards-1b054
- GitHub Actions: https://github.com/<repo>/actions
- Production Site: https://notecards-1b054.web.app

---

**Last Updated**: October 23, 2025
**Maintained By**: Development Team
**Next Review**: After automation implementation
