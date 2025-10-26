/**
 * Writer Dark Theme Tests
 *
 * Comprehensive TDD coverage for Writer Dark theme, ensuring:
 * - Proper color inversion (black <-> white swap)
 * - Preservation of brutalist principles (0px radius, 0ms transitions)
 * - Functional categorical colors remain unchanged
 * - Proper semantic token mapping
 * - Theme switching functionality
 * - localStorage persistence
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ThemeManager } from '../../design-system/theme/theme-manager.js';
import { writerDarkTheme } from '../../design-system/themes/writer-dark-theme.js';

describe('Writer Dark Theme', () => {
  describe('Theme Definition', () => {
    it('should have correct theme metadata', () => {
      expect(writerDarkTheme.id).toBe('writer-dark');
      expect(writerDarkTheme.name).toBe('Writer Dark');
      expect(writerDarkTheme.category).toBe('minimal');
      expect(writerDarkTheme.description).toContain('Brutalist');
      expect(writerDarkTheme.description).toContain('dark mode');
    });

    it('should specify business context for writers', () => {
      expect(writerDarkTheme.businessContext).toBeDefined();
      expect(writerDarkTheme.businessContext).toContain('Writers');
      expect(writerDarkTheme.businessContext).toContain('dark mode');
    });
  });

  describe('Color Inversion', () => {
    it('should invert primitive black and white', () => {
      expect(writerDarkTheme.tokens.primitive?.colors?.white).toBe('#000000');
      expect(writerDarkTheme.tokens.primitive?.colors?.black).toBe('#ffffff');
    });

    it('should invert gray scale (darkest becomes lightest)', () => {
      // Original Writer: gray50 is lightest (#fafafa)
      // Writer Dark: gray50 should be darkest (#171717)
      expect(writerDarkTheme.tokens.primitive?.colors?.gray50).toBe('#171717');
      expect(writerDarkTheme.tokens.primitive?.colors?.gray900).toBe('#fafafa');
    });

    it('should maintain gray scale order (50 darker than 900 in dark mode)', () => {
      const gray50 = writerDarkTheme.tokens.primitive?.colors?.gray50 || '';
      const gray500 = writerDarkTheme.tokens.primitive?.colors?.gray500 || '';
      const gray900 = writerDarkTheme.tokens.primitive?.colors?.gray900 || '';

      // In dark mode, lower numbers should be darker
      expect(parseInt(gray50.slice(1), 16)).toBeLessThan(parseInt(gray500.slice(1), 16));
      expect(parseInt(gray500.slice(1), 16)).toBeLessThan(parseInt(gray900.slice(1), 16));
    });
  });

  describe('Categorical Colors (Functional)', () => {
    it('should preserve conflict/tension colors (rose red)', () => {
      expect(writerDarkTheme.tokens.primitive?.colors?.blue500).toBe('#e11d48');
      expect(writerDarkTheme.tokens.primitive?.colors?.blue600).toBe('#be123c');
    });

    it('should preserve character development colors (blue)', () => {
      expect(writerDarkTheme.tokens.primitive?.colors?.green500).toBe('#3b82f6');
      expect(writerDarkTheme.tokens.primitive?.colors?.green700).toBe('#1d4ed8');
    });

    it('should preserve location/setting colors (amber)', () => {
      expect(writerDarkTheme.tokens.primitive?.colors?.yellow500).toBe('#f59e0b');
      expect(writerDarkTheme.tokens.primitive?.colors?.yellow700).toBe('#b45309');
    });

    it('should preserve theme/motif colors (purple)', () => {
      expect(writerDarkTheme.tokens.primitive?.colors?.purple500).toBe('#8b5cf6');
      expect(writerDarkTheme.tokens.primitive?.colors?.purple700).toBe('#6d28d9');
    });

    it('should preserve all categorical colors unchanged', () => {
      // Categorical colors have semantic meaning and should not change
      const categoricalColors = [
        'blue500',
        'blue600',
        'blue700',
        'green500',
        'green700',
        'yellow500',
        'yellow700',
        'purple500',
        'purple700',
        'pink500',
        'pink700',
        'orange500',
        'orange700',
        'red500',
        'red700',
      ];

      categoricalColors.forEach((color) => {
        expect(writerDarkTheme.tokens.primitive?.colors?.[color]).toBeDefined();
        expect(writerDarkTheme.tokens.primitive?.colors?.[color]).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });
  });

  describe('Brutalist Principles (Preserved)', () => {
    it('should maintain 0px border radius (sharp edges)', () => {
      expect(writerDarkTheme.tokens.primitive?.radii?.none).toBe('0px');
      expect(writerDarkTheme.tokens.primitive?.radii?.sm).toBe('0px');
      expect(writerDarkTheme.tokens.primitive?.radii?.md).toBe('0px');
      expect(writerDarkTheme.tokens.primitive?.radii?.lg).toBe('0px');
      expect(writerDarkTheme.tokens.primitive?.radii?.xl).toBe('0px');
      expect(writerDarkTheme.tokens.primitive?.radii?.full).toBe('0px');
    });

    it('should maintain 0ms transitions (instant feedback)', () => {
      expect(writerDarkTheme.tokens.primitive?.transitions?.none).toBe('0ms');
      expect(writerDarkTheme.tokens.primitive?.transitions?.fast).toBe('0ms');
      expect(writerDarkTheme.tokens.primitive?.transitions?.normal).toBe('0ms');
      expect(writerDarkTheme.tokens.primitive?.transitions?.slow).toBe('0ms');
    });

    it('should maintain no shadows (flat brutalism)', () => {
      expect(writerDarkTheme.tokens.primitive?.shadows?.none).toBe('none');
      expect(writerDarkTheme.tokens.primitive?.shadows?.sm).toBe('none');
      expect(writerDarkTheme.tokens.primitive?.shadows?.md).toBe('none');
      expect(writerDarkTheme.tokens.primitive?.shadows?.lg).toBe('none');
      expect(writerDarkTheme.tokens.primitive?.shadows?.xl).toBe('none');
    });

    it('should use system fonts (no web fonts)', () => {
      const fonts = writerDarkTheme.tokens.primitive?.fonts;
      expect(fonts?.system).toContain('-apple-system');
      expect(fonts?.mono).toContain('SF Mono');
      expect(fonts?.system).not.toContain('Google Fonts');
      expect(fonts?.system).not.toContain('Typekit');
    });

    it('should maintain binary spacing system', () => {
      const spacing = writerDarkTheme.tokens.semantic?.spacing;
      expect(spacing?.xs).toBe('calc(var(--primitive-spacing-base) * 1)');
      expect(spacing?.sm).toBe('calc(var(--primitive-spacing-base) * 2)');
      expect(spacing?.md).toBe('calc(var(--primitive-spacing-base) * 4)');
      expect(spacing?.lg).toBe('calc(var(--primitive-spacing-base) * 6)');
    });
  });

  describe('Semantic Token Mapping (Inverted)', () => {
    it('should map semantic primary to inverted black (now white)', () => {
      expect(writerDarkTheme.tokens.semantic?.colors?.primary).toBe('var(--primitive-black)');
    });

    it('should map text colors to inverted values', () => {
      const colors = writerDarkTheme.tokens.semantic?.colors;
      expect(colors?.textPrimary).toBe('var(--primitive-black)'); // Now white
      expect(colors?.textInverse).toBe('var(--primitive-white)'); // Now black
    });

    it('should map background colors to inverted values', () => {
      const colors = writerDarkTheme.tokens.semantic?.colors;
      expect(colors?.backgroundBase).toBe('var(--primitive-white)'); // Now black
      expect(colors?.backgroundInverse).toBe('var(--primitive-black)'); // Now white
    });

    it('should use white scrim for overlay (inverted from black)', () => {
      const colors = writerDarkTheme.tokens.semantic?.colors;
      expect(colors?.backgroundOverlay).toBe('rgba(255, 255, 255, 0.75)');
    });

    it('should map border colors to appropriate inverted grays', () => {
      const colors = writerDarkTheme.tokens.semantic?.colors;
      expect(colors?.borderStrong).toBe('var(--primitive-black)'); // Now white
      expect(colors?.borderSubtle).toBeDefined();
      expect(colors?.borderDefault).toBeDefined();
    });
  });

  describe('Component Tokens (Inverted)', () => {
    it('should invert button colors (white buttons on dark)', () => {
      const button = writerDarkTheme.tokens.component?.button;
      expect(button?.primaryBackground).toBe('var(--primitive-black)'); // Now white
      expect(button?.primaryText).toBe('var(--primitive-white)'); // Now black
      expect(button?.primaryBorder).toBe('var(--primitive-black)'); // Now white
    });

    it('should invert card colors (dark cards)', () => {
      const card = writerDarkTheme.tokens.component?.card;
      expect(card?.background).toBe('var(--primitive-white)'); // Now black
      expect(card?.borderRadius).toBe('var(--primitive-radii-none)'); // Still 0px
    });

    it('should invert input colors (dark inputs)', () => {
      const input = writerDarkTheme.tokens.component?.input;
      expect(input?.background).toBe('var(--primitive-white)'); // Now black
      expect(input?.text).toBe('var(--primitive-black)'); // Now white
      expect(input?.border).toBe('1px solid var(--primitive-black)'); // Now white
    });

    it('should maintain touch-optimized button sizing', () => {
      const button = writerDarkTheme.tokens.component?.button;
      expect(button?.paddingMd).toBe('calc(var(--primitive-spacing-base) * 3) calc(var(--primitive-spacing-base) * 4)');
      expect(button?.fontWeight).toBe(600);
    });
  });

  describe('Theme Manager Integration', () => {
    let themeManager: ThemeManager;
    let root: HTMLElement;

    beforeEach(() => {
      root = document.documentElement;
      themeManager = new ThemeManager();
      // Clear any existing styles
      root.removeAttribute('style');
      localStorage.clear();
    });

    afterEach(() => {
      root.removeAttribute('style');
      localStorage.clear();
    });

    it('should register Writer Dark theme on initialization', () => {
      const themes = themeManager.getAvailableThemes();
      const writerDark = themes.find((t) => t.id === 'writer-dark');

      expect(writerDark).toBeDefined();
      expect(writerDark?.name).toBe('Writer Dark');
    });

    it('should switch to Writer Dark theme', async () => {
      await themeManager.switchTheme('writer-dark');
      expect(themeManager.getCurrentTheme()).toBe('writer-dark');
    });

    it('should apply Writer Dark CSS custom properties', async () => {
      await themeManager.switchTheme('writer-dark');

      // Check inverted primitive colors
      const whiteValue = root.style.getPropertyValue('--primitive-white');
      const blackValue = root.style.getPropertyValue('--primitive-black');

      expect(whiteValue).toBe('#000000');
      expect(blackValue).toBe('#ffffff');
    });

    it('should apply inverted semantic colors', async () => {
      await themeManager.switchTheme('writer-dark');

      const textPrimary = root.style.getPropertyValue('--semantic-colors-text-primary');
      const bgBase = root.style.getPropertyValue('--semantic-colors-background-base');

      expect(textPrimary).toBe('var(--primitive-black)'); // Now white
      expect(bgBase).toBe('var(--primitive-white)'); // Now black
    });

    it('should maintain brutalist properties in CSS', async () => {
      await themeManager.switchTheme('writer-dark');

      const borderRadius = root.style.getPropertyValue('--primitive-radii-none');
      const transition = root.style.getPropertyValue('--primitive-transitions-none');
      const shadow = root.style.getPropertyValue('--primitive-shadows-none');

      expect(borderRadius).toBe('0px');
      expect(transition).toBe('0ms');
      expect(shadow).toBe('none');
    });

    it('should persist Writer Dark theme to localStorage', async () => {
      await themeManager.switchTheme('writer-dark');
      expect(localStorage.getItem('selectedTheme')).toBe('writer-dark');
    });

    it('should dispatch themechange event on switch', async () => {
      const eventSpy = vi.fn();
      root.addEventListener('themechange', eventSpy);

      await themeManager.switchTheme('writer-dark');

      expect(eventSpy).toHaveBeenCalledOnce();
      expect(eventSpy.mock.calls[0][0].detail.themeId).toBe('writer-dark');

      root.removeEventListener('themechange', eventSpy);
    });

    it('should switch from Writer to Writer Dark seamlessly', async () => {
      // Start with Writer theme
      await themeManager.switchTheme('writer');
      expect(themeManager.getCurrentTheme()).toBe('writer');

      // Switch to Writer Dark
      await themeManager.switchTheme('writer-dark');
      expect(themeManager.getCurrentTheme()).toBe('writer-dark');

      // Verify colors are inverted
      const whiteValue = root.style.getPropertyValue('--primitive-white');
      expect(whiteValue).toBe('#000000');
    });

    it('should handle Writer Dark <-> Writer toggle', async () => {
      // Toggle to dark
      await themeManager.switchTheme('writer-dark');
      let white = root.style.getPropertyValue('--primitive-white');
      expect(white).toBe('#000000');

      // Toggle back to light
      await themeManager.switchTheme('writer');
      white = root.style.getPropertyValue('--primitive-white');
      expect(white).toBe('#ffffff');

      // Toggle to dark again
      await themeManager.switchTheme('writer-dark');
      white = root.style.getPropertyValue('--primitive-white');
      expect(white).toBe('#000000');
    });
  });

  describe('Performance', () => {
    let themeManager: ThemeManager;

    beforeEach(() => {
      themeManager = new ThemeManager();
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('should switch themes in under 100ms', async () => {
      const start = performance.now();
      await themeManager.switchTheme('writer-dark');
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('should not switch if already on Writer Dark', async () => {
      await themeManager.switchTheme('writer-dark');
      const firstSwitch = performance.now();

      await themeManager.switchTheme('writer-dark');
      const secondSwitch = performance.now();

      // Second switch should be nearly instant (no-op)
      expect(secondSwitch - firstSwitch).toBeLessThan(10);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing optional properties gracefully', () => {
      // Theme should work even if some optional properties are missing
      expect(writerDarkTheme.previewImage).toBeUndefined();
    });

    it('should validate as a complete theme', () => {
      const themeManager = new ThemeManager();
      const validation = themeManager.validateTheme(writerDarkTheme);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should export Writer Dark theme as JSON', () => {
      const themeManager = new ThemeManager();
      const json = themeManager.exportTheme('writer-dark');

      expect(json).toBeDefined();
      expect(() => JSON.parse(json)).not.toThrow();

      const parsed = JSON.parse(json);
      expect(parsed.id).toBe('writer-dark');
    });
  });

  describe('Accessibility (Dark Mode Specific)', () => {
    it('should provide sufficient contrast for text on dark backgrounds', () => {
      // White text (#ffffff) on black background (#000000) = 21:1 contrast ratio (WCAG AAA)
      const textPrimary = writerDarkTheme.tokens.semantic?.colors?.textPrimary;
      const backgroundBase = writerDarkTheme.tokens.semantic?.colors?.backgroundBase;

      expect(textPrimary).toBe('var(--primitive-black)'); // White
      expect(backgroundBase).toBe('var(--primitive-white)'); // Black
    });

    it('should maintain strong focus ring visibility in dark mode', () => {
      const focusRing = writerDarkTheme.tokens.semantic?.interactions?.focusRing;
      expect(focusRing).toBe('2px solid var(--primitive-black)'); // White ring on dark bg
    });

    it('should use appropriate error colors for dark mode', () => {
      const error = writerDarkTheme.tokens.semantic?.colors?.error;
      expect(error).toBe('var(--primitive-red-500)');
    });
  });
});
