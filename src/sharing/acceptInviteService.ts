import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from '../firebase/firebase'

/**
 * AcceptInviteRequest
 * deckId: Target deck to accept invitation for
 * tokenPlain: The invitation token from the email/link (client hashes it before sending)
 */
export interface AcceptInviteRequest {
  deckId: string
  tokenPlain: string
}

/**
 * AcceptInviteResponse
 * deckId: Deck ID the invite applies to
 * roleGranted: Granted role, if an upgrade/addition occurred (undefined if already had equal/higher role)
 * alreadyHadRole: True if user already had equal/higher access; server marks invite accepted idempotently
 */
export interface AcceptInviteResponse {
  deckId: string
  roleGranted?: 'editor' | 'viewer'
  alreadyHadRole: boolean
}

function sha256Hex(input: string): string {
  // Minimal hashing via Web Crypto; in tests we mock this function
  // Note: In Node.js under Vitest (jsdom), crypto.subtle may be available; otherwise mocked.
  const encoder = new TextEncoder()
  const subtle = typeof globalThis !== 'undefined' && (globalThis as any).crypto && (globalThis as any).crypto.subtle
  if (!subtle) throw new Error('crypto.subtle not available')
  const data = encoder.encode(input)
  // Convert ArrayBuffer to hex
  const toHex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('')
  // Caller must await this; wrap in a fake sync for TypeScript. We'll implement async API below.
  throw new Error('sha256Hex requires async environment')
}

export async function sha256HexAsync(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const subtle = typeof globalThis !== 'undefined' && (globalThis as any).crypto && (globalThis as any).crypto.subtle
  if (!subtle) throw new Error('crypto.subtle not available')
  const data = encoder.encode(input)
  const digest = await subtle.digest('SHA-256', data)
  const hex = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2,'0')).join('')
  return hex
}

/**
 * acceptInvite
 * Hashes the plain invite token client-side, then calls the callable `acceptInvite`.
 * Returns server contract with roleGranted if applicable and alreadyHadRole flag.
 */
export async function acceptInvite({ deckId, tokenPlain }: AcceptInviteRequest): Promise<AcceptInviteResponse> {
  const functions = getFunctions(app)
  const callable = httpsCallable(functions, 'acceptInvite')
  const tokenHash = await sha256HexAsync(tokenPlain)
  const res: any = await callable({ deckId, tokenHash })
  return res.data as AcceptInviteResponse
}
