#!/usr/bin/env node
import { mkdirSync, existsSync, createWriteStream } from 'node:fs'
import { join } from 'node:path'

// Force plain, non-interactive output for clean log files
const NO_COLOR = process.env.NO_COLOR || '1'
process.env.NO_COLOR = NO_COLOR
// CI disables interactive spinner / dynamic line rewrites in Vitest
if (!process.env.CI) process.env.CI = '1'

const logDir = join(process.cwd(), 'log', 'temp')
if (!existsSync(logDir)) {
  mkdirSync(logDir, { recursive: true })
}

const timestamp = new Date().toISOString().replace(/[:T]/g, '-').replace(/\..+/, '')
const logFile = join(logDir, `test-results-${timestamp}.log`)

console.log(`📝 Writing test output to ${logFile}`)

const out = createWriteStream(logFile, { flags: 'a' })

// Allow passing additional vitest args (e.g., file patterns, -t test name)
// Usage: npm run test:log -- path/to/test -t "name"
const extraArgs = process.argv.slice(2)

// Monkey-patch stdout/stderr write to tee output into file (simpler than spawning child process)
const originalStdoutWrite = process.stdout.write.bind(process.stdout)
const originalStderrWrite = process.stderr.write.bind(process.stderr)

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
  try { out.write(stripAnsi(chunk)) } catch { /* ignore */ }
  return originalStdoutWrite(chunk, encoding, cb)
}
process.stderr.write = (chunk, encoding, cb) => {
  try { out.write(stripAnsi(chunk)) } catch { /* ignore */ }
  return originalStderrWrite(chunk, encoding, cb)
}

console.log(`▶️  Executing vitest programmatic API: run ${extraArgs.join(' ')}`)

// Dynamic import to avoid issues if vitest not installed
;(async () => {
  let exitCode = 0
  try {
    const { startVitest } = await import('vitest/node')
    const ctx = await startVitest('run', extraArgs, { watch: false })
    // Wait for completion (ctx may expose state) – rely on process exit code determined by vitest
    // If failures exist, determine exit code from reported results
    const failures = ctx?.state?.getFiles()?.filter(f => f.result?.state === 'fail').length || 0
    exitCode = failures > 0 ? 1 : 0
  } catch (err) {
    console.error('[vitest-error]', err?.message || err)
    exitCode = 1
  } finally {
    out.end(() => {
      if (exitCode === 0) {
        console.log(`✅ Tests completed successfully. Log: ${logFile}`)
        process.exit(0)
      } else {
        console.error(`❌ Tests failed. See log: ${logFile}`)
        process.exit(exitCode)
      }
    })
  }
})()
