/**
 * Animation any for WP based on GSAP
 * version: 4.11.0
 *
 * ? changelog:
 * ? v4.11.0 — Added reveal animation: opacity-only fade-in (no transform) per char/word/line, same split-by-whattoanim pattern as clippedFromBottom.
 * ? v4.10.0 — Added zoomBounce animation: per-word zoom-in with a mild elastic bounce (opacity/scale split into two aligned tweens so opacity doesn't oscillate with the elastic ease). Inline param sets the starting scale, e.g. 'zoomBounce,0.35'.
 * ? v4.9.3 — Fixed repeat not working at all: `repeat` was destructured from config in the constructor but never assigned to `this.repeat`, so the `onLeaveBack` check (`if (this.repeat)`) always read `undefined` and animations never reversed on scrolling back up past the trigger, regardless of the data-anim_any_repeat value. This was the root cause of the TODO below, which is now resolved and removed.
 * ? v4.9.2 — Fixed nextanim timing: chained targets (no explicit data-anim_any_delay) now get delay=0 in pre-pass, so nextAnimDelay controls the visual overlap directly without the default 0.33s shifting the start. Explicit delay attributes are preserved. Also improved absolutePos fallback from tlDuration to Math.max(0.001, rawPos) to maximise overlap on very short animations.
 * ? v4.9.1 — Fixed nextanim callback not firing when animation duration <= |nextAnimDelay|: position clamped to tlDuration instead of t=0 (GSAP skips callbacks at t=0 on play())
 * ? v4.9.0 — Added nextanim param: chain an element's animation after this one fires ('.selector' or '.selector,-0.5' to start 0.5s before end)
 * ? v4.8.1 — Added callback function after animation complete (must exist at window scope)
 * ? Added matchmedia param: disable animation if query doesn't match (e.g. "min-width: 1024px")
 * ? Added zoomIn and rotateX animations from v3.1
 * ? Added chainanim param from v3.1
 * ? Merged animation_any_V1.js (v4.8.1) as single canonical file
 * ? setClippedFromBottom: replaced clipPath polygon with clip-path inset(-0.4em 0 0 0) for diacritic-safe masking
 *
 * © @xenolito 2026
 *
 */

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
 * 			'blurIn' --> Random start blur in each char / word
 * 			'clippedFromBottom'	--> clipped slide from bottom in each char / word
 *    	'slideFromBottom' (default)		--> slide from botton in each char / word / line
 * 			'slideFromLeft'			--> slide from left in each char / word
 * 			'slideFromTop'			--> slide from Top in each char / word
 * 			'slideFromRight'		--> slide from Right in each char / word
 * 			'zoomIn'				--> zoom in from scale. param: 'zoomIn,1.2' (default scale 1.2)
 * 			'rotateX'				--> rotate from X axis. params: 'rotateX,90' or 'rotateX,90,bottom'
 * 			'zoomBounce'			--> zoom in per char / word with a mild elastic bounce. param: 'zoomBounce,0.35' (default start scale 0.35)
 * 			'reveal'				--> opacity-only fade in per char / word / line, no transform
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
				scalestart = 3, // blurIn: initial scale per character before animating to 1
				matchmedia = false, // disable animation if matchmedia query does not match (e.g. "min-width: 1024px")
				log = false,
			} = config

			const [animationName, animParam, originParam] = animation.split(',').map(s => s.trim())

			this.header = targetDOMElement
			this.whattoanim = whattoanim
			this.animation = animationName
			if (this.animation === 'blurIn' && this.whattoanim === 'self') {
				this.whattoanim = 'chars'
			}
			if (this.animation === 'zoomBounce' && this.whattoanim === 'self') {
				this.whattoanim = 'words'
			}
			this.markers = markers === 'true' || markers === '1' ? true : false
			this.slideamount = slideamount
			this.log = log === 'true' || log === '1' ? true : false
			this.delay = Number(delay)
			this.duration = Number(duration)
			this.autoplay = Number(autoplay)
			this.repeat = repeat === 'false' ? false : Boolean(repeat)
			this.stagger = stagger
			this.scaleStart = Number(scalestart)
			this.zoomStartScale = animParam !== undefined ? Number(animParam) : 1.2
			this.rotateXStartAngle = animParam !== undefined ? Number(animParam) : 90
			this.zoomBounceStartScale = animParam !== undefined ? Number(animParam) : 0.35
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
			this.animation === 'zoomBounce' && this.setZoomBounceWords()
			this.animation === 'reveal' && this.setReveal()

			// Add nextanim call after tweens so ">" resolves to the end of the last tween
			if (this.nextanim && this.nextToAnimate) {
				const tlDuration = this.timeLine.duration()
				const rawPos = tlDuration + this.nextAnimDelay
				// GSAP won't fire callbacks at t=0 (playhead starts there). For animations
				// too short to honour the full offset, fire as early as possible instead of
				// falling back to the end of the timeline (which would start the target late).
				const absolutePos = Math.max(0.001, rawPos)
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
			const staggerWindow = this.stagger * elementsToAnim.length
			const entryEase = CustomEase.create('custom', 'M0,0 C0.104,0.204 -0.267,1.054 1,1 ')

			elementsToAnim.forEach(elem => {
				elem.style.userSelect = 'none'
				elem.style.filter = `blur(${getRandom(0, 50)}px)`
				elem.style.willChange = 'filter, transform, opacity'
			})

			// El contenedor empieza en opacity:0 por CSS — lo revelamos para que los chars lo gestionen
			gsap.set(this.header, { opacity: 1 })
			gsap.set(elementsToAnim, { scale: this.scaleStart, opacity: 0 })

			elementsToAnim.forEach(elem => {
				const offset = gsap.utils.random(0, staggerWindow)

				// Posición absoluta en el timeline (no delay interno) para garantizar sincronía
				this.timeLine.to(elem, {
					scale: 1,
					opacity: 1,
					duration: this.duration,
					ease: entryEase,
				}, offset)

				this.timeLine.to(elem, {
					filter: 'blur(0px)',
					duration: this.duration * 1.5,
					ease: 'expo.out',
					onComplete: () => { elem.style.willChange = 'auto' },
				}, offset)
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

		setReveal = () => {
			this.typeSplit = new SplitType(this.header, {
				tagName: 'span',
			})

			if (this.header.hasAttribute('data-dot_pulsing')) {
				this.typeSplit.chars.push(this.addDotPulsing(this.typeSplit))
			}

			let elementsToAnim = this.typeSplit[this.whattoanim]
			gsap.set(this.header, { opacity: 1 })
			gsap.set(elementsToAnim, { opacity: 0 })

			this.timeLine.to(elementsToAnim, {
				opacity: 1,
				duration: this.duration,
				delay: this.delay,
				stagger: this.stagger,
				ease: 'power1.out',
			})
		}

		setZoomBounceWords = () => {
			this.typeSplit = new SplitType(this.header, {
				tagName: 'span',
			})

			if (this.header.hasAttribute('data-dot_pulsing')) {
				this.typeSplit.chars.push(this.addDotPulsing(this.typeSplit))
			}

			let elementsToAnim = this.typeSplit[this.whattoanim]
			gsap.set(this.header, { opacity: 1 })
			gsap.set(elementsToAnim, {
				opacity: 0,
				scale: this.zoomBounceStartScale,
				transformOrigin: 'center center',
			})

			// Fade rápido y sin ease elástico: si la opacidad usara la misma ease que
			// el scale, oscilaría junto con el rebote y parpadearía.
			this.timeLine.to(elementsToAnim, {
				opacity: 1,
				duration: Math.min(this.duration * 0.45, 0.4),
				delay: this.delay,
				stagger: this.stagger,
				ease: 'power2.out',
			})

			// Zoom con rebote elástico suave, arrancando a la vez que el fade anterior
			this.timeLine.to(
				elementsToAnim,
				{
					scale: 1,
					duration: this.duration,
					stagger: this.stagger,
					ease: 'elastic.out(1, 0.5)',
				},
				'<'
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
		if (chainedTargets.has(header)) {
			config.autoplay = '0'
			// Strip the default auto-play delay for chained targets: their timing is
			// already controlled by the triggering element's nextAnimDelay offset, so
			// an additional default delay would shift the visual start unexpectedly.
			// An explicit data-anim_any_delay attribute is preserved as-is.
			if (config.delay === undefined) config.delay = '0'
		}
		const headerAnimation = new HeaderAnimation(header, config)
		header.headerAnimation = headerAnimation
	})
})
