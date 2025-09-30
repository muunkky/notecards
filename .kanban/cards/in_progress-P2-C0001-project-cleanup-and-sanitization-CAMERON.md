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

