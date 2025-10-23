# Clean up "study" terminology from codebase

## Context
Study mode is NOT on the roadmap and is not a feature of this application. However, there may be UI references, comments, or other code that incorrectly references "study" functionality.

## Task
1. Grep the entire codebase for the word "study" (case-insensitive)
2. Review each occurrence to determine if it should be removed
3. Remove or replace inappropriate references
4. Update any UI text, comments, or documentation

## Scope
- Source code (src/*)
- Documentation (docs/*)
- Configuration files
- Test files
- Exclude: node_modules, build artifacts

## Acceptance Criteria
- [ ] Run comprehensive grep for "study" across codebase
- [ ] Document all found occurrences
- [ ] Remove or replace each inappropriate reference
- [ ] No UI elements mention "study" functionality
- [ ] No code comments reference study mode
- [ ] Verify no broken functionality after cleanup

## Commands to run
```bash
# Find all occurrences
grep -r -i "study" src/ docs/ --exclude-dir=node_modules

# Review and clean up each file
```