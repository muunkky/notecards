# Deck Sharing & Invitation System - Unified Design

Status: ACTIVE DESIGN (supersedes `sharing-short-term-behavior.md` and `invitation-system-design.md`)
Owner: TBD
Last Updated: 2025-09-23
Branch: `feature/deck-sharing`

---
## 1. Executive Summary
Initial deck sharing shipped as a minimal implementation (owners add existing users only). Collaborators currently cannot see shared decks because the listing hook filters only by ownership. This unified design defines the complete, production-ready sharing & invitation architecture: data model, security rules, API surface, hooks, lifecycle states, auditability, and a phased migration plan to complete the feature branch.
---
## 2. Goals & Non-Goals
### 2.1 Goals
- Allow users to access decks they own OR collaborate on (editor / viewer roles).
- Support inviting users who do not yet have an account via secure, revocable invitations.
- Provide clear membership management: add, remove, change role.
- Maintain least-privilege Firestore rules with auditable changes.
- Offer scalable retrieval of "accessible" decks.
- Ensure consistency between `roles` map and `collaboratorIds` array.

### 2.2 Non-Goals (Current Scope)
- Ownership transfer.
- Group/Team roles.
- Bulk CSV invites.
- Advanced notification channels beyond email.
- Real-time presence indicators.
---
## 3. Terminology
| Term | Meaning |
|------|---------|
| Owner | The deck creator (immutable `ownerId`). |
| Collaborator | Any non-owner user with a role (editor/viewer). |
| Role | Permission tier: owner > editor > viewer. |
| Invitation | Pending grant of a role to an email address. |
| Effective Role | Derived role for current user relative to a deck. |
| Accessible Deck | Deck where user is owner OR collaborator. |
---
## 4. Use Cases
1. Owner shares deck with an existing user (email already signed in). 
2. Owner invites a new email (user has never signed in) – invitation persisted until acceptance. 
3. Invitee signs in via deep link; role automatically granted. 
4. Owner changes collaborator from editor to viewer. 
5. Owner revokes pending invite. 
6. Collaborator views list of all accessible decks. 
7. Owner removes collaborator; audit trail records action. 
---
## 5. Data Model
### 5.1 Deck Document (`decks/{deckId}`)
Fields (additions in bold):
```
{
  title: string,
  ownerId: string,
  createdAt: timestamp,
  updatedAt: timestamp,
  cardCount?: number (denormalized),
  roles: { [uid: string]: 'owner' | 'editor' | 'viewer' }, // owner included explicitly
  collaboratorIds: string[], // excludes ownerId
  collaboratorCount: number,  // denormalized length of collaboratorIds
  lastMembershipChangeAt: timestamp
}
```
Consistency invariant: `roles` keys (excluding those mapped to 'owner') == `collaboratorIds` set.

### 5.2 Invitation Document (`deckInvites/{inviteId}`)
```
{
  deckId: string,
  inviterId: string,
  emailLower: string,
  roleRequested: 'editor' | 'viewer',
  status: 'pending' | 'accepted' | 'revoked' | 'expired',
  tokenHash: string, // SHA-256 of random token
  createdAt: timestamp,
  updatedAt: timestamp,
  expiresAt?: timestamp,
  acceptedBy?: string,
  acceptedAt?: timestamp,
  revokedBy?: string,
  revokedAt?: timestamp,
  reasonCode?: string // optional classification (e.g., 'owner_revoked')
}
```

### 5.3 Audit Log (`deckAudit/{eventId}`)
```
{
  deckId: string,
  type: 'INVITE_CREATED' | 'INVITE_ACCEPTED' | 'INVITE_REVOKED' | 'MEMBERSHIP_ADDED' | 'MEMBERSHIP_REMOVED' | 'ROLE_CHANGED',
  actorUid: string,
  targetUid?: string,
  targetEmailLower?: string,
  beforeRole?: string,
  afterRole?: string,
  timestamp: timestamp,
  metadata?: { [k: string]: any }
}
```
---
## 6. Role Semantics
Priority: owner > editor > viewer > none.
Allowed transitions (actor must be owner): none→editor/viewer, viewer↔editor, editor/viewer→none (removal). Cannot demote owner.
Invitation acceptance sets role to `roleRequested` only if user does not have higher role already.
---
## 7. Client Architecture
### 7.1 Services (Modular Layer)
- `membershipService.ts`:
  - `addCollaborator(deckId, emailOrUid, role)`
  - `removeCollaborator(deckId, uid)`
  - `changeCollaboratorRole(deckId, uid, newRole)`
  - Internally ensures role transitions are valid.
- `invitationService.ts`:
  - `createInvite(deckId, email, role)`
  - `listPendingInvites(deckId)`
  - `revokeInvite(inviteId)`
  - `acceptInvite(token, deckId)` (calls Cloud Function)
- `auditService.ts`: lightweight writer (optional initial stub).

### 7.2 Hooks
- `useAccessibleDecks()` – merges two listeners:
  1. `where('ownerId','==',uid)`
  2. `where('collaboratorIds','array-contains',uid)`
  De-dupes, computes `effectiveRole`, sorts by `updatedAt desc`.
- `useDeckMembership(deckId)` – single doc listener returns `roles` + collaborator enriched with profile display info.
- `useDeckInvites(deckId)` – live pending invites list (status=='pending').

### 7.3 UI Components
- `ShareDeckDialog` (expanded): Tabs: Collaborators | Pending Invites.
  - Collaborators: list, role dropdown, remove button.
  - Pending: email, role, status, revoke button.
  - Single input to add existing user OR create invite (auto-detect user existence). 
- Accept Invite Page: `/accept-invite?deckId=...&token=...`.
- Deck list shows badge if user is editor or viewer (e.g., pill: EDITOR / VIEWER).
---
## 8. Firestore Rules (Conceptual)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    function isSigned() { return request.auth != null; }
    function deck(docId) { return get(/databases/$(db)/documents/decks/$(docId)); }
    function role(docId) { return deck(docId).data.roles[request.auth.uid]; }
    function canReadDeck(docId) {
      return isSigned() && (
        deck(docId).data.ownerId == request.auth.uid || role(docId) in ['editor','viewer']
      );
    }

    match /decks/{deckId} {
      allow read: if canReadDeck(deckId);
      allow update: if isSigned() && (
        request.auth.uid == resource.data.ownerId || role(deckId) == 'editor'
      ) && !( 'ownerId' in request.resource.data.diff() );
      allow delete: if isSigned() && request.auth.uid == resource.data.ownerId;

      match /cards/{cardId} {
        allow read: if canReadDeck(deckId);
        allow create, update, delete: if isSigned() && (
          request.auth.uid == deck(deckId).data.ownerId || role(deckId) == 'editor'
        );
      }
    }

    match /deckInvites/{inviteId} {
      allow create: if isSigned() && deck(request.resource.data.deckId).data.ownerId == request.auth.uid
        && request.resource.data.status == 'pending';
      allow read: if isSigned() && (
        resource.data.inviterId == request.auth.uid || deck(resource.data.deckId).data.ownerId == request.auth.uid
      );
      allow update: if isSigned() && (
        resource.data.inviterId == request.auth.uid || deck(resource.data.deckId).data.ownerId == request.auth.uid
      ) && request.resource.data.status in ['revoked'];
      // No delete (audit retention)
    }
  }
}
```
(Final rules to be verified by emulator or standalone verifier script.)
---
## 9. Cloud Functions
| Function | Purpose | Notes |
|----------|---------|-------|
| `acceptInvite` | Exchange token for membership | Verifies tokenHash, status, email match; transaction updates deck + invite + audit. |
| `createInvite` (optional) | Validate and write invite + trigger email | Could be client direct write initially. |
| `sendInviteEmail` | Email dispatch (trigger) | Integrates with provider (SendGrid). |
| `cleanupExpiredInvites` | Scheduled expiration | Marks invites expired, writes audit. |
| `onUserCreate` (optional) | Auto-accept pending invites by email | Nice-to-have if tokenless flow chosen for MVP. |
---
## 10. Algorithmic Details
### 10.1 Accessible Deck Merge
```
Map deckId -> DeckPartial from each snapshot
On change: recompute array = Object.values(map)
Compute effectiveRole = (ownerId == uid ? 'owner' : roles[uid])
Sort by updatedAt desc (client side)
```
### 10.2 Role Change Validator
```
validateTransition(current, target):
  if current == target -> no-op
  if current == 'owner' -> reject
  if target not in ['editor','viewer', null] -> reject
  return allowed
```
### 10.3 Invitation Acceptance Transaction
1. Read invite doc + deck doc.
2. Validate pending & not expired.
3. Normalize auth.user.emailLower and compare with invite.emailLower.
4. Upsert role if not higher already.
5. Update collaboratorIds (set semantics) + counts.
6. Update invite status accepted & fill acceptance fields.
7. Create audit log doc.
---
## 11. Error Taxonomy
| Code | Meaning | Client Action |
|------|---------|--------------|
| invite/not-found | No invite token matches | Show generic invalid link msg |
| invite/expired | Past expiresAt | Offer re-request flow |
| invite/revoked | Revoked before acceptance | Inform user contact owner |
| invite/email-mismatch | Auth email != invite email | Advise sign out & sign in with invited account |
| membership/invalid-role | Illegal target role | Dev/report |
| membership/conflict | Already collaborator with equal/higher role | Silent success |
| rate/limit | Throttled invites | Ask user to wait |
---
## 12. Testing Strategy
| Layer | Tests |
|-------|-------|
| Unit | role validator, merge logic, token hashing, email normalization |
| Integration (Firestore emulator) | rules: owner/editor/viewer/outsider permutations |
| Functions emulator | acceptInvite success / expired / mismatch / replay |
| UI | Add collaborator (existing), invite creation, revoke, accept link flow (mock) |
| Regression | Drift detection between roles & collaboratorIds |
---
## 13. Performance & Scaling
- Two deck listeners per user (owned & collaborator) – acceptable up to ~100 decks each.
- Indexes: (deckInvites: deckId+status), (deckInvites: emailLower+status). Add composite if filtered + ordered queries arise.
- Denormalized counts avoid client array length iteration for large membership sets.
- If >200 accessible decks scenario emerges, introduce `userDeckMemberships/{uid}_{deckId}` summary docs for a single query (future).
---
## 14. Security & Privacy
- Aim to move from broad `users` read to split collections: `usersPublic` (profile) / `usersPrivate` (self-only) in later hardening pass.
- Tokens hashed; leakage does not expose plain tokens.
- Invitation acceptance path avoids exposing deck metadata until after validation.
---
## 15. Migration Plan (Actionable Checklist)
| Step | Status | Description |
|------|--------|-------------|
| 1 | DONE | Implement `useAccessibleDecks()` hook. |
| 2 | DONE | Add `effectiveRole` to `Deck` type + UI badges (badges pending visual pass but data field added). |
| 3 | DONE | Replace `useDecks` usage in `DeckScreen` with new hook. |
| 4 | DONE | Add membership service abstraction (move logic out of screen). |
| 5 | DONE | Add role change + remove collaborator UI: role dropdown (editor/viewer), remove button, row-level busy state, wired to membershipService.changeCollaboratorRole/removeCollaborator with optimistic UI patching in DeckScreen. Basic tests updated to pass new prop; follow-up tests to assert role-change calls and error handling will land next. |
| 6 | DONE | Introduce invitation collection + basic create/list/revoke (no email). |
| 7 | DONE | Expand Share dialog (pending invites section) with list + revoke and fallback to create invite on unknown email. |
| 8 | TODO | Implement token generation + `acceptInvite` Cloud Function stub (local emulator focus). |
| 9 | TODO | Add audit log writes for membership & invite events. |
| 10 | TODO | Reinstate rules test suite (fix emulator or finalize standalone rule verifier set for new rules). |
| 11 | TODO | Harden rules with final collaborator logic + deploy. |
| 12 | TODO | Add optional email sending integration (feature flag). |
| 13 | TODO | Document rollback & finalize feature branch merge notes. |

---
## 16. Rollback Strategy
If production instability:
- Disable sharing UI via `FEATURE_DECK_SHARING=false`.
- Optionally ignore invites by disabling function deployment.
- Membership changes remain inert; existing roles honored (no destructive migration required).
---
## 17. Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| Drift between `roles` and `collaboratorIds` | Transaction-level rewrite of both; periodic integrity check script. |
| Token replay | Mark invite accepted atomically; second attempt returns not-found/accepted. |
| Over-permissive rules early | Tight test matrix before final deploy; run rule verifier script. |
| Email enumeration | Generic success messages; never reveal existence directly. |
| Spam invites | Rate limiting in function + UI throttle (cooldown). |
---
## 18. Open Questions
- Should editors be allowed to invite others? (Default: NO for MVP.)
- Maximum collaborators per deck? (Propose soft limit: 25; enforce in service.)
- Auto-accept pending invites on first sign-in w/o token? (Optional alternate flow.)
---
## 19. Future Extensions
- Ownership transfer workflow.
- Team entities granting roles to groups.
- Commenting & activity feed UI.
- Fine-grained per-card permissions (probably out-of-scope). 
---
## 20. Implementation Notes
- Keep invitation + membership operations pure functions returning typed results for easy testing.
- Central error mapper translates thrown errors to user-facing messages with localized codes.
- Add `effectiveRole` at composition layer; do not persist it.
---
## 21. Deprecations
The following documents are superseded by this file:
- `sharing-short-term-behavior.md`
- `invitation-system-design.md`
They will remain temporarily with a deprecation banner until feature branch merge.
---
## 22. Appendix: Example Accept Invite Sequence
1. User clicks: `https://app.example.com/accept-invite?deckId=abc&token=PLAIN`.
2. Client hashes token, calls `acceptInvite` function.
3. Function validates and updates membership.
4. Response includes: `{ deckId, roleGranted, alreadyHadRole }`.
5. Client refreshes accessible decks list; navigates user to deck view.

---
End of Document.
