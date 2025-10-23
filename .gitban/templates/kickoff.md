# Project Kickoff: {{title}}

## 📋 Roadmap Reference

**Feature:** {{feature_id}}
**Project:** {{project_id}}
**Roadmap Path:** {{roadmap_path}}
**Sprint Tag:** {{sprint_tag}}

**Roadmap TDD Spec:**
> {{tdd_spec}}

**Documentation Target:** `{{docs_ref}}`

---

## ✅ Planning Checklist

Complete this checklist before creating implementation cards. Not all items may be required for every project - mark N/A if not applicable.

### 🎯 Design Phase

- [ ] Review roadmap project description, dependencies, and success criteria
- [ ] Identify major decisions requiring ADRs (architecture, tool selection, patterns)
- [ ] Expand TDD spec from roadmap into detailed, testable acceptance criteria
- [ ] Design implementation approach (architecture, components, data flow)
- [ ] Identify technical risks, blockers, and mitigation strategies
- [ ] Review related ADRs and ensure consistency with existing decisions

### 📝 Architecture Decision Records (If Needed)

<!-- Delete this section if no significant architectural decisions required -->

ADRs to write before implementation:

- [ ] ADR-XXX: [Decision topic - e.g., "Terraform state backend selection"]
  - **Context:** [Why this decision is needed]
  - **Options:** [Alternatives considered]
  - **Recommendation:** [Proposed decision]

- [ ] ADR-XXX: [Another decision if needed]

### 📚 Documentation Setup (Docs as Code)

- [ ] Create documentation file(s) at: `{{docs_ref}}`
- [ ] Add documentation outline with standard sections:
  - [ ] Prerequisites
  - [ ] Installation/Setup
  - [ ] Configuration
  - [ ] Usage/How-to
  - [ ] Troubleshooting
  - [ ] References
- [ ] Identify diagrams, screenshots, or code examples needed
- [ ] Decide on documentation type (tutorial, how-to, reference, explanation)

### ✓ TDD Spec Expansion

Expand the high-level roadmap TDD spec into detailed, testable acceptance criteria. Each criterion should be objectively verifiable.

**Roadmap Spec:**
> {{tdd_spec}}

**Detailed Acceptance Criteria:**

- [ ] [Specific testable criterion - e.g., "terraform plan executes without errors"]
- [ ] [Specific testable criterion - e.g., "outputs show exactly 5 resources to create"]
- [ ] [Specific testable criterion - e.g., "state backend configured and accessible"]
- [ ] [Add more criteria as needed]

**How to Verify:**
[Describe how to test/verify each criterion - commands to run, expected outputs, etc.]

### 🏗️ Implementation Design

**Architecture/Approach:**
[Brief design notes - what components/files will be created, how they interact, key patterns used]

**Key Technical Decisions:**
- [Decision 1 - e.g., "Use Terraform Cloud for state management"]
- [Decision 2 - e.g., "Service account authentication via workload identity"]

**Dependencies:**
- [Dependency 1 - e.g., "GCP project must exist and be accessible"]
- [Dependency 2 - e.g., "Terraform Cloud account created"]

**Risks & Mitigations:**
- **Risk:** [What could go wrong]
  **Mitigation:** [How to prevent or handle it]

### 🎯 Sprint Planning

- [ ] Break project into implementation cards (list below with estimated priority)
- [ ] Add prerequisites to cards that have blocking dependencies
- [ ] Estimate effort and sequence cards logically
- [ ] Tag all cards with sprint: `{{sprint_tag}}`
- [ ] Assign owners if known

**Implementation Cards to Create:**

1. [ ] **[P0/P1/P2]** [Card title - e.g., "Set up Terraform Cloud account"]
   - Prerequisites: [If any]
   - Estimate: [S/M/L or hours]

2. [ ] **[Priority]** [Card title]
   - Prerequisites: [If any]
   - Estimate: [Size]

3. [ ] **[Priority]** [Card title - e.g., "Document setup process"]
   - Prerequisites: [Blocks on implementation cards]
   - Estimate: [Size]

---

## 🎉 Kickoff Complete When

- [ ] All planning checklist items completed or marked N/A
- [ ] ADRs written for key architectural decisions
- [ ] Documentation skeleton created with outline
- [ ] TDD acceptance criteria expanded and clear
- [ ] Implementation cards created in backlog with prerequisites
- [ ] Team understands scope, approach, and ready to execute
- [ ] First implementation card ready to move to `todo` status

---

## 📝 Notes

[Add any additional context, questions, or decisions made during kickoff]

---

## 🔗 Related Resources

- Roadmap: `docs/roadmap.yaml` ({{roadmap_path}})
- Feature Documentation: `{{docs_ref}}`
- ADRs: `docs/adrs/`
- Architecture: `docs/architecture/overview.md`
