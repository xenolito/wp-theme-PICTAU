const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('=== DETAILED CATALOG MENU INSPECTION ===\n');
    
    await page.goto('https://prefabricadosduero.dev/producto/bordillo-monocapa-bm-10/', { 
      waitUntil: 'networkidle' 
    });
    await page.waitForTimeout(2000);
    
    // Check actual HTML structure - Get full inner HTML of catalog-category-menu
    console.log('1. FULL HTML STRUCTURE OF .catalog-category-menu:\n');
    const fullHTML = await page.locator('.catalog-category-menu').innerHTML();
    
    // Show just the first expanded=false item with children
    const collapsedItemHTML = fullHTML.match(/<li[^>]*data-expanded="false"[^>]*>[\s\S]*?<\/li>/m);
    if (collapsedItemHTML) {
      console.log('First item with data-expanded="false" and children:');
      console.log(collapsedItemHTML[0].substring(0, 800));
      console.log('\n');
    }
    
    console.log('\n2. CRITICAL ISSUE CHECK - data-expanded="false" > .catalog-menu__children visibility:\n');
    
    // Check if the CSS rule [data-expanded="false"] > .catalog-menu__children is being applied
    const hiddenChildren = await page.evaluate(() => {
      const el = document.querySelector('[data-expanded="false"] > .catalog-menu__children');
      if (!el) return { error: 'No hidden children found' };
      
      const s = window.getComputedStyle(el);
      return {
        display: s.display,
        visibility: s.visibility,
        height: s.height,
        maxHeight: s.maxHeight,
        overflow: s.overflow,
        cssClassApplied: 'hidden' // tailwind hidden class should set display: none
      };
    });
    
    console.log('Hidden children (data-expanded="false") computed style:');
    console.log(JSON.stringify(hiddenChildren, null, 2));
    
    console.log('\n3. ISSUE IDENTIFIED:\n');
    console.log('Expected: display should be "none"');
    console.log('Actual: display is "flex"');
    console.log('\nThis means the CSS rule is NOT working correctly!');
    
    console.log('\n4. CHECKING CSS RULES IN STYLESHEETS:\n');
    
    // Get all stylesheets and check for the hidden rule
    const cssRules = await page.evaluate(() => {
      const rules = [];
      
      for (let i = 0; i < document.styleSheets.length; i++) {
        try {
          const sheet = document.styleSheets[i];
          const sheetRules = sheet.cssRules || sheet.rules;
          
          for (let j = 0; j < sheetRules.length; j++) {
            const rule = sheetRules[j];
            if (rule.selectorText && rule.selectorText.includes('data-expanded')) {
              rules.push({
                selector: rule.selectorText,
                cssText: rule.cssText.substring(0, 300)
              });
            }
          }
        } catch (e) {
          // CORS or other issues - skip
        }
      }
      
      return rules;
    });
    
    console.log('Found CSS rules with data-expanded selector:');
    console.log(JSON.stringify(cssRules, null, 2));
    
    console.log('\n5. CHECKING ACTUAL COMPUTED STYLES FOR EXPANDED ITEMS:\n');
    
    // Test clicking a toggle to see what happens
    const beforeToggleTest = await page.evaluate(() => {
      const item = document.querySelector('[data-expanded="false"] > .catalog-menu__children');
      if (!item) return { error: 'No item found' };
      const s = window.getComputedStyle(item);
      return {
        before_display: s.display,
        parent_data_expanded: item.parentElement.getAttribute('data-expanded')
      };
    });
    
    console.log('Before interaction:');
    console.log(JSON.stringify(beforeToggleTest, null, 2));
    
    // Try clicking the toggle button for the first collapsed item
    console.log('\n6. CLICKING TOGGLE BUTTON:\n');
    const toggleButton = page.locator('[data-expanded="false"] .catalog-menu__toggle').first();
    if (await toggleButton.count() > 0) {
      await toggleButton.click();
      await page.waitForTimeout(500);
      
      const afterToggleTest = await page.evaluate(() => {
        const item = document.querySelector('[data-expanded="true"] > .catalog-menu__children');
        if (!item) return { error: 'No item found' };
        const s = window.getComputedStyle(item);
        return {
          after_display: s.display,
          parent_data_expanded: item.parentElement.getAttribute('data-expanded')
        };
      });
      
      console.log('After clicking toggle:');
      console.log(JSON.stringify(afterToggleTest, null, 2));
    }
    
    console.log('\n7. CHECKING TAILWIND COMPILED CLASS:\n');
    
    // Check if the hidden class is being applied correctly
    const tailwindHiddenCheck = await page.evaluate(() => {
      const collapsed = document.querySelector('[data-expanded="false"] > .catalog-menu__children');
      if (!collapsed) return { error: 'No element' };
      
      return {
        classes: collapsed.className,
        hasHiddenClass: collapsed.className.includes('hidden'),
        computedDisplay: window.getComputedStyle(collapsed).display
      };
    });
    
    console.log('Tailwind hidden class check:');
    console.log(JSON.stringify(tailwindHiddenCheck, null, 2));
    
    console.log('\n8. FULL PAGE STYLES ELEMENT CHECK:\n');
    
    const styleTagContent = await page.evaluate(() => {
      const styles = document.querySelectorAll('style');
      const results = [];
      
      styles.forEach((style, idx) => {
        const content = style.textContent;
        if (content.includes('data-expanded')) {
          results.push({
            styleIndex: idx,
            hasDataExpanded: true,
            contentSnippet: content.substring(0, 500)
          });
        }
      });
      
      return results;
    });
    
    console.log('Style tags with data-expanded:');
    console.log(JSON.stringify(styleTagContent, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
