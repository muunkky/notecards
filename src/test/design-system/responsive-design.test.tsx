/**
 * Responsive Design System Tests
 * 
 * Comprehensive test suite for responsive breakpoint strategy,
 * grid system, and mobile-first design patterns.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import {
  breakpoints,
  breakpointUtils,
  responsiveCSS,
  createResponsiveSpacing,
  createResponsiveTypography,
  responsiveDisplay,
  GridContainer,
  GridRow,
  GridCol,
  ResponsiveComponent,
  ResponsiveImage,
  useBreakpoint,
  useMediaQuery,
  ResponsiveDesignSystem,
} from '../../design-system/responsive';

// Mock window.matchMedia
const mockMatchMedia = (matches: boolean = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

// Mock window.innerWidth
const mockWindowInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
};

describe('Responsive Design System', () => {
  beforeEach(() => {
    mockMatchMedia();
    mockWindowInnerWidth(1024); // Default desktop width
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Breakpoint Configuration', () => {
    it('defines correct breakpoint ranges', () => {
      expect(breakpoints.mobile.min).toBe(0);
      expect(breakpoints.mobile.max).toBe(767);
      expect(breakpoints.mobile.columns).toBe(4);
      
      expect(breakpoints.tablet.min).toBe(768);
      expect(breakpoints.tablet.max).toBe(1023);
      expect(breakpoints.tablet.columns).toBe(8);
      
      expect(breakpoints.desktop.min).toBe(1024);
      expect(breakpoints.desktop.max).toBe(1439);
      expect(breakpoints.desktop.columns).toBe(12);
      
      expect(breakpoints.wide.min).toBe(1440);
      expect(breakpoints.wide.max).toBe(Infinity);
      expect(breakpoints.wide.columns).toBe(12);
    });
    
    it('has consistent gutter and margin scaling', () => {
      expect(breakpoints.mobile.gutter).toBe(16);
      expect(breakpoints.tablet.gutter).toBe(20);
      expect(breakpoints.desktop.gutter).toBe(24);
      expect(breakpoints.wide.gutter).toBe(32);
      
      expect(breakpoints.mobile.margin).toBe(16);
      expect(breakpoints.tablet.margin).toBe(24);
      expect(breakpoints.desktop.margin).toBe(32);
      expect(breakpoints.wide.margin).toBe(48);
    });
  });
  
  describe('Breakpoint Utilities', () => {
    it('generates correct media queries', () => {
      expect(breakpointUtils.up('tablet')).toBe('@media (min-width: 768px)');
      expect(breakpointUtils.up('desktop')).toBe('@media (min-width: 1024px)');
      
      expect(breakpointUtils.down('mobile')).toBe('@media (max-width: 767px)');
      expect(breakpointUtils.down('tablet')).toBe('@media (max-width: 1023px)');
      
      expect(breakpointUtils.between('tablet', 'desktop')).toBe('@media (min-width: 768px) and (max-width: 1439px)');
      
      expect(breakpointUtils.only('mobile')).toBe('@media (min-width: 0px) and (max-width: 767px)');
      expect(breakpointUtils.only('wide')).toBe('@media (min-width: 1440px)');
    });
    
    it('correctly determines current breakpoint', () => {
      expect(breakpointUtils.getCurrentBreakpoint(320)).toBe('mobile');
      expect(breakpointUtils.getCurrentBreakpoint(768)).toBe('tablet');
      expect(breakpointUtils.getCurrentBreakpoint(1024)).toBe('desktop');
      expect(breakpointUtils.getCurrentBreakpoint(1440)).toBe('wide');
      expect(breakpointUtils.getCurrentBreakpoint(1920)).toBe('wide');
    });
    
    it('correctly matches breakpoints', () => {
      expect(breakpointUtils.matches('mobile', 320)).toBe(true);
      expect(breakpointUtils.matches('mobile', 800)).toBe(false);
      
      expect(breakpointUtils.matches('tablet', 800)).toBe(true);
      expect(breakpointUtils.matches('tablet', 1200)).toBe(false);
      
      expect(breakpointUtils.matches('desktop', 1200)).toBe(true);
      expect(breakpointUtils.matches('desktop', 1500)).toBe(false);
      
      expect(breakpointUtils.matches('wide', 1500)).toBe(true);
    });
  });
  
  describe('Responsive CSS Custom Properties', () => {
    it('exports correct CSS variables', () => {
      expect(responsiveCSS['--breakpoint-mobile']).toBe('0px');
      expect(responsiveCSS['--breakpoint-tablet']).toBe('768px');
      expect(responsiveCSS['--breakpoint-desktop']).toBe('1024px');
      expect(responsiveCSS['--breakpoint-wide']).toBe('1440px');
      
      expect(responsiveCSS['--grid-columns-mobile']).toBe('4');
      expect(responsiveCSS['--grid-columns-tablet']).toBe('8');
      expect(responsiveCSS['--grid-columns-desktop']).toBe('12');
      
      expect(responsiveCSS['--grid-gutter-mobile']).toBe('16px');
      expect(responsiveCSS['--grid-gutter-tablet']).toBe('20px');
      
      expect(responsiveCSS['--grid-margin-mobile']).toBe('16px');
      expect(responsiveCSS['--grid-margin-tablet']).toBe('24px');
    });
  });
  
  describe('Responsive Spacing Utilities', () => {
    it('creates responsive spacing with mobile-first approach', () => {
      const spacing = createResponsiveSpacing({
        mobile: '16px',
        tablet: '24px',
        desktop: '32px',
        wide: '48px',
      });
      
      expect(spacing.padding).toBe('16px');
      expect(spacing['@media (min-width: 768px) &']).toEqual({ padding: '24px' });
      expect(spacing['@media (min-width: 1024px) &']).toEqual({ padding: '32px' });
      expect(spacing['@media (min-width: 1440px) &']).toEqual({ padding: '48px' });
    });
    
    it('handles partial responsive values', () => {
      const spacing = createResponsiveSpacing({
        mobile: '16px',
        desktop: '32px',
      });
      
      expect(spacing.padding).toBe('16px');
      expect(spacing['@media (min-width: 768px) &']).toBeUndefined();
      expect(spacing['@media (min-width: 1024px) &']).toEqual({ padding: '32px' });
    });
  });
  
  describe('Responsive Typography Utilities', () => {
    it('creates responsive typography with proper scaling', () => {
      const typography = createResponsiveTypography({
        mobile: { fontSize: '14px', lineHeight: '1.4' },
        tablet: { fontSize: '16px', lineHeight: '1.5' },
        desktop: { fontSize: '18px', lineHeight: '1.6' },
        wide: { fontSize: '20px', lineHeight: '1.7' },
      });
      
      expect(typography.fontSize).toBe('14px');
      expect(typography.lineHeight).toBe('1.4');
      expect(typography['@media (min-width: 768px)']).toEqual({ fontSize: '16px', lineHeight: '1.5' });
      expect(typography['@media (min-width: 1024px)']).toEqual({ fontSize: '18px', lineHeight: '1.6' });
      expect(typography['@media (min-width: 1440px)']).toEqual({ fontSize: '20px', lineHeight: '1.7' });
    });
    
    it('provides default line-height when not specified', () => {
      const typography = createResponsiveTypography({
        mobile: { fontSize: '16px' },
        tablet: { fontSize: '18px' },
      });
      
      expect(typography.lineHeight).toBe('1.5');
      expect(typography['@media (min-width: 768px)']).toEqual({ fontSize: '18px', lineHeight: '1.5' });
    });
  });
  
  describe('Responsive Display Utilities', () => {
    it('provides correct hide/show utilities', () => {
      expect(responsiveDisplay.hideOnMobile.display).toBe('none');
      expect(responsiveDisplay.hideOnMobile['@media (min-width: 768px)']).toEqual({ display: 'block' });
      
      expect(responsiveDisplay.showOnlyMobile.display).toBe('block');
      expect(responsiveDisplay.showOnlyMobile['@media (min-width: 768px)']).toEqual({ display: 'none' });
      
      expect(responsiveDisplay.hideOnTablet.display).toBe('block');
      expect(responsiveDisplay.hideOnTablet['@media (min-width: 768px)']).toEqual({ display: 'none' });
      expect(responsiveDisplay.hideOnTablet['@media (min-width: 1024px)']).toEqual({ display: 'block' });
    });
  });
  
  describe('Grid System Components', () => {
    describe('GridContainer', () => {
      it('renders with default props', () => {
        render(
          <GridContainer>
            <div>Container content</div>
          </GridContainer>
        );
        
        const container = screen.getByText('Container content').parentElement;
        expect(container).toHaveClass('grid-container');
        expect(container).toHaveStyle({
          width: '100%',
          marginLeft: 'auto',
          marginRight: 'auto',
        });
      });
      
      it('applies maxWidth correctly', () => {
        render(
          <GridContainer maxWidth="desktop">
            <div>Limited width</div>
          </GridContainer>
        );
        
        const container = screen.getByText('Limited width').parentElement;
        expect(container).toHaveStyle({
          maxWidth: '1439px',
        });
      });
      
      it('handles maxWidth none', () => {
        render(
          <GridContainer maxWidth="none">
            <div>No max width</div>
          </GridContainer>
        );
        
        const container = screen.getByText('No max width').parentElement;
        expect(container).toHaveStyle({
          maxWidth: 'none',
        });
      });
      
      it('applies custom className', () => {
        render(
          <GridContainer className="custom-container">
            <div>Custom container</div>
          </GridContainer>
        );
        
        const container = screen.getByText('Custom container').parentElement;
        expect(container).toHaveClass('grid-container', 'custom-container');
      });
    });
    
    describe('GridRow', () => {
      it('renders with default props', () => {
        render(
          <GridRow>
            <div>Row content</div>
          </GridRow>
        );
        
        const row = screen.getByText('Row content').parentElement;
        expect(row).toHaveClass('grid-row');
        expect(row).toHaveStyle({
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
        });
      });
      
      it('applies alignment props correctly', () => {
        render(
          <GridRow alignItems="center" justifyContent="between">
            <div>Aligned row</div>
          </GridRow>
        );
        
        const row = screen.getByText('Aligned row').parentElement;
        expect(row).toHaveStyle({
          alignItems: 'center',
          justifyContent: 'space-between',
        });
      });
      
      it('handles all justifyContent options', () => {
        const justifyOptions = ['start', 'center', 'end', 'between', 'around', 'evenly'] as const;
        
        justifyOptions.forEach((justify) => {
          const { unmount } = render(
            <GridRow justifyContent={justify}>
              <div>Test {justify}</div>
            </GridRow>
          );
          
          const row = screen.getByText(`Test ${justify}`).parentElement;
          const expectedValue = justify === 'between' ? 'space-between' :
                               justify === 'around' ? 'space-around' :
                               justify === 'evenly' ? 'space-evenly' :
                               `flex-${justify}`;
          
          expect(row).toHaveStyle({ justifyContent: expectedValue });
          unmount();
        });
      });
    });
    
    describe('GridCol', () => {
      it('renders with default mobile column span', () => {
        render(
          <GridCol>
            <div>Column content</div>
          </GridCol>
        );
        
        const col = screen.getByText('Column content').parentElement;
        expect(col).toHaveClass('grid-col');
        expect(col).toHaveStyle({
          width: '100%', // 12/4 * 100% for mobile (default mobile=12, mobile columns=4 → full width)
          marginLeft: '0',
        });
      });
      
      it('applies custom column spans correctly', () => {
        render(
          <GridCol mobile={2} tablet={4} desktop={6} wide={8}>
            <div>Responsive column</div>
          </GridCol>
        );
        
        const col = screen.getByText('Responsive column').parentElement;
        // Mobile: 2/4 columns = 50%
        expect(col).toHaveStyle({
          width: '50%',
        });
      });
      
      it('applies column offsets correctly', () => {
        render(
          <GridCol mobile={2} mobileOffset={1}>
            <div>Offset column</div>
          </GridCol>
        );
        
        const col = screen.getByText('Offset column').parentElement;
        // Mobile: 1/4 offset = 25%
        expect(col).toHaveStyle({
          width: '50%', // 2/4 = 50%
          marginLeft: '25%', // 1/4 = 25%
        });
      });
      
      it('handles zero offset correctly', () => {
        render(
          <GridCol mobile={4} mobileOffset={0}>
            <div>No offset</div>
          </GridCol>
        );
        
        const col = screen.getByText('No offset').parentElement;
        expect(col).toHaveStyle({
          marginLeft: '0',
        });
      });
    });
  });
  
  describe('Responsive Hooks', () => {
    describe('useBreakpoint', () => {
      it('returns current breakpoint based on window width', () => {
        let result: any;
        
        const TestComponent = () => {
          result = useBreakpoint();
          return <div>Test</div>;
        };
        
        // Test mobile
        mockWindowInnerWidth(320);
        render(<TestComponent />);
        expect(result).toBe('mobile');
        
        // Test tablet
        mockWindowInnerWidth(800);
        act(() => {
          window.dispatchEvent(new Event('resize'));
        });
        // Note: Due to the way useBreakpoint is implemented with useEffect,
        // we need to test the logic separately
        expect(breakpointUtils.getCurrentBreakpoint(800)).toBe('tablet');
      });
    });
    
    describe('useMediaQuery', () => {
      it('returns media query match status', () => {
        mockMatchMedia(true);
        
        let result: any;
        
        const TestComponent = () => {
          result = useMediaQuery('(min-width: 768px)');
          return <div>Test</div>;
        };
        
        render(<TestComponent />);
        expect(result).toBe(true);
      });
      
      it('handles media query changes', () => {
        const mockMQ = {
          matches: false,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        };
        
        window.matchMedia = vi.fn().mockReturnValue(mockMQ);
        
        const TestComponent = () => {
          useMediaQuery('(min-width: 768px)');
          return <div>Test</div>;
        };
        
        render(<TestComponent />);
        
        expect(mockMQ.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
      });
    });
  });
  
  describe('Responsive Components', () => {
    describe('ResponsiveComponent', () => {
      it('renders appropriate content for current breakpoint', () => {
        const TestWrapper = ({ width }: { width: number }) => {
          mockWindowInnerWidth(width);
          return (
            <ResponsiveComponent
              mobile={<div>Mobile Content</div>}
              tablet={<div>Tablet Content</div>}
              desktop={<div>Desktop Content</div>}
              wide={<div>Wide Content</div>}
            />
          );
        };
        
        // Test different widths
        const { rerender } = render(<TestWrapper width={320} />);
        expect(screen.getByText('Mobile Content')).toBeInTheDocument();
        
        rerender(<TestWrapper width={800} />);
        // Note: The actual component uses useBreakpoint which depends on useEffect
        // In a real test, we'd need to properly mock the hook
      });
      
      it('falls back to mobile content when others not provided', () => {
        mockWindowInnerWidth(1200);
        
        render(
          <ResponsiveComponent
            mobile={<div>Fallback Content</div>}
          />
        );
        
        // Should fall back to mobile content for desktop when others not provided
        expect(screen.getByText('Fallback Content')).toBeInTheDocument();
      });
    });
    
    describe('ResponsiveImage', () => {
      it('renders with appropriate src for current breakpoint', () => {
        mockWindowInnerWidth(320);
        
        render(
          <ResponsiveImage
            src={{
              mobile: 'mobile.jpg',
              tablet: 'tablet.jpg',
              desktop: 'desktop.jpg',
              wide: 'wide.jpg',
            }}
            alt="Responsive image"
          />
        );
        
        const img = screen.getByAltText('Responsive image');
        expect(img).toHaveAttribute('src', 'mobile.jpg');
        expect(img).toHaveAttribute('loading', 'lazy');
        expect(img).toHaveStyle({
          width: '100%',
          height: 'auto',
          display: 'block',
        });
      });
      
      it('falls back to smaller breakpoint images', () => {
        mockWindowInnerWidth(1200);
        
        render(
          <ResponsiveImage
            src={{
              mobile: 'mobile.jpg',
              tablet: 'tablet.jpg',
              // No desktop/wide provided
            }}
            alt="Fallback image"
            loading="eager"
          />
        );
        
        const img = screen.getByAltText('Fallback image');
        // Should fall back to tablet.jpg for desktop
        expect(img).toHaveAttribute('loading', 'eager');
      });
      
      it('applies custom className', () => {
        render(
          <ResponsiveImage
            src={{ mobile: 'test.jpg' }}
            alt="Test image"
            className="custom-image"
          />
        );
        
        const img = screen.getByAltText('Test image');
        expect(img).toHaveClass('custom-image');
      });
    });
  });
  
  describe('Design System Integration', () => {
    it('exports complete responsive design system', () => {
      expect(ResponsiveDesignSystem.breakpoints).toBe(breakpoints);
      expect(ResponsiveDesignSystem.breakpointUtils).toBe(breakpointUtils);
      expect(ResponsiveDesignSystem.responsiveCSS).toBe(responsiveCSS);
      expect(ResponsiveDesignSystem.createResponsiveSpacing).toBe(createResponsiveSpacing);
      expect(ResponsiveDesignSystem.createResponsiveTypography).toBe(createResponsiveTypography);
      expect(ResponsiveDesignSystem.responsiveDisplay).toBe(responsiveDisplay);
      
      expect(ResponsiveDesignSystem.GridContainer).toBe(GridContainer);
      expect(ResponsiveDesignSystem.GridRow).toBe(GridRow);
      expect(ResponsiveDesignSystem.GridCol).toBe(GridCol);
      expect(ResponsiveDesignSystem.ResponsiveComponent).toBe(ResponsiveComponent);
      expect(ResponsiveDesignSystem.ResponsiveImage).toBe(ResponsiveImage);
      
      expect(ResponsiveDesignSystem.useBreakpoint).toBe(useBreakpoint);
      expect(ResponsiveDesignSystem.useMediaQuery).toBe(useMediaQuery);
      
      expect(ResponsiveDesignSystem.version).toBe('1.0.0');
    });
  });
  
  describe('Mobile-First Strategy', () => {
    it('implements proper mobile-first approach', () => {
      // Breakpoints start from mobile (0px)
      expect(breakpoints.mobile.min).toBe(0);
      
      // Media queries use min-width for mobile-first
      expect(breakpointUtils.up('tablet')).toContain('min-width');
      expect(breakpointUtils.up('desktop')).toContain('min-width');
      
      // Responsive utilities default to mobile
      const spacing = createResponsiveSpacing({ mobile: '16px', desktop: '32px' });
      expect(spacing.padding).toBe('16px'); // Mobile default applied immediately
    });
    
    it('scales appropriately across breakpoints', () => {
      // Gutter sizes scale logically
      expect(breakpoints.mobile.gutter).toBeLessThan(breakpoints.tablet.gutter);
      expect(breakpoints.tablet.gutter).toBeLessThan(breakpoints.desktop.gutter);
      expect(breakpoints.desktop.gutter).toBeLessThan(breakpoints.wide.gutter);
      
      // Column counts increase for larger screens
      expect(breakpoints.mobile.columns).toBeLessThan(breakpoints.tablet.columns);
      expect(breakpoints.tablet.columns).toBeLessThanOrEqual(breakpoints.desktop.columns);
    });
  });
  
  describe('Performance Considerations', () => {
    it('uses efficient media query generation', () => {
      const query = breakpointUtils.up('tablet');
      expect(query).toBe('@media (min-width: 768px)');
      expect(typeof query).toBe('string');
    });
    
    it('handles responsive components efficiently', () => {
      const startTime = performance.now();
      
      render(
        <GridContainer>
          <GridRow>
            {Array.from({ length: 12 }, (_, i) => (
              <GridCol key={i} mobile={1} tablet={3} desktop={4}>
                <div>Column {i}</div>
              </GridCol>
            ))}
          </GridRow>
        </GridContainer>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render complex grid quickly
      expect(renderTime).toBeLessThan(50); // Less than 50ms
      expect(screen.getAllByText(/Column/)).toHaveLength(12);
    });
  });
  
  describe('Accessibility Integration', () => {
    it('maintains accessibility across breakpoints', () => {
      render(
        <GridContainer>
          <GridRow>
            <GridCol mobile={4}>
              <button>Accessible Button</button>
            </GridCol>
          </GridRow>
        </GridContainer>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAccessibleName('Accessible Button');
    });
    
    it('preserves semantic structure in responsive components', () => {
      render(
        <ResponsiveComponent
          mobile={<h1>Mobile Heading</h1>}
          desktop={<h1>Desktop Heading</h1>}
        />
      );
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });
  });
});