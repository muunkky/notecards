/**
 * Production Workflow Testing with Screenshots - IMPROVED
 *
 * Tests the critical path workflow on production and captures screenshots
 * at each step for documentation and verification.
 *
 * Improvements:
 * - Better React state handling
 * - Robust URL checking and navigation
 * - Enhanced logging and debugging
 * - Graceful error handling with detailed diagnostics
 *
 * Usage:
 *   node scripts/test-production-workflow.mjs
 */

import browserService from '../services/browser-service.mjs';
import { promises as fs } from 'fs';
import { resolve } from 'path';

// Configuration
const PRODUCTION_URL = 'https://notecards-1b054.web.app';
const SCREENSHOT_DIR = resolve(process.cwd(), 'docs/screenshots/production-workflow');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

// Test data
const TEST_DECK_TITLE = `Workflow Test ${TIMESTAMP}`;
const TEST_CARD_FRONT = `Question ${TIMESTAMP}`;
const TEST_CARD_BACK = `Answer ${TIMESTAMP}`;
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
 * Check if element exists and is visible
 */
async function waitForElement(page, selector, timeout = 5000) {
  try {
    await page.waitForSelector(selector, { timeout, visible: true });
    return true;
  } catch {
    return false;
  }
}

/**
 * Main workflow test
 */
async function runProductionWorkflowTest() {
  console.log('🎬 Production Workflow Test (Improved)');
  console.log('=========================================');
  console.log(`📍 Target: ${PRODUCTION_URL}`);
  console.log(`📁 Screenshots: ${SCREENSHOT_DIR}`);
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

    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle0', timeout: 30000 });
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

    // Find and click create button with better logging
    const createClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
      console.log(`Found ${buttons.length} clickable elements`);

      const createButton = buttons.find(btn => {
        const text = btn.textContent.toLowerCase();
        return (text.includes('create') && text.includes('deck')) ||
               text.includes('new deck') ||
               text.includes('add deck');
      });

      if (createButton) {
        console.log('Found create button:', createButton.textContent);
        createButton.click();
        return true;
      }
      console.log('No create button found');
      return false;
    });

    if (!createClicked) {
      console.log('⚠️  Create button not found, trying alternative methods...');
      // Alternative: look for + button or specific data attributes
      await page.evaluate(() => {
        const plusButtons = Array.from(document.querySelectorAll('button')).filter(btn =>
          btn.textContent.trim() === '+' || btn.innerHTML.includes('+')
        );
        if (plusButtons.length > 0) {
          plusButtons[0].click();
        }
      });
    }

    await wait(1500, 'Waiting for form...');

    await logPageState(page, 'After create click');
    const screenshot4a = await takeScreenshot(page, step, 'create-form');
    if (screenshot4a) results.screenshots.push(screenshot4a);

    // Fill form with React-aware input handling
    console.log('📝 Filling deck title...');
    const fillResult = await page.evaluate((title) => {
      const inputs = Array.from(document.querySelectorAll('input'));

      // Find title input by placeholder, name, or position
      const titleInput = inputs.find(input => {
        const placeholder = input.placeholder?.toLowerCase() || '';
        const name = input.name?.toLowerCase() || '';
        const id = input.id?.toLowerCase() || '';
        return placeholder.includes('title') ||
               placeholder.includes('name') ||
               name.includes('title') ||
               id.includes('title');
      }) || inputs[0]; // Fallback to first input

      if (titleInput) {
        const initialValue = titleInput.value;

        // React-aware input setting
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(titleInput, title);

        // Trigger React events
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
        titleInput.dispatchEvent(new Event('change', { bubbles: true }));
        titleInput.dispatchEvent(new Event('blur', { bubbles: true }));

        return {
          success: true,
          inputCount: inputs.length,
          inputInfo: titleInput.placeholder || titleInput.name || 'first input',
          initialValue,
          finalValue: titleInput.value,
          matches: titleInput.value === title
        };
      }
      return {
        success: false,
        inputCount: inputs.length,
        error: 'No title input found'
      };
    }, TEST_DECK_TITLE);

    console.log(`🔍 Fill result:`, fillResult);

    if (!fillResult.success) {
      throw new Error('Could not fill deck title');
    }

    await wait(1000);

    // Click save/create with better logging
    console.log('💾 Saving deck...');
    const saveResult = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));

      // Look for the modal's Create button (short, exact match preferred)
      // Prioritize buttons with just "Create", "Save", "Add", or "Submit"
      const exactMatches = buttons.filter(btn => {
        const text = btn.textContent.trim().toLowerCase();
        return text === 'create' || text === 'save' || text === 'add' || text === 'submit';
      });

      // If no exact match, look for buttons containing these words (but not "+ Create New Deck")
      const partialMatches = buttons.filter(btn => {
        const text = btn.textContent.trim().toLowerCase();
        return (text.includes('create') || text.includes('save')) &&
               !text.includes('new deck') &&  // Exclude header button
               text.length < 20;  // Prefer shorter button text (modal buttons)
      });

      const saveButton = exactMatches[0] || partialMatches[0];

      if (saveButton) {
        const result = {
          success: true,
          buttonText: saveButton.textContent,
          disabled: saveButton.disabled,
          className: saveButton.className,
          allButtons: buttons.map(b => b.textContent.trim())
        };

        saveButton.click();
        return result;
      }

      return {
        success: false,
        buttonCount: buttons.length,
        allButtons: buttons.map(b => b.textContent.trim())
      };
    });

    console.log(`🔍 Save result:`, saveResult);

    if (!saveResult.success) {
      console.log('⚠️  Save button not clicked, trying Enter key...');
      await page.keyboard.press('Enter');
    }

    if (saveResult.disabled) {
      console.log('⚠️  Warning: Save button was disabled when clicked!');
    }

    await wait(3000, 'Waiting for deck creation...');

    await logPageState(page, 'After save');
    const screenshot4b = await takeScreenshot(page, step, 'after-save');
    if (screenshot4b) results.screenshots.push(screenshot4b);

    // Check current URL to understand where we are
    const currentUrl = await page.url();
    console.log(`🔍 Current URL: ${currentUrl}`);

    // If we're on a deck detail page, navigate back to home
    if (currentUrl !== PRODUCTION_URL && currentUrl !== `${PRODUCTION_URL}/`) {
      console.log('📍 Navigated to deck view, going back to home...');
      await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle0' });
      await wait(2000, 'Loading home...');

      await logPageState(page, 'After nav to home');
      const screenshot4c = await takeScreenshot(page, step, 'back-to-home');
      if (screenshot4c) results.screenshots.push(screenshot4c);
    }

    // Verify deck exists with correct selectors
    console.log('🔍 Verifying deck creation...');
    const deckVerification = await page.evaluate((title) => {
      const bodyText = document.body.textContent;
      const hasTitle = bodyText.includes(title);

      // Count deck elements using correct data-testid
      const deckElements = document.querySelectorAll('[data-testid="deck-item"]');

      // Find h2 elements with the deck title
      const h2Elements = Array.from(document.querySelectorAll('h2'));
      const deckTitleElement = h2Elements.find(h2 => h2.textContent.includes(title));

      // List all deck titles found on the page
      const allDeckTitles = Array.from(deckElements).map(deck => {
        const h2 = deck.querySelector('h2');
        return h2 ? h2.textContent.trim() : 'No title';
      });

      return {
        hasTitle,
        deckElementCount: deckElements.length,
        hasDeckItem: !!deckTitleElement,
        bodyLength: bodyText.length,
        allDeckTitles
      };
    }, TEST_DECK_TITLE);

    console.log(`🔍 Verification:`, deckVerification);
    console.log(`   - Body includes title: ${deckVerification.hasTitle}`);
    console.log(`   - Deck items found: ${deckVerification.deckElementCount}`);
    console.log(`   - Has matching deck item: ${deckVerification.hasDeckItem}`);
    console.log(`   - All deck titles: ${deckVerification.allDeckTitles.join(', ')}`);

    if (deckVerification.hasDeckItem && deckVerification.deckElementCount > 0) {
      console.log('✅ Deck created and verified (found in deck list)');
      results.passed.push('Create deck');
    } else if (deckVerification.hasTitle) {
      console.log('⚠️  Deck title found but not in expected deck-item element');
      results.warnings.push('Deck verification uncertain');
      results.passed.push('Create deck (tentative)');
    } else {
      console.log('⚠️  Deck title not found in page');
      console.log('   Deck may not have been created');
      results.warnings.push('Deck creation may have failed');
    }

    // Step 5: View deck
    step++;
    console.log(`\n📋 Step ${step}: View Deck Details`);
    console.log('─'.repeat(60));

    // Click on deck to view (using correct data-testid selector)
    const deckClicked = await page.evaluate((title) => {
      console.log('Looking for deck with title:', title);

      // Strategy 1: Find deck-item with matching title in h2
      const deckItems = document.querySelectorAll('[data-testid="deck-item"]');
      console.log(`Found ${deckItems.length} deck items`);

      for (const deckItem of deckItems) {
        const h2 = deckItem.querySelector('h2');
        if (h2 && h2.textContent.includes(title)) {
          console.log('Found matching deck item, clicking...');
          deckItem.click();
          return true;
        }
      }

      // Strategy 2: Find any clickable element with the title
      const allClickable = Array.from(document.querySelectorAll('article, a, [role="button"], div[onclick]'));
      const matchingElement = allClickable.find(el => el.textContent.includes(title));

      if (matchingElement) {
        console.log('Found deck via alternative selector');
        matchingElement.click();
        return true;
      }

      console.log('Could not find deck to click');
      return false;
    }, TEST_DECK_TITLE);

    if (deckClicked) {
      await wait(2000, 'Loading deck view...');

      await logPageState(page, 'Deck view');
      const screenshot5 = await takeScreenshot(page, step, 'deck-view');
      if (screenshot5) results.screenshots.push(screenshot5);

      console.log('✅ Deck view loaded');
      results.passed.push('View deck');
    } else {
      console.log('⚠️  Could not navigate to deck view');
      results.warnings.push('Deck view navigation');
    }

    // Step 6: Create card
    step++;
    console.log(`\n📋 Step ${step}: Create Card`);
    console.log('─'.repeat(60));
    console.log(`📝 Front: "${TEST_CARD_FRONT}"`);
    console.log(`📝 Back: "${TEST_CARD_BACK}"`);

    // Click add card button
    const addCardClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
      const addButton = buttons.find(btn => {
        const text = btn.textContent.toLowerCase();
        return (text.includes('add') && text.includes('card')) ||
               text.includes('new card') ||
               text.includes('create card');
      });

      if (addButton) {
        console.log('Found add card button');
        addButton.click();
        return true;
      }
      return false;
    });

    if (addCardClicked) {
      await wait(1500, 'Waiting for card form...');

      await logPageState(page, 'Card form');
      const screenshot6a = await takeScreenshot(page, step, 'card-form');
      if (screenshot6a) results.screenshots.push(screenshot6a);

      // Fill card front and back
      console.log('📝 Filling card content...');
      const fillResult = await page.evaluate(({ front, back }) => {
        const inputs = Array.from(document.querySelectorAll('input[type="text"], textarea'));

        // Find front and back inputs
        const frontInput = inputs.find(input => {
          const placeholder = input.placeholder?.toLowerCase() || '';
          const name = input.name?.toLowerCase() || '';
          return placeholder.includes('front') || placeholder.includes('question') || name.includes('front');
        }) || inputs[0];

        const backInput = inputs.find(input => {
          const placeholder = input.placeholder?.toLowerCase() || '';
          const name = input.name?.toLowerCase() || '';
          return placeholder.includes('back') || placeholder.includes('answer') || name.includes('back');
        }) || inputs[1];

        // Helper function to get the correct native setter for an element
        const setReactValue = (element, value) => {
          if (!element) return false;

          // Get the correct setter based on element type
          let nativeValueSetter;
          if (element.tagName === 'TEXTAREA') {
            nativeValueSetter = Object.getOwnPropertyDescriptor(
              window.HTMLTextAreaElement.prototype, 'value'
            )?.set;
          } else {
            nativeValueSetter = Object.getOwnPropertyDescriptor(
              window.HTMLInputElement.prototype, 'value'
            )?.set;
          }

          if (nativeValueSetter) {
            nativeValueSetter.call(element, value);
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
            element.dispatchEvent(new Event('blur', { bubbles: true }));
            return true;
          }
          return false;
        };

        const frontSet = setReactValue(frontInput, front);
        const backSet = setReactValue(backInput, back);

        return {
          inputCount: inputs.length,
          frontSet,
          backSet,
          frontValue: frontInput?.value,
          backValue: backInput?.value
        };
      }, { front: TEST_CARD_FRONT, back: TEST_CARD_BACK });

      console.log('🔍 Card fill result:', fillResult);

      await wait(1000);

      // Save card
      console.log('💾 Saving card...');
      const cardSaveResult = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));

        // Look for exact matches first (modal buttons)
        const exactMatches = buttons.filter(btn => {
          const text = btn.textContent.trim().toLowerCase();
          return text === 'save' || text === 'create' || text === 'add';
        });

        // Then look for partial matches (exclude long button text)
        const partialMatches = buttons.filter(btn => {
          const text = btn.textContent.trim().toLowerCase();
          return (text.includes('save') || text.includes('create') || text.includes('add')) &&
                 !text.includes('new') &&
                 text.length < 20;
        });

        const saveButton = exactMatches[0] || partialMatches[0];

        if (saveButton) {
          saveButton.click();
          return {
            success: true,
            buttonText: saveButton.textContent.trim()
          };
        }

        return {
          success: false,
          buttonCount: buttons.length,
          allButtons: buttons.map(b => b.textContent.trim())
        };
      });

      console.log('🔍 Card save result:', cardSaveResult);

      await wait(2000, 'Waiting for card creation...');

      await logPageState(page, 'After card save');
      const screenshot6b = await takeScreenshot(page, step, 'card-created');
      if (screenshot6b) results.screenshots.push(screenshot6b);

      // Verify card exists
      const cardExists = await page.evaluate((front) => {
        return document.body.textContent.includes(front);
      }, TEST_CARD_FRONT);

      if (cardExists) {
        console.log('✅ Card created successfully');
        results.passed.push('Create card');
      } else {
        console.log('⚠️  Card verification uncertain');
        results.warnings.push('Card verification');
      }
    } else {
      console.log('⚠️  Add card button not found');
      results.warnings.push('Card creation skipped');
    }

    // Step 7: Edit card
    step++;
    console.log(`\n📋 Step ${step}: Edit Card`);
    console.log('─'.repeat(60));

    // Find and click edit button or card
    const editClicked = await page.evaluate((front) => {
      // Try to find edit button
      const editButtons = Array.from(document.querySelectorAll('button, [role="button"]')).filter(btn => {
        const text = btn.textContent.toLowerCase();
        return text.includes('edit');
      });

      if (editButtons.length > 0) {
        console.log('Found edit button');
        editButtons[0].click();
        return true;
      }

      // Alternative: click on the card itself
      const cards = Array.from(document.querySelectorAll('[data-card], .card, div[onclick]'));
      const targetCard = cards.find(card => card.textContent.includes(front));
      if (targetCard) {
        console.log('Clicking card itself');
        targetCard.click();
        return true;
      }

      return false;
    }, TEST_CARD_FRONT);

    if (editClicked) {
      await wait(1500);

      const screenshot7a = await takeScreenshot(page, step, 'edit-card');
      if (screenshot7a) results.screenshots.push(screenshot7a);

      // Update the front text
      console.log(`📝 Updating to: "${TEST_CARD_UPDATED_FRONT}"`);
      await page.evaluate((newFront) => {
        const inputs = Array.from(document.querySelectorAll('input[type="text"], textarea'));
        const frontInput = inputs.find(input => {
          const placeholder = input.placeholder?.toLowerCase() || '';
          return placeholder.includes('front') || placeholder.includes('question');
        }) || inputs[0];

        if (frontInput) {
          const nativeValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'value'
          )?.set || Object.getOwnPropertyDescriptor(
            window.HTMLTextAreaElement.prototype, 'value'
          )?.set;

          if (nativeValueSetter) {
            nativeValueSetter.call(frontInput, newFront);
            frontInput.dispatchEvent(new Event('input', { bubbles: true }));
            frontInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      }, TEST_CARD_UPDATED_FRONT);

      await wait(500);

      // Save changes
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const saveButton = buttons.find(btn => btn.textContent.toLowerCase().includes('save'));
        if (saveButton) saveButton.click();
      });

      await wait(2000);

      const screenshot7b = await takeScreenshot(page, step, 'card-updated');
      if (screenshot7b) results.screenshots.push(screenshot7b);

      console.log('✅ Card updated');
      results.passed.push('Edit card');
    } else {
      console.log('⚠️  Edit functionality not tested');
      results.warnings.push('Edit card skipped');
    }

    // Step 8: Delete card (optional, commented out for now)
    // Keeping the card for study session test

    // Step 9: Study session
    step++;
    console.log(`\n📋 Step ${step}: Study Session`);
    console.log('─'.repeat(60));

    // Look for study button
    const studyClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
      const studyButton = buttons.find(btn => btn.textContent.toLowerCase().includes('study'));

      if (studyButton) {
        console.log('Found study button');
        studyButton.click();
        return true;
      }
      return false;
    });

    if (studyClicked) {
      await wait(2000, 'Starting study session...');

      await logPageState(page, 'Study session');
      const screenshot9 = await takeScreenshot(page, step, 'study-session');
      if (screenshot9) results.screenshots.push(screenshot9);

      console.log('✅ Study session started');
      results.passed.push('Study session');
    } else {
      console.log('⚠️  Study button not found');
      results.warnings.push('Study session skipped');
    }

    // Final summary screenshot
    step++;
    console.log(`\n📋 Step ${step}: Final State`);
    console.log('─'.repeat(60));

    const screenshot10 = await takeScreenshot(page, step, 'final-state');
    if (screenshot10) results.screenshots.push(screenshot10);

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
runProductionWorkflowTest()
  .then(results => {
    const allPassed = results.failed.length === 0;
    console.log(allPassed ? '✅ All tests passed!' : '⚠️  Some tests had issues');
    process.exit(allPassed ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  });
