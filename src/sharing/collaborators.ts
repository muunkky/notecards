import type { Deck, DeckRole } from '../types'

export interface CollaboratorInfo {
  userId: string
  role: DeckRole
}

// addCollaborator returns a new Deck object (immutability) with collaborator added/updated
export function addCollaborator(deck: Deck, userId: string, role: DeckRole): Deck {
  if (userId === deck.ownerId) return deck // owner implicitly has access
  const collaboratorIds = deck.collaboratorIds ? [...deck.collaboratorIds] : []
  const roles = { ...(deck.roles || { [deck.ownerId]: 'owner' as DeckRole }) }

  if (!collaboratorIds.includes(userId)) {
    collaboratorIds.push(userId)
  }
  if (roles[userId] !== role) {
    roles[userId] = role
  }
  return { ...deck, collaboratorIds, roles }
}

export function removeCollaborator(deck: Deck, userId: string): Deck {
  if (!deck.collaboratorIds || !deck.collaboratorIds.includes(userId)) return deck
  const collaboratorIds = deck.collaboratorIds.filter(id => id !== userId)
  const roles = { ...(deck.roles || {}) }
  delete roles[userId]
  return { ...deck, collaboratorIds, roles }
}

export function listCollaborators(deck: Deck): CollaboratorInfo[] {
  const roles = deck.roles || {}
  return Object.entries(roles)
    .filter(([uid, role]) => uid !== deck.ownerId && (role === 'viewer' || role === 'editor'))
    .map(([userId, role]) => ({ userId, role: role as DeckRole }))
}
