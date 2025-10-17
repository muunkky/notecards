// Simple test of the PuppeteerTestFramework constructor
console.log('🔍 Testing PuppeteerTestFramework constructor...');

try {
  console.log('📦 Importing...');
  const { PuppeteerTestFramework } = await import('./puppeteer-test-framework.mjs');
  
  console.log('🏗️  Creating instance...');
  const framework = new PuppeteerTestFramework();
  
  console.log('✅ Constructor succeeded!');
  console.log('📁 Log file:', framework.logFile);
  
} catch (error) {
  console.error('❌ Constructor failed:', error.message);
  console.error('Stack:', error.stack);
}
