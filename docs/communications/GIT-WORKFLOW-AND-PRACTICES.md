# Git Workflow & Practices

Status: Active
Last Updated: 2025-09-01

Purpose: Prevent recurrence of the prior divergence / force‑recovery incident and standardize safe collaboration.

---
## 1. Branch Strategy
Main Branch: `main` (always green, deployable)
Working Branches: `feature/<topic>` / `fix/<issue>` / `chore/<task>`
Merge Method: Squash merge preferred (clean history) unless preserving series matters.

## 2. Commit Discipline
Atomic commits (single logical change)
Message format:
```
<type>(optional-scope): short imperative summary

<why / intent (1–2 sentences)>
Refs: #issue (optional)
```
Types: feat, fix, refactor, test, docs, chore, perf, ci

## 3. Sync Procedure (Happy Path)
```
git fetch origin
git checkout main
git pull --ff-only origin main   # abort if non fast-forward
git checkout -b feature/<topic>
... work ...
git push -u origin feature/<topic>
Create PR → all checks green → squash merge
git fetch --prune
```

## 4. Pre-Push Checklist
- All tests pass locally (`npm test -- --run`)
- No uncommitted changes (`git status` clean)
- No leftover debug / console noise
- README / docs updated if behavior changes
- Run `git fetch` + `git rebase origin/main` (or `--ff-only`) before push

## 5. Force Push Policy
Force push to `main`: PROHIBITED (emergency only — follow Section 10)
Force push to personal feature branches: Allowed before PR review starts
Never force push after review comments without explicit reviewer approval.

## 6. MCP / Automation Guardrails
- Automated tooling MUST only operate on dedicated automation branches (e.g., `automation/<task>`)
- Automation must not commit directly to `main`
- Nightly job: verify `git rev-list --left-right --count origin/main...HEAD` returns `0 0` on CI runner clone

## 7. Tagging & Backups
Release tag format: `v<MAJOR>.<MINOR>.<PATCH>` (semantic)
Safety snapshot (pre-risky-migration): `safety-<YYYY-MM-DD>-<short-desc>`
Bundle creation (optional manual): `git bundle create backup-<date>.bundle --all`

## 8. CI Requirements (to configure)
Required checks before merge:
- Install + typecheck
- Lint
- Test run (must be 0 failing)
Optional later: coverage threshold gate (e.g., 95%)

## 9. Handling Divergence (Non-Emergency)
If `git pull --ff-only` fails:
```
git fetch origin
git rebase origin/main   # resolve conflicts
git push --force-with-lease
```
Use `--force-with-lease` (never plain `--force`) for branch reconciliation.

## 10. Emergency Recovery Runbook
Trigger: `main` accidentally diverges / history rewritten improperly.
Steps:
1. STOP further pushes.
2. `git fetch --all --prune`.
3. Create safety tag of current remote: `git tag emergency-remote-<date> origin/main && git push origin emergency-remote-<date>`.
4. Acquire validated good local or bundle.
5. Verify tests: `npm test -- --run` (all pass or documented exception).
6. Force update with lease: `git push --force-with-lease origin <goodSHA>:main`.
7. Announce in team channel (include diff summary).
8. Open postmortem (see template below).

### Postmortem Template
```
Incident: <short>
Date:
Impact:
Root Cause:
Contributing Factors:
Resolution Steps:
Preventative Actions:
Follow-up Owners & Dates:
```

## 11. Large Change Protocol
For refactors touching >30 files:
1. Draft design note in `docs/changes/`.
2. Split into sequential PRs (infrastructure → core → cleanup).
3. Use feature flag / conditional path if behavior gating needed.

## 12. Tooling Enhancements (Backlog)
- Add GitHub Actions workflow for test + lint
- Add branch protection (require PR, disallow force push, require approvals)
- Add CODEOWNERS (e.g., `src/firebase/*` → data steward)
- Add commit lint via Husky or simple CI check

## 13. Quick Reference Commands
```
# Safe update main
git checkout main && git fetch origin && git pull --ff-only origin main

# Start feature
git checkout -b feature/card-bulk-delete

# Re-sync feature
git fetch origin && git rebase origin/main

# Abort bad rebase
git rebase --abort

# Show divergence counts
git rev-list --left-right --count origin/main...HEAD
```

## 14. Glossary
Fast-forward: Update without merge commit
Force-with-lease: Safer force push aborts if remote advanced unexpectedly
Atomic commit: Small, self-contained change enabling easier review / rollback

---
Adopt this document as the single source for git operations. Revisit quarterly or after any incident.
