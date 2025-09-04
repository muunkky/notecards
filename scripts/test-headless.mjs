#!/usr/bin/env node

/**
 * Quick Headless Test Runner
 * 
 * Runs the full test suite in headless mode for faster automated execution
 */

import { runNotecardTests } from './puppeteer-tests.mjs';

// Set headless mode
process.env.PUPPETEER_HEADLESS = 'true';

console.log('🚀 Running Notecards UI Tests in Headless Mode');
console.log('================================================');

runNotecardTests()
  .then(results => {
    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`⏭️  Skipped: ${results.skipped}`);
    console.log(`📋 Total: ${results.total}`);
    console.log(`⏱️  Duration: ${results.endTime - results.startTime}ms`);
    
    if (results.failed === 0) {
      console.log('\n🎉 All tests passed! UI is working correctly.');
      process.exit(0);
    } else {
      console.log('\n❌ Some tests failed. Check logs for details.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  });
