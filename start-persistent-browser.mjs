#!/usr/bin/env node

/**
 * Persistent Browser Service for MCP Integration
 * 
 * Starts authenticated stealth browser and keeps it running
 * so MCP tools can connect to port 9222
 */

import browserService from './services/browser-service.mjs';

async function startPersistentBrowser() {
  console.log('🚀 Starting Persistent Authenticated Browser (Visible for Auth)');
  console.log('============================================================');
  
  try {
    // Initialize browser service in visible mode for authentication
    console.log('1. Initializing browser service with stealth (visible for auth)...');
    const connection = await browserService.initialize({ headless: false });
    console.log('✅ Browser service initialized');
    
    // Navigate and authenticate
    console.log('2. Navigating to app and authenticating...');
    await browserService.navigateToApp();
    
    const authResult = await browserService.authenticateWithBypass();
    console.log('✅ Authentication result:', authResult);
    
    // Health check
    const health = await browserService.healthCheck();
    console.log('✅ Health check:', health);
    
    console.log('\n🎯 BROWSER READY FOR MCP CONNECTION');
    console.log('==================================');
    console.log('✅ Chrome running with stealth configuration (visible window)');
    console.log('✅ Authentication completed');
    console.log('✅ Remote debugging on port 9222');
    console.log('✅ App loaded at http://127.0.0.1:5174');
    
    console.log('\n💡 MCP Connection Instructions:');
    console.log('1. Browser is now accessible on port 9222');
    console.log('2. Use MCP Puppeteer tools: mcp_puppeteer_puppeteer_connect_active_tab');
    console.log('3. Target URL: http://127.0.0.1:5174');
    console.log('4. You should now be able to test sharing functionality!');
    console.log('5. Browser window is visible but you can minimize it');
    
    console.log('\n🔄 Keeping browser alive...');
    console.log('Press Ctrl+C to stop and cleanup');
    
    // Keep the process alive
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down...');
      await browserService.close();
      process.exit(0);
    });
    
    // Keep alive with periodic health checks
    setInterval(async () => {
      try {
        const health = await browserService.healthCheck();
        console.log(`💡 Browser health: ${health.healthy ? '✅' : '❌'} (${new Date().toLocaleTimeString()})`);
      } catch (error) {
        console.log('⚠️ Health check failed:', error.message);
      }
    }, 30000); // Every 30 seconds
    
    // Never exit
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Failed to start persistent browser:', error);
    process.exit(1);
  }
}

startPersistentBrowser().catch(console.error);