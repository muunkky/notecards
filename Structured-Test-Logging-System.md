# Structured Test Logging System

## Overview

This project implements a sophisticated logging system designed for AI/LLM-friendly test output management. The system provides clean, parseable logs while maintaining real-time monitoring capabilities through a **triple-output approach** with **self-archiving** and **completion sentinels**.

## Problem Statement

Traditional test runners produce output that is:
- **ANSI-formatted** (colors/spinners) making it hard for automated systems to parse
- **Too verbose** for console display in long test runs
- **Interactive/dynamic** with line rewrites that break when redirected to files
- **Inconsistent** in format between different runs

## Solution Architecture

### 1. Triple Output System

The system generates three synchronized outputs for each test run:

```
test-results/unit/unit-YYYY-MM-DD-HH-mm-ss.log      # Sanitized (ANSI-free)
test-results/unit/unit-YYYY-MM-DD-HH-mm-ss.raw.log  # Raw (ANSI intact)
test-results/unit/unit-YYYY-MM-DD-HH-mm-ss.json     # Structured summary
```

**Benefits:**
- **Sanitized logs**: Clean text for AI/automation parsing
- **Raw logs**: Preserve original formatting for human debugging
- **JSON summaries**: Machine-readable test metadata and results

### 2. Self-Archiving

- **Automatic pruning**: Keeps latest 10 runs by default (configurable via `TEST_LOG_MAX_HISTORY`)
- **Organized storage**: Separate directories for unit (`test-results/unit/`) and E2E (`test-results/e2e/`) tests
- **Quick access pointers**: 
  - `latest-log-path.txt`
  - `latest-raw-log-path.txt` 
  - `latest-summary.json`

### 3. Completion Sentinels

Terminal output is minimal and deterministic for AI integration:

```bash
[TEST-RUN-START]
# ... metadata and instructions ...
[TEST-RUN-MESSAGE-END]

# Long pause while tests run (output goes to files)

[TEST-RUN-COMPLETE] files=26 tests=238 failed=0 exitCode=0 summaryJson=path/to/summary.json
copilot: You may stop tailing now; final summary JSON written. Parse summaryJson for structured results.
```

## Core Implementation Files

### 1. Unit Test Runner: `scripts/run-tests-log.mjs`
**Purpose**: Main test runner with comprehensive logging
**Features**:
- Vitest integration with clean output
- Triple file output (sanitized, raw, JSON)
- Automatic log pruning and archiving
- Completion sentinels for AI detection
- Multiple terminal modes

**Key Code Patterns**:
```javascript
// Force clean output
process.env.NO_COLOR = '1'
process.env.CI = '1'

// Triple stream setup
const logFile = join(logDir, `unit-${timestamp}.log`)
const rawLogFile = join(logDir, `unit-${timestamp}.raw.log`) 
const jsonFile = join(logDir, `unit-${timestamp}.json`)

// ANSI stripping for sanitized output
const stripAnsi = (input) => input.replace(/[\u001B\u009B][[\]()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')
```

### 2. E2E Test Runner: `scripts/run-e2e-tests-log.mjs`
**Purpose**: End-to-end test runner with same logging pattern
**Features**:
- Puppeteer/Playwright test integration
- Same triple-output structure as unit tests
- E2E-specific completion sentinels (`[E2E-TEST-COMPLETE]`)
- Separate log directory (`test-results/e2e/`)

### 3. Completion Poller: `scripts/wait-for-test-complete.mjs`
**Purpose**: Utility for polling test completion
**Features**:
- Auto-detects latest log via pointer files
- Parses completion sentinels
- Configurable polling interval and timeout
- JSON summary output on completion

**Usage**:
```bash
# Start tests
npm run test:log

# In another terminal, wait for completion
npm run test:wait

# Or with explicit log path
node scripts/wait-for-test-complete.mjs test-results/unit/unit-2024-01-01-12-00-00.log
```

## Configuration

### Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `TEST_LOG_MAX_HISTORY` | `10` | Number of test run sets to keep |
| `TEST_TERMINAL_MODE` | `start` | Terminal output level |
| `E2E_TERMINAL_MODE` | `start` | E2E terminal output level |
| `INTERVAL_MS` | `500` | Polling interval for wait script |
| `TIMEOUT_MS` | `300000` | Timeout for wait script (5 min) |
| `NO_COLOR` | `1` | Auto-set to disable ANSI colors |
| `CI` | `1` | Auto-set to disable interactive features |

### Terminal Modes

- **`start`** (default): Show only start/end sentinels
- **`summary`**: Add final summary line with totals
- **`full`**: Stream all output (debug mode only)

### NPM Scripts Setup

Add to your `package.json`:

```json
{
  "scripts": {
    "test:log": "node scripts/run-tests-log.mjs",
    "test:wait": "node scripts/wait-for-test-complete.mjs",
    "test:e2e": "node scripts/run-e2e-tests-log.mjs",
    "test:watch": "TEST_TERMINAL_MODE=full node scripts/run-tests-log.mjs -- --watch",
    "test:coverage": "node scripts/run-tests-log.mjs -- --coverage"
  }
}
```

## Usage Examples

### Basic Usage
```bash
# Run full test suite with logging
npm run test:log

# Run specific test pattern
npm run test:log -- --testNamePattern="reorder"

# Run specific test file
npm run test:log -- src/test/CardScreen.test.tsx

# Run with coverage
npm run test:coverage
```

### Monitoring Integration
```bash
# Method 1: Parallel monitoring
npm run test:log &
npm run test:wait

# Method 2: Manual tailing
npm run test:log &
tail -f test-results/unit/unit-*.log

# Method 3: Parse results programmatically
node -e "
const fs = require('fs');
const summary = JSON.parse(fs.readFileSync('test-results/unit/latest-summary.json'));
console.log(\`Tests: \${summary.totalTests}, Failed: \${summary.totalFailed}\`);
"
```

### Advanced Patterns
```bash
# Debug mode with full output
TEST_TERMINAL_MODE=full npm run test:log

# Custom log retention
TEST_LOG_MAX_HISTORY=5 npm run test:log

# Fast polling for quick tests
INTERVAL_MS=100 npm run test:wait
```

## File Structure

```
project-root/
├── scripts/
│   ├── run-tests-log.mjs         # Main unit test runner
│   ├── run-e2e-tests-log.mjs     # E2E test runner
│   └── wait-for-test-complete.mjs # Completion poller
├── test-results/
│   ├── unit/
│   │   ├── unit-YYYY-MM-DD-HH-mm-ss.log      # Sanitized
│   │   ├── unit-YYYY-MM-DD-HH-mm-ss.raw.log  # Raw
│   │   ├── unit-YYYY-MM-DD-HH-mm-ss.json     # Summary
│   │   ├── latest-log-path.txt               # Quick pointer
│   │   ├── latest-raw-log-path.txt           # Raw pointer
│   │   └── latest-summary.json               # Latest results
│   └── e2e/
│       └── (same pattern with e2e- prefix)
└── package.json                  # NPM scripts
```

## JSON Summary Format

The structured JSON summaries contain:

```json
{
  "totalFiles": 26,
  "totalTests": 238,
  "totalFailed": 0,
  "totalSkipped": 5,
  "duration": 45672,
  "startTime": "2024-01-01T12:00:00.000Z",
  "endTime": "2024-01-01T12:00:45.672Z",
  "files": [
    {
      "file": "src/test/CardScreen.test.tsx",
      "tests": 12,
      "failed": 0,
      "skipped": 1,
      "durationMs": 1234,
      "state": "pass",
      "testsDetailed": [
        {
          "id": "test-1",
          "name": "reorders cards correctly",
          "fullName": "CardScreen reorders cards correctly",
          "state": "pass",
          "durationMs": 156,
          "error": null
        }
      ]
    }
  ]
}
```

## Integration Steps for New Projects

### 1. Copy Core Files
```bash
# Copy these three essential scripts
cp scripts/run-tests-log.mjs your-project/scripts/
cp scripts/run-e2e-tests-log.mjs your-project/scripts/
cp scripts/wait-for-test-complete.mjs your-project/scripts/
```

### 2. Adapt Test Commands
In the script files, replace the Vitest-specific commands with your test framework:

```javascript
// Replace this Vitest command:
const { startVitest } = await import('vitest/node')

// With your framework, e.g. Jest:
const { spawn } = require('child_process')
const child = spawn('npx', ['jest', '--json', ...args])
```

### 3. Create Directory Structure
```bash
mkdir -p test-results/unit
mkdir -p test-results/e2e
```

### 4. Add NPM Scripts
Update your `package.json` with the logging scripts.

### 5. Configure Environment
Set appropriate defaults for your project:
```bash
export TEST_LOG_MAX_HISTORY=10
export TEST_TERMINAL_MODE=start
```

## AI/LLM Integration Benefits

### For Development Workflows
- **Clean parsing**: No ANSI escape codes to strip
- **Completion detection**: Reliable `[TEST-RUN-COMPLETE]` sentinels
- **Structured results**: JSON summaries for programmatic access
- **Real-time monitoring**: Tail log files without terminal pollution

### For CI/CD Pipelines
- **Deterministic output**: Consistent format across environments
- **Resource management**: Automatic log pruning prevents disk bloat
- **Parallel processing**: Multiple systems can monitor same logs safely
- **Framework agnostic**: Works with any test runner

### For Code Quality Tools
- **Test result parsing**: Structured JSON for automated analysis
- **Performance tracking**: Duration metrics per test and file
- **Error aggregation**: Failed test details with full context
- **Historical analysis**: Maintained history for trend analysis

## Architecture Benefits

1. **Separation of Concerns**: Output generation separated from consumption
2. **Non-blocking**: Tests run independently of log monitoring
3. **Fault Tolerant**: Log corruption doesn't affect test execution
4. **Scalable**: Multiple monitoring processes can attach safely
5. **Framework Agnostic**: Adapter pattern works with any test runner
6. **AI-Optimized**: Designed specifically for automated parsing and analysis

## Source Repository

This implementation is from the **notecards** project:
- **GitHub URL**: `https://github.com/muunkky/notecards`
- **Repository**: `muunkky/notecards`  
- **Current Branch**: `feature/deck-sharing`
- **Main Branch**: `main` (stable implementation)
- **Full Documentation**: [`docs/Test-Output-Logging-Instructions.md`](https://github.com/muunkky/notecards/blob/main/docs/Test-Output-Logging-Instructions.md)

### Key Files to Reference:
- [`scripts/run-tests-log.mjs`](https://github.com/muunkky/notecards/blob/main/scripts/run-tests-log.mjs) - Unit test runner
- [`scripts/run-e2e-tests-log.mjs`](https://github.com/muunkky/notecards/blob/main/scripts/run-e2e-tests-log.mjs) - E2E test runner
- [`scripts/wait-for-test-complete.mjs`](https://github.com/muunkky/notecards/blob/main/scripts/wait-for-test-complete.mjs) - Completion poller
- [`package.json`](https://github.com/muunkky/notecards/blob/main/package.json) - NPM scripts configuration

The system has been battle-tested with 240+ tests across React, TypeScript, Vitest, and Puppeteer, providing a robust foundation for AI-assisted development workflows where clean, parseable output is essential.

## Production Usage Notes

- **Tested Frameworks**: Vitest, Jest, Puppeteer, React Testing Library
- **Tested Platforms**: Windows PowerShell, Linux, macOS  
- **Scale**: Handles test suites from 10-500+ tests
- **Performance**: Minimal overhead (~50ms per test run for logging)
- **Reliability**: Auto-recovery from stream errors and filesystem issues