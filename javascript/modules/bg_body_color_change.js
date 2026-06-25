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
	const attributeId = 'bgcolor'
	const bgcolorTriggers = document.querySelectorAll(`[data-${attributeId}]`)

	if (!bgcolorTriggers.length) return

	// console.log('container wants to change bg color', bgcolorTriggers)

	const BgColorChanger = class {
		constructor(targetDOMElement, config = {}) {
			const { bgcolor = 'black', text = 'white', start = 'bottom-=20%', end = 'bottom-=20%', markers = false } = config

			this.bgcolorTrigger = targetDOMElement
			this.bgcolor = bgcolor
			this.text = text
			this.scrollTriggerStart = start
			this.scrollTriggerEnd = end
			this.markers = markers
			this.root = document.querySelector(':root')

			this.setupBgColorChanger()
		}

		applyColorChange = () => {
			this.root.style.setProperty('--temp-body-bg', this.bgcolor)
			this.root.style.setProperty('--temp-body-txt-color', this.text)
			this.root.classList.add('temp-body-bg')
		}

		removeColorChange = () => {
			this.root.classList.remove('temp-body-bg')
		}

		setupBgColorChanger = () => {
			const sT = ScrollTrigger.create({
				// trigger: el,
				trigger: this.bgcolorTrigger,
				start: `top ${this.scrollTriggerStart}`,
				end: `bottom ${this.scrollTriggerEnd}`,
				onEnter: () => {
					this.applyColorChange()
				},
				onLeave: () => {
					this.removeColorChange()
				},
				onEnterBack: () => {
					this.applyColorChange()
				},
				onLeaveBack: () => {
					this.removeColorChange()
				},

				//? toggleActions: 'restart   reverse   none          none',
				//? 							  onEnter	  onLeave	  onEnterBack	  onLeaveBack
				scrub: true,
				// anticipatePin: 1,
				// invalidateOnRefresh: true,
				markers: this.markers,
			})
		}
	}

	bgcolorTriggers.forEach(bgcolorTrigger => {
		const config = getConfigByAtt(bgcolorTrigger, attributeId, true)

		// console.log('CONFIG ', config)

		const bgcolorTriggerElement = new BgColorChanger(bgcolorTrigger, config)
		bgcolorTrigger.bgcolorTrigger = bgcolorTriggerElement
	})
})
