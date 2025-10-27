# GitHub Branch Protection Setup

## Why Branch Protection?

**Current setup (good):**
- ✅ GitHub Actions runs checks on every push
- ✅ Production workflow runs checks before deploy
- ❌ But you CAN still push directly to main (bypassing PRs)

**With branch protection (better):**
- ✅ GitHub Actions runs checks on every push
- ✅ **CANNOT** merge to main without passing checks
- ✅ **CANNOT** push directly to main (must use PRs)
- ✅ Enforced server-side (cannot be bypassed)

---

## How to Enable Branch Protection

### Option 1: Via GitHub Web UI

1. Go to your repository: https://github.com/muunkky/notecards

2. Click **Settings** → **Branches** → **Add branch protection rule**

3. Configure the following:

#### Branch Name Pattern
```
main
```

#### Protection Rules

**Require a pull request before merging:**
- ✅ Enable this
- Require approvals: 0 (for solo projects) or 1+ (for teams)
- ☑️ Dismiss stale pull request approvals when new commits are pushed
- ☑️ Require review from Code Owners (optional)

**Require status checks to pass before merging:**
- ✅ Enable this
- ☑️ Require branches to be up to date before merging
- **Required status checks** (select these):
  - `test` (from ci-tests.yml)
  - `test-build-deploy` (from prod-deploy.yml)

**Require conversation resolution before merging:**
- ✅ Enable this (optional but recommended)

**Do not allow bypassing the above settings:**
- ✅ Enable this (enforces rules for admins too)

**Restrict who can push to matching branches:**
- ⚠️ Leave UNCHECKED (this would prevent all pushes, even through PRs)

4. Click **Create** or **Save changes**

---

### Option 2: Via GitHub CLI

```bash
# Enable branch protection for main
gh api repos/muunkky/notecards/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["test","test-build-deploy"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":0}' \
  --field restrictions=null
```

---

## New Workflow with Branch Protection

### Before (Current - Direct Push Allowed)
```bash
git add .
git commit -m "feat: new feature"
git push origin main  # ✅ Allowed (but GitHub Actions checks still run)
```

### After (With Branch Protection - PR Required)
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes
git add .
git commit -m "feat: new feature"

# 3. Push feature branch
git push origin feature/new-feature

# 4. Create PR via GitHub UI or CLI
gh pr create --title "feat: new feature" --body "Description"

# 5. GitHub Actions runs checks automatically on PR
# 6. Can only merge if ALL checks pass ✅
# 7. Merge PR (this updates main)
# 8. Production deployment triggers automatically
```

---

## Defense in Depth Summary

| Layer | What It Does | Can Be Bypassed? |
|-------|-------------|------------------|
| **Local Git Hooks** | Pre-push checks on your machine | ✅ Yes (`--no-verify`) |
| **GitHub Actions CI** | Runs checks on every push | ❌ No (server-side) |
| **Prod Deploy Workflow** | Checks before production deploy | ❌ No (server-side) |
| **Branch Protection** | Requires PR + passing checks | ❌ No (server-side) |

**Current setup:** Layers 1, 2, and 3 active ✅
**Recommended:** Add Layer 4 (Branch Protection)

---

## Solo Developer vs Team

### Solo Developer (You)
- **Option A:** Keep current setup (GitHub Actions checks, no branch protection)
  - Faster workflow (direct push to main)
  - GitHub Actions still validates everything
  - Production deploy still requires passing checks

- **Option B:** Enable branch protection
  - Forced PR workflow (more disciplined)
  - Cannot bypass checks
  - Slightly slower workflow

**Recommendation for solo:** Keep current setup. GitHub Actions already prevents bad deploys.

### Team (Multiple Developers)
- **Must enable branch protection**
  - Prevents teammates from pushing broken code to main
  - Enforces code review process
  - Required status checks ensure consistency

---

## Testing Branch Protection

After enabling, try to push directly to main:

```bash
# This should FAIL with branch protection enabled
git push origin main

# Error message:
# remote: error: GH006: Protected branch update failed for refs/heads/main.
# remote: error: Required status check "test" is expected.
```

You'll need to use PRs instead:

```bash
# Correct workflow with branch protection
git checkout -b feature/test-protection
git push origin feature/test-protection
gh pr create
# Wait for checks to pass, then merge PR
```

---

## Escape Hatches

### For Emergencies (Not Recommended)

If you need to bypass protection temporarily:

1. Go to Settings → Branches → Edit protection rule
2. Uncheck "Do not allow bypassing the above settings"
3. Push your emergency fix
4. Re-enable protection immediately

**Better approach:** Keep protection rules, use `gh pr create` with auto-merge for urgent fixes.

---

## Summary

**Your current setup already has server-side enforcement:**
- ✅ GitHub Actions runs on every push (cannot be bypassed)
- ✅ Production deploy requires passing checks
- ✅ Local hooks are optional helpers (for fast feedback)

**Branch protection adds:**
- ✅ Forced PR workflow
- ✅ Cannot push directly to main
- ✅ Can require code reviews

**Recommendation:**
- **Solo project:** Keep current setup (it's already safe)
- **Team project:** Enable branch protection
