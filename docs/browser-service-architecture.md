# Centralized Browser Service Architecture

## Overview

The centralized browser service provides a singleton pattern for managing a persistent browser instance that can be shared across multiple scripts and test runs. This eliminates the need for each script to manage its own browser lifecycle and provides consistent session management.

## Key Benefits

### 🔄 **Session Persistence**
- Automatic cookie and localStorage management
- Authentication state preservation across runs
- Seamless session restoration

### 🚀 **Cross-Script Sharing**
- Single browser instance for all automation needs
- Reduced resource usage and startup time
- Consistent browser state across different operations

### 🥷 **OAuth Bypass**
- Stealth plugin integration for authentication flows
- Persistent user data directory for session continuity
- Manual authentication support with automatic detection

### 📊 **Comprehensive Logging**
- Detailed state tracking and debugging information
- Step-by-step operation logging
- Error context and troubleshooting data

## Architecture Components

### 1. Core Service (`browser-service.mjs`)
```javascript
import browserService from './browser-service.mjs';

// Initialize and get connection
const connection = await browserService.initialize();
const { browser, page, service } = connection;

// Use the browser
await page.goto('https://example.com');

// Keep session alive
await service.close({ keepSession: true });
```

### 2. Test Framework Integration (`puppeteer-test-framework.mjs`)
```javascript
// Automatically uses centralized service
const framework = new PuppeteerTestFramework();
await framework.initialize(); // Uses browserService internally
```

### 3. Utility Scripts
- `browser-service-demo.mjs` - Demonstration and testing
- `quick-screenshot.mjs` - Example utility using the service

## Service API

### Core Methods

#### `initialize(options = {})`
- Initializes browser with stealth configuration
- Loads saved session data
- Returns connection object with `{ browser, page, service }`

#### `navigateToApp()`
- Navigates to notecards app
- Automatically checks authentication status
- Handles session restoration

#### `checkAuthenticationStatus()`
- Multi-method authentication detection
- Firebase auth, user name, and UI element checks
- Returns boolean authentication state

#### `handleAuthentication()`
- Provides manual authentication opportunity
- Waits for user sign-in
- Automatically saves session on success

#### `saveSession()` / `loadSession()`
- Manages cookies and localStorage persistence
- JSON file-based session storage
- Automatic restoration on service restart

#### `healthCheck()`
- Validates browser and page connectivity
- Returns detailed health status
- Includes current URL and authentication state

#### `close(options = {})`
- `keepSession: true` - Keeps browser open for manual use
- `keepSession: false` - Fully closes browser
- Always saves session before closing

## Usage Patterns

### Pattern 1: Quick Automation
```javascript
import browserService from './browser-service.mjs';

async function quickTask() {
  const { page } = await browserService.initialize();
  await browserService.navigateToApp();
  
  // Do your automation
  await page.click('button');
  
  // Keep browser open for other scripts
  await browserService.close({ keepSession: true });
}
```

### Pattern 2: Testing Framework
```javascript
// Framework automatically manages service lifecycle
const framework = new PuppeteerTestFramework();
await framework.initialize(); // Uses service
await framework.runTests();   // Tests run on shared browser
await framework.close({ keepSession: true });
```

### Pattern 3: Multiple Script Coordination
```javascript
// Script A
const { page } = await browserService.initialize();
await browserService.navigateToApp();
// Keep browser open
await browserService.close({ keepSession: true });

// Script B (later)
const { page } = await browserService.initialize(); // Reuses existing
// Browser already at app, session restored
await page.click('something');
```

## File Organization

### Session Data
- `./chrome-session-data/` - Browser user data directory
- `./browser-session-cookies.json` - Saved cookies
- `./browser-session-storage.json` - Saved localStorage

### Screenshots
- `./screenshots/` - Organized screenshot storage
- Automatic directory creation
- Timestamped filenames with descriptive names

### Logs
- `./log/temp/` - Test framework logs (Vitest compatible)
- JSON output format for integration
- Comprehensive operation logging

## Integration with Existing Systems

### Vitest Compatibility
The test framework maintains full compatibility with existing Vitest logging and output formats:

```javascript
// Same logging structure as other tests
./log/temp/puppeteer-test-YYYY-MM-DD-HH-mm-ss.log
```

### Environment Variables
- `PUPPETEER_HEADLESS=true` - Enable headless mode
- `PUPPETEER_KEEP_SESSION=true` - Keep browser open after tests

## Advanced Features

### Lazy Stealth Configuration
- Stealth plugin configured only when needed
- Avoids import-time side effects
- ESM module compatibility

### Automatic Recovery
- Health check system for browser connectivity
- Automatic session restoration
- Graceful error handling

### Chrome Detection
- Multiple path checking for Windows
- Fallback to default Puppeteer Chrome
- Detailed logging of detection process

## Example: Complete Integration

```javascript
import browserService from './browser-service.mjs';

class MyAutomation {
  async run() {
    // Get shared browser instance
    const connection = await browserService.initialize();
    
    // Check if we need authentication
    if (!connection.isAuthenticated) {
      await browserService.handleAuthentication();
    }
    
    // Navigate if needed
    await browserService.navigateToApp();
    
    // Do automation work
    const { page } = connection;
    await page.click('#my-button');
    
    // Take organized screenshot
    await page.screenshot({
      path: './screenshots/my-automation-result.png'
    });
    
    // Keep browser for other scripts
    await browserService.close({ keepSession: true });
  }
}
```

This architecture provides a robust, scalable foundation for browser automation across the entire project while maintaining compatibility with existing systems and providing comprehensive debugging capabilities.
