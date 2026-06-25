const { chromium } = require('playwright')

;(async () => {
	const base = 'http://prefabricadosduero.dev'
	const targetPaths = ['/pictau', '/wp-login.php', '/wp-admin']
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
	page.on('console', msg => consoleMessages.push({ type: msg.type(), text: msg.text() }))

	let finalResult = { success: false, pathTried: null, reason: null }

	for (const p of targetPaths) {
		const url = base + p
		try {
			await page.goto(url, { waitUntil: 'load', timeout: 20000 })
		} catch (e) {
			consoleMessages.push({ type: 'error', text: `Navigation error to ${url}: ${e.message}` })
			continue
		}

		// detect login form
		const hasUserField = await page.$('input#user_login, input[name="log"], input[type="email"][name="username"]')
		if (hasUserField) {
			finalResult.pathTried = url
			try {
				// fill known WP fields
				if (await page.$('input#user_login')) {
					await page.fill('input#user_login', username)
				}
				if (await page.$('input[name="log"]')) {
					await page.fill('input[name="log"]', username)
				}
				if (await page.$('input#user_pass')) {
					await page.fill('input#user_pass', password)
				}
				if (await page.$('input[name="pwd"]')) {
					await page.fill('input[name="pwd"]', password)
				}

				// submit form via button
				if (await page.$('form#loginform')) {
					await Promise.all([page.waitForNavigation({ waitUntil: 'load', timeout: 20000 }), page.click('form#loginform input[type=submit], form#loginform button[type=submit]')])
				} else if (await page.$('input[name="wp-submit"]')) {
					await Promise.all([page.waitForNavigation({ waitUntil: 'load', timeout: 20000 }), page.click('input[name="wp-submit"]')])
				} else {
					// fallback: press Enter on password field
					await Promise.all([page.waitForNavigation({ waitUntil: 'load', timeout: 20000 }), page.press('input#user_pass, input[name="pwd"]', 'Enter')])
				}

				// check logged in state
				const loggedIn = await page.evaluate(() => {
					return document.body.classList.contains('logged-in') || !!document.querySelector('#wpadminbar')
				})
				if (loggedIn) {
					finalResult.success = true
					break
				} else {
					finalResult.reason = 'Login form submitted but no logged-in indicators found'
				}
			} catch (e) {
				finalResult.reason = `Error during login attempt: ${e.message}`
			}
		}
	}

	console.log('login_result:', JSON.stringify({ success: finalResult.success, pathTried: finalResult.pathTried, reason: finalResult.reason }))
	console.log('recent_console:', JSON.stringify(consoleMessages.slice(-50)))

	await page.close()
	await browser.close()
})().catch(e => {
	console.error('fatal', e)
	process.exit(1)
})
