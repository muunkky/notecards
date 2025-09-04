import { mkdirSync, existsSync, createWriteStream } from 'fs';
import { join } from 'path';
import browserService from './browser-service.mjs';

/**
 * Puppeteer Test Framework integrated with existing test logging
 */
class PuppeteerTestFramework {
  constructor(options = {}) {
    this.testName = options.testName || 'puppeteer-ui-tests';
    this.setupLogging();
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0,
      startTime: Date.now(),
      endTime: null
    };
  }

  setupLogging() {
    // Use same logging structure as existing tests
    const logDir = join(process.cwd(), 'log', 'temp');
    if (!existsSync(logDir)) {
      mkdirSync(logDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:T]/g, '-').replace(/\..+/, '');
    this.logFile = join(logDir, `puppeteer-test-${timestamp}.log`);
    this.jsonFile = join(logDir, `puppeteer-test-${timestamp}.json`);
    
    this.logStream = createWriteStream(this.logFile, { flags: 'a' });
    
    // Log initial header matching existing format
    this.log('[PUPPETEER-TEST-START]');
    this.log(`testSuite: ${this.testName}`);
    this.log(`logFile: ${this.logFile}`);
    this.log(`jsonSummary: ${this.jsonFile}`);
    this.log('status: INITIALIZING');
    this.log('[PUPPETEER-TEST-HEADER-END]');
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    
    // Only write to stream if it's still open
    if (this.logStream && !this.logStream.destroyed) {
      this.logStream.write(logMessage + '\n');
    }
  }

  describe(suiteName, testFn) {
    this.log(`📦 Test Suite: ${suiteName}`);
    return testFn.call(this);
  }

  test(testName, testFn) {
    this.tests.push({ name: testName, fn: testFn });
    return this;
  }

  async initialize() {
    this.log('🔄 Initializing browser service...');
    this.log('🔍 About to call browserService.initialize()');
    const connection = await browserService.initialize({ persistent: true });
    this.log('🔍 browserService.initialize() completed successfully');
    
    this.page = connection.page;
    this.browser = connection.browser;
    this.browserService = connection.service;
    
    this.log('✅ Browser service initialized');
    this.log('🔍 Connection details:', {
      browser: !!this.browser,
      page: !!this.page,
      service: !!this.browserService,
      isAuthenticated: connection.isAuthenticated
    });
  }

  // Safe timeout method
  async waitFor(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async navigateAndWait(url, waitOptions = {}) {
    this.log(`🌐 Navigating to: ${url}`);
    try {
      await this.page.goto(url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000,
        ...waitOptions 
      });
      // Wait a bit for React app to load
      await this.waitFor(2000);
      this.log(`✅ Navigation complete`);
    } catch (error) {
      this.log(`⚠️  Navigation timeout, but continuing: ${error.message}`);
      // Continue anyway - the page might have loaded enough
    }
  }

  async close(options = {}) {
    // Always close browser cleanly - session data is preserved automatically
    if (this.logStream && !this.logStream.destroyed && !this.logStream.writableEnded) {
      this.log('� Closing browser service...');
    } else {
      console.log('[' + new Date().toISOString() + '] � Closing browser service...');
    }
    
    if (this.browserService) {
      await this.browserService.close();
    }
    
    if (this.logStream && !this.logStream.destroyed) {
      this.logStream.end();
    }
  }

  expect(condition, message) {
    if (!condition) {
      throw new Error(`Expectation failed: ${message}`);
    }
    this.log(`✅ Assertion passed: ${message}`);
  }

  async runTests() {
    this.log('🚀 Starting Puppeteer test execution...');
    this.results.total = this.tests.length;
    
    // Browser service is already initialized, just navigate and authenticate
    try {
      // Navigate to app first, then check authentication
      await this.browserService.navigateToApp();
      const authSuccess = await this.browserService.handleAuthentication();
      
      if (!authSuccess) {
        this.log('❌ Authentication failed. Cannot run tests.');
        await this.finalize();
        return {
          ...this.results,
          duration: this.results.endTime ? (this.results.endTime - this.results.startTime) : 0,
          logFile: this.logFile,
          jsonFile: this.jsonFile,
          success: false
        };
      }

      this.log(`✅ Browser session ready. Running ${this.tests.length} tests...`);

    } catch (error) {
      this.log(`❌ Failed to initialize browser: ${error.message}`);
      await this.finalize();
      return {
        ...this.results,
        duration: this.results.endTime ? (this.results.endTime - this.results.startTime) : 0,
        logFile: this.logFile,
        jsonFile: this.jsonFile,
        success: false
      };
    }

    // Run each test
    for (let i = 0; i < this.tests.length; i++) {
      const test = this.tests[i];
      await this.runSingleTest(test, i + 1);
    }

    await this.finalize();
    
    // Return results object with additional properties
    return {
      ...this.results,
      duration: this.results.endTime - this.results.startTime,
      logFile: this.logFile,
      jsonFile: this.jsonFile,
      success: this.results.failed === 0
    };
  }

  async runSingleTest(test, index) {
    const startTime = Date.now();
    this.log(`\n🧪 Test ${index}/${this.tests.length}: ${test.name}`);
    
    try {
      // Run test with browser session context
      await test.fn.call(this, this.page, this.browser);
      
      const duration = Date.now() - startTime;
      this.results.passed++;
      this.log(`✅ PASS (${duration}ms): ${test.name}`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.failed++;
      this.log(`❌ FAIL (${duration}ms): ${test.name}`);
      this.log(`   Error: ${error.message}`);
      
      // Take error screenshot
      try {
        const screenshotPath = `./test-error-${index}-${Date.now()}.png`;
        await this.page.screenshot({ path: screenshotPath });
        this.log(`   Screenshot: ${screenshotPath}`);
      } catch (screenshotError) {
        this.log(`   Screenshot failed: ${screenshotError.message}`);
      }
    }
  }

  async finalize() {
    this.results.endTime = Date.now();
    const duration = this.results.endTime - this.results.startTime;
    
    // Log summary matching existing format
    this.log('\n📊 Test Results Summary:');
    this.log(`   Total: ${this.results.total}`);
    this.log(`   Passed: ${this.results.passed}`);
    this.log(`   Failed: ${this.results.failed}`);
    this.log(`   Duration: ${duration}ms`);
    
    // Save JSON summary matching existing format
    const summary = {
      suite: this.testName,
      results: this.results,
      timestamp: new Date().toISOString(),
      duration: duration,
      success: this.results.failed === 0
    };
    
    await import('fs/promises').then(fs => 
      fs.writeFile(this.jsonFile, JSON.stringify(summary, null, 2))
    );
    
    this.log(`📄 JSON summary saved: ${this.jsonFile}`);
    this.log('[PUPPETEER-TEST-COMPLETE]');
    
    // Close log stream
    this.logStream.end();
  }

  // Helper methods for common UI testing patterns
  async expectElementToExist(selector, options = {}) {
    const { timeout = 5000, soft = false } = options;
    try {
      await this.page.waitForSelector(selector, { timeout });
      this.log(`✓ Element exists: ${selector}`);
      return true;
    } catch (error) {
      if (soft) {
        this.log(`⚠️  Element not found (soft check): ${selector}`);
        return false;
      }
      throw error;
    }
  }

  async expectElementToHaveText(selector, expectedText) {
    const element = await this.page.$(selector);
    if (!element) throw new Error(`Element not found: ${selector}`);
    
    const text = await element.evaluate(el => el.textContent.trim());
    if (!text.includes(expectedText)) {
      throw new Error(`Expected "${expectedText}" in "${text}"`);
    }
    this.log(`✓ Element has text: ${selector} contains "${expectedText}"`);
  }

  async clickAndWait(selector, waitTime = 1000) {
    await this.page.click(selector);
    await this.waitFor(waitTime);
    this.log(`✓ Clicked: ${selector}`);
  }

  async takeScreenshot(name) {
    const screenshotDir = './screenshots';
    
    // Create screenshots directory if it doesn't exist
    await import('fs/promises').then(fs => 
      fs.mkdir(screenshotDir, { recursive: true }).catch(() => {})
    );
    
    const timestamp = Date.now();
    const filename = `test-${name}-${timestamp}.png`;
    const screenshotPath = `${screenshotDir}/${filename}`;
    
    await this.page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    
    this.log(`📸 Screenshot: ${screenshotPath}`);
    return screenshotPath;
  }
}

export { PuppeteerTestFramework };
export default PuppeteerTestFramework;
