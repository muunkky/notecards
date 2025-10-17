# Services Documentation

## Overview

The services layer provides professional automation and testing capabilities for the notecards application. All services follow industry-standard patterns with proper error handling, logging, and resource management.

## Available Services

### 🌐 Browser Service
**Location:** `services/browser-service.mjs`  
**Purpose:** Professional browser automation with session management and authentication

- **Features:** Environment-aware configuration, stealth mode, session persistence
- **Use Cases:** Authentication, testing, automation, screenshot capture
- **API:** Simple methods like `quickAuth()`, `verifyAuthentication()`, `startup()`, `shutdown()`

[📖 Full API Documentation](./api/browser-service.md)

## Service Architecture

### Design Principles

1. **Singleton Pattern**: Services use singleton pattern to prevent resource conflicts
2. **Configuration-Driven**: Behavior adapts based on environment (dev/test/staging/prod)
3. **Professional Error Handling**: Comprehensive error recovery and logging
4. **Resource Management**: Proper cleanup and lifecycle management
5. **Simple APIs**: Easy-to-use methods for common operations

### Service Configuration

Services use the configuration system in `src/config/service-config.mjs`:

```javascript
import { createBrowserConfig, SERVICE_TYPE } from '../src/config/service-config.mjs';

const config = createBrowserConfig('development');
```

**Configuration Features:**
- Environment detection and adaptation
- Professional Chrome arguments and stealth settings
- Configurable timeouts and retry logic
- Path management for session data and screenshots

### Session Management

All services that maintain state use professional session management:

**Session Storage Locations:**
- `.browser-session/cookies.json` - HTTP cookies
- `.browser-session/storage.json` - localStorage data  
- `.browser-session/chrome-data/` - Chrome user data directory

**Session Features:**
- Automatic save/restore across service restarts
- Cross-domain session handling
- Corruption detection and recovery
- Environment-specific session isolation

## Quick Start Guide

### Using Browser Service

```javascript
import browserService from './services/browser-service.mjs';

// Quick authentication (most common)
const authenticated = await browserService.quickAuth();

// Verify auth status
const isAuth = await browserService.verifyAuthentication();

// Custom automation
const { browser, page } = await browserService.startup();
await page.goto('https://example.com');
await browserService.shutdown();
```

### NPM Scripts Integration

Services are integrated with npm scripts for easy CLI usage:

```bash
# Browser service authentication
npm run auth:quick     # Quick authentication setup
npm run auth:verify    # Verify current authentication status
```

## Integration Patterns

### Testing Integration

```javascript
// Test setup with service
describe('App Tests', () => {
  beforeAll(async () => {
    await browserService.startup();
  });
  
  afterAll(async () => {
    await browserService.shutdown();
  });
  
  test('should work', async () => {
    const { page } = browserService.getBrowser();
    // Test logic here
  });
});
```

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Verify Authentication
  run: npm run auth:verify
  
- name: Run Browser Tests  
  run: |
    npm run auth:quick
    npm test
```

### Development Workflow

```javascript
// Development script
async function developmentTask() {
  try {
    // Quick setup
    const ready = await browserService.startup({ checkAuth: true });
    
    if (!ready.authenticated) {
      await browserService.quickAuth();
    }
    
    // Development work
    const { page } = browserService.getBrowser();
    // ... automation code
    
  } finally {
    await browserService.shutdown();
  }
}
```

## Environment Configuration

Services automatically adapt to different environments:

### Development Environment
- Target: `http://127.0.0.1:5175`
- Authentication: Required (Google OAuth)
- Headless: False (visible browser)
- Session: Persistent across restarts

### Test Environment  
- Target: Configurable test URLs
- Authentication: Configurable (can be disabled)
- Headless: Configurable
- Session: Isolated test sessions

### Production Environment
- Target: `https://notecards-1b054.web.app`
- Authentication: Required
- Headless: True (server environments)
- Session: Production session management

## Error Handling

### Service-Level Error Handling

All services implement professional error handling:

```javascript
try {
  const result = await browserService.quickAuth();
  return result;
} catch (error) {
  console.error('Service error:', error.message);
  // Service implements automatic recovery
  return false;
}
```

### Error Categories

1. **Initialization Errors**: Browser startup, configuration issues
2. **Authentication Errors**: OAuth failures, session corruption  
3. **Network Errors**: Connection failures, timeouts
4. **Resource Errors**: File system, permission issues

### Recovery Strategies

- **Automatic Retry**: Services retry failed operations with exponential backoff
- **Session Recovery**: Automatic session cleanup and regeneration
- **Graceful Degradation**: Fallback to manual processes when automation fails
- **Resource Cleanup**: Always clean up resources even after errors

## Logging and Monitoring

### Service Logging

Services provide comprehensive logging:

```
🔍 Universal Browser Service Initialize called
🚀 Initializing Universal Browser Service...
✅ Stealth plugin configured with working auth-setup configuration
✅ Found Chrome at: C:\Program Files\Google\Chrome\Application\chrome.exe
🔍 Authentication: ✅ Authenticated (3/4 checks passed)
✅ Browser closed
```

### Log Levels

- **🔍 Debug**: Detailed operation tracking
- **✅ Success**: Successful operations
- **⚠️ Warning**: Non-fatal issues
- **❌ Error**: Fatal errors requiring attention

### Monitoring Integration

Services are designed for monitoring integration:

```javascript
// Health check example
const isHealthy = browserService.isReady();
const authStatus = await browserService.verifyAuthentication();

// Metrics for monitoring
const metrics = {
  serviceReady: isHealthy,
  authenticated: authStatus,
  timestamp: new Date().toISOString()
};
```

## Best Practices

### 1. Resource Management

```javascript
// Always use try/finally for cleanup
try {
  await service.startup();
  // Work here
} finally {
  await service.shutdown(); // Always clean up
}
```

### 2. Error Handling

```javascript
// Handle service errors gracefully
const result = await service.quickAuth().catch(error => {
  console.error('Auth failed:', error.message);
  return false; // Graceful fallback
});
```

### 3. Environment Awareness

```javascript
// Let services auto-detect environment
const service = await browserService.startup();

// Or be explicit when needed
const config = createBrowserConfig('production');
```

### 4. Testing Integration

```javascript
// Use services in tests properly
beforeAll(async () => {
  await browserService.startup();
});

test('should work', async () => {
  expect(browserService.isReady()).toBe(true);
});
```

### 5. Performance Optimization

```javascript
// Reuse service instances
const { browser, page } = browserService.getBrowser();

// Don't recreate services unnecessarily
if (!browserService.isReady()) {
  await browserService.startup();
}
```

## Adding New Services

When adding new services to the project:

1. **Follow Naming Convention**: `service-name.mjs` in `services/` directory
2. **Use Configuration System**: Import and use service configuration
3. **Implement Standard Methods**: `startup()`, `shutdown()`, `isReady()`
4. **Add Error Handling**: Professional error handling and recovery
5. **Document APIs**: Create documentation in `docs/api/`
6. **Add NPM Scripts**: Integrate with package.json scripts
7. **Write Tests**: Include comprehensive test coverage

### Service Template

```javascript
/**
 * @fileoverview New Service - Description
 * @version 1.0.0
 */

import { createServiceConfig } from '../src/config/service-config.mjs';

class NewService {
  constructor(environment = null) {
    this.config = createServiceConfig(environment);
    this.isInitialized = false;
  }

  async startup() {
    // Initialization logic
    this.isInitialized = true;
    return { ready: true };
  }

  async shutdown() {
    // Cleanup logic
    this.isInitialized = false;
    return true;
  }

  isReady() {
    return this.isInitialized;
  }
}

export default new NewService();
```

## Migration Guide

### Upgrading from Legacy Scripts

If you have legacy automation scripts, migrate to services:

**Before (Legacy):**
```javascript
// Old script pattern
const browser = await puppeteer.launch();
const page = await browser.newPage();
// Manual session management
// Manual cleanup
```

**After (Service):**
```javascript
// New service pattern
import browserService from './services/browser-service.mjs';

const { browser, page } = await browserService.startup();
// Automatic session management
await browserService.shutdown(); // Automatic cleanup
```

### Benefits of Migration

- **Reduced Code**: Less boilerplate, more focus on business logic
- **Better Reliability**: Professional error handling and recovery
- **Session Management**: Automatic authentication and session persistence
- **Environment Awareness**: Automatic adaptation to dev/test/prod
- **Resource Efficiency**: Shared browser instances, proper cleanup

## Future Roadmap

### Planned Service Enhancements

1. **Performance Service**: Lighthouse integration, performance monitoring
2. **Screenshot Service**: Automated visual regression testing
3. **Data Service**: Database operations and data management
4. **Notification Service**: Email, Slack, webhook integrations
5. **Monitoring Service**: Health checks, metrics collection

### Service Ecosystem Vision

The goal is a comprehensive service ecosystem that provides:
- **Zero-Config Operation**: Services work out of the box
- **Professional APIs**: Industry-standard interfaces and patterns
- **Full Integration**: Seamless integration between services
- **Monitoring Ready**: Built-in observability and health checks
- **Cloud Native**: Ready for containerization and cloud deployment

---

**Need Help?** Check the individual API documentation or see the examples in each service file.
