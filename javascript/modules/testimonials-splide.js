/**
 * Testimonials module, based on Splide: https://splidejs.com
 * version: 1.0
 * @license Copyright 2008-2025, Oscar Rey Tajes. All rights reserved.
 * @author: Oscar Rey Tajes, oscar.rey.tajes@gmail.com
 * © @xenolito 2025
 * @requires @splidejs/splide
 * @requires HTML DOM specific layout, template needed at: https://swiperjs.com/get-started#add-swiper-html-layout
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
				visibleslides = 2,
				speed = 900,
				gap = 'clamp(2rem, 5vw, 4.8rem)',
				padding = 'clamp(5.6rem, 10vw, 9.6rem)',
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
			this.perPage = Math.max(1, Number(visibleslides) || 2)
			this.speed = Number(speed) || 900
			this.gap = gap
			this.padding = padding

			this.log = log === 'true' || log === '1' ? true : false

			if (this.log) console.log(`log activated for ${this.testimonialsContainer} with class: ${this.testimonialsContainer.classList}`)

			this.init()
		}

		init = () => {
			this.setupDOM()
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
				trackList.append(slide)
			})

			this.testimonialsContainer.append(this.splideTrack)

			this.swiperLoopType = this.slides.length > 2 ? 'loop' : 'slide'

			this.initSwiper()

			this.testimonialsContainer.style.opacity = '1'
		}

		initSwiper = () => {
			const config = {
				type: this.swiperLoopType,
				perPage: this.perPage,
				perMove: 1,
				gap: this.gap,
				padding: this.padding,
				easing: 'cubic-bezier(0.2, 1, 0.3, 1)',
				speed: this.speed,
				// padding: 'clamp(2.5rem, 10vw, 4rem)',
				arrows: this.arrows,
				pagination: !this.nopagination,
				// autoplay: true,
				// interval: 2500,
				breakpoints: {
					1000: {
						perPage: 1,
					},
					535: {
						perPage: 1,
						padding: '2rem',
						//arrows: !this.customarrows, // if customarrows is set, arrows will be hidden on mobile
					},
				},
			}

			if (this.autoplay) {
				config.autoplay = true
				config.interval = this.autoplay
				config.pauseOnHover = true
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
