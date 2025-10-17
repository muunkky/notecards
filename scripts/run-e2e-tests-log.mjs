#!/usr/bin/env node
import { mkdirSync, existsSync, createWriteStream, readdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawn } from 'node:child_process'

/**
 * E2E Test Log Runner
 * 
 * This runs E2E tests with the same logging pattern as unit tests:
 * - Outputs logs to files instead of streaming to terminal
 * - Shows completion sentinel for Copilot integration
 * - Provides tail-able log files for real-time monitoring
 */

// Force plain, non-interactive output for clean log files
const NO_COLOR = process.env.NO_COLOR || '1'
process.env.NO_COLOR = NO_COLOR

// Terminal display policy for E2E tests:
const terminalMode = (process.env.E2E_TERMINAL_MODE || 'start').toLowerCase()
const allowStreaming = terminalMode === 'full'
const showFinalSummaryLine = terminalMode === 'summary' || terminalMode === 'full'

const logDir = join(process.cwd(), 'test-results', 'e2e')
if (!existsSync(logDir)) {
  mkdirSync(logDir, { recursive: true })
}
const parseIntSafe = (value, fallback) => {
  const parsed = parseInt(value, 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

const pruneOldLogs = () => {
  const maxHistory = parseIntSafe(process.env.TEST_LOG_MAX_HISTORY || '10', 10)
  try {
    const entries = readdirSync(logDir)
    const groups = new Map()
    for (const name of entries) {
      const match = name.match(/^(e2e-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2})/)
      if (!match) continue
      const key = match[1]
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(name)
    }
    const items = Array.from(groups.entries()).map(([key, files]) => {
    const candidate = files.find(f => f.endsWith('.log')) || files[0]
      let mtime = 0
      try {
        mtime = statSync(join(logDir, candidate)).mtime.getTime()
      } catch { /* ignore */ }
      return { key, files, mtime }
    }).sort((a, b) => b.mtime - a.mtime)
    const toRemove = items.slice(maxHistory)
    for (const { files } of toRemove) {
      for (const name of files) {
        try { unlinkSync(join(logDir, name)) } catch { /* ignore */ }
      }
    }
  } catch { /* ignore */ }
}

pruneOldLogs()


const timestamp = new Date().toISOString().replace(/[:T]/g, '-').replace(/\..+/, '')
const logFile = join(logDir, `e2e-results-${timestamp}.log`)
const rawLogFile = join(logDir, `e2e-results-${timestamp}.raw.log`)
const jsonFile = join(logDir, `e2e-results-${timestamp}.json`)

const out = createWriteStream(logFile, { flags: 'a' })
const rawOut = createWriteStream(rawLogFile, { flags: 'a' })

// Simple ANSI / control sequence stripper  
const stripAnsi = (input) => {
  if (typeof input !== 'string') input = input.toString()
  return input
    .replace(/[\u001B\u009B][[\]()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')
    .replace(/\r/g, '')
}

// Write initial header
const writeHeader = () => {
  const headerLines = [
    '[E2E-TEST-START]',
    `timestamp: ${new Date().toISOString()}`,
    `logFile: ${logFile}`,
    `rawLogFile: ${rawLogFile}`,
    `jsonSummary: ${jsonFile}`,
    `terminalMode: ${terminalMode}`,
    '[E2E-TEST-HEADER-END]'
  ]
  
  headerLines.forEach(line => {
    const timestamped = `[${new Date().toISOString()}] ${line}`
    out.write(timestamped + '\n')
    rawOut.write(timestamped + '\n')
    if (allowStreaming) console.log(timestamped)
  })
}

// Show guidance for Copilot
const showGuidance = () => {
  console.log('[E2E] Test Runner - log-based execution')
  console.log(`[E2E] Log file: ${logFile}`)
  console.log(`[E2E] Raw log:  ${rawLogFile}`)
  console.log(`[E2E] JSON summary: ${jsonFile}`)
  console.log('')
  console.log('copilot: tail the log file until [E2E-TEST-COMPLETE] appears; absence means tests are still running.')
  console.log('instruction: keep reading the log file; completion sentinels and JSON summaries are written at the end.')
  console.log('')
}

// Write completion sentinel
const writeCompleteSentinel = (exitCode, totals) => {
  const sentinelLine = `[E2E-TEST-COMPLETE] ${totals} exitCode=${exitCode} summaryJson=${jsonFile}`
  const guidanceLine = `copilot: E2E tests finished with exit code ${exitCode}. Full results in ${jsonFile}`
  
  try { rawOut.write(sentinelLine + '\n') } catch {}
  try { out.write(sentinelLine + '\n') } catch {}
  try { rawOut.write(guidanceLine + '\n') } catch {}
  try { out.write(guidanceLine + '\n') } catch {}
  
  return { sentinelLine, guidanceLine }
}

// Start execution
writeHeader()
showGuidance()

// Run the E2E tests using the Vitest E2E config
const baseArgs = [
  'run',
  'test:e2e:vitest',
  '--',
  ...process.argv.slice(2) // Pass through any additional args (like test name)
]

console.log(`[E2E] Running E2E tests: npm ${baseArgs.join(' ')}`)
if (!allowStreaming) {
  console.log('[E2E] Live output suppressed - monitor the log file instead')
}

const startTime = Date.now()

// Use npm run instead of npx for Windows compatibility
const command = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const args = baseArgs

const vitestProcess = spawn(command, args, {
  stdio: allowStreaming ? 'inherit' : 'pipe',
  cwd: process.cwd(),
  env: { ...process.env, NO_COLOR: '1', CI: '1' },
  shell: true  // Use shell for Windows compatibility
})

let outputBuffer = ''
let testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  total: 0
}

// Capture output if not streaming
if (!allowStreaming) {
  vitestProcess.stdout?.on('data', (chunk) => {
    const text = chunk.toString()
    outputBuffer += text
    
    // Write to log files
    const cleaned = stripAnsi(text)
    out.write(cleaned)
    rawOut.write(text)
    
    // Parse test results from output
    const lines = text.split('\n')
    lines.forEach(line => {
      if (line.includes('PASS')) testResults.passed++
      if (line.includes('FAIL')) testResults.failed++
      if (line.includes('SKIP')) testResults.skipped++
    })
  })
  
  vitestProcess.stderr?.on('data', (chunk) => {
    const text = chunk.toString()
    outputBuffer += text
    
    const cleaned = stripAnsi(text)
    out.write(cleaned)
    rawOut.write(text)
  })
}

vitestProcess.on('close', (exitCode) => {
  const endTime = Date.now()
  const duration = endTime - startTime
  
  // Calculate totals
  testResults.total = testResults.passed + testResults.failed + testResults.skipped
  const totals = `passed=${testResults.passed} failed=${testResults.failed} skipped=${testResults.skipped} total=${testResults.total} duration=${duration}ms`
  
  // Create JSON summary
  const summary = {
    suite: 'e2e-tests',
    results: {
      ...testResults,
      startTime,
      endTime,
      duration
    },
    timestamp: new Date().toISOString(),
    success: exitCode === 0 && testResults.failed === 0,
    logFile,
    rawLogFile
  }
  
  // Write JSON summary
  try {
    writeFileSync(jsonFile, JSON.stringify(summary, null, 2), 'utf8')
  } catch (error) {
    console.error('Failed to write JSON summary:', error)
  }
  
  // Write completion sentinel
  const { sentinelLine } = writeCompleteSentinel(exitCode, totals)
  
  // Terminal output
  if (showFinalSummaryLine) {
    console.log(`\n[E2E] Test Results: ${totals}`)
  }
  
  console.log(`[E2E-TEST-COMPLETE-TERMINAL] exitCode=${exitCode} (stream ${allowStreaming ? 'shown' : 'suppressed'}; see log file sentinel)`)
  console.log(`[E2E] Full results: ${jsonFile}`)
  
  // Close streams
  try { out.end() } catch {}
  try { rawOut.end() } catch {}
  
  process.exit(exitCode)
})

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n[E2E] E2E tests interrupted')
  vitestProcess.kill('SIGINT')
})

process.on('SIGTERM', () => {
  console.log('\n[E2E] E2E tests terminated')
  vitestProcess.kill('SIGTERM')
})
