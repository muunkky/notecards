#!/usr/bin/env node
/**
 * Polls a test log (sanitized) until the completion sentinel appears.
 * Usage:
 *   node scripts/wait-for-test-complete.mjs            # auto-detect latest log via latest-log-path.txt
 *   node scripts/wait-for-test-complete.mjs <logPath>  # explicit log path
 * Options (env vars):
 *   INTERVAL_MS  polling interval (default 500)
 *   TIMEOUT_MS   give up after this many ms (default 300000 = 5m)
 */
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const logDir = join(process.cwd(), 'log', 'temp')
const argPath = process.argv[2]
const interval = parseInt(process.env.INTERVAL_MS || '500', 10)
const timeoutMs = parseInt(process.env.TIMEOUT_MS || '300000', 10)

function resolveLogPath() {
  if (argPath) return argPath
  const pointer = join(logDir, 'latest-log-path.txt')
  if (!existsSync(pointer)) return null
  try {
    const p = readFileSync(pointer, 'utf8').trim()
    return p || null
  } catch { return null }
}

function readFileSafe(p) {
  try { return readFileSync(p, 'utf8') } catch { return '' }
}

function parseSentinel(line) {
  // Example: [TEST-RUN-COMPLETE] files=26 tests=238 failed=0 exitCode=0 summaryJson=...path...
  if (!line.startsWith('[TEST-RUN-COMPLETE]')) return null
  const parts = line.replace('[TEST-RUN-COMPLETE]', '').trim().split(/\s+/)
  const data = {}
  for (const part of parts) {
    const [k, v] = part.split('=')
    if (k && v !== undefined) data[k] = v
  }
  return data
}

const start = Date.now()
let printedWaitingMsg = false

async function loop() {
  const logPath = resolveLogPath()
  if (!logPath) {
    if (!printedWaitingMsg) {
      console.log('[wait] Waiting for latest-log-path.txt to appear...')
      printedWaitingMsg = true
    }
  } else if (!existsSync(logPath)) {
    if (!printedWaitingMsg) {
      console.log(`[wait] Log file not found yet: ${logPath}`)
      printedWaitingMsg = true
    }
  } else {
    const content = readFileSafe(logPath)
    const lines = content.split(/\n/).filter(Boolean)
    const sentinelLine = lines.find(l => l.startsWith('[TEST-RUN-COMPLETE]'))
    if (sentinelLine) {
      const meta = parseSentinel(sentinelLine)
      console.log(sentinelLine)
      if (meta?.summaryJson && existsSync(meta.summaryJson)) {
        const summaryRaw = readFileSafe(meta.summaryJson)
        try {
          const summary = JSON.parse(summaryRaw)
          console.log('[summary.json]', meta.summaryJson)
          console.log(JSON.stringify(summary, null, 2))
          process.exit(meta.exitCode ? parseInt(meta.exitCode, 10) : 0)
        } catch {
          console.log('[warn] Failed to parse summary JSON, printing raw:')
          console.log(summaryRaw.slice(0, 5000))
        }
      } else {
        console.log('[warn] summaryJson path missing or not found; completion sentinel detected regardless.')
      }
      process.exit(meta.exitCode ? parseInt(meta.exitCode, 10) : 0)
    }
  }
  if (Date.now() - start > timeoutMs) {
    console.error(`[error] Timeout (${timeoutMs} ms) waiting for [TEST-RUN-COMPLETE].`) // non-zero exit
    process.exit(2)
  }
  setTimeout(loop, interval)
}

loop()
