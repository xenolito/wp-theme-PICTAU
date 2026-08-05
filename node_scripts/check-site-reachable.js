#!/usr/bin/env node
'use strict'

// Comprobación rápida y aislada (sin Puppeteer) de que el sitio local responde
// 200, pensada para usarse al principio de .githooks/pre-commit: si va a
// fallar por modo mantenimiento u otro motivo, se sabe en <1s, sin esperar a
// que termine "npm run production" para descubrirlo recién en "npm run critical".

const { checkUrl, printWarning } = require('./lib/site-preflight')

const url = process.argv[2] || 'https://balanzia.dev/'

;(async () => {
	const result = await checkUrl(url)

	if (!result.ok) {
		printWarning(url, result)
		process.exit(1)
	}

	process.exit(0)
})()
