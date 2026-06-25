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

	await page.goto(base + checkPath, { waitUntil: 'load' })
	await page.waitForTimeout(500)

	const lastSelector = await page.evaluate(() => {
		const nodes = Array.from(document.querySelectorAll('[data-scrolltrigger]'))
		if (!nodes.length) return null
		const last = nodes[0].querySelectorAll('.st-item')
		return last && last.length ? '.st-item' + (last.length ? ':last-of-type' : '') : null
	})

	console.log('lastSelector', lastSelector)

	const total = await page.evaluate(() => document.body.scrollHeight - window.innerHeight)
	for (let y = 0; y <= total; y += Math.max(200, Math.round(total / 10))) {
		await page.evaluate(y => window.scrollTo({ top: y }), y)
		await page.waitForTimeout(200)
		const info = await page.evaluate(() => {
			const container = document.querySelector('[data-scrolltrigger]')
			if (!container) return { exists: false }
			const last = Array.from(container.querySelectorAll('.st-item')).slice(-1)[0]
			return {
				scrollY: window.scrollY,
				lastHasClass: last ? last.classList.contains('anim_triggered') : null,
				dispTop: container.querySelector('.st-trigger') ? container.querySelector('.st-trigger').getBoundingClientRect().top : null,
			}
		})
		console.log('step', y, info)
	}

	await browser.close()
})()
