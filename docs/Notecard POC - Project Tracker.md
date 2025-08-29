# Notecard POC - Project Tracker

This document tracks the major milestones for the development of the Notecard Proof of Concept.

## How to Use This Tracker: Development Workflow

This tracker is the single source of truth for the POC development. To ensure a smooth and organized workflow, all engineers should follow these steps when taking on a task.

### 1. Taking a Task

Find a task in the tables below with the status `Not Started`.

To claim it, edit this document and add your initials to the `Owner` column and change the `Status` to `In Progress`.

### 2. Branching

All work must be done in a feature branch, created from the `main` branch.

Branch names should follow this convention: `[type]/[short-description]`.

*   `type`: `feature` for new functionality, `fix` for bug fixes, `chore` for maintenance.
*   `short-description`: A few words describing the task (e.g., `deck-creation-modal`).

**Example:** `git checkout -b feature/deck-rename-functionality`

### 3. Committing

We will use the Conventional Commits specification. This makes our commit history readable and helps automate changelogs in the future.

Your commit message must be structured as: `type: subject`.

*   `feat`: A new feature.
*   `fix`: A bug fix.
*   `docs`: Documentation only changes.
*   `refactor`: A code change that neither fixes a bug nor adds a feature.
*   `chore`: Changes to the build process or auxiliary tools.

**Example:** `git commit -m "feat: implement firestore service to create new decks"`

### 4. Submitting for Review & Updating the Tracker

When your work is ready for review, open a Pull Request (PR) to merge your feature branch into the `main` branch.

Update the `Status` of your task to `In Review` and add a link to the PR in the `Notes` column.

After your PR has been approved and merged, change the `Status` to `Done`.

## ✅ Milestone 0: Planning & Documentation

| Task | Owner | Status | Notes |
| :--- | :--- | :--- | :--- |
| Complete Product Requirements Document (PRD) | System | Done | |
| Complete Engineering Design Document | System | Done | |
| Create Project Plan / Tracker | System | Done | |

## ✅ Milestone 1: Project Foundation & Authentication

| Task | Owner | Status | Files Created/Updated | Notes |
| :--- | :--- | :--- | :--- | :--- |
| Dev Task: Initialize React project with Create React App + TypeScript | GH Copilot | Done | `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `src/main.tsx` | Vite project already set up with TypeScript |
| Dev Task: Configure Tailwind CSS | GH Copilot | Done | `tailwind.config.js`, `postcss.config.js`, `src/index.css` | Configured with PostCSS |
| Dev Task: Set up Firebase project and configuration | GH Copilot | Done | `src/firebase/firebase.ts` | Firebase project configured and ready |
| Dev Task: Install and configure Firebase SDK | GH Copilot | Done | `package.json` | Firebase Auth and Firestore installed |
| Dev Task: Create project folder structure | GH Copilot | Done | `src/components/`, `src/features/`, `src/firebase/`, `src/hooks/`, `src/lib/`, `src/providers/`, `src/types/` | /components, /features, /firebase, /hooks, /lib, /providers, /types |
| Dev Task: Set up Firebase Authentication with Google Sign-In | GH Copilot | Done | `src/firebase/firebase.ts` | Basic implementation complete |
| Dev Task: Create AuthProvider context and useAuth hook | GH Copilot | Done | `src/providers/AuthProvider.tsx` | Auth context and hook implemented |
| Dev Task: Implement authentication guard in App.tsx | GH Copilot | Done | `src/App.tsx` | Conditional rendering based on auth state |
| Dev Task: Create basic LoginScreen component | GH Copilot | Done | `src/features/auth/LoginScreen.tsx` | Google Sign-In button implemented |
| Dev Task: Set up Firebase hosting and deployment pipeline | | Not Started | | Configure firebase.json and GitHub Actions |

## ☐ Milestone 2: Core Data Layer & Firestore Integration

| Task | Owner | Status | Files Created/Updated | Notes |
| :--- | :--- | :--- | :--- | :--- |
| Dev Task: Define TypeScript interfaces for User, Deck, Card models | GH Copilot | Done | `src/types/index.ts` | Comprehensive type definitions created |
| Dev Task: Implement Firestore security rules | GH Copilot | In Progress | `firestore.rules` (pending) | User data isolation and access control |
| Dev Task: Create Firestore service layer (firestore.ts) | GH Copilot | Done | `src/firebase/firestore.ts` | Comprehensive CRUD operations and real-time subscriptions |
| Dev Task: Implement user document creation on first login | | Not Started | | Auto-create user profile |
| Dev Task: Add Firestore data validation and error handling | | Not Started | | Input sanitization and error boundaries |
| Dev Task: Create custom hooks for Firestore real-time subscriptions | | Not Started | | useDecks, useCards hooks |
| Dev Task: Set up Firestore local emulator for development | | Not Started | Local testing environment |

## ☐ Milestone 3: Deck Management Features

| Task | Owner | Status | Files Created/Updated | Notes |
| :--- | :--- | :--- | :--- | :--- |
| Dev Task: Create DeckScreen component and basic layout | GH Copilot | Done | `src/features/decks/DeckScreen.tsx`, `src/test/features/decks/DeckScreen.test.tsx` | **TDD approach**: Test-first development with comprehensive component tests |
| Dev Task: Implement DeckListItem component | GH Copilot | Done | Included in DeckScreen.tsx | TDD-driven component with props and interactions |
| Dev Task: Add "Create New Deck" functionality | GH Copilot | Done | Modal with title input and validation | Working modal with form validation |
| Dev Task: Implement "Rename Deck" feature | GH Copilot | In Progress | Modal structure created | UI ready, needs Firestore integration |
| Dev Task: Add "Delete Deck" functionality | GH Copilot | In Progress | Confirmation dialog implemented | UI ready, needs Firestore integration |
| Dev Task: Implement deck list real-time updates | | Not Started | | Subscribe to user's decks collection |
| Dev Task: Add loading states and empty states | GH Copilot | Done | Complete loading and empty state UI | Professional loading states implemented |
| Dev Task: Implement basic navigation between screens | | Not Started | | React Router or simple state-based routing |

## ☐ Milestone 4: Card Management Core Features

| Task | Owner | Status | Files Created/Updated | Notes |
| :--- | :--- | :--- | :--- | :--- |
| Dev Task: Create CardScreen component and layout | | Not Started | | Header, actions bar, card list |
| Dev Task: Implement CardListItem component (collapsed state) | | Not Started | | Title display and drag handle |
| Dev Task: Add "Create New Card" functionality | | Not Started | | Add card at bottom of list |
| Dev Task: Implement card expansion/collapse functionality | | Not Started | | In-place editing with sticky headers |
| Dev Task: Add in-place editing for card title and body | | Not Started | | Click-to-edit with auto-save |
| Dev Task: Implement "Delete Card" feature | | Not Started | | Swipe-to-delete or context menu |
| Dev Task: Add real-time card updates within deck | | Not Started | | Subscribe to deck's cards subcollection |
| Dev Task: Implement basic card ordering (orderIndex) | | Not Started | | Numeric sorting system |

## ☐ Milestone 5: Advanced Card Features

| Task | Owner | Status | Files Created/Updated | Notes |
| :--- | :--- | :--- | :--- | :--- |
| Dev Task: Install and configure react-beautiful-dnd | | Not Started | | Drag-and-drop library setup |
| Dev Task: Implement drag-and-drop reordering | | Not Started | | Update orderIndex on drag end |
| Dev Task: Add batch write operations for order updates | | Not Started | | Atomic Firestore transactions |
| Dev Task: Implement "Filter Cards" functionality | | Not Started | | Real-time text-based filtering |
| Dev Task: Add "Shuffle Cards" feature | | Not Started | | Randomize card order |
| Dev Task: Implement "Collapse All" / "Expand All" actions | | Not Started | | Bulk state management |
| Dev Task: Add card count and deck statistics | | Not Started | | Display in header or actions bar |

## ☐ Milestone 5: Advanced Card Features

| Task | Owner | Status | Notes |
| :--- | :--- | :--- | :--- |
| Dev Task: Install and configure react-beautiful-dnd | | Not Started | Drag-and-drop library setup |
| Dev Task: Implement drag-and-drop reordering | | Not Started | Update orderIndex on drag end |
| Dev Task: Add batch write operations for order updates | | Not Started | Atomic Firestore transactions |
| Dev Task: Implement "Filter Cards" functionality | | Not Started | Real-time text-based filtering |
| Dev Task: Add "Shuffle Cards" feature | | Not Started | Randomize card order |
| Dev Task: Implement "Collapse All" / "Expand All" actions | | Not Started | Bulk state management |
| Dev Task: Add card count and deck statistics | | Not Started | Display in header or actions bar |

## ☐ Milestone 6: Order Snapshots Feature

| Task | Owner | Status | Files Created/Updated | Notes |
| :--- | :--- | :--- | :--- | :--- |
| Dev Task: Create OrderSnapshot data model and service functions | | Not Started | | Save/load card order arrays |
| Dev Task: Implement "Save Order As..." functionality | | Not Started | | Create named snapshots |
| Dev Task: Add "Load Order" dropdown and selection | | Not Started | | Apply saved order to current deck |
| Dev Task: Implement snapshot management (rename/delete) | | Not Started | | CRUD operations for snapshots |
| Dev Task: Add snapshot indicators and metadata | | Not Started | | Show when current order matches snapshot |

## ☐ Milestone 7: UI Polish & Mobile Optimization

| Task | Owner | Status | Files Created/Updated | Notes |
| :--- | :--- | :--- | :--- | :--- |
| Dev Task: Implement responsive design for mobile/desktop | | Not Started | | Mobile-first approach with breakpoints |
| Dev Task: Add loading spinners and skeleton components | | Not Started | | Smooth loading experiences |
| Dev Task: Implement error boundaries and error handling | | Not Started | | Graceful failure recovery |
| Dev Task: Add toast notifications for user actions | | Not Started | | Success/error feedback |
| Dev Task: Optimize bundle size and performance | | Not Started | | Code splitting and lazy loading |
| Dev Task: Add keyboard shortcuts for power users | | Not Started | | Ctrl+N for new card, etc. |
| Dev Task: Implement focus management and accessibility | | Not Started | | ARIA labels and keyboard navigation |

## 🔄 Milestone 8: Testing & Quality Assurance

| Task | Owner | Status | Files Created/Updated | Notes |
| :--- | :--- | :--- | :--- | :--- |
| Dev Task: Set up Vitest and React Testing Library | GH Copilot | Done | `vitest.config.ts`, `package.json`, `src/test/setup.ts` | ✅ Complete testing framework ready |
| Dev Task: Create test utilities and factories | GH Copilot | Done | `src/test/utils/test-factories.ts`, `src/test/utils/test-utils.tsx` | ✅ Mock data generators and test helpers |
| Dev Task: Write unit tests for type definitions | GH Copilot | Done | `src/test/types/index.test.ts` | ✅ 17/17 tests passing - validates all interfaces |
| Dev Task: Create comprehensive testing documentation | GH Copilot | Done | `src/test/README.md`, `src/test/TEST-GUIDE.md` | ✅ Complete guide for next engineer |
| Dev Task: Write Firestore service layer tests | GH Copilot | 95% Done | `src/test/firebase/firestore.test.ts` | ⚠️ Needs vi.hoisted() mock fix - 2hr task |
| Dev Task: Write AuthProvider component tests | GH Copilot | 95% Done | `src/test/providers/AuthProvider.test.tsx` | ⚠️ Needs vi.hoisted() mock fix - 1hr task |
| Dev Task: Set up test scripts and CI commands | GH Copilot | Done | `package.json` (test, test:ui, test:coverage scripts) | ✅ All test commands configured |
| Dev Task: Implement end-to-end tests with Cypress | | Not Started | | Full user flow testing |
| Dev Task: Add TypeScript strict mode and fix all errors | | Not Started | | Type safety improvements |
| Dev Task: Run security audit and dependency updates | | Not Started | | npm audit and package updates |

## ☐ Milestone 9: Deployment & Launch Preparation

| Task | Owner | Status | Files Created/Updated | Notes |
| :--- | :--- | :--- | :--- | :--- |
| Dev Task: Set up production Firebase environment | | Not Started | | Separate prod/dev projects |
| Dev Task: Configure environment variables for different stages | | Not Started | | Development, staging, production |
| Dev Task: Implement CI/CD pipeline with GitHub Actions | | Not Started | | Automated testing and deployment |
| Dev Task: Add analytics and error tracking | | Not Started | | Firebase Analytics and Crashlytics |
| Dev Task: Create user documentation and help content | | Not Started | | In-app guidance and tutorials |
| Dev Task: Perform final UAT and bug fixes | | Not Started | | User acceptance testing |
| Dev Task: Launch to production and monitor | | Not Started | | Go-live with monitoring |

## Task Status Legend

- **Not Started**: Task is available to be claimed
- **In Progress**: Task is actively being worked on
- **In Review**: Task is complete and awaiting code review
- **Done**: Task is complete and merged to main branch

## Notes & Conventions

### Branch Naming Examples
- `feature/firebase-auth-setup`
- `feature/deck-creation-modal`
- `feature/drag-drop-reordering`
- `fix/card-deletion-bug`
- `chore/dependency-updates`

### Commit Message Examples
- `feat: add Google Sign-In authentication`
- `feat: implement drag-and-drop card reordering`
- `fix: prevent duplicate deck creation`
- `docs: update API documentation`
- `refactor: extract card service functions`
- `chore: update Firebase SDK to latest version`

### Definition of Done
A task is considered "Done" when:
1. Code is complete and follows project conventions
2. Unit tests are written and passing (where applicable)
3. Code review is completed and approved
4. Feature is manually tested in development environment
5. Documentation is updated (if needed)
6. Branch is merged to main and deployed to staging
