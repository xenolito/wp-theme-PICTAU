/**
 * Specific intro animation for WordPress home page (slider)
 */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'
import SplitType from 'split-type'
import { getConfigByAtt } from './attributesToConfigObj'

gsap.registerPlugin(ScrollTrigger)
gsap.registerPlugin(CustomEase)

document.addEventListener(
	'DOMContentLoaded',
	() => {
		const isHome = document.querySelector('body').classList.contains('home')
		if (!isHome) return

		const baseElementToAnimate = document.querySelector('.intro-mask')
		if (!baseElementToAnimate) return

		// hide language switcher from menu
		const mainNavDesktopToHide = document.querySelector('.main-nav-desktop')

		const mquery = window.matchMedia('(max-width: 768px)')

		// Don't run animation on mobile
		// if (mquery.matches) return

		mquery.addEventListener('change', e => {
			if (e.matches) {
				// console.log('Mobile view detected')
				// Adjust the end scale for mobile view
				// endScale = 0.8
			} else {
				// console.log('Desktop view detected')
				// endScale = 0.3
			}
			timeLine.invalidate()
		})

		const timeLine = gsap.timeline({
			paused: true,
			defaults: {
				ease: 'power4.out',
				duration: 1,
			},
		})

		let endScale = 0.3
		let cardLeftOffset = 40
		let maskedCardY = 0

		timeLine.to(baseElementToAnimate.querySelector('.masked-card'), {
			// yPercent: 20,
			y: () => {
				maskedCardY = document.querySelector('#masthead').getBoundingClientRect().height + cardLeftOffset
				return `${maskedCardY}px`
			},
			// x: '2.5rem',
			x: (i, el) => {
				// return `0px`
				if (mquery.matches) {
					return `0px`
				} else {
					return `${cardLeftOffset}px`
					// return `${window.innerWidth * 0.5 * -1 + el.offsetWidth * 0.5 * endScale + cardLeftOffset}px`
				}
			},
			borderRadius: () => {
				if (mquery.matches) {
					return '0px'
				} else {
					return '30px'
				}
			},
			// aspectRatio: 16 / 9,
			scale: () => {
				if (mquery.matches) {
					endScale = 1
				} else {
					endScale = 0.3
				}
				return endScale
			},
			height: 'auto',
			ease: 'power3.inOut',
			duration: 1,
			onComplete: function () {
				const target = this.targets()[0] // 'this' se refiere al tween
				target.classList.add('anim-finished')
				const nextElement = target.parentElement.parentElement.querySelector('.slider-content')
				mainNavDesktopToHide.style.opacity = 1
				mainNavDesktopToHide.style.pointerEvents = 'auto'
				showSliderContent(nextElement, target)
				// nextElement.classList.add('show')
			},
		})

		const showSliderContent = (element, ref) => {
			if (!element) return

			const padding = 32
			const refDim = ref.getBoundingClientRect()

			// element.style.translate = `${refDim.left}px ${refDim.top + refDim.height + padding}px`
			element.style.translate = `${refDim.left}px ${maskedCardY + refDim.height + padding}px`

			if (element.headerAnimation) {
				element.headerAnimation.play()
			}

			element.classList.add('show')
		}

		const animateCard = args => {
			// console.log('Animate card called with args:', args)
			timeLine.play()
		}

		window.animateCard = animateCard
	},
	{ once: true }
)
