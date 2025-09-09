/**
 * Service Configuration
 * 
 * Professional service configuration for browser automation, testing,
 * and other service components. Uses environment configuration as the
 * foundation and provides service-specific settings.
 */

import { config, ENVIRONMENT, createConfig } from './environments.mjs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..', '..');

/**
 * Service types enum
 */
export const SERVICE_TYPE = {
  BROWSER: 'browser',
  TESTING: 'testing',
  AUTHENTICATION: 'authentication',
  AUTOMATION: 'automation'
};

/**
 * Authentication strategies enum
 */
export const AUTH_STRATEGY = {
  MANUAL: 'manual',
  AUTOMATED: 'automated',
  SKIP: 'skip',
  SESSION_RESTORE: 'session_restore'
};

/**
 * Browser configuration per environment
 */
const BROWSER_CONFIGS = {
  [ENVIRONMENT.DEVELOPMENT]: {
    headless: false,
    devtools: false,
    slowMo: 0,
    timeout: 30000,
    authStrategy: AUTH_STRATEGY.SESSION_RESTORE,
    stealth: true
  },
  [ENVIRONMENT.TEST]: {
    headless: process.env.CI === 'true',
    devtools: false,
    slowMo: 0,
    timeout: 30000,
    authStrategy: AUTH_STRATEGY.SESSION_RESTORE,
    stealth: true
  },
  [ENVIRONMENT.STAGING]: {
    headless: process.env.CI === 'true',
    devtools: false,
    slowMo: 0,
    timeout: 45000,
    authStrategy: AUTH_STRATEGY.MANUAL,
    stealth: true
  },
  [ENVIRONMENT.PRODUCTION]: {
    headless: process.env.CI === 'true',
    devtools: false,
    slowMo: 0,
    timeout: 60000,
    authStrategy: AUTH_STRATEGY.MANUAL,
    stealth: true
  }
};

/**
 * Session storage configuration per environment
 */
const SESSION_CONFIGS = {
  [ENVIRONMENT.DEVELOPMENT]: {
    directory: '.browser-session',
    persistent: true,
    cookiesFile: 'cookies.json',
    storageFile: 'storage.json',
    userDataDir: 'chrome-data',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  },
  [ENVIRONMENT.TEST]: {
    directory: '.test-session',
    persistent: false,
    cookiesFile: 'test-cookies.json',
    storageFile: 'test-storage.json',
    userDataDir: 'chrome-test-data',
    maxAge: 1 * 60 * 60 * 1000 // 1 hour
  },
  [ENVIRONMENT.STAGING]: {
    directory: '.staging-session',
    persistent: true,
    cookiesFile: 'staging-cookies.json',
    storageFile: 'staging-storage.json',
    userDataDir: 'chrome-staging-data',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  [ENVIRONMENT.PRODUCTION]: {
    directory: '.prod-session',
    persistent: true,
    cookiesFile: 'prod-cookies.json',
    storageFile: 'prod-storage.json',
    userDataDir: 'chrome-prod-data',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
};

/**
 * Authentication configuration per environment
 */
const AUTH_CONFIGS = {
  [ENVIRONMENT.DEVELOPMENT]: {
    required: false,
    timeout: 60000, // 60 seconds
    retries: 3,
    fallbackToSkip: true,
    saveSession: true
  },
  [ENVIRONMENT.TEST]: {
    required: false,
    timeout: 30000, // 30 seconds
    retries: 2,
    fallbackToSkip: true,
    saveSession: false
  },
  [ENVIRONMENT.STAGING]: {
    required: true,
    timeout: 300000, // 5 minutes
    retries: 3,
    fallbackToSkip: false,
    saveSession: true
  },
  [ENVIRONMENT.PRODUCTION]: {
    required: true,
    timeout: 300000, // 5 minutes
    retries: 3,
    fallbackToSkip: false,
    saveSession: true
  }
};

/**
 * Service Configuration Class
 */
export class ServiceConfig {
  constructor(environment = null, serviceType = SERVICE_TYPE.BROWSER) {
    this.environment = environment || config.environment;
    this.serviceType = serviceType;
    this.envConfig = environment ? createConfig(environment) : config;
    
    // Get service-specific configurations
    this.browser = { ...BROWSER_CONFIGS[this.environment] };
    this.session = { ...SESSION_CONFIGS[this.environment] };
    this.auth = { ...AUTH_CONFIGS[this.environment] };
    
    // Apply environment variable overrides
    this.applyOverrides();
    
    // Build absolute paths
    this.buildPaths();
  }

  /**
   * Apply environment variable overrides
   */
  applyOverrides() {
    // Browser overrides
    if (process.env.PUPPETEER_HEADLESS !== undefined) {
      this.browser.headless = process.env.PUPPETEER_HEADLESS === 'true';
    }
    
    if (process.env.BROWSER_TIMEOUT) {
      this.browser.timeout = parseInt(process.env.BROWSER_TIMEOUT, 10);
    }
    
    if (process.env.AUTH_STRATEGY) {
      const strategy = process.env.AUTH_STRATEGY.toLowerCase();
      if (Object.values(AUTH_STRATEGY).includes(strategy)) {
        this.browser.authStrategy = strategy;
      }
    }
    
    // Authentication overrides
    if (process.env.AUTH_REQUIRED !== undefined) {
      this.auth.required = process.env.AUTH_REQUIRED === 'true';
    }
    
    if (process.env.AUTH_TIMEOUT) {
      this.auth.timeout = parseInt(process.env.AUTH_TIMEOUT, 10);
    }
    
    // Session overrides
    if (process.env.SESSION_PERSISTENT !== undefined) {
      this.session.persistent = process.env.SESSION_PERSISTENT === 'true';
    }
    
    if (process.env.SESSION_DIR) {
      this.session.directory = process.env.SESSION_DIR;
    }
  }

  /**
   * Build absolute paths for session storage
   */
  buildPaths() {
    const sessionDir = resolve(PROJECT_ROOT, this.session.directory);
    
    this.paths = {
      projectRoot: PROJECT_ROOT,
      sessionDir: sessionDir,
      cookiesFile: resolve(sessionDir, this.session.cookiesFile),
      storageFile: resolve(sessionDir, this.session.storageFile),
      userDataDir: resolve(sessionDir, this.session.userDataDir),
      
      // Legacy auth-setup.mjs compatible paths
      authCookiesFile: resolve(PROJECT_ROOT, 'browser-session-cookies.json'),
      authStorageFile: resolve(PROJECT_ROOT, 'browser-session-storage.json'),
      authUserDataDir: resolve(PROJECT_ROOT, 'chrome-user-data')
    };
  }

  /**
   * Get the application URL for current environment
   */
  getAppUrl() {
    return this.envConfig.getBaseUrl();
  }

  /**
   * Get Firebase configuration
   */
  getFirebaseConfig() {
    return this.envConfig.getFirebaseConfig();
  }

  /**
   * Get Chrome launch arguments based on environment
   */
  getChromeArgs() {
    const baseArgs = [
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
    ];

    // Add environment-specific args
    if (this.environment === ENVIRONMENT.PRODUCTION) {
      baseArgs.push('--disable-logging');
      baseArgs.push('--disable-gpu-logging');
    }

    if (this.envConfig.isLocal()) {
      baseArgs.push('--disable-web-security');
      baseArgs.push('--allow-running-insecure-content');
    }

    return baseArgs;
  }

  /**
   * Get ignored Chrome arguments
   */
  getIgnoredChromeArgs() {
    return [
      '--enable-automation',
      '--enable-blink-features=IdleDetection'
    ];
  }

  /**
   * Determine if authentication is required
   */
  isAuthRequired() {
    // Override logic for different scenarios
    if (process.env.SKIP_AUTH === 'true') {
      return false;
    }
    
    if (this.serviceType === SERVICE_TYPE.TESTING && this.envConfig.isLocal()) {
      return this.auth.required;
    }
    
    return this.auth.required || !this.envConfig.isLocal();
  }

  /**
   * Get authentication strategy
   */
  getAuthStrategy() {
    if (!this.isAuthRequired()) {
      return AUTH_STRATEGY.SKIP;
    }
    
    return this.browser.authStrategy;
  }

  /**
   * Get configuration summary for logging
   */
  getSummary() {
    return {
      environment: this.environment,
      serviceType: this.serviceType,
      appUrl: this.getAppUrl(),
      browser: {
        headless: this.browser.headless,
        stealth: this.browser.stealth,
        timeout: this.browser.timeout
      },
      auth: {
        required: this.isAuthRequired(),
        strategy: this.getAuthStrategy(),
        timeout: this.auth.timeout
      },
      session: {
        persistent: this.session.persistent,
        directory: this.session.directory
      },
      paths: {
        sessionDir: this.paths.sessionDir,
        userDataDir: this.paths.userDataDir
      }
    };
  }

  /**
   * Create URL with path for current environment
   */
  createUrl(path = '') {
    return this.envConfig.createUrl(path);
  }

  /**
   * Check if running in CI environment
   */
  isCI() {
    return process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
  }

  /**
   * Check if debug mode is enabled
   */
  isDebug() {
    return process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development';
  }
}

/**
 * Create service configuration for specific use cases
 */
export function createServiceConfig(environment, serviceType) {
  return new ServiceConfig(environment, serviceType);
}

/**
 * Create browser service configuration
 */
export function createBrowserConfig(environment = null) {
  return new ServiceConfig(environment, SERVICE_TYPE.BROWSER);
}

/**
 * Create testing configuration
 */
export function createTestingConfig(environment = null) {
  return new ServiceConfig(environment, SERVICE_TYPE.TESTING);
}

/**
 * Create authentication configuration
 */
export function createAuthConfig(environment = null) {
  return new ServiceConfig(environment, SERVICE_TYPE.AUTHENTICATION);
}

/**
 * Default service configuration
 */
export const serviceConfig = new ServiceConfig();

/**
 * Log service configuration (useful for debugging)
 */
export function logServiceConfig(config = serviceConfig) {
  console.log('🔧 Service Configuration:', config.getSummary());
}
