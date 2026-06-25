import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getConfigByAtt } from './attributesToConfigObj'

gsap.registerPlugin(ScrollTrigger)

const hyphenToCamelcase = str => {
	return str.replace(/-([a-z])/g, k => k[1].toUpperCase())
}

const getRandom = (min, max) => {
	return Math.random() * (max - min) + min
}

document.addEventListener('DOMContentLoaded', () => {
	const attributeId = 'pin'
	const pinnedContainer = document.querySelectorAll(`[data-${attributeId}]`)

	if (!pinnedContainer.length) return

	const PinElement = class {
		constructor(targetDOMElement, config = {}) {
			const { target = false, breakpoint = '768', start = 'top', markers = false, pinnedEnd = false } = config

			this.pinnedContainer = targetDOMElement
			this.target = target ? this.pinnedContainer.querySelector(target) : this.pinnedContainer.querySelector(`:scope > *:nth-of-type(1)`)
			this.breakpoint = breakpoint
			this.scrollTriggerStart = start
			this.pinnedStEnd = pinnedEnd
			this.markers = markers

			if (!this.target) {
				console.log('⛔️ NO se ha encontrado el elemento a pinear con el selector: ', target)
				return
			}

			// console.log(this.pinnedContainer.querySelector(target))

			this.setupPinnedElement()
		}

		setupPinnedElement = () => {
			let mm = gsap.matchMedia()

			this.target.style.height = 'fit-content'
			let parentComputedStyle = getComputedStyle(this.pinnedContainer)
			//! The parent's padding Top & Bottom (if exist), needed to fix the scrollTrigger end point
			this.paddBottomDelta = parseFloat(parentComputedStyle.paddingBottom)
			this.paddTopDelta = parseFloat(parentComputedStyle.paddingTop)

			mm.add(`(min-width: ${Number(this.breakpoint)}px)`, () => {
				this.sT = ScrollTrigger.create({
					// trigger: el,
					trigger: this.target,
					start: () => `top ${this.scrollTriggerStart}`,
					end: () => `${this.pinnedContainer.offsetHeight - this.paddBottomDelta - this.paddTopDelta} ${this.scrollTriggerStart}+=${this.target.offsetHeight}px`,

					//? toggleActions: 'restart   reverse   none          none',
					//? 							  onEnter	  onLeave	  onEnterBack	  onLeaveBack
					scrub: true,
					pin: this.target,
					// anticipatePin: 1,
					pinSpacing: false,
					invalidateOnRefresh: true,
					markers: this.markers,
					// markers: true,
				})

				return () => {
					gsap.matchMediaRefresh()
					this.sT.disable()
				}
			})
		}
	}

	pinnedContainer.forEach(pinContainer => {
		const config = getConfigByAtt(pinContainer, attributeId)

		// console.log('CONFIG ', config)

		const pinElement = new PinElement(pinContainer, config)
		pinContainer.pinElement = pinElement
	})
})
