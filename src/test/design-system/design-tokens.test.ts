/**
 * Design Token System Tests
 * 
 * TDD tests for the core design token architecture.
 * Ensures bulletproof token system with full theme support.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { designSystemTestUtils, setupDesignSystemTests } from './test-utils.js';
import { defaultTokens } from '../../design-system/tokens/design-tokens.js';
import { generateTokenCSS, injectTokenCSS, tokenCSS } from '../../design-system/tokens/token-css.js';

setupDesignSystemTests();

describe('Design Token System', () => {
  describe('Token Structure', () => {
    it('should have complete three-tier token architecture', () => {
      expect(defaultTokens).toBeDefined();
      expect(defaultTokens.primitive).toBeDefined();
      expect(defaultTokens.semantic).toBeDefined();
      expect(defaultTokens.component).toBeDefined();
    });
    
    it('should have all required primitive tokens', () => {
      const { primitive } = defaultTokens;
      
      // Colors
      expect(primitive.colors).toBeDefined();
      expect(primitive.colors.blue500).toBeTruthy();
      expect(primitive.colors.gray900).toBeTruthy();
      expect(primitive.colors.white).toBeTruthy();
      
      // Fonts
      expect(primitive.fonts).toBeDefined();
      expect(primitive.fonts.system).toBeTruthy();
      expect(primitive.fonts.serif).toBeTruthy();
      expect(primitive.fonts.mono).toBeTruthy();
      
      // Spacing
      expect(primitive.spacing).toBeDefined();
      expect(primitive.spacing.base).toBeTruthy();
      expect(primitive.spacing.scale).toBeTruthy();
      
      // Other primitives
      expect(primitive.radii).toBeDefined();
      expect(primitive.shadows).toBeDefined();
      expect(primitive.transitions).toBeDefined();
    });
    
    it('should have all required semantic tokens', () => {
      const { semantic } = defaultTokens;
      
      // Semantic colors
      expect(semantic.colors.primary).toBeTruthy();
      expect(semantic.colors.secondary).toBeTruthy();
      expect(semantic.colors.success).toBeTruthy();
      expect(semantic.colors.error).toBeTruthy();
      expect(semantic.colors.textPrimary).toBeTruthy();
      expect(semantic.colors.backgroundBase).toBeTruthy();
      
      // Typography
      expect(semantic.typography.fontPrimary).toBeTruthy();
      expect(semantic.typography.fontSizeMd).toBeTruthy();
      expect(semantic.typography.lineHeightNormal).toBeTruthy();
      
      // Spacing
      expect(semantic.spacing.sm).toBeTruthy();
      expect(semantic.spacing.md).toBeTruthy();
      expect(semantic.spacing.lg).toBeTruthy();
      
      // Interactions
      expect(semantic.interactions.borderRadius).toBeTruthy();
      expect(semantic.interactions.transition).toBeTruthy();
    });
    
    it('should have all required component tokens', () => {
      const { component } = defaultTokens;
      
      // Button tokens
      expect(component.button).toBeDefined();
      expect(component.button.primaryBackground).toBeTruthy();
      expect(component.button.primaryText).toBeTruthy();
      expect(component.button.paddingMd).toBeTruthy();
      
      // Card tokens
      expect(component.card).toBeDefined();
      expect(component.card.background).toBeTruthy();
      expect(component.card.borderRadius).toBeTruthy();
      
      // Input tokens
      expect(component.input).toBeDefined();
      expect(component.input.background).toBeTruthy();
      expect(component.input.border).toBeTruthy();
    });
  });
  
  describe('CSS Generation', () => {
    it('should generate valid CSS custom properties', () => {
      const css = generateTokenCSS(defaultTokens);
      
      expect(css).toContain(':root {');
      expect(css).toContain('}');
      
      // Primitive tokens
      expect(css).toContain('--primitive-color-blue500');
      expect(css).toContain('--primitive-font-sans-serif');
      expect(css).toContain('--primitive-spacing-base');
      
      // Semantic tokens  
      expect(css).toContain('--semantic-color-primary');
      expect(css).toContain('--semantic-typography-font-primary');
      expect(css).toContain('--semantic-spacing-md');
      
      // Component tokens
      expect(css).toContain('--component-button-primary-background');
      expect(css).toContain('--component-card-background');
      expect(css).toContain('--component-input-border');
    });
    
    it('should inject CSS into document head', () => {
      injectTokenCSS(defaultTokens);
      
      designSystemTestUtils.testCSSInjection();
      
      const styleElement = document.getElementById('design-tokens');
      expect(styleElement?.textContent).toContain('--semantic-color-primary');
    });
    
    it('should replace existing CSS when re-injected', () => {
      // First injection
      injectTokenCSS(defaultTokens);
      const firstElement = document.getElementById('design-tokens');
      expect(firstElement).toBeTruthy();
      
      // Second injection should replace
      injectTokenCSS(defaultTokens);
      const secondElement = document.getElementById('design-tokens');
      
      expect(secondElement).toBeTruthy();
      expect(document.querySelectorAll('#design-tokens')).toHaveLength(1);
    });
  });
  
  describe('Token CSS Helpers', () => {
    it('should provide all color tokens', () => {
      expect(tokenCSS.color.primary).toBe('var(--semantic-color-primary)');
      expect(tokenCSS.color.secondary).toBe('var(--semantic-color-secondary)');
      expect(tokenCSS.color.success).toBe('var(--semantic-color-success)');
      expect(tokenCSS.color.error).toBe('var(--semantic-color-error)');
      expect(tokenCSS.color.textPrimary).toBe('var(--semantic-color-text-primary)');
      expect(tokenCSS.color.backgroundBase).toBe('var(--semantic-color-background-base)');
    });
    
    it('should provide all typography tokens', () => {
      expect(tokenCSS.typography.fontPrimary).toBe('var(--semantic-typography-font-primary)');
      expect(tokenCSS.typography.fontSizeMd).toBe('var(--semantic-typography-font-size-md)');
      expect(tokenCSS.typography.lineHeightNormal).toBe('var(--semantic-typography-line-height-normal)');
      expect(tokenCSS.typography.fontWeightBold).toBe('var(--semantic-typography-font-weight-bold)');
    });
    
    it('should provide all spacing tokens', () => {
      expect(tokenCSS.spacing.xs).toBe('var(--semantic-spacing-xs)');
      expect(tokenCSS.spacing.sm).toBe('var(--semantic-spacing-sm)');
      expect(tokenCSS.spacing.md).toBe('var(--semantic-spacing-md)');
      expect(tokenCSS.spacing.lg).toBe('var(--semantic-spacing-lg)');
      expect(tokenCSS.spacing.xl).toBe('var(--semantic-spacing-xl)');
    });
    
    it('should provide component-specific tokens', () => {
      // Button tokens
      expect(tokenCSS.button.primaryBackground).toBe('var(--component-button-primary-background)');
      expect(tokenCSS.button.primaryText).toBe('var(--component-button-primary-text)');
      expect(tokenCSS.button.paddingMd).toBe('var(--component-button-padding-md)');
      
      // Card tokens
      expect(tokenCSS.card.background).toBe('var(--component-card-background)');
      expect(tokenCSS.card.borderRadius).toBe('var(--component-card-border-radius)');
      
      // Input tokens
      expect(tokenCSS.input.background).toBe('var(--component-input-background)');
      expect(tokenCSS.input.border).toBe('var(--component-input-border)');
    });
  });
  
  describe('Token Consistency', () => {
    it('should have consistent naming patterns', () => {
      const css = generateTokenCSS(defaultTokens);
      
      // All primitive tokens should start with --primitive-
      const primitiveTokens = css.match(/--primitive-[a-z-]+/g) || [];
      expect(primitiveTokens.length).toBeGreaterThan(0);
      primitiveTokens.forEach(token => {
        expect(token).toMatch(/^--primitive-[a-z-]+$/);
      });
      
      // All semantic tokens should start with --semantic-
      const semanticTokens = css.match(/--semantic-[a-z-]+/g) || [];
      expect(semanticTokens.length).toBeGreaterThan(0);
      semanticTokens.forEach(token => {
        expect(token).toMatch(/^--semantic-[a-z-]+$/);
      });
      
      // All component tokens should start with --component-
      const componentTokens = css.match(/--component-[a-z-]+/g) || [];
      expect(componentTokens.length).toBeGreaterThan(0);
      componentTokens.forEach(token => {
        expect(token).toMatch(/^--component-[a-z-]+$/);
      });
    });
    
    it('should have valid CSS values', () => {
      const css = generateTokenCSS(defaultTokens);
      const lines = css.split('\n').filter(line => line.includes(':'));
      
      lines.forEach(line => {
        if (line.trim().startsWith('--')) {
          // Should have property: value; format
          expect(line).toMatch(/--[a-z-]+:\s*[^;]+;/);
          
          // Should not have empty values
          const value = line.split(':')[1]?.replace(';', '').trim();
          expect(value).toBeTruthy();
          expect(value).not.toBe('');
        }
      });
    });
    
    it('should reference semantic tokens in component tokens', () => {
      const { component } = defaultTokens;
      
      // Button should reference semantic colors
      expect(component.button.primaryBackground).toContain('var(--semantic-color-primary)');
      expect(component.button.primaryText).toContain('var(--semantic-color-text-inverse)');
      
      // Card should reference semantic tokens
      expect(component.card.background).toContain('var(--semantic-color-background-elevated)');
      expect(component.card.border).toContain('var(--semantic-color-border-default)');
    });
  });
  
  describe('Type Safety', () => {
    it('should enforce TypeScript token interfaces', () => {
      // This test validates that TypeScript compilation catches token misuse
      // The fact that this file compiles means our interfaces are correct
      
      expect(defaultTokens).toBeDefined();
      expect(typeof defaultTokens.primitive.colors.blue500).toBe('string');
      expect(typeof defaultTokens.semantic.colors.primary).toBe('string');
      expect(typeof defaultTokens.component.button.primaryBackground).toBe('string');
    });
  });
  
  describe('Performance', () => {
    it('should generate CSS quickly', () => {
      const start = performance.now();
      const css = generateTokenCSS(defaultTokens);
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(50); // Should be very fast
      expect(css.length).toBeGreaterThan(100); // Should generate substantial CSS
    });
    
    it('should inject CSS quickly', () => {
      const start = performance.now();
      injectTokenCSS(defaultTokens);
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(25); // Should be very fast
    });
  });
});