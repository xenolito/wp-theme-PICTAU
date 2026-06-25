import { getConfigByAtt } from './attributesToConfigObj'
import { Circ } from 'gsap'
import { gsap } from 'gsap/gsap-core'
import throttle from 'throttleit'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * webgl canvas for a squares grid background effect
 * @license Copyright 2025, Oscar Rey Tajes. All rights reserved.
 * @author: Oscar Rey Tajes, oscar.rey.tajes@gmail.com
 *
 * @param data-webglgrid_color="r,g,b", optional. If present, will set the color of the squares and dots in the grid.
 */

gsap.registerPlugin(ScrollTrigger)

const hyphenToCamelcase = str => {
	return str.replace(/-([a-z])/g, k => k[1].toUpperCase())
}

const getRandom = (min, max) => {
	return Math.random() * (max - min) + min
}

const hexToRgb = hex => {
	// Eliminar el símbolo "#" si existe
	hex = hex.replace(/^#/, '')

	// Colores de 3 dígitos (#f00 → #ff0000)
	if (hex.length === 3) {
		hex = hex
			.split('')
			.map(c => c + c)
			.join('')
	}

	if (hex.length !== 6) {
		throw new Error('Formato hexadecimal inválido')
	}

	const num = parseInt(hex, 16)

	return {
		r: (num >> 16) & 255,
		g: (num >> 8) & 255,
		b: num & 255,
	}
}

const rgbStringToHex = rgbString => {
	const [r, g, b] = rgbString.split(',').map(val => {
		const n = parseInt(val.trim(), 10)
		if (isNaN(n) || n < 0 || n > 255) {
			throw new Error('Valores RGB inválidos')
		}
		return n
	})

	const toHex = val => val.toString(16).padStart(2, '0')

	return '#' + toHex(r) + toHex(g) + toHex(b)
}

const isHexColor = str => {
	return /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(str)
}

document.addEventListener('DOMContentLoaded', () => {
	const attributeId = 'webglgrid'
	const backgroundContainer = document.querySelectorAll(`[data-${attributeId}]`)

	if (!backgroundContainer.length) return

	const BackgroundGL = class {
		constructor(bgContainer, config = {}) {
			const { triggerstart = false, log = false, target = false, square = 6, spacing = 16, color = '156,217,249', opacity = 0.15, cssclass = false, markers = false } = config

			this.bgContainer = bgContainer
			this.target = document.querySelector(target) ?? this.bgContainer

			this.square = Number(square)
			this.spacing = Number(spacing)
			this.maxOpacity = Number(opacity)
			this.customClass = cssclass && cssclass.startsWith('.') ? cssclass.slice(1) : cssclass
			this.triggerstart = !triggerstart ? `top bottom` : `top ${triggerstart}`

			this.color = isHexColor(color)
				? hexToRgb(color)
				: {
						r: Number(color.split(',')[0]),
						g: Number(color.split(',')[1]),
						b: Number(color.split(',')[2]),
					}

			this.markers = markers
			this.size = this.getSize()
			this.log = log === 'true' || log === '1' ? true : false

			if (this.log) console.log(`log activated for ${this.bgContainer} with class: ${this.bgContainer.classList}`)
			this.paused = true

			this.init()
		}

		init = () => {
			this.setupDOM()
		}

		setupDOM = () => {
			this.target.classList.add('has-webgl')
			this.target.style.position = 'relative' // Ensure target has relative positioning for absolute canvas

			this.targetRect = this.target.getBoundingClientRect()

			this.canvas = document.createElement('canvas')

			this.canvas.classList.add('webgl-dots')
			if (this.customClass) {
				this.canvas.classList.add(this.customClass)
			}

			this.canvas.style.width = '100%'
			this.canvas.style.height = '100%'
			this.canvas.style.maxWidth = 'unset'

			this.canvas.width = this.targetRect.width
			this.canvas.height = this.targetRect.height

			this.canvas.style.position = 'absolute'
			this.canvas.style.inset = '0'
			this.canvas.style.zIndex = '0' // Ensure canvas is behind other content

			// this.target.appendChild(this.canvas)
			this.target.prepend(this.canvas)

			this.setupScrollControl()
		}

		setupScrollControl = () => {
			this.initWebGL(this.canvas)

			this.st = ScrollTrigger.create({
				trigger: this.bgContainer,
				start: this.triggerstart,
				end: 'bottom top',
				// animation: this.timeLine,
				onEnter: () => {
					this.play()
				},
				onLeave: () => {
					this.stop()
				},
				onEnterBack: () => {
					this.play()
				},
				onLeaveBack: () => {
					this.stop()
				},
				scrub: 0.5,
				invalidateOnRefresh: true,
				markers: this.markers,
			})
		}

		initWebGL = () => {
			this.ctx = this.canvas.getContext('2d')

			this.canvas.width = this.targetRect.width
			this.canvas.height = this.targetRect.height

			this.addListeners()
			this.drawGrid()
		}

		drawGrid = () => {
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

			for (let y = 0; y < this.canvas.height; y += this.spacing) {
				for (let x = 0; x < this.canvas.width; x += this.spacing) {
					const alpha = Math.random() * this.maxOpacity // opacidad entre 0 y 0.2
					this.ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha})` // cambia aquí el color base
					this.ctx.fillRect(x, y, this.square, this.square)
				}
			}
		}

		getSize = () => {
			const targetRect = this.target.getBoundingClientRect()

			return {
				w: targetRect.width,
				h: targetRect.height,
			}
		}

		play = () => {
			if (!this.paused) return
			this.paused = false
			// this.animate()
		}

		stop = () => {
			this.paused = true
		}

		addListeners = () => {
			this.throttledResizeCallback = throttle(this.resizeUpdate, 300)
			this.resizeObserver()
		}

		resizeUpdate = () => {
			this.size = this.getSize()
			this.canvas.width = this.size.w
			this.canvas.height = this.size.h
			this.drawGrid()
		}

		resizeObserver = () => {
			const resizeObserver = new ResizeObserver(entries => {
				for (let entry of entries) {
					this.throttledResizeCallback()
				}
			})
			resizeObserver.observe(this.target)
		}
	}

	backgroundContainer.forEach(bgContainer => {
		const config = getConfigByAtt(bgContainer, attributeId, false)
		// console.log('CONFIG ', config)
		bgContainer.bgWebGL = new BackgroundGL(bgContainer, config)
	})
})
