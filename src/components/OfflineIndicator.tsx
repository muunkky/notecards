/**
 * OfflineIndicator Component
 *
 * Shows online/offline status and connection quality to users.
 * Mobile-first design with Writer theme brutalist aesthetics.
 *
 * DESIGN PHILOSOPHY - MOBILE-FIRST:
 * - Fixed position banner (non-intrusive)
 * - Clear offline indication
 * - Slow connection warnings for mobile users
 * - Accessible with screen reader support
 * - Brutalist visual style (thick borders, high contrast)
 *
 * TDD: Built to pass OfflineIndicator.test.tsx
 *
 * @example
 * <OfflineIndicator />
 */

import React from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import '../design-system/styles/offline-indicator.css';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, isSlowConnection } = useNetworkStatus();

  // Don't show anything if online and fast connection
  if (isOnline && !isSlowConnection) {
    return null;
  }

  // Determine message and style
  const isOffline = !isOnline;
  const message = isOffline ? 'You are offline' : 'Slow connection';
  const severity = isOffline ? 'error' : 'warning';

  return (
    <div
      data-testid="offline-indicator"
      role="status"
      aria-live="polite"
      className={`offline-indicator offline-indicator--${severity}`}
    >
      <div className="offline-indicator__content">
        <span className="offline-indicator__icon" aria-hidden="true">
          {isOffline ? '⚠' : '🐌'}
        </span>
        <span className="offline-indicator__message">{message}</span>
      </div>
    </div>
  );
};
