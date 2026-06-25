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

	const before = await page.evaluate(() => ({
		stCount: window.ScrollTrigger && typeof ScrollTrigger.getAll === 'function' ? ScrollTrigger.getAll().length : null,
		stacks: Array.from(document.querySelectorAll('[data-scrolltrigger]')).map(n => ({ len: n.scrollTriggerStack?._triggers?.length || 0 })),
	}))

	// Scroll slowly to bottom to trigger stacked pinning
	await page.evaluate(async () => {
		const total = document.body.scrollHeight - window.innerHeight
		for (let y = 0; y <= total; y += 200) {
			window.scrollTo({ top: y })
			await new Promise(r => setTimeout(r, 120))
		}
		window.scrollTo({ top: total })
	})

	await page.waitForTimeout(800)

	const mid = await page.evaluate(() => ({
		stCount: window.ScrollTrigger && typeof ScrollTrigger.getAll === 'function' ? ScrollTrigger.getAll().length : null,
		stacks: Array.from(document.querySelectorAll('[data-scrolltrigger]')).map(n => ({ len: n.scrollTriggerStack?._triggers?.length || 0 })),
	}))

	await page.waitForTimeout(400)

	const after = await page.evaluate(() => ({
		stCount: window.ScrollTrigger && typeof ScrollTrigger.getAll === 'function' ? ScrollTrigger.getAll().length : null,
		stacks: Array.from(document.querySelectorAll('[data-scrolltrigger]')).map(n => ({ len: n.scrollTriggerStack?._triggers?.length || 0 })),
	}))

	console.log('before:', JSON.stringify(before))
	console.log('mid:', JSON.stringify(mid))
	console.log('after:', JSON.stringify(after))

	await browser.close()
})()
