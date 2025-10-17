## Test Backlog & Placeholders

This document tracks intentionally skipped or placeholder tests after the tautology cleanup (2025-09-23).

### Goals
1. Replace all `it.skip` placeholders with meaningful interaction or integration tests.
2. Remove reliance on trivial assertions for environment verification.
3. Ensure feature flag off-cases have at least one active test when the flag is toggled off in a dedicated run matrix.

### Placeholder Suites / Tests
| Area | File | Placeholder ID | Planned Coverage |
|------|------|----------------|------------------|
| User Menu | `src/test/features/decks/DeckScreen-user-menu.test.tsx` | TODO(user-menu) | Open/close menu, keyboard nav, sign-out flow, future share entry point visibility |
| Permissions | `src/test/features/decks/DeckScreen-permission.test.tsx` | TODO(permissions) | Non-owner cannot see share button, editor cannot delete deck, viewer cannot rename |
| Login | `src/test/features/auth/LoginScreen.test.tsx` | TODO(login) | Render form fields, validation, auth error display, loading UX |
| Complete E2E Guidance | `src/test/e2e/complete-service-integration.test.ts` | TODO(e2e-complete) | Validate guidance logs when prerequisites missing, assert screenshot existence, auth state persistence |
| Share Dialog Flag Off | `src/test/sharing/share-dialog.test.tsx` | (conditional skip) | Run in a matrix with FEATURE_DECK_SHARING=false to assert the dialog does not render |

### Gated / Conditional Suites
| Suite | Condition | Action |
|-------|-----------|--------|
| Firestore Rules (Sharing) | `FIRESTORE_RULES_VITEST=1` | Keep gating; main CI uses standalone verifier script. Consider adding matrix job later. |
| Service Account Integration | Credentials present | Add filesystem assertions (screenshots), deck count delta after create interaction. |

### Removal / Refactor Candidates
- `tdd-verification.test.ts`: Keep temporarily; consider deletion once higher-value infra tests (e.g., custom matcher smoke, environment variables) are added.

### Next Steps (Ordered)
1. Implement permission tests with seeded deck roles (Step 5 alignment).
2. Expand Share Dialog with role change UI; add tests for role dropdown and removal (will replace part of permissions placeholder).
3. Add login screen rendering & basic validation test (fast win).
4. Flesh out complete-service integration: assert screenshot file creation and DOM changes after navigation.
5. Introduce a lint rule or script to detect `expect(true).toBe(true)` without whitelist tag `// ALLOW-TRIVIAL`.

### Policy Notes
- Placeholders MUST be `it.skip` and reference this backlog file.
- No plain tautological assertions (`expect(true).toBe(true)`) allowed unless explicitly whitelisted for gating (currently none after cleanup).

---
Maintained as part of continuous test quality improvements.