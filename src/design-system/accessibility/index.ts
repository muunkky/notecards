/**
 * Accessibility Utilities Index
 *
 * Comprehensive accessibility toolkit for WCAG 2.1 Level AA compliance.
 *
 * Exports:
 * - Screen reader announcements (ARIA live regions)
 * - Focus trap for modals and overlays
 * - Skip links for keyboard navigation
 * - High contrast mode detection
 *
 * Usage:
 * ```typescript
 * import { announcer, createFocusTrap, SkipLinks, highContrast } from './design-system/accessibility';
 * ```
 */

// Screen reader announcer
export { announcer } from './announcer.js';
export type { AriaLive, AnnouncerOptions } from './announcer.js';

// Focus trap
export { createFocusTrap, getFocusableElements, useFocusTrap } from './focus-trap.js';
export type { FocusTrap, FocusTrapOptions } from './focus-trap.js';

// Skip links
export { SkipLinks } from './skip-links.js';
export type { SkipLink, SkipLinksProps } from './skip-links.js';

// High contrast detection
export { highContrast, useHighContrast } from './high-contrast.js';
export type { ContrastPreference, HighContrastOptions } from './high-contrast.js';
