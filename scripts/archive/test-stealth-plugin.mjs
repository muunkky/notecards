// Quick test to verify stealth plugin is working for Google OAuth
import browserSession from './browser-session.mjs';

async function testStealthAuth() {
  console.log('🧪 Testing stealth authentication...');
  
  try {
    // Start session with stealth plugin
    await browserSession.startSession({ persistent: true });
    
    console.log('✅ Browser session started with stealth plugin');
    
    // Navigate to Google OAuth test
    console.log('🌐 Navigating to Google sign-in...');
    await browserSession.page.goto('https://accounts.google.com/signin', { 
      waitUntil: 'networkidle0' 
    });
    
    // Check if we get the "browser not secure" message
    await browserSession.page.waitForTimeout(3000);
    
    const pageContent = await browserSession.page.content();
    const hasSecurityError = pageContent.includes('browser or app may not be secure') || 
                            pageContent.includes('not secure');
    
    if (hasSecurityError) {
      console.log('❌ STEALTH PLUGIN FAILED - Google detected automation');
      console.log('🔍 Page title:', await browserSession.page.title());
    } else {
      console.log('✅ STEALTH PLUGIN WORKING - No security error detected');
      console.log('📋 Page title:', await browserSession.page.title());
    }
    
    // Take screenshot for verification
    await browserSession.page.screenshot({ path: './stealth-test.png', fullPage: true });
    console.log('📸 Screenshot saved: stealth-test.png');
    
    console.log('\n💡 Browser left open for manual inspection');
    console.log('   Close browser or press Ctrl+C to exit');
    
    // Keep alive for manual testing
    return new Promise(() => {}); // Never resolves
    
  } catch (error) {
    console.error('❌ Stealth test failed:', error.message);
    await browserSession.close();
  }
}

testStealthAuth();
