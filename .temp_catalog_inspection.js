const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('=== CATALOG MENU INSPECTION ===\n');
    
    console.log('1. Navigating to product page...');
    await page.goto('https://prefabricadosduero.dev/producto/bordillo-monocapa-bm-10/', { 
      waitUntil: 'networkidle' 
    });
    
    console.log('2. Waiting 2 seconds for full load...');
    await page.waitForTimeout(2000);
    
    console.log('3. Taking screenshot of sidebar...');
    const sidebar = page.locator('.single-producto__sidebar');
    if (await sidebar.count() > 0) {
      await sidebar.screenshot({ path: '/tmp/01_sidebar_screenshot.png' });
      console.log('✓ Sidebar screenshot: /tmp/01_sidebar_screenshot.png');
    }
    
    console.log('\n4. Inspecting .catalog-category-menu HTML structure...');
    const catalogMenu = page.locator('.catalog-category-menu');
    if (await catalogMenu.count() > 0) {
      const html = await catalogMenu.innerHTML();
      console.log('HTML (first 1500 chars):');
      console.log(html.substring(0, 1500));
      console.log('\n...\n');
    }
    
    console.log('\n5. Computed Styles Inspection:\n');
    
    // .catalog-menu__list
    const listInfo = await page.evaluate(() => {
      const el = document.querySelector('.catalog-menu__list');
      if (!el) return { error: 'Element not found' };
      const s = window.getComputedStyle(el);
      return {
        found: true,
        margin: s.margin,
        marginTop: s.marginTop,
        marginBottom: s.marginBottom,
        padding: s.padding,
        paddingLeft: s.paddingLeft,
        listStyle: s.listStyle,
        listStyleType: s.listStyleType,
        display: s.display
      };
    });
    console.log('.catalog-menu__list:');
    console.log(JSON.stringify(listInfo, null, 2));
    
    // .catalog-menu__item
    const itemInfo = await page.evaluate(() => {
      const el = document.querySelector('.catalog-menu__item');
      if (!el) return { error: 'Element not found' };
      const s = window.getComputedStyle(el);
      return {
        found: true,
        display: s.display,
        margin: s.margin,
        marginBottom: s.marginBottom,
        padding: s.padding,
        paddingLeft: s.paddingLeft
      };
    });
    console.log('\n.catalog-menu__item:');
    console.log(JSON.stringify(itemInfo, null, 2));
    
    // .catalog-menu__children
    const childrenInfo = await page.evaluate(() => {
      const el = document.querySelector('.catalog-menu__children');
      if (!el) return { error: 'Element not found' };
      const s = window.getComputedStyle(el);
      return {
        found: true,
        display: s.display,
        visibility: s.visibility,
        margin: s.margin,
        marginLeft: s.marginLeft,
        padding: s.padding,
        paddingLeft: s.paddingLeft,
        maxHeight: s.maxHeight,
        height: s.height,
        opacity: s.opacity,
        overflow: s.overflow
      };
    });
    console.log('\n.catalog-menu__children:');
    console.log(JSON.stringify(childrenInfo, null, 2));
    
    console.log('\n6. Inspecting data-expanded="false" elements:\n');
    
    const expandedFalseInfo = await page.evaluate(() => {
      const el = document.querySelector('.catalog-menu__item[data-expanded="false"]');
      if (!el) return { error: 'No element found with data-expanded="false"' };
      const s = window.getComputedStyle(el);
      const childEl = el.querySelector('.catalog-menu__children');
      const childS = childEl ? window.getComputedStyle(childEl) : null;
      return {
        element: {
          display: s.display,
          className: el.className,
          dataExpanded: el.getAttribute('data-expanded')
        },
        children: childS ? {
          display: childS.display,
          visibility: childS.visibility,
          maxHeight: childS.maxHeight,
          opacity: childS.opacity,
          height: childS.height
        } : 'Not found'
      };
    });
    console.log('Element with data-expanded="false":');
    console.log(JSON.stringify(expandedFalseInfo, null, 2));
    
    console.log('\n7. Inspecting data-expanded="true" elements:\n');
    
    const expandedTrueInfo = await page.evaluate(() => {
      const el = document.querySelector('.catalog-menu__item[data-expanded="true"]');
      if (!el) return { error: 'No element found with data-expanded="true"' };
      const s = window.getComputedStyle(el);
      const childEl = el.querySelector('.catalog-menu__children');
      const childS = childEl ? window.getComputedStyle(childEl) : null;
      return {
        element: {
          display: s.display,
          className: el.className,
          dataExpanded: el.getAttribute('data-expanded')
        },
        children: childS ? {
          display: childS.display,
          visibility: childS.visibility,
          maxHeight: childS.maxHeight,
          opacity: childS.opacity,
          height: childS.height
        } : 'Not found'
      };
    });
    console.log('Element with data-expanded="true":');
    console.log(JSON.stringify(expandedTrueInfo, null, 2));
    
    console.log('\n8. Inspecting .catalog-menu__toggle:\n');
    
    const toggleInfo = await page.evaluate(() => {
      const el = document.querySelector('.catalog-menu__toggle');
      if (!el) return { error: 'Element not found' };
      const s = window.getComputedStyle(el);
      return {
        found: true,
        display: s.display,
        width: s.width,
        height: s.height,
        cursor: s.cursor,
        appearance: s.appearance,
        background: s.background,
        backgroundColor: s.backgroundColor,
        border: s.border,
        padding: s.padding
      };
    });
    console.log('.catalog-menu__toggle:');
    console.log(JSON.stringify(toggleInfo, null, 2));
    
    console.log('\n9. Taking zoomed screenshot of catalog menu...');
    const menu = page.locator('.catalog-category-menu');
    if (await menu.count() > 0) {
      await menu.screenshot({ path: '/tmp/02_menu_zoomed_screenshot.png' });
      console.log('✓ Menu zoomed: /tmp/02_menu_zoomed_screenshot.png');
    }
    
    console.log('\n10. Taking full page screenshot...');
    await page.screenshot({ path: '/tmp/03_full_page_screenshot.png' });
    console.log('✓ Full page: /tmp/03_full_page_screenshot.png');
    
    console.log('\n11. Analyzing list structure and potential issues...');
    
    const structureAnalysis = await page.evaluate(() => {
      const items = document.querySelectorAll('.catalog-menu__item');
      const analysis = {
        totalItems: items.length,
        expandedTrue: 0,
        expandedFalse: 0,
        items: []
      };
      
      items.forEach((item, idx) => {
        const expanded = item.getAttribute('data-expanded');
        const children = item.querySelector('.catalog-menu__children');
        const s = window.getComputedStyle(item);
        
        if (expanded === 'true') analysis.expandedTrue++;
        if (expanded === 'false') analysis.expandedFalse++;
        
        if (idx < 8) {
          analysis.items.push({
            index: idx,
            text: item.textContent.substring(0, 50),
            expanded,
            hasChildren: !!children,
            display: s.display
          });
        }
      });
      
      return analysis;
    });
    
    console.log('\nStructure Analysis:');
    console.log(JSON.stringify(structureAnalysis, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
