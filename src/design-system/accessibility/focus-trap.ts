/**
 * Focus Trap Utility
 *
 * Manages focus within modal dialogs and overlays to prevent keyboard users
 * from tabbing outside the interactive area. Follows WCAG 2.1 requirements.
 *
 * DESIGN PHILOSOPHY - MOBILE-FIRST:
 * - Keyboard navigation for desktop power users
 * - Touch-first for mobile (no focus trap needed)
 * - Escape key to close modals
 * - Return focus to trigger element on close
 *
 * Usage:
 * ```typescript
 * import { createFocusTrap } from './accessibility/focus-trap';
 *
 * const trap = createFocusTrap(modalElement, {
 *   onEscape: () => closeModal(),
 *   returnFocusOnDeactivate: true
 * });
 *
 * trap.activate();
 * // ... user interacts with modal
 * trap.deactivate();
 * ```
 */

export interface FocusTrapOptions {
  /**
   * Called when Escape key is pressed
   */
  onEscape?: () => void;

  /**
   * Return focus to trigger element when deactivated
   * Default: true
   */
  returnFocusOnDeactivate?: boolean;

  /**
   * Element to focus when trap activates
   * Default: first focusable element
   */
  initialFocus?: HTMLElement | (() => HTMLElement);

  /**
   * Allow focus outside trap (for testing)
   * Default: false
   */
  allowOutsideClick?: boolean;

  /**
   * Fallback element if no focusable elements found
   * Default: container itself
   */
  fallbackFocus?: HTMLElement;
}

export interface FocusTrap {
  activate(): void;
  deactivate(): void;
  pause(): void;
  unpause(): void;
  updateContainerElements(containers: HTMLElement[]): void;
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  const elements = Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors));

  // Filter out elements with visibility: hidden or display: none
  return elements.filter((el) => {
    const style = window.getComputedStyle(el);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      !el.hasAttribute('aria-hidden')
    );
  });
}

/**
 * Create a focus trap for a container element
 */
export function createFocusTrap(
  container: HTMLElement | HTMLElement[],
  options: FocusTrapOptions = {}
): FocusTrap {
  const {
    onEscape,
    returnFocusOnDeactivate = true,
    initialFocus,
    allowOutsideClick = false,
    fallbackFocus,
  } = options;

  let containers = Array.isArray(container) ? container : [container];
  let previouslyFocusedElement: HTMLElement | null = null;
  let isActive = false;
  let isPaused = false;

  /**
   * Handle Tab key to cycle focus
   */
  function handleTab(event: KeyboardEvent): void {
    if (isPaused || !isActive) return;

    const focusableElements = containers.flatMap((c) => getFocusableElements(c));

    if (focusableElements.length === 0) {
      // No focusable elements, focus container
      event.preventDefault();
      const fallback = fallbackFocus || containers[0];
      if (fallback) {
        fallback.setAttribute('tabindex', '-1');
        fallback.focus();
      }
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      // Shift+Tab on first element: cycle to last
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      // Tab on last element: cycle to first
      event.preventDefault();
      firstElement.focus();
    }
  }

  /**
   * Handle Escape key
   */
  function handleEscape(event: KeyboardEvent): void {
    if (isPaused || !isActive) return;

    if (event.key === 'Escape' && onEscape) {
      event.preventDefault();
      onEscape();
    }
  }

  /**
   * Handle click outside trap
   */
  function handleClickOutside(event: MouseEvent): void {
    if (isPaused || !isActive || allowOutsideClick) return;

    const target = event.target as Node;
    const clickedInside = containers.some((c) => c.contains(target));

    if (!clickedInside) {
      event.preventDefault();
      event.stopPropagation();

      // Return focus to first focusable element
      const focusableElements = containers.flatMap((c) => getFocusableElements(c));
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }

  /**
   * Handle keydown events
   */
  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      handleTab(event);
    } else if (event.key === 'Escape') {
      handleEscape(event);
    }
  }

  /**
   * Activate focus trap
   */
  function activate(): void {
    if (isActive) return;

    // Save currently focused element
    previouslyFocusedElement = document.activeElement as HTMLElement;

    // Add event listeners
    document.addEventListener('keydown', handleKeydown, true);
    document.addEventListener('click', handleClickOutside, true);

    // Focus initial element
    const focusableElements = containers.flatMap((c) => getFocusableElements(c));

    if (initialFocus) {
      const elementToFocus =
        typeof initialFocus === 'function' ? initialFocus() : initialFocus;
      elementToFocus?.focus();
    } else if (focusableElements.length > 0) {
      focusableElements[0].focus();
    } else if (fallbackFocus) {
      fallbackFocus.setAttribute('tabindex', '-1');
      fallbackFocus.focus();
    } else if (containers[0]) {
      containers[0].setAttribute('tabindex', '-1');
      containers[0].focus();
    }

    isActive = true;
  }

  /**
   * Deactivate focus trap
   */
  function deactivate(): void {
    if (!isActive) return;

    // Remove event listeners
    document.removeEventListener('keydown', handleKeydown, true);
    document.removeEventListener('click', handleClickOutside, true);

    // Return focus to previously focused element
    if (returnFocusOnDeactivate && previouslyFocusedElement) {
      previouslyFocusedElement.focus();
    }

    isActive = false;
    isPaused = false;
    previouslyFocusedElement = null;
  }

  /**
   * Pause focus trap (allow focus outside temporarily)
   */
  function pause(): void {
    isPaused = true;
  }

  /**
   * Unpause focus trap
   */
  function unpause(): void {
    isPaused = false;
  }

  /**
   * Update container elements (for dynamic content)
   */
  function updateContainerElements(newContainers: HTMLElement[]): void {
    containers = newContainers;
  }

  return {
    activate,
    deactivate,
    pause,
    unpause,
    updateContainerElements,
  };
}

/**
 * React hook for focus trap
 * Usage:
 * ```tsx
 * const modalRef = useRef<HTMLDivElement>(null);
 * useFocusTrap(modalRef, isOpen, { onEscape: closeModal });
 * ```
 */
export function useFocusTrap(
  ref: React.RefObject<HTMLElement>,
  isActive: boolean,
  options: FocusTrapOptions = {}
): void {
  const trapRef = React.useRef<FocusTrap | null>(null);

  React.useEffect(() => {
    if (!ref.current) return;

    // Create trap if it doesn't exist
    if (!trapRef.current) {
      trapRef.current = createFocusTrap(ref.current, options);
    }

    // Activate or deactivate based on isActive prop
    if (isActive) {
      trapRef.current.activate();
    } else {
      trapRef.current.deactivate();
    }

    // Cleanup on unmount
    return () => {
      if (trapRef.current) {
        trapRef.current.deactivate();
      }
    };
  }, [ref, isActive, options]);
}

// Re-export React for the hook
import * as React from 'react';
