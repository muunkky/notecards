import { readFile } from 'node:fs/promises'
import { access } from 'node:fs/promises'
import { constants } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ADMIN_APP_NAME = 'notecards-service-account'
let firebaseAdminModule = null
let cachedAdminApp = null

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const DEFAULT_SERVICE_ACCOUNT_PATH = './auth/keys/service-account-key.json'

function sanitizePrivateKey(key) {
  return key.includes('\n') ? key.replace(/\\n/g, '\n') : key
}

export async function resolveServiceAccountPath() {
  const envPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  const relativePath = envPath && envPath.trim().length > 0 ? envPath.trim() : DEFAULT_SERVICE_ACCOUNT_PATH
  return resolve(process.cwd(), relativePath)
}

async function ensureFileReadable(path) {
  await access(path, constants.R_OK)
}

export async function loadServiceAccountCredentials() {
  const serviceAccountPath = await resolveServiceAccountPath()

  try {
    await ensureFileReadable(serviceAccountPath)
  } catch (error) {
    throw new Error(`Service account file not found or unreadable at ${serviceAccountPath}. Set FIREBASE_SERVICE_ACCOUNT_PATH or run npm run auth:service-setup.`)
  }

  let raw
  try {
    raw = await readFile(serviceAccountPath, 'utf8')
  } catch (error) {
    throw new Error(`Failed to read service account file at ${serviceAccountPath}: ${error.message}`)
  }

  let credentials
  try {
    credentials = JSON.parse(raw)
  } catch (error) {
    throw new Error(`Service account file at ${serviceAccountPath} is not valid JSON: ${error.message}`)
  }

  const { project_id: projectId, client_email: clientEmail, private_key: privateKey } = credentials

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Service account file must include project_id, client_email, and private_key fields.')
  }

  return {
    projectId,
    clientEmail,
    privateKey: sanitizePrivateKey(privateKey),
    credentials,
    serviceAccountPath
  }
}

async function importFirebaseAdmin() {
  if (firebaseAdminModule) {
    return firebaseAdminModule
  }

  try {
    firebaseAdminModule = await import('firebase-admin')
    return firebaseAdminModule
  } catch (error) {
    if (error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('firebase-admin is not installed. Run `npm install firebase-admin` to enable service-account authentication.')
    }
    throw error
  }
}

export async function ensureFirebaseAdmin(credentials) {
  const admin = await importFirebaseAdmin()

  if (cachedAdminApp) {
    return { admin, app: cachedAdminApp }
  }

  const { projectId, clientEmail, privateKey } = credentials

  try {
    cachedAdminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey
      })
    }, ADMIN_APP_NAME)
  } catch (error) {
    if (error.message && error.message.includes('already exists')) {
      cachedAdminApp = admin.app(ADMIN_APP_NAME)
    } else {
      throw error
    }
  }

  return { admin, app: cachedAdminApp }
}

export async function createServiceAccountToken({ userEmail, additionalClaims = {} } = {}) {
  const { projectId, clientEmail, privateKey } = await loadServiceAccountCredentials()
  const { admin, app } = await ensureFirebaseAdmin({ projectId, clientEmail, privateKey })

  const auth = admin.auth(app)
  const uid = userEmail || process.env.E2E_TEST_USER_UID || clientEmail

  const claims = {
    serviceAccountAuth: true,
    email: userEmail || clientEmail,
    ...additionalClaims
  }

  const token = await auth.createCustomToken(uid, claims)
  return {
    token,
    projectId,
    clientEmail,
    userEmail: claims.email
  }
}

export async function signInWithCustomToken(page, token, { timeoutMs = 60000 } = {}) {
  if (!page) {
    throw new Error('Puppeteer page instance is required for service-account sign-in.')
  }

  return page.evaluate(async (customToken, timeout) => {
    const auth = window.firebaseAuth || (window.firebase && window.firebase.auth && window.firebase.auth())
    if (!auth) {
      throw new Error('window.firebaseAuth is not available. Ensure the app exposes Firebase auth on window.')
    }

    await auth.signInWithCustomToken(customToken)

    return await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Timed out waiting for Firebase authentication to complete.'))
      }, timeout)

      const unsubscribe = auth.onAuthStateChanged(user => {
        if (user) {
          clearTimeout(timer)
          unsubscribe()
          resolve({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || null
          })
        }
      }, error => {
        clearTimeout(timer)
        unsubscribe()
        reject(error)
      })
    })
  }, token, timeoutMs)
}

export async function prepareServiceAccountAuth(options = {}) {
  const {
    userEmail = process.env.E2E_TEST_USER_EMAIL,
    claims = {}
  } = options

  const tokenInfo = await createServiceAccountToken({ userEmail, additionalClaims: claims })
  return tokenInfo
}
