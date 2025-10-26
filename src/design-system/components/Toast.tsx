/**
 * Toast Component - Writer Theme Brutalist Design
 *
 * Notification system for temporary messages with:
 * - Black background with white text (high contrast)
 * - Sharp edges (0px border radius)
 * - Instant appearance/disappearance (0ms transitions)
 * - Fixed position at bottom center
 * - Optional action button (primary use: Undo)
 * - Auto-dismiss after configurable timeout
 *
 * PRIMARY USE CASE: Undo for swipe-to-delete
 * When a card is swiped left to delete, show:
 * "Card deleted" with "Undo" button for 5 seconds
 *
 * INSTANT STATE CHANGE PATTERN (0ms):
 * Toast appears and disappears INSTANTLY with 0ms transitions.
 * No fade-in, slide-up, or any other animation. This aligns with
 * the brutalist philosophy of zero decoration and instant feedback.
 *
 * Implementation:
 * - transition: 'var(--primitive-transitions-none)' // 0ms
 * - Visibility: isOpen ? render : null
 * - React immediately updates DOM (no CSS transitions)
 *
 * TDD: This component is built to pass writer-theme-toast.test.tsx
 */

import * as React from 'react';
import { useEffect, useRef } from 'react';

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Message to display */
  message: string;

  /** Whether toast is visible */
  isOpen: boolean;

  /** Callback when toast should close */
  onClose: () => void;

  /** Optional action label (e.g., "Undo") */
  actionLabel?: string;

  /** Optional action callback */
  onAction?: () => void;

  /** Auto-dismiss duration in ms (default: 5000, null: no auto-dismiss) */
  duration?: number | null;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      message,
      isOpen,
      onClose,
      actionLabel,
      onAction,
      duration = 5000,
      className,
      ...props
    },
    ref
  ) => {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-dismiss timer
    useEffect(() => {
      if (!isOpen || duration === null) {
        return;
      }

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        onClose();
      }, duration);

      // Cleanup on unmount or when isOpen/duration changes
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
    }, [isOpen, duration, onClose]);

    // Handle action click
    const handleAction = () => {
      // Clear timeout to prevent double-close
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      onAction?.();
      onClose();
    };

    // Don't render if not open
    if (!isOpen) {
      return null;
    }

    // Toast styles
    const toastStyles: React.CSSProperties = {
      // Position
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1001, // Above most content

      // Colors
      background: 'var(--primitive-black)', // Black
      color: 'var(--primitive-white)', // White

      // Brutalist aesthetic
      borderRadius: 'var(--primitive-radii-none)', // 0px (sharp edges)
      boxShadow: 'none', // Flat design (no shadows)
      transition: 'var(--primitive-transitions-none)', // 0ms (instant)

      // Spacing
      padding: 'var(--semantic-spacing-md)', // 16px
      paddingLeft: 'var(--semantic-spacing-lg)', // 20px
      paddingRight: 'var(--semantic-spacing-lg)', // 20px

      // Layout
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--semantic-spacing-md)', // 16px

      // Min width for readability
      minWidth: '200px',
      maxWidth: 'calc(100vw - 40px)', // Mobile-friendly
    };

    // Message styles
    const messageStyles: React.CSSProperties = {
      fontFamily: 'var(--semantic-typography-font-primary)', // System font
      fontSize: '15px',
      lineHeight: '1.4',
      flex: '1',
    };

    // Action button styles
    const actionButtonStyles: React.CSSProperties = {
      background: 'transparent',
      border: 'none',
      color: 'var(--primitive-white)',
      fontFamily: 'var(--semantic-typography-font-primary)',
      fontSize: '15px',
      fontWeight: 600,
      cursor: 'pointer',
      padding: '0',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      outline: 'none',
      transition: 'var(--primitive-transitions-none)', // 0ms
    };

    const computedClassName = ['toast', className].filter(Boolean).join(' ');

    return (
      <div
        ref={ref}
        data-testid="toast"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={toastStyles}
        className={computedClassName}
        {...props}
      >
        <span style={messageStyles}>{message}</span>

        {actionLabel && onAction && (
          <button
            type="button"
            onClick={handleAction}
            style={actionButtonStyles}
            data-testid="toast-action"
          >
            {actionLabel}
          </button>
        )}
      </div>
    );
  }
);

Toast.displayName = 'Toast';

// NATIVE TODO: Add haptic feedback when toast appears
// When we wrap in Capacitor, add:
// import { Haptics } from '@capacitor/haptics';
// import { Capacitor } from '@capacitor/core';
//
// useEffect(() => {
//   if (!isOpen) return;
//
//   if (Capacitor.isNativePlatform()) {
//     Haptics.notification({ type: 'success' }); // Light tap
//   }
// }, [isOpen]);

// NATIVE TODO: Add haptic feedback when action button is pressed
// const handleAction = async () => {
//   if (Capacitor.isNativePlatform()) {
//     await Haptics.impact({ style: 'light' });
//   }
//
//   onAction?.();
//   onClose();
// };
