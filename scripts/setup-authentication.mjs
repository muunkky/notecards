import browserService from '../services/browser-service.mjs';

/**
 * Manual Authentication Setup
 * 
 * Opens the browser with stealth configuration and waits for you
 * to manually complete Google authentication. Once authenticated,
 * saves the session for use by tests and other scripts.
 */

async function setupManualAuthentication() {
  console.log('🥷 USING EXACT WORKING AUTH-SETUP CONFIGURATION');
  console.log('===============================================\n');
  console.log('⚡ This uses the EXACT same configuration that worked yesterday');
  console.log('🔧 Recreating auth-setup.mjs behavior precisely\n');
  
  try {
    const targetUrl = process.env.NOTECARD_APP_URL || 
                     process.argv[2] || 
                     'http://127.0.0.1:5175';

    console.log(`🎯 Target URL: ${targetUrl}\n`);

    // Use the exact working configuration method
    console.log('1. Opening browser with EXACT working auth-setup configuration...');
    const success = await browserService.authenticateWithWorkingConfig(targetUrl);
    
    if (success) {
      console.log('\n✅ AUTHENTICATION COMPLETED SUCCESSFULLY!');
      console.log('💾 Session data saved to auth-setup.mjs compatible locations');
      console.log('🧪 You can now run tests with the authenticated session');
      console.log('');
      console.log('🎉 Setup complete! You can now:');
      console.log('   - Run tests: npm run test:browser');  
      console.log('   - Run demo: npm run demo:browser');
      console.log('   - Use browser service in any script');
      
    } else {
      console.log('\n⚠️  Authentication may not have completed automatically');
      console.log('💾 Session data saved anyway for manual verification');
      console.log('🧪 Try running tests to see if authentication worked');
    }
    
  } catch (error) {
    console.error('\n❌ Authentication setup failed:', error.message);
    console.error('💡 This might be a temporary Google OAuth issue. Try again in a few minutes.');
    console.error('');
    console.error('🔧 If this keeps failing:');
    console.error('   1. Make sure the app is running on localhost:5175');
    console.error('   2. Check for "browser not secure" errors');
    console.error('   3. Try the original auth-setup.mjs script for comparison');
  } finally {
    console.log('\n7. Keeping browser open for you to verify...');
    console.log('   Close this terminal when you\'re done.');
    
    // Keep the process alive but don't close browser
    // User can Ctrl+C when they want to exit
    await new Promise(() => {}); // Wait forever
  }
}

setupManualAuthentication().catch(console.error);
