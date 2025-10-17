# Project History & Evolution

Status: Living consolidated history (supersedes prior handoff documents).
Last Updated: 2025-09-01

## 1. Timeline Highlights
| Date | Event | Notes |
|------|-------|-------|
| 2025-08 (late) | POC foundation completed | Deck + Card CRUD, baseline reorder |
| 2025-08-29 | Initial handoff summary authored | Separate FINAL-HANDOFF-SUMMARY.md |
| 2025-08-31 | Reported 210/211 tests passing | One edge test failing (pre-fix) |
| 2025-09-01 | Git divergence fully remediated | Added Git Workflow doc |
| 2025-09-01 | Post-POC Wave 1 features | Duplicate, Favorite, Archive implemented via TDD |

## 2. Architecture Stability
Core stack (React + TS + Firebase) remained constant. Enhancements targeted card operations layer and incremental UI actions without schema-breaking changes (favorite / archived flags introduced as optional to avoid migrations).

## 3. Testing Progression
Initial suite (~110) expanded to 224 tests covering hooks, components, Firestore service behaviors, and new feature flags. Deterministic logging introduced to support automated analysis and consistent PowerShell execution environment.

## 4. Operational Incidents
Single major incident: repository divergence (unrelated histories). Resolved through controlled force update after validation & tagging. Preventative Git workflow codified (branch protections pending implementation).

## 5. Feature Waves
1. Core CRUD & reorder (baseline)
2. UI polish & test infrastructure maturation
3. Post-POC Wave 1: duplicateCard, toggleFavorite, archive/unarchive
4. Upcoming: filtering, improved duplicate placement, drag-and-drop refinement, order snapshots

## 6. Pending Strategic Decisions
| Topic | Decision Needed | Options |
|-------|-----------------|---------|
| Order Index Strategy | Efficient mid-list insert for duplicate & DnD | Fractional indices / gap allocation / periodic reindex |
| Filtering UX | Exposure of favorite & archived toggles | Combined segmented controls vs. chip filters |
| Snapshot Persistence | Minimal first vs. full CRUD | MVP (save + load) then rename/delete |

## 7. Quality Metrics Targets (Forward)
* Tests: Grow to 240+ maintaining 100% pass (minus intentionally skipped experimental cases only).
* Performance: <50ms local filter for 500 cards.
* Reliability: Zero silent failures in Firestore writes (all surfaced & retryable).

## 8. References
* PRD (current authoritative requirements)
* Engineering Design Document (updated with post-POC flags)
* Git Workflow & Practices (active)

## 9. Deprecated / Archived Docs
* `communications/FINAL-HANDOFF-SUMMARY.md` (superseded)
* `communications/FINAL-MONTH-HANDOFF-AUGUST-2025.md` (superseded)

---
Maintain this file with concise deltas; avoid duplicating full PRD/Design content.