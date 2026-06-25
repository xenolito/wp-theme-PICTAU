const { chromium } = require('playwright');

(async () => {
  const url = 'http://prefabricadosduero.dev/scroll/';
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(300);

  const info = await page.evaluate(() => {
    return {
      hasLenisConstructor: !!window.Lenis,
      hasLenisInstance: !!window.lenis,
      lenisType: window.lenis ? typeof window.lenis : null,
      bodyOverflow: window.getComputedStyle(document.body).overflow,
      htmlTransform: window.getComputedStyle(document.documentElement).transform || null,
      scrollTop: window.scrollY || 0
    }
  })

  console.log(JSON.stringify(info))
  await browser.close();
})();
