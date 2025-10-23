# Feature: [Title]

## Description

[Clear description of what you're building and why it matters]

**Value Proposition**: [Why this feature is important - user value, business value, technical value]

**Target Users**: [Who will use or benefit from this feature]

## Roadmap Reference

**Roadmap Location**: [Path in docs/roadmap.yaml - e.g., M1 > infra-core > terraform-state-backend]

**Related Projects**: [Other roadmap projects that depend on or relate to this work]

[Copy relevant context from roadmap.yaml here for easy reference]

## Acceptance Criteria

Core requirements that define "done":

- [ ] [Primary functionality criterion - what must work]
- [ ] [User experience criterion - how it should behave]
- [ ] [Quality criterion - performance, security, reliability]
- [ ] Documentation updated in [specify location - e.g., docs/operations/guide.md] (optional)
  - Update user-facing docs if behavior changes
  - Add troubleshooting section for common issues
- [ ] `/docs/CHANGELOG.md` updated under "Added" section
  - Feature description and any breaking changes
- [ ] Tests pass (optional)
  - Run test suite and verify no regressions

**Quality Metrics** (optional):
- [ ] Test coverage: [target percentage or scope]
- [ ] Performance benchmark: [specific metric]

## Implementation Plan

### Approach Overview
[One paragraph summary of how you'll build this - architecture, key decisions, major components]

### Implementation Steps

1. **[Step 1 name]**: [What needs to be done]
   - Specific tasks or sub-steps (break down into small, testable chunks)
   - Files/components to create or modify (list exact file paths when known)
   - Key technical decisions (document why approach chosen over alternatives)

2. **[Step 2 name]**: [Next logical step]
   - How this builds on step 1 (explain dependencies and data flow)
   - Integration points (identify what this connects to - APIs, databases, services)
   - Error handling considerations (plan for failure cases and rollback)

3. **[Step 3 name]**: [Final implementation step]
   - Verification steps (how to manually test this step)
   - Edge cases to handle (unusual inputs, race conditions, boundary conditions)

## Testing Strategy (optional)

[How to verify the feature works correctly]

### Manual Testing
- [ ] [Test scenario 1] (optional)
  - Describe user action and expected result
- [ ] [Test scenario 2] (optional)
  - Test edge cases and error handling
- [ ] [Test scenario 3] (optional)
  - Verify integration with existing features

### Automated Testing (optional)
- [ ] [Unit tests for core logic] (optional)
  - Test functions in isolation with mocks
- [ ] [Integration tests for workflows] (optional)
  - Test end-to-end with real dependencies
- [ ] [Performance tests] (optional)
  - Verify meets performance criteria from acceptance criteria

## Operational Impact Assessment

**Does this feature require operational procedures?** [Yes/No/Maybe]

If yes or maybe, answer these questions:

**Runbook/Playbook Needs**:
- [ ] Create new runbook (optional)
  - If creating: Target path in docs/runbooks/[name].md
  - Runbook should cover: deployment, monitoring, troubleshooting, rollback
- [ ] Update existing runbook (optional)
  - Which runbook: [path to docs/runbooks/existing.md]
  - What sections need updates: [e.g., "Configuration", "Troubleshooting"]
- [ ] No runbook needed (optional)
  - Explain why: [e.g., "No operational procedures required"]

**Operational Documentation**:
- [ ] Configuration guide (optional)
  - Document in: [docs/operations/ or docs/guides/]
  - Cover: how to configure, common settings, environment-specific configs
- [ ] Monitoring/alerting setup (optional)
  - What metrics to monitor: [e.g., "Sync success rate, API errors"]
  - Where documented: [path to monitoring docs]
- [ ] Disaster recovery procedures (optional)
  - Backup procedures, restore procedures, failover steps
  - Document in: [docs/runbooks/disaster-recovery.md or similar]

**Reference Documentation Links**:
- Related runbooks: [paths to existing docs/runbooks/*.md]
- Related operation guides: [paths to existing docs/operations/*.md]
- Dependencies: [other systems/services this depends on for operations]

## Documentation Updates

Files that need updating:

- [ ] `/docs/CHANGELOG.md` updated under "Added" section
  - Feature description and any breaking changes
- [ ] User-facing docs: [path/to/file.md] (optional)
- [ ] Technical docs: [path/to/file.md] (optional)
- [ ] ADRs (if architectural decisions made): [ADR number/title] (optional)
- [ ] README (if usage changes): [what section] (optional)

## Dependencies & Prerequisites (optional)

**Blocking Dependencies**:
- [Card IDs or external dependencies that must be completed first]

**Required Resources**:
- [Access, credentials, tools, or infrastructure needed]

## Additional Notes

[Any additional context, questions, or decisions made during implementation]

**References**:
- Related cards: [Card IDs]
- External docs: [Links to relevant documentation]
- Design docs: [Links to design artifacts]
