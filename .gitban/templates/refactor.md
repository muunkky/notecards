# Refactor: [Title]

## Description

[What code is being refactored and why - REQUIRED]

**Motivation**: [Why refactor this code - maintainability, performance, readability, testability]

**Benefits**: [Specific improvements this refactoring will achieve]

**Target Area**: [Which part of codebase - service, module, function, configuration]

## Roadmap Reference

**Roadmap Location**: [Path in docs/roadmap.yaml if this relates to milestone work]

**Related Projects**: [Other roadmap projects that this refactoring supports or unblocks]

[Copy relevant context from roadmap.yaml here for easy reference]

## Current State

[Existing code structure and problems - REQUIRED]

**Problems**:
- [Issue 1 with current implementation]
- [Issue 2 with current implementation]
- [Issue 3 with current implementation]

**Code Location**: `path/to/file.ext:line` or `path/to/directory/`

**Current Behavior**:
[Brief description of how the code currently works]

```language
// Simplified example of current problematic code
// (or reference file path for complex examples)
```

**Why This Needs Refactoring**:
[Specific pain points - hard to test, performance issues, code duplication, unclear logic]

## Proposed Changes

[How to refactor the code - REQUIRED]

**Approach**: [Refactoring strategy - extract functions, simplify logic, apply patterns, reduce coupling]

**Target State**:
[Brief description of how the code will work after refactoring]

```language
// Simplified example of proposed refactored code
// (or reference design doc for complex examples)
```

**Improvements**:
- [Benefit 1 - e.g., "Reduces function complexity from 50 to 15 lines"]
- [Benefit 2 - e.g., "Eliminates 200 lines of code duplication"]
- [Benefit 3 - e.g., "Makes code 10x easier to unit test"]

**Design Decisions**:
- [Key decision 1 and rationale]
- [Key decision 2 and rationale]

## Implementation Plan

[Steps to refactor safely - REQUIRED]

1. **Preparation**: [Set up safety net before refactoring]
   - Ensure existing tests pass
   - Add integration tests if missing
   - Document current behavior
   - Create feature flag (optional)

2. **Refactoring**: [Incremental steps to transform code]
   - Step 1: [First small change]
   - Step 2: [Second small change]
   - Step 3: [Continue incrementally]

3. **Verification**: [Confirm no regressions introduced]
   - Run full test suite after each step
   - Manual testing of critical paths
   - Performance testing (if applicable)

4. **Cleanup**: [Final polish]
   - Remove old code/comments
   - Update documentation
   - Remove feature flag (if used)

## Acceptance Criteria

[When is this refactoring complete - REQUIRED]

- [ ] All planned refactoring changes implemented
  - Verify each step completed
- [ ] Existing tests still pass
  - Run full test suite including integration tests
- [ ] Code behavior unchanged
  - Unless explicitly intended - document any intentional changes
- [ ] Performance not degraded (optional)
  - Or improved if goal - compare benchmarks before/after
- [ ] No new bugs introduced
  - Manual testing of affected code paths
- [ ] `/docs/CHANGELOG.md` updated under "Changed" section (optional)
  - Only if behavior changed, breaking API changes, or significant architecture shifts
- [ ] Code reviewed and approved (optional)
  - Recommended for large refactorings
- [ ] Documentation updated to reflect new structure (optional)
  - Update architecture docs if structure significantly changed

## Testing Strategy

[How to verify refactoring is safe - REQUIRED]

### Pre-Refactoring Baseline
- [ ] All existing tests pass
  - Establish green baseline before starting
- [ ] Performance baseline captured (optional)
  - Use profiling tools for critical paths
- [ ] Manual test scenarios documented (optional)
  - Write down current behavior to verify later

### During Refactoring
- [ ] Tests run after each commit
  - Commit small changes, test frequently
- [ ] Behavior verification at each step
  - Compare output/logs to baseline
- [ ] Code review for each incremental change (optional)
  - Pair programming for complex refactorings

### Post-Refactoring Validation
- [ ] All tests pass
  - Unit, integration, e2e - full test suite must be green
- [ ] Manual test scenarios re-run (optional)
  - Verify documented scenarios match baseline
- [ ] Performance comparison shows no regression (optional)
  - Compare metrics to baseline
- [ ] Code coverage maintained or improved (optional)
  - Run coverage report and compare

## Risk Assessment (optional)

**Potential Risks**:
- Risk 1: [What could go wrong - e.g., "Breaking hidden dependencies"]
- Risk 2: [What could go wrong - e.g., "Performance regression"]

**Mitigation Strategy**:
- [How to minimize risks - feature flags, incremental changes, rollback plan]
- [Monitoring strategy during rollout]

**Rollback Plan**:
[How to quickly revert if issues are discovered in production]

## Performance Impact (optional)

**Current Performance**: [Baseline metrics if relevant]

**Expected Performance**: [Target metrics after refactoring]

**Measurement Approach**: [How to verify performance impact]

## Dependencies & Prerequisites (optional)

**Blocking Dependencies**:
- [Card IDs or external work that must be completed first]

**Code Freeze Considerations**:
- [Any timing constraints - avoid during major releases, etc.]

## Additional Notes (optional)

[Any additional context, questions, or decisions made during refactoring]

**References**:
- Related cards: [Card IDs]
- Design patterns applied: [Pattern names and resources]
- Similar refactorings: [Past examples or case studies]

**Team Communication**:
- [Who needs to be notified of these changes]
- [Any pairing or code review expectations]
