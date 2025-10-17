/**
 * Theme Management System Tests
 * 
 * TDD tests for theme switching, persistence, and performance.
 * Ensures <100ms switching and bulletproof theme management.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { designSystemTestUtils, setupDesignSystemTests } from './test-utils.js';
import { themeManager, ThemeDefinition } from '../../design-system/theme/theme-manager.js';

setupDesignSystemTests();

describe('Theme Management System', () => {
  describe('Theme Registration', () => {
    it('should have all default themes available', () => {
      const availableThemes = themeManager.getAvailableThemes();
      const themeIds = availableThemes.map(theme => theme.id);
      
      expect(themeIds).toContain('default');
      expect(themeIds).toContain('corporate');
      expect(themeIds).toContain('creative');
      expect(themeIds).toContain('minimal');
      expect(themeIds).toContain('accessible');
      expect(themeIds).toContain('dense');
    });
    
    it('should register custom themes', () => {
      const customTheme: ThemeDefinition = {
        id: 'test-theme',
        name: 'Test Theme',
        description: 'Theme for testing',
        category: 'creative',
        tokens: {
          semantic: {
            colors: {
              primary: '#ff0000'
            }
          }
        }
      };
      
      themeManager.registerTheme(customTheme);
      
      const availableThemes = themeManager.getAvailableThemes();
      const testTheme = availableThemes.find(t => t.id === 'test-theme');
      
      expect(testTheme).toBeDefined();
      expect(testTheme?.name).toBe('Test Theme');
      expect(testTheme?.category).toBe('creative');
    });
    
    it('should validate theme definitions', () => {
      const themes = themeManager.getAvailableThemes();
      
      themes.forEach(theme => {
        expect(theme.id).toBeTruthy();
        expect(theme.name).toBeTruthy();
        expect(theme.description).toBeTruthy();
        expect(theme.category).toBeTruthy();
        expect(theme.tokens).toBeDefined();
        
        // Validate category values
        expect(['conservative', 'creative', 'minimal', 'bold', 'accessible', 'dense']).toContain(theme.category);
      });
    });
  });
  
  describe('Theme Switching', () => {
    it('should switch themes successfully', async () => {
      const originalTheme = themeManager.getCurrentTheme();
      
      await themeManager.switchTheme('creative');
      expect(themeManager.getCurrentTheme()).toBe('creative');
      
      await themeManager.switchTheme('corporate');
      expect(themeManager.getCurrentTheme()).toBe('corporate');
      
      // Restore original
      await themeManager.switchTheme(originalTheme);
    });
    
    it('should switch themes within performance target', async () => {
      const themes = ['default', 'corporate', 'creative', 'minimal', 'accessible', 'dense'];
      
      for (const themeId of themes) {
        const duration = await designSystemTestUtils.testThemeSwitchPerformance(themeId, 100);
        expect(duration).toBeLessThan(100);
      }
    });
    
    it('should handle invalid theme IDs gracefully', async () => {
      const originalTheme = themeManager.getCurrentTheme();
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await themeManager.switchTheme('nonexistent-theme');
      
      // Should stay on original theme
      expect(themeManager.getCurrentTheme()).toBe(originalTheme);
      expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('not found'));
      
      consoleError.mockRestore();
    });
    
    it('should not switch if already on target theme', async () => {
      const currentTheme = themeManager.getCurrentTheme();
      
      const start = performance.now();
      await themeManager.switchTheme(currentTheme);
      const duration = performance.now() - start;
      
      // Should be nearly instant (no-op)
      expect(duration).toBeLessThan(10);
      expect(themeManager.getCurrentTheme()).toBe(currentTheme);
    });
    
    it('should emit theme change events', async () => {
      let eventFired = false;
      let eventDetails: any = null;
      
      const handleThemeChange = (event: Event) => {
        eventFired = true;
        eventDetails = (event as CustomEvent).detail;
      };
      
      document.documentElement.addEventListener('themechange', handleThemeChange);
      
      await themeManager.switchTheme('creative');
      
      expect(eventFired).toBe(true);
      expect(eventDetails).toBeDefined();
      expect(eventDetails.themeId).toBe('creative');
      expect(typeof eventDetails.duration).toBe('number');
      
      document.documentElement.removeEventListener('themechange', handleThemeChange);
    });
  });
  
  describe('Theme Persistence', () => {
    it('should save theme to localStorage', async () => {
      await designSystemTestUtils.testThemePersistence('corporate');
      await designSystemTestUtils.testThemePersistence('creative');
      await designSystemTestUtils.testThemePersistence('minimal');
    });
    
    it('should restore theme from localStorage on initialize', () => {
      // Set theme in localStorage
      localStorage.setItem('selectedTheme', 'creative');
      
      // Initialize theme manager (simulate page reload)
      themeManager.initialize();
      
      expect(themeManager.getCurrentTheme()).toBe('creative');
    });
    
    it('should use default theme if localStorage is invalid', () => {
      localStorage.setItem('selectedTheme', 'invalid-theme');
      
      themeManager.initialize();
      
      expect(themeManager.getCurrentTheme()).toBe('default');
    });
    
    it('should use default theme if localStorage is empty', () => {
      localStorage.clear();
      
      themeManager.initialize();
      
      expect(themeManager.getCurrentTheme()).toBe('default');
    });
  });
  
  describe('Theme Content Validation', () => {
    it('should have valid theme configurations', () => {
      const themes = themeManager.getAvailableThemes();
      
      themes.forEach(theme => {
        // Check corporate theme specifics
        if (theme.id === 'corporate') {
          expect(theme.category).toBe('conservative');
          expect(theme.businessContext).toContain('Enterprise');
        }
        
        // Check creative theme specifics
        if (theme.id === 'creative') {
          expect(theme.category).toBe('creative');
          expect(theme.businessContext).toContain('creative');
        }
        
        // Check accessible theme specifics
        if (theme.id === 'accessible') {
          expect(theme.category).toBe('accessible');
          expect(theme.businessContext).toContain('Government');
        }
      });
    });
    
    it('should have extreme design variations', async () => {
      // Corporate vs Creative should be dramatically different
      await themeManager.switchTheme('corporate');
      designSystemTestUtils.testCSSInjection();
      const corporateCSS = document.getElementById('design-tokens')?.textContent || '';
      
      await themeManager.switchTheme('creative');
      designSystemTestUtils.testCSSInjection();
      const creativeCSS = document.getElementById('design-tokens')?.textContent || '';
      
      // Should have different values (extreme variations)
      expect(corporateCSS).not.toBe(creativeCSS);
      
      // Corporate should use serif fonts, Creative should not
      expect(corporateCSS).toContain('serif');
      expect(creativeCSS).not.toContain('serif');
    });
  });
  
  describe('Performance Benchmarks', () => {
    it('should switch themes under 100ms consistently', async () => {
      const themes = ['default', 'corporate', 'creative', 'minimal', 'accessible', 'dense'];
      const durations: number[] = [];
      
      // Test multiple iterations
      for (let i = 0; i < 10; i++) {
        for (const themeId of themes) {
          const duration = await designSystemTestUtils.testThemeSwitchPerformance(themeId, 100);
          durations.push(duration);
        }
      }
      
      // All switches should be under 100ms
      const maxDuration = Math.max(...durations);
      const avgDuration = durations.reduce((a, b) => a + b) / durations.length;
      
      expect(maxDuration).toBeLessThan(100);
      expect(avgDuration).toBeLessThan(50); // Should average well under target
    });
    
    it('should have minimal memory footprint', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Switch through all themes
      const themes = ['default', 'corporate', 'creative', 'minimal', 'accessible', 'dense'];
      return themes.reduce(async (promise, themeId) => {
        await promise;
        return themeManager.switchTheme(themeId);
      }, Promise.resolve()).then(() => {
        const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
        const memoryIncrease = finalMemory - initialMemory;
        
        // Should not significantly increase memory (< 5MB)
        expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
      });
    });
  });
  
  describe('Theme Content Deep Merging', () => {
    it('should properly merge partial theme definitions', () => {
      const partialTheme: ThemeDefinition = {
        id: 'partial-test',
        name: 'Partial Test',
        description: 'Test partial theme',
        category: 'creative',
        tokens: {
          semantic: {
            colors: {
              primary: '#test123' // Only override primary color
            }
          }
        }
      };
      
      themeManager.registerTheme(partialTheme);
      themeManager.switchTheme('partial-test');
      
      designSystemTestUtils.testCSSInjection();
      const css = document.getElementById('design-tokens')?.textContent || '';
      
      // Should have the custom primary color
      expect(css).toContain('#test123');
      
      // Should still have other default values
      expect(css).toContain('--semantic-color-secondary');
      expect(css).toContain('--semantic-spacing-md');
    });
  });
  
  describe('Accessibility Theme Compliance', () => {
    it('should meet WCAG requirements in accessible theme', async () => {
      designSystemTestUtils.verifyAccessibleTheme();
      
      // Verify accessible theme is applied
      expect(themeManager.getCurrentTheme()).toBe('accessible');
      
      // Test CSS injection
      designSystemTestUtils.testCSSInjection();
    });
  });
});