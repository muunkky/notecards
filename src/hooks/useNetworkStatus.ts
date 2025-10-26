/**
 * useNetworkStatus Hook
 *
 * React hook for detecting online/offline status and connection quality.
 * Subscribes to network changes and re-renders components automatically.
 *
 * DESIGN PHILOSOPHY - MOBILE-FIRST:
 * - Real-time network status updates
 * - Connection quality detection for mobile
 * - Automatic cleanup on unmount
 * - Multiple instances supported
 *
 * TDD: Built to pass useNetworkStatus.test.tsx
 *
 * @example
 * const MyComponent = () => {
 *   const { isOnline, isSlowConnection, connectionType } = useNetworkStatus();
 *
 *   if (!isOnline) {
 *     return <OfflineIndicator />;
 *   }
 *
 *   if (isSlowConnection) {
 *     return <div>Loading... (slow connection)</div>;
 *   }
 *
 *   return <div>Status: {connectionType}</div>;
 * };
 */

import { useState, useEffect } from 'react';
import { networkStatus, NetworkStatus } from '../services/network-status';

/**
 * Hook for tracking network status in React components
 *
 * @returns Current network status object with:
 *   - isOnline: boolean (true if browser is online)
 *   - connectionType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown'
 *   - isSlowConnection: boolean (true for 2g/slow-2g)
 */
export function useNetworkStatus(): NetworkStatus {
  // Initialize with current status
  const [status, setStatus] = useState<NetworkStatus>(() => networkStatus.getStatus());

  useEffect(() => {
    // Subscribe to network status changes
    // onChange calls immediately with current status, then on every change
    const unsubscribe = networkStatus.onChange((isOnline: boolean) => {
      // Get full status snapshot when network changes
      setStatus(networkStatus.getStatus());
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []); // Empty deps - subscribe once on mount

  return status;
}
