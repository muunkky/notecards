import { describe, expect, test } from 'vitest'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFile } from 'node:child_process'

const projectRoot = process.cwd()

function runSetup(envOverrides = {}) {
  return new Promise((resolve) => {
    const child = execFile('node', ['scripts/setup-service-account.mjs'], {
      cwd: projectRoot,
      env: { ...process.env, ...envOverrides },
      encoding: 'utf8'
    }, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr })
    })
  })
}

describe('service-account setup script', () => {
  test('fails with guidance when the key is missing', async () => {
    const workDir = mkdtempSync(join(tmpdir(), 'svc-auth-missing-'))
    const keyPath = join(workDir, 'sa.json')

    const { error, stdout } = await runSetup({ FIREBASE_SERVICE_ACCOUNT_PATH: keyPath })

    expect(error).toBeTruthy()
    expect(error?.code).toBe(1)
    expect(stdout).toContain('[service-account-setup] Missing service account key')
    expect(stdout).toContain(keyPath)

    rmSync(workDir, { recursive: true, force: true })
  })

  test('reports ready when the key exists', async () => {
    const workDir = mkdtempSync(join(tmpdir(), 'svc-auth-ready-'))
    const keyPath = join(workDir, 'sa.json')
    writeFileSync(keyPath, JSON.stringify({ project_id: 'demo', client_email: 'svc@example.com', private_key: '-----BEGIN PRIVATE KEY-----\nABC\n-----END PRIVATE KEY-----\n' }))

    const { error, stdout } = await runSetup({ FIREBASE_SERVICE_ACCOUNT_PATH: keyPath })

    expect(error).toBeNull()
    expect(stdout).toContain('[service-account-setup] Ready')
    expect(stdout).toContain(keyPath)

    rmSync(workDir, { recursive: true, force: true })
  })
})

