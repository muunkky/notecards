/**
 * AddCardButton Component - Writer Theme
 *
 * Floating action button (FAB) for quick card creation.
 * Positioned in bottom-right corner of screen.
 *
 * Features:
 * - Fixed positioning (bottom-right)
 * - 56px x 56px size (standard FAB, meets 44px minimum)
 * - Black background with white + symbol
 * - Sharp edges (0px border radius, brutalist)
 * - Zero animations (instant state changes)
 * - Elevation with box-shadow
 * - Hover/active states
 * - Accessible (ARIA label, keyboard support)
 *
 * Design: Based on docs/WRITER-DESIGN-THESIS.md
 * Philosophy: "Zero animations. Instant state changes. 0ms transitions."
 */

import * as React from 'react';

export interface AddCardButtonProps {
  /** Called when the button is clicked */
  onClick?: () => void;

  /** Optional label text (defaults to "+") */
  label?: string;

  /** Optional test ID for testing */
  testId?: string;

  /** Whether the button is disabled */
  disabled?: boolean;
}

export const AddCardButton: React.FC<AddCardButtonProps> = ({
  onClick,
  label = '+',
  testId = 'add-card-button',
  disabled = false,
}) => {
  // FAB container styles (fixed positioning)
  const fabStyles: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px', // 20px from bottom
    right: '20px', // 20px from right
    width: '56px',
    height: '56px',
    background: disabled ? 'var(--primitive-gray-400)' : 'var(--primitive-black)',
    color: 'var(--primitive-white)',
    border: '2px solid var(--primitive-black)',
    borderRadius: 'var(--primitive-radii-none)', // 0px (brutalist)
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow: disabled
      ? 'none'
      : '0 4px 12px rgba(0, 0, 0, 0.15)', // Subtle elevation
    transition: 'var(--primitive-transitions-none)', // 0ms
    zIndex: 100, // Above content, below modals (1000)
    userSelect: 'none',
    opacity: disabled ? 0.6 : 1,
  };

  return (
    <>
      {/* Inject hover/active styles */}
      <style>{`
        .add-card-fab:hover:not(:disabled) {
          background: var(--primitive-gray-800) !important;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25) !important;
        }
        .add-card-fab:active:not(:disabled) {
          background: var(--primitive-gray-900) !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>

      <button
        className="add-card-fab"
        style={fabStyles}
        onClick={onClick}
        disabled={disabled}
        aria-label="Add new card"
        data-testid={testId}
        type="button"
      >
        {label}
      </button>
    </>
  );
};

AddCardButton.displayName = 'AddCardButton';

// NATIVE TODO: Add haptic feedback on tap
// When FAB is tapped:
// import { Haptics } from '@capacitor/haptics';
// await Haptics.impact({ style: 'light' });

// NATIVE TODO: Add safe area padding for notched devices
// When wrapped in Capacitor, adjust positioning:
// bottom: calc(20px + env(safe-area-inset-bottom))
// right: calc(20px + env(safe-area-inset-right))

// NATIVE TODO: Add FAB menu for multiple actions
// Long-press FAB to show mini-menu:
// - New card
// - New deck
// - Import cards
// - Quick note
// Mini-menu appears above FAB with stacked buttons
