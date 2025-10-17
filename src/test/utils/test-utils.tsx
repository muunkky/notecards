import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { AuthProvider } from '../../providers/AuthProvider'
import { User } from 'firebase/auth'
import { expect, vi } from 'vitest'

// Mock user for testing
export const mockUser: User = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/photo.jpg',
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: '2024-01-01T00:00:00.000Z',
    lastSignInTime: '2024-01-01T00:00:00.000Z'
  },
  providerData: [],
  refreshToken: 'mock-refresh-token',
  tenantId: null,
  delete: () => Promise.resolve(),
  getIdToken: () => Promise.resolve('mock-id-token'),
  getIdTokenResult: () => Promise.resolve({
    token: 'mock-id-token',
    authTime: '2024-01-01T00:00:00.000Z',
    issuedAtTime: '2024-01-01T00:00:00.000Z',
    expirationTime: '2024-01-01T01:00:00.000Z',
    signInProvider: 'google.com',
    signInSecondFactor: null,
    claims: {}
  }),
  reload: () => Promise.resolve(),
  toJSON: () => ({}),
  phoneNumber: null,
  providerId: 'firebase'
}

// Create a custom AuthProvider for testing that accepts mock values
const TestAuthProvider = ({ 
  children, 
  mockUser: user, 
  mockLoading: loading 
}: { 
  children: React.ReactNode
  mockUser?: User | null
  mockLoading?: boolean
}) => {
  // Mock the useAuth hook to return our test values instead of real Firebase auth
  const mockAuthContext = {
    user: user ?? null,
    loading: loading ?? false
  }

  // We'll use React.createContext temporarily for this test provider
  const AuthContext = require('../../providers/AuthProvider').AuthContext || 
                      require('react').createContext(mockAuthContext)

  return (
    <AuthContext.Provider value={mockAuthContext}>
      {children}
    </AuthContext.Provider>
  )
}

// Enhanced render function with auth context
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  user?: User | null
  loading?: boolean
}

export const renderWithAuth = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { user = null, loading = false, ...renderOptions } = options

  // Create a wrapper component that provides the mocked auth context
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <TestAuthProvider mockUser={user} mockLoading={loading}>
        {children}
      </TestAuthProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Re-export everything from testing library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

// Import and re-export screen and waitFor from the correct packages
import { screen, waitFor } from '@testing-library/dom'
export { screen, waitFor }

// Custom matchers for better assertions
export const customMatchers = {
  toBeInTheDocument: expect.any(Function),
  toHaveClass: expect.any(Function),
  toHaveTextContent: expect.any(Function),
}

// Async testing utilities
export const waitForAuth = async () => {
  // Wait for auth state to settle
  await new Promise(resolve => setTimeout(resolve, 0))
}

export const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0))

// Mock Firebase timestamp
export const mockTimestamp = (date: Date = new Date()) => ({
  toDate: () => date,
  seconds: Math.floor(date.getTime() / 1000),
  nanoseconds: (date.getTime() % 1000) * 1000000,
})

// Modern async testing utilities
export const asyncTestUtils = {
  /** Wait for all pending promises and micro-tasks */
  flushAll: async () => {
    await flushPromises()
    await new Promise<void>(resolve => queueMicrotask(() => resolve()))
  },
  
  /** Wait for a specific condition with timeout */
  waitForCondition: async (
    condition: () => boolean | Promise<boolean>,
    timeout = 5000,
    interval = 50
  ): Promise<void> => {
    const start = Date.now()
    while (Date.now() - start < timeout) {
      if (await condition()) return
      await new Promise(resolve => setTimeout(resolve, interval))
    }
    throw new Error(`Condition not met within ${timeout}ms`)
  },
  
  /** Wait for element to be removed from DOM */
  waitForRemoval: async (element: HTMLElement, timeout = 5000) => {
    await waitFor(() => {
      expect(element).not.toBeInTheDocument()
    }, { timeout })
  }
}

// Modern mock factories
export const mockFactories = {
  user: (overrides: Partial<User> = {}): User => ({
    ...mockUser,
    ...overrides
  }),
  
  deck: (overrides = {}) => ({
    id: `deck-${Math.random().toString(36).substr(2, 9)}`,
    title: 'Test Deck',
    ownerId: 'test-user-123',
    cardCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),
  
  card: (overrides = {}) => ({
    id: `card-${Math.random().toString(36).substr(2, 9)}`,
    title: 'Test Card',
    body: 'Test card body',
    deckId: 'test-deck-id',
    orderIndex: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    archived: false,
    favorite: false,
    ...overrides
  })
}

// Performance testing utilities
export const performanceTestUtils = {
  /** Measure render time of a component */
  measureRender: async (renderFn: () => any) => {
    const start = performance.now()
    const result = renderFn()
    await flushPromises()
    const end = performance.now()
    return { result, renderTime: end - start }
  },
  
  /** Assert that an operation completes within time limit */
  assertPerformance: async (
    operation: () => Promise<any> | any,
    maxTime: number,
    description: string
  ) => {
    const start = performance.now()
    await operation()
    const duration = performance.now() - start
    if (duration > maxTime) {
      throw new Error(`${description} took ${duration}ms, expected < ${maxTime}ms`)
    }
  }
}
