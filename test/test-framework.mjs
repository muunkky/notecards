import browserService from '../services/browser-service.mjs';
import { createTestingConfig, logServiceConfig } from '../src/config/service-config.mjs';

/**
 * Universal Test Framework for Browser Automation
 * 
 * A professional framework that uses the universal browser service 
 * with proper environment configuration for consistent testing 
 * across different environments.
 */
export class TestFramework {
  constructor(options = {}) {
    this.tests = [];
    this.results = [];
    this.browser = null;
    this.page = null;
    this.browserService = null;
    this.verbose = options.verbose || false;
    this.startTime = null;
    this.endTime = null;
    
    // Create professional testing configuration
    this.config = createTestingConfig(options.environment);
    
    if (this.verbose) {
      logServiceConfig(this.config);
    }
  }

  log(message) {
    if (this.verbose) {
      console.log('[TestFramework]', message);
    }
  }

  async initialize() {
    this.log('🔄 Initializing test framework with universal browser service...');
    
    try {
      const connection = await browserService.initialize({ persistent: true });
      
      this.browser = connection.browser;
      this.page = connection.page;
      this.browserService = connection.service;
      
      this.log('✅ Test framework initialized successfully');
      
      return {
        browser: this.browser,
        page: this.page,
        service: this.browserService,
        isAuthenticated: connection.isAuthenticated
      };
    } catch (error) {
      console.error('❌ Failed to initialize test framework:', error);
      throw error;
    }
  }

  async cleanup() {
    this.log('🔄 Cleaning up test framework...');
    
    if (this.browserService) {
      await this.browserService.close();
    }
    
    this.log('✅ Test framework cleanup completed');
  }

  async authenticateIfNeeded() {
    this.log('🔐 Checking authentication requirement...');
    
    try {
      await this.browserService.navigateToApp();
      const authSuccess = await this.browserService.handleAuthentication();
      
      if (!authSuccess) {
        const error = 'CRITICAL: Authentication failed - cannot proceed with tests';
        console.error('❌', error);
        throw new Error(error);
      }
      
      console.log('✅ Authentication verified - tests can proceed');
      return true;
      
    } catch (error) {
      console.error('❌ Authentication error:', error.message);
      throw new Error(`Authentication required but failed: ${error.message}`);
    }
  }

  addTest(name, testFunction, options = {}) {
    this.tests.push({
      name,
      testFunction,
      timeout: options.timeout || 30000,
      skip: options.skip || false,
      expectedToFail: options.expectedToFail || false
    });
  }

  async runTests() {
    console.log(`🧪 Running ${this.tests.length} tests with universal browser service...`);
    this.startTime = Date.now();
    
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    let executed = 0;

    for (const test of this.tests) {
      if (test.skip) {
        console.log(`⏭️  SKIPPED: ${test.name}`);
        skipped++;
        continue;
      }

      console.log(`🧪 Running: ${test.name}`);
      const startTime = Date.now();
      
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Test timeout')), test.timeout)
        );
        
        await Promise.race([
          test.testFunction(this.page, this.browser, this.browserService),
          timeoutPromise
        ]);
        
        const duration = Date.now() - startTime;
        
        if (test.expectedToFail) {
          console.log(`❌ FAIL: ${test.name} (expected to fail but passed) - ${duration}ms`);
          failed++;
        } else {
          console.log(`✅ PASS: ${test.name} - ${duration}ms`);
          passed++;
        }
        executed++;
        
      } catch (error) {
        const duration = Date.now() - startTime;
        
        if (test.expectedToFail) {
          console.log(`✅ PASS: ${test.name} (expected to fail) - ${duration}ms`);
          passed++;
        } else {
          console.log(`❌ FAIL: ${test.name} - ${error.message} - ${duration}ms`);
          failed++;
        }
        executed++;
      }
    }

    this.endTime = Date.now();
    const totalDuration = this.endTime - this.startTime;
    
    // **CRITICAL FIX**: Fail if no tests were executed
    if (executed === 0 && this.tests.length > 0) {
      console.log('❌ CRITICAL ERROR: Tests were defined but none executed!');
      console.log('❌ This indicates a fundamental problem (likely authentication failure)');
      return {
        passed: 0,
        failed: this.tests.length, // Mark all as failed
        skipped: 0,
        executed: 0,
        total: this.tests.length,
        success: false,
        duration: totalDuration,
        error: 'No tests executed despite being defined'
      };
    }

    const success = failed === 0 && executed > 0;
    
    console.log('\n📊 Test Results:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`🏃 Executed: ${executed}/${this.tests.length}`);
    console.log(`⏱️  Duration: ${totalDuration}ms`);
    console.log(`🎯 Success: ${success ? 'YES' : 'NO'}`);

    return {
      passed,
      failed,
      skipped,
      executed,
      total: this.tests.length,
      success,
      duration: totalDuration
    };
  }
}

export default TestFramework;
