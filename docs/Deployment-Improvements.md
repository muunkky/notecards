# Deployment & Delivery Improvement Backlog

_Last updated: 2025-09-21_

Purpose: Centralize potential enhancements to the build → test → release → observe pipeline. Each item includes: Category, Rationale, Effort (S/M/L), and a Ready definition or acceptance hints.

## ✅ Current State Snapshot
- Hosting: Firebase Hosting (single target) with SPA rewrite to `index.html`.
- Build: Vite + TypeScript; single ~795 KB (207 KB gzip) main JS bundle.
- Tests: Custom log-driven harness + Vitest; service account E2E optional.
- Auth: Service account quick auth + browser automation working locally.
- CI: (Assumed) basic test pipeline; no documented preview deploys.
- Observability: No explicit performance/error monitoring documented.

## 📌 High-Priority (Short-Term)

### 1. Split Large Bundle (Code Splitting / Lazy Loading)
- Category: Performance
- Rationale: Improve initial load & Core Web Vitals; 795 KB pre-gzip is heavy.
- Effort: M
- Definition of Ready: Identify route/component boundaries for dynamic import; list candidate heavy imports (firebase, react-beautiful-dnd).
- Acceptance: Lighthouse TTI / LCP improvement; main chunk reduced ≥30%.

### 2. Add Preview Deploys per PR
- Category: Release Workflow
- Rationale: Validate features before merge; stakeholders can QA.
- Effort: M
- Ready: Configure second Firebase Hosting target `preview` or use channel deployments (`firebase hosting:channel:deploy`).
- Acceptance: Opening a PR posts a preview URL comment; channel auto-expires.

### 3. Strict Mode for Service Account E2E
- Category: Test Quality
- Rationale: Detect secret misconfiguration early in CI.
- Effort: S
- Ready: ENV flag `E2E_SERVICE_ACCOUNT_STRICT=1` forces failure if creds absent.
- Acceptance: CI run without creds fails fast with clear message.

### 4. Deployment Smoke Test Script
- Category: Reliability
- Rationale: Automate basic post-deploy checks (deck CRUD, auth visibility).
- Effort: S
- Ready: Script hitting deployed URL + API endpoints (headless browser or fetch-only fallback).
- Acceptance: Fails build if core route or deck create UI not present.

### 5. Artifact & Logs Retention Documentation
- Category: Governance
- Rationale: Ensure reproducibility and debugging of releases.
- Effort: S
- Ready: Document where build logs, test summaries, and deployment versions are stored.
- Acceptance: New README / docs section with retention policy.

## 🧪 Medium-Term

### 6. Performance Budget in CI
- Category: Performance
- Rationale: Prevent bundle size regressions.
- Effort: M
- Ready: Set thresholds (e.g., main < 900 KB raw, < 230 KB gzip).
- Acceptance: CI fails on threshold breach; report diff vs baseline.

### 7. Error & Metrics Monitoring
- Category: Observability
- Rationale: Capture runtime errors & user behavior (Sentry/LogRocket/PostHog).
- Effort: M
- Ready: Choose tool; add ENV gating; GDPR-friendly defaults.
- Acceptance: Dashboard shows first production sessions & error traces.

### 8. Automated Dependency Vulnerability Scan
- Category: Security
- Rationale: Guard against known vulnerable packages.
- Effort: S
- Ready: Enable `npm audit` / GitHub Dependabot / OSV scanner in CI.
- Acceptance: Failing pipeline on high/critical severity unless exempted.

### 9. Rollback & Version Tagging Procedure
- Category: Release Management
- Rationale: Faster recovery from bad deploys.
- Effort: S
- Ready: Doc mapping Firebase Hosting version IDs to git SHAs; optional tagging script.
- Acceptance: Documented one-command rollback procedure.

### 10. Structured Release Notes Automation
- Category: Communication
- Rationale: Consistent change visibility.
- Effort: M
- Ready: Conventional commit parsing → CHANGELOG draft on release branch merge.
- Acceptance: CHANGELOG updated automatically in PR.

## 🚀 Longer-Term / Strategic

### 11. Multi-Env Promotion Pipeline (dev → staging → prod)
- Category: Release Workflow
- Rationale: Isolate integration, load, and production verification.
- Effort: L
- Ready: Separate Firebase projects or hosting targets with gating approvals.
- Acceptance: Promotion requires green tests + manual approval step.

### 12. Synthetic Monitoring & Availability SLOs
- Category: Reliability
- Rationale: Track uptime & UX KPIs proactively.
- Effort: M/L
- Ready: Define SLO (e.g., 99.5% uptime, deck create median < 800ms).
- Acceptance: Dashboard & alert on breach.

### 13. Data Backfill / Migration Framework
- Category: Data Hygiene
- Rationale: Safe schema evolutions (e.g., adding fields, indexing).
- Effort: M
- Ready: Add `scripts/migrations/` with idempotent runner + manifest.
- Acceptance: First migration demo (noop or sample) tracked in docs.

### 14. Load / Soak Test Suite
- Category: Scalability
- Rationale: Baseline performance under concurrency.
- Effort: L
- Ready: Identify key operations (card create, reorder) & target rates.
- Acceptance: Report with p95 latencies & pass/fail thresholds.

### 15. Frontend Feature Flags System
- Category: Release Safety
- Rationale: Gradual rollout & kill switches.
- Effort: M
- Ready: Simple JSON-based or service-driven flag provider.
- Acceptance: Flagged feature can be toggled without redeploy.

## 🧵 Cross-Cutting Enhancements
- Consistent ASCII-only test logs (done) → Extend to deployment scripts.
- Add `npm run analyze` script (rollup-plugin-visualizer) for bundle diffing.
- Create `scripts/deploy-preview.mjs` to wrap channel deploy + comment.
- Introduce `scripts/smoke-deploy.mjs` consuming deployed URL env var.

## 🔄 Working Agreement
- Keep this file as the canonical backlog for deployment/platform improvements.
- Reference items by number in commits, e.g., `perf: implement code splitting (DI-1)`.
- Reassess priorities after each major feature milestone.

## 📓 Change Log
| Date | Change |
|------|--------|
| 2025-09-21 | Initial creation with 15 categorized improvement items. |

