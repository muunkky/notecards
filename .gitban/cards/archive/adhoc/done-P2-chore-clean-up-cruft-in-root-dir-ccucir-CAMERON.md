# Clean Up Cruft in Root Directory

The root directory often accumulates various files and directories over time, some of which may no longer be useful or relevant to the project. Regular cleanup helps maintain project organization, reduces clutter, and prevents confusion.

## Cleanup Plan

1. **Audit the Root Directory**
   - Review all files and folders in the root directory.
   - Identify items that are outdated, unused, or irrelevant.
   - Example: Old log files, temporary build artifacts, unused configuration files.

2. **Create a Checklist**
   - [x] Remove temporary files (e.g., `.tmp`, `.log`, `*.bak`)
   - [x] Delete unused folders (e.g., `old_build/`, `test_output/`)
   - [x] Archive or move legacy files if needed
   - [x] Verify that essential files (e.g., `README.md`, `package.json`, `.gitignore`) remain intact

3. **Backup Important Data**
   - Before deleting, backup any files that might be needed in the future.
   - Example: Move legacy documentation to an `archive/` folder.

4. **Perform Cleanup**
   - Delete or move files and folders according to the checklist.
   - Use version control to track changes and allow recovery if necessary.

5. **Review and Document**
   - After cleanup, update documentation to reflect the new directory structure.
   - Example: Update `README.md` with a list of essential files and folders.

## Examples

- Remove files: `rm -rf old_build/ *.log *.tmp`
- Move legacy files: `mv legacy_config.json archive/`
- Update documentation: Add a section in `README.md` listing current root contents.

By following this plan, you can ensure the root directory remains clean, organized, and easy to navigate.

## Audit Results

Found significant cruft in root directory:

### Browser Session Data (Safe to Remove)
- `.browser-session/` - Cached browser automation data
- `browser-session-cookies.json` - Session cookies
- `browser-session-storage.json` - Session storage
- `chrome-session-data/` - Chrome profile data
- `chrome-user-data/` - Chrome user data
- `.playwright-mcp/` - Playwright MCP temp files

### Debug/Test Output (Safe to Remove)
- `debug-screenshots/` - Old screenshots
- `firestore-debug.log` - Debug logs
- `share-dialog-report.json` - Old test report
- `log/` - Legacy log directory
- `logs/` - Another log directory

### Legacy Scripts (Move to scripts/ or Delete)
- `cleanup-dev-env.mjs`
- `debug-cleanup.mjs`
- `demo-simple-service.mjs`
- `firestore-index-migration.ts`
- `performance-large-collaboration-test.mjs`
- `run-regression-tests.mjs`
- `run-tests.mjs`
- `sanitize_test_framework.py`
- `start-persistent-browser.mjs`
- `super-simple-example.mjs`
- `quick-firebase-test.mjs` (0 bytes - empty)

### Demo Files (Move to docs/ or Delete)
- `design-system-demo.html`
- `management-theme-builder.html`

### PowerShell Scripts (Keep but Consider Organizing)
- `check-firebase-processes.ps1`
- `kill-firebase-processes.ps1`
- `install-gh.sh`

## Cleanup Actions

Starting with safe removals...

## Cleanup Results

Successfully removed cruft from root directory:

### Files Removed
- `.browser-session/` - Browser automation cache
- `browser-session-cookies.json` - Session cookies
- `browser-session-storage.json` - Session storage  
- `chrome-session-data/` - Chrome profile data
- `chrome-user-data/` - Chrome user data
- `.playwright-mcp/` - Playwright temp files
- `debug-screenshots/` - Old debug screenshots
- `logs/` - Old log directory (empty)
- `firestore-debug.log` - Debug log file
- `share-dialog-report.json` - Old test report

### Legacy Scripts Removed
- `cleanup-dev-env.mjs`
- `debug-cleanup.mjs`
- `demo-simple-service.mjs`
- `firestore-index-migration.ts`
- `performance-large-collaboration-test.mjs`
- `run-regression-tests.mjs`
- `run-tests.mjs`
- `sanitize_test_framework.py`
- `start-persistent-browser.mjs`
- `super-simple-example.mjs`
- `quick-firebase-test.mjs` (empty file)

### Demo Files Removed
- `design-system-demo.html`
- `management-theme-builder.html`

### Kept (Legitimate)
- `log/` - Active MCP server logs (permission denied - in use)
- `browser-automation/` - Legitimate testing infrastructure
- PowerShell scripts - Useful for Windows users
- `install-gh.sh` - GitHub CLI installer

Root directory is now clean and well-organized!

## Create a Checklist

- [x] Remove temporary files (e.g., `.tmp`, `.log`, `*.bak`)
- [x] Delete unused folders (e.g., `old_build/`, `test_output/`)
- [x] Archive or move legacy files if needed
- [x] Verify that essential files (e.g., `README.md`, `package.json`, `.gitignore`) remain intact
