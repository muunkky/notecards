/**
 * Journey 01: First Card Created
 *
 * Critical Path: First-time user creating their first card
 * Performance Budget: 30 seconds total
 *
 * Why it matters:
 * - User Need: "I want to start writing immediately without setup overhead"
 * - Business Value: First-run experience determines if users stick or bounce
 * - Writer Thesis: "Gets out of the way - The work is what matters, not the tool"
 *
 * See: docs/testing/critical-user-journeys.md - Core Journey 1
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import puppeteer, { Browser, Page } from 'puppeteer';

const TEST_URL = 'https://notecards-1b054.web.app';
const PERFORMANCE_BUDGET_MS = 30000; // 30 seconds
const CARD_CREATION_BUDGET_MS = 300; // 300ms for card creation

describe('Journey 01: First Card Created', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();

    // Set viewport to simulate typical desktop
    await page.setViewport({ width: 1280, height: 720 });
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  it('should complete first card creation journey within performance budget', async () => {
    const journeyStartTime = Date.now();

    // Step 1: Navigate to app
    await page.goto(TEST_URL, { waitUntil: 'networkidle0' });

    // Step 2: Sign in (using Google OAuth - will need auth helper)
    // TODO: Implement auth flow
    // For now, we'll test the authenticated state

    // Step 3: Create first deck "My First Story"
    const createDeckButton = await page.waitForSelector('[data-testid="create-deck-button"]', {
      timeout: 5000
    });
    expect(createDeckButton).toBeTruthy();

    await createDeckButton!.click();

    // Enter deck name
    const deckNameInput = await page.waitForSelector('[data-testid="deck-name-input"]');
    await deckNameInput!.type('My First Story');

    // Submit deck creation
    const submitDeckButton = await page.$('[data-testid="create-deck-submit"]');
    await submitDeckButton!.click();

    // Step 4: Verify instant feedback - deck appears immediately
    const deckCard = await page.waitForSelector('[data-testid="deck-card"][data-deck-name="My First Story"]', {
      timeout: 1000 // Should appear instantly
    });
    expect(deckCard).toBeTruthy();

    // Step 5: Open the deck
    await deckCard!.click();

    // Step 6: Create first card "Opening scene"
    const cardCreationStart = Date.now();

    const createCardButton = await page.waitForSelector('[data-testid="create-card-button"]');
    await createCardButton!.click();

    // Enter card title
    const cardTitleInput = await page.waitForSelector('[data-testid="card-title-input"]');
    await cardTitleInput!.type('Opening scene');

    // Submit card creation
    const submitCardButton = await page.$('[data-testid="create-card-submit"]');
    await submitCardButton!.click();

    // Step 7: Verify card appears in list immediately
    const cardItem = await page.waitForSelector('[data-testid="card-item"][data-card-title="Opening scene"]', {
      timeout: 500 // Writer UX: instant feedback
    });

    const cardCreationDuration = Date.now() - cardCreationStart;
    expect(cardCreationDuration).toBeLessThan(CARD_CREATION_BUDGET_MS);

    // Step 8: Verify card can be clicked to view
    expect(cardItem).toBeTruthy();
    await cardItem!.click();

    // Step 9: Verify card detail view opens
    const cardDetailView = await page.waitForSelector('[data-testid="card-detail-view"]', {
      timeout: 500
    });
    expect(cardDetailView).toBeTruthy();

    // Step 10: Verify card title is displayed
    const cardTitle = await page.$eval('[data-testid="card-detail-title"]', el => el.textContent);
    expect(cardTitle).toBe('Opening scene');

    // Verify overall journey performance
    const journeyDuration = Date.now() - journeyStartTime;
    expect(journeyDuration).toBeLessThan(PERFORMANCE_BUDGET_MS);

    console.log(`✅ Journey 01 completed in ${journeyDuration}ms (budget: ${PERFORMANCE_BUDGET_MS}ms)`);
    console.log(`   Card creation: ${cardCreationDuration}ms (budget: ${CARD_CREATION_BUDGET_MS}ms)`);
  }, PERFORMANCE_BUDGET_MS + 10000); // Add 10s buffer for test overhead
});
