# Bug: [Title]

## Bug Description

**Summary**: [One-sentence description of what's broken]

[Detailed description of the issue - what's happening vs what should happen]

**Severity**: [Critical / High / Medium / Low]

**Impact**: [Who/what is affected - users, systems, data, workflows]

## Steps to Reproduce

1. [First step to trigger the bug]
2. [Second step]
3. [Third step]
4. **Expected**: [What should happen]
5. **Actual**: [What actually happens]

## Environment

**Where this occurs**:
- System: [GCP, local, CI/CD]
- Component: [Terraform, Airbyte, dbt, BigQuery]
- Configuration: [Relevant settings or context]
- Version: [Tool/package versions if relevant]

## Solution

[How to fix the issue - code changes, configuration updates, process changes]

### Fix Approach
[Description of the fix strategy - explain WHAT to change and WHY this fixes the issue]

### Files to Change
- [path/to/file.ext]: [What needs to change - be specific about functions, lines, or config keys]
- [another/file.ext]: [What needs to change - include rationale for the change]
- [test/file.test.ext]: [Add regression test to prevent future occurrences]

## Root Cause Analysis (optional)

[Fill after investigation - why did this happen]

**Code Location**: [File and line number where issue originates]

**Logic Error**: [What went wrong in the code/config]

**Why This Happened**: [Circumstances that caused the bug]

## Testing & Verification

How to verify the fix works:

- [ ] Bug reproduced in current state
  - Confirm you can trigger the bug before fixing
- [ ] Fix applied and tested
  - Verify fix resolves the issue
- [ ] Original issue resolved
  - Test the exact scenario from "Steps to Reproduce"
- [ ] No regressions introduced
  - Run test suite, check related functionality
- [ ] `/docs/CHANGELOG.md` updated under "Fixed" section (optional)
  - Only if user-facing or impacts workflows
  - Include bug description and fix summary
- [ ] Documentation updated (optional)
  - If user-facing behavior changed
  - If workarounds were documented and can now be removed

## Roadmap Impact (optional)

**Related Milestone**: [If this blocks roadmap progress]

**Affected Projects**: [Roadmap projects impacted by this bug]

## Additional Notes

[Any additional context, workarounds, or related issues]

**Workaround** (if available):
[Temporary solution users can apply while awaiting fix]

**Related Issues**:
- [Card IDs of related bugs or features]
