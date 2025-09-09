# Universal Browser Service Architecture

## Overview

The Universal Browser Service provides a centralized, singleton service for all browser automation needs including testing, scripts, and CI/CD integration.

## Architecture

```
notecards/
├── services/
│   └── browser-service.mjs    # Universal browser service (THE central service)
├── test/
│   ├── test-framework.mjs     # Universal test framework
│   └── main-test-suite.mjs    # Main test suite
├── scripts/
│   ├── browser-service-demo.mjs  # Demo usage
│   └── (other utility scripts)
├── run-tests.mjs              # Test runner entry point
└── .browser-session/          # Centralized session storage
    ├── cookies.json
    ├── storage.json
    └── chrome-data/
```

## Key Features

### 🎯 **Universal Service**
- Single service for all browser automation needs
- Used by tests, scripts, and any automation task
- Singleton pattern ensures consistent state

### 📁 **Proper File Organization**
- Services in `/services/` directory
- Tests in `/test/` directory  
- Utility scripts in `/scripts/` directory
- Session data in `/.browser-session/` (gitignored)

### 🔒 **Absolute Paths**
- No more relative path issues
- Session files always go to same location
- Works from any directory

### 🔄 **Session Persistence**
- Centralized session storage
- Automatic save/restore
- No duplicate session files

## Usage Examples

### In Tests
```javascript
import browserService from '../services/browser-service.mjs';

const { page, browser } = await browserService.initialize();
await browserService.navigateToApp();
// Use page for testing
await browserService.close();
```

### In Scripts
```javascript
import browserService from '../services/browser-service.mjs';

const connection = await browserService.initialize();
// Use for automation tasks
```

### From Test Framework
```javascript
import TestFramework from '../test/test-framework.mjs';

const framework = new TestFramework();
await framework.initialize(); // Uses universal service
```

## Commands

```bash
# Run main test suite
npm run test:browser

# Run via test runner
npm run test:puppeteer

# Demo the service
npm run demo:browser

# Direct execution
node test/main-test-suite.mjs
node scripts/browser-service-demo.mjs
node run-tests.mjs
```

## Benefits

1. **🎯 Proper Architecture** - Services where engineers expect them
2. **🔧 No Duplication** - Single source of truth for browser management
3. **📦 Clean Organization** - Logical file structure
4. **🔒 Consistent Paths** - No more relative path issues
5. **🔄 Universal Usage** - Same service for tests, scripts, CI/CD
6. **💾 Centralized Sessions** - Single session directory
7. **🧹 Gitignore Ready** - Proper exclusion of temp files

## Migration Notes

- Old `/scripts/browser-service.mjs` → `/services/browser-service.mjs`
- Old relative paths → absolute paths with project root
- Old duplicate session files → centralized `/.browser-session/`
- Old scattered tests → organized `/test/` directory
