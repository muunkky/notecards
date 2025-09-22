#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

// Headless Firestore rules test runner (revised).
// Strategy: Use firebase emulators:exec which manages lifecycle & ensures emulator is ready before tests run.
// We set RULES_TESTS to skip global Firestore mocks and rely on dedicated vitest.rules.config.ts.

const vitestArgs = process.argv.slice(2)

function run(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32', ...options })
    child.on('exit', (code) => {
      if (code === 0) resolve(code); else reject(new Error(`${cmd} ${args.join(' ')} exited with ${code}`))
    })
  })
}

const project = process.env.FIREBASE_PROJECT_ID || 'notecards-1b054'
const host = '127.0.0.1'
const port = 8080

async function main() {
  process.env.FIRESTORE_EMULATOR_HOST = `${host}:${port}`
  process.env.RULES_TESTS = 'true'

  console.log(`[rules-tests] Starting Firestore emulator (project: ${project})`)

  const emulator = spawn('firebase', [
    'emulators:start',
    '--only', 'firestore',
    '--project', project
  ], { stdio: 'pipe', shell: process.platform === 'win32' })

  let ready = false
  let testsRun = false

  emulator.stdout.on('data', async (buf) => {
    const text = buf.toString()
    process.stdout.write(text)
    if (!ready && /All emulators ready|It is now safe to connect your app/i.test(text)) {
      ready = true
      console.log('[rules-tests] Detected emulator readiness banner')
      await waitForPort('127.0.0.1', 8080, 15_000)
      await runTests()
    }
  })
  emulator.stderr.on('data', (buf) => process.stderr.write(buf.toString()))
  emulator.on('exit', (code) => {
    if (!testsRun) {
      console.error(`[rules-tests] Emulator exited before tests ran (code ${code})`)
      process.exitCode = 1
    }
  })

  async function runTests() {
    if (testsRun) return
    testsRun = true
    try {
      console.log('[rules-tests] Running Vitest security rules suite...')
      await run('npx', ['vitest', 'run', '--config', 'vitest.rules.config.ts', '--reporter', 'default'])
      console.log('[rules-tests] Rules tests completed successfully')
    } catch (e) {
      console.error('[rules-tests] Rules tests failed:', e.message)
      process.exitCode = 1
    } finally {
      console.log('[rules-tests] Stopping emulator')
      emulator.kill('SIGINT')
    }
  }

  async function waitForPort(host, port, timeoutMs) {
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
      const ok = await probe(host, port)
      if (ok) return true
      await delay(300)
    }
    console.warn('[rules-tests] Port probe timed out; proceeding anyway')
    return false
  }

  async function probe(host, port) {
    return new Promise((resolve) => {
      try {
        const net = await import('node:net')
        const socket = net.createConnection({ host, port })
        socket.setTimeout(1500)
        socket.on('connect', () => { socket.destroy(); resolve(true) })
        socket.on('error', () => { socket.destroy(); resolve(false) })
        socket.on('timeout', () => { socket.destroy(); resolve(false) })
      } catch {
        resolve(false)
      }
    })
  }
}

main().catch(e => { console.error(e); process.exit(1) })
