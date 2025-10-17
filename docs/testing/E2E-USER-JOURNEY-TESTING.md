# E2E User Journey Testing

## Documentation-As-Code Workflow
1. Capture the scenario in this directory before touching implementations (who, what, acceptance signals).
2. Express the workflow in vitest (`src/test/e2e/*.test.ts`) using puppeteer helpers.
3. Only then evolve `services/browser-service.mjs`/helpers to satisfy the tests.
4. Keep the doc in sync with the assertions—treat it as the living requirements spec.

## Test Harness
- `npm run test:e2e` routes through `scripts/run-e2e-tests-log.mjs`.
  - Prints log, raw, and JSON file paths immediately.
  - Emits `[E2E-TEST-COMPLETE]` when the run has finished; tail the log file until you see it.
- Targeted runs: `npm run test:e2e:vitest -- src/test/e2e/<file>.test.ts`.
- Use `E2E_TERMINAL_MODE=full` to stream vitest output as well as persist logs.

## Writing New Journeys
- Build on `src/test/e2e/support/puppeteer-framework.ts` (WIP) for shared navigation helpers.
- Keep selectors resilient (prefer `data-testid` attributes; avoid brittle text matching).
- Capture screenshots when asserting major UI transitions—attach file paths to log output for easy debugging.
- Use `browserService.quickServiceAuth()` for authenticated flows; fall back to `quickAuth()` for manual smoke checks.

## Logging & Artifacts
- Artifacts live under `test-results/e2e/` using timestamped prefixes.
- JSON summaries include total counts, durations, and pointers to the two log streams.
- Screenshots saved in tests should use descriptive names (`screenshots/<scenario>-<step>.png`).

## Follow-Up
- Add coverage for error states (e.g., failed auth, missing required data) once happy-path tests are stable.
- Expand the support toolkit with wait helpers, structured logging, and cleanup utilities.
