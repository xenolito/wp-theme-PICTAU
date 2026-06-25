/**
 * Sticky Section — scroll-driven pinned sections with GSAP scrub timeline.
 * Uses CSS position:sticky (not GSAP pin) to stay compatible with Lenis.
 *
 * Usage (Gutenberg block HTML attributes panel):
 *   data-stickysection                           → activates the module
 *   data-stickysection_scrollduration="400vh"    → scroll space (default: 300vh)
 *   data-stickysection_gap="0.1"                 → pause between layers as fraction of
 *                                                   total timeline (default: 0, no gap).
 *                                                   0.1 = 10 % of scroll per inter-layer gap.
 *
 * Per-layer control (CSS custom properties on each .is-layer):
 *   Timing:
 *     --st-size:            1              slot weight (flex-grow). 2 = double scroll budget.
 *     --st-in:              0.5            fraction of slot for fade-in.
 *     --st-out:             0.5            fraction of slot for fade-out.
 *     --st-gap-after:       (container)    blank scroll after slot. 0 = none.
 *   Animation values (numeric, unitless — passed to GSAP):
 *     --st-initial-scale:   0.92           starting scale of hidden layers.
 *     --st-initial-opacity: 0              starting opacity of hidden layers.
 *     --st-in-scale:        1              fade-in target scale.
 *     --st-in-opacity:      1              fade-in target opacity.
 *     --st-out-scale:       0.95           fade-out target scale.
 *     --st-out-opacity:     0              fade-out target opacity.
 *   Easing (GSAP ease string):
 *     --st-in-ease:         power1.out     ease for fade-in.
 *     --st-out-ease:        power1.inOut   ease for fade-out.
 *   JS stamps data-st-index (1-based) on each layer — use that selector, not :nth-child.
 *   Example: [data-stickysection] .is-layer[data-st-index="1"] { --st-out-scale: 5; --st-out-ease: power3.in; }
 *
 * Add class "is-layer" to child blocks to enable automatic sequential crossfade.
 * Access the timeline externally via element.stickySection.timeline.
 *
 * version: 1.0
 * @license Copyright 2008-2025, Oscar Rey Tajes. All rights reserved.
 * @author: Oscar Rey Tajes, oscar.rey.tajes@gmail.com
 * © @xenolito 2025
 * @requires gsap, gsap/ScrollTrigger, lenis (via smooth_scroll.js)
 */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getConfigByAtt } from './attributesToConfigObj'

try {
	gsap.registerPlugin(ScrollTrigger)
} catch (e) {
	/* already registered */
}

const attributeId = 'stickysection'

const StickySection = class {
	constructor(container, config = {}) {
		const { scrollduration = '300vh', gap = '0', markers = false } = config

		this.container = container
		this.scrollDuration = scrollduration
		this.gap = Math.max(0, Math.min(parseFloat(gap) || 0, 0.5))
		this.markers = markers === 'true' || markers === '1'
		this.stickyScene = null
		this.timeline = null
		this.st = null
		this._resizeOb = null

		this.init()
	}

	init = () => {
		this.wrapChildren()
		this.buildTimeline()
		this.watchResize()
		this.container.classList.add('is-ready')
	}

	wrapChildren = () => {
		// Set scroll space height on the container
		this.container.style.height = this.scrollDuration

		// Wrap all direct children in .sticky-scene
		const children = Array.from(this.container.childNodes)
		const scene = document.createElement('div')
		scene.classList.add('sticky-scene')
		children.forEach(child => scene.appendChild(child))
		this.container.appendChild(scene)
		this.stickyScene = scene
	}

	buildTimeline = () => {
		this.timeline = gsap.timeline({
			scrollTrigger: {
				trigger: this.container,
				start: 'top top',
				end: 'bottom bottom',
				scrub: true,
				pin: false,
				invalidateOnRefresh: true,
				markers: this.markers,
			},
		})

		this.st = ScrollTrigger.getById(this.timeline.scrollTrigger?.vars?.id) ?? this.timeline.scrollTrigger

		const layers = Array.from(this.stickyScene.querySelectorAll('.is-layer'))
		if (layers.length > 1) {
			this.buildLayerAnimation(layers, this.gap)
		}
	}

	buildLayerAnimation = (layers, gap = 0) => {
		const n = layers.length

		// Stamp 1-based index FIRST so CSS [data-st-index] selectors resolve on getComputedStyle
		layers.forEach((layer, i) => layer.setAttribute('data-st-index', i + 1))

		// Per-layer gap after each slot (n-1 values).
		// --st-gap-after overrides the container gap for that specific interval.
		const gaps = layers.slice(0, n - 1).map(layer => {
			const raw = parseFloat(getComputedStyle(layer).getPropertyValue('--st-gap-after').trim())
			return isNaN(raw) ? gap : Math.max(0, Math.min(raw, 0.95))
		})

		// Per-layer slot weights (--st-size, default 1 — like flex-grow).
		const weights = layers.map(layer => {
			const raw = parseFloat(getComputedStyle(layer).getPropertyValue('--st-size').trim())
			return isNaN(raw) || raw <= 0 ? 1 : raw
		})
		const totalWeight = weights.reduce((s, w) => s + w, 0)
		const totalGap = gaps.reduce((s, g) => s + g, 0)
		const scrollSpace = 1 - totalGap

		// Per-layer slot sizes (proportional to weight)
		const slotSizes = weights.map(w => scrollSpace * (w / totalWeight))

		// Cumulative slot start positions
		const segStarts = []
		let cursor = 0
		layers.forEach((_, i) => {
			segStarts.push(cursor)
			if (i < n - 1) cursor += slotSizes[i] + gaps[i]
		})

		layers.forEach((layer, i) => {
			const segStart = segStarts[i]
			const segSize = slotSizes[i]

			const cs = getComputedStyle(layer)
			const num = (prop, def) => {
				const v = parseFloat(cs.getPropertyValue(prop).trim())
				return isNaN(v) ? def : v
			}

			const inFrac = Math.min(1, Math.max(0, num('--st-in', 0.5)))
			const outFrac = Math.min(1, Math.max(0, num('--st-out', 0.5)))
			const inDur = segSize * inFrac
			const outDur = segSize * outFrac

			const str = prop => cs.getPropertyValue(prop).trim()
			const inEase = str('--st-in-ease') || 'power1.out'
			const outEase = str('--st-out-ease') || 'power1.inOut'

			const isFirst = i === 0
			const isLast = i === n - 1

			if (!isFirst) {
				gsap.set(layer, {
					opacity: num('--st-initial-opacity', 0),
					scale: num('--st-initial-scale', 0.92),
				})

				this.timeline.to(
					layer,
					{
						opacity: num('--st-in-opacity', 1),
						scale: num('--st-in-scale', 1),
						ease: inEase,
						duration: inDur,
					},
					segStart
				)
			}

			if (!isLast) {
				const afterIn = isFirst ? segStart : segStart + inDur
				const fadeOutStart = Math.max(afterIn, segStart + segSize - outDur)
				this.timeline.to(
					layer,
					{
						opacity: num('--st-out-opacity', 0),
						scale: num('--st-out-scale', 0.95),
						ease: outEase,
						duration: outDur,
					},
					fadeOutStart
				)
			}
		})

		this.timeline.to({ _: 0 }, { _: 0, duration: 0 }, 1)
	}

	watchResize = () => {
		this._resizeOb = new ResizeObserver(() => {
			try {
				ScrollTrigger.refresh()
			} catch (e) {
				/* noop */
			}
		})
		this._resizeOb.observe(this.container)
	}

	destroy = () => {
		try {
			if (this.timeline) {
				this.timeline.kill()
				this.timeline = null
			}
			if (this._resizeOb) {
				this._resizeOb.disconnect()
				this._resizeOb = null
			}
			// Unwrap sticky-scene: move children back to container
			if (this.stickyScene) {
				Array.from(this.stickyScene.childNodes).forEach(child => this.container.appendChild(child))
				this.stickyScene.remove()
				this.stickyScene = null
			}
			this.container.style.removeProperty('height')
			this.container.classList.remove('is-ready')
			ScrollTrigger.refresh()
		} catch (err) {
			console.warn('⛔️ stickysection: destroy error', err)
		} finally {
			try {
				delete this.container.stickySection
			} catch (e) {
				this.container.stickySection = undefined
			}
		}
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const containers = document.querySelectorAll(`[data-${attributeId}]`)
	if (!containers.length) return

	containers.forEach(container => {
		const config = getConfigByAtt(container, attributeId)
		container.stickySection = new StickySection(container, config)
	})
})
