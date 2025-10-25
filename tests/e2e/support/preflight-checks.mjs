/**
 * @fileoverview Pre-flight checks for E2E tests
 * @description Verifies all prerequisites are met before running tests
 */

/**
 * Check if a port is listening (service is running)
 * @param {string} host - Hostname (e.g., 'localhost')
 * @param {number} port - Port number
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise<boolean>} True if port is listening
 */
async function isPortListening(host, port, timeoutMs = 2000) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`http://${host}:${port}`, {
      method: 'GET',
      signal: controller.signal
    }).catch(() => null);

    clearTimeout(timeout);
    return response !== null; // Any response means port is listening
  } catch (error) {
    return false;
  }
}

/**
 * Check if Firebase Auth emulator is running
 * @param {string} host - Emulator host (default: localhost)
 * @param {number} port - Auth emulator port (default: 9099)
 * @returns {Promise<Object>} Check result with status and message
 */
export async function checkAuthEmulator(host = 'localhost', port = 9099) {
  console.log(`🔍 Checking Firebase Auth emulator (${host}:${port})...`);

  const isRunning = await isPortListening(host, port);

  if (isRunning) {
    console.log(`✅ Firebase Auth emulator is running`);
    return { success: true, service: 'Auth Emulator', host, port };
  } else {
    console.error(`❌ Firebase Auth emulator is NOT running on ${host}:${port}`);
    console.error(`   Start with: npm run emulators:start`);
    return {
      success: false,
      service: 'Auth Emulator',
      host,
      port,
      error: 'Not running',
      help: 'Start emulators with: npm run emulators:start'
    };
  }
}

/**
 * Check if Firebase Firestore emulator is running
 * @param {string} host - Emulator host (default: localhost)
 * @param {number} port - Firestore emulator port (default: 8080)
 * @returns {Promise<Object>} Check result with status and message
 */
export async function checkFirestoreEmulator(host = 'localhost', port = 8080) {
  console.log(`🔍 Checking Firebase Firestore emulator (${host}:${port})...`);

  const isRunning = await isPortListening(host, port);

  if (isRunning) {
    console.log(`✅ Firebase Firestore emulator is running`);
    return { success: true, service: 'Firestore Emulator', host, port };
  } else {
    console.error(`❌ Firebase Firestore emulator is NOT running on ${host}:${port}`);
    console.error(`   Start with: npm run emulators:start`);
    return {
      success: false,
      service: 'Firestore Emulator',
      host,
      port,
      error: 'Not running',
      help: 'Start emulators with: npm run emulators:start'
    };
  }
}

/**
 * Check if dev server is running
 * @param {string} url - Dev server URL (e.g., 'http://localhost:5173')
 * @returns {Promise<Object>} Check result with status and message
 */
export async function checkDevServer(url) {
  console.log(`🔍 Checking dev server (${url})...`);

  try {
    const urlObj = new URL(url);
    const isRunning = await isPortListening(urlObj.hostname, parseInt(urlObj.port) || 80, 3000);

    if (isRunning) {
      console.log(`✅ Dev server is running`);
      return { success: true, service: 'Dev Server', url };
    } else {
      console.error(`❌ Dev server is NOT running at ${url}`);
      console.error(`   Start with: npm run dev`);
      return {
        success: false,
        service: 'Dev Server',
        url,
        error: 'Not running',
        help: 'Start dev server with: npm run dev'
      };
    }
  } catch (error) {
    console.error(`❌ Invalid dev server URL: ${url}`);
    return {
      success: false,
      service: 'Dev Server',
      url,
      error: `Invalid URL: ${error.message}`
    };
  }
}

/**
 * Run all pre-flight checks for local E2E testing
 * @param {Object} options - Check options
 * @param {string} options.devServerUrl - Dev server URL
 * @param {boolean} options.requireEmulators - Whether emulators are required (default: true)
 * @param {string} options.emulatorHost - Emulator host (default: localhost)
 * @returns {Promise<Object>} Results with success status and details
 */
export async function runPreflightChecks(options = {}) {
  const {
    devServerUrl = 'http://localhost:5173',
    requireEmulators = true,
    emulatorHost = 'localhost'
  } = options;

  console.log('');
  console.log('🚀 Pre-flight Checks');
  console.log('═'.repeat(60));
  console.log('');

  const results = [];

  // Check dev server
  const devServerResult = await checkDevServer(devServerUrl);
  results.push(devServerResult);

  // Check emulators if required
  if (requireEmulators) {
    const authResult = await checkAuthEmulator(emulatorHost, 9099);
    results.push(authResult);

    const firestoreResult = await checkFirestoreEmulator(emulatorHost, 8080);
    results.push(firestoreResult);
  }

  console.log('');
  console.log('─'.repeat(60));

  const allPassed = results.every(r => r.success);
  const failed = results.filter(r => !r.success);

  if (allPassed) {
    console.log('✅ All pre-flight checks passed');
    console.log('');
    return { success: true, results };
  } else {
    console.log(`❌ ${failed.length} pre-flight check(s) failed:`);
    console.log('');

    failed.forEach((result, i) => {
      console.log(`   ${i + 1}. ${result.service}: ${result.error}`);
      if (result.help) {
        console.log(`      → ${result.help}`);
      }
    });

    console.log('');
    console.log('📚 Documentation: See EMULATOR_TESTING.md for setup instructions');
    console.log('');

    return {
      success: false,
      results,
      failed,
      message: `${failed.length} required service(s) not running`
    };
  }
}

/**
 * Check if running in local mode (localhost URL)
 * @param {string} url - Target URL
 * @returns {boolean} True if local mode
 */
export function isLocalMode(url) {
  return url.includes('localhost') || url.includes('127.0.0.1');
}
