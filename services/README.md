# Services Directory

This directory contains the professional services layer for the notecards application.

## Available Services

### 🌐 Browser Service (`browser-service.mjs`)

Professional browser automation service with session management and authentication.

**Features:**
- Environment-aware configuration (dev/test/staging/production)
- Professional session management with persistent storage
- Multiple authentication verification methods
- Graceful error handling and recovery
- Stealth configuration for OAuth bypass
- Resource cleanup and lifecycle management

**Quick Usage:**
```javascript
import browserService from './browser-service.mjs';

// Simple authentication
const authenticated = await browserService.quickAuth();

// Verify auth status
const isAuthenticated = await browserService.verifyAuthentication();

// Custom automation
const { browser, page } = await browserService.startup();
await page.goto('https://example.com');
await browserService.shutdown();
```

**NPM Commands:**
```bash
npm run auth:quick    # Quick authentication setup
npm run auth:verify   # Verify authentication status
```

## Documentation

- **[Full Services Documentation](../docs/services/README.md)** - Complete services overview
- **[Browser Service API](../docs/api/browser-service.md)** - Detailed API reference
- **[Services Architecture](../docs/SERVICES-ARCHITECTURE.md)** - Technical architecture

## Service Standards

All services in this directory follow these standards:

1. **Professional API Design**: Simple methods for common operations
2. **Environment Awareness**: Automatic adaptation to dev/test/prod environments
3. **Error Handling**: Comprehensive error recovery and logging
4. **Resource Management**: Proper cleanup and lifecycle management
5. **Documentation**: Full JSDoc comments and API documentation
6. **Testing**: Integration with project test framework

## Adding New Services

When adding a new service:

1. Create `service-name.mjs` in this directory
2. Follow the established patterns from `browser-service.mjs`
3. Add JSDoc documentation and error handling
4. Create API documentation in `../docs/api/`
5. Add NPM scripts to `package.json` if needed
6. Update the main services documentation

## Architecture

Services use a singleton pattern with configuration-driven behavior:

```javascript
// Standard service structure
class ServiceName {
  constructor(environment = null) {
    this.config = createServiceConfig(environment);
    this.isInitialized = false;
  }

  async startup() { /* initialization */ }
  async shutdown() { /* cleanup */ }
  isReady() { /* status check */ }
}

export default new ServiceName();
```

For detailed architecture information, see the [Services Architecture Documentation](../docs/SERVICES-ARCHITECTURE.md).
