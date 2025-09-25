import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import { acceptInviteCore } from './acceptInviteCore'

// Initialize admin SDK once
try {
  admin.app()
} catch {
  admin.initializeApp()
}

/**
 * Placeholder acceptInvite callable. Will be fully implemented with validation and transaction.
 */
export const acceptInvite = functions.https.onCall(async (req) => {
  const uid = req.auth?.uid
  if (!uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required')
  }
  const { deckId, tokenHash } = (req.data as any) || {}
  if (!deckId || !tokenHash) {
    throw new functions.https.HttpsError('invalid-argument', 'deckId and tokenHash are required')
  }
  try {
    return await acceptInviteCore({ deckId, tokenHash, uid })
  } catch (e: any) {
    if (e?.code && typeof e.code === 'string') {
      throw new functions.https.HttpsError('failed-precondition', e.message, { code: e.code })
    }
    throw new functions.https.HttpsError('internal', 'acceptInvite failed')
  }
})
