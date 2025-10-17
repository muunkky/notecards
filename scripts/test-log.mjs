import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0,19)
const dir = join('log','temp')
if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
const logPath = join(dir, `test-output-${ts}.log`)

let buffer = ''
console.log(`[test-log] Writing test output to ${logPath}`)

const child = spawn('npx', ['vitest', 'run'], { stdio: ['ignore','pipe','pipe'], shell: process.platform === 'win32' })
child.stdout.on('data', d => { const s = d.toString(); buffer += s; process.stdout.write(s) })
child.stderr.on('data', d => { const s = d.toString(); buffer += s; process.stderr.write(s) })
child.on('close', code => {
  writeFileSync(logPath, buffer)
  console.log(`[test-log] Log saved to ${logPath}`)
  if (code !== 0) {
    const lines = buffer.trim().split(/\r?\n/)
    console.log('[test-log] Last 30 lines:')
    console.log(lines.slice(-30).join('\n'))
  }
  process.exit(code)
})