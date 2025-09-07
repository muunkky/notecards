// Simple test to verify Puppeteer setup
console.log('🧪 Testing Puppeteer setup...');

try {
  console.log('📦 Importing puppeteer-extra...');
  const puppeteer = await import('puppeteer-extra');
  console.log('✅ puppeteer-extra imported successfully');

  console.log('📦 Importing stealth plugin...');
  const StealthPlugin = await import('puppeteer-extra-plugin-stealth');
  console.log('✅ stealth plugin imported successfully');

  console.log('🔧 Testing browser launch...');
  const browser = await puppeteer.default.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  console.log('✅ Browser launched successfully');
  
  const page = await browser.newPage();
  console.log('✅ Page created successfully');
  
  await page.goto('https://www.google.com');
  const title = await page.title();
  console.log(`✅ Navigation successful. Title: "${title}"`);
  
  await browser.close();
  console.log('✅ Browser closed successfully');
  
  console.log('🎉 Puppeteer setup is working correctly!');
  
} catch (error) {
  console.error('❌ Puppeteer setup failed:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
