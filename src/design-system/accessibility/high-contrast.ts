/**
 * High Contrast Mode Detection and Utilities
 *
 * Detects user's high contrast preference and provides enhanced visual
 * accessibility for users with low vision or specific contrast needs.
 *
 * DESIGN PHILOSOPHY:
 * - Respect user's system preferences (prefers-contrast: high)
 * - Enhance borders, outlines, focus indicators
 * - Maintain brutalist aesthetic (already high contrast)
 * - WCAG AAA compliance (21:1 contrast ratio)
 *
 * Usage:
 * ```typescript
 * import { highContrast } from './accessibility/high-contrast';
 *
 * // Check if high contrast is preferred
 * if (highContrast.isHighContrast()) {
 *   // Apply enhanced contrast styles
 * }
 *
 * // Listen for changes
 * highContrast.onChange((isHighContrast) => {
 *   console.log('High contrast:', isHighContrast);
 * });
 * ```
 */

export type ContrastPreference = 'no-preference' | 'high' | 'low';

export interface HighContrastOptions {
  /**
   * Callback when contrast preference changes
   */
  onChange?: (isHighContrast: boolean) => void;

  /**
   * Apply high contrast class to document root
   * Default: true
   */
  applyRootClass?: boolean;

  /**
   * Root class name for high contrast
   * Default: 'high-contrast'
   */
  rootClassName?: string;
}

class HighContrastManager {
  private mediaQuery: MediaQueryList | null = null;
  private changeCallbacks: Array<(isHighContrast: boolean) => void> = [];
  private isInitialized = false;
  private applyRootClass = true;
  private rootClassName = 'high-contrast';

  /**
   * Initialize high contrast detection
   */
  initialize(options: HighContrastOptions = {}): void {
    if (this.isInitialized) return;

    const { onChange, applyRootClass = true, rootClassName = 'high-contrast' } = options;

    this.applyRootClass = applyRootClass;
    this.rootClassName = rootClassName;

    if (onChange) {
      this.changeCallbacks.push(onChange);
    }

    // Check for prefers-contrast media query support
    if (window.matchMedia) {
      this.mediaQuery = window.matchMedia('(prefers-contrast: high)');

      // Apply initial state
      this.updateContrastState(this.mediaQuery.matches);

      // Listen for changes
      this.mediaQuery.addEventListener('change', this.handleChange);
    }

    this.isInitialized = true;
  }

  /**
   * Handle contrast preference change
   */
  private handleChange = (event: MediaQueryListEvent): void => {
    this.updateContrastState(event.matches);
  };

  /**
   * Update contrast state and notify callbacks
   */
  private updateContrastState(isHighContrast: boolean): void {
    // Apply/remove root class
    if (this.applyRootClass) {
      const root = document.documentElement;
      if (isHighContrast) {
        root.classList.add(this.rootClassName);
      } else {
        root.classList.remove(this.rootClassName);
      }
    }

    // Notify callbacks
    this.changeCallbacks.forEach((callback) => callback(isHighContrast));
  }

  /**
   * Check if high contrast is currently enabled
   */
  isHighContrast(): boolean {
    if (this.mediaQuery) {
      return this.mediaQuery.matches;
    }
    return false;
  }

  /**
   * Get current contrast preference
   */
  getContrastPreference(): ContrastPreference {
    if (!window.matchMedia) {
      return 'no-preference';
    }

    if (window.matchMedia('(prefers-contrast: high)').matches) {
      return 'high';
    }

    if (window.matchMedia('(prefers-contrast: low)').matches) {
      return 'low';
    }

    return 'no-preference';
  }

  /**
   * Register callback for contrast changes
   */
  onChange(callback: (isHighContrast: boolean) => void): () => void {
    this.changeCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.changeCallbacks.indexOf(callback);
      if (index !== -1) {
        this.changeCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get enhanced styles for high contrast mode
   */
  getEnhancedStyles(): React.CSSProperties {
    return {
      // Enhanced borders (thicker, higher contrast)
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: 'currentColor',

      // Enhanced focus indicators
      outline: '3px solid currentColor',
      outlineOffset: '2px',

      // Enhanced text
      fontWeight: 600,

      // No transparency
      opacity: 1,
    };
  }

  /**
   * Clean up event listeners
   */
  cleanup(): void {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener('change', this.handleChange);
      this.mediaQuery = null;
    }

    this.changeCallbacks = [];
    this.isInitialized = false;

    // Remove root class
    if (this.applyRootClass) {
      document.documentElement.classList.remove(this.rootClassName);
    }
  }
}

// Global singleton instance
export const highContrast = new HighContrastManager();

/**
 * React hook for high contrast detection
 * Usage:
 * ```tsx
 * const isHighContrast = useHighContrast();
 * return (
 *   <div style={isHighContrast ? enhancedStyles : normalStyles}>
 *     Content
 *   </div>
 * );
 * ```
 */
export function useHighContrast(): boolean {
  const [isHighContrast, setIsHighContrast] = React.useState(false);

  React.useEffect(() => {
    // Initialize on mount
    if (!highContrast['isInitialized']) {
      highContrast.initialize();
    }

    // Get initial state
    setIsHighContrast(highContrast.isHighContrast());

    // Listen for changes
    const unsubscribe = highContrast.onChange(setIsHighContrast);

    return () => {
      unsubscribe();
    };
  }, []);

  return isHighContrast;
}

// Re-export React for the hook
import * as React from 'react';
