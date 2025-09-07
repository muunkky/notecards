import puppeteer from 'puppeteer';

async function testChrome() {
  console.log('🧪 Testing Chrome launch...');
  
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  
  try {
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: chromePath,
      args: ['--start-maximized'],
      defaultViewport: null
    });
    
    const page = await browser.newPage();
    await page.goto('chrome://version/');
    
    console.log('✅ Chrome launched successfully!');
    console.log('🌐 Chrome version page opened');
    
    // Keep browser open for 10 seconds
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    await browser.close();
    console.log('✅ Test completed');
    
  } catch (error) {
    console.error('❌ Failed to launch Chrome:', error.message);
  }
}

testChrome();
