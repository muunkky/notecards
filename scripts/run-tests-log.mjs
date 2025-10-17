#!/usr/bin/env node
import { mkdirSync, existsSync, createWriteStream, readdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// Force plain, non-interactive output for clean log files
const NO_COLOR = process.env.NO_COLOR || '1'
process.env.NO_COLOR = NO_COLOR
// CI disables interactive spinner / dynamic line rewrites in Vitest
if (!process.env.CI) process.env.CI = '1'

// Terminal display policy (Copilot cannot reliably ingest streaming test output):
// TEST_TERMINAL_MODE options:
//  - start   (default): show only START header + final completion marker
//  - summary : START header + final one-line totals + completion marker
//  - full    : stream vitest output (manual debugging only)
const terminalMode = (process.env.TEST_TERMINAL_MODE || 'start').toLowerCase()
const allowStreaming = terminalMode === 'full'
const showFinalSummaryLine = terminalMode === 'summary' || terminalMode === 'full'

const logDir = join(process.cwd(), 'test-results', 'unit')
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
      const match = name.match(/^(unit-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2})/)
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
const baseName = `unit-${timestamp}`
const logFile = join(logDir, `${baseName}.log`)
const rawLogFile = join(logDir, `${baseName}.raw.log`)

const out = createWriteStream(logFile, { flags: 'a' })
const rawOut = createWriteStream(rawLogFile, { flags: 'a' })

// Allow passing additional vitest args (e.g., file patterns, -t test name, --coverage)
// Usage: npm run test:log -- path/to/test -t "name"
// Filter out standalone '--' which npm adds as separator
const rawArgs = process.argv.slice(2).filter(arg => arg !== '--')

// Separate vitest CLI flags from file patterns
// File patterns are passed as positional args to startVitest
// CLI flags need to be handled via config options
const hasCoverage = rawArgs.includes('--coverage')
const extraArgs = rawArgs.filter(arg => arg !== '--coverage')

// Monkey-patch stdout/stderr write to tee output into files while optionally silencing terminal
const originalStdoutWrite = process.stdout.write.bind(process.stdout)
const originalStderrWrite = process.stderr.write.bind(process.stderr)
let silent = !allowStreaming // will suppress vitest progress output unless full mode requested

// Simple ANSI / control sequence stripper
const stripAnsi = (input) => {
  if (typeof input !== 'string') input = input.toString()
  return input
    // Remove ANSI escape sequences
    .replace(/[\u001B\u009B][[\]()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')
    // Remove carriage returns used for inline updates
    .replace(/\r/g, '')
}

process.stdout.write = (chunk, encoding, cb) => {
  try {
    rawOut.write(chunk)
    out.write(stripAnsi(chunk))
  } catch { /* ignore */ }
  if (!silent) return originalStdoutWrite(chunk, encoding, cb)
  return true
}
process.stderr.write = (chunk, encoding, cb) => {
  try {
    rawOut.write(chunk)
    out.write(stripAnsi(chunk))
  } catch { /* ignore */ }
  if (!silent) return originalStderrWrite(chunk, encoding, cb)
  return true
}

// Provide immediate first-line pointer & explicit Copilot instructions before silencing (except full mode retains streaming after header if requested)
const prevSilent = silent; silent = false
const jsonPathPlanned = logFile.replace(/\.log$/, '.json')
const isFullSuite = extraArgs.length === 0
const est = isFullSuite ? '≈45–60 seconds' : '≈3–10 seconds'
console.log('[TEST-RUN-START]')
console.log(`mode: ${isFullSuite ? 'full-suite' : 'partial'}`)
console.log(`args: ${extraArgs.join(' ') || '(none)'}`)
console.log(`sanitizedLog: ${logFile}`)
console.log(`rawLog: ${rawLogFile}`)
console.log(`summaryJson (created at end): ${jsonPathPlanned}`)
console.log('status: RUNNING')
console.log('copilot: DO NOT wait for live test output in this terminal; tail the sanitizedLog or rawLog file repeatedly until you see [TEST-RUN-COMPLETE] appear here. Absence of that sentinel means tests are still executing.')
console.log(`estimate: ${est}`)
console.log('instruction: Continue polling (tail/read) the log file; it is appended incrementally. When finished a JSON summary and a COMPLETE sentinel will be written.')
console.log('[TEST-RUN-MESSAGE-END]')
silent = prevSilent
// Remain silent until finalize unless full mode

// Dynamic import to avoid issues if vitest not installed
;(async () => {
  let exitCode = 0
  let summary = null
  try {
  const { startVitest } = await import('vitest/node')
  const vitestConfig = { watch: false }
  if (hasCoverage) {
    vitestConfig.coverage = { enabled: true }
  }
  const ctx = await startVitest('run', extraArgs, vitestConfig)
    const files = ctx?.state?.getFiles?.() || []
    const flattenTests = (fileTask) => {
      if (!fileTask) return []
      const tests = []
      const stack = [...(fileTask.tasks || [])] // start from children suites/tests
      while (stack.length) {
        const current = stack.pop()
        if (!current) continue
        if (current.type === 'test') tests.push(current)
        if (current.tasks && current.tasks.length) stack.push(...current.tasks)
      }
      return tests
    }
    const fileSummaries = files.map(f => {
      const allTests = flattenTests(f)
      const detailed = allTests.map(t => {
        // Collect first meaningful error message if present
        let errorMessage = undefined
        if (t.result?.errors && t.result.errors.length) {
          errorMessage = t.result.errors.map(e => e.message || String(e)).join('\n')
        } else if (t.result?.error) {
          errorMessage = t.result.error.message || String(t.result.error)
        }
        return {
          id: t.id,
          name: t.name,
            // fullName may exist (Vitest builds hierarchical names) – preserve if available
          fullName: t.result?.name || (t.suite ? `${t.suite.name} ${t.name}` : t.name),
          mode: t.mode,
          state: t.result?.state || t.state,
          durationMs: t.result?.duration,
          error: errorMessage
        }
      })
      return {
        file: f.filepath || f.id || 'unknown',
        tests: allTests.length,
        failed: detailed.filter(t => t.state === 'fail').length,
        skipped: detailed.filter(t => t.mode === 'skip').length,
        durationMs: f.result?.duration || 0,
        state: f.result?.state || (detailed.some(t => t.state === 'fail') ? 'fail' : 'pass'),
        testsDetailed: detailed
      }
    })
    const totalTests = fileSummaries.reduce((a, f) => a + f.tests, 0)
    const totalFailed = fileSummaries.reduce((a, f) => a + f.failed, 0)
    const totalSkipped = fileSummaries.reduce((a, f) => a + f.skipped, 0)
    summary = {
      startedAt: new Date().toISOString(),
      totalFiles: fileSummaries.length,
      totalTests,
      totalFailed,
      totalSkipped,
      passed: totalFailed === 0,
      files: fileSummaries
    }
    const failures = totalFailed
    exitCode = failures > 0 ? 1 : 0
  } catch (err) {
    console.error('[vitest-error]', err?.message || err)
    summary = { error: err?.message || String(err) }
    exitCode = 1
  } finally {
    try {
      if (summary) {
        const jsonPath = logFile.replace(/\.log$/, '.json')
        // Write JSON summary separately (not via tee to keep structure clean)
        import('node:fs').then(fs => {
          fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2), 'utf8')
          // Also maintain latest-summary.json pointer + latest-log-path.txt for quick access
          try {
            const latestSummaryPath = join(logDir, 'latest-summary.json')
            const latestLogPathFile = join(logDir, 'latest-log-path.txt')
            fs.writeFileSync(latestSummaryPath, JSON.stringify({ logFile, summaryPath: jsonPath, summary }, null, 2), 'utf8')
            fs.writeFileSync(latestLogPathFile, logFile + '\n', 'utf8')
          } catch {/* ignore */}
          if (showFinalSummaryLine) console.log(`🧾 JSON summary written: ${jsonPath}`)
        })
      }
    } catch {/* ignore */}
    const writeCompleteSentinel = () => {
      // Write sentinel directly to both file streams (still open)
      let totals = ''
      if (summary && summary.totalTests != null) {
        totals = ` files=${summary.totalFiles} tests=${summary.totalTests} failed=${summary.totalFailed}`
      }
      const sentinelLine = `[TEST-RUN-COMPLETE]${totals} exitCode=${exitCode} summaryJson=${jsonPathPlanned}`
      const guidanceLine = 'copilot: You may stop tailing now; final summary JSON written. Parse summaryJson for structured results.'
      try { rawOut.write(sentinelLine + '\n') } catch {}
      try { out.write(sentinelLine + '\n') } catch {}
      try { rawOut.write(guidanceLine + '\n') } catch {}
      try { out.write(guidanceLine + '\n') } catch {}
      return { sentinelLine, guidanceLine }
    }
    const finalize = () => {
      silent = false
      if (showFinalSummaryLine && summary && summary.totalTests != null) {
        console.log(`[TEST-RUN-SUMMARY] files=${summary.totalFiles} tests=${summary.totalTests} failed=${summary.totalFailed} exitCode=${exitCode}`)
      }
      console.log('[TEST-RUN-COMPLETE-TERMINAL] exitCode=' + exitCode + (terminalMode !== 'full' ? ' (stream suppressed; see log file sentinel)' : ''))
      process.exit(exitCode)
    }
    // Write sentinel BEFORE closing streams so tailing clients can detect completion
    writeCompleteSentinel()
    out.end(() => rawOut.end(() => finalize()))
    // Maintain pointer for raw log too
    try {
      writeFileSync(join(logDir, 'latest-raw-log-path.txt'), rawLogFile + '\n', 'utf8')
    } catch { /* ignore */ }
  }
})()
