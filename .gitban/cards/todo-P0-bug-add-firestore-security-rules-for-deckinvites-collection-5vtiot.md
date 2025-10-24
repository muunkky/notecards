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