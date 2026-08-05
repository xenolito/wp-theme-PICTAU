#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')
const { checkUrl, printWarning, printSuccess } = require('./lib/site-preflight')

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

// Apagado a nivel de proyecto: si existe este fichero marcador en la raíz del
// tema, se omite la generación sin fallar (exit 0), para que ni el pre-commit
// hook ni "npm run bundle" se rompan en proyectos que no quieren critical CSS.
// Crear/borrar con: touch .critical-css-disabled / rm .critical-css-disabled
const disabledMarker = path.join(projectRoot, '.critical-css-disabled')

if (fs.existsSync(disabledMarker)) {
	console.log(`○ critical CSS desactivado para este proyecto (.critical-css-disabled existe) — omitiendo "${profileName}".`)
	process.exit(0)
}

fs.mkdirSync(outputDir, { recursive: true })

;(async () => {
	// Comprueba que el sitio local responde 200 antes de lanzar Puppeteer. Sin esto,
	// si el sitio está en modo mantenimiento (503) o caído, "critical" puede colgarse
	// varios minutos en lugar de fallar rápido con un aviso claro — inaceptable tanto
	// en local como dentro del git hook (bloquearía el commit indefinidamente).
	const preflight = await checkUrl(profile.url)

	if (!preflight.ok) {
		printWarning(profile.url, preflight)
		process.exit(1)
	}

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
			// Cota de seguridad adicional (penthouse ya usa 30000ms por defecto) para
			// que un cuelgue inesperado no bloquee el commit de forma indefinida.
			penthouse: { timeout: 30000 },
		})

		const sizeKb = (fs.statSync(outputPath).size / 1024).toFixed(1)
		printSuccess(profileName, profile, sizeKb)
	} catch (err) {
		console.error(`✘ Error generando critical CSS para "${profileName}" (${profile.url}):`, err.message)
		process.exit(1)
	}
})()
