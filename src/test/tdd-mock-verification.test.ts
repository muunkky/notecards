import { describe, it, expect, beforeEach, vi } from 'vitest'

// TDD: Simple focused test to verify our mock setup works
const { mockAddDoc, mockCollection, mockCollectionRef } = vi.hoisted(() => {
  const mockCollectionRef = { _type: 'collection', id: 'test-collection' }
  return {
    mockAddDoc: vi.fn(),
    mockCollection: vi.fn(() => mockCollectionRef),
    mockCollectionRef
  }
})

vi.mock('firebase/firestore', () => ({
  collection: mockCollection,
  addDoc: mockAddDoc,
}))

describe('TDD: Mock Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should verify collection reference works correctly', () => {
    const collectionRef = mockCollection({}, 'test-items')
    
    expect(mockCollection).toHaveBeenCalledWith({}, 'test-items')
    expect(collectionRef).toBe(mockCollectionRef)
    expect(collectionRef).toEqual({ _type: 'collection', id: 'test-collection' })
  })

  it('should verify addDoc works with collection reference', async () => {
    mockAddDoc.mockResolvedValue({ id: 'test-doc-123' })
    
    const collectionRef = mockCollection({}, 'test-items')
    const result = await mockAddDoc(collectionRef, { name: 'Test Item' })

    expect(mockAddDoc).toHaveBeenCalledWith(
      mockCollectionRef,
      { name: 'Test Item' }
    )
    expect(result).toEqual({ id: 'test-doc-123' })
  })
})
