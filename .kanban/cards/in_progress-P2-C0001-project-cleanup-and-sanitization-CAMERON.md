## Objective
Clean up and sanitize the notecards project folder to remove legacy files, outdated artifacts, and organizational cruft that has accumulated over development cycles.

## Non-Objectives
- **No code refactoring**: This is purely file organization/cleanup
- **No feature changes**: Don't modify functionality
- **No dependency updates**: Keep current versions unless files are unused
- **No architectural changes**: Maintain current project structure

## Desired End State
- Clean, organized project folder with only necessary files
- Clear documentation of what was removed and why
- Identified potential code refactor opportunities documented as separate cards
- Improved developer experience when navigating the project
- Reduced confusion from legacy/obsolete files

## Todo Checklist

### Discovery Phase
- [ ] Audit root directory for unnecessary files
- [ ] Review `/scripts` folder for unused/duplicate scripts
- [ ] Check `/docs` folder for outdated documentation
- [ ] Identify legacy config files (old vite configs, etc.)
- [ ] Review `/test` and `/test-results` for old artifacts
- [ ] Check for duplicate or abandoned feature branches locally

### File Categories to Review
- [ ] Old backup files (`.bak`, `.old`, `.backup` extensions)
- [ ] Temporary files and directories (`temp/`, `tmp/`)
- [ ] Legacy configuration files
- [ ] Unused assets or media files
- [ ] Old log files beyond retention policy
- [ ] Abandoned test files or outdated test data
- [ ] Documentation that references removed features

### Cleanup Actions
- [ ] Move or delete identified legacy files
- [ ] Update `.gitignore` if needed for new patterns
- [ ] Consolidate similar files where appropriate
- [ ] Document removal decisions in cleanup log
- [ ] Update README if file structure changes significantly

### Code Opportunity Identification
- [ ] Note any code patterns that could be refactored (create cards)
- [ ] Identify outdated dependencies for future update (create cards)
- [ ] Document any architectural debt observed (create cards)
- [ ] Flag any security concerns for future review (create cards)

### Documentation & Finalization
- [ ] Create summary of changes made
- [ ] Update project documentation if folder structure changed
- [ ] Verify all tests still pass after cleanup
- [ ] Create follow-up cards for any refactor opportunities found
- [ ] Archive this card with completion summary

## Success Criteria
- Project folder is visibly cleaner and more organized
- No functional regressions introduced
- Clear log of what was removed and rationale
- Any technical debt opportunities captured in new backlog cards

## Discovery Phase Progress

## Root Directory Audit Findings ✅

**Identified Cleanup Targets:**

### Legacy/Temporary Files in Root:
- `browser-session-cookies.json` - Session data artifact
- `browser-session-storage.json` - Session data artifact  
- `debug-firebase-admin.mjs` - Debug script (may be needed, check usage)
- `demo-simple-service.mjs` - Demo file (likely safe to remove)
- `firestore_test_head.tmp` - Temporary test file
- `restore_archive_test.tmp` - Temporary test file
- `restore_duplicate_test.tmp` - Temporary test file
- `super-simple-example.mjs` - Example/demo file
- `notecards-local-backup-2025-09-01_00-38-37.zip` - Old backup (28 days old)
- `test-run-2025-09-01-15-56.log` - Loose log file in root
- Multiple test error screenshots: `test-error-*.png` (4 files)

### Legacy Config Files:
- `vite.config.new.ts` - Appears to be a newer version alongside `vite.config.ts`
- Multiple `tsconfig.*.json` files - Need to verify which are needed

### Log Directory Issues:
- `log/temp/` contains **~180 old log files** from September - massive cleanup needed
- Files date back to early September 2025 (about a month old)
- Both old test-results and functions-tests logs present

### Scripts Directory Review:
- **57 script files** - many appear to be experimental/debug scripts
- Likely candidates for cleanup: multiple auth scripts, debug scripts, screenshot utilities

**Immediate Actions Needed:**
1. Clean up log/temp directory (keep only recent files)
2. Remove obvious temporary files from root
3. Archive old backup file  
4. Remove legacy test error screenshots
5. Consolidate or remove duplicate config files

## Git Safety Check

## Pre-Cleanup Git Status ✅

**Git Repository Secured:**
- Committed all pending changes (commit: 8e786717)
- Branch: `feature/deck-sharing` up to date with origin
- Working directory now clean and ready for cleanup operations
- Safe to proceed with file removal and reorganization

**Changes Committed Before Cleanup:**
- Structured test logging documentation
- Kanban system initialization  
- PowerShell utility scripts
- Functions test configuration updates
- Firestore rules modifications

**Ready to Proceed:** ✅ Safe to start file cleanup operations

## Cleanup Strategy

## Cleanup Execution Plan 📋

**Priority Order (Risk Assessment):**

### Phase 1: Low-Risk Removals (Start Here)
1. **Log Files Cleanup** - `log/temp/` directory 
   - Risk: ⚡ LOW - logs are regeneratable
   - Impact: 🎯 HIGH - 145+ files, significant disk space
   - Action: Keep last 10 days, remove older files

2. **Temporary Files** - Root directory cleanup
   - Risk: ⚡ LOW - clearly marked as temporary
   - Files: `*.tmp`, `firestore_test_head.tmp`, session JSON files
   - Action: Remove after quick content verification

3. **Test Artifacts** - Screenshots and loose logs
   - Risk: ⚡ LOW - test artifacts are regeneratable  
   - Files: `test-error-*.png`, `test-run-2025-09-01-15-56.log`
   - Action: Move to archive or remove

### Phase 2: Medium-Risk Assessment
4. **Demo/Example Files** - Development artifacts
   - Risk: ⚡ MEDIUM - may contain useful patterns
   - Files: `demo-simple-service.mjs`, `super-simple-example.mjs`
   - Action: Quick code review before removal

5. **Backup Files** - Old archives
   - Risk: ⚡ MEDIUM - backup data (but month old)
   - Files: `notecards-local-backup-2025-09-01_00-38-37.zip`
   - Action: Verify contents, then archive/remove

### Phase 3: Configuration Review
6. **Legacy Config Files** - Version conflicts
   - Risk: ⚡ HIGH - may break build/test systems
   - Files: `vite.config.new.ts` vs `vite.config.ts`
   - Action: Careful analysis and testing

7. **Script Directory Audit** - Duplicate/unused scripts
   - Risk: ⚡ HIGH - may break automation
   - Action: Usage analysis before removal

**Execution Status:** 🚀 Starting with Phase 1...

## Phase 1 Results

## Phase 1 Execution Results ✅

### Log Files Cleanup - COMPLETED
- **Before:** 193 files in `log/temp/`
- **Removed:** 145 files older than 10 days (2025-09-01 to 2025-09-20)
- **Kept:** 48 recent files (last 10 days)
- **Space Freed:** Significant disk space recovery
- **Risk Assessment:** ✅ Zero risk - all files are regeneratable test logs

### Files Cleaned Include:
- Build output logs from early September
- Legacy test-results logs (unit tests)
- Old puppeteer test logs  
- Functions test logs
- Old pointer files (latest-log-path.txt, etc.)

**Status:** 🎯 Phase 1 Complete - Moving to temporary files cleanup

### Next: Root Directory Temporary Files
- Target files: `*.tmp`, session JSON files, loose test artifacts
- Risk: ⚡ LOW - clearly temporary files

## Phase 1 Completion Summary

## Phase 1 - Low Risk Cleanup ✅ COMPLETE

### Successfully Removed:
1. **Log Files**: 145 old files from `log/temp/` (kept 48 recent)
2. **Temporary Files**: 6 files removed
   - `firestore_test_head.tmp` (32KB test backup)
   - `restore_archive_test.tmp` (5KB test backup) 
   - `restore_duplicate_test.tmp` (5KB test backup)
   - `browser-session-cookies.json` (659B session data)
   - `browser-session-storage.json` (2B empty session data)
   - `test-run-2025-09-01-15-56.log` (2.8KB loose log)
3. **Test Screenshots**: 4 files, ~4.5MB total
   - `test-error-3-1757276780235.png` (1.0MB)
   - `test-error-3-1757277016381.png` (1.2MB)  
   - `test-error-5-1757277023209.png` (1.2MB)
   - `test-error-7-1757299036139.png` (1.1MB)

### Pending Review (Medium Risk):
- **Old Backup**: `notecards-local-backup-2025-09-01_00-38-37.zip` (100KB, 29 days old)
- **Demo Files**: 
  - `demo-simple-service.mjs` - browser service examples
  - `super-simple-example.mjs` - browser service examples
  
**Space Freed**: ~150+ files, several MB of disk space  
**Risk**: ✅ Zero - all removed files were regeneratable artifacts

**Next Phase**: Medium-risk assessment of demo files and backup
