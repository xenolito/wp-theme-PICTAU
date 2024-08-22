/**
 * Animation any for WP based on GSAP
 * version: 2.5
 * © @xenolito 2024
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
 * 			'blurIn' (default) 	--> Random start blur in each char / word
 * 			'clippedFromBottom'	--> clipped slide from bottom in each char / word
 *    	'slideFromBottom'		--> slide from botton in each char / word / line
 * 			'slideFromLeft'			--> slide from left in each char / word
 * 			'slideFromTop'			--> slide from Top in each char / word
 * 			'slideFromRight'			--> slide from Right in each char / word
 *TODO 	'blurOut' 					--> Random start blur out each char / word
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
				delay = 0,
				duration = 1.5,
				stagger = 0.1,
				autoplay = true,
				triggerstart = null,
				markers = false,
				chainanim = false,
				slideamount = 250,
				log = false,
			} = config

			// console.log('repeat hardcoded', repeat)

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
			this.animation = animation
			this.chainanim = chainanim
			this.triggerstart = !triggerstart ? `${this.animation === 'slideFromBottom' && this.whattoanim === 'self' ? `top-=${this.slideamount}` : 'top'} bottom-=15%` : `top ${triggerstart}`

			// console.log('this.animation', this.animation, 'this.whattoanim', this.whattoanim, 'st start: ', this.triggerstart)

			this.setupAnimation()
		}

		play = (delay = 0) => {
			this.timeLine.play()
		}

		setupAnimation = () => {
			this.timeLine = gsap.timeline({ paused: !this.autoplay })

			// if there is another element which animation we need to play after this one, we store a ref to this animation on the target...
			if (this.chainanim) {
				this.setupChainedAnimations()
			}

			// if this element animation is chained to another one...
			if (this.header.animChainedTo) {
				this.chainedTo = this.header.animChainedTo.headerAnimation
				// this.chainedTo.masterTimeLine.add(this.timeLine, '>-75%')
				this.chainedTo.masterTimeLine.add(this.timeLine, '>-70%')
				// console.log('animation chained', this.header.animChainedTo, 'depend on:', this.chainedTo.header)
			}

			if (this.markers) console.log(this.triggerstart)

			if (this.autoplay && !this.chainedTo) {
				// Set default ScrollTrigger
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
					// markers: true,
					// markers: this.whattoanim === 'self' ? true : false,
					// invalidateOnRefresh: true, //! Test this, better not to use when there is no scrub associated to ST
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
		}

		setupChainedAnimations = () => {
			const chainedAnimations = Array.from(this.chainanim.split(','))

			console.log(this.header, 'chained to animation: ', chainedAnimations)

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
			// console.log('element animation to chain:', elementWithAnimation);
		}

		setSlideTo = dir => {
			const startPosition = {
				x: dir === 'left' ? this.slideamount : dir === 'right' ? this.slideamount * -1 : 0,
				y: dir === 'up' ? this.slideamount : dir === 'down' ? this.slideamount * -1 : 0,
			}

			if (this.log) console.log('animation', this.animation, 'dir', dir, 'startPosition', startPosition)
			if (this.whattoanim !== 'self') {
				this.typeSplit = new SplitType(this.header, {
					// types: 'lines, chars',
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
					line.style.clipPath = `polygon(0 -10px, 100% -10px, 100% 120%, 0% 120%)`
					line.style.userSelect = 'none'
				})
			}

			gsap.set(elementsToAnim, {
				pointerEvents: 'none',
			})

			this.timeLine.fromTo(
				elementsToAnim,
				{
					// yPercent: 20,
					y: () => startPosition.y,
					x: () => startPosition.x,
					opacity: 0,
					pointerEvents: 'none',
				},
				{
					// yPercent: 0,
					y: 0,
					x: 0,
					opacity: 1,
					pointerEvents: 'all',
					duration: this.duration,
					delay: this.delay,
					stagger: this.stagger,
					// ease: 'expo.out',
					// ease: CustomEase.create(
					// 	'custom',
					// 	'M0,0 C0.104,0.204 -0.267,1.054 1,1 '
					// ),
					ease: 'power4.out',
				}
			)
		}

		setClippedFromBottom = () => {
			this.typeSplit = new SplitType(this.header, {
				// types: 'lines, chars',
				tagName: 'span',
			})

			if (this.header.hasAttribute('data-dot_pulsing')) {
				this.typeSplit.chars.push(this.addDotPulsing(this.typeSplit))
			}

			let elementsToAnim = this.typeSplit[this.whattoanim]
			gsap.set(this.header, { opacity: 1 })

			this.typeSplit.lines.forEach(line => {
				line.style.clipPath = `polygon(0 -10px, 100% -10px, 125% 100%, 0% 125%)`
				line.style.userSelect = 'none'
			})

			gsap.set(elementsToAnim, {
				yPercent: 110,
			})

			this.timeLine.to(elementsToAnim, {
				yPercent: 0,
				duration: this.duration,
				delay: this.delay,
				stagger: this.stagger,
				// ease: 'expo.out',
				ease: CustomEase.create('custom', 'M0,0 C0.104,0.204 -0.267,1.054 1,1 '),
				// ease: 'power4.out',
			})
		}

		setClippedFromLeft = () => {
			this.typeSplit = new SplitType(this.header, {
				// types: 'lines, chars',
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
					// delay: this.delay,
					ease: 'power4.inOut',
				},
				'>-0.3'
			)
		}

		setClippedFromTop = () => {
			this.typeSplit = new SplitType(this.header, {
				// types: 'lines, chars',
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
					// delay: this.delay,
					ease: 'power4.inOut',
				},
				'>-0.3'
			)
		}

		setBlurInAnimation = () => {
			this.typeSplit = new SplitType(this.header, {
				// types: 'lines, chars',
				tagName: 'span',
			})

			if (this.header.hasAttribute('data-dot_pulsing')) {
				this.typeSplit.chars.push(this.addDotPulsing(this.typeSplit))
			}

			let elementsToAnim = this.typeSplit[this.whattoanim]

			elementsToAnim.forEach(elem => {
				const randomBlurPx = getRandom(0, 50)
				// const randomScale = getRandom(1, 5);

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
				delay: this.delay,
				// ease: 'expo.out',
				ease: CustomEase.create('custom', 'M0,0 C0.104,0.204 -0.267,1.054 1,1 '),
			})

			elementsToAnim.forEach((elem, index) => {
				// this.timeLine
				this.timeLine.to(
					elem.blur,
					{
						amount: 0,
						// scale: 1,
						duration: this.duration * 1.5,
						ease: 'expo.out',
						delay: this.delay,
						onUpdate: () => {
							elem.blur.target.style.filter = `blur(${elem.blur.amount}px)`
						},
					},
					'0'
				)
			})
		}

		addDotPulsing = splitObj => {
			const splittedCharDot = document.createElement('span')
			splittedCharDot.setAttribute('class', 'char mz-dot-char')
			const lastChar = splitObj.chars[splitObj.chars.length - 1]
			lastChar.after(splittedCharDot)
			return splittedCharDot
		}
	}

	headerToAnim.forEach(header => {
		// const datasets = header.dataset
		const config = getConfigByAtt(header, 'anim_any')

		// console.log('CONFIG ', config)

		const headerAnimation = new HeaderAnimation(header, config)
		header.headerAnimation = headerAnimation
	})
})
