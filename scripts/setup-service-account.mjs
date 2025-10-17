#!/usr/bin/env node
import { accessSync, constants, readFileSync } from 'node:fs'
import { resolve, isAbsolute, relative } from 'node:path'

const PREFIX = '[service-account-setup]'

function resolveKeyPath() {
  const rawEnv = (process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '').trim()
  if (rawEnv.length > 0) {
    return isAbsolute(rawEnv) ? rawEnv : resolve(process.cwd(), rawEnv)
  }
  return resolve(process.cwd(), 'auth', 'keys', 'service-account-key.json')
}

function log(message = '') {
  console.log(`${PREFIX} ${message}`.trimEnd())
}

function exitWith(code) {
  process.exitCode = code
}

function printHeader(targetPath) {
  log('Service account setup helper')
  log(`Project root: ${process.cwd()}`)
  log(`Expected key path: ${targetPath}`)
  log(`Relative path: ${relative(process.cwd(), targetPath)}`)
  console.log('')
}

function printSuccess(targetPath, summary) {
  log('Ready - credentials detected.')
  log(`Using key at: ${targetPath}`)
  log(`Project ID: ${summary.projectId}`)
  log(`Client email: ${summary.clientEmail}`)
  console.log('')
  log('Next steps: run npm run test:e2e or the specific integration test to verify end-to-end.')
}

function printMissing(targetPath) {
  log('Missing service account key.')
  log(`Copy your Firebase service-account JSON to: ${targetPath}`)
  console.log('')
  log('Checklist:')
  log('  1. Visit Firebase console > Settings > Service accounts.')
  log('  2. Generate a new private key (JSON).')
  log('  3. Store it at the path above or export FIREBASE_SERVICE_ACCOUNT_PATH.')
  log('  4. Re-run npm run auth:service-setup until this script reports Ready.')
}

function handleInvalidJSON(targetPath, error) {
  log('Service account file found but could not be parsed.')
  log(`Path: ${targetPath}`)
  log(`Reason: ${error.message}`)
  console.log('')
  log('Ensure the JSON is not encrypted or truncated, then re-run the setup command.')
}

function handleMissingFields(targetPath) {
  log('Service account file is missing required fields (project_id, client_email, private_key).')
  log(`Path: ${targetPath}`)
  console.log('')
  log('Download a fresh key from Firebase and replace the current file.')
}

function main() {
  const targetPath = resolveKeyPath()
  printHeader(targetPath)

  try {
    accessSync(targetPath, constants.R_OK)
  } catch (error) {
    printMissing(targetPath)
    exitWith(1)
    return
  }

  let json
  try {
    const raw = readFileSync(targetPath, 'utf8')
    json = JSON.parse(raw)
  } catch (error) {
    handleInvalidJSON(targetPath, error)
    exitWith(1)
    return
  }

  const projectId = json.project_id
  const clientEmail = json.client_email
  const privateKey = json.private_key

  if (!projectId || !clientEmail || !privateKey) {
    handleMissingFields(targetPath)
    exitWith(1)
    return
  }

  printSuccess(targetPath, { projectId, clientEmail })
  exitWith(0)
}

main()
