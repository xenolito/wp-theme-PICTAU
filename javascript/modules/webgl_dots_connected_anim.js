/**
 * Animated Connected Dots -- Custom webgl background effect
 * Elements width data attributes triggered background webgl effect. Just use data-webgldots attribute in the container element.
 * The effect will be applied to the first child element of the container or the specified children targeted by its classname via data-webgldots_target="<css class selector>".
 * The effect will create a canvas element and append it to the container/target element.
 * The effect will create a grid of points that will be connected by lines.
 * The points will be animated to move randomly around their original position.
 * The lines will be animated to fade in and out depending on the distance to the target position.
 * The effect will also create a mask that will fade in and out depending on the distance to the target position.
 * @license Copyright 2025, Oscar Rey Tajes. All rights reserved.
 * @author: Oscar Rey Tajes, oscar.rey.tajes@gmail.com
 *
 * @param data-webgldots_target=".xxx", optional. If present, will set the target element to apply the effect, value in css selector format, default first child of the container element
 * @param data-webgldots_colorlines="255,255,255", optional. If present, will set the color of the lines, value in rgb format
 * @param data-webgldots_colordots="255,255,255", optional. If present, will set the color of the dots, value in rgb format
 * @param data-webgldots_maskspread="1", optional. If present, will set the mask spread value, value in float format  0-1, default 1
 * @param data-webgldots_density="3", optional. If present, will set the density of the points, value in integer format, default 3
 * @param data-webgldots_triggerstart="top bottom", optional. If present, will set the start position of the scroll trigger, value in string format, default "top bottom"
 * @param data-webgldots_log="false", optional. If present, will enable the console log for debugging purposes, value in boolean format, default false
 * @param data-webgldots_markers="false", optional. If present, will enable the scroll trigger markers for debugging purposes, value in boolean format, default false
 */

import { getConfigByAtt } from './attributesToConfigObj'
import { Circ } from 'gsap'
import { gsap } from 'gsap/gsap-core'
import throttle from 'throttleit'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const hyphenToCamelcase = str => {
	return str.replace(/-([a-z])/g, k => k[1].toUpperCase())
}

const getRandom = (min, max) => {
	return Math.random() * (max - min) + min
}

document.addEventListener('DOMContentLoaded', () => {
	const attributeId = 'webgldots'
	const backgroundContainer = document.querySelectorAll(`[data-${attributeId}]`)

	if (!backgroundContainer.length) return

	const BackgroundGL = class {
		constructor(bgContainer, config = {}) {
			const {
				triggerstart = false,
				log = false,
				target = false,
				density = 3,
				dotsize = 2,
				maxdisplacement = 50,
				colorlines = '156,217,249',
				colordots = '156,217,249',
				maskspread = 1,
				markers = false,
			} = config

			this.bgContainer = bgContainer
			this.target = document.querySelector(target) ?? this.bgContainer

			this.density = Number(density)
			this.triggerstart = !triggerstart ? `top bottom` : `top ${triggerstart}`
			this.dotSize = Number(dotsize)
			this.maxdisplacement = Number(maxdisplacement)
			this.colorlines = {
				r: Number(colorlines.split(',')[0]),
				g: Number(colorlines.split(',')[1]),
				b: Number(colorlines.split(',')[2]),
			}
			this.colordots = {
				r: Number(colordots.split(',')[0]),
				g: Number(colordots.split(',')[1]),
				b: Number(colordots.split(',')[2]),
			}

			this.markers = markers
			this.maskspread = Number(maskspread)

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
			this.targetOrigin = this.getTargetCenter()

			this.canvas = document.createElement('canvas')

			this.canvas.classList.add('webgl-dots')

			this.canvas.style.width = '100%'
			this.canvas.style.height = '100%'
			this.canvas.width = this.targetRect.width
			this.canvas.height = this.targetRect.height

			this.canvas.style.position = 'absolute'
			this.canvas.style.inset = '0'
			this.canvas.style.zIndex = '0' // Ensure canvas is behind other content

			this.target.appendChild(this.canvas)

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

			this.createPoints()
			//! Init animation
			this.addListeners()
			this.animate()
			this.shiftAllPoints()
		}

		getTargetCenter = () => {
			const targetRect = this.target.getBoundingClientRect()

			const targetCoords = {
				x: targetRect.width * 0.5,
				y: targetRect.height * 0.5,
			}

			return targetCoords
		}

		getSize = () => {
			const targetRect = this.target.getBoundingClientRect()

			return {
				w: targetRect.width,
				h: targetRect.height,
			}
		}

		getDistance = (p1, p2) => {
			return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
		}

		updatePoints = () => {
			this.points = false
			// console.log('Updating points')
			this.createPoints()
			this.animate()
			this.shiftAllPoints()
		}

		createPoints = () => {
			const numberOfPoints = Math.floor((this.targetRect.width * this.targetRect.height) / 10000) * this.density // Adjust density of points
			this.points = []

			for (let x = 0; x < numberOfPoints; x++) {
				const px = Math.random() * this.size.w - this.size.w * 0.5 // Center the points in the canvas
				const py = Math.random() * this.size.h - this.size.h * 0.5 // Center the points in the canvas
				const p = { x: px, originX: px, y: py, originY: py }
				this.points.push(p)
			}

			// for each point find the 5 closest points
			for (let i = 0; i < this.points.length; i++) {
				const closest = []
				const p1 = this.points[i]
				for (let j = 0; j < this.points.length; j++) {
					const p2 = this.points[j]
					if (!(p1 == p2)) {
						let placed = false
						for (let k = 0; k < 5; k++) {
							if (!placed) {
								if (closest[k] == undefined) {
									closest[k] = p2
									placed = true
								}
							}
						}

						for (let k = 0; k < 5; k++) {
							if (!placed) {
								if (this.getDistance(p1, p2) < this.getDistance(p1, closest[k])) {
									closest[k] = p2
									placed = true
								}
							}
						}
					}
				}
				p1.closest = closest
			}

			// assign a circle to each point
			for (let i in this.points) {
				const c = new Circle(this, this.points[i], 1.5 + Math.random() * this.dotSize, 'rgba(255,255,255,0.3)')
				this.points[i].circle = c
			}
		}

		animate = () => {
			if (!this.paused) {
				this.ctx.clearRect(0, 0, this.size.w, this.size.h)
				// active is the opacity of the lines and circles depending on the distance to the target position
				for (let i in this.points) {
					// detect points in range
					const translatedPos = {
						x: this.points[i].x + this.targetOrigin.x - this.size.w * 0.5, // Center the points in the canvas
						y: this.points[i].y + this.targetOrigin.y - this.size.h * 0.5,
					}

					// const opacity = this.getAspectRatioOpacity(this.points[i].x, this.points[i].y, 0, 0, this.size.w, this.size.h);

					const opacity = this.getAspectRatioOpacity(this.points[i].x, this.points[i].y, 0, 0, this.size.w * this.maskspread, this.size.h * this.maskspread)

					this.points[i].active = opacity * 0.15
					this.points[i].circle.active = opacity
					this.points[i].circle.draw()
					this.drawLines(this.points[i])
				}

				requestAnimationFrame(this.animate)
			}
		}

		drawLines = p => {
			if (!p.active) return

			for (let i in p.closest) {
				// console.log(p.closest[i].active)
				if (!p.closest[i] || p.closest[i].active < 0.08) continue // Skip if closest point is undefined or opacity is too low
				this.ctx.beginPath()
				this.ctx.moveTo(p.x + this.targetOrigin.x, p.y + this.targetOrigin.y)
				this.ctx.lineTo(p.closest[i].x + this.targetOrigin.x, p.closest[i].y + this.targetOrigin.y)
				this.ctx.strokeStyle = `rgba(${this.colorlines.r},${this.colorlines.g},${this.colorlines.b},${p.active})`
				this.ctx.stroke()
			}
		}

		shiftAllPoints = () => {
			for (let i in this.points) {
				this.shiftPoint(this.points[i])
			}
		}

		shiftPoint = p => {
			gsap.to(p, {
				// x: p.originX - 50 + Math.random() * 100,
				// y: p.originY - 50 + Math.random() * 100,
				x: p.originX + this.randomBetweenNegXAndX(this.maxdisplacement),
				y: p.originY + this.randomBetweenNegXAndX(this.maxdisplacement),
				duration: 1 + 1 * Math.random(),
				ease: Circ.easeInOut,
				onComplete: () => {
					this.shiftPoint(p)
				},
			})
		}

		randomBetweenNegXAndX = x => {
			return Math.random() * (2 * x) - x
		}

		getAspectRatioOpacity = (x, y, originX, originY, width, height) => {
			// Normalize distance relative to width and height
			const dx = (x - originX) / (width / 2)
			const dy = (y - originY) / (height / 2)

			// Elliptical distance from center (0 to 1+)
			const distance = Math.sqrt(dx * dx + dy * dy)

			// Clamp and apply inverse quadratic falloff
			const normalized = Math.min(distance, 1)
			const opacity = 1 - normalized * normalized

			return opacity
		}

		play = () => {
			if (!this.paused) return
			this.paused = false
			this.animate()
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
			this.targetRect = this.target.getBoundingClientRect()
			this.targetOrigin = this.getTargetCenter()

			this.canvas.width = this.size.w
			this.canvas.height = this.size.h
			this.updatePoints()
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

	const Circle = class {
		constructor(ref, pos, rad, color) {
			this.ref = ref
			this.pos = pos || null
			this.radius = rad || null
			this.color = color || null
		}

		draw = () => {
			if (!this.active) return

			this.ref.ctx.beginPath()
			this.ref.ctx.arc(this.pos.x + this.ref.targetOrigin.x, this.pos.y + this.ref.targetOrigin.y, this.radius, 0, 2 * Math.PI, false)
			this.ref.ctx.fillStyle = `rgba(${this.ref.colordots.r},${this.ref.colordots.g},${this.ref.colordots.b},${this.active})`
			this.ref.ctx.fill()
		}
	}

	backgroundContainer.forEach(bgContainer => {
		const config = getConfigByAtt(bgContainer, attributeId, false)
		// console.log('CONFIG ', config)
		bgContainer.bgWebGL = new BackgroundGL(bgContainer, config)
	})
})
