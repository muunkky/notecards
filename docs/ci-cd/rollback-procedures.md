# Rollback Procedures

Emergency procedures for rolling back failed or problematic deployments.

## Table of Contents

- [When to Rollback](#when-to-rollback)
- [Rollback Methods](#rollback-methods)
- [Quick Rollback (Emergency)](#quick-rollback-emergency)
- [Controlled Rollback](#controlled-rollback)
- [Git Revert Method](#git-revert-method)
- [Firestore Rules Rollback](#firestore-rules-rollback)
- [Database Migration Rollback](#database-migration-rollback)
- [Verification Steps](#verification-steps)
- [Post-Rollback Actions](#post-rollback-actions)
- [Prevention Strategies](#prevention-strategies)

---

## When to Rollback

### Immediate Rollback Required

**Critical Issues** (rollback immediately):
- ❌ Authentication broken (users cannot sign in)
- ❌ Data corruption or loss
- ❌ Security vulnerability exposed
- ❌ Site completely down (500 errors)
- ❌ Payment or critical business process failing

**Procedure**: Use [Quick Rollback (Emergency)](#quick-rollback-emergency)

---

### Controlled Rollback Appropriate

**Non-Critical Issues** (evaluate then rollback if needed):
- ⚠️ UI bugs affecting UX but not functionality
- ⚠️ Performance degradation (<50% slowdown)
- ⚠️ Minor feature not working as expected
- ⚠️ Console errors but core features functional

**Procedure**: Use [Controlled Rollback](#controlled-rollback)

---

### Do Not Rollback

**When Forward Fix is Better**:
- ✅ Issue can be fixed in <10 minutes
- ✅ Rollback would cause more disruption than bug
- ✅ Issue only affects <1% of users
- ✅ Workaround available for users

**Procedure**: Deploy hotfix using [deployment-guide.md](./deployment-guide.md#scenario-1-deploy-hotfix-to-production)

---

## Rollback Methods

### Comparison Table

| Method | Speed | Safety | Use Case | Data Impact |
|--------|-------|--------|----------|-------------|
| **Quick Rollback** | 2-5 min | Medium | Critical failures | None |
| **Controlled Rollback** | 10-15 min | High | Non-critical issues | None |
| **Git Revert** | 5-10 min | High | Code-only issues | None |
| **Rules Rollback** | 1-2 min | High | Rules-only issues | None |

**Recommendation**: Use Quick Rollback for emergencies, Controlled Rollback for planned rollbacks.

---

## Quick Rollback (Emergency)

**Use when**: Site is down or critical functionality broken.

### Step 1: Verify Production is Broken

```bash
# Health check
curl -I https://notecards-1b054.web.app

# Expected if broken: 500 error, timeout, or unexpected response
```

---

### Step 2: Check Firebase Hosting History

```bash
# List recent deployments
firebase hosting:releases:list --project notecards-1b054 --limit 5

# Output shows:
# Release ID         Version     Deploy Time              Status
# abc123def456       v0.0.2      2025-10-23 14:30:00      DEPLOYED
# def456ghi789       v0.0.1      2025-10-17 10:15:00      DEPLOYED
```

**Identify**:
- Current (broken) release: Top entry
- Previous (working) release: Second entry

---

### Step 3: Rollback via Firebase Console (Fastest)

**Via Web Console**:
1. Open Firebase Console:
   ```bash
   open "https://console.firebase.google.com/project/notecards-1b054/hosting/main"
   ```

2. Click "Release history" tab

3. Find previous working release

4. Click "⋮" (three dots) → "Roll back to this version"

5. Confirm rollback

**Rollback completes in ~30 seconds**

---

### Step 4: Verify Rollback Successful

```bash
# Health check (should return 200)
curl -I https://notecards-1b054.web.app

# Expected: HTTP/2 200

# Test critical functionality
open https://notecards-1b054.web.app

# Verify:
# - Site loads
# - Authentication works
# - Core features functional
```

---

### Step 5: Notify Team

```bash
# Post in team channel
"🚨 PRODUCTION ROLLBACK 🚨
Rolled back to previous version due to [brief description].
Site is now stable. Investigating root cause.
Deployment timeline: TBD after fix verified."
```

---

### Step 6: Investigate and Document

1. **Capture Evidence**:
   ```bash
   # View failed deployment logs
   gh run list --workflow=prod-deploy.yml --limit 5
   gh run view <failed-run-id> --log > rollback-logs-$(date +%Y%m%d-%H%M%S).txt
   ```

2. **Document Incident**:
   - What broke?
   - When was it deployed?
   - What was rolled back?
   - Current status?
   - Next steps?

3. **Create Post-Mortem Card**:
   ```bash
   # Create incident card
   # Title: "Post-mortem: Production rollback on [date]"
   # Type: bug
   # Priority: P0
   # Include: timeline, root cause, prevention plan
   ```

---

## Controlled Rollback

**Use when**: Non-critical issue, time to verify before rollback.

### Step 1: Assess Impact

```markdown
Impact Assessment:
- [ ] How many users affected? _______
- [ ] What functionality broken? _______
- [ ] Workarounds available? Yes / No
- [ ] Business impact: Low / Medium / High
- [ ] Can wait for hotfix? Yes / No

Decision: Rollback if:
- High business impact OR
- No workarounds available OR
- Hotfix will take >2 hours
```

---

### Step 2: Prepare Rollback

```bash
# 1. Identify current deployment
firebase hosting:releases:list --project notecards-1b054 --limit 5

# 2. Identify target rollback version
# Usually previous release (second in list)

# 3. Document decision
echo "Rolling back from <current> to <target> due to <reason>" >> rollback-log.txt
```

---

### Step 3: Create Rollback Branch

```bash
# 1. Find commit before bad deployment
git log --oneline -10

# 2. Create rollback branch from good commit
git checkout -b rollback/emergency-$(date +%Y%m%d) <good-commit-sha>

# 3. Push branch
git push origin rollback/emergency-$(date +%Y%m%d)
```

---

### Step 4: Deploy Rollback via GitHub Actions

```bash
# Option A: Merge rollback branch to main
gh pr create --base main --head rollback/emergency-$(date +%Y%m%d) \
  --title "Rollback: Emergency rollback to stable version" \
  --body "Rolling back to <commit> due to critical issue in production."

# Fast-track merge (skip reviews if emergency)
gh pr merge --squash --delete-branch

# Option B: Manual deployment (faster but bypasses CI)
# See Quick Rollback Step 3
```

---

### Step 5: Monitor Deployment

```bash
# Watch GitHub Actions deployment
gh run watch

# Verify deployment completes
gh run list --workflow=prod-deploy.yml --limit 1
```

---

### Step 6: Verify and Document

```bash
# Health check
curl -I https://notecards-1b054.web.app

# Manual smoke test
open https://notecards-1b054.web.app

# Document rollback
# See Quick Rollback Step 6
```

---

## Git Revert Method

**Use when**: Bad commit known, want clean git history.

### When to Use

- ✅ Specific bad commit identified
- ✅ Want to preserve git history (no force pushes)
- ✅ Multiple commits since bad deploy (selective revert)

---

### Procedure

```bash
# 1. Identify bad commit
git log --oneline -10

# Example output:
# abc1234 feat: new feature (BROKEN)
# def5678 fix: minor bug
# ghi9012 chore: update deps

# 2. Create revert commit
git revert abc1234

# 3. Resolve conflicts if any
# Edit files to resolve conflicts...
git add .
git revert --continue

# 4. Push revert commit
git push origin main

# 5. Monitor auto-deployment
gh run watch

# 6. Verify revert successful
curl -I https://notecards-1b054.web.app
```

---

### Multiple Commit Revert

```bash
# Revert range of commits (most recent first)
git revert --no-commit abc1234^..def5678

# Review changes
git status
git diff --cached

# Commit revert
git commit -m "revert: rollback features X, Y, Z due to production issues"

# Push and deploy
git push origin main
gh run watch
```

---

## Firestore Rules Rollback

**Use when**: Security rules causing issues, hosting is fine.

### Symptoms

- Users getting "permission denied" errors
- Queries failing with security violations
- Firestore Console shows rule errors

---

### Quick Rules Rollback

```bash
# 1. View current rules
firebase firestore:rules --project notecards-1b054

# 2. View rules history in Firebase Console
open "https://console.firebase.google.com/project/notecards-1b054/firestore/rules"

# 3. Click "Release History" tab

# 4. Find previous working rule version

# 5. Click "Roll back to this version"

# 6. Confirm rollback
```

**Rules rollback is instant** (no build/deploy needed).

---

### Git-Based Rules Rollback

```bash
# 1. Find previous rules version
git log --oneline firestore.rules

# 2. Checkout previous version
git checkout <commit-sha> firestore.rules

# 3. Test rules locally
npm run test:rules

# 4. Deploy rules only
firebase deploy --only firestore:rules --project notecards-1b054

# 5. Commit fixed rules
git add firestore.rules
git commit -m "fix: rollback firestore rules to stable version"
git push origin main
```

---

## Database Migration Rollback

**Use when**: Data migration caused issues.

### WARNING

⚠️ **Database rollbacks are complex and risky**. Always:
- Have database backups before migrations
- Test rollback procedures before production
- Consider forward-fix instead of rollback

---

### Preparation (Before Migration)

```bash
# 1. Export production data
firebase firestore:export gs://notecards-1b054-backup/$(date +%Y%m%d-%H%M%S) \
  --project notecards-1b054

# 2. Document export location
echo "Backup: gs://notecards-1b054-backup/20251023-143000" >> migration-backup.txt
```

---

### Rollback Procedure

```bash
# 1. Verify backup exists
gsutil ls gs://notecards-1b054-backup/

# 2. Import previous data
firebase firestore:import gs://notecards-1b054-backup/20251023-143000 \
  --project notecards-1b054

# 3. Verify data restored
# Check Firebase Console:
open "https://console.firebase.google.com/project/notecards-1b054/firestore/data"

# 4. Test critical queries
# Use Firestore Console or manual testing
```

---

### Partial Migration Rollback

**If only specific collections affected**:

```bash
# Export current state (in case of issues)
firebase firestore:export gs://notecards-1b054-backup/rollback-attempt-$(date +%Y%m%d-%H%M%S) \
  --project notecards-1b054

# Import specific collection from backup
# Note: This overwrites existing data in collection
firebase firestore:import gs://notecards-1b054-backup/20251023-143000 \
  --collection-ids="decks,cards" \
  --project notecards-1b054
```

---

## Verification Steps

### Post-Rollback Checklist

```markdown
### Health Checks
- [ ] Site loads (HTTP 200)
- [ ] No console errors in browser
- [ ] Core assets loading (JS, CSS, images)

### Functional Tests
- [ ] User authentication working
- [ ] Deck creation/viewing
- [ ] Card CRUD operations
- [ ] Study mode functional
- [ ] Data persisting correctly

### Performance Checks
- [ ] Page load time <3 seconds
- [ ] No obvious performance regressions
- [ ] Firebase usage within normal ranges

### Security Checks
- [ ] Firestore rules working correctly
- [ ] No unauthorized access errors
- [ ] Authentication flow secure
```

---

### Automated Verification

```bash
# Health check script
curl -I https://notecards-1b054.web.app | grep "HTTP/2 200"

# Expected: HTTP/2 200

# Check critical assets
for asset in "/assets/index-*.js" "/assets/index-*.css"; do
  curl -I "https://notecards-1b054.web.app$asset" | grep "HTTP/2 200"
done
```

---

## Post-Rollback Actions

### Immediate Actions (Within 1 Hour)

1. **Notify Stakeholders**:
   ```markdown
   Subject: Production Rollback Complete

   The production rollback has been completed successfully.

   - Rolled back from: <version/commit>
   - Rolled back to: <version/commit>
   - Reason: <brief description>
   - Status: Site stable, investigating root cause
   - ETA for fix: <timeline>
   ```

2. **Create Tracking Card**:
   ```bash
   # Create bug card for root cause
   # Title: "Production incident: [brief description]"
   # Priority: P0
   # Type: bug
   ```

3. **Document Timeline**:
   ```markdown
   ## Incident Timeline
   - 14:30 - Deployment completed
   - 14:35 - Issue reported
   - 14:40 - Rollback initiated
   - 14:42 - Rollback completed
   - 14:45 - Verification successful
   ```

---

### Short-Term Actions (Within 24 Hours)

1. **Root Cause Analysis**:
   - What caused the issue?
   - Why wasn't it caught in testing?
   - What was the impact?

2. **Create Fix**:
   - Develop fix on feature branch
   - Add tests to prevent recurrence
   - Test thoroughly locally

3. **Update Monitoring**:
   - Add alerts for similar issues
   - Improve test coverage
   - Update smoke test checklist

---

### Long-Term Actions (Within 1 Week)

1. **Post-Mortem Meeting**:
   - Review incident timeline
   - Discuss root cause
   - Identify prevention measures

2. **Process Improvements**:
   - Update deployment checklist
   - Add automated checks
   - Improve testing procedures

3. **Documentation Updates**:
   - Update troubleshooting guide
   - Add to rollback procedures if new scenario
   - Share learnings with team

---

## Prevention Strategies

### Pre-Deployment

```markdown
### Deployment Checklist
- [ ] All tests passing (307/307)
- [ ] Code reviewed by peer
- [ ] Tested in preview environment
- [ ] Database migrations tested
- [ ] Rollback plan documented
- [ ] Monitoring in place
```

---

### Automated Safeguards

```yaml
# Example: Add deployment gate in prod-deploy.yml
- name: Require Manual Approval
  if: github.ref == 'refs/heads/main'
  uses: trstringer/manual-approval@v1
  with:
    approvers: team-leads
    minimum-approvals: 1
```

---

### Gradual Rollouts

**Feature Flags**:
```typescript
// Example feature flag usage
const FEATURE_NEW_STUDY_MODE = import.meta.env.VITE_FEATURE_NEW_STUDY_MODE === 'true';

if (FEATURE_NEW_STUDY_MODE) {
  // New feature
} else {
  // Old stable feature
}
```

**Benefits**:
- Enable for small % of users first
- Rollback = flip flag (no deployment)
- Quick recovery from issues

---

### Monitoring and Alerts

**Set up alerts for**:
- Error rate spikes (>5% increase)
- Response time degradation (>50% slower)
- Authentication failures (>1% of attempts)
- Firestore quota exceeded
- Hosting bandwidth spikes

**Firebase Console Alerts**:
```bash
open "https://console.firebase.google.com/project/notecards-1b054/monitoring"
```

---

## Emergency Contacts

### Critical Issues

**Immediate Actions**:
1. Assess impact using [When to Rollback](#when-to-rollback)
2. Execute [Quick Rollback](#quick-rollback-emergency) if critical
3. Notify team in Slack/Discord

**Support Resources**:
- Firebase Status: https://status.firebase.google.com/
- GitHub Status: https://www.githubstatus.com/
- Firebase Console: https://console.firebase.google.com/project/notecards-1b054

---

## Rollback Decision Tree

```
Production Issue Detected
         ↓
    Is it critical?
    (auth broken, data loss, site down)
         ↓
    YES → Quick Rollback (2-5 min)
         ↓
    Verify & Notify
         ↓
    Investigate root cause

    NO → Can it be fixed quickly? (<10 min)
         ↓
    YES → Deploy hotfix
         ↓
    NO → Controlled Rollback (10-15 min)
         ↓
    Verify & Notify
         ↓
    Create fix with tests
```

---

## Rollback Testing

### Test Rollback Procedures

**Quarterly Exercise**:
1. Deploy to staging environment
2. Intentionally "break" deployment
3. Execute rollback procedures
4. Measure rollback time
5. Update procedures based on learnings

**Benefits**:
- Team familiar with procedures
- Procedures validated and up-to-date
- Confidence in rollback capability

---

## Resources

**Documentation**:
- [Deployment Guide](./deployment-guide.md) - Standard deployment procedures
- [Troubleshooting Guide](./troubleshooting.md) - Common issues and solutions
- [CI/CD README](./README.md) - Pipeline overview

**Tools**:
- Firebase CLI: https://firebase.google.com/docs/cli
- GitHub CLI: https://cli.github.com/
- Firebase Console: https://console.firebase.google.com/

---

**Last Updated**: October 23, 2025
**Maintained By**: Development Team
**Next Review**: After next major deployment
