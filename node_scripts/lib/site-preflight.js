'use strict'

const https = require('https')

const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'
const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'

// Comprueba que una URL local responde 200. Se usa antes de lanzar Puppeteer
// (node_scripts/generate-critical-css.js) o cualquier build que dependa del
// sitio local levantado: sin esto, "critical" puede colgarse varios minutos
// contra una página de mantenimiento en lugar de fallar rápido.
function checkUrl(url, timeoutMs = 8000) {
	return new Promise(resolve => {
		const req = https.get(url, { rejectUnauthorized: false, timeout: timeoutMs }, res => {
			res.resume() // descarta el body, solo nos interesa el status/headers
			resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, statusCode: res.statusCode, headers: res.headers })
		})
		req.on('timeout', () => {
			req.destroy()
			resolve({ ok: false, error: `sin respuesta en ${timeoutMs / 1000}s` })
		})
		req.on('error', err => resolve({ ok: false, error: err.message }))
	})
}

// Imprime un aviso imposible de pasar por alto entre el resto del output de
// npm/git hooks. Distingue "modo mantenimiento" (503 + Retry-After, la firma
// del plugin maintenance-mode-pct) de otros fallos (sitio caído, timeout...).
function printWarning(url, result) {
	const isMaintenance = result.statusCode === 503
	const border = '⚠️ '.repeat(14)

	console.error('\n' + RED + BOLD + border + RESET)

	if (isMaintenance) {
		const retryAfter = result.headers && result.headers['retry-after']
		console.error(RED + BOLD + '  MODO MANTENIMIENTO ACTIVO — no se puede generar el critical CSS' + RESET)
		console.error(YELLOW + `  ${url} devuelve 503${retryAfter ? ' (Retry-After: ' + retryAfter + 's)' : ''}.` + RESET)
		console.error(YELLOW + '  Desactívalo antes de reintentar:' + RESET)
		console.error(BOLD + '    wp-local eval \'$s=get_option("cmm_settings");$s["enabled"]=0;update_option("cmm_settings",$s,false);wp_cache_clear_cache();\'' + RESET)
		console.error(YELLOW + '  Y vuelve a activarlo cuando termines:' + RESET)
		console.error(BOLD + '    wp-local eval \'$s=get_option("cmm_settings");$s["enabled"]=1;update_option("cmm_settings",$s,false);wp_cache_clear_cache();\'' + RESET)
	} else {
		console.error(RED + BOLD + '  SITIO LOCAL NO ACCESIBLE — no se puede generar el critical CSS' + RESET)
		console.error(YELLOW + `  ${url}: ${result.statusCode ? 'HTTP ' + result.statusCode : result.error}` + RESET)
		console.error(YELLOW + '  ¿Está Local by Flywheel levantado y el sitio arrancado?' + RESET)
	}

	console.error(RED + BOLD + border + RESET + '\n')
}

module.exports = { checkUrl, printWarning }
