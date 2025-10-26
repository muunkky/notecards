/**
 * Theme Management System
 * 
 * Enables extreme design flexibility - from conservative corporate
 * to bold creative themes without component rewrites.
 * 
 * BUSINESS REQUIREMENT: Support management changes and user feedback
 * that demand complete design direction pivots.
 */

import { DesignTokens, defaultTokens } from '../tokens/design-tokens.js';
import { writerTheme } from '../themes/writer-theme.js';
import { writerDarkTheme } from '../themes/writer-dark-theme.js';

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  category: 'conservative' | 'creative' | 'minimal' | 'bold' | 'accessible' | 'dense';
  tokens: DeepPartial<DesignTokens>;
  previewImage?: string;
  businessContext?: string;
}

// Helper type for deep partial
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export class ThemeManager {
  private currentTheme: string = 'default';
  private themes: Map<string, ThemeDefinition> = new Map();
  private root: HTMLElement;

  constructor() {
    this.root = document.documentElement;
    this.loadDefaultThemes();
  }

  /**
   * Switch theme with performance optimization
   * REQUIREMENT: <100ms switching time
   */
  switchTheme(themeId: string): Promise<void> {
    return new Promise((resolve) => {
      if (this.currentTheme === themeId) {
        resolve();
        return;
      }

      const theme = this.themes.get(themeId);
      if (!theme) {
        console.error(`Theme '${themeId}' not found`);
        resolve();
        return;
      }

      // Performance optimization: batch DOM updates
      requestAnimationFrame(() => {
        this.applyThemeTokens(theme);
        this.currentTheme = themeId;
        
        // Persist user preference
        localStorage.setItem('selectedTheme', themeId);
        
        // Dispatch theme change event for components
        this.root.dispatchEvent(new CustomEvent('themechange', {
          detail: { themeId, theme }
        }));
        
        resolve();
      });
    });
  }

  /**
   * Apply theme tokens to CSS custom properties
   */
  private applyThemeTokens(theme: ThemeDefinition): void {
    const mergedTokens = this.mergeWithDefaults(theme.tokens);
    
    // Apply primitive tokens
    this.applyCSSProperties('primitive', mergedTokens.primitive);
    
    // Apply semantic tokens
    this.applyCSSProperties('semantic', mergedTokens.semantic);
    
    // Apply component tokens
    this.applyCSSProperties('component', mergedTokens.component);
  }

  /**
   * Apply tokens to CSS custom properties with proper naming
   */
  private applyCSSProperties(tier: string, tokens: any, prefix: string = ''): void {
    Object.entries(tokens).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        // Recursive for nested objects
        this.applyCSSProperties(tier, value, prefix ? `${prefix}-${key}` : key);
      } else {
        // Apply CSS custom property
        const propertyName = `--${tier}${prefix ? `-${prefix}` : ''}-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        this.root.style.setProperty(propertyName, String(value));
      }
    });
  }

  /**
   * Merge theme tokens with defaults to ensure completeness
   */
  private mergeWithDefaults(themeTokens: DeepPartial<DesignTokens>): DesignTokens {
    return {
      primitive: this.deepMerge(defaultTokens.primitive, themeTokens.primitive || {}),
      semantic: this.deepMerge(defaultTokens.semantic, themeTokens.semantic || {}),
      component: this.deepMerge(defaultTokens.component, themeTokens.component || {}),
    };
  }

  /**
   * Deep merge utility for nested objects
   */
  private deepMerge<T>(target: T, source: DeepPartial<T>): T {
    const result = { ...target };
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key];
        const targetValue = result[key];
        
        if (sourceValue && typeof sourceValue === 'object' && 
            targetValue && typeof targetValue === 'object' &&
            !Array.isArray(sourceValue)) {
          (result as any)[key] = this.deepMerge(targetValue, sourceValue);
        } else if (sourceValue !== undefined) {
          (result as any)[key] = sourceValue;
        }
      }
    }
    
    return result;
  }

  /**
   * Register a new theme
   */
  registerTheme(theme: ThemeDefinition): void {
    this.themes.set(theme.id, theme);
  }

  /**
   * Get available themes
   */
  getAvailableThemes(): ThemeDefinition[] {
    return Array.from(this.themes.values());
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): string {
    return this.currentTheme;
  }

  /**
   * Initialize theme from localStorage or default
   */
  initialize(): void {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme && this.themes.has(savedTheme)) {
      this.switchTheme(savedTheme);
    } else {
      this.switchTheme('default');
    }
  }

  /**
   * Load predefined extreme theme variations
   */
  private loadDefaultThemes(): void {
    // Default theme
    this.registerTheme({
      id: 'default',
      name: 'Default',
      description: 'Balanced design with modern aesthetics',
      category: 'minimal',
      tokens: defaultTokens,
    });

    // Writer theme - Brutalist digital minimalism for screenwriters
    this.registerTheme(writerTheme);

    // Writer Dark theme - Brutalist digital minimalism (dark mode variant)
    this.registerTheme(writerDarkTheme);

    // Conservative Corporate Theme
    this.registerTheme({
      id: 'corporate',
      name: 'Corporate Professional',
      description: 'Conservative design for enterprise environments',
      category: 'conservative',
      businessContext: 'Enterprise clients, B2B platforms, financial services',
      tokens: {
        primitive: {
          colors: {
            ...defaultTokens.primitive.colors,
            blue500: '#1e40af', // Professional blue
            blue600: '#1e3a8a',
            blue700: '#1e3a8a',
          },
          fonts: {
            ...defaultTokens.primitive.fonts,
            system: 'Georgia, "Times New Roman", Times, serif',
            display: 'Georgia, "Times New Roman", Times, serif',
          },
          spacing: {
            base: '0.25rem',
            scale: 0.75, // Tighter spacing
          },
          radii: {
            ...defaultTokens.primitive.radii,
            sm: '0px',
            md: '0px',
            lg: '2px',
            xl: '2px',
          },
          transitions: {
            ...defaultTokens.primitive.transitions,
            fast: '0ms',
            normal: '0ms',
            slow: '0ms',
          },
        },
      },
    });

    // Bold Creative Theme
    this.registerTheme({
      id: 'creative',
      name: 'Bold Creative',
      description: 'Vibrant design for creative professionals',
      category: 'creative',
      businessContext: 'Creative agencies, startups, design-focused products',
      tokens: {
        primitive: {
          colors: {
            ...defaultTokens.primitive.colors,
            blue500: '#ec4899', // Hot pink primary
            blue600: '#db2777',
            blue700: '#be185d',
            pink500: '#f59e0b', // Orange accent
          },
          fonts: {
            ...defaultTokens.primitive.fonts,
            system: '"Poppins", "Helvetica Neue", Arial, sans-serif',
            display: '"Poppins", "Helvetica Neue", Arial, sans-serif',
          },
          spacing: {
            base: '0.25rem',
            scale: 1.5, // Generous spacing
          },
          radii: {
            ...defaultTokens.primitive.radii,
            sm: '0.5rem',
            md: '1rem',
            lg: '1.5rem',
            xl: '2rem',
          },
          transitions: {
            ...defaultTokens.primitive.transitions,
            fast: '200ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            normal: '400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            slow: '600ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          },
        },
      },
    });

    // Minimal Zen Theme
    this.registerTheme({
      id: 'minimal',
      name: 'Minimal Zen',
      description: 'Clean, spacious design with maximum focus',
      category: 'minimal',
      businessContext: 'Productivity apps, meditation, wellness, focus-oriented tools',
      tokens: {
        primitive: {
          colors: {
            ...defaultTokens.primitive.colors,
            blue500: '#374151', // Muted gray
            blue600: '#1f2937',
            blue700: '#111827',
            gray50: '#fafafa',
            gray100: '#f5f5f5',
          },
          fonts: {
            ...defaultTokens.primitive.fonts,
            system: '"Helvetica Neue", -apple-system, BlinkMacSystemFont, sans-serif',
            display: '"Helvetica Neue", -apple-system, BlinkMacSystemFont, sans-serif',
          },
          spacing: {
            base: '0.25rem',
            scale: 2, // Extra spacious
          },
          radii: {
            ...defaultTokens.primitive.radii,
            sm: '0.125rem',
            md: '0.25rem',
            lg: '0.375rem',
            xl: '0.5rem',
          },
          transitions: {
            ...defaultTokens.primitive.transitions,
            fast: '100ms ease-out',
            normal: '200ms ease-out',
            slow: '300ms ease-out',
          },
        },
      },
    });

    // High Contrast Accessible Theme
    this.registerTheme({
      id: 'accessible',
      name: 'High Contrast Accessible',
      description: 'WCAG AAA compliant with maximum accessibility',
      category: 'accessible',
      businessContext: 'Government, healthcare, education, accessibility-required',
      tokens: {
        primitive: {
          colors: {
            ...defaultTokens.primitive.colors,
            blue500: '#0000ff', // Pure blue for contrast
            blue600: '#0000cc',
            blue700: '#000099',
            gray900: '#000000',
            gray800: '#1a1a1a',
            gray700: '#333333',
            white: '#ffffff',
          },
          fonts: {
            ...defaultTokens.primitive.fonts,
            system: 'Arial, Helvetica, sans-serif', // High readability
          },
          spacing: {
            base: '0.25rem',
            scale: 1.25, // Slightly more spacious for accessibility
          },
          transitions: {
            ...defaultTokens.primitive.transitions,
            fast: '0ms', // Reduce motion for accessibility
            normal: '0ms',
            slow: '0ms',
          },
        },
      },
    });

    // Dense Information Theme
    this.registerTheme({
      id: 'dense',
      name: 'Dense Information',
      description: 'Compact layout for data-heavy applications',
      category: 'dense',
      businessContext: 'Analytics dashboards, admin panels, data visualization',
      tokens: {
        primitive: {
          spacing: {
            base: '0.25rem',
            scale: 0.5, // Very tight spacing
          },
          fonts: {
            ...defaultTokens.primitive.fonts,
            system: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
          },
          radii: {
            ...defaultTokens.primitive.radii,
            sm: '1px',
            md: '2px',
            lg: '3px',
            xl: '4px',
          },
        },
        semantic: {
          ...defaultTokens.semantic,
          typography: {
            ...defaultTokens.semantic.typography,
            fontSizeXs: 'calc(var(--primitive-spacing-base) * 2.5)', // Smaller text
            fontSizeSm: 'calc(var(--primitive-spacing-base) * 3)',
            fontSizeMd: 'calc(var(--primitive-spacing-base) * 3.5)',
          },
        },
      },
    });

    // Dark Mode Theme
    this.registerTheme({
      id: 'dark',
      name: 'Dark Mode',
      description: 'Modern dark theme with OLED-friendly deep blacks',
      category: 'minimal',
      businessContext: 'Night mode, developer tools, reduced eye strain, OLED screens',
      tokens: {
        primitive: {
          colors: {
            ...defaultTokens.primitive.colors,
            // Invert the gray scale for dark mode
            gray50: '#111827',
            gray100: '#1f2937',
            gray200: '#374151',
            gray300: '#4b5563',
            gray400: '#6b7280',
            gray500: '#9ca3af',
            gray600: '#d1d5db',
            gray700: '#e5e7eb',
            gray800: '#f3f4f6',
            gray900: '#f9fafb',

            // Slightly desaturated blues for dark mode (easier on eyes)
            blue50: '#1e3a8a',
            blue100: '#1e40af',
            blue200: '#1d4ed8',
            blue300: '#2563eb',
            blue400: '#3b82f6',
            blue500: '#60a5fa',
            blue600: '#93c5fd',
            blue700: '#bfdbfe',
            blue800: '#dbeafe',
            blue900: '#eff6ff',
          },
          fonts: {
            ...defaultTokens.primitive.fonts,
            system: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          },
        },
        semantic: {
          colors: {
            primary: 'var(--primitive-blue-500)',
            secondary: 'var(--primitive-gray-400)',
            accent: 'var(--primitive-blue-400)',

            success: 'var(--primitive-green-500)',
            warning: 'var(--primitive-yellow-500)',
            error: 'var(--primitive-red-500)',
            info: 'var(--primitive-blue-400)',

            // Inverted text colors
            textPrimary: 'var(--primitive-gray-900)',
            textSecondary: 'var(--primitive-gray-600)',
            textMuted: 'var(--primitive-gray-500)',
            textInverse: 'var(--primitive-gray-50)',

            // Dark backgrounds
            backgroundBase: 'var(--primitive-gray-50)',
            backgroundElevated: 'var(--primitive-gray-100)',
            backgroundInverse: 'var(--primitive-gray-900)',
            backgroundOverlay: 'rgba(0, 0, 0, 0.75)',

            // Subtle borders for dark mode
            borderSubtle: 'var(--primitive-gray-200)',
            borderDefault: 'var(--primitive-gray-300)',
            borderStrong: 'var(--primitive-gray-400)',
            borderAccent: 'var(--primitive-blue-400)',
          },
          typography: {
            ...defaultTokens.semantic.typography,
          },
          spacing: {
            ...defaultTokens.semantic.spacing,
          },
          interactions: {
            borderRadius: 'var(--primitive-radii-md)',
            elevation: 'var(--primitive-shadows-md)',
            transition: 'var(--primitive-transitions-normal)',
            focusRing: '0 0 0 2px var(--semantic-colors-accent)',
          },
        },
        component: {
          button: {
            primaryBackground: 'var(--semantic-colors-primary)',
            primaryBackgroundHover: 'var(--primitive-blue-600)',
            primaryBackgroundActive: 'var(--primitive-blue-700)',
            primaryText: 'var(--primitive-gray-50)',
            primaryBorder: 'transparent',

            secondaryBackground: 'var(--primitive-gray-100)',
            secondaryBackgroundHover: 'var(--primitive-gray-200)',
            secondaryText: 'var(--semantic-colors-text-primary)',
            secondaryBorder: 'var(--semantic-colors-border-default)',

            paddingSm: 'var(--semantic-spacing-xs) var(--semantic-spacing-sm)',
            paddingMd: 'var(--semantic-spacing-sm) var(--semantic-spacing-md)',
            paddingLg: 'var(--semantic-spacing-md) var(--semantic-spacing-lg)',
            fontSizeSm: 'var(--semantic-typography-font-size-sm)',
            fontSizeMd: 'var(--semantic-typography-font-size-md)',
            fontSizeLg: 'var(--semantic-typography-font-size-lg)',

            borderRadius: 'var(--semantic-interactions-border-radius)',
            transition: 'var(--semantic-interactions-transition)',
            fontWeight: 500,
          },

          card: {
            background: 'var(--primitive-gray-100)',
            backgroundHover: 'var(--primitive-gray-200)',
            border: '1px solid var(--semantic-colors-border-subtle)',
            borderRadius: 'var(--semantic-interactions-border-radius)',
            padding: 'var(--semantic-spacing-component-padding)',
            shadow: 'var(--primitive-shadows-lg)',
            shadowHover: 'var(--primitive-shadows-xl)',
          },

          input: {
            background: 'var(--primitive-gray-100)',
            backgroundFocus: 'var(--primitive-gray-200)',
            border: '1px solid var(--semantic-colors-border-default)',
            borderFocus: '2px solid var(--semantic-colors-border-accent)',
            borderError: '2px solid var(--semantic-colors-error)',
            text: 'var(--semantic-colors-text-primary)',
            placeholder: 'var(--semantic-colors-text-muted)',
            borderRadius: 'var(--semantic-interactions-border-radius)',
            padding: 'var(--semantic-spacing-sm) var(--semantic-spacing-md)',
            fontSize: 'var(--semantic-typography-font-size-md)',
          },

          navigation: {
            background: 'var(--primitive-gray-100)',
            itemBackground: 'transparent',
            itemBackgroundHover: 'var(--primitive-gray-200)',
            itemBackgroundActive: 'var(--semantic-colors-primary)',
            itemText: 'var(--semantic-colors-text-primary)',
            itemTextActive: 'var(--primitive-gray-50)',
            border: '1px solid var(--semantic-colors-border-subtle)',
            padding: 'var(--semantic-spacing-sm) var(--semantic-spacing-md)',
          },

          modal: {
            background: 'var(--primitive-gray-100)',
            overlay: 'var(--semantic-colors-background-overlay)',
            border: '1px solid var(--semantic-colors-border-default)',
            borderRadius: 'var(--primitive-radii-lg)',
            padding: 'var(--semantic-spacing-xl)',
            shadow: 'var(--primitive-shadows-xl)',
          },
        },
      },
    });
  }

  /**
   * Validate theme completeness
   */
  validateTheme(theme: ThemeDefinition): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Basic validation
    if (!theme.id) errors.push('Theme ID is required');
    if (!theme.name) errors.push('Theme name is required');
    if (!theme.tokens) errors.push('Theme tokens are required');
    
    // TODO: Add comprehensive token validation
    // - Required token presence
    // - Color contrast validation
    // - Accessibility compliance
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Export theme configuration
   */
  exportTheme(themeId: string): string {
    const theme = this.themes.get(themeId);
    if (!theme) {
      throw new Error(`Theme '${themeId}' not found`);
    }
    
    return JSON.stringify(theme, null, 2);
  }

  /**
   * Import theme configuration
   */
  importTheme(themeJson: string): void {
    try {
      const theme = JSON.parse(themeJson) as ThemeDefinition;
      const validation = this.validateTheme(theme);
      
      if (!validation.isValid) {
        throw new Error(`Invalid theme: ${validation.errors.join(', ')}`);
      }
      
      this.registerTheme(theme);
    } catch (error) {
      throw new Error(`Failed to import theme: ${error}`);
    }
  }
}

// Global theme manager instance
export const themeManager = new ThemeManager();