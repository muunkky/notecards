#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { mkdirSync, existsSync, createWriteStream } from 'node:fs'
import { join } from 'node:path'

const NO_COLOR = process.env.NO_COLOR || '1'
process.env.NO_COLOR = NO_COLOR

const logDir = join(process.cwd(), 'log', 'temp')
if (!existsSync(logDir)) {
  mkdirSync(logDir, { recursive: true })
}

const timestamp = new Date().toISOString().replace(/[:T]/g, '-').replace(/\..+/, '')
const logFile = join(logDir, `test-results-${timestamp}.log`)

console.log(`📝 Writing test output to ${logFile}`)

const out = createWriteStream(logFile, { flags: 'a' })

// Allow passing additional vitest args (e.g., file patterns, -t test name) via:
// npm run test:log -- src/test/foo.test.tsx -t "should do X"
const extraArgs = process.argv.slice(2)
const vitestArgs = ['vitest', 'run', ...extraArgs]
console.log(`▶️  Executing: npx ${vitestArgs.join(' ')}`)

const child = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', vitestArgs, {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: process.env
})

child.stdout.pipe(out)
child.stderr.pipe(out)

child.on('close', (code) => {
  out.end(() => {
    if (code === 0) {
      console.log(`✅ Tests completed successfully. Log: ${logFile}`)
    } else {
      console.error(`❌ Tests exited with code ${code}. See log: ${logFile}`)
      process.exit(code)
    }
  })
})
