# Browser Automation Framework

**Consolidated automation suite for the sharing system validation.**

## 📁 Framework Structure

```
browser-automation/
├── README.md                    # This file - framework overview
├── start-authenticated-session.mjs  # Session management & authentication
├── run-sharing-tests.mjs       # Complete sharing system test suite
├── cleanup-environment.mjs     # Environment reset & cleanup
└── utils/
    ├── config.mjs               # Shared configuration
    ├── logger.mjs               # Structured logging
    ├── auth-helpers.mjs         # Authentication utilities
    ├── screenshot-utils.mjs     # Screenshot capture & management
    └── validation-helpers.mjs   # Test validation utilities
```

## 🎯 Consolidation Results

**Before Refactoring**: 20+ scattered automation scripts
**After Refactoring**: 5 focused scripts + utilities

### Consolidated Scripts

#### 1. `start-authenticated-session.mjs`
**Replaces**: 
- `start-persistent-browser.mjs`
- `scripts/auth-*.mjs` files
- `scripts/setup-auth-*.mjs` files

**Purpose**: Start authenticated browser session for MCP integration

#### 2. `run-sharing-tests.mjs`
**Replaces**:
- `scripts/test-sharing-locally.mjs`
- `scripts/test-*.mjs` files (8+ testing scripts)
- Various validation scripts

**Purpose**: Complete sharing system test suite with all scenarios

#### 3. `cleanup-environment.mjs`
**Replaces**:
- `cleanup-dev-env.mjs` (enhanced)
- Various cleanup utilities

**Purpose**: Reset testing environment and clean up artifacts

#### 4. `utils/` Directory
**Consolidates**: Common patterns from all scripts
- Authentication workflows
- Screenshot management
- Logging and validation
- Configuration management

## 🚀 Usage Examples

### Start Authenticated Session
```bash
# Start browser for MCP integration
node browser-automation/start-authenticated-session.mjs
```

### Run Complete Test Suite
```bash
# Execute all sharing system tests
node browser-automation/run-sharing-tests.mjs

# Run specific test category
node browser-automation/run-sharing-tests.mjs --category=dialog
node browser-automation/run-sharing-tests.mjs --category=permissions
```

### Clean Environment
```bash
# Reset testing environment
node browser-automation/cleanup-environment.mjs

# Deep clean (remove all artifacts)
node browser-automation/cleanup-environment.mjs --deep
```

## 🔧 Configuration

All scripts use shared configuration from `utils/config.mjs`:
- Browser settings (headless, stealth mode)
- Firebase configuration
- Test environment settings
- Timeout and retry settings

## 📊 Test Categories

The framework organizes tests into logical categories:

1. **Dialog Tests**: Share dialog functionality
2. **Permission Tests**: Role-based access control
3. **Integration Tests**: End-to-end workflows
4. **Performance Tests**: Speed and reliability
5. **Cross-Browser Tests**: Compatibility validation

## 🛡️ Preserved Functionality

**All working functionality from scattered scripts has been preserved and enhanced:**

✅ **Authentication**: Hybrid browser/service account approach
✅ **Stealth Mode**: Anti-detection for reliable automation
✅ **MCP Integration**: Puppeteer tools compatibility
✅ **Screenshot Capture**: Enhanced organization
✅ **Production Testing**: Real Firebase environment
✅ **Error Handling**: Comprehensive logging and recovery
✅ **Session Management**: Persistent browser connections

## 📈 Benefits of Consolidation

1. **Maintainability**: Clear structure, easy to understand
2. **Reliability**: Shared utilities reduce code duplication
3. **Discoverability**: New developers can quickly understand approach
4. **Consistency**: Standardized patterns across all automation
5. **Efficiency**: Reduced script startup time through reuse

## 🧰 Development Workflow

1. **Start Session**: Use `start-authenticated-session.mjs` for development
2. **Run Tests**: Use `run-sharing-tests.mjs` for validation
3. **Clean Up**: Use `cleanup-environment.mjs` between test runs
4. **Extend**: Add new test scenarios to existing framework

---

*Framework consolidated: October 15, 2025*
*Part of SHAREVALIDATION sprint cleanup*
*Reduces maintenance overhead while preserving all functionality*