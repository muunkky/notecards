# Firebase Emulator Testing

## Quick Start

Run E2E tests against local Firebase emulators instead of production:

### Terminal 1: Start Emulators
```bash
npm run emulators:start
```

Wait for the message: `✔  All emulators ready!`
- Auth emulator: http://localhost:9099
- Firestore emulator: http://localhost:8080
- Emulator UI: http://localhost:4000

### Terminal 2: Start Dev Server
```bash
npm run dev
```

The app will auto-connect to emulators when `VITE_USE_EMULATORS=true` or when running in dev mode.

### Terminal 3: Run E2E Tests
```bash
LOCAL_URL=http://localhost:5173 node tests/e2e/user-journeys/03-share-deck.mjs
```

## Requirements

- **Java**: Firebase emulators require Java Runtime Environment
  - Check: `java -version`
  - Install (Ubuntu/WSL): `sudo apt-get update && sudo apt-get install -y default-jre`

## Automatic Pre-flight Checks

E2E tests now automatically verify that all required services are running before starting:

**What's checked:**
- Dev server (port 5173 or custom LOCAL_URL)
- Firebase Auth emulator (port 9099)
- Firebase Firestore emulator (port 8080)

**Fast-fail behavior:**
If any required service is not running, the test immediately exits with a clear error message showing which service(s) to start.

**Example output:**
```
🚀 Pre-flight Checks
════════════════════════════════════════════════════════════

✅ Dev server is running
✅ Firebase Auth emulator is running
✅ Firebase Firestore emulator is running

────────────────────────────────────────────────────────────
✅ All pre-flight checks passed
```

**Testing the checks independently:**
```bash
node tests/e2e/support/test-preflight.mjs
```

## Emulator Features

### Permissive Test Rules
The emulators use `firestore.rules.test` with permissive security rules:
- All authenticated users can read/write everything
- Includes `deckInvites` collection rules (missing in production)
- Safe for local testing without production constraints

### Data Persistence
Emulator data is saved/loaded from `.emulator-data/`:
```bash
npm run emulators:clear  # Clear saved emulator data
npm run emulators:export # Manually export current state
```

### Testing Modes

**Local Mode (default)**: Tests run against emulators with test rules
```bash
LOCAL_URL=http://localhost:5173 node tests/e2e/user-journeys/03-share-deck.mjs
```

**Production Mode**: Tests run against live Firebase
```bash
E2E_TARGET=production node tests/e2e/user-journeys/03-share-deck.mjs
```

## Troubleshooting

### Emulators won't start
- Check Java is installed: `java -version`
- Check ports are free: `lsof -i :8080 -i :9099`
- View logs: Emulators create `firestore-debug.log`, `ui-debug.log`

### WSL Network Issues
WSL's network forwarding handles localhost correctly. Both Node.js (WSL) and browser (Windows) can access emulators on `localhost`.

### Authentication Fails
Emulators use REST API for auth (no Google OAuth):
- Test user: `test@example.com` / `test123456`
- Users are auto-created by E2E tests
- Check emulator UI at http://localhost:4000/auth for user list
