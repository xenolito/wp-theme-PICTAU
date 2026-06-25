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

	const before = await page.evaluate(() => {
		const nodes = Array.from(document.querySelectorAll('[data-scrolltrigger]'))
		const items = nodes.map((n, i) => {
			const len = n && n.scrollTriggerStack && Array.isArray(n.scrollTriggerStack._triggers) ? n.scrollTriggerStack._triggers.length : 0
			return { index: i, selector: n.tagName + (n.id ? '#' + n.id : '') + (n.className ? '.' + n.className.split(' ').join('.') : ''), len }
		})
		const total = items.reduce((s, it) => s + it.len, 0)
		return { items, total }
	})

	// Call destroy() on each instance
	await page.evaluate(() => {
		const nodes = Array.from(document.querySelectorAll('[data-scrolltrigger]'))
		nodes.forEach(n => {
			try {
				if (n.scrollTriggerStack && typeof n.scrollTriggerStack.destroy === 'function') n.scrollTriggerStack.destroy()
			} catch (e) {}
		})
		// Try to also call global refresh if available
		try {
			if (window.ScrollTrigger && typeof ScrollTrigger.refresh === 'function') ScrollTrigger.refresh()
		} catch (e) {}
	})

	await page.waitForTimeout(400)

	const after = await page.evaluate(() => {
		const nodes = Array.from(document.querySelectorAll('[data-scrolltrigger]'))
		const items = nodes.map((n, i) => {
			const len = n && n.scrollTriggerStack && Array.isArray(n.scrollTriggerStack._triggers) ? n.scrollTriggerStack._triggers.length : 0
			return { index: i, selector: n.tagName + (n.id ? '#' + n.id : '') + (n.className ? '.' + n.className.split(' ').join('.') : ''), len }
		})
		const total = items.reduce((s, it) => s + it.len, 0)
		return { items, total }
	})

	console.log(JSON.stringify({ before, after }, null, 2))
	await browser.close()
})()
