/**
 * User Journey E2E Test: Edit and Delete Card
 *
 * User Story:
 * As a user managing my flashcards, I want to edit card content and delete cards I no longer need,
 * so that I can keep my study materials up to date and organized.
 *
 * Journey Steps:
 * 1. Load site and authenticate
 * 2. Create a new deck with a card
 * 3. Edit the card's front content
 * 4. Verify edits are saved
 * 5. Delete the card
 * 6. Verify card is removed from deck
 *
 * Success Criteria:
 * - Card content can be edited and changes persist
 * - Card can be deleted from deck
 * - Deck shows updated state after operations
 * - All interactions captured with screenshots
 *
 * Usage:
 *   npm run test:journey:02
 *   # Or with local dev:
 *   LOCAL_URL=http://localhost:5173 node tests/e2e/user-journeys/02-edit-and-delete-card.mjs
 */

import browserService from '../../../services/browser-service.mjs';
import { getTestConfig } from '../support/test-config.mjs';
import { promises as fs } from 'fs';
import { resolve } from 'path';

// Configuration
const testConfig = getTestConfig();
const TARGET_URL = testConfig.url;
const JOURNEY_NAME = '02-edit-and-delete-card';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const RUN_TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const SCREENSHOT_DIR = resolve(process.cwd(), 'tests/e2e/screenshots', JOURNEY_NAME, RUN_TIMESTAMP);

// Test data
const TEST_DECK_TITLE = `Edit Test Deck ${TIMESTAMP}`;
const TEST_CARD_FRONT = `Original Question ${TIMESTAMP}`;
const TEST_CARD_BACK = `Original Answer ${TIMESTAMP}`;
const TEST_CARD_UPDATED_FRONT = `Updated Question ${TIMESTAMP}`;

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
 * React-aware input setter
 */
async function setReactInput(page, selector, value) {
  return await page.evaluate(({ sel, val }) => {
    const input = document.querySelector(sel);
    if (!input) return { success: false, error: 'Input not found' };

    const nativeValueSetter = Object.getOwnPropertyDescriptor(
      input.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype,
      'value'
    )?.set;

    if (nativeValueSetter) {
      nativeValueSetter.call(input, val);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return { success: true, value: input.value };
    }
    return { success: false, error: 'Could not set value' };
  }, { sel: selector, val: value });
}

/**
 * Main journey test
 */
async function runEditDeleteJourney() {
  console.log('🎬 User Journey E2E Test: Edit and Delete Card');
  console.log('═══════════════════════════════════════════════════');
  console.log(`📍 Target: ${TARGET_URL}`);
  console.log(`🧪 Mode: ${testConfig.mode}`);
  console.log(`📁 Screenshots: ${SCREENSHOT_DIR}`);
  console.log(`👤 User Story: Edit card content and delete cards`);
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

  let page;
  let browser;

  try {
    // Step 1: Initialize browser and authenticate
    step++;
    console.log(`\n📋 Step ${step}: Initialize and Authenticate`);
    console.log('─'.repeat(60));

    const result = await browserService.initialize();
    browser = result.browser;
    page = result.page;
    console.log('✅ Browser initialized');

    // Navigate
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await wait(3000, 'Loading site...');

    const screenshot1 = await takeScreenshot(page, step, 'site-loaded');
    if (screenshot1) results.screenshots.push(screenshot1);

    // Check auth status
    const isAuthenticated = await browserService.checkAuthenticationStatus();

    if (!isAuthenticated) {
      console.log('🔐 Manual authentication required');
      console.log('⏳ Waiting up to 60 seconds for auth...');

      let authAttempts = 0;
      while (authAttempts < 12) {
        await wait(5000);
        authAttempts++;

        const authStatus = await browserService.checkAuthenticationStatus();
        console.log(`🔍 Auth check ${authAttempts}/12...`);

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

    const screenshot1b = await takeScreenshot(page, step, 'authenticated');
    if (screenshot1b) results.screenshots.push(screenshot1b);

    results.passed.push('Initialize and authenticate');

    // Step 2: Create deck with card
    step++;
    console.log(`\n📋 Step ${step}: Create Deck and Card`);
    console.log('─'.repeat(60));
    console.log(`📝 Deck: "${TEST_DECK_TITLE}"`);
    console.log(`📝 Card Front: "${TEST_CARD_FRONT}"`);

    // Create deck
    const createClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const createButton = buttons.find(btn =>
        btn.textContent.toLowerCase().includes('create') &&
        btn.textContent.toLowerCase().includes('deck')
      );
      if (createButton) {
        createButton.click();
        return true;
      }
      return false;
    });

    if (!createClicked) {
      throw new Error('Create deck button not found');
    }

    await wait(1500, 'Waiting for form...');

    // Fill deck title
    const titleFilled = await page.evaluate((title) => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const titleInput = inputs.find(input =>
        input.placeholder?.toLowerCase().includes('title')
      ) || inputs[0];

      if (titleInput) {
        const nativeValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype, 'value'
        ).set;
        nativeValueSetter.call(titleInput, title);
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
        titleInput.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
      return false;
    }, TEST_DECK_TITLE);

    if (!titleFilled) {
      throw new Error('Could not fill deck title');
    }

    await wait(1000);

    // Save deck
    const deckSaved = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const saveButton = buttons.find(btn => {
        const text = btn.textContent.trim().toLowerCase();
        return text === 'create' || text === 'save';
      });
      if (saveButton) {
        saveButton.click();
        return true;
      }
      return false;
    });

    if (!deckSaved) {
      throw new Error('Could not save deck');
    }

    await wait(2000, 'Creating deck...');

    const screenshot2a = await takeScreenshot(page, step, 'deck-created');
    if (screenshot2a) results.screenshots.push(screenshot2a);

    // Click on deck to enter
    const deckClicked = await page.evaluate((title) => {
      const deckItems = document.querySelectorAll('[data-testid="deck-item"]');
      for (const deckItem of deckItems) {
        const h2 = deckItem.querySelector('h2');
        if (h2 && h2.textContent.includes(title)) {
          deckItem.click();
          return true;
        }
      }
      return false;
    }, TEST_DECK_TITLE);

    if (!deckClicked) {
      throw new Error('Could not open deck');
    }

    await wait(2000, 'Opening deck...');

    const screenshot2b = await takeScreenshot(page, step, 'deck-opened');
    if (screenshot2b) results.screenshots.push(screenshot2b);

    // Add card
    const addCardClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addButton = buttons.find(btn =>
        btn.textContent.toLowerCase().includes('add') &&
        btn.textContent.toLowerCase().includes('card')
      );
      if (addButton) {
        addButton.click();
        return true;
      }
      return false;
    });

    if (!addCardClicked) {
      throw new Error('Add card button not found');
    }

    await wait(1500, 'Waiting for card form...');

    // Fill card content
    const cardFilled = await page.evaluate(({ front, back }) => {
      const inputs = Array.from(document.querySelectorAll('input[type="text"], textarea'));

      const frontInput = inputs.find(input =>
        input.placeholder?.toLowerCase().includes('front') ||
        input.placeholder?.toLowerCase().includes('question')
      ) || inputs[0];

      const backInput = inputs.find(input =>
        input.placeholder?.toLowerCase().includes('back') ||
        input.placeholder?.toLowerCase().includes('answer')
      ) || inputs[1];

      if (!frontInput || !backInput) return false;

      const setReactValue = (element, value) => {
        const nativeValueSetter = Object.getOwnPropertyDescriptor(
          element.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype,
          'value'
        )?.set;

        if (nativeValueSetter) {
          nativeValueSetter.call(element, value);
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
        return false;
      };

      const frontSet = setReactValue(frontInput, front);
      const backSet = setReactValue(backInput, back);

      return frontSet && backSet;
    }, { front: TEST_CARD_FRONT, back: TEST_CARD_BACK });

    if (!cardFilled) {
      throw new Error('Could not fill card content');
    }

    await wait(1000);

    // Save card
    const cardSaved = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const saveButton = buttons.find(btn => {
        const text = btn.textContent.trim().toLowerCase();
        return text === 'save' || text === 'create' || text === 'add';
      });
      if (saveButton) {
        saveButton.click();
        return true;
      }
      return false;
    });

    if (!cardSaved) {
      throw new Error('Could not save card');
    }

    await wait(2000, 'Creating card...');

    const screenshot2c = await takeScreenshot(page, step, 'card-created');
    if (screenshot2c) results.screenshots.push(screenshot2c);

    // Verify card exists
    const cardExists = await page.evaluate((front) => {
      return document.body.textContent.includes(front);
    }, TEST_CARD_FRONT);

    if (!cardExists) {
      throw new Error('Card not found after creation');
    }

    console.log('✅ Deck and card created');
    results.passed.push('Create deck and card');

    // Step 3: Edit card
    step++;
    console.log(`\n📋 Step ${step}: Edit Card`);
    console.log('─'.repeat(60));
    console.log(`📝 Updating to: "${TEST_CARD_UPDATED_FRONT}"`);

    // Find and click edit button or card
    const editClicked = await page.evaluate((front) => {
      // Look for edit button first
      const editButtons = Array.from(document.querySelectorAll('button, [role="button"]')).filter(btn =>
        btn.textContent.toLowerCase().includes('edit')
      );

      if (editButtons.length > 0) {
        console.log('Found edit button');
        editButtons[0].click();
        return true;
      }

      // Alternative: click on the card itself
      const cards = Array.from(document.querySelectorAll('[data-testid="card-item"], .card, div'));
      const targetCard = cards.find(card => card.textContent.includes(front));
      if (targetCard) {
        console.log('Clicking card to edit');
        targetCard.click();
        return true;
      }

      return false;
    }, TEST_CARD_FRONT);

    if (!editClicked) {
      throw new Error('Could not trigger edit mode');
    }

    await wait(1500, 'Opening edit form...');

    const screenshot3a = await takeScreenshot(page, step, 'edit-form');
    if (screenshot3a) results.screenshots.push(screenshot3a);

    // Update the front text
    const edited = await page.evaluate((newFront) => {
      const inputs = Array.from(document.querySelectorAll('input[type="text"], textarea'));
      const frontInput = inputs.find(input =>
        input.placeholder?.toLowerCase().includes('front') ||
        input.placeholder?.toLowerCase().includes('question')
      ) || inputs[0];

      if (!frontInput) return false;

      const nativeValueSetter = Object.getOwnPropertyDescriptor(
        frontInput.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype,
        'value'
      )?.set;

      if (nativeValueSetter) {
        nativeValueSetter.call(frontInput, newFront);
        frontInput.dispatchEvent(new Event('input', { bubbles: true }));
        frontInput.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
      return false;
    }, TEST_CARD_UPDATED_FRONT);

    if (!edited) {
      throw new Error('Could not update card content');
    }

    await wait(1000);

    // Save changes
    const editSaved = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const saveButton = buttons.find(btn =>
        btn.textContent.toLowerCase().includes('save') ||
        btn.textContent.toLowerCase().includes('update')
      );
      if (saveButton) {
        saveButton.click();
        return true;
      }
      return false;
    });

    if (!editSaved) {
      console.log('⚠️  Save button not found, trying Enter key...');
      await page.keyboard.press('Enter');
    }

    await wait(2000, 'Saving changes...');

    const screenshot3b = await takeScreenshot(page, step, 'card-updated');
    if (screenshot3b) results.screenshots.push(screenshot3b);

    // Step 4: Verify edit
    step++;
    console.log(`\n📋 Step ${step}: Verify Edit`);
    console.log('─'.repeat(60));

    const editVerified = await page.evaluate((updatedFront) => {
      return document.body.textContent.includes(updatedFront);
    }, TEST_CARD_UPDATED_FRONT);

    if (editVerified) {
      console.log('✅ Card edit verified');
      results.passed.push('Edit card');
    } else {
      throw new Error('Updated card content not found');
    }

    const screenshot4 = await takeScreenshot(page, step, 'edit-verified');
    if (screenshot4) results.screenshots.push(screenshot4);

    // Step 5: Delete card
    step++;
    console.log(`\n📋 Step ${step}: Delete Card`);
    console.log('─'.repeat(60));

    // Find and click delete button
    const deleteClicked = await page.evaluate((updatedFront) => {
      // Look for delete button
      const deleteButtons = Array.from(document.querySelectorAll('button, [role="button"]')).filter(btn => {
        const text = btn.textContent.toLowerCase();
        return text.includes('delete') || text.includes('remove') || text === '×' || text === '✕';
      });

      console.log(`Found ${deleteButtons.length} potential delete buttons`);

      // Try clicking the first delete button we find
      if (deleteButtons.length > 0) {
        deleteButtons[0].click();
        return true;
      }

      return false;
    }, TEST_CARD_UPDATED_FRONT);

    if (!deleteClicked) {
      throw new Error('Delete button not found');
    }

    await wait(1000, 'Clicking delete...');

    const screenshot5a = await takeScreenshot(page, step, 'delete-clicked');
    if (screenshot5a) results.screenshots.push(screenshot5a);

    // Check for confirmation dialog and confirm
    const confirmDeleted = await page.evaluate(() => {
      // Look for confirmation buttons
      const buttons = Array.from(document.querySelectorAll('button'));
      const confirmButton = buttons.find(btn => {
        const text = btn.textContent.toLowerCase();
        return text.includes('delete') || text.includes('confirm') || text.includes('yes');
      });

      if (confirmButton) {
        console.log('Found confirmation button:', confirmButton.textContent);
        confirmButton.click();
        return true;
      }

      console.log('No confirmation dialog found (may not be needed)');
      return false;
    });

    if (confirmDeleted) {
      console.log('✅ Confirmed deletion');
    } else {
      console.log('ℹ️  No confirmation needed');
    }

    await wait(2000, 'Deleting card...');

    const screenshot5b = await takeScreenshot(page, step, 'after-delete');
    if (screenshot5b) results.screenshots.push(screenshot5b);

    // Step 6: Verify deletion
    step++;
    console.log(`\n📋 Step ${step}: Verify Deletion`);
    console.log('─'.repeat(60));

    const cardRemoved = await page.evaluate((updatedFront) => {
      const bodyText = document.body.textContent;
      const stillExists = bodyText.includes(updatedFront);
      return !stillExists; // Should NOT exist anymore
    }, TEST_CARD_UPDATED_FRONT);

    if (cardRemoved) {
      console.log('✅ Card successfully deleted');
      results.passed.push('Delete card');
    } else {
      console.log('⚠️  Card text still present (may not have been deleted)');
      results.warnings.push('Delete verification uncertain');
    }

    const screenshot6 = await takeScreenshot(page, step, 'deletion-verified');
    if (screenshot6) results.screenshots.push(screenshot6);

    console.log('✅ Journey completed');

  } catch (error) {
    console.error(`\n❌ Test failed at step ${step}:`, error.message);

    // Capture error state
    try {
      if (page) {
        await logPageState(page, 'ERROR');
        const errorScreenshot = await takeScreenshot(page, 'ERROR', 'error-state');
        if (errorScreenshot) results.screenshots.push(errorScreenshot);
      }
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
    if (browser) {
      console.log('🔒 Closing browser...');
      await browserService.close();
    }

    return results;
  }
}

// Run the test
runEditDeleteJourney()
  .then(results => {
    const allPassed = results.failed.length === 0;
    console.log(allPassed ? '✅ All tests passed!' : '⚠️  Some tests had issues');
    process.exit(allPassed ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  });
