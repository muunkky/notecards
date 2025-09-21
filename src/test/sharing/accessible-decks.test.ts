import { describe, it, expect, vi, beforeEach } from 'vitest'
import { subscribeToAccessibleDecks } from '@/sharing/accessibleDecks'
import { createMockDeck } from '../utils/test-factories'

interface SubscriptionHandle { unsubscribe: () => void }


// We'll simulate two underlying streams: owned and collaborator decks.
let ownedEmit: (decks: any[]) => void
let collabEmit: (decks: any[]) => void
let unsubscribeOwned = vi.fn()
let unsubscribeCollab = vi.fn()

// Provide a lightweight injector pattern by monkey-patching a symbol the implementation exports.
// (Implementation will look for globalThis.__testAccessibleDecksHooks when present.)

beforeEach(() => {
  unsubscribeOwned = vi.fn()
  unsubscribeCollab = vi.fn()
  ownedEmit = () => {}
  collabEmit = () => {}
  ;(globalThis as any).__testAccessibleDecksHooks = {
    subscribeOwned: (userId: string, cb: (d: any[]) => void) : SubscriptionHandle => {
      ownedEmit = cb
      return { unsubscribe: unsubscribeOwned }
    },
    subscribeCollaborating: (userId: string, cb: (d: any[]) => void): SubscriptionHandle => {
      collabEmit = cb
      return { unsubscribe: unsubscribeCollab }
    }
  }
})

describe('subscribeToAccessibleDecks', () => {
  it('emits combined list after both streams emit, preserving primary ordering and deduping', () => {
    const events: string[][] = []
    const stop = subscribeToAccessibleDecks('u1', (decks: any[]) => {
      events.push(decks.map(d => d.id))
    })
    const ownedA = createMockDeck({ id: 'd1', ownerId: 'u1' })
    const ownedB = createMockDeck({ id: 'd2', ownerId: 'u1' })
    ownedEmit([ownedA, ownedB])
    // collaborator arrives with overlap + new deck
    const sharedOverlap = createMockDeck({ id: 'd2', ownerId: 'other', roles: { other: 'owner', u1: 'viewer' }, collaboratorIds: ['u1'] })
    const sharedNew = createMockDeck({ id: 'd3', ownerId: 'other', roles: { other: 'owner', u1: 'editor' }, collaboratorIds: ['u1'] })
    collabEmit([sharedOverlap, sharedNew])
    expect(events.pop()).toEqual(['d1', 'd2', 'd3'])
    stop.unsubscribe()
  })

  it('updates downstream when an underlying stream changes', () => {
    const events: string[][] = []
  const stop = subscribeToAccessibleDecks('u1', (decks: any[]) => events.push(decks.map(d => d.id)))
    ownedEmit([createMockDeck({ id: 'o1', ownerId: 'u1' })])
    collabEmit([createMockDeck({ id: 'c1', ownerId: 'x', collaboratorIds: ['u1'], roles: { x: 'owner', u1: 'viewer' } })])
    // simulate removal from collaborator stream
    collabEmit([])
    expect(events.at(-1)).toEqual(['o1'])
    stop.unsubscribe()
  })

  it('unsubscribes both internal subscriptions', () => {
    const stop = subscribeToAccessibleDecks('u1', () => {})
    stop.unsubscribe()
    expect(unsubscribeOwned).toHaveBeenCalled()
    expect(unsubscribeCollab).toHaveBeenCalled()
  })
})
