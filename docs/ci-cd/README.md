# CI/CD Documentation

Complete documentation for the GitHub Actions CI/CD pipeline.

## Quick Links

- **[Troubleshooting Guide](./troubleshooting.md)** - Common issues and solutions
- **[Deployment Guide](./deployment-guide.md)** - Step-by-step deployment procedures
- **[Rollback Procedures](./rollback-procedures.md)** - Emergency rollback steps

## Pipeline Overview

The Notecards project uses GitHub Actions for continuous integration and deployment with three main workflows:

### 1. CI Tests (`ci-tests.yml`)
**Triggers:** Pull requests to main, pushes to feature branches

**Steps:**
1. Typecheck (TypeScript compilation)
2. Unit tests (307 tests via Vitest wrapper)
3. Firestore rules verification (emulator-based)
4. Build validation (Vite production build)
5. E2E tests (preview server + automated testing)

**Artifacts:** Test logs uploaded for debugging

### 2. Production Deployment (`prod-deploy.yml`)
**Triggers:** Pushes to main branch (after PR merge)

**Steps:**
1. Typecheck
2. Run full test suite
3. Build production bundle
4. Deploy to Firebase Hosting
5. Output deployment details

**Current Deployment:** Hosting only (rules/indexes pending service account permissions)

**Live URL:** https://notecards-1b054.web.app

### 3. Development Deployment (`dev-deploy.yml`)
**Triggers:** Pushes to develop/staging branches, feature branches

**Purpose:** Preview deployments for testing before production

## Current Status

✅ **Operational:**
- All three workflows active and passing
- 307/307 tests passing consistently
- Automated deployment on merge to main
- Test gating prevents broken deployments

⚠️ **Known Limitations:**
- Production deployment currently hosting-only (not deploying Firestore rules/indexes)
- Service account permissions need configuration for full deployment
- No automated PR preview comments yet

## Architecture

```
Pull Request → CI Tests → (Pass) → Merge → Production Deployment → Live Site
     ↓                                ↓
  (Fail)                          Hosting
     ↓                           (+ Rules/Indexes - pending)
Block Merge
```

## Workflow Files

All workflows located in `.github/workflows/`:

- `ci-tests.yml` - Continuous integration pipeline
- `prod-deploy.yml` - Production deployment automation
- `dev-deploy.yml` - Development/staging deployments

## Security

### Secrets Configuration

GitHub Secrets required:
- `FIREBASE_SERVICE_ACCOUNT_NOTECARDS_1B054` - Service account JSON key
- `FIREBASE_TOKEN` - Firebase CLI token for hosting operations

### Service Account Permissions

Current: Firebase Hosting Admin
Needed for full deployment:
- Cloud Firestore Index Admin
- Firebase Rules Admin

## Performance Metrics

**Current Performance:**
- CI Tests: ~3-5 minutes
- Production Deployment: ~2-3 minutes
- Total time from merge to live: ~5-8 minutes

**Test Execution:**
- Unit tests: ~45-60 seconds
- E2E tests: ~30-45 seconds
- Firestore rules: ~10-15 seconds

## Monitoring

**Build Status:** View in GitHub Actions tab

**Deployment Status:** Check Firebase Hosting console

**Test Results:** Artifacts available in completed workflow runs

## Common Operations

### Manual Deployment
```bash
# Local deployment (requires Firebase CLI authentication)
npm run deploy:hosting          # Hosting only
npm run deploy:rules            # Firestore rules only
npm run deploy:indexes          # Firestore indexes only
npm run deploy:all              # All targets
```

### Workflow Triggers
```bash
# Trigger workflow manually (requires GitHub CLI)
gh workflow run ci-tests.yml
gh workflow run prod-deploy.yml
```

### View Logs
```bash
# List recent workflow runs
gh run list --limit 10

# View specific run logs
gh run view <run-id> --log
```

## Future Improvements

Tracked in card 6u41ml:
- [ ] Restore full deployment (hosting + rules + indexes)
- [ ] Add pre-commit hooks for YAML validation
- [ ] Document service account IAM configuration
- [ ] Add PR preview URL comments
- [ ] Create deployment smoke test checklist

## Support

For CI/CD issues:
1. Check [Troubleshooting Guide](./troubleshooting.md)
2. Review workflow run logs in GitHub Actions
3. Consult card 6u41ml for known issues and fixes

---

**Last Updated:** October 23, 2025
**Pipeline Status:** Operational (hosting-only deployment)
**Next Steps:** Service account permissions for full deployment
