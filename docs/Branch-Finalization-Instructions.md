# Branch Finalization (feature/deck-sharing)

Your environment isn't showing git command output in the integrated terminal, so perform these steps in an external shell (regular PowerShell or Git Bash) to finalize and merge.

## 1. Verify Repo State
```powershell
pwd # ensure you're in notecards root
ls .git # should exist
```
If `.git` missing, re-clone:
```powershell
cd ..
git clone <repo-url> notecards-fresh
cd notecards-fresh
git checkout feature/deck-sharing
```

## 2. Stage & Commit Pending Changes
Files to include:
- tsconfig.json
- tsconfig.tests.json
- vite.config.ts
- package.json
- docs/Production-Smoke-Test-Checklist.md
- docs/Deck-Sharing-Merge-Guidance.md

Commands:
```powershell
git add tsconfig.json tsconfig.tests.json vite.config.ts package.json `
  docs/Production-Smoke-Test-Checklist.md docs/Deck-Sharing-Merge-Guidance.md

git commit -m "chore(build): add firebase chunk split and test tsconfig" \
            -m "docs(sharing): smoke checklist & merge guidance"
```
(Use separate commits if preferred.)

## 3. Sync With Main
```powershell
git fetch origin
git checkout main
git pull origin main
git checkout feature/deck-sharing
git rebase main
```
Resolve conflicts if any, then re-run:
```powershell
npm run test:rules:standalone
npm run build
```

## 4. Push
If rebased:
```powershell
git push --force-with-lease origin feature/deck-sharing
```
Otherwise:
```powershell
git push origin feature/deck-sharing
```

## 5. Open Pull Request
Title:
```
feat(sharing): deck collaboration (owner/editor/viewer) with hardened security rules
```
Body: use sections from Deck-Sharing-Merge-Guidance.md.

## 6. Merge & Cleanup
After PR merge:
```powershell
git checkout main
git pull origin main
git branch -d feature/deck-sharing
git push origin --delete feature/deck-sharing
```

## 7. Optional Follow-Ups
- Add `// @ts-nocheck` to large e2e test files (temporary) or refine types.
- Break out async UI portions with dynamic import for further code-splitting.
- Remove feature flag around Share UI in a stabilization PR.

## 8. If Git Still Non-Functional In IDE
- Use system PowerShell outside VS Code.
- Or install fresh Git: https://git-scm.com/download/win
- Verify with: `git --version`

## 9. Quick Validation Checklist Before Merge
- [ ] Rules verifier passes (local)
- [ ] Hosted site accessible
- [ ] Share dialog works end-to-end with test users
- [ ] Negative permission attempt returns Firestore PERMISSION_DENIED
- [ ] Smoke checklist updated with date & PASS

This file is auto-generated to unblock finalization despite terminal output suppression.
