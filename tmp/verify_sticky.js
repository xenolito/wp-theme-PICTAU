const { chromium } = require('playwright')

;(async () => {
	const base = 'http://prefabricadosduero.dev'
	const browser = await chromium.launch({ headless: true })
	const context = await browser.newContext()
	const page = await context.newPage()

	await page.goto(base + '/pictau/', { waitUntil: 'load' })
	await page.waitForSelector('#user_login', { timeout: 5000 })
	await page.fill('#user_login', 'orey')
	await page.fill('#user_pass', 'Aisling3215*')
	await page.click('#wp-submit')
	await page.waitForTimeout(800)

	await page.goto(base + '/scroll/', { waitUntil: 'load' })
	await page.waitForTimeout(500)

	// Snapshot initial state
	const initial = await page.evaluate(() => {
		const container = document.querySelector('[data-scrolltrigger]')
		if (!container) return { error: 'no container' }
		const trigger = container.querySelector('.st-trigger')
		const itemA = container.querySelector('.st-item-a')
		const itemB = container.querySelector('.st-item-b')
		return {
			nodesCount: document.querySelectorAll('[data-scrolltrigger]').length,
			hasInstance: !!container.scrollTriggerStack,
			triggerStyle: trigger ? { position: trigger.style.position, top: trigger.style.top } : null,
			itemAStyle: itemA ? { position: itemA.style.position, top: itemA.style.top } : null,
			itemBStyle: itemB ? { position: itemB.style.position, top: itemB.style.top } : null,
			containerOverflow: window.getComputedStyle(container).overflow,
		}
	})
	console.log('INITIAL:', JSON.stringify(initial, null, 2))

	// Scroll progressively and capture class state
	const snapshots = []
	const total = await page.evaluate(() => document.body.scrollHeight - window.innerHeight)
	for (let y = 0; y <= total; y += Math.round(total / 8)) {
		await page.evaluate(y => window.scrollTo({ top: y }), y)
		await page.waitForTimeout(200)
		const snap = await page.evaluate(() => {
			const container = document.querySelector('[data-scrolltrigger]')
			const trigger = container ? container.querySelector('.st-trigger') : null
			const itemA = container ? container.querySelector('.st-item-a') : null
			const itemB = container ? container.querySelector('.st-item-b') : null
			const bg = container ? container.querySelector('.is-bg') : null
			return {
				scrollY: window.scrollY,
				bgHasClass: bg ? bg.classList.contains('anim_triggered') : null,
				itemAHasClass: itemA ? itemA.classList.contains('anim_triggered') : null,
				itemBHasClass: itemB ? itemB.classList.contains('anim_triggered') : null,
				triggerBCR: trigger ? Math.round(trigger.getBoundingClientRect().top) : null,
				itemABCR: itemA ? Math.round(itemA.getBoundingClientRect().top) : null,
			}
		})
		snapshots.push(snap)
	}
	console.log('SCROLL SNAPSHOTS:', JSON.stringify(snapshots, null, 2))

	await browser.close()
})()
