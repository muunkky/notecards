#!/usr/bin/env node
import { spawn, exec } from 'node:child_process'
import net from 'node:net'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const root = path.dirname(fileURLToPath(import.meta.url)) + '/..'

const start = Date.now()
const extraArgs = process.argv.slice(2)

// Transform args for Vitest to improve Windows compatibility and nicer API:
// - Map '-t' to '--testNamePattern'
// - Support optional '--name' as alias for test name pattern
const vitestTransformedArgs = []
for (let i = 0; i < extraArgs.length; i++) {
  const a = extraArgs[i]
  if (a === '-t' || a === '--name' || a === '--testName') {
    const val = extraArgs[i + 1]
    if (val != null && !val.startsWith('-')) {
      vitestTransformedArgs.push('--testNamePattern', val)
      i++
    } else {
      // If no value, just pass through '-t' (Vitest will handle error)
      vitestTransformedArgs.push('--testNamePattern')
    }
    continue
  }
  vitestTransformedArgs.push(a)
}

const PROJECT_ID = 'notecards-1b054'
const EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST?.split(':')[0] || '127.0.0.1'
const EMULATOR_PORT = Number(process.env.FIRESTORE_EMULATOR_HOST?.split(':')[1] || process.env.FIRESTORE_EMULATOR_PORT || 8080)

// Prepare logs directory and files
const pad = (n) => String(n).padStart(2,'0')
const ts = new Date()
const stamp = `${ts.getFullYear()}-${pad(ts.getMonth()+1)}-${pad(ts.getDate())}-${pad(ts.getHours())}-${pad(ts.getMinutes())}-${pad(ts.getSeconds())}`
const logDir = path.join(root, 'log', 'temp')
try { fs.mkdirSync(logDir, { recursive: true }) } catch {}
const sanitizedPath = path.join(logDir, `functions-tests-${stamp}.log`)
const rawPath = path.join(logDir, `functions-tests-${stamp}.raw.log`)
const summaryPath = path.join(logDir, `functions-tests-${stamp}.json`)

const rawStream = fs.createWriteStream(rawPath)
const cleanStream = fs.createWriteStream(sanitizedPath)

// Simple ANSI stripper for sanitized logs
const stripAnsi = (s) => s.replace(/\u001b\[[0-9;]*m/g, '')

// Print START sentinel with pointers
const startPayload = {
  type: 'functions-tests',
  status: 'RUNNING',
  startedAt: ts.toISOString(),
  cwd: root,
  command: `firebase emulators:start --only firestore --project ${PROJECT_ID}`,
  logs: { sanitizedPath, rawPath, summaryPath }
}
console.log('[TEST-RUN-START]')
console.log(JSON.stringify(startPayload, null, 2))
console.log('[TEST-RUN-MESSAGE-END]')

function pipe(child) {
  child.stdout.on('data', d => {
    const s = d.toString()
    rawStream.write(s)
    cleanStream.write(stripAnsi(s))
  })
  child.stderr.on('data', d => {
    const s = d.toString()
    rawStream.write(s)
    cleanStream.write(stripAnsi(s))
  })
}

// Helper: check if a port is open (a listener is present)
function isPortOpen(host, port, timeoutMs = 1000) {
  return new Promise(resolve => {
    const socket = new net.Socket()
    let settled = false
    const onDone = (v) => { if (!settled) { settled = true; try { socket.destroy() } catch {} ; resolve(v) } }
    socket.setTimeout(timeoutMs)
    socket.once('connect', () => onDone(true))
    socket.once('timeout', () => onDone(false))
    socket.once('error', () => onDone(false))
    try { socket.connect(port, host) } catch { onDone(false) }
  })
}

let ready = false
let vitestExit = 1
let emuClosed = false
let emu = null
let weStartedEmu = false

const READY = /All emulators ready|safe to connect/i
let buf = ''
let emuTimeout = null

// 1) Either connect to an already running emulator (port open) or start a new one
const preflight = await isPortOpen(EMULATOR_HOST, EMULATOR_PORT)
if (preflight) {
  // Assume emulator is already running on the expected host/port
  cleanStream.write(`Detected Firestore emulator on ${EMULATOR_HOST}:${EMULATOR_PORT}. Skipping start.\n`)
  ready = true
  runVitest()
} else {
  const emuArgs = ['emulators:start', '--only', 'firestore', '--project', PROJECT_ID]
  emu = spawn('firebase', emuArgs, { cwd: root, shell: true, stdio: ['pipe','pipe','pipe'] })
  weStartedEmu = true
  pipe(emu)
  emu.stdout.on('data', d => {
    buf += d.toString()
    if (!ready && READY.test(buf)) {
      ready = true
      runVitest()
    }
  })
  emu.on('close', code => {
    emuClosed = true
    if (!ready) return done(code ?? 1)
  })
  emuTimeout = setTimeout(() => {
    if (!ready) {
      cleanStream.write('Emulator did not become ready within 30s.\n')
      return done(1)
    }
  }, 30000)
}

// 2) Run Vitest against emulator
function runVitest() {
  if (emuTimeout) clearTimeout(emuTimeout)
  const vitestArgs = ['vitest','run','--config','functions/vitest.config.ts', ...vitestTransformedArgs]
  const env = { ...process.env, FIRESTORE_EMULATOR_HOST: `${EMULATOR_HOST}:${EMULATOR_PORT}`, GCLOUD_PROJECT: PROJECT_ID, GOOGLE_CLOUD_PROJECT: PROJECT_ID }
  cleanStream.write(`Running: npx ${vitestArgs.join(' ')}\n`)
  const vt = spawn('npx', vitestArgs, { cwd: root, shell: true, stdio: ['pipe','pipe','pipe'], env })
  pipe(vt)
  vt.on('close', code => { vitestExit = code ?? 1; stopEmu() })
}

// 3) Stop emulator cleanly
function stopEmu() {
  // If we didn't start the emulator, don't try to stop anything
  if (!weStartedEmu) return done(vitestExit)
  if (!emu || emuClosed) return done(vitestExit)
  try { emu.kill('SIGINT') } catch {}
  const killTimer = setTimeout(() => {
    if (process.platform === 'win32') {
      exec(`taskkill /PID ${emu.pid} /T /F`, () => done(vitestExit))
    } else {
      try { emu.kill('SIGKILL') } catch {}
      done(vitestExit)
    }
  }, 5000)
  emu.on('close', () => { clearTimeout(killTimer); done(vitestExit) })
}

function done(code) {
  const durationMs = Date.now() - start
  const result = { type: 'functions-tests', exitCode: code, durationMs, completedAt: new Date().toISOString(), logs: { sanitizedPath, rawPath, summaryPath } }
  try { fs.writeFileSync(summaryPath, JSON.stringify(result, null, 2)) } catch {}
  rawStream.end(); cleanStream.end()
  console.log(`\n[TEST-RUN-COMPLETE] ${JSON.stringify(result)}`)
  process.exit(code ?? 1)
}
