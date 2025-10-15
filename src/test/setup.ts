import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { vi, beforeAll, afterEach } from 'vitest'

// Create proper mock functions that can be reused
const createMockUnsubscribe = () => vi.fn(() => {})

// Mock Firebase Auth with proper unsubscribe functions
const mockOnAuthStateChanged = vi.fn((auth, callback) => {
  // Simulate calling callback with null user
  setTimeout(() => callback(null), 0)
  return createMockUnsubscribe()
})

const mockSignInAnonymously = vi.fn(() => 
  Promise.resolve({
    user: {
      uid: 'test-user-id',
      isAnonymous: true,
    }
  })
)

// Mock Firebase Firestore with proper unsubscribe functions
const mockOnSnapshot = vi.fn((query, callback) => {
  // Simulate calling callback with empty snapshot
  setTimeout(() => callback({ 
    docs: [],
    empty: true,
    size: 0,
    forEach: vi.fn()
  }), 0)
  return createMockUnsubscribe()
})

// Set up mocks before all tests
beforeAll(() => {
  // Mock Firebase Auth
  vi.mock('firebase/auth', () => ({
    onAuthStateChanged: mockOnAuthStateChanged,
    signInWithPopup: vi.fn(() => Promise.resolve({ user: { uid: 'test' } })),
    signOut: vi.fn(() => Promise.resolve()),
    GoogleAuthProvider: vi.fn(),
    signInAnonymously: mockSignInAnonymously,
  }))

  // Mock Firebase modules
  vi.mock('../firebase/firebase', () => ({
    auth: {
      currentUser: null,
      onAuthStateChanged: mockOnAuthStateChanged,
      signInWithPopup: vi.fn(() => Promise.resolve({ user: { uid: 'test' } })),
      signOut: vi.fn(() => Promise.resolve()),
    },
    db: {
      collection: vi.fn(),
    },
    googleProvider: {},
  }))

  // Mock Firestore functions for standard unit/UI tests only.
  // Rules tests need the REAL Firestore client + emulator, so they set process.env.RULES_TESTS=true
  if (!process.env.RULES_TESTS) {
    vi.mock('firebase/firestore', () => ({
      collection: vi.fn(() => ({})),
      doc: vi.fn(() => ({})),
      addDoc: vi.fn(() => Promise.resolve({ id: 'test-doc' })),
      updateDoc: vi.fn(() => Promise.resolve()),
      deleteDoc: vi.fn(() => Promise.resolve()),
      getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
      getDoc: vi.fn(() => Promise.resolve({ exists: () => false })),
      query: vi.fn(() => ({})),
      where: vi.fn(() => ({})),
      orderBy: vi.fn(() => ({})),
      onSnapshot: mockOnSnapshot,
      writeBatch: vi.fn(() => ({
        update: vi.fn(),
        commit: vi.fn(() => Promise.resolve()),
      })),
      serverTimestamp: vi.fn(() => new Date()),
      Timestamp: {
        fromDate: vi.fn((date) => ({ 
          toDate: () => date,
          seconds: Math.floor(date.getTime() / 1000),
          nanoseconds: 0
        })),
      },
    }))
  }
})

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock console methods to reduce test noise
beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'log').mockImplementation(() => {})
})

// Clean up after each test with aggressive cleanup to prevent hanging
afterEach(async () => {
  console.log('🧹 Starting enhanced cleanup...')
  
  try {
    // Clean up React Testing Library first
    cleanup()
    
    // Clear all mocks to prevent state leakage between tests
    vi.clearAllMocks()
    
    // Reset all modules to clear any cached state
    vi.resetModules()
    
    // Clear timers safely
    try {
      vi.runOnlyPendingTimers()  // Run pending timers first
      vi.clearAllTimers()        // Then clear them
      vi.useRealTimers()         // Switch back to real timers
    } catch (timerError) {
      console.warn('Timer cleanup warning:', timerError)
      // Force clear timers even if error occurs
      vi.useRealTimers()
    }
    
    // Wait for microtasks to complete (important for React state updates)
    await new Promise(resolve => queueMicrotask(() => resolve(undefined)))
    
    // Wait for any remaining async operations
    await new Promise(resolve => setTimeout(resolve, 0))
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc()
    }
    
    console.log('✅ Enhanced cleanup complete')
  } catch (error) {
    console.error('❌ Cleanup error:', error)
    // Don't throw - this would mask the real test error
  }
})
