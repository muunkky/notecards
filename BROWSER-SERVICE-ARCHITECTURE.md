# Browser Service Architecture

## Purpose
- Provide a single automation shell for puppeteer-based workflows (auth, UI smoke checks, data round-trips).
- Hide environment-specific browser wiring behind configuration so tests remain declarative.
- Support both manual (interactive) and headless service-account authentication paths.

## Core Components
- services/browser-service.mjs
  - quickAuth keeps the legacy interactive flow for manual sign-in helpers.
  - quickServiceAuth issues Firebase custom tokens with a service account and drives a headless login.
  - Session caching (saveSession, loadStorageAfterNavigation) avoids redundant logins when possible.
- services/service-account-auth.mjs
  - Loads a JSON key (via FIREBASE_SERVICE_ACCOUNT_PATH or ./auth/keys/service-account-key.json).
  - Initializes irebase-admin once per process and generates custom tokens on demand.
- scripts/run-e2e-tests-log.mjs
  - Wraps vitest so every run emits log + JSON artifacts under 	est-results/e2e/.
  - Prints explicit instructions and completion sentinels so LLM-driven sessions can tail files instead of waiting on STDOUT.
- scripts/setup-service-account.mjs
  - Verifies the key path, surfaces actionable guidance, and unblocks CI/skipped tests.

## Authentication Flows
- **Interactive (quickAuth)**
  - Spins up puppeteer with stealth evasions and attempts to reuse cached sessions.
  - Falls back to clicking the OAuth UI if manual intervention is required.
- **Service Account (quickServiceAuth)**
  - Loads the configured key, creates a Firebase custom token, and signs in via window.firebaseAuth.
  - Accepts options for headless, keepBrowserOpen, url, and custom claims.
  - Saves session state before optionally closing the browser to keep CI usage minimal.

## Test Integration
- Vitest E2E config (itest.e2e.config.ts) runs against Node environment; the browser work is done by puppeteer.
- src/test/e2e/service-account-integration.test.ts performs an early credential probe and skips cleanly when the key is absent.
- Helper utilities live in src/test/e2e/support/service-account-auth.ts and provide a shared hasServiceAccountCredentials() check.

## Logging & Observability
- Every 
pm run test:e2e invocation prints the log, raw, and JSON paths immediately.
- Parsed completion data is appended to 	est-results/e2e/e2e-results-*.json for dashboards or quick triage.
- Console output within browser-service components sticks to ASCII so CI parsers and editors do not choke on control characters.

## Pending Enhancements
- Add a "strict" mode that fails the suite when service-account credentials are missing (opt-in for CI).
- Fold the interactive helper scripts under scripts/ into documented CLI flows (currently placeholders).
- Capture screenshots and artifacts in a dedicated directory per run; wire into JSON summary for easier trace review.
