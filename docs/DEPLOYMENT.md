# Deployment Guide

**Infrastructure as Code** - All deployment configuration is version-controlled and declarative.

## Table of Contents
- [Quick Start](#quick-start)
- [Infrastructure Overview](#infrastructure-overview)
- [Configuration Files](#configuration-files)
- [Deployment Methods](#deployment-methods)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Automatic Deployment (Recommended)

```bash
# 1. Make your changes
git add .
git commit -m "feat: add new feature"

# 2. Push to main branch
git push origin main

# 3. GitHub Actions automatically:
#    - Runs type checking
#    - Runs all tests
#    - Builds production bundle
#    - Deploys to Firebase Hosting

# 4. Monitor deployment
gh run watch
```

**That's it!** No manual configuration needed.

### Pre-Deployment Check

Run this before pushing to verify everything will pass CI:

```bash
npm run deploy:check
```

This script verifies:
- ✅ Node.js and Firebase CLI installed
- ✅ Firebase authentication
- ✅ TypeScript type checking
- ✅ All tests pass
- ✅ Production build succeeds
- ✅ Git status and branch

---

## Infrastructure Overview

### Production URLs
- **Primary:** https://notecards-1b054.web.app
- **Alternative:** https://notecards-1b054.firebaseapp.com
- **Firebase Console:** https://console.firebase.google.com/project/notecards-1b054

### Infrastructure as Code Files

```
.
├── firebase.json              # Firebase hosting & firestore config
├── .firebaserc                # Firebase project selection
├── firestore.rules            # Security rules
├── firestore.indexes.json     # Database indexes
├── .github/workflows/
│   ├── prod-deploy.yml       # Production deployment pipeline
│   ├── ci-tests.yml          # PR/branch testing
│   └── dev-deploy.yml        # Development deployment
└── package.json               # Build & deployment scripts
```

**Key Principle:** All infrastructure is declared in these files. No manual Firebase Console configuration required.

---

## Configuration Files

### 1. `firebase.json` - Firebase Infrastructure

```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ],
    "headers": [
      // Security headers configured here
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

**What it controls:**
- Static file serving from `dist/` folder
- SPA routing (all requests → index.html)
- Security headers (CSP, X-Frame-Options, etc.)
- Firestore rules and indexes

### 2. `.github/workflows/prod-deploy.yml` - CI/CD Pipeline

```yaml
on:
  push:
    branches: [main]

jobs:
  test-build-deploy:
    steps:
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm run test:run
      - run: npm run build
      - run: firebase deploy --only hosting
```

**What it does:**
- Triggers automatically on every push to `main`
- Installs dependencies
- Type checks TypeScript
- Runs full test suite
- Builds production bundle
- Deploys to Firebase Hosting

**Duration:** ~1m30s

### 3. `firestore.rules` - Database Security

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // All security rules defined here
  }
}
```

**Deploy rules only:**
```bash
npm run deploy:rules
```

---

## Deployment Methods

### Method 1: Automatic (Recommended)

**Trigger:** Push to `main` branch

```bash
git push origin main
```

**Workflow:**
1. GitHub Actions triggers `prod-deploy.yml`
2. Runs all checks (types, tests, build)
3. Deploys to Firebase Hosting
4. Complete in ~1m30s

**Benefits:**
- ✅ No manual steps
- ✅ Guaranteed consistent process
- ✅ Built-in safety checks
- ✅ Audit trail in GitHub
- ✅ Can't skip tests accidentally

### Method 2: Manual (Emergency Only)

**Use case:** GitHub Actions down, urgent hotfix

```bash
# 1. Verify everything works
npm run deploy:check

# 2. Deploy manually
npm run deploy:hosting
```

**⚠️ Warning:** Manual deploys bypass CI checks. Only use in emergencies.

### Method 3: Rules/Indexes Only

**Use case:** Update security rules without full deploy

```bash
# Deploy Firestore rules
npm run deploy:rules

# Deploy Firestore indexes
npm run deploy:indexes
```

---

## Monitoring

### Check Deployment Status

```bash
# View recent workflow runs
gh run list --limit 10

# Watch current deployment
gh run watch

# View specific run details
gh run view 12345678 --log
```

### Check Live Site

```bash
# Open production site
open https://notecards-1b054.web.app

# Check build artifacts
curl -I https://notecards-1b054.web.app
```

### View Firebase Logs

```bash
# List Firebase projects
firebase projects:list

# View hosting sites
firebase hosting:sites:list --project notecards-1b054
```

---

## Troubleshooting

### Deployment Failed in GitHub Actions

**Symptoms:** Red X on commit, workflow failed

**Steps:**
1. View the failed run:
   ```bash
   gh run view --log
   ```

2. Common failures:
   - **Type errors:** Fix TypeScript errors shown in logs
   - **Test failures:** Run `npm run test:run` locally to debug
   - **Build errors:** Run `npm run build` locally to reproduce
   - **Firebase auth:** Check secrets in GitHub repo settings

3. Fix the issue and push again:
   ```bash
   git add .
   git commit -m "fix: resolve deployment issue"
   git push origin main
   ```

### Tests Pass Locally But Fail in CI

**Cause:** Environment differences (Node version, dependencies, etc.)

**Solutions:**
```bash
# Match CI environment
npm ci  # Use exact versions from package-lock.json

# Check Node version (CI uses Node 20)
node --version
```

### Firestore Rules Rejected

**Symptoms:** Deploy fails with "Invalid rules" error

**Steps:**
1. Test rules locally with emulator:
   ```bash
   firebase emulators:start --only firestore
   node scripts/verify-firestore-rules.mjs
   ```

2. Fix syntax errors in `firestore.rules`

3. Deploy rules only:
   ```bash
   npm run deploy:rules
   ```

### Site Not Updating After Deploy

**Symptoms:** Old version still showing after successful deploy

**Cause:** Browser cache or CDN propagation delay

**Solutions:**
1. Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Clear browser cache
3. Wait 5-10 minutes for CDN propagation
4. Check deploy time in Firebase Console

---

## Best Practices

### ✅ DO

- **Push to main** to deploy automatically
- **Run `npm run deploy:check`** before important deploys
- **Monitor workflow status** after pushing
- **Keep `firestore.rules` in sync** with database schema
- **Review GitHub Actions logs** when deployments fail

### ❌ DON'T

- **Don't manually configure** Firebase Hosting settings (use `firebase.json`)
- **Don't skip tests** by deploying manually
- **Don't commit** `.env` files or secrets
- **Don't force push** to main branch
- **Don't bypass CI** unless absolutely necessary

---

## Emergency Rollback

If a deployment breaks production:

### Option 1: Rollback via Git

```bash
# 1. Revert to last working commit
git revert HEAD

# 2. Push (triggers automatic deploy of previous version)
git push origin main
```

### Option 2: Rollback via Firebase Console

1. Go to Firebase Console → Hosting
2. Click "Release History"
3. Find last working version
4. Click "Rollback"

---

## Security

### Secrets Management

GitHub Actions uses these secrets (configured in repo settings):
- `FIREBASE_SERVICE_ACCOUNT_NOTECARDS_1B054` - Service account for deploy
- `FIREBASE_TOKEN` - Firebase CLI token

**Never commit these to git!**

### Security Headers

Configured in `firebase.json`:
- Content-Security-Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

---

## Performance

### Build Optimization

Current production bundle size:
- **CSS:** 39.84 kB (7.53 kB gzipped)
- **Main JS:** 345.07 kB (101.64 kB gzipped)
- **Firebase JS:** 471.81 kB (111.60 kB gzipped)

### Monitoring

- **Firebase Hosting:** Automatic CDN, HTTPS
- **Lighthouse scores:** Run `lighthouse https://notecards-1b054.web.app`

---

## Summary

Your deployment infrastructure follows **Infrastructure as Code** principles:

- ✅ **Declarative:** All config in version-controlled files
- ✅ **Automated:** GitHub Actions handles deployment
- ✅ **Consistent:** Same process every time
- ✅ **Auditable:** Full history in Git and GitHub Actions
- ✅ **Safe:** Tests must pass before deploy

**To deploy:** Just push to main. Everything else is automatic.
