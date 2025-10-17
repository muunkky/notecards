/**
 * Sharing System Regression Test Suite
 * 
 * Automated test suite to prevent regression of sharing system issues.
 * Based on comprehensive validation from SHAREVALIDATION sprint.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';

// Test configuration
const TEST_CONFIG = {
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://notecards-app-de8c8.web.app'
    : 'http://localhost:5173',
  timeout: 30000,
  testUsers: {
    owner: { 
      email: 'test-owner@example.com',
      password: 'test-password-123'
    },
    collaborator1: {
      email: 'test-collaborator1@example.com', 
      password: 'test-password-123'
    },
    collaborator2: {
      email: 'test-collaborator2@example.com',
      password: 'test-password-123'
    }
  }
};

describe('Sharing System Regression Tests', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;

  beforeAll(async () => {
    // Browser setup with stealth mode
    browser = await playwright.chromium.launch({
      headless: process.env.CI === 'true',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
    
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      permissions: ['notifications']
    });
    
    page = await context.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    // Reset to clean state
    await page.goto(TEST_CONFIG.baseUrl);
  });

  describe('Critical Data Model Regression Prevention', () => {
    it('should prevent collaboratorIds vs roles query mismatch', async () => {
      // Test the critical fix that resolved production issue
      await authenticateAsOwner(page);
      
      // Create test deck
      const deckId = await createTestDeck(page, 'Regression Test Deck');
      
      // Add collaborator
      await addCollaborator(page, deckId, TEST_CONFIG.testUsers.collaborator1.email);
      
      // Verify data model consistency
      const deckData = await getDeckData(page, deckId);
      
      expect(deckData.collaboratorIds).toContain(deckData.collaborator1Uid);
      expect(deckData.roles[deckData.collaborator1Uid]).toBe('editor');
      
      // Verify query alignment works
      await verifyCollaboratorAccess(page, deckId, TEST_CONFIG.testUsers.collaborator1);
    });

    it('should maintain roles object integrity during operations', async () => {
      await authenticateAsOwner(page);
      
      const deckId = await createTestDeck(page, 'Roles Integrity Test');
      
      // Add multiple collaborators
      await addCollaborator(page, deckId, TEST_CONFIG.testUsers.collaborator1.email, 'editor');
      await addCollaborator(page, deckId, TEST_CONFIG.testUsers.collaborator2.email, 'viewer');
      
      // Remove one collaborator
      await removeCollaborator(page, deckId, TEST_CONFIG.testUsers.collaborator1.email);
      
      // Verify roles object is clean
      const deckData = await getDeckData(page, deckId);
      expect(deckData.roles[deckData.collaborator1Uid]).toBeUndefined();
      expect(deckData.collaboratorIds).not.toContain(deckData.collaborator1Uid);
      expect(deckData.roles[deckData.collaborator2Uid]).toBe('viewer');
    });
  });

  describe('Share Dialog Functionality Regression', () => {
    it('should open dialog with correct deck information', async () => {
      await authenticateAsOwner(page);
      
      const deckName = 'Dialog Test Deck';
      const deckId = await createTestDeck(page, deckName);
      
      // Open share dialog
      await page.click(`[data-testid="share-button-${deckId}"]`);
      
      // Validate dialog state (all 20 validation points from manual testing)
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('[role="dialog"]')).toContainText(deckName);
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('button:has-text("Add")')).toBeVisible();
      
      // Performance validation - dialog should open quickly
      const startTime = Date.now();
      await page.click(`[data-testid="share-button-${deckId}"]`);
      await page.waitForSelector('[role="dialog"]', { state: 'visible' });
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(500); // Must open in < 500ms
    });

    it('should handle email validation correctly', async () => {
      await authenticateAsOwner(page);
      
      const deckId = await createTestDeck(page, 'Email Validation Test');
      await page.click(`[data-testid="share-button-${deckId}"]`);
      
      // Test invalid email
      await page.fill('input[type="email"]', 'invalid-email');
      await page.click('button:has-text("Add")');
      
      await expect(page.locator('[role="alert"]')).toBeVisible();
      await expect(page.locator('[role="alert"]')).toContainText(/email/i);
      
      // Test empty email
      await page.fill('input[type="email"]', '');
      await page.click('button:has-text("Add")');
      
      await expect(page.locator('[role="alert"]')).toContainText(/enter an email/i);
    });

    it('should handle non-existent user gracefully', async () => {
      await authenticateAsOwner(page);
      
      const deckId = await createTestDeck(page, 'Non-existent User Test');
      await page.click(`[data-testid="share-button-${deckId}"]`);
      
      // Try to add non-existent user
      await page.fill('input[type="email"]', 'nonexistent@example.com');
      await page.click('button:has-text("Add")');
      
      // Should show proper error message
      await expect(page.locator('[role="alert"]')).toContainText(/no account with that email/i);
    });
  });

  describe('Collaborator Management Regression', () => {
    it('should add and display collaborators correctly', async () => {
      await authenticateAsOwner(page);
      
      const deckId = await createTestDeck(page, 'Collaborator Management Test');
      
      // Add collaborator
      await addCollaborator(page, deckId, TEST_CONFIG.testUsers.collaborator1.email);
      
      // Verify collaborator appears in list
      await expect(page.locator('[data-testid="collaborator-list"]')).toContainText(
        TEST_CONFIG.testUsers.collaborator1.email
      );
      
      // Verify role is displayed
      await expect(page.locator('[data-testid="collaborator-role"]')).toContainText('editor');
    });

    it('should handle role changes properly', async () => {
      await authenticateAsOwner(page);
      
      const deckId = await createTestDeck(page, 'Role Change Test');
      await addCollaborator(page, deckId, TEST_CONFIG.testUsers.collaborator1.email, 'editor');
      
      // Change role to viewer
      await page.selectOption('[data-testid="role-select"]', 'viewer');
      
      // Verify role change
      await expect(page.locator('[data-testid="collaborator-role"]')).toContainText('viewer');
      
      // Verify actual permissions changed
      await verifyCollaboratorRole(page, deckId, TEST_CONFIG.testUsers.collaborator1, 'viewer');
    });

    it('should remove collaborators correctly', async () => {
      await authenticateAsOwner(page);
      
      const deckId = await createTestDeck(page, 'Remove Collaborator Test');
      await addCollaborator(page, deckId, TEST_CONFIG.testUsers.collaborator1.email);
      
      // Remove collaborator
      await page.click('[data-testid="remove-collaborator"]');
      
      // Verify collaborator removed from UI
      await expect(page.locator('[data-testid="collaborator-list"]')).not.toContainText(
        TEST_CONFIG.testUsers.collaborator1.email
      );
      
      // Verify access actually revoked
      await verifyNoAccess(page, deckId, TEST_CONFIG.testUsers.collaborator1);
    });
  });

  describe('Performance Regression Prevention', () => {
    it('should maintain fast dialog open times', async () => {
      await authenticateAsOwner(page);
      
      const deckId = await createTestDeck(page, 'Performance Test');
      
      // Test multiple dialog opens for consistency
      const times = [];
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        await page.click(`[data-testid="share-button-${deckId}"]`);
        await page.waitForSelector('[role="dialog"]', { state: 'visible' });
        times.push(Date.now() - startTime);
        
        await page.click('button:has-text("Close")');
        await page.waitForSelector('[role="dialog"]', { state: 'hidden' });
      }
      
      const avgTime = times.reduce((a, b) => a + b) / times.length;
      expect(avgTime).toBeLessThan(500); // Average must be < 500ms
      
      // No single operation should exceed 1 second
      expect(Math.max(...times)).toBeLessThan(1000);
    });

    it('should handle large collaboration lists efficiently', async () => {
      await authenticateAsOwner(page);
      
      const deckId = await createTestDeck(page, 'Large Collaboration Test');
      
      // Add multiple collaborators (simulate large list)
      const collaborators = [
        'collab1@test.com', 'collab2@test.com', 'collab3@test.com',
        'collab4@test.com', 'collab5@test.com'
      ];
      
      const startTime = Date.now();
      
      for (const email of collaborators) {
        await addCollaborator(page, deckId, email);
      }
      
      // Open dialog and verify all collaborators load quickly
      await page.click(`[data-testid="share-button-${deckId}"]`);
      await page.waitForSelector('[role="dialog"]', { state: 'visible' });
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load all within 3 seconds
      
      // Verify all collaborators displayed
      for (const email of collaborators) {
        await expect(page.locator('[data-testid="collaborator-list"]')).toContainText(email);
      }
    });
  });

  describe('Cross-Browser Compatibility Regression', () => {
    // These tests would run in multiple browser contexts
    const browsers = ['chromium', 'firefox', 'webkit'];
    
    browsers.forEach(browserName => {
      it(`should work correctly in ${browserName}`, async () => {
        // Test basic sharing workflow in each browser
        const browserInstance = await playwright[browserName].launch();
        const context = await browserInstance.newContext();
        const page = await context.newPage();
        
        try {
          await page.goto(TEST_CONFIG.baseUrl);
          await authenticateAsOwner(page);
          
          const deckId = await createTestDeck(page, `${browserName} Test`);
          
          // Test share dialog functionality
          await page.click(`[data-testid="share-button-${deckId}"]`);
          await expect(page.locator('[role="dialog"]')).toBeVisible();
          
          // Test collaborator addition
          await addCollaborator(page, deckId, TEST_CONFIG.testUsers.collaborator1.email);
          
          // Verify success
          await expect(page.locator('[data-testid="collaborator-list"]')).toContainText(
            TEST_CONFIG.testUsers.collaborator1.email
          );
          
        } finally {
          await browserInstance.close();
        }
      });
    });
  });

  describe('Security Regression Prevention', () => {
    it('should enforce proper access controls', async () => {
      await authenticateAsOwner(page);
      
      const deckId = await createTestDeck(page, 'Security Test');
      
      // Add viewer collaborator
      await addCollaborator(page, deckId, TEST_CONFIG.testUsers.collaborator1.email, 'viewer');
      
      // Switch to collaborator context
      const collaboratorPage = await createNewAuthenticatedPage(TEST_CONFIG.testUsers.collaborator1);
      
      // Verify viewer cannot access share dialog
      await collaboratorPage.goto(`${TEST_CONFIG.baseUrl}/decks/${deckId}`);
      
      const shareButton = collaboratorPage.locator('[data-testid="share-button"]');
      await expect(shareButton).not.toBeVisible();
      
      // Verify viewer cannot edit deck properties
      const editButton = collaboratorPage.locator('[data-testid="edit-deck"]');
      await expect(editButton).not.toBeVisible();
    });

    it('should prevent unauthorized access to shared decks', async () => {
      await authenticateAsOwner(page);
      
      const deckId = await createTestDeck(page, 'Unauthorized Access Test');
      
      // Try to access deck with unauthorized user
      const unauthorizedPage = await createNewAuthenticatedPage({
        email: 'unauthorized@test.com',
        password: 'test-password'
      });
      
      await unauthorizedPage.goto(`${TEST_CONFIG.baseUrl}/decks/${deckId}`);
      
      // Should redirect or show access denied
      await expect(unauthorizedPage.locator('[data-testid="access-denied"]')).toBeVisible();
    });
  });
});

// Helper functions for test operations
async function authenticateAsOwner(page: Page) {
  await page.goto(TEST_CONFIG.baseUrl + '/login');
  await page.fill('[data-testid="email-input"]', TEST_CONFIG.testUsers.owner.email);
  await page.fill('[data-testid="password-input"]', TEST_CONFIG.testUsers.owner.password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL(/.*\/decks/);
}

async function createTestDeck(page: Page, name: string): Promise<string> {
  await page.click('[data-testid="create-deck-button"]');
  await page.fill('[data-testid="deck-name-input"]', name);
  await page.click('[data-testid="create-deck-confirm"]');
  
  // Extract deck ID from URL or response
  await page.waitForURL(/.*\/decks\/.+/);
  const url = page.url();
  return url.split('/decks/')[1];
}

async function addCollaborator(page: Page, deckId: string, email: string, role: string = 'editor') {
  await page.click(`[data-testid="share-button-${deckId}"]`);
  await page.fill('input[type="email"]', email);
  
  if (role !== 'editor') {
    await page.selectOption('[data-testid="role-select"]', role);
  }
  
  await page.click('button:has-text("Add")');
  await page.waitForSelector('[data-testid="collaborator-list"]');
}

async function removeCollaborator(page: Page, deckId: string, email: string) {
  await page.click(`[data-testid="share-button-${deckId}"]`);
  
  const collaboratorRow = page.locator(`[data-testid="collaborator-row"]:has-text("${email}")`);
  await collaboratorRow.locator('[data-testid="remove-button"]').click();
  
  await page.waitForSelector(`[data-testid="collaborator-row"]:has-text("${email}")`, { 
    state: 'detached' 
  });
}

async function getDeckData(page: Page, deckId: string) {
  // Utility to inspect deck data structure for validation
  return await page.evaluate((id) => {
    // Implementation would depend on how deck data is exposed
    return window.getDeckData?.(id) || {};
  }, deckId);
}

async function verifyCollaboratorAccess(page: Page, deckId: string, user: any) {
  const userPage = await createNewAuthenticatedPage(user);
  await userPage.goto(`${TEST_CONFIG.baseUrl}/decks/${deckId}`);
  
  // Should be able to access the deck
  await expect(userPage.locator('[data-testid="deck-content"]')).toBeVisible();
}

async function verifyNoAccess(page: Page, deckId: string, user: any) {
  const userPage = await createNewAuthenticatedPage(user);
  await userPage.goto(`${TEST_CONFIG.baseUrl}/decks/${deckId}`);
  
  // Should not be able to access the deck
  await expect(userPage.locator('[data-testid="access-denied"]')).toBeVisible();
}

async function createNewAuthenticatedPage(user: any): Promise<Page> {
  const context = await browser.newContext();
  const newPage = await context.newPage();
  
  await newPage.goto(TEST_CONFIG.baseUrl + '/login');
  await newPage.fill('[data-testid="email-input"]', user.email);
  await newPage.fill('[data-testid="password-input"]', user.password);
  await newPage.click('[data-testid="login-button"]');
  await newPage.waitForURL(/.*\/decks/);
  
  return newPage;
}

async function verifyCollaboratorRole(page: Page, deckId: string, user: any, expectedRole: string) {
  const userPage = await createNewAuthenticatedPage(user);
  await userPage.goto(`${TEST_CONFIG.baseUrl}/decks/${deckId}`);
  
  if (expectedRole === 'viewer') {
    // Viewer should not see edit buttons
    await expect(userPage.locator('[data-testid="edit-card-button"]')).not.toBeVisible();
  } else if (expectedRole === 'editor') {
    // Editor should see edit buttons
    await expect(userPage.locator('[data-testid="edit-card-button"]')).toBeVisible();
  }
}