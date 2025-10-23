# Documentation Index

Complete documentation for the Notecards production application. All documentation is organized by purpose and audience below.

**Quick Links:**
- 📖 [Project History](./HISTORY.md) | [Product Requirements](./Notecard%20App%20-%20Product%20Requirements%20Document.md)
- 🚀 [Getting Started](#getting-started) | [Setup Guides](#setup-guides)
- 🏗️ [Architecture](#architecture) | [Services](#services)
- 🧪 [Testing](#testing) | [Release Process](#operations--deployment)

---

## 🚀 Getting Started

### New Team Members
1. **[Product Requirements Document](./Notecard%20App%20-%20Product%20Requirements%20Document.md)** - What we're building and why
2. **[Engineering Design Document](./Notecard%20App%20-%20Engineering%20Design%20Document.md)** - How it's architected
3. **[Project History](./HISTORY.md)** - Evolution timeline and decisions
4. **[Project Tracker](./Notecard%20POC%20-%20Project%20Tracker.md)** - Development milestones

### Setup Guides
- **[WSL Git Setup](./setup/wsl-git-setup.md)** - Configure Git for Windows Subsystem for Linux
- **[GitHub CLI Setup](./setup/GITHUB-CLI-SETUP.md)** - Install and configure GitHub CLI
- **[Git Push Instructions](./setup/GIT-PUSH-INSTRUCTIONS.md)** - Repository push workflow
- **[Share Dialog Migration](./setup/share-dialog-migration-guide.md)** - Migrate to new sharing UI

---

## 🏗️ Architecture

### System Architecture
- **[Services Architecture](./SERVICES-ARCHITECTURE.md)** - Overall service layer design
- **[Browser Service Architecture](./Browser-Service-Architecture.md)** - Browser automation design
- **[Services Overview](./services/README.md)** - Service directory and standards

### API Documentation
- **[Browser Service API](./api/browser-service.md)** - Complete API reference for browser automation
- **[Accept Invite API](./Accept-Invite-API.md)** - Invitation acceptance endpoint documentation

---

## 🤝 Deck Sharing & Collaboration

Complete documentation for the deck sharing system with role-based access control.

- **[Sharing System Index](./sharing/README.md)** - Navigation hub for all sharing docs
- **[User Guide](./sharing/user-guide-sharing-collaboration.md)** - How to share decks and collaborate
- **[Developer Guide](./sharing/developer-guide-sharing-system.md)** - Architecture and integration
- **[Troubleshooting Guide](./sharing/troubleshooting-guide-sharing-system.md)** - Issue resolution
- **[Design Specification](./sharing/Deck-Sharing-and-Collaboration.md)** - Original design doc
- **[Invitation System Design](./Invitation-System-Design.md)** - Invitation flow architecture
- **[Short-Term Behavior](./Sharing-Short-Term-Behavior.md)** - Current implementation notes
- **[Merge Guidance](./Deck-Sharing-Merge-Guidance.md)** - Integration instructions

---

## 🧪 Testing

### Test Infrastructure
- **[Testing Best Practices](./testing/TESTING-BEST-PRACTICES.md)** - Standards and patterns
- **[Modern Test Patterns](./testing/MODERN-TEST-PATTERNS.md)** - Updated testing approaches
- **[Infrastructure Modernization Summary](./testing/INFRASTRUCTURE-MODERNIZATION-SUMMARY.md)** - Vitest 3.2.4 migration
- **[Test Output Logging Instructions](./Test-Output-Logging-Instructions.md)** - Structured logging system

### Specialized Testing
- **[E2E User Journey Testing](./testing/E2E-USER-JOURNEY-TESTING.md)** - End-to-end test patterns
- **[Service Account Authentication](./testing/SERVICE-ACCOUNT-AUTHENTICATION.md)** - Firebase service account setup
- **[Firestore Rules Testing](./Firestore-Rules-Testing.md)** - Security rules verification
- **[Test Cleanup Report](./testing/TEST-CLEANUP-REPORT.md)** - Historical test maintenance
- **[Test Backlog](./Test-Backlog.md)** - Pending test work

---

## 🚀 Operations & Deployment

### Release Management
- **[Release Process](./RELEASE-PROCESS.md)** - Version bumping and deployment workflow
- **[Production Smoke Test Checklist](./Production-Smoke-Test-Checklist.md)** - Pre-deployment verification

### Deployment
- **[Deployment Improvements](./Deployment-Improvements.md)** - CI/CD enhancements and optimizations
- **[Branch Finalization Instructions](./Branch-Finalization-Instructions.md)** - Branch cleanup workflow

---

## 📚 Development Guides

### Browser Automation
- **[Browser Automation Final Summary](./Browser-Automation-Final-Summary.md)** - Complete implementation overview
- **[Browser Service API](./api/browser-service.md)** - API reference

### UI Development
- **[UI Improvement Implementation Summary](./UI-Improvement-Implementation-Summary.md)** - UI enhancement history

---

## 📋 Historical Reference

### Archive
See **[Archive Index](./archive/README.md)** for:
- Historical design documents
- Superseded progress tracking
- Legacy audit reports
- Archived sprint summaries

Current archived documents:
- [CSS/HTML Audit Report](./archive/CSS-HTML-Audit-Report.md) (historical)
- [TDD Progress](./archive/TDD-PROGRESS.md) (August 2025)
- [Structured Test Logging System](./archive/Structured-Test-Logging-System.md) (superseded)

### Sprint Retrospectives
See **[sprints/archived/](./sprints/archived/)** for completed sprint summaries:
- [DESIGNSYS Sprint Completion](./sprints/archived/DESIGNSYS-SPRINT-COMPLETION.md)
- [DESIGNSYS Sprint Enhanced Summary](./sprints/archived/DESIGNSYS-SPRINT-ENHANCED-SUMMARY.md)
- [DESIGNSYS Final Summary](./sprints/archived/DESIGNSYS-FINAL-SUMMARY.md)
- [SHAREVALIDATION Sprint Summary](./sprints/archived/SHAREVALIDATION-SPRINT-SUMMARY.md)
- [MCP Testing Implementation](./sprints/archived/MCP-TESTING-IMPLEMENTATION-SUMMARY.md)
- [Next Development Sprint](./sprints/archived/NEXT-DEVELOPMENT-SPRINT.md)

---

## 💬 Team Communications

- **[Final Handoff Summary](./communications/FINAL-HANDOFF-SUMMARY.md)** - August 2025 project handoff
- **[Final Month Handoff](./communications/FINAL-MONTH-HANDOFF-AUGUST-2025.md)** - Monthly summary
- **[Git Workflow and Practices](./communications/GIT-WORKFLOW-AND-PRACTICES.md)** - Team Git standards

---

## 📊 Current Project Status

**Version:** 0.0.2 (October 17, 2025)
**Status:** Production Deployed & Fully Operational
**Tests:** 307/307 passing (100% success rate)
**Deployment:** https://notecards-1b054.web.app

### Recent Milestones
- ✅ Design system complete with tokens and components
- ✅ CI/CD pipeline operational (GitHub Actions + Firebase)
- ✅ Deck sharing system validated with RBAC
- ✅ 67% test performance improvement (5-6ms per test file)
- ✅ Modern testing infrastructure (Vitest 3.2.4 with V8 coverage)

See [CHANGELOG.md](../CHANGELOG.md) for detailed version history.

---

## 🔍 Finding Documentation

### By Topic
- **Sharing/Collaboration:** See [sharing/](./sharing/)
- **Testing:** See [testing/](./testing/)
- **Setup/Configuration:** See [setup/](./setup/)
- **API Reference:** See [api/](./api/)
- **Historical:** See [archive/](./archive/)

### By Audience
- **Product/Business:** [PRD](./Notecard%20App%20-%20Product%20Requirements%20Document.md), [History](./HISTORY.md)
- **Engineers:** [EDD](./Notecard%20App%20-%20Engineering%20Design%20Document.md), [Architecture](./SERVICES-ARCHITECTURE.md)
- **QA/Testing:** [testing/](./testing/), [Smoke Test Checklist](./Production-Smoke-Test-Checklist.md)
- **DevOps:** [Release Process](./RELEASE-PROCESS.md), [Deployment](./Deployment-Improvements.md)
- **End Users:** [Sharing User Guide](./sharing/user-guide-sharing-collaboration.md)

---

## 📝 Documentation Standards

### Active vs Archived
- **Active Documentation:** Maintained and current, located in main docs/ or subdirectories
- **Archived Documentation:** Historical reference only, located in [archive/](./archive/)

### When to Archive
- Documentation superseded by newer versions
- Progress tracking documents after completion
- Sprint summaries after sprint conclusion
- Historical design documents after implementation

### Naming Conventions
- Use kebab-case for multi-word filenames: `modern-test-patterns.md`
- Use ALLCAPS for acronyms in titles: `README.md`, `HISTORY.md`, `PRD.md`
- Use descriptive names that indicate content: `user-guide-sharing-collaboration.md`

---

**Last Updated:** October 23, 2025 (DOCAUDIT sprint)
**Maintainer:** Development Team
**Questions?** See [Project History](./HISTORY.md) or team communications in [communications/](./communications/)
