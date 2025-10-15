import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import CardScreen, { CardListItem } from '../../../features/cards/CardScreen'
import { mockUser } from '../../utils/test-utils'
import type { Card } from '../../../types'

// Mock the hooks using vi.hoisted to ensure they're hoisted properly
const mockUseCards = vi.hoisted(() => vi.fn())
const mockUseCardOperations = vi.hoisted(() => vi.fn())
const mockUseAuth = vi.hoisted(() => vi.fn())

// Mock the custom hooks
vi.mock('../../../hooks/useCards', () => ({
  useCards: mockUseCards
}))

vi.mock('../../../hooks/useCardOperations', () => ({
  useCardOperations: mockUseCardOperations
}))

// Mock the AuthProvider hook
vi.mock('../../../providers/AuthProvider', () => ({
  useAuth: mockUseAuth
}))

// Mock card data for testing
const mockCards: Card[] = [
  {
    id: 'card-1',
    deckId: 'deck-1',
    title: 'Test Card 1',
    body: 'This is the body of test card 1',
    orderIndex: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02')
  },
  {
    id: 'card-2',
    deckId: 'deck-1',
    title: 'Test Card 2',
    body: 'This is the body of test card 2',
    orderIndex: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02')
  }
]

// TDD: Start with tests for CardScreen component
describe('CardScreen Component', () => {
  const mockDeckId = 'deck-1'
  
  // Helper to build full operations mock; allows partial overrides
  const buildOpsMock = (overrides: Partial<Record<string, any>> = {}) => ({
    createCard: vi.fn().mockResolvedValue(undefined),
    updateCard: vi.fn().mockResolvedValue(undefined),
    deleteCard: vi.fn().mockResolvedValue(undefined),
    moveCardUp: vi.fn().mockResolvedValue(undefined),
    moveCardDown: vi.fn().mockResolvedValue(undefined),
    reorderByDrag: vi.fn().mockResolvedValue(undefined),
    duplicateCard: vi.fn().mockResolvedValue(undefined),
    toggleFavorite: vi.fn().mockResolvedValue(undefined),
    archiveCard: vi.fn().mockResolvedValue(undefined),
    unarchiveCard: vi.fn().mockResolvedValue(undefined),
    loading: false,
    error: null,
    ...overrides
  })

  beforeEach(() => {
    vi.clearAllMocks()

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false
    })

    mockUseCards.mockReturnValue({
      cards: [],
      loading: false,
      error: null
    })

    mockUseCardOperations.mockReturnValue(buildOpsMock())
  })

  describe('Initial Render', () => {
    it('should render the card screen header', () => {
      render(<CardScreen deckId={mockDeckId} />)
      
      expect(screen.getByText('Deck Cards')).toBeInTheDocument()
    })

    it('should render a "Create New Card" button', () => {
      render(<CardScreen deckId={mockDeckId} />)
      
      expect(screen.getByRole('button', { name: /create new card/i })).toBeInTheDocument()
    })

    it('should show loading state initially', () => {
      mockUseCards.mockReturnValue({
        cards: [],
        loading: true,
        error: null
      })
      
      render(<CardScreen deckId={mockDeckId} />)
      
      expect(screen.getByText(/loading cards/i)).toBeInTheDocument()
    })

    it('should render back to decks button', () => {
      render(<CardScreen deckId={mockDeckId} />)
      
      expect(screen.getByRole('button', { name: /all decks/i })).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no cards exist', async () => {
      render(<CardScreen deckId={mockDeckId} />)
      
      await waitFor(() => {
        expect(screen.getByText(/no cards yet/i)).toBeInTheDocument()
        expect(screen.getByText(/create your first card/i)).toBeInTheDocument()
      })
    })

    it('should show create card CTA in empty state', async () => {
      render(<CardScreen deckId={mockDeckId} />)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create your first card/i })).toBeInTheDocument()
      })
    })
  })

  describe('Card List', () => {
    beforeEach(() => {
      mockUseCards.mockReturnValue({
        cards: mockCards,
        loading: false,
        error: null
      })
    })

    it('should render card items when cards exist', async () => {
      render(<CardScreen deckId={mockDeckId} />)
      
      await waitFor(() => {
        expect(screen.getByText('Test Card 1')).toBeInTheDocument()
        expect(screen.getByText('Test Card 2')).toBeInTheDocument()
      })
    })

    it('should display card title and body preview', async () => {
      render(<CardScreen deckId={mockDeckId} />)
      
      await waitFor(() => {
        expect(screen.getByText('Test Card 1')).toBeInTheDocument()
        expect(screen.getByText(/this is the body of test card 1/i)).toBeInTheDocument()
      })
    })
  })

  describe('Create New Card', () => {
    it('should open create card modal when create button is clicked', async () => {
      render(<CardScreen deckId={mockDeckId} />)
      
      // Use getAllByRole and select the first one (header button)
      const createButtons = screen.getAllByRole('button', { name: /create new card/i })
      fireEvent.click(createButtons[0])
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/card title/i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/card body/i)).toBeInTheDocument()
      })
    })

    it('should create card when form is submitted', async () => {
  const mockCreateCard = vi.fn().mockResolvedValue(undefined)
  mockUseCardOperations.mockReturnValue(buildOpsMock({ createCard: mockCreateCard }))
      
      render(<CardScreen deckId={mockDeckId} />)
      
      const createButton = screen.getByRole('button', { name: /create new card/i })
      fireEvent.click(createButton)
      
      const titleInput = screen.getByPlaceholderText(/card title/i)
      const bodyInput = screen.getByPlaceholderText(/card body/i)
      const submitButton = screen.getByRole('button', { name: /^create$/i })
      
      fireEvent.change(titleInput, { target: { value: 'New Test Card' } })
      fireEvent.change(bodyInput, { target: { value: 'New card body' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockCreateCard).toHaveBeenCalledWith('New Test Card', 'New card body')
      })
    })

    it('should not allow creating card with empty title', async () => {
      render(<CardScreen deckId={mockDeckId} />)
      
      const createButton = screen.getByRole('button', { name: /create new card/i })
      fireEvent.click(createButton)
      
      const submitButton = screen.getByRole('button', { name: /^create$/i })
      
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Card Actions', () => {
    beforeEach(() => {
      mockUseCards.mockReturnValue({
        cards: mockCards,
        loading: false,
        error: null
      })
    })

    it('should expand card when clicked', async () => {
      render(<CardScreen deckId={mockDeckId} />)
      
      await waitFor(() => {
        const cardItem = screen.getByTestId('card-item-card-1')
        fireEvent.click(cardItem)
        
        // Should show full body text when expanded
        expect(screen.getByText('This is the body of test card 1')).toBeInTheDocument()
      })
    })

    it('should show edit modal when edit button is clicked', async () => {
      render(<CardScreen deckId={mockDeckId} />)
      
      await waitFor(() => {
        const editButton = screen.getByLabelText(/edit card-1/i)
        fireEvent.click(editButton)
        
        expect(screen.getByText('Edit Card')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Test Card 1')).toBeInTheDocument()
      })
    })

    it('should update card when edit form is submitted', async () => {
      const mockUpdateCard = vi.fn().mockImplementation(async (cardId, updates) => {
        console.log('Mock updateCard called with:', { cardId, updates })
        // Simulate async operation without hanging
        await new Promise(resolve => setTimeout(resolve, 10))
        console.log('Mock updateCard completed')
        return Promise.resolve()
      })
      
      mockUseCardOperations.mockReturnValue(buildOpsMock({ updateCard: mockUpdateCard }))

      render(<CardScreen deckId={mockDeckId} />)

      // Directly find and click edit button (no async state change required)
      const editButton = screen.getByLabelText(/edit card-1/i)
      fireEvent.click(editButton)

      // Modal elements should now be present synchronously
      const titleInput = screen.getByDisplayValue('Test Card 1')
      // Be more specific - look for Save button that's NOT the snapshot button
      const submitButton = screen.getByRole('button', { name: /^save$/i })

      fireEvent.change(titleInput, { target: { value: 'Updated Card Title' } })
      
      // Click submit and wait for async operations to complete
      fireEvent.click(submitButton)
      
      // Wait for the updateCard mock to be called and complete
      await waitFor(() => {
        expect(mockUpdateCard).toHaveBeenCalledWith('card-1', {
          title: 'Updated Card Title',
          body: 'This is the body of test card 1'
        })
      }, { timeout: 1000 }) // Short timeout to prevent hanging
      
      // Wait for modal to close (indicates component state updates completed)
      await waitFor(() => {
        expect(screen.queryByText('Edit Card')).not.toBeInTheDocument()
      }, { timeout: 1000 })
    })

    it('should delete card with confirmation', async () => {
  const mockDeleteCard = vi.fn().mockResolvedValue(undefined)
  mockUseCardOperations.mockReturnValue(buildOpsMock({ deleteCard: mockDeleteCard }))
      
      render(<CardScreen deckId={mockDeckId} />)
      
      await waitFor(() => {
        const deleteButton = screen.getByLabelText('delete card-1')
        fireEvent.click(deleteButton)
        
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
        
        const confirmButton = screen.getByRole('button', { name: /^delete$/i })
        fireEvent.click(confirmButton)
        
        expect(mockDeleteCard).toHaveBeenCalledWith('card-1')
      })
    })
  })

  describe('Error Handling', () => {
    it('should display error when loading fails', () => {
      mockUseCards.mockReturnValue({
        cards: [],
        loading: false,
        error: 'Failed to load cards'
      })
      
      render(<CardScreen deckId={mockDeckId} />)
      
      expect(screen.getByText(/error loading cards: failed to load cards/i)).toBeInTheDocument()
    })
  })

  // TDD Phase 2A.1: Advanced Card Filtering Tests (WRITE TESTS FIRST)
  describe('Advanced Card Filtering', () => {
    beforeEach(() => {
      const largeCardSet: Card[] = [
        {
          id: 'card-1',
          deckId: 'deck-1', 
          title: 'JavaScript Basics',
          body: 'Variables, functions, and objects in JavaScript',
          orderIndex: 0,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        {
          id: 'card-2',
          deckId: 'deck-1',
          title: 'React Hooks',
          body: 'useState, useEffect, and custom hooks',
          orderIndex: 1,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02')
        },
        {
          id: 'card-3',
          deckId: 'deck-1',
          title: 'TypeScript Types',
          body: 'Interfaces, types, and generic programming',
          orderIndex: 2,
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-03')
        },
        {
          id: 'card-4',
          deckId: 'deck-1',
          title: 'CSS Flexbox',
          body: 'Layout with flexbox properties and alignment',
          orderIndex: 3,
          createdAt: new Date('2024-01-04'),
          updatedAt: new Date('2024-01-04')
        }
      ]
      
      mockUseCards.mockReturnValue({
        cards: largeCardSet,
        loading: false,
        error: null
      })
    })

    it('should render search input field', async () => {
      render(<CardScreen deckId={mockDeckId} />)
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search cards.../i)).toBeInTheDocument()
      })
    })

    it('should filter cards by title in real-time', async () => {
      render(<CardScreen deckId={mockDeckId} />)
      
      await waitFor(() => {
        // Initially all cards should be visible
        expect(screen.getByText('JavaScript Basics')).toBeInTheDocument()
        expect(screen.getByText('React Hooks')).toBeInTheDocument()
        expect(screen.getByText('TypeScript Types')).toBeInTheDocument()
        expect(screen.getByText('CSS Flexbox')).toBeInTheDocument()
      })
      
      const searchInput = screen.getByPlaceholderText(/search cards.../i)
      fireEvent.change(searchInput, { target: { value: 'React' } })
      
      await waitFor(() => {
        // Only React card should be visible
        expect(screen.getByText('React Hooks')).toBeInTheDocument()
        expect(screen.queryByText('JavaScript Basics')).not.toBeInTheDocument()
        expect(screen.queryByText('TypeScript Types')).not.toBeInTheDocument()
        expect(screen.queryByText('CSS Flexbox')).not.toBeInTheDocument()
      })
    })

    it('should filter cards by body content', async () => {
      render(<CardScreen deckId={mockDeckId} />)
      
      const searchInput = screen.getByPlaceholderText(/search cards.../i)
      fireEvent.change(searchInput, { target: { value: 'functions' } })
      
      await waitFor(() => {
        // Only JavaScript card should be visible (has "functions" in body)
        expect(screen.getByText('JavaScript Basics')).toBeInTheDocument()
        expect(screen.queryByText('React Hooks')).not.toBeInTheDocument()
        expect(screen.queryByText('TypeScript Types')).not.toBeInTheDocument()
        expect(screen.queryByText('CSS Flexbox')).not.toBeInTheDocument()
      })
    })

    it('should perform case-insensitive search', async () => {
      render(<CardScreen deckId={mockDeckId} />)
      
      const searchInput = screen.getByPlaceholderText(/search cards.../i)
      fireEvent.change(searchInput, { target: { value: 'TYPESCRIPT' } })
      
      await waitFor(() => {
        expect(screen.getByText('TypeScript Types')).toBeInTheDocument()
        expect(screen.queryByText('JavaScript Basics')).not.toBeInTheDocument()
      })
    })

    it('should show "no results" message when no cards match filter', async () => {
      render(<CardScreen deckId={mockDeckId} />)
      
      const searchInput = screen.getByPlaceholderText(/search cards.../i)
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } })
      
      await waitFor(() => {
        expect(screen.getByText(/no cards match your search/i)).toBeInTheDocument()
        expect(screen.getByText(/try a different search term/i)).toBeInTheDocument()
      })
    })

    it('should clear filter when search is emptied', async () => {
      render(<CardScreen deckId={mockDeckId} />)
      
      const searchInput = screen.getByPlaceholderText(/search cards.../i)
      
      // Filter first
      fireEvent.change(searchInput, { target: { value: 'React' } })
      await waitFor(() => {
        expect(screen.getByText('React Hooks')).toBeInTheDocument()
        expect(screen.queryByText('JavaScript Basics')).not.toBeInTheDocument()
      })
      
      // Clear filter
      fireEvent.change(searchInput, { target: { value: '' } })
      await waitFor(() => {
        expect(screen.getByText('React Hooks')).toBeInTheDocument()
        expect(screen.getByText('JavaScript Basics')).toBeInTheDocument()
        expect(screen.getByText('TypeScript Types')).toBeInTheDocument()
        expect(screen.getByText('CSS Flexbox')).toBeInTheDocument()
      })
    })

    it('should update card count display when filtering', async () => {
      render(<CardScreen deckId={mockDeckId} />)
      
      await waitFor(() => {
        expect(screen.getByText('4 cards')).toBeInTheDocument()
      })
      
      const searchInput = screen.getByPlaceholderText(/search cards.../i)
      fireEvent.change(searchInput, { target: { value: 'React' } })
      
      await waitFor(() => {
        expect(screen.getByText('1 card')).toBeInTheDocument()
      })
    })

    it('should show clear search button when search is active', async () => {
      render(<CardScreen deckId={mockDeckId} />)
      
      const searchInput = screen.getByPlaceholderText(/search cards.../i)
      fireEvent.change(searchInput, { target: { value: 'React' } })
      
      await waitFor(() => {
        expect(screen.getByLabelText(/clear search/i)).toBeInTheDocument()
      })
    })

    it('should clear search when clear button is clicked', async () => {
      render(<CardScreen deckId={mockDeckId} />)
      
      const searchInput = screen.getByPlaceholderText(/search cards.../i)
      fireEvent.change(searchInput, { target: { value: 'React' } })
      
      await waitFor(() => {
        const clearButton = screen.getByLabelText(/clear search/i)
        fireEvent.click(clearButton)
        
        expect(searchInput).toHaveValue('')
        expect(screen.getByText('4 cards')).toBeInTheDocument()
      })
    })

    it('should filter on partial word matches', async () => {
      render(<CardScreen deckId={mockDeckId} />)
      
      const searchInput = screen.getByPlaceholderText(/search cards.../i)
      fireEvent.change(searchInput, { target: { value: 'Type' } })
      
      await waitFor(() => {
        expect(screen.getByText('TypeScript Types')).toBeInTheDocument()
        expect(screen.queryByText('JavaScript Basics')).not.toBeInTheDocument()
      })
    })

    it('should maintain search state when creating new cards', async () => {
  const mockCreateCard = vi.fn().mockResolvedValue(undefined)
  mockUseCardOperations.mockReturnValue(buildOpsMock({ createCard: mockCreateCard }))
      
      render(<CardScreen deckId={mockDeckId} />)
      
      // Set search filter
      const searchInput = screen.getByPlaceholderText(/search cards.../i)
      fireEvent.change(searchInput, { target: { value: 'React' } })
      
      await waitFor(() => {
        expect(screen.getByText('1 card')).toBeInTheDocument()
      })
      
      // Open create modal
      const createButton = screen.getByRole('button', { name: /create new card/i })
      fireEvent.click(createButton)
      
      // Close modal without creating
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)
      
      // Search should still be active
      await waitFor(() => {
        expect(searchInput).toHaveValue('React')
        expect(screen.getByText('1 card')).toBeInTheDocument()
      })
    })

    it('should handle search performance for large card sets', async () => {
      // Performance test - search should complete quickly
      render(<CardScreen deckId={mockDeckId} />)
      
      const searchInput = screen.getByPlaceholderText(/search cards.../i)
      const startTime = performance.now()
      
      fireEvent.change(searchInput, { target: { value: 'script' } })
      
      await waitFor(() => {
        expect(screen.getByText('JavaScript Basics')).toBeInTheDocument()
        expect(screen.getByText('TypeScript Types')).toBeInTheDocument()
        
        const endTime = performance.now()
        const searchTime = endTime - startTime
        
        // Search should complete in under 50ms for good UX
        expect(searchTime).toBeLessThan(50)
      })
    })

    it('should maintain filter when editing cards', async () => {
      render(<CardScreen deckId={mockDeckId} />)
      
      // Set search filter
      const searchInput = screen.getByPlaceholderText(/search cards.../i)
      fireEvent.change(searchInput, { target: { value: 'React' } })
      
      await waitFor(() => {
        expect(screen.getByText('React Hooks')).toBeInTheDocument()
      })
      
      // Edit card
      const editButton = screen.getByLabelText(/edit card-2/i)
      fireEvent.click(editButton)
      
      // Close edit modal
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)
      
      // Search should still be active
      await waitFor(() => {
        expect(searchInput).toHaveValue('React')
        expect(screen.getByText('1 card')).toBeInTheDocument()
      })
    })
  })
})

// TDD: Test for CardListItem component
describe('CardListItem Component', () => {
  const mockCard: Card = {
    id: 'card-1',
    deckId: 'deck-1',
    title: 'Test Card',
    body: 'This is a test card body',
    orderIndex: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const baseItemProps = () => ({
    onMoveUp: vi.fn(),
    onMoveDown: vi.fn(),
    canMoveUp: false,
    canMoveDown: false,
    isReordering: false
  })

  it('should render card title', () => {
    render(<CardListItem card={mockCard} onEdit={vi.fn()} onDelete={vi.fn()} {...baseItemProps()} />)
    
    expect(screen.getByText('Test Card')).toBeInTheDocument()
  })

  it('should render truncated card body', () => {
    render(<CardListItem card={mockCard} onEdit={vi.fn()} onDelete={vi.fn()} {...baseItemProps()} />)
    
    expect(screen.getByText(/this is a test card body/i)).toBeInTheDocument()
  })

  it('should call onEdit when edit button is clicked', () => {
    const mockOnEdit = vi.fn()
    render(<CardListItem card={mockCard} onEdit={mockOnEdit} onDelete={vi.fn()} {...baseItemProps()} />)
    
    fireEvent.click(screen.getByLabelText(/edit/i))
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockCard.id)
  })

  it('should call onDelete when delete button is clicked', () => {
    const mockOnDelete = vi.fn()
    render(<CardListItem card={mockCard} onEdit={vi.fn()} onDelete={mockOnDelete} {...baseItemProps()} />)
    
    fireEvent.click(screen.getByLabelText(/delete/i))
    
    expect(mockOnDelete).toHaveBeenCalledWith(mockCard.id)
  })

  it('should expand/collapse body when clicked', () => {
    render(<CardListItem card={mockCard} onEdit={vi.fn()} onDelete={vi.fn()} {...baseItemProps()} />)
    
    const cardElement = screen.getByTestId('card-item-card-1')
    fireEvent.click(cardElement)
    
    // Should show full body when expanded
    expect(screen.getByText('This is a test card body')).toBeInTheDocument()
  })
})
