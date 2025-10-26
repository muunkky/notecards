/**
 * CardItem Component - Writer Theme Brutalist Design
 *
 * List-optimized card component with:
 * - 4px colored decorator strip on left (category-based)
 * - Collapsible functionality (default collapsed for list views)
 * - White background with black border
 * - Sharp edges (0px border radius)
 * - No shadows (flat design)
 * - Zero animations (instant state changes)
 * - Monospace font for title (terminal aesthetic)
 * - System font for body content
 * - Compact spacing for dense lists
 *
 * DIFFERENCE FROM Card COMPONENT:
 * CardItem is specifically designed for CardListScreen where many cards
 * are displayed vertically. It has:
 * - Tighter spacing (12px vs 16px padding)
 * - Default collapsed state (vs Card which can be always-visible)
 * - Optimized for rapid scanning in lists
 *
 * INSTANT STATE CHANGE PATTERN (0ms):
 * This component follows the Writer theme philosophy of zero animations.
 * When expanded or collapsed, the state change is INSTANT - no fade-in,
 * slide-down, or any other animation. Content appears/disappears
 * immediately (0ms transition).
 *
 * This instant feedback:
 * - Feels snappier and more responsive
 * - Reduces cognitive load (no waiting for animations)
 * - Aligns with brutalist "no decoration" philosophy
 * - Improves performance (no animation calculations)
 * - Better for users with motion sensitivity
 *
 * Implementation:
 * - transition: 'var(--primitive-transitions-none)' // 0ms
 * - Content visibility: isExpanded && <div>...</div>
 * - React immediately updates DOM (no CSS transitions)
 *
 * TDD: This component is built to pass writer-theme-carditem.test.tsx
 */

import * as React from 'react';
import { useState } from 'react';
import { CategoryValue, getCategoryColor } from '../../domain/categories';

export interface CardItemProps extends React.HTMLAttributes<HTMLElement> {
  /** Unique card identifier */
  id: string;

  /** Card title text */
  title: string;

  /** Card content (markdown or plain text) */
  content: string;

  /** Category type - determines decorator strip color */
  category?: CategoryValue;

  /** Default expanded state (default: false for list view) */
  defaultExpanded?: boolean;

  /** Controlled expansion state */
  expanded?: boolean;

  /** Callback when expansion state changes */
  onExpandedChange?: (expanded: boolean) => void;
}

export const CardItem = React.forwardRef<HTMLElement, CardItemProps>(
  (
    {
      id,
      title,
      content,
      category,
      defaultExpanded = false,
      expanded: controlledExpanded,
      onExpandedChange,
      style,
      onClick,
      onKeyDown,
      className,
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
      if (e.key === 'Enter' || e.key === ' ') {
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

      // Compact spacing for list view
      padding: 'var(--semantic-spacing-sm)', // 12px (tighter than Card's 16px)
      marginBottom: 'var(--semantic-spacing-xs)', // 8px (tight rhythm)

      // Cursor
      cursor: 'pointer',

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
      marginBottom: '0', // No bottom margin when collapsed
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
      marginTop: 'var(--semantic-spacing-xs)', // 8px space above content
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
          aria-expanded={isExpanded}
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          style={cardStyles}
          className={className}
          {...props}
        >
          {/* Decorator strip (4px) */}
          <div
            data-testid="carditem-decorator"
            style={decoratorStyles}
            aria-hidden="true"
          />

          {/* Content with 4px offset */}
          <div style={contentWrapperStyles}>
            {/* Title */}
            <h3 style={titleStyles}>
              <span data-testid="carditem-expand-indicator" style={indicatorStyles}>
                {isExpanded ? '▾' : '▸'}
              </span>
              {title}
            </h3>

            {/* Body content (visible when expanded) */}
            {isExpanded && <div style={contentStyles}>{content}</div>}
          </div>
        </article>
      </>
    );
  }
);

CardItem.displayName = 'CardItem';

// NATIVE TODO: Add haptic feedback when card is tapped to expand/collapse
// When we wrap in Capacitor, add:
// import { Haptics } from '@capacitor/haptics';
// import { Capacitor } from '@capacitor/core';
//
// const handleToggle = async () => {
//   if (Capacitor.isNativePlatform()) {
//     await Haptics.impact({ style: 'light' });
//   }
//
//   const newExpanded = !isExpanded;
//   // ... rest of toggle logic
// };

// NATIVE TODO: Add long-press gesture for context menu (edit, delete, share)
// import { useLongPress } from '../../hooks/useLongPress';
//
// const longPressHandlers = useLongPress({
//   onLongPress: () => {
//     // Show context menu with card actions
//     onShowContextMenu?.(id);
//   },
//   threshold: 500,
// });
//
// And spread handlers on article element:
// <article {...longPressHandlers} ... >

// NATIVE TODO: Add swipe-to-delete gesture
// import { useSwipe } from '../../hooks/useSwipe';
//
// const swipeHandlers = useSwipe({
//   onSwipeLeft: () => {
//     // Show delete confirmation
//     onSwipeToDelete?.(id);
//   },
//   minDistance: 50,
// });
//
// And spread handlers on article element:
// <article {...swipeHandlers} ... >
