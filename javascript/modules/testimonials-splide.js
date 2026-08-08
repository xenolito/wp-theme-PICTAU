/**
 * Testimonials module, based on Splide: https://splidejs.com
 * version: 1.0
 * @license Copyright 2008-2025, Oscar Rey Tajes. All rights reserved.
 * @author: Oscar Rey Tajes, oscar.rey.tajes@gmail.com
 * © @xenolito 2025
 * @requires @splidejs/splide
 *
 */

import { reverse } from 'lodash'
import { getConfigByAtt } from './attributesToConfigObj'
import Splide from '@splidejs/splide'

const hyphenToCamelcase = str => {
	return str.replace(/-([a-z])/g, k => k[1].toUpperCase())
}

const getRandom = (min, max) => {
	return Math.random() * (max - min) + min
}

document.addEventListener('DOMContentLoaded', () => {
	const attributeId = 'testimonials'
	const testimonialsContainer = document.querySelectorAll(`[data-${attributeId}]`)

	if (!testimonialsContainer.length) return

	const Testimonials = class {
		constructor(testimonialsContainer, config = {}) {
			const {
				log = false,
				nopagination = false,
				autoplay = false,
				arrows = false,
				customarrows = false,
				autoplayreverse = false,
				draggable = false,
				spacebetween = 32,
				slidewidth = 'clamp(360px, 24vw, 420px)',
				speed = 900,
				gap = 'clamp(2rem, 5vw, 4.8rem)',
				padding = 'clamp(5.6rem, 10vw, 9.6rem)',
				// Breakpoint móvil (≤535px): por defecto sigue calculando en vw
				// real del viewport (comportamiento histórico, correcto para el
				// uso full-bleed). Solo se usan valores distintos si el bloque
				// los indica explícitamente vía data-testimonials_slidewidth_mobile
				// / data-testimonials_padding_mobile — pensado para instancias
				// anidadas en un contenedor más estrecho que el viewport, donde
				// conviene pasar valores en cqw (requiere container-type:inline-size
				// en un ancestro) en vez de vw.
				slidewidthmobile = '66vw',
				paddingmobile = 0,
				// Cuántas "páginas" (perPage, con default 1) de slides se
				// precargan por delante/detrás del activo cuando lazyload está
				// activo. Con fixedWidth sin perPage no hay páginas visuales
				// reales, pero Splide igual usa este valor como nº de slides
				// de margen. Default 2 (más generoso que el 1 de Splide) para
				// cubrir con margen el slide que está a punto de entrar con
				// autoplay/drag rápidos. Súbelo si aun así lo ves sin cargar.
				preloadpages = 2,
			} = config

			// console.log('repeat hardcoded', repeat)

			this.testimonialsContainer = testimonialsContainer
			this.nopagination = nopagination === 'true' || nopagination === '1' ? true : false // Hide or show bullets/pagination
			this.autoplay = autoplay ? Number(autoplay) : false
			this.arrows = arrows ? true : false
			this.customarrows = customarrows ? (document.querySelector(customarrows) ?? false) : false // from attribute: data-testimonials_customarrows. Must be a valid css selector (preferably an unique id)
			this.autoplayreverse = autoplayreverse ? true : false
			this.draggable = draggable === 'true' || draggable === '1' ? true : false
			this.spaceBetween = Number(spacebetween)
			this.slideWidth = slidewidth
			this.speed = Number(speed) || 900
			this.gap = gap
			this.padding = padding
			this.slideWidthMobile = slidewidthmobile
			this.paddingMobile = paddingmobile
			// Flag booleano puro por presencia del atributo, NO a través de
			// `config`: getConfigByAtt() (attributesToConfigObj.js, compartida
			// por ~25 módulos) convierte cualquier atributo con valor vacío a
			// `false` (datasets[key] === '' ? false : ...), así que
			// data-testimonials_lazyload="" llegaría ya como `false` en
			// `config`, indistinguible de "atributo ausente". Comprobamos el
			// dataset del elemento directamente para que la presencia del
			// atributo baste, sea cual sea su valor (o ninguno). Único modo
			// soportado: 'nearby' — 'sequential' no tiene caso de uso aquí.
			this.lazyload = 'testimonials_lazyload' in testimonialsContainer.dataset ? 'nearby' : false
			this.preloadPages = Number(preloadpages) || 2

			this.log = log === 'true' || log === '1' ? true : false

			if (this.log) console.log(`log activated for ${this.testimonialsContainer} with class: ${this.testimonialsContainer.classList}`)

			this.init()
		}

		init = () => {
			this.setupDOM()
		}

		// Convierte src/srcset -> data-splide-lazy/data-splide-lazy-srcset,
		// el mecanismo que espera el componente LazyLoad nativo de Splide
		// (ver LazyLoad en splide.esm.js: busca [data-splide-lazy] al montar,
		// no [src]). Quita también loading="lazy": ese atributo dispara el
		// lazy-load NATIVO del navegador, que decide cuándo pedir la imagen
		// según su proximidad al viewport del DOCUMENTO — nada que ver con
		// "es el slide activo (o casi) del carrusel". Con los dos sistemas
		// activos a la vez, Splide puede "activar" un slide y aun así el
		// navegador seguir sin pedir la imagen, produciendo el FOUC/imagen
		// en blanco que se ve sobre todo en móvil con autoplay rápido.
		convertImagesToLazy = slide => {
			slide.querySelectorAll('img[src]').forEach(img => {
				img.setAttribute('data-splide-lazy', img.getAttribute('src'))
				if (img.hasAttribute('srcset')) {
					img.setAttribute('data-splide-lazy-srcset', img.getAttribute('srcset'))
					img.removeAttribute('srcset')
				}
				img.removeAttribute('src')
				img.removeAttribute('loading')
			})
		}

		setupDOM = () => {
			this.testimonialsContainer.classList.add('splide')
			this.testimonialsContainer.setAttribute('role', 'group')
			this.testimonialsContainer.setAttribute('arial-label', 'testimonials slider')

			this.slides = [...this.testimonialsContainer.querySelectorAll(':scope > *')]

			if (this.slides.length < 2) {
				console.warn(
					`⛔️ testimonials-splide: ${this.slides.length} slide(s) found, at least 2 required.\n` +
						`Expected structure:\n` +
						`📦 Group (outer)    ← data-testimonials aquí\n` +
						`  ├── 📦 Group (slide 1)\n` +
						`  ├── 📦 Group (slide 2)\n` +
						`  └── 📦 Group (slide N…)`
				)
				return
			}

			this.splideTrack = document.createElement('div')
			this.splideTrack.classList.add('splide__track')

			const trackList = document.createElement('div')
			trackList.classList.add('splide__list')
			this.splideTrack.append(trackList)

			this.slides.forEach(slide => {
				slide.classList.add('splide__slide')
				if (this.lazyload) this.convertImagesToLazy(slide)
				trackList.append(slide)
			})

			this.testimonialsContainer.append(this.splideTrack)

			this.loopType = this.slides.length > 2 ? 'loop' : 'slide'

			this.initSplide()

			this.testimonialsContainer.classList.add('splide-ready')
		}

		initSplide = () => {
			const config = {
				type: this.loopType,
				fixedWidth: this.slideWidth,
				perMove: 1,
				gap: this.gap,
				padding: this.padding,
				// Mantiene el slide activo siempre centrado en el track, con los
				// vecinos asomando simétricamente a ambos lados (efecto "peek").
				// Sin esto, Splide alinea el slide activo al inicio del track en
				// desktop (solo se aplicaba focus:center en el breakpoint móvil),
				// dejando un hueco vacío a la derecha en viewports anchos.
				focus: 'center',
				easing: 'cubic-bezier(0.2, 1, 0.3, 1)',
				speed: this.speed,
				// padding: 'clamp(2.5rem, 10vw, 4rem)',
				arrows: this.arrows,
				pagination: !this.nopagination,
				// autoplay: true,
				// interval: 2500,
				breakpoints: {
					535: {
						fixedWidth: this.slideWidthMobile,
						padding: this.paddingMobile,
						//arrows: !this.customarrows, // if customarrows is set, arrows will be hidden on mobile
					},
				},
			}

			if (this.autoplay) {
				config.autoplay = true
				config.interval = this.autoplay
				config.pauseOnHover = true
			}

			if (this.lazyload) {
				config.lazyLoad = this.lazyload
				config.preloadPages = this.preloadPages
			}

			try {
				this.splide = new Splide(this.testimonialsContainer, config).mount()
			} catch (e) {
				console.warn('⛔️ testimonials-splide: Splide mount failed', e.message)
				return
			}

			if (this.customarrows) {
				const prevButton = this.customarrows.querySelector(':scope > :first-child')
				prevButton.style.cursor = 'pointer'
				prevButton.style.userSelect = 'none'
				// prevButton.style.pointerEvents = 'all'

				const nextButton = this.customarrows.querySelector(':scope > :last-child')
				nextButton.style.cursor = 'pointer'
				nextButton.style.userSelect = 'none'

				if (this.slides.length < 2) {
					prevButton.style.display = 'none'
					nextButton.style.display = 'none'
				}

				// nextButton.style.pointerEvents = 'all'

				// console.log('customarrows', prevButton, nextButton)

				if (prevButton) {
					prevButton.addEventListener('click', () => {
						this.splide.go('<')
					})
				}

				if (nextButton) {
					nextButton.addEventListener('click', () => {
						this.splide.go('>')
					})
				}
			}

			window.addEventListener('load', () => {
				this.splide.refresh()
			})

			if (this.autoplay) this.initIntersectionObserver()
		}

		initIntersectionObserver = () => {
			const observer = new IntersectionObserver(
				([entry]) => {
					if (entry.isIntersecting) {
						this.splide.Components.Autoplay.play()
					} else {
						this.splide.Components.Autoplay.pause()
					}
				},
				{ threshold: 0 }
			)
			observer.observe(this.testimonialsContainer)
		}
	}

	testimonialsContainer.forEach(testimContainer => {
		// Skip containers that wrap another slider (e.g. a group block with data-testimonials wrapping [hero-slider])
		if (testimContainer.querySelector('[data-heroslider]')) return
		const config = getConfigByAtt(testimContainer, attributeId, true)
		// console.log('CONFIG ', config)
		testimContainer.eventSelector = new Testimonials(testimContainer, config)
	})
})
