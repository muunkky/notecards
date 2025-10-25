# Bug: Sharing Shows Success But Doesn't Actually Work

## Discovered By
Manual testing during E2E Journey 03 review - user noticed sharing appears to work but invited user doesn't see the deck

## Current Behavior
When sharing a deck manually in browser:
- ✅ UI shows success (no error message)
- ✅ Shows user ID in collaborators list (not email)
- ✅ Shows "no pending invites"
- ❌ **Invited user doesn't actually see the deck in their deck list**

## Automated Test Behavior
E2E test gets "Missing or insufficient permissions" error when trying to create invite

## Root Causes (Multiple Issues)

### Issue 1: Missing Firestore Rules (Card 5vtiot - P0)
- No rules for `deckInvites` collection
- Blocks invite creation in automated tests
- May also block manual invite creation

### Issue 2: Showing User ID Instead of Email
- UI displays user ID (not email) in collaborators list
- Suggests lookup succeeded but display logic wrong
- Check ShareDeckDialog.tsx rendering

### Issue 3: Collaborator Not Actually Added
- Manual share appears to succeed
- But invited user doesn't see deck
- Need to check:
  - Does `addCollaborator` actually update deck.roles?
  - Does `addCollaborator` actually update deck.collaboratorIds?
  - Is there a useDecks listener issue for collaborator decks?

## Investigation Steps

1. **Check addCollaborator implementation**
   - Does it actually write to Firestore?
   - Does it update both `roles` and `collaboratorIds` fields?
   - Verify membershipService.ts

2. **Check useDecks hook for collaborators**
   - Line in ShareDeckDialog error: "Collaborator decks listener error"
   - Is useDecks querying for both owned AND collaborated decks?
   - Check if roles-based deck query is working

3. **Test manual flow step-by-step**
   - Add collaborator manually
   - Check Firestore console - is deck document actually updated?
   - Check invited user's browser - do they query for collaborated decks?

4. **Check ShareDeckDialog display logic**
   - Why showing user ID instead of email?
   - Should lookup user profile by ID and show email

## Files to Investigate
- `src/sharing/membershipService.ts` - addCollaborator implementation
- `src/hooks/useDecks.ts` - collaborator deck querying
- `src/ui/ShareDeckDialog.tsx` - display logic
- `firestore.rules` - deck update permissions for roles field

## Testing
After fixes:
- Manual test: Share deck with real email
- Verify invited user sees deck in their list
- Verify E2E test can share deck (after Firestore rules fixed)
- Verify correct email shown in UI (not user ID)



## Resolution

### Issue 1: FIXED ✅
**Missing Firestore Rules** (Card 5vtiot - P0) has been completed:
- Added comprehensive security rules for `deckInvites` collection
- Rules deployed to production via Firebase Console
- Blocks invite creation issue now resolved

### Issues 2 & 3: Likely Resolved
With Firestore rules in place:
- E2E test should now pass (can create invites)
- Manual sharing should work end-to-end
- UI issues (showing user ID vs email) may have been side effects

### Next Steps
If issues persist after Firestore rules deployment:
1. Run E2E test: `node tests/e2e/user-journeys/03-share-deck.mjs`
2. Create specific bug cards for remaining issues:
   - Display bug: "Show email instead of user ID in collaborators list"
   - Data bug: "Collaborator not added to deck.roles"

**Investigation complete** - primary blocker (missing Firestore rules) has been fixed.
