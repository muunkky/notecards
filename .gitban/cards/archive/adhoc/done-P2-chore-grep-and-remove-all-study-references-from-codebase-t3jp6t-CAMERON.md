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

- [x] Run comprehensive grep for "study" across codebase
- [x] Document all found occurrences
- [x] Remove or replace each inappropriate reference
- [x] No UI elements mention "study" functionality
- [x] No code comments reference study mode
- [x] Verify no broken functionality after cleanup

## Commands to run
```bash
# Find all occurrences
grep -r -i "study" src/ docs/ --exclude-dir=node_modules

# Review and clean up each file
```

## Completion Summary

Successfully removed all 6 "study" references from the codebase:

1. **src/App.tsx:70** - "Notecards Study App" → "Notecards"
2. **src/features/decks/DeckScreen.tsx:260** - "study materials" → "cards"
3. **src/features/decks/DeckScreen.tsx:313** - "studying, memorizing" → "organizing and memorizing"
4. **src/features/cards/CardScreen.tsx:723** - "you want to study" → "you want to remember"
5. **src/test/mcp-integration-demo.test.ts:42** - "Study with Digital Flashcards" → "Digital Flashcards"
6. **src/test/mcp-demo.test.ts:144** - "Study with Digital Flashcards" → "Digital Flashcards"

Verification: `grep -ri "study" src/` returns zero results.

Committed: 257fe66a

## Tasks

- [x] Run comprehensive grep for "study" across codebase
- [x] Document all found occurrences
- [x] Remove or replace each inappropriate reference
- [x] No UI elements mention "study" functionality
- [x] No code comments reference study mode
- [x] Verify no broken functionality after cleanup
