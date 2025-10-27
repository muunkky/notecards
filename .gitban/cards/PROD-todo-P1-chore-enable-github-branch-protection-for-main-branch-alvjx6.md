# Enable GitHub Branch Protection for main branch

**Type:** Chore
**Priority:** P1
**Status:** todo
**Sprint:** PROD

## Description
Enable GitHub Branch Protection rules for the `main` branch to enforce PR workflow and require status checks to pass before merging. This provides server-side enforcement that cannot be bypassed, ensuring all code changes go through CI/CD validation before reaching production.

## Why This Matters
- **Current:** GitHub Actions checks run on every push, but direct push to main is allowed
- **With protection:** Must use PRs, and ALL checks must pass before merging
- **Benefit:** Server-side enforcement (cannot bypass with `--no-verify`)
- **Team ready:** When you add collaborators, protection is already enabled

## Implementation Options

### Option 1: GitHub Web UI (Recommended for First Time)
1. Go to: https://github.com/muunkky/notecards/settings/branches
2. Click "Add branch protection rule"
3. Configure settings (see checklist below)

### Option 2: GitHub CLI (Quick & Scriptable)
```bash
gh api repos/muunkky/notecards/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["test","test-build-deploy"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":0}' \
  --field restrictions=null
```

## Configuration Checklist

### Branch Name Pattern
- [ ] Set pattern to: `main`

### Require Pull Request Before Merging
- [ ] ✅ Enable "Require a pull request before merging"
- [ ] Set required approvals: 0 (for solo project)
- [ ] ✅ Enable "Dismiss stale pull request approvals when new commits are pushed"

### Require Status Checks to Pass Before Merging
- [ ] ✅ Enable "Require status checks to pass before merging"
- [ ] ✅ Enable "Require branches to be up to date before merging"
- [ ] Add required status checks:
  - [ ] `test` (from ci-tests.yml)
  - [ ] `test-build-deploy` (from prod-deploy.yml)

### Additional Settings
- [ ] ✅ Enable "Require conversation resolution before merging" (optional)
- [ ] ✅ Enable "Do not allow bypassing the above settings" (enforces for admins)
- [ ] ⚠️ Leave UNCHECKED: "Restrict who can push to matching branches"

### Save
- [ ] Click "Create" or "Save changes"

## Verification

After enabling, test that protection works:

```bash
# This should FAIL (cannot push directly to main)
git checkout main
git commit --allow-empty -m "test: branch protection"
git push origin main

# Expected error:
# remote: error: GH006: Protected branch update failed for refs/heads/main.
# remote: error: Required status check "test" is expected.
```

Correct workflow after protection:
```bash
# 1. Create feature branch
git checkout -b feature/test-branch-protection

# 2. Make changes and push
git push origin feature/test-branch-protection

# 3. Create PR
gh pr create --title "test: verify branch protection" --body "Testing PR workflow"

# 4. Wait for checks to pass (automatic)
# 5. Merge PR via GitHub UI or: gh pr merge

# 6. Production deploys automatically from main
```

## Impact on Workflow

### Before (Current)
```bash
git push origin main  # ✅ Allowed (checks run but can push)
```

### After (With Protection)
```bash
git push origin main  # ❌ BLOCKED
# Must use: feature branch → PR → checks pass → merge
```

**For solo development:** Slightly slower but much safer
**For team development:** Essential for code quality

## Documentation
See `docs/BRANCH_PROTECTION_SETUP.md` for complete guide including:
- Detailed setup instructions
- New workflow examples
- Troubleshooting
- Emergency bypass procedures (not recommended)

## Notes
- Branch protection is **server-side** - cannot be bypassed locally
- Works in addition to GitHub Actions (defense in depth)
- Optional for solo projects, recommended for teams
- Can temporarily disable for emergencies (then re-enable immediately)

## Success Criteria
- [ ] Branch protection rule created for `main`
- [ ] Required status checks configured
- [ ] Verified: Cannot push directly to main
- [ ] Verified: Can create PR and merge after checks pass
- [ ] Team members (if any) notified of new workflow
