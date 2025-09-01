# Test Output Logging Instructions

**Purpose**: Standardized test execution with clean log file output for AI assistant compatibility  
**Created**: 2025-09-01  
**Compatible With**: PowerShell, Vitest, React Testing Library  

## 🎯 Quick Reference

### Standard Test Execution
```powershell
# Clean test output to log file
$env:NO_COLOR=1; npm run test > test-results-$(Get-Date -Format 'yyyy-MM-dd-HH-mm').log 2>&1

# View results immediately
npm run test

# Specific test file
$env:NO_COLOR=1; npm run test CardScreen.test.tsx > card-screen-test-$(Get-Date -Format 'yyyy-MM-dd-HH-mm').log 2>&1
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
# Primary command for full test suite
$env:NO_COLOR=1; npm run test > test-results-$(Get-Date -Format 'yyyy-MM-dd-HH-mm').log 2>&1

# Alternative with manual timestamp
$env:NO_COLOR=1; npm run test > test-results-2025-09-01-14-30.log 2>&1
```

### 3. Log File Verification
```powershell
# Check if log file was created
Get-ChildItem *.log | Sort-Object LastWriteTime -Descending | Select-Object -First 5

# View latest log file
Get-Content (Get-ChildItem *.log | Sort-Object LastWriteTime -Descending | Select-Object -First 1).Name
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
# Generate coverage with clean output
$env:NO_COLOR=1; npm run test:coverage > coverage-report-$(Get-Date -Format 'yyyy-MM-dd-HH-mm').log 2>&1
```

## 📁 File Naming Conventions

### Standard Formats
- **Full Test Suite**: `test-results-YYYY-MM-DD-HH-mm.log`
- **Feature Specific**: `[feature]-tests-YYYY-MM-DD-HH-mm.log`
- **Coverage Reports**: `coverage-report-YYYY-MM-DD-HH-mm.log`
- **Specific Components**: `[component]-test-YYYY-MM-DD-HH-mm.log`

### Examples
```
test-results-2025-09-01-14-30.log
cards-tests-2025-09-01-14-35.log
coverage-report-2025-09-01-14-40.log
card-screen-test-2025-09-01-14-45.log
```

## 🚫 What NOT to Do

### Avoid These Patterns
```powershell
# ❌ Without NO_COLOR (creates ANSI codes)
npm run test > test-results.log

# ❌ Without timestamp (overwrites previous)
npm run test > test-results.log

# ❌ Wrong file extension (not AI-friendly)
npm run test > test-results.txt

# ❌ Without stderr redirection (missing error info)
npm run test > test-results.log
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
# Solution: List recent .log files
Get-ChildItem *.log | Sort-Object LastWriteTime -Descending
```

### Verification Steps
1. **Check NO_COLOR**: `Write-Host "NO_COLOR: $env:NO_COLOR"`
2. **Test npm command**: `npm run test --help`
3. **Verify file creation**: `Test-Path test-results*.log`
4. **Check file contents**: `Get-Content (latest log file)`

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

**Last Updated**: 2025-09-01  
**Compatible**: PowerShell 5.1+, npm 8+, Vitest 1.0+  
**Status**: Production Ready
