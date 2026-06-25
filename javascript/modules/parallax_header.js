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
	const attributeId = 'parallax_header'
	const headerToAnim = document.querySelectorAll(`[data-${attributeId}]`)

	if (!headerToAnim.length) return

	const HeaderAnimation = class {
		constructor(targetDOMElement, config = {}) {
			const { whattoanim = 'self', delay = 0, duration = 2, autoplay = true, triggerstart = null } = config

			this.header = targetDOMElement
			this.whattoanim = whattoanim
			this.delay = Number(delay)
			this.duration = Number(duration)
			this.autoplay = Number(autoplay)
			this.triggerstart = !triggerstart ? `bottom ${this.header.clientHeight}` : `bottom ${triggerstart}`

			this.setupAnimation()
		}

		play = () => {
			this.timeLine.play()
		}

		setupAnimation = () => {
			this.targetToAnim = this.whattoanim === 'self' ? this.header : this.header.querySelector(this.whattoanim)
			if (!this.targetToAnim) return

			gsap.set(this.header, {
				// zIndex: -1,
				clipPath: 'border-box',
			})

			this.timeLine = gsap.timeline()

			this.timeLine
				.fromTo(
					'.entry-header-content',
					{
						yPercent: 0,
						opacity: 1,
						scale: 1,
					},
					{
						yPercent: 100,
						opacity: 0,
						scale: 0.8,
						// ease: 'power2.out',
					}
				)
				.to(
					'.is-bg',
					{
						yPercent: 30,
					},
					'<'
				)

			this.st = ScrollTrigger.create({
				trigger: this.header,
				start: this.triggerstart,
				end: 'bottom top',
				animation: this.timeLine,
				scrub: 0.5,
				// pin: this.targetToAnim,
				// pinSpacer: false,
				invalidateOnRefresh: true,
				// markers: true,
				// pinReparent: true,
			})
		}
	}

	headerToAnim.forEach(header => {
		const datasets = header.dataset
		const config = getConfigByAtt(header, attributeId)

		// console.log('CONFIG ', config);

		const headerAnimation = new HeaderAnimation(header, config)
		header.headerAnimation = headerAnimation
	})
})
