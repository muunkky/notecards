#!/usr/bin/env node

/**
 * Professional Authentication CLI
 * 
 * A command-line tool for setting up authentication sessions
 * across different environments with proper lifecycle management.
 */

import { Command } from 'commander';
import browserService from '../services/browser-service.mjs';
import { ENVIRONMENT, createConfig } from '../src/config/environments.mjs';

const program = new Command();

program
  .name('auth-cli')
  .description('Professional authentication setup for Notecards app')
  .version('1.0.0');

program
  .command('setup')
  .description('Set up authentication for specified environment')
  .option('-e, --environment <env>', 'Environment (development, test, staging, production)', 'development')
  .option('-u, --url <url>', 'Custom URL override')
  .option('-t, --timeout <seconds>', 'Authentication timeout in seconds', '300')
  .option('-k, --keep-open', 'Keep browser open after authentication')
  .option('--headless', 'Run browser in headless mode')
  .action(async (options) => {
    try {
      // Validate environment
      const validEnvironments = Object.values(ENVIRONMENT);
      if (!validEnvironments.includes(options.environment)) {
        console.error(`❌ Invalid environment: ${options.environment}`);
        console.error(`   Valid options: ${validEnvironments.join(', ')}`);
        process.exit(1);
      }

      // Setup authentication
      const result = await browserService.authenticate({
        environment: options.environment,
        url: options.url,
        timeout: parseInt(options.timeout) * 1000,
        keepBrowserOpen: options.keepOpen
      });

      if (result.success) {
        console.log('\n🎉 Authentication setup completed successfully!');
        console.log(`✅ Environment: ${result.environment}`);
        console.log(`✅ URL: ${result.url}`);
        console.log(`✅ Session saved: ${result.sessionSaved}`);
        
        if (result.browserOpen) {
          console.log('\n🖥️  Browser remains open for your use');
          console.log('   Close manually when done');
        }
        
        console.log('\n📋 Next steps:');
        console.log('   - Run tests: npm run test:browser');
        console.log('   - Run automation: npm run demo:browser');
        console.log('   - Use browser service in scripts');
        
      } else {
        console.log(`\n⚠️  Authentication incomplete: ${result.reason}`);
        console.log('💡 You may need to complete the sign-in process manually');
        
        if (!options.keepOpen) {
          process.exit(1);
        }
      }
      
    } catch (error) {
      console.error('\n❌ Authentication setup failed:', error.message);
      
      if (error.message.includes('browser not secure')) {
        console.error('\n💡 Troubleshooting Google OAuth "browser not secure":');
        console.error('   1. Try a different browser profile');
        console.error('   2. Clear browser data and cookies');
        console.error('   3. Use a different environment (--environment production)');
        console.error('   4. Check if your Firebase OAuth domain is configured');
      }
      
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Check current authentication status')
  .option('-e, --environment <env>', 'Environment to check', 'development')
  .action(async (options) => {
    try {
      // Set environment
      browserService.setEnvironment(options.environment);
      
      console.log('🔍 Checking authentication status...');
      console.log('Environment configuration:', browserService.environmentConfig.getSummary());
      
      // Check if session files exist
      const sessionExists = await browserService.sessionExists();
      
      if (sessionExists) {
        console.log('✅ Session files found');
        
        // Try to initialize and check auth
        const { isAuthenticated } = await browserService.initialize();
        
        if (isAuthenticated) {
          console.log('✅ Authentication verified - ready to use');
        } else {
          console.log('⚠️  Session files exist but authentication not verified');
          console.log('💡 Run "auth-cli setup" to refresh authentication');
        }
      } else {
        console.log('❌ No authentication session found');
        console.log('💡 Run "auth-cli setup" to authenticate');
      }
      
    } catch (error) {
      console.error('❌ Status check failed:', error.message);
      process.exit(1);
    } finally {
      await browserService.close();
    }
  });

program
  .command('clean')
  .description('Clean authentication session data')
  .option('-e, --environment <env>', 'Environment to clean', 'all')
  .action(async (options) => {
    try {
      console.log('🧹 Cleaning authentication session data...');
      
      await browserService.clearSession();
      
      console.log('✅ Session data cleaned');
      console.log('💡 Run "auth-cli setup" to authenticate again');
      
    } catch (error) {
      console.error('❌ Clean failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('environments')
  .description('List available environments and their configurations')
  .action(() => {
    console.log('🔧 Available Environments:');
    console.log('=========================\n');
    
    Object.values(ENVIRONMENT).forEach(env => {
      const envConfig = createConfig(env);
      const summary = envConfig.getSummary();
      
      console.log(`📍 ${env.toUpperCase()}`);
      console.log(`   URL: ${summary.baseUrl}`);
      console.log(`   Host: ${summary.host}:${summary.port}`);
      console.log(`   Protocol: ${summary.protocol}`);
      console.log(`   Firebase Project: ${summary.projectId}`);
      console.log(`   Local: ${summary.isLocal ? 'Yes' : 'No'}`);
      console.log('');
    });
    
    console.log('💡 Use --environment <env> to specify environment');
    console.log('💡 Use --url <url> to override default URL');
  });

// Handle unknown commands
program.on('command:*', () => {
  console.error('❌ Invalid command: %s', program.args.join(' '));
  console.log('💡 Use --help to see available commands');
  process.exit(1);
});

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
