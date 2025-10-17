#!/usr/bin/env node

/**
 * Professional Authentication CLI
 * 
 * A proper command-line interface for authentication setup
 * that demonstrates professional service usage with proper
 * lifecycle management and configuration.
 */

import { Command } from 'commander';
import browserService from '../services/browser-service.mjs';
import { createAuthConfig, ENVIRONMENT, logServiceConfig } from '../src/config/service-config.mjs';

const program = new Command();

program
  .name('notecard-auth')
  .description('Professional authentication setup for Notecard application')
  .version('1.0.0');

program
  .command('setup')
  .description('Setup authentication for the specified environment')
  .option('-e, --environment <env>', 'Environment (development, test, staging, production)', 'development')
  .option('-u, --url <url>', 'Custom application URL')
  .option('--timeout <ms>', 'Authentication timeout in milliseconds', parseInt)
  .option('--headless', 'Run browser in headless mode')
  .option('--debug', 'Enable debug logging')
  .option('--skip-auth', 'Skip authentication (for testing)')
  .action(async (options) => {
    try {
      console.log('🔐 Professional Authentication Setup');
      console.log('===================================\n');
      
      // Create configuration for the specified environment
      const config = createAuthConfig(options.environment);
      
      // Apply CLI overrides
      if (options.url) {
        process.env.NOTECARD_APP_URL = options.url;
      }
      
      if (options.timeout) {
        process.env.AUTH_TIMEOUT = options.timeout.toString();
      }
      
      if (options.headless) {
        process.env.PUPPETEER_HEADLESS = 'true';
      }
      
      if (options.skipAuth) {
        process.env.SKIP_AUTH = 'true';
      }
      
      if (options.debug) {
        process.env.DEBUG = 'true';
        logServiceConfig(config);
      }
      
      console.log(`🎯 Environment: ${config.environment}`);
      console.log(`🌐 Target URL: ${config.getAppUrl()}`);
      console.log(`🔧 Auth Strategy: ${config.getAuthStrategy()}`);
      console.log(`⏱️  Timeout: ${config.auth.timeout / 1000}s\n`);
      
      // Perform authentication using the professional service
      const result = await browserService.authenticate();
      
      if (result.success) {
        console.log('\n🎉 AUTHENTICATION SETUP COMPLETE!');
        console.log('=================================');
        
        if (result.skipped) {
          console.log('⏩ Authentication was skipped for this environment');
        } else if (result.existing) {
          console.log('✅ Used existing authentication session');
        } else if (result.manual) {
          console.log(`✅ Manual authentication completed in ${result.duration}s`);
        } else if (result.restored) {
          console.log('✅ Authentication restored from session');
        }
        
        console.log('\n📋 You can now:');
        console.log('   • Run tests: npm run test:browser');
        console.log('   • Use browser automation scripts');
        console.log('   • Access authenticated features');
        
        // Close service gracefully
        await browserService.close();
        
      } else {
        console.error('\n❌ AUTHENTICATION FAILED');
        console.error('========================');
        
        if (result.timeout) {
          console.error('⏰ Authentication timed out');
          console.error('💡 Try increasing timeout or check for issues');
        }
        
        // Close service and exit with error
        await browserService.close();
        process.exit(1);
      }
      
    } catch (error) {
      console.error('\n💥 AUTHENTICATION ERROR');
      console.error('=======================');
      console.error(`❌ ${error.message}`);
      
      if (options.debug) {
        console.error('\n🔍 Stack trace:');
        console.error(error.stack);
      }
      
      // Ensure cleanup
      try {
        await browserService.close();
      } catch (cleanupError) {
        console.error('⚠️  Cleanup error:', cleanupError.message);
      }
      
      process.exit(1);
    }
  });

program
  .command('verify')
  .description('Verify existing authentication session')
  .option('-e, --environment <env>', 'Environment to verify', 'development')
  .option('--debug', 'Enable debug logging')
  .action(async (options) => {
    try {
      console.log('🔍 Authentication Verification');
      console.log('==============================\n');
      
      const config = createAuthConfig(options.environment);
      
      if (options.debug) {
        logServiceConfig(config);
      }
      
      console.log(`🎯 Environment: ${config.environment}`);
      console.log(`🌐 Target URL: ${config.getAppUrl()}\n`);
      
      // Initialize service and check authentication
      await browserService.initialize();
      await browserService.navigateToApp();
      const isAuthenticated = await browserService.checkAuthenticationStatus();
      
      if (isAuthenticated) {
        console.log('✅ AUTHENTICATION VERIFIED');
        console.log('   Session is valid and active');
      } else {
        console.log('❌ NOT AUTHENTICATED');
        console.log('   Run "notecard-auth setup" to authenticate');
      }
      
      await browserService.close();
      
    } catch (error) {
      console.error('❌ Verification failed:', error.message);
      await browserService.close();
      process.exit(1);
    }
  });

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  SIGINT received');
  console.log('   Closing browser service gracefully...');
  
  try {
    await browserService.close();
    console.log('✅ Graceful shutdown complete');
  } catch (error) {
    console.error('⚠️  Error during shutdown:', error.message);
  }
  
  process.exit(0);
});

program.parse();
