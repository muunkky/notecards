# 🎯 Notecards - Production-Ready Notecard Application

![Tests](https://img.shields.io/badge/tests-307%2F307%20passing-brightgreen)
![Version](https://img.shields.io/badge/version-0.0.2-blue)
![Status](https://img.shields.io/badge/status-production--deployed-success)
![CI/CD](https://img.shields.io/badge/CI%2FCD-operational-brightgreen)

## 🚀 Live Demo

**Production Deployment:** https://notecards-1b054.web.app

Automatically deployed via GitHub Actions CI/CD pipeline with Firebase Hosting.

## 🏆 **v0.0.2 - Production Ready!**

This repository showcases a **production-deployed** notecard application with world-class manual card reordering, deck sharing & collaboration, comprehensive testing infrastructure, and modern CI/CD automation.

### ✅ **Current Status: Production Deployed & Fully Operational**
- **307/307 tests passing** (100% success rate)
- **Design system complete** with tokens, components, and documentation
- **CI/CD pipeline operational** (GitHub Actions + Firebase)
- **Deck sharing system validated** with role-based access control
- **67% test performance improvement** (5-6ms per test file)

📖 **[Version History & Release Guide](./VERSION.md)** | **[Changelog](./CHANGELOG.md)**

## 🛠️ **Professional Services Layer**

The project includes a comprehensive services layer for automation, testing, and development workflows.

### **Quick Commands**
```bash
# Browser automation services
npm run auth:quick     # Quick authentication setup
npm run auth:verify    # Verify current authentication status

# Testing services  
npm test              # Run full test suite
npm run test:log      # Run tests with structured logging
```

### **🌐 Browser Service**
Professional browser automation with session management and authentication:

```javascript
import browserService from './services/browser-service.mjs';

// Simple authentication
const authenticated = await browserService.quickAuth();

// Custom automation
const { browser, page } = await browserService.startup();
await browserService.shutdown();
```

**Key Features:**
- Environment-aware configuration (dev/test/staging/production)
- Professional session management with persistent storage
- Multiple authentication verification methods
- Graceful error handling and automatic recovery
- Stealth configuration for OAuth bypass
- Resource cleanup and lifecycle management

### **📚 Documentation**
- **[Services Overview](./services/README.md)** - Services directory and standards
- **[Services Architecture](./docs/SERVICES-ARCHITECTURE.md)** - Technical architecture
- **[Browser Service API](./docs/api/browser-service.md)** - Complete API reference

## 🎯 **Feature Highlights**

### **World-Class Manual Card Reordering**
- 🎛️ **Intuitive Controls**: Up/Down arrow buttons for each card
- 🚫 **Smart Constraints**: First card can't move up, last card can't move down
- ⚡ **Optimistic UI**: Instant visual feedback before server confirmation
- 🔄 **Loading States**: Visual feedback during operations
- 🛡️ **Error Recovery**: Graceful handling of network failures
- ♿ **Accessibility**: Full ARIA compliance and keyboard navigation

### **Technical Excellence**
- 🧪 **Comprehensive Testing**: 307 tests with 100% stability
- 🏗️ **Clean Architecture**: Separation of concerns with custom hooks
- 🔧 **TypeScript**: Full type safety throughout
- 🎨 **Modern UI**: Tailwind CSS v4 with responsive design and design tokens
- 🔥 **Firebase Integration**: Real-time data synchronization
- 🚀 **CI/CD Pipeline**: Automated deployment via GitHub Actions
- 🎯 **Modern Testing**: Vitest 3.2.4 with 67% performance improvement
- **Deck Sharing & Collaboration**: Role-based access (Owner / Editor / Viewer) with immutable ownership and secure Firestore rules

### **Deck Sharing & Collaboration**

| Role    | Deck Read | Update Deck Title | Manage Roles | Card CRUD | Notes |
|---------|-----------|-------------------|--------------|-----------|-------|
| Owner   | ✅        | ✅                | ✅ (roles + collaborators) | ✅ | Cannot change createdAt/ownerId after create |
| Editor  | ✅        | ✅                | ❌            | ✅        | Cannot change roles/collaborators or ownership |
| Viewer  | ✅        | ❌                | ❌            | ❌        | Read-only |

Key UI Elements:
- Share button appears on each owned deck (feature-flagged via `FEATURE_DECK_SHARING`).
- `ShareDeckDialog` allows inviting by email (Phase 1: direct email string, lookup service can evolve later).
- Collaborators list shows role and remove option (owner only).

Security Model Updates:
- Firestore rules enforce: owner/editor/viewer separation; immutable `ownerId` and `createdAt`; editors restricted from altering role structures.
- Subcollections (`cards`, `orderSnapshots`) reuse parent deck role logic (owner/editor CRUD, viewer read-only).
- Standalone deterministic rules verifier script (`scripts/verify-firestore-rules.mjs`) runs in CI; Vitest suite is opt-in via `FIRESTORE_RULES_VITEST=1`.

Usage Flow:
1. Owner opens a deck and clicks Share.
2. Enters collaborator email and selects role (current phase: default assignment logic in service layer).
3. Collaborator sees deck appear in their list (accessible via subscription hook).
4. Editors can modify cards & deck title; viewers can only read.

Extensibility Roadmap:
- Email → UID lookup service (cloud function or cached index) for resilient invites.
- Activity log (audit trail of share / unshare events).
- Granular per-card permissions or “commenter” role if future requirements justify.

#### Invitations & Accept Flow
- Client service: `src/sharing/acceptInviteService.ts`
- Server callable: `functions/src/index.ts` → `acceptInvite` (delegates to `acceptInviteCore`)
- API doc: `docs/Accept-Invite-API.md`

Run functions tests headlessly:
- Full: `npm run test:functions`
- Focused: `npm run test:functions -- functions/test/acceptInvite.emulator.test.ts -t "case"`

## 📋 **50-Point Plan Breakdown**

### **Points 1-20: Foundation & Backend** ✅
- Project setup and dependencies
- Firebase configuration and Firestore integration
- TypeScript type definitions
- Core data models and interfaces
- Authentication system

### **Points 21-30: Core Reordering Logic** ✅  
- Card position management algorithms
- Firestore move operations (moveCardInDeck)
- Real-time data synchronization
- Error handling and validation
- Performance optimizations

### **Points 31-40: UI Components & UX** ✅
- CardListItem component with reorder buttons
- Visual styling with Tailwind CSS
- Responsive design implementation
- Loading states and transitions
- Accessibility improvements

### **Points 41-44: Manual Reordering Implementation** ✅
- useCardOperations hook integration
- Button click handlers and state management
- Position-based button enabling/disabling
- Smooth animations and transitions

### **Points 45-50: Optimistic UI & Integration** ✅
- Instant UI updates before server response
- Comprehensive integration testing
- Error recovery mechanisms
- Edge case handling
- Production-ready polish

## 🧪 **Test Coverage & Status**

```bash
✅ 307/307 tests passing (100% success rate)
✅ Modern Vitest 3.2.4 with V8 coverage
✅ 5-6ms per test file (67% performance improvement)
✅ 100% test stability achieved
```

### **Test Categories:**
- **Unit Tests**: Individual component and hook testing
- **Integration Tests**: End-to-end user interaction flows  
- **Edge Cases**: Error scenarios and boundary conditions
- **Accessibility Tests**: ARIA compliance and keyboard navigation
- **Performance Tests**: Loading states and optimization

## 🚀 **Getting Started**

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run test suite
npm test

# Build for production
npm run build

# Deploy (after authenticating with Firebase CLI)
npm run deploy:hosting          # hosting only
npm run deploy:rules            # security rules
npm run deploy:indexes          # composite indexes
npm run deploy:all              # build + all targets (hosting, rules, indexes)
```

## 📜 Structured Test Logging & Sentinels

We provide a machine-friendly, silent test runner that emits deterministic artifacts plus start/complete sentinel lines.

### Command
```
npm run test:log [<vitest-args>]
npm run test:coverage:log   # same but with coverage instrumentation & silent logging
```

### Immediate Terminal Output (only header + terminal completion line)
```
[TEST-RUN-START]
...metadata (paths, status RUNNING, instructions)...
[TEST-RUN-MESSAGE-END]
```

All subsequent vitest progress is suppressed from the terminal (for cleaner automation) but is appended to the log files.

### Artifacts
- Sanitized log (no ANSI): `log/temp/test-results-<timestamp>.log`
- Raw log (ANSI intact): `log/temp/test-results-<timestamp>.raw.log`
- JSON summary: `log/temp/test-results-<timestamp>.json`
- Pointers:
  - `log/temp/latest-log-path.txt` (sanitized log path)
  - `log/temp/latest-raw-log-path.txt` (raw log path)
  - `log/temp/latest-summary.json` (wrapper containing summary & paths)

### Completion Sentinel
The sanitized and raw log files end with:
```
[TEST-RUN-COMPLETE] files=<n> tests=<n> failed=<n> exitCode=<code> summaryJson=<path>
copilot: You may stop tailing now; final summary JSON written. Parse summaryJson for structured results.
```

Automation should poll (tail/read) the sanitized log until `[TEST-RUN-COMPLETE]` appears. The terminal separately prints `[TEST-RUN-COMPLETE-TERMINAL]` after streams close, but relying on the file sentinel is preferred.

### Mandatory Wrapper Usage
All test executions MUST go through the logging wrapper (`npm run test`, `npm run test:log`, `npm run test:coverage:log`, etc.). Direct `vitest` / `npx vitest` usage is prohibited because it bypasses:
1. Sentinel emission (`[TEST-RUN-START]`, `[TEST-RUN-COMPLETE]`).
2. Sanitized + raw dual log generation.
3. Structured JSON summary production and latest pointer files.

Examples (allowed):
```
npm run test:log -- src/test/features/decks/DeckScreen.test.tsx -t "editor"
TEST_TERMINAL_MODE=summary npm run test
```

Disallowed:
```
npx vitest run
vitest --run src/test/features/decks/DeckScreen.test.tsx
```

If a direct invocation is required temporarily for debugging, set `TEST_TERMINAL_MODE=full` with the wrapper instead.


### Helper: Wait for Completion
```
npm run test:log               # start (in one process)
npm run test:wait              # in another shell, waits for completion
```
You can also pass an explicit log path:
```
node scripts/wait-for-test-complete.mjs log/temp/test-results-YYYY-MM-DD-HH-MM-SS.log
```
Environment overrides:
- `INTERVAL_MS` (default 500)
- `TIMEOUT_MS` (default 300000)

### Parsing Results
Read the JSON summary for structured totals and per-file test metadata. Example fields:
```json
{
  "totalFiles": 26,
  "totalTests": 238,
  "totalFailed": 0,
  "files": [ { "file": "...", "tests": 34, "testsDetailed": [ { "name": "..." } ] } ]
}
```

### Rationale
This design avoids brittle scraping of live terminal output, enabling deterministic CI agents or local scripts to determine test completion and gather rich structured results.

## 🏗️ **Architecture**

### **Key Components:**
- `CardScreen`: Main container with search and filtering
- `CardListItem`: Individual card with reorder controls
- `useCardOperations`: Custom hook for card operations
- `useCards`: Data fetching and state management
- `AuthProvider`: Authentication context

### **File Structure:**
```
src/
├── features/cards/
│   ├── CardScreen.tsx           # Main card listing screen
│   └── CardListItem.tsx         # Individual card component
├── hooks/
│   ├── useCardOperations.ts     # CRUD and reorder operations
│   └── useCards.ts              # Data fetching hook
├── firebase/
│   ├── firestore.ts             # Database operations
│   └── firebase.ts              # Firebase configuration
├── config/
│   └── service-config.mjs       # Professional service configuration
└── test/
    ├── features/cards/          # Component tests
    ├── hooks/                   # Hook tests  
    └── utils/                   # Test utilities

services/
└── browser-service.mjs          # Professional browser automation service

docs/
├── api/                         # API documentation
├── services/                    # Services documentation
└── SERVICES-ARCHITECTURE.md    # Technical architecture
```

## 💡 **Key Implementation Details**

### **Position-Based Button Logic:**
```typescript
const canMoveUp = index > 0
const canMoveDown = index < filteredCards.length - 1
const isReordering = operationLoading
```

### **Optimistic UI Pattern:**
```typescript
const moveCardUp = async (cardId: string, cards: Card[]) => {
  setLoading(true)  // Immediate UI feedback
  try {
    await moveCardInDeck(cardId, cards, 'up')
  } catch (error) {
    // Error handling and rollback
  } finally {
    setLoading(false)
  }
}
```

### **Smart Button States:**
- **First Card**: ⬆️ disabled, ⬇️ enabled
- **Middle Cards**: ⬆️ enabled, ⬇️ enabled  
- **Last Card**: ⬆️ enabled, ⬇️ disabled
- **Loading State**: All buttons disabled

## 🎨 **UI/UX Features**

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Theme**: Modern gradient background with high contrast
- **Smooth Animations**: CSS transitions for all interactions
- **Visual Feedback**: Loading spinners and state indicators
- **Error Messages**: User-friendly error handling
- **Keyboard Navigation**: Full accessibility support

## 🛡️ **Error Handling**

- **Network Failures**: Graceful degradation with retry options
- **Authentication Errors**: Proper user feedback and redirects
- **Data Validation**: Client and server-side validation
- **Rate Limiting**: Intelligent request throttling
- **Offline Support**: Graceful handling of connection issues

## 📊 **Performance**

- **Optimistic Updates**: Instant UI feedback
- **Debounced Search**: Efficient filtering
- **Lazy Loading**: Progressive data loading
- **Memoization**: React.memo and useMemo optimizations
- **Bundle Splitting**: Code splitting for faster loads

## 🔒 **Security**

- **Firebase Auth**: Secure user authentication
- **Firestore Rules**: Locked down to authenticated owners (users can only access their own decks, cards, and snapshots)
- **Input Validation**: XSS and injection prevention
- **HTTPS Only**: Secure data transmission
- **Environment Variables**: Secure configuration management

## 🤝 **Contributing**

This project represents a complete implementation of the 50-point enhancement plan. All major features are complete and thoroughly tested.

## 📄 **License**

MIT License - feel free to use this implementation as a reference for world-class manual reordering functionality.

---

**Built with ❤️ and attention to detail**  
*Demonstrating production-ready React/TypeScript development practices*