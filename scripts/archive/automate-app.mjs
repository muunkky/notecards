import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import { resolve } from 'path';

/**
 * Find Chrome installation path on Windows
 */
async function findChromePath() {
  const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
    process.env.PROGRAMFILES + '\\Google\\Chrome\\Application\\chrome.exe',
    process.env['PROGRAMFILES(X86)'] + '\\Google\\Chrome\\Application\\chrome.exe'
  ];
  
  for (const chromePath of possiblePaths) {
    try {
      await fs.access(chromePath);
      console.log('🔍 Testing Chrome path:', chromePath);
      return chromePath;
    } catch (error) {
      console.log('❌ Not found:', chromePath);
    }
  }
  
  return null;
}

/**
 * Step 2: Automated interactions using saved session
 * Run this after completing auth-setup.mjs
 */
async function automateWithSavedSession() {
  console.log('🤖 Starting automated session with saved credentials...');

  const chromePath = await findChromePath();
  if (chromePath) {
    console.log('✅ Using Chrome at:', chromePath);
  } else {
    console.log('⚠️  Chrome not found, using bundled Chromium');
  }

  const browser = await puppeteer.launch({ 
    headless: false,  // Set to true for fully automated runs
    defaultViewport: null,
    executablePath: chromePath, // Use Chrome if found
    args: [
      '--start-maximized',
      '--no-first-run',
      '--disable-default-apps'
    ]
  });

  const page = await browser.newPage();
  
  try {
    // Load saved cookies
    const cookiesPath = resolve('./session-cookies.json');
    const localStoragePath = resolve('./session-localStorage.json');
    
    if (await fileExists(cookiesPath)) {
      console.log('🍪 Loading saved cookies...');
      const cookies = JSON.parse(await fs.readFile(cookiesPath, 'utf8'));
      await page.setCookie(...cookies);
    } else {
      throw new Error('No saved cookies found. Please run auth-setup.mjs first.');
    }

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

    // Wait a moment for the app to load
    await page.waitForTimeout(3000);

    // Take screenshot to verify we're logged in
    await page.screenshot({ path: './automated-session.png' });
    console.log('📸 Screenshot saved: automated-session.png');

    // Check if we're successfully authenticated
    const isAuthenticated = await page.evaluate(() => {
      const signInButton = document.querySelector('button');
      return !signInButton || !signInButton.textContent.includes('Sign in with Google');
    });

    if (isAuthenticated) {
      console.log('✅ Successfully authenticated! You can now automate the app.');
      
      // Example: Get page title and current URL
      const title = await page.title();
      const url = await page.url();
      console.log(`📄 Page title: ${title}`);
      console.log(`🔗 Current URL: ${url}`);

      // Add your automation tasks here
      await automateAppFeatures(page);
      
    } else {
      console.log('❌ Authentication failed. Session may have expired.');
      console.log('💡 Try running auth-setup.mjs again to refresh the session.');
    }

  } catch (error) {
    console.error('❌ Error during automation:', error.message);
  } finally {
    console.log('🔄 Keeping browser open for 10 seconds...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    await browser.close();
  }
}

/**
 * Add your specific automation tasks here
 */
async function automateAppFeatures(page) {
  console.log('🎯 Starting app feature automation...');
  
  try {
    // Example automation tasks:
    
    // 1. Take screenshots of different sections
    await page.screenshot({ path: './app-dashboard.png', fullPage: true });
    
    // 2. Look for navigation elements
    const navElements = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const links = Array.from(document.querySelectorAll('a'));
      return {
        buttons: buttons.map(btn => ({ text: btn.textContent.trim(), className: btn.className })),
        links: links.map(link => ({ text: link.textContent.trim(), href: link.href }))
      };
    });
    
    console.log('🔍 Found navigation elements:', navElements);
    
    // 3. Check for specific app features
    const appFeatures = await page.evaluate(() => {
      return {
        hasNotecards: !!document.querySelector('[data-testid*="notecard"], .notecard, [class*="notecard"]'),
        hasCreateButton: !!document.querySelector('[data-testid*="create"], [class*="create"], button:contains("Create")'),
        hasStudyMode: !!document.querySelector('[data-testid*="study"], [class*="study"], button:contains("Study")'),
        bodyContent: document.body.textContent.substring(0, 500) // First 500 chars
      };
    });
    
    console.log('🔧 App features detected:', appFeatures);
    
    // Add more specific automation based on your app's features
    
  } catch (error) {
    console.error('❌ Error in app automation:', error.message);
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

automateWithSavedSession().catch(console.error);
