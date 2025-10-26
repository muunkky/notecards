/**
 * Skip Links Component
 *
 * Provides keyboard navigation shortcuts to main content areas.
 * Essential for screen reader and keyboard-only users to bypass
 * repetitive navigation elements.
 *
 * WCAG 2.1 Level A Requirement: Bypass Blocks (2.4.1)
 *
 * DESIGN PHILOSOPHY - MOBILE-FIRST:
 * - Hidden by default (visually hidden)
 * - Visible on keyboard focus (tab key)
 * - Mobile touch users don't see them (no confusion)
 * - Desktop keyboard users benefit from shortcuts
 *
 * Usage:
 * ```tsx
 * <SkipLinks links={[
 *   { href: '#main-content', label: 'Skip to main content' },
 *   { href: '#deck-list', label: 'Skip to deck list' },
 * ]} />
 * ```
 */

import * as React from 'react';

export interface SkipLink {
  /** Target element ID (with #) */
  href: string;
  /** Link label */
  label: string;
}

export interface SkipLinksProps {
  /** Array of skip links */
  links: SkipLink[];
  /** Custom className */
  className?: string;
}

export const SkipLinks = React.forwardRef<HTMLDivElement, SkipLinksProps>(
  ({ links, className }, ref) => {
    const handleSkip = (event: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
      event.preventDefault();

      // Remove # from targetId
      const id = targetId.replace('#', '');
      const target = document.getElementById(id);

      if (target) {
        // Set tabindex to make element focusable if not naturally focusable
        if (!target.hasAttribute('tabindex')) {
          target.setAttribute('tabindex', '-1');
        }

        // Focus target element
        target.focus();

        // Scroll to target
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    // Skip links container styles
    const containerStyles: React.CSSProperties = {
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999,
      background: 'var(--primitive-black)',
      padding: 'var(--semantic-spacing-sm)',
      display: 'flex',
      gap: 'var(--semantic-spacing-sm)',
    };

    // Individual skip link styles (visually hidden until focused)
    const linkStyles: React.CSSProperties = {
      position: 'absolute',
      left: '-10000px',
      top: 'auto',
      width: '1px',
      height: '1px',
      overflow: 'hidden',
      color: 'var(--primitive-white)',
      background: 'var(--primitive-black)',
      padding: 'var(--semantic-spacing-sm) var(--semantic-spacing-md)',
      textDecoration: 'none',
      fontFamily: 'var(--semantic-typography-font-primary)',
      fontSize: 'var(--semantic-typography-font-size-md)',
      fontWeight: 600,
      borderRadius: 'var(--primitive-radii-none)', // 0px (brutalist)
      border: '2px solid var(--primitive-white)',
      transition: 'var(--primitive-transitions-none)', // 0ms (instant)
    };

    // Focused link styles (visible when tabbed to)
    const linkFocusStyles: React.CSSProperties = {
      position: 'static',
      width: 'auto',
      height: 'auto',
      overflow: 'visible',
    };

    return (
      <div
        ref={ref}
        data-testid="skip-links"
        role="navigation"
        aria-label="Skip links"
        style={containerStyles}
        className={className}
      >
        {links.map((link, index) => (
          <a
            key={index}
            href={link.href}
            onClick={(e) => handleSkip(e, link.href)}
            data-testid={`skip-link-${index}`}
            style={linkStyles}
            onFocus={(e) => {
              Object.assign(e.currentTarget.style, linkFocusStyles);
            }}
            onBlur={(e) => {
              Object.assign(e.currentTarget.style, linkStyles);
            }}
          >
            {link.label}
          </a>
        ))}
      </div>
    );
  }
);

SkipLinks.displayName = 'SkipLinks';
