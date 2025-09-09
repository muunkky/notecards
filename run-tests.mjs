#!/usr/bin/env node

/**
 * Test Runner for Notecards Application
 * 
 * Runs the main test suite using the universal browser service.
 * This is the entry point for all browser-based testing.
 */

import runMainTestSuite from './test/main-test-suite.mjs';

console.log('🎯 Notecards Test Runner');
console.log('========================\n');

try {
  await runMainTestSuite();
} catch (error) {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
}
