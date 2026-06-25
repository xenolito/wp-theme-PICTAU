const { chromium } = require('playwright')

;(async () => {
	const url = 'http://prefabricadosduero.dev/scroll/'
	const browser = await chromium.launch({ headless: false })
	const context = await browser.newContext()
	const page = await context.newPage()
	const consoleMessages = []
	page.on('console', msg => consoleMessages.push({ type: msg.type(), text: msg.text() }))

	console.log('navigating to', url)
	await page.goto(url, { waitUntil: 'load' })
	await page.waitForTimeout(500)

	const count1 = await page.evaluate(() => {
		try {
			return window.ScrollTrigger && typeof ScrollTrigger.getAll === 'function' ? ScrollTrigger.getAll().length : -1
		} catch (e) {
			return -2
		}
	})
	console.log('scrollTrigger_count_before_reload:', count1)

	await page.reload({ waitUntil: 'load' })
	await page.waitForTimeout(500)

	const count2 = await page.evaluate(() => {
		try {
			return window.ScrollTrigger && typeof ScrollTrigger.getAll === 'function' ? ScrollTrigger.getAll().length : -1
		} catch (e) {
			return -2
		}
	})
	console.log('scrollTrigger_count_after_reload:', count2)

	console.log('last_console_messages:', JSON.stringify(consoleMessages.slice(-50)))

	await page.close()
	await browser.close()
})().catch(e => {
	console.error(e)
	process.exit(1)
})
