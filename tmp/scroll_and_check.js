const { chromium } = require('playwright')

;(async () => {
	const url = 'http://prefabricadosduero.dev/scroll/'
	const browser = await chromium.launch({ headless: true })
	const context = await browser.newContext()
	const page = await context.newPage()

	await page.goto(url, { waitUntil: 'load' })
	await page.waitForTimeout(300)

	const steps = 10
	let found = null
	for (let i = 0; i <= steps; i++) {
		const y = Math.round((i / steps) * (await page.evaluate(() => document.body.scrollHeight - window.innerHeight)))
		await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), y)
		await page.waitForTimeout(200)
		const info = await page.evaluate(() => {
			const nodes = Array.from(document.querySelectorAll('[data-scrolltrigger]'))
			return nodes.map(n => n.outerHTML.slice(0, 400))
		})
		if (info && info.length) {
			found = info
			break
		}
	}

	console.log('found:', found ? JSON.stringify(found) : 'none')
	await browser.close()
})()
