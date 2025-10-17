#!/usr/bin/env node

/**
 * Modern Debug Utilities for Sharing System
 * 
 * Consolidated debug utilities for investigating sharing system issues.
 * Replaces scattered debug scripts with organized, maintainable utilities.
 */

import browserService from '../../services/browser-service.mjs';
import { createLogger } from '../../browser-automation/utils/logger.mjs';

const logger = createLogger('debug-utils');

class SharingDebugger {
  constructor() {
    this.browserService = null;
  }

  async initialize() {
    logger.info('🔧 Initializing Sharing System Debugger');
    
    const connection = await browserService.initialize({ 
      headless: false, // Always visible for debugging
      persistent: true
    });
    this.browserService = browserService;
    
    logger.success('Debug environment ready');
  }

  async debugPageContent() {
    logger.info('🔍 Analyzing page content and authentication state');
    
    const { page } = this.browserService.getBrowser();
    
    const pageInfo = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        hasAuthElements: !!document.querySelector('[data-testid="email-input"], [data-testid="login-button"]'),
        hasDecks: !!document.querySelector('[data-testid="deck-list"], [data-testid="deck-item"]'),
        hasShareDialog: !!document.querySelector('[role="dialog"]'),
        elementCount: document.querySelectorAll('*').length,
        bodyText: document.body.innerText.substring(0, 300)
      };
    });
    
    logger.info('📄 Page Analysis Results', pageInfo);
    
    // Take debug screenshot
    await page.screenshot({ 
      path: `debug-screenshots/page-content-${Date.now()}.png`,
      fullPage: true 
    });
    
    return pageInfo;
  }

  async debugSharingDialog(deckId) {
    logger.info('🔍 Debugging share dialog functionality', { deckId });
    
    const { page } = this.browserService.getBrowser();
    
    try {
      // Navigate to deck
      await page.goto(`http://localhost:5173/decks/${deckId}`);
      
      // Take before screenshot
      await page.screenshot({ 
        path: `debug-screenshots/before-share-${deckId}-${Date.now()}.png`
      });
      
      // Click share button
      await page.click(`[data-testid="share-button-${deckId}"]`);
      
      // Wait for dialog
      await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 5000 });
      
      // Analyze dialog state
      const dialogInfo = await page.evaluate(() => {
        const dialog = document.querySelector('[role="dialog"]');
        return {
          visible: !!dialog,
          hasEmailInput: !!document.querySelector('input[type="email"]'),
          hasAddButton: !!document.querySelector('button:has-text("Add")'),
          hasCollaboratorList: !!document.querySelector('[data-testid="collaborator-list"]'),
          collaboratorCount: document.querySelectorAll('[data-testid="collaborator-row"]').length,
          dialogText: dialog ? dialog.innerText.substring(0, 200) : null
        };
      });
      
      logger.info('📋 Share Dialog Analysis', dialogInfo);
      
      // Take after screenshot
      await page.screenshot({ 
        path: `debug-screenshots/share-dialog-${deckId}-${Date.now()}.png`
      });
      
      return dialogInfo;
      
    } catch (error) {
      logger.error('Share dialog debugging failed', { error: error.message });
      return { error: error.message };
    }
  }

  async debugCollaboratorAddition(deckId, email) {
    logger.info('🔍 Debugging collaborator addition process', { deckId, email });
    
    const { page } = this.browserService.getBrowser();
    
    try {
      // Open share dialog
      await this.debugSharingDialog(deckId);
      
      const startTime = Date.now();
      
      // Fill email
      await page.fill('input[type="email"]', email);
      
      // Click add
      await page.click('button:has-text("Add")');
      
      // Wait for result
      await page.waitForTimeout(2000);
      
      const duration = Date.now() - startTime;
      
      // Check result
      const result = await page.evaluate((testEmail) => {
        const errorAlert = document.querySelector('[role="alert"]');
        const collaboratorList = document.querySelector('[data-testid="collaborator-list"]');
        
        return {
          hasError: !!errorAlert,
          errorText: errorAlert ? errorAlert.textContent : null,
          collaboratorAdded: collaboratorList ? collaboratorList.textContent.includes(testEmail) : false,
          collaboratorCount: document.querySelectorAll('[data-testid="collaborator-row"]').length
        };
      }, email);
      
      logger.info('➕ Collaborator Addition Result', { ...result, duration });
      
      // Take result screenshot
      await page.screenshot({ 
        path: `debug-screenshots/collaborator-add-${Date.now()}.png`
      });
      
      return { ...result, duration };
      
    } catch (error) {
      logger.error('Collaborator addition debugging failed', { error: error.message });
      return { error: error.message };
    }
  }

  async cleanup() {
    try {
      await this.browserService?.close();
      logger.success('Debug session cleanup complete');
    } catch (error) {
      logger.error('Cleanup failed', { error: error.message });
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  const sharingDebugger = new SharingDebugger();
  
  try {
    await sharingDebugger.initialize();
    
    switch (command) {
      case 'page':
        await sharingDebugger.debugPageContent();
        break;
        
      case 'dialog':
        const deckId = args[1];
        if (!deckId) {
          console.error('Usage: node sharing-debug-utils.mjs dialog <deck-id>');
          process.exit(1);
        }
        await sharingDebugger.debugSharingDialog(deckId);
        break;
        
      case 'add':
        const addDeckId = args[1];
        const email = args[2];
        if (!addDeckId || !email) {
          console.error('Usage: node sharing-debug-utils.mjs add <deck-id> <email>');
          process.exit(1);
        }
        await sharingDebugger.debugCollaboratorAddition(addDeckId, email);
        break;
        
      case 'help':
      default:
        console.log(`
🔍 Sharing System Debug Utilities

Usage: node sharing-debug-utils.mjs <command> [options]

Commands:
  page              Debug page content and authentication state
  dialog <deck-id>  Debug share dialog functionality
  add <deck-id> <email>  Debug collaborator addition process
  help              Show this help message

Examples:
  node sharing-debug-utils.mjs page
  node sharing-debug-utils.mjs dialog abc123
  node sharing-debug-utils.mjs add abc123 test@example.com
        `);
        break;
    }
    
  } catch (error) {
    console.error('Debug utility failed:', error.message);
    process.exit(1);
  } finally {
    await sharingDebugger.cleanup();
  }
}

// Run CLI if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { SharingDebugger };
export default SharingDebugger;