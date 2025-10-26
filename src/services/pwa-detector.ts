/**
 * PWA Detection Service
 *
 * Detects Progressive Web App capabilities, installation status,
 * and platform-specific install requirements.
 *
 * DESIGN PHILOSOPHY - MOBILE-FIRST:
 * - Detect iOS vs Android for appropriate install UX
 * - Handle beforeinstallprompt (Android/Desktop)
 * - Provide manual instructions for iOS (no API support)
 * - Detect if app is already installed
 *
 * TDD: Built to pass pwa-detector.test.ts
 */

export interface PWACapabilities {
  /** Is app currently installed (standalone mode) */
  isInstalled: boolean;
  /** Can app be installed (beforeinstallprompt supported) */
  canInstall: boolean;
  /** Are service workers supported */
  supportsServiceWorker: boolean;
  /** Is iOS device */
  isIOS: boolean;
  /** Is Android device */
  isAndroid: boolean;
  /** Should show iOS manual install instructions */
  needsIOSInstructions: boolean;
}

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class PWADetector {
  private installPromptEvent: BeforeInstallPromptEvent | null = null;
  private installPromptCallbacks: Array<(event: BeforeInstallPromptEvent) => void> = [];

  constructor() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt);
  }

  /**
   * Handle beforeinstallprompt event (Android/Desktop Chrome)
   */
  private handleBeforeInstallPrompt = (e: Event) => {
    // Prevent default mini-infobar
    e.preventDefault();

    // Store event for later use
    this.installPromptEvent = e as BeforeInstallPromptEvent;

    // Notify callbacks
    this.installPromptCallbacks.forEach((callback) => {
      callback(this.installPromptEvent!);
    });
  };

  /**
   * Check if app is currently installed (standalone mode)
   */
  isInstalled(): boolean {
    // Check iOS standalone mode
    if ('standalone' in navigator && (navigator as any).standalone) {
      return true;
    }

    // Check display-mode media query (Android/Desktop)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }

    return false;
  }

  /**
   * Check if iOS device
   */
  isIOS(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  }

  /**
   * Check if Android device
   */
  isAndroid(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    return /android/.test(userAgent);
  }

  /**
   * Check if mobile device (iOS or Android)
   */
  isMobile(): boolean {
    return this.isIOS() || this.isAndroid();
  }

  /**
   * Check if desktop device
   */
  isDesktop(): boolean {
    return !this.isMobile();
  }

  /**
   * Check if beforeinstallprompt is supported (can trigger install)
   */
  canInstall(): boolean {
    // iOS doesn't support beforeinstallprompt
    if (this.isIOS()) {
      return false;
    }

    // Check if we have the install prompt event
    // Or if we're on a platform that might support it
    return this.installPromptEvent !== null || this.isAndroid() || this.isDesktop();
  }

  /**
   * Check if service workers are supported
   */
  supportsServiceWorker(): boolean {
    return 'serviceWorker' in navigator;
  }

  /**
   * Check if iOS install instructions should be shown
   */
  needsIOSInstructions(): boolean {
    return this.isIOS() && !this.isInstalled();
  }

  /**
   * Get all PWA capabilities
   */
  getCapabilities(): PWACapabilities {
    return {
      isInstalled: this.isInstalled(),
      canInstall: this.canInstall(),
      supportsServiceWorker: this.supportsServiceWorker(),
      isIOS: this.isIOS(),
      isAndroid: this.isAndroid(),
      needsIOSInstructions: this.needsIOSInstructions(),
    };
  }

  /**
   * Capture install prompt event (called by beforeinstallprompt listener)
   */
  captureInstallPrompt(event: BeforeInstallPromptEvent): void {
    event.preventDefault();
    this.installPromptEvent = event;
  }

  /**
   * Trigger install prompt (Android/Desktop)
   * Returns user's choice or null if no prompt available
   */
  async triggerInstall(): Promise<'accepted' | 'dismissed' | null> {
    if (!this.installPromptEvent) {
      return null;
    }

    // Show install prompt
    await this.installPromptEvent.prompt();

    // Wait for user choice
    const choice = await this.installPromptEvent.userChoice;

    // Clear prompt after use
    this.installPromptEvent = null;

    return choice.outcome;
  }

  /**
   * Register callback for install prompt availability
   */
  onInstallPromptAvailable(callback: (event: BeforeInstallPromptEvent) => void): () => void {
    this.installPromptCallbacks.push(callback);

    // If prompt already captured, call immediately
    if (this.installPromptEvent) {
      callback(this.installPromptEvent);
    }

    // Return unsubscribe function
    return () => {
      const index = this.installPromptCallbacks.indexOf(callback);
      if (index !== -1) {
        this.installPromptCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Clean up event listeners
   */
  cleanup(): void {
    window.removeEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt);
    this.installPromptEvent = null;
    this.installPromptCallbacks = [];
  }
}

// Global singleton instance
export const pwaDetector = new PWADetector();
