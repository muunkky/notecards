# Accept Invite API (Client + Function contract)

Status: Draft (client implemented; function pending)
Last Updated: 2025-09-23

## Overview
Invite acceptance exchanges a user-facing token for a collaborator role on a deck. The client hashes the token and calls a callable Cloud Function `acceptInvite`.

## Client Contract
- File: `src/sharing/acceptInviteService.ts`
- Method: `acceptInvite({ deckId, tokenPlain })`
- Behavior:
  - Hash token using SHA-256 (hex) in the client: `tokenHash = sha256HexAsync(tokenPlain)`
  - Calls callable: `acceptInvite({ deckId, tokenHash })`
  - Returns `{ deckId, roleGranted, alreadyHadRole }`

## Function Contract (to implement)
- Name: `acceptInvite`
- Input: `{ deckId: string, tokenHash: string }`
- Output: `{ deckId: string, roleGranted: 'editor'|'viewer', alreadyHadRole: boolean }`
- Error Codes:
  - `invite/not-found`
  - `invite/expired`
  - `invite/revoked`
  - `invite/email-mismatch`
  - `invite/already-higher-role`

## Security & Rules
- Function validates `status=='pending'`, `expiresAt`, `emailLower` vs authenticated user.
- Transaction updates deck roles/collaboratorIds and marks invite accepted with audit entry.

## Testing
- Unit: `src/test/sharing/acceptInviteService.test.ts` verifies token hashing and payload shape.
- Functions Emulator (next): integration tests to be added when function is scaffolded.
