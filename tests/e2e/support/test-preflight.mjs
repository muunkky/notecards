/**
 * Test the preflight checks independently
 */

import { runPreflightChecks } from './preflight-checks.mjs';

console.log('Testing pre-flight checks...\n');

// Test local mode with emulators
const result = await runPreflightChecks({
  devServerUrl: 'http://localhost:5175',
  requireEmulators: true,
  emulatorHost: 'localhost'
});

console.log('\nTest result:', result.success ? '✅ PASS' : '❌ FAIL');
process.exit(result.success ? 0 : 1);
