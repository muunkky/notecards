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
 * Step 1: Manual authentication and cookie saving
 * Run this script once to authenticate manually and save session
 */
async function setupAuth() {
  console.log('🚀 Starting manual authentication setup...');
  
  const chromePath = await findChromePath();
  if (chromePath) {
    console.log('✅ Found Chrome at:', chromePath);
  } else {
    console.log('⚠️  Chrome not found, using bundled Chromium');
  }
  
  console.log('🔧 Browser configuration:', {
    executablePath: chromePath || 'bundled Chromium',
    headless: false
  });
  
  const browser = await puppeteer.launch({ 
    headless: false,  // Important: visible browser for manual auth
    defaultViewport: null,
    executablePath: chromePath || undefined, // Use Chrome if found, undefined falls back to Chromium
    args: [
      '--start-maximized',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--no-first-run',
      '--disable-default-apps',
      '--disable-popup-blocking',
      '--user-data-dir=' + resolve('./chrome-user-data') // Separate user data directory
    ]
  });

  const page = await browser.newPage();
  
  try {
    console.log('📱 Navigating to your notecards app...');
    await page.goto('https://notecards-1b054.web.app', { 
      waitUntil: 'networkidle0' 
    });

    console.log('👆 Please complete the Google sign-in manually in the browser window...');
    console.log('⏳ Waiting for you to complete authentication...');
    
    // Wait for successful authentication with better error handling
    try {
      await page.waitForFunction(
        () => {
          // Wait for either URL change or disappearance of sign-in button
          const signInButton = document.querySelector('button');
          const currentUrl = window.location.href;
          
          console.log('Current URL:', currentUrl);
          console.log('Sign-in button exists:', !!signInButton);
          if (signInButton) {
            console.log('Button text:', signInButton.textContent);
          }
          
          // Check if we're no longer on the main page or sign-in button is gone
          return currentUrl !== 'https://notecards-1b054.web.app/' || 
                 !signInButton || 
                 !signInButton.textContent.includes('Sign in with Google');
        },
        { 
          timeout: 300000, // 5 minutes timeout
          polling: 2000    // Check every 2 seconds
        }
      );
    } catch (timeoutError) {
      console.log('⚠️  Timeout or error waiting for authentication. Checking current state...');
      
      // Check if we might actually be authenticated
      const currentUrl = await page.url();
      const pageContent = await page.content();
      console.log('Final URL:', currentUrl);
      console.log('Page has sign-in button:', pageContent.includes('Sign in with Google'));
      
      if (currentUrl !== 'https://notecards-1b054.web.app/' || !pageContent.includes('Sign in with Google')) {
        console.log('✅ Looks like authentication might have succeeded anyway!');
      } else {
        console.log('❌ Still on sign-in page. Please try the authentication again.');
        console.log('💡 Note: This might be expected if you need to complete the OAuth flow.');
      }
    }

    console.log('✅ Authentication detected! Saving session data...');

    // Save cookies
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
    
    // Take a screenshot to confirm we're logged in
    await page.screenshot({ path: './authenticated-state.png' });
    console.log('📸 Screenshot saved: authenticated-state.png');

  } catch (error) {
    console.error('❌ Error during authentication setup:', error.message);
  } finally {
    console.log('🔄 Keeping browser open for 10 seconds so you can verify...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    await browser.close();
  }
}

setupAuth().catch(console.error);
