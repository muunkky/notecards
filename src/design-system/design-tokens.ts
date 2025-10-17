/**
 * Component Token Export
 * 
 * Provides a simplified, flat token structure for component consumption.
 * Maps the three-tier token system to a more accessible format.
 */

import { defaultTokens } from './tokens/design-tokens';

// Flatten token structure for easier component consumption
export const tokenCSS = {
  // Color tokens - simplified structure
  color: {
    white: 'var(--primitive-gray-white)',
    gray50: 'var(--primitive-gray-50)',
    gray100: 'var(--primitive-gray-100)',
    gray200: 'var(--primitive-gray-200)',
    gray300: 'var(--primitive-gray-300)',
    gray400: 'var(--primitive-gray-400)',
    gray500: 'var(--primitive-gray-500)',
    gray600: 'var(--primitive-gray-600)',
    gray700: 'var(--primitive-gray-700)',
    gray800: 'var(--primitive-gray-800)',
    gray900: 'var(--primitive-gray-900)',
    black: 'var(--primitive-gray-black)',
  },
  
  // Semantic color tokens
  semantic: {
    color: {
      primary: 'var(--semantic-colors-primary)',
      secondary: 'var(--semantic-colors-secondary)',
      error: 'var(--semantic-colors-error)',
      success: 'var(--semantic-colors-success)',
      warning: 'var(--semantic-colors-warning)',
      info: 'var(--semantic-colors-info)',
      
      textPrimary: 'var(--semantic-colors-text-primary)',
      textSecondary: 'var(--semantic-colors-text-secondary)',
      textMuted: 'var(--semantic-colors-text-muted)',
      textInverse: 'var(--semantic-colors-text-inverse)',
      textDisabled: 'var(--semantic-colors-text-disabled)',
      
      backgroundPrimary: 'var(--semantic-colors-background-base)',
      backgroundSecondary: 'var(--semantic-colors-background-elevated)',
      backgroundDisabled: 'var(--semantic-colors-background-disabled)',
      
      border: 'var(--semantic-colors-border-default)',
      borderSubtle: 'var(--semantic-colors-border-subtle)',
      borderAccent: 'var(--semantic-colors-border-accent)',
    },
    
    spacing: {
      xs: 'var(--semantic-spacing-xs)',
      sm: 'var(--semantic-spacing-sm)',
      md: 'var(--semantic-spacing-md)',
      lg: 'var(--semantic-spacing-lg)',
      xl: 'var(--semantic-spacing-xl)',
    },
    
    borderRadius: {
      sm: 'var(--semantic-interactions-border-radius)',
      md: 'var(--semantic-interactions-border-radius)',
      lg: 'var(--primitive-radii-lg)',
    },
  },
  
  // Typography tokens
  typography: {
    body: {
      fontFamily: 'var(--semantic-typography-font-family)',
      fontSize: 'var(--semantic-typography-font-size-md)',
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      small: {
        fontSize: 'var(--semantic-typography-font-size-sm)',
      },
      large: {
        fontSize: 'var(--semantic-typography-font-size-lg)',
      },
    },
    heading: {
      fontFamily: 'var(--semantic-typography-font-family)',
      fontWeight: 600,
      h1: {
        fontSize: 'var(--semantic-typography-font-size-xl)',
      },
      h2: {
        fontSize: 'var(--semantic-typography-font-size-lg)',
      },
      h3: {
        fontSize: 'var(--semantic-typography-font-size-md)',
      },
    },
  },
  
  // Component-specific tokens
  component: {
    button: {
      primary: {
        background: 'var(--component-button-primary-background)',
        text: 'var(--component-button-primary-text)',
        border: 'var(--component-button-primary-border)',
      },
      secondary: {
        background: 'var(--component-button-secondary-background)',
        text: 'var(--component-button-secondary-text)',
        border: 'var(--component-button-secondary-border)',
      },
      borderRadius: 'var(--semantic-interactions-border-radius)',
      borderWidth: '1px',
      fontSize: 'var(--semantic-typography-font-size-md)',
      paddingX: 'var(--semantic-spacing-md)',
      paddingY: 'var(--semantic-spacing-sm)',
    },
    
    input: {
      background: 'var(--component-input-background)',
      backgroundFocus: 'var(--component-input-background-focus)',
      text: 'var(--component-input-text)',
      placeholder: 'var(--component-input-placeholder)',
      borderColor: 'var(--component-input-border)',
      borderFocus: 'var(--component-input-border-focus)',
      borderError: 'var(--component-input-border-error)',
      borderRadius: 'var(--semantic-interactions-border-radius)',
      borderWidth: '1px',
      fontSize: 'var(--semantic-typography-font-size-md)',
      padding: 'var(--semantic-spacing-sm) var(--semantic-spacing-md)',
    },
    
    card: {
      background: 'var(--component-card-background)',
      backgroundHover: 'var(--component-card-background-hover)',
      borderColor: 'var(--component-card-border)',
      borderRadius: 'var(--semantic-interactions-border-radius)',
      borderWidth: '1px',
      shadow: 'var(--semantic-interactions-elevation)',
      shadowElevated: 'var(--component-card-shadow-hover)',
      contentPadding: 'var(--semantic-spacing-component-padding)',
      headerBackground: 'var(--semantic-colors-background-elevated)',
      headerText: 'var(--semantic-colors-text-primary)',
      headerPadding: 'var(--semantic-spacing-md)',
      contentText: 'var(--semantic-colors-text-primary)',
    },
  },
};

// Re-export token types and values
export { defaultTokens } from './tokens/design-tokens';
export type { DesignTokens, PrimitiveTokens, SemanticTokens, ComponentTokens } from './tokens/design-tokens';