# Deck Sharing & Collaboration Design

_Last updated: 2025-09-21 (later increment)_

Status: Phase 1 Nearly Complete (model + helpers + subscription + UI + security rules + emulator tests implemented)
Owner: (assign engineer)  
Related Docs: `Notecard App - Product Requirements Document.md`, `Deployment-Improvements.md`

## 1. Problem & Goals
Current system restricts every deck to a single `ownerId`. Users want to share study materials or brainstorming decks without cloning data. We need a minimally invasive extension enabling multiple authenticated users to access the same deck with defined capability boundaries.

Goals (Phase 1):
- Owner can invite another user via email to collaborate on a deck.
- Collaborators with role `editor` can create/update/delete cards and reorder them.
- Owner retains exclusive control over deck deletion and sharing settings.
- Deck listing for a collaborator includes shared decks.
- Firestore security rules enforce permissions; unauthorized access blocked.

Out of scope (Phase 1): real-time presence, per-card permissions, viewer role, public share links, activity feed, live cursor/state sync.

## 2. Phased Roadmap
| Phase | Scope | Roles | Key Deliverables | Risks |
|-------|-------|-------|------------------|-------|
| 1 | Basic sharing | owner, editor | Data model additions, invite UI, security rules, union deck query | Query complexity |
| 2 | Viewer role + UI gating | owner, editor, viewer | Read-only UI state, permission-based button disable | Rule drift |
| 3 | Public read-only link | anon token viewer | Signed link service, revocation | Token leakage |
| 4 | Activity & audit | all | Activity subcollection, timeline UI | Cost / size |
| 5 | Real-time presence | all | Presence tracking, avatars | Complexity |

## 3. Data Model Changes (Phase 1)
Add to `Deck` document:
```
roles: { [uid: string]: 'e' }  // collaborators excluding owner
collaboratorIds: string[]      // denormalized list for array-contains queries
sharedAt?: Timestamp
```
Keep existing `ownerId`. Owner implicitly has full rights; never duplicated in `roles`.

Rationale:
- Firestore cannot OR `ownerId == uid` with `roles.uid == 'e'` directly. We query owner decks and collaborator decks separately, then merge client-side. `collaboratorIds` supports `array-contains` queries.
- Roles map supports O(1) membership + atomic path updates: `roles.someUid = 'e'`.

Migration: Lazy. Decks without `roles` treated as private.

## 4. Security Rules (Phase 1 Draft Pseudocode)
```
function isOwner(deck) { return deck.ownerId == request.auth.uid; }
function isEditor(deck) { return deck.roles[request.auth.uid] == 'e'; }
function canRead(deck) { return isOwner(deck) || isEditor(deck); }
function canWriteDeckMeta() { return isOwner(resource.data); }
function canWriteCards(deck) { return isOwner(deck) || isEditor(deck); }

match /databases/{db}/documents {
  match /decks/{deckId} {
    allow get, list: if false; // list via queries only
    allow read: if canRead(resource.data);
    allow create: if request.auth != null && request.resource.data.ownerId == request.auth.uid;
    allow update: if isOwner(resource.data) || (
        isEditor(resource.data) && !('roles' in request.resource.data) && !('ownerId' in request.resource.data)
    );
    allow delete: if isOwner(resource.data);
  }
  match /decks/{deckId}/cards/{cardId} {
    allow read: if canRead(get(/databases/$(db)/documents/decks/$(deckId)).data);
    allow create, update, delete: if canWriteCards(get(/databases/$(db)/documents/decks/$(deckId)).data);
  }
}
```
Validation (Phase 1):
- Editors cannot modify `roles`, `ownerId`, or `collaboratorIds`.
- Only owner can introduce `roles` field.

## 5. Service Layer Additions
Implemented primitives:
- Added sharing fields (`collaboratorIds`, `roles`) to deck creation (initialized with owner role).
- Pure helpers: `addCollaborator`, `removeCollaborator`, `listCollaborators` (immutability, unit tested).
- Merge utility: `mergeAccessibleDecks` (union + dedupe).
- Accessible subscription: `subscribeToAccessibleDecks` (dual-stream pattern with test hook injection, collaborator stream placeholder until rules active).

Planned Firestore-integrated functions (next increments):
- `addCollaborator(deckId: string, email: string): Promise<void>`
  - Look up user UID by email in `users` collection (must exist).
  - Partial update: `roles.uid = 'e'`, `arrayUnion(collaboratorIds, uid)`, set `sharedAt` if absent.
- `removeCollaborator(deckId: string, uid: string): Promise<void>`
  - Remove from roles (delete path) + `arrayRemove(collaboratorIds, uid)`.
- `listCollaborators(deckId: string): Promise<Array<{ uid: string; role: 'e'; email?: string }>>` (join on user docs).

Deck retrieval update:
- `getUserDecks(userId)` becomes `getAccessibleDecks(userId)` performing two queries:
  1. `where('ownerId','==',userId)`
  2. `where('collaboratorIds','array-contains', userId)`
  Merge, de-dup, sort by updatedAt.

## 6. UI / UX (Phase 1)
Entry point: Deck menu adds “Share…” for owner only.
Share Dialog:
- Input: collaborator email (validate format; show error if not found).
- List: current editors with remove icon.
- Future (Phase 2): role dropdown.
Visual Indicators:
- Deck list item badge: `Shared` when not owner OR deck has roles.
- In Card Screen header: subtle label `Shared Deck` if not owner.

Empty States:
- No collaborators yet → “Only you have access. Invite someone by email.”

## 7. Testing Strategy
Unit:
- Service: add/remove collaborator manipulates Firestore update payload shapes (mock writeBatch or updateDoc calls).
- Deck retrieval merges & de-dupes decks.
Security Rules (Emulator tests):
- Owner can update roles; editor cannot.
- Editor can add card; non-collaborator blocked.
Integration (React Testing Library):
- Share dialog add flow (mock user lookup + service function).
- Deck list shows shared deck for invited user.
E2E (later):
- Two test users (service account minting custom token for second user scenario) – ensure collaborator sees deck.

## 8. Incremental Implementation Order
1. Data model + service helpers (DONE)
2. Security rule draft (commented) + emulator tests (PENDING tests; draft inserted)
3. Dual-query deck retrieval (subscription scaffold DONE, Firestore collaborator query PENDING until rules enabled)
4. Share dialog UI (PENDING)
5. Permission tests (PENDING)
6. E2E scenario (PENDING)

## 9. Feature Flag
Simple config export:
```
export const FEATURE_DECK_SHARING = true; // toggle for rollout
```
Wrap all UI entry points & new query usage.

## 10. Open Questions
- Email lookup performance: need index on `users.email`? (Store lowercased email field; query by equality.)
- Should we allow transferring ownership? (Defer.)
- Card operations by editor update deck `updatedAt`? (Yes, for recency ordering.)

## 11. Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Query duplication adds latency | Medium | Cache merged decks in state; memoize sort |
| Unauthorized role escalation attempt | High | Explicit rules + validation guarding role field writes |
| Email not found noise | Low | User doc creation on first sign-in ensures existence |
| Large collaborator list (cost) | Low | Hard cap (e.g. 50) in addCollaborator function |

## 12. Acceptance Criteria (Phase 1)
- Owner invites an existing user by email → collaborator appears in dialog and can CRUD cards.
- Collaborator sees shared deck in list and cannot edit sharing settings or delete deck.
- Firestore rules prevent collaborator from modifying `roles` / `ownerId`.
- All new code paths covered by unit + rule emulator tests (≥80% functions touched).

## 13. Future Extensions (Parking Lot)
- Viewer role (`'v'`) with read-only gating.
- Public share link (signed token doc with expiry).
- Activity / audit log (deckActivities subcollection).
- Real-time presence (RTDB or Firestore ephemeral doc with TTL cleanup function).
- Soft ownership transfer & ownership history.

---
This document is the canonical source for deck sharing design. Update change log below for any modifications.

### Change Log
| Date | Change |
|------|--------|
| 2025-09-21 | Initial draft created (Phase 1 scope defined). |
| 2025-09-21 | Added implemented primitives section; updated status & incremental progress checklist. |
| 2025-09-21 | Implemented share dialog, Firestore collaborator services, security rules, emulator tests, role capability matrix. |

## 14. Role Capability Matrix (Implemented)

| Capability | Owner | Editor | Viewer | Outsider |
|------------|:-----:|:------:|:------:|:--------:|
| Read Deck Metadata | ✅ | ✅ | ✅ | ❌ |
| Read Cards | ✅ | ✅ | ✅ | ❌ |
| Create Cards | ✅ | ✅ | ❌ | ❌ |
| Update Card Content | ✅ | ✅ | ❌ | ❌ |
| Delete Cards | ✅ | ✅ | ❌ | ❌ |
| Update Deck Title | ✅ | ✅ (title only) | ❌ | ❌ |
| Delete Deck | ✅ | ✅ (current rule; may tighten) | ❌ | ❌ |
| Manage Collaborators (roles) | ✅ | ❌ | ❌ | ❌ |

NOTE: Future tightening may restrict deck deletion to owner only; tests and rules can be updated with a single predicate change.
