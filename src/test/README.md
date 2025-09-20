# Testing Guide

## Overview

This application uses **Vitest** as the primary testing framework, with separate configurations for unit tests and end-to-end (E2E) tests.

## Test Structure

```
src/test/
├── e2e/                          # End-to-end tests
│   ├── support/                  # E2E test utilities and frameworks
│   │   └── puppeteer-framework.ts   # Puppeteer testing framework
│   └── user-journeys.test.ts     # Complete user workflow tests
├── features/                     # Feature-specific unit tests
├── hooks/                        # React hooks tests
├── providers/                    # Context provider tests
├── utils/                        # Utility function tests
└── setup.ts                      # Test setup and configuration
```

## Test Types

### Unit Tests
- **Framework**: Vitest + React Testing Library
- **Purpose**: Test individual components, hooks, and utilities
- **Location**: `src/test/features/`, `src/test/hooks/`, etc.
- **Run with**: `npm run test:unit`

### Integration Tests  
- **Framework**: Vitest + jsdom
- **Purpose**: Test component integration and user interactions
- **Location**: Mixed with unit tests
- **Run with**: `npm run test:unit` (included)

### End-to-End Tests
- **Framework**: Vitest + Puppeteer
- **Purpose**: Test complete user workflows through real browser
- **Location**: `src/test/e2e/`
- **Run with**: `npm run test:e2e`

## Log Artifacts

- `npm test`, `npm run test:unit`, and any scripted Vitest run write sanitized logs to `test-results/unit/`.
- `npm run test:e2e` writes logs to `test-results/e2e/`.
- Each run updates `latest-log-path.txt`, `latest-raw-log-path.txt`, and `latest-summary.json` pointers for quick access.
- Raw output stays alongside the sanitized log; both are pruned to the latest 10 runs (tune with `TEST_LOG_MAX_HISTORY`).
- Look for `[TEST-RUN-COMPLETE]` or `[E2E-TEST-COMPLETE]` inside the log to confirm completion and find the summary JSON.

## Available Commands

### Running Tests

```bash
# Run all unit tests (default)
npm test
npm run test:unit

# Run unit tests in watch mode
npm run test:unit:watch

# Run E2E tests
npm run test:e2e

# Run E2E tests in watch mode  
npm run test:e2e:watch

# Run E2E tests with UI
npm run test:e2e:ui

# Run all tests (unit + E2E)
npm run test:all

# Run with coverage
npm run test:coverage
```

### Test Development

```bash
# Watch mode for active development
npm run test:unit:watch

# UI mode for interactive testing
npm run test:ui

# E2E UI mode for debugging
npm run test:e2e:ui
```

## E2E Test Requirements

### Prerequisites
- App must be running on `http://127.0.0.1:5175`
- Chrome/Chromium browser installed
- No other E2E test instances running

### Setup
1. Start the development server:
   ```bash
   npm run dev
   ```

2. In another terminal, run E2E tests:
   ```bash
   npm run test:e2e
   ```

## Test Workflow

### For New Features
1. **Write unit tests first** - Test individual components/functions
2. **Add integration tests** - Test component interactions  
3. **Add E2E tests** - Test complete user workflows
4. **Run all tests** - Ensure nothing breaks

### Example Workflow
```bash
# Develop with tests in watch mode
npm run test:unit:watch

# Write E2E tests for new feature
npm run test:e2e:watch

# Final validation
npm run test:all
```

## E2E Test Scenarios

The E2E tests validate these complete user journeys:

1. **Authentication Flow**
   - User login and authentication state
   - User data display and persistence

2. **Deck Management**
   - Create new deck with form validation
   - Navigate to deck view
   - Verify deck appears in list

3. **Card Management**
   - Create multiple cards with different content
   - Verify cards display correctly
   - Test form submission and persistence

4. **Data Operations**
   - Delete cards and verify removal
   - Delete decks and verify cleanup
   - Navigate between views

5. **Application Health**
   - No JavaScript errors
   - Authentication persistence
   - UI responsiveness

## Debugging Tests

### Unit Test Debugging
- Use `console.log()` or debugger statements
- Run specific tests: `npm test -- --run src/path/to/test.test.ts`
- Use VS Code debugger with Vitest extension

### E2E Test Debugging  
- Tests run with visible browser (`headless: false`)
- Screenshots captured at each step in `test-results/screenshots/`
- Detailed logs in `test-results/e2e/`
- Use browser dev tools during test execution

### Common Issues

**E2E Tests Fail to Start**
```
❌ Browser initialization failed
```
- Ensure app is running on correct port
- Check Chrome/Chromium installation
- Verify no other browser automation running

**Authentication Issues**
```
❌ User should be authenticated  
```
- Check if authentication service is working
- Verify user session hasn't expired
- Ensure test environment has proper auth setup

**Form Submission Failures**
```
❌ Submit button should exist and work
```
- Verify form validation is working
- Check submit button event handlers
- Ensure API endpoints are responding

## Best Practices

### Writing Tests
- **Descriptive names**: Test names should explain what they verify
- **Arrange-Act-Assert**: Clear test structure
- **Independent tests**: Each test should be self-contained
- **Cleanup**: Tests should clean up after themselves

### E2E Tests
- **Real user scenarios**: Test actual user workflows
- **Unique test data**: Avoid conflicts between test runs
- **Error handling**: Test both success and failure cases
- **Performance**: Keep tests efficient but thorough

### Maintenance
- **Update selectors**: When UI changes, update test selectors
- **Regular execution**: Run E2E tests regularly, not just on CI
- **Screenshot review**: Check screenshots for UI regression
- **Test data management**: Keep test data isolated and clean

## CI/CD Integration

Tests can be integrated into continuous integration:

```bash
# Install dependencies
npm ci

# Start app in background
npm run dev &
APP_PID=$!

# Wait for app to be ready
sleep 10

# Run all tests
npm run test:all

# Cleanup
kill $APP_PID
```

## Configuration Files

- `vitest.config.ts` - Unit and integration test configuration
- `vitest.e2e.config.ts` - End-to-end test configuration  
- `src/test/setup.ts` - Test environment setup
- `package.json` - Test scripts and dependencies
