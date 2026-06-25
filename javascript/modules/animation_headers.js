import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'
import SplitType from 'split-type'
import { getConfigByAtt } from './attributesToConfigObj'

gsap.registerPlugin(ScrollTrigger)
gsap.registerPlugin(CustomEase)

/**
 * available animations for data-anim-header attribute: data-anim-header | data-anim-header="<animation name>"
 * 			'blurIn' (default) 	--> Random start blur in each char / word
 * 			'clippedFromBottom'	--> clipped slide from bottom in each char / word
 *TODO 	'blurOut' 					--> Random start blur out each char / word
 *TODO 	'slideFromBottom'		--> slide from botton in each char / word
 *TODO 	'slideFromLeft'			--> slide from left in each char / word
 *TODO 	'slideFromTop'			--> slide from botton in each char / word
 */

const hyphenToCamelcase = str => {
	return str.replace(/-([a-z])/g, k => k[1].toUpperCase())
}

const getRandom = (min, max) => {
	return Math.random() * (max - min) + min
}

document.addEventListener('DOMContentLoaded', () => {
	const attributeId = 'anim_header'
	const headerToAnim = document.querySelectorAll(`[data-${attributeId}]`)

	if (!headerToAnim.length) return
	console.log('⛔️ DEPRECATED LIBRARY animation_header.js called by data-anim_header att')

	const HeaderAnimation = class {
		constructor(targetDOMElement, config = {}) {
			const { animation = 'slideFromBottom', whattoanim = 'self', delay = 0.3, duration = 2, stagger = 0.1, autoplay = true, waitpageload = false, triggerstart = null } = config

			this.header = targetDOMElement
			this.animation = !animation ? 'blurIn' : animation
			this.whattoanim = !whattoanim ? 'chars' : whattoanim
			this.delay = Number(delay)
			this.duration = Number(duration)
			this.autoplay = Number(autoplay)
			this.stagger = stagger
			this.waitpageload = (waitpageload === 'true' || waitpageload === '') ?? false
			this.triggerstart = !triggerstart ? 'top bottom-=15%' : `top ${triggerstart}`

			this.setupAnimation()
		}

		play = () => {
			this.timeLine.play()
		}

		setupAnimation = () => {
			this.timeLine = gsap.timeline({
				// defaults: { opacity: 0 },
				paused: true,
			})

			if (this.autoplay) {
				// Set default ScrollTrigger
				this.trigger = ScrollTrigger.create({
					trigger: this.header,
					start: this.triggerstart,
					animation: this.timeLine,
					onLeaveBack: st => {
						st.animation.progress(0.65) //! Check and test this...
						// st.animation.invalidate();
						// console.log('onLeaveBack: ', st.animation.vars);
						// st.animation.yoyo();
						st.animation.reverse()
					},
					// markers: false,
					// markers:
					// 	this.animation === 'slideFromBottom' ? true : false,
					invalidateOnRefresh: true,
				})
			}

			//! Setup the chosen animation
			this.animation === 'blurIn' && this.setBlurInAnimation()
			this.animation === 'clippedFromBottom' && this.setClippedFromBottom()
			this.animation === 'clippedFromLeft' && this.setClippedFromLeft()
			this.animation === 'slideFromBottom' && this.setSlideFromBottom()
		}

		setSlideFromBottom = () => {
			console.log('slide from BOTTOM')
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
				line.style.clipPath = `polygon(0 0, 100% 0, 120% 100%, 0% 120%)`
				line.style.userSelect = 'none'
			})

			gsap.set(elementsToAnim, {
				yPercent: 110,
				opacity: 0,
			})

			this.timeLine.to(elementsToAnim, {
				yPercent: 0,
				opacity: 1,
				duration: this.duration,
				delay: this.delay,
				stagger: this.stagger,
				// ease: 'expo.out',
				// ease: CustomEase.create(
				// 	'custom',
				// 	'M0,0 C0.104,0.204 -0.267,1.054 1,1 '
				// ),
				ease: 'power4.out',
			})
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
				line.style.clipPath = `polygon(0 0, 100% 0, 120% 100%, 0% 120%)`
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
						ease: 'power2.out',
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
				// elem.style.scale = randomBlurPx / 50;
				// elem.style.transformOrigin = 'center';

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
						// delay: getRandom(0, 1),
						onUpdate: () => {
							elem.blur.target.style.filter = `blur(${elem.blur.amount}px)`
							// elem.blur.target.style.scale = elem.blur.scale;
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
		const datasets = header.dataset
		const config = getConfigByAtt(header, 'anim_header')

		const headerAnimation = new HeaderAnimation(header, config)
		header.headerAnimation = headerAnimation
	})
})
