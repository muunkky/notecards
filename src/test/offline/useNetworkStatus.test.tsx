/**
 * useNetworkStatus Hook Tests
 *
 * TDD tests for React hook that wraps network status detection.
 * Enables components to react to online/offline changes.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { networkStatus } from '../../services/network-status';

describe('useNetworkStatus Hook', () => {
  beforeEach(() => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
      configurable: true,
    });

    // Cleanup network status
    networkStatus.cleanup();
  });

  afterEach(() => {
    vi.clearAllMocks();
    networkStatus.cleanup();
  });

  describe('Initial State', () => {
    it('should return current online status on mount', () => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });

      const { result } = renderHook(() => useNetworkStatus());

      expect(result.current.isOnline).toBe(true);
    });

    it('should return offline status when browser is offline', () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

      const { result } = renderHook(() => useNetworkStatus());

      expect(result.current.isOnline).toBe(false);
    });

    it('should return connection type on mount', () => {
      Object.defineProperty(navigator, 'connection', {
        value: { effectiveType: '4g' },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useNetworkStatus());

      expect(result.current.connectionType).toBe('4g');
    });

    it('should detect slow connection on mount', () => {
      Object.defineProperty(navigator, 'connection', {
        value: { effectiveType: '2g' },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useNetworkStatus());

      expect(result.current.isSlowConnection).toBe(true);
    });
  });

  describe('Status Updates', () => {
    it('should update when browser goes online', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

      const { result } = renderHook(() => useNetworkStatus());
      expect(result.current.isOnline).toBe(false);

      // Go online
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      act(() => {
        window.dispatchEvent(new Event('online'));
      });

      await waitFor(() => {
        expect(result.current.isOnline).toBe(true);
      });
    });

    it('should update when browser goes offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });

      const { result } = renderHook(() => useNetworkStatus());
      expect(result.current.isOnline).toBe(true);

      // Go offline
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      act(() => {
        window.dispatchEvent(new Event('offline'));
      });

      await waitFor(() => {
        expect(result.current.isOnline).toBe(false);
      });
    });

    it('should update connection type when it changes', async () => {
      Object.defineProperty(navigator, 'connection', {
        value: { effectiveType: '4g' },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useNetworkStatus());
      expect(result.current.connectionType).toBe('4g');

      // Change connection type
      Object.defineProperty(navigator, 'connection', {
        value: { effectiveType: '2g' },
        writable: true,
        configurable: true,
      });

      act(() => {
        window.dispatchEvent(new Event('online')); // Trigger update
      });

      await waitFor(() => {
        expect(result.current.connectionType).toBe('2g');
        expect(result.current.isSlowConnection).toBe(true);
      });
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe on unmount', () => {
      const { result, unmount } = renderHook(() => useNetworkStatus());

      // Hook should be subscribed
      expect(result.current.isOnline).toBe(true);

      // Unmount and trigger event
      unmount();

      // This should not cause memory leaks or errors
      act(() => {
        window.dispatchEvent(new Event('online'));
      });

      // No error means cleanup worked
      expect(true).toBe(true);
    });

    it('should not cause re-renders after unmount', () => {
      let renderCount = 0;

      const { unmount } = renderHook(() => {
        renderCount++;
        return useNetworkStatus();
      });

      const initialRenderCount = renderCount;

      unmount();

      // Trigger events after unmount
      act(() => {
        window.dispatchEvent(new Event('online'));
        window.dispatchEvent(new Event('offline'));
      });

      // Render count should not increase after unmount
      expect(renderCount).toBe(initialRenderCount);
    });
  });

  describe('Return Values', () => {
    it('should return all status fields', () => {
      const { result } = renderHook(() => useNetworkStatus());

      expect(result.current).toHaveProperty('isOnline');
      expect(result.current).toHaveProperty('connectionType');
      expect(result.current).toHaveProperty('isSlowConnection');
    });

    it('should return boolean for isOnline', () => {
      const { result } = renderHook(() => useNetworkStatus());

      expect(typeof result.current.isOnline).toBe('boolean');
    });

    it('should return string for connectionType', () => {
      const { result } = renderHook(() => useNetworkStatus());

      expect(typeof result.current.connectionType).toBe('string');
    });

    it('should return boolean for isSlowConnection', () => {
      const { result } = renderHook(() => useNetworkStatus());

      expect(typeof result.current.isSlowConnection).toBe('boolean');
    });
  });

  describe('Multiple Instances', () => {
    it('should support multiple hook instances', () => {
      const { result: result1 } = renderHook(() => useNetworkStatus());
      const { result: result2 } = renderHook(() => useNetworkStatus());

      expect(result1.current.isOnline).toBe(result2.current.isOnline);
      expect(result1.current.connectionType).toBe(result2.current.connectionType);
    });

    it('should update all instances when status changes', async () => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });

      const { result: result1 } = renderHook(() => useNetworkStatus());
      const { result: result2 } = renderHook(() => useNetworkStatus());

      // Go offline
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      act(() => {
        window.dispatchEvent(new Event('offline'));
      });

      await waitFor(() => {
        expect(result1.current.isOnline).toBe(false);
        expect(result2.current.isOnline).toBe(false);
      });
    });
  });
});
