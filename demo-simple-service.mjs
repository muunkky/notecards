/**
 * Simple Browser Service Usage Examples
 * 
 * This demonstrates how easy the browser service is to use
 * with simple, clean function calls.
 */

import browserService from './services/browser-service.mjs';

// Example 1: One-liner authentication
console.log('=== Example 1: Quick Authentication ===');
const authSuccess = await browserService.quickAuth();
console.log('Authentication result:', authSuccess);

// Example 2: Check if authenticated (simple true/false)
console.log('\n=== Example 2: Simple Verification ===');
const isAuthenticated = await browserService.verifyAuthentication();
console.log('Is authenticated:', isAuthenticated);

// Example 3: Get browser for custom automation
if (isAuthenticated) {
  console.log('\n=== Example 3: Use Browser for Automation ===');
  const { browser, page } = browserService.getBrowser();
  
  // Do your automation here
  const title = await page.title();
  console.log('Page title:', title);
  
  // Take a screenshot
  await page.screenshot({ path: 'demo-screenshot.png' });
  console.log('Screenshot saved: demo-screenshot.png');
}

// Example 4: Clean shutdown
console.log('\n=== Example 4: Clean Shutdown ===');
const shutdownSuccess = await browserService.shutdown();
console.log('Shutdown successful:', shutdownSuccess);

console.log('\n🎉 Demo complete! See how simple that was?');
