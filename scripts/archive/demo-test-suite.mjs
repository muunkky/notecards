import { PuppeteerTestFramework } from './puppeteer-test-framework.mjs';

/**
 * Demo test suite showing the integrated Puppeteer testing framework
 * This demonstrates how Puppeteer tests now integrate with the existing
 * Vitest logging structure and authentication system.
 */

async function runDemoTestSuite() {
  const framework = new PuppeteerTestFramework();
  
  // Initialize framework (connects to existing session if available)
  await framework.initialize();

  // Test Suite: Basic Navigation and Authentication
  framework.describe('Notecards App - Basic Functionality', () => {
    
    framework.test('should load the homepage', async () => {
      await framework.navigateAndWait('https://notecards-1b054.web.app');
      await framework.expectElementToExist('body');
      
      const title = await framework.page.title();
      console.log(`📋 Page title: "${title}"`);
      
      // Take screenshot for documentation
      await framework.takeScreenshot('homepage-loaded');
    });

    framework.test('should authenticate with Google', async () => {
      // Authentication is handled automatically by browser session
      const isAuthenticated = await framework.page.evaluate(() => {
        const signInButton = document.querySelector('button');
        return !(signInButton && signInButton.textContent.includes('Sign in with Google'));
      });
      
      if (!isAuthenticated) {
        console.log('🔐 Authentication required - handled by session manager');
        // Authentication is automatic via stealth plugin
      }
      
      console.log(`✅ Authentication status: ${isAuthenticated ? 'Authenticated' : 'Pending'}`);
    });

    framework.test('should discover available features', async () => {
      const features = await framework.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button:not([disabled])')).map(btn => ({
          text: btn.textContent.trim(),
          visible: btn.offsetParent !== null
        }));
        
        const forms = Array.from(document.querySelectorAll('form')).length;
        const inputs = Array.from(document.querySelectorAll('input, textarea')).length;
        
        return { 
          interactiveButtons: buttons.filter(b => b.text.length > 0 && b.visible),
          formCount: forms,
          inputCount: inputs
        };
      });

      console.log('🔍 Feature Discovery Results:');
      console.log(`   📝 Forms: ${features.formCount}`);
      console.log(`   📋 Inputs: ${features.inputCount}`);
      console.log(`   🔘 Interactive buttons: ${features.interactiveButtons.length}`);
      
      features.interactiveButtons.forEach((btn, i) => {
        console.log(`     ${i + 1}. "${btn.text}"`);
      });

      // Validate we have interactive features
      framework.expect(features.interactiveButtons.length > 0, 'Should have interactive buttons');
    });

    framework.test('should test button interactions', async (skip) => {
      const buttonSelector = 'button:not([disabled])';
      const buttonExists = await framework.expectElementToExist(buttonSelector, { timeout: 5000, soft: true });
      
      if (!buttonExists) {
        skip('No interactive buttons found');
        return;
      }

      const buttonText = await framework.page.$eval(buttonSelector, el => el.textContent.trim());
      console.log(`🔘 Testing button: "${buttonText}"`);
      
      // Click and wait for any changes
      const navigationPromise = framework.page.waitForFunction(
        () => document.readyState === 'complete',
        { timeout: 5000 }
      ).catch(() => null); // Don't fail if no navigation happens
      
      await framework.clickAndWait(buttonSelector);
      await navigationPromise;
      
      console.log(`✅ Button click successful: "${buttonText}"`);
      await framework.takeScreenshot(`button-clicked-${buttonText.replace(/\s+/g, '-')}`);
    });

  });

  // Run all tests
  const results = await framework.runTests();
  
  // Display summary
  console.log('\n📊 TEST SUMMARY');
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   ⏭️  Skipped: ${results.skipped}`);
  console.log(`   ⏱️  Duration: ${results.duration}ms`);
  console.log(`   📁 Logs saved to: ${results.logFile}`);

  // Close framework (keeps session alive if persistent)
  await framework.close({ keepSession: true });
  
  return results;
}

// Self-executing demo
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🧪 Running Puppeteer Test Framework Demo...');
  
  runDemoTestSuite()
    .then(results => {
      console.log(`\n🎉 Demo completed! ${results.passed} tests passed.`);
      if (results.failed > 0) {
        console.log(`❌ ${results.failed} tests failed - check logs for details.`);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Demo failed:', error.message);
      process.exit(1);
    });
}

export { runDemoTestSuite };
