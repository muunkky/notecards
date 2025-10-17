/**
 * Environment Configuration
 * 
 * Professional environment management for the Notecards application.
 * Supports development, testing, staging, and production environments
 * with proper fallbacks and validation.
 */

/**
 * Environment types enum
 */
export const ENVIRONMENT = {
  DEVELOPMENT: 'development',
  TEST: 'test',
  STAGING: 'staging',
  PRODUCTION: 'production'
};

/**
 * Default ports for different services
 */
export const DEFAULT_PORTS = {
  DEV_SERVER: 5174,
  TEST_SERVER: 5176,
  STAGING_SERVER: 5177
};

/**
 * Firebase configuration per environment
 */
const FIREBASE_CONFIGS = {
  [ENVIRONMENT.DEVELOPMENT]: {
    projectId: 'notecards-1b054',
    authDomain: 'notecards-1b054.firebaseapp.com',
    storageBucket: 'notecards-1b054.firebasestorage.app',
    appId: '1:123456789:web:abcdef123456'
  },
  [ENVIRONMENT.TEST]: {
    projectId: 'notecards-1b054',
    authDomain: 'notecards-1b054.firebaseapp.com',
    storageBucket: 'notecards-1b054.firebasestorage.app',
    appId: '1:123456789:web:abcdef123456'
  },
  [ENVIRONMENT.STAGING]: {
    projectId: 'notecards-1b054',
    authDomain: 'notecards-1b054.firebaseapp.com',
    storageBucket: 'notecards-1b054.firebasestorage.app',
    appId: '1:123456789:web:abcdef123456'
  },
  [ENVIRONMENT.PRODUCTION]: {
    projectId: 'notecards-1b054',
    authDomain: 'notecards-1b054.firebaseapp.com',
    storageBucket: 'notecards-1b054.firebasestorage.app',
    appId: '1:123456789:web:abcdef123456'
  }
};

/**
 * URL configurations per environment
 */
const URL_CONFIGS = {
  [ENVIRONMENT.DEVELOPMENT]: {
    base: `http://127.0.0.1:${DEFAULT_PORTS.DEV_SERVER}`,
    host: '127.0.0.1',
    port: DEFAULT_PORTS.DEV_SERVER,
    protocol: 'http'
  },
  [ENVIRONMENT.TEST]: {
    base: `http://127.0.0.1:${DEFAULT_PORTS.TEST_SERVER}`,
    host: '127.0.0.1',
    port: DEFAULT_PORTS.TEST_SERVER,
    protocol: 'http'
  },
  [ENVIRONMENT.STAGING]: {
    base: 'https://notecards-1b054--staging.web.app',
    host: 'notecards-1b054--staging.web.app',
    port: 443,
    protocol: 'https'
  },
  [ENVIRONMENT.PRODUCTION]: {
    base: 'https://notecards-1b054.web.app',
    host: 'notecards-1b054.web.app',
    port: 443,
    protocol: 'https'
  }
};

/**
 * Get current environment from various sources
 */
function getCurrentEnvironment() {
  // Priority: NODE_ENV -> NOTECARD_ENV -> process.env.NODE_ENV -> default
  return process.env.NOTECARD_ENV || 
         process.env.NODE_ENV || 
         ENVIRONMENT.DEVELOPMENT;
}

/**
 * Validate environment value
 */
function validateEnvironment(env) {
  const validEnvironments = Object.values(ENVIRONMENT);
  if (!validEnvironments.includes(env)) {
    throw new Error(`Invalid environment: ${env}. Valid options: ${validEnvironments.join(', ')}`);
  }
  return env;
}

/**
 * Environment configuration class
 */
export class EnvironmentConfig {
  constructor(environment = null) {
    this.environment = validateEnvironment(environment || getCurrentEnvironment());
    this.urls = URL_CONFIGS[this.environment];
    this.firebase = FIREBASE_CONFIGS[this.environment];
    
    // Override with environment variables if present
    this.applyEnvironmentOverrides();
  }

  /**
   * Apply environment variable overrides
   */
  applyEnvironmentOverrides() {
    // Allow URL overrides via environment variables
    if (process.env.NOTECARD_APP_URL) {
      const customUrl = new URL(process.env.NOTECARD_APP_URL);
      this.urls = {
        base: process.env.NOTECARD_APP_URL,
        host: customUrl.hostname,
        port: customUrl.port || (customUrl.protocol === 'https:' ? 443 : 80),
        protocol: customUrl.protocol.replace(':', '')
      };
    }

    // Allow port overrides
    if (process.env.NOTECARD_PORT) {
      const port = parseInt(process.env.NOTECARD_PORT, 10);
      if (!isNaN(port)) {
        this.urls.port = port;
        this.urls.base = `${this.urls.protocol}://${this.urls.host}:${port}`;
      }
    }

    // Allow Firebase project override
    if (process.env.FIREBASE_PROJECT_ID) {
      this.firebase.projectId = process.env.FIREBASE_PROJECT_ID;
    }
  }

  /**
   * Get the base URL for the current environment
   */
  getBaseUrl() {
    return this.urls.base;
  }

  /**
   * Get Firebase configuration for the current environment
   */
  getFirebaseConfig() {
    return { ...this.firebase };
  }

  /**
   * Check if current environment is development
   */
  isDevelopment() {
    return this.environment === ENVIRONMENT.DEVELOPMENT;
  }

  /**
   * Check if current environment is production
   */
  isProduction() {
    return this.environment === ENVIRONMENT.PRODUCTION;
  }

  /**
   * Check if current environment is testing
   */
  isTesting() {
    return this.environment === ENVIRONMENT.TEST;
  }

  /**
   * Check if environment uses local hosting
   */
  isLocal() {
    return this.isDevelopment() || this.isTesting();
  }

  /**
   * Get configuration summary for logging
   */
  getSummary() {
    return {
      environment: this.environment,
      baseUrl: this.urls.base,
      host: this.urls.host,
      port: this.urls.port,
      protocol: this.urls.protocol,
      projectId: this.firebase.projectId,
      isLocal: this.isLocal(),
      isProduction: this.isProduction()
    };
  }

  /**
   * Create URL with path
   */
  createUrl(path = '') {
    const base = this.urls.base.endsWith('/') ? this.urls.base.slice(0, -1) : this.urls.base;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  }
}

/**
 * Default configuration instance
 */
export const config = new EnvironmentConfig();

/**
 * Create configuration for specific environment
 */
export function createConfig(environment) {
  return new EnvironmentConfig(environment);
}

/**
 * Utility functions for backward compatibility
 */
export function getAppUrl() {
  return config.getBaseUrl();
}

export function getFirebaseConfig() {
  return config.getFirebaseConfig();
}

export function isProduction() {
  return config.isProduction();
}

export function isDevelopment() {
  return config.isDevelopment();
}

/**
 * Log current configuration (useful for debugging)
 */
export function logConfig() {
  console.log('🔧 Environment Configuration:', config.getSummary());
}
