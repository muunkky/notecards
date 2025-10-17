/**
 * Super Simple Browser Service Examples
 * 
 * Look how easy it is to use the browser service!
 */

import browserService from './services/browser-service.mjs';

console.log('🚀 Starting browser automation...');

// One line to get authenticated browser access
const success = await browserService.quickAuth();

if (success) {
  console.log('✅ Got authenticated browser access!');
  
  // Get the browser and page to do whatever you want
  const { browser, page } = browserService.getBrowser();
  
  // Do your automation
  console.log('📄 Current page:', await page.title());
  
  // Clean up when done
  await browserService.shutdown();
  console.log('✅ All done!');
} else {
  console.log('❌ Failed to get browser access');
}
