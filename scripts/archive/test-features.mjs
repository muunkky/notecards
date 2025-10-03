import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { promises as fs } from 'fs';
import { resolve } from 'path';

/**
 * Configure stealth plugin to bypass Google's bot detection
 */
function configureStealthPlugin() {
  const stealthPlugin = StealthPlugin();
  stealthPlugin.enabledEvasions.delete('iframe.contentWindow');
  stealthPlugin.enabledEvasions.delete('navigator.plugins'); 
  stealthPlugin.enabledEvasions.delete('media.codecs');
  puppeteer.use(stealthPlugin);
}

/**
 * Find Chrome installation path on Windows
 */
async function findChromePath() {
  const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'
  ];
  
  for (const chromePath of possiblePaths) {
    try {
      await fs.access(chromePath);
      return chromePath;
    } catch (error) {
      // Continue to next path
    }
  }
  return null;
}

/**
 * Test all clickable features on the notecards app
 */
async function testAppFeatures() {
  console.log('🧪 Starting comprehensive app feature testing...');

  // Configure stealth plugin before launching browser
  configureStealthPlugin();

  const chromePath = await findChromePath();
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    executablePath: chromePath || undefined,
    args: [
      '--start-maximized',
      '--no-first-run',
      '--disable-blink-features=AutomationControlled'
    ],
    ignoreDefaultArgs: ['--enable-automation']
  });

  const page = await browser.newPage();
  
  try {
    // Check if session files exist
    const cookiesPath = resolve('./session-cookies.json');
    const localStoragePath = resolve('./session-localStorage.json');
    
    if (await fileExists(cookiesPath)) {
      console.log('🍪 Loading saved cookies...');
      const cookies = JSON.parse(await fs.readFile(cookiesPath, 'utf8'));
      await page.setCookie(...cookies);
    } else {
      throw new Error('No saved cookies found. Please run auth:stealth first.');
    }

    // Set realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36');

    console.log('🌐 Navigating to notecards app...');
    await page.goto('https://notecards-1b054.web.app', { 
      waitUntil: 'networkidle0' 
    });

    // Restore localStorage if available
    if (await fileExists(localStoragePath)) {
      console.log('💾 Restoring localStorage...');
      const localStorage = JSON.parse(await fs.readFile(localStoragePath, 'utf8'));
      await page.evaluate((data) => {
        for (const [key, value] of Object.entries(data)) {
          localStorage.setItem(key, value);
        }
      }, localStorage);
      
      // Refresh to apply localStorage
      await page.reload({ waitUntil: 'networkidle0' });
    }

    // Wait for page to fully load
    await page.waitForTimeout(3000);

    // Take initial screenshot
    await page.screenshot({ path: './test-initial-state.png', fullPage: true });
    console.log('📸 Initial state screenshot saved');

    // Check authentication status
    const isAuthenticated = await checkAuthenticationStatus(page);
    if (!isAuthenticated) {
      console.log('❌ Authentication failed. Session may have expired.');
      console.log('💡 Try running: npm run auth:stealth');
      console.log('🔄 Keeping browser open for 30 seconds to investigate...');
      await new Promise(resolve => setTimeout(resolve, 30000));
      return;
    }

    console.log('✅ Successfully authenticated! Starting feature testing...');
    console.log('⏸️  Browser will stay open throughout testing for observation...');

    // Test 1: Discover all clickable elements
    const clickableElements = await discoverClickableElements(page);
    console.log(`🔍 Found ${clickableElements.length} clickable elements`);
    await new Promise(resolve => setTimeout(resolve, 3000)); // Pause for observation

    // Test 2: Test navigation elements
    await testNavigationElements(page);
    await new Promise(resolve => setTimeout(resolve, 3000)); // Pause for observation

    // Test 3: Test interactive buttons
    await testInteractiveButtons(page);
    await new Promise(resolve => setTimeout(resolve, 3000)); // Pause for observation

    // Test 4: Test form interactions
    await testFormInteractions(page);
    await new Promise(resolve => setTimeout(resolve, 3000)); // Pause for observation

    // Test 5: Test keyboard interactions
    await testKeyboardInteractions(page);
    await new Promise(resolve => setTimeout(resolve, 3000)); // Pause for observation

    // Test 6: Test responsive elements
    await testResponsiveElements(page);

    console.log('🎉 Feature testing completed successfully!');
    
    // Take final screenshot
    await page.screenshot({ path: './test-final-state.png', fullPage: true });
    console.log('📸 Final state screenshot saved');

  } catch (error) {
    console.error('❌ Error during feature testing:', error.message);
    await page.screenshot({ path: './test-error-state.png' });
    console.log('📸 Error state screenshot saved');
  } finally {
    console.log('🔄 Testing complete! Keeping browser open for 60 seconds for review...');
    console.log('💡 You can interact with the page manually during this time');
    console.log('⏰ Browser will close automatically in 60 seconds...');
    
    // Extended time for manual review
    for (let i = 60; i > 0; i -= 10) {
      console.log(`⏱️  ${i} seconds remaining...`);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
    
    await browser.close();
  }
}

/**
 * Check if user is authenticated
 */
async function checkAuthenticationStatus(page) {
  const authStatus = await page.evaluate(() => {
    const signInButton = document.querySelector('button');
    return {
      hasSignInButton: !!signInButton && signInButton.textContent.includes('Sign in with Google'),
      currentUrl: window.location.href,
      bodyText: document.body.textContent.substring(0, 200)
    };
  });

  console.log('🔐 Authentication Status:', {
    authenticated: !authStatus.hasSignInButton,
    url: authStatus.currentUrl,
    preview: authStatus.bodyText.trim()
  });

  return !authStatus.hasSignInButton;
}

/**
 * Discover all clickable elements on the page
 */
async function discoverClickableElements(page) {
  const clickables = await page.evaluate(() => {
    const elements = [];
    
    // Find buttons
    document.querySelectorAll('button').forEach(el => {
      elements.push({
        type: 'button',
        text: el.textContent.trim(),
        className: el.className,
        id: el.id,
        disabled: el.disabled
      });
    });

    // Find links
    document.querySelectorAll('a').forEach(el => {
      elements.push({
        type: 'link',
        text: el.textContent.trim(),
        href: el.href,
        className: el.className,
        id: el.id
      });
    });

    // Find clickable divs/spans
    document.querySelectorAll('[onclick], [role="button"], [tabindex]').forEach(el => {
      if (el.tagName !== 'BUTTON' && el.tagName !== 'A') {
        elements.push({
          type: 'clickable',
          tagName: el.tagName,
          text: el.textContent.trim().substring(0, 50),
          className: el.className,
          id: el.id
        });
      }
    });

    return elements;
  });

  console.log('🎯 Clickable Elements Found:');
  clickables.forEach((el, index) => {
    console.log(`  ${index + 1}. ${el.type}: "${el.text}" (${el.className || 'no class'})`);
  });

  return clickables;
}

/**
 * Test navigation elements
 */
async function testNavigationElements(page) {
  console.log('🧭 Testing navigation elements...');
  
  try {
    // Look for navigation menus, tabs, or nav links
    const navElements = await page.$$('nav, [role="navigation"], .nav, .navigation, [class*="nav"]');
    
    if (navElements.length > 0) {
      console.log(`Found ${navElements.length} navigation elements`);
      
      for (let i = 0; i < navElements.length; i++) {
        const navText = await navElements[i].evaluate(el => el.textContent.trim());
        console.log(`📍 Nav ${i + 1}: ${navText.substring(0, 100)}`);
      }
    } else {
      console.log('ℹ️  No explicit navigation elements found');
    }

    // Test any visible menu buttons
    const menuButtons = await page.$$('button[class*="menu"], button[aria-label*="menu"], [role="menubutton"]');
    for (const button of menuButtons) {
      const buttonText = await button.evaluate(el => el.textContent.trim());
      console.log(`🔘 Testing menu button: ${buttonText}`);
      
      await button.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: './test-menu-opened.png' });
    }

  } catch (error) {
    console.log(`⚠️  Navigation test error: ${error.message}`);
  }
}

/**
 * Test interactive buttons
 */
async function testInteractiveButtons(page) {
  console.log('🔘 Testing interactive buttons...');
  
  try {
    const buttons = await page.$$('button:not([disabled])');
    
    for (let i = 0; i < Math.min(buttons.length, 5); i++) { // Test max 5 buttons
      const button = buttons[i];
      const buttonInfo = await button.evaluate(el => ({
        text: el.textContent.trim(),
        className: el.className,
        type: el.type
      }));

      console.log(`🔘 Testing button: "${buttonInfo.text}"`);
      
      try {
        // Take screenshot before click
        await page.screenshot({ path: `./test-before-button-${i + 1}.png` });
        
        // Click the button
        await button.click();
        await page.waitForTimeout(2000);
        
        // Take screenshot after click
        await page.screenshot({ path: `./test-after-button-${i + 1}.png` });
        
        console.log(`✅ Button "${buttonInfo.text}" clicked successfully`);
        
      } catch (clickError) {
        console.log(`❌ Failed to click button "${buttonInfo.text}": ${clickError.message}`);
      }
    }
    
  } catch (error) {
    console.log(`⚠️  Button test error: ${error.message}`);
  }
}

/**
 * Test form interactions
 */
async function testFormInteractions(page) {
  console.log('📝 Testing form interactions...');
  
  try {
    // Find input fields
    const inputs = await page.$$('input, textarea, select');
    
    if (inputs.length > 0) {
      console.log(`Found ${inputs.length} form elements`);
      
      for (let i = 0; i < Math.min(inputs.length, 3); i++) {
        const input = inputs[i];
        const inputInfo = await input.evaluate(el => ({
          type: el.type,
          placeholder: el.placeholder,
          name: el.name,
          tagName: el.tagName
        }));

        console.log(`📝 Testing input: ${inputInfo.tagName} (${inputInfo.type})`);
        
        try {
          if (inputInfo.type === 'text' || inputInfo.tagName === 'TEXTAREA') {
            await input.click();
            await input.type('Test input from Puppeteer');
            await page.waitForTimeout(1000);
            await input.evaluate(el => el.value = ''); // Clear after test
          }
        } catch (inputError) {
          console.log(`❌ Failed to interact with input: ${inputError.message}`);
        }
      }
    } else {
      console.log('ℹ️  No form elements found');
    }
    
  } catch (error) {
    console.log(`⚠️  Form test error: ${error.message}`);
  }
}

/**
 * Test keyboard interactions
 */
async function testKeyboardInteractions(page) {
  console.log('⌨️  Testing keyboard interactions...');
  
  try {
    // Test common keyboard shortcuts
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Test arrow keys
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(500);
    
    console.log('✅ Keyboard interactions tested');
    
  } catch (error) {
    console.log(`⚠️  Keyboard test error: ${error.message}`);
  }
}

/**
 * Test responsive elements
 */
async function testResponsiveElements(page) {
  console.log('📱 Testing responsive elements...');
  
  try {
    // Test hover effects
    const hoverableElements = await page.$$('[class*="hover"], button, a');
    
    if (hoverableElements.length > 0) {
      const element = hoverableElements[0];
      await element.hover();
      await page.waitForTimeout(1000);
      console.log('✅ Hover effect tested');
    }
    
    // Test different viewport sizes
    await page.setViewport({ width: 768, height: 1024 }); // Tablet
    await page.waitForTimeout(1000);
    await page.screenshot({ path: './test-tablet-view.png' });
    
    await page.setViewport({ width: 375, height: 667 }); // Mobile
    await page.waitForTimeout(1000);
    await page.screenshot({ path: './test-mobile-view.png' });
    
    await page.setViewport({ width: 1920, height: 1080 }); // Desktop
    await page.waitForTimeout(1000);
    
    console.log('✅ Responsive testing completed');
    
  } catch (error) {
    console.log(`⚠️  Responsive test error: ${error.message}`);
  }
}

/**
 * Helper function to check if file exists
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

testAppFeatures().catch(console.error);
