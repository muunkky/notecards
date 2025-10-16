# Testing Best Practices & Guidelines

## Overview
This document outlines testing standards, best practices, and maintenance procedures for the notecards application test suite. This is part of our quarterly test maintenance (TESTMAINT sprint) to ensure high-quality, maintainable, and efficient testing.

## Test Architecture

### Test Categories
1. **Unit Tests** - Individual functions, components, and services
2. **Integration Tests** - Service interactions and data flow
3. **E2E Tests** - Complete user journeys and workflows
4. **Performance Tests** - Load testing and optimization validation
5. **Security Tests** - Authentication, authorization, and data protection

### Test Infrastructure Stack
- **Test Runner**: Vitest 3.2.4
- **Testing Library**: React Testing Library  
- **Mocking**: Vitest native mocking
- **E2E Framework**: Puppeteer with custom framework
- **Firebase**: Emulator suite for integration tests
- **Coverage**: Built-in Vitest coverage

## Best Practices

### 1. Test Structure & Organization
```
src/test/
├── debug/           # Debugging tests (temporary)
├── e2e/             # End-to-end tests
├── features/        # Feature-specific component tests
├── hooks/           # Custom hook tests  
├── regression/      # Regression prevention tests
├── sharing/         # Sharing system tests
├── utils/           # Test utilities and factories
└── setup.ts         # Global test configuration
```

### 2. Test Naming Conventions
- **Files**: `ComponentName.test.tsx` or `serviceName.test.ts`
- **Describe blocks**: Use descriptive feature names
- **Test cases**: Use "should" statements describing expected behavior

```typescript
describe('CardScreen', () => {
  describe('when editing a card', () => {
    it('should update card content when form is submitted', async () => {
      // Test implementation
    })
  })
})
```

### 3. Writing Quality Tests

#### Test Isolation
- Each test should be independent and not rely on other tests
- Use proper cleanup in `afterEach` hooks
- Mock external dependencies consistently

#### Async Testing
- Always use `waitFor` for async operations with reasonable timeouts
- Avoid arbitrary delays - wait for specific conditions
- Handle promises properly with async/await

```typescript
// ✅ Good - Wait for specific condition
await waitFor(() => {
  expect(screen.getByText('Updated content')).toBeInTheDocument()
}, { timeout: 5000 })

// ❌ Bad - Arbitrary delay
await new Promise(resolve => setTimeout(resolve, 1000))
```

#### Mock Strategy
- Mock external services (Firebase, APIs) at module level
- Use realistic mock data that matches production data shapes
- Reset mocks between tests to prevent state leakage

### 4. Coverage Guidelines
- **Minimum coverage**: 80% overall
- **Critical paths**: 95% coverage for core features
- **Focus areas**: Business logic, user interactions, error handling
- **Exclude**: Configuration files, test utilities, type definitions

### 5. Performance Standards
- **Unit tests**: Complete within 10ms each
- **Integration tests**: Complete within 100ms each  
- **E2E tests**: Complete within 30 seconds each
- **Full suite**: Complete within 2 minutes

## Common Anti-Patterns to Avoid

### 1. Redundant Tests
```typescript
// ❌ Redundant - Testing same logic multiple ways
it('should have length 3', () => {
  expect(array.length).toBe(3)
})
it('should have exactly 3 items', () => {
  expect(array).toHaveLength(3)
})
```

### 2. Tautological Tests
```typescript
// ❌ Tautological - Testing implementation details
it('should call setState with new value', () => {
  const setState = vi.fn()
  component.handleChange('new value')
  expect(setState).toHaveBeenCalledWith('new value')
})
```

### 3. Flaky Tests
- Tests that pass/fail inconsistently
- Usually caused by timing issues or shared state
- Fix by improving test isolation and async handling

### 4. Brittle Tests
- Tests that break with minor UI changes
- Over-reliance on implementation details
- Fixed by testing behavior, not implementation

## Test Maintenance Procedures

### Quarterly Health Review
1. **Coverage Analysis** - Identify gaps and redundancies
2. **Performance Audit** - Remove slow or inefficient tests
3. **Flaky Test Resolution** - Fix intermittent failures
4. **Documentation Update** - Keep guidelines current
5. **Tool Updates** - Upgrade testing dependencies

### When to Remove Tests
- Duplicate coverage of same functionality
- Testing implementation details instead of behavior
- Overly complex tests that are hard to maintain
- Tests for removed features

### When to Add Tests
- New features or bug fixes
- Critical paths lacking coverage
- Edge cases discovered in production
- Performance regression prevention

## Debugging Failed Tests

### 1. Local Debugging
```bash
# Run specific test file
npx vitest run src/test/features/cards/CardScreen.test.tsx

# Run with debug output
DEBUG=* npx vitest run

# Run single test
npx vitest run -t "should update card when form is submitted"
```

### 2. CI/CD Debugging
- Check test artifacts in `test-results/`
- Review coverage reports in `coverage/`
- Examine screenshots for E2E failures

### 3. Common Issues
- **Firebase mock conflicts**: Check setup.ts for proper mocking
- **React state cleanup**: Ensure proper afterEach cleanup
- **Timing issues**: Use waitFor instead of setTimeout
- **Memory leaks**: Check for unresolved promises

## Tools & Scripts

### Available Commands
```bash
npm test                    # Full test suite
npm run test:unit          # Unit tests only
npm run test:e2e           # E2E tests only
npm run test:coverage      # Tests with coverage
npm run test:watch         # Watch mode
```

### Useful Utilities
- `src/test/utils/test-factories.ts` - Mock data factories
- `src/test/setup.ts` - Global test configuration
- `scripts/run-tests-log.mjs` - Test logging and reporting

## Security Testing

### Authentication Tests
- Test login/logout flows
- Verify session management
- Check unauthorized access prevention

### Data Protection Tests  
- Validate user data isolation
- Test permission enforcement
- Verify sensitive data handling

### Firebase Security Rules Tests
- Use `RULES_TESTS=true` environment variable
- Test against real Firestore emulator
- Validate read/write permissions

## Continuous Improvement

### Metrics to Track
- Test execution time trends
- Coverage percentages over time
- Flaky test frequency
- Test maintenance overhead

### Regular Reviews
- Monthly: Review flaky tests and performance
- Quarterly: Comprehensive test suite health review
- Annually: Major tool and framework updates

## Contributing to Tests

### Before Adding Tests
1. Check if functionality is already covered
2. Consider if behavior testing is more appropriate than implementation testing
3. Ensure test adds real value and isn't just increasing coverage numbers

### Test Review Checklist
- [ ] Test is properly isolated
- [ ] Async operations use waitFor with timeouts
- [ ] Mocks are realistic and reset between tests
- [ ] Test name clearly describes expected behavior
- [ ] Test focuses on behavior, not implementation
- [ ] Test runs quickly and consistently

---

*This document is maintained as part of the TESTMAINT sprint quarterly reviews. Last updated: October 2025*