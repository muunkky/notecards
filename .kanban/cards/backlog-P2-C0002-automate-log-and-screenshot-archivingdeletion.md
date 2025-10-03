## Objective
Implement automated sanitation for logs and screenshots in the project. This should include:
- Auto-archiving or deletion of old log files (unit, e2e, functions, build, etc.)
- Auto-archiving or deletion of old test screenshots and artifacts
- Configurable retention policy (e.g., keep last N days or N files)
- Option to move files to an archive folder before deletion
- Integration with existing test logging system if possible

## Non-Objectives
- No manual cleanup (should be automated)
- No changes to test output formats
- No impact on current logging or screenshot generation

## Desired End State
- Project automatically prunes old logs and screenshots
- Disk usage remains under control
- No manual intervention required for routine cleanup
- Retention policy is documented and configurable

## Todo Checklist
- [ ] Design retention policy (days/files)
- [ ] Implement log file auto-pruning
- [ ] Implement screenshot auto-pruning
- [ ] Add option to archive before deletion
- [ ] Integrate with test logging scripts
- [ ] Document retention policy in README
- [ ] Add tests for sanitation logic
- [ ] Monitor disk usage after implementation

## Success Criteria
- Old logs/screenshots are removed or archived automatically
- No loss of recent or important test artifacts
- Retention policy is easy to adjust
- No manual cleanup needed for routine maintenance