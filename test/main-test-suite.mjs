import TestFramework from './test-framework.mjs';

/**
 * Main Test Suite for Notecards Application
 * 
 * Uses the universal browser service for consistent testing.
 */

async function runMainTestSuite() {
  const framework = new TestFramework({ verbose: true });
  
  try {
    // Initialize with universal browser service
    console.log('🚀 Initializing test suite with universal browser service...');
    const { isAuthenticated } = await framework.initialize();
    
    // Authenticate if needed - THIS IS REQUIRED
    if (!isAuthenticated) {
      console.log('🔐 Authentication REQUIRED for testing...');
      try {
        await framework.authenticateIfNeeded();
        console.log('✅ Authentication completed - proceeding with tests');
      } catch (error) {
        console.error('❌ CRITICAL FAILURE: Authentication failed');
        console.error('❌ Cannot run tests without authentication');
        console.error('❌ Error:', error.message);
        process.exit(1);
      }
    }

    // Define tests
    framework.addTest('Load Homepage', async (page) => {
      const title = await page.title();
      if (!title || title.includes('Error')) {
        throw new Error(`Invalid page title: ${title}`);
      }
      console.log(`✓ Page title: ${title}`);
    });

    framework.addTest('Check Authentication UI', async (page) => {
      // Wait for any dynamic content to load
      await page.waitForTimeout(2000);
      
      const bodyText = await page.evaluate(() => document.body.textContent);
      
      // Check for signs of authentication
      const hasUserInfo = bodyText.includes('Cameron') || bodyText.includes('Rout');
      const hasCreateButton = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.some(btn => btn.textContent.includes('Create New Deck'));
      });
      
      if (!hasUserInfo && !hasCreateButton) {
        throw new Error('No authentication indicators found');
      }
      
      console.log('✓ Authentication UI elements detected');
    });

    framework.addTest('Verify App Structure', async (page) => {
      // Check for basic app structure
      const hasReactRoot = await page.evaluate(() => {
        return document.querySelector('#root') !== null;
      });
      
      if (!hasReactRoot) {
        throw new Error('React root element not found');
      }
      
      console.log('✓ App structure verified');
    });

    framework.addTest('Check Firebase Integration', async (page) => {
      // Check if Firebase is loaded and configured
      const firebaseCheck = await page.evaluate(() => {
        return typeof window.firebase !== 'undefined' || 
               localStorage.getItem('firebase:authUser:AIzaSyBgiwDZaJgKS-YoiM2dEyJA-JGHxr9cSaQ:[DEFAULT]') !== null;
      });
      
      if (!firebaseCheck) {
        throw new Error('Firebase integration not detected');
      }
      
      console.log('✓ Firebase integration verified');
    });

    framework.addTest('Navigation Test', async (page) => {
      const currentUrl = page.url();
      console.log(`✓ Current URL: ${currentUrl}`);
      
      // Basic navigation check
      if (!currentUrl.includes('127.0.0.1') && !currentUrl.includes('notecards')) {
        throw new Error(`Unexpected URL: ${currentUrl}`);
      }
    });

    // Run all tests
    const results = await framework.runTests();
    
    console.log('\n🎯 Final Test Results:');
    console.log(`Total Tests: ${results.total}`);
    console.log(`Executed: ${results.executed}`);
    console.log(`Passed: ${results.passed}`);
    console.log(`Failed: ${results.failed}`);
    console.log(`Success Rate: ${results.total > 0 ? Math.round((results.passed / results.total) * 100) : 0}%`);
    
    // Exit with appropriate code
    process.exit(results.success ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  } finally {
    await framework.cleanup();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMainTestSuite().catch(console.error);
}

export default runMainTestSuite;
