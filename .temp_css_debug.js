const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('=== CSS RULE PRIORITY AND SPECIFICITY DEBUG ===\n');
    
    await page.goto('https://prefabricadosduero.dev/producto/bordillo-monocapa-bm-10/', { 
      waitUntil: 'networkidle' 
    });
    await page.waitForTimeout(2000);
    
    console.log('1. ANALYZING CSS CASCADE FOR .catalog-menu__children:\n');
    
    const cssAnalysis = await page.evaluate(() => {
      const el = document.querySelector('[data-expanded="false"] > .catalog-menu__children');
      if (!el) return { error: 'Element not found' };
      
      const styles = window.getComputedStyle(el);
      
      // Check parent styles
      const parent = el.parentElement;
      const parentStyles = window.getComputedStyle(parent);
      
      return {
        element: {
          tag: el.tagName,
          classes: el.className,
          id: el.id || 'none'
        },
        parent: {
          tag: parent.tagName,
          classes: parent.className,
          dataExpanded: parent.getAttribute('data-expanded')
        },
        computedDisplay: styles.display,
        computedFlexDirection: styles.flexDirection,
        computedFlex: styles.flex,
        parentDisplay: parentStyles.display,
        parentFlex: parentStyles.flex
      };
    });
    
    console.log(JSON.stringify(cssAnalysis, null, 2));
    
    console.log('\n2. CHECKING IF CHILDREN UL HAS EXPLICIT DISPLAY FLEX:\n');
    
    const explicitFlex = await page.evaluate(() => {
      const listItems = document.querySelectorAll('.catalog-menu__item');
      const results = [];
      
      // Check first few items
      for (let i = 0; i < Math.min(3, listItems.length); i++) {
        const li = listItems[i];
        const children = li.querySelector('.catalog-menu__children');
        
        if (children) {
          const s = window.getComputedStyle(children);
          results.push({
            itemIndex: i,
            itemText: li.textContent.substring(0, 30),
            childrenDisplay: s.display,
            childrenFlex: s.flex,
            childrenFlexDirection: s.flexDirection,
            parentExpanded: li.getAttribute('data-expanded')
          });
        }
      }
      
      return results;
    });
    
    console.log(JSON.stringify(explicitFlex, null, 2));
    
    console.log('\n3. CHECKING APPLIED RULES ON .catalog-menu__children:\n');
    
    const rulesApplied = await page.evaluate(() => {
      const el = document.querySelector('.catalog-menu__children');
      if (!el) return { error: 'No .catalog-menu__children found' };
      
      // Use getMatchedCSSRules (not available in all browsers)
      const rules = [];
      
      for (let i = 0; i < document.styleSheets.length; i++) {
        try {
          const sheet = document.styleSheets[i];
          const sheetRules = sheet.cssRules || sheet.rules;
          
          for (let j = 0; j < sheetRules.length; j++) {
            const rule = sheetRules[j];
            if (rule.selectorText) {
              try {
                if (el.matches(rule.selectorText)) {
                  rules.push({
                    selector: rule.selectorText,
                    display: rule.style.display || 'not set',
                    specificityEstimate: rule.selectorText.length
                  });
                }
              } catch (e) {
                // Selector might not be valid for matches()
              }
            }
          }
        } catch (e) {
          // CORS or other error
        }
      }
      
      return {
        matchingRules: rules,
        totalMatching: rules.length
      };
    });
    
    console.log('Matching CSS rules:');
    console.log(JSON.stringify(rulesApplied, null, 2));
    
    console.log('\n4. TESTING MANUAL STYLE OVERRIDE:\n');
    
    // Try to manually apply display: none and check if it works
    const manualOverride = await page.evaluate(() => {
      const el = document.querySelector('[data-expanded="false"] > .catalog-menu__children');
      if (!el) return { error: 'No element' };
      
      // Check current
      const before = window.getComputedStyle(el).display;
      
      // Apply manual override
      el.style.display = 'none';
      const after = window.getComputedStyle(el).display;
      
      // Reset
      el.style.display = '';
      const reset = window.getComputedStyle(el).display;
      
      return {
        before: before,
        after_manual_none: after,
        after_reset: reset
      };
    });
    
    console.log('Manual override test:');
    console.log(JSON.stringify(manualOverride, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
