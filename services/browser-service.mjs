/**
 * @fileoverview Universal Browser Service - Professional browser automation service
 * @description Provides a singleton browser service for testing, automation, and development
 * with environment-aware configuration, session management, and authentication handling.
 * 
 * @version 2.0.0
 * @author Cameron
 * @since 2025-09-08
 * 
 * @example
 * ```javascript
 * import browserService from './services/browser-service.mjs';
 * 
 * // Quick authentication
 * const authenticated = await browserService.quickAuth();
 * 
 * // Verify current auth status  
 * const isAuthenticated = await browserService.verifyAuthentication();
 * 
 * // Get browser connection for custom automation
 * const { browser, page } = await browserService.startup();
 * ```
 */

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { promises as fs } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createBrowserConfig, createTestingConfig, SERVICE_TYPE, AUTH_STRATEGY, logServiceConfig } from '../src/config/service-config.mjs';
import { prepareServiceAccountAuth, signInWithCustomToken } from './service-account-auth.mjs';

// Get absolute path to project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Universal Browser Service
 * 
 * @class BrowserService
 * @description A professional singleton service that manages browser instances
 * for testing, automation, and development tasks with proper environment 
 * configuration and lifecycle management.
 * 
 * @features
 * - Environment-aware configuration (development/test/staging/production)
 * - Professional session management with persistent storage
 * - Graceful authentication handling with multiple verification methods
 * - Proper lifecycle management and resource cleanup
 * - Cross-environment compatibility
 * - Stealth configuration for OAuth bypass
 * - Health monitoring and automatic recovery
 * - Simple API for common operations
 * 
 * @architecture
 * - Singleton pattern for resource efficiency
 * - Configuration-driven behavior
 * - Professional error handling and logging
 * - Clean separation of concerns
 * 
 * @example
 * ```javascript
 * // Simple authentication
 * const result = await browserService.quickAuth();
 * 
 * // Custom automation
 * const { browser, page } = await browserService.startup();
 * await page.goto('https://example.com');
 * await browserService.shutdown();
 * ```
 */
class BrowserService {
  /**
   * Creates a new BrowserService instance
   * 
   * @param {string|null} environment - Target environment (development/test/staging/production)
   * @param {string} serviceType - Service type from SERVICE_TYPE enum
   * 
   * @example
   * ```javascript
   * const service = new BrowserService('development', SERVICE_TYPE.BROWSER);
   * ```
   */
  constructor(environment = null, serviceType = SERVICE_TYPE.BROWSER) {
    this.browser = null;
    this.page = null;
    this.isAuthenticated = false;
    this.isInitialized = false;
    this.stealthConfigured = false;
    
    // Use professional service configuration
    this.config = createBrowserConfig(environment);
    this.serviceConfig = this.config; // Alias for backward compatibility
    this.environmentConfig = this.config.envConfig; // Legacy alias
    
    this.sessionData = {
      cookies: [],
      localStorage: {},
      authState: false
    };
    
    // Use configuration-driven paths
    this.paths = this.config.paths;
  }

  /**
   * Set environment configuration
   */
  setEnvironment(environment) {
    this.config = createBrowserConfig(environment);
    this.environmentConfig = this.config.envConfig; // Legacy alias
    this.paths = this.config.paths; // Update paths
    console.log('🔧 Browser service environment updated:', this.config.getSummary());
  }

  /**
   * Initialize the browser service
   */
  async initialize(options = {}) {
    console.log('🔍 Universal Browser Service Initialize called');
    console.log('🔍 Project root:', this.config.paths.projectRoot);
    console.log('🔍 Session directory:', this.paths.sessionDir);
    
    if (this.isInitialized && this.browser && this.browser.isConnected()) {
      console.log('🔄 Browser service already initialized and connected');
      return this.getConnection();
    }

    console.log('🚀 Initializing Universal Browser Service...');
    
    // Ensure session directory exists
    await this.ensureSessionDirectory();
    
    // Configure stealth plugin (exact working configuration from auth-setup.mjs)
    if (!this.stealthConfigured) {
      console.log('🥷 Configuring stealth plugin...');
      const stealthPlugin = StealthPlugin();
      
      // Working stealth configuration from auth-setup.mjs  
      stealthPlugin.enabledEvasions.delete('iframe.contentWindow');
      stealthPlugin.enabledEvasions.delete('navigator.plugins');
      stealthPlugin.enabledEvasions.delete('media.codecs');
      
      puppeteer.use(stealthPlugin);
      this.stealthConfigured = true;
      console.log('✅ Stealth plugin configured with working auth-setup configuration');
    }

    const chromePath = await this.findChromePath();
    
    console.log('🚀 Launching browser with configuration:', {
      headless: options.headless || process.env.PUPPETEER_HEADLESS === 'true' || false,
      userDataDir: this.paths.userDataDir,
      chromePath: chromePath || 'default Chromium'
    });

    this.browser = await puppeteer.launch({
      headless: options.headless || process.env.PUPPETEER_HEADLESS === 'true' || false,
      defaultViewport: null,
      executablePath: chromePath || undefined,
      userDataDir: this.paths.userDataDir,
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
        '--disable-popup-blocking',
        '--remote-debugging-port=9222',
        ...(options.args || [])
      ],
      ignoreDefaultArgs: [
        '--enable-automation',
        '--enable-blink-features=IdleDetection'
      ]
    });

    console.log('✅ Browser launched successfully');

    // Get or create a page
    const pages = await this.browser.pages();
    this.page = pages[0] || await this.browser.newPage();

    // Set up browser console logging
    this.page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      const prefix = {
        'log': '📋',
        'info': 'ℹ️',
        'warn': '⚠️',
        'error': '❌',
        'debug': '🐛'
      }[type] || '📄';
      console.log(`${prefix} [Browser ${type}] ${text}`);
    });

    // Set up page error logging
    this.page.on('pageerror', error => {
      console.log(`❌ [Browser Error] ${error.message}`);
    });

    // Set up request failure logging
    this.page.on('requestfailed', request => {
      const failure = request.failure();
      const errorText = failure ? failure.errorText : 'Unknown error';
      console.log(`🌐 [Request Failed] ${request.url()} - ${errorText}`);
    });

    // Enhanced stealth configuration for the page
    console.log('🥷 Applying enhanced stealth configuration...');
    
    // Set realistic user agent
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36');
    
    // Remove webdriver property and other automation indicators
    await this.page.evaluateOnNewDocument(() => {
      // Remove webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      
      // Override the automation detection
      Object.defineProperty(navigator, 'permissions', {
        get: () => ({
          query: () => Promise.resolve({ state: 'granted' })
        }),
      });
      
      // Mock chrome runtime to appear like regular browser
      if (!window.chrome) {
        window.chrome = {};
      }
      
      if (!window.chrome.runtime) {
        window.chrome.runtime = {
          onConnect: undefined,
          onMessage: undefined
        };
      }
      
      // Override plugins length to appear more realistic
      Object.defineProperty(navigator, 'plugins', {
        get: () => ({
          length: 5,
          0: { name: 'Chrome PDF Plugin' },
          1: { name: 'Chrome PDF Viewer' },
          2: { name: 'Native Client' },
          3: { name: 'Chromium PDF Plugin' },
          4: { name: 'Microsoft Edge PDF Plugin' }
        }),
      });
      
      // Override languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
      
      // Mock battery API
      Object.defineProperty(navigator, 'getBattery', {
        get: () => () => Promise.resolve({
          charging: true,
          chargingTime: 0,
          dischargingTime: Infinity,
          level: 1
        }),
      });
      
      // Override notification permissions
      Object.defineProperty(Notification, 'permission', {
        get: () => 'default',
      });
      
      // Remove automation signals
      delete window.__nightmare;
      delete window._phantom;
      delete window.callPhantom;
      delete window.__selenium_unwrapped;
      delete window.__webdriver_evaluate;
      delete window.__driver_evaluate;
      delete window.__webdriver_script_function;
      delete window.__webdriver_script_func;
      delete window.__webdriver_script_fn;
      delete window.__fxdriver_evaluate;
      delete window.__driver_unwrapped;
      delete window.__webdriver_unwrapped;
      delete window.__selenium_evaluate;
      delete window.__fxdriver_unwrapped;
      delete window.__webdriver_evaluate;
      
      // Make iframe detection harder
      try {
        if (window.parent && window.parent !== window) {
          Object.defineProperty(window, 'frameElement', {
            get: () => null,
          });
        }
      } catch (e) {}
    });
    
    // Set viewport to realistic size
    await this.page.setViewport({
      width: 1366,
      height: 768,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false
    });
    
    console.log('✅ Enhanced stealth configuration applied');

    // Load saved session
    console.log('💾 Loading saved session data...');
    await this.loadSession();

    this.isInitialized = true;
    console.log('✅ Universal Browser Service initialized successfully');

    return this.getConnection();
  }

  /**
   * Get browser connection for external use
   */
  getConnection() {
    if (!this.browser || !this.page) {
      throw new Error('Browser service not initialized. Call initialize() first.');
    }
    
    return {
      browser: this.browser,
      page: this.page,
      isAuthenticated: this.isAuthenticated,
      service: this // Provide access to service methods
    };
  }

  /**
   * Enhanced authentication with Google bypass techniques
   */
  async authenticateWithBypass() {
    console.log('🛡️  Starting enhanced authentication with Google bypass...');
    
    try {
      // First, navigate to the app normally
      await this.navigateToApp();
      
      // Wait for any initial auth redirects
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if we need authentication
      const isAuth = await this.checkAuthenticationStatus();
      if (isAuth) {
        console.log('✅ Already authenticated!');
        return true;
      }
      
      console.log('🔐 Authentication required. Looking for sign-in options...');
      
      // Look for Google sign-in button and click it
      const googleSignInFound = await this.page.evaluate(() => {
        // Look for various Google sign-in button patterns
        const selectors = [
          'button[data-provider="google"]',
          'button:contains("Sign in with Google")',
          'button:contains("Google")',
          '[data-testid="google-signin"]',
          '.google-signin',
          'button[class*="google"]'
        ];
        
        for (const selector of selectors) {
          try {
            const element = document.querySelector(selector) || 
                           Array.from(document.querySelectorAll('button')).find(btn => 
                             btn.textContent.toLowerCase().includes('google')
                           );
            if (element) {
              element.click();
              return true;
            }
          } catch (e) {
            // Continue to next selector
          }
        }
        return false;
      });
      
      if (googleSignInFound) {
        console.log('🔍 Google sign-in button clicked, waiting for popup/redirect...');
        
        // Wait for authentication flow
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check authentication again
        const finalAuth = await this.checkAuthenticationStatus();
        if (finalAuth) {
          console.log('✅ Authentication successful!');
          await this.saveSession();
          return true;
        }
      }
      
      console.log('🔐 Manual authentication required');
      console.log('🛡️  Enhanced stealth mode should help bypass "browser not secure" errors');
      console.log('');
      console.log('📋 MANUAL AUTHENTICATION STEPS:');
      console.log('   1. Look for "Sign in with Google" button in the browser');
      console.log('   2. Click it and complete Google authentication');
      console.log('   3. If you see "browser not secure" - try again, stealth should help');
      console.log('   4. Wait for the page to reload with your account info');
      console.log('');
      console.log('⏳ Waiting up to 60 seconds for authentication...');
      
      // Check authentication every 5 seconds for up to 60 seconds
      for (let attempt = 1; attempt <= 12; attempt++) {
        console.log(`🔍 Auth check ${attempt}/12 (${attempt * 5}s elapsed)...`);
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const manualAuth = await this.checkAuthenticationStatus();
        if (manualAuth) {
          console.log('✅ Manual authentication successful!');
          await this.saveSession();
          return true;
        }
      }
      
      console.log('❌ CRITICAL FAILURE: Authentication not completed within 60 seconds');
      console.log('❌ Please ensure you completed the Google sign-in process');
      throw new Error('Authentication required but not completed within timeout period.');
      
    } catch (error) {
      console.log('❌ Authentication bypass failed:', error.message);
      throw error; // Re-throw to ensure failure propagates
    }
  }

  /**
   * Navigate to the notecards app with session restoration
   */
  async navigateToApp(options = {}) {
    const { 
      appUrl = this.environmentConfig.getBaseUrl(),
      waitForAuth = true 
    } = options;
    
    console.log(`🌐 Navigating to notecards app at ${appUrl}...`);
    console.log(`🔧 Environment: ${this.environmentConfig.environment} (${this.environmentConfig.isLocal() ? 'local' : 'remote'})`);
    
    try {
      await this.page.goto(appUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });
      
      // Wait for app to load
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Load localStorage after navigation (localStorage is domain-specific)
      await this.loadStorageAfterNavigation();
      
      // Check authentication status
      this.isAuthenticated = await this.checkAuthenticationStatus();
      
      console.log('✅ Navigation completed successfully');
      
    } catch (error) {
      console.log(`⚠️  Navigation error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  async checkAuthenticationStatus() {
    try {
      console.log('🔍 Checking authentication status...');
      
      // Wait for page to fully load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const authChecks = [
        // Check for Firebase auth in localStorage (most reliable)
        async () => await this.page.evaluate(() => {
          const authKeys = Object.keys(localStorage).filter(key => 
            key.includes('firebase:authUser') || 
            key.includes('firebase:auth') ||
            key.includes('authUser')
          );
          return authKeys.length > 0 && authKeys.some(key => {
            const value = localStorage.getItem(key);
            return value && value !== 'null' && value !== '{}';
          });
        }),
        
        // Check for user name patterns in page content
        async () => await this.page.evaluate(() => {
          const text = document.body.textContent.toLowerCase();
          return text.includes('cameron') || text.includes('logout') || text.includes('sign out');
        }),
        
        // Check for authenticated UI elements
        async () => await this.page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
          return buttons.some(btn => {
            const text = btn.textContent.toLowerCase();
            return text.includes('create new deck') || 
                   text.includes('add deck') || 
                   text.includes('logout') ||
                   text.includes('sign out');
          });
        }),
        
        // Check if we're NOT on a sign-in page
        async () => await this.page.evaluate(() => {
          const text = document.body.textContent.toLowerCase();
          const hasSignIn = text.includes('sign in with google') || text.includes('sign in');
          return !hasSignIn; // If no sign-in button, likely authenticated
        })
      ];
      
      let passedChecks = 0;
      for (const check of authChecks) {
        try {
          const result = await check();
          if (result) {
            passedChecks++;
          }
        } catch (checkError) {
          console.log('🔍 Auth check failed:', checkError.message);
        }
      }
      
      // Consider authenticated if at least 2 checks pass
      const isAuthenticated = passedChecks >= 2;
      
      console.log(`🔍 Authentication: ${isAuthenticated ? '✅' : '❌'} ${isAuthenticated ? 'Authenticated' : 'Not authenticated'} (${passedChecks}/4 checks passed)`);
      return isAuthenticated;
      
    } catch (error) {
      console.log('🔍 Authentication check error:', error.message);
      return false;
    }
  }

  /**
   * Handle authentication flow - AUTHENTICATION IS REQUIRED
   */
  async handleAuthentication() {
    if (this.isAuthenticated) {
      console.log('✅ Already authenticated');
      return true;
    }

    console.log('🔐 Authentication REQUIRED - browser window is open for manual sign-in');
    console.log('');
    console.log('📋 MANUAL AUTHENTICATION STEPS:');
    console.log('   1. Use the browser window that just opened');
    console.log('   2. Click "Sign in with Google" or similar');
    console.log('   3. Complete Google authentication');
    console.log('   4. Wait for the page to reload with your account');
    console.log('');
    console.log('🛡️  Enhanced stealth mode should help bypass "browser not secure" errors');
    console.log('⏳ Waiting up to 60 seconds for you to complete authentication...');
    console.log('');
    
    // Check authentication every 5 seconds for up to 60 seconds
    for (let attempt = 1; attempt <= 12; attempt++) {
      console.log(`🔍 Authentication check ${attempt}/12 (${attempt * 5} seconds elapsed)...`);
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      this.isAuthenticated = await this.checkAuthenticationStatus();
      
      if (this.isAuthenticated) {
        console.log('✅ Authentication successful!');
        await this.saveSession();
        return true;
      }
    }
    
    console.log('❌ CRITICAL FAILURE: Authentication not completed within 60 seconds');
    console.log('❌ Please ensure you completed the sign-in process');
    console.log('❌ If you got "browser not secure" error, the stealth config may need adjustment');
    throw new Error('Authentication required but not completed within timeout period.');
  }

  /**
   * Simple authentication setup - handles everything internally
   * Returns: boolean indicating success
   */
  async setupAuthentication(url = null) {
    try {
      console.log('🔐 Setting up authentication...');
      
      const result = await this.authenticate(url);
      
      if (result.success) {
        console.log('✅ Authentication setup complete!');
        return true;
      } else {
        console.log('❌ Authentication setup failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Authentication error:', error.message);
      return false;
    }
  }

  /**
   * Simple verification - just returns true/false
   */
  /**
   * Verifies current authentication status
   * 
   * @async
   * @method verifyAuthentication
   * @returns {Promise<boolean>} True if authenticated, false otherwise
   * 
   * @description
   * Initializes browser if needed, navigates to app, checks authentication
   * using multiple verification methods, then closes browser to free resources.
   * Perfect for CI/CD pipelines and status checks.
   * 
   * @example
   * ```javascript
   * const isAuthenticated = await browserService.verifyAuthentication();
   * console.log(isAuthenticated ? 'Logged in' : 'Not authenticated');
   * ```
   * 
   * @throws {Error} When browser operations fail
   * @since 2.0.0
   */
  async verifyAuthentication() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      await this.navigateToApp();
      const result = await this.checkAuthenticationStatus();
      
      // Always close the browser after verification
      await this.close();
      
      return result;
    } catch (error) {
      console.error('❌ Verification error:', error.message);
      
      // Ensure browser is closed even on error
      try {
        await this.close();
      } catch (closeError) {
        // Ignore close errors
      }
      
      return false;
    }
  }

  /**
   * Starts up the browser service and returns connection details
   * 
   * @async
   * @method startup
   * @param {Object} options - Startup configuration options
   * @param {boolean} options.checkAuth - Whether to check authentication status
   * @param {string} options.url - Optional target URL
   * @returns {Promise<Object>} Startup result with ready state and authentication info
   * 
   * @description
   * Professional startup method that initializes the browser, optionally navigates
   * to the app, and returns detailed status information. Use this for custom
   * automation workflows where you need browser access.
   * 
   * @example
   * ```javascript
   * // Basic startup
   * const result = await browserService.startup();
   * if (result.ready) {
   *   const { browser, page } = browserService.getBrowser();
   * }
   * 
   * // Startup with authentication check
   * const result = await browserService.startup({ checkAuth: true });
   * console.log('Authenticated:', result.authenticated);
   * ```
   * 
   * @returns {Promise<{ready: boolean, authenticated: boolean, browser: Browser, page: Page}>}
   * @throws {Error} When browser initialization fails
   * @since 2.0.0
   */
  async startup(options = {}) {
    try {
      console.log('🚀 Starting browser service...');
      
      const connection = await this.initialize(options);
      
      console.log('✅ Browser service ready');
      return {
        ready: true,
        authenticated: connection.isAuthenticated,
        url: this.config.getAppUrl()
      };
    } catch (error) {
      console.error('❌ Startup error:', error.message);
      return { ready: false, error: error.message };
    }
  }

  /**
   * Cleanly shuts down the browser service
   * 
   * @async
   * @method shutdown
   * @returns {Promise<boolean>} True if shutdown successful
   * 
   * @description
   * Professional shutdown method that saves session data and cleanly closes
   * the browser. Always call this to ensure proper resource cleanup.
   * 
   * @example
   * ```javascript
   * // Standard shutdown
   * const success = await browserService.shutdown();
   * console.log('Shutdown successful:', success);
   * ```
   * 
   * @throws {Error} When browser close operations fail
   * @since 2.0.0
   */
  async shutdown() {
    try {
      await this.close();
      return true;
    } catch (error) {
      console.error('❌ Shutdown error:', error.message);
      return false;
    }
  }

  /**
   * One-liner authentication flow
   */
  /**
   * Performs quick authentication setup
   * 
   * @async
   * @method quickAuth
   * @param {string|null} url - Optional target URL (defaults to configured app URL)
   * @returns {Promise<boolean>} True if authentication successful, false otherwise
   * 
   * @description
   * Initializes the browser service, checks existing authentication, and
   * handles authentication flow if needed. Designed for simple one-liner usage.
   * 
   * @example
   * ```javascript
   * // Quick auth with default URL
   * const authenticated = await browserService.quickAuth();
   * 
   * // Quick auth with custom URL
   * const authenticated = await browserService.quickAuth('http://localhost:3000');
   * ```
   * 
   * @throws {Error} When browser initialization fails
   * @since 2.0.0
   */
  async quickAuth(url = null) {
    const started = await this.startup();
    if (!started.ready) return false;

    if (started.authenticated) {
      console.log('[Auth] Already authenticated');
      return true;
    }

    return await this.setupAuthentication(url);
  }

  async quickServiceAuth(options = {}) {
    const {
      url = null,
      userEmail = process.env.E2E_TEST_USER_EMAIL,
      headless = true,
      keepBrowserOpen = false,
      timeoutMs = 60000,
      claims = {}
    } = options;

    const resolvedUrl =
      url ||
      (this.environmentConfig && typeof this.environmentConfig.getBaseUrl === 'function'
        ? this.environmentConfig.getBaseUrl()
        : this.config.getAppUrl());

    let shouldClose = !keepBrowserOpen;

    try {
      const tokenInfo = await prepareServiceAccountAuth({ userEmail, claims });

      const startupResult = await this.startup({ headless });
      if (!startupResult.ready) {
        console.error('[service-account] Browser service failed to start');
        return false;
      }

      await this.navigateToApp({ appUrl: resolvedUrl });

      const authDetails = await signInWithCustomToken(this.page, tokenInfo.token, { timeoutMs });

      console.log(
        `[service-account] Signed in as ${authDetails?.email || tokenInfo.userEmail || 'service account user'}`
      );

      this.isAuthenticated = true;
      await this.saveSession();

      if (shouldClose) {
        await this.close();
        shouldClose = false;
      }

      return true;
    } catch (error) {
      console.error('[service-account] Authentication failed:', error.message);
      this.isAuthenticated = false;
      return false;
    } finally {
      if (shouldClose) {
        try {
          await this.close();
        } catch (closeError) {
          // ignore close failures
        }
      }
    }
  }

  /**
   * Get browser and page - simple access
   */
  getBrowser() {
    if (!this.isInitialized) {
      throw new Error('Service not initialized. Call startup() first.');
    }
    return { browser: this.browser, page: this.page };
  }

  /**
   * Check if service is ready
   */
  isReady() {
    return this.isInitialized && this.browser && this.browser.isConnected();
  }
  async authenticate(url = null, options = {}) {
    const targetUrl = url || this.config.getAppUrl();
    const authConfig = this.config.auth;
    
    console.log('🔐 Starting professional authentication flow...');
    console.log(`🎯 Target: ${targetUrl}`);
    console.log(`🔧 Strategy: ${this.config.getAuthStrategy()}`);
    console.log(`⏱️  Timeout: ${authConfig.timeout / 1000}s`);
    
    // Check if authentication is required
    if (!this.config.isAuthRequired()) {
      console.log('⏩ Authentication not required for this environment');
      return { success: true, skipped: true };
    }
    
    // Initialize browser if not already done
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    // Check existing authentication first
    await this.navigateToApp({ appUrl: targetUrl });
    this.isAuthenticated = await this.checkAuthenticationStatus();
    
    if (this.isAuthenticated) {
      console.log('✅ Already authenticated');
      return { success: true, existing: true };
    }
    
    // Perform authentication based on strategy
    const authStrategy = this.config.getAuthStrategy();
    let authResult;
    
    switch (authStrategy) {
      case AUTH_STRATEGY.MANUAL:
        authResult = await this.performManualAuthentication(targetUrl, authConfig);
        break;
      case AUTH_STRATEGY.SESSION_RESTORE:
        authResult = await this.performSessionRestoreAuthentication(targetUrl, authConfig);
        break;
      case AUTH_STRATEGY.SKIP:
        console.log('⏩ Authentication skipped by strategy');
        return { success: true, skipped: true };
      default:
        throw new Error(`Unknown authentication strategy: ${authStrategy}`);
    }
    
    // Save session if authentication was successful
    if (authResult.success) {
      console.log('💾 Saving authentication session...');
      await this.saveSession();
      this.isAuthenticated = true;
    }
    
    return authResult;
  }

  /**
   * Manual authentication with professional user guidance
   */
  async performManualAuthentication(targetUrl, authConfig) {
    console.log('\n🎯 MANUAL AUTHENTICATION REQUIRED');
    console.log('==================================');
    console.log('📋 Please complete these steps in the browser window:');
    console.log('   1. Click "Sign in with Google"');
    console.log('   2. Enter your Google credentials');
    console.log('   3. Complete any 2FA if required');
    console.log('   4. Wait for the app to load with your account');
    console.log('');
    console.log('🛡️  Stealth configuration should bypass security warnings');
    console.log('⏳ Monitoring authentication automatically...\n');

    const startTime = Date.now();
    const timeout = authConfig.timeout;
    
    while (Date.now() - startTime < timeout) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      console.log(`🔍 Authentication check (${elapsed}s elapsed)...`);
      
      this.isAuthenticated = await this.checkAuthenticationStatus();
      
      if (this.isAuthenticated) {
        console.log('\n✅ AUTHENTICATION SUCCESSFUL!');
        return { success: true, manual: true, duration: elapsed };
      }
    }
    
    console.log('\n⚠️  AUTHENTICATION TIMEOUT');
    console.log('💡 You can try again or check for authentication issues');
    
    if (authConfig.fallbackToSkip) {
      console.log('⏩ Falling back to skip authentication');
      return { success: true, skipped: true, timeout: true };
    }
    
    return { success: false, timeout: true };
  }

  /**
   * Session restore authentication
   */
  async performSessionRestoreAuthentication(targetUrl, authConfig) {
    console.log('🔄 Attempting session restore authentication...');
    
    const sessionRestored = await this.restoreSession();
    
    if (sessionRestored) {
      await this.navigateToApp({ appUrl: targetUrl });
      this.isAuthenticated = await this.checkAuthenticationStatus();
      
      if (this.isAuthenticated) {
        console.log('✅ Session restore authentication successful');
        return { success: true, restored: true };
      } else {
        console.log('⚠️  Session restored but authentication invalid');
        // Fall back to manual authentication
        return await this.performManualAuthentication(targetUrl, authConfig);
      }
    } else {
      console.log('📝 No session to restore, falling back to manual authentication');
      return await this.performManualAuthentication(targetUrl, authConfig);
    }
  }

  /**
   * Professional close method with proper cleanup
   */
  async close() {
    console.log('🔒 Closing browser service...');
    
    try {
      // Save session if authenticated
      if (this.isAuthenticated && this.config.session.persistent) {
        console.log('💾 Saving session before closing...');
        await this.saveSession();
      }
      
      // Close browser gracefully
      if (this.browser) {
        await this.browser.close();
        console.log('✅ Browser closed successfully');
      }
      
      // Reset state
      this.browser = null;
      this.page = null;
      this.isInitialized = false;
      this.isAuthenticated = false;
      
      console.log('🧹 Service cleanup completed');
      
    } catch (error) {
      console.error('⚠️  Error during close:', error.message);
      // Force cleanup anyway
      this.browser = null;
      this.page = null;
      this.isInitialized = false;
      this.isAuthenticated = false;
    }
  }

  /**
   * Save current session data to absolute paths
   */
  async saveSession() {
    try {
      await this.ensureSessionDirectory();
      
      const cookies = await this.page.cookies();
      
      // Get localStorage safely
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
            // localStorage not accessible
          }
          return data;
        });
      } catch (error) {
        console.log('⚠️  localStorage not accessible:', error.message);
      }

      this.sessionData = {
        cookies,
        localStorage,
        authState: this.isAuthenticated,
        timestamp: new Date().toISOString()
      };

      await fs.writeFile(this.paths.cookiesFile, JSON.stringify(cookies, null, 2));
      await fs.writeFile(this.paths.storageFile, JSON.stringify(localStorage, null, 2));
      
      console.log('💾 Session data saved to:', this.paths.sessionDir);
    } catch (error) {
      console.log('⚠️  Failed to save session:', error.message);
    }
  }

  /**
   * Load saved session data from absolute paths
   */
  async loadSession() {
    try {
      // Load cookies first
      if (await this.fileExists(this.paths.cookiesFile)) {
        const cookiesData = await fs.readFile(this.paths.cookiesFile, 'utf8');
        const cookies = JSON.parse(cookiesData);
        if (cookies && cookies.length > 0) {
          await this.page.setCookie(...cookies);
          console.log('🍪 Loaded saved cookies');
        }
      }
    } catch (error) {
      console.log('⚠️  Could not load saved session:', error.message);
    }
  }

  /**
   * Load localStorage after navigating to the target domain
   */
  async loadStorageAfterNavigation() {
    try {
      if (await this.fileExists(this.paths.storageFile)) {
        const storageData = await fs.readFile(this.paths.storageFile, 'utf8');
        const localStorage = JSON.parse(storageData);
        if (localStorage && Object.keys(localStorage).length > 0) {
          try {
            await this.page.evaluate((data) => {
              try {
                for (const [key, value] of Object.entries(data)) {
                  localStorage.setItem(key, value);
                }
                console.log('localStorage restored with keys:', Object.keys(data));
              } catch (e) {
                console.log('localStorage not accessible during restore');
              }
            }, localStorage);
            console.log('💾 Loaded saved localStorage after navigation');
          } catch (error) {
            console.log('⚠️  Could not restore localStorage:', error.message);
          }
        }
      }
    } catch (error) {
      console.log('⚠️  Could not load localStorage:', error.message);
    }
  }

  /**
   * Close the browser service
   */
  async close(options = {}) {
    if (this.browser && this.browser.isConnected()) {
      console.log('💾 Saving session before close...');
      await this.saveSession();
      
      console.log('🔄 Closing browser cleanly...');
      await this.browser.close();
      console.log('✅ Browser closed');
      
      this.browser = null;
      this.page = null;
      this.isInitialized = false;
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

  /**
   * Authenticate using the exact working configuration from auth-setup.mjs
   * This method recreates the exact working browser configuration that 
   * successfully bypassed Google's "browser not secure" detection
   */
  async authenticateWithWorkingConfig(url = null) {
    const targetUrl = url || this.environmentConfig.getBaseUrl();
    
    console.log('🥷 USING EXACT WORKING AUTH-SETUP CONFIGURATION...');
    console.log(`🎯 Target URL: ${targetUrl}`);
    console.log(`🔧 Environment: ${this.environmentConfig.environment}`);
    
    // Clean any existing browser instance
    if (this.browser) {
      try {
        await this.browser.close();
      } catch (error) {
        // Ignore errors during cleanup
      }
      this.browser = null;
      this.page = null;
    }
    
    // Configure stealth plugin exactly like auth-setup.mjs
    if (!this.stealthConfigured) {
      const stealthPlugin = StealthPlugin();
      stealthPlugin.enabledEvasions.delete('iframe.contentWindow');
      stealthPlugin.enabledEvasions.delete('navigator.plugins');
      stealthPlugin.enabledEvasions.delete('media.codecs');
      puppeteer.use(stealthPlugin);
      this.stealthConfigured = true;
    }
    
    const chromePath = await this.findChromePath();
    
    // Launch browser with EXACT auth-setup.mjs configuration
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      executablePath: chromePath || undefined,
      userDataDir: this.paths.authUserDataDir, // Use separate auth directory like auth-setup.mjs
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

    this.page = await this.browser.newPage();

    // Set realistic user agent like auth-setup.mjs
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36');
    
    // Remove webdriver property like auth-setup.mjs
    await this.page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });

    console.log('🌐 Navigating to your notecards app...');
    await this.page.goto(targetUrl, { waitUntil: 'networkidle0' });

    console.log('👆 Please complete the Google sign-in manually in the browser window...');
    console.log('⏳ Waiting for you to complete authentication...');
    console.log('💡 Using EXACT working configuration from auth-setup.mjs!');

    // Enhanced authentication detection with polling (like auth-setup.mjs)
    let authSuccess = false;
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const currentUrl = await this.page.url();
        const pageContent = await this.page.content();
        const hasSignInButton = pageContent.includes('Sign in with Google');
        
        console.log(`🔄 Check ${attempt}/${maxAttempts} - URL: ${currentUrl.substring(0, 50)}...`);
        
        const baseUrl = targetUrl.endsWith('/') ? targetUrl : targetUrl + '/';
        if (currentUrl !== baseUrl || !hasSignInButton) {
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

    // Save session data like auth-setup.mjs (to the working file locations)
    const cookies = await this.page.cookies();
    await fs.writeFile(this.paths.authCookiesFile, JSON.stringify(cookies, null, 2));
    
    const localStorage = await this.page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }
      return data;
    });
    
    await fs.writeFile(this.paths.authStorageFile, JSON.stringify(localStorage, null, 2));

    console.log('💾 Session data saved to working auth-setup locations:');
    console.log(`   - Cookies: ${this.paths.authCookiesFile}`);
    console.log(`   - LocalStorage: ${this.paths.authStorageFile}`);
    console.log(`   - Cookies count: ${cookies.length}`);
    
    this.isAuthenticated = authSuccess;
    this.isInitialized = true;
    
    return authSuccess;
  }

  /**
   * Professional Authentication API
   * 
   * Handles authentication with proper lifecycle management.
   * Automatically closes browser and saves session when complete.
   */
  async authenticate(options = {}) {
    const {
      url = null,
      environment = null,
      timeout = 300000, // 5 minutes default
      keepBrowserOpen = false,
      waitForCompletion = true
    } = options;

    // Set environment if provided
    if (environment) {
      this.setEnvironment(environment);
    }

    const targetUrl = url || this.environmentConfig.getBaseUrl();
    
    console.log('🔐 Professional Authentication Setup');
    console.log('=====================================');
    console.log(`🎯 Target: ${targetUrl}`);
    console.log(`🔧 Environment: ${this.environmentConfig.environment}`);
    console.log(`⏱️  Timeout: ${timeout / 1000} seconds`);
    console.log(`🖥️  Keep Browser Open: ${keepBrowserOpen}`);

    try {
      const authSuccess = await this.authenticateWithWorkingConfig(targetUrl);
      
      if (authSuccess) {
        console.log('\n✅ AUTHENTICATION SUCCESSFUL!');
        console.log('💾 Session data saved for future use');
        
        if (!keepBrowserOpen) {
          console.log('🔒 Closing browser (authentication complete)...');
          await this.close();
        }
        
        return {
          success: true,
          environment: this.environmentConfig.environment,
          url: targetUrl,
          sessionSaved: true,
          browserOpen: keepBrowserOpen
        };
      } else {
        console.log('\n⚠️  Authentication may not have completed');
        console.log('💾 Session data saved anyway');
        
        if (!keepBrowserOpen) {
          console.log('🔒 Closing browser...');
          await this.close();
        }
        
        return {
          success: false,
          environment: this.environmentConfig.environment,
          url: targetUrl,
          sessionSaved: true,
          browserOpen: keepBrowserOpen,
          reason: 'Authentication not detected within timeout'
        };
      }
      
    } catch (error) {
      console.error('\n❌ Authentication failed:', error.message);
      
      if (!keepBrowserOpen) {
        console.log('🔒 Closing browser due to error...');
        await this.close();
      }
      
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  /**
   * Check if session files exist
   */
  async sessionExists() {
    try {
      await fs.access(this.paths.authCookiesFile);
      await fs.access(this.paths.authStorageFile);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clear all session data
   */
  async clearSession() {
    const filesToDelete = [
      this.paths.authCookiesFile,
      this.paths.authStorageFile,
      this.paths.cookiesFile,
      this.paths.storageFile
    ];
    
    for (const file of filesToDelete) {
      try {
        await fs.unlink(file);
        console.log(`🗑️  Deleted: ${file}`);
      } catch (error) {
        // File doesn't exist, that's fine
      }
    }
    
    // Clear user data directories
    const dirsToDelete = [
      this.paths.authUserDataDir,
      this.paths.userDataDir
    ];
    
    for (const dir of dirsToDelete) {
      try {
        await fs.rmdir(dir, { recursive: true });
        console.log(`🗑️  Deleted directory: ${dir}`);
      } catch (error) {
        // Directory doesn't exist, that's fine
      }
    }
  }

  /**
   * Ensure session directory exists
   */
  async ensureSessionDirectory() {
    try {
      await fs.mkdir(this.paths.sessionDir, { recursive: true });
    } catch (error) {
      // Directory already exists, that's fine
    }
  }

  /**
   * Find Chrome installation
   */
  async findChromePath() {
    const possiblePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'
    ];
    
    for (const chromePath of possiblePaths) {
      try {
        await fs.access(chromePath);
        console.log(`✅ Found Chrome at: ${chromePath}`);
        return chromePath;
      } catch {
        continue;
      }
    }
    
    console.log('⚠️  Chrome not found, using default Chromium');
    return null;
  }

  /**
   * Check if file exists
   */
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

/**
 * CLI functionality - makes the service directly executable
 */
async function handleCLI() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🔍 Browser Service CLI');
    console.log('======================');
    console.log('');
    console.log('Usage: node services/browser-service.mjs <command> [options]');
    console.log('');
    console.log('Commands:');
    console.log('  auth              Setup authentication');
    console.log('  verify            Verify authentication');
    console.log('  init              Initialize browser service');
    console.log('  test              Run basic functionality test');
    console.log('');
    console.log('Options:');
    console.log('  --environment=<env>    Set environment (development, test, staging, production)');
    console.log('  --url=<url>           Custom application URL');
    console.log('  --headless            Run in headless mode');
    console.log('  --debug               Enable debug logging');
    console.log('  --timeout=<ms>        Set timeout in milliseconds');
    console.log('');
    console.log('Examples:');
    console.log('  node services/browser-service.mjs auth');
    console.log('  node services/browser-service.mjs auth --environment=production');
    console.log('  node services/browser-service.mjs verify --debug');
    console.log('  node services/browser-service.mjs init --headless');
    return;
  }
  
  const command = args[0];
  const options = {};
  
  // Parse options
  for (const arg of args.slice(1)) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      if (value) {
        options[key] = value;
      } else {
        options[key] = true;
      }
    }
  }
  
  // Apply environment overrides
  if (options.environment) {
    process.env.NOTECARD_ENV = options.environment;
  }
  if (options.url) {
    process.env.NOTECARD_APP_URL = options.url;
  }
  if (options.headless) {
    process.env.PUPPETEER_HEADLESS = 'true';
  }
  if (options.debug) {
    process.env.DEBUG = 'true';
  }
  if (options.timeout) {
    process.env.AUTH_TIMEOUT = options.timeout;
  }
  
  try {
    switch (command) {
      case 'auth':
      case 'authenticate':
        await handleAuthCommand(options);
        break;
        
      case 'verify':
        await handleVerifyCommand(options);
        break;
        
      case 'init':
      case 'initialize':
        await handleInitCommand(options);
        break;
        
      case 'test':
        await handleTestCommand(options);
        break;
        
      default:
        console.error(`❌ Unknown command: ${command}`);
        console.error('   Run without arguments to see usage');
        process.exit(1);
    }
  } catch (error) {
    console.error(`💥 Command failed: ${error.message}`);
    if (options.debug) {
      console.error(error.stack);
    }
    
    // Ensure cleanup
    try {
      await browserService.close();
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    
    process.exit(1);
  }
}

async function handleAuthCommand(options) {
  console.log('🔐 Browser Service Authentication');
  console.log('=================================');
  
  const result = await browserService.authenticate();
  
  if (result.success) {
    console.log('\n✅ AUTHENTICATION SUCCESSFUL!');
    
    if (result.skipped) {
      console.log('⏩ Authentication was skipped for this environment');
    } else if (result.existing) {
      console.log('🔄 Used existing authentication session');
    } else if (result.manual) {
      console.log(`👤 Manual authentication completed in ${result.duration}s`);
    } else if (result.restored) {
      console.log('💾 Authentication restored from session');
    }
    
    await browserService.close();
  } else {
    console.error('\n❌ AUTHENTICATION FAILED');
    if (result.timeout) {
      console.error('⏰ Authentication timed out');
    }
    await browserService.close();
    process.exit(1);
  }
}

async function handleVerifyCommand(options) {
  console.log('🔍 Browser Service Verification');
  console.log('===============================');
  
  await browserService.initialize();
  await browserService.navigateToApp();
  const isAuthenticated = await browserService.checkAuthenticationStatus();
  
  if (isAuthenticated) {
    console.log('✅ AUTHENTICATION VERIFIED');
    console.log('   Session is valid and active');
  } else {
    console.log('❌ NOT AUTHENTICATED');
    console.log('   Run auth command to authenticate');
  }
  
  await browserService.close();
}

async function handleInitCommand(options) {
  console.log('🚀 Browser Service Initialization');
  console.log('=================================');
  
  const connection = await browserService.initialize();
  
  console.log('✅ Browser service initialized');
  console.log(`🔐 Authentication status: ${connection.isAuthenticated ? 'Authenticated' : 'Not authenticated'}`);
  console.log(`🌐 Service ready for: ${browserService.config.getAppUrl()}`);
  
  await browserService.close();
}

async function handleTestCommand(options) {
  console.log('🧪 Browser Service Test');
  console.log('=======================');
  
  // Test initialization
  console.log('1. Testing initialization...');
  await browserService.initialize();
  console.log('   ✅ Initialization successful');
  
  // Test navigation
  console.log('2. Testing navigation...');
  await browserService.navigateToApp();
  console.log('   ✅ Navigation successful');
  
  // Test authentication check
  console.log('3. Testing authentication check...');
  const isAuthenticated = await browserService.checkAuthenticationStatus();
  console.log(`   ${isAuthenticated ? '✅' : '⚠️'} Authentication status: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`);
  
  // Test connection
  console.log('4. Testing connection...');
  const connection = browserService.getConnection();
  console.log('   ✅ Connection object available');
  
  console.log('\n🎉 All tests completed successfully!');
  await browserService.close();
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  SIGINT received - shutting down gracefully...');
  try {
    await browserService.close();
    console.log('✅ Graceful shutdown complete');
  } catch (error) {
    console.error('⚠️  Error during shutdown:', error.message);
  }
  process.exit(0);
});

// If this file is being run directly (not imported), handle CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  handleCLI().catch(async (error) => {
    console.error('💥 CLI Error:', error.message);
    try {
      await browserService.close();
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    process.exit(1);
  });
}
