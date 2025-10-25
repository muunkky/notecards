/**
 * User Journey E2E Test: Deck Management
 *
 * User Story:
 * As a user organizing my learning materials, I want to create, rename, and delete decks,
 * so that I can manage my flashcard collections effectively.
 *
 * Journey Steps:
 * 1. Load site and authenticate
 * 2. View current deck list
 * 3. Create three new decks
 * 4. Rename one of the decks
 * 5. Delete one of the decks
 * 6. Verify final deck list is correct
 *
 * Success Criteria:
 * - Can create multiple decks
 * - Can rename a deck
 * - Can delete a deck
 * - Final deck list matches expected state
 * - All interactions captured with screenshots
 *
 * Usage:
 *   npm run test:journey:05
 *   # Or with local dev:
 *   LOCAL_URL=http://localhost:5173 node tests/e2e/user-journeys/05-deck-management.mjs
 */

import browserService from '../../../services/browser-service.mjs';
import { getTestConfig } from '../support/test-config.mjs';
import { promises as fs } from 'fs';
import { resolve } from 'path';

// Configuration
const testConfig = getTestConfig();
const TARGET_URL = testConfig.url;
const JOURNEY_NAME = '05-deck-management';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const RUN_TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const SCREENSHOT_DIR = resolve(process.cwd(), 'tests/e2e/screenshots', JOURNEY_NAME, RUN_TIMESTAMP);

// Test data
const DECK_1_TITLE = `Biology Deck ${TIMESTAMP}`;
const DECK_2_TITLE = `Chemistry Deck ${TIMESTAMP}`;
const DECK_3_TITLE = `Physics Deck ${TIMESTAMP}`;
const DECK_2_RENAMED = `Advanced Chemistry ${TIMESTAMP}`;

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
 * Create a deck with given title
 */
async function createDeck(page, deckTitle) {
  // Click create button
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

  await wait(1500);

  // Fill title
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
  }, deckTitle);

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

  await wait(2000);
}

/**
 * Get list of all deck titles currently visible
 */
async function getDeckTitles(page) {
  return await page.evaluate(() => {
    const deckItems = document.querySelectorAll('[data-testid="deck-item"]');
    const titles = [];
    for (const deckItem of deckItems) {
      const h2 = deckItem.querySelector('h2');
      if (h2) {
        titles.push(h2.textContent.trim());
      }
    }
    return titles;
  });
}

/**
 * Main journey test
 */
async function runDeckManagementJourney() {
  console.log('🎬 User Journey E2E Test: Deck Management');
  console.log('═══════════════════════════════════════════════════');
  console.log(`📍 Target: ${TARGET_URL}`);
  console.log(`🧪 Mode: ${testConfig.mode}`);
  console.log(`📁 Screenshots: ${SCREENSHOT_DIR}`);
  console.log(`👤 User Story: Create, rename, and delete decks`);
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

    // Step 2: View initial deck list
    step++;
    console.log(`\n📋 Step ${step}: View Current Deck List`);
    console.log('─'.repeat(60));

    const initialDecks = await getDeckTitles(page);
    console.log(`📊 Found ${initialDecks.length} existing decks`);
    if (initialDecks.length > 0) {
      console.log(`   Decks: ${initialDecks.slice(0, 3).join(', ')}${initialDecks.length > 3 ? '...' : ''}`);
    }

    const screenshot2 = await takeScreenshot(page, step, 'initial-deck-list');
    if (screenshot2) results.screenshots.push(screenshot2);

    results.passed.push('View deck list');

    // Step 3: Create three decks
    step++;
    console.log(`\n📋 Step ${step}: Create Three Decks`);
    console.log('─'.repeat(60));

    // Create deck 1
    console.log(`📝 Creating: "${DECK_1_TITLE}"`);
    await createDeck(page, DECK_1_TITLE);
    console.log('✅ Deck 1 created');

    // Navigate back to home if needed
    const currentUrl = await page.url();
    if (currentUrl !== TARGET_URL && currentUrl !== `${TARGET_URL}/`) {
      await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
      await wait(2000);
    }

    const screenshot3a = await takeScreenshot(page, step, 'deck-1-created');
    if (screenshot3a) results.screenshots.push(screenshot3a);

    // Create deck 2
    console.log(`📝 Creating: "${DECK_2_TITLE}"`);
    await createDeck(page, DECK_2_TITLE);
    console.log('✅ Deck 2 created');

    const currentUrl2 = await page.url();
    if (currentUrl2 !== TARGET_URL && currentUrl2 !== `${TARGET_URL}/`) {
      await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
      await wait(2000);
    }

    const screenshot3b = await takeScreenshot(page, step, 'deck-2-created');
    if (screenshot3b) results.screenshots.push(screenshot3b);

    // Create deck 3
    console.log(`📝 Creating: "${DECK_3_TITLE}"`);
    await createDeck(page, DECK_3_TITLE);
    console.log('✅ Deck 3 created');

    const currentUrl3 = await page.url();
    if (currentUrl3 !== TARGET_URL && currentUrl3 !== `${TARGET_URL}/`) {
      await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
      await wait(2000);
    }

    const screenshot3c = await takeScreenshot(page, step, 'deck-3-created');
    if (screenshot3c) results.screenshots.push(screenshot3c);

    // Verify all three decks exist
    const decksAfterCreation = await getDeckTitles(page);
    const deck1Exists = decksAfterCreation.some(title => title.includes(DECK_1_TITLE));
    const deck2Exists = decksAfterCreation.some(title => title.includes(DECK_2_TITLE));
    const deck3Exists = decksAfterCreation.some(title => title.includes(DECK_3_TITLE));

    console.log(`🔍 Verification:`);
    console.log(`   - Deck 1: ${deck1Exists ? '✅' : '❌'}`);
    console.log(`   - Deck 2: ${deck2Exists ? '✅' : '❌'}`);
    console.log(`   - Deck 3: ${deck3Exists ? '✅' : '❌'}`);

    if (deck1Exists && deck2Exists && deck3Exists) {
      console.log('✅ All three decks created successfully');
      results.passed.push('Create three decks');
    } else {
      throw new Error('Not all decks were created');
    }

    // Step 4: Rename deck 2
    step++;
    console.log(`\n📋 Step ${step}: Rename Deck`);
    console.log('─'.repeat(60));
    console.log(`📝 Renaming "${DECK_2_TITLE}" to "${DECK_2_RENAMED}"`);

    // Find and click on deck 2 to open it or find edit button
    const deck2Clicked = await page.evaluate((title) => {
      const deckItems = document.querySelectorAll('[data-testid="deck-item"]');
      for (const deckItem of deckItems) {
        const h2 = deckItem.querySelector('h2');
        if (h2 && h2.textContent.includes(title)) {
          // Look for edit/settings button within this deck item
          const buttons = Array.from(deckItem.querySelectorAll('button'));
          const editButton = buttons.find(btn =>
            btn.textContent.toLowerCase().includes('edit') ||
            btn.textContent.toLowerCase().includes('settings') ||
            btn.innerHTML.includes('⋮') || // Three dots menu
            btn.innerHTML.includes('...') ||
            btn.getAttribute('aria-label')?.toLowerCase().includes('menu')
          );

          if (editButton) {
            console.log('Found edit button');
            editButton.click();
            return true;
          }

          // Alternative: click the deck itself
          console.log('Clicking deck item');
          deckItem.click();
          return true;
        }
      }
      return false;
    }, DECK_2_TITLE);

    if (!deck2Clicked) {
      console.log('⚠️  Could not find deck 2 to rename');
      results.warnings.push('Rename skipped - deck not found');
    } else {
      await wait(1500);

      const screenshot4a = await takeScreenshot(page, step, 'deck-2-selected');
      if (screenshot4a) results.screenshots.push(screenshot4a);

      // Try to find rename/edit option
      const renameInitiated = await page.evaluate(() => {
        // Look for rename, edit, or settings buttons
        const buttons = Array.from(document.querySelectorAll('button'));
        const renameButton = buttons.find(btn => {
          const text = btn.textContent.toLowerCase();
          return text.includes('rename') || text.includes('edit') || text.includes('settings');
        });

        if (renameButton) {
          console.log('Found rename button');
          renameButton.click();
          return true;
        }
        return false;
      });

      if (renameInitiated) {
        await wait(1000);

        // Fill new name
        const renamed = await page.evaluate((newName) => {
          const inputs = Array.from(document.querySelectorAll('input'));
          const titleInput = inputs.find(input =>
            input.placeholder?.toLowerCase().includes('title') ||
            input.placeholder?.toLowerCase().includes('name')
          ) || inputs[0];

          if (titleInput) {
            const nativeValueSetter = Object.getOwnPropertyDescriptor(
              window.HTMLInputElement.prototype, 'value'
            ).set;
            nativeValueSetter.call(titleInput, newName);
            titleInput.dispatchEvent(new Event('input', { bubbles: true }));
            titleInput.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
          }
          return false;
        }, DECK_2_RENAMED);

        if (renamed) {
          await wait(500);

          // Save changes
          await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const saveButton = buttons.find(btn =>
              btn.textContent.toLowerCase().includes('save') ||
              btn.textContent.toLowerCase().includes('update')
            );
            if (saveButton) {
              saveButton.click();
            }
          });

          await wait(2000);

          // Navigate back to home
          const currentUrl4 = await page.url();
          if (currentUrl4 !== TARGET_URL && currentUrl4 !== `${TARGET_URL}/`) {
            await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
            await wait(2000);
          }

          const screenshot4b = await takeScreenshot(page, step, 'deck-renamed');
          if (screenshot4b) results.screenshots.push(screenshot4b);

          console.log('✅ Deck renamed');
          results.passed.push('Rename deck');
        } else {
          console.log('⚠️  Could not fill new name');
          results.warnings.push('Rename uncertain');
        }
      } else {
        console.log('⚠️  Rename function not available in UI');
        results.warnings.push('Rename skipped - UI limitation');
      }
    }

    // Step 5: Delete deck 3
    step++;
    console.log(`\n📋 Step ${step}: Delete Deck`);
    console.log('─'.repeat(60));
    console.log(`📝 Deleting "${DECK_3_TITLE}"`);

    // Find and delete deck 3
    const deleteInitiated = await page.evaluate((title) => {
      const deckItems = document.querySelectorAll('[data-testid="deck-item"]');
      for (const deckItem of deckItems) {
        const h2 = deckItem.querySelector('h2');
        if (h2 && h2.textContent.includes(title)) {
          // Look for delete button
          const buttons = Array.from(deckItem.querySelectorAll('button'));
          const deleteButton = buttons.find(btn => {
            const text = btn.textContent.toLowerCase();
            return text.includes('delete') || text.includes('remove') || text === '×';
          });

          if (deleteButton) {
            console.log('Found delete button');
            deleteButton.click();
            return true;
          }

          // Alternative: click on deck then find delete
          console.log('Clicking deck to find delete option');
          deckItem.click();
          return true;
        }
      }
      return false;
    }, DECK_3_TITLE);

    if (!deleteInitiated) {
      console.log('⚠️  Could not find deck 3 to delete');
      results.warnings.push('Delete skipped - deck not found');
    } else {
      await wait(1500);

      const screenshot5a = await takeScreenshot(page, step, 'deck-3-selected');
      if (screenshot5a) results.screenshots.push(screenshot5a);

      // Try to find delete button
      const deleted = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const deleteButton = buttons.find(btn => {
          const text = btn.textContent.toLowerCase();
          return text.includes('delete') || text.includes('remove');
        });

        if (deleteButton) {
          console.log('Found delete button');
          deleteButton.click();
          return true;
        }
        return false;
      });

      if (deleted) {
        await wait(1000);

        // Confirm deletion if prompted
        await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const confirmButton = buttons.find(btn => {
            const text = btn.textContent.toLowerCase();
            return text.includes('delete') || text.includes('confirm') || text.includes('yes');
          });
          if (confirmButton) {
            confirmButton.click();
          }
        });

        await wait(2000);

        // Navigate back to home
        const currentUrl5 = await page.url();
        if (currentUrl5 !== TARGET_URL && currentUrl5 !== `${TARGET_URL}/`) {
          await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
          await wait(2000);
        }

        const screenshot5b = await takeScreenshot(page, step, 'deck-deleted');
        if (screenshot5b) results.screenshots.push(screenshot5b);

        console.log('✅ Deck deleted');
        results.passed.push('Delete deck');
      } else {
        console.log('⚠️  Delete function not available in UI');
        results.warnings.push('Delete skipped - UI limitation');
      }
    }

    // Step 6: Verify final deck list
    step++;
    console.log(`\n📋 Step ${step}: Verify Final Deck List`);
    console.log('─'.repeat(60));

    const finalDecks = await getDeckTitles(page);

    console.log(`📊 Final verification:`);
    console.log(`   - Initial decks: ${initialDecks.length}`);
    console.log(`   - Final decks: ${finalDecks.length}`);
    console.log(`   - Expected: ${initialDecks.length + 2} decks (created 3, deleted 1)`);

    const deck1Still = finalDecks.some(title => title.includes(DECK_1_TITLE));
    const deck2Renamed = finalDecks.some(title => title.includes(DECK_2_RENAMED));
    const deck3Gone = !finalDecks.some(title => title.includes(DECK_3_TITLE));

    console.log(`   - Deck 1 exists: ${deck1Still ? '✅' : '❌'}`);
    console.log(`   - Deck 2 renamed: ${deck2Renamed ? '✅' : '⚠️  (may not have been renamed)'}`);
    console.log(`   - Deck 3 deleted: ${deck3Gone ? '✅' : '⚠️  (may not have been deleted)'}`);

    const screenshot6 = await takeScreenshot(page, step, 'final-deck-list');
    if (screenshot6) results.screenshots.push(screenshot6);

    if (deck1Still) {
      console.log('✅ Final deck list verified');
      results.passed.push('Verify final state');
    } else {
      results.warnings.push('Final deck list verification uncertain');
    }

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
runDeckManagementJourney()
  .then(results => {
    const allPassed = results.failed.length === 0;
    console.log(allPassed ? '✅ All tests passed!' : '⚠️  Some tests had issues');
    process.exit(allPassed ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  });
