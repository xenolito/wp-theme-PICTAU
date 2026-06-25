/**
 * Rive files played on enter viewport based on GSAP for WordPress
 * ! Requires rivePlayer.js from @xenolito placed @ "theme/js"
 * version: 1.2
 * Added: nextanim param for identifiy an element with animation to play after this one
 * @license Copyright 2008-2025, Oscar Rey Tajes. All rights reserved.
 * @author: Oscar Rey Tajes, oscar.rey.tajes@gmail.com
 * © @xenolito 2024
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
	const attributeId = 'rivetrigger'
	const riveContainer = document.querySelectorAll(`[data-${attributeId}]`)

	if (!riveContainer.length) return

	const RiveTrigger = class {
		constructor(riveContainer, riveCanvas, config = {}) {
			const { repeat = true, delay = 0, duration = 1.5, stagger = 0.1, autoplay = true, triggerstart = null, markers = false, log = false } = config

			// console.log('repeat hardcoded', repeat)

			this.riveContainer = riveContainer
			this.riveCanvas = riveCanvas

			this.repeat = repeat === 'false' || repeat === '0' ? false : true
			this.markers = markers === 'true' || markers === '1' ? true : false
			this.log = log === 'true' || log === '1' ? true : false
			this.delay = Number(delay)
			this.duration = Number(duration)
			this.autoplay = Number(autoplay)
			this.triggerstart = !triggerstart ? 'top bottom-=15%' : `top ${triggerstart}`

			if (this.log) console.log(`log activated for ${this.riveContainer} with class: ${this.riveContainer.classList}`)

			// console.log('this.animation', this.animation, 'this.whattoanim', this.whattoanim, 'st start: ', this.triggerstart)
			this.setupRiveTrigger()
		}

		play = () => {
			// console.log('call to play()')
			// const timeLineToPlay = this.masterTimeLine ? this.masterTimeLine : this.timeLine
			// timeLineToPlay.play()
			console.log('timeline', this.timeLine)
			this.timeLine.play() //! REFACTOR THIS for propper masterTimeLine play animation for chained animations
		}

		setupRiveTrigger = () => {
			if (this.autoplay) {
				// Set default ScrollTrigger
				this.trigger = ScrollTrigger.create({
					trigger: this.riveContainer,
					start: this.triggerstart,
					end: 'bottom top',
					delay: this.delay,
					onEnter: st => {
						clearTimeout(this.riveCanvas.to)
						// console.log('onEnter')
						if (this.delay) {
							this.riveCanvas.to = setTimeout(() => {
								// this.riveCanvas.obj.rive.play()
								this.riveCanvas.obj.play()
							}, this.delay * 1000)
						} else {
							// this.riveCanvas.obj.rive.play()
							this.riveCanvas.obj.play()
						}
					},
					onEnterBack: st => {
						clearTimeout(this.riveCanvas.to)
						this.riveCanvas.obj.rive.play()
						// console.log('onEnterBack ==> playing')
					},
					onLeave: st => {
						clearTimeout(this.riveCanvas.to)
						this.riveCanvas.obj.rive.pause()
						// console.log('onLeave ==> paused')
					},
					onLeaveBack: st => {
						if (this.repeat) {
							clearTimeout(this.riveCanvas.to)
							this.riveCanvas.obj.reset()
							// this.riveCanvas.obj.rive.pause()
							// console.log('onLeaveBack ==> paused')
						}
					},
					markers: this.markers,
					// markers: true,
					// invalidateOnRefresh: true, //! Test this, better not to use when there is no scrub associated to ST
				})
			}
		}
	}

	riveContainer.forEach(riveContainer => {
		// const datasets = riveContainer.dataset
		const config = getConfigByAtt(riveContainer, 'rivetrigger')
		const riveCanvas = riveContainer.querySelector('[data-rive]')
		// console.log('CONFIG ', config)

		if (riveCanvas) {
			// console.log(`rive container ${riveContainer}`)
			riveContainer.riveTrigger = new RiveTrigger(riveContainer, riveCanvas, config)
		}
	})
})
