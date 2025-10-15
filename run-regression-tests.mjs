/**
 * Regression Test Integration Script
 * 
 * Integrates regression testing with the consolidated browser automation framework.
 * Provides automated execution of critical sharing system regression tests.
 */

import browserService from '../services/browser-service.mjs';
import { ScreenshotManager } from './browser-automation/utils/screenshot-utils.mjs';
import { createLogger } from './browser-automation/utils/logger.mjs';
import { createAuthHelper } from './browser-automation/utils/auth-helpers.mjs';
import { createValidator } from './browser-automation/utils/validation-helpers.mjs';
import { REGRESSION_TEST_CONFIG, SharingRegressionTests } from './src/test/regression/sharing-regression-config.ts';

const logger = createLogger('regression');

class RegressionTestRunner {
  constructor() {
    this.browserService = null;
    this.authHelper = null;
    this.screenshots = null;
    this.validator = null;
    this.regressionSuite = null;
  }

  async initialize() {
    logger.info('🔧 Initializing Regression Test Runner');

    // Initialize browser service
    logger.step(1, 'Setting up browser automation');
    const connection = await browserService.initialize({ 
      headless: process.env.CI === 'true',
      persistent: true
    });
    this.browserService = browserService;

    // Initialize authentication
    logger.step(2, 'Setting up authentication');
    this.authHelper = await createAuthHelper(browserService);
    
    // Initialize utilities
    const { page } = this.browserService.getBrowser();
    this.screenshots = new ScreenshotManager('regression-tests');
    this.validator = createValidator(page);

    // Initialize regression test suite
    logger.step(3, 'Setting up regression test suite');
    this.regressionSuite = new SharingRegressionTests(this.browserService, this.screenshots);

    logger.success('Regression test runner initialized');
  }

  async authenticateTestUser(userType = 'owner') {
    const user = REGRESSION_TEST_CONFIG.testUsers[userType];
    logger.info(`Authenticating as ${userType}`, { email: user.email });

    try {
      const { page } = this.browserService.getBrowser();
      
      // Navigate to login
      await page.goto(REGRESSION_TEST_CONFIG.environment.baseUrl + '/login');
      
      // Fill credentials
      await page.fill('[data-testid="email-input"]', user.email);
      await page.fill('[data-testid="password-input"]', user.password);
      
      // Submit login
      await page.click('[data-testid="login-button"]');
      
      // Wait for dashboard
      await page.waitForURL(/.*\/decks/, { timeout: 10000 });
      
      logger.success(`Authenticated as ${userType}`);
      await this.screenshots.capture(page, `auth-${userType}`, `Authenticated as ${userType}`);
      
      return { success: true, user };

    } catch (error) {
      logger.error(`Authentication failed for ${userType}`, { error: error.message });
      return { success: false, error: error.message };
    }
  }

  async createTestDeck(name = 'Regression Test Deck') {
    const { page } = this.browserService.getBrowser();
    
    try {
      logger.info('Creating test deck', { name });
      
      // Click create deck button
      await page.click('[data-testid="create-deck-button"]');
      
      // Fill deck name
      await page.fill('[data-testid="deck-name-input"]', name);
      
      // Submit creation
      await page.click('[data-testid="create-deck-confirm"]');
      
      // Wait for deck creation and get ID
      await page.waitForURL(/.*\/decks\/.+/);
      const deckId = page.url().split('/decks/')[1];
      
      logger.success('Test deck created', { deckId, name });
      await this.screenshots.capture(page, 'deck-created', `Test deck created: ${name}`);
      
      return { success: true, deckId, name };

    } catch (error) {
      logger.error('Failed to create test deck', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  async testCriticalDataModelRegression() {
    logger.info('🧪 Testing Critical Data Model Regression');
    
    try {
      const { page } = this.browserService.getBrowser();
      
      // Authenticate as owner
      const authResult = await this.authenticateTestUser('owner');
      if (!authResult.success) {
        throw new Error('Authentication failed');
      }

      // Create test deck
      const deckResult = await this.createTestDeck('Data Model Test');
      if (!deckResult.success) {
        throw new Error('Deck creation failed');
      }

      // Open share dialog
      await page.click(`[data-testid="share-button-${deckResult.deckId}"]`);
      await page.waitForSelector('[role="dialog"]', { state: 'visible' });
      
      // Test collaborator addition (critical regression test)
      await page.fill('input[type="email"]', REGRESSION_TEST_CONFIG.testUsers.collaborator1.email);
      
      const startTime = Date.now();
      await page.click('button:has-text("Add")');
      
      // Wait for result (either success or error)
      await page.waitForTimeout(2000);
      const duration = Date.now() - startTime;
      
      // Check for success indicators
      const errorAlert = await page.locator('[role="alert"]').isVisible();
      const collaboratorInList = await page.locator('[data-testid="collaborator-list"]')
        .locator(`text=${REGRESSION_TEST_CONFIG.testUsers.collaborator1.email}`)
        .isVisible();
      
      await this.screenshots.capture(page, 'data-model-test-result', 'Data model regression test result');
      
      const success = !errorAlert && collaboratorInList;
      
      logger.test('Critical Data Model Regression', success ? 'pass' : 'fail', {
        duration,
        errorPresent: errorAlert,
        collaboratorAdded: collaboratorInList
      });

      return {
        success,
        duration,
        details: {
          errorPresent: errorAlert,
          collaboratorAdded: collaboratorInList,
          testType: 'data-model-regression'
        }
      };

    } catch (error) {
      logger.error('Data model regression test failed', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  async testShareDialogPerformanceRegression() {
    logger.info('⚡ Testing Share Dialog Performance Regression');
    
    try {
      const { page } = this.browserService.getBrowser();
      
      // Authenticate and create deck
      await this.authenticateTestUser('owner');
      const deckResult = await this.createTestDeck('Performance Test');
      
      // Test dialog open performance multiple times
      const measurements = [];
      
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        
        await page.click(`[data-testid="share-button-${deckResult.deckId}"]`);
        await page.waitForSelector('[role="dialog"]', { state: 'visible' });
        
        const duration = Date.now() - startTime;
        measurements.push(duration);
        
        // Close dialog for next iteration
        await page.click('button:has-text("Close")');
        await page.waitForSelector('[role="dialog"]', { state: 'hidden' });
        
        await page.waitForTimeout(500); // Brief pause between tests
      }
      
      const avgDuration = measurements.reduce((a, b) => a + b) / measurements.length;
      const maxDuration = Math.max(...measurements);
      const target = REGRESSION_TEST_CONFIG.performanceBenchmarks.dialogOpen.target;
      
      const success = avgDuration <= target && maxDuration <= (target * 2);
      
      await this.screenshots.capture(page, 'performance-test-complete', 'Performance regression test complete');
      
      logger.test('Share Dialog Performance Regression', success ? 'pass' : 'fail', {
        avgDuration: Math.round(avgDuration),
        maxDuration,
        target,
        measurements
      });

      return {
        success,
        avgDuration,
        maxDuration,
        target,
        measurements,
        details: { testType: 'performance-regression' }
      };

    } catch (error) {
      logger.error('Performance regression test failed', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  async testEmailValidationRegression() {
    logger.info('📧 Testing Email Validation Regression');
    
    try {
      const { page } = this.browserService.getBrowser();
      
      await this.authenticateTestUser('owner');
      const deckResult = await this.createTestDeck('Email Validation Test');
      
      await page.click(`[data-testid="share-button-${deckResult.deckId}"]`);
      await page.waitForSelector('[role="dialog"]', { state: 'visible' });
      
      // Test invalid email formats
      const invalidEmails = ['invalid', 'test@', '@example.com', 'spaces test@example.com'];
      const validationResults = [];
      
      for (const email of invalidEmails) {
        await page.fill('input[type="email"]', email);
        await page.click('button:has-text("Add")');
        
        // Check for error message
        await page.waitForTimeout(1000);
        const errorVisible = await page.locator('[role="alert"]').isVisible();
        
        validationResults.push({
          email,
          errorShown: errorVisible
        });
        
        // Clear for next test
        await page.fill('input[type="email"]', '');
      }
      
      // Test empty email
      await page.click('button:has-text("Add")');
      const emptyEmailError = await page.locator('[role="alert"]').isVisible();
      
      await this.screenshots.capture(page, 'email-validation-test', 'Email validation regression test');
      
      const allValidationsPassed = validationResults.every(r => r.errorShown) && emptyEmailError;
      
      logger.test('Email Validation Regression', allValidationsPassed ? 'pass' : 'fail', {
        validationResults,
        emptyEmailError
      });

      return {
        success: allValidationsPassed,
        validationResults,
        emptyEmailError,
        details: { testType: 'email-validation-regression' }
      };

    } catch (error) {
      logger.error('Email validation regression test failed', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  async runCompleteRegressionSuite() {
    logger.info('🚀 Running Complete Sharing System Regression Suite');
    
    const results = [];
    const startTime = Date.now();
    
    try {
      // Run critical regression tests
      const dataModelResult = await this.testCriticalDataModelRegression();
      results.push({ name: 'Critical Data Model', ...dataModelResult });
      
      const performanceResult = await this.testShareDialogPerformanceRegression();
      results.push({ name: 'Share Dialog Performance', ...performanceResult });
      
      const validationResult = await this.testEmailValidationRegression();
      results.push({ name: 'Email Validation', ...validationResult });
      
      // Generate summary
      const totalDuration = Date.now() - startTime;
      const passed = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      const total = results.length;
      
      const summary = {
        total,
        passed,
        failed,
        successRate: Math.round((passed / total) * 100),
        totalDuration
      };
      
      logger.info('📊 Regression Test Suite Results', summary);
      
      // Final screenshot
      const { page } = this.browserService.getBrowser();
      await this.screenshots.capture(page, 'regression-suite-complete', 'Complete regression suite finished');
      
      return {
        success: failed === 0,
        summary,
        results,
        screenshots: this.screenshots.getSessionInfo()
      };

    } catch (error) {
      logger.error('Regression suite failed', { error: error.message });
      return {
        success: false,
        error: error.message,
        results
      };
    }
  }

  async cleanup() {
    try {
      await this.screenshots?.cleanup(3); // Keep latest 3 sessions
      await this.browserService?.close();
      logger.success('Regression test cleanup complete');
    } catch (error) {
      logger.error('Cleanup failed', { error: error.message });
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    suite: 'complete', // complete, data-model, performance, validation
    headless: process.env.CI === 'true'
  };

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--suite':
        options.suite = args[++i];
        break;
      case '--headless':
        options.headless = true;
        break;
      case '--visible':
        options.headless = false;
        break;
      case '--help':
        console.log(`
🧪 Sharing System Regression Test Runner

Usage: node run-regression-tests.mjs [options]

Options:
  --suite <type>     Run specific test suite (complete, data-model, performance, validation)
  --headless         Run in headless mode
  --visible          Run in visible mode
  --help             Show this help message

Examples:
  node run-regression-tests.mjs
  node run-regression-tests.mjs --suite data-model
  node run-regression-tests.mjs --headless
        `);
        process.exit(0);
        break;
    }
  }

  const runner = new RegressionTestRunner();

  try {
    await runner.initialize();

    let result;
    
    switch (options.suite) {
      case 'data-model':
        result = await runner.testCriticalDataModelRegression();
        break;
      case 'performance':
        result = await runner.testShareDialogPerformanceRegression();
        break;
      case 'validation':
        result = await runner.testEmailValidationRegression();
        break;
      case 'complete':
      default:
        result = await runner.runCompleteRegressionSuite();
        break;
    }

    if (!result.success) {
      console.error('❌ Regression tests failed');
      process.exit(1);
    } else {
      console.log('✅ All regression tests passed');
    }

  } catch (error) {
    console.error('Regression test runner failed:', error.message);
    process.exit(1);
  } finally {
    await runner.cleanup();
  }
}

// Export for programmatic use
export { RegressionTestRunner };

// Run CLI if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default RegressionTestRunner;