#!/usr/bin/env node

/**
 * Custom Sharing System Test Script
 * 
 * This script uses the browser service to specifically test the deck sharing
 * functionality locally with emulators to isolate the production issue.
 */

import browserService from '../services/browser-service.mjs';

async function testSharingSystem() {
  console.log('🧪 Testing Deck Sharing System Locally');
  console.log('=====================================');
  console.log('🕐 Start time:', new Date().toISOString());

  try {
    // Initialize browser service
    console.log('\n1. Initializing browser service...');
    const connection = await browserService.initialize();
    console.log('✅ Browser initialized');

    // Navigate to local app (check for correct port)
    console.log('\n2. Navigating to local development app...');
    const { page } = browserService.getBrowser();
    
    // Try both possible ports (5174 and 5175)
    let appUrl = 'http://127.0.0.1:5174';
    try {
      await page.goto(appUrl, { waitUntil: 'networkidle0', timeout: 5000 });
    } catch (error) {
      console.log('Port 5174 not available, trying 5175...');
      appUrl = 'http://127.0.0.1:5175';
      await page.goto(appUrl, { waitUntil: 'networkidle0' });
    }
    console.log('✅ Navigated to app at:', appUrl);

    // Wait for initial load
    console.log('\n3. Waiting for app to load...');
    await page.waitForTimeout(3000);

    // Check if we're on the deck screen or login screen
    console.log('\n4. Checking authentication status...');
    const isOnLoginScreen = await page.$('.auth-container, [data-testid="login-screen"]') !== null;
    const isOnDeckScreen = await page.$('[data-testid="deck-screen"], .deck-list') !== null;
    
    console.log('Login screen visible:', isOnLoginScreen);
    console.log('Deck screen visible:', isOnDeckScreen);

    if (isOnLoginScreen) {
      console.log('\n5. Need to authenticate...');
      await browserService.authenticateWithBypass();
      await page.waitForTimeout(2000);
    }

    // Check for error messages
    console.log('\n6. Checking for error messages...');
    const errorElements = await page.$$('.error, [class*="error"], .text-red');
    console.log('Found error elements:', errorElements.length);

    for (let i = 0; i < errorElements.length; i++) {
      const errorText = await errorElements[i].textContent();
      console.log(`Error ${i + 1}:`, errorText);
    }

    // Check for specific sharing error
    const hasPermissionError = await page.evaluate(() => {
      return document.body.textContent.includes('Missing or insufficient permissions');
    });
    console.log('Has "Missing or insufficient permissions" error:', hasPermissionError);

    // Check console errors
    console.log('\n7. Capturing browser console logs...');
    const logs = [];
    page.on('console', msg => {
      logs.push(`${msg.type()}: ${msg.text()}`);
    });

    // Wait a bit more for any async operations
    await page.waitForTimeout(2000);

    // Print recent console logs
    console.log('Recent browser console logs:');
    logs.slice(-10).forEach(log => console.log('  ', log));

    // Get page content for debugging
    console.log('\n8. Checking page content...');
    const bodyText = await page.evaluate(() => document.body.textContent);
    
    if (bodyText.includes('Loading your decks')) {
      console.log('✅ App is loading decks (good sign)');
    } else if (bodyText.includes('Error loading decks')) {
      console.log('❌ Found "Error loading decks" message');
    } else if (bodyText.includes('Sign in with Google')) {
      console.log('⚠️  Still on login screen');
    } else {
      console.log('⚠️  Unexpected page state');
    }

    // Take a screenshot for debugging
    console.log('\n9. Taking screenshot for debugging...');
    await page.screenshot({ 
      path: 'debug-sharing-test.png',
      fullPage: true 
    });
    console.log('Screenshot saved: debug-sharing-test.png');

    // Check network requests
    console.log('\n10. Monitoring network requests...');
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('firestore') || response.url().includes('googleapis')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });

    // Trigger a page refresh to capture requests
    console.log('Refreshing page to capture network requests...');
    await page.reload({ waitUntil: 'networkidle0' });
    
    console.log('Network responses:');
    responses.forEach(resp => {
      console.log(`  ${resp.status} ${resp.statusText}: ${resp.url}`);
    });

    // Final status check
    console.log('\n11. Final status check...');
    const finalBodyText = await page.evaluate(() => document.body.textContent);
    
    if (finalBodyText.includes('Missing or insufficient permissions')) {
      console.log('🔴 ISSUE REPRODUCED: Found permissions error locally!');
      console.log('   This means the issue is in the code, not production environment');
    } else if (finalBodyText.includes('Error loading decks')) {
      console.log('🔴 ISSUE REPRODUCED: Found deck loading error locally!');
    } else if (finalBodyText.includes('Loading your decks')) {
      console.log('🟡 STILL LOADING: App might be stuck in loading state');
    } else {
      console.log('🟢 NO ERROR: Local app appears to be working');
      console.log('   This suggests the issue is production-specific');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Keep browser open for manual inspection
    console.log('\n🔍 Browser left open for manual inspection');
    console.log('   You can interact with the page manually');
    console.log('   Close the browser when done');
    
    // Don't close automatically - let user inspect
    // await browserService.close();
  }

  console.log('\n✅ Sharing test completed!');
  console.log('🕐 End time:', new Date().toISOString());
}

// Run the test
testSharingSystem().catch(console.error);