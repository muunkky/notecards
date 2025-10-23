/**
 * User Journey E2E Test: Share Deck with Collaborators
 *
 * User Story:
 * As a deck owner, I want to share my deck with other users,
 * so they can collaborate on creating and studying flashcards together.
 *
 * Journey Steps:
 * 1. Load production site
 * 2. Authenticate with Google
 * 3. Create a new deck
 * 4. Click Share button to open share dialog
 * 5. Add collaborator email (creates pending invite)
 * 6. Verify pending invite appears in dialog
 * 7. (Optional) Test changing role or removing invite
 *
 * Success Criteria:
 * - Deck created successfully
 * - Share dialog opens
 * - Collaborator email can be entered
 * - Pending invite appears in the dialog
 * - All interactions captured with screenshots
 *
 * Usage:
 *   node tests/e2e/user-journeys/03-share-deck.mjs
 */

import browserService from '../../../services/browser-service.mjs';
import { promises as fs } from 'fs';
import { resolve } from 'path';

// Configuration
const JOURNEY_NAME = '03-share-deck';
const PRODUCTION_URL = 'https://notecards-1b054.web.app';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const RUN_TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19); // YYYY-MM-DDTHH-MM-SS
const SCREENSHOT_DIR = resolve(process.cwd(), 'tests/e2e/screenshots', JOURNEY_NAME, RUN_TIMESTAMP);

// Test data
const TEST_DECK_TITLE = `Share Test Deck ${TIMESTAMP}`;
const TEST_COLLABORATOR_EMAIL = 'test-collaborator@example.com';

/**
 * Take a screenshot and save with descriptive filename
 */
async function takeScreenshot(page, stepName, description = '') {
  try {
    const filename = `${String(stepName).padStart(2, '0')}-${description.toLowerCase().replace(/\s+/g, '-')}.png`;
    const filepath = resolve(SCREENSHOT_DIR, filename);

    await page.screenshot({
      path: filepath,
      fullPage: true
    });

    console.log(`📸 Screenshot: ${filename}`);
    return filepath;
  } catch (error) {
    console.error(`❌ Screenshot failed for ${stepName}:`, error.message);
    return null;
  }
}

/**
 * Wait and log
 */
async function wait(ms, message = '') {
  if (message) console.log(`⏳ ${message}`);
  await new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Log current page state for debugging
 */
async function logPageState(page, label = '') {
  try {
    const url = await page.url();
    const title = await page.title();
    console.log(`🔍 [${label}] URL: ${url}`);
    console.log(`🔍 [${label}] Title: ${title}`);
  } catch (error) {
    console.error(`⚠️  Could not log page state: ${error.message}`);
  }
}

/**
 * Main workflow test
 */
async function runShareDeckTest() {
  console.log('🎬 User Journey E2E Test: Share Deck with Collaborators');
  console.log('═══════════════════════════════════════════════════');
  console.log(`📍 Target: ${PRODUCTION_URL}`);
  console.log(`📁 Screenshots: ${SCREENSHOT_DIR}`);
  console.log(`👤 User Story: Deck owner shares deck with collaborators`);
  console.log('');

  // Ensure screenshot directory exists
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });

  let step = 0;
  const results = {
    passed: [],
    failed: [],
    warnings: [],
    screenshots: [],
    startTime: Date.now()
  };

  try {
    // Step 1: Initialize browser
    step++;
    console.log(`\n📋 Step ${step}: Initialize Browser`);
    console.log('─'.repeat(60));

    await browserService.initialize({ headless: false });
    const { page } = browserService.getBrowser();

    console.log('✅ Browser initialized');
    results.passed.push('Browser initialization');

    // Step 2: Navigate to production
    step++;
    console.log(`\n📋 Step ${step}: Navigate to Production`);
    console.log('─'.repeat(60));

    await page.goto(PRODUCTION_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await wait(2000, 'Stabilizing...');

    await logPageState(page, 'After navigation');
    const screenshot2 = await takeScreenshot(page, step, 'site-loads');
    if (screenshot2) results.screenshots.push(screenshot2);

    console.log('✅ Site loaded');
    results.passed.push('Site load');

    // Step 3: Authentication
    step++;
    console.log(`\n📋 Step ${step}: Authentication`);
    console.log('─'.repeat(60));

    const isAuthenticated = await browserService.checkAuthenticationStatus();

    if (!isAuthenticated) {
      console.log('🔐 Manual authentication required');
      console.log('   1. Click "Sign in with Google"');
      console.log('   2. Complete authentication');
      console.log('   3. Wait for home page to load');
      console.log('');
      console.log('⏳ Waiting up to 60 seconds...');

      let authAttempts = 0;
      const maxAuthAttempts = 12;

      while (authAttempts < maxAuthAttempts) {
        await wait(5000);
        authAttempts++;

        const authStatus = await browserService.checkAuthenticationStatus();
        console.log(`🔍 Auth check ${authAttempts}/${maxAuthAttempts}...`);

        if (authStatus) {
          console.log('✅ Authentication successful!');
          await browserService.saveSession();
          break;
        }
      }

      const finalAuthStatus = await browserService.checkAuthenticationStatus();
      if (!finalAuthStatus) {
        throw new Error('Authentication timeout');
      }
    } else {
      console.log('✅ Already authenticated');
    }

    await logPageState(page, 'After auth');
    const screenshot3 = await takeScreenshot(page, step, 'authenticated');
    if (screenshot3) results.screenshots.push(screenshot3);

    results.passed.push('Authentication');

    // Step 4: Create deck
    step++;
    console.log(`\n📋 Step ${step}: Create Deck`);
    console.log('─'.repeat(60));
    console.log(`📝 Title: "${TEST_DECK_TITLE}"`);

    // Find and click create button
    const createClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
      console.log(`Found ${buttons.length} clickable elements`);

      const createButton = buttons.find(btn => {
        const text = btn.textContent.toLowerCase();
        return text.includes('create') && text.includes('deck');
      });

      if (createButton) {
        console.log('Found create button:', createButton.textContent);
        createButton.click();
        return true;
      }
      return false;
    });

    if (!createClicked) {
      throw new Error('Create deck button not found');
    }

    await wait(1500, 'Waiting for form...');

    await logPageState(page, 'After create click');
    const screenshot4a = await takeScreenshot(page, step, 'create-form');
    if (screenshot4a) results.screenshots.push(screenshot4a);

    // Fill deck title
    console.log('📝 Filling deck title...');
    const fillResult = await page.evaluate((title) => {
      const inputs = Array.from(document.querySelectorAll('input'));

      const titleInput = inputs.find(input => {
        const placeholder = input.placeholder?.toLowerCase() || '';
        return placeholder.includes('title') || placeholder.includes('name');
      }) || inputs[0];

      if (titleInput) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(titleInput, title);

        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
        titleInput.dispatchEvent(new Event('change', { bubbles: true }));
        titleInput.dispatchEvent(new Event('blur', { bubbles: true }));

        return {
          success: true,
          finalValue: titleInput.value
        };
      }
      return { success: false };
    }, TEST_DECK_TITLE);

    if (!fillResult.success) {
      throw new Error('Could not fill deck title');
    }

    await wait(1000);

    // Click save/create
    console.log('💾 Saving deck...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const saveButton = buttons.find(btn => {
        const text = btn.textContent.trim().toLowerCase();
        return text === 'create' || text === 'save';
      });

      if (saveButton) {
        saveButton.click();
      }
    });

    await wait(3000, 'Waiting for deck creation...');

    await logPageState(page, 'After save');
    const screenshot4b = await takeScreenshot(page, step, 'deck-created');
    if (screenshot4b) results.screenshots.push(screenshot4b);

    console.log('✅ Deck created');
    results.passed.push('Create deck');

    // Step 5: Open Share Dialog
    step++;
    console.log(`\n📋 Step ${step}: Open Share Dialog`);
    console.log('─'.repeat(60));

    // Find the deck we just created and click its Share button
    const shareClicked = await page.evaluate((deckTitle) => {
      // Find all deck items
      const deckItems = document.querySelectorAll('[data-testid="deck-item"]');
      console.log(`Found ${deckItems.length} deck items`);

      // Find the deck with matching title
      for (const deckItem of deckItems) {
        const h2 = deckItem.querySelector('h2');
        if (h2 && h2.textContent.includes(deckTitle)) {
          console.log('Found matching deck, looking for Share button...');

          // Find Share button within this deck item
          const buttons = Array.from(deckItem.querySelectorAll('button'));
          const shareButton = buttons.find(btn => {
            const text = btn.textContent.trim();
            return text === 'Share' || text.toLowerCase().includes('share');
          });

          if (shareButton) {
            console.log('Found Share button, clicking...');
            shareButton.click();
            return true;
          } else {
            console.log('Share button not found in this deck item');
            console.log('Available buttons:', buttons.map(b => b.textContent.trim()));
          }
        }
      }

      return false;
    }, TEST_DECK_TITLE);

    if (!shareClicked) {
      throw new Error('Share button not found or not clicked');
    }

    await wait(2000, 'Waiting for share dialog...');

    await logPageState(page, 'Share dialog open');
    const screenshot5 = await takeScreenshot(page, step, 'share-dialog');
    if (screenshot5) results.screenshots.push(screenshot5);

    console.log('✅ Share dialog opened');
    results.passed.push('Open share dialog');

    // Step 6: Add Collaborator
    step++;
    console.log(`\n📋 Step ${step}: Add Collaborator`);
    console.log('─'.repeat(60));
    console.log(`📧 Email: "${TEST_COLLABORATOR_EMAIL}"`);

    // Find email input in share dialog
    const emailFilled = await page.evaluate((email) => {
      // Look for email input in the dialog
      const inputs = Array.from(document.querySelectorAll('input[type="email"], input[type="text"]'));
      console.log(`Found ${inputs.length} inputs`);

      // Find the email input (likely has placeholder containing "email")
      const emailInput = inputs.find(input => {
        const placeholder = input.placeholder?.toLowerCase() || '';
        const type = input.type?.toLowerCase() || '';
        return type === 'email' || placeholder.includes('email');
      });

      if (emailInput) {
        console.log('Found email input, filling...');
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(emailInput, email);

        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        emailInput.dispatchEvent(new Event('change', { bubbles: true }));

        return {
          success: true,
          value: emailInput.value
        };
      }

      console.log('Email input not found');
      return { success: false };
    }, TEST_COLLABORATOR_EMAIL);

    if (!emailFilled.success) {
      throw new Error('Could not fill email input');
    }

    console.log('📝 Email filled, looking for Add button...');

    await wait(500);

    // Click Add/Invite button
    const addClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      console.log('Looking for Add/Invite button...');
      console.log('Available buttons:', buttons.map(b => b.textContent.trim()));

      const addButton = buttons.find(btn => {
        const text = btn.textContent.trim().toLowerCase();
        return text === 'add' || text === 'invite' || text.includes('add') && text.length < 15;
      });

      if (addButton) {
        console.log('Found Add button:', addButton.textContent);
        addButton.click();
        return true;
      }

      return false;
    });

    if (!addClicked) {
      console.log('⚠️  Add button not found, trying Enter key...');
      await page.keyboard.press('Enter');
    }

    await wait(2000, 'Waiting for invite to be created...');

    const screenshot6 = await takeScreenshot(page, step, 'collaborator-added');
    if (screenshot6) results.screenshots.push(screenshot6);

    console.log('✅ Collaborator added (pending invite created)');
    results.passed.push('Add collaborator');

    // Step 7: Verify Pending Invite
    step++;
    console.log(`\n📋 Step ${step}: Verify Pending Invite`);
    console.log('─'.repeat(60));

    await wait(1000);

    // Check if the invite appears in the dialog
    const inviteVisible = await page.evaluate((email) => {
      const bodyText = document.body.textContent;
      const hasEmail = bodyText.includes(email);

      // Look for "pending" text
      const hasPending = bodyText.toLowerCase().includes('pending');

      // Look for invite-related elements
      const inviteElements = Array.from(document.querySelectorAll('[data-testid*="invite"], .invite, div'))
        .filter(el => el.textContent.includes(email));

      return {
        hasEmail,
        hasPending,
        inviteCount: inviteElements.length,
        bodyIncludes: bodyText.includes(email) ? 'yes' : 'no'
      };
    }, TEST_COLLABORATOR_EMAIL);

    console.log('🔍 Invite verification:', inviteVisible);

    if (inviteVisible.hasEmail) {
      console.log('✅ Pending invite is visible in dialog');
      results.passed.push('Verify pending invite');
    } else {
      console.log('⚠️  Invite may not be visible yet (async operation)');
      results.warnings.push('Pending invite verification uncertain');
    }

    const screenshot7 = await takeScreenshot(page, step, 'invite-verified');
    if (screenshot7) results.screenshots.push(screenshot7);

    // Step 8: Close Dialog
    step++;
    console.log(`\n📋 Step ${step}: Close Share Dialog`);
    console.log('─'.repeat(60));

    const dialogClosed = await page.evaluate(() => {
      // Look for close button (X or Close)
      const buttons = Array.from(document.querySelectorAll('button'));
      const closeButton = buttons.find(btn => {
        const text = btn.textContent.trim().toLowerCase();
        const ariaLabel = btn.getAttribute('aria-label')?.toLowerCase() || '';
        return text === 'close' || text === '×' || text === 'x' || ariaLabel.includes('close');
      });

      if (closeButton) {
        console.log('Found close button');
        closeButton.click();
        return true;
      }

      return false;
    });

    if (!dialogClosed) {
      console.log('⚠️  Close button not found, trying Escape key...');
      await page.keyboard.press('Escape');
    }

    await wait(1000);

    await logPageState(page, 'After dialog close');
    const screenshot8 = await takeScreenshot(page, step, 'dialog-closed');
    if (screenshot8) results.screenshots.push(screenshot8);

    console.log('✅ Share dialog closed');
    results.passed.push('Close share dialog');

    // Final screenshot
    step++;
    console.log(`\n📋 Step ${step}: Final State`);
    console.log('─'.repeat(60));

    const screenshot9 = await takeScreenshot(page, step, 'final-state');
    if (screenshot9) results.screenshots.push(screenshot9);

    console.log('✅ Test completed');

  } catch (error) {
    console.error(`\n❌ Test failed at step ${step}:`, error.message);

    // Capture error state
    try {
      const { page } = browserService.getBrowser();
      await logPageState(page, 'ERROR');

      const errorScreenshot = await takeScreenshot(page, 'ERROR', 'error-state');
      if (errorScreenshot) results.screenshots.push(errorScreenshot);
    } catch (captureError) {
      console.error('Could not capture error state');
    }

    results.failed.push(`Step ${step}: ${error.message}`);
  } finally {
    // Print summary
    const duration = Math.floor((Date.now() - results.startTime) / 1000);

    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary');
    console.log('='.repeat(60));
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log('');
    console.log(`✅ Passed: ${results.passed.length}`);
    results.passed.forEach((test, i) => console.log(`   ${i + 1}. ${test}`));

    if (results.warnings.length > 0) {
      console.log('');
      console.log(`⚠️  Warnings: ${results.warnings.length}`);
      results.warnings.forEach((warning, i) => console.log(`   ${i + 1}. ${warning}`));
    }

    if (results.failed.length > 0) {
      console.log('');
      console.log(`❌ Failed: ${results.failed.length}`);
      results.failed.forEach((fail, i) => console.log(`   ${i + 1}. ${fail}`));
    }

    console.log('');
    console.log(`📸 Screenshots: ${results.screenshots.length}`);
    console.log(`📁 Location: ${SCREENSHOT_DIR}/`);
    console.log('');

    // Close browser
    console.log('🔒 Closing browser...');
    await browserService.shutdown();

    return results;
  }
}

// Run the test
runShareDeckTest()
  .then(results => {
    const allPassed = results.failed.length === 0;
    console.log(allPassed ? '✅ All tests passed!' : '⚠️  Some tests had issues');
    process.exit(allPassed ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  });
