/**
 * Hero Slider module, based on Splide: https://splidejs.com
 * Full-width, above-the-fold hero slider with LCP-optimized first slide.
 * version: 1.0
 * @license Copyright 2008-2025, Oscar Rey Tajes. All rights reserved.
 * @author: Oscar Rey Tajes, oscar.rey.tajes@gmail.com
 * © @xenolito 2025
 * @requires @splidejs/splide
 */

import { getConfigByAtt } from './attributesToConfigObj'
import Splide from '@splidejs/splide'

document.addEventListener('DOMContentLoaded', () => {
	const attributeId = 'heroslider'
	const containers = document.querySelectorAll(`[data-${attributeId}]`)

	if (!containers.length) return

	const HeroSlider = class {
		constructor(container, config = {}) {
			const {
				delay          = '5000',
				draggable      = 'yes',
				arrows         = 'no',
				bullets        = 'yes',
				customarrows   = false,
				callback       = false,
				transition     = 'slide',
				fadespeed      = '0.8',
				pauseonfocus   = 'no',
			} = config

			this.container    = container
			this.delay        = Math.round(Number(delay) * 1000) // segundos → ms
			this.draggable    = draggable === 'yes' || draggable === 'true' || draggable === '1'
			this.arrows       = arrows === 'yes' || arrows === 'true' || arrows === '1'
			this.bullets      = bullets === 'yes' || bullets === 'true' || bullets === '1'
			this.customarrows = customarrows ? (document.querySelector(customarrows) ?? false) : false
			this.callbackFn   = callback || false
			this.transition   = transition === 'fade' ? 'fade' : 'slide'
			this.fadeSpeed    = Math.round(Number(fadespeed) * 1000) // segundos → ms
			this.pauseOnFocus = pauseonfocus === 'yes' || pauseonfocus === 'true' || pauseonfocus === '1'

			this.init()
		}

		init = () => {
			this.setupDOM()
		}

		setupDOM = () => {
			this.container.classList.add('splide')
			this.container.setAttribute('role', 'region')
			this.container.setAttribute('aria-label', 'hero slider')

			// Promote first child to splide__track
			this.splideTrack = this.container.querySelector('.splide__track')
			if (!this.splideTrack) {
				this.splideTrack = this.container.querySelector(':scope > *')
				if (this.splideTrack) {
					this.splideTrack.classList.add('splide__track')
				} else {
					console.warn('⛔️ hero-slider: missing track element')
					return
				}
			}

			// Always ensure splide__list wrapper exists — PHP may pre-add .splide__slide
			// but Splide requires the .splide__track > .splide__list > .splide__slide structure
			let splideList = this.splideTrack.querySelector('.splide__list')
			if (!splideList) {
				const existingChildren = [...this.splideTrack.querySelectorAll(':scope > *')]
				splideList = document.createElement('div')
				splideList.classList.add('splide__list')
				this.splideTrack.append(splideList)
				existingChildren.forEach(child => splideList.append(child))
			}

			// Ensure all direct children of list have splide__slide class
			this.slides = [...splideList.querySelectorAll(':scope > *')]
			this.slides.forEach(slide => slide.classList.add('splide__slide'))

			this.slideCount = this.slides.length
			this.initSplide()
		}

		initSplide = () => {
			const isSingle = this.slideCount <= 1
			const useFade  = !isSingle && this.transition === 'fade'

			this.splide = new Splide(this.container, {
				type:         isSingle ? 'slide' : (useFade ? 'fade' : 'loop'),
				rewind:       useFade,
				speed:        useFade ? this.fadeSpeed : 400,
				perPage:      1,
				perMove:      1,
				gap:          0,
				padding:      0,
				arrows:       isSingle ? false : this.arrows,
				pagination:   isSingle ? false : this.bullets,
				drag:         isSingle ? false : this.draggable,
				autoplay:      !isSingle,
				interval:      this.delay,
				pauseOnHover:  this.pauseOnFocus,
				pauseOnFocus:  this.pauseOnFocus,
			})

			const fireCallbacks = (index) => {
				if (this.callbackFn && typeof window[this.callbackFn] === 'function') {
					window[this.callbackFn](index, this.splide)
				}
				const slideFn = this.slides[index]?.dataset?.slideCallback
				if (slideFn && typeof window[slideFn] === 'function') {
					window[slideFn](index, this.splide)
				}
			}

			// Register listeners before mount so 'ready' fires correctly
			this.splide.on('ready', () => fireCallbacks(this.splide.index))
			this.splide.on('moved', fireCallbacks)

			this.splide.mount()

			if (!isSingle) this.initIntersectionObserver()

			// Prevent grab cursor even when draggable (CSS [data-heroslider] { cursor: default } is also required)
			if (this.draggable && !isSingle) {
				this.container.style.cursor = 'default'
			}

			if (this.customarrows && !isSingle) {
				const prevBtn = this.customarrows.querySelector(':scope > :first-child')
				const nextBtn = this.customarrows.querySelector(':scope > :last-child')

				if (prevBtn) {
					prevBtn.style.cursor = 'pointer'
					prevBtn.style.userSelect = 'none'
					prevBtn.addEventListener('click', () => this.splide.go('<'))
				}

				if (nextBtn) {
					nextBtn.style.cursor = 'pointer'
					nextBtn.style.userSelect = 'none'
					nextBtn.addEventListener('click', () => this.splide.go('>'))
				}
			}

			const revealSlider = () => this.container.classList.add('splide-ready')

			const firstImg = this.slides[0]?.querySelector('img')
			if (firstImg) {
				if (firstImg.complete && firstImg.naturalWidth > 0) {
					requestAnimationFrame(() => requestAnimationFrame(revealSlider))
				} else {
					firstImg.addEventListener('load',  revealSlider, { once: true })
					firstImg.addEventListener('error', revealSlider, { once: true })
				}
			} else {
				requestAnimationFrame(() => requestAnimationFrame(revealSlider))
			}

			window.addEventListener('load', () => {
				this.splide.refresh()
				revealSlider() // fallback: si el load del img fue antes del listener
			})
		}

		initIntersectionObserver = () => {
			const observer = new IntersectionObserver(
				([entry]) => {
					if (entry.isIntersecting) {
						this.splide.Components.Autoplay.play()
						this.container.classList.remove('slider-paused')
					} else {
						this.splide.Components.Autoplay.pause()
						this.container.classList.add('slider-paused')
					}
				},
				{ threshold: 0 }
			)
			observer.observe(this.container)
		}
	}

	containers.forEach(container => {
		const config = getConfigByAtt(container, attributeId, true)
		container.heroSlider = new HeroSlider(container, config)
	})
})
