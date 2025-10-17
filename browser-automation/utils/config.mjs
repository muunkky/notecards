/**
 * Shared Configuration for Browser Automation Framework
 * 
 * Centralizes all configuration settings used across automation scripts.
 * Reduces duplication and provides single source of truth for settings.
 */

export const config = {
  // Browser Settings
  browser: {
    headless: false,           // Visible by default for authentication
    devtools: false,           // DevTools closed for clean UI
    defaultViewport: {
      width: 1280,
      height: 720
    },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--remote-debugging-port=9222'
    ]
  },

  // Application URLs
  urls: {
    development: 'http://localhost:5173',
    production: 'https://notecards-app-de8c8.web.app'
  },

  // Test Environment
  environment: process.env.NODE_ENV || 'development',
  
  // Timeouts (in milliseconds)
  timeouts: {
    pageLoad: 30000,           // 30 seconds for page loads
    authentication: 60000,     // 60 seconds for auth flows
    elementWait: 10000,        // 10 seconds for element appearance
    networkIdle: 2000,         // 2 seconds for network idle
    shortDelay: 1000,          // 1 second for UI updates
    mediumDelay: 3000,         // 3 seconds for complex operations
    longDelay: 5000            // 5 seconds for slow operations
  },

  // Retry Settings
  retries: {
    authentication: 3,         // Authentication attempts
    elementFind: 5,            // Element finding attempts
    networkRequest: 3          // Network request retries
  },

  // Screenshot Settings
  screenshots: {
    enabled: true,
    directory: './screenshots',
    quality: 90,               // JPEG quality (0-100)
    fullPage: false,           // Capture full page or viewport
    timestamp: true            // Include timestamp in filename
  },

  // Logging Settings
  logging: {
    level: 'info',             // debug, info, warn, error
    console: true,             // Log to console
    file: false,               // Log to file (not implemented)
    structured: true           // Use structured logging format
  },

  // Authentication Settings
  auth: {
    method: 'hybrid',          // 'hybrid', 'service-account', 'manual'
    skipAuthUI: false,         // Skip auth UI when already authenticated
    persistSession: true,      // Persist authentication across restarts
    sessionTimeout: 3600000    // 1 hour session timeout
  },

  // Test Categories
  testCategories: {
    dialog: {
      name: 'Share Dialog Tests',
      description: 'Test share dialog functionality and UI'
    },
    permissions: {
      name: 'Permission Tests', 
      description: 'Test role-based access control'
    },
    integration: {
      name: 'Integration Tests',
      description: 'End-to-end workflow validation'
    },
    performance: {
      name: 'Performance Tests',
      description: 'Speed and reliability testing'
    },
    crossbrowser: {
      name: 'Cross-Browser Tests',
      description: 'Browser compatibility validation'
    }
  },

  // File Paths
  paths: {
    screenshots: './screenshots',
    logs: './logs',
    temp: './temp',
    chromeUserData: './chrome-user-data',
    chromeSessionData: './chrome-session-data'
  }
};

export default config;