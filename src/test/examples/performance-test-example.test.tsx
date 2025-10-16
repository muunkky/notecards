/**
 * Example: Performance-Optimized Test Pattern
 * Demonstrates best practices for high-performance testing
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import {
  mockFactories,
  renderUtils,
  userEventUtils,
  cleanupUtils,
  performanceUtils
} from '../utils/performance-test-utils';

// ============================================================================
// PERFORMANCE-OPTIMIZED TEST SUITE EXAMPLE
// ============================================================================

describe('Performance-Optimized Test Example', () => {
  // Centralized setup reduces per-test overhead
  beforeEach(() => {
    cleanupUtils.resetAllMocks();
  });

  describe('Optimized Rendering Patterns', () => {
    it('should render efficiently with cached mocks', async () => {
      // Use cached factory instead of creating fresh objects
      const testUser = mockFactories.user({ displayName: 'Performance User' });
      const testDeck = mockFactories.deck({ title: 'Performance Deck' });

      // Measure render performance
      const { result, duration } = await performanceUtils.measureRender(() => {
        return renderUtils.withAuth(
          <div data-testid="test-component">
            <h1>{testDeck.title}</h1>
            <p>User: {testUser.displayName}</p>
          </div>,
          { user: testUser }
        );
      });

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
      expect(screen.getByText('Performance Deck')).toBeInTheDocument();
      expect(screen.getByText('User: Performance User')).toBeInTheDocument();

      // Performance assertion - render should be fast
      expect(duration).toBeLessThan(50); // 50ms threshold for unit tests
    });

    it('should handle user interactions efficiently', async () => {
      const mockOnClick = vi.fn();
      
      renderUtils.lightweight(
        <button onClick={mockOnClick} data-testid="test-button">
          Click me
        </button>
      );

      // Use optimized userEvent utilities
      const button = screen.getByTestId('test-button');
      await userEventUtils.clickButton(button);

      expect(mockOnClick).toHaveBeenCalledOnce();
    });
  });

  describe('Batch Operations Performance', () => {
    it('should handle multiple async operations efficiently', async () => {
      const operations = [
        () => Promise.resolve('Operation 1'),
        () => Promise.resolve('Operation 2'),
        () => Promise.resolve('Operation 3')
      ];

      const results = await performanceUtils.batchOperations(operations);

      expect(results).toEqual(['Operation 1', 'Operation 2', 'Operation 3']);
    });
  });

  describe('Mock Performance Monitoring', () => {
    it('should track mock usage for performance analysis', () => {
      const stopTracking = performanceUtils.trackMockUsage();

      // Create some mocks (should be monitored)
      const mock1 = vi.fn();
      const mock2 = vi.fn();
      const mock3 = vi.fn();

      expect(mock1).toBeDefined();
      expect(mock2).toBeDefined();
      expect(mock3).toBeDefined();

      const mockCount = stopTracking();
      expect(mockCount).toBeGreaterThan(0);
    });
  });

  describe('Factory Caching Performance', () => {
    it('should reuse cached objects for better performance', () => {
      // First call - creates and caches
      const user1 = mockFactories.user({ email: 'cache@test.com' });
      
      // Second call with same params - should return cached object
      const user2 = mockFactories.user({ email: 'cache@test.com' });

      // Should be the exact same object reference (cached)
      expect(user1).toBe(user2);
    });

    it('should create different objects for different parameters', () => {
      const user1 = mockFactories.user({ email: 'user1@test.com' });
      const user2 = mockFactories.user({ email: 'user2@test.com' });

      // Should be different objects
      expect(user1).not.toBe(user2);
      expect(user1.email).toBe('user1@test.com');
      expect(user2.email).toBe('user2@test.com');
    });
  });
});

// ============================================================================
// PERFORMANCE BENCHMARK TEST
// ============================================================================

describe('Performance Benchmark', () => {
  it('should complete full test cycle within performance budget', async () => {
    const startTime = performance.now();

    // Simulate a complex test scenario
    const user = mockFactories.user();
    const firebaseOps = cleanupUtils.setupFirebaseMocks();
    
    const { result } = await performanceUtils.measureRender(() => {
      return renderUtils.withAuth(
        <div data-testid="complex-component">
          <h1>Complex Component</h1>
          <button onClick={() => firebaseOps.createDeck()}>Create</button>
        </div>,
        { user }
      );
    });

    // Simulate user interaction
    const button = screen.getByRole('button');
    await userEventUtils.clickButton(button);

    // Wait for async operations
    await waitFor(() => {
      expect(firebaseOps.createDeck).toHaveBeenCalled();
    });

    const totalTime = performance.now() - startTime;
    
    // Performance budget: complete test should finish under 100ms
    expect(totalTime).toBeLessThan(100);
    console.log(`Benchmark test completed in ${totalTime.toFixed(2)}ms`);
  });
});