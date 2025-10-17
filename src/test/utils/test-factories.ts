import type { 
  Deck, 
  Card, 
  OrderSnapshot, 
  DeckData, 
  CardData, 
  OrderSnapshotData,
  UserData,
  ApiResponse 
} from '../../types'

// Factory function to create mock deck data
export const createMockDeck = (overrides: Partial<Deck> = {}): Deck => ({
  id: 'deck-123',
  title: 'Test Deck',
  ownerId: 'user-123',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  cardCount: 0,
  collaboratorIds: [],
  roles: { 'user-123': 'owner' as any },
  ...overrides,
})

// Factory function to create mock card data
export const createMockCard = (overrides: Partial<Card> = {}): Card => ({
  id: 'card-123',
  deckId: 'deck-123',
  title: 'Test Card',
  body: 'This is a test card body',
  orderIndex: 0,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  ...overrides,
})

// Factory function to create mock order snapshot
export const createMockOrderSnapshot = (overrides: Partial<OrderSnapshot> = {}): OrderSnapshot => ({
  id: 'snapshot-123',
  deckId: 'deck-123',
  name: 'Test Snapshot',
  cardOrder: ['card-1', 'card-2', 'card-3'],
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  ...overrides,
})

// Factory function to create mock user data
export const createMockUserData = (overrides: Partial<UserData> = {}): UserData => ({
  email: 'test@example.com',
  displayName: 'Test User',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  ...overrides,
})

// Factory function to create multiple mock decks
export const createMockDecks = (count: number, baseOverrides: Partial<Deck> = {}): Deck[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockDeck({
      id: `deck-${index + 1}`,
      title: `Test Deck ${index + 1}`,
      ...baseOverrides,
    })
  )
}

// Factory function to create multiple mock cards
export const createMockCards = (count: number, deckId: string = 'deck-123', baseOverrides: Partial<Card> = {}): Card[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockCard({
      id: `card-${index + 1}`,
      deckId,
      title: `Test Card ${index + 1}`,
      body: `This is test card ${index + 1} body`,
      orderIndex: index,
      ...baseOverrides,
    })
  )
}

// Factory for creating ordered cards for reorder testing
export const createOrderedMockCards = (count: number, deckId: string = 'deck-123'): Card[] => {
  return createMockCards(count, deckId).map((card, index) => ({
    ...card,
    orderIndex: index,
    title: `Card ${index + 1}`
  }))
}

// Factory for creating cards in specific order for testing reordering
export const createReorderTestCards = (): Card[] => [
  createMockCard({ id: 'card-1', title: 'First Card', orderIndex: 0 }),
  createMockCard({ id: 'card-2', title: 'Second Card', orderIndex: 1 }),
  createMockCard({ id: 'card-3', title: 'Third Card', orderIndex: 2 }),
  createMockCard({ id: 'card-4', title: 'Fourth Card', orderIndex: 3 }),
]

// Factory for expected card order after move up operation
export const createExpectedMoveUpOrder = (cardId: string, originalCards: Card[]): Card[] => {
  const cardIndex = originalCards.findIndex(card => card.id === cardId)
  if (cardIndex <= 0) return originalCards
  
  const newOrder = [...originalCards]
  const cardToMove = newOrder[cardIndex]
  const cardAbove = newOrder[cardIndex - 1]
  
  newOrder[cardIndex - 1] = cardToMove
  newOrder[cardIndex] = cardAbove
  
  return newOrder
}

// Factory for expected card order after move down operation
export const createExpectedMoveDownOrder = (cardId: string, originalCards: Card[]): Card[] => {
  const cardIndex = originalCards.findIndex(card => card.id === cardId)
  if (cardIndex >= originalCards.length - 1 || cardIndex === -1) return originalCards
  
  const newOrder = [...originalCards]
  const cardToMove = newOrder[cardIndex]
  const cardBelow = newOrder[cardIndex + 1]
  
  newOrder[cardIndex + 1] = cardToMove
  newOrder[cardIndex] = cardBelow
  
  return newOrder
}

// Factory for creating successful API responses
export const createSuccessResponse = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
})

// Factory for creating error API responses
export const createErrorResponse = (code: string = 'unknown', message: string = 'Test error'): ApiResponse<never> => ({
  success: false,
  error: { code, message },
})

// Mock Firestore document data (without IDs)
export const createMockDeckData = (overrides: Partial<DeckData> = {}): DeckData => ({
  title: 'Test Deck',
  ownerId: 'user-123',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  collaboratorIds: [],
  roles: { 'user-123': 'owner' as any },
  ...overrides,
})

export const createMockCardData = (overrides: Partial<CardData> = {}): CardData => ({
  title: 'Test Card',
  body: 'This is a test card body',
  orderIndex: 0,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  ...overrides,
})

export const createMockOrderSnapshotData = (overrides: Partial<OrderSnapshotData> = {}): OrderSnapshotData => ({
  name: 'Test Snapshot',
  cardOrder: ['card-1', 'card-2', 'card-3'],
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  ...overrides,
})

// Utility to create a mock Firestore query snapshot
export const createMockQuerySnapshot = <T>(docs: Array<{ id: string; data: T }>) => ({
  docs: docs.map(doc => ({
    id: doc.id,
    data: () => doc.data,
    ref: { id: doc.id }
  })),
  size: docs.length,
  empty: docs.length === 0,
  forEach: (callback: (doc: any) => void) => docs.forEach(doc => callback({
    id: doc.id,
    data: () => doc.data,
    ref: { id: doc.id }
  }))
})

// Utility to create a mock Firestore document snapshot
export const createMockDocSnapshot = <T>(id: string, data: T | null, exists: boolean = true) => ({
  id,
  exists: () => exists,
  data: () => data,
  ref: { id }
})
