## Objective
Resolve the confusion around E2E test setup, browser configurations, and authentication methods. Make the testing infrastructure crystal clear with helpful error messages and easy-to-understand npm scripts.

## Context
- **Current Issue**: E2E tests are failing with confusing errors (`serviceAccountAuth is not a function`)
- **Root Cause**: Multiple browser service configurations and authentication methods are mixed up
- **Confusion Points**: 
  - Two types of E2E tests (standard vs. service account)
  - Two authentication methods (manual user auth vs. service account auth)
  - Unclear which test uses which method
  - Port mismatch issues (5175 vs 5174)
  - Method naming confusion (`serviceAccountAuth` vs `quickServiceAuth`)

## Problem Statement

### Current E2E Test Types Identified:
1. **Standard E2E Tests** (real-browser-ui.test.ts):
   - Uses real browser with manual/saved authentication
   - Tests actual user experience
   - Requires dev server running
   - Uses saved session cookies

2. **Service Account Tests** (service-account-integration.test.ts, complete-service-integration.test.ts):
   - Uses service account for programmatic auth
   - Bypasses manual login
   - Requires Firebase Admin SDK credentials
   - Uses `quickServiceAuth()` method

### Current Confusion:
- ❌ Tests calling wrong method names (`serviceAccountAuth` doesn't exist)
- ❌ Port configuration mismatch (hardcoded 5175, dev server on 5174)
- ❌ Unclear which tests need which setup
- ❌ Error messages don't explain what's missing
- ❌ Package.json scripts don't indicate test types
- ❌ No clear documentation on when to use which test type

## Desired End State

### Clear Test Organization:
```
src/test/e2e/
  ├── user/                          # Tests using saved user auth
  │   ├── real-browser-ui.test.ts    # Smoke tests with real user session
  │   └── user-journeys.test.ts      # User experience tests
  │
  ├── service-account/               # Tests using service account auth
  │   ├── complete-service-integration.test.ts
  │   ├── service-account-data-roundtrip.test.ts
  │   └── service-account-integration.test.ts
  │
  └── support/                       # Shared utilities
      ├── dev-server-utils.ts
      ├── service-account-auth.ts
      └── helpers.ts
```

### Crystal Clear Package.json Scripts:
```json
{
  "test:e2e:user": "User auth E2E tests (requires manual login)",
  "test:e2e:service": "Service account E2E tests (requires credentials)",
  "test:e2e:all": "All E2E tests (requires both setups)",
  "test:e2e:setup:user": "Set up user authentication for E2E tests",
  "test:e2e:setup:service": "Set up service account credentials"
}
```

### Helpful Error Messages:
- ✅ "Dev server not running on port 5174. Run `npm run dev` first."
- ✅ "Service account credentials not found. Run `npm run auth:service-setup` to configure."
- ✅ "User authentication required. Run `npm run test:e2e:setup:user` to authenticate."
- ✅ "Port mismatch detected. Update configuration to use port 5174."

### Clear Documentation:
- README section explaining E2E test types
- When to use user auth vs service account auth
- Setup instructions for each type
- Troubleshooting guide for common errors

## Discovery Phase Checklist

### Current State Analysis:
- [x] **Identify all E2E test files and categorize them**:
  - User auth tests: real-browser-ui.test.ts, user-journeys.test.ts, authenticated-ui.test.ts
  - Service account tests: service-account-integration.test.ts, complete-service-integration.test.ts, service-account-data-roundtrip.test.ts, service-integration-simple.test.ts
  
- [ ] **Document current authentication methods**:
  - [ ] `browserService.quickAuth()` - User manual authentication
  - [ ] `browserService.quickServiceAuth()` - Service account authentication
  - [ ] `browserService.serviceAccountAuth()` - DOES NOT EXIST (this is the bug)
  - [ ] Document what each method does and when to use it
  
- [ ] **Map test dependencies**:
  - [ ] Which tests require dev server
  - [ ] Which tests require service account credentials
  - [ ] Which tests require manual user authentication
  - [ ] Which tests can run offline/without setup
  
- [ ] **Audit browser service configuration**:
  - [ ] Review `services/browser-service.mjs` auth methods
  - [ ] Check `services/service-account-auth.mjs` setup
  - [ ] Verify port configuration consistency (all should use 5174)
  - [ ] Document stealth vs. standard browser configs

### Current Bugs to Fix:
- [x] **Method name mismatches**:
  - [x] Change `serviceAccountAuth()` → `quickServiceAuth()` in complete-service-integration.test.ts
  - [x] Change `serviceAccountAuth()` → `quickServiceAuth()` in service-account-data-roundtrip.test.ts
  - [x] Update method signatures to match actual implementation
  
- [x] **Port configuration issues**:
  - [x] Update DEFAULT_PORTS.DEV_SERVER from 5175 → 5174 in environments.mjs
  - [x] Update setup-authentication.mjs default URL to 5174
  - [x] Update debug-cards.mjs APP_URL to 5174
  - [ ] Search for any other hardcoded 5175 references
  
- [ ] **Missing error handling**:
  - [ ] Add clear error when dev server not running
  - [ ] Add clear error when service account credentials missing
  - [ ] Add clear error when wrong authentication method used
  - [ ] Add setup instructions in error messages

### Documentation Gaps:
- [ ] **README.md E2E Testing Section**:
  - [ ] Explain two types of E2E tests
  - [ ] Document setup for user auth tests
  - [ ] Document setup for service account tests
  - [ ] Provide troubleshooting guide
  
- [ ] **src/test/e2e/README.md**:
  - [ ] Create dedicated E2E testing documentation
  - [ ] Explain when to use which test type
  - [ ] Document authentication methods
  - [ ] Provide examples of each test type
  
- [ ] **Test file headers**:
  - [ ] Add clear comments explaining auth method used
  - [ ] Document prerequisites (dev server, credentials, etc.)
  - [ ] Provide setup commands in file comments

## Implementation Checklist

### Phase 1: Fix Immediate Bugs ✅
- [x] Fix `serviceAccountAuth` → `quickServiceAuth` method calls
- [x] Fix port configuration (5175 → 5174)
- [ ] Verify all tests can at least start without crashing
- [ ] Run smoke test of each test type

### Phase 2: Improve Error Messages
- [ ] **Add dev server detection with helpful errors**:
  ```typescript
  if (!devServerRunning) {
    throw new Error(`
      ❌ Development server not found on port 5174
      
      To run E2E tests, you need the dev server running:
      1. Open a new terminal
      2. Run: npm run dev
      3. Wait for "Local: http://127.0.0.1:5174"
      4. Re-run this test
    `);
  }
  ```

- [ ] **Add service account credential checks**:
  ```typescript
  if (!serviceAccountCredentials) {
    throw new Error(`
      ❌ Service account credentials not configured
      
      This test requires Firebase Admin SDK credentials:
      1. Run: npm run auth:service-setup
      2. Follow the setup wizard
      3. Re-run this test
      
      Alternative: Set FIREBASE_SERVICE_ACCOUNT_PATH environment variable
    `);
  }
  ```

- [ ] **Add user auth checks**:
  ```typescript
  if (!userAuthenticated) {
    throw new Error(`
      ❌ User authentication required
      
      This test requires a saved user session:
      1. Run: npm run auth:setup
      2. Complete Google sign-in when browser opens
      3. Re-run this test
    `);
  }
  ```

### Phase 3: Reorganize Test Structure
- [ ] **Create test category folders**:
  ```bash
  mkdir -p src/test/e2e/user
  mkdir -p src/test/e2e/service-account
  ```

- [ ] **Move tests to appropriate folders**:
  - [ ] Move user auth tests → `src/test/e2e/user/`
  - [ ] Move service account tests → `src/test/e2e/service-account/`
  - [ ] Keep support utilities in `src/test/e2e/support/`

- [ ] **Update import paths** in moved files

- [ ] **Update vitest config** to find tests in new locations

### Phase 4: Clarify Package.json Scripts
- [ ] **Add descriptive comments to test scripts**:
  ```json
  {
    "test:e2e": "# All E2E tests (requires dev server + credentials)",
    "test:e2e:user": "# User auth E2E tests (requires npm run auth:setup)",
    "test:e2e:service": "# Service account E2E tests (requires npm run auth:service-setup)",
    "test:e2e:setup:user": "npm run auth:setup",
    "test:e2e:setup:service": "npm run auth:service-setup"
  }
  ```

- [ ] **Create separate test scripts for each type**:
  - [ ] `test:e2e:user` - Only run user auth tests
  - [ ] `test:e2e:service` - Only run service account tests
  - [ ] `test:e2e:all` - Run both (current behavior)

- [ ] **Add setup validation scripts**:
  - [ ] `test:e2e:check` - Verify setup before running tests
  - [ ] Script checks: dev server running, credentials present, auth valid

### Phase 5: Documentation
- [ ] **Create src/test/e2e/README.md**:
  - [ ] Overview of E2E testing approach
  - [ ] Explanation of user auth vs service account tests
  - [ ] Setup instructions for each type
  - [ ] When to use which type
  - [ ] Troubleshooting guide

- [ ] **Update root README.md**:
  - [ ] Add "Testing" section if missing
  - [ ] Link to E2E test documentation
  - [ ] Quick start for running tests
  - [ ] Prerequisites and setup commands

- [ ] **Add test file documentation**:
  - [ ] Add header comment to each test file
  - [ ] Document authentication method used
  - [ ] List prerequisites
  - [ ] Provide setup command

### Phase 6: Validation
- [ ] **Run all E2E tests**:
  - [ ] User auth tests pass
  - [ ] Service account tests pass (or skip gracefully with clear message)
  - [ ] All tests have helpful error messages on failure

- [ ] **Test error scenarios**:
  - [ ] Dev server not running → clear error
  - [ ] Service account not configured → clear error
  - [ ] User not authenticated → clear error
  - [ ] Port mismatch → clear error

- [ ] **Verify package.json clarity**:
  - [ ] Scripts are self-documenting
  - [ ] Easy to understand which script to run
  - [ ] Setup scripts are discoverable

## Completion Criteria

### Bugs Fixed:
- [x] All method name mismatches resolved
- [x] All port configuration issues resolved
- [ ] All tests can run without crashing (pass or skip gracefully)

### Error Messages:
- [ ] Every error message explains the problem clearly
- [ ] Every error message provides actionable steps to fix
- [ ] No cryptic "method not found" or "undefined" errors
- [ ] Errors mention specific npm scripts to run

### Organization:
- [ ] Tests are organized by authentication type
- [ ] Test structure is intuitive and clear
- [ ] Support utilities are properly shared
- [ ] No duplicate helper code

### Package.json:
- [ ] Scripts have clear names indicating what they do
- [ ] Separate scripts for user auth vs service account tests
- [ ] Setup scripts are discoverable
- [ ] Comments/descriptions where helpful

### Documentation:
- [ ] E2E testing approach documented in src/test/e2e/README.md
- [ ] Root README.md has testing section
- [ ] Each test file has clear header documentation
- [ ] Troubleshooting guide exists

### Developer Experience:
- [ ] New developer can understand test setup in < 5 minutes
- [ ] Clear which command to run for which test type
- [ ] Error messages guide developer to solution
- [ ] No confusion about authentication methods

## Success Metrics

**Before:**
- ❌ Tests failing with "method not found"
- ❌ Confusion about which test needs which setup
- ❌ Port mismatches causing silent failures
- ❌ No clear documentation on test types
- ❌ Package.json scripts unclear

**After:**
- ✅ All tests pass or skip gracefully with clear messages
- ✅ Developer knows exactly which setup is needed
- ✅ Port configuration is consistent
- ✅ Comprehensive documentation exists
- ✅ Package.json scripts are self-documenting
- ✅ Error messages provide actionable solutions

## Notes

### Authentication Method Decision Guide (to document):
**Use User Auth Tests When:**
- Testing actual user experience
- Need to verify real login flow
- Testing UI from user perspective
- Smoke testing production-like scenarios

**Use Service Account Tests When:**
- Need programmatic access without UI
- Testing backend data operations
- Automating repetitive test setups
- CI/CD automated testing
- Testing permissions and security rules

### Related Files to Review:
- `services/browser-service.mjs` - Main browser service with auth methods
- `services/service-account-auth.mjs` - Service account setup
- `src/test/e2e/support/` - Test utilities
- `vitest.e2e.config.ts` - E2E test configuration
- All test files in `src/test/e2e/`

---

**Priority Justification**: P1 - Tests are currently broken and confusing. This blocks both development (can't verify changes) and onboarding (new developers can't understand test setup). Must fix before moving forward with features.
