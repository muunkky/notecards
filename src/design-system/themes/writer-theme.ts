/**
 * Writer Theme - Brutalist Digital Minimalism
 *
 * Inspired by Claude Code's terminal interface aesthetic, this theme
 * translates the physical feel of index card story planning into a
 * modern digital experience without skeuomorphism.
 *
 * Core Principles:
 * - Monochrome base (pure blacks, grays, white)
 * - Functional color only (categorical decorators)
 * - Terminal interface aesthetic
 * - Zero animations (brutalist immediacy)
 * - Sharp edges (0px border radius)
 * - Mobile-only optimization
 *
 * Physical Translation:
 * - Colored index cards → 4px left decorator strips
 * - Card stacks → Scrollable list with tight spacing
 * - Tactile manipulation → Touch gestures
 *
 * Reference: docs/WRITER-DESIGN-THESIS.md
 */

import { ThemeDefinition } from '../theme/theme-manager.js';
import { defaultTokens } from '../tokens/design-tokens.js';

export const writerTheme: ThemeDefinition = {
  id: 'writer',
  name: 'Writer',
  description: 'Brutalist digital minimalism for screenwriters and novelists using index card planning methods',
  category: 'minimal',
  businessContext: 'Writers, screenwriters, novelists using David Lynch 70-card method, Blake Snyder beat sheets',

  tokens: {
    primitive: {
      colors: {
        // Monochrome Scale - Pure blacks and whites (brutalist)
        white: '#ffffff',
        black: '#000000',

        // 16-shade gray scale for precise hierarchy
        gray50: '#fafafa',
        gray100: '#f5f5f5',
        gray200: '#e5e5e5',
        gray300: '#d4d4d4',
        gray400: '#a3a3a3',
        gray500: '#737373',
        gray600: '#525252',
        gray700: '#404040',
        gray800: '#262626',
        gray900: '#171717',

        // Categorical Colors - Functional use only (card decorators)
        // Conflict / Tension
        blue50: '#fef2f2',
        blue500: '#e11d48',      // Rose red for conflict
        blue600: '#be123c',
        blue700: '#9f1239',

        // Character Development
        green50: '#eff6ff',
        green500: '#3b82f6',     // Blue for character
        green700: '#1d4ed8',

        // Location / Setting
        yellow50: '#fffbeb',
        yellow500: '#f59e0b',    // Amber for location
        yellow700: '#b45309',

        // Theme / Motif
        purple50: '#faf5ff',
        purple500: '#8b5cf6',    // Purple for theme
        purple700: '#6d28d9',

        // Additional categorical colors
        pink50: '#fdf2f8',
        pink500: '#ec4899',      // Hot pink alternative
        pink700: '#be185d',

        orange50: '#fff7ed',
        orange500: '#f97316',    // Orange alternative
        orange700: '#c2410c',

        red50: '#fef2f2',
        red500: '#ef4444',       // Pure red for errors
        red700: '#b91c1c',
      },

      fonts: {
        // System font stack - Never web fonts (performance + reliability)
        system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',

        // Monospace for card titles (terminal aesthetic)
        mono: '"SF Mono", Monaco, "Cascadia Code", "Fira Code", "Courier New", monospace',

        // No display or handwriting fonts (minimal only)
        serif: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        handwriting: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },

      spacing: {
        base: '0.25rem', // 4px base unit
        scale: 1, // Standard scale (no compression or expansion)
      },

      radii: {
        // Brutalist sharp edges (zero border radius everywhere)
        none: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        full: '0px', // Even "full" is sharp
      },

      shadows: {
        // No elevation illusions (flat brutalism)
        none: 'none',
        sm: 'none',
        md: 'none',
        lg: 'none',
        xl: 'none',
      },

      transitions: {
        // Zero animations (instant feedback)
        none: '0ms',
        fast: '0ms',
        normal: '0ms',
        slow: '0ms',
      },
    },

    semantic: {
      colors: {
        // Primary is black (not blue)
        primary: 'var(--primitive-black)',
        secondary: 'var(--primitive-gray-600)',
        accent: 'var(--primitive-gray-900)',

        // State colors
        success: 'var(--primitive-green-500)',
        warning: 'var(--primitive-yellow-500)',
        error: 'var(--primitive-red-500)',
        info: 'var(--primitive-gray-700)',

        // Text hierarchy (high contrast)
        textPrimary: 'var(--primitive-black)',
        textSecondary: 'var(--primitive-gray-600)',
        textMuted: 'var(--primitive-gray-400)',
        textInverse: 'var(--primitive-white)',

        // Surface backgrounds (white/light gray only)
        backgroundBase: 'var(--primitive-white)',
        backgroundElevated: 'var(--primitive-gray-50)',
        backgroundInverse: 'var(--primitive-black)',
        backgroundOverlay: 'rgba(0, 0, 0, 0.75)', // Context-preserving scrim

        // Borders (strong lines, not subtle)
        borderSubtle: 'var(--primitive-gray-200)',
        borderDefault: 'var(--primitive-gray-300)',
        borderStrong: 'var(--primitive-black)',
        borderAccent: 'var(--primitive-gray-900)',
      },

      typography: {
        // Mobile-optimized readability
        fontPrimary: 'var(--primitive-font-system)',
        fontHeading: 'var(--primitive-font-mono)', // Monospace headings (terminal)
        fontMono: 'var(--primitive-font-mono)',

        // Type scale - Optimized for mobile (15-16px body)
        fontSizeXs: 'calc(var(--primitive-spacing-base) * 3)',     // 12px
        fontSizeSm: 'calc(var(--primitive-spacing-base) * 3.5)',   // 14px
        fontSizeMd: 'calc(var(--primitive-spacing-base) * 4)',     // 16px (body)
        fontSizeLg: 'calc(var(--primitive-spacing-base) * 4.5)',   // 18px
        fontSizeXl: 'calc(var(--primitive-spacing-base) * 5)',     // 20px
        fontSize2xl: 'calc(var(--primitive-spacing-base) * 6)',    // 24px
        fontSize3xl: 'calc(var(--primitive-spacing-base) * 8)',    // 32px

        // Line heights for readability
        lineHeightTight: 1.3,
        lineHeightNormal: 1.6, // Generous for body text
        lineHeightLoose: 1.8,

        // Font weights (limited palette)
        fontWeightLight: 400,   // No light weight (minimal)
        fontWeightNormal: 400,
        fontWeightMedium: 600,  // Skip 500, jump to 600 (binary choice)
        fontWeightBold: 700,
      },

      spacing: {
        // Binary spacing system: tight or generous (no medium)
        xs: 'calc(var(--primitive-spacing-base) * 1)',   // 4px
        sm: 'calc(var(--primitive-spacing-base) * 2)',   // 8px (tight rhythm)
        md: 'calc(var(--primitive-spacing-base) * 4)',   // 16px (standard)
        lg: 'calc(var(--primitive-spacing-base) * 6)',   // 24px (generous)
        xl: 'calc(var(--primitive-spacing-base) * 8)',   // 32px
        xxl: 'calc(var(--primitive-spacing-base) * 12)', // 48px

        // Component spacing
        componentPadding: 'calc(var(--primitive-spacing-base) * 4)', // 16px
        sectionGap: 'calc(var(--primitive-spacing-base) * 6)',       // 24px
        pageMargin: 'calc(var(--primitive-spacing-base) * 4)',       // 16px
      },

      interactions: {
        borderRadius: 'var(--primitive-radii-none)', // Sharp
        elevation: 'var(--primitive-shadows-none)',  // Flat
        transition: 'var(--primitive-transitions-none)', // Instant
        focusRing: '2px solid var(--primitive-black)', // Strong black outline
      },
    },

    component: {
      button: {
        // Text-only buttons (minimal chrome)
        primaryBackground: 'var(--primitive-black)',
        primaryBackgroundHover: 'var(--primitive-gray-900)',
        primaryBackgroundActive: 'var(--primitive-gray-800)',
        primaryText: 'var(--primitive-white)',
        primaryBorder: 'var(--primitive-black)',

        secondaryBackground: 'transparent',
        secondaryBackgroundHover: 'var(--primitive-gray-50)',
        secondaryText: 'var(--primitive-black)',
        secondaryBorder: 'var(--primitive-black)',

        // Touch-optimized sizing (44px minimum per Apple HIG)
        paddingSm: 'calc(var(--primitive-spacing-base) * 2) calc(var(--primitive-spacing-base) * 3)', // 8px 12px
        paddingMd: 'calc(var(--primitive-spacing-base) * 3) calc(var(--primitive-spacing-base) * 4)', // 12px 16px (44px height)
        paddingLg: 'calc(var(--primitive-spacing-base) * 4) calc(var(--primitive-spacing-base) * 6)', // 16px 24px

        fontSizeSm: 'var(--semantic-typography-font-size-sm)',
        fontSizeMd: 'var(--semantic-typography-font-size-md)',
        fontSizeLg: 'var(--semantic-typography-font-size-lg)',

        borderRadius: 'var(--primitive-radii-none)', // Sharp
        transition: 'var(--primitive-transitions-none)', // Instant
        fontWeight: 600, // Strong (binary choice)
      },

      card: {
        // White/black cards with colored decorators
        background: 'var(--primitive-white)',
        backgroundHover: 'var(--primitive-white)', // No hover color change (use border)
        border: '1px solid var(--primitive-gray-300)',
        borderRadius: 'var(--primitive-radii-none)', // Sharp
        padding: 'calc(var(--primitive-spacing-base) * 4)', // 16px
        shadow: 'var(--primitive-shadows-none)', // Flat
        shadowHover: 'var(--primitive-shadows-none)', // Flat
      },

      input: {
        // Clean, high-contrast inputs
        background: 'var(--primitive-white)',
        backgroundFocus: 'var(--primitive-white)',
        border: '1px solid var(--primitive-black)',
        borderFocus: '2px solid var(--primitive-black)', // Thicker on focus
        borderError: '2px solid var(--primitive-red-500)',
        text: 'var(--primitive-black)',
        placeholder: 'var(--primitive-gray-400)',
        borderRadius: 'var(--primitive-radii-none)', // Sharp
        padding: 'calc(var(--primitive-spacing-base) * 3) calc(var(--primitive-spacing-base) * 4)', // 12px 16px (44px height)
        fontSize: 'var(--semantic-typography-font-size-md)', // 16px (prevents zoom on iOS)
      },

      navigation: {
        background: 'var(--primitive-white)',
        itemBackground: 'transparent',
        itemBackgroundHover: 'var(--primitive-gray-50)',
        itemBackgroundActive: 'var(--primitive-black)',
        itemText: 'var(--primitive-black)',
        itemTextActive: 'var(--primitive-white)',
        border: '1px solid var(--primitive-gray-300)',
        padding: 'calc(var(--primitive-spacing-base) * 3) calc(var(--primitive-spacing-base) * 4)', // 12px 16px (44px height)
      },

      modal: {
        // Overlay menus with translucent scrim (context preservation)
        background: 'var(--primitive-white)',
        overlay: 'var(--semantic-colors-background-overlay)', // 75% black
        border: '1px solid var(--primitive-black)',
        borderRadius: 'var(--primitive-radii-none)', // Sharp
        padding: 'calc(var(--primitive-spacing-base) * 6)', // 24px
        shadow: 'var(--primitive-shadows-none)', // Flat
      },
    },
  },
};
