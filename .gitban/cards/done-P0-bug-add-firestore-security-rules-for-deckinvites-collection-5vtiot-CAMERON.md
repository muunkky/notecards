# Bug: Missing Firestore Rules for Deck Sharing

## Discovered By
E2E Journey 03 test revealed that deck sharing fails in production with "Missing or insufficient permissions"

## Root Cause
The `invitationService.ts` writes to `deckInvites` collection, but there are NO security rules for this collection in `firestore.rules`.

## Current State
- ✅ Share UI implemented and working
- ✅ Share backend code implemented (invitationService.ts)
- ❌ Firestore rules missing for `/deckInvites/{inviteId}`

Without rules, Firestore blocks ALL operations by default.

## Impact
**Deck sharing is completely broken in production** - users cannot:
- Create invites
- List pending invites
- Revoke invites

## Required Rules

Need to add security rules for:
- `create`: Deck owners can create invites for their decks
- `read`: Users can read invites for their email + deck owners can see all invites for their decks
- `update/delete`: Deck owners can revoke/update invites for their decks

## Security Considerations
- Verify inviter owns the deck
- Prevent invite spam (rate limiting)
- Validate email format
- Check invite limits (already in code: 25 combined collaborators + invites)
- Ensure only deck owner can revoke invites

## Files to Modify
- `firestore.rules` - Add `/deckInvites/{inviteId}` match block

## Testing
- Run Journey 03 E2E test to verify sharing works
- Manually test: create deck → click Share → add email → verify pending invite appears
- Test permissions: non-owner cannot create invites for someone else's deck

## References
- invitationService.ts:50 - uses `collection(db, 'deckInvites')`
- ShareDeckDialog.tsx:63 - calls createInvite()
- E2E test: tests/e2e/user-journeys/03-share-deck.mjs



## Implementation Complete

### Changes Made
1. **Added deckInvites security rules** to `firestore.rules`:
   - Create: Only deck owner can create invites for their decks
   - Read: Deck owner + users with matching email can see invites
   - Update/Delete: Only deck owner can modify/revoke invites
   - Validates all required fields (deckId, inviterId, emailLower, roleRequested, status, timestamps)

2. **Fixed TypeScript compilation errors**:
   - Added proper Vite type definitions in `src/vite-env.d.ts`
   - Defined ImportMeta interface with env property
   - CI now passes successfully

### Code Status
- ✅ Rules added to firestore.rules (commit e698f221)
- ✅ TypeScript errors fixed
- ✅ CI/CD passing
- ✅ Hosting deployed automatically

### Manual Deployment Required

**IMPORTANT**: Firestore rules must be deployed manually via Firebase Console because:
- GitHub Actions workflow only deploys hosting (`--only hosting`)
- Firebase CLI deployment hangs due to service account permission issues (see commit 18f70211)

**To Deploy via Firebase Console**:
1. Go to https://console.firebase.google.com/project/notecards-1b054/firestore/rules
2. Click "Edit rules"
3. Copy the contents of `firestore.rules` from the repository
4. Paste into the editor
5. Click "Publish"

**Verification After Deploy**:
Run E2E test: `node tests/e2e/user-journeys/03-share-deck.mjs` (against production)

### Technical Details

**Rules Implementation** (firestore.rules:96-122):
```javascript
match /deckInvites/{inviteId} {
  function isDeckOwner(deckId) { 
    return deckExists(deckId) && deckDoc(deckId).data.ownerId == request.auth.uid; 
  }
  function emailMatches() { 
    return resource.data.emailLower == userEmail().lower(); 
  }
  
  allow create: if isSignedIn() && isDeckOwner(requestDeckId()) && ...
  allow read: if isSignedIn() && (isDeckOwner(inviteDeckId()) || emailMatches());
  allow update, delete: if isSignedIn() && isDeckOwner(inviteDeckId());
}
```

**Why It Failed Before**: The deckInvites collection had NO security rules in production, causing all operations to fail with "Missing or insufficient permissions". Test rules (firestore.rules.test) already had permissive rules, which is why local emulator tests passed.
