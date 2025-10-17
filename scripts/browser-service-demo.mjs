#!/usr/bin/env node

/**
 * Centralized Browser Service Demo
 * 
 * This script demonstrates how any script can use the centralized browser service
 * to get a shared browser instance with session persistence.
 */

import browserService from '../services/browser-service.mjs';

async function main() {
  console.log('🔧 Browser Service Demo');
  console.log('========================');
  console.log('🕐 Start time:', new Date().toISOString());

  try {
    // Initialize browser service
    console.log('\n1. Initializing browser service...');
    console.log('🔍 About to call browserService.initialize()');
    const connection = await browserService.initialize();
    console.log('🔍 browserService.initialize() completed');
    
    console.log('✅ Got browser connection:', {
      browser: !!connection.browser,
      page: !!connection.page,
      isAuthenticated: connection.isAuthenticated,
      serviceExists: !!connection.service
    });

    // Navigate to app
    console.log('\n2. Navigating to notecards app...');
    console.log('🔍 About to call browserService.navigateToApp()');
    await browserService.navigateToApp();
    console.log('🔍 browserService.navigateToApp() completed');

    // Check health
    console.log('\n3. Running health check...');
    console.log('🔍 About to call browserService.healthCheck()');
    const health = await browserService.healthCheck();
    console.log('🔍 browserService.healthCheck() completed');
    console.log('Health status:', health);

    // Handle authentication if needed
    console.log('\n4. Enhanced authentication with Google bypass...');
    console.log('🔍 Current authentication state:', connection.isAuthenticated);
    if (!connection.isAuthenticated) {
      console.log('🔍 About to call browserService.authenticateWithBypass()');
      try {
        const authResult = await browserService.authenticateWithBypass();
        console.log('🔍 browserService.authenticateWithBypass() completed:', authResult);
      } catch (error) {
        console.error('❌ DEMO FAILED: Authentication error:', error.message);
        console.error('❌ This is expected behavior - authentication is REQUIRED');
        throw error;
      }
    } else {
      console.log('✅ Already authenticated, skipping auth flow');
    }

    // Do some basic interaction
    console.log('\n5. Testing basic interaction...');
    const { page } = connection;
    console.log('🔍 Getting page title...');
    const title = await page.title();
    console.log('Page title:', title);
    
    console.log('🔍 Getting page URL...');
    const url = await page.url();
    console.log('Current URL:', url);

    // Save session
    console.log('\n6. Saving session...');
    console.log('🔍 About to call browserService.saveSession()');
    await browserService.saveSession();
    console.log('🔍 browserService.saveSession() completed');

    console.log('\n✅ Demo completed successfully!');
    console.log('🕐 End time:', new Date().toISOString());
    console.log('\n🔧 Browser Service is now available for other scripts to use');
    console.log('   Use: import browserService from "./browser-service.mjs"');
    console.log('   Then: const connection = await browserService.initialize()');

    // Close browser cleanly (session data is preserved)
    console.log('\n7. Closing browser cleanly...');
    console.log('🔍 About to call browserService.close()');
    await browserService.close();
    console.log('🔍 browserService.close() completed');
    console.log('💾 Session data preserved for next run!');

  } catch (error) {
    console.error('❌ Demo failed with error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    console.error('🕐 Error time:', new Date().toISOString());
    process.exit(1);
  }
}

// Run if this file is executed directly
console.log('Starting browser service demo...');
main().catch(console.error);

export default main;
