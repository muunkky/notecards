# Firestore Security Rules Testing

This project uses a two-layer approach for validating Firestore security rules around deck sharing and collaborator roles.

## 1. Deterministic Standalone Verifier (Primary / CI)

Script: `scripts/verify-firestore-rules.mjs`

Characteristics:
- No Vitest dependency (pure Node script)
- Connects directly to Firestore emulator using `@firebase/rules-unit-testing`
- Seeds a deck + card, exercises owner/editor/viewer/outsider scenarios
- Explicitly calls `env.cleanup()` and `process.exit(0|1)` to prevent hanging pipelines
- Idempotent: safe to run multiple times

Run manually:
```bash
npm run test:rules:standalone
```
(Ensure the Firestore emulator is running: `firebase emulators:start --only firestore` in another terminal, or via any existing script you use.)

CI usage: `npm run test:rules:ci` (alias of standalone) is intended to run after emulator startup step.

## 2. Optional Vitest Suite (Interactive / Opt-In)

File: `src/test/rules/sharing-rules.test.ts`

Why optional?
- Historical flakiness initializing `initializeTestEnvironment` when emulator not started produced noisy failures (ECONNREFUSED)
- We gate execution behind an environment variable to avoid red CI noise

Enable locally:
```bash
set FIRESTORE_RULES_VITEST=1 && vitest run src/test/rules/sharing-rules.test.ts
# PowerShell
$env:FIRESTORE_RULES_VITEST=1; vitest run src/test/rules/sharing-rules.test.ts
```
(You must have the Firestore emulator running.)

Without the env var, the entire `describe` block is skipped cleanly.

## Emulator Notes

Default host/port assumed: `127.0.0.1:8080`. Override for the standalone verifier by setting `FIRESTORE_EMULATOR_HOST` (format `host:port`).

Project ID defaults to `notecards-1b054` (matching local config); override with `FIREBASE_PROJECT_ID`.

## Rule Design Highlights

- Creation rules avoid `get()` calls to eliminate null-value evaluation errors
- `createdAt` and `ownerId` immutable after creation (update rule enforces equality)
- `updatedAt` (if provided) must be a timestamp
- Updates differentiate owner vs editor; editors cannot alter `roles` or `collaboratorIds`
- Subcollection access (cards, orderSnapshots) fetches the parent deck with guarded existence checks
- Viewers: read-only; Editors: deck title + card CRUD; Owner: full

## Adding / Extending Scenarios

Extend the standalone verifier:
1. Add a helper (e.g., `canDeleteCard`) mirroring existing patterns
2. Append a `check()` call with expected boolean
3. Keep the script free of external test frameworks
4. For negative privilege tests, choose descriptive names (e.g., `editor cannot escalate role to owner`)

Re-run: `npm run test:rules:standalone`

## Future Enhancements

- Add explicit index/field validation assertions if schema evolves
- Performance: consolidate duplicate `get()` calls in subcollection rule helpers if complexity increases
- Add tests for batched writes / transactions if introduced

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| ECONNREFUSED 127.0.0.1:8080 | Emulator not running | Start emulator or skip Vitest suite |
| Script hangs (old behavior) | Missing `process.exit()` | Ensure current version of verifier script is used |
| Unexpected ALLOW | Rule too permissive | Add failing assertion first (Red), tighten rule, re-run (Green) |
| Null value error during create | Access to non-existent resource fields | Keep create rule self-contained; avoid `get()` |

## Philosophy

Tests should fail loudly for rule regressions but never flake due to environment absence. Therefore, CI relies solely on the deterministic standalone script, while the Vitest suite serves as an optional local aid.
