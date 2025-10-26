/**
 * Sync Status Indicator Component
 *
 * Displays sync status with visual feedback.
 * Shows syncing, success, and error states.
 *
 * DESIGN PHILOSOPHY - INSTANT FEEDBACK:
 * - Clear visual state for sync operations
 * - Auto-hide success after 3 seconds
 * - Keep errors visible until resolved
 * - Brutalist styling with bold borders
 *
 * TDD: Built to pass SyncStatusIndicator.test.tsx
 */

import React, { useEffect, useState, useRef } from 'react';
import type { SyncManager, SyncResult } from '../services/storage/sync-manager';
import '../design-system/styles/sync-status-indicator.css';

interface SyncStatusIndicatorProps {
  syncManager: SyncManager;
}

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ syncManager }) => {
  const [status, setStatus] = useState<SyncStatus>('idle');
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Register sync callbacks
    syncManager.onSyncStart(() => {
      // Clear any pending hide timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      setStatus('syncing');
    });

    syncManager.onSyncComplete((result: SyncResult) => {
      setStatus('success');

      // Auto-hide success after 3 seconds
      hideTimeoutRef.current = setTimeout(() => {
        setStatus('idle');
        hideTimeoutRef.current = null;
      }, 3000);
    });

    syncManager.onSyncError((error: Error) => {
      // Clear any pending hide timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      setStatus('error');
      // Errors don't auto-hide
    });

    // Cleanup
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [syncManager]);

  // Get message and icon based on status
  const getMessage = (): string => {
    switch (status) {
      case 'syncing':
        return 'Syncing...';
      case 'success':
        return 'Synced';
      case 'error':
        return 'Sync failed';
      default:
        return '';
    }
  };

  const getIcon = (): string => {
    switch (status) {
      case 'syncing':
        return '⟳'; // Spinner icon
      case 'success':
        return '✓'; // Checkmark
      case 'error':
        return '✗'; // Error icon
      default:
        return '';
    }
  };

  const isHidden = status === 'idle';
  const className = `sync-status sync-status--${status} ${isHidden ? 'sync-status--hidden' : ''}`.trim();

  return (
    <div
      data-testid="sync-status-indicator"
      className={className}
      role="status"
      aria-live="polite"
    >
      <div className="sync-status__content">
        <span
          data-testid="sync-status-icon"
          className="sync-status__icon"
          aria-hidden="true"
        >
          {getIcon()}
        </span>
        <span className="sync-status__message">{getMessage()}</span>
      </div>
    </div>
  );
};
