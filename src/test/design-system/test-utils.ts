/**
 * Design System Test Utilities
 * 
 * TDD framework for bulletproof design system testing.
 * Tests token usage, theme switching, and component behavior.
 */

import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { themeManager } from '../../design-system/theme/theme-manager.js';
import { tokenCSS } from '../../design-system/tokens/token-css.js';

// Test utilities for design system
export class DesignSystemTestUtils {
  private originalTheme: string = 'default';
  private mockStyleElement: HTMLStyleElement | null = null;
  
  /**
   * Set up test environment for each test
   */
  setupTest(): void {
    // Store original theme
    this.originalTheme = themeManager.getCurrentTheme();
    
    // Mock CSS custom properties support
    Object.defineProperty(CSS, 'supports', {
      value: vi.fn(() => true),
      writable: true
    });
    
    // Mock document.head for style injection
    this.mockStyleElement = document.createElement('style');
    this.mockStyleElement.id = 'design-tokens';
    document.head.appendChild(this.mockStyleElement);
    
    // Initialize with default theme
    themeManager.switchTheme('default');
  }
  
  /**
   * Clean up after each test
   */
  cleanupTest(): void {
    // Restore original theme
    themeManager.switchTheme(this.originalTheme);
    
    // Remove mock style element
    if (this.mockStyleElement) {
      this.mockStyleElement.remove();
      this.mockStyleElement = null;
    }
    
    // Clear any localStorage
    localStorage.clear();
    
    // React Testing Library cleanup
    cleanup();
  }
  
  /**
   * Test theme switching performance
   */
  async testThemeSwitchPerformance(themeId: string, maxDuration: number = 100): Promise<number> {
    const start = performance.now();
    await themeManager.switchTheme(themeId);
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(maxDuration);
    return duration;
  }
  
  /**
   * Test all themes work with a component
   */
  async testComponentAcrossThemes(
    componentFactory: () => JSX.Element,
    themes: string[] = ['default', 'corporate', 'creative', 'minimal', 'accessible', 'dense']
  ): Promise<void> {
    for (const theme of themes) {
      await themeManager.switchTheme(theme);
      
      // Render component with current theme
      const { container, unmount } = render(componentFactory());
      
      // Verify component renders without errors
      expect(container.firstChild).toBeTruthy();
      
      // Verify no console errors
      const consoleError = vi.spyOn(console, 'error');
      expect(consoleError).not.toHaveBeenCalled();
      
      unmount();
    }
  }
  
  /**
   * Verify token usage in component styles
   */
  verifyTokenUsage(element: HTMLElement, expectedTokens: string[]): void {
    const computedStyle = window.getComputedStyle(element);
    
    expectedTokens.forEach(token => {
      const cssVarName = `--${token.replace(/\./g, '-')}`;
      const value = computedStyle.getPropertyValue(cssVarName);
      
      // Verify CSS custom property is defined
      expect(value).toBeTruthy();
      expect(value.trim()).not.toBe('');
    });
  }
  
  /**
   * Test CSS custom property injection
   */
  testCSSInjection(): void {
    const styleElement = document.getElementById('design-tokens');
    expect(styleElement).toBeTruthy();
    expect(styleElement?.tagName.toLowerCase()).toBe('style');
    
    const cssContent = styleElement?.textContent || '';
    
    // Verify primitive tokens are present
    expect(cssContent).toContain('--primitive-color-');
    expect(cssContent).toContain('--semantic-color-');
    expect(cssContent).toContain('--component-button-');
    
    // Verify CSS structure
    expect(cssContent).toContain(':root {');
    expect(cssContent).toContain('}');
  }
  
  /**
   * Test theme persistence
   */
  async testThemePersistence(themeId: string): Promise<void> {
    await themeManager.switchTheme(themeId);
    
    // Verify localStorage
    const savedTheme = localStorage.getItem('selectedTheme');
    expect(savedTheme).toBe(themeId);
    
    // Verify current theme
    expect(themeManager.getCurrentTheme()).toBe(themeId);
  }
  
  /**
   * Mock theme change event
   */
  mockThemeChangeEvent(themeId: string, duration: number = 50): void {
    const event = new CustomEvent('themechange', {
      detail: { themeId, duration }
    });
    document.documentElement.dispatchEvent(event);
  }
  
  /**
   * Verify accessible theme compliance
   */
  verifyAccessibleTheme(): void {
    // Switch to accessible theme
    themeManager.switchTheme('accessible');
    
    // Test contrast ratios (simplified check)
    const textColor = tokenCSS.color.textPrimary;
    const backgroundColor = tokenCSS.color.backgroundBase;
    
    expect(textColor).toBeTruthy();
    expect(backgroundColor).toBeTruthy();
    
    // Verify theme is applied
    expect(themeManager.getCurrentTheme()).toBe('accessible');
  }
  
  /**
   * Test component responsiveness to theme changes
   */
  async testComponentThemeResponsiveness(
    element: HTMLElement,
    property: string,
    expectedChanges: Record<string, string>
  ): Promise<void> {
    for (const [themeId, expectedValue] of Object.entries(expectedChanges)) {
      await themeManager.switchTheme(themeId);
      
      // Force style recalculation
      element.offsetHeight;
      
      const computedStyle = window.getComputedStyle(element);
      const actualValue = computedStyle.getPropertyValue(property);
      
      expect(actualValue).toContain(expectedValue);
    }
  }
}

// Global test utilities instance
export const designSystemTestUtils = new DesignSystemTestUtils();

/**
 * Custom matchers for design system testing
 */
export const designSystemMatchers = {
  toUseDesignTokens(element: HTMLElement, expectedTokens: string[]) {
    try {
      designSystemTestUtils.verifyTokenUsage(element, expectedTokens);
      return {
        message: () => `Expected element to use design tokens: ${expectedTokens.join(', ')}`,
        pass: true
      };
    } catch (error) {
      return {
        message: () => `Expected element to use design tokens: ${expectedTokens.join(', ')}, but got error: ${error}`,
        pass: false
      };
    }
  },
  
  toSwitchThemeWithinTime(actualDuration: number, maxDuration: number = 100) {
    const pass = actualDuration < maxDuration;
    return {
      message: () => `Expected theme switch to complete within ${maxDuration}ms, but took ${actualDuration}ms`,
      pass
    };
  },
  
  toHaveValidCSSCustomProperties(element: HTMLElement) {
    const computedStyle = window.getComputedStyle(element);
    const hasValidProperties = Array.from(computedStyle).some(prop => 
      prop.startsWith('--semantic-') || prop.startsWith('--component-')
    );
    
    return {
      message: () => `Expected element to have valid CSS custom properties`,
      pass: hasValidProperties
    };
  }
};

// Vitest test setup function
export function setupDesignSystemTests() {
  beforeEach(() => {
    designSystemTestUtils.setupTest();
  });
  
  afterEach(() => {
    designSystemTestUtils.cleanupTest();
  });
}