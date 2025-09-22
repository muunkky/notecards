# Invitation System Design (Planned Enhancement)

Status: Draft / Proposed
Target Phase: Post initial sharing release
Owner: TBD
Last Updated: 2025-09-22

## 1. Objectives
Provide a robust invitation workflow that lets deck owners invite collaborators who have not yet signed up. Invitations should be secure, auditable, revocable, and minimize friction for both inviter and invitee.

### Success Criteria
- Owners can add an email that does not yet correspond to an existing user profile.
- Invitee receives an email (deep link) guiding them to sign up or sign in.
- Upon authentication, invitee is automatically granted the intended role on the deck.
- Invitation lifecycle states: pending -> accepted OR revoked/expired.
- No exposure of deck data to unauthenticated invitees prior to acceptance.
- Minimal race conditions (e.g., multiple invites to same email + role consolidation).

## 2. Non-Goals (Phase 1 of this feature)
- Multi-step role negotiation by invitee.
- In-app messaging or notifications beyond email.
- Bulk CSV invitations.
- Transfer of ownership / advanced privilege escalation flows.

## 3. High-Level Architecture
```
+-------------------+         create invite          +--------------------+
| Deck Owner Client |  ----------------------------> | Firestore (invites)|
+-------------------+                                 +---------+----------+
          |                                                     |
          | email link (Cloud Function send)                    |
          v                                                     v
+-------------------+   open link + oobCode/token    +---------------------+
| Invitee Browser   | -------------------------------->  Auth + Web App    |
+-------------------+                                   (validate token)   |
          |                                                     |
          | authenticated, profile ensured                      |
          |---------------- promote via Function -------------->|
          v                                                     v
    Deck access granted (roles map updated)        Deck document updated, invite marked accepted
```

## 4. Data Model

### 4.1 Collections
- `decks/{deckId}` (existing)
  - Add (later) optional `pendingInviteCount` (denormalized performance helper) – optional.

- `deckInvites/{inviteId}` (top-level) OR nested under deck (`decks/{deckId}/invites/{inviteId}`)
  - Decision: Use top-level `deckInvites` for easier querying by email across decks.

#### deckInvites fields
| Field | Type | Description |
|-------|------|-------------|
| deckId | string | Target deck reference ID |
| inviterId | string | UID of inviter |
| emailLower | string | Normalized invitee email (lowercase) |
| role | string | Desired role: 'viewer' | 'editor' (owner excluded) |
| status | string | 'pending' | 'accepted' | 'revoked' | 'expired' |
| createdAt | timestamp | Creation time |
| updatedAt | timestamp | Last mutation time |
| tokenHash | string | Hash of single-use invite token (if deep-linking) |
| expiresAt | timestamp (optional) | Optional expiry policy |
| acceptedBy | string (optional) | UID of accepting user |
| acceptedAt | timestamp (optional) | Acceptance time |
| revokedBy | string (optional) | UID of revoker |
| revokedAt | timestamp (optional) | Revocation time |

### 4.2 Token Model
- Generate a random 128-bit token; store only a SHA-256 hash in `tokenHash`.
- Email deep link contains plain token as query parameter `invToken` plus deckId.
- On open, client sends token to a Cloud Function (callable HTTPS) to exchange for invite metadata if valid & unexpired.

## 5. Firestore Security Rules (Outline)
Pseudo-rules (to be refined):
```
match /deckInvites/{inviteId} {
  function isOwner(invite) { return invite.deck.ownerId == request.auth.uid; }
  function isInviter(data) { return data.inviterId == request.auth.uid; }
  allow create: if isSignedIn() && request.resource.data.inviterId == request.auth.uid;
  allow read: if isSignedIn() && (
      isInviter(resource.data) ||
      // Allow invitee after token validation? (Prefer Cloud Function gating) -> maybe deny direct read.
      false
  );
  allow update: if isSignedIn() && isInviter(resource.data);
  allow delete: if isSignedIn() && isInviter(resource.data);
}
```
Rationale: Direct client reads for invite acceptance are optional if acceptance flow is mediated via callable Function (reduces inference attack surface). Token validation occurs server-side.

## 6. Cloud Functions
1. `createInvite` (optional – or client direct write if simple) – Validates deck ownership & existing role constraints.
2. `sendInviteEmail` (trigger on create OR combined with createInvite) – Uses a transactional email service (SendGrid, etc.).
3. `acceptInvite` – Parameters: token, deckId. Steps:
   - Verify auth (must be signed in).
   - Lookup invite by deckId + emailLower (from auth user) OR by token hash.
   - Validate status == 'pending', not expired.
   - Add user to deck roles + collaboratorIds in a transaction.
   - Update invite: status -> 'accepted', acceptedBy, acceptedAt.
4. `revokeInvite` – Inviter (or deck owner) sets status -> 'revoked'.
5. (Optional) `cleanupExpiredInvites` scheduled function to mark expired.

## 7. Client Flow
### Invite Creation
- Owner enters email -> if not existing user, still allowed.
- Client calls `createInvite` (or writes doc) -> optimistic UI adds a 'Pending' row with email.

### Invite Acceptance
- Invitee clicks email deep link -> redirected to web app route `/accept-invite?deckId=...&invToken=...`.
- If not authenticated, app prompts sign-in; after auth, route resumes.
- Client calls `acceptInvite` Function with token.
- On success, UI navigates to deck page with collaborator role.

### Displaying Pending Invites
- Query `deckInvites` where deckId == current deck AND status == 'pending'.
- Merge with active collaborators list.

## 8. Migration Plan
1. Phase 0 (Now): Document limitation (must exist) – DONE.
2. Phase 1: Introduce `deckInvites` schema + UI rendering of pending invites (without email sending, manual acceptance when user signs in via background trigger scanning by email). Minimal tokenization.
3. Phase 2: Add email delivery + token-based acceptance endpoint.
4. Phase 3: Add revocation/expiration and owner management UI (revoke, resend).

## 9. Backfill / Compatibility
- Existing decks: No action required.
- Existing collaborators: Unchanged.
- No invites table initially, so no backfill.

## 10. Edge Cases & Mitigations
| Scenario | Handling |
|----------|----------|
| Duplicate pending invite for same email/deck | Enforce unique composite (deckId + emailLower + status=='pending') via client check + Function guard |
| Email changes before acceptance | Pending invite remains; user may not match -> Provide manual cancel/resend |
| Invite token leaked | Single-use hash + short expiry; accepting consumes it |
| Owner removes collaborator then re-invites quickly | Allowed; previous accepted invite remains historical record |
| Malicious mass invites to many emails | Rate limit invite creation per deck per time window in Function |
| Spam / bounce | Email service metrics; optionally require manual confirmation before sending many |

## 11. Privacy & Security Considerations
- Avoid exposing whether an email has an account: generic success messaging for invite creation.
- Tokens are random & single-use; hash stored server-side prevents disclosure if Firestore leaked.
- Restrict direct read access to invite docs to inviter/owner only; invitee interacts via token-based Function.

## 12. Performance Considerations
- Index: composite index on (`deckId`, `status`) for pending queries.
- Limit pending invites list to reasonable count (e.g., <= 100) in UI.
- Token validation is O(1) via direct lookup by hashed token (store mapping hashedToken->inviteId) OR by scanning invites for that deck if small scale; prefer hashed field index if volume grows.

## 13. Open Questions
- Should invite acceptance auto-upgrade role if duplicate pending invites with different roles? (Simplify: use the most permissive or most recent.)
- Should we allow specifying role at invite time beyond editor/viewer (future roles)?
- Do we need analytics events for invite created/accepted? (Likely yes.)

## 14. Minimal Rules Additions (Draft)
```
match /deckInvites/{inviteId} {
  allow create: if isSignedIn() && request.resource.data.inviterId == request.auth.uid;
  allow read: if isSignedIn() && resource.data.inviterId == request.auth.uid; // owner could also read via deck ownership check
  allow update, delete: if isSignedIn() && resource.data.inviterId == request.auth.uid;
}
```
(Refine to permit deck owner even if different from inviter, and potentially disallow direct client update in favor of Functions.)

## 15. Test Strategy
- Unit: Token generation, hashing, validation helpers.
- Integration (Functions emulator): createInvite -> Firestore doc; acceptInvite -> role promotion.
- Rules verification: ensure only inviter/owner can read; invitee cannot enumerate pending invites.
- UI: Pending invite row appears, transitions to collaborator upon acceptance (mock Functions).

## 16. Rollout Plan
- Implement Phase 1 behind feature flag FEATURE_INVITES.
- Dogfood internally (manually simulate new users) for 1–2 days.
- Enable email delivery (Phase 2) after verifying acceptance & role promotion reliability.

## 17. Deprecation / Cleanup
- Once invitation flow stable, reconsider loosening direct read to `users` (maybe move to `usersPublic`).
- Remove/replace any temporary messaging referencing "must sign in first".

## 18. Appendix: Example Invite Acceptance Flow
1. Invite link: `https://app.example.com/accept-invite?deckId=abc&invToken=XYZ`.
2. App loads route: if not auth -> redirect to sign-in with return URL.
3. After auth: call `acceptInvite({ deckId, invToken })`.
4. Function:
   - Hash token; find invite with `deckId` + `tokenHash` & status=='pending'.
   - Verify auth user's emailLower matches invite.emailLower.
   - Firestore transaction: update deck roles/collaboratorIds + mark invite accepted.
5. Client updates deck view.

---
End of Design Document.
