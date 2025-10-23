# CI/CD Troubleshooting Guide

Common issues and solutions for the GitHub Actions CI/CD pipeline.

## Table of Contents

- [Workflow Failures](#workflow-failures)
- [Deployment Issues](#deployment-issues)
- [Test Failures](#test-failures)
- [Permission Errors](#permission-errors)
- [Build Problems](#build-problems)
- [Service Account Issues](#service-account-issues)

---

## Workflow Failures

### YAML Syntax Errors

**Symptom:** Workflow fails to parse or shows "Invalid workflow file"

**Cause:** YAML syntax errors, often tabs instead of spaces

**Solution:**
```bash
# Check YAML syntax
npx js-yaml .github/workflows/ci-tests.yml

# Convert tabs to spaces
sed -i 's/\t/  /g' .github/workflows/*.yml
```

**Prevention:** Add pre-commit hook to validate YAML (see [deployment-guide.md](./deployment-guide.md#pre-commit-hooks))

**Historical Fix:** Commit 63b01102 fixed tabs→spaces issues

---

### Workflow Not Triggering

**Symptom:** Push/PR doesn't trigger expected workflow

**Cause:** Branch name doesn't match trigger configuration

**Solution:**
1. Check workflow `on:` section in `.github/workflows/*.yml`
2. Verify branch name matches pattern (e.g., `feature/**`)
3. Check if workflow is disabled in repository settings

```bash
# View workflow status
gh workflow list

# Enable workflow if disabled
gh workflow enable ci-tests.yml
```

---

## Deployment Issues

### Hosting-Only Deployment (Rules/Indexes Skipped)

**Symptom:** Deployment succeeds but Firestore rules/indexes not updated

**Cause:** Service account lacks required permissions

**Current State:** This is expected behavior (see prod-deploy.yml line 39)

**Solution:**
```yaml
# Current (temporary):
args: deploy --only hosting

# Target (after permissions fixed):
args: deploy --only hosting,firestore:rules,firestore:indexes
```

**Service Account Needs:**
- Firebase Hosting Admin ✅ (currently has)
- Cloud Firestore Index Admin ❌ (needs to be added)
- Firebase Rules Admin ❌ (needs to be added)

**How to Fix:**
1. Go to [GCP IAM Console](https://console.cloud.google.com/iam-admin/iam?project=notecards-1b054)
2. Find service account: `github-actions@notecards-1b054.iam.gserviceaccount.com`
3. Add roles:
   - `roles/firestore.indexAdmin`
   - `roles/firebaserules.system`

**Historical Fix:** Commit 18f70211 temporarily disabled full deployment

---

### Firebase CLI Authentication Failure

**Symptom:** `Error: Authentication Error: Your credentials are no longer valid`

**Cause:** Expired or invalid Firebase token

**Solution:**
```bash
# Regenerate Firebase token
firebase login:ci

# Update GitHub Secret
# Go to: Settings → Secrets → Actions → FIREBASE_TOKEN
# Replace with new token
```

---

### Deployment Succeeds But Site Not Updated

**Symptom:** Workflow shows success but live site unchanged

**Cause:**
1. Browser cache
2. CDN cache
3. Deployment to wrong project

**Solution:**
```bash
# 1. Hard refresh browser (Ctrl+Shift+R)

# 2. Verify deployment
firebase hosting:sites:list --project notecards-1b054

# 3. Check deployment history
gh run list --workflow=prod-deploy.yml --limit 5

# 4. View specific deployment logs
gh run view <run-id> --log
```

---

## Test Failures

### Coverage Threshold Failure

**Symptom:** `Error: Coverage threshold not met`

**Cause:** Test coverage dropped below threshold or summary file missing

**Solution:**
```bash
# View current coverage
npm run test:coverage

# Check if coverage-summary.json exists
ls coverage/coverage-summary.json
```

**Historical Fix:** Commit 0d30d6b9 removed broken coverage threshold check

---

### E2E Tests Failing in CI (Passing Locally)

**Symptom:** E2E tests pass locally but fail in GitHub Actions

**Possible Causes:**
1. Missing service account credentials (expected, tests should skip gracefully)
2. Preview server not started
3. Port conflicts

**Solution:**
```yaml
# Ensure preview server starts before E2E tests
- name: Start preview server
  run: npx vite preview --port 4173 &

# Wait for server
- name: Wait for server
  run: npx wait-on http://localhost:4173

# Run E2E with CI flag
- name: Run E2E tests
  env:
    CI: '1'
  run: npm run test:e2e
```

**Service Account Tests:**
```bash
# Should skip gracefully if credentials missing
# Check test output for:
[service-account] Skipping tests: credentials not configured
```

---

### Firestore Rules Verification Failure

**Symptom:** `firebase emulators:exec` command fails

**Possible Causes:**
1. Firebase CLI not installed
2. Emulator port conflicts
3. Rules syntax error

**Solution:**
```bash
# 1. Verify Firebase CLI installed
firebase --version

# 2. Test rules locally
firebase emulators:start --only firestore

# 3. Validate rules syntax
firebase deploy --only firestore:rules --dry-run

# 4. Run verification script manually
node scripts/verify-firestore-rules.mjs
```

---

## Permission Errors

### Service Account Permission Denied

**Symptom:** `Permission denied` during deployment

**Cause:** Service account lacks required IAM roles

**Solution:**
```bash
# Check current permissions
gcloud projects get-iam-policy notecards-1b054 \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:github-actions@notecards-1b054.iam.gserviceaccount.com"

# Add missing roles
gcloud projects add-iam-policy-binding notecards-1b054 \
  --member="serviceAccount:github-actions@notecards-1b054.iam.gserviceaccount.com" \
  --role="roles/firestore.indexAdmin"
```

---

### GitHub Secrets Not Accessible

**Symptom:** `Error: Secret FIREBASE_SERVICE_ACCOUNT_NOTECARDS_1B054 not found`

**Cause:** Secret not configured or wrong repository

**Solution:**
1. Go to repository Settings → Secrets and variables → Actions
2. Verify secrets exist:
   - `FIREBASE_SERVICE_ACCOUNT_NOTECARDS_1B054`
   - `FIREBASE_TOKEN`
3. Check secret is available to workflows (not restricted to specific branches/tags)

---

## Build Problems

### Package Lock Sync Issues

**Symptom:** `npm ci` fails with "package-lock.json out of sync"

**Cause:** Dependencies added without updating package-lock.json

**Solution:**
```bash
# Regenerate package-lock.json
rm package-lock.json
npm install

# Commit updated lock file
git add package-lock.json
git commit -m "fix: sync package-lock.json"
```

**Historical Fix:** Fixed during v0.0.2 deployment

---

### TypeScript Compilation Errors

**Symptom:** `npx tsc --noEmit` fails in CI (passes locally)

**Possible Causes:**
1. Different TypeScript versions
2. Missing type definitions
3. JSX syntax errors

**Solution:**
```bash
# 1. Verify TypeScript version matches
cat package.json | grep "\"typescript\""

# 2. Install type definitions
npm install --save-dev @types/react @types/react-dom

# 3. Check for JSX errors
npx tsc --noEmit --jsx react

# 4. View detailed errors
npx tsc --noEmit --pretty
```

**Historical Fix:** Commit fixed JSX dynamic component rendering errors in docs.tsx

---

### Build Artifacts Missing

**Symptom:** Deployment fails because `dist/` directory not found

**Cause:** Build step failed or skipped

**Solution:**
```bash
# Check if build succeeded in workflow logs
gh run view <run-id> --log | grep "Build"

# Verify build locally
npm run build
ls -la dist/

# Check vite config
cat vite.config.ts
```

---

## Service Account Issues

### Service Account Key Rotation

**When:** Annually or if compromised

**Procedure:**
```bash
# 1. Create new service account key
gcloud iam service-accounts keys create new-key.json \
  --iam-account=github-actions@notecards-1b054.iam.gserviceaccount.com

# 2. Update GitHub Secret
# Go to: Settings → Secrets → Actions → FIREBASE_SERVICE_ACCOUNT_NOTECARDS_1B054
# Paste contents of new-key.json

# 3. Delete old key
gcloud iam service-accounts keys list \
  --iam-account=github-actions@notecards-1b054.iam.gserviceaccount.com

gcloud iam service-accounts keys delete <old-key-id> \
  --iam-account=github-actions@notecards-1b054.iam.gserviceaccount.com

# 4. Test deployment
gh workflow run prod-deploy.yml
```

---

## Quick Diagnostics

### Workflow Health Check

```bash
# View recent runs
gh run list --limit 10

# Check workflow status
gh workflow view ci-tests.yml
gh workflow view prod-deploy.yml

# View latest failures
gh run list --status failure --limit 5
```

### Deployment Health Check

```bash
# Verify live site
curl -I https://notecards-1b054.web.app

# Check Firebase hosting
firebase hosting:sites:get default --project notecards-1b054

# View deployment history
firebase hosting:releases:list --project notecards-1b054 --limit 5
```

### Test Health Check

```bash
# Run full test suite locally
npm test

# Run specific test categories
npm run test:unit
npm run test:e2e
npm run test:rules

# View test logs
cat test-results/unit/unit-*.log
cat test-results/e2e/e2e-*.log
```

---

## Emergency Procedures

### Critical Deployment Failure

If production deployment fails after merge:

1. **Immediate:** Check if live site still functional
   ```bash
   curl -I https://notecards-1b054.web.app
   ```

2. **Revert if broken:** See [rollback-procedures.md](./rollback-procedures.md)

3. **Fix and redeploy:**
   ```bash
   # Fix issue locally
   git commit -m "fix: resolve deployment issue"
   git push origin main  # Triggers new deployment
   ```

4. **Manual override if workflows broken:**
   ```bash
   # Deploy manually (requires Firebase CLI auth)
   npm run build
   npm run deploy:hosting
   ```

---

## Getting Help

**Workflow Logs:**
```bash
gh run view <run-id> --log
```

**Firebase Support:**
- Firebase Console: https://console.firebase.google.com/project/notecards-1b054
- Firebase Status: https://status.firebase.google.com/

**Documentation:**
- [Deployment Guide](./deployment-guide.md)
- [Rollback Procedures](./rollback-procedures.md)
- Card 6u41ml: Known issues and fixes

---

**Last Updated:** October 23, 2025
**Maintained By:** Development Team
