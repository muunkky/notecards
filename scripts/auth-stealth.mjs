import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { promises as fs } from 'fs';
import { resolve } from 'path';

/**
 * Configure stealth plugin to bypass Google's bot detection
 */
function configureStealthPlugin() {
  const stealthPlugin = StealthPlugin();
  // Remove some evasions that might cause issues
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
      // Path not found, try next
    }
  }
  
  return null;
}

/**
 * Enhanced authentication setup with stealth mode
 */
async function setupAuthStealth() {
  console.log('🥷 Starting STEALTH authentication setup...');
  
  // Configure stealth plugin before launching browser
  configureStealthPlugin();
  
  const chromePath = await findChromePath();
  if (chromePath) {
    console.log('✅ Found Chrome at:', chromePath);
  } else {
    console.log('⚠️  Chrome not found, using bundled Chromium');
  }

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    executablePath: chromePath || undefined,
    args: [
      '--start-maximized',
      '--no-first-run',
      '--disable-blink-features=AutomationControlled',
      '--disable-web-security',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-infobars',
      '--disable-extensions',
      '--disable-default-apps',
      '--disable-popup-blocking'
    ],
    ignoreDefaultArgs: [
      '--enable-automation',
      '--enable-blink-features=IdleDetection'
    ]
  });

  const page = await browser.newPage();

  try {
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36');
    
    // Remove webdriver property
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });

    console.log('🌐 Navigating to your notecards app...');
    await page.goto('https://notecards-1b054.web.app', { 
      waitUntil: 'networkidle0' 
    });

    console.log('👆 Please complete the Google sign-in manually in the browser window...');
    console.log('⏳ Waiting for you to complete authentication...');
    console.log('💡 The stealth mode should help bypass the "browser not secure" error!');

    // Wait for authentication with enhanced detection
    let authSuccess = false;
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const currentUrl = await page.url();
        const pageContent = await page.content();
        const hasSignInButton = pageContent.includes('Sign in with Google');
        
        console.log(`🔄 Check ${attempt}/${maxAttempts} - URL: ${currentUrl.substring(0, 50)}...`);
        
        if (currentUrl !== 'https://notecards-1b054.web.app/' || !hasSignInButton) {
          console.log('✅ Authentication change detected!');
          authSuccess = true;
          break;
        }
        
        // Wait 5 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 5000));
        
      } catch (error) {
        console.log(`❌ Error during check ${attempt}:`, error.message);
      }
    }

    if (!authSuccess) {
      console.log('⚠️  No authentication detected after 5 minutes. Saving current state anyway...');
    }

    // Save session data regardless
    const cookies = await page.cookies();
    const cookiesPath = resolve('./session-cookies.json');
    await fs.writeFile(cookiesPath, JSON.stringify(cookies, null, 2));
    
    // Save localStorage
    const localStorage = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }
      return data;
    });
    
    const localStoragePath = resolve('./session-localStorage.json');
    await fs.writeFile(localStoragePath, JSON.stringify(localStorage, null, 2));

    console.log('💾 Session data saved to:');
    console.log(`   - Cookies: ${cookiesPath}`);
    console.log(`   - LocalStorage: ${localStoragePath}`);
    console.log(`   - Cookies count: ${cookies.length}`);
    
    // Take a screenshot
    await page.screenshot({ path: './stealth-auth-state.png' });
    console.log('📸 Screenshot saved: stealth-auth-state.png');

  } catch (error) {
    console.error('❌ Error during stealth authentication:', error.message);
  } finally {
    console.log('🔄 Keeping browser open for 15 seconds so you can verify...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    await browser.close();
  }
}

setupAuthStealth().catch(console.error);
