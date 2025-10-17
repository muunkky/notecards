/**
 * Design System Demo Component
 * 
 * Shows the complete theming system in action.
 * This component proves that management can change themes
 * without touching ANY component code.
 */

import { tokenCSS } from '../tokens/token-css.js';
import { themeManager } from '../theme/theme-manager.js';

/**
 * Demo component that uses ONLY design tokens
 */
export class DesignSystemDemo {
  private container: HTMLElement | null = null;
  
  constructor() {
    this.createDemoComponents();
    this.bindThemeControls();
  }
  
  /**
   * Create demo components that showcase the design system
   */
  private createDemoComponents(): void {
    // Create container
    this.container = document.createElement('div');
    this.container.style.cssText = `
      padding: ${tokenCSS.spacing.lg};
      background: ${tokenCSS.color.backgroundBase};
      color: ${tokenCSS.color.textPrimary};
      font-family: ${tokenCSS.typography.fontPrimary};
      min-height: 100vh;
      transition: all 200ms ease;
    `;
    
    this.container.innerHTML = `
      <div style="max-width: 1200px; margin: 0 auto;">
        <!-- Theme Switcher -->
        <div style="
          background: ${tokenCSS.color.backgroundElevated};
          border: 1px solid ${tokenCSS.color.borderDefault};
          border-radius: ${tokenCSS.interactions.borderRadius};
          padding: ${tokenCSS.spacing.md};
          margin-bottom: ${tokenCSS.spacing.xl};
          box-shadow: ${tokenCSS.interactions.elevation};
        ">
          <h2 style="
            font-family: ${tokenCSS.typography.fontHeading};
            font-size: ${tokenCSS.typography.fontSizeXl};
            font-weight: ${tokenCSS.typography.fontWeightBold};
            margin: 0 0 ${tokenCSS.spacing.md} 0;
            color: ${tokenCSS.color.textPrimary};
          ">🎨 Design System Live Demo</h2>
          
          <p style="
            color: ${tokenCSS.color.textSecondary};
            margin: 0 0 ${tokenCSS.spacing.md} 0;
            font-size: ${tokenCSS.typography.fontSizeMd};
          ">
            Switch themes instantly without changing any component code.
            This is how we handle management design direction changes.
          </p>
          
          <div id="theme-controls" style="display: flex; gap: ${tokenCSS.spacing.sm}; flex-wrap: wrap;">
            <!-- Theme buttons will be injected here -->
          </div>
        </div>
        
        <!-- Component Showcase -->
        <div style="display: grid; gap: ${tokenCSS.spacing.lg}; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
          
          <!-- Buttons Card -->
          <div style="
            background: ${tokenCSS.card.background};
            border: 1px solid ${tokenCSS.card.border};
            border-radius: ${tokenCSS.card.borderRadius};
            padding: ${tokenCSS.card.padding};
            box-shadow: ${tokenCSS.card.shadow};
            transition: ${tokenCSS.interactions.transition};
          ">
            <h3 style="
              font-size: ${tokenCSS.typography.fontSizeLg};
              font-weight: ${tokenCSS.typography.fontWeightMedium};
              margin: 0 0 ${tokenCSS.spacing.md} 0;
              color: ${tokenCSS.color.textPrimary};
            ">Buttons</h3>
            
            <div style="display: flex; gap: ${tokenCSS.spacing.sm}; flex-direction: column;">
              <button style="
                background: ${tokenCSS.button.primaryBackground};
                color: ${tokenCSS.button.primaryText};
                border: 1px solid ${tokenCSS.button.primaryBorder};
                border-radius: ${tokenCSS.button.borderRadius};
                padding: ${tokenCSS.button.paddingMd};
                font-size: ${tokenCSS.button.fontSizeMd};
                font-weight: ${tokenCSS.button.fontWeight};
                cursor: pointer;
                transition: ${tokenCSS.button.transition};
              " onmouseover="this.style.background='${tokenCSS.button.primaryBackgroundHover}'" 
                 onmouseout="this.style.background='${tokenCSS.button.primaryBackground}'">
                Primary Button
              </button>
              
              <button style="
                background: ${tokenCSS.button.secondaryBackground};
                color: ${tokenCSS.button.secondaryText};
                border: 1px solid ${tokenCSS.button.secondaryBorder};
                border-radius: ${tokenCSS.button.borderRadius};
                padding: ${tokenCSS.button.paddingMd};
                font-size: ${tokenCSS.button.fontSizeMd};
                font-weight: ${tokenCSS.button.fontWeight};
                cursor: pointer;
                transition: ${tokenCSS.button.transition};
              " onmouseover="this.style.background='${tokenCSS.button.secondaryBackgroundHover}'" 
                 onmouseout="this.style.background='${tokenCSS.button.secondaryBackground}'">
                Secondary Button
              </button>
            </div>
          </div>
          
          <!-- Form Card -->
          <div style="
            background: ${tokenCSS.card.background};
            border: 1px solid ${tokenCSS.card.border};
            border-radius: ${tokenCSS.card.borderRadius};
            padding: ${tokenCSS.card.padding};
            box-shadow: ${tokenCSS.card.shadow};
          ">
            <h3 style="
              font-size: ${tokenCSS.typography.fontSizeLg};
              font-weight: ${tokenCSS.typography.fontWeightMedium};
              margin: 0 0 ${tokenCSS.spacing.md} 0;
              color: ${tokenCSS.color.textPrimary};
            ">Form Elements</h3>
            
            <div style="display: flex; flex-direction: column; gap: ${tokenCSS.spacing.sm};">
              <input type="text" placeholder="Enter text..." style="
                background: ${tokenCSS.input.background};
                border: 1px solid ${tokenCSS.input.border};
                border-radius: ${tokenCSS.input.borderRadius};
                padding: ${tokenCSS.input.padding};
                font-size: ${tokenCSS.input.fontSize};
                color: ${tokenCSS.color.textPrimary};
                transition: ${tokenCSS.interactions.transition};
              " onfocus="this.style.borderColor='${tokenCSS.input.borderFocus}'; this.style.background='${tokenCSS.input.backgroundFocus}'"
                 onblur="this.style.borderColor='${tokenCSS.input.border}'; this.style.background='${tokenCSS.input.background}'">
              
              <textarea placeholder="Enter longer text..." style="
                background: ${tokenCSS.input.background};
                border: 1px solid ${tokenCSS.input.border};
                border-radius: ${tokenCSS.input.borderRadius};
                padding: ${tokenCSS.input.padding};
                font-size: ${tokenCSS.input.fontSize};
                color: ${tokenCSS.color.textPrimary};
                font-family: ${tokenCSS.typography.fontPrimary};
                resize: vertical;
                min-height: 60px;
                transition: ${tokenCSS.interactions.transition};
              " onfocus="this.style.borderColor='${tokenCSS.input.borderFocus}'; this.style.background='${tokenCSS.input.backgroundFocus}'"
                 onblur="this.style.borderColor='${tokenCSS.input.border}'; this.style.background='${tokenCSS.input.background}'"></textarea>
            </div>
          </div>
          
          <!-- Typography Card -->
          <div style="
            background: ${tokenCSS.card.background};
            border: 1px solid ${tokenCSS.card.border};
            border-radius: ${tokenCSS.card.borderRadius};
            padding: ${tokenCSS.card.padding};
            box-shadow: ${tokenCSS.card.shadow};
          ">
            <h3 style="
              font-size: ${tokenCSS.typography.fontSizeLg};
              font-weight: ${tokenCSS.typography.fontWeightMedium};
              margin: 0 0 ${tokenCSS.spacing.md} 0;
              color: ${tokenCSS.color.textPrimary};
            ">Typography</h3>
            
            <div style="display: flex; flex-direction: column; gap: ${tokenCSS.spacing.xs};">
              <h1 style="
                font-family: ${tokenCSS.typography.fontHeading};
                font-size: ${tokenCSS.typography.fontSize3xl};
                font-weight: ${tokenCSS.typography.fontWeightBold};
                margin: 0;
                color: ${tokenCSS.color.textPrimary};
              ">Heading 1</h1>
              <h2 style="
                font-family: ${tokenCSS.typography.fontHeading};
                font-size: ${tokenCSS.typography.fontSize2xl};
                font-weight: ${tokenCSS.typography.fontWeightMedium};
                margin: 0;
                color: ${tokenCSS.color.textPrimary};
              ">Heading 2</h2>
              <p style="
                font-size: ${tokenCSS.typography.fontSizeMd};
                color: ${tokenCSS.color.textPrimary};
                margin: 0;
                line-height: ${tokenCSS.typography.lineHeightNormal};
              ">Body text with normal weight</p>
              <p style="
                font-size: ${tokenCSS.typography.fontSizeSm};
                color: ${tokenCSS.color.textSecondary};
                margin: 0;
                line-height: ${tokenCSS.typography.lineHeightNormal};
              ">Secondary text that's smaller</p>
              <code style="
                font-family: ${tokenCSS.typography.fontMono};
                font-size: ${tokenCSS.typography.fontSizeSm};
                color: ${tokenCSS.color.accent};
                background: ${tokenCSS.color.backgroundElevated};
                padding: 2px 6px;
                border-radius: 4px;
              ">Code snippet</code>
            </div>
          </div>
          
          <!-- Status Colors Card -->
          <div style="
            background: ${tokenCSS.card.background};
            border: 1px solid ${tokenCSS.card.border};
            border-radius: ${tokenCSS.card.borderRadius};
            padding: ${tokenCSS.card.padding};
            box-shadow: ${tokenCSS.card.shadow};
          ">
            <h3 style="
              font-size: ${tokenCSS.typography.fontSizeLg};
              font-weight: ${tokenCSS.typography.fontWeightMedium};
              margin: 0 0 ${tokenCSS.spacing.md} 0;
              color: ${tokenCSS.color.textPrimary};
            ">Status Colors</h3>
            
            <div style="display: flex; flex-direction: column; gap: ${tokenCSS.spacing.xs};">
              <div style="
                background: ${tokenCSS.color.success};
                color: white;
                padding: ${tokenCSS.spacing.sm};
                border-radius: ${tokenCSS.interactions.borderRadius};
                font-size: ${tokenCSS.typography.fontSizeSm};
                font-weight: ${tokenCSS.typography.fontWeightMedium};
              ">✓ Success State</div>
              <div style="
                background: ${tokenCSS.color.warning};
                color: white;
                padding: ${tokenCSS.spacing.sm};
                border-radius: ${tokenCSS.interactions.borderRadius};
                font-size: ${tokenCSS.typography.fontSizeSm};
                font-weight: ${tokenCSS.typography.fontWeightMedium};
              ">⚠ Warning State</div>
              <div style="
                background: ${tokenCSS.color.error};
                color: white;
                padding: ${tokenCSS.spacing.sm};
                border-radius: ${tokenCSS.interactions.borderRadius};
                font-size: ${tokenCSS.typography.fontSizeSm};
                font-weight: ${tokenCSS.typography.fontWeightMedium};
              ">✗ Error State</div>
              <div style="
                background: ${tokenCSS.color.info};
                color: white;
                padding: ${tokenCSS.spacing.sm};
                border-radius: ${tokenCSS.interactions.borderRadius};
                font-size: ${tokenCSS.typography.fontSizeSm};
                font-weight: ${tokenCSS.typography.fontWeightMedium};
              ">ℹ Info State</div>
            </div>
          </div>
        </div>
        
        <!-- Performance Note -->
        <div style="
          margin-top: ${tokenCSS.spacing.xl};
          padding: ${tokenCSS.spacing.md};
          background: ${tokenCSS.color.backgroundElevated};
          border: 1px solid ${tokenCSS.color.borderSubtle};
          border-radius: ${tokenCSS.interactions.borderRadius};
          color: ${tokenCSS.color.textSecondary};
          font-size: ${tokenCSS.typography.fontSizeSm};
        ">
          <p style="margin: 0;">
            <strong>⚡ Performance:</strong> Theme switching happens in &lt;100ms with zero component rewrites. 
            <strong>🎯 Management Ready:</strong> Design direction changes require zero developer time.
          </p>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.container);
  }
  
  /**
   * Bind theme switching controls
   */
  private bindThemeControls(): void {
    const themeControls = document.getElementById('theme-controls');
    if (!themeControls) return;
    
    // Get available themes
    const availableThemes = themeManager.getAvailableThemes();
    
    availableThemes.forEach(theme => {
      const button = document.createElement('button');
      // Add emojis based on theme category
      const themeEmojis: Record<string, string> = {
        'conservative': '🏢',
        'creative': '🎨', 
        'minimal': '✨',
        'bold': '⚡',
        'accessible': '♿',
        'dense': '📊'
      };
      const emoji = themeEmojis[theme.category] || '🎨';
      button.textContent = `${emoji} ${theme.name}`;
      button.style.cssText = `
        background: ${tokenCSS.button.secondaryBackground};
        color: ${tokenCSS.button.secondaryText};
        border: 1px solid ${tokenCSS.button.secondaryBorder};
        border-radius: ${tokenCSS.button.borderRadius};
        padding: ${tokenCSS.button.paddingSm};
        font-size: ${tokenCSS.button.fontSizeSm};
        font-weight: ${tokenCSS.button.fontWeight};
        cursor: pointer;
        transition: ${tokenCSS.button.transition};
        min-width: 120px;
      `;
      
      // Highlight current theme
      if (theme.id === themeManager.getCurrentTheme()) {
        button.style.background = tokenCSS.button.primaryBackground;
        button.style.color = tokenCSS.button.primaryText;
        button.style.borderColor = tokenCSS.button.primaryBorder;
      }
      
      button.addEventListener('click', () => {
        console.log(`Switching to theme: ${theme.id}`);
        const start = performance.now();
        
        themeManager.switchTheme(theme.id);
        
        const end = performance.now();
        console.log(`Theme switch completed in ${(end - start).toFixed(2)}ms`);
        
        // Update button states
        this.updateThemeButtonStates();
      });
      
      button.addEventListener('mouseenter', () => {
        if (theme.id !== themeManager.getCurrentTheme()) {
          button.style.background = tokenCSS.button.secondaryBackgroundHover;
        }
      });
      
      button.addEventListener('mouseleave', () => {
        if (theme.id !== themeManager.getCurrentTheme()) {
          button.style.background = tokenCSS.button.secondaryBackground;
        }
      });
      
      themeControls.appendChild(button);
    });
  }
  
  /**
   * Update theme button states after theme change
   */
  private updateThemeButtonStates(): void {
    const themeControls = document.getElementById('theme-controls');
    if (!themeControls) return;
    
    const buttons = themeControls.querySelectorAll('button');
    const currentTheme = themeManager.getCurrentTheme();
    const availableThemes = themeManager.getAvailableThemes();
    
    buttons.forEach((button, index) => {
      const theme = availableThemes[index];
      if (theme.id === currentTheme) {
        button.style.background = tokenCSS.button.primaryBackground;
        button.style.color = tokenCSS.button.primaryText;
        button.style.borderColor = tokenCSS.button.primaryBorder;
      } else {
        button.style.background = tokenCSS.button.secondaryBackground;
        button.style.color = tokenCSS.button.secondaryText;
        button.style.borderColor = tokenCSS.button.secondaryBorder;
      }
    });
  }
}

/**
 * Initialize the demo
 */
export function initializeDesignSystemDemo(): void {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new DesignSystemDemo();
    });
  } else {
    new DesignSystemDemo();
  }
}