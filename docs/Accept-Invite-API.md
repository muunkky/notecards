# Accept Invite API (Client + Function contract)

Status: Implemented (client + function + emulator tests)
Last Updated: 2025-09-24

## Overview
Invite acceptance exchanges a user-facing token for a collaborator role on a deck. The client hashes the token and calls a callable Cloud Function `acceptInvite`.

## Client Contract
- File: `src/sharing/acceptInviteService.ts`
- Method: `acceptInvite({ deckId, tokenPlain })`
- Behavior:
  - Hash token using SHA-256 (hex) in the client: `tokenHash = sha256HexAsync(tokenPlain)`
  - Calls callable: `acceptInvite({ deckId, tokenHash })`
  - Returns `{ deckId, roleGranted, alreadyHadRole }`

## Function Contract (server)
- Name: `acceptInvite`
- Input: `{ deckId: string, tokenHash: string }`
- Output: `{ deckId: string, roleGranted?: 'editor'|'viewer', alreadyHadRole: boolean }`
- Behavior:
  - Looks up invite by `deckId` + `tokenHash`.
  - Validates `status == 'pending'` and `expiresAt` (not in the past).
  - Transactionally:
    - If user already has equal or higher role: marks invite `accepted` (idempotent) and returns `{ alreadyHadRole: true }`.
    - Else: grants `roleRequested` on the deck (updates `roles` and `collaboratorIds`), marks invite `accepted`, and returns `{ roleGranted, alreadyHadRole: false }`.
- Error Codes:
  - `invite/not-found`
  - `invite/expired`
  - `invite/revoked`

## Security & Rules
- Function validates `status=='pending'`, `expiresAt`, `emailLower` vs authenticated user.
- Transaction updates deck roles/collaboratorIds and marks invite accepted with audit entry.

## Testing
- Unit: `src/test/sharing/acceptInviteService.test.ts` verifies token hashing and payload shape.
- Functions Emulator: `functions/test/acceptInvite.emulator.test.ts` covers success, not-found, expired, revoked, already-member, idempotence.

### How to run (headless)
- Full functions suite:
  - `npm run test:functions`
- Single file or filtered tests:
  - `npm run test:functions -- functions/test/acceptInvite.emulator.test.ts`
  - `npm run test:functions -- functions/test/acceptInvite.emulator.test.ts -t "accepts a pending invite"`
