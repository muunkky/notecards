/**
 * Enhanced Test Utilities - Performance Optimized
 * Centralized utilities to reduce mock setup overhead
 */

import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, RenderOptions } from '@testing-library/react';
import { AuthProvider } from '../../providers/AuthProvider';
import { User } from 'firebase/auth';
import { ReactElement, ReactNode } from 'react';

// ============================================================================
// PERFORMANCE-OPTIMIZED MOCK FACTORIES
// ============================================================================

/**
 * High-performance mock factories with memoization for common test objects
 * Reduces object creation overhead in tests
 */
export const mockFactories = {
  // User factory with caching for performance
  _userCache: new Map<string, User>(),
  user: (overrides: Partial<User> = {}): User => {
    const key = JSON.stringify(overrides);
    if (mockFactories._userCache.has(key)) {
      return mockFactories._userCache.get(key)!;
    }
    
    const user = {
      uid: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
      emailVerified: true,
      photoURL: null,
      phoneNumber: null,
      isAnonymous: false,
      tenantId: null,
      providerData: [],
      metadata: {
        creationTime: '2024-01-01T00:00:00.000Z',
        lastSignInTime: '2024-01-01T00:00:00.000Z'
      },
      refreshToken: 'test-refresh-token',
      getIdToken: vi.fn().mockResolvedValue('test-id-token'),
      getIdTokenResult: vi.fn().mockResolvedValue({ token: 'test-token' }),
      reload: vi.fn().mockResolvedValue(undefined),
      toJSON: vi.fn().mockReturnValue({}),
      delete: vi.fn().mockResolvedValue(undefined),
      ...overrides
    } as User;
    
    mockFactories._userCache.set(key, user);
    return user;
  },

  // Deck factory with performance optimizations
  deck: (overrides = {}) => ({
    id: 'test-deck-id',
    title: 'Test Deck',
    description: '',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    userId: 'test-user-id',
    cardCount: 5,
    ...overrides
  }),

  // Card factory with performance optimizations
  card: (overrides = {}) => ({
    id: 'test-card-id',
    deckId: 'test-deck-id',
    title: 'Test Card',
    body: 'Test card body',
    orderIndex: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    archived: false,
    favorite: false,
    ...overrides
  }),

  // Optimized Firebase operation mocks
  firebaseOps: () => ({
    createDeck: vi.fn().mockResolvedValue({ id: 'new-deck-id' }),
    updateDeck: vi.fn().mockResolvedValue(undefined),
    deleteDeck: vi.fn().mockResolvedValue(undefined),
    createCard: vi.fn().mockResolvedValue({ id: 'new-card-id' }),
    updateCard: vi.fn().mockResolvedValue(undefined),
    deleteCard: vi.fn().mockResolvedValue(undefined),
    reorderCards: vi.fn().mockResolvedValue(undefined),
    getDeckCards: vi.fn().mockResolvedValue([]),
    getUserDecks: vi.fn().mockResolvedValue([])
  })
};

// ============================================================================
// PERFORMANCE-OPTIMIZED RENDERING UTILITIES
// ============================================================================

/**
 * Performance-optimized render utilities with common providers pre-configured
 */
export const renderUtils = {
  // Standard render with AuthProvider (most common case)
  withAuth: (
    ui: ReactElement,
    options: {
      user?: User | null;
      renderOptions?: Omit<RenderOptions, 'wrapper'>;
    } = {}
  ) => {
    const { user = mockFactories.user(), renderOptions } = options;
    
    // Mock auth at module level for performance
    vi.mocked(require('../../lib/firebase')).auth = {
      currentUser: user,
      onAuthStateChanged: vi.fn((callback) => {
        callback(user);
        return () => {}; // unsubscribe function
      })
    };

    const AllTheProviders = ({ children }: { children: ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    return render(ui, { wrapper: AllTheProviders, ...renderOptions });
  },

  // Lightweight render without providers (for pure components)
  lightweight: (ui: ReactElement, options?: RenderOptions) => {
    return render(ui, options);
  }
};

// ============================================================================
// PERFORMANCE-OPTIMIZED USER EVENT UTILITIES
// ============================================================================

/**
 * Pre-configured userEvent setup for better performance
 * Reuses userEvent instances when possible
 */
export const userEventUtils = {
  // Cached user event instance for performance
  _instance: null as ReturnType<typeof userEvent.setup> | null,
  
  setup: (options = {}) => {
    if (!userEventUtils._instance) {
      userEventUtils._instance = userEvent.setup({
        advanceTimers: vi.advanceTimersByTime,
        ...options
      });
    }
    return userEventUtils._instance;
  },

  // Common user interactions with performance optimizations
  async clickButton(element: HTMLElement) {
    const user = userEventUtils.setup();
    await user.click(element);
  },

  async typeInInput(element: HTMLElement, text: string) {
    const user = userEventUtils.setup();
    await user.clear(element);
    await user.type(element, text);
  },

  async selectOption(element: HTMLElement, option: string) {
    const user = userEventUtils.setup();
    await user.selectOptions(element, option);
  }
};

// ============================================================================
// MOCK CLEANUP AND PERFORMANCE UTILITIES
// ============================================================================

/**
 * Enhanced cleanup utilities for better test isolation and performance
 */
export const cleanupUtils = {
  // Clear all caches for fresh test state
  clearFactoryCaches: () => {
    mockFactories._userCache.clear();
    userEventUtils._instance = null;
  },

  // Comprehensive mock reset
  resetAllMocks: () => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    cleanupUtils.clearFactoryCaches();
  },

  // Performance-optimized mock setup for Firebase
  setupFirebaseMocks: () => {
    const firebaseOps = mockFactories.firebaseOps();
    
    vi.doMock('../../lib/firebase', () => ({
      auth: {
        currentUser: null,
        onAuthStateChanged: vi.fn()
      },
      ...firebaseOps
    }));

    return firebaseOps;
  }
};

// ============================================================================
// PERFORMANCE TESTING UTILITIES
// ============================================================================

/**
 * Utilities for measuring and optimizing test performance
 */
export const performanceUtils = {
  // Measure render performance
  async measureRender<T>(renderFn: () => T): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = renderFn();
    const duration = performance.now() - start;
    
    // Warn if render is slow (>50ms for unit tests)
    if (duration > 50) {
      console.warn(`Slow render detected: ${duration.toFixed(2)}ms`);
    }
    
    return { result, duration };
  },

  // Batch test operations for better performance
  async batchOperations<T>(operations: (() => Promise<T>)[]): Promise<T[]> {
    // Execute operations in parallel for better performance
    return Promise.all(operations.map(op => op()));
  },

  // Mock performance monitoring
  trackMockUsage: () => {
    const originalFn = vi.fn;
    let mockCount = 0;
    
    vi.fn = (...args) => {
      mockCount++;
      if (mockCount > 50) {
        console.warn(`High mock count detected: ${mockCount} mocks created`);
      }
      return originalFn(...args);
    };
    
    return () => {
      vi.fn = originalFn;
      return mockCount;
    };
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  mockFactories,
  renderUtils,
  userEventUtils,
  cleanupUtils,
  performanceUtils
};