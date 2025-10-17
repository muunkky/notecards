/**
 * Responsive Design System
 * 
 * Mobile-first responsive design framework with bulletproof breakpoint strategy,
 * spacing/layout grid, and viewport-aware component behavior. Built for
 * management change-proof flexibility across all device types.
 */

import React from 'react';
import { tokenCSS } from '../design-tokens';

// Breakpoint strategy - Mobile-first approach
export const breakpoints = {
  // Mobile first - start with smallest screen
  mobile: {
    min: 0,
    max: 767,
    name: 'mobile',
    label: 'Mobile',
    columns: 4,
    gutter: 16,
    margin: 16,
  },
  
  // Tablet portrait
  tablet: {
    min: 768,
    max: 1023,
    name: 'tablet',
    label: 'Tablet',
    columns: 8,
    gutter: 20,
    margin: 24,
  },
  
  // Desktop/laptop
  desktop: {
    min: 1024,
    max: 1439,
    name: 'desktop',
    label: 'Desktop',
    columns: 12,
    gutter: 24,
    margin: 32,
  },
  
  // Large desktop/wide screen
  wide: {
    min: 1440,
    max: Infinity,
    name: 'wide',
    label: 'Wide Screen',
    columns: 12,
    gutter: 32,
    margin: 48,
  },
} as const;

// Breakpoint utilities
export const breakpointUtils = {
  // Generate media queries
  up: (breakpoint: keyof typeof breakpoints) => 
    `@media (min-width: ${breakpoints[breakpoint].min}px)`,
  
  down: (breakpoint: keyof typeof breakpoints) => 
    `@media (max-width: ${breakpoints[breakpoint].max}px)`,
  
  between: (start: keyof typeof breakpoints, end: keyof typeof breakpoints) =>
    `@media (min-width: ${breakpoints[start].min}px) and (max-width: ${breakpoints[end].max}px)`,
  
  only: (breakpoint: keyof typeof breakpoints) => {
    const bp = breakpoints[breakpoint];
    if (bp.max === Infinity) {
      return `@media (min-width: ${bp.min}px)`;
    }
    return `@media (min-width: ${bp.min}px) and (max-width: ${bp.max}px)`;
  },
  
  // Get current breakpoint from window width
  getCurrentBreakpoint: (width: number): keyof typeof breakpoints => {
    if (width >= breakpoints.wide.min) return 'wide';
    if (width >= breakpoints.desktop.min) return 'desktop';
    if (width >= breakpoints.tablet.min) return 'tablet';
    return 'mobile';
  },
  
  // Check if window matches breakpoint
  matches: (breakpoint: keyof typeof breakpoints, width: number): boolean => {
    const bp = breakpoints[breakpoint];
    return width >= bp.min && width <= bp.max;
  },
};

// CSS Custom Properties for responsive design
export const responsiveCSS = {
  // Breakpoint variables
  '--breakpoint-mobile': `${breakpoints.mobile.min}px`,
  '--breakpoint-tablet': `${breakpoints.tablet.min}px`,
  '--breakpoint-desktop': `${breakpoints.desktop.min}px`,
  '--breakpoint-wide': `${breakpoints.wide.min}px`,
  
  // Grid system variables
  '--grid-columns-mobile': `${breakpoints.mobile.columns}`,
  '--grid-columns-tablet': `${breakpoints.tablet.columns}`,
  '--grid-columns-desktop': `${breakpoints.desktop.columns}`,
  '--grid-columns-wide': `${breakpoints.wide.columns}`,
  
  '--grid-gutter-mobile': `${breakpoints.mobile.gutter}px`,
  '--grid-gutter-tablet': `${breakpoints.tablet.gutter}px`,
  '--grid-gutter-desktop': `${breakpoints.desktop.gutter}px`,
  '--grid-gutter-wide': `${breakpoints.wide.gutter}px`,
  
  '--grid-margin-mobile': `${breakpoints.mobile.margin}px`,
  '--grid-margin-tablet': `${breakpoints.tablet.margin}px`,
  '--grid-margin-desktop': `${breakpoints.desktop.margin}px`,
  '--grid-margin-wide': `${breakpoints.wide.margin}px`,
};

// Responsive spacing system
export interface ResponsiveSpacing {
  mobile?: string;
  tablet?: string;
  desktop?: string;
  wide?: string;
}

export const createResponsiveSpacing = (values: ResponsiveSpacing): Record<string, any> => {
  const styles: Record<string, any> = {};
  
  // Mobile first - default value
  if (values.mobile) {
    styles.padding = values.mobile;
  }
  
  // Apply breakpoint-specific values via CSS custom properties
  if (values.tablet) {
    styles[`${breakpointUtils.up('tablet')} &`] = { padding: values.tablet };
  }
  
  if (values.desktop) {
    styles[`${breakpointUtils.up('desktop')} &`] = { padding: values.desktop };
  }
  
  if (values.wide) {
    styles[`${breakpointUtils.up('wide')} &`] = { padding: values.wide };
  }
  
  return styles;
};

// Grid system components
export interface GridContainerProps {
  children: React.ReactNode;
  maxWidth?: keyof typeof breakpoints | 'none';
  gutterSize?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const GridContainer: React.FC<GridContainerProps> = ({
  children,
  maxWidth = 'wide',
  gutterSize = 'md',
  className,
}) => {
  const maxWidthValue = maxWidth === 'none' ? 'none' : `${breakpoints[maxWidth].max}px`;
  
  const containerStyles: Record<string, any> = {
    width: '100%',
    maxWidth: maxWidthValue,
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingLeft: 'var(--grid-margin-mobile)',
    paddingRight: 'var(--grid-margin-mobile)',
    
    // Responsive padding
    [`${breakpointUtils.up('tablet')}`]: {
      paddingLeft: 'var(--grid-margin-tablet)',
      paddingRight: 'var(--grid-margin-tablet)',
    },
    
    [`${breakpointUtils.up('desktop')}`]: {
      paddingLeft: 'var(--grid-margin-desktop)',
      paddingRight: 'var(--grid-margin-desktop)',
    },
    
    [`${breakpointUtils.up('wide')}`]: {
      paddingLeft: 'var(--grid-margin-wide)',
      paddingRight: 'var(--grid-margin-wide)',
    },
  };
  
  const combinedClassName = ['grid-container', className].filter(Boolean).join(' ');
  
  return (
    <div className={combinedClassName} style={containerStyles}>
      {children}
    </div>
  );
};

export interface GridRowProps {
  children: React.ReactNode;
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  className?: string;
}

export const GridRow: React.FC<GridRowProps> = ({
  children,
  alignItems = 'stretch',
  justifyContent = 'start',
  className,
}) => {
  const rowStyles: Record<string, any> = {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems,
    justifyContent: justifyContent === 'between' ? 'space-between' : 
                   justifyContent === 'around' ? 'space-around' :
                   justifyContent === 'evenly' ? 'space-evenly' :
                   `flex-${justifyContent}`,
    marginLeft: 'calc(var(--grid-gutter-mobile) / -2)',
    marginRight: 'calc(var(--grid-gutter-mobile) / -2)',
    
    // Responsive gutter
    [`${breakpointUtils.up('tablet')}`]: {
      marginLeft: 'calc(var(--grid-gutter-tablet) / -2)',
      marginRight: 'calc(var(--grid-gutter-tablet) / -2)',
    },
    
    [`${breakpointUtils.up('desktop')}`]: {
      marginLeft: 'calc(var(--grid-gutter-desktop) / -2)',
      marginRight: 'calc(var(--grid-gutter-desktop) / -2)',
    },
    
    [`${breakpointUtils.up('wide')}`]: {
      marginLeft: 'calc(var(--grid-gutter-wide) / -2)',
      marginRight: 'calc(var(--grid-gutter-wide) / -2)',
    },
  };
  
  const combinedClassName = ['grid-row', className].filter(Boolean).join(' ');
  
  return (
    <div className={combinedClassName} style={rowStyles}>
      {children}
    </div>
  );
};

export interface GridColProps {
  children: React.ReactNode;
  // Column spans for each breakpoint
  mobile?: number;
  tablet?: number;
  desktop?: number;
  wide?: number;
  // Offset for each breakpoint
  mobileOffset?: number;
  tabletOffset?: number;
  desktopOffset?: number;
  wideOffset?: number;
  className?: string;
}

export const GridCol: React.FC<GridColProps> = ({
  children,
  mobile = 12,
  tablet,
  desktop,
  wide,
  mobileOffset = 0,
  tabletOffset,
  desktopOffset,
  wideOffset,
  className,
}) => {
  // Calculate column widths as percentages
  const getColumnWidth = (span: number, totalColumns: number) => 
    `${(span / totalColumns) * 100}%`;
  
  const getColumnOffset = (offset: number, totalColumns: number) =>
    offset > 0 ? `${(offset / totalColumns) * 100}%` : '0';
  
  const colStyles: Record<string, any> = {
    width: getColumnWidth(mobile, breakpoints.mobile.columns),
    marginLeft: getColumnOffset(mobileOffset, breakpoints.mobile.columns),
    paddingLeft: 'calc(var(--grid-gutter-mobile) / 2)',
    paddingRight: 'calc(var(--grid-gutter-mobile) / 2)',
    
    // Tablet styles
    [`${breakpointUtils.up('tablet')}`]: {
      width: getColumnWidth(tablet || mobile, breakpoints.tablet.columns),
      marginLeft: getColumnOffset(tabletOffset ?? mobileOffset, breakpoints.tablet.columns),
      paddingLeft: 'calc(var(--grid-gutter-tablet) / 2)',
      paddingRight: 'calc(var(--grid-gutter-tablet) / 2)',
    },
    
    // Desktop styles
    [`${breakpointUtils.up('desktop')}`]: {
      width: getColumnWidth(desktop || tablet || mobile, breakpoints.desktop.columns),
      marginLeft: getColumnOffset(desktopOffset ?? tabletOffset ?? mobileOffset, breakpoints.desktop.columns),
      paddingLeft: 'calc(var(--grid-gutter-desktop) / 2)',
      paddingRight: 'calc(var(--grid-gutter-desktop) / 2)',
    },
    
    // Wide screen styles
    [`${breakpointUtils.up('wide')}`]: {
      width: getColumnWidth(wide || desktop || tablet || mobile, breakpoints.wide.columns),
      marginLeft: getColumnOffset(wideOffset ?? desktopOffset ?? tabletOffset ?? mobileOffset, breakpoints.wide.columns),
      paddingLeft: 'calc(var(--grid-gutter-wide) / 2)',
      paddingRight: 'calc(var(--grid-gutter-wide) / 2)',
    },
  };
  
  const combinedClassName = ['grid-col', className].filter(Boolean).join(' ');
  
  return (
    <div className={combinedClassName} style={colStyles}>
      {children}
    </div>
  );
};

// Responsive component hooks
export const useBreakpoint = (): keyof typeof breakpoints => {
  const [breakpoint, setBreakpoint] = React.useState<keyof typeof breakpoints>('mobile');
  
  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      setBreakpoint(breakpointUtils.getCurrentBreakpoint(width));
    };
    
    // Set initial breakpoint
    updateBreakpoint();
    
    // Listen for window resize
    window.addEventListener('resize', updateBreakpoint);
    
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);
  
  return breakpoint;
};

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = React.useState(false);
  
  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);
    
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);
  
  return matches;
};

// Responsive typography utilities
export const createResponsiveTypography = (config: {
  mobile: { fontSize: string; lineHeight?: string };
  tablet?: { fontSize: string; lineHeight?: string };
  desktop?: { fontSize: string; lineHeight?: string };
  wide?: { fontSize: string; lineHeight?: string };
}): Record<string, any> => {
  return {
    fontSize: config.mobile.fontSize,
    lineHeight: config.mobile.lineHeight || '1.5',
    
    [`${breakpointUtils.up('tablet')}`]: config.tablet ? {
      fontSize: config.tablet.fontSize,
      lineHeight: config.tablet.lineHeight || '1.5',
    } : {},
    
    [`${breakpointUtils.up('desktop')}`]: config.desktop ? {
      fontSize: config.desktop.fontSize,
      lineHeight: config.desktop.lineHeight || '1.5',
    } : {},
    
    [`${breakpointUtils.up('wide')}`]: config.wide ? {
      fontSize: config.wide.fontSize,
      lineHeight: config.wide.lineHeight || '1.5',
    } : {},
  };
};

// Hide/show utilities for responsive design
export const responsiveDisplay = {
  hideOnMobile: {
    display: 'none',
    [`${breakpointUtils.up('tablet')}`]: { display: 'block' },
  },
  
  hideOnTablet: {
    display: 'block',
    [`${breakpointUtils.up('tablet')}`]: { display: 'none' },
    [`${breakpointUtils.up('desktop')}`]: { display: 'block' },
  },
  
  hideOnDesktop: {
    display: 'block',
    [`${breakpointUtils.up('desktop')}`]: { display: 'none' },
  },
  
  showOnlyMobile: {
    display: 'block',
    [`${breakpointUtils.up('tablet')}`]: { display: 'none' },
  },
  
  showOnlyTablet: {
    display: 'none',
    [`${breakpointUtils.up('tablet')}`]: { display: 'block' },
    [`${breakpointUtils.up('desktop')}`]: { display: 'none' },
  },
  
  showOnlyDesktop: {
    display: 'none',
    [`${breakpointUtils.up('desktop')}`]: { display: 'block' },
    [`${breakpointUtils.up('wide')}`]: { display: 'none' },
  },
};

// Responsive component variants
export interface ResponsiveComponentProps {
  mobile?: React.ReactNode;
  tablet?: React.ReactNode;
  desktop?: React.ReactNode;
  wide?: React.ReactNode;
}

export const ResponsiveComponent: React.FC<ResponsiveComponentProps> = ({
  mobile,
  tablet,
  desktop,
  wide,
}) => {
  const currentBreakpoint = useBreakpoint();
  
  // Return the appropriate component for current breakpoint
  switch (currentBreakpoint) {
    case 'mobile':
      return <>{mobile}</>;
    case 'tablet':
      return <>{tablet || mobile}</>;
    case 'desktop':
      return <>{desktop || tablet || mobile}</>;
    case 'wide':
      return <>{wide || desktop || tablet || mobile}</>;
    default:
      return <>{mobile}</>;
  }
};

// Responsive image component
export interface ResponsiveImageProps {
  src: {
    mobile: string;
    tablet?: string;
    desktop?: string;
    wide?: string;
  };
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className,
  loading = 'lazy',
}) => {
  const currentBreakpoint = useBreakpoint();
  
  const getCurrentSrc = () => {
    switch (currentBreakpoint) {
      case 'wide':
        return src.wide || src.desktop || src.tablet || src.mobile;
      case 'desktop':
        return src.desktop || src.tablet || src.mobile;
      case 'tablet':
        return src.tablet || src.mobile;
      default:
        return src.mobile;
    }
  };
  
  return (
    <img
      src={getCurrentSrc()}
      alt={alt}
      className={className}
      loading={loading}
      style={{
        width: '100%',
        height: 'auto',
        display: 'block',
      }}
    />
  );
};

// Export complete responsive design system
export const ResponsiveDesignSystem = {
  breakpoints,
  breakpointUtils,
  responsiveCSS,
  createResponsiveSpacing,
  createResponsiveTypography,
  responsiveDisplay,
  
  // Components
  GridContainer,
  GridRow,
  GridCol,
  ResponsiveComponent,
  ResponsiveImage,
  
  // Hooks
  useBreakpoint,
  useMediaQuery,
  
  // Version info
  version: '1.0.0',
};

export default ResponsiveDesignSystem;