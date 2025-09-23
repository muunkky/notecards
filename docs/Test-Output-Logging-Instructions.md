# Test Output Logging Instructions

**Purpose**: Standardized test execution with clean log file output for AI assistant compatibility.  
**MANDATORY**: Always run tests via the wrapper scripts (`npm run test`, `npm run test:log`, etc.) so the sentinel lines `[TEST-RUN-START]` and `[TEST-RUN-COMPLETE]` are emitted. Direct `vitest` or `npx vitest` calls are prohibited because they bypass centralized logging and sentinel signaling.
**Created**: 2025-09-01  
**Compatible With**: PowerShell, Vitest, React Testing Library  

## 🎯 Quick Reference

### Standard Test Execution
```powershell
# Clean test output to centralized log folder (log/temp)
# (NO_COLOR is set automatically by the logging script)
npm run test:log

# View results immediately (interactive output only, no file)
npm run test

# Specific test file (ad-hoc logging example)
$env:NO_COLOR=1; npm run test CardScreen.test.tsx > log/temp/card-screen-test-$(Get-Date -Format 'yyyy-MM-dd-HH-mm').log 2>&1

# Using logging script with pattern / named test (NO_COLOR auto)
npm run test:log -- src/test/features/cards/CardScreen.test.tsx -t "reorders cards"
```

## 📋 Standard Operating Procedure

### 1. Environment Setup
```powershell
# Ensure NO_COLOR is set to disable ANSI escape codes
$env:NO_COLOR=1

# Verify npm test command works
npm run test --version
```

### 2. Test Execution with Logging
```powershell
# Primary command for full test suite (writes timestamped log file in log/temp)
npm run test:log

# Legacy manual redirection (still valid if script unavailable)
$env:NO_COLOR=1; npm run test > log/temp/test-results-$(Get-Date -Format 'yyyy-MM-dd-HH-mm').log 2>&1

# Select subset (cards feature) with logging script
npm run test:log -- cards
```

### 3. Log File Verification
```powershell
# Check if log file was created (latest 5)
Get-ChildItem log/temp/test-results-*.log | Sort-Object LastWriteTime -Descending | Select-Object -First 5

# View latest log file contents
Get-Content (Get-ChildItem log/temp/test-results-*.log | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName
```

## 🔧 Advanced Usage

### Specific Test Categories
```powershell
# Auth tests only
$env:NO_COLOR=1; npm run test auth > auth-tests-$(Get-Date -Format 'yyyy-MM-dd-HH-mm').log 2>&1

# Card feature tests only
$env:NO_COLOR=1; npm run test cards > cards-tests-$(Get-Date -Format 'yyyy-MM-dd-HH-mm').log 2>&1

# Deck feature tests only
$env:NO_COLOR=1; npm run test decks > decks-tests-$(Get-Date -Format 'yyyy-MM-dd-HH-mm').log 2>&1

# Hook tests only
$env:NO_COLOR=1; npm run test hooks > hooks-tests-$(Get-Date -Format 'yyyy-MM-dd-HH-mm').log 2>&1
```

### Watch Mode (Development)
```powershell
# Watch mode with clean output
$env:NO_COLOR=1; npm run test:watch

# Note: Watch mode logs are not typically saved to files
# Use for development iteration only
```

### Coverage Reports
```powershell
# Generate coverage with clean output (manual redirect)
$env:NO_COLOR=1; npm run test:coverage > log/temp/coverage-report-$(Get-Date -Format 'yyyy-MM-dd-HH-mm').log 2>&1
```

## 📁 File Naming Conventions

### Standard Formats (stored in log/temp)
- **Full Test Suite**: `log/temp/test-results-YYYY-MM-DD-HH-mm.log`
- **Feature Specific**: `log/temp/[feature]-tests-YYYY-MM-DD-HH-mm.log`
- **Coverage Reports**: `log/temp/coverage-report-YYYY-MM-DD-HH-mm.log`
- **Specific Components**: `log/temp/[component]-test-YYYY-MM-DD-HH-mm.log`

### Examples
```
log/temp/test-results-2025-09-01-14-30.log
log/temp/cards-tests-2025-09-01-14-35.log
log/temp/coverage-report-2025-09-01-14-40.log
log/temp/card-screen-test-2025-09-01-14-45.log
```

## 🚫 What NOT to Do

### Avoid These Patterns
```powershell
# ❌ Bypassing wrapper (no sentinel, noisy console)
npx vitest run

# ❌ Without NO_COLOR (creates ANSI codes)
npm run test > test-results.log

# ❌ Without timestamp (overwrites previous)
npm run test > test-results.log

# ❌ Wrong file extension (not AI-friendly)
npm run test > test-results.txt

# ❌ Without stderr redirection (missing error info)
npm run test > test-results.log

# ❌ Direct vitest invocation even for a single file (use wrapper + args instead)
vitest run src/test/features/decks/DeckScreen.test.tsx
```

## ✅ Best Practices

### 1. Always Use NO_COLOR
```powershell
# ✅ Clean output without ANSI escape codes
$env:NO_COLOR=1; npm run test
```

### 2. Include Timestamps
```powershell
# ✅ Unique files with timestamps
test-results-$(Get-Date -Format 'yyyy-MM-dd-HH-mm').log
```

### 3. Capture Both stdout and stderr
```powershell
# ✅ Complete output capture
> test-results.log 2>&1
```

### 4. Use .log Extension
```powershell
# ✅ AI-compatible file extension
.log
```

## 🔍 Troubleshooting

### Common Issues

**Issue**: ANSI escape codes in log file
```powershell
# Solution: Ensure NO_COLOR is set
$env:NO_COLOR=1
Write-Host "NO_COLOR is set to: $env:NO_COLOR"
```

**Issue**: Missing error information
```powershell
# Solution: Include stderr redirection
> logfile.log 2>&1
```

**Issue**: Log files being overwritten
```powershell
# Solution: Use timestamps in filenames
$(Get-Date -Format 'yyyy-MM-dd-HH-mm')
```

**Issue**: Can't find recent log files
```powershell
# Solution: List recent .log files in centralized directory
Get-ChildItem log/temp/*.log | Sort-Object LastWriteTime -Descending
```

### Verification Steps
1. **Check NO_COLOR**: `Write-Host "NO_COLOR: $env:NO_COLOR"`
2. **Test npm command**: `npm run test --help`
3. **Verify file creation**: `Get-ChildItem log/temp/test-results-*.log | Select -First 1`
4. **Check file contents**: `Get-Content (Get-ChildItem log/temp/test-results-*.log | Sort LastWriteTime -Descending | Select -First 1).FullName`

## 📊 Expected Output Format

### Successful Test Run
```
 PASS  src/test/simple-tdd-check.test.tsx
 PASS  src/test/features/auth/AuthProvider.test.tsx
 PASS  src/test/features/decks/DeckScreen.test.tsx
...

Test Suites: XX passed, XX total
Tests:       210 passed, 1 failed, 211 total
Snapshots:   0 total
Time:        X.XXXs
```

### Failed Test Run
```
 FAIL  src/test/features/cards/CardScreen-reorder-integration.test.tsx
   ● Test suite failed to run
     [Error details here]

Test Suites: XX failed, XX passed, XX total
Tests:       XXX passed, XX failed, XXX total
```

## 🔄 Integration with AI Assistants

### Why This Format
- **Centralized**: log/temp keeps repository root clean
- **Clean Text**: NO_COLOR removes formatting codes
- **Complete Output**: stderr redirection captures all information
- **Timestamped**: Unique files prevent overwrites
- **Standard Extension**: .log files are AI-compatible

### Usage with AI
1. Run tests with logging commands above
2. Share log file contents with AI assistant
3. AI can analyze results without formatting issues
4. Clear debugging and improvement recommendations

---

**Last Updated**: 2025-09-01 (centralized logging enabled)  
**Compatible**: PowerShell 5.1+, npm 8+, Vitest 1.0+  
**Status**: Production Ready
