/**
 * Input Component - Writer Theme Brutalist Design
 *
 * Implements brutalist aesthetic with Writer theme design tokens:
 * - White background with black border
 * - Sharp edges (0px border radius)
 * - 16px font size (prevents iOS zoom)
 * - 44px touch targets (Apple HIG)
 * - High contrast text
 * - Thick border on focus (2px)
 * - Zero animations
 *
 * TDD: This component is built to pass writer-theme-input.test.tsx
 */

import * as React from 'react';
import { forwardRef } from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input label text */
  label: string;

  /** Input type - text, email, password, number */
  type?: 'text' | 'email' | 'password' | 'number';

  /** Error message to display */
  error?: string;

  /** Help text to display below input */
  helpText?: string;

  /** Multiline mode - renders textarea */
  multiline?: boolean;

  /** Number of rows for textarea */
  rows?: number;
}

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (
    {
      label,
      type = 'text',
      error,
      helpText,
      multiline = false,
      rows = 3,
      disabled = false,
      required = false,
      id,
      className,
      style,
      ...props
    },
    ref
  ) => {
    // Generate unique IDs for accessibility
    const inputId = id || `input-${React.useId()}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helpTextId = helpText ? `${inputId}-help` : undefined;

    // Determine aria-describedby
    const describedBy = [errorId, helpTextId].filter(Boolean).join(' ') || undefined;

    // Base input styles
    const inputStyles: React.CSSProperties = {
      // Colors
      background: 'var(--component-input-background)', // White
      color: 'var(--component-input-text)', // Black
      border: error
        ? '2px solid var(--primitive-red-500)' // Red error border
        : '1px solid var(--component-input-border)', // Black border

      // Brutalist aesthetic
      borderRadius: 'var(--primitive-radii-none)', // 0px (sharp edges)
      transition: 'var(--primitive-transitions-none)', // 0ms (instant)

      // Typography (16px prevents iOS zoom)
      fontSize: 'var(--semantic-typography-font-size-md)', // 16px
      fontFamily: 'var(--semantic-typography-font-primary)',
      fontWeight: 400,

      // Touch target sizing (44px minimum)
      minHeight: '44px',
      padding: 'var(--semantic-spacing-sm) var(--semantic-spacing-md)', // 12px 16px

      // Layout
      display: 'block',
      width: '100%',
      boxSizing: 'border-box',

      // Cursor
      cursor: disabled ? 'not-allowed' : 'text',

      // Disabled state
      opacity: disabled ? 0.5 : 1,

      // User overrides
      ...style,
    };

    // Label styles
    const labelStyles: React.CSSProperties = {
      display: 'block',
      marginBottom: 'var(--semantic-spacing-xs)', // 8px
      fontSize: 'var(--semantic-typography-font-size-sm)', // 14px
      fontWeight: 600,
      color: 'var(--primitive-black)',
    };

    // Error message styles
    const errorStyles: React.CSSProperties = {
      marginTop: 'var(--semantic-spacing-xs)', // 8px
      fontSize: 'var(--semantic-typography-font-size-sm)', // 14px
      color: 'var(--primitive-red-500)',
    };

    // Help text styles
    const helpTextStyles: React.CSSProperties = {
      marginTop: 'var(--semantic-spacing-xs)', // 8px
      fontSize: 'var(--semantic-typography-font-size-sm)', // 14px
      color: 'var(--primitive-gray-600)',
    };

    // Focus class for styling
    const focusClass = 'input-focus';

    return (
      <>
        {/* Inject focus styles */}
        <style>{`
          .input-focus:focus {
            border-width: 2px !important;
            border-color: var(--primitive-black) !important;
            outline: none;
          }
          .input-focus::placeholder {
            color: var(--primitive-gray-400);
          }
        `}</style>

        <div className={className}>
          {/* Label */}
          <label htmlFor={inputId} style={labelStyles}>
            {label}
            {required && <span style={{ color: 'var(--primitive-red-500)' }}> *</span>}
          </label>

          {/* Input or Textarea */}
          {multiline ? (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              id={inputId}
              disabled={disabled}
              required={required}
              aria-required={required}
              aria-invalid={!!error}
              aria-describedby={describedBy}
              rows={rows}
              className={focusClass}
              style={inputStyles}
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              type={type}
              id={inputId}
              disabled={disabled}
              required={required}
              aria-required={required}
              aria-invalid={!!error}
              aria-describedby={describedBy}
              className={focusClass}
              style={inputStyles}
              {...props}
            />
          )}

          {/* Error message */}
          {error && (
            <div id={errorId} role="alert" style={errorStyles}>
              {error}
            </div>
          )}

          {/* Help text */}
          {helpText && !error && (
            <div id={helpTextId} style={helpTextStyles}>
              {helpText}
            </div>
          )}
        </div>
      </>
    );
  }
);

Input.displayName = 'Input';

// NATIVE TODO: Add keyboard avoidance for iOS
// When input is focused, ensure it's scrolled into view above keyboard.
// Use Capacitor Keyboard plugin:
//
// import { Keyboard } from '@capacitor/keyboard';
// import { Capacitor } from '@capacitor/core';
//
// const handleFocus = async (e: React.FocusEvent<HTMLInputElement>) => {
//   if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
//     // Scroll input into view above keyboard
//     await Keyboard.show();
//     e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
//   }
//   props.onFocus?.(e);
// };
