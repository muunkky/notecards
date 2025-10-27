# E2E Testing Guide

## Overview

The notecards project has end-to-end tests split into two categories:

1. **Production Smoke Tests** - Fast, simple tests that work against production or any running app
2. **Local Development Tests** - Comprehensive tests requiring service accounts, emulators, and local dev environment

## Quick Start

### Run Production Smoke Tests (Recommended)
```bash
npm run test:e2e:prod
```
**Fast (~16s)** - Tests basic UI loading without requiring authentication setup.

### Run Local Development Tests
```bash
npm run test:e2e:local
```
**Slower (~80s+)** - Requires Firebase emulators and service account credentials.

### Run All E2E Tests (Legacy)
```bash
npm run test:e2e
```
Runs all tests including ones that may be flaky or require complex setup.

## Test Categories

### Production Smoke Tests
**File:** `src/test/e2e/real-browser-ui.test.ts`

**What it tests:**
- Application loads without crashing
- No JavaScript errors in console
- Basic UI elements render

**Requirements:**
- None (works against production URL)
- No authentication needed
- No emulators required

**Use cases:**
- Pre-deployment verification
- CI/CD pipeline smoke tests
- Quick sanity checks

### Local Development Tests
**Files:**
- `src/test/e2e/complete-service-integration.test.ts` ✅ Passing
- `src/test/e2e/service-account-data-roundtrip.test.ts` ✅ Passing (when setup complete)
- `src/test/e2e/authenticated-ui.test.ts` (Skipped - needs auth)
- `src/test/e2e/service-integration-simple.test.ts` (Skipped - needs setup)
- `src/test/e2e/user-journeys.test.ts` (Skipped - needs setup)

**What they test:**
- Service account authentication flow
- Full CRUD operations with Firebase
- Data persistence and retrieval
- User journeys with authenticated state

**Requirements:**
- Firebase emulators running (`npm run emulators:start`)
- Service account credentials configured (`npm run auth:service-setup`)
- Local dev server running on port 5174

**Use cases:**
- Pre-commit validation
- Testing authentication flows
- Validating Firebase integration changes

### Excluded Tests
**File:** `src/test/e2e/service-account-integration.test.ts` ❌ Temporarily disabled

This test uses a different browser initialization pattern that has timing issues.
The more comprehensive `complete-service-integration.test.ts` covers the same functionality.

## Test Infrastructure

### Firebase Window Exposure
**Location:** `src/firebase/firebase.ts:27-37`

The app exposes Firebase instances on the browser window object for e2e testing:
```typescript
(window as any).firebaseAuth = auth;
(window as any).firebaseDb = db;
(window as any).firebaseApp = app;
```

This allows Puppeteer to access Firebase APIs during automated tests. This is **safe in production** because:
1. Firebase security rules still enforce all access controls
2. Service account auth only works with local emulators
3. Exposing on window doesn't bypass Firebase authentication

### Service Account Authentication
**Setup:** `npm run auth:service-setup`

Service account credentials enable automated testing with Firebase without manual user login.

**Location:** `auth/keys/service-account-key.json`

⚠️ **Never commit service account keys to git!**

### Dev Server Management
Tests automatically start/stop dev servers as needed using `dev-server-manager.ts`.

## CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  smoke-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:e2e:prod

  full-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - name: Setup Firebase Emulators
        run: npm install -g firebase-tools
      - name: Start Emulators
        run: npm run emulators:start &
      - name: Run E2E Tests
        run: npm run test:e2e:local
```

## Troubleshooting

### Tests Timeout
**Symptom:** "Hook timed out in 30000ms"

**Causes:**
- Firebase emulators not running
- Service account credentials not configured
- Dev server not starting

**Fix:**
```bash
# Terminal 1: Start emulators
npm run emulators:start

# Terminal 2: Run tests
npm run test:e2e:local
```

### window.firebaseAuth is not available
**Symptom:** "window.firebaseAuth is not available"

**Cause:** Firebase module not initializing before auth attempt

**Fix:** This should be resolved by the Firebase exposure code running immediately after Firebase initialization. If still occurring, check:
1. `src/main.tsx` imports `./firebase/firebase`
2. `src/firebase/firebase.ts` exposes Firebase on window (lines 34-37)

### Service Account Authentication Failed
**Symptom:** "Service account file not found"

**Fix:**
```bash
npm run auth:service-setup
```

Then follow prompts to download service account key from Firebase Console.

## Performance Benchmarks

| Test Suite | Duration | Tests | Description |
|------------|----------|-------|-------------|
| Production Smoke | ~16s | 1 | Basic UI load test |
| Local Full | ~80s+ | 4-6 | Complete integration tests |
| Complete Service Integration | ~43s | 2 | Service account + screenshots |
| Data Round-Trip | ~42s | 1 | CRUD operations |

## Future Improvements

- [ ] Add visual regression testing
- [ ] Implement accessibility audits in smoke tests
- [ ] Add performance metrics collection
- [ ] Create playwright alternative for cross-browser testing
- [ ] Fix `service-account-integration.test.ts` timing issues
