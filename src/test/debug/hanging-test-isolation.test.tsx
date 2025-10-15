import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import CardScreen from '../../../features/cards/CardScreen'

// Mock the hooks with extensive logging
const mockUseCards = vi.hoisted(() => vi.fn())
const mockUseCardOperations = vi.hoisted(() => vi.fn())
const mockUseAuth = vi.hoisted(() => vi.fn())

vi.mock('../../../hooks/useCards', () => ({
  useCards: mockUseCards
}))

vi.mock('../../../hooks/useCardOperations', () => ({
  useCardOperations: mockUseCardOperations
}))

vi.mock('../../../providers/AuthProvider', () => ({
  useAuth: mockUseAuth
}))

// Mock card data
const mockCards = [
  {
    id: 'card-1',
    deckId: 'deck-1',
    title: 'Test Card 1',
    body: 'This is the body of test card 1',
    orderIndex: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02')
  }
]

describe('CardScreen Hanging Test Isolation', () => {
  let mockUpdateCard: any

  beforeEach(() => {
    console.log('🔍 Setting up mocks for hanging test...')
    
    // Set up auth mock
    mockUseAuth.mockReturnValue({
      user: { uid: 'test-user' },
      loading: false
    })

    // Set up cards mock
    mockUseCards.mockReturnValue({
      cards: mockCards,
      loading: false,
      error: null
    })

    // Set up operations mock with EXTENSIVE logging
    mockUpdateCard = vi.fn().mockImplementation(async (cardId, updates) => {
      console.log('🔥 updateCard called with:', { cardId, updates })
      console.log('🔥 updateCard starting...')
      
      // Add artificial delay to see if this is the issue
      await new Promise(resolve => setTimeout(resolve, 100))
      
      console.log('🔥 updateCard completing...')
      return Promise.resolve()
    })

    mockUseCardOperations.mockReturnValue({
      updateCard: mockUpdateCard,
      deleteCard: vi.fn(),
      addCard: vi.fn(),
      reorderCards: vi.fn(),
      duplicateCard: vi.fn(),
      toggleFavorite: vi.fn(),
      optimisticUpdate: vi.fn(),
      undoOptimistic: vi.fn()
    })

    console.log('✅ Mocks setup complete')
  })

  it('should isolate the edit form submission hanging issue', async () => {
    console.log('🚀 Rendering CardScreen for hanging test...')
    
    render(<CardScreen deckId="deck-1" />)
    console.log('✅ CardScreen rendered')

    // Find edit button
    console.log('🔍 Looking for edit button...')
    const editButton = screen.getByLabelText(/edit card-1/i)
    console.log('✅ Found edit button')

    // Click edit button
    console.log('👆 Clicking edit button...')
    fireEvent.click(editButton)
    console.log('✅ Edit button clicked')

    // Find form elements
    console.log('🔍 Looking for form elements...')
    const titleInput = screen.getByDisplayValue('Test Card 1')
    const submitButton = screen.getByRole('button', { name: /^save$/i })
    console.log('✅ Found form elements')

    // Change title
    console.log('✏️ Changing title...')
    fireEvent.change(titleInput, { target: { value: 'Updated Card Title' } })
    console.log('✅ Title changed')

    // THIS IS WHERE IT HANGS - let's add timeout protection
    console.log('💥 About to click submit button - this is where it hangs...')
    
    // Add a race condition with timeout
    const clickPromise = new Promise((resolve, reject) => {
      try {
        fireEvent.click(submitButton)
        console.log('✅ Submit button clicked successfully')
        resolve(true)
      } catch (error) {
        console.error('❌ Submit button click failed:', error)
        reject(error)
      }
    })

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        console.error('⏰ TIMEOUT: Submit button click took too long!')
        reject(new Error('Submit button click timed out after 5 seconds'))
      }, 5000)
    })

    try {
      await Promise.race([clickPromise, timeoutPromise])
      console.log('🎉 Submit completed without hanging!')
      
      // Verify the mock was called
      expect(mockUpdateCard).toHaveBeenCalledWith('card-1', {
        title: 'Updated Card Title',
        body: 'This is the body of test card 1'
      })
      
    } catch (error) {
      console.error('💥 Test failed or timed out:', error)
      throw error
    }
  })
})