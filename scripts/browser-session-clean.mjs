import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { promises as fs } from 'fs';
import { resolve } from 'path';

/**
 * Shared browser session manager with fast session restoration
 */
class BrowserSessionManager {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isAuthenticated = false;
    this.sessionPersistent = false;
    this.stealthConfigured = false;
  }

  configureStealthPlugin() {
    if (!this.stealthConfigured) {
      puppeteer.use(StealthPlugin());
      this.stealthConfigured = true;
      console.log('🥷 Stealth plugin configured');
    }
  }

  async findChromePath() {
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
        continue;
      }
    }
    return null;
  }

  async startSession(options = {}) {
    if (this.browser && this.browser.isConnected()) {
      console.log('♻️  Reusing existing browser session');
      return { browser: this.browser, page: this.page };
    }

    console.log('🚀 Starting new browser session...');
    
    // Configure stealth plugin before using puppeteer
    this.configureStealthPlugin();
    
    const chromePath = await this.findChromePath();
    // Use a persistent user data directory to maintain sessions
    const userDataDir = resolve('./chrome-session-data');
    
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      executablePath: chromePath || undefined,
      userDataDir: userDataDir,
      args: [
        '--start-maximized',
        '--no-first-run',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        ...(options.args || [])
      ],
      ignoreDefaultArgs: ['--enable-automation']
    });

    // Get the first page (usually about:blank)
    const pages = await this.browser.pages();
    this.page = pages[0] || await this.browser.newPage();

    // Load saved session if available
    await this.loadSavedSession();

    return { browser: this.browser, page: this.page };
  }

  async navigateToApp() {
    console.log('🌐 Navigating to notecards app...');
    
    try {
      await this.page.goto('https://notecards-1b054.web.app', {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });
      
      // Wait a bit more for the app to fully load
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.log(`⚠️  Navigation took longer than expected: ${error.message}`);
      // Try to continue anyway - the page might have loaded
    }
  }

  async authenticateIfNeeded() {
    // Check if we're already authenticated
    const authStatus = await this.checkAuthenticationStatus();
    if (authStatus) {
      console.log('✅ Already authenticated!');
      this.isAuthenticated = true;
      return true;
    }

    console.log('🔐 Starting authentication process...');
    
    // Look for sign-in button or link
    const signInSelectors = [
      'button:contains("Sign in")',
      'a:contains("Sign in")',
      '[data-testid="sign-in"]',
      '.sign-in-button',
      'button[type="submit"]'
    ];
    
    let signInFound = false;
    for (const selector of signInSelectors) {
      try {
        await this.page.waitForSelector(selector, { timeout: 5000 });
        await this.page.click(selector);
        console.log('🔐 Clicked sign in button');
        signInFound = true;
        break;
      } catch (error) {
        continue; // Try next selector
      }
    }
    
    if (!signInFound) {
      console.log('⚠️  No sign-in button found, authentication may not be needed');
      return false;
    }

    // Wait for authentication to complete
    // This could involve OAuth redirects, so we'll wait for the final result
    await this.page.waitForTimeout(5000);
    
    const finalAuthStatus = await this.checkAuthenticationStatus();
    this.isAuthenticated = finalAuthStatus;
    
    if (finalAuthStatus) {
      console.log('✅ Authentication successful!');
      await this.saveSession();
    } else {
      console.log('❌ Authentication failed or incomplete');
    }
    
    return finalAuthStatus;
  }

  async loadSavedSession() {
    try {
      // Load cookies
      if (await this.fileExists('./browser-session-cookies.json')) {
        const cookiesData = await fs.readFile('./browser-session-cookies.json', 'utf8');
        const cookies = JSON.parse(cookiesData);
        if (cookies && cookies.length > 0) {
          await this.page.setCookie(...cookies);
          console.log('🍪 Loading saved cookies...');
        }
      }
      
      // Load localStorage
      if (await this.fileExists('./browser-session-storage.json')) {
        const storageData = await fs.readFile('./browser-session-storage.json', 'utf8');
        const localStorage = JSON.parse(storageData);
        if (localStorage && Object.keys(localStorage).length > 0) {
          await this.page.evaluate((data) => {
            for (const [key, value] of Object.entries(data)) {
              localStorage.setItem(key, value);
            }
          }, localStorage);
          console.log('💾 Loading saved localStorage...');
        }
      }
    } catch (error) {
      console.log('⚠️  Could not load saved session:', error.message);
    }
  }

  async checkAuthenticationStatus() {
    try {
      console.log('🔍 Auth check: Checking authentication status...');
      
      // Check for authenticated user indicators
      const authIndicators = [
        () => this.page.$('[data-testid="user-menu"]'),
        () => this.page.$('.user-profile'),
        () => this.page.$('button:contains("Sign out")'),
        () => this.page.$('a:contains("Sign out")'),
        () => this.page.evaluate(() => {
          return localStorage.getItem('firebase:authUser') !== null;
        })
      ];
      
      for (const indicator of authIndicators) {
        const result = await indicator();
        if (result) {
          console.log('🔍 Auth check: Authenticated');
          return true;
        }
      }
      
      console.log('🔍 Auth check: Not authenticated');
      return false;
    } catch (error) {
      console.log('🔍 Auth check: Error checking auth status:', error.message);
      return false;
    }
  }

  async performAuthentication() {
    console.log('🔐 Performing authentication...');
    // Implementation would depend on the specific auth flow
    // For now, return the current auth status
    return await this.checkAuthenticationStatus();
  }

  async saveSession() {
    try {
      const cookies = await this.page.cookies();
      const localStorage = await this.page.evaluate(() => {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          data[key] = localStorage.getItem(key);
        }
        return data;
      });

      await fs.writeFile('./browser-session-cookies.json', JSON.stringify(cookies, null, 2));
      await fs.writeFile('./browser-session-storage.json', JSON.stringify(localStorage, null, 2));
      
      console.log('💾 Session data saved');
    } catch (error) {
      console.log('⚠️  Failed to save session:', error.message);
    }
  }

  async setupAutoSave() {
    console.log('🔄 Setting up auto-save...');
    // Auto-save session data every 30 seconds
    setInterval(async () => {
      if (this.page && this.isAuthenticated) {
        await this.saveSession();
      }
    }, 30000); // Every 30 seconds
  }

  async close(options = {}) {
    if (this.browser && this.browser.isConnected()) {
      console.log('💾 Saving session data...');
      await this.saveSession();
      
      if (options && options.keepSession) {
        console.log('💾 Session data saved for future runs');
        console.log('🔒 Browser will close, but session will be restored next time');
      } else {
        console.log('🔚 Closing browser session...');
      }
      
      await this.browser.close();
      console.log('✅ Browser closed - session data preserved');
      
      this.browser = null;
      this.page = null;
      this.isAuthenticated = false;
    }
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
const browserSession = new BrowserSessionManager();
export default browserSession;
