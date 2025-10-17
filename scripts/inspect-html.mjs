import { PuppeteerTestFramework } from './puppeteer-test-framework.mjs';

async function inspectHTML() {
  const framework = new PuppeteerTestFramework();
  
  try {
    await framework.initialize();
    const { page } = await framework.getBrowserConnection();
    
    // Go to production app
    await page.goto('https://notecards-1b054.web.app');
    await page.waitForTimeout(3000);
    
    console.log('🔍 Inspecting page HTML structure...');
    
    // Get page title and URL
    const pageInfo = await page.evaluate(() => ({
      title: document.title,
      url: window.location.href,
      bodyClasses: document.body.className
    }));
    
    console.log('📄 Page Info:', pageInfo);
    
    // Look for deck elements
    const deckElements = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const relevantElements = [];
      
      for (let elem of allElements) {
        const text = elem.textContent?.trim() || '';
        const classes = elem.className || '';
        
        // Look for AMSAD deck specifically
        if (text.includes('AMSAD') || 
            classes.includes('deck') || 
            classes.includes('card') ||
            elem.tagName.toLowerCase().includes('card') ||
            elem.tagName.toLowerCase().includes('deck')) {
          relevantElements.push({
            tagName: elem.tagName,
            className: classes,
            id: elem.id,
            textContent: text.substring(0, 100),
            innerHTML: elem.innerHTML.substring(0, 200)
          });
        }
      }
      
      return relevantElements;
    });
    
    console.log('🔍 Found deck/card elements:');
    deckElements.forEach((elem, i) => {
      console.log(`  ${i + 1}. ${elem.tagName}.${elem.className} - "${elem.textContent}"`);
    });
    
    // Try clicking AMSAD deck if found
    const amsadClicked = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      for (let elem of elements) {
        if (elem.textContent?.includes('AMSAD') && elem.click) {
          elem.click();
          return true;
        }
      }
      return false;
    });
    
    if (amsadClicked) {
      console.log('✅ Clicked AMSAD deck, waiting for navigation...');
      await page.waitForTimeout(3000);
      
      // Now check for cards in the deck view
      const cardElements = await page.evaluate(() => {
        const allElements = document.querySelectorAll('*');
        const cardElements = [];
        
        for (let elem of allElements) {
          const classes = elem.className || '';
          const text = elem.textContent?.trim() || '';
          
          // Check for various card patterns
          if (classes.includes('card') || 
              elem.dataset.testid?.includes('card') ||
              (text.length > 10 && text.length < 200 && 
               elem.children.length > 0 && 
               !elem.tagName.includes('SCRIPT') &&
               !elem.tagName.includes('STYLE'))) {
            cardElements.push({
              tagName: elem.tagName,
              className: classes,
              id: elem.id,
              textContent: text.substring(0, 150),
              dataset: elem.dataset,
              childCount: elem.children.length
            });
          }
        }
        
        return {
          url: window.location.href,
          allPossibleCards: cardElements,
          totalElements: allElements.length
        };
      });
      
      console.log('📊 After clicking AMSAD:');
      console.log(`   Current URL: ${cardElements.url}`);
      console.log(`   Total elements on page: ${cardElements.totalElements}`);
      console.log(`   Possible card elements: ${cardElements.allPossibleCards.length}`);
      
      if (cardElements.allPossibleCards.length > 0) {
        console.log('🃏 Possible card elements found:');
        cardElements.allPossibleCards.forEach((card, i) => {
          console.log(`   ${i + 1}. ${card.tagName}.${card.className} - "${card.textContent}"`);
        });
      }
    } else {
      console.log('❌ Could not find or click AMSAD deck');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await framework.close();
  }
}

inspectHTML().catch(console.error);
