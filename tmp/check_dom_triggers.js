const { chromium } = require('playwright')

;(async () => {
	const base = 'http://prefabricadosduero.dev'
	const checkPath = '/scroll/'
	const browser = await chromium.launch({ headless: true })
	const context = await browser.newContext()
	const page = await context.newPage()
	try {
		await page.goto(base + checkPath, { waitUntil: 'load', timeout: 20000 })
	} catch (e) {
		console.error('nav error', e)
		process.exit(2)
	}

	const info = await page.evaluate(() => {
		const containers = Array.from(document.querySelectorAll('[data-scrolltrigger]'))
		return containers.map((c, i) => {
			try {
				const inst = c.scrollTriggerStack || null
				const triggersLen = inst && Array.isArray(inst._triggers) ? inst._triggers.length : inst && inst._triggers ? inst._triggers.length : null
				return { index: i, hasInstance: !!inst, triggersLen }
			} catch (e) {
				return { index: i, error: e.message }
			}
		})
	})

	console.log('containers_info:', JSON.stringify(info))
	await page.close()
	await browser.close()
})().catch(e => {
	console.error('fatal', e)
	process.exit(1)
})
