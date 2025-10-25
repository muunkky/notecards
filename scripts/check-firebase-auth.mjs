#!/usr/bin/env node
/**
 * Pre-flight check: Verify Firebase authentication before deployment
 * Prevents hanging deploys when auth token has expired
 */

import { execSync } from 'child_process';

try {
  const result = execSync('firebase login:list 2>&1', { encoding: 'utf-8', timeout: 2000 });

  if (result.includes('No authorized accounts')) {
    console.error('❌ Firebase authentication required');
    console.error('');
    console.error('Your Firebase credentials have expired or are not configured.');
    console.error('');
    console.error('To fix this, run:');
    console.error('  firebase login');
    console.error('');
    process.exit(1);
  }

  console.log('✅ Firebase authentication verified');
  process.exit(0);
} catch (error) {
  // If the command times out, it's likely an auth issue
  if (error.message.includes('ETIMEDOUT') || error.message.includes('timeout')) {
    console.error('❌ Firebase authentication required (command timed out)');
    console.error('');
    console.error('Your Firebase credentials have likely expired.');
    console.error('');
    console.error('To fix this, run:');
    console.error('  firebase login');
    console.error('');
    process.exit(1);
  }

  console.error('❌ Failed to check Firebase authentication:', error.message);
  console.error('This may indicate expired credentials. Try running: firebase login');
  process.exit(1);
}
