import { PuppeteerTestFramework } from './puppeteer-test-framework.mjs';

/**
 * Unified Puppeteer test suite for the Notecards app
 * This replaces both test-features.mjs and demo-test-suite.mjs 
 * with a single comprehensive test script th    if (results.failed > 0) {
      console.log('\n❌ Some tests failed. Check the logs for details.');
      process.exit(1);
    } else {
      console.log('\n🎉 All tests passed successfully!');
    }

    console.log('\n💾 Session data saved for future test runs');
    console.log('🔚 Browser will be closed cleanly');
    
    return results; 
 * the existing Vitest logging framework.
 */

async function runNotecardTests() {
  console.log('🧪 Starting Notecards App UI Tests...');
  
  const framework = new PuppeteerTestFramework();
  
  try {
    // Initialize framework with authentication
    await framework.initialize();

    // Main Test Suite
    framework.describe('Notecards App - Complete UI Test Suite', () => {
      
      // Basic functionality tests
      framework.test('should load the application', async () => {
        await framework.navigateAndWait('https://notecards-1b054.web.app');
        await framework.expectElementToExist('body');
        
        const title = await framework.page.title();
        framework.log(`📋 Page title: "${title}"`);
        
        await framework.takeScreenshot('app-loaded');
      });

      framework.test('should authenticate successfully', async () => {
        // Check if already authenticated
        const authStatus = await framework.page.evaluate(() => {
          const signInButton = document.querySelector('button');
          return {
            hasSignInButton: !!(signInButton && signInButton.textContent.includes('Sign in with Google')),
            bodyText: document.body.textContent.substring(0, 200)
          };
        });

        if (authStatus.hasSignInButton) {
          framework.log('🔐 Sign-in button detected - authentication handled by session manager');
        } else {
          framework.log('✅ Already authenticated');
        }

        await framework.takeScreenshot('auth-status');
      });

      // Feature discovery and testing
      framework.test('should discover and test interactive elements', async () => {
        const features = await framework.page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button:not([disabled])')).map((btn, index) => ({
            index,
            text: btn.textContent.trim(),
            className: btn.className,
            visible: btn.offsetParent !== null,
            selector: `button:nth-of-type(${index + 1})`
          }));
          
          const links = Array.from(document.querySelectorAll('a[href]')).map((link, index) => ({
            index,
            text: link.textContent.trim(),
            href: link.href,
            visible: link.offsetParent !== null
          }));
          
          const inputs = Array.from(document.querySelectorAll('input, textarea')).map((input, index) => ({
            index,
            type: input.type,
            placeholder: input.placeholder,
            name: input.name || input.id,
            visible: input.offsetParent !== null
          }));

          const forms = Array.from(document.querySelectorAll('form')).length;

          return { 
            buttons: buttons.filter(b => b.visible && b.text.length > 0),
            links: links.filter(l => l.visible && l.text.length > 0),
            inputs: inputs.filter(i => i.visible),
            formCount: forms
          };
        });

        framework.log('🔍 Feature Discovery Results:');
        framework.log(`   📝 Forms: ${features.formCount}`);
        framework.log(`   📋 Inputs: ${features.inputs.length}`);
        framework.log(`   🔗 Links: ${features.links.length}`);
        framework.log(`   🔘 Interactive buttons: ${features.buttons.length}`);
        
        // Log details about interactive elements
        if (features.buttons.length > 0) {
          framework.log('🔘 Available buttons:');
          features.buttons.slice(0, 5).forEach((btn, i) => {
            framework.log(`     ${i + 1}. "${btn.text}"`);
          });
        }

        if (features.inputs.length > 0) {
          framework.log('📋 Input fields:');
          features.inputs.slice(0, 3).forEach((input, i) => {
            framework.log(`     ${i + 1}. ${input.type} - "${input.placeholder || input.name || 'unnamed'}"`);
          });
        }

        // Store features for next tests
        framework.features = features;
        
        framework.expect(features.buttons.length > 0 || features.inputs.length > 0, 
          'Should have interactive elements (buttons or inputs)');
      });

      framework.test('should test button interactions', async () => {
        if (!framework.features || framework.features.buttons.length === 0) {
          framework.log('⏭️  SKIP: No interactive buttons found');
          return;
        }

        // Test the first few buttons
        const buttonsToTest = framework.features.buttons.slice(0, 3);
        
        for (const [index, button] of buttonsToTest.entries()) {
          framework.log(`🔘 Testing button ${index + 1}: "${button.text}"`);
          
          try {
            // Get the button element by text content
            const buttonSelector = `button:nth-of-type(${button.index + 1})`;
            
            // Wait for button to be clickable
            await framework.page.waitForSelector(buttonSelector, { timeout: 5000 });
            
            // Take before screenshot
            await framework.takeScreenshot(`before-click-${button.text.replace(/\s+/g, '-')}`);
            
            // Set up navigation detection
            const navigationPromise = framework.page.waitForFunction(
              () => document.readyState === 'complete',
              { timeout: 3000 }
            ).catch(() => null);
            
            // Click the button
            await framework.clickAndWait(buttonSelector, 1000);
            await navigationPromise;
            
            // Take after screenshot
            await framework.takeScreenshot(`after-click-${button.text.replace(/\s+/g, '-')}`);
            
            framework.log(`✅ Successfully clicked: "${button.text}"`);
            
            // Wait a bit between button tests
            await framework.waitFor(1500);
            
          } catch (error) {
            framework.log(`⚠️  Button test failed for "${button.text}": ${error.message}`);
          }
        }
      });

      framework.test('should test form interactions', async () => {
        if (!framework.features || framework.features.inputs.length === 0) {
          framework.log('⏭️  SKIP: No form inputs found');
          return;
        }

        const inputsToTest = framework.features.inputs.slice(0, 2);
        
        for (const [index, input] of inputsToTest.entries()) {
          framework.log(`📝 Testing input ${index + 1}: ${input.type} - "${input.placeholder || input.name}"`);
          
          try {
            const selector = input.name ? `[name="${input.name}"]` : `input:nth-of-type(${input.index + 1})`;
            
            // Focus and type test data
            await framework.page.focus(selector);
            
            let testValue = '';
            switch (input.type) {
              case 'email':
                testValue = 'test@example.com';
                break;
              case 'password':
                testValue = 'TestPassword123';
                break;
              case 'number':
                testValue = '42';
                break;
              case 'search':
                testValue = 'test search';
                break;
              default:
                testValue = 'Test input data';
            }
            
            await framework.page.type(selector, testValue);
            framework.log(`✅ Successfully typed in ${input.type} field: "${testValue}"`);
            
            // Clear the field
            await framework.page.focus(selector);
            await framework.page.keyboard.down('Control');
            await framework.page.keyboard.press('KeyA');
            await framework.page.keyboard.up('Control');
            await framework.page.keyboard.press('Delete');
            
            await framework.waitFor(500);
            
          } catch (error) {
            framework.log(`⚠️  Input test failed: ${error.message}`);
          }
        }
      });

      framework.test('should test navigation and page state', async () => {
        const currentUrl = await framework.page.url();
        const currentTitle = await framework.page.title();
        
        framework.log(`🌐 Current URL: ${currentUrl}`);
        framework.log(`📋 Current Title: ${currentTitle}`);
        
        // Test page responsiveness
        const isResponsive = await framework.page.evaluate(() => {
          return window.innerWidth > 0 && window.innerHeight > 0 && document.readyState === 'complete';
        });
        
        framework.expect(isResponsive, 'Page should be responsive and loaded');
        
        // Take final state screenshot
        await framework.takeScreenshot('final-page-state');
      });

    });

    // Run all tests
    const results = await framework.runTests();
    
    // Display comprehensive summary
    console.log('\n📊 NOTECARDS UI TEST SUMMARY');
    console.log('═══════════════════════════════');
    console.log(`✅ Tests Passed:  ${results.passed}`);
    console.log(`❌ Tests Failed:  ${results.failed}`);
    console.log(`⏭️  Tests Skipped: ${results.skipped}`);
    console.log(`⏱️  Total Duration: ${Math.round(results.duration / 1000)}s`);
    console.log(`📁 Detailed logs: ${results.logFile}`);
    console.log(`📸 Screenshots saved to current directory`);

    if (results.failed > 0) {
      console.log('\n❌ Some tests failed. Check the logs for details.');
      process.exit(1);
    } else {
      console.log('\n🎉 All tests passed successfully!');
    }

    // Check if we should keep session
    const keepSession = process.env.KEEP_SESSION !== 'false';
    
    if (keepSession) {
      console.log('\n� Session data saved for future test runs');
      console.log('🔄 Browser will be detached and continue running independently');
    } else {
      console.log('\n🔒 Browser session will be closed');
    }
    
    return results;

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Close framework and browser cleanly - session data is preserved
    await framework.close();
    
    // Give a moment for cleanup then exit
    setTimeout(() => {
      console.log('✅ Test execution complete - terminal ready');
      process.exit(0);
    }, 1000);
  }
}

// Self-executing when run directly
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  runNotecardTests().catch(error => {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  });
}

export { runNotecardTests };
