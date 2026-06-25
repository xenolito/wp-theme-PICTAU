import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Float } from './float'
import { getConfigByAtt } from './attributesToConfigObj'

gsap.registerPlugin(ScrollTrigger)

const hyphenToCamelcase = str => {
	return str.replace(/-([a-z])/g, k => k[1].toUpperCase())
}

const getRandom = (min, max) => {
	return Math.random() * (max - min) + min
}

document.addEventListener('DOMContentLoaded', () => {
	const attributeId = 'anim_float'
	const floaters = document.querySelectorAll(`[data-${attributeId}]`)

	if (!floaters.length) return
	// console.log('container wants to change bg color', bgcolorTriggers)

	floaters.forEach(floater => {
		const config = getConfigByAtt(floater, attributeId)

		// console.log('CONFIG ', config)

		const floaterElement = new Float(floater, config)
		floater.floater = floaterElement
	})
})
