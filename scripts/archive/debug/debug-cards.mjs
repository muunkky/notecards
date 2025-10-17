#!/usr/bin/env node

/**
 * Debug Card Loading Issue
 * Comprehensive test of card creation, loading, and display
 */

import puppeteer from 'puppeteer';
import { findChromePath } from './browser-service.mjs';

const APP_URL = 'http://127.0.0.1:5174';

async function debugCards() {
  console.log('🐛 Starting card loading debug test...');
  
  const chromePath = await findChromePath();
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    executablePath: chromePath || undefined,
    args: ['--start-maximized']
  });

  const page = await browser.newPage();
  
  try {
    // Enable console logging from the page
    page.on('console', (msg) => {
      console.log(`🌐 BROWSER: ${msg.text()}`);
    });

    // Navigate to app
    console.log('📱 Navigating to app...');
    await page.goto(APP_URL, { waitUntil: 'networkidle0' });
    
    // Take initial screenshot
    await page.screenshot({ path: './debug-1-initial.png' });
    
    // Check if user is authenticated
    console.log('🔐 Checking authentication status...');
    const isSignedIn = await page.evaluate(() => {
      return !document.body.textContent.includes('Sign in with Google');
    });
    
    if (!isSignedIn) {
      console.log('❌ User not signed in. Please sign in first.');
      await new Promise(resolve => setTimeout(resolve, 10000));
      return;
    }
    
    console.log('✅ User is authenticated');
    
    // Wait for deck list to load
    console.log('📋 Waiting for deck list...');
    await page.waitForSelector('[data-testid="deck-list"]', { timeout: 10000 });
    
    // Find and click on a deck
    const deckElements = await page.$$('[data-testid="deck-item"]');
    console.log(`📦 Found ${deckElements.length} decks`);
    
    if (deckElements.length === 0) {
      console.log('❌ No decks found. Creating a test deck...');
      
      // Create a new deck
      await page.click('button:has-text("Create New Deck")');
      await page.fill('input[placeholder*="deck"]', 'Test Deck for Cards');
      await page.click('button:has-text("Create")');
      
      // Wait for deck creation
      await page.waitForTimeout(2000);
      await page.waitForSelector('[data-testid="deck-item"]');
    }
    
    // Click on the first deck
    console.log('🖱️ Clicking on first deck...');
    await page.click('[data-testid="deck-item"]:first-child');
    
    // Wait for navigation to card screen
    await page.waitForTimeout(3000);
    await page.screenshot({ path: './debug-2-card-screen.png' });
    
    // Check for error messages
    const errorText = await page.evaluate(() => {
      const errorEl = document.querySelector('.text-red-400');
      return errorEl ? errorEl.textContent : null;
    });
    
    if (errorText) {
      console.log(`❌ Error found: ${errorText}`);
    } else {
      console.log('✅ No error messages detected');
    }
    
    // Check current card count
    const cardCount = await page.evaluate(() => {
      const cards = document.querySelectorAll('[data-testid="card-item"]');
      return cards.length;
    });
    
    console.log(`📄 Current card count: ${cardCount}`);
    
    // Try to create a new card
    console.log('➕ Attempting to create a new card...');
    
    const createButton = await page.$('button:has-text("Add Card")');
    if (createButton) {
      await createButton.click();
      
      // Fill in card details
      await page.waitForSelector('input[placeholder*="title"]', { timeout: 5000 });
      await page.fill('input[placeholder*="title"]', 'Debug Test Card');
      await page.fill('textarea[placeholder*="body"]', 'This is a test card created by Puppeteer');
      
      // Save the card
      await page.click('button:has-text("Save")');
      
      console.log('💾 Card creation attempted');
      
      // Wait a moment for the card to appear
      await page.waitForTimeout(3000);
      
      // Check if card count increased
      const newCardCount = await page.evaluate(() => {
        const cards = document.querySelectorAll('[data-testid="card-item"]');
        return cards.length;
      });
      
      console.log(`📄 New card count: ${newCardCount}`);
      
      if (newCardCount > cardCount) {
        console.log('✅ Card creation successful!');
      } else {
        console.log('❌ Card creation failed - count did not increase');
      }
    } else {
      console.log('❌ Add Card button not found');
    }
    
    // Take final screenshot
    await page.screenshot({ path: './debug-3-final.png' });
    
    // Check browser console for any errors
    console.log('🔍 Checking for browser console errors...');
    
    // Get all console messages and network errors
    const logs = await page.evaluate(() => {
      return {
        url: window.location.href,
        userAgent: navigator.userAgent,
        localStorage: localStorage.length,
        errors: window.console._errors || []
      };
    });
    
    console.log('📊 Page info:', logs);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: './debug-error.png' });
  } finally {
    console.log('🔄 Keeping browser open for 10 seconds for manual inspection...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    await browser.close();
  }
}

// Run the debug test
debugCards().catch(console.error);
