import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getConfigByAtt } from './attributesToConfigObj'

/**
 * This controls the animBg.js script that creates a Pixi webgl animated background. It uses a canvas with the attribute data-has_abg="<json config>"
 * These webgl backgrounds are created via shortcode [anim-bg] (see template-functions.php for definition)
 *
 *
 */

gsap.registerPlugin(ScrollTrigger)

const hyphenToCamelcase = str => {
	return str.replace(/-([a-z])/g, k => k[1].toUpperCase())
}

const getRandom = (min, max) => {
	return Math.random() * (max - min) + min
}

document.addEventListener('DOMContentLoaded', () => {
	const attributeId = 'has_abg'
	const webgCanvases = document.querySelectorAll(`[data-${attributeId}]`)

	if (!webgCanvases.length) return
	// console.log('container wants to change bg color', webgCanvases)

	webgCanvases.forEach(canvas => {
		const preConfig = getConfigByAtt(canvas, attributeId, true)
		const json = JSON.parse(preConfig.has_abg.replace(/'/g, '"'))

		if (json.autopause === 1) {
			// console.log('need create scrollTrigger for', canvas)

			canvas.st = ScrollTrigger.create({
				trigger: canvas,
				start: `top bottom`,
				end: `bottom top`,
				onEnter: () => {
					if (canvas.app) canvas.app.start()
				},
				onLeave: () => {
					if (canvas.app) canvas.app.stop()
				},
				onEnterBack: () => {
					if (canvas.app) canvas.app.start()
				},
				onLeaveBack: () => {
					if (canvas.app) canvas.app.stop()
				},

				//? toggleActions: 'restart   reverse   none          none',
				//? 							  onEnter	  onLeave	  onEnterBack	  onLeaveBack
				// scrub: true,
				// anticipatePin: 1,
				// invalidateOnRefresh: true,
				// markers: true,
			})
		}

		// console.log('CONFIG ', config)

		// const canvasElement = new BgColorChanger(canvas, config)
		// canvas.canvas = canvasElement
	})
})
