# Chore: [Title]

## Description

[What maintenance task needs doing - REQUIRED]

**Type**: [Dependency update / Refactoring / Cleanup / Tooling / Infrastructure]

**Value**: [Why this chore is important - tech debt reduction, security, maintainability]

**Target Users**: [Who benefits from this work - developers, operations, end users]

## Roadmap Reference

**Roadmap Location**: [Path in docs/roadmap.yaml if this relates to milestone work]

**Related Projects**: [Other roadmap projects that this chore supports or unblocks]

[Copy relevant context from roadmap.yaml here for easy reference]

## Task Details

[Specific work to be done - REQUIRED]

[Detailed description of the maintenance task]

**Current State**: [What exists now and why it needs attention]

**Desired State**: [What it should be after this chore is complete]

**Impact if Not Done**: [What happens if we skip this - tech debt, security risk, etc.]

## Implementation Steps

[How to do the chore - REQUIRED]

1. **[Step 1 name]**: [Description]
   - Specific tasks or commands
   - Files to modify
   - Configuration changes needed

2. **[Step 2 name]**: [Description]
   - Dependencies to update
   - Scripts to run
   - Validation steps

3. **[Step 3 name]**: [Description]
   - Final checks
   - Documentation updates
   - Team communication

## Acceptance Criteria

[When is this chore complete - REQUIRED]

- [ ] Changes implemented and tested
  - Verify in test environment first
- [ ] No regressions introduced
  - Run test suite, check affected systems
- [ ] Dependencies updated (optional)
  - Check for breaking changes in release notes
  - Update lockfiles and verify builds
- [ ] Configuration updated (optional)
  - Update config files, env vars, deployment scripts
- [ ] `/docs/CHANGELOG.md` updated under "Changed" section (optional)
  - Only if affects user workflows, requires migration steps, or changes team processes
- [ ] Documentation updated (optional)
  - If workflow/setup/deployment changes - update relevant guides
- [ ] Team notified of changes (optional)
  - Slack announcement if impacts daily workflows

## Verification (optional)

[How to verify the chore is done correctly]

### Testing Steps
- [ ] Run existing tests to ensure no breakage (optional)
  - Execute full test suite
- [ ] Run new validation checks (optional)
  - If applicable: linting, security scans, dependency audits
- [ ] Verify in test environment before production (optional)
  - Deploy to staging/dev and smoke test

### Validation Checks
- [ ] Check 1: [What to verify] (optional)
  - e.g., "All services start successfully"
- [ ] Check 2: [What to verify] (optional)
  - e.g., "Configuration loads without errors"
- [ ] Check 3: [What to verify] (optional)
  - e.g., "Dependencies resolve to expected versions"

## Operational Impact Assessment (optional)

**Does this chore affect operational procedures?** [Yes/No/Maybe]

If yes or maybe, consider:

**Runbook/Playbook Updates**:
- [ ] Update existing runbook (optional)
  - Which runbook: [path to docs/runbooks/existing.md]
  - What changed: [e.g., "New configuration step", "Updated troubleshooting"]
- [ ] No runbook updates needed (optional)
  - Explain why: [e.g., "Internal refactoring only, no operational changes"]

**Operational Documentation**:
- [ ] Configuration changes documented (optional)
  - Where: [docs/operations/ or relevant config guide]
  - What changed: [new settings, deprecated options, migration steps]
- [ ] Update team procedures (optional)
  - Which docs: [deployment guides, setup guides, troubleshooting]

**Reference Documentation**:
- Related runbooks: [paths to docs/runbooks/*.md]
- Related operation guides: [paths to docs/operations/*.md]

## Dependencies & Prerequisites (optional)

**Blocking Dependencies**:
- [Card IDs or external dependencies that must be completed first]

**Required Access**:
- [Credentials, permissions, or infrastructure access needed]

**Tools Needed**:
- [Specific versions or tools required for this work]

## Risk Assessment (optional)

**Potential Risks**:
- Risk 1: [What could go wrong]
- Risk 2: [What could go wrong]

**Mitigation Strategy**:
- [How to minimize risks - backups, rollback plans, testing]

## Additional Notes (optional)

[Any additional context, questions, or decisions made during implementation]

**References**:
- Related cards: [Card IDs]
- External docs: [Links to relevant documentation]
- Similar work: [Past chores or examples]
