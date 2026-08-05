#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')

// Perfiles de plantilla: URL del sitio local (Local by Flywheel / browser-sync)
// contra la que se renderiza la página para extraer el CSS above-the-fold.
const PROFILES = {
	home: {
		url: 'https://balanzia.dev/',
		label: 'portada (con hero slider)',
	},
	default: {
		url: 'https://balanzia.dev/aviso-legal/',
		label: 'plantilla genérica (page/single/archive)',
	},
}

// Viewports móvil + escritorio, para cubrir los breakpoints de Tailwind.
const DIMENSIONS = [
	{ width: 390, height: 844 },
	{ width: 1440, height: 900 },
]

const profileName = process.argv[2]
const profile = PROFILES[profileName]

if (!profile) {
	console.error(`Uso: node node_scripts/generate-critical-css.js <${Object.keys(PROFILES).join('|')}>`)
	process.exit(1)
}

const projectRoot = path.resolve(__dirname, '..')
const outputDir = path.join(projectRoot, 'theme', 'critical')
const outputPath = path.join(outputDir, `${profileName}.css`)

fs.mkdirSync(outputDir, { recursive: true })

;(async () => {
	// El paquete "critical" es ESM-only; el resto del proyecto usa CommonJS,
	// así que lo cargamos con import() dinámico en lugar de require().
	const { generate } = await import('critical')

	try {
		await generate({
			src: profile.url,
			target: { css: outputPath },
			dimensions: DIMENSIONS,
			inline: false,
			// El certificado HTTPS local de Local by Flywheel está firmado por una CA
			// propia que macOS/Chromium confían vía Keychain, pero Node (got) no la
			// reconoce por defecto. Solo aplica a este fetch de desarrollo local.
			request: { https: { rejectUnauthorized: false } },
		})

		const sizeKb = (fs.statSync(outputPath).size / 1024).toFixed(1)
		console.log(`✔ theme/critical/${profileName}.css generado (${sizeKb} KB) — ${profile.label} — ${profile.url}`)
	} catch (err) {
		console.error(`✘ Error generando critical CSS para "${profileName}" (${profile.url}):`, err.message)
		process.exit(1)
	}
})()
