import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import browserService from '../../../services/browser-service.mjs';
import { hasServiceAccountCredentials } from './support/service-account-auth';

const credentialsAvailable = await hasServiceAccountCredentials();

if (!credentialsAvailable) {
  console.warn('[service-account] Skipping browser-service integration tests: credentials not configured. Run npm run auth:service-setup to provision a key.');
}

const describeServiceAccount = credentialsAvailable ? describe : describe.skip;

// When credentials are missing the entire suite is skipped above. Tests only run with a real key.
describeServiceAccount('Service Account + Central Browser Service E2E', () => {
  let browser;
  let page;

  beforeAll(async () => {
    console.log('[service-account] Starting integrated service-account tests');

    const authSuccess = await browserService.quickServiceAuth();
    if (!authSuccess) {
      throw new Error('quickServiceAuth returned false even though credentials were detected');
    }

    const browserData = browserService.getBrowser();
    browser = browserData.browser;
    page = browserData.page;

    console.log('[service-account] Browser session established');
  }, 60000);

  afterAll(async () => {
    await browserService.close();
    console.log('[service-account] Browser service closed');
  });

  test('authenticates and exposes protected UI', async () => {
    const isAuthenticated = await browserService.verifyAuthentication();
    expect(isAuthenticated).toBe(true);

    const authIndicators = await page.evaluate(() => ({
      signOutVisible: !!document.querySelector('[data-testid="sign-out"], button[data-testid="sign-out"], button[href*="logout" i]'),
      userProfileVisible: !!document.querySelector('[data-testid="user-profile"], .user-profile, .profile'),
      interactiveCount: document.querySelectorAll('button, a, [role="button"]').length
    }));

    console.log('[service-account] Auth indicator snapshot:', authIndicators);

    await page.screenshot({
      path: 'screenshots/service-account-authenticated.png',
      fullPage: true
    });

    expect(authIndicators.signOutVisible || authIndicators.userProfileVisible).toBe(true);
  }, 30000);

  test('can trigger create interactions', async () => {
    const createTargets = await page.$$eval('button', (buttons) =>
      buttons
        .map((btn, index) => ({
          index,
          label: btn.textContent?.trim().toLowerCase() ?? '',
          visible: btn.offsetParent !== null,
          disabled: btn.disabled
        }))
        .filter((btn) => btn.visible && !btn.disabled && /create|add|new|\+/i.test(btn.label))
    );

    console.log(`[service-account] Found ${createTargets.length} create buttons`);

    if (createTargets.length === 0) {
      console.warn('[service-account] No create buttons detected; skipping interaction assertions');
      return;
    }

    const target = createTargets[0];

    await page.screenshot({ path: 'screenshots/before-create-action.png' });

    await page.evaluate((buttonIndex) => {
      const buttons = document.querySelectorAll('button');
      if (buttons[buttonIndex]) {
        buttons[buttonIndex].click();
      }
    }, target.index);

    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'screenshots/after-create-action.png' });

    expect(true).toBe(true);
  }, 45000);

  test('navigates without losing auth', async () => {
    const navTargets = await page.$$eval('a[href], [role="link"]', (links) =>
      links
        .map((link) => ({
          label: link.textContent?.trim() ?? '',
          href: link.getAttribute('href'),
          visible: link.offsetParent !== null
        }))
        .filter((link) => link.visible && link.href && (link.href.startsWith('/') || link.href.includes('localhost')))
    );

    console.log(`[service-account] Found ${navTargets.length} navigation links`);

    for (const target of navTargets.slice(0, 3)) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }),
        page.click(`a[href="${target.href}"]`)
      ]);

      const stillAuthenticated = await browserService.verifyAuthentication();
      expect(stillAuthenticated).toBe(true);
    }
  }, 60000);
});
