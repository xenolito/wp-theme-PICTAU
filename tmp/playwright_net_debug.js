const { chromium } = require('playwright')

;(async () => {
	const url = 'http://prefabricadosduero.dev/scroll/'
	const browser = await chromium.launch({ headless: false })
	const context = await browser.newContext()
	const page = await context.newPage()

	const failedResponses = []
	page.on('response', response => {
		const status = response.status()
		if (status >= 400) {
			failedResponses.push({ url: response.url(), status, statusText: response.statusText() })
		}
	})
	page.on('requestfailed', req => {
		failedResponses.push({ url: req.url(), failure: req.failure() })
	})

	console.log('navigating to', url)
	await page.goto(url, { waitUntil: 'load', timeout: 30000 }).catch(e => console.error('goto error', e))
	await page.waitForTimeout(500)

	const count = await page.evaluate(() => {
		try {
			return window.ScrollTrigger && typeof ScrollTrigger.getAll === 'function' ? ScrollTrigger.getAll().length : null
		} catch (e) {
			return null
		}
	})
	console.log('scrollTrigger_count:', count)

	console.log('failedResponses:', JSON.stringify(failedResponses, null, 2))

	await page.close()
	await browser.close()
})().catch(e => {
	console.error(e)
	process.exit(1)
})
