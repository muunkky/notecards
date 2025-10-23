# Deployment Guide

Complete step-by-step procedures for deploying the Notecards application to Firebase.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Deployment Methods](#deployment-methods)
- [Manual Deployment](#manual-deployment)
- [Automated Deployment (Recommended)](#automated-deployment-recommended)
- [Service Account Configuration](#service-account-configuration)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Deployment Verification](#deployment-verification)
- [Common Scenarios](#common-scenarios)
- [Best Practices](#best-practices)

---

## Prerequisites

### Required Tools

```bash
# Verify installations
node --version          # v18+ required
npm --version           # v9+ required
firebase --version      # v13+ required
gh --version           # v2+ required (for automated deployments)
```

### Required Access

- **Firebase Project**: `notecards-1b054`
- **GitHub Repository**: Write access for automated deployments
- **Firebase CLI**: Authenticated (`firebase login`)
- **GitHub Secrets**: Configured for automated deployments

### Environment Setup

```bash
# Clone repository
git clone <repository-url>
cd notecards

# Install dependencies
npm ci

# Verify local build
npm run build
```

---

## Deployment Methods

### Comparison Table

| Method | Use Case | Speed | Safety | Prerequisites |
|--------|----------|-------|--------|---------------|
| **Automated (GitHub Actions)** | Production releases | 5-8 min | ✅ High (gated by tests) | Push to main branch |
| **Manual (Firebase CLI)** | Hotfixes, emergencies | 2-3 min | ⚠️ Medium (manual verification) | Firebase CLI auth |
| **Preview (Feature Branch)** | Testing before merge | 5-8 min | ✅ High (isolated environment) | Push to feature branch |

**Recommendation**: Use automated deployment (merge to main) for all production releases.

---

## Manual Deployment

### When to Use Manual Deployment

- Emergency hotfixes requiring immediate deployment
- Testing deployment configuration changes
- Deploying to non-production environments
- Troubleshooting automated deployment issues

### Step-by-Step Procedure

#### 1. Pre-Deployment Verification

```bash
# Ensure you're on the correct branch
git status
git log -1

# Pull latest changes
git pull origin main

# Install dependencies
npm ci
```

#### 2. Run Local Tests

```bash
# Run full test suite
npm test

# Verify all tests pass
# Expected: 307/307 passing
```

#### 3. Build Application

```bash
# Create production build
npm run build

# Verify dist/ directory created
ls -la dist/

# Check build output for errors
# Expected: dist/ with index.html, assets/, etc.
```

#### 4. Authenticate with Firebase

```bash
# Login to Firebase (if not already authenticated)
firebase login

# Verify correct project
firebase projects:list

# Ensure notecards-1b054 is selected
firebase use notecards-1b054
```

#### 5. Deploy to Firebase

**Current Deployment (Hosting Only)**:
```bash
# Deploy hosting only (current limitation)
npm run deploy:hosting

# Or using Firebase CLI directly
firebase deploy --only hosting --project notecards-1b054
```

**Target Deployment (After Service Account Configured)**:
```bash
# Deploy all targets (hosting + rules + indexes)
npm run deploy:all

# Or using Firebase CLI
firebase deploy --only hosting,firestore:rules,firestore:indexes --project notecards-1b054
```

#### 6. Verify Deployment

```bash
# Check deployment status
firebase hosting:sites:list --project notecards-1b054

# View deployment URL
echo "Live site: https://notecards-1b054.web.app"

# Curl health check
curl -I https://notecards-1b054.web.app
```

---

## Automated Deployment (Recommended)

### Production Deployment Workflow

```
Developer → Feature Branch → PR → Tests Pass → Merge to Main → Auto-Deploy → Live Site
                                        ↓
                                  (Tests Fail)
                                        ↓
                                  Block Merge
```

### Step-by-Step Process

#### 1. Create Feature Branch

```bash
# Create and checkout feature branch
git checkout -b feature/my-awesome-feature

# Make changes, commit
git add .
git commit -m "feat: add awesome feature"

# Push to remote
git push origin feature/my-awesome-feature
```

#### 2. Create Pull Request

```bash
# Using GitHub CLI
gh pr create --title "Add awesome feature" --body "Description of changes"

# Or via GitHub UI
# Navigate to repository → Pull Requests → New Pull Request
```

#### 3. Wait for CI Tests

**Automated checks run**:
- ✅ TypeScript typecheck
- ✅ Unit tests (307 tests)
- ✅ Firestore rules verification
- ✅ Build validation (Vite)
- ✅ E2E tests

**View CI status**:
```bash
# Check PR status
gh pr view <pr-number>

# View workflow runs
gh run list --workflow=ci-tests.yml --limit 5

# View detailed logs if failures
gh run view <run-id> --log
```

#### 4. Merge to Main

**After all checks pass**:
```bash
# Merge PR (GitHub CLI)
gh pr merge <pr-number> --squash --delete-branch

# Or via GitHub UI
# Click "Squash and merge" button
```

#### 5. Automatic Production Deployment

**Triggered automatically on merge to main**:
- `prod-deploy.yml` workflow starts
- Runs full test suite again
- Builds production bundle
- Deploys to Firebase Hosting
- Updates live site

**Monitor deployment**:
```bash
# View production deployment runs
gh run list --workflow=prod-deploy.yml --limit 5

# Watch live deployment
gh run watch

# View deployment logs
gh run view <run-id> --log
```

#### 6. Verify Live Site

```bash
# Check site is live
curl -I https://notecards-1b054.web.app

# View deployment history
firebase hosting:releases:list --project notecards-1b054 --limit 5

# Check GitHub deployment status
gh workflow view prod-deploy.yml
```

---

## Service Account Configuration

### Current State

**Configured Roles**:
- ✅ Firebase Hosting Admin

**Missing Roles** (for full deployment):
- ❌ Cloud Firestore Index Admin
- ❌ Firebase Rules System

### How to Configure Service Account

#### 1. Access GCP IAM Console

```bash
# Open GCP IAM Console
open "https://console.cloud.google.com/iam-admin/iam?project=notecards-1b054"

# Or using gcloud CLI
gcloud projects get-iam-policy notecards-1b054 \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:github-actions@notecards-1b054.iam.gserviceaccount.com"
```

#### 2. Add Required Roles

**Via GCP Console**:
1. Navigate to IAM & Admin → IAM
2. Find service account: `github-actions@notecards-1b054.iam.gserviceaccount.com`
3. Click "Edit Principal" (pencil icon)
4. Click "Add Another Role"
5. Add these roles:
   - `Cloud Firestore Index Admin` (roles/datastore.indexAdmin)
   - `Firebase Rules System` (roles/firebaserules.system)
6. Click "Save"

**Via gcloud CLI**:
```bash
# Add Firestore Index Admin role
gcloud projects add-iam-policy-binding notecards-1b054 \
  --member="serviceAccount:github-actions@notecards-1b054.iam.gserviceaccount.com" \
  --role="roles/datastore.indexAdmin"

# Add Firebase Rules System role
gcloud projects add-iam-policy-binding notecards-1b054 \
  --member="serviceAccount:github-actions@notecards-1b054.iam.gserviceaccount.com" \
  --role="roles/firebaserules.system"
```

#### 3. Update Deployment Workflow

After configuring roles, update `prod-deploy.yml`:

```yaml
# Change from:
args: deploy --only hosting

# To:
args: deploy --only hosting,firestore:rules,firestore:indexes
```

#### 4. Verify Full Deployment

```bash
# Trigger new deployment
git commit --allow-empty -m "test: verify full deployment"
git push origin main

# Watch deployment
gh run watch

# Verify rules and indexes deployed
firebase firestore:indexes --project notecards-1b054
```

---

## Pre-Deployment Checklist

### Before Every Deployment

```markdown
- [ ] All tests passing locally (npm test)
- [ ] TypeScript compilation successful (npx tsc --noEmit)
- [ ] Build succeeds without errors (npm run build)
- [ ] CHANGELOG.md updated with changes
- [ ] Version bumped if needed (npm version)
- [ ] No hardcoded API keys or secrets in code
- [ ] Firebase rules tested (npm run test:rules)
- [ ] E2E tests passing (npm run test:e2e)
```

### Before Major Releases

```markdown
- [ ] Feature flags reviewed and configured
- [ ] Database migrations planned (if needed)
- [ ] Backup of current production data
- [ ] Rollback plan documented
- [ ] Stakeholders notified of deployment window
- [ ] Monitoring and alerts configured
- [ ] Smoke test checklist prepared
```

---

## Deployment Verification

### Automated Verification (Post-Deploy)

```bash
# Health check script
curl -I https://notecards-1b054.web.app

# Expected: HTTP/2 200

# Check for critical assets
curl -I https://notecards-1b054.web.app/assets/index-*.js

# Expected: HTTP/2 200
```

### Manual Smoke Testing

**Critical User Flows**:
1. **Authentication**
   - [ ] Sign in with Google works
   - [ ] Sign out works
   - [ ] Session persists on refresh

2. **Deck Management**
   - [ ] Create new deck
   - [ ] View deck list
   - [ ] Delete deck

3. **Card Operations**
   - [ ] Create card
   - [ ] Edit card content
   - [ ] Delete card
   - [ ] Flip card (front/back)

4. **Study Mode**
   - [ ] Start study session
   - [ ] Navigate cards (next/previous)
   - [ ] Mark cards as known/unknown

**Verify in production**:
```bash
# Open production site
open https://notecards-1b054.web.app

# Complete smoke test checklist
# See: docs/ci-cd/smoke-test-checklist.md (to be created)
```

### Firebase Console Verification

```bash
# Open Firebase Console
open "https://console.firebase.google.com/project/notecards-1b054/hosting"

# Verify:
# - Latest deployment timestamp
# - Deployment status: Success
# - Domain status: Connected
# - SSL certificate: Active
```

---

## Common Scenarios

### Scenario 1: Deploy Hotfix to Production

**Situation**: Critical bug discovered in production, needs immediate fix.

**Procedure**:
```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-fix

# 2. Make minimal fix
# Edit files...
git add .
git commit -m "fix: critical bug in authentication"

# 3. Test locally
npm test

# 4. Deploy manually (fastest path)
npm run build
npm run deploy:hosting

# 5. Verify fix in production
curl -I https://notecards-1b054.web.app

# 6. Create PR for tracking (after hotfix deployed)
git push origin hotfix/critical-bug-fix
gh pr create --title "Hotfix: Critical bug in authentication"
```

**Follow-up**: Merge hotfix PR to main to keep history clean.

---

### Scenario 2: Deploy to Preview Environment

**Situation**: Test changes in production-like environment before merging.

**Procedure**:
```bash
# 1. Push feature branch
git push origin feature/my-feature

# 2. Wait for preview deployment (automatic via dev-deploy.yml)
gh run watch

# 3. Get preview URL from workflow logs
gh run view --log | grep "Preview URL"

# 4. Test in preview environment
open <preview-url>

# 5. If approved, merge to main
gh pr merge <pr-number> --squash
```

---

### Scenario 3: Rollback Failed Deployment

**Situation**: Deployment succeeded but broke functionality.

**Procedure**: See [rollback-procedures.md](./rollback-procedures.md)

---

### Scenario 4: Deploy Firestore Rules Only

**Situation**: Changed security rules, need to deploy without redeploying hosting.

**Procedure**:
```bash
# 1. Test rules locally
npm run test:rules

# 2. Deploy rules only
firebase deploy --only firestore:rules --project notecards-1b054

# 3. Verify rules in Firebase Console
open "https://console.firebase.google.com/project/notecards-1b054/firestore/rules"
```

---

### Scenario 5: Deploy Firestore Indexes Only

**Situation**: Added new query requiring composite index.

**Procedure**:
```bash
# 1. Update firestore.indexes.json
# Edit file with new indexes...

# 2. Deploy indexes only
firebase deploy --only firestore:indexes --project notecards-1b054

# 3. Monitor index creation (can take minutes)
firebase firestore:indexes --project notecards-1b054

# 4. Verify index status: "READY"
```

---

## Best Practices

### Deployment Timing

**Recommended**:
- Deploy during low-traffic hours (early morning or late evening)
- Avoid deployments on Fridays or before holidays
- Schedule major releases with advance notice

**Emergency Hotfixes**:
- Deploy immediately, regardless of time
- Follow up with post-mortem and proper PR process

---

### Version Control

```bash
# Always deploy from clean state
git status  # Should show "nothing to commit, working tree clean"

# Tag releases
git tag -a v0.0.3 -m "Release v0.0.3: Feature X"
git push origin v0.0.3

# Update CHANGELOG.md before releases
# Follow Keep a Changelog format
```

---

### Monitoring Post-Deployment

```bash
# Monitor Firebase Hosting logs
firebase hosting:logs --project notecards-1b054

# Check error rates (Firebase Console)
open "https://console.firebase.google.com/project/notecards-1b054/hosting/errors"

# Monitor Firestore usage
open "https://console.firebase.google.com/project/notecards-1b054/firestore/usage"
```

---

### Security Checklist

```markdown
- [ ] No secrets committed to repository
- [ ] Environment variables configured correctly
- [ ] Firebase security rules tested
- [ ] HTTPS enforced (automatic via Firebase Hosting)
- [ ] Service account has minimal required permissions
- [ ] GitHub Secrets not exposed in workflow logs
```

---

## Troubleshooting

For deployment issues, see [troubleshooting.md](./troubleshooting.md).

Common issues:
- [YAML Syntax Errors](./troubleshooting.md#yaml-syntax-errors)
- [Firebase Authentication Failure](./troubleshooting.md#firebase-cli-authentication-failure)
- [Permission Denied](./troubleshooting.md#service-account-permission-denied)
- [Deployment Succeeds But Site Not Updated](./troubleshooting.md#deployment-succeeds-but-site-not-updated)

---

## Emergency Contacts

**Critical Production Issues**:
- Check [rollback-procedures.md](./rollback-procedures.md) first
- Firebase Status: https://status.firebase.google.com/
- GitHub Status: https://www.githubstatus.com/

**Support Channels**:
- Firebase Console: https://console.firebase.google.com/project/notecards-1b054
- GitHub Actions: https://github.com/<repo>/actions

---

**Last Updated**: October 23, 2025
**Maintained By**: Development Team
**Next Review**: Service account configuration (add Firestore Index Admin + Rules Admin)
