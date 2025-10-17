/**
 * Authentication Helpers for Browser Automation Framework
 * 
 * Centralizes authentication logic used across automation scripts.
 * Handles hybrid authentication approach with service account bypass.
 */

import config from './config.mjs';
import { createLogger } from './logger.mjs';

const logger = createLogger('auth');

export class AuthenticationHelper {
  constructor(browserService) {
    this.browserService = browserService;
    this.authenticated = false;
    this.authStartTime = null;
  }

  async authenticate() {
    logger.timer('authentication');
    this.authStartTime = Date.now();

    try {
      logger.authentication('starting', 'progress', { 
        method: config.auth.method 
      });

      // Navigate to application
      await this.browserService.navigateToApp();
      logger.authentication('navigation', 'success');

      // Check if already authenticated
      if (config.auth.skipAuthUI && await this.isAlreadyAuthenticated()) {
        logger.authentication('skipped', 'success', { 
          reason: 'Already authenticated' 
        });
        this.authenticated = true;
        return { success: true, method: 'existing' };
      }

      // Perform hybrid authentication
      const authResult = await this.performHybridAuth();
      
      if (authResult.success) {
        this.authenticated = true;
        logger.authentication('completed', 'success', {
          duration: Date.now() - this.authStartTime,
          method: authResult.method
        });
      } else {
        logger.authentication('failed', 'failure', authResult.error);
      }

      return authResult;

    } catch (error) {
      logger.authentication('error', 'failure', { 
        error: error.message,
        stack: error.stack 
      });
      throw error;
    }
  }

  async isAlreadyAuthenticated() {
    try {
      const { page } = this.browserService.getBrowser();
      
      // Look for authentication indicators
      await page.waitForTimeout(2000);
      
      const isLoggedIn = await page.evaluate(() => {
        // Check for authenticated state indicators
        return !!(
          document.querySelector('[data-testid="deck-list"]') ||
          document.querySelector('.deck-screen') ||
          document.querySelector('[data-testid="user-menu"]')
        );
      });

      return isLoggedIn;
    } catch (error) {
      logger.debug('Authentication check failed', { error: error.message });
      return false;
    }
  }

  async performHybridAuth() {
    try {
      // Use browser service hybrid authentication
      const result = await this.browserService.authenticateWithBypass();
      
      if (result.success) {
        // Verify authentication worked
        const verified = await this.verifyAuthentication();
        return { 
          success: verified, 
          method: 'hybrid',
          details: result
        };
      }

      return { 
        success: false, 
        error: 'Hybrid authentication failed',
        details: result
      };

    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        method: 'hybrid'
      };
    }
  }

  async verifyAuthentication() {
    try {
      const { page } = this.browserService.getBrowser();
      
      // Wait for post-auth navigation
      await page.waitForTimeout(config.timeouts.shortDelay);
      
      // Check for authenticated page elements
      const isAuthenticated = await page.evaluate(() => {
        const indicators = [
          document.querySelector('[data-testid="deck-list"]'),
          document.querySelector('.deck-screen'),
          document.querySelector('[data-testid="user-menu"]'),
          document.querySelector('h1')?.textContent?.includes('Decks')
        ];
        
        return indicators.some(indicator => indicator);
      });

      if (isAuthenticated) {
        logger.authentication('verification', 'success');
        return true;
      } else {
        logger.authentication('verification', 'failure', {
          reason: 'No authenticated indicators found'
        });
        return false;
      }

    } catch (error) {
      logger.authentication('verification', 'failure', { 
        error: error.message 
      });
      return false;
    }
  }

  async waitForStableAuth() {
    if (!this.authenticated) {
      throw new Error('Must authenticate before waiting for stable auth');
    }

    try {
      const { page } = this.browserService.getBrowser();
      
      // Wait for any remaining loading states to complete
      await page.waitForTimeout(config.timeouts.mediumDelay);
      
      // Ensure page is in stable state
      await page.waitForFunction(() => {
        return document.readyState === 'complete' && 
               !document.querySelector('.loading') &&
               !document.querySelector('[data-testid="loading"]');
      }, { timeout: config.timeouts.elementWait });

      logger.authentication('stabilized', 'success');
      return true;

    } catch (error) {
      logger.authentication('stabilization', 'failure', { 
        error: error.message 
      });
      return false;
    }
  }

  async getAuthStatus() {
    return {
      authenticated: this.authenticated,
      startTime: this.authStartTime,
      elapsed: this.authStartTime ? Date.now() - this.authStartTime : 0
    };
  }

  reset() {
    this.authenticated = false;
    this.authStartTime = null;
  }
}

// Utility functions
export async function createAuthHelper(browserService) {
  return new AuthenticationHelper(browserService);
}

export async function performQuickAuth(browserService) {
  const helper = new AuthenticationHelper(browserService);
  return await helper.authenticate();
}

export default AuthenticationHelper;