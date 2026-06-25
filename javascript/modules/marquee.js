/**
 * Infinite Slider for logos / images / etc...
 * By default, it will slide from right to left, and the whole animation will take 30 seconds (30000ms)
 *
 * @license Copyright 2025, Oscar Rey Tajes. All rights reserved.
 * @author: Oscar Rey Tajes, oscar.rey.tajes@gmail.com
 *
 * @requires HTML DOM specific layout, template needed:
 * -DIV container, with attribute 'data-inifinite-slider'. Ohter attributes are optional
 *   -DIV container of items (items type images or htmlElements)
 *     -HTMLElement / image item 1
 *     -HTMLElement / image item 2
 *     -HTMLElement / image item n
 *     -...
 *
 * @requires css for animation, the following animation's keyframes: 'slide' and 'slideReverse':
 * ```
 * @keyframes marquee-slide {
				from {
					translate: 0;
				}
				to {
					translate: -100%;
				}
		}

	 @keyframes marquee-slide-reverse {
			from {
				translate: -100%;
			}
			to {
				translate: 0;
			}
	 }
 * ```

 *
 *
 *
 * @param data-infinite-slider, required, to identify the slider container. No value needed.
 * @param data-infinite-slider-reverse, optional. If present, will slide from left to right. No value needed.
 * @param data-infinite-slider-speed, optional. If present, will set the speed of the whole slider to complete 1 slide, value in ms
 *
 */

import { reverse } from 'lodash'
import { getConfigByAtt } from './attributesToConfigObj'

const hyphenToCamelcase = str => {
	return str.replace(/-([a-z])/g, k => k[1].toUpperCase())
}

const getRandom = (min, max) => {
	return Math.random() * (max - min) + min
}

document.addEventListener('DOMContentLoaded', () => {
	const attributeId = 'marquee'
	const marqueeContainer = document.querySelectorAll(`[data-${attributeId}]`)

	if (!marqueeContainer.length) return

	const Marquee = class {
		constructor(marqueeContainer, config = {}) {
			const { log = false, reverse = false, speed = 30000 } = config

			// console.log('repeat hardcoded', repeat)

			this.marqueeContainer = marqueeContainer
			this.reverse = reverse ? true : false
			this.speed = Number(speed)
			this.log = log === 'true' || log === '1' ? true : false

			if (this.log) console.log(`log activated for ${this.marqueeContainer} with class: ${this.marqueeContainer.classList}`)

			this.init()
		}

		setupDOM = () => {
			this.marqueeContainer.classList.add('marquee')
			const maskImage = 'radial-gradient(50% 150% at 50% 50%, #fff 70%, transparent 100%)'

			this.marqueeContainer.style.setProperty('--speed', `${this.speed}ms`)
			this.marqueeContainer.style.setProperty('--mask-horiz-gradient', maskImage)
			this.marqueeContainer.style.display = 'flex'
			this.marqueeContainer.style.flexFlow = 'row'
			this.marqueeContainer.style.flexWrap = 'nowrap'

			this.marqueeContainer.style.whiteSpace = 'nowrap'
			this.marqueeContainer.style.position = 'relative'
			this.marqueeContainer.style.fontSize = '0'
			this.marqueeContainer.style.maskImage = 'var(--mask-horiz-gradient)'

			this.slide = this.marqueeContainer.querySelector(':scope > div')
			if (!this.slide) {
				console.warn(`⛔️ missing slide div container for the items`)
				return
			}
			this.slide.classList.add('marquee-slide')

			// this.slide.style.display = 'inline-block'
			// this.slide.style.width = 'max-content'
			// this.slide.style.maxWidth = 'unset !important'
			this.slide.style.display = 'flex'
			this.slide.style.flexFlow = 'row'
			this.slide.style.flexShrink = '0'
			this.slide.style.flexWrap = 'nowrap'
			// this.slide.style.background = 'red'
			this.slide.style.willChange = 'auto'
			this.slide.style.width = 'max-content'
			this.slide.style.maxWidth = 'unset !important'

			if (!this.reverse) {
				this.slide.style.animation = `var(--speed) marquee-slide infinite linear`
			} else {
				this.slide.style.animation = `var(--speed) marquee-slide-reverse infinite linear`
			}

			this.items = this.slide.querySelectorAll(':scope > *')
			if (this.items.length < 5) {
				console.warn(`⛔️ Too few items for marquee, add more items. We need at least 5 items.\n${this.items.length} found!`)
				return
			}

			this.items.forEach(item => {
				item.style.display = 'inline-block'
				item.style.maxWidth = 'unset !important'
				item.style.width = 'unset'
				item.style.whiteSpace = 'nowrap'
				item.classList.add('item')

				if (item.tagName === 'FIGURE') {
					const figContent = item.querySelector(':scope > *')
					figContent.style.maxWidth = 'unset !important'
					figContent.setAttribute('loading', 'eager')
				}
			})

			const clonedSlide = this.slide.cloneNode(true)
			this.slide.after(clonedSlide)
		}

		init = () => {
			this.setupDOM()
		}
	}

	marqueeContainer.forEach(marqueeContainer => {
		const config = getConfigByAtt(marqueeContainer, attributeId, false)
		// console.log('CONFIG ', config)
		marqueeContainer.eventSelector = new Marquee(marqueeContainer, config)
	})
})
