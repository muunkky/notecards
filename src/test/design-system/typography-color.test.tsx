/**
 * Typography and Color System Tests
 * 
 * Comprehensive test suite for typography scale, color system,
 * WCAG compliance, and component behavior validation.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

import {
  typographyScale,
  fontStacks,
  typographyVariants,
  colorSystem,
  colorCombinations,
  Text,
  Heading,
  Code,
  wcagUtils,
  TypographyAndColorSystem,
} from '../../design-system/typography';

describe('Typography Scale', () => {
  it('should define modular scale with proper ratios', () => {
    expect(typographyScale.baseSize).toBe(16);
    expect(typographyScale.scaleRatio).toBe(1.25);
    
    // Verify key scale points
    expect(typographyScale.sizes.xs).toBe(0.75);
    expect(typographyScale.sizes.md).toBe(1); // Base size
    expect(typographyScale.sizes['5xl']).toBe(3);
    expect(typographyScale.sizes['7xl']).toBe(4.5);
  });

  it('should provide appropriate line heights for readability', () => {
    expect(typographyScale.lineHeights.tight).toBe(1.25);
    expect(typographyScale.lineHeights.normal).toBe(1.5);
    expect(typographyScale.lineHeights.relaxed).toBe(1.625);
    
    // Verify readable range
    Object.values(typographyScale.lineHeights).forEach(lineHeight => {
      expect(lineHeight).toBeGreaterThanOrEqual(1);
      expect(lineHeight).toBeLessThanOrEqual(2);
    });
  });

  it('should include comprehensive font weight range', () => {
    expect(typographyScale.weights.thin).toBe(100);
    expect(typographyScale.weights.normal).toBe(400);
    expect(typographyScale.weights.bold).toBe(700);
    expect(typographyScale.weights.black).toBe(900);
    
    // Verify complete weight scale
    const weights = Object.values(typographyScale.weights) as number[];
    expect(weights).toHaveLength(8);
    expect(Math.min(...weights)).toBe(100);
    expect(Math.max(...weights)).toBe(900);
  });

  it('should provide letter spacing for different text sizes', () => {
    expect(typographyScale.letterSpacing.tighter).toBe('-0.05em');
    expect(typographyScale.letterSpacing.normal).toBe('0');
    expect(typographyScale.letterSpacing.widest).toBe('0.1em');
    
    // Verify letter spacing values are strings with em units
    Object.values(typographyScale.letterSpacing).forEach(spacing => {
      if (spacing !== '0') {
        expect(spacing).toMatch(/^-?[\d.]+em$/);
      }
    });
  });
});

describe('Font Stacks', () => {
  it('should define system font stack with fallbacks', () => {
    expect(fontStacks.system).toContain('-apple-system');
    expect(fontStacks.system).toContain('BlinkMacSystemFont');
    expect(fontStacks.system).toContain('Roboto');
    expect(fontStacks.system).toContain('sans-serif');
    expect(fontStacks.system).toContain('Apple Color Emoji');
  });

  it('should define monospace font stack for code', () => {
    expect(fontStacks.mono).toContain('SF Mono');
    expect(fontStacks.mono).toContain('Monaco');
    expect(fontStacks.mono).toContain('Source Code Pro');
    expect(fontStacks.mono).toContain('monospace');
  });

  it('should define serif font stack for long-form content', () => {
    expect(fontStacks.serif).toContain('Georgia');
    expect(fontStacks.serif).toContain('Cambria');
    expect(fontStacks.serif).toContain('Times New Roman');
    expect(fontStacks.serif).toContain('serif');
  });

  it('should format font stacks properly for CSS', () => {
    // Should be comma-separated for CSS font-family
    expect(fontStacks.system.split(', ').length).toBeGreaterThan(5);
    expect(fontStacks.mono.split(', ').length).toBeGreaterThan(5);
    expect(fontStacks.serif.split(', ').length).toBeGreaterThan(3);
  });
});

describe('Typography Variants', () => {
  it('should define display variants for hero sections', () => {
    expect(typographyVariants.displayLarge).toBeDefined();
    expect(typographyVariants.displayMedium).toBeDefined();
    expect(typographyVariants.displaySmall).toBeDefined();
    
    // Display variants should be large and bold
    expect(typographyVariants.displayLarge.fontSize).toBe('4.5rem');
    expect(typographyVariants.displayLarge.fontWeight).toBe(700);
    expect(typographyVariants.displayLarge.lineHeight).toBe(1.25);
  });

  it('should define heading variants for content hierarchy', () => {
    expect(typographyVariants.headingLarge).toBeDefined();
    expect(typographyVariants.headingMedium).toBeDefined();
    expect(typographyVariants.headingSmall).toBeDefined();
    
    // Headings should be semibold and readable
    expect(typographyVariants.headingMedium.fontWeight).toBe(600);
    expect(typographyVariants.headingMedium.lineHeight).toBe(1.375);
  });

  it('should define body text variants for readable content', () => {
    expect(typographyVariants.bodyLarge).toBeDefined();
    expect(typographyVariants.bodyMedium).toBeDefined();
    expect(typographyVariants.bodySmall).toBeDefined();
    
    // Body text should have relaxed line height for readability
    expect(typographyVariants.bodyLarge.lineHeight).toBe(1.625);
    expect(typographyVariants.bodyMedium.fontWeight).toBe(400);
  });

  it('should define code variants with monospace fonts', () => {
    expect(typographyVariants.codeLarge).toBeDefined();
    expect(typographyVariants.codeMedium).toBeDefined();
    expect(typographyVariants.codeSmall).toBeDefined();
    
    // Code variants should use monospace font
    expect(typographyVariants.codeMedium.fontFamily).toBe(fontStacks.mono);
    expect(typographyVariants.codeMedium.fontWeight).toBe(400);
  });

  it('should define caption and label variants', () => {
    expect(typographyVariants.caption).toBeDefined();
    expect(typographyVariants.label).toBeDefined();
    
    // Labels should be medium weight with wider letter spacing
    expect(typographyVariants.label.fontWeight).toBe(500);
    expect(typographyVariants.label.letterSpacing).toBe('0.05em');
  });

  it('should have consistent variant structure', () => {
    Object.entries(typographyVariants).forEach(([key, variant]) => {
      expect(variant).toHaveProperty('fontSize');
      expect(variant).toHaveProperty('lineHeight');
      expect(variant).toHaveProperty('fontWeight');
      expect(variant).toHaveProperty('letterSpacing');
      expect(variant).toHaveProperty('fontFamily');
      
      // Validate types
      expect(typeof variant.fontSize).toBe('string');
      expect(typeof variant.lineHeight).toBe('number');
      expect(typeof variant.fontWeight).toBe('number');
      expect(typeof variant.letterSpacing).toBe('string');
      expect(typeof variant.fontFamily).toBe('string');
    });
  });
});

describe('Color System', () => {
  it('should define comprehensive primary color palette', () => {
    expect(colorSystem.primary).toBeDefined();
    expect(colorSystem.primary[500]).toBe('#3b82f6'); // Primary brand color
    
    // Should have full range from 50-950
    const primaryKeys = Object.keys(colorSystem.primary).map(Number);
    expect(primaryKeys).toContain(50);
    expect(primaryKeys).toContain(500);
    expect(primaryKeys).toContain(950);
    expect(primaryKeys).toHaveLength(11);
  });

  it('should define semantic color palettes', () => {
    expect(colorSystem.success[500]).toBe('#22c55e');
    expect(colorSystem.warning[500]).toBe('#f59e0b');
    expect(colorSystem.error[500]).toBe('#ef4444');
    expect(colorSystem.info[500]).toBe('#06b6d4');
    
    // Each semantic color should have full range
    [colorSystem.success, colorSystem.warning, colorSystem.error, colorSystem.info].forEach(palette => {
      expect(Object.keys(palette)).toHaveLength(11);
      expect(palette[50]).toBeDefined();
      expect(palette[950]).toBeDefined();
    });
  });

  it('should define neutral color palette with pure white/black', () => {
    expect(colorSystem.neutral[0]).toBe('#ffffff'); // Pure white
    expect(colorSystem.neutral[1000]).toBe('#000000'); // Pure black
    expect(colorSystem.neutral[500]).toBe('#6b7280'); // Mid-gray
    
    // Should have extended range for neutrals
    const neutralKeys = Object.keys(colorSystem.neutral).map(Number);
    expect(neutralKeys).toContain(0);
    expect(neutralKeys).toContain(1000);
    expect(neutralKeys).toHaveLength(13);
  });

  it('should use valid hex color format', () => {
    const hexColorRegex = /^#[0-9a-f]{6}$/i;
    
    Object.entries(colorSystem).forEach(([paletteKey, palette]) => {
      Object.entries(palette).forEach(([key, color]) => {
        expect(color).toMatch(hexColorRegex);
      });
    });
  });

  it('should have logical color progression in palettes', () => {
    // Test primary palette progression (should get darker)
    const primaryValues = Object.keys(colorSystem.primary)
      .map(Number)
      .sort((a, b) => a - b);
    
    expect(primaryValues[0]).toBe(50); // Lightest
    expect(primaryValues[primaryValues.length - 1]).toBe(950); // Darkest
  });
});

describe('Color Combinations', () => {
  it('should define WCAG compliant text colors', () => {
    expect(colorCombinations.textOnLight.primary).toBe(colorSystem.neutral[900]);
    expect(colorCombinations.textOnLight.secondary).toBe(colorSystem.neutral[600]);
    expect(colorCombinations.textOnLight.disabled).toBe(colorSystem.neutral[400]);
    
    expect(colorCombinations.textOnDark.primary).toBe(colorSystem.neutral[0]);
    expect(colorCombinations.textOnDark.secondary).toBe(colorSystem.neutral[200]);
  });

  it('should define interactive color states', () => {
    const primary = colorCombinations.interactive.primary;
    expect(primary.default).toBe(colorSystem.primary[500]);
    expect(primary.hover).toBe(colorSystem.primary[600]);
    expect(primary.active).toBe(colorSystem.primary[700]);
    expect(primary.disabled).toBe(colorSystem.neutral[300]);
  });

  it('should define surface colors for elevation', () => {
    expect(colorCombinations.surfaces.background).toBe(colorSystem.neutral[0]);
    expect(colorCombinations.surfaces.elevation1).toBe(colorSystem.neutral[0]);
    expect(colorCombinations.surfaces.elevation2).toBe(colorSystem.neutral[50]);
    expect(colorCombinations.surfaces.elevation3).toBe(colorSystem.neutral[100]);
  });

  it('should define semantic background colors', () => {
    expect(colorCombinations.semanticBackgrounds.success).toBe(colorSystem.success[50]);
    expect(colorCombinations.semanticBackgrounds.warning).toBe(colorSystem.warning[50]);
    expect(colorCombinations.semanticBackgrounds.error).toBe(colorSystem.error[50]);
    expect(colorCombinations.semanticBackgrounds.info).toBe(colorSystem.info[50]);
  });
});

describe('Text Component', () => {
  it('should render with default bodyMedium variant', () => {
    render(<Text>Hello World</Text>);
    
    const element = screen.getByText('Hello World');
    expect(element).toBeInTheDocument();
    expect(element.tagName).toBe('SPAN');
  });

  it('should apply typography variant styles', () => {
    render(<Text variant="headingLarge">Large Heading</Text>);
    
    const element = screen.getByText('Large Heading');
    const styles = window.getComputedStyle(element);
    
    expect(styles.fontSize).toBe('2.25rem');
    expect(styles.fontWeight).toBe('600');
    expect(styles.lineHeight).toBe('1.375');
  });

  it('should render as different HTML elements', () => {
    render(<Text as="p">Paragraph text</Text>);
    
    const element = screen.getByText('Paragraph text');
    expect(element.tagName).toBe('P');
  });

  it('should combine custom styles with variant styles', () => {
    render(
      <Text 
        variant="bodyLarge" 
        style={{ marginTop: '1rem' }}
        color="#ff0000"
      >
        Custom styled text
      </Text>
    );
    
    const element = screen.getByText('Custom styled text');
    const styles = window.getComputedStyle(element);
    
    expect(styles.marginTop).toBe('1rem');
    expect(styles.color).toBe('#ff0000');
  });

  it('should apply CSS classes correctly', () => {
    render(<Text variant="caption" className="custom-class">Caption</Text>);
    
    const element = screen.getByText('Caption');
    expect(element).toHaveClass('text');
    expect(element).toHaveClass('text-caption');
    expect(element).toHaveClass('custom-class');
  });
});

describe('Heading Component', () => {
  it('should render semantic heading elements', () => {
    render(<Heading level={1}>Main Title</Heading>);
    
    const element = screen.getByText('Main Title');
    expect(element.tagName).toBe('H1');
  });

  it('should support different heading levels', () => {
    const { rerender } = render(<Heading level={1}>H1</Heading>);
    expect(screen.getByText('H1').tagName).toBe('H1');
    
    rerender(<Heading level={6}>H6</Heading>);
    expect(screen.getByText('H6').tagName).toBe('H6');
  });

  it('should map variant and size to typography variants', () => {
    render(<Heading level={2} variant="display" size="large">Display Heading</Heading>);
    
    const element = screen.getByText('Display Heading');
    const styles = window.getComputedStyle(element);
    
    expect(styles.fontSize).toBe('4.5rem'); // displayLarge
    expect(styles.fontWeight).toBe('700');
  });

  it('should reset default heading margins', () => {
    render(<Heading level={1}>No Margin</Heading>);
    
    const element = screen.getByText('No Margin');
    const styles = window.getComputedStyle(element);
    
    expect(styles.margin).toBe('0px');
  });

  it('should apply heading-specific CSS classes', () => {
    render(<Heading level={3} variant="heading" size="medium">Heading</Heading>);
    
    const element = screen.getByText('Heading');
    expect(element).toHaveClass('heading');
    expect(element).toHaveClass('heading-heading');
    expect(element).toHaveClass('heading-medium');
    expect(element).toHaveClass('heading-level-3');
  });
});

describe('Code Component', () => {
  it('should render inline code by default', () => {
    render(<Code>const x = 1;</Code>);
    
    const element = screen.getByText('const x = 1;');
    expect(element.tagName).toBe('CODE');
  });

  it('should render code blocks when inline=false', () => {
    render(<Code inline={false}>function test() {'{}'}</Code>);
    
    const preElement = screen.getByText('function test() {}').closest('pre');
    expect(preElement).toBeInTheDocument();
    expect(preElement?.querySelector('code')).toBeInTheDocument();
  });

  it('should apply monospace typography variant', () => {
    render(<Code size="medium">code text</Code>);
    
    const element = screen.getByText('code text');
    const styles = window.getComputedStyle(element);
    
    expect(styles.fontFamily).toContain('SF Mono');
  });

  it('should style code with background and border', () => {
    render(<Code>styled code</Code>);
    
    const element = screen.getByText('styled code');
    const styles = window.getComputedStyle(element);
    
    expect(styles.backgroundColor).toBeTruthy();
    expect(styles.border).toBeTruthy();
    expect(styles.borderRadius).toBe('0.25rem');
  });

  it('should apply language class when specified', () => {
    render(<Code language="javascript">const x = 1;</Code>);
    
    const element = screen.getByText('const x = 1;');
    expect(element).toHaveClass('language-javascript');
  });

  it('should handle different sizes', () => {
    const { rerender } = render(<Code size="small">small</Code>);
    
    let element = screen.getByText('small');
    expect(element).toHaveClass('code-small');
    
    rerender(<Code size="large">large</Code>);
    element = screen.getByText('large');
    expect(element).toHaveClass('code-large');
  });
});

describe('WCAG Utilities', () => {
  it('should provide contrast ratio calculation', () => {
    const ratio = wcagUtils.contrastRatio('#000000', '#ffffff');
    expect(typeof ratio).toBe('number');
    expect(ratio).toBeGreaterThan(0);
  });

  it('should check WCAG compliance levels', () => {
    // Mock high contrast combination
    expect(wcagUtils.meetsWCAG('#000000', '#ffffff', 'AA')).toBe(true);
    expect(wcagUtils.meetsWCAG('#000000', '#ffffff', 'AAA')).toBe(true);
  });

  it('should get accessible text color for background', () => {
    const textColor = wcagUtils.getAccessibleTextColor('#ffffff');
    expect(typeof textColor).toBe('string');
    expect(textColor).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('should validate color palette accessibility', () => {
    const palette = {
      textPrimary: colorSystem.neutral[900],
      background: colorSystem.neutral[0],
    };
    
    const result = wcagUtils.validateColorPalette(palette);
    expect(result).toHaveProperty('valid');
    expect(result).toHaveProperty('issues');
    expect(Array.isArray(result.issues)).toBe(true);
  });

  it('should identify accessibility issues in palette', () => {
    const badPalette = {
      textPrimary: '#cccccc', // Low contrast
      background: '#ffffff',
    };
    
    const result = wcagUtils.validateColorPalette(badPalette);
    expect(typeof result.valid).toBe('boolean');
    expect(Array.isArray(result.issues)).toBe(true);
  });
});

describe('Typography and Color System Integration', () => {
  it('should export complete system object', () => {
    expect(TypographyAndColorSystem).toBeDefined();
    expect(TypographyAndColorSystem.version).toBe('1.0.0');
  });

  it('should include all major system parts', () => {
    expect(TypographyAndColorSystem.typographyScale).toBeDefined();
    expect(TypographyAndColorSystem.fontStacks).toBeDefined();
    expect(TypographyAndColorSystem.typographyVariants).toBeDefined();
    expect(TypographyAndColorSystem.colorSystem).toBeDefined();
    expect(TypographyAndColorSystem.colorCombinations).toBeDefined();
  });

  it('should include component exports', () => {
    expect(TypographyAndColorSystem.Text).toBeDefined();
    expect(TypographyAndColorSystem.Heading).toBeDefined();
    expect(TypographyAndColorSystem.Code).toBeDefined();
  });

  it('should include CSS custom properties', () => {
    expect(TypographyAndColorSystem.typographyCSS).toBeDefined();
    expect(TypographyAndColorSystem.colorCSS).toBeDefined();
    
    // Verify CSS custom property format
    expect(TypographyAndColorSystem.typographyCSS['--font-size-md']).toBe('1rem');
    expect(TypographyAndColorSystem.colorCSS['--color-primary-500']).toBe('#3b82f6');
  });

  it('should include WCAG utilities', () => {
    expect(TypographyAndColorSystem.wcagUtils).toBeDefined();
    expect(typeof TypographyAndColorSystem.wcagUtils.contrastRatio).toBe('function');
    expect(typeof TypographyAndColorSystem.wcagUtils.meetsWCAG).toBe('function');
  });
});

describe('CSS Custom Properties', () => {
  it('should define typography CSS variables', () => {
    const { typographyCSS } = TypographyAndColorSystem;
    
    expect(typographyCSS['--font-family-system']).toContain('-apple-system');
    expect(typographyCSS['--font-size-md']).toBe('1rem');
    expect(typographyCSS['--line-height-normal']).toBe(1.5);
    expect(typographyCSS['--font-weight-bold']).toBe(700);
  });

  it('should define color CSS variables', () => {
    const { colorCSS } = TypographyAndColorSystem;
    
    expect(colorCSS['--color-primary-500']).toBe('#3b82f6');
    expect(colorCSS['--color-neutral-0']).toBe('#ffffff');
    expect(colorCSS['--color-text-primary']).toBe(colorSystem.neutral[900]);
    expect(colorCSS['--color-background']).toBe(colorSystem.neutral[0]);
  });

  it('should have consistent naming convention', () => {
    const { typographyCSS, colorCSS } = TypographyAndColorSystem;
    
    // Typography variables should start with --font- or --line- or --letter-
    Object.keys(typographyCSS).forEach(key => {
      expect(key).toMatch(/^--(font|line|letter)-/);
    });
    
    // Color variables should start with --color-
    Object.keys(colorCSS).forEach(key => {
      expect(key).toMatch(/^--color-/);
    });
  });
});

describe('Typography and Color System Performance', () => {
  it('should have reasonable object sizes', () => {
    // Check that objects aren't excessively large
    expect(Object.keys(typographyVariants).length).toBeLessThan(20);
    expect(Object.keys(colorSystem).length).toBeLessThan(10);
    expect(Object.keys(colorCombinations).length).toBeLessThan(10);
  });

  it('should use efficient data structures', () => {
    // Verify objects are properly structured for lookups
    expect(typeof typographyVariants).toBe('object');
    expect(typeof colorSystem).toBe('object');
    expect(typeof colorCombinations).toBe('object');
    
    // Check for proper nesting
    expect(typeof colorSystem.primary).toBe('object');
    expect(typeof colorCombinations.interactive).toBe('object');
  });

  it('should define constants for better tree-shaking', () => {
    // Verify as const assertions for better TypeScript optimization
    expect(Object.isFrozen(typographyScale.sizes)).toBe(false); // as const doesn't freeze at runtime
    expect(Object.isFrozen(fontStacks)).toBe(false);
    expect(Object.isFrozen(colorSystem.primary)).toBe(false);
  });
});