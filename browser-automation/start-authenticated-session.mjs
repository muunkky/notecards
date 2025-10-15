/**
 * Authenticated Session Manager
 * 
 * Consolidates start-persistent-browser.mjs and authentication setup scripts.
 * Provides single entry point for starting authenticated browser sessions.
 */

import browserService from '../services/browser-service.mjs';
import config from './utils/config.mjs';
import { createLogger } from './utils/logger.mjs';
import { createAuthHelper } from './utils/auth-helpers.mjs';

const logger = createLogger('session');

async function startAuthenticatedSession(options = {}) {
  const {
    headless = config.browser.headless,
    persistent = true,
    skipAuth = false
  } = options;

  logger.info('🚀 Starting Authenticated Browser Session');
  
  try {
    // Initialize browser service
    logger.step(1, 'Initializing browser service with stealth mode');
    const connection = await browserService.initialize({ 
      headless,
      persistent,
      devtools: false
    });
    logger.success('Browser service initialized');

    if (skipAuth) {
      logger.info('Authentication skipped as requested');
      return {
        success: true,
        connection,
        browserService,
        authenticated: false
      };
    }

    // Perform authentication
    logger.step(2, 'Setting up authentication');
    const authHelper = await createAuthHelper(browserService);
    const authResult = await authHelper.authenticate();

    if (!authResult.success) {
      throw new Error(`Authentication failed: ${authResult.error}`);
    }

    logger.step(3, 'Waiting for stable authentication state');
    await authHelper.waitForStableAuth();

    // Verify browser health
    logger.step(4, 'Performing health check');
    const health = await browserService.healthCheck();
    
    if (!health.healthy) {
      logger.warn('Health check indicates potential issues', health);
    } else {
      logger.success('Browser health check passed');
    }

    // Display connection information
    logger.info('🎯 AUTHENTICATED BROWSER SESSION READY');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('📡 MCP Integration Information:');
    console.log('1. Browser is accessible on port 9222');
    console.log('2. Use MCP Puppeteer tools: mcp_puppeteer_puppeteer_connect_active_tab');
    console.log('3. Current URL:', connection.page ? connection.page.url() : 'N/A');
    console.log('4. Authentication method:', authResult.method);
    console.log('5. Browser window is visible (can be minimized)');
    
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('🔄 Keeping browser alive for MCP connections...');

    // Set up graceful shutdown
    setupGracefulShutdown(browserService);

    return {
      success: true,
      connection,
      browserService,
      authHelper,
      authenticated: true,
      authResult,
      health
    };

  } catch (error) {
    logger.error('Failed to start authenticated session', {
      error: error.message,
      stack: error.stack
    });
    
    // Cleanup on failure
    try {
      await browserService.close();
    } catch (cleanupError) {
      logger.error('Cleanup failed', { error: cleanupError.message });
    }

    throw error;
  }
}

function setupGracefulShutdown(browserService) {
  const shutdown = async (signal) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    try {
      await browserService.close();
      logger.success('Browser session closed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', { error: error.message });
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', { 
      reason: reason?.message || reason,
      promise: promise.toString()
    });
  });
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--headless':
        options.headless = true;
        break;
      case '--visible':
        options.headless = false;
        break;
      case '--skip-auth':
        options.skipAuth = true;
        break;
      case '--help':
        console.log(`
🚀 Authenticated Session Manager

Usage: node start-authenticated-session.mjs [options]

Options:
  --headless      Run browser in headless mode
  --visible       Run browser in visible mode (default)
  --skip-auth     Skip authentication step
  --help          Show this help message

Examples:
  node start-authenticated-session.mjs
  node start-authenticated-session.mjs --headless
  node start-authenticated-session.mjs --skip-auth
        `);
        process.exit(0);
        break;
    }
  }

  try {
    await startAuthenticatedSession(options);
  } catch (error) {
    console.error('Failed to start session:', error.message);
    process.exit(1);
  }
}

// Export for programmatic use
export { startAuthenticatedSession };

// Run CLI if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default startAuthenticatedSession;