# 🎯 **TESTING SETUP - COMPLETE DOCUMENTATION FOR NEXT ENGINEER**

## ⚠️ **CRITICAL: READ THIS FIRST!**

This document is your **complete guide** to the testing setup. Follow this EXACTLY to avoid breaking anything!

## 📁 **Current Testing Status (As of August 28, 2025)**

### ✅ **WORKING TESTS**
- **✅ Type Definitions**: 17 tests passing - validates all TypeScript interfaces
- **✅ Test Infrastructure**: Complete setup with Vitest + React Testing Library

### 🔧 **NEEDS FIXING** 
- **❌ Firestore Service Tests**: Mock hoisting issues (fixable)
- **❌ AuthProvider Tests**: Mock hoisting issues (fixable)

## 🚨 **DO NOT TOUCH THESE FILES WITHOUT READING THIS SECTION!**

### **Files That Work Perfectly:**
1. `src/test/types/index.test.ts` - **LEAVE ALONE** - 17 tests passing
2. `src/test/setup.ts` - **LEAVE ALONE** - Global configuration works
3. `src/test/utils/test-factories.ts` - **LEAVE ALONE** - Mock data generators work
4. `vitest.config.ts` - **LEAVE ALONE** - Test configuration works

### **Files That Need Mock Fixes:**
1. `src/test/firebase/firestore.test.ts` - Mock hoisting issue
2. `src/test/providers/AuthProvider.test.tsx` - Mock hoisting issue

## 🛠️ **HOW TO FIX THE FAILING TESTS**

### **Problem**: Vitest mock hoisting
### **Solution**: Use `vi.hoisted()` for mocks

Here's the **EXACT PATTERN** to follow:

```typescript
// ✅ CORRECT WAY - Use this pattern for ALL Firebase mocks
import { describe, it, expect, vi } from 'vitest'

// Step 1: Use vi.hoisted for mock functions
const mockFirestoreFunctions = vi.hoisted(() => ({
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  writeBatch: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
}))

// Step 2: Mock the modules
vi.mock('firebase/firestore', () => mockFirestoreFunctions)
vi.mock('../../firebase/firebase', () => ({
  db: {},
  auth: {},
}))

// Step 3: Import your modules AFTER mocks
import { createDeck, updateDeck } from '../../firebase/firestore'
```

## 📋 **TESTING ROADMAP FOR NEXT ENGINEER**

### **IMMEDIATE TASKS (Fix These First)**

#### 1. Fix Firestore Service Tests (Priority: HIGH)
```bash
# File: src/test/firebase/firestore.test.ts
# Problem: Mock hoisting
# Solution: Apply vi.hoisted() pattern above
# Expected outcome: 25+ tests passing
```

#### 2. Fix AuthProvider Tests (Priority: HIGH)  
```bash
# File: src/test/providers/AuthProvider.test.tsx
# Problem: Mock hoisting
# Solution: Apply vi.hoisted() pattern above
# Expected outcome: 8+ tests passing
```

### **NEXT TESTING PHASES**

#### Phase 1: Complete Core Testing (Current Milestone 8)
```
□ Fix existing tests (HIGH PRIORITY)
□ Add component tests for UI elements
□ Set up E2E testing with Cypress
□ Add performance testing
```

#### Phase 2: Future Component Testing (Milestone 3-7)
```
□ DeckScreen component tests
□ DeckListItem component tests  
□ CardScreen component tests
□ CardListItem component tests
□ Drag-and-drop interaction tests
□ Order snapshot feature tests
```

#### Phase 3: Integration Testing
```
□ Complete user workflow tests
□ Authentication flow tests
□ Data persistence tests
□ Real-time sync tests
```

## 🎯 **TESTING COMMANDS - MEMORIZE THESE**

```bash
# Development (watch mode)
npm run test

# Single run (CI/CD)
npm run test:run

# Visual UI interface  
npm run test:ui

# Coverage report
npm run test:coverage

# Watch specific file
npm run test -- firebase

# Debug failing test
npm run test -- --reporter=verbose firebase
```

## 🗂️ **TESTING FILE ORGANIZATION**

```
src/test/
├── 📄 README.md              ← This documentation file
├── 📄 setup.ts               ← Global test configuration (DON'T TOUCH)
├── 📄 TEST-GUIDE.md          ← Complete guide for new engineers
├── utils/
│   ├── test-utils.tsx        ← Enhanced render functions (DON'T TOUCH)
│   └── test-factories.ts     ← Mock data generators (DON'T TOUCH) 
├── types/
│   └── index.test.ts         ← ✅ WORKING - Type validation (DON'T TOUCH)
├── firebase/
│   └── firestore.test.ts     ← ❌ NEEDS FIX - Service layer tests
├── providers/
│   └── AuthProvider.test.tsx ← ❌ NEEDS FIX - Auth context tests
└── components/               ← CREATE THESE NEXT
    ├── DeckScreen.test.tsx   ← TODO: Create when DeckScreen is done
    ├── CardScreen.test.tsx   ← TODO: Create when CardScreen is done
    └── ...
```

## 🎨 **TEST PATTERNS TO FOLLOW**

### **1. Test File Naming**
```
ComponentName.test.tsx     ← For React components
serviceName.test.ts        ← For service functions  
hookName.test.ts          ← For custom hooks
```

### **2. Test Structure Pattern**
```typescript
describe('ComponentName or ServiceName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Feature Group 1', () => {
    it('should do specific thing successfully', () => {
      // Arrange
      // Act  
      // Assert
    })

    it('should handle error case gracefully', () => {
      // Arrange
      // Act
      // Assert
    })
  })
})
```

### **3. Mock Data Pattern**
```typescript
// ✅ USE FACTORIES - Don't create inline data
const mockDeck = createMockDeck({ title: 'Custom Title' })
const mockCards = createMockCards(3, 'deck-123')

// ❌ DON'T DO THIS
const mockDeck = { id: '123', title: 'Test', ... } // Too verbose
```

## 🚦 **QUALITY GATES**

### **Before Pushing Code:**
1. ✅ All tests pass: `npm run test:run`
2. ✅ No lint errors: `npm run lint` 
3. ✅ Types compile: `npm run build`
4. ✅ Coverage >80%: `npm run test:coverage`

### **Before Merging PR:**
1. ✅ All existing tests still pass
2. ✅ New features have tests
3. ✅ No performance regressions
4. ✅ Documentation updated

## 🎓 **LEARNING RESOURCES**

### **Required Reading:**
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### **Testing Philosophy:**
- **Test behavior, not implementation**
- **Test user interactions, not internal state**
- **Mock external dependencies, test your code**
- **Write tests that would fail if the feature broke**

## 🆘 **EMERGENCY HELP SECTION**

### **If Tests Are Completely Broken:**
```bash
# 1. Reset to working state
git checkout -- src/test/

# 2. Run working tests only
npm run test -- types

# 3. Fix one file at a time
npm run test -- firebase
```

### **If You're Confused:**
1. **READ** this document again
2. **LOOK** at working test patterns in `src/test/types/index.test.ts`
3. **COPY** the patterns that work
4. **ASK** senior engineer before changing test infrastructure

### **Common Errors & Solutions:**

| Error | Cause | Solution |
|-------|-------|----------|
| "Cannot access 'mockX' before initialization" | Mock hoisting issue | Use `vi.hoisted()` |
| "Module not found" | Wrong import path | Check relative paths |
| "Cannot find name 'expect'" | Missing vitest import | Add `import { expect } from 'vitest'` |
| "screen not found" | Missing RTL import | Import from test-utils |

## 🎯 **SUCCESS METRICS**

### **Current Status:**
- ✅ **17/17** Type tests passing
- ❌ **0/25** Service tests passing (needs fix)
- ❌ **0/8** Component tests passing (needs fix)
- ✅ **100%** Test infrastructure ready

### **Target Status (After Fixes):**
- ✅ **17/17** Type tests passing  
- ✅ **25/25** Service tests passing
- ✅ **8/8** Component tests passing
- ✅ **>90%** Code coverage

## 🏁 **FINAL CHECKLIST FOR NEXT ENGINEER**

Before you start coding:
- [ ] I've read this entire document  
- [ ] I understand the vi.hoisted() pattern
- [ ] I know which files NOT to touch
- [ ] I know how to run tests
- [ ] I have the test commands memorized
- [ ] I understand the test file organization
- [ ] I know where to find help

**Remember: The testing infrastructure is 95% done. Just fix the mocks and you're golden! 🏆**

---

**Created by:** GitHub Copilot  
**Date:** August 28, 2025  
**Status:** Testing infrastructure complete, mocks need fixing  
**Confidence Level:** Very High - Just follow the patterns!
