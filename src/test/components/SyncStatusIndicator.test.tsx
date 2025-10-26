/**
 * Sync Status Indicator Tests
 *
 * TDD tests for sync status indicator component.
 * Tests UI states: idle, syncing, success, error.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SyncStatusIndicator } from '../../components/SyncStatusIndicator';
import { SyncManager } from '../../services/storage/sync-manager';
import type { SyncResult } from '../../services/storage/sync-manager';

// Mock SyncManager
const mockSyncManager = {
  onSyncStart: vi.fn(),
  onSyncComplete: vi.fn(),
  onSyncError: vi.fn(),
  isRunning: vi.fn(),
};

describe('SyncStatusIndicator', () => {
  let startCallback: () => void;
  let completeCallback: (result: SyncResult) => void;
  let errorCallback: (error: Error) => void;

  beforeEach(() => {
    // Capture callbacks when component registers them
    mockSyncManager.onSyncStart.mockImplementation((cb: () => void) => {
      startCallback = cb;
    });
    mockSyncManager.onSyncComplete.mockImplementation((cb: (result: SyncResult) => void) => {
      completeCallback = cb;
    });
    mockSyncManager.onSyncError.mockImplementation((cb: (error: Error) => void) => {
      errorCallback = cb;
    });
    mockSyncManager.isRunning.mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should render without crashing', () => {
      render(<SyncStatusIndicator syncManager={mockSyncManager as any} />);
      expect(screen.queryByTestId('sync-status-indicator')).toBeInTheDocument();
    });

    it('should be hidden in idle state', () => {
      render(<SyncStatusIndicator syncManager={mockSyncManager as any} />);
      const indicator = screen.queryByTestId('sync-status-indicator');

      // Should be in the DOM but not visible (for animations)
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveClass('sync-status--hidden');
    });

    it('should register sync callbacks on mount', () => {
      render(<SyncStatusIndicator syncManager={mockSyncManager as any} />);

      expect(mockSyncManager.onSyncStart).toHaveBeenCalled();
      expect(mockSyncManager.onSyncComplete).toHaveBeenCalled();
      expect(mockSyncManager.onSyncError).toHaveBeenCalled();
    });
  });

  describe('Syncing State', () => {
    it('should show syncing message when sync starts', async () => {
      render(<SyncStatusIndicator syncManager={mockSyncManager as any} />);

      // Trigger sync start
      startCallback();

      await waitFor(() => {
        const indicator = screen.getByTestId('sync-status-indicator');
        expect(indicator).not.toHaveClass('sync-status--hidden');
        expect(indicator).toHaveClass('sync-status--syncing');
        expect(screen.getByText(/syncing/i)).toBeInTheDocument();
      });
    });

    it('should show spinner icon when syncing', async () => {
      render(<SyncStatusIndicator syncManager={mockSyncManager as any} />);

      startCallback();

      await waitFor(() => {
        const icon = screen.getByTestId('sync-status-icon');
        expect(icon).toHaveTextContent('⟳'); // Spinner icon
      });
    });
  });

  describe('Success State', () => {
    it('should show success message after sync completes', async () => {
      render(<SyncStatusIndicator syncManager={mockSyncManager as any} />);

      // Trigger sync complete
      completeCallback({ success: true, itemsSynced: 5 });

      await waitFor(() => {
        const indicator = screen.getByTestId('sync-status-indicator');
        expect(indicator).toHaveClass('sync-status--success');
        expect(screen.getByText(/synced/i)).toBeInTheDocument();
      });
    });

    it('should show checkmark icon on success', async () => {
      render(<SyncStatusIndicator syncManager={mockSyncManager as any} />);

      completeCallback({ success: true, itemsSynced: 3 });

      await waitFor(() => {
        const icon = screen.getByTestId('sync-status-icon');
        expect(icon).toHaveTextContent('✓'); // Checkmark icon
      });
    });

    it('should auto-hide success message after timeout', async () => {
      vi.useFakeTimers();
      render(<SyncStatusIndicator syncManager={mockSyncManager as any} />);

      completeCallback({ success: true, itemsSynced: 2 });

      // Should be visible immediately
      await waitFor(() => {
        expect(screen.getByTestId('sync-status-indicator')).not.toHaveClass('sync-status--hidden');
      });

      // Fast-forward 3 seconds
      vi.advanceTimersByTime(3000);

      // Should be hidden after timeout
      await waitFor(() => {
        expect(screen.getByTestId('sync-status-indicator')).toHaveClass('sync-status--hidden');
      });

      vi.useRealTimers();
    });
  });

  describe('Error State', () => {
    it('should show error message when sync fails', async () => {
      render(<SyncStatusIndicator syncManager={mockSyncManager as any} />);

      errorCallback(new Error('Network error'));

      await waitFor(() => {
        const indicator = screen.getByTestId('sync-status-indicator');
        expect(indicator).toHaveClass('sync-status--error');
        expect(screen.getByText(/sync failed/i)).toBeInTheDocument();
      });
    });

    it('should show error icon on failure', async () => {
      render(<SyncStatusIndicator syncManager={mockSyncManager as any} />);

      errorCallback(new Error('Sync failed'));

      await waitFor(() => {
        const icon = screen.getByTestId('sync-status-icon');
        expect(icon).toHaveTextContent('✗'); // Error icon
      });
    });

    it('should NOT auto-hide error message', async () => {
      vi.useFakeTimers();
      render(<SyncStatusIndicator syncManager={mockSyncManager as any} />);

      errorCallback(new Error('Test error'));

      // Should be visible
      await waitFor(() => {
        expect(screen.getByTestId('sync-status-indicator')).toHaveClass('sync-status--error');
      });

      // Fast-forward 10 seconds
      vi.advanceTimersByTime(10000);

      // Should still be visible (errors don't auto-hide)
      expect(screen.getByTestId('sync-status-indicator')).not.toHaveClass('sync-status--hidden');

      vi.useRealTimers();
    });
  });

  describe('State Transitions', () => {
    it('should transition from syncing to success', async () => {
      render(<SyncStatusIndicator syncManager={mockSyncManager as any} />);

      // Start sync
      startCallback();
      await waitFor(() => {
        expect(screen.getByTestId('sync-status-indicator')).toHaveClass('sync-status--syncing');
      });

      // Complete sync
      completeCallback({ success: true, itemsSynced: 1 });
      await waitFor(() => {
        expect(screen.getByTestId('sync-status-indicator')).toHaveClass('sync-status--success');
      });
    });

    it('should transition from syncing to error', async () => {
      render(<SyncStatusIndicator syncManager={mockSyncManager as any} />);

      // Start sync
      startCallback();
      await waitFor(() => {
        expect(screen.getByTestId('sync-status-indicator')).toHaveClass('sync-status--syncing');
      });

      // Error occurs
      errorCallback(new Error('Network failure'));
      await waitFor(() => {
        expect(screen.getByTestId('sync-status-indicator')).toHaveClass('sync-status--error');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have role="status"', () => {
      render(<SyncStatusIndicator syncManager={mockSyncManager as any} />);

      startCallback();

      const indicator = screen.getByTestId('sync-status-indicator');
      expect(indicator).toHaveAttribute('role', 'status');
    });

    it('should have aria-live="polite"', () => {
      render(<SyncStatusIndicator syncManager={mockSyncManager as any} />);

      const indicator = screen.getByTestId('sync-status-indicator');
      expect(indicator).toHaveAttribute('aria-live', 'polite');
    });

    it('should mark icon as aria-hidden', async () => {
      render(<SyncStatusIndicator syncManager={mockSyncManager as any} />);

      startCallback();

      await waitFor(() => {
        const icon = screen.getByTestId('sync-status-icon');
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('Integration', () => {
    it('should handle rapid state changes', async () => {
      render(<SyncStatusIndicator syncManager={mockSyncManager as any} />);

      // Start sync
      startCallback();
      await waitFor(() => {
        expect(screen.getByTestId('sync-status-indicator')).toHaveClass('sync-status--syncing');
      });

      // Complete quickly
      completeCallback({ success: true, itemsSynced: 0 });
      await waitFor(() => {
        expect(screen.getByTestId('sync-status-indicator')).toHaveClass('sync-status--success');
      });

      // Start another sync
      startCallback();
      await waitFor(() => {
        expect(screen.getByTestId('sync-status-indicator')).toHaveClass('sync-status--syncing');
      });

      // Complete again
      completeCallback({ success: true, itemsSynced: 1 });
      await waitFor(() => {
        expect(screen.getByTestId('sync-status-indicator')).toHaveClass('sync-status--success');
      });
    });
  });
});
