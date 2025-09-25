#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { createWriteStream } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(fileURLToPath(import.meta.url)) + '/..'

const start = Date.now()
let stdoutBuf = ''
let stderrBuf = ''

const cmd = 'firebase'
const args = ['emulators:exec', '--only', 'firestore,functions', '--project', 'notecards-1b054', '--', 'npx', 'vitest', 'run', '--dir', 'functions', '--config', 'functions/vitest.config.ts']

const child = spawn(cmd, args, { cwd: root, shell: true, stdio: ['ignore','pipe','pipe'] })

child.stdout.on('data', d => { process.stdout.write(d); stdoutBuf += d.toString() })
child.stderr.on('data', d => { process.stderr.write(d); stderrBuf += d.toString() })

child.on('close', code => {
  const durationMs = Date.now() - start
  const result = {
    type: 'functions-tests',
    exitCode: code,
    durationMs,
    timestamp: new Date().toISOString(),
  }
  const json = JSON.stringify(result)
  console.log('\n[TEST-RUN-COMPLETE] ' + json)
  process.exit(code ?? 1)
})
