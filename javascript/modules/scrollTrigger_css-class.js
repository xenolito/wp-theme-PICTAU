/**
 * Add css class attribute for element on ScrollTrigger
 * version: 1.1
 * @license Copyright 2008-2025, Oscar Rey Tajes. All rights reserved.
 * @author: Oscar Rey Tajes, oscar.rey.tajes@gmail.com
 * © @xenolito 2025
 *
 */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'
import { getConfigByAtt } from './attributesToConfigObj'

gsap.registerPlugin(ScrollTrigger)
gsap.registerPlugin(CustomEase)

const hyphenToCamelcase = str => {
	return str.replace(/-([a-z])/g, k => k[1].toUpperCase())
}

const getRandom = (min, max) => {
	return Math.random() * (max - min) + min
}

document.addEventListener('DOMContentLoaded', () => {
	const attributeId = 'classtrigger'
	const elementTrigger = document.querySelectorAll(`[data-${attributeId}]`)

	if (!elementTrigger.length) return

	const CssClassTrigger = class {
		constructor(elementTrigger, config = {}) {
			const { repeat = true, delay = 0, duration = 1.5, stagger = 0.1, autoplay = true, triggerstart = null, markers = false, log = false, classtrigger = '' } = config

			// console.log('repeat hardcoded', repeat)

			this.elementTrigger = elementTrigger
			this.classname = classtrigger !== '' ? classtrigger : 'scrolltriggered'
			this.repeat = repeat === 'false' || repeat === '0' ? false : true
			this.markers = markers === 'true' || markers === '1' ? true : false
			this.log = log === 'true' || log === '1' ? true : false
			this.delay = Number(delay)
			this.duration = Number(duration)
			this.autoplay = Number(autoplay)
			this.triggerstart = !triggerstart ? 'top bottom-=15%' : `top ${triggerstart}`

			if (this.log) console.log(`log activated for ${this.elementTrigger} with class: ${this.elementTrigger.classList}`)

			// console.log('this.animation', this.animation, 'this.whattoanim', this.whattoanim, 'st start: ', this.triggerstart)
			this.setupCssClassTrigger()
		}

		play = () => {
			// const timeLineToPlay = this.masterTimeLine ? this.masterTimeLine : this.timeLine
			// timeLineToPlay.play()
			this.timeLine.play() //! REFACTOR THIS for propper masterTimeLine play animation for chained animations
		}

		setupCssClassTrigger = () => {
			if (this.autoplay) {
				// Set default ScrollTrigger
				this.trigger = ScrollTrigger.create({
					trigger: this.elementTrigger,
					start: this.triggerstart,
					end: 'top top',
					onEnter: st => {
						this.elementTrigger.classList.add(this.classname)
						// this.riveCanvas.obj.play()
					},
					// animation: this.masterTimeLine ? this.masterTimeLine : this.timeLine,
					onLeaveBack: st => {
						if (this.repeat) {
							this.elementTrigger.classList.remove(this.classname)
						}
					},
					markers: this.markers,
					// markers: true,
					// invalidateOnRefresh: true, //! Test this, better not to use when there is no scrub associated to ST
				})
			}
		}
	}

	elementTrigger.forEach(elementTrigger => {
		// const datasets = elementTrigger.dataset
		const config = getConfigByAtt(elementTrigger, 'classtrigger', true)
		// console.log('CONFIG ', config)
		elementTrigger.cssClassTrigger = new CssClassTrigger(elementTrigger, config)
	})
})
