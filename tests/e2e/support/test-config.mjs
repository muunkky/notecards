/**
 * @fileoverview Centralized E2E test configuration
 * @description Manages test URLs, modes, and environment detection for all E2E tests
 */

import { runPreflightChecks, isLocalMode } from './preflight-checks.mjs';

/**
 * Test modes
 * @readonly
 * @enum {string}
 */
export const TestMode = {
  /** Local development with emulators (comprehensive testing) */
  DEV: 'dev',
  /** Production smoke tests (quick validation) */
  SMOKE: 'smoke',
  /** Production full tests (comprehensive but against live site) */
  PRODUCTION: 'production'
};

/**
 * Default URLs for different environments
 */
const DEFAULT_URLS = {
  local: 'http://localhost:5173',
  production: 'https://notecards-1b054.web.app'
};

/**
 * Detect test mode from environment variables
 * Priority: E2E_MODE > E2E_TARGET > LOCAL_URL > default (production)
 *
 * @returns {string} Test mode (dev, smoke, or production)
 */
export function detectTestMode() {
  // Explicit mode override
  if (process.env.E2E_MODE) {
    const mode = process.env.E2E_MODE.toLowerCase();
    if (Object.values(TestMode).includes(mode)) {
      return mode;
    }
    console.warn(`⚠️  Invalid E2E_MODE: ${process.env.E2E_MODE}, defaulting to production`);
  }

  // Target-based detection
  if (process.env.E2E_TARGET) {
    const target = process.env.E2E_TARGET.toLowerCase();
    if (target === 'local' || target === 'dev' || target === 'emulators') {
      return TestMode.DEV;
    }
    if (target === 'smoke') {
      return TestMode.SMOKE;
    }
    if (target === 'production' || target === 'prod') {
      return TestMode.PRODUCTION;
    }
  }

  // LOCAL_URL means dev mode
  if (process.env.LOCAL_URL) {
    return TestMode.DEV;
  }

  // Default to production mode for safety (don't accidentally run comprehensive tests against prod)
  return TestMode.PRODUCTION;
}

/**
 * Get target URL based on environment and mode
 *
 * @param {string} [mode] - Override test mode (optional)
 * @returns {string} Target URL for testing
 */
export function getTargetUrl(mode) {
  const testMode = mode || detectTestMode();

  // Explicit URL override (highest priority)
  if (process.env.LOCAL_URL) {
    return process.env.LOCAL_URL;
  }

  if (process.env.E2E_URL) {
    return process.env.E2E_URL;
  }

  // Mode-based URL selection
  if (testMode === TestMode.DEV) {
    return DEFAULT_URLS.local;
  }

  // Both smoke and production use production URL
  return DEFAULT_URLS.production;
}

/**
 * Check if emulators are required for current test mode
 *
 * @param {string} [mode] - Test mode (optional, will detect if not provided)
 * @returns {boolean} True if emulators are required
 */
export function requiresEmulators(mode) {
  const testMode = mode || detectTestMode();
  return testMode === TestMode.DEV;
}

/**
 * Get test configuration for current environment
 *
 * @returns {Object} Test configuration
 * @property {string} mode - Test mode (dev, smoke, production)
 * @property {string} url - Target URL
 * @property {boolean} isLocal - Whether URL is localhost
 * @property {boolean} requiresEmulators - Whether emulators are needed
 * @property {string} description - Human-readable description of mode
 */
export function getTestConfig() {
  const mode = detectTestMode();
  const url = getTargetUrl(mode);
  const needsEmulators = requiresEmulators(mode);
  const local = isLocalMode(url);

  const descriptions = {
    [TestMode.DEV]: 'Local development with emulators (comprehensive testing)',
    [TestMode.SMOKE]: 'Production smoke tests (quick validation)',
    [TestMode.PRODUCTION]: 'Production full tests (comprehensive)'
  };

  return {
    mode,
    url,
    isLocal: local,
    requiresEmulators: needsEmulators,
    description: descriptions[mode] || mode
  };
}

/**
 * Run pre-flight checks for current test configuration
 * Validates that required services are running before tests start
 *
 * @param {Object} [options] - Override options
 * @param {boolean} [options.skipChecks] - Skip pre-flight checks entirely
 * @returns {Promise<Object>} Check results
 */
export async function runTestPreflightChecks(options = {}) {
  if (options.skipChecks) {
    console.log('⚠️  Skipping pre-flight checks (skipChecks=true)');
    return { success: true, skipped: true };
  }

  const config = getTestConfig();

  console.log('');
  console.log('🔧 Test Configuration');
  console.log('─'.repeat(60));
  console.log(`   Mode: ${config.mode}`);
  console.log(`   URL: ${config.url}`);
  console.log(`   Emulators: ${config.requiresEmulators ? 'Required' : 'Not required'}`);
  console.log(`   Description: ${config.description}`);
  console.log('');

  // Only run pre-flight checks for local/dev mode
  if (config.requiresEmulators) {
    return await runPreflightChecks({
      devServerUrl: config.url,
      requireEmulators: true,
      emulatorHost: 'localhost'
    });
  }

  // For production tests, just log and proceed
  console.log('✅ No pre-flight checks required for production tests');
  console.log('');
  return { success: true, mode: 'production' };
}

/**
 * Environment variable documentation
 *
 * @example
 * // Run dev tests against local emulators
 * LOCAL_URL=http://localhost:5173 npm run test:e2e
 *
 * @example
 * // Run smoke tests against production
 * E2E_MODE=smoke npm run test:journey
 *
 * @example
 * // Run specific test with explicit mode
 * E2E_TARGET=local node tests/e2e/user-journeys/01-create-deck-and-card.mjs
 *
 * @example
 * // Custom URL override
 * E2E_URL=https://staging.example.com npm run test:e2e
 */
export const ENV_DOCS = {
  LOCAL_URL: 'Local dev server URL (enables dev mode)',
  E2E_URL: 'Explicit URL override',
  E2E_MODE: 'Test mode: dev, smoke, production',
  E2E_TARGET: 'Target environment: local, dev, smoke, production',
  E2E_TERMINAL_MODE: 'Terminal output mode (inherited from existing tests)'
};
