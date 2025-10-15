/**
 * Large Collaboration List Performance Testing Script
 * 
 * Part of SHAREVALIDATION sprint - tests sharing system performance with large 
 * collaboration lists to identify scalability limits and performance bottlenecks.
 */

import browserService from './services/browser-service.mjs';
import { ScreenshotManager } from './browser-automation/utils/screenshot-utils.mjs';
import { createLogger } from './browser-automation/utils/logger.mjs';
import { createAuthHelper } from './browser-automation/utils/auth-helpers.mjs';

const logger = createLogger('performance-testing');

class LargeCollaborationPerformanceTester {
  constructor() {
    this.browserService = null;
    this.authHelper = null;
    this.screenshots = null;
    this.testResults = [];
    this.performanceData = [];
  }

  async initialize() {
    logger.info('🚀 Initializing Large Collaboration Performance Tester');

    // Initialize browser service
    const connection = await browserService.initialize({ 
      headless: process.env.CI === 'true',
      persistent: true
    });
    this.browserService = browserService;

    // Initialize authentication
    this.authHelper = await createAuthHelper(browserService);
    
    // Initialize utilities
    this.screenshots = new ScreenshotManager('performance-testing');

    logger.success('Performance tester initialized');
  }

  async authenticateAsOwner() {
    const user = { 
      email: 'test-owner@example.com', 
      password: 'test-password-123' 
    };
    
    logger.info('Authenticating as deck owner');

    try {
      const { page } = this.browserService.getBrowser();
      
      await page.goto('http://localhost:5173/login');
      await page.fill('[data-testid="email-input"]', user.email);
      await page.fill('[data-testid="password-input"]', user.password);
      await page.click('[data-testid="login-button"]');
      await page.waitForURL(/.*\/decks/, { timeout: 10000 });
      
      logger.success('Authenticated as owner');
      return { success: true };

    } catch (error) {
      logger.error('Authentication failed', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  async createTestDeck(name = 'Performance Test Deck') {
    const { page } = this.browserService.getBrowser();
    
    try {
      logger.info('Creating test deck', { name });
      
      await page.click('[data-testid="create-deck-button"]');
      await page.fill('[data-testid="deck-name-input"]', name);
      await page.click('[data-testid="create-deck-confirm"]');
      
      await page.waitForURL(/.*\/decks\/.+/);
      const deckId = page.url().split('/decks/')[1];
      
      logger.success('Test deck created', { deckId, name });
      return { success: true, deckId, name };

    } catch (error) {
      logger.error('Failed to create test deck', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  async generateTestCollaborators(count) {
    const collaborators = [];
    
    for (let i = 1; i <= count; i++) {
      collaborators.push({
        email: `collaborator${i}@performancetest.com`,
        role: i % 3 === 0 ? 'viewer' : 'editor', // Mix of roles
        displayName: `Test Collaborator ${i}`
      });
    }
    
    return collaborators;
  }

  async testCollaboratorAdditionPerformance(deckId, collaboratorCount) {
    logger.info(`🧪 Testing collaborator addition performance`, { collaboratorCount });
    
    const { page } = this.browserService.getBrowser();
    const collaborators = await this.generateTestCollaborators(collaboratorCount);
    const timings = [];
    
    try {
      // Open share dialog
      await page.click(`[data-testid="share-button-${deckId}"]`);
      await page.waitForSelector('[role="dialog"]', { state: 'visible' });
      
      let totalStartTime = Date.now();
      
      // Add collaborators one by one and measure performance
      for (let i = 0; i < collaborators.length; i++) {
        const collaborator = collaborators[i];
        
        logger.step(i + 1, `Adding ${collaborator.email}`);
        
        const startTime = Date.now();
        
        // Fill email
        await page.fill('input[type="email"]', collaborator.email);
        
        // Set role if needed
        if (collaborator.role === 'viewer') {
          await page.selectOption('[data-testid="role-select"]', 'viewer');
        }
        
        // Click add
        await page.click('button:has-text("Add")');
        
        // Wait for addition to complete (success or error)
        await page.waitForTimeout(1000);
        
        const duration = Date.now() - startTime;
        timings.push({
          collaboratorIndex: i + 1,
          email: collaborator.email,
          duration,
          role: collaborator.role
        });
        
        // Check for errors
        const errorVisible = await page.locator('[role="alert"]').isVisible();
        if (errorVisible) {
          const errorText = await page.locator('[role="alert"]').textContent();
          logger.warn(`Error adding ${collaborator.email}`, { error: errorText });
        }
        
        // Clear email field for next collaborator
        await page.fill('input[type="email"]', '');
        
        // Brief pause to avoid overwhelming the system
        if (i < collaborators.length - 1) {
          await page.waitForTimeout(200);
        }
      }
      
      const totalDuration = Date.now() - totalStartTime;
      
      // Take screenshot of final state
      await this.screenshots.capture(page, `collaborator-list-${collaboratorCount}`, 
        `${collaboratorCount} collaborators added`);
      
      // Calculate performance metrics
      const avgDuration = timings.reduce((sum, t) => sum + t.duration, 0) / timings.length;
      const maxDuration = Math.max(...timings.map(t => t.duration));
      const minDuration = Math.min(...timings.map(t => t.duration));
      
      // Count successful additions
      const successfulAdditions = await page.locator('[data-testid="collaborator-list"] [data-testid="collaborator-row"]').count();
      
      const result = {
        collaboratorCount,
        totalDuration,
        avgDuration: Math.round(avgDuration),
        maxDuration,
        minDuration,
        successfulAdditions,
        expectedAdditions: collaborators.length,
        successRate: Math.round((successfulAdditions / collaborators.length) * 100),
        timings
      };
      
      logger.test(`Collaborator Addition Performance (${collaboratorCount})`, 
        successfulAdditions === collaborators.length ? 'pass' : 'fail', result);
      
      return { success: true, ...result };

    } catch (error) {
      logger.error('Collaborator addition performance test failed', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  async testDialogOpenPerformanceWithLargeList(deckId, expectedCollaboratorCount) {
    logger.info(`⚡ Testing dialog open performance with ${expectedCollaboratorCount} collaborators`);
    
    const { page } = this.browserService.getBrowser();
    const measurements = [];
    
    try {
      // Test multiple dialog opens to get consistent measurements
      for (let i = 0; i < 10; i++) {
        const startTime = Date.now();
        
        await page.click(`[data-testid="share-button-${deckId}"]`);
        await page.waitForSelector('[role="dialog"]', { state: 'visible' });
        
        // Wait for collaborator list to fully load
        await page.waitForSelector('[data-testid="collaborator-list"]');
        
        const duration = Date.now() - startTime;
        measurements.push(duration);
        
        // Close dialog
        await page.click('button:has-text("Close")');
        await page.waitForSelector('[role="dialog"]', { state: 'hidden' });
        
        // Brief pause between measurements
        await page.waitForTimeout(500);
      }
      
      const avgDuration = measurements.reduce((a, b) => a + b) / measurements.length;
      const maxDuration = Math.max(...measurements);
      const minDuration = Math.min(...measurements);
      
      // Performance thresholds based on collaborator count
      const baseThreshold = 500; // Base 500ms for empty list
      const perCollaboratorPenalty = 10; // Allow 10ms per collaborator
      const threshold = baseThreshold + (expectedCollaboratorCount * perCollaboratorPenalty);
      
      const success = avgDuration <= threshold && maxDuration <= (threshold * 2);
      
      await this.screenshots.capture(page, `dialog-performance-${expectedCollaboratorCount}`, 
        `Dialog with ${expectedCollaboratorCount} collaborators`);
      
      const result = {
        expectedCollaboratorCount,
        avgDuration: Math.round(avgDuration),
        maxDuration,
        minDuration,
        threshold,
        success,
        measurements
      };
      
      logger.test(`Dialog Open Performance (${expectedCollaboratorCount} collaborators)`, 
        success ? 'pass' : 'fail', result);
      
      return { success: true, ...result };

    } catch (error) {
      logger.error('Dialog performance test failed', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  async testScrollingPerformanceWithLargeList(deckId, expectedCollaboratorCount) {
    logger.info(`📜 Testing scrolling performance with ${expectedCollaboratorCount} collaborators`);
    
    const { page } = this.browserService.getBrowser();
    
    try {
      // Open dialog
      await page.click(`[data-testid="share-button-${deckId}"]`);
      await page.waitForSelector('[role="dialog"]', { state: 'visible' });
      
      const collaboratorList = page.locator('[data-testid="collaborator-list"]');
      
      // Test scrolling performance
      const scrollTests = [];
      
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        
        // Scroll to bottom
        await collaboratorList.evaluate(el => {
          el.scrollTop = el.scrollHeight;
        });
        
        await page.waitForTimeout(100); // Allow render time
        
        // Scroll to top
        await collaboratorList.evaluate(el => {
          el.scrollTop = 0;
        });
        
        await page.waitForTimeout(100); // Allow render time
        
        const duration = Date.now() - startTime;
        scrollTests.push(duration);
      }
      
      const avgScrollTime = scrollTests.reduce((a, b) => a + b) / scrollTests.length;
      const maxScrollTime = Math.max(...scrollTests);
      
      // Scrolling should remain smooth even with large lists
      const success = avgScrollTime <= 500 && maxScrollTime <= 1000;
      
      await this.screenshots.capture(page, `scroll-performance-${expectedCollaboratorCount}`, 
        `Scrolling test with ${expectedCollaboratorCount} collaborators`);
      
      const result = {
        expectedCollaboratorCount,
        avgScrollTime: Math.round(avgScrollTime),
        maxScrollTime,
        success,
        scrollTests
      };
      
      logger.test(`Scrolling Performance (${expectedCollaboratorCount} collaborators)`, 
        success ? 'pass' : 'fail', result);
      
      return { success: true, ...result };

    } catch (error) {
      logger.error('Scrolling performance test failed', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  async testCollaboratorRemovalPerformance(deckId, removalCount) {
    logger.info(`🗑️ Testing collaborator removal performance`, { removalCount });
    
    const { page } = this.browserService.getBrowser();
    
    try {
      // Open dialog
      await page.click(`[data-testid="share-button-${deckId}"]`);
      await page.waitForSelector('[role="dialog"]', { state: 'visible' });
      
      const removalTimings = [];
      
      // Remove specified number of collaborators
      for (let i = 0; i < removalCount; i++) {
        const startTime = Date.now();
        
        // Find first remove button
        const removeButton = page.locator('[data-testid="remove-collaborator"]').first();
        
        if (await removeButton.isVisible()) {
          await removeButton.click();
          
          // Wait for removal to complete
          await page.waitForTimeout(1000);
          
          const duration = Date.now() - startTime;
          removalTimings.push(duration);
          
          logger.step(i + 1, `Removed collaborator in ${duration}ms`);
        } else {
          logger.warn(`No more collaborators to remove at iteration ${i + 1}`);
          break;
        }
      }
      
      const avgRemovalTime = removalTimings.reduce((a, b) => a + b) / removalTimings.length;
      const maxRemovalTime = Math.max(...removalTimings);
      
      // Removal should be fast regardless of list size
      const success = avgRemovalTime <= 2000 && maxRemovalTime <= 3000;
      
      await this.screenshots.capture(page, `removal-performance`, 
        `After removing ${removalTimings.length} collaborators`);
      
      const result = {
        removalCount: removalTimings.length,
        avgRemovalTime: Math.round(avgRemovalTime),
        maxRemovalTime,
        success,
        removalTimings
      };
      
      logger.test(`Collaborator Removal Performance`, success ? 'pass' : 'fail', result);
      
      return { success: true, ...result };

    } catch (error) {
      logger.error('Removal performance test failed', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  async runComprehensivePerformanceTest() {
    logger.info('🎯 Running Comprehensive Large Collaboration Performance Test');
    
    const startTime = Date.now();
    const results = {
      testSuites: [],
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0
      }
    };
    
    try {
      // Authenticate
      const authResult = await this.authenticateAsOwner();
      if (!authResult.success) {
        throw new Error('Authentication failed');
      }

      // Create test deck
      const deckResult = await this.createTestDeck('Large Collaboration Performance Test');
      if (!deckResult.success) {
        throw new Error('Deck creation failed');
      }

      const deckId = deckResult.deckId;
      
      // Test various collaboration list sizes
      const testSizes = [5, 10, 25, 50];
      
      for (const size of testSizes) {
        logger.info(`🔍 Testing with ${size} collaborators`);
        
        // Test collaborator addition performance
        const additionResult = await this.testCollaboratorAdditionPerformance(deckId, size);
        results.testSuites.push({
          name: `Collaborator Addition (${size})`,
          type: 'addition',
          size,
          ...additionResult
        });
        
        if (additionResult.success && additionResult.successfulAdditions > 0) {
          // Test dialog open performance with current list
          const dialogResult = await this.testDialogOpenPerformanceWithLargeList(deckId, additionResult.successfulAdditions);
          results.testSuites.push({
            name: `Dialog Open Performance (${additionResult.successfulAdditions})`,
            type: 'dialog-performance',
            size: additionResult.successfulAdditions,
            ...dialogResult
          });
          
          // Test scrolling performance
          const scrollResult = await this.testScrollingPerformanceWithLargeList(deckId, additionResult.successfulAdditions);
          results.testSuites.push({
            name: `Scrolling Performance (${additionResult.successfulAdditions})`,
            type: 'scrolling',
            size: additionResult.successfulAdditions,
            ...scrollResult
          });
          
          // Test removal performance (remove some collaborators for next test)
          if (size < Math.max(...testSizes)) {
            const removalCount = Math.min(5, additionResult.successfulAdditions);
            const removalResult = await this.testCollaboratorRemovalPerformance(deckId, removalCount);
            results.testSuites.push({
              name: `Collaborator Removal (${removalCount})`,
              type: 'removal',
              size: removalCount,
              ...removalResult
            });
          }
        }
        
        // Brief pause between size tests
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Calculate summary
      results.summary.totalTests = results.testSuites.length;
      results.summary.passedTests = results.testSuites.filter(t => t.success).length;
      results.summary.failedTests = results.summary.totalTests - results.summary.passedTests;
      results.summary.successRate = Math.round((results.summary.passedTests / results.summary.totalTests) * 100);
      results.summary.totalDuration = Date.now() - startTime;
      
      // Final screenshot
      const { page } = this.browserService.getBrowser();
      await this.screenshots.capture(page, 'performance-test-complete', 
        'Large collaboration performance testing complete');
      
      logger.info('📊 Performance Test Results', results.summary);
      
      return {
        success: results.summary.failedTests === 0,
        results,
        screenshots: this.screenshots.getSessionInfo()
      };

    } catch (error) {
      logger.error('Comprehensive performance test failed', { error: error.message });
      return {
        success: false,
        error: error.message,
        results
      };
    }
  }

  async cleanup() {
    try {
      await this.screenshots?.cleanup(3);
      await this.browserService?.close();
      logger.success('Performance test cleanup complete');
    } catch (error) {
      logger.error('Cleanup failed', { error: error.message });
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    testType: 'comprehensive', // comprehensive, addition, dialog, scrolling, removal
    size: 25,
    headless: process.env.CI === 'true'
  };

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--test':
        options.testType = args[++i];
        break;
      case '--size':
        options.size = parseInt(args[++i]);
        break;
      case '--headless':
        options.headless = true;
        break;
      case '--visible':
        options.headless = false;
        break;
      case '--help':
        console.log(`
⚡ Large Collaboration Performance Testing

Usage: node performance-large-collaboration-test.mjs [options]

Options:
  --test <type>      Test type (comprehensive, addition, dialog, scrolling, removal)
  --size <number>    Number of collaborators for single tests (default: 25)
  --headless         Run in headless mode
  --visible          Run in visible mode
  --help             Show this help message

Examples:
  node performance-large-collaboration-test.mjs
  node performance-large-collaboration-test.mjs --test addition --size 50
  node performance-large-collaboration-test.mjs --headless
        `);
        process.exit(0);
        break;
    }
  }

  const tester = new LargeCollaborationPerformanceTester();

  try {
    await tester.initialize();

    let result;
    
    if (options.testType === 'comprehensive') {
      result = await tester.runComprehensivePerformanceTest();
    } else {
      // Individual test implementations would go here
      logger.error('Individual test types not implemented in this demo');
      process.exit(1);
    }

    if (!result.success) {
      console.error('❌ Performance tests failed');
      console.error('Results:', JSON.stringify(result.results?.summary || {}, null, 2));
      process.exit(1);
    } else {
      console.log('✅ All performance tests passed');
      console.log('Summary:', JSON.stringify(result.results?.summary || {}, null, 2));
    }

  } catch (error) {
    console.error('Performance test runner failed:', error.message);
    process.exit(1);
  } finally {
    await tester.cleanup();
  }
}

// Export for programmatic use
export { LargeCollaborationPerformanceTester };

// Run CLI if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default LargeCollaborationPerformanceTester;