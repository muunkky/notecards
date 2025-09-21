import type { Deck } from '../types'
import { mergeAccessibleDecks } from './mergeAccessibleDecks'
import { subscribeToUserDecks } from '../firebase/firestore'

/**
 * Test hook injection interface (used only in unit tests to mock underlying streams)
 */
interface TestHooks {
  subscribeOwned: (userId: string, cb: (decks: Deck[]) => void) => { unsubscribe: () => void }
  subscribeCollaborating: (userId: string, cb: (decks: Deck[]) => void) => { unsubscribe: () => void }
}

/**
 * Subscribes to all decks the user can access (owned + collaborating).
 * For now, collaborating stream is a placeholder empty array until rules + query are active.
 * Returns a handle with an unsubscribe method.
 */
export function subscribeToAccessibleDecks(
  userId: string,
  onChange: (decks: Deck[]) => void,
  onError?: (err: any) => void
): { unsubscribe: () => void } {
  const testHooks: TestHooks | undefined = (globalThis as any).__testAccessibleDecksHooks
  let ownedDecks: Deck[] = []
  let collabDecks: Deck[] = []

  const emit = () => {
    onChange(mergeAccessibleDecks(ownedDecks, collabDecks))
  }

  const ownedSub = (testHooks
    ? testHooks.subscribeOwned(userId, d => { ownedDecks = d; emit() })
    : subscribeToUserDecks(userId, d => { ownedDecks = d; emit() }, onError))

  const collabSub = (testHooks
    ? testHooks.subscribeCollaborating(userId, d => { collabDecks = d; emit() })
    : { unsubscribe: () => { /* placeholder until collaborating query active */ } })

  const callUnsub = (u: any) => {
    if (!u) return
    if (typeof u === 'function') { u(); return }
    if (typeof u.unsubscribe === 'function') { u.unsubscribe(); return }
  }

  return {
    unsubscribe: () => {
      callUnsub(ownedSub)
      callUnsub(collabSub)
    }
  }
}
