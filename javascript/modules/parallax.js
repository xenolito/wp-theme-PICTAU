/**
 * Parallax — efecto parallax vertical relativo a la posición del elemento en el viewport.
 * El elemento no recibe transform mientras está por debajo del viewport.
 * El desplazamiento es cero en el momento exacto de entrada y se acumula mientras
 * el elemento está visible (o ya ha pasado), proporcional al depth y a la altura del viewport.
 *
 * Usage (Gutenberg block HTML attributes panel):
 *   data-parallax="0.3"  → depth 0.3 (mueve 0.3 px por cada px scrolled en viewport)
 *   data-parallax="1"    → mueve 1 px adicional por cada px de scroll en viewport
 *   data-parallax="0"    → sin movimiento
 *   data-parallax         → depth 0.5 por defecto
 *
 * Fórmula cuando el elemento está en viewport o por encima:
 *   y = -(vh - naturalTop) × depth
 *   naturalTop = posición natural del top del elemento relativa al viewport (sin transform)
 *   y = 0 cuando naturalTop = vh (elemento recién entrado por abajo)
 *
 * Cuando el elemento está por debajo del viewport: y = 0 (sin movimiento).
 *
 * version: 2.0
 * @license Copyright 2008-2025, Oscar Rey Tajes. All rights reserved.
 * @author: Oscar Rey Tajes, oscar.rey.tajes@gmail.com
 * © @xenolito 2025
 * @requires gsap, lenis (via smooth_scroll.js)
 */

import { gsap } from 'gsap'
import { getConfigByAtt } from './attributesToConfigObj'

const attributeId = 'parallax'

const Parallax = class {
	constructor(el, config = {}) {
		this.el = el
		this.depth = parseFloat(config[attributeId]) || 0.5
		this._onScroll = null
		this._nativeScroll = null

		this.init()
	}

	init = () => {
		// Capturar posición natural en el documento una sola vez (sin transform aplicado)
		const rect = this.el.getBoundingClientRect()
		const scrollNow = window.lenis?.scroll ?? window.scrollY
		this._naturalDocTop = rect.top + scrollNow

		this._onScroll = ({ scroll }) => {
			const vh = window.innerHeight
			// Posición natural del top del elemento en el viewport (sin transform)
			const naturalTop = this._naturalDocTop - scroll

			if (naturalTop >= vh) {
				// Elemento aún por debajo del viewport: sin desplazamiento
				gsap.set(this.el, { y: 0 })
				return
			}

			// En viewport o ya pasado: y=0 en el momento de entrada (naturalTop = vh)
			gsap.set(this.el, { y: -(vh - naturalTop) * this.depth })
		}

		// Calcular y aplicar posición inicial
		this._onScroll({ scroll: window.lenis?.scroll ?? window.scrollY })

		if (window.lenis) {
			window.lenis.on('scroll', this._onScroll)
		} else {
			this._nativeScroll = () => this._onScroll({ scroll: window.scrollY })
			window.addEventListener('scroll', this._nativeScroll, { passive: true })
		}
	}

	destroy = () => {
		try {
			if (window.lenis && this._onScroll) {
				window.lenis.off('scroll', this._onScroll)
			}
			if (this._nativeScroll) {
				window.removeEventListener('scroll', this._nativeScroll)
			}
			gsap.set(this.el, { clearProps: 'transform' })
		} catch (err) {
			console.warn('⛔️ parallax: destroy error', err)
		} finally {
			try {
				delete this.el.parallax
			} catch (e) {
				this.el.parallax = undefined
			}
		}
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const elements = document.querySelectorAll(`[data-${attributeId}]`)
	if (!elements.length) return

	elements.forEach(el => {
		const config = getConfigByAtt(el, attributeId, true)
		el.parallax = new Parallax(el, config)
	})
})
