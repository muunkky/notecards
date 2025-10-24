/**
 * @fileoverview Firebase Auth Emulator Authentication Support
 * @description Provides authentication methods for E2E tests using Firebase Auth emulator
 */

/**
 * Sign in with email/password using Firebase Auth emulator
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

    // Inject authentication code into the page context
    const authResult = await page.evaluate(async ({ email, password, timeoutMs }) => {
      try {
        // Import Firebase auth functions
        const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js');
        const auth = getAuth();

        // Try to sign in first
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          return {
            success: true,
            method: 'sign-in',
            uid: userCredential.user.uid,
            email: userCredential.user.email
          };
        } catch (signInError) {
          // If user doesn't exist, create them
          if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/wrong-password') {
            console.log(`👤 Creating new test user: ${email}`);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            return {
              success: true,
              method: 'create',
              uid: userCredential.user.uid,
              email: userCredential.user.email
            };
          }
          throw signInError;
        }
      } catch (error) {
        return {
          success: false,
          error: error.message,
          code: error.code
        };
      }
    }, { email, password, timeoutMs });

    if (!authResult.success) {
      console.error(`❌ Authentication failed: ${authResult.error}`);
      return false;
    }

    console.log(`✅ Authenticated via ${authResult.method}`);
    console.log(`👤 UID: ${authResult.uid}`);
    console.log(`📧 Email: ${authResult.email}`);

    // Wait for auth state to propagate
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
