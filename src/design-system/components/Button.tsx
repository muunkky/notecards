/**
 * Button Component - Writer Theme Brutalist Design
 *
 * Implements brutalist aesthetic with Writer theme design tokens:
 * - Pure black (#000000) backgrounds
 * - Sharp edges (0px border radius)
 * - Zero animations (instant state changes)
 * - 44px touch targets (Apple HIG)
 * - High contrast text
 * - Strong borders
 *
 * TDD: This component is built to pass writer-theme-button.test.tsx (71 tests)
 */

import * as React from 'react';
import { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: 'primary' | 'secondary';

  /** Size affects height and padding */
  size?: 'sm' | 'md' | 'lg';

  /** Loading state - disables button and shows aria-busy */
  loading?: boolean;

  /** Full width button */
  fullWidth?: boolean;

  /** Button content */
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled = false,
      type = 'button',
      children,
      style,
      ...props
    },
    ref
  ) => {
    // Size-specific styles
    const sizeStyles = {
      sm: {
        minHeight: '36px',
        padding: 'var(--semantic-spacing-xs) var(--semantic-spacing-sm)', // 8px 12px
        fontSize: 'var(--semantic-typography-font-size-sm)', // 14px
      },
      md: {
        minHeight: '44px', // Apple HIG minimum
        padding: 'var(--semantic-spacing-sm) var(--semantic-spacing-md)', // 12px 16px
        fontSize: 'var(--semantic-typography-font-size-md)', // 16px
      },
      lg: {
        minHeight: '52px',
        padding: 'var(--semantic-spacing-md) var(--semantic-spacing-lg)', // 16px 24px
        fontSize: 'var(--semantic-typography-font-size-lg)', // 18px
      },
    };

    // Variant-specific styles
    const variantStyles = {
      primary: {
        background: 'var(--component-button-primary-background)', // Pure black
        color: 'var(--component-button-primary-text)', // White
        border: '1px solid var(--component-button-primary-border)', // Transparent
      },
      secondary: {
        background: 'var(--component-button-secondary-background)', // Transparent
        color: 'var(--component-button-secondary-text)', // Black
        border: '1px solid var(--component-button-secondary-border)', // Black
      },
    };

    // Combined styles
    const buttonStyles: React.CSSProperties = {
      // Variant styles
      ...variantStyles[variant],

      // Size styles
      ...sizeStyles[size],

      // Brutalist aesthetic
      borderRadius: 'var(--primitive-radii-none)', // 0px (sharp edges)
      transition: 'var(--primitive-transitions-none)', // 0ms (instant)

      // Typography
      fontWeight: 600, // Strong (binary choice: 400 or 600)
      fontFamily: 'var(--semantic-typography-font-primary)',

      // Layout
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: fullWidth ? '100%' : 'auto',

      // Cursor
      cursor: disabled || loading ? 'not-allowed' : 'pointer',

      // Disabled state
      opacity: disabled || loading ? 0.5 : 1,

      // User overrides
      ...style,
    };

    // Hover styles (CSS-in-JS doesn't support :hover, will use CSS classes)
    const hoverClass = variant === 'primary' ? 'button-primary-hover' : 'button-secondary-hover';
    const activeClass = variant === 'primary' ? 'button-primary-active' : 'button-secondary-active';
    const focusClass = 'button-focus';

    return (
      <>
        {/* Inject hover/active/focus styles */}
        <style>{`
          .button-primary-hover:hover:not(:disabled) {
            background: var(--primitive-gray-900) !important; /* #171717 */
          }
          .button-primary-active:active:not(:disabled) {
            background: var(--primitive-gray-800) !important; /* #262626 */
          }
          .button-secondary-hover:hover:not(:disabled) {
            background: var(--primitive-gray-50) !important; /* #fafafa */
          }
          .button-focus:focus-visible {
            outline: 2px solid var(--primitive-black) !important;
            outline-offset: 2px;
          }
        `}</style>

        <button
          ref={ref}
          type={type}
          disabled={disabled || loading}
          aria-disabled={disabled || loading}
          aria-busy={loading}
          className={`${hoverClass} ${activeClass} ${focusClass}`}
          style={buttonStyles}
          {...props}
        >
          {children}
        </button>
      </>
    );
  }
);

Button.displayName = 'Button';

// NATIVE TODO: Add haptic feedback on button press
// When we wrap in Capacitor, add:
// import { Haptics } from '@capacitor/haptics';
//
// const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
//   if (Capacitor.isNativePlatform()) {
//     await Haptics.impact({ style: 'light' });
//   }
//   props.onClick?.(e);
// };
