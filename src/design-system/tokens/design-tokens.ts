/**
 * Design Token System - Three-Tier Architecture
 * 
 * This system enables extreme design flexibility by separating:
 * 1. Primitive tokens (raw values)
 * 2. Semantic tokens (purpose-based)
 * 3. Component tokens (specific usage)
 * 
 * CRITICAL: Zero hardcoded values allowed anywhere in components.
 * All styling must go through this token system.
 */

export interface PrimitiveTokens {
  // Colors - Raw palette values
  colors: {
    // Grays
    white: string;
    gray50: string;
    gray100: string;
    gray200: string;
    gray300: string;
    gray400: string;
    gray500: string;
    gray600: string;
    gray700: string;
    gray800: string;
    gray900: string;
    black: string;
    
    // Brand colors - can be completely swapped
    blue50: string;
    blue100: string;
    blue200: string;
    blue300: string;
    blue400: string;
    blue500: string;
    blue600: string;
    blue700: string;
    blue800: string;
    blue900: string;
    
    // Accent colors
    green50: string;
    green500: string;
    green700: string;
    red50: string;
    red500: string;
    red700: string;
    yellow50: string;
    yellow500: string;
    yellow700: string;
    
    // Extended palette for extreme themes
    pink50: string;
    pink500: string;
    pink700: string;
    purple50: string;
    purple500: string;
    purple700: string;
    orange50: string;
    orange500: string;
    orange700: string;
  };
  
  // Typography - Font family definitions
  fonts: {
    system: string;
    serif: string;
    mono: string;
    display: string;
    handwriting: string;
  };
  
  // Spacing - Base unit system
  spacing: {
    base: string; // 0.25rem (4px)
    scale: number; // Multiplier for theme variations
  };
  
  // Border radius - From sharp to extreme rounded
  radii: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  
  // Shadows
  shadows: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  
  // Animations
  transitions: {
    none: string;
    fast: string;
    normal: string;
    slow: string;
  };
}

export interface SemanticTokens {
  // Semantic color assignments
  colors: {
    // Brand
    primary: string;
    secondary: string;
    accent: string;
    
    // States
    success: string;
    warning: string;
    error: string;
    info: string;
    
    // Text
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    textInverse: string;
    
    // Surfaces
    backgroundBase: string;
    backgroundElevated: string;
    backgroundInverse: string;
    backgroundOverlay: string;
    
    // Borders
    borderSubtle: string;
    borderDefault: string;
    borderStrong: string;
    borderAccent: string;
  };
  
  // Typography scale
  typography: {
    fontPrimary: string;
    fontHeading: string;
    fontMono: string;
    
    // Calculated font sizes
    fontSizeXs: string;
    fontSizeSm: string;
    fontSizeMd: string;
    fontSizeLg: string;
    fontSizeXl: string;
    fontSize2xl: string;
    fontSize3xl: string;
    
    // Line heights
    lineHeightTight: number;
    lineHeightNormal: number;
    lineHeightLoose: number;
    
    // Font weights
    fontWeightLight: number;
    fontWeightNormal: number;
    fontWeightMedium: number;
    fontWeightBold: number;
  };
  
  // Spacing scale
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
    
    // Component spacing
    componentPadding: string;
    sectionGap: string;
    pageMargin: string;
  };
  
  // Interactive elements
  interactions: {
    borderRadius: string;
    elevation: string;
    transition: string;
    focusRing: string;
  };
}

export interface ComponentTokens {
  // Button tokens
  button: {
    // Primary variant
    primaryBackground: string;
    primaryBackgroundHover: string;
    primaryBackgroundActive: string;
    primaryText: string;
    primaryBorder: string;
    
    // Secondary variant
    secondaryBackground: string;
    secondaryBackgroundHover: string;
    secondaryText: string;
    secondaryBorder: string;
    
    // Sizes
    paddingSm: string;
    paddingMd: string;
    paddingLg: string;
    fontSizeSm: string;
    fontSizeMd: string;
    fontSizeLg: string;
    
    // Style
    borderRadius: string;
    transition: string;
    fontWeight: number;
  };
  
  // Card tokens
  card: {
    background: string;
    backgroundHover: string;
    border: string;
    borderRadius: string;
    padding: string;
    shadow: string;
    shadowHover: string;
  };
  
  // Input tokens
  input: {
    background: string;
    backgroundFocus: string;
    border: string;
    borderFocus: string;
    borderError: string;
    text: string;
    placeholder: string;
    borderRadius: string;
    padding: string;
    fontSize: string;
  };
  
  // Navigation tokens
  navigation: {
    background: string;
    itemBackground: string;
    itemBackgroundHover: string;
    itemBackgroundActive: string;
    itemText: string;
    itemTextActive: string;
    border: string;
    padding: string;
  };
  
  // Modal/Dialog tokens
  modal: {
    background: string;
    overlay: string;
    border: string;
    borderRadius: string;
    padding: string;
    shadow: string;
  };
}

export interface DesignTokens {
  primitive: PrimitiveTokens;
  semantic: SemanticTokens;
  component: ComponentTokens;
}

// Default token values - Conservative starting point
export const defaultTokens: DesignTokens = {
  primitive: {
    colors: {
      white: '#ffffff',
      gray50: '#f9fafb',
      gray100: '#f3f4f6',
      gray200: '#e5e7eb',
      gray300: '#d1d5db',
      gray400: '#9ca3af',
      gray500: '#6b7280',
      gray600: '#4b5563',
      gray700: '#374151',
      gray800: '#1f2937',
      gray900: '#111827',
      black: '#000000',
      
      blue50: '#eff6ff',
      blue100: '#dbeafe',
      blue200: '#bfdbfe',
      blue300: '#93c5fd',
      blue400: '#60a5fa',
      blue500: '#3b82f6',
      blue600: '#2563eb',
      blue700: '#1d4ed8',
      blue800: '#1e40af',
      blue900: '#1e3a8a',
      
      green50: '#f0fdf4',
      green500: '#22c55e',
      green700: '#15803d',
      red50: '#fef2f2',
      red500: '#ef4444',
      red700: '#b91c1c',
      yellow50: '#fefce8',
      yellow500: '#eab308',
      yellow700: '#a16207',
      
      pink50: '#fdf2f8',
      pink500: '#ec4899',
      pink700: '#be185d',
      purple50: '#faf5ff',
      purple500: '#a855f7',
      purple700: '#7c3aed',
      orange50: '#fff7ed',
      orange500: '#f97316',
      orange700: '#c2410c',
    },
    
    fonts: {
      system: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      serif: 'Georgia, "Times New Roman", Times, serif',
      mono: '"Fira Code", "Cascadia Code", Monaco, "Courier New", monospace',
      display: '"Inter Display", "Helvetica Neue", Arial, sans-serif',
      handwriting: '"Caveat", cursive',
    },
    
    spacing: {
      base: '0.25rem', // 4px
      scale: 1,
    },
    
    radii: {
      none: '0px',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    },
    
    shadows: {
      none: 'none',
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    },
    
    transitions: {
      none: '0ms',
      fast: '150ms ease',
      normal: '200ms ease',
      slow: '300ms ease',
    },
  },
  
  semantic: {
    colors: {
      primary: 'var(--primitive-blue-600)',
      secondary: 'var(--primitive-gray-600)',
      accent: 'var(--primitive-blue-500)',
      
      success: 'var(--primitive-green-500)',
      warning: 'var(--primitive-yellow-500)',
      error: 'var(--primitive-red-500)',
      info: 'var(--primitive-blue-500)',
      
      textPrimary: 'var(--primitive-gray-900)',
      textSecondary: 'var(--primitive-gray-600)',
      textMuted: 'var(--primitive-gray-500)',
      textInverse: 'var(--primitive-white)',
      
      backgroundBase: 'var(--primitive-white)',
      backgroundElevated: 'var(--primitive-gray-50)',
      backgroundInverse: 'var(--primitive-gray-900)',
      backgroundOverlay: 'rgba(0, 0, 0, 0.5)',
      
      borderSubtle: 'var(--primitive-gray-200)',
      borderDefault: 'var(--primitive-gray-300)',
      borderStrong: 'var(--primitive-gray-400)',
      borderAccent: 'var(--primitive-blue-300)',
    },
    
    typography: {
      fontPrimary: 'var(--primitive-font-system)',
      fontHeading: 'var(--primitive-font-system)',
      fontMono: 'var(--primitive-font-mono)',
      
      fontSizeXs: 'calc(var(--primitive-spacing-base) * 3)', // 0.75rem
      fontSizeSm: 'calc(var(--primitive-spacing-base) * 3.5)', // 0.875rem
      fontSizeMd: 'calc(var(--primitive-spacing-base) * 4)', // 1rem
      fontSizeLg: 'calc(var(--primitive-spacing-base) * 4.5)', // 1.125rem
      fontSizeXl: 'calc(var(--primitive-spacing-base) * 5)', // 1.25rem
      fontSize2xl: 'calc(var(--primitive-spacing-base) * 6)', // 1.5rem
      fontSize3xl: 'calc(var(--primitive-spacing-base) * 7.5)', // 1.875rem
      
      lineHeightTight: 1.2,
      lineHeightNormal: 1.5,
      lineHeightLoose: 1.8,
      
      fontWeightLight: 300,
      fontWeightNormal: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700,
    },
    
    spacing: {
      xs: 'calc(var(--primitive-spacing-base) * 1 * var(--primitive-spacing-scale))',
      sm: 'calc(var(--primitive-spacing-base) * 2 * var(--primitive-spacing-scale))',
      md: 'calc(var(--primitive-spacing-base) * 4 * var(--primitive-spacing-scale))',
      lg: 'calc(var(--primitive-spacing-base) * 6 * var(--primitive-spacing-scale))',
      xl: 'calc(var(--primitive-spacing-base) * 8 * var(--primitive-spacing-scale))',
      xxl: 'calc(var(--primitive-spacing-base) * 12 * var(--primitive-spacing-scale))',
      
      componentPadding: 'var(--semantic-spacing-md)',
      sectionGap: 'var(--semantic-spacing-xl)',
      pageMargin: 'var(--semantic-spacing-lg)',
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
      primaryBackgroundHover: 'var(--primitive-blue-700)',
      primaryBackgroundActive: 'var(--primitive-blue-800)',
      primaryText: 'var(--semantic-colors-text-inverse)',
      primaryBorder: 'transparent',
      
      secondaryBackground: 'transparent',
      secondaryBackgroundHover: 'var(--semantic-colors-background-elevated)',
      secondaryText: 'var(--semantic-colors-primary)',
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
      background: 'var(--semantic-colors-background-base)',
      backgroundHover: 'var(--semantic-colors-background-elevated)',
      border: '1px solid var(--semantic-colors-border-subtle)',
      borderRadius: 'var(--semantic-interactions-border-radius)',
      padding: 'var(--semantic-spacing-component-padding)',
      shadow: 'var(--semantic-interactions-elevation)',
      shadowHover: 'var(--primitive-shadows-lg)',
    },
    
    input: {
      background: 'var(--semantic-colors-background-base)',
      backgroundFocus: 'var(--semantic-colors-background-base)',
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
      background: 'var(--semantic-colors-background-elevated)',
      itemBackground: 'transparent',
      itemBackgroundHover: 'var(--primitive-gray-100)',
      itemBackgroundActive: 'var(--semantic-colors-primary)',
      itemText: 'var(--semantic-colors-text-primary)',
      itemTextActive: 'var(--semantic-colors-text-inverse)',
      border: '1px solid var(--semantic-colors-border-subtle)',
      padding: 'var(--semantic-spacing-sm) var(--semantic-spacing-md)',
    },
    
    modal: {
      background: 'var(--semantic-colors-background-base)',
      overlay: 'var(--semantic-colors-background-overlay)',
      border: '1px solid var(--semantic-colors-border-subtle)',
      borderRadius: 'var(--primitive-radii-lg)',
      padding: 'var(--semantic-spacing-xl)',
      shadow: 'var(--primitive-shadows-xl)',
    },
  },
};