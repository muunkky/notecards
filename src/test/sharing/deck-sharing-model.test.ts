import { describe, it, expect } from 'vitest'
import { mergeAccessibleDecks } from '../../sharing/mergeAccessibleDecks'
import { createMockDeck } from '../utils/test-factories'
import { FEATURE_DECK_SHARING } from '../../types'

// NOTE: This suite focuses on pure model helpers (Phase 1 sharing design doc)

describe('mergeAccessibleDecks', () => {
  it('returns empty when both inputs are empty', () => {
    expect(mergeAccessibleDecks([], [])).toEqual([])
  })

  it('returns primary when secondary empty', () => {
    const d1 = createMockDeck({ id: 'a' })
    const d2 = createMockDeck({ id: 'b' })
    expect(mergeAccessibleDecks([d1, d2], [])).toEqual([d1, d2])
  })

  it('returns secondary when primary empty', () => {
    const d1 = createMockDeck({ id: 'a' })
    expect(mergeAccessibleDecks([], [d1])).toEqual([d1])
  })

  it('dedupes overlapping decks preferring primary ordering', () => {
    const shared = createMockDeck({ id: 'x', title: 'Shared' })
    const p = createMockDeck({ id: 'p' })
    const s = createMockDeck({ id: 's' })
    const merged = mergeAccessibleDecks([shared, p], [shared, s])
    expect(merged.map(d => d.id)).toEqual(['x', 'p', 's'])
  })
})

describe('Deck sharing type defaults', () => {
  it('feature flag is defined (toggle ready)', () => {
    expect(typeof FEATURE_DECK_SHARING).toBe('boolean')
  })
})
