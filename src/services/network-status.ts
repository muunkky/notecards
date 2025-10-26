/**
 * Network Status Detection
 *
 * Detects online/offline status and connection quality.
 * Provides event listeners for network changes.
 *
 * DESIGN PHILOSOPHY - MOBILE-FIRST:
 * - Detect slow connections (2g/slow-2g)
 * - Provide connection type information
 * - Handle offline gracefully
 * - Real-time status updates
 *
 * TDD: Built to pass network-status.test.ts
 */

export interface NetworkStatus {
  isOnline: boolean;
  connectionType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
  isSlowConnection: boolean;
}

type ConnectionType = 'slow-2g' | '2g' | '3g' | '4g';

interface NavigatorConnection extends EventTarget {
  effectiveType?: ConnectionType;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NavigatorConnection;
}

class NetworkStatusDetector {
  private onlineCallbacks: Set<() => void> = new Set();
  private offlineCallbacks: Set<() => void> = new Set();
  private changeCallbacks: Set<(isOnline: boolean) => void> = new Set();

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  /**
   * Handle online event
   */
  private handleOnline = () => {
    this.onlineCallbacks.forEach((callback) => callback());
    this.changeCallbacks.forEach((callback) => callback(true));
  };

  /**
   * Handle offline event
   */
  private handleOffline = () => {
    this.offlineCallbacks.forEach((callback) => callback());
    this.changeCallbacks.forEach((callback) => callback(false));
  };

  /**
   * Check if browser is online
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Check if browser is offline
   */
  isOffline(): boolean {
    return !navigator.onLine;
  }

  /**
   * Get connection type (requires Network Information API)
   */
  getConnectionType(): ConnectionType | 'unknown' {
    const nav = navigator as NavigatorWithConnection;
    if (!nav.connection || !nav.connection.effectiveType) {
      return 'unknown';
    }
    return nav.connection.effectiveType;
  }

  /**
   * Check if connection is slow (2g or slow-2g)
   */
  isSlowConnection(): boolean {
    const type = this.getConnectionType();
    return type === 'slow-2g' || type === '2g';
  }

  /**
   * Get complete network status
   */
  getStatus(): NetworkStatus {
    return {
      isOnline: this.isOnline(),
      connectionType: this.getConnectionType(),
      isSlowConnection: this.isSlowConnection(),
    };
  }

  /**
   * Register callback for online event
   * Returns unsubscribe function
   */
  onOnline(callback: () => void): () => void {
    this.onlineCallbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.onlineCallbacks.delete(callback);
    };
  }

  /**
   * Register callback for offline event
   * Returns unsubscribe function
   */
  onOffline(callback: () => void): () => void {
    this.offlineCallbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.offlineCallbacks.delete(callback);
    };
  }

  /**
   * Register callback for any network status change
   * Callback receives current online status
   * Returns unsubscribe function
   */
  onChange(callback: (isOnline: boolean) => void): () => void {
    this.changeCallbacks.add(callback);

    // Call immediately with current status
    callback(this.isOnline());

    // Return unsubscribe function
    return () => {
      this.changeCallbacks.delete(callback);
    };
  }

  /**
   * Clean up all event listeners and callbacks
   */
  cleanup(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    this.onlineCallbacks.clear();
    this.offlineCallbacks.clear();
    this.changeCallbacks.clear();
  }
}

// Global singleton instance
export const networkStatus = new NetworkStatusDetector();
