/**
 * Design System Integration
 * 
 * Complete integration that initializes the entire design system.
 * This is the single import that makes the magic happen.
 */

import { initializeTokenCSS } from './tokens/token-css.js';
import { initializeDesignSystemDemo } from './demo/design-system-demo.js';

/**
 * Initialize the complete design system
 */
export function initializeDesignSystem(): void {
  console.log('🎨 Initializing Design System...');
  
  // Initialize token CSS system
  initializeTokenCSS();
  
  // Initialize demo (for development/showcase)
  if (process.env.NODE_ENV === 'development' || window.location.search.includes('demo=true')) {
    initializeDesignSystemDemo();
  }
  
  console.log('✅ Design System initialized successfully');
}

// Auto-initialize if running in browser
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDesignSystem);
  } else {
    initializeDesignSystem();
  }
}

// Export all design system components
export { tokenCSS } from './tokens/token-css.js';
export { themeManager } from './theme/theme-manager.js';
export { defaultTokens } from './tokens/design-tokens.js';
export type { DesignTokens } from './tokens/design-tokens.js';
export type { ThemeDefinition } from './theme/theme-manager.js';