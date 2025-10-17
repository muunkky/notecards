# Service Account Authentication

## Prerequisites
- Firebase project service account JSON (project_id, client_email, private_key).
- Dependencies installed (
pm install).
- Optional: export FIREBASE_SERVICE_ACCOUNT_PATH when the key lives outside ./auth/keys/service-account-key.json.

## First-Time Setup
1. Run 
pm run auth:service-setup.
   - Checks FIREBASE_SERVICE_ACCOUNT_PATH and ./auth/keys/service-account-key.json.
   - Emits the exact path it will use for tests and the expected permissions.
   - When the file is missing it prints copy commands you can paste, plus a checklist for rotating keys safely.
2. Copy the JSON key to the path reported by the script (or update the env var).
3. Re-run 
pm run auth:service-setup until it reports ✅ Ready.

## Running the Integration Test
- Quick check: 
pm run test:e2e:vitest -- src/test/e2e/service-account-integration.test.ts.
- Full suite with logging: 
pm run test:e2e (artifacts under 	est-results/e2e/).
- Missing key? The suite skips and references the setup script; set FIREBASE_STRICT_SERVICE_ACCOUNT=1 (future enhancement) to fail CI outright.

## What the Test Covers
- rowserService.quickServiceAuth() issues a custom token and authenticates headlessly.
- Authenticated pages expose sign-out/profile controls and allow navigation without losing auth.
- Screenshots and log output live alongside the JSON summary for inspection.

## Troubleshooting
- **"firebase-admin is not installed"** – run 
pm install so optional deps are present.
- **"Service account file not found"** – re-run 
pm run auth:service-setup and follow the path displayed.
- **Browser closes immediately** – pass { keepBrowserOpen: true } to quickServiceAuth() while debugging.

## Maintenance Checklist
- Rotate service-account keys regularly and place the new file where the setup script expects it.
- Redact keys before attaching logs or JSON summaries to tickets.
- Commit updates to this document whenever acceptance criteria or setup steps change.
