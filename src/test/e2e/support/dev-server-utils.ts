/**
 * Development Server Utilities
 * 
 * Smart dev server management with auto-start capability
 */

import { ensureDevServer as autoEnsureDevServer, cleanupDevServer, getDevServerInfo } from './dev-server-manager.js';

/**
 * Ensure dev server is running before tests
 * 
 * This will:
 * 1. Check if dev server is already running on port 5174
 * 2. If not, automatically start it in detached mode
 * 3. Track PID for cleanup
 * 4. Auto-cleanup after tests complete
 * 
 * @returns Dev server URL (http://127.0.0.1:5174)
 */
export async function ensureDevServer(): Promise<string> {
  console.log('🔍 Checking for development server...');
  return await autoEnsureDevServer();
}

/**
 * Cleanup auto-started dev server
 * Call this in afterAll() hooks
 */
export async function cleanupAfterTests(): Promise<void> {
  await cleanupDevServer();
}

/**
 * Get current dev server info (for debugging)
 */
export function getServerInfo() {
  return getDevServerInfo();
}

