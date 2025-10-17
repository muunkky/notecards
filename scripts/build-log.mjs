import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0,19)
const dir = join('log','temp')
if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
const logPath = join(dir, `build-output-${ts}.log`)

console.log(`[build-log] Writing build output to ${logPath}`)

// Run tsc then vite build sequentially capturing output
function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ['ignore','pipe','pipe'], shell: process.platform === 'win32' })
    child.stdout.on('data', d => { buffer += d })
    child.stderr.on('data', d => { buffer += d })
    child.on('close', code => code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`)))
  })
}

(async () => {
  try {
    await run('npx', ['tsc'])
    await run('npx', ['vite','build'])
  } catch (e) {
    console.error('[build-log] Build failed:', e.message)
  } finally {
    writeFileSync(logPath, buffer)
    const exitCode = /Build failed:/.test(buffer) ? 1 : 0
    console.log(`[build-log] Log saved to ${logPath}`)
    if (exitCode !== 0) {
      const lines = buffer.trim().split(/\r?\n/)
      console.log(lines.slice(-20).join('\n'))
    }
    process.exit(exitCode)
  }
})()
let buffer = ''