import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { promises as fs } from 'fs';
import { resolve } from 'path';

/**
 * Shared browser session manager
 */
class BrowserSessionManager {
  co      if (options && options.keepSession) {
        console.log('💾 Session data saved for future runs');
        console.log('🔒 Browser will close, but session will be restored next time');
        // Always close the browser - session data is preserved for next run
        await this.browser.close();
        console.log('✅ Browser closed - session data preserved');
      } else {
        console.log('🔚 Closing browser session...');
        await this.browser.close();
        console.log('🔒 Browser session closed');
      }) {
    this.browser = null;
    this.page = null;
    this.isAuthenticated = false;
    this.sessionPersistent = false;
    this.stealthConfigured = false;
  }

  configureStealthPlugin() {
    if (!this.stealthConfigured) {
      const stealthPlugin = StealthPlugin();
      stealthPlugin.enabledEvasions.delete('iframe.contentWindow');
      stealthPlugin.enabledEvasions.delete('navigator.plugins'); 
      stealthPlugin.enabledEvasions.delete('media.codecs');
      puppeteer.use(stealthPlugin);
      this.stealthConfigured = true;
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

    // Try to reconnect to existing browser first
    try {
      console.log('🔍 Checking for existing browser session...');
      this.browser = await puppeteer.connect({
        browserURL: 'http://localhost:9222',
        defaultViewport: null
      });
      
      const pages = await this.browser.pages();
      this.page = pages.find(page => page.url().includes('notecards-1b054.web.app')) || pages[0];
      
      if (this.page) {
        console.log('🔄 Reconnected to existing browser session');
        return { browser: this.browser, page: this.page };
      }
    } catch (error) {
      console.log('🆕 No existing browser session found, creating new one...');
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
        '--remote-debugging-port=9222',
        ...(options.args || [])
      ],
      ignoreDefaultArgs: ['--enable-automation']
    });

    this.page = await this.browser.newPage();
    
    // Set realistic user agent
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36');

    this.sessionPersistent = options.persistent !== false;
    
    return { browser: this.browser, page: this.page };
  }

  async authenticateIfNeeded() {
    if (!this.page) {
      throw new Error('No active page. Call startSession() first.');
    }

    console.log('🔐 Checking authentication status...');

    // Load saved session if available
    await this.loadSavedSession();

    // Navigate to app
    console.log('🌐 Navigating to notecards app...');
    try {
      await this.page.goto('https://notecards-1b054.web.app', { 
        waitUntil: 'domcontentloaded',
        timeout: 60000 // Increase timeout to 60 seconds
      });
      
      // Wait a bit more for the app to fully load
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.log(`⚠️  Navigation took longer than expected: ${error.message}`);
      // Try to continue anyway - the page might have loaded
    }

    // Check if already authenticated
    this.isAuthenticated = await this.checkAuthenticationStatus();

    if (this.isAuthenticated) {
      console.log('✅ Already authenticated!');
      return true;
    }

    console.log('🔑 Authentication required. Starting authentication flow...');
    return await this.performAuthentication();
  }

  async loadSavedSession() {
    const cookiesPath = resolve('./session-cookies.json');
    const localStoragePath = resolve('./session-localStorage.json');
    
    if (await this.fileExists(cookiesPath)) {
      console.log('🍪 Loading saved cookies...');
      const cookies = JSON.parse(await fs.readFile(cookiesPath, 'utf8'));
      await this.page.setCookie(...cookies);
    }

    if (await this.fileExists(localStoragePath)) {
      console.log('💾 Loading saved localStorage...');
      const localStorage = JSON.parse(await fs.readFile(localStoragePath, 'utf8'));
      await this.page.evaluate((data) => {
        for (const [key, value] of Object.entries(data)) {
          localStorage.setItem(key, value);
        }
      }, localStorage);
    }
  }

  async checkAuthenticationStatus() {
    const authStatus = await this.page.evaluate(() => {
      const signInButton = document.querySelector('button');
      return {
        hasSignInButton: !!signInButton && signInButton.textContent.includes('Sign in with Google'),
        currentUrl: window.location.href,
        title: document.title
      };
    });

    console.log(`🔍 Auth check: ${authStatus.hasSignInButton ? 'Not authenticated' : 'Authenticated'}`);
    return !authStatus.hasSignInButton;
  }

  async performAuthentication() {
    console.log('👆 Please complete Google sign-in in the browser window...');
    console.log('⏳ Waiting for authentication to complete...');

    // Enhanced authentication detection with timeout
    let authSuccess = false;
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const currentUrl = await this.page.url();
        const pageContent = await this.page.content();
        const hasSignInButton = pageContent.includes('Sign in with Google');
        
        if (!hasSignInButton || currentUrl !== 'https://notecards-1b054.web.app/') {
          console.log('✅ Authentication detected!');
          authSuccess = true;
          break;
        }
        
        if (attempt % 6 === 0) { // Log every 30 seconds
          console.log(`⏳ Still waiting... (${attempt * 5}s elapsed)`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
      } catch (error) {
        console.log(`❌ Auth check error: ${error.message}`);
      }
    }

    if (authSuccess) {
      await this.saveSession();
      this.isAuthenticated = true;
      console.log('💾 Session saved for future use');
      return true;
    } else {
      console.log('❌ Authentication timeout. Please try again.');
      return false;
    }
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

      await fs.writeFile('./session-cookies.json', JSON.stringify(cookies, null, 2));
      await fs.writeFile('./session-localStorage.json', JSON.stringify(localStorage, null, 2));
      console.log('💾 Session data saved');
    } catch (error) {
      console.log('⚠️  Failed to save session:', error.message);
    }
  }

  async setupAutoSave() {
    if (!this.sessionPersistent) return;

    console.log('🔄 Setting up auto-save...');
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
        console.log('� Detaching browser (keeps running independently)...');
        this.browser.disconnect(); // Detach instead of close
        console.log('✅ Browser detached - session data saved');
        console.log('💡 Browser continues running. You can manually close it or reconnect later.');
      } else {
        console.log('�🔚 Closing browser session...');
        await this.browser.close();
        console.log('🔒 Browser session closed');
      }
      
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
export const browserSession = new BrowserSessionManager();
export default browserSession;
