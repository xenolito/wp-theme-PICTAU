/**
 * Author: Oscar Rey @xenolito
 * !Notice: Make sure any content inside <a> tag has a css style set to pointer-events: none;
 * [data-mouse_pointer] {
 *  a > * {
 *   pointer-events: none;
 *  }
 * }
 */

import { gsap } from 'gsap'
// import { Flip } from 'gsap/Flip'
import isTouch from './isTouchDevice'

const lerp = (a, b, n) => (1 - n) * a + n * b
// gsap.registerPlugin(Flip)

class Cursor {
	constructor(cursorContainer) {
		this.container = cursorContainer
		this.pointer = this.container.querySelector('.cursor')
		this.target = { x: 0.5, y: 0.5 }
		this.cursor = { x: 0.5, y: 0.5 }
		this.speed = 0.2

		if (!this.pointer) {
			console.log(`⛔️ No custom pointer found for ${this.container.classList}`)
			return
		}

		this.setup()
	}

	setup() {
		this.container.addEventListener('mouseenter', e => {
			this.controller = new AbortController()
			this.pointer.classList.add('active')
			this.init(e)
		})

		this.container.addEventListener('mouseleave', e => {
			this.pointer.classList.remove('active')
			this.stop()
		})
	}

	bindAll() {
		;['onMouseMove', 'render'].forEach(fn => (this[fn] = this[fn].bind(this)))
	}

	getCursorPos(e) {
		return {
			x: (e.clientX / window.innerWidth).toFixed(4),
			y: (e.clientY / window.innerHeight).toFixed(4),
		}
	}

	onMouseMove(e) {
		//get normalized mouse coordinates [0, 1]
		this.target.x = this.getCursorPos(e).x
		this.target.y = this.getCursorPos(e).y

		// console.log(this.getCursorPos(e).x)

		// hovered a link
		if ((window.getComputedStyle(e.target)['cursor'] !== 'none' || e.target.style.cursor === 'inherit') && !window.pItoHide) {
			if (this.hovering) {
				return
			}
			this.hovering = true
			this.pointer.classList.add('hovering')
			e.target.style.cursor = 'inherit'
		} else {
			if (!this.hovering) return
			this.pointer.classList.remove('hovering')
			this.hovering = false
		}

		// trigger loop if no loop is active
		if (!this.raf) this.raf = requestAnimationFrame(this.render)
	}

	render() {
		//calculate lerped values
		// this.cursor.x = lerp(this.cursor.x, this.target.x, this.speed)
		// this.cursor.y = lerp(this.cursor.y, this.target.y, this.speed)

		this.cursor.x = this.target.x
		this.cursor.y = this.target.y

		document.documentElement.style.setProperty('--cursor-x', this.cursor.x)
		document.documentElement.style.setProperty('--cursor-y', this.cursor.y)
		//cancel loop if mouse stops moving
		// const delta = Math.sqrt(Math.pow(this.target.x - this.cursor.x, 2) + Math.pow(this.target.y - this.cursor.y, 2))
		// if (delta < 0.001) {
		// 	cancelAnimationFrame(this.raf)
		// 	this.raf = null
		// 	return
		// }
		//or continue looping if mouse is moving
		this.raf = requestAnimationFrame(this.render)
	}

	init(e) {
		this.bindAll()
		this.container.style.cursor = 'none'
		window.addEventListener('mousemove', this.onMouseMove, { signal: this.controller.signal })

		// this.container.addEventListener('mousedown', e => {
		// 	console.log('mosueDown', e)
		// })

		if (e) {
			this.target.x = this.getCursorPos(e).x
			this.target.y = this.getCursorPos(e).y
		}

		this.render()
		this.raf = requestAnimationFrame(this.render)
	}

	stop() {
		this.container.style.cursor = 'inherit'
		window.removeEventListener('mousemove', this.onMouseMove)
		window.removeEventListener('dragover', this.onMouseMove)
		this.raf = null
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const mousePoitners = document.querySelectorAll('[data-mouse_pointer]')
	// if (!mousePoitners.length || isTouch()) return
	if (!mousePoitners.length) return

	mousePoitners.forEach(el => {
		el.cursor = new Cursor(el)
		// let xSetter, ySetter, xTo, yTo, controller
		// gsap.set(el, { cursor: 'none' })
	})
})
