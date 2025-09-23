# DEPRECATED: Deck Sharing (Current Short-Term Behavior)

> This document is deprecated and superseded by `Deck-Sharing-Design.md` (unified sharing & invitation architecture). Refer there for the authoritative specification and migration checklist.

This document summarizes the present (Phase 1) implementation of deck sharing and its temporary constraints.

## Current Flow
1. Owner opens Share dialog and enters an email address.
2. Client queries `users` collection for a document with a matching `email` field (case-insensitive to lower-case storage/lookup).
3. If found, that user UID is added to the deck's `roles` map (default role: `editor`) and to `collaboratorIds` via a Firestore transaction.
4. UI refreshes showing new collaborator (by UID).

## Prerequisite: User Must Already Exist
The invitee MUST have:
- Signed in at least once (Firebase Auth user exists), and
- A `users/{uid}` profile document with the `email` field populated.

If no matching user is found, the dialog shows:
> "No account with that email. Ask them to sign in once, then try again."

## Security Rules Adjustment
To enable email lookup, Firestore rules currently allow any authenticated user to read `users` docs (intended to contain only non-sensitive public profile data). If sensitive data is needed later, split into `usersPublic/` (broad read) and `usersPrivate/` (self-only) collections.

## Limitations
- Cannot pre-invite someone who has never signed in.
- No pending invite state; unsuccessful lookups are a hard stop.
- UI shows collaborator UID (no display name yet).
- No email notification is sent.

## Rationale for Short-Term Choice
This minimizes complexity and de-risks the initial sharing release while we validate core role-based permissions. It avoids designing invitation lifecycle, tokens, or background triggers up front.

## Planned Direction
A future iteration will introduce an Auth-based invitation flow with pending invites, deep links, and automatic promotion when the invitee completes sign-up. See `Invitation-System-Design.md` (to be added) for the proposed architecture.

## Operational Notes
- Ensure new users create their `users` profile document promptly on first sign-in (e.g., via an on-auth state listener in the app that performs an idempotent profile creation).
- If a user changes their email, consider syncing the profile doc's `email` field or introducing a canonical `emailLower` field.

## Quick Checklist
- [ ] Invitee can sign in and a `users/{uid}` doc is created.
- [ ] Owner adds invitee by exact email (case differences tolerated if code lowercases input).
- [ ] Collaborator appears in Share dialog without page reload.

This document is retired; kept temporarily for historical context only.
