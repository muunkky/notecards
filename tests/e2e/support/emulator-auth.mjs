/**
 * @fileoverview Firebase Auth Emulator Authentication Support
 * @description Provides authentication methods for E2E tests using Firebase Auth emulator
 */

/**
 * Sign in with email/password using Firebase Auth emulator REST API
 * @param {import('puppeteer').Page} page - Puppeteer page instance
 * @param {string} email - Test user email
 * @param {string} password - Test user password
 * @param {Object} options - Configuration options
 * @param {number} options.timeoutMs - Timeout in milliseconds
 * @returns {Promise<boolean>} True if authentication successful
 */
export async function signInWithEmulator(page, email, password, options = {}) {
  const { timeoutMs = 30000 } = options;

  try {
    console.log(`🔐 Authenticating with Firebase Auth emulator...`);
    console.log(`📧 Email: ${email}`);

    // First, create the user via emulator REST API
    const createResult = await createEmulatorTestUser(email, password, 'Test User');

    // If user already exists, that's fine - we'll sign in below
    if (createResult.success) {
      console.log(`👤 Created test user: ${createResult.uid}`);
    } else if (!createResult.error?.includes('EMAIL_EXISTS')) {
      console.error(`⚠️  User creation failed: ${createResult.error}`);
    }

    // Now sign in via the page's Firebase SDK
    const authResult = await page.evaluate(async ({ email, password, apiKey }) => {
      try {
        // Sign in using fetch to emulator REST API
        const response = await fetch(`http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true
          })
        });

        const data = await response.json();

        if (!response.ok) {
          return {
            success: false,
            error: data.error?.message || 'Sign in failed',
            code: data.error?.code
          };
        }

        // Set the auth token in localStorage to simulate logged-in state
        // This will be picked up by Firebase SDK on next auth state check
        const authData = {
          apiKey: apiKey,
          stsTokenManager: {
            refreshToken: data.refreshToken,
            accessToken: data.idToken,
            expirationTime: Date.now() + (parseInt(data.expiresIn) * 1000)
          },
          uid: data.localId,
          email: data.email,
          emailVerified: data.emailVerified || false,
          isAnonymous: false
        };

        // Store in Firebase's expected localStorage format
        const storageKey = `firebase:authUser:${apiKey}:[DEFAULT]`;
        localStorage.setItem(storageKey, JSON.stringify(authData));

        // Force Firebase to reload auth state
        window.location.reload();

        return {
          success: true,
          uid: data.localId,
          email: data.email,
          idToken: data.idToken
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    }, { email, password, apiKey: 'AIzaSyBYEyPgnlvKX1k8YrUPzaJsN_7_EzajAys' });

    if (!authResult.success) {
      console.error(`❌ Authentication failed: ${authResult.error}`);
      return false;
    }

    console.log(`✅ Authenticated successfully`);
    console.log(`👤 UID: ${authResult.uid}`);
    console.log(`📧 Email: ${authResult.email}`);

    // Wait for page to reload and auth state to propagate
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: timeoutMs });
    await page.waitForTimeout(2000);

    return true;
  } catch (error) {
    console.error(`❌ Authentication error: ${error.message}`);
    return false;
  }
}

/**
 * Create a test user in Firebase Auth emulator via REST API
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} displayName - User display name
 * @returns {Promise<Object>} User creation result
 */
export async function createEmulatorTestUser(email, password, displayName = 'Test User') {
  try {
    const response = await fetch('http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        displayName,
        returnSecureToken: true
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to create user');
    }

    return {
      success: true,
      uid: data.localId,
      email: data.email,
      idToken: data.idToken,
      refreshToken: data.refreshToken
    };
  } catch (error) {
    console.error(`Failed to create emulator test user: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Check if running against Firebase emulators
 * @param {string} url - Target URL
 * @returns {boolean} True if URL is localhost
 */
export function isEmulatorMode(url) {
  return url.includes('localhost') || url.includes('127.0.0.1');
}
