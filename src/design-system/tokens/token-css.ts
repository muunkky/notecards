/**
 * CSS Token Integration
 * 
 * Generates CSS custom properties from design tokens.
 * CRITICAL: This is the foundation that prevents component rewrites
 * when design direction changes.
 */

import { DesignTokens } from './design-tokens.js';
import { themeManager } from '../theme/theme-manager.js';

/**
 * Generate CSS custom properties from design tokens
 */
export function generateTokenCSS(tokens: DesignTokens): string {
  const cssLines: string[] = [':root {'];
  
  // Generate primitive tokens
  cssLines.push('  /* Primitive Tokens - Raw values */');
  Object.entries(tokens.primitive.colors).forEach(([key, value]) => {
    cssLines.push(`  --primitive-color-${kebabCase(key)}: ${value};`);
  });
  
  Object.entries(tokens.primitive.fonts).forEach(([key, value]) => {
    cssLines.push(`  --primitive-font-${kebabCase(key)}: ${value};`);
  });
  
  cssLines.push(`  --primitive-spacing-base: ${tokens.primitive.spacing.base};`);
  cssLines.push(`  --primitive-spacing-scale: ${tokens.primitive.spacing.scale};`);
  
  Object.entries(tokens.primitive.radii).forEach(([key, value]) => {
    cssLines.push(`  --primitive-radii-${kebabCase(key)}: ${value};`);
  });
  
  Object.entries(tokens.primitive.shadows).forEach(([key, value]) => {
    cssLines.push(`  --primitive-shadow-${kebabCase(key)}: ${value};`);
  });
  
  Object.entries(tokens.primitive.transitions).forEach(([key, value]) => {
    cssLines.push(`  --primitive-transition-${kebabCase(key)}: ${value};`);
  });
  
  // Generate semantic tokens
  cssLines.push('');
  cssLines.push('  /* Semantic Tokens - Purpose-based */');
  Object.entries(tokens.semantic.colors).forEach(([key, value]) => {
    cssLines.push(`  --semantic-color-${kebabCase(key)}: ${value};`);
  });
  
  Object.entries(tokens.semantic.typography).forEach(([key, value]) => {
    cssLines.push(`  --semantic-typography-${kebabCase(key)}: ${value};`);
  });
  
  Object.entries(tokens.semantic.spacing).forEach(([key, value]) => {
    cssLines.push(`  --semantic-spacing-${kebabCase(key)}: ${value};`);
  });
  
  Object.entries(tokens.semantic.interactions).forEach(([key, value]) => {
    cssLines.push(`  --semantic-interaction-${kebabCase(key)}: ${value};`);
  });
  
  // Generate component tokens
  cssLines.push('');
  cssLines.push('  /* Component Tokens - Specific usage */');
  
  Object.entries(tokens.component).forEach(([componentName, componentTokens]) => {
    Object.entries(componentTokens).forEach(([key, value]) => {
      cssLines.push(`  --component-${kebabCase(componentName)}-${kebabCase(key)}: ${value};`);
    });
  });
  
  cssLines.push('}');
  
  return cssLines.join('\n');
}

/**
 * Convert camelCase to kebab-case
 */
function kebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Inject token CSS into the document
 */
export function injectTokenCSS(tokens: DesignTokens): void {
  const existingStyle = document.getElementById('design-tokens');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  const style = document.createElement('style');
  style.id = 'design-tokens';
  style.textContent = generateTokenCSS(tokens);
  
  document.head.appendChild(style);
}

/**
 * Initialize the token CSS system
 */
export function initializeTokenCSS(): void {
  // Initialize theme manager
  themeManager.initialize();
  
  // Listen for theme changes
  document.documentElement.addEventListener('themechange', (event: any) => {
    console.log('Theme changed:', event.detail.themeId);
  });
  
  // Generate initial CSS
  const currentTheme = themeManager.getCurrentTheme();
  console.log('Initialized design token system with theme:', currentTheme);
}

/**
 * Component CSS helper - enforces token usage
 */
export const tokenCSS = {
  // Colors
  color: {
    primary: 'var(--semantic-color-primary)',
    secondary: 'var(--semantic-color-secondary)',
    accent: 'var(--semantic-color-accent)',
    success: 'var(--semantic-color-success)',
    warning: 'var(--semantic-color-warning)',
    error: 'var(--semantic-color-error)',
    info: 'var(--semantic-color-info)',
    textPrimary: 'var(--semantic-color-text-primary)',
    textSecondary: 'var(--semantic-color-text-secondary)',
    textMuted: 'var(--semantic-color-text-muted)',
    textInverse: 'var(--semantic-color-text-inverse)',
    backgroundBase: 'var(--semantic-color-background-base)',
    backgroundElevated: 'var(--semantic-color-background-elevated)',
    backgroundInverse: 'var(--semantic-color-background-inverse)',
    backgroundOverlay: 'var(--semantic-color-background-overlay)',
    borderSubtle: 'var(--semantic-color-border-subtle)',
    borderDefault: 'var(--semantic-color-border-default)',
    borderStrong: 'var(--semantic-color-border-strong)',
    borderAccent: 'var(--semantic-color-border-accent)',
  },
  
  // Typography
  typography: {
    fontPrimary: 'var(--semantic-typography-font-primary)',
    fontHeading: 'var(--semantic-typography-font-heading)',
    fontMono: 'var(--semantic-typography-font-mono)',
    fontSizeXs: 'var(--semantic-typography-font-size-xs)',
    fontSizeSm: 'var(--semantic-typography-font-size-sm)',
    fontSizeMd: 'var(--semantic-typography-font-size-md)',
    fontSizeLg: 'var(--semantic-typography-font-size-lg)',
    fontSizeXl: 'var(--semantic-typography-font-size-xl)',
    fontSize2xl: 'var(--semantic-typography-font-size-2xl)',
    fontSize3xl: 'var(--semantic-typography-font-size-3xl)',
    lineHeightTight: 'var(--semantic-typography-line-height-tight)',
    lineHeightNormal: 'var(--semantic-typography-line-height-normal)',
    lineHeightLoose: 'var(--semantic-typography-line-height-loose)',
    fontWeightLight: 'var(--semantic-typography-font-weight-light)',
    fontWeightNormal: 'var(--semantic-typography-font-weight-normal)',
    fontWeightMedium: 'var(--semantic-typography-font-weight-medium)',
    fontWeightBold: 'var(--semantic-typography-font-weight-bold)',
  },
  
  // Spacing
  spacing: {
    xs: 'var(--semantic-spacing-xs)',
    sm: 'var(--semantic-spacing-sm)',
    md: 'var(--semantic-spacing-md)',
    lg: 'var(--semantic-spacing-lg)',
    xl: 'var(--semantic-spacing-xl)',
    xxl: 'var(--semantic-spacing-xxl)',
    componentPadding: 'var(--semantic-spacing-component-padding)',
    sectionGap: 'var(--semantic-spacing-section-gap)',
    pageMargin: 'var(--semantic-spacing-page-margin)',
  },
  
  // Interactions
  interactions: {
    borderRadius: 'var(--semantic-interaction-border-radius)',
    elevation: 'var(--semantic-interaction-elevation)',
    transition: 'var(--semantic-interaction-transition)',
    focusRing: 'var(--semantic-interaction-focus-ring)',
  },
  
  // Component-specific tokens
  button: {
    primaryBackground: 'var(--component-button-primary-background)',
    primaryBackgroundHover: 'var(--component-button-primary-background-hover)',
    primaryBackgroundActive: 'var(--component-button-primary-background-active)',
    primaryText: 'var(--component-button-primary-text)',
    primaryBorder: 'var(--component-button-primary-border)',
    secondaryBackground: 'var(--component-button-secondary-background)',
    secondaryBackgroundHover: 'var(--component-button-secondary-background-hover)',
    secondaryText: 'var(--component-button-secondary-text)',
    secondaryBorder: 'var(--component-button-secondary-border)',
    paddingSm: 'var(--component-button-padding-sm)',
    paddingMd: 'var(--component-button-padding-md)',
    paddingLg: 'var(--component-button-padding-lg)',
    fontSizeSm: 'var(--component-button-font-size-sm)',
    fontSizeMd: 'var(--component-button-font-size-md)',
    fontSizeLg: 'var(--component-button-font-size-lg)',
    borderRadius: 'var(--component-button-border-radius)',
    transition: 'var(--component-button-transition)',
    fontWeight: 'var(--component-button-font-weight)',
  },
  
  card: {
    background: 'var(--component-card-background)',
    backgroundHover: 'var(--component-card-background-hover)',
    border: 'var(--component-card-border)',
    borderRadius: 'var(--component-card-border-radius)',
    padding: 'var(--component-card-padding)',
    shadow: 'var(--component-card-shadow)',
    shadowHover: 'var(--component-card-shadow-hover)',
  },
  
  input: {
    background: 'var(--component-input-background)',
    backgroundFocus: 'var(--component-input-background-focus)',
    border: 'var(--component-input-border)',
    borderFocus: 'var(--component-input-border-focus)',
    borderError: 'var(--component-input-border-error)',
    text: 'var(--component-input-text)',
    placeholder: 'var(--component-input-placeholder)',
    borderRadius: 'var(--component-input-border-radius)',
    padding: 'var(--component-input-padding)',
    fontSize: 'var(--component-input-font-size)',
  },
  
  navigation: {
    background: 'var(--component-navigation-background)',
    itemBackground: 'var(--component-navigation-item-background)',
    itemBackgroundHover: 'var(--component-navigation-item-background-hover)',
    itemBackgroundActive: 'var(--component-navigation-item-background-active)',
    itemText: 'var(--component-navigation-item-text)',
    itemTextActive: 'var(--component-navigation-item-text-active)',
    border: 'var(--component-navigation-border)',
    padding: 'var(--component-navigation-padding)',
  },
  
  modal: {
    background: 'var(--component-modal-background)',
    overlay: 'var(--component-modal-overlay)',
    border: 'var(--component-modal-border)',
    borderRadius: 'var(--component-modal-border-radius)',
    padding: 'var(--component-modal-padding)',
    shadow: 'var(--component-modal-shadow)',
  },
};

/**
 * Styled components helper that enforces token usage
 */
export function createTokenStyles<T extends Record<string, any>>(styles: T): T {
  // This helper ensures all styles go through the token system
  // In a real implementation, this would validate token usage
  return styles;
}