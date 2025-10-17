#!/usr/bin/env node

/**
 * Example: Quick Screenshot Script
 * 
 * This demonstrates how any script can quickly access the browser service
 * to perform simple tasks like taking screenshots.
 */

import browserService from '../services/browser-service.mjs';
import { promises as fs } from 'fs';
import { join } from 'path';

async function takeQuickScreenshot(name = 'quick-screenshot') {
  try {
    console.log(`📸 Taking screenshot: ${name}`);
    
    // Get browser connection (will reuse existing if available)
    const connection = await browserService.initialize();
    
    // Navigate if not already there
    const currentUrl = await connection.page.url();
    if (!currentUrl.includes('notecards-1b054.web.app')) {
      await browserService.navigateToApp();
    }
    
    // Ensure screenshots directory exists
    const screenshotDir = join(process.cwd(), 'screenshots');
    try {
      await fs.mkdir(screenshotDir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }
    
    // Take screenshot
    const filename = `${name}-${Date.now()}.png`;
    const filepath = join(screenshotDir, filename);
    
    await connection.page.screenshot({
      path: filepath,
      fullPage: true
    });
    
    console.log(`✅ Screenshot saved: ${filepath}`);
    
    // Don't close browser - leave it for other scripts
    return filepath;
    
  } catch (error) {
    console.error('❌ Screenshot failed:', error.message);
    throw error;
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const name = process.argv[2] || 'manual-screenshot';
  takeQuickScreenshot(name)
    .then(filepath => {
      console.log(`Screenshot ready: ${filepath}`);
      process.exit(0);
    })
    .catch(error => {
      console.error(error.message);
      process.exit(1);
    });
}

export default takeQuickScreenshot;
