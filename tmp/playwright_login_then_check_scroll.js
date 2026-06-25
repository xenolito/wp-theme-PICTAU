const { chromium } = require('playwright')

;(async () => {
	const base = 'http://prefabricadosduero.dev'
	const loginPath = '/pictau'
	const checkPath = '/scroll/'
	const username = process.env.USERNAME
	const password = process.env.PASSWORD
	if (!username || !password) {
		console.error('Missing USERNAME or PASSWORD env vars')
		process.exit(2)
	}

	const browser = await chromium.launch({ headless: true })
	const context = await browser.newContext()
	const page = await context.newPage()
	const consoleMessages = []
	const responses = []
	page.on('console', msg => consoleMessages.push({ type: msg.type(), text: msg.text() }))
	page.on('response', r => {
		try {
			responses.push({ url: r.url(), status: r.status() })
		} catch (e) {}
	})

	// Login
	try {
		await page.goto(base + loginPath, { waitUntil: 'load', timeout: 20000 })
		const hasUserField = await page.$('input#user_login, input[name="log"]')
		if (hasUserField) {
			if (await page.$('input#user_login')) await page.fill('input#user_login', username)
			if (await page.$('input[name="log"]')) await page.fill('input[name="log"]', username)
			if (await page.$('input#user_pass')) await page.fill('input#user_pass', password)
			if (await page.$('input[name="pwd"]')) await page.fill('input[name="pwd"]', password)

			if (await page.$('form#loginform')) {
				await Promise.all([page.waitForNavigation({ waitUntil: 'load', timeout: 20000 }), page.click('form#loginform input[type=submit], form#loginform button[type=submit]')])
			} else if (await page.$('input[name="wp-submit"]')) {
				await Promise.all([page.waitForNavigation({ waitUntil: 'load', timeout: 20000 }), page.click('input[name="wp-submit"]')])
			}
		}
	} catch (e) {
		consoleMessages.push({ type: 'error', text: `Login navigation error: ${e.message}` })
	}

	// Now check /scroll/
	try {
		await page.goto(base + checkPath, { waitUntil: 'load', timeout: 20000 })
	} catch (e) {
		consoleMessages.push({ type: 'error', text: `Navigation error to ${checkPath}: ${e.message}` })
	}

	await page.waitForTimeout(500)

	const triggerCount = await page.evaluate(() => {
		try {
			return window.ScrollTrigger && typeof ScrollTrigger.getAll === 'function' ? ScrollTrigger.getAll().length : -1
		} catch (e) {
			return -2
		}
	})

	console.log('scroll_page_url:', page.url())
	console.log('scrollTrigger_count:', triggerCount)
	console.log('recent_responses:', JSON.stringify(responses.slice(-50)))
	console.log('recent_console:', JSON.stringify(consoleMessages.slice(-50)))

	await page.close()
	await browser.close()
})().catch(e => {
	console.error('fatal', e)
	process.exit(1)
})
