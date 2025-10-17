import { prepareServiceAccountAuth, loadServiceAccountCredentials } from '../../../../services/service-account-auth.mjs'

export async function hasServiceAccountCredentials() {
  try {
    await loadServiceAccountCredentials()
    return true
  } catch (error) {
    console.warn('[service-account] ' + error.message)
    return false
  }
}

export async function createServiceAccountToken(options = {}) {
  return prepareServiceAccountAuth(options)
}
