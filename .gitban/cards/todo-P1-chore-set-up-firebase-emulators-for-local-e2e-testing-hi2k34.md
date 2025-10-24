# Set Up Firebase Emulators for Local E2E Testing

## Problem
Currently E2E tests run against production (https://notecards-1b054.web.app) which:
- ❌ Leaves test data in production Firestore
- ❌ Can't test with relaxed security rules
- ❌ Slower due to network latency
- ❌ Firestore rules block legitimate test operations (invite creation)
- ❌ Can't safely test destructive operations

## Solution
Set up Firebase emulators to test against `npm run dev` (localhost:5173)

## Firebase Emulators Needed
1. **Authentication Emulator** - Test user auth locally
2. **Firestore Emulator** - Test database operations locally
3. **Hosting Emulator** - Serve the app locally (already have with Vite)

## Implementation Steps

### 1. Install Firebase Emulators
```bash
npm install -D firebase-tools
firebase init emulators
```

Select:
- [x] Authentication Emulator
- [x] Firestore Emulator
- [ ] Functions (not needed yet)

### 2. Configure firebase.json
```json
{
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

### 3. Update Firebase Config for Emulators
Create `src/firebase/firebase.dev.ts`:
```typescript
import { connectAuthEmulator } from 'firebase/auth'
import { connectFirestoreEmulator } from 'firebase/firestore'

// Only connect to emulators in development
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099')
  connectFirestoreEmulator(db, 'localhost', 8080)
}
```

### 4. Create Permissive Test Rules
Create `firestore.rules.test`:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // PERMISSIVE RULES FOR LOCAL TESTING ONLY
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Update E2E Tests for Local Dev
- Change `PRODUCTION_URL` to `http://localhost:5173`
- Add environment detection
- Add emulator setup in browser-service.mjs

### 6. Create Test Runner Scripts
```json
{
  "scripts": {
    "test:e2e:local": "firebase emulators:exec 'npm run test:e2e:journeys'",
    "emulators": "firebase emulators:start",
    "dev:with-emulators": "concurrently \"npm run emulators\" \"npm run dev\""
  }
}
```

## Benefits After Setup
- ✅ Clean database for each test run
- ✅ Can test invite creation without Firestore rules blocking
- ✅ Faster test execution (no network latency)
- ✅ Safe to test destructive operations
- ✅ Can test edge cases without affecting production
- ✅ Can seed test data programmatically

## Testing Workflow After Setup
```bash
# Start emulators and dev server
npm run dev:with-emulators

# In another terminal, run E2E tests
npm run test:e2e:local
```

## References
- https://firebase.google.com/docs/emulator-suite
- https://firebase.google.com/docs/emulator-suite/connect_and_prototype
- https://firebase.google.com/docs/emulator-suite/install_and_configure

## Follow-up Work
After emulators working:
- Card 9hl05b: Restructure E2E tests (local vs production smoke)
- Card k94k1t: Implement Journey 02 (edit/delete) against local
- Card a8npso: Implement Journey 05 (deck management) against local
