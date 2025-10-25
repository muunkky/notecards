/**
 * Card Component - Writer Theme Brutalist Design
 *
 * Implements brutalist aesthetic with Writer theme's SIGNATURE visual element:
 * - 4px colored decorator strip on left
 * - White background with black border
 * - Sharp edges (0px border radius)
 * - No shadows (flat design)
 * - Zero animations (instant state changes)
 * - Monospace font for title (terminal aesthetic)
 * - System font for body content
 * - Collapsible functionality
 *
 * TDD: This component is built to pass writer-theme-card.test.tsx
 */

import * as React from 'react';
import { useState } from 'react';
import { CategoryValue, getCategoryColor } from '../../domain/categories';

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** Card title text */
  title: string;

  /** Category type - determines decorator strip color */
  category?: CategoryValue;

  /** Card content */
  children: React.ReactNode;

  /** Enable collapsible functionality */
  collapsible?: boolean;

  /** Default expanded state for collapsible cards */
  defaultExpanded?: boolean;

  /** Controlled expansion state */
  expanded?: boolean;

  /** Callback when expansion state changes */
  onExpandedChange?: (expanded: boolean) => void;
}

export const Card = React.forwardRef<HTMLElement, CardProps>(
  (
    {
      title,
      category,
      children,
      collapsible = false,
      defaultExpanded = false,
      expanded: controlledExpanded,
      onExpandedChange,
      style,
      onClick,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    // Expansion state (uncontrolled or controlled)
    const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded);
    const isControlled = controlledExpanded !== undefined;
    const isExpanded = isControlled ? controlledExpanded : uncontrolledExpanded;

    // Handle toggle
    const handleToggle = () => {
      if (!collapsible) return;

      const newExpanded = !isExpanded;

      if (!isControlled) {
        setUncontrolledExpanded(newExpanded);
      }

      onExpandedChange?.(newExpanded);
    };

    // Handle click
    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
      handleToggle();
      onClick?.(e);
    };

    // Handle keyboard
    const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
      if (collapsible && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        handleToggle();
      }
      onKeyDown?.(e);
    };

    // Decorator color (uses centralized category system)
    const decoratorColor = getCategoryColor(category);

    // Card styles
    const cardStyles: React.CSSProperties = {
      // Position for decorator
      position: 'relative',

      // Colors
      background: 'var(--component-card-background)', // White
      border: '1px solid var(--component-card-border)', // Black

      // Brutalist aesthetic
      borderRadius: 'var(--primitive-radii-none)', // 0px (sharp edges)
      boxShadow: 'none', // Flat design (no shadows)
      transition: 'var(--primitive-transitions-none)', // 0ms (instant)

      // Spacing
      padding: 'var(--semantic-spacing-md)', // 16px
      marginBottom: 'var(--semantic-spacing-xs)', // 8px (tight rhythm)

      // Cursor
      cursor: collapsible ? 'pointer' : 'default',

      // Outline for focus
      outline: 'none',

      // User overrides
      ...style,
    };

    // Decorator styles (4px strip)
    const decoratorStyles: React.CSSProperties = {
      position: 'absolute',
      left: '0px',
      top: '0px',
      bottom: '0px',
      width: '4px',
      backgroundColor: decoratorColor,
    };

    // Title styles (monospace)
    const titleStyles: React.CSSProperties = {
      fontFamily: 'var(--semantic-typography-font-title)', // Monospace
      fontSize: 'var(--semantic-typography-font-size-md)', // 16px
      fontWeight: 600,
      marginBottom: 'var(--semantic-spacing-xs)', // 8px
      marginTop: '0',
    };

    // Content wrapper styles (4px left offset for decorator)
    const contentWrapperStyles: React.CSSProperties = {
      paddingLeft: '4px', // Offset to avoid decorator overlap
    };

    // Content styles (system font)
    const contentStyles: React.CSSProperties = {
      fontFamily: 'var(--semantic-typography-font-primary)', // System font
      fontSize: '15px',
      lineHeight: '1.6', // Readability
    };

    // Expand indicator styles
    const indicatorStyles: React.CSSProperties = {
      fontSize: '12px',
      marginRight: 'var(--semantic-spacing-xs)', // 8px
      userSelect: 'none',
    };

    return (
      <>
        {/* Inject focus styles */}
        <style>{`
          article:focus-visible {
            outline: 2px solid var(--primitive-black) !important;
            outline-offset: 2px;
          }
        `}</style>

        <article
          ref={ref}
          role="article"
          aria-label={title}
          aria-expanded={collapsible ? isExpanded : undefined}
          tabIndex={collapsible ? 0 : undefined}
          onClick={collapsible ? handleClick : onClick}
          onKeyDown={collapsible ? handleKeyDown : onKeyDown}
          style={cardStyles}
          {...props}
        >
          {/* Decorator strip (4px) */}
          <div data-testid="card-decorator" style={decoratorStyles} aria-hidden="true" />

          {/* Content with 4px offset */}
          <div style={contentWrapperStyles}>
            {/* Title */}
            <h3 style={titleStyles}>
              {collapsible && (
                <span data-testid="expand-indicator" style={indicatorStyles}>
                  {isExpanded ? '▾' : '▸'}
                </span>
              )}
              {title}
            </h3>

            {/* Body content (visible when expanded or not collapsible) */}
            {(!collapsible || isExpanded) && (
              <div style={contentStyles}>
                {children}
              </div>
            )}
          </div>
        </article>
      </>
    );
  }
);

Card.displayName = 'Card';

// NATIVE TODO: Add haptic feedback when card is tapped to expand/collapse
// When we wrap in Capacitor, add:
// import { Haptics } from '@capacitor/haptics';
// import { Capacitor } from '@capacitor/core';
//
// const handleToggle = async () => {
//   if (!collapsible) return;
//
//   if (Capacitor.isNativePlatform()) {
//     await Haptics.impact({ style: 'light' });
//   }
//
//   const newExpanded = !isExpanded;
//   // ... rest of toggle logic
// };
