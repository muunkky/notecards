import { Deck } from '../types'

/**
 * mergeAccessibleDecks
 * Deterministically merge two deck arrays (e.g. owned + collaborating) while
 * preserving stable ordering and removing duplicates by id.
 * Later we can extend with sorting strategies; for now preserve left-to-right first-seen.
 */
export function mergeAccessibleDecks(primary: Deck[], secondary: Deck[]): Deck[] {
  if (!primary.length && !secondary.length) return []
  const seen = new Set<string>()
  const result: Deck[] = []

  const pushUnique = (d: Deck) => {
    if (!seen.has(d.id)) {
      seen.add(d.id)
      result.push(d)
    }
  }
  primary.forEach(pushUnique)
  secondary.forEach(pushUnique)
  return result
}
