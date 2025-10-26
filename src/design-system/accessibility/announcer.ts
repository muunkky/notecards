/**
 * Screen Reader Announcer
 *
 * Provides live region announcements for screen readers using ARIA live regions.
 * Follows WCAG 2.1 Level AA requirements for dynamic content updates.
 *
 * DESIGN PHILOSOPHY - MOBILE-FIRST ACCESSIBILITY:
 * - VoiceOver (iOS) and TalkBack (Android) support
 * - Polite announcements (don't interrupt user)
 * - Assertive for critical actions (delete, error)
 * - Debounced to prevent announcement spam
 *
 * Usage:
 * ```typescript
 * import { announcer } from './accessibility/announcer';
 *
 * // Polite announcement (default)
 * announcer.announce('Card created');
 *
 * // Assertive announcement (interrupts)
 * announcer.announce('Card deleted', 'assertive');
 * ```
 */

export type AriaLive = 'polite' | 'assertive' | 'off';

export interface AnnouncerOptions {
  /**
   * Priority of announcement
   * - polite: Wait for natural pause (default)
   * - assertive: Interrupt current speech
   */
  priority?: AriaLive;

  /**
   * Delay before announcement (ms)
   * Useful for giving user time to complete action
   */
  delay?: number;

  /**
   * Timeout for announcement removal (ms)
   * Default: 1000ms (1 second after announcement)
   */
  timeout?: number;
}

class ScreenReaderAnnouncer {
  private politeRegion: HTMLDivElement | null = null;
  private assertiveRegion: HTMLDivElement | null = null;
  private announceTimeout: NodeJS.Timeout | null = null;
  private clearTimeout: NodeJS.Timeout | null = null;

  /**
   * Initialize live regions for screen reader announcements
   * Should be called once on app initialization
   */
  initialize(): void {
    if (this.politeRegion || this.assertiveRegion) {
      // Already initialized
      return;
    }

    // Create polite live region
    this.politeRegion = this.createLiveRegion('polite');
    document.body.appendChild(this.politeRegion);

    // Create assertive live region
    this.assertiveRegion = this.createLiveRegion('assertive');
    document.body.appendChild(this.assertiveRegion);
  }

  /**
   * Create a live region element with proper ARIA attributes
   */
  private createLiveRegion(priority: 'polite' | 'assertive'): HTMLDivElement {
    const region = document.createElement('div');

    // ARIA attributes for live region
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'true');

    // Visually hidden but accessible to screen readers
    Object.assign(region.style, {
      position: 'absolute',
      left: '-10000px',
      width: '1px',
      height: '1px',
      overflow: 'hidden',
    });

    return region;
  }

  /**
   * Announce a message to screen readers
   *
   * @param message - Text to announce
   * @param priority - 'polite' (default) or 'assertive'
   * @param options - Additional options (delay, timeout)
   */
  announce(
    message: string,
    priority: AriaLive = 'polite',
    options: AnnouncerOptions = {}
  ): void {
    if (!message || priority === 'off') {
      return;
    }

    // Initialize if not already done
    if (!this.politeRegion || !this.assertiveRegion) {
      this.initialize();
    }

    const { delay = 0, timeout = 1000 } = options;

    // Clear any pending announcements
    if (this.announceTimeout) {
      clearTimeout(this.announceTimeout);
    }
    if (this.clearTimeout) {
      clearTimeout(this.clearTimeout);
    }

    // Delay announcement if requested
    this.announceTimeout = setTimeout(() => {
      const region = priority === 'assertive' ? this.assertiveRegion : this.politeRegion;

      if (region) {
        // Set message
        region.textContent = message;

        // Clear message after timeout to allow repeated announcements
        this.clearTimeout = setTimeout(() => {
          if (region) {
            region.textContent = '';
          }
        }, timeout);
      }
    }, delay);
  }

  /**
   * Announce card state change
   */
  announceCardAction(action: string, cardTitle?: string): void {
    const title = cardTitle ? ` "${cardTitle}"` : '';
    this.announce(`Card${title} ${action}`, 'polite');
  }

  /**
   * Announce card deletion with undo option
   */
  announceCardDeleted(cardTitle: string, hasUndo: boolean = true): void {
    const undoText = hasUndo ? '. Undo available' : '';
    this.announce(`Card "${cardTitle}" deleted${undoText}`, 'assertive');
  }

  /**
   * Announce card reordering
   */
  announceCardReordered(cardTitle: string, newPosition: number, totalCards: number): void {
    this.announce(
      `Card "${cardTitle}" moved to position ${newPosition} of ${totalCards}`,
      'polite'
    );
  }

  /**
   * Announce reorder mode activation
   */
  announceReorderMode(active: boolean): void {
    if (active) {
      this.announce('Reorder mode activated. Drag cards to reorder, press Escape to cancel', 'polite');
    } else {
      this.announce('Reorder mode deactivated', 'polite');
    }
  }

  /**
   * Announce error message
   */
  announceError(message: string): void {
    this.announce(`Error: ${message}`, 'assertive');
  }

  /**
   * Announce success message
   */
  announceSuccess(message: string): void {
    this.announce(message, 'polite');
  }

  /**
   * Announce navigation change
   */
  announceNavigation(destination: string): void {
    this.announce(`Navigated to ${destination}`, 'polite');
  }

  /**
   * Clean up live regions (for testing or unmount)
   */
  cleanup(): void {
    if (this.announceTimeout) {
      clearTimeout(this.announceTimeout);
      this.announceTimeout = null;
    }
    if (this.clearTimeout) {
      clearTimeout(this.clearTimeout);
      this.clearTimeout = null;
    }

    if (this.politeRegion && this.politeRegion.parentNode) {
      this.politeRegion.parentNode.removeChild(this.politeRegion);
      this.politeRegion = null;
    }

    if (this.assertiveRegion && this.assertiveRegion.parentNode) {
      this.assertiveRegion.parentNode.removeChild(this.assertiveRegion);
      this.assertiveRegion = null;
    }
  }
}

// Global singleton instance
export const announcer = new ScreenReaderAnnouncer();
