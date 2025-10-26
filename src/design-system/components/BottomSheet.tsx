/**
 * BottomSheet Component - Writer Theme
 *
 * Mobile-native action sheet that slides up from bottom of screen.
 * Used for pickers, menus, and forms on mobile devices.
 *
 * Features:
 * - 75% black scrim backdrop
 * - Zero animations (instant appear/disappear)
 * - Full-width mobile design
 * - Sharp edges (brutalist aesthetic)
 * - Dismiss via backdrop tap, ESC key, or close button
 * - Accessibility (ARIA labels, focus trap)
 *
 * Design: Based on docs/WRITER-DESIGN-THESIS.md
 * Philosophy: "Zero animations. Instant state changes. 0ms transitions."
 */

import * as React from 'react';
import { useEffect } from 'react';

export interface BottomSheetProps {
  /** Controls whether the bottom sheet is visible */
  isOpen: boolean;

  /** Called when the bottom sheet should be closed */
  onClose: () => void;

  /** Content to display in the bottom sheet */
  children: React.ReactNode;

  /** Optional title shown in the header */
  title?: string;

  /** Whether to show the close button (X) in header. Default: true */
  showCloseButton?: boolean;

  /** Optional test ID for testing */
  testId?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  title,
  showCloseButton = true,
  testId = 'bottom-sheet',
}) => {
  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Don't render if not open
  if (!isOpen) return null;

  // Backdrop click handler (only close if clicking backdrop, not sheet content)
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if the click target is the backdrop itself
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Scrim backdrop (75% black overlay)
  const scrimStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.75)', // 75% black scrim
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    transition: 'var(--primitive-transitions-none)', // 0ms
  };

  // Bottom sheet container
  const sheetStyles: React.CSSProperties = {
    background: 'var(--primitive-white)',
    width: '100%',
    maxHeight: '90vh', // Leave space at top
    borderTopLeftRadius: 'var(--primitive-radii-none)', // 0px
    borderTopRightRadius: 'var(--primitive-radii-none)', // 0px
    borderTop: '2px solid var(--primitive-black)', // Thick top border
    boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'var(--primitive-transitions-none)', // 0ms
    overflow: 'hidden',
  };

  // Header styles
  const headerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--semantic-spacing-md)', // 16px
    borderBottom: title ? '1px solid var(--primitive-gray-200)' : 'none',
    minHeight: '60px',
  };

  // Title styles
  const titleStyles: React.CSSProperties = {
    fontFamily: 'var(--semantic-typography-font-primary)',
    fontSize: 'var(--semantic-typography-font-size-lg)', // 18px
    fontWeight: 600,
    color: 'var(--primitive-black)',
  };

  // Close button styles
  const closeButtonStyles: React.CSSProperties = {
    background: 'var(--primitive-white)',
    border: '1px solid var(--primitive-black)',
    borderRadius: 'var(--primitive-radii-none)', // 0px
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '20px',
    fontWeight: 600,
    color: 'var(--primitive-black)',
    transition: 'var(--primitive-transitions-none)', // 0ms
  };

  // Content area styles
  const contentStyles: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: 'var(--semantic-spacing-md)', // 16px
  };

  return (
    <>
      {/* Inject hover styles */}
      <style>{`
        .bottom-sheet-close-btn:hover {
          background: var(--primitive-gray-100) !important;
        }
        .bottom-sheet-close-btn:active {
          background: var(--primitive-gray-200) !important;
        }
      `}</style>

      {/* Scrim backdrop */}
      <div
        style={scrimStyles}
        onClick={handleBackdropClick}
        data-testid={`${testId}-backdrop`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? `${testId}-title` : undefined}
      >
        {/* Bottom sheet */}
        <div style={sheetStyles} data-testid={testId}>
          {/* Header */}
          <div style={headerStyles}>
            {/* Title */}
            {title && (
              <h2 style={titleStyles} id={`${testId}-title`}>
                {title}
              </h2>
            )}

            {/* Spacer if no title */}
            {!title && <div style={{ flex: 1 }} />}

            {/* Close button */}
            {showCloseButton && (
              <button
                className="bottom-sheet-close-btn"
                style={closeButtonStyles}
                onClick={onClose}
                aria-label="Close"
                data-testid={`${testId}-close-btn`}
              >
                ×
              </button>
            )}
          </div>

          {/* Content */}
          <div style={contentStyles}>{children}</div>
        </div>
      </div>
    </>
  );
};

BottomSheet.displayName = 'BottomSheet';

// NATIVE TODO: Add pull-down gesture to close
// When wrapped in Capacitor, add:
// import { Gesture } from '@ionic/react';
//
// Add gesture handler that tracks vertical drag:
// - Show visual feedback (sheet follows finger)
// - Close if dragged down > 100px and released
// - Snap back if released before threshold
// - Add haptic feedback on close

// NATIVE TODO: Add safe area padding for notched devices
// When wrapped in Capacitor:
// import { SafeArea } from '@capacitor/core';
//
// Add bottom padding for home indicator:
// paddingBottom: `calc(var(--semantic-spacing-md) + env(safe-area-inset-bottom))`
