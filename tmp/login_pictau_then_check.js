const { chromium } = require('playwright')

;(async () => {
	const base = 'http://prefabricadosduero.dev'
	const loginPath = '/pictau/'
	const checkPath = '/scroll/'
	const browser = await chromium.launch({ headless: true })
	const context = await browser.newContext()
	const page = await context.newPage()

	await page.goto(base + loginPath, { waitUntil: 'load' })
	await page.waitForSelector('#user_login', { timeout: 5000 })
	await page.fill('#user_login', 'orey')
	await page.fill('#user_pass', 'Aisling3215*')
	await page.click('#wp-submit')
	await page.waitForTimeout(800)

	// After login attempt, go to scroll page
	await page.goto(base + checkPath, { waitUntil: 'load' })
	await page.waitForTimeout(500)

	const info = await page.evaluate(() => {
		const nodes = Array.from(document.querySelectorAll('[data-scrolltrigger]'))
		const first = nodes[0] || null
		const hasInstance = first ? !!first.scrollTriggerStack : false
		const stCount = window.ScrollTrigger && typeof ScrollTrigger.getAll === 'function' ? ScrollTrigger.getAll().length : null
		return {
			nodesCount: nodes.length,
			firstHasInstance: hasInstance,
			stCount,
			hasLenisConstructor: !!window.Lenis,
			hasLenisInstance: !!window.lenis,
			bodyOverflow: window.getComputedStyle(document.body).overflow,
		}
	})

	console.log(JSON.stringify(info, null, 2))
	await browser.close()
})()
