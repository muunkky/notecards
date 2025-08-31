import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import DeckScreen from '../features/decks/DeckScreen'
import { AuthProvider } from '../providers/AuthProvider'

// Mock Firebase to avoid initialization issues
vi.mock('../firebase/firebase', () => ({
  db: { _type: 'firestore' },
  auth: { _type: 'auth' },
}))

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((auth, callback) => {
    // Simulate no user initially
    callback(null)
    return () => {} // unsubscribe function
  }),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
}))

// Mock Firestore 
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(() => () => {}), // Return unsubscribe function
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  serverTimestamp: vi.fn(),
}))

// Test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    {children}
  </AuthProvider>
)

// TDD: Simple verification test
describe('DeckScreen TDD Verification', () => {
  it('should render the deck screen header', () => {
    render(
      <TestWrapper>
        <DeckScreen />
      </TestWrapper>
    )
    
    expect(screen.getByText('My Decks')).toBeInTheDocument()
  })

  it('should render a create new deck button', () => {
    render(
      <TestWrapper>
        <DeckScreen />
      </TestWrapper>
    )
    
    expect(screen.getByRole('button', { name: /create new deck/i })).toBeInTheDocument()
  })
})
