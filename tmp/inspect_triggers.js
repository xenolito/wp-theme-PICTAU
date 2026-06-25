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

	const info = await page.evaluate(() => {
		const nodes = Array.from(document.querySelectorAll('[data-scrolltrigger]'))
		const first = nodes[0] || null
		const triggersLen = first && first.scrollTriggerStack && Array.isArray(first.scrollTriggerStack._triggers) ? first.scrollTriggerStack._triggers.length : null

		// Try to find ScrollTrigger via known globals
		let stAllLen = null
		try {
			const ST = window.ScrollTrigger || (window.gsap && (window.gsap.ScrollTrigger || (window.gsap.core && window.gsap.core.globals && window.gsap.core.globals.ScrollTrigger)))
			if (ST && typeof ST.getAll === 'function') {
				const arr = ST.getAll()
				stAllLen = Array.isArray(arr) ? arr.length : null
			}
		} catch (e) {
			stAllLen = 'error'
		}

		// Also expose internal triggers info (ids of pinned elements)
		const internalTriggersInfo =
			first && first.scrollTriggerStack && Array.isArray(first.scrollTriggerStack._triggers)
				? first.scrollTriggerStack._triggers.map(t => ({ id: t.id || null, trigger: t.trigger && t.trigger.outerHTML ? t.trigger.outerHTML.slice(0, 200) : t.trigger ? String(t.trigger) : null }))
				: null

		return {
			nodesCount: nodes.length,
			triggersLen,
			stAllLen,
			internalTriggersInfo,
		}
	})

	console.log(JSON.stringify(info, null, 2))
	await browser.close()
})()
