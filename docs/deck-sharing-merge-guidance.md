# Deck Sharing Feature Merge & Release Guidance

Branch: feature/deck-sharing
Target: main
Release Components: Firestore Rules (already deployed), Hosting (built & deployed), Documentation updates.

## 1. Preconditions
- [ ] Firestore rules deployed (verify `firebase deploy --only firestore:rules` recent timestamp in console / history).
- [ ] Hosting deployment done and smoke tests passed (see `production-smoke-test-checklist.md`).
- [ ] All critical issues resolved or tracked as follow-up tickets.
- [ ] Version file / CHANGELOG updated if semantic versioning is in use.

## 2. Prepare Pull Request
1. Pull latest main locally:
   - `git checkout main`
   - `git pull origin main`
2. Rebase feature branch to ensure linear history:
   - `git checkout feature/deck-sharing`
   - `git rebase main` (resolve conflicts if any, run build & rules verifier again after).
3. Run core verification scripts locally:
   - `npm run test:rules:standalone`
   - `npm run build`
4. Push (force-with-lease if rebase changed history):
   - `git push --force-with-lease origin feature/deck-sharing`
5. Open PR on GitHub:
   - Title: `feat: deck sharing (owner/editor/viewer roles & security rules)`
   - Description Sections:
     * Summary
     * Security Model & Rules Highlights
     * Testing Approach (standalone rules verifier + negative cases)
     * Deployment Notes (rules version, hosting date)
     * Smoke Test Results (attach PASS summary)
     * Follow-ups / Deferred Items

## 3. Review Focus Areas
- Firestore security rule logic (immutability, role resolution, subcollection access).
- UI gating (feature flag removal plan in future?).
- Collaborator service write operations & error handling.
- Potential performance concerns (bundle size noted ~800 kB gzip ~210 kB; evaluate future code-splitting).

## 4. Merge Strategy
Preferred: Squash & Merge (maintain clean history) if conventional commits are consistent.
Alternative: Rebase & Merge (retain chronological commit detail) if reviewers want granular history.

Ensure commit message on squash includes key scope: `feat(sharing): deck owner/editor/viewer collaboration with hardened security rules`.

## 5. Post-Merge Actions
- [ ] Pull latest main and tag release if using tags:
  - `git checkout main`
  - `git pull origin main`
  - `git tag -a v0.?.? -m "Deck sharing feature"`
  - `git push origin --tags`
- [ ] Monitor Firebase console for rule invocation errors (Firestore -> Rules -> Metrics) for first 24h.
- [ ] Validate a new share flow end-to-end again in production after merge.
- [ ] Remove feature flag conditional when confident (future PR): Replace gating constant with always-on or remote config.

## 6. Branch Cleanup
- After successful merge verification and tag (if any):
  - Delete remote branch via GitHub UI or: `git push origin --delete feature/deck-sharing`
  - Delete local branch: `git branch -d feature/deck-sharing`

## 7. Documentation Follow-ups
Optional enhancements:
- Add architecture diagram for sharing flow.
- Expand README with troubleshooting section (e.g., collaborator not appearing, permission denied resolution steps).
- Add rule change log entry referencing commit hash of deployment.

## 8. Rollback Plan (If Needed)
- Re-deploy previous known-good firestore.rules from Git history (checkout commit, deploy rules only).
- Revert hosting to prior release by redeploying earlier `dist` artifact (if archived) or performing `git revert` on breaking commits and rebuilding.
- Disable sharing UI by reintroducing flag or hiding Share button (hotfix commit) if security unaffected.

## 9. Metrics / Observation (Future)
- Track: number of shared decks, collaborator role distribution, failed permission operations (rules metrics), average time from share to first collaborator edit.
- Consider adding lightweight logging or analytics events (ensure privacy / no sensitive data).

---
Generated guidance to ensure safe and auditable integration of deck sharing feature.
