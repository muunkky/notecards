/**
 * E2E Test Authentication Helper
 *
 * Simplified wrapper around existing service-account-auth for journey tests.
 * Uses the comprehensive prepareServiceAccountAuth + signInWithCustomToken from services/.
 */

import { Page } from 'puppeteer';
import { prepareServiceAccountAuth, signInWithCustomToken } from '../../../../services/service-account-auth.mjs';

/**
 * Authenticate a Puppeteer page session for e2e journey tests.
 *
 * Uses service account to create custom token, then signs in via browser.
 * Wraps existing service-account-auth.mjs functions.
 *
 * @param page - Puppeteer page instance
 * @param siteUrl - Site URL to navigate to (e.g., https://notecards-1b054.web.app)
 * @param options - Auth options (userEmail, additionalClaims)
 */
export async function authenticatePage(
  page: Page,
  siteUrl: string,
  options: {
    userEmail?: string;
    claims?: Record<string, unknown>;
  } = {}
): Promise<{ uid: string; email: string | null; displayName: string | null }> {
  const userEmail = options.userEmail || process.env.E2E_TEST_USER_EMAIL || 'e2e-test@notecards.test';

  console.log(`[auth-helper] Authenticating as ${userEmail}`);

  // Step 1: Navigate to site first
  await page.goto(siteUrl, { waitUntil: 'networkidle0' });

  // Step 2: Prepare custom token via service account
  const { token } = await prepareServiceAccountAuth({
    userEmail,
    claims: options.claims || {},
  });

  // Step 3: Sign in using existing signInWithCustomToken (from service-account-auth.mjs)
  const userInfo = await signInWithCustomToken(page, token, { timeoutMs: 60000 });

  console.log(`[auth-helper] ✓ Authenticated as ${userInfo.email} (${userInfo.uid})`);

  return userInfo;
}

/**
 * Sign out the current Puppeteer session.
 */
export async function signOut(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const auth = window.firebaseAuth || (window.firebase && window.firebase.auth && window.firebase.auth());
    if (auth) {
      await auth.signOut();
    }
  });

  console.log('[auth-helper] ✓ Signed out');
}
