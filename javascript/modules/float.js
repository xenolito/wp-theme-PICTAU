/**
 * Make any element to move aleatory like floating in place ...
 * Based on Copyright (c) 2024 by Glenn Potter (https://codepen.io/glenn_pot/pen/wvzmYLv)
 * TODO Add shadow (optionally)
 */

import { gsap } from 'gsap'

const Float = class {
	constructor(targetDOMElement, config = {}) {
		const {
			// x = 10,
			// y = 10,
			amplitude = 20,
			delay = 1,
			delay_rotation = [5, 10],
			delay_move = [2, 3],
			rotation = 1,
			running = true,
		} = config

		this.target = targetDOMElement
		this.isDOMElement = this.target instanceof HTMLElement

		if (!this.isDOMElement) return

		this.randomX = this.random(1, amplitude)
		this.randomY = this.random(1, amplitude)
		this.randomDelay = this.random(0, delay)
		this.randomTime = this.random(delay_move[0], delay_move[1])
		this.randomTime2 = this.random(delay_rotation[0], delay_rotation[1])
		this.randomAngle = this.random(rotation * -1, rotation)
		this.running = running

		this.init()
	}

	init = () => {
		gsap.set(this.target, {
			x: this.randomX(-1),
			y: this.randomX(1),
			rotation: this.randomAngle(-1),
		})

		this.moveX(1)
		this.moveY(-1)
		this.rotate(1)
	}

	play = () => (this.running = true)
	stop = () => (this.running = false)

	rotate = direction => {
		gsap.to(this.target, {
			rotation: () => this.randomAngle(direction),
			duration: () => this.randomTime2(),
			// delay: randomDelay(),
			ease: 'Sine.easeInOut',
			onComplete: direction => this.rotate(direction),
			onCompleteParams: [direction * -1],
		})
	}

	moveX = direction => {
		gsap.to(this.target, {
			x: () => this.randomX(direction),
			duration: () => this.randomTime(),
			ease: 'Sine.easeInOut',
			onComplete: direction => this.moveX(direction),
			onCompleteParams: [direction * -1],
		})
	}

	moveY = direction => {
		gsap.to(this.target, {
			y: () => this.randomY(direction),
			duration: () => this.randomTime(),
			ease: 'Sine.easeInOut',
			onComplete: direction => this.moveY(direction),
			onCompleteParams: [direction * -1],
		})
	}

	random = (min, max) => {
		const delta = max - min
		return (direction = 1) => (min + delta * Math.random()) * direction
	}
}

export { Float }
