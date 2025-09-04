import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { promises as fs } from 'fs';
import { resolve } from 'path';

/**
 * Centralized Browser Service
 * 
 * A singleton service that manages a persistent browser instance
 * that can be shared across multiple scripts and test runs.
 * 
 * Features:
 * - Session persistence (cookies, localStorage)
 * - Authentication state management
 * - Cross-script browser sharing
 * - Automatic session restoration
 * - Health monitoring and recovery
 */
class BrowserService {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isAuthenticated = false;
    this.isInitialized = false;
    this.stealthConfigured = false;
    this.sessionData = {
      cookies: [],
      localStorage: {},
      authState: false
    };
  }

  /**
   * Initialize the browser service
   */
  async initialize(options = {}) {
    console.log('🔍 Browser Service Initialize called with options:', JSON.stringify(options, null, 2));
    
    if (this.isInitialized && this.browser && this.browser.isConnected()) {
      console.log('🔄 Browser service already initialized and connected');
      console.log('🔄 Current state:', {
        isInitialized: this.isInitialized,
        browserConnected: this.browser?.isConnected(),
        isAuthenticated: this.isAuthenticated
      });
      return this.getConnection();
    }

    console.log('🚀 Initializing Browser Service...');
    console.log('🔧 Service state before init:', {
      isInitialized: this.isInitialized,
      stealthConfigured: this.stealthConfigured,
      browserExists: !!this.browser,
      pageExists: !!this.page
    });
    
    // Configure stealth plugin
    if (!this.stealthConfigured) {
      console.log('🥷 Configuring stealth plugin...');
      puppeteer.use(StealthPlugin());
      this.stealthConfigured = true;
      console.log('✅ Stealth plugin configured');
    } else {
      console.log('🥷 Stealth plugin already configured');
    }

    const chromePath = await this.findChromePath();
    const userDataDir = resolve('./chrome-session-data');
    
    console.log('🔍 Chrome detection result:', {
      chromePath: chromePath || 'Not found - using default',
      userDataDir: userDataDir
    });

    console.log('🚀 Launching browser with options:', {
      headless: options.headless || process.env.PUPPETEER_HEADLESS === 'true' || false,
      userDataDir: userDataDir,
      chromePath: chromePath || 'default'
    });

    this.browser = await puppeteer.launch({
      headless: options.headless || process.env.PUPPETEER_HEADLESS === 'true' || false,
      defaultViewport: null,
      executablePath: chromePath || undefined,
      userDataDir: userDataDir,
      args: [
        '--start-maximized',
        '--no-first-run',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--remote-debugging-port=9222',
        ...(options.args || [])
      ],
      ignoreDefaultArgs: ['--enable-automation']
    });

    console.log('✅ Browser launched successfully');
    console.log('🔍 Browser connection state:', {
      isConnected: this.browser.isConnected(),
      wsEndpoint: this.browser.wsEndpoint()
    });

    // Get or create a page
    const pages = await this.browser.pages();
    console.log('📄 Available pages:', pages.length);
    this.page = pages[0] || await this.browser.newPage();
    console.log('📄 Using page:', !!this.page);

    // Load saved session
    console.log('💾 Loading saved session data...');
    await this.loadSession();

    this.isInitialized = true;
    console.log('✅ Browser Service initialized successfully');
    console.log('🔍 Final state:', {
      isInitialized: this.isInitialized,
      browserConnected: this.browser?.isConnected(),
      pageReady: !!this.page,
      isAuthenticated: this.isAuthenticated
    });

    return this.getConnection();
  }

  /**
   * Get browser connection for external use
   */
  getConnection() {
    console.log('🔗 Getting browser connection...');
    console.log('🔍 Connection state check:', {
      browserExists: !!this.browser,
      pageExists: !!this.page,
      isInitialized: this.isInitialized
    });
    
    if (!this.browser || !this.page) {
      const error = 'Browser service not initialized. Call initialize() first.';
      console.error('❌', error);
      throw new Error(error);
    }
    
    const connection = {
      browser: this.browser,
      page: this.page,
      isAuthenticated: this.isAuthenticated,
      service: this // Provide access to service methods
    };
    
    console.log('✅ Browser connection ready:', {
      browser: !!connection.browser,
      page: !!connection.page,
      isAuthenticated: connection.isAuthenticated
    });
    
    return connection;
  }

  /**
   * Navigate to the notecards app with session restoration
   */
  async navigateToApp() {
    console.log('🌐 Starting navigation to notecards app...');
    
    let currentUrl = 'unknown';
    try {
      currentUrl = await this.page.url();
    } catch (error) {
      console.log('🔍 Could not get current URL:', error.message);
    }
    
    console.log('🔍 Pre-navigation state:', {
      pageExists: !!this.page,
      currentUrl: currentUrl
    });
    
    try {
      console.log('🌐 Navigating to https://notecards-1b054.web.app...');
      await this.page.goto('https://notecards-1b054.web.app', {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });
      
      console.log('✅ Navigation completed, waiting for app to load...');
      
      // Wait for app to load
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('🔍 Post-navigation state:', {
        url: await this.page.url(),
        title: await this.page.title()
      });
      
      // Check authentication status
      console.log('🔐 Checking authentication status after navigation...');
      this.isAuthenticated = await this.checkAuthenticationStatus();
      
      console.log('✅ Navigation completed successfully');
      
    } catch (error) {
      console.log(`⚠️  Navigation took longer than expected: ${error.message}`);
      console.log('🔍 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n')[0]
      });
    }
  }

  /**
   * Check if user is authenticated
   */
  async checkAuthenticationStatus() {
    try {
      console.log('🔍 Checking authentication status...');
      
      const authChecks = [
        // Check for Firebase auth in localStorage
        async () => await this.page.evaluate(() => {
          const authUser = localStorage.getItem('firebase:authUser:AIzaSyBgiwDZaJgKS-YoiM2dEyJA-JGHxr9cSaQ:[DEFAULT]');
          return authUser !== null;
        }),
        // Check for user name patterns
        async () => await this.page.evaluate(() => {
          const text = document.body.textContent;
          return text.includes('Cameron') || text.includes('Rout');
        }),
        // Check for Create New Deck button (authenticated users only)
        async () => await this.page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          return buttons.some(btn => btn.textContent.includes('Create New Deck'));
        })
      ];
      
      for (const check of authChecks) {
        const result = await check();
        if (result) {
          console.log('🔍 Authentication: ✅ Authenticated');
          return true;
        }
      }
      
      console.log('🔍 Authentication: ❌ Not authenticated');
      return false;
    } catch (error) {
      console.log('🔍 Authentication check error:', error.message);
      return false;
    }
  }

  /**
   * Handle authentication flow
   */
  async handleAuthentication() {
    if (this.isAuthenticated) {
      console.log('✅ Already authenticated');
      return true;
    }

    console.log('🔐 Authentication needed - browser window available for manual sign-in');
    console.log('🕐 Waiting 10 seconds for authentication...');
    
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    this.isAuthenticated = await this.checkAuthenticationStatus();
    
    if (this.isAuthenticated) {
      console.log('✅ Authentication successful!');
      await this.saveSession();
    } else {
      console.log('⚠️  Authentication not detected - continuing anyway');
    }
    
    return this.isAuthenticated;
  }

  /**
   * Save current session data
   */
  async saveSession() {
    try {
      const cookies = await this.page.cookies();
      
      // Try to get localStorage, but handle cases where it's not accessible
      let localStorage = {};
      try {
        localStorage = await this.page.evaluate(() => {
          const data = {};
          try {
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              data[key] = localStorage.getItem(key);
            }
          } catch (e) {
            // localStorage not accessible, return empty object
          }
          return data;
        });
      } catch (error) {
        console.log('⚠️  localStorage not accessible:', error.message);
        localStorage = {};
      }

      this.sessionData = {
        cookies,
        localStorage,
        authState: this.isAuthenticated,
        timestamp: new Date().toISOString()
      };

      await fs.writeFile('./browser-session-cookies.json', JSON.stringify(cookies, null, 2));
      await fs.writeFile('./browser-session-storage.json', JSON.stringify(localStorage, null, 2));
      
      console.log('💾 Session data saved');
    } catch (error) {
      console.log('⚠️  Failed to save session:', error.message);
    }
  }

  /**
   * Load saved session data
   */
  async loadSession() {
    try {
      // Load cookies
      if (await this.fileExists('./browser-session-cookies.json')) {
        const cookiesData = await fs.readFile('./browser-session-cookies.json', 'utf8');
        const cookies = JSON.parse(cookiesData);
        if (cookies && cookies.length > 0) {
          await this.page.setCookie(...cookies);
          console.log('🍪 Loaded saved cookies');
        }
      }
      
      // Load localStorage  
      if (await this.fileExists('./browser-session-storage.json')) {
        const storageData = await fs.readFile('./browser-session-storage.json', 'utf8');
        const localStorage = JSON.parse(storageData);
        if (localStorage && Object.keys(localStorage).length > 0) {
          try {
            await this.page.evaluate((data) => {
              try {
                for (const [key, value] of Object.entries(data)) {
                  localStorage.setItem(key, value);
                }
              } catch (e) {
                // localStorage not accessible, skip
                console.log('localStorage not accessible during restore');
              }
            }, localStorage);
            console.log('💾 Loaded saved localStorage');
          } catch (error) {
            console.log('⚠️  Could not restore localStorage:', error.message);
          }
        }
      }
    } catch (error) {
      console.log('⚠️  Could not load saved session:', error.message);
    }
  }

  /**
   * Close the browser service
   */
  async close(options = {}) {
    if (this.browser && this.browser.isConnected()) {
      console.log('💾 Saving session before close...');
      await this.saveSession();
      
      console.log('� Closing browser cleanly...');
      await this.browser.close();
      console.log('✅ Browser closed');
      
      this.browser = null;
      this.page = null;
      this.isInitialized = false;
      // Keep isAuthenticated state for next session
    }
  }

  /**
   * Health check for the browser instance
   */
  async healthCheck() {
    try {
      if (!this.browser || !this.browser.isConnected()) {
        return { healthy: false, reason: 'Browser not connected' };
      }
      
      if (!this.page) {
        return { healthy: false, reason: 'No page available' };
      }
      
      // Test page responsiveness
      await this.page.evaluate(() => document.title);
      
      return { 
        healthy: true, 
        isAuthenticated: this.isAuthenticated,
        currentUrl: await this.page.url()
      };
    } catch (error) {
      return { healthy: false, reason: error.message };
    }
  }

  async findChromePath() {
    console.log('🔍 Searching for Chrome executable...');
    const possiblePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'
    ];
    
    console.log('🔍 Checking paths:', possiblePaths);
    
    for (const chromePath of possiblePaths) {
      try {
        console.log(`🔍 Checking: ${chromePath}`);
        await fs.access(chromePath);
        console.log(`✅ Found Chrome at: ${chromePath}`);
        return chromePath;
      } catch (error) {
        console.log(`❌ Not found: ${chromePath}`);
        continue;
      }
    }
    
    console.log('⚠️  No Chrome executable found, using default');
    return null;
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
const browserService = new BrowserService();
export default browserService;
