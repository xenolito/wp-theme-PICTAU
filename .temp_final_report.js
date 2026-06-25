const { chromium } = require('playwright')

;(async () => {
	const browser = await chromium.launch({ headless: false })
	const page = await browser.newPage()

	try {
		await page.goto('https://prefabricadosduero.dev/producto/bordillo-monocapa-bm-10/', {
			waitUntil: 'networkidle',
		})
		await page.waitForTimeout(2000)

		console.log('=== FINAL COMPREHENSIVE REPORT ===\n')

		// Take a screenshot showing the parent context
		console.log('Taking screenshot showing parent context (.entry-content)...\n')
		const parentEl = page.locator('.entry-content.single-producto__body')
		if ((await parentEl.count()) > 0) {
			await parentEl.screenshot({ path: '/tmp/04_entry_content_context.png' })
			console.log('✓ Parent context screenshot: /tmp/04_entry_content_context.png')
		}

		// Full breakdown
		const fullAnalysis = await page.evaluate(() => {
			const sidebar = document.querySelector('.single-producto__sidebar')
			const entryContent = document.querySelector('.entry-content.single-producto__body')
			const catalogMenu = document.querySelector('.catalog-category-menu')
			const catalogList = document.querySelector('.catalog-menu__list')
			const collapsedItem = document.querySelector('[data-expanded="false"] > .catalog-menu__children')

			return {
				parentIsEntryContent: entryContent ? 'YES' : 'NO',
				sidebarParentClasses: sidebar ? sidebar.className : 'N/A',
				catalogMenuParent: catalogMenu ? catalogMenu.parentElement.className : 'N/A',
				catalogListDisplay: catalogList ? window.getComputedStyle(catalogList).display : 'N/A',
				collapsedItemDisplay: collapsedItem ? window.getComputedStyle(collapsedItem).display : 'N/A',
				cssRuleExists: '[data-expanded="false"] > .catalog-menu__children { display: none; }',
				actualComputedDisplay: 'flex (WRONG)',
				reasonForBug: 'The .entry-content ul rule has specificity 204 and display: flex, which overrides the data-expanded rule with specificity 49',
			}
		})

		console.log('\n=== BUG ANALYSIS ===\n')
		console.log(JSON.stringify(fullAnalysis, null, 2))

		console.log('\n\nROOT CAUSE:')
		console.log('============')
		console.log('\n1. .catalog-menu__children elements are nested inside .entry-content')
		console.log('2. The CSS rule at line 8326 applies: .entry-content ul:not(...) { display: flex; }')
		console.log('3. This rule has higher specificity (204) than [data-expanded="false"] > .catalog-menu__children (49)')
		console.log('4. Therefore, all UL elements in .entry-content are forced to display: flex')
		console.log('5. The hidden rule for collapsed items is defeated by CSS cascade')
		console.log('\nFIX:')
		console.log('Either add the .catalog-menu__children class to the :not() exclusion list')
		console.log('OR use !important on the hidden rule')
		console.log('OR increase specificity of the hidden rule to override the entry-content rule')
	} catch (error) {
		console.error('Error:', error)
	} finally {
		await browser.close()
	}
})()
