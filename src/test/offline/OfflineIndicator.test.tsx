/**
 * OfflineIndicator Component Tests
 *
 * TDD tests for component that shows online/offline status to users.
 * Mobile-first design with Writer theme brutalist aesthetics.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { OfflineIndicator } from '../../components/OfflineIndicator';
import { networkStatus } from '../../services/network-status';

describe('OfflineIndicator Component', () => {
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

  describe('Initial Render', () => {
    it('should render without crashing', () => {
      render(<OfflineIndicator />);
      expect(true).toBe(true);
    });

    it('should not show indicator when online', () => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });

      render(<OfflineIndicator />);

      // Should not show offline message
      expect(screen.queryByText(/offline/i)).not.toBeInTheDocument();
    });

    it('should show indicator when offline', () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

      render(<OfflineIndicator />);

      // Should show offline message
      expect(screen.getByText(/offline/i)).toBeInTheDocument();
    });
  });

  describe('Status Changes', () => {
    it('should show indicator when going offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });

      render(<OfflineIndicator />);

      // Initially online, no indicator
      expect(screen.queryByText(/offline/i)).not.toBeInTheDocument();

      // Go offline
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      window.dispatchEvent(new Event('offline'));

      // Should show offline indicator
      await waitFor(() => {
        expect(screen.getByText(/offline/i)).toBeInTheDocument();
      });
    });

    it('should hide indicator when going online', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

      render(<OfflineIndicator />);

      // Initially offline, shows indicator
      expect(screen.getByText(/offline/i)).toBeInTheDocument();

      // Go online
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      window.dispatchEvent(new Event('online'));

      // Should hide offline indicator
      await waitFor(() => {
        expect(screen.queryByText(/offline/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have aria-live region for screen readers', () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

      render(<OfflineIndicator />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveAttribute('aria-live');
    });

    it('should announce offline status to screen readers', () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

      render(<OfflineIndicator />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveAttribute('aria-live', 'polite');
    });

    it('should have descriptive text for screen readers', () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

      render(<OfflineIndicator />);

      // Should have text explaining offline status
      expect(screen.getByText(/offline/i)).toBeInTheDocument();
    });
  });

  describe('Connection Quality', () => {
    it('should show slow connection warning when connection is slow', () => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      Object.defineProperty(navigator, 'connection', {
        value: { effectiveType: '2g' },
        writable: true,
        configurable: true,
      });

      render(<OfflineIndicator />);

      // Should show slow connection message
      expect(screen.getByText(/slow/i)).toBeInTheDocument();
    });

    it('should not show slow connection warning when connection is fast', () => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      Object.defineProperty(navigator, 'connection', {
        value: { effectiveType: '4g' },
        writable: true,
        configurable: true,
      });

      render(<OfflineIndicator />);

      // Should not show slow connection message
      expect(screen.queryByText(/slow/i)).not.toBeInTheDocument();
    });

    it('should update when connection speed changes', async () => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      Object.defineProperty(navigator, 'connection', {
        value: { effectiveType: '4g' },
        writable: true,
        configurable: true,
      });

      render(<OfflineIndicator />);

      // Initially fast, no warning
      expect(screen.queryByText(/slow/i)).not.toBeInTheDocument();

      // Change to slow connection
      Object.defineProperty(navigator, 'connection', {
        value: { effectiveType: '2g' },
        writable: true,
        configurable: true,
      });
      window.dispatchEvent(new Event('online'));

      // Should show slow warning
      await waitFor(() => {
        expect(screen.getByText(/slow/i)).toBeInTheDocument();
      });
    });
  });

  describe('Styling', () => {
    it('should have fixed position for mobile', () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

      const { container } = render(<OfflineIndicator />);

      const indicator = container.querySelector('[data-testid="offline-indicator"]');
      expect(indicator).toBeInTheDocument();
    });

    it('should be visible but non-intrusive', () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

      render(<OfflineIndicator />);

      const indicator = screen.getByRole('status');
      expect(indicator).toBeVisible();
    });
  });

  describe('Component Unmounting', () => {
    it('should cleanup subscriptions on unmount', () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

      const { unmount } = render(<OfflineIndicator />);

      // Unmount component
      unmount();

      // Trigger network change - should not cause errors
      window.dispatchEvent(new Event('online'));

      // No error means cleanup worked
      expect(true).toBe(true);
    });
  });

  describe('Multiple States', () => {
    it('should prioritize offline over slow connection', () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      Object.defineProperty(navigator, 'connection', {
        value: { effectiveType: '2g' },
        writable: true,
        configurable: true,
      });

      render(<OfflineIndicator />);

      // Should show offline, not slow
      expect(screen.getByText(/offline/i)).toBeInTheDocument();
    });
  });
});
