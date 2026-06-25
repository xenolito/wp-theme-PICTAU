/**
 * ImgCompare — comparador de imágenes antes/después con slider.
 * Opera sobre un bloque grupo de Gutenberg con data-imgcompare y 2 imágenes hijas.
 * version: 1.0
 * @license Copyright 2008-2025, Oscar Rey Tajes. All rights reserved.
 * @author: Oscar Rey Tajes, oscar.rey.tajes@gmail.com
 * © @xenolito 2025
 */

import { getConfigByAtt } from './attributesToConfigObj'
import { gsap } from 'gsap'

document.addEventListener('DOMContentLoaded', () => {
	const attributeId = 'imgcompare'
	const containers = document.querySelectorAll(`[data-${attributeId}]`)

	if (!containers.length) return

	// Dos chevrons opuestos (< >) — mismo icono que el plugin pct-ambientes-moodboards
	const handlerSVG = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
		<path d="M5 4l-3 4 3 4M11 4l3 4-3 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
	</svg>`

	const ImgCompare = class {
		constructor(container, config = {}) {
			this.container = container
			this.config    = config
			this.isDragging = false
			this.showoff   = !!config.showoff
			this.init()
		}

		init = () => {
			this.buildDOM()
			if (!this.handle) return
			if (this.showoff) {
				this.container.classList.add('imgcompare-showoff')
				this.startShowoff()
			} else {
				this.bindEvents()
			}
		}

		buildDOM = () => {
			// Busca las 2 primeras imgs (funciona con o sin <a> wrapper del bloque grupo)
			const imgs = this.container.querySelectorAll('img')
			if (imgs.length < 2) {
				console.warn('⛔️ imgcompare: se necesitan 2 imágenes en el bloque grupo')
				return
			}

			// Capturar clases del <figure> padre (clases añadidas desde el editor Gutenberg)
			const figureBefore  = imgs[0].closest('figure')
			const figureAfter   = imgs[1].closest('figure')
			const classesBefore = figureBefore ? [...figureBefore.classList] : []
			const classesAfter  = figureAfter  ? [...figureAfter.classList]  : []

			// Clonar imágenes antes de limpiar el DOM
			const imgBefore = imgs[0].cloneNode(true)
			const imgAfter  = imgs[1].cloneNode(true)

			// Trasladar clases del <figure> al <img> clonado
			if (classesBefore.length) imgBefore.classList.add(...classesBefore)
			if (classesAfter.length)  imgAfter.classList.add(...classesAfter)

			// Construir estructura del widget
			const inner     = document.createElement('div')
			inner.className = 'imgcompare-inner'

			const layerBefore     = document.createElement('div')
			layerBefore.className = 'imgcompare-layer imgcompare-before'
			layerBefore.appendChild(imgBefore)

			const layerAfter     = document.createElement('div')
			layerAfter.className = 'imgcompare-layer imgcompare-after'
			layerAfter.appendChild(imgAfter)

			const grip     = document.createElement('div')
			grip.className = 'imgcompare-grip'
			grip.innerHTML = handlerSVG

			const handle     = document.createElement('div')
			handle.className = 'imgcompare-handle'
			handle.setAttribute('role', 'slider')
			handle.setAttribute('aria-label', 'Comparador antes/después')
			handle.setAttribute('aria-valuenow', '50')
			handle.setAttribute('aria-valuemin', '0')
			handle.setAttribute('aria-valuemax', '100')
			handle.appendChild(grip)

			inner.appendChild(layerBefore)
			inner.appendChild(layerAfter)
			inner.appendChild(handle)

			// Reemplazar contenido del contenedor (elimina el <a> del grupo si lo hay)
			this.container.innerHTML = ''
			this.container.appendChild(inner)
			this.container.classList.add('imgcompare-active')
			this.container.style.setProperty('--slider-x', '50%')

			this.inner  = inner
			this.handle = handle
		}

		updateX = (clientX) => {
			const rect = this.inner.getBoundingClientRect()
			const pct  = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
			this.container.style.setProperty('--slider-x', `${pct}%`)
			this.handle.setAttribute('aria-valuenow', Math.round(pct))
		}

		startShowoff = () => {
			// Delay: número fijo o rango "min-max" — se calcula una sola vez
			let delay = 0
			const raw = String(this.config.startdelay ?? '')
			if (raw) {
				const parts = raw.split('-').map(Number)
				delay = parts.length === 2
					? parts[0] + Math.random() * (parts[1] - parts[0])
					: (parts[0] || 0)
			}

			// Proxy numérico para animar --slider-x sin depender del parsing CSS de GSAP
			const pos = { x: 50 }
			const setX = () => {
				this.container.style.setProperty('--slider-x', `${pos.x}%`)
				this.handle.setAttribute('aria-valuenow', Math.round(pos.x))
			}

			const createTimeline = () => {
				this.tl = gsap.timeline({ delay, repeat: -1, repeatDelay: 0.8, defaults: { onUpdate: setX } })
					.to(pos, { x: 72, duration: 1.3, ease: 'power1.inOut' })
					.to(pos, { x: 20, duration: 2.4, ease: 'power2.inOut' }, '+=0.35')
					.to(pos, { x: 58, duration: 0.85, ease: 'power2.out' }, '+=0.5')
					.to(pos, { x: 33, duration: 1.8, ease: 'power1.inOut' }, '+=0.2')
					.to(pos, { x: 50, duration: 1.1, ease: 'power2.inOut' }, '+=0.4')
			}

			// La timeline se crea (y el delay empieza) solo cuando el elemento entra en pantalla
			this.observer = new IntersectionObserver((entries) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						if (!this.tl) createTimeline()
						else this.tl.resume()
					} else {
						this.tl?.pause()
					}
				})
			}, { threshold: 0 })

			this.observer.observe(this.container)
		}

		bindEvents = () => {
			this.handle.addEventListener('pointerdown', (e) => {
				this.isDragging = true
				this.handle.setPointerCapture(e.pointerId)
				document.body.style.touchAction = 'none'
				this.updateX(e.clientX)
			})

			this.handle.addEventListener('pointermove', (e) => {
				if (!this.isDragging) return
				this.updateX(e.clientX)
			})

			const stopDrag = () => {
				this.isDragging = false
				document.body.style.touchAction = ''
			}

			this.handle.addEventListener('pointerup',     stopDrag)
			this.handle.addEventListener('pointercancel', stopDrag)
		}
	}

	containers.forEach(container => {
		const config = getConfigByAtt(container, attributeId, true)
		container.imgCompare = new ImgCompare(container, config)
	})
})
