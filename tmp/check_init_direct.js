const { chromium } = require('playwright')

;(async () => {
	const url = 'http://prefabricadosduero.dev/scroll/'
	const browser = await chromium.launch({ headless: true })
	const context = await browser.newContext()
	const page = await context.newPage()

	await page.goto(url, { waitUntil: 'load' })
	await page.waitForTimeout(300)

	const info = await page.evaluate(() => {
		const nodes = Array.from(document.querySelectorAll('[data-scrolltrigger]'))
		const first = nodes[0] || null
		const hasInstance = first ? !!first.scrollTriggerStack : false
		const stCount = window.ScrollTrigger && typeof ScrollTrigger.getAll === 'function' ? ScrollTrigger.getAll().length : null
		return {
			nodesCount: nodes.length,
			firstHasInstance: hasInstance,
			stCount,
			bodyOverflow: window.getComputedStyle(document.body).overflow,
		}
	})

	console.log(JSON.stringify(info))
	await browser.close()
})()
