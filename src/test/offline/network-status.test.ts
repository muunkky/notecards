/**
 * Network Status Detection Tests
 *
 * Comprehensive TDD coverage for online/offline detection utilities.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { networkStatus } from '../../services/network-status.js';

describe('Network Status Detector', () => {
  beforeEach(() => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
      configurable: true,
    });

    // Cleanup any existing listeners
    networkStatus.cleanup();
  });

  afterEach(() => {
    vi.clearAllMocks();
    networkStatus.cleanup();
  });

  describe('Basic Status Detection', () => {
    it('should detect if browser is online', () => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      expect(networkStatus.isOnline()).toBe(true);
    });

    it('should detect if browser is offline', () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      expect(networkStatus.isOnline()).toBe(false);
    });

    it('should detect offline mode', () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      expect(networkStatus.isOffline()).toBe(true);
    });
  });

  describe('Event Listeners', () => {
    it('should listen for online event', () => {
      const callback = vi.fn();
      networkStatus.onOnline(callback);

      window.dispatchEvent(new Event('online'));

      expect(callback).toHaveBeenCalled();
    });

    it('should listen for offline event', () => {
      const callback = vi.fn();
      networkStatus.onOffline(callback);

      window.dispatchEvent(new Event('offline'));

      expect(callback).toHaveBeenCalled();
    });

    it('should allow multiple listeners', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      networkStatus.onOnline(callback1);
      networkStatus.onOnline(callback2);

      window.dispatchEvent(new Event('online'));

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should return unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = networkStatus.onOnline(callback);

      unsubscribe();
      window.dispatchEvent(new Event('online'));

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Status Change Callbacks', () => {
    it('should call onChange callback on online event', () => {
      const callback = vi.fn();
      networkStatus.onChange(callback);
      callback.mockClear(); // Clear initial call

      window.dispatchEvent(new Event('online'));

      expect(callback).toHaveBeenCalledWith(true);
    });

    it('should call onChange callback on offline event', () => {
      const callback = vi.fn();
      networkStatus.onChange(callback);
      callback.mockClear(); // Clear initial call

      window.dispatchEvent(new Event('offline'));

      expect(callback).toHaveBeenCalledWith(false);
    });

    it('should provide current status to onChange callback', () => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      const callback = vi.fn();

      networkStatus.onChange(callback);

      expect(callback).toHaveBeenCalledWith(true);
    });
  });

  describe('Connection Type Detection', () => {
    it('should detect effective connection type if available', () => {
      Object.defineProperty(navigator, 'connection', {
        value: { effectiveType: '4g' },
        writable: true,
        configurable: true,
      });

      expect(networkStatus.getConnectionType()).toBe('4g');
    });

    it('should return unknown if connection API not available', () => {
      Object.defineProperty(navigator, 'connection', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      expect(networkStatus.getConnectionType()).toBe('unknown');
    });

    it('should detect slow connection (2g)', () => {
      Object.defineProperty(navigator, 'connection', {
        value: { effectiveType: '2g' },
        writable: true,
        configurable: true,
      });

      expect(networkStatus.isSlowConnection()).toBe(true);
    });

    it('should detect fast connection (4g)', () => {
      Object.defineProperty(navigator, 'connection', {
        value: { effectiveType: '4g' },
        writable: true,
        configurable: true,
      });

      expect(networkStatus.isSlowConnection()).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('should remove all event listeners on cleanup', () => {
      const callback = vi.fn();
      networkStatus.onOnline(callback);

      networkStatus.cleanup();
      window.dispatchEvent(new Event('online'));

      expect(callback).not.toHaveBeenCalled();
    });

    it('should clear all callbacks on cleanup', () => {
      const callback = vi.fn();
      networkStatus.onChange(callback);
      callback.mockClear();

      networkStatus.cleanup();
      window.dispatchEvent(new Event('online'));

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Status Snapshot', () => {
    it('should return complete status snapshot', () => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      Object.defineProperty(navigator, 'connection', {
        value: { effectiveType: '4g' },
        writable: true,
        configurable: true,
      });

      const status = networkStatus.getStatus();

      expect(status).toEqual({
        isOnline: true,
        connectionType: '4g',
        isSlowConnection: false,
      });
    });
  });
});
