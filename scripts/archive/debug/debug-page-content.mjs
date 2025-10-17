import { PuppeteerTestFramework } from './puppeteer-test-framework.mjs';

/**
 * Debug script to see what's actually on the page without authentication
 */

async function debugPageContent() {
  console.log('🔍 Debugging page content without authentication...');
  
  const framework = new PuppeteerTestFramework();
  
  try {
    await framework.initialize();
    const page = framework.page;
    
    // Wait a moment for page to load
    await framework.waitFor(3000);
    
    // Check what's actually on the page
    const pageContent = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        bodyText: document.body.innerText.substring(0, 500),
        hasLoginForm: !!document.querySelector('form, [type="email"], [type="password"], .auth, .login, .signin'),
        hasDecks: !!document.querySelector('[data-testid="deck-item"], .deck-item, article'),
        hasCards: !!document.querySelector('[data-testid="card"], .card'),
        visibleText: document.body.innerText.substring(0, 200),
        elementCount: document.querySelectorAll('*').length
      };
    });
    
    console.log('📄 Page Content Analysis:');
    console.log(JSON.stringify(pageContent, null, 2));
    
    // Take a screenshot to see what's actually displayed
    await page.screenshot({ path: 'debug-no-auth.png', fullPage: true });
    console.log('📸 Screenshot saved: debug-no-auth.png');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await framework.cleanup();
  }
}

debugPageContent();
