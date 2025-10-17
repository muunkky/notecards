# Comprehensive Sharing System Test Suite

## Objective
Build robust test coverage for the deck sharing system covering all edge cases, error scenarios, and performance requirements identified during the production debugging.

## Test Coverage Targets

### Unit Tests (90%+ coverage)
- [ ] **`useAccessibleDecks` Hook**
  - [ ] Authentication state transitions (null → user → null)
  - [ ] Empty collaboration arrays handling
  - [ ] Firestore query failures and retries
  - [ ] Subscription cleanup on unmount
  - [ ] Race condition between owned and collaboration queries

- [ ] **`useDecks` Hook** (baseline comparison)
  - [ ] Owned deck queries under various auth states
  - [ ] Error handling and fallback behavior
  - [ ] Performance with large deck collections

- [ ] **Sharing Services**
  - [ ] `invitationService.ts` - invite creation, validation, revocation
  - [ ] `membershipService.ts` - role management, permission checking
  - [ ] `acceptInviteService.ts` - token validation, invite acceptance

### Integration Tests (Firebase Emulator)
- [ ] **Multi-User Collaboration Scenarios**
  - [ ] Owner creates deck → invites collaborator → accepts invitation
  - [ ] Role changes (viewer → editor → removed)
  - [ ] Multiple simultaneous collaborators
  - [ ] Invitation expiry and revocation flows

- [ ] **Firestore Query Integration**
  - [ ] Index availability testing
  - [ ] Composite query performance
  - [ ] Real-time subscription behavior
  - [ ] Network failure simulation

- [ ] **Authentication Integration**
  - [ ] Anonymous auth with sharing
  - [ ] User profile creation on first login
  - [ ] Auth state persistence across sessions

### E2E Tests (Real Browser)
- [ ] **Complete Sharing Workflows**
  - [ ] Share deck → receive email → accept invite → collaborate
  - [ ] Remove collaborator → verify access revoked
  - [ ] Role badge display and permissions enforcement
  - [ ] Share dialog functionality

- [ ] **Error Recovery Scenarios**
  - [ ] Network disconnection during sharing operations
  - [ ] Authentication expiry during collaboration
  - [ ] Browser refresh with pending operations

### Performance Tests
- [ ] **Load Testing**
  - [ ] Deck loading with 100+ collaborations
  - [ ] Query performance with large datasets
  - [ ] Memory usage during long sessions
  - [ ] Subscription cleanup verification

## Test Infrastructure

### Mocking Strategy
```typescript
// Comprehensive Firebase mocks
const mockFirestore = {
  queries: vi.fn(),
  subscriptions: vi.fn(),
  networkFailures: vi.fn()
}

// Authentication state mocking
const mockAuth = {
  signIn: vi.fn(),
  signOut: vi.fn(),
  stateChanges: vi.fn()
}
```

### Test Data Factories
- [ ] **Deck Factories** - Generate decks with various collaboration states
- [ ] **User Factories** - Create test users with different permission levels
- [ ] **Invitation Factories** - Generate invitations in various states
- [ ] **Error Factories** - Simulate different failure scenarios

### Test Utilities
- [ ] **Firebase Emulator Helpers** - Setup/teardown for integration tests
- [ ] **Multi-User Test Helpers** - Simulate multiple authenticated users
- [ ] **Async Test Utilities** - Handle real-time subscription testing
- [ ] **Performance Measurement** - Track query times and memory usage

## Specialized Test Scenarios

### Edge Cases
- [ ] User with 0 owned decks, 0 collaborations
- [ ] User with 100+ owned decks, 100+ collaborations
- [ ] Deck with 1 collaborator vs. 50+ collaborators
- [ ] Rapid role changes and invitations
- [ ] Concurrent modifications by multiple users

### Error Scenarios
- [ ] Firestore index not ready (building state)
- [ ] Network intermittency during queries
- [ ] Authentication token expiry
- [ ] Firestore permission denial
- [ ] Invalid invitation tokens
- [ ] Malformed collaboration data

### Browser Compatibility
- [ ] Chrome, Firefox, Safari, Edge
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)
- [ ] Different screen sizes and orientations
- [ ] Incognito/private browsing modes

## Success Criteria
- [ ] **90%+ test coverage** for all sharing functionality
- [ ] **Zero flaky tests** - all tests pass consistently
- [ ] **Fast test execution** - full suite runs in < 5 minutes
- [ ] **Clear test failure messages** - easy to debug failing tests
- [ ] **CI/CD integration** - tests run on every commit

## Implementation Update

## 🎯 **Critical Update: Working Browser Automation Available**

**Major breakthrough discovered during production debugging (October 2025):**

### **Hybrid Browser Automation Solution**
✅ **Working implementation**: `start-persistent-browser.mjs` 
✅ **Authentication**: Browser service with stealth handles Google OAuth
✅ **Testing**: MCP tools connect to authenticated session (port 9222)
✅ **Validation**: Share buttons confirmed working without permission errors

### **Immediate Implementation Path**
1. **Use existing hybrid approach** from sharing system debugging
2. **Reference documentation**: Card `e4ezss` contains comprehensive guide
3. **Build on proven foundation**: No need to reinvent authentication

### **Test Suite Strategy**
**Authentication Layer**: 
- Use browser service for Google OAuth bypass
- Session persistence in `.browser-session` directory
- Health monitoring keeps browser alive

**Testing Layer**:
- Connect MCP Puppeteer tools to authenticated browser
- Clean automation interface without auth complexity
- Screenshot capture and interaction validation

**Critical Tests to Implement**:
- Share button presence verification
- Share dialog functionality
- Collaborator management workflow  
- Permission error detection
- Cross-browser compatibility

### **Next Developer Notes**
- Review working implementation in sharing system resolution
- Leverage existing stealth configuration and session management
- Focus on test scenarios rather than authentication infrastructure
- Consider CI/CD integration for automated testing

**Priority upgraded due to working foundation being available** 🚀

