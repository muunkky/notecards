import { describe, it, expect, beforeEach, vi } from 'vitest'
import { User } from 'firebase/auth'

// Mock Firebase Auth using vi.hoisted() to ensure proper hoisting
const { mockOnAuthStateChanged } = vi.hoisted(() => ({
  mockOnAuthStateChanged: vi.fn()
}))

// Mock firebase/auth directly since that's what AuthProvider imports from
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: mockOnAuthStateChanged,
}))

// Mock Firebase config
vi.mock('../../firebase/firebase', () => ({
  auth: { _type: 'auth' },
}))

// Now import the modules that depend on the mocks
import { render, screen, waitFor } from '../utils/test-utils'
import { AuthProvider, useAuth } from '../../providers/AuthProvider'
import { mockUser } from '../utils/test-utils'

// Test component to consume the auth context
const TestComponent = () => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div data-testid="loading">Loading...</div>
  }
  
  if (user) {
    return (
      <div data-testid="authenticated">
        <span data-testid="user-email">{user.email}</span>
        <span data-testid="user-name">{user.displayName}</span>
      </div>
    )
  }
  
  return <div data-testid="unauthenticated">Not authenticated</div>
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should provide loading state initially', () => {
    // Mock onAuthStateChanged to not call the callback immediately
    mockOnAuthStateChanged.mockImplementation(() => () => {})

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('loading')).toBeInTheDocument()
  })

  it('should provide authenticated user when user is signed in', async () => {
    // Mock onAuthStateChanged to call callback with user
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser)
      return () => {} // unsubscribe function
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toBeInTheDocument()
      expect(screen.getByTestId('user-email')).toHaveTextContent(mockUser.email!)
      expect(screen.getByTestId('user-name')).toHaveTextContent(mockUser.displayName!)
    })
  })

  it('should provide null user when not authenticated', async () => {
    // Mock onAuthStateChanged to call callback with null
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null)
      return () => {} // unsubscribe function
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('unauthenticated')).toBeInTheDocument()
    })
  })

  it('should handle user state changes', async () => {
    let authCallback: ((user: User | null) => void) | null = null

    // Capture the callback function
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      authCallback = callback
      return () => {} // unsubscribe function
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Initially no user
    authCallback!(null)
    await waitFor(() => {
      expect(screen.getByTestId('unauthenticated')).toBeInTheDocument()
    })

    // User signs in
    authCallback!(mockUser)
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toBeInTheDocument()
      expect(screen.getByTestId('user-email')).toHaveTextContent(mockUser.email!)
    })

    // User signs out
    authCallback!(null)
    await waitFor(() => {
      expect(screen.getByTestId('unauthenticated')).toBeInTheDocument()
    })
  })

  it('should cleanup auth listener on unmount', () => {
    const mockUnsubscribe = vi.fn()
    mockOnAuthStateChanged.mockReturnValue(mockUnsubscribe)

    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })

  it('should provide context value with correct types', async () => {
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser)
      return () => {}
    })

    let contextValue: any = null

    const ContextConsumer = () => {
      contextValue = useAuth()
      return <div>Test</div>
    }

    render(
      <AuthProvider>
        <ContextConsumer />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(contextValue).toBeDefined()
      expect(typeof contextValue.loading).toBe('boolean')
      expect(contextValue.user).toEqual(mockUser)
    })
  })

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Temporarily mock console.error to avoid noise in tests
      const originalError = console.error
      console.error = vi.fn()

      expect(() => {
        render(<TestComponent />)
      }).toThrow()

      console.error = originalError
    })
  })

  describe('Edge Cases', () => {
    it('should handle auth state change errors gracefully', async () => {
      // Mock onAuthStateChanged to throw an error
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        throw new Error('Auth error')
      })

      // Should not crash the app
      expect(() => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      }).not.toThrow()
    })

    it('should handle rapid auth state changes', async () => {
      let authCallback: ((user: User | null) => void) | null = null
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authCallback = callback
        return () => {}
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Rapid state changes
      authCallback!(null)
      authCallback!(mockUser)
      authCallback!(null)
      authCallback!(mockUser)

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toBeInTheDocument()
      })
    })

    it('should maintain user object reference equality for same user', async () => {
      let authCallback: ((user: User | null) => void) | null = null
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authCallback = callback
        return () => {}
      })

      const userReferences: (User | null)[] = []
      const UserRefTracker = () => {
        const { user } = useAuth()
        userReferences.push(user)
        return <div>{user ? 'authenticated' : 'not authenticated'}</div>
      }

      render(
        <AuthProvider>
          <UserRefTracker />
        </AuthProvider>
      )

      // Set same user multiple times
      authCallback!(mockUser)
      authCallback!(mockUser)
      authCallback!(mockUser)

      await waitFor(() => {
        // Should maintain same reference for same user
        const authenticatedRefs = userReferences.filter(ref => ref !== null)
        if (authenticatedRefs.length > 1) {
          expect(authenticatedRefs[0]).toBe(authenticatedRefs[1])
        }
      })
    })
  })
})
