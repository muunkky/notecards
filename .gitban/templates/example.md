# Gitban Template Schema & Examples

**Purpose**: This is the authoritative guide for creating card templates.
Read this to understand template design principles, then create your
own templates in `.gitban/templates/{card_type}.md`.

**For LLMs**: When asked "create a {type} template", read this example
and adapt the patterns to the specific card type requirements.

---

## Template Design Principles

### Core Philosophy

**Keep 3-6 sections REQUIRED, mark the rest as `(optional)`**

- **Required** = truly essential to understand/complete the work
- **Optional** = best practices, nice-to-haves, advanced scenarios
- Include freeform section at end for project-specific content
- Structure guides but doesn't constrain

### Validation Rules

Templates are validated to ensure structure with consistent `(optional)` marking:

1. **Section headings**: All `## Headings` required unless marked `## Heading (optional)`
2. **Checkboxes**: All `- [ ] Task` required unless marked `- [ ] Task (optional)`
3. **Table columns**: All `| Column |` required unless marked `| Column (optional) |`

**Validation philosophy**: Structure guides but doesn't constrain. Mark things optional liberally - aim for 3-6 required elements in each category.

**Two-level (optional) marking**:
- **Section-level**: `## Section (optional)` excludes ALL content in that section
- **Item-level**: `- [ ] Task (optional)` or `| Column (optional) |` excludes specific items

This gives maximum flexibility - mix required and optional items within the same section!

**Examples**:
```markdown
## Bug Description          ← Required section
## Impact Assessment (optional)   ← Optional section (all content skipped)

### Within a required section:
- [ ] Reproduce the bug      ← Required checkbox
- [ ] Write regression test (optional)   ← Optional checkbox

| Step | Expected | Actual | Screenshot (optional) |   ← Last column optional
```

---

## Common Card Type Patterns

### Bug Template Pattern

```markdown
## Bug Description
[What's broken - REQUIRED]

**Summary**: Brief one-liner of the bug

[Clear description of the bug and what's broken]

## Steps to Reproduce
[How to trigger the bug - REQUIRED]

1. Step one
2. Step two
3. Expected vs Actual result

## Environment
[Where it happens - REQUIRED]

- OS: [Operating system]
- Browser/Version: [If applicable]
- Configuration: [Relevant settings]

## Solution
[How to fix it - REQUIRED]

[Describe the fix approach and changes needed]

## Impact Assessment (optional)
[Who's affected, severity, urgency]

### User Impact
- Affected users: [Scope of impact]
- Frequency: [How often this occurs]
- Workaround: [If available]

## Root Cause Analysis (optional)
[Why it happened - fill after investigation]

- Code location: [File and line]
- Logic error: [What went wrong]
- Why this happens: [Circumstances]

## Testing & Verification (optional)
[How to verify the fix works]

- [ ] Bug reproduced in current version
- [ ] Fix verified in test environment
- [ ] Regression tests pass
- [ ] No new bugs introduced (optional)

## Additional Notes (optional)
📝 FREEFORM SECTION - Add anything project-specific
```

**Required sections**: Bug Description, Steps to Reproduce, Environment, Solution
**Optional sections**: Impact Assessment, Root Cause Analysis, Testing & Verification, Additional Notes

---

### Feature Template Pattern

```markdown
## Description
[What you're building - REQUIRED]

[Clear description of the feature and its purpose]

**Value**: [Why this feature matters]

**Target Users**: [Who will use this]

## Acceptance Criteria
[Success criteria - REQUIRED]

- [ ] Core functionality criterion 1
- [ ] Core functionality criterion 2
- [ ] User experience criterion
- [ ] Performance criterion (optional)
- [ ] Security criterion (optional)

**Quality Metrics** (if applicable):
- [ ] Test coverage: >90% (optional)
- [ ] Performance benchmark met (optional)

## Implementation Plan
[How to build it - REQUIRED]

### Overview
[One paragraph summary of approach]

### Implementation Steps

1. **Step 1**: [Description]
   - Sub-task or detail
   - Code changes needed

2. **Step 2**: [Description]
   - Integration points
   - Data flow

3. **Step 3**: [Description]
   - Error handling
   - Edge cases

## Testing Strategy (optional)
[How to test the feature]

### Unit Tests
- [ ] Test core logic
- [ ] Test edge cases

### Integration Tests
- [ ] Test with dependencies
- [ ] Test user workflows

## Documentation Updates (optional)
[What docs need updating]

- [ ] User documentation
- [ ] API documentation (optional)
- [ ] Architecture diagrams (optional)

## Additional Notes (optional)
📝 FREEFORM SECTION - Add anything project-specific
```

**Required sections**: Description, Acceptance Criteria, Implementation Plan
**Optional sections**: Testing Strategy, Documentation Updates, Additional Notes

---

### Docs Template Pattern

```markdown
## Location
[Where the docs will be created/updated - REQUIRED]

**File Path**: `path/to/file.md`

**Related Files**:
- `file1`: [Relationship]
- `file2`: [Relationship]

## Documentation Goal
[What needs to be documented and why - REQUIRED]

**Purpose**: [Primary purpose - onboarding, troubleshooting, reference]

**Problem Being Solved**: [What gap this fills]

## Audience
[Who will read this - REQUIRED]

**Primary Audience**: [Role and experience level]

### Audience Characteristics
- Role: [Developer, user, admin]
- Experience: [Beginner, intermediate, advanced]
- Goals: [What they're trying to accomplish]

## Scope
[What topics this covers - REQUIRED]

- [ ] Topic 1: [Description]
- [ ] Topic 2: [Description]
- [ ] Topic 3: [Description]

### In Scope
[Explicitly state what's included]

### Out of Scope
[Explicitly state what's NOT included]

## Documentation Type (Diátaxis)
[Documentation type - REQUIRED]

- [ ] **Tutorial** (learning-oriented) - Step-by-step lessons
- [ ] **How-To Guide** (task-oriented) - Solve specific problems
- [ ] **Reference** (information-oriented) - Technical descriptions
- [ ] **Explanation** (understanding-oriented) - Concepts and design

## Acceptance Criteria
[When docs are complete - REQUIRED]

- [ ] All in-scope topics covered
- [ ] Code examples tested and working
- [ ] Clear, concise writing
- [ ] Proper grammar and formatting
- [ ] Cross-references to related docs

## Additional Notes (optional)
📝 FREEFORM SECTION - Add anything project-specific
```

**Required sections**: Location, Documentation Goal, Audience, Scope, Documentation Type, Acceptance Criteria
**Optional sections**: Additional Notes, plus various subsections

---

### Test Template Pattern

```markdown
## Test Description
[What's being tested - REQUIRED]

**Test Type**: [Unit / Integration / E2E / Performance]

**Coverage**: [What functionality this covers]

## Test Scenarios
[Specific test cases - REQUIRED]

### Scenario 1: [Name]
- **Given**: [Initial state]
- **When**: [Action taken]
- **Then**: [Expected result]

### Scenario 2: [Name]
- **Given**: [Initial state]
- **When**: [Action taken]
- **Then**: [Expected result]

## Implementation Plan
[How to implement tests - REQUIRED]

1. **Setup**: [Test fixtures and prerequisites]
2. **Test cases**: [Specific tests to write]
3. **Assertions**: [What to verify]
4. **Cleanup**: [Teardown steps]

## Test Data
[Data needed for tests - REQUIRED]

- Sample data: [Fixtures]
- Edge cases: [Boundary conditions]
- Invalid inputs: [Error cases]

## Acceptance Criteria (optional)
[When tests are complete]

- [ ] All scenarios covered
- [ ] Tests pass consistently
- [ ] Edge cases tested
- [ ] Good test coverage (optional)

## Additional Notes (optional)
📝 FREEFORM SECTION - Add anything project-specific
```

**Required sections**: Test Description, Test Scenarios, Implementation Plan, Test Data
**Optional sections**: Acceptance Criteria, Additional Notes

---

### Chore Template Pattern

```markdown
## Description
[What maintenance task needs doing - REQUIRED]

**Type**: [Dependency update / Refactoring / Cleanup / Tooling]

**Value**: [Why this chore is important]

## Task Details
[Specific work to be done - REQUIRED]

[Detailed description of the chore]

**Current State**: [What exists now]

**Desired State**: [What it should be]

## Implementation Steps
[How to do the chore - REQUIRED]

1. **Step 1**: [Description]
2. **Step 2**: [Description]
3. **Step 3**: [Description]

## Verification (optional)
[How to verify it's done correctly]

- [ ] Changes tested
- [ ] No regressions introduced
- [ ] Documentation updated (optional)

## Additional Notes (optional)
📝 FREEFORM SECTION - Add anything project-specific
```

**Required sections**: Description, Task Details, Implementation Steps
**Optional sections**: Verification, Additional Notes

---

### Refactor Template Pattern

```markdown
## Description
[What code is being refactored and why - REQUIRED]

**Motivation**: [Why refactor this code]

**Benefits**: [Improved maintainability, performance, readability]

## Current State
[Existing code structure - REQUIRED]

**Problems**:
- [Issue 1]
- [Issue 2]

**Code location**: `path/to/file:line`

```language
// Current problematic code
```

## Proposed Changes
[How to refactor - REQUIRED]

**Approach**: [Refactoring strategy]

```language
// Proposed refactored code
```

**Improvements**:
- [Benefit 1]
- [Benefit 2]

## Implementation Plan
[Steps to refactor - REQUIRED]

1. **Preparation**: [Tests to ensure behavior preserved]
2. **Refactoring**: [Incremental steps]
3. **Verification**: [How to confirm no regressions]

## Testing Strategy (optional)
[How to verify refactoring is safe]

- [ ] Existing tests pass
- [ ] Behavior unchanged
- [ ] Performance not degraded (optional)

## Additional Notes (optional)
📝 FREEFORM SECTION - Add anything project-specific
```

**Required sections**: Description, Current State, Proposed Changes, Implementation Plan
**Optional sections**: Testing Strategy, Additional Notes

---

## How to Create Your Templates

1. **Read this example.md file** to understand principles
2. **Create `.gitban/templates/{card_type}.md`** (e.g., bug.md, feature.md, security.md)
3. **Copy relevant patterns** from examples above
4. **Customize for your project's needs**
5. **Mark sections `(optional)` appropriately** (aim for 3-6 required)
6. **Add a freeform section at the end** for project-specific content

### Tips for Good Templates

- **Start minimal**: 3-4 required sections, expand later if needed
- **Mark liberally**: When in doubt, mark it `(optional)`
- **Include examples**: Show users what good content looks like
- **Use placeholders**: `{{variable}}` for values to be filled in
- **Add freeform section**: Always include `## Additional Notes (optional)` at end
- **Test with strict mode**: Create a card and see if validation feels right

---

## Extending with New Card Types

Want to add `security.md`, `epic.md`, `spike.md`, or custom types?

1. **Read this example.md for patterns**
2. **Create `.gitban/templates/{new_type}.md`**
3. **Follow the core principles** (3-6 required sections)
4. **Use consistent (optional) marking**
5. **No package updates needed!**

### Example: Creating a Security Card Template

```markdown
## Security Issue
[Description of the security concern - REQUIRED]

**Severity**: [Critical / High / Medium / Low]

**CWE/CVE**: [Reference if applicable]

## Impact
[Who/what is affected - REQUIRED]

- Affected systems: [List]
- Data at risk: [What data]
- Attack vector: [How exploited]

## Remediation
[How to fix - REQUIRED]

1. Immediate mitigation steps
2. Long-term fix
3. Verification steps

## Testing (optional)
[How to verify the fix]

- [ ] Vulnerability no longer exploitable
- [ ] Security scan passes

## Additional Notes (optional)
📝 FREEFORM SECTION - Add anything project-specific
```

---

## Template Validation Philosophy

**"Document reality, not theory"**

Templates should guide users toward complete, well-structured cards without
being prescriptive. The `(optional)` pattern gives teams flexibility to:

- **Adapt to project needs**: Different projects need different structures
- **Balance guidance and freedom**: Required sections guide, optional sections suggest
- **Evolve over time**: Start simple, add optional sections as needs grow
- **Support multiple workflows**: Same template works for various team processes

**Validation in action**:
- **Strict mode**: Enforces required elements, blocks card creation if missing
- **Advisory mode**: Warns about missing elements, allows card creation
- **None mode**: No validation, complete freedom

Teams can configure validation per card type to match their workflow.

---

## Questions?

- **"How many sections should be required?"** → 3-6 is ideal
- **"Can I have more than 6 required sections?"** → Yes, but consider if they're truly required
- **"Should I mark checkboxes optional?"** → Mark quality metrics and nice-to-haves as optional
- **"Can I create custom card types?"** → Absolutely! Just create the template file
- **"Do I need to update the package?"** → No! Templates are workspace-only

---

## Design Decisions

### Why workspace-only templates?
- Full user control over template content
- No version conflicts with package updates
- Easy to share team templates via git
- Encourages project-specific customization

### Why single example.md instead of per-type?
- Easier maintenance (one file to update)
- Teaches principles, not just patterns
- Allows infinite extensibility
- Reduces coupling between package and workflow

### Why no built-in fallbacks?
- Forces conscious adoption (you understand your templates)
- Prevents surprise behavior changes
- Simpler mental model: workspace = source of truth

---

**Ready to create your first template?**

1. Run `restore_template_example()` to get this file in your workspace
2. Read through the patterns above
3. Create `.gitban/templates/{card_type}.md`
4. Test with strict validation enabled
5. Iterate based on team feedback

Happy template creating! 🎨
