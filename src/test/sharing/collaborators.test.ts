import { describe, it, expect, beforeEach } from 'vitest'
import { addCollaborator, removeCollaborator, listCollaborators } from '../../sharing/collaborators'
import { createMockDeck } from '../utils/test-factories'
import type { Deck } from '../../types'

// Simple in-memory deck store mock (avoids Firestore for unit scope)
let deck: Deck

beforeEach(() => {
  deck = createMockDeck({ id: 'deck-1', ownerId: 'owner-1', roles: { 'owner-1': 'owner' }, collaboratorIds: [] })
})

describe('collaborators service helpers', () => {
  it('adds a new collaborator with provided role (editor)', () => {
    const updated = addCollaborator(deck, 'user-2', 'editor')
    expect(updated.collaboratorIds).toContain('user-2')
    expect(updated.roles?.['user-2']).toBe('editor')
    // Original deck not mutated (immutability)
    expect(deck.collaboratorIds).not.toContain('user-2')
  })

  it('is idempotent when adding existing collaborator with same role', () => {
    const once = addCollaborator(deck, 'user-3', 'viewer')
    const twice = addCollaborator(once, 'user-3', 'viewer')
  expect(twice.collaboratorIds && twice.collaboratorIds.filter((id: string) => id === 'user-3').length).toBe(1)
  })

  it('updates role if different role is supplied for existing collaborator', () => {
    const once = addCollaborator(deck, 'user-4', 'viewer')
    const updated = addCollaborator(once, 'user-4', 'editor')
    expect(updated.roles?.['user-4']).toBe('editor')
  })

  it('removeCollaborator removes id and role mapping (non-owner)', () => {
    const withUser = addCollaborator(deck, 'user-5', 'viewer')
    const afterRemove = removeCollaborator(withUser, 'user-5')
    expect(afterRemove.collaboratorIds).not.toContain('user-5')
    expect(afterRemove.roles?.['user-5']).toBeUndefined()
  })

  it('removeCollaborator is idempotent for non-existent collaborator', () => {
    const afterRemove = removeCollaborator(deck, 'ghost')
    expect(afterRemove).toEqual(deck)
  })

  it('listCollaborators returns derived structure excluding owner', () => {
    const withMany = addCollaborator(addCollaborator(deck, 'u1', 'viewer'), 'u2', 'editor')
    const list = listCollaborators(withMany)
  expect(list.map((c: any) => c.userId).sort()).toEqual(['u1', 'u2'])
  })
})
