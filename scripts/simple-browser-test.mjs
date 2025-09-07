#!/usr/bin/env node

/**
 * Simple Browser Service Test
 * 
 * A minimal test to validate the core browser service functionality
 */

import browserService from './browser-service.mjs';

async function simpleTest() {
  console.log('🧪 Simple Browser Service Test');
  console.log('==============================');

  try {
    console.log('1. Initialize service...');
    const connection = await browserService.initialize();
    console.log('✅ Service initialized');

    console.log('2. Test page methods...');
    const url = await connection.page.url();
    const title = await connection.page.title();
    console.log('✅ Page methods working:', { url, title });

    console.log('3. Health check...');
    const health = await browserService.healthCheck();
    console.log('✅ Health check:', health);

    console.log('4. Close with keepSession...');
    await browserService.close({ keepSession: true });
    console.log('✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

simpleTest();
