# Git Push Instructions - Manual Authentication Required

## Current Status

✅ **5 commits ready to push:**
- DESIGNSYS sprint complete (design system foundation)
- All cards archived
- Documentation complete
- Working tree clean

🚫 **Blocked by:** Git authentication not configured

---

## Quick Fix (Recommended - GitHub Desktop)

If you have GitHub Desktop installed:

1. Open GitHub Desktop
2. It will show the 5 unpushed commits
3. Click "Push origin" button
4. Done! (GitHub Desktop handles authentication)

---

## Option A: SSH Setup (Best for future - one-time setup)

### Step 1: Generate SSH Key
```bash
ssh-keygen -t ed25519 -C "cameron@localhost"
# Press Enter 3 times (accept defaults, no passphrase)
```

### Step 2: Copy public key
```bash
cat ~/.ssh/id_ed25519.pub
# Copy the entire output (starts with ssh-ed25519)
```

### Step 3: Add to GitHub
1. Go to: https://github.com/settings/keys
2. Click "New SSH key"
3. Title: "WSL Ubuntu"
4. Paste the key
5. Click "Add SSH key"

### Step 4: Update git remote to use SSH
```bash
cd /mnt/c/users/Cameron/projects/note_apps/notecards
git remote set-url origin git@github.com:muunkky/notecards.git
```

### Step 5: Push
```bash
git push origin feature/deck-sharing
```

---

## Option B: Personal Access Token (Quick - expires after 90 days)

### Step 1: Create token
1. Go to: https://github.com/settings/tokens/new
2. Note: "Notecards CLI access"
3. Expiration: 90 days
4. Scopes: Check "repo" (all sub-boxes)
5. Click "Generate token"
6. **COPY THE TOKEN** (you won't see it again)

### Step 2: Push with token
```bash
cd /mnt/c/users/Cameron/projects/note_apps/notecards
git push https://YOUR_TOKEN_HERE@github.com/muunkky/notecards.git feature/deck-sharing
```

Replace `YOUR_TOKEN_HERE` with the token you copied.

---

## Option C: Git Credential Manager (Windows - if installed)

If you're on Windows with Git Credential Manager:

```bash
git push origin feature/deck-sharing
```

A browser window should open for GitHub OAuth authentication.

---

## After Successful Push

Once the push succeeds, come back and I'll:
1. ✅ Monitor CI test results
2. ✅ Merge to main when tests pass
3. ✅ Trigger production deployment
4. ✅ Verify deployment
5. ✅ Prepare for next sprint

---

## Current Commits to Push

```
d5f1a571 docs(design-system): Add comprehensive sprint completion summary
463a0d64 chore(kanban): Archive DESIGNSYS sprint with 12 completed cards
dc7ef267 chore(design-system): Complete infrastructure and tooling setup
97cf37a1 chore(kanban): Archive DESIGNSYS sprint with 13 completed cards
31125b99 feat(design-system): Complete management change-proof design system foundation
```

---

## Verification Commands

After pushing, verify with:
```bash
git status
# Should say: "Your branch is up to date with 'origin/feature/deck-sharing'"

git log origin/feature/deck-sharing..HEAD
# Should show: nothing (all commits pushed)
```

---

**Choose the option that works best for you and let me know when the push succeeds!**
