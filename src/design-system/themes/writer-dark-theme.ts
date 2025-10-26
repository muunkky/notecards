/**
 * Writer Dark Theme - Brutalist Digital Minimalism (Inverted)
 *
 * This is the Writer theme inverted for dark mode. Maintains all brutalist
 * principles: pure blacks/whites (inverted), sharp edges, instant feedback,
 * and functional categorical colors.
 *
 * Core Principles (Preserved):
 * - Monochrome inversion (pure black backgrounds, white text)
 * - Functional color only (categorical decorators remain the same)
 * - Terminal interface aesthetic (now dark terminal)
 * - Zero animations (brutalist immediacy)
 * - Sharp edges (0px border radius)
 * - Mobile-only optimization
 *
 * Differences from Generic Dark Theme:
 * - Pure #000 backgrounds (not #111827 grays)
 * - Pure #fff text (not #f9fafb off-whites)
 * - No softening or desaturation
 * - Brutalist purity maintained
 *
 * Reference: docs/WRITER-DESIGN-THESIS.md
 */

import { ThemeDefinition } from '../theme/theme-manager.js';
import { writerTheme } from './writer-theme.js';

export const writerDarkTheme: ThemeDefinition = {
  id: 'writer-dark',
  name: 'Writer Dark',
  description: 'Brutalist digital minimalism for screenwriters - dark mode variant with pure black backgrounds',
  category: 'minimal',
  businessContext: 'Writers, screenwriters, novelists using index card planning methods - dark mode for night work and OLED screens',

  tokens: {
    primitive: {
      colors: {
        // INVERTED Monochrome Scale - Pure blacks and whites swapped
        white: '#000000', // Now black
        black: '#ffffff', // Now white

        // INVERTED 16-shade gray scale (for precise hierarchy in dark mode)
        gray50: '#171717', // Darkest (was lightest)
        gray100: '#262626',
        gray200: '#404040',
        gray300: '#525252',
        gray400: '#737373',
        gray500: '#a3a3a3',
        gray600: '#d4d4d4',
        gray700: '#e5e5e5',
        gray800: '#f5f5f5',
        gray900: '#fafafa', // Lightest (was darkest)

        // Categorical Colors - UNCHANGED (functional, not decorative)
        // These remain the same because they're card decorators with semantic meaning
        // Conflict / Tension
        blue50: '#fef2f2',
        blue500: '#e11d48', // Rose red for conflict
        blue600: '#be123c',
        blue700: '#9f1239',

        // Character Development
        green50: '#eff6ff',
        green500: '#3b82f6', // Blue for character
        green700: '#1d4ed8',

        // Location / Setting
        yellow50: '#fffbeb',
        yellow500: '#f59e0b', // Amber for location
        yellow700: '#b45309',

        // Theme / Motif
        purple50: '#faf5ff',
        purple500: '#8b5cf6', // Purple for theme
        purple700: '#6d28d9',

        // Additional categorical colors
        pink50: '#fdf2f8',
        pink500: '#ec4899', // Hot pink alternative
        pink700: '#be185d',

        orange50: '#fff7ed',
        orange500: '#f97316', // Orange alternative
        orange700: '#c2410c',

        red50: '#fef2f2',
        red500: '#ef4444', // Pure red for errors
        red700: '#b91c1c',
      },

      fonts: {
        // Identical to Writer (system fonts, no change for dark mode)
        system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        mono: '"SF Mono", Monaco, "Cascadia Code", "Fira Code", "Courier New", monospace',
        serif: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        handwriting: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },

      spacing: {
        // Identical to Writer
        base: '0.25rem', // 4px base unit
        scale: 1, // Standard scale
      },

      radii: {
        // Identical to Writer - Brutalist sharp edges
        none: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        full: '0px',
      },

      shadows: {
        // Identical to Writer - No elevation illusions
        none: 'none',
        sm: 'none',
        md: 'none',
        lg: 'none',
        xl: 'none',
      },

      transitions: {
        // Identical to Writer - Zero animations
        none: '0ms',
        fast: '0ms',
        normal: '0ms',
        slow: '0ms',
      },
    },

    semantic: {
      colors: {
        // Primary is white on black (inverted)
        primary: 'var(--primitive-black)', // Now white
        secondary: 'var(--primitive-gray-400)',
        accent: 'var(--primitive-gray-100)', // Now light gray

        // State colors (unchanged, still functional)
        success: 'var(--primitive-green-500)',
        warning: 'var(--primitive-yellow-500)',
        error: 'var(--primitive-red-500)',
        info: 'var(--primitive-gray-300)', // Adjusted for dark

        // Text hierarchy INVERTED (now light text on dark bg)
        textPrimary: 'var(--primitive-black)', // Now white
        textSecondary: 'var(--primitive-gray-400)',
        textMuted: 'var(--primitive-gray-500)',
        textInverse: 'var(--primitive-white)', // Now black

        // Surface backgrounds INVERTED (now dark)
        backgroundBase: 'var(--primitive-white)', // Now black
        backgroundElevated: 'var(--primitive-gray-50)', // Now dark gray
        backgroundInverse: 'var(--primitive-black)', // Now white
        backgroundOverlay: 'rgba(255, 255, 255, 0.75)', // White scrim for dark mode

        // Borders INVERTED
        borderSubtle: 'var(--primitive-gray-800)',
        borderDefault: 'var(--primitive-gray-700)',
        borderStrong: 'var(--primitive-black)', // Now white
        borderAccent: 'var(--primitive-gray-100)',
      },

      typography: {
        // Identical to Writer
        fontPrimary: 'var(--primitive-font-system)',
        fontHeading: 'var(--primitive-font-mono)', // Monospace headings
        fontMono: 'var(--primitive-font-mono)',

        // Type scale - Identical to Writer
        fontSizeXs: 'calc(var(--primitive-spacing-base) * 3)',
        fontSizeSm: 'calc(var(--primitive-spacing-base) * 3.5)',
        fontSizeMd: 'calc(var(--primitive-spacing-base) * 4)',
        fontSizeLg: 'calc(var(--primitive-spacing-base) * 4.5)',
        fontSizeXl: 'calc(var(--primitive-spacing-base) * 5)',
        fontSize2xl: 'calc(var(--primitive-spacing-base) * 6)',
        fontSize3xl: 'calc(var(--primitive-spacing-base) * 8)',

        // Line heights - Identical to Writer
        lineHeightTight: 1.3,
        lineHeightNormal: 1.6,
        lineHeightLoose: 1.8,

        // Font weights - Identical to Writer
        fontWeightLight: 400,
        fontWeightNormal: 400,
        fontWeightMedium: 600,
        fontWeightBold: 700,
      },

      spacing: {
        // Identical to Writer - Binary spacing system
        xs: 'calc(var(--primitive-spacing-base) * 1)',
        sm: 'calc(var(--primitive-spacing-base) * 2)',
        md: 'calc(var(--primitive-spacing-base) * 4)',
        lg: 'calc(var(--primitive-spacing-base) * 6)',
        xl: 'calc(var(--primitive-spacing-base) * 8)',
        xxl: 'calc(var(--primitive-spacing-base) * 12)',

        componentPadding: 'calc(var(--primitive-spacing-base) * 4)',
        sectionGap: 'calc(var(--primitive-spacing-base) * 6)',
        pageMargin: 'calc(var(--primitive-spacing-base) * 4)',
      },

      interactions: {
        // Identical to Writer - Brutalist interactions
        borderRadius: 'var(--primitive-radii-none)',
        elevation: 'var(--primitive-shadows-none)',
        transition: 'var(--primitive-transitions-none)',
        focusRing: '2px solid var(--primitive-black)', // White ring on dark bg
      },
    },

    component: {
      button: {
        // Inverted - White buttons on dark background
        primaryBackground: 'var(--primitive-black)', // Now white
        primaryBackgroundHover: 'var(--primitive-gray-100)',
        primaryBackgroundActive: 'var(--primitive-gray-200)',
        primaryText: 'var(--primitive-white)', // Now black
        primaryBorder: 'var(--primitive-black)', // Now white

        secondaryBackground: 'transparent',
        secondaryBackgroundHover: 'var(--primitive-gray-50)', // Dark gray
        secondaryText: 'var(--primitive-black)', // Now white
        secondaryBorder: 'var(--primitive-black)', // Now white

        // Touch sizing - Identical to Writer
        paddingSm: 'calc(var(--primitive-spacing-base) * 2) calc(var(--primitive-spacing-base) * 3)',
        paddingMd: 'calc(var(--primitive-spacing-base) * 3) calc(var(--primitive-spacing-base) * 4)',
        paddingLg: 'calc(var(--primitive-spacing-base) * 4) calc(var(--primitive-spacing-base) * 6)',

        fontSizeSm: 'var(--semantic-typography-font-size-sm)',
        fontSizeMd: 'var(--semantic-typography-font-size-md)',
        fontSizeLg: 'var(--semantic-typography-font-size-lg)',

        borderRadius: 'var(--primitive-radii-none)',
        transition: 'var(--primitive-transitions-none)',
        fontWeight: 600,
      },

      card: {
        // Inverted - Dark cards with light text
        background: 'var(--primitive-white)', // Now black
        backgroundHover: 'var(--primitive-white)', // Still black (no hover change)
        border: '1px solid var(--primitive-gray-700)',
        borderRadius: 'var(--primitive-radii-none)',
        padding: 'calc(var(--primitive-spacing-base) * 4)',
        shadow: 'var(--primitive-shadows-none)',
        shadowHover: 'var(--primitive-shadows-none)',
      },

      input: {
        // Inverted - Dark inputs with light text
        background: 'var(--primitive-white)', // Now black
        backgroundFocus: 'var(--primitive-white)', // Still black
        border: '1px solid var(--primitive-black)', // Now white
        borderFocus: '2px solid var(--primitive-black)', // Thicker white on focus
        borderError: '2px solid var(--primitive-red-500)',
        text: 'var(--primitive-black)', // Now white
        placeholder: 'var(--primitive-gray-500)',
        borderRadius: 'var(--primitive-radii-none)',
        padding: 'calc(var(--primitive-spacing-base) * 3) calc(var(--primitive-spacing-base) * 4)',
        fontSize: 'var(--semantic-typography-font-size-md)',
      },

      navigation: {
        // Inverted navigation
        background: 'var(--primitive-white)', // Now black
        itemBackground: 'transparent',
        itemBackgroundHover: 'var(--primitive-gray-50)', // Dark gray
        itemBackgroundActive: 'var(--primitive-black)', // Now white
        itemText: 'var(--primitive-black)', // Now white
        itemTextActive: 'var(--primitive-white)', // Now black
        border: '1px solid var(--primitive-gray-700)',
        padding: 'calc(var(--primitive-spacing-base) * 3) calc(var(--primitive-spacing-base) * 4)',
      },

      modal: {
        // Inverted modals
        background: 'var(--primitive-white)', // Now black
        overlay: 'var(--semantic-colors-background-overlay)', // White scrim
        border: '1px solid var(--primitive-black)', // Now white
        borderRadius: 'var(--primitive-radii-none)',
        padding: 'calc(var(--primitive-spacing-base) * 6)',
        shadow: 'var(--primitive-shadows-none)',
      },
    },
  },
};
