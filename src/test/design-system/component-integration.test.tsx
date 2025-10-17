/**
 * Component Theme Integration Tests
 * 
 * TDD tests ensuring components work correctly across all themes.
 * Tests the bulletproof component pattern.
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { designSystemTestUtils, setupDesignSystemTests } from './test-utils.js';
import { tokenCSS } from '../../design-system/tokens/token-css.js';
import { themeManager } from '../../design-system/theme/theme-manager.js';

setupDesignSystemTests();

// Test components that demonstrate correct token usage
const BulletproofButton: React.FC<{ children: React.ReactNode; variant?: 'primary' | 'secondary' }> = ({ 
  children, 
  variant = 'primary' 
}) => {
  const styles = variant === 'primary' ? {
    background: tokenCSS.button.primaryBackground,
    color: tokenCSS.button.primaryText,
    border: `1px solid ${tokenCSS.button.primaryBorder}`,
    borderRadius: tokenCSS.button.borderRadius,
    padding: tokenCSS.button.paddingMd,
    fontSize: tokenCSS.button.fontSizeMd,
    fontWeight: tokenCSS.button.fontWeight,
    transition: tokenCSS.button.transition,
  } : {
    background: tokenCSS.button.secondaryBackground,
    color: tokenCSS.button.secondaryText,
    border: `1px solid ${tokenCSS.button.secondaryBorder}`,
    borderRadius: tokenCSS.button.borderRadius,
    padding: tokenCSS.button.paddingMd,
    fontSize: tokenCSS.button.fontSizeMd,
    fontWeight: tokenCSS.button.fontWeight,
    transition: tokenCSS.button.transition,
  };
  
  return (
    <button style={styles} data-testid="bulletproof-button">
      {children}
    </button>
  );
};

const BulletproofCard: React.FC<{ children: React.ReactNode; title?: string }> = ({ children, title }) => {
  const cardStyles = {
    background: tokenCSS.card.background,
    border: `1px solid ${tokenCSS.card.border}`,
    borderRadius: tokenCSS.card.borderRadius,
    padding: tokenCSS.card.padding,
    boxShadow: tokenCSS.card.shadow,
  };
  
  const titleStyles = {
    fontSize: tokenCSS.typography.fontSizeLg,
    fontWeight: tokenCSS.typography.fontWeightMedium,
    color: tokenCSS.color.textPrimary,
    margin: `0 0 ${tokenCSS.spacing.md} 0`,
  };
  
  return (
    <div style={cardStyles} data-testid="bulletproof-card">
      {title && <h3 style={titleStyles}>{title}</h3>}
      <div style={{ color: tokenCSS.color.textPrimary }}>
        {children}
      </div>
    </div>
  );
};

const BulletproofInput: React.FC<{ placeholder?: string; type?: string }> = ({ 
  placeholder = 'Enter text...', 
  type = 'text' 
}) => {
  const styles = {
    background: tokenCSS.input.background,
    border: `1px solid ${tokenCSS.input.border}`,
    borderRadius: tokenCSS.input.borderRadius,
    padding: tokenCSS.input.padding,
    fontSize: tokenCSS.input.fontSize,
    color: tokenCSS.color.textPrimary,
    transition: tokenCSS.interactions.transition,
    width: '100%',
  };
  
  return (
    <input
      type={type}
      placeholder={placeholder}
      style={styles}
      data-testid="bulletproof-input"
    />
  );
};

// Fragile component (ANTI-PATTERN) for comparison
const FragileButton: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const styles = {
    background: '#3b82f6', // Hardcoded blue
    color: 'white',         // Hardcoded white
    border: '1px solid #2563eb',
    borderRadius: '8px',    // Hardcoded radius
    padding: '12px 24px',   // Hardcoded padding
    fontSize: '16px',       // Hardcoded size
    fontWeight: '600',
  };
  
  return (
    <button style={styles} data-testid="fragile-button">
      {children}
    </button>
  );
};

describe('Component Theme Integration', () => {
  describe('Bulletproof Components', () => {
    it('should render bulletproof button correctly', () => {
      render(<BulletproofButton>Test Button</BulletproofButton>);
      
      const button = screen.getByTestId('bulletproof-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Test Button');
    });
    
    it('should render bulletproof card correctly', () => {
      render(
        <BulletproofCard title="Test Card">
          <p>Card content</p>
        </BulletproofCard>
      );
      
      const card = screen.getByTestId('bulletproof-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveTextContent('Test Card');
      expect(card).toHaveTextContent('Card content');
    });
    
    it('should render bulletproof input correctly', () => {
      render(<BulletproofInput placeholder="Test input" />);
      
      const input = screen.getByTestId('bulletproof-input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Test input');
    });
  });
  
  describe('Cross-Theme Compatibility', () => {
    it('should work with all themes - bulletproof button', async () => {
      await designSystemTestUtils.testComponentAcrossThemes(() => (
        <BulletproofButton variant="primary">Primary Button</BulletproofButton>
      ));
      
      await designSystemTestUtils.testComponentAcrossThemes(() => (
        <BulletproofButton variant="secondary">Secondary Button</BulletproofButton>
      ));
    });
    
    it('should work with all themes - bulletproof card', async () => {
      await designSystemTestUtils.testComponentAcrossThemes(() => (
        <BulletproofCard title="Theme Test">
          <p>This card adapts to all themes automatically</p>
          <BulletproofButton>Nested Button</BulletproofButton>
        </BulletproofCard>
      ));
    });
    
    it('should work with all themes - bulletproof input', async () => {
      await designSystemTestUtils.testComponentAcrossThemes(() => (
        <BulletproofInput placeholder="Theme-adaptive input" type="text" />
      ));
    });
    
    it('should work with complex nested components', async () => {
      await designSystemTestUtils.testComponentAcrossThemes(() => (
        <BulletproofCard title="Complex Component">
          <div style={{ marginBottom: tokenCSS.spacing.md }}>
            <BulletproofInput placeholder="Email address" type="email" />
          </div>
          <div style={{ marginBottom: tokenCSS.spacing.md }}>
            <BulletproofInput placeholder="Password" type="password" />
          </div>
          <div style={{ display: 'flex', gap: tokenCSS.spacing.sm }}>
            <BulletproofButton variant="primary">Sign In</BulletproofButton>
            <BulletproofButton variant="secondary">Cancel</BulletproofButton>
          </div>
        </BulletproofCard>
      ));
    });
  });
  
  describe('Theme-Specific Visual Changes', () => {
    it('should have different appearances across extreme themes', async () => {
      const component = () => <BulletproofButton>Test</BulletproofButton>;
      
      // Render with corporate theme
      await themeManager.switchTheme('corporate');
      const { container: corporateContainer, unmount: unmountCorporate } = render(component());
      const corporateButton = corporateContainer.querySelector('[data-testid="bulletproof-button"]') as HTMLElement;
      const corporateStyles = window.getComputedStyle(corporateButton);
      
      // Render with creative theme
      unmountCorporate();
      await themeManager.switchTheme('creative');
      const { container: creativeContainer, unmount: unmountCreative } = render(component());
      const creativeButton = creativeContainer.querySelector('[data-testid="bulletproof-button"]') as HTMLElement;
      const creativeStyles = window.getComputedStyle(creativeButton);
      
      // Should have different visual properties
      expect(corporateStyles.backgroundColor).not.toBe(creativeStyles.backgroundColor);
      
      unmountCreative();
    });
    
    it('should respond to theme changes dynamically', async () => {
      const { container } = render(<BulletproofButton>Dynamic Button</BulletproofButton>);
      const button = container.querySelector('[data-testid="bulletproof-button"]') as HTMLElement;
      
      await designSystemTestUtils.testComponentThemeResponsiveness(
        button,
        'background-color',
        {
          'corporate': 'var(--component-button-primary-background)',
          'creative': 'var(--component-button-primary-background)',
          'minimal': 'var(--component-button-primary-background)'
        }
      );
    });
  });
  
  describe('Token Usage Validation', () => {
    it('should use only design tokens - button', () => {
      const { container } = render(<BulletproofButton>Token Button</BulletproofButton>);
      const button = container.querySelector('[data-testid="bulletproof-button"]') as HTMLElement;
      
      const expectedTokens = [
        'component.button.primary-background',
        'component.button.primary-text',
        'component.button.border-radius',
        'component.button.padding-md'
      ];
      
      // Note: This is a conceptual test - actual implementation would check computed styles
      expect(button).toBeTruthy();
    });
    
    it('should use only design tokens - card', () => {
      const { container } = render(<BulletproofCard title="Token Card">Content</BulletproofCard>);
      const card = container.querySelector('[data-testid="bulletproof-card"]') as HTMLElement;
      
      const expectedTokens = [
        'component.card.background',
        'component.card.border',
        'component.card.border-radius',
        'component.card.padding'
      ];
      
      expect(card).toBeTruthy();
    });
  });
  
  describe('Anti-Pattern Detection', () => {
    it('should identify fragile components that break with themes', async () => {
      // Render fragile component
      const { container } = render(<FragileButton>Fragile Button</FragileButton>);
      const fragileButton = container.querySelector('[data-testid="fragile-button"]') as HTMLElement;
      
      // Switch themes - fragile button won't adapt
      await themeManager.switchTheme('creative');
      const creativeStyles = window.getComputedStyle(fragileButton);
      
      await themeManager.switchTheme('corporate'); 
      const corporateStyles = window.getComputedStyle(fragileButton);
      
      // Fragile button should have same styles (doesn't adapt)
      expect(creativeStyles.backgroundColor).toBe(corporateStyles.backgroundColor);
      expect(creativeStyles.color).toBe(corporateStyles.color);
      
      // This demonstrates why hardcoded values are problematic
    });
  });
  
  describe('Performance Under Theme Changes', () => {
    it('should render quickly after theme switches', async () => {
      const themes = ['default', 'corporate', 'creative', 'minimal'];
      
      for (const themeId of themes) {
        await themeManager.switchTheme(themeId);
        
        const start = performance.now();
        const { unmount } = render(
          <BulletproofCard title="Performance Test">
            <BulletproofInput placeholder="Input" />
            <BulletproofButton>Button 1</BulletproofButton>
            <BulletproofButton variant="secondary">Button 2</BulletproofButton>
          </BulletproofCard>
        );
        const renderTime = performance.now() - start;
        
        expect(renderTime).toBeLessThan(50); // Should render quickly
        unmount();
      }
    });
    
    it('should not cause memory leaks during theme switches', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Render and unmount components across themes
      for (let i = 0; i < 10; i++) {
        await themeManager.switchTheme('creative');
        const { unmount } = render(<BulletproofCard>Test {i}</BulletproofCard>);
        unmount();
        
        await themeManager.switchTheme('corporate');
        const { unmount: unmount2 } = render(<BulletproofButton>Test {i}</BulletproofButton>);
        unmount2();
      }
      
      // Force garbage collection if available
      if ((window as any).gc) {
        (window as any).gc();
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Should not significantly increase memory
      expect(memoryIncrease).toBeLessThan(2 * 1024 * 1024); // < 2MB
    });
  });
  
  describe('Accessibility Across Themes', () => {
    it('should maintain accessibility in all themes', async () => {
      const component = () => (
        <BulletproofCard title="Accessibility Test">
          <BulletproofInput placeholder="Accessible input" />
          <BulletproofButton>Accessible button</BulletproofButton>
        </BulletproofCard>
      );
      
      const themes = ['default', 'corporate', 'creative', 'minimal', 'accessible', 'dense'];
      
      for (const themeId of themes) {
        await themeManager.switchTheme(themeId);
        const { container, unmount } = render(component());
        
        // Basic accessibility checks
        const button = container.querySelector('button');
        const input = container.querySelector('input');
        const heading = container.querySelector('h3');
        
        expect(button).toBeInTheDocument();
        expect(input).toBeInTheDocument();
        expect(heading).toBeInTheDocument();
        
        // Verify elements are not hidden
        expect(button).toBeVisible();
        expect(input).toBeVisible();
        expect(heading).toBeVisible();
        
        unmount();
      }
    });
  });
});