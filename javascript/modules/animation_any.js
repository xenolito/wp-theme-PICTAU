/**
 * Animation any for WP based on GSAP
 * version: 4.9.1
 * Added: nextanim param for identifiy an element with animation to play after this one
 * Added: callback function after animation complete: Callback should exist/scope at window level. :-(
 * ? changelog:
 * ? Added matchmedia param to setup: as string like "min-width: 1024px". If true, animation will run, otherwise will be skipped, including not passed (html param: data-anim-any-matchmedia)
 * ? Added zoomIn and rotateX animations from v3.1
 * ? Added chainanim param from v3.1
 * ? Merged animation_any_V1.js (v4.8.1) as single canonical file
 * ? setClippedFromBottom: replaced clipPath polygon with clip-path inset(-0.4em 0 0 0) for diacritic-safe masking
 * ? Fixed nextanim callback not firing when animation duration <= |nextAnimDelay|: position clamped to tlDuration instead of t=0 (GSAP skips callbacks at t=0 on play())
 *
 * © @xenolito 2026
 *
 */

// TODO When animation is set to autoplay=false, and is chained to another animation, it does not make a reverse animation on exit the viewport (repeat=true not working??)

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'
import SplitType from 'split-type'
import { getConfigByAtt } from './attributesToConfigObj'

gsap.registerPlugin(ScrollTrigger)
gsap.registerPlugin(CustomEase)

/**
 * /**
 * AnimationAny for WordPress 1.0.1
 * https://pictau.com
 *
 * @license Copyright 2008-2024, Oscar Rey Tajes. All rights reserved.
 * @author: Oscar Rey Tajes, oscar.rey.tajes@gmail.com
 *
 * available animations for data-anim-header attribute: data-anim-any"
 * 			'blurIn' (default) 	--> Random start blur in each char / word
 * 			'clippedFromBottom'	--> clipped slide from bottom in each char / word
 *    	'slideFromBottom'		--> slide from botton in each char / word / line
 * 			'slideFromLeft'			--> slide from left in each char / word
 * 			'slideFromTop'			--> slide from Top in each char / word
 * 			'slideFromRight'		--> slide from Right in each char / word
 * 			'zoomIn'				--> zoom in from scale. param: 'zoomIn,1.2' (default scale 1.2)
 * 			'rotateX'				--> rotate from X axis. params: 'rotateX,90' or 'rotateX,90,bottom'
 *TODO 	'blurOut' 				--> Random start blur out each char / word
 */

const hyphenToCamelcase = str => {
	return str.replace(/-([a-z])/g, k => k[1].toUpperCase())
}

const getRandom = (min, max) => {
	return Math.random() * (max - min) + min
}

document.addEventListener('DOMContentLoaded', () => {
	const attributeId = 'anim_any'
	const headerToAnim = document.querySelectorAll(`[data-${attributeId}]`)

	if (!headerToAnim.length) return

	const HeaderAnimation = class {
		constructor(targetDOMElement, config = {}) {
			const {
				animation = 'slideFromBottom',
				repeat = true,
				whattoanim = 'self',
				delay = 0.33,
				duration = 1.5,
				stagger = 0.1,
				autoplay = true,
				triggerstart = null,
				markers = false,
				chainanim = false,
				nextanim = false, // next animation to play after this one: '.selector' or '.selector, 1.5' where 1.5 is seconds to wait after completion
				callback = false, // callback function to call after animation complete
				slideamount = 100,
				matchmedia = false, // disable animation if matchmedia query does not match (e.g. "min-width: 1024px")
				log = false,
			} = config

			const [animationName, animParam, originParam] = animation.split(',').map(s => s.trim())

			this.header = targetDOMElement
			this.whattoanim = whattoanim
			this.repeat = repeat === 'false' || repeat === '0' ? false : true
			this.markers = markers === 'true' || markers === '1' ? true : false
			this.slideamount = slideamount
			this.log = log === 'true' || log === '1' ? true : false
			this.delay = Number(delay)
			this.duration = Number(duration)
			this.autoplay = Number(autoplay)
			this.stagger = stagger
			this.animation = animationName
			this.zoomStartScale = animParam !== undefined ? Number(animParam) : 1.2
			this.rotateXStartAngle = animParam !== undefined ? Number(animParam) : 90
			this.rotateXOriginY = originParam === 'bottom' ? '100%' : '0%'
			this.chainanim = chainanim
			this.matchmedia = matchmedia ?? false

			if (this.matchmedia) this.mquery = window.matchMedia(`(${this.matchmedia})`)

			this.nextanim = nextanim
			this.callback = callback

			this.triggerstart = !triggerstart ? `${this.animation === 'slideFromBottom' && this.whattoanim === 'self' ? `top-=${this.slideamount}` : 'top'} bottom-=18%` : `top ${triggerstart}`

			if (!this.matchmedia || (this.mquery && this.mquery.matches)) {
				this.setupAnimation()
			} else {
				return
			}
		}

		play = () => {
			if (!this.matchmedia || (this.mquery && this.mquery.matches)) {
				this.timeLine.play()
			} else return
		}

		setupAnimation = () => {
			this.timeLine = gsap.timeline({
				paused: !this.autoplay,
			})

			if (this.nextanim) {
				const parts = this.nextanim.split(',')
				const selector = parts[0].trim()
				this.nextAnimDelay = parts[1] ? Number(parts[1].trim()) : -1.5
				this.nextToAnimate = document.querySelector(selector)
			}

			if (this.callback) {
				const [callbackFunc, callbackDelay = 0] = this.callback.split(',')
				this.callbackFunc = callbackFunc
				this.callbackDelay = Number(callbackDelay)

				this.timeLine.eventCallback('onComplete', () => {
					if (window[this.callbackFunc] === undefined) {
						console.warn(`Callback function "${this.callbackFunc}" does not exist in the global scope (window). Please ensure it is defined before using it in the animation.`)
						return
					}
					setTimeout(() => {
						window[this.callbackFunc]()
					}, this.callbackDelay)
				})
			}

			if (this.chainanim) {
				this.setupChainedAnimations()
			}

			// if this element animation is chained to a previous one via chainanim
			if (this.header.animChainedTo) {
				this.chainedTo = this.header.animChainedTo.headerAnimation
				this.chainedTo.masterTimeLine.add(this.timeLine, '>-70%')
			}

			if (this.markers) console.log(this.triggerstart)

			if (this.autoplay && !this.chainedTo) {
				this.trigger = ScrollTrigger.create({
					trigger: this.header,
					start: this.triggerstart,
					end: 'top top',
					animation: this.masterTimeLine ? this.masterTimeLine : this.timeLine,
					onLeaveBack: st => {
						if (this.repeat) {
							st.animation.progress(0.7) //! Check and test this...
							st.animation.reverse()
						}
					},
					markers: this.markers,
				})
			}

			//! Setup the chosen animation
			this.animation === 'blurIn' && this.setBlurInAnimation()
			this.animation === 'clippedFromBottom' && this.setClippedFromBottom()
			this.animation === 'clippedFromLeft' && this.setClippedFromLeft()
			this.animation === 'clippedFromTop' && this.setClippedFromTop()
			this.animation === 'slideFromBottom' && this.setSlideTo('up')
			this.animation === 'slideFromTop' && this.setSlideTo('down')
			this.animation === 'slideFromLeft' && this.setSlideTo('right')
			this.animation === 'slideFromRight' && this.setSlideTo('left')
			this.animation === 'zoomIn' && this.setZoomInAnimation()
			this.animation === 'rotateX' && this.setRotateXAnimation()

			// Add nextanim call after tweens so ">" resolves to the end of the last tween
			if (this.nextanim && this.nextToAnimate) {
				const tlDuration = this.timeLine.duration()
				const rawPos = tlDuration + this.nextAnimDelay
				// If the offset pushes the callback to t<=0, GSAP won't fire it (playhead
				// starts there and never crosses it going forward). Fall back to end of timeline.
				const absolutePos = rawPos > 0.001 ? rawPos : tlDuration
				this.timeLine.call(
					() => {
						this.nextToAnimate.headerAnimation?.play()
					},
					[],
					absolutePos
				)
			}
		}

		setupChainedAnimations = () => {
			const chainedAnimations = Array.from(this.chainanim.split(','))

			chainedAnimations.forEach(targetEl => {
				let elementAnimToChain = this.header.parentElement.parentElement.querySelector(targetEl)
				if (elementAnimToChain) this.chainElementAnimation(elementAnimToChain)
			})

			this.masterTimeLine = gsap.timeline({
				paused: true,
			})
			this.masterTimeLine.add(this.timeLine)
		}

		chainElementAnimation = elementWithAnimation => {
			elementWithAnimation.animChainedTo = this.header
		}

		setSlideTo = dir => {
			const startPosition = {
				x: dir === 'left' ? this.slideamount : dir === 'right' ? this.slideamount * -1 : 0,
				y: dir === 'up' ? this.slideamount : dir === 'down' ? this.slideamount * -1 : 0,
			}

			if (this.whattoanim !== 'self') {
				this.typeSplit = new SplitType(this.header, {
					tagName: 'span',
				})

				if (this.header.hasAttribute('data-dot_pulsing')) {
					this.typeSplit.chars.push(this.addDotPulsing(this.typeSplit))
				}
			}

			let elementsToAnim = this.whattoanim !== 'self' ? this.typeSplit[this.whattoanim] : this.header
			gsap.set(this.header, { opacity: 1 })

			if (this.whattoanim !== 'self') {
				this.typeSplit.lines.forEach(line => {
					line.style.clipPath = `polygon(0 -10px, 100% -10px, 100% 100%, 0% 100%)`
					line.style.userSelect = 'none'
				})
			}

			gsap.set(elementsToAnim, {
				pointerEvents: 'none',
			})

			this.timeLine.fromTo(
				elementsToAnim,
				{
					y: () => startPosition.y,
					x: () => startPosition.x,
					opacity: 0,
					pointerEvents: 'none',
				},
				{
					y: 0,
					x: 0,
					opacity: 1,
					pointerEvents: 'all',
					duration: this.duration,
					delay: this.delay,
					stagger: this.stagger,
					ease: 'power4.out',
				}
			)
		}

		setClippedFromBottom = () => {
			this.typeSplit = new SplitType(this.header, {
				tagName: 'span',
			})

			if (this.header.hasAttribute('data-dot_pulsing')) {
				this.typeSplit.chars.push(this.addDotPulsing(this.typeSplit))
			}

			let elementsToAnim = this.typeSplit[this.whattoanim]
			gsap.set(this.header, { opacity: 1 })

			this.typeSplit.lines.forEach(line => {
				line.style.clipPath = `inset(-0.4em 0 0 0)`
				line.style.userSelect = 'none'
			})

			gsap.set(elementsToAnim, {
				yPercent: 150,
			})

			this.timeLine.to(elementsToAnim, {
				yPercent: 0,
				duration: this.duration,
				delay: this.delay,
				stagger: this.stagger,
				ease: CustomEase.create('custom', 'M0,0 C0.104,0.204 -0.267,1.054 1,1 '),
			})
		}

		setClippedFromLeft = () => {
			this.typeSplit = new SplitType(this.header, {
				tagName: 'span',
			})

			let leftBorder = this.header.parentElement.querySelector('.left-border')

			this.borderLeftPadding = leftBorder && getComputedStyle(this.header)['padding-left'] ? getComputedStyle(this.header)['padding-left'].split('px')[0] : 0

			if (leftBorder) {
				this.leftBorderDelay = this.delay
				this.delay = 0
			}

			leftBorder &&
				gsap.set(leftBorder, {
					scaleY: 0,
					transformOrigin: 'bottom',
				})

			leftBorder &&
				this.timeLine.fromTo(
					leftBorder,
					{
						scaleY: 0,
						immediateRender: false,
					},
					{
						scaleY: 1,
						duration: 0.5,
						ease: 'power1.out',
						delay: this.leftBorderDelay,
					}
				)

			if (this.header.hasAttribute('data-dot_pulsing')) {
				this.typeSplit.chars.push(this.addDotPulsing(this.typeSplit))
			}

			let elementsToAnim = this.typeSplit[this.whattoanim]
			gsap.set(this.header, {
				opacity: 1,
				clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
			})

			gsap.set(elementsToAnim, {
				xPercent: -100,
				x: this.borderLeftPadding * -1,
			})

			this.timeLine.to(
				elementsToAnim,
				{
					xPercent: 0,
					x: 0,
					stagger: this.stagger,
					duration: this.duration,
					ease: 'power4.inOut',
				},
				'>-0.3'
			)
		}

		setClippedFromTop = () => {
			this.typeSplit = new SplitType(this.header, {
				tagName: 'span',
			})

			let topBorder = this.header.parentElement.querySelector('.top-border')

			this.borderTopPadding = topBorder && getComputedStyle(this.header)['padding-top'] ? getComputedStyle(this.header)['padding-top'].split('px')[0] : 0

			if (topBorder) {
				this.topBorderDelay = this.delay
				this.delay = 0
			}

			topBorder &&
				gsap.set(topBorder, {
					scaleX: 0,
					transformOrigin: 'left',
				})

			topBorder &&
				this.timeLine.fromTo(
					topBorder,
					{
						scaleX: 0,
						immediateRender: false,
					},
					{
						scaleX: 1,
						duration: 0.5,
						ease: 'power1.out',
						delay: this.topBorderDelay,
					}
				)

			if (this.header.hasAttribute('data-dot_pulsing')) {
				this.typeSplit.chars.push(this.addDotPulsing(this.typeSplit))
			}

			let elementsToAnim = this.typeSplit[this.whattoanim]
			gsap.set(this.header, {
				opacity: 1,
				clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
			})

			gsap.set(elementsToAnim, {
				xPercent: -100,
				x: this.borderTopPadding * -1,
			})

			this.timeLine.to(
				elementsToAnim,
				{
					xPercent: 0,
					x: 0,
					stagger: this.stagger,
					duration: this.duration,
					ease: 'power4.inOut',
				},
				'>-0.3'
			)
		}

		setBlurInAnimation = () => {
			this.typeSplit = new SplitType(this.header, {
				tagName: 'span',
			})

			if (this.header.hasAttribute('data-dot_pulsing')) {
				this.typeSplit.chars.push(this.addDotPulsing(this.typeSplit))
			}

			let elementsToAnim = this.typeSplit[this.whattoanim]

			elementsToAnim.forEach(elem => {
				const randomBlurPx = getRandom(0, 50)

				elem.style.userSelect = 'none'
				elem.style.filter = `blur(${randomBlurPx}px)`

				elem.blur = {
					amount: randomBlurPx,
					scale: randomBlurPx / 50,
					target: elem,
				}
			})

			gsap.set(this.header, {
				scale: 3,
				opacity: 0,
			})

			gsap.set(elementsToAnim, {
				willChange: 'auto',
			})

			this.timeLine.to(this.header, {
				scale: 1,
				opacity: 1,
				duration: this.duration,
				ease: CustomEase.create('custom', 'M0,0 C0.104,0.204 -0.267,1.054 1,1 '),
			})

			elementsToAnim.forEach(elem => {
				this.timeLine.to(
					elem.blur,
					{
						amount: 0,
						duration: this.duration * 1.5,
						ease: 'expo.out',
						onUpdate: () => {
							elem.blur.target.style.filter = `blur(${elem.blur.amount}px)`
						},
					},
					'0'
				)
			})
		}

		setRotateXAnimation = () => {
			gsap.set(this.header, {
				opacity: 0,
				rotationX: this.rotateXStartAngle,
				transformPerspective: 800,
				transformOrigin: `50% ${this.rotateXOriginY}`,
			})
			this.timeLine.fromTo(
				this.header,
				{ opacity: 0, rotationX: this.rotateXStartAngle },
				{
					opacity: 1,
					rotationX: 0,
					duration: this.duration,
					delay: this.delay,
					ease: 'power3.out',
				}
			)
		}

		setZoomInAnimation = () => {
			gsap.set(this.header, { opacity: 0, scale: this.zoomStartScale })
			this.timeLine.fromTo(
				this.header,
				{ opacity: 0, scale: this.zoomStartScale },
				{
					opacity: 1,
					scale: 1,
					duration: this.duration,
					delay: this.delay,
					ease: 'power3.out',
				}
			)
		}

		addDotPulsing = splitObj => {
			const splittedCharDot = document.createElement('span')
			splittedCharDot.setAttribute('class', 'char mz-dot-char')
			const lastChar = splitObj.chars[splitObj.chars.length - 1]
			lastChar.after(splittedCharDot)
			return splittedCharDot
		}
	}

	// Pre-pass: collect chained targets so their autoplay can be overridden before instantiation
	const chainedTargets = new Set()
	headerToAnim.forEach(header => {
		const config = getConfigByAtt(header, attributeId)
		if (!config.nextanim) return
		const selector = config.nextanim.split(',')[0].trim()
		const target = document.querySelector(selector)
		if (target && target.hasAttribute(`data-${attributeId}`)) {
			chainedTargets.add(target)
		}
	})

	headerToAnim.forEach(header => {
		const config = getConfigByAtt(header, attributeId)
		if (chainedTargets.has(header)) config.autoplay = '0'
		const headerAnimation = new HeaderAnimation(header, config)
		header.headerAnimation = headerAnimation
	})
})
