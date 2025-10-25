# Restructure E2E Tests: Separate Local Dev Tests from Production Smoke Tests

## Current State

All E2E tests currently run against production only:
- Hardcoded `PRODUCTION_URL = 'https://notecards-1b054.web.app'`
- Great for smoke testing but slows down development
- Emulator infrastructure exists but underutilized

## Goal

Create two distinct test modes:
1. **Local Dev Tests**: Comprehensive testing against emulators (fast feedback during development)
2. **Production Smoke Tests**: Lightweight validation of critical paths in production

## Implementation Plan

### 1. Create Test Mode Infrastructure
- [x] Add test mode detection (LOCAL_URL env var already supported)
- [ ] Create mode-aware URL configuration helper
- [ ] Update tests to use configurable URLs

### 2. Reorganize Test Structure
```
tests/e2e/
├── dev/                          # Comprehensive local tests
│   ├── journeys/                 # Full user journey tests
│   │   ├── 01-create-deck.mjs   
│   │   ├── 02-edit-delete.mjs
│   │   ├── 03-share-deck.mjs
│   │   └── ...
│   └── integration/              # Detailed feature tests
│       └── ...
├── smoke/                        # Production smoke tests
│   ├── 01-auth-and-create.mjs   # Quick: auth + create deck
│   ├── 02-edit-basic.mjs         # Quick: basic edit
│   └── 03-share-flow.mjs         # Quick: share workflow
├── support/                      # Shared utilities
│   ├── test-config.mjs          # NEW: URL/mode configuration
│   ├── preflight-checks.mjs     # Existing
│   └── emulator-auth.mjs        # Existing
└── README.md                    # Updated docs
```

### 3. npm Scripts
```json
"test:e2e:dev": "Run comprehensive local tests",
"test:e2e:smoke": "Run production smoke tests",
"test:e2e": "Run both dev and smoke"
```

### 4. Benefits
- **Faster development**: Run comprehensive tests locally without touching production
- **CI/CD friendly**: Smoke tests run quickly in CI pipeline
- **Better coverage**: Can test more scenarios locally without production impact
- **Clear intent**: Developers know which tests to run when

## Tasks
- [ ] Create test-config.mjs helper for URL management
- [ ] Move existing journeys to tests/e2e/dev/journeys/
- [ ] Create lightweight smoke tests in tests/e2e/smoke/
- [ ] Update package.json scripts
- [ ] Update README.md with new structure
- [ ] Update EMULATOR_TESTING.md to reference new structure

## Implementation Progress


- [x] **Step 1: Create test-config.mjs helper** ✅
  - Created `tests/e2e/support/test-config.mjs` with comprehensive URL and mode management
  - Supports multiple test modes: dev (local emulators), smoke (production quick), production (production comprehensive)
  - Environment variable detection: LOCAL_URL, E2E_MODE, E2E_TARGET, E2E_URL
  - Integrates with existing preflight-checks.mjs
  - Tested successfully with all three modes

- [ ] **Step 2: Create directory structure**
  - Create `tests/e2e/dev/journeys/` directory
  - Create `tests/e2e/smoke/` directory
  - Keep `tests/e2e/support/` for shared utilities

- [ ] **Step 3: Move existing journey tests**
  - Move 01-create-deck-and-card.mjs to dev/journeys/
  - Move 03-share-deck.mjs to dev/journeys/
  - Update imports to use new test-config.mjs

- [ ] **Step 4: Create lightweight smoke tests**
  - Create smoke/01-auth-and-create.mjs (quick auth + create deck validation)
  - Create smoke/02-share-basic.mjs (quick sharing validation)
  - Keep tests under 30 seconds each

- [ ] **Step 5: Update package.json scripts**
  - Add `test:e2e:dev` - runs dev tests with LOCAL_URL
  - Add `test:e2e:smoke` - runs smoke tests against production
  - Update existing scripts to use new structure

- [ ] **Step 6: Update documentation**
  - Update tests/e2e/README.md with new structure
  - Document environment variables (LOCAL_URL, E2E_MODE, E2E_TARGET)
  - Add examples for running dev vs smoke tests
