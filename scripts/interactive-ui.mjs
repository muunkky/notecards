import browserSession from './browser-session.mjs';

/**
 * Interactive UI testing session with integrated authentication
 */
async function startInteractiveSession() {
  console.log('🎮 Starting INTERACTIVE UI testing session...');
  console.log('💡 This will authenticate automatically and keep the browser open!');

  try {
    // Start browser session with authentication
    await browserSession.startSession({ persistent: true });
    
    // Authenticate if needed (integrated stealth auth)
    const authSuccess = await browserSession.authenticateIfNeeded();
    
    if (!authSuccess) {
      console.log('❌ Authentication failed. Please try again.');
      return;
    }

    // Set up auto-save for session persistence
    await browserSession.setupAutoSave();

    // Run quick feature discovery
    await runQuickFeatureDiscovery();

    console.log('\n🎮 INTERACTIVE MODE ACTIVE');
    console.log('📋 Session Features:');
    console.log('  ✅ Authenticated and ready');
    console.log('  💾 Auto-saves session every 30 seconds');
    console.log('  🔄 Persistent across script runs');
    console.log('  🌐 Remote debugging on port 9222');
    console.log('  � Auto-screenshots on navigation');
    console.log('\n💡 Commands:');
    console.log('  - Browser stays open for manual testing');
    console.log('  - Run other scripts while this session is active');
    console.log('  - Press Ctrl+C to end session gracefully');
    console.log('  - Or simply close the browser window');

    // Keep the session alive
    await keepSessionAlive();

  } catch (error) {
    console.error('❌ Error during interactive session:', error.message);
    await browserSession.close();
  }
}

/**
 * Quick feature discovery
 */
async function runQuickFeatureDiscovery() {
  console.log('🔍 Running quick feature discovery...');
  
  const features = await browserSession.page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button')).map(btn => ({
      text: btn.textContent.trim(),
      className: btn.className,
      disabled: btn.disabled
    }));
    
    const links = Array.from(document.querySelectorAll('a')).map(link => ({
      text: link.textContent.trim(),
      href: link.href
    }));
    
    const inputs = Array.from(document.querySelectorAll('input, textarea')).map(input => ({
      type: input.type,
      placeholder: input.placeholder,
      name: input.name
    }));

    return { 
      buttons: buttons.filter(b => b.text.length > 0),
      links: links.filter(l => l.text.length > 0),
      inputs: inputs.filter(i => i.type !== 'hidden')
    };
  });

  console.log('📊 Quick Discovery Results:');
  console.log(`  🔘 Interactive buttons: ${features.buttons.length}`);
  console.log(`  🔗 Navigation links: ${features.links.length}`);
  console.log(`  📝 Input fields: ${features.inputs.length}`);

  if (features.buttons.length > 0) {
    console.log('🔘 Available buttons:');
    features.buttons.slice(0, 5).forEach((btn, i) => {
      console.log(`     ${i + 1}. "${btn.text}" ${btn.disabled ? '(disabled)' : ''}`);
    });
    if (features.buttons.length > 5) {
      console.log(`     ... and ${features.buttons.length - 5} more`);
    }
  }

  // Take initial screenshot
  await browserSession.page.screenshot({ path: './interactive-session-start.png', fullPage: true });
  console.log('� Session screenshot saved: interactive-session-start.png');
}

/**
 * Keep session alive and monitor for changes
 */
async function keepSessionAlive() {
  let lastUrl = await browserSession.page.url();
  let checkCount = 0;
  
  const monitor = setInterval(async () => {
    try {
      checkCount++;
      const currentUrl = await browserSession.page.url();
      
      // Check if page has changed
      if (currentUrl !== lastUrl) {
        console.log(`🔄 Navigation detected: ${currentUrl}`);
        lastUrl = currentUrl;
        
        // Take screenshot of new page
        const timestamp = new Date().toISOString().replace(/[:T]/g, '-').replace(/\..+/, '');
        await browserSession.page.screenshot({ 
          path: `./nav-${timestamp}.png`,
          fullPage: true
        });
        console.log(`📸 Navigation screenshot saved`);
      }
      
      // Log status every 20 checks (roughly every 100 seconds)
      if (checkCount % 20 === 0) {
        const title = await browserSession.page.title();
        console.log(`💡 Session active - "${title}" | Checks: ${checkCount}`);
      }
      
      // Check if browser is still connected
      if (!browserSession.browser || !browserSession.browser.isConnected()) {
        console.log('🔚 Browser closed by user. Ending session.');
        clearInterval(monitor);
        process.exit(0);
      }
      
    } catch (error) {
      if (error.message.includes('Target closed') || error.message.includes('Session closed')) {
        console.log('🔚 Browser session ended.');
        clearInterval(monitor);
        process.exit(0);
      } else {
        console.log('⚠️  Monitor error:', error.message);
      }
    }
  }, 5000); // Check every 5 seconds

  // Handle process termination gracefully
  process.on('SIGINT', async () => {
    console.log('\n🛑 Gracefully shutting down...');
    clearInterval(monitor);
    await browserSession.close();
    process.exit(0);
  });

  // Keep the process alive
  return new Promise(() => {}); // Never resolves
}

startInteractiveSession().catch(console.error);
