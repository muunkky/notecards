import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DeckScreen, { DeckListItem } from '../../../features/decks/DeckScreen'
import { mockUser } from '../../utils/test-utils'
import type { Deck } from '../../../types'

// Mock the hooks using vi.hoisted to ensure they're hoisted properly
const mockUseDecks = vi.hoisted(() => vi.fn())
const mockUseDeckOperations = vi.hoisted(() => vi.fn())
const mockUseAuth = vi.hoisted(() => vi.fn())
// NEW MOCK for useAccessibleDecks (sharing migration)
const mockUseAccessibleDecks = vi.hoisted(() => vi.fn())

// Mock the custom hooks
vi.mock('../../../hooks/useDecks', () => ({
  useDecks: mockUseDecks
}))

vi.mock('../../../hooks/useDeckOperations', () => ({
  useDeckOperations: mockUseDeckOperations
}))

// CRITICAL FIX: Mock the useAccessibleDecks hook (sharing feature)
vi.mock('../../../hooks/useAccessibleDecks', () => ({
  useAccessibleDecks: mockUseAccessibleDecks
}))

// Mock the AuthProvider hook
vi.mock('../../../providers/AuthProvider', () => ({
  useAuth: mockUseAuth
}))

// Mock deck data for testing
const mockDecks: Deck[] = [
  {
    id: 'deck-1',
    title: 'Test Deck',
    ownerId: 'test-user-123',
    cardCount: 5,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02')
  }
]

// augment mock decks for collaborator scenario
const collaboratorDeck: Deck = {
  id: 'deck-collab-1',
  title: 'Shared Biology',
  ownerId: 'other-user-999',
  cardCount: 12,
  createdAt: new Date('2024-03-01'),
  updatedAt: new Date('2024-03-05'),
  collaboratorIds: ['test-user-123'],
  roles: { 'test-user-123': 'editor' },
  effectiveRole: 'editor'
}

// TDD: Start with tests for DeckScreen component
describe('DeckScreen Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default auth mock
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false
    })
    
    // Setup default mock implementations
    mockUseDecks.mockReturnValue({
      decks: [],
      loading: false,
      error: null
    })
    
    mockUseDeckOperations.mockReturnValue({
      createDeck: vi.fn(),
      updateDeck: vi.fn(),
      deleteDeck: vi.fn(),
      loading: false,
      error: null
    })
    // default for useAccessibleDecks
    mockUseAccessibleDecks.mockReturnValue({ decks: [], loading: false, error: null })
  })

  describe('Initial Render', () => {
    it('should render the deck screen header', () => {
      render(<DeckScreen />)
      
      expect(screen.getByText('My Decks')).toBeInTheDocument()
    })

    it('should render a "Create New Deck" button', () => {
      render(<DeckScreen />)
      
      expect(screen.getByRole('button', { name: /create new deck/i })).toBeInTheDocument()
    })

    it('should show loading state initially', () => {
      mockUseDecks.mockReturnValue({
        decks: [],
        loading: true,
        error: null
      })
      
      render(<DeckScreen />)
      
      expect(screen.getByText(/loading your decks/i)).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no decks exist', async () => {
      render(<DeckScreen />)
      
      await waitFor(() => {
        expect(screen.getByText(/no decks yet/i)).toBeInTheDocument()
        expect(screen.getByText(/get started by creating your first deck/i)).toBeInTheDocument()
      })
    })

    it('should show create deck CTA in empty state', async () => {
      render(<DeckScreen />)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create your first deck/i })).toBeInTheDocument()
      })
    })
  })

  describe('Deck List', () => {
    beforeEach(() => {
      // Mock both hooks since DeckScreen calls both (feature flag determines which is used)
      mockUseDecks.mockReturnValue({
        decks: mockDecks,
        loading: false,
        error: null
      })
      // CRITICAL FIX: Since FEATURE_DECK_SHARING is enabled, mock the hook that's actually used
      mockUseAccessibleDecks.mockReturnValue({
        decks: mockDecks,
        loading: false,
        error: null
      })
    })

    it('should render deck items when decks exist', async () => {
      render(<DeckScreen />)
      
      await waitFor(() => {
        expect(screen.getByText('Test Deck')).toBeInTheDocument()
      })
    })

    it('should display deck title and card count', async () => {
      render(<DeckScreen />)
      
      await waitFor(() => {
        expect(screen.getByText('Test Deck')).toBeInTheDocument()
        expect(screen.getByText('5 cards')).toBeInTheDocument()
      })
    })
  })

  describe('Create New Deck', () => {
    it('should open create deck modal when create button is clicked', async () => {
      render(<DeckScreen />)
      
      const createButton = screen.getByRole('button', { name: /create new deck/i })
      fireEvent.click(createButton)
      
      await waitFor(() => {
        expect(screen.getByText('Create New Deck')).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/enter deck title/i)).toBeInTheDocument()
      })
    })

    it('should create deck when form is submitted', async () => {
      const mockCreateDeck = vi.fn()
      mockUseDeckOperations.mockReturnValue({
        createDeck: mockCreateDeck,
        updateDeck: vi.fn(),
        deleteDeck: vi.fn(),
        loading: false,
        error: null
      })
      
      render(<DeckScreen />)
      
      const createButton = screen.getByRole('button', { name: /create new deck/i })
      fireEvent.click(createButton)
      
      const titleInput = screen.getByPlaceholderText(/enter deck title/i)
      const submitButton = screen.getByRole('button', { name: /^create$/i })
      
      fireEvent.change(titleInput, { target: { value: 'New Test Deck' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockCreateDeck).toHaveBeenCalledWith('New Test Deck')
      })
    })

    it('should not allow creating deck with empty title', async () => {
      render(<DeckScreen />)
      
      const createButton = screen.getByRole('button', { name: /create new deck/i })
      fireEvent.click(createButton)
      
      const submitButton = screen.getByRole('button', { name: /^create$/i })
      
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Deck Actions', () => {
    beforeEach(() => {
      // Mock both hooks since DeckScreen calls both (feature flag determines which is used)
      mockUseDecks.mockReturnValue({
        decks: mockDecks,
        loading: false,
        error: null
      })
      // CRITICAL FIX: Since FEATURE_DECK_SHARING is enabled, mock the hook that's actually used
      mockUseAccessibleDecks.mockReturnValue({
        decks: mockDecks,
        loading: false,
        error: null
      })
    })

    it('should show share button for each deck when sharing feature flag enabled (TDD)', async () => {
      render(<DeckScreen />)
      await waitFor(() => {
        expect(screen.getByText('Test Deck')).toBeInTheDocument()
      })
      // Intentionally failing until Share button added
      expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument()
    })

    it('should show rename modal when deck menu is clicked', async () => {
      render(<DeckScreen />)
      
      await waitFor(() => {
        // Get the deck menu button specifically (not the user menu) 
        const deckMenuButton = screen.getAllByLabelText(/menu/i)[1] // Second menu button is the deck menu (first is user menu)
        fireEvent.click(deckMenuButton)
        
        expect(screen.getByText('Rename Deck')).toBeInTheDocument()
      })
    })

    it('should rename deck when rename is submitted', async () => {
      const mockUpdateDeck = vi.fn()
      mockUseDeckOperations.mockReturnValue({
        createDeck: vi.fn(),
        updateDeck: mockUpdateDeck,
        deleteDeck: vi.fn(),
        loading: false,
        error: null
      })
      
      render(<DeckScreen />)
      
      await waitFor(() => {
        // Click the deck menu button to open rename modal
        const deckMenuButton = screen.getAllByLabelText(/menu/i)[1] // Second menu button is the deck menu (first is user menu)
        fireEvent.click(deckMenuButton)
        
        // Wait for rename modal to appear
        expect(screen.getByText('Rename Deck')).toBeInTheDocument()
      })
      
      const titleInput = screen.getByDisplayValue('Test Deck') // Match the actual mock data
      const submitButton = screen.getByRole('button', { name: /rename/i })
      
      fireEvent.change(titleInput, { target: { value: 'Updated Deck Title' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockUpdateDeck).toHaveBeenCalledWith('deck-1', { title: 'Updated Deck Title' })
      })
    })
  })

  describe('Error Handling', () => {
    it('should display error when loading fails', () => {
      mockUseDecks.mockReturnValue({
        decks: [],
        loading: false,
        error: 'Failed to load decks'
      })
      
      render(<DeckScreen />)
      
      expect(screen.getByText(/error loading decks: failed to load decks/i)).toBeInTheDocument()
    })
  })
})

// TDD: Test for DeckListItem component
describe('DeckListItem Component', () => {
  const mockDeck: Deck = {
    id: 'deck-1',
    title: 'Test Deck',
    ownerId: 'test-user-123',
    cardCount: 5,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  it('should render deck title', () => {
    render(<DeckListItem deck={mockDeck} onSelect={vi.fn()} onMenu={vi.fn()} />)
    
    expect(screen.getByText('Test Deck')).toBeInTheDocument()
  })

  it('should render card count', () => {
    render(<DeckListItem deck={mockDeck} onSelect={vi.fn()} onMenu={vi.fn()} />)
    
    expect(screen.getByText('5 cards')).toBeInTheDocument()
  })

  it('should call onSelect when clicked', () => {
    const mockOnSelect = vi.fn()
    render(<DeckListItem deck={mockDeck} onSelect={mockOnSelect} onMenu={vi.fn()} />)
    
    fireEvent.click(screen.getByTestId('deck-item'))
    
    expect(mockOnSelect).toHaveBeenCalledWith(mockDeck.id)
  })

  it('should call onMenu when menu button is clicked', () => {
    const mockOnMenu = vi.fn()
    render(<DeckListItem deck={mockDeck} onSelect={vi.fn()} onMenu={mockOnMenu} />)
    
    fireEvent.click(screen.getByLabelText(/menu/i))
    
    expect(mockOnMenu).toHaveBeenCalledWith(mockDeck.id)
  })
})

describe('DeckScreen Sharing Integration', () => {
  it('shows both owned and collaborator decks when sharing enabled', async () => {
    mockUseAccessibleDecks.mockReturnValue({
      decks: [ ...mockDecks, collaboratorDeck ],
      loading: false,
      error: null
    })
    render(<DeckScreen />)
    await waitFor(() => {
      expect(screen.getByText('Test Deck')).toBeInTheDocument()
      expect(screen.getByText('Shared Biology')).toBeInTheDocument()
    })
  })

  it('displays role badge for collaborator deck (editor)', async () => {
    mockUseAccessibleDecks.mockReturnValue({ decks: [collaboratorDeck], loading: false, error: null })
    render(<DeckScreen />)
    await waitFor(() => {
      expect(screen.getByText('EDITOR')).toBeInTheDocument()
    })
  })

  it('hides share button for collaborator deck (non-owner)', async () => {
    mockUseAccessibleDecks.mockReturnValue({ decks: [collaboratorDeck], loading: false, error: null })
    render(<DeckScreen />)
    await waitFor(() => {
      // There should be no Share button because current user isn't the owner
      expect(screen.queryByRole('button', { name: /share/i })).not.toBeInTheDocument()
    })
  })
})
