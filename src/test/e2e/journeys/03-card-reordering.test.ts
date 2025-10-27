/**
 * Journey 03: Card Reordering (Drag-Free)
 *
 * Critical Path: Writer restructuring story cards
 * Performance Budget: Card swap < 50ms (instant feel)
 *
 * Why it matters:
 * - User Need: "I want to rearrange my story structure quickly without fighting drag-and-drop"
 * - Business Value: Reordering is THE core interaction - if clunky, writers abandon
 * - Writer Thesis: "Feels like infrastructure - Solid, reliable, honest about what it is"
 *
 * See: docs/testing/critical-user-journeys.md - Flow Journey 3
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import puppeteer, { Browser, Page } from 'puppeteer';
import { authenticatePage } from '../support/auth-helper';

const TEST_URL = 'https://notecards-1b054.web.app';
const CARD_SWAP_BUDGET_MS = 50; // Instant swap feel

describe('Journey 03: Card Reordering', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();

    // Enable console logging from browser
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('[service-account-auth]') || text.includes('[Firebase]') || text.includes('[auth-helper]')) {
        console.log('[BROWSER]', text);
      }
    });

    // Set viewport to simulate typical desktop
    await page.setViewport({ width: 1280, height: 720 });
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  it('should reorder cards using up/down buttons with instant feedback', async () => {
    const journeyStartTime = Date.now();

    // Step 1 & 2: Navigate and authenticate
    await authenticatePage(page, TEST_URL, {
      userEmail: 'e2e-reorder-test@notecards.test'
    });

    // Step 3: Create test deck with 5 cards
    const createDeckButton = await page.waitForSelector('[data-testid="create-deck-button"]', {
      timeout: 5000
    });
    await createDeckButton!.click();

    const deckNameInput = await page.waitForSelector('[data-testid="deck-name-input"]');
    await deckNameInput!.type('Act 2 Restructure');

    const submitDeckButton = await page.$('[data-testid="create-deck-submit"]');
    await submitDeckButton!.click();

    // Wait for deck to appear and click it
    const deckCard = await page.waitForSelector('[data-testid="deck-card"][data-deck-name="Act 2 Restructure"]', {
      timeout: 2000
    });
    await deckCard!.click();

    // Step 4: Create 5 test cards in sequence
    const cardTitles = [
      'Scene 1: Conflict Begins',
      'Scene 2: Rising Action',
      'Scene 3: Midpoint Twist',
      'Scene 4: Dark Moment',
      'Scene 5: Resolution Setup'
    ];

    for (const title of cardTitles) {
      const createCardButton = await page.waitForSelector('[data-testid="create-card-button"]');
      await createCardButton!.click();

      const cardTitleInput = await page.waitForSelector('[data-testid="card-title-input"]');
      await cardTitleInput!.type(title);

      const submitCardButton = await page.$('[data-testid="create-card-submit"]');
      await submitCardButton!.click();

      // Wait briefly for card to appear
      await page.waitForSelector(`[data-testid="card-item"][data-card-title="${title}"]`, {
        timeout: 1000
      });
    }

    // Step 5: Verify initial order
    const initialCards = await page.$$('[data-testid="card-item"]');
    expect(initialCards.length).toBe(5);

    // Get initial card order by reading data-card-title attributes
    const getCardOrder = async () => {
      const cards = await page.$$('[data-testid="card-item"]');
      const titles = [];
      for (const card of cards) {
        const title = await card.evaluate(el => el.getAttribute('data-card-title'));
        titles.push(title);
      }
      return titles;
    };

    const initialOrder = await getCardOrder();
    expect(initialOrder).toEqual(cardTitles);

    // Step 6: Click on the 5th card (Scene 5) to select it for reordering
    const targetCard = await page.$('[data-testid="card-item"][data-card-title="Scene 5: Resolution Setup"]');
    await targetCard!.click();

    // Step 7: Look for "move up" button on selected card
    const moveUpButton = await page.waitForSelector('[data-testid="card-item"][data-card-title="Scene 5: Resolution Setup"] [data-testid="move-card-up"]', {
      timeout: 2000
    });
    expect(moveUpButton).toBeTruthy();

    // Step 8: Move card up 3 times (position 5 → 4 → 3 → 2)
    const swapStartTime = Date.now();

    for (let i = 0; i < 3; i++) {
      const button = await page.$('[data-testid="card-item"][data-card-title="Scene 5: Resolution Setup"] [data-testid="move-card-up"]');
      await button!.click();

      // Wait briefly for swap to complete using setTimeout wrapped in Promise
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const swapDuration = Date.now() - swapStartTime;
    console.log(`Card reordering (3 swaps): ${swapDuration}ms`);

    // Step 9: Verify new order - Scene 5 should now be at position 2 (index 1)
    const newOrder = await getCardOrder();
    expect(newOrder).toEqual([
      'Scene 1: Conflict Begins',
      'Scene 5: Resolution Setup',  // Moved up 3 positions
      'Scene 2: Rising Action',
      'Scene 3: Midpoint Twist',
      'Scene 4: Dark Moment'
    ]);

    // Step 10: Refresh page to verify order persists
    await page.reload();

    // Navigate back to deck after reload
    await page.waitForSelector('[data-testid="deck-card"][data-deck-name="Act 2 Restructure"]', {
      timeout: 5000
    });
    const deckCardAfterReload = await page.$('[data-testid="deck-card"][data-deck-name="Act 2 Restructure"]');
    await deckCardAfterReload!.click();

    // Verify persisted order
    await page.waitForSelector('[data-testid="card-item"]', { timeout: 2000 });
    const persistedOrder = await getCardOrder();
    expect(persistedOrder).toEqual(newOrder);

    const journeyDuration = Date.now() - journeyStartTime;
    console.log(`✅ Journey 03 completed in ${journeyDuration}ms`);
    console.log(`   Card swaps: ${swapDuration}ms for 3 swaps (avg ${Math.round(swapDuration / 3)}ms per swap)`);

    // Verify performance budget
    const avgSwapTime = swapDuration / 3;
    expect(avgSwapTime).toBeLessThan(CARD_SWAP_BUDGET_MS);
  }, 60000); // 60s timeout for full journey
});
