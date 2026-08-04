#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')
const archiver = require('archiver')

const slug = process.argv[2]

if (!slug) {
	console.error('Uso: node node_scripts/zip.js <theme-slug>')
	process.exit(1)
}

const projectRoot = path.resolve(__dirname, '..')
const sourceDir = path.join(projectRoot, 'theme')
const outputPath = path.join(projectRoot, `${slug}.zip`)

if (!fs.existsSync(sourceDir)) {
	console.error(`No se encuentra el directorio a empaquetar: ${sourceDir}`)
	process.exit(1)
}

fs.rmSync(outputPath, { force: true })

const output = fs.createWriteStream(outputPath)
const archive = archiver('zip', { zlib: { level: 9 } })

output.on('close', () => {
	const sizeMb = (archive.pointer() / 1024 / 1024).toFixed(2)
	console.log(`✔ ${slug}.zip generado (${sizeMb} MB)`)
})

archive.on('warning', err => {
	if (err.code === 'ENOENT') {
		console.warn(err)
	} else {
		throw err
	}
})

archive.on('error', err => {
	throw err
})

archive.pipe(output)

const excludedSuffixes = ['.map', '.DS_Store']

// Empaqueta theme/ dentro de una carpeta raíz con el slug del tema, para que se
// instale correctamente en wp-content/themes/<slug> al subir el zip desde WordPress.
// Excluye sourcemaps residuales de builds en modo watch y basura del sistema operativo.
archive.directory(sourceDir, slug, entryData => {
	return excludedSuffixes.some(suffix => entryData.name.endsWith(suffix)) ? false : entryData
})

archive.finalize()
