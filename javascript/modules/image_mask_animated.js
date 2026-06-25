/**
 * Image Mask Animated
 * Organic blob mask with animated concentric ring strokes over images.
 * Blob shape is generated parametrically each frame via gsap.ticker — no MorphSVG needed.
 * version: 1.0
 * @license Copyright 2008-2025, Oscar Rey Tajes. All rights reserved.
 * @author: Oscar Rey Tajes, oscar.rey.tajes@gmail.com
 * © @xenolito 2025
 * @requires gsap
 *
 * Usage:
 *   <div data-animask>
 *     <picture><img src="..."></picture>
 *   </div>
 *
 * Optional data attributes (use underscore separator after "animask"):
 *   data-animask_points="8"          — number of blob anchor points (3–20)
 *   data-animask_intensity="0.12"    — inward perturbation depth as fraction of base radius — blob never exceeds the image boundary
 *   data-animask_speed="1"           — animation speed (seconds⁻¹ multiplier)
 *   data-animask_gap="20"            — gap in px between ring1 outer edge and ring2 inner edge
 *   data-animask_ringcolor="#fff"    — sets stroke color for both rings (overrides ring1color and ring2color)
 *   data-animask_ringopacity="0.85"  — sets stroke opacity for both rings (overrides ring1opacity and ring2opacity)
 *   data-animask_ring1width="12"     — inner ring stroke width in px
 *   data-animask_ring1color="#fff"   — inner ring stroke color
 *   data-animask_ring1opacity="0.85" — inner ring opacity (0–1)
 *   data-animask_ring2width="2"      — outer ring stroke width in px
 *   data-animask_ring2color="#fff"   — outer ring stroke color
 *   data-animask_ring2opacity="0.5"  — outer ring opacity (0–1)
 */

import { getConfigByAtt } from './attributesToConfigObj'
import { gsap } from 'gsap'

document.addEventListener('DOMContentLoaded', () => {
	const attributeId = 'animask'
	const containers  = document.querySelectorAll(`[data-${attributeId}]`)
	if (!containers.length) return

	let uid = 0

	const ImageMask = class {
		constructor(container, config = {}) {
			const {
				points       = '8',
				intensity    = '0.12',
				speed        = '1',
				gap          = '20',
				ringcolor    = null,
				ringopacity  = null,
				ring1width   = '12',
				ring1color   = null,
				ring1opacity = null,
				ring2width   = '2',
				ring2color   = null,
				ring2opacity = null,
			} = config

			this.container    = container
			this.n            = Math.max(3, Math.min(20, parseInt(points)    || 8))
			this.intensity    = parseFloat(intensity)    || 0.12
			this.speed        = parseFloat(speed)        || 1
			this.gap          = parseFloat(gap)          || 20
			this.ring1Width   = parseFloat(ring1width)   || 12
			this.ring1Color   = ring1color  || ringcolor  || '#ffffff'
			this.ring1Opacity = parseFloat(ring1opacity  || ringopacity  || '0.85') || 0.85
			this.ring2Width   = parseFloat(ring2width)   || 2
			this.ring2Color   = ring2color  || ringcolor  || '#ffffff'
			this.ring2Opacity = parseFloat(ring2opacity  || ringopacity  || '0.85') || 0.85

			this.id         = `animask-${++uid}`
			// Random time offset per instance so multiple blobs on the same page don't sync
			this.timeOffset = Math.random() * 100
			// Per-point phase offsets spread over two full cycles for variety
			this.phases     = Array.from({ length: this.n }, (_, i) => (i / this.n) * Math.PI * 4)
			// Per-point amplitude multipliers (0–1) so each point has a different max displacement
			this.amplitudes = Array.from({ length: this.n }, () => Math.random())
			this.active     = false
			this.cx = this.cy = this.baseR = 0

			this.tick    = this.tick.bind(this)
			this.measure = this.measure.bind(this)

			this.init()
		}

		init = () => {
			this.img = this.container.querySelector('img')
			if (!this.img) {
				console.warn('⛔️ animask: no <img> found in [data-animask]')
				return
			}

			this.img.style.display        = 'block'
			this.container.style.position = 'relative'
			// Safety net: reveal unconditionally after 3s in case measure never gets valid dimensions
			this.revealTimer = setTimeout(() => this.reveal(), 3000)

			const imgWrapper = this.container.querySelector('picture') ?? this.container.querySelector('figure')
			if (imgWrapper) {
				imgWrapper.style.userSelect    = 'none'
				imgWrapper.style.pointerEvents = 'none'
			}

			this.setupSVG()
			this.setupResizeObserver()
			this.setupIntersectionObserver()

			// Measure once image dimensions are available
			if (this.img.complete && this.img.naturalWidth > 0) {
				requestAnimationFrame(this.measure)
			} else {
				this.img.addEventListener('load',  () => requestAnimationFrame(this.measure), { once: true })
				this.img.addEventListener('error', () => requestAnimationFrame(this.measure), { once: true })
			}
			// Fallback: final measure after full page load catches any layout shifts
			window.addEventListener('load', this.measure, { once: true })
		}

		setupSVG = () => {
			const ns  = 'http://www.w3.org/2000/svg'
			const svg = document.createElementNS(ns, 'svg')
			svg.classList.add('animask-svg')
			svg.setAttribute('aria-hidden', 'true')
			Object.assign(svg.style, {
				position:      'absolute',
				overflow:      'visible',
				pointerEvents: 'none',
			})

			// <defs> → <clipPath> applied to the <img> via CSS clip-path: url(#id)
			const defs = document.createElementNS(ns, 'defs')
			const cpEl = document.createElementNS(ns, 'clipPath')
			cpEl.id    = `${this.id}-clip`
			this.clipShape = document.createElementNS(ns, 'path')
			cpEl.appendChild(this.clipShape)
			defs.appendChild(cpEl)
			svg.appendChild(defs)

			// Two ring <path> elements rendered outside the clip boundary (SVG overflow:visible)
			this.ringEls = [
				{ color: this.ring1Color, width: this.ring1Width, opacity: this.ring1Opacity },
				{ color: this.ring2Color, width: this.ring2Width, opacity: this.ring2Opacity },
			].map(({ color, width, opacity }) => {
				const path = document.createElementNS(ns, 'path')
				path.setAttribute('fill',           'none')
				path.setAttribute('stroke',         color)
				path.setAttribute('stroke-width',   width)
				path.setAttribute('stroke-opacity', opacity)
				svg.appendChild(path)
				return path
			})

			// Append after any existing children so SVG renders on top of the image
			this.container.appendChild(svg)
			this.svg = svg

			// Apply clip-path to the image element
			this.img.style.clipPath       = `url(#${this.id}-clip)`
			this.img.style.webkitClipPath = `url(#${this.id}-clip)`
		}

		// Positions the SVG exactly over the <img> regardless of its layout within the container
		measure = () => {
			const cRect = this.container.getBoundingClientRect()
			const iRect = this.img.getBoundingClientRect()
			if (!iRect.width) return

			const w = iRect.width
			const h = iRect.height
			const t = iRect.top  - cRect.top
			const l = iRect.left - cRect.left

			Object.assign(this.svg.style, {
				top:    `${t}px`,
				left:   `${l}px`,
				width:  `${w}px`,
				height: `${h}px`,
			})
			this.svg.setAttribute('viewBox', `0 0 ${w} ${h}`)

			this.cx    = w / 2
			this.cy    = h / 2
			// 0.88 leaves a small visual margin from the image edges
			this.baseR = Math.min(w, h) / 2 * 0.88

			this.render(this.timeOffset)
			this.reveal()
		}

		reveal = () => {
			clearTimeout(this.revealTimer)
			this.container.style.visibility = 'visible'
		}

		// Generate N blob points at radius r, perturbed by per-point sine waves
		blobPts = (r, t) => {
			const { n, intensity, baseR, speed, phases, amplitudes, cx, cy } = this
			return Array.from({ length: n }, (_, i) => {
				const angle = (i / n) * Math.PI * 2 - Math.PI / 2
				const delta = -(intensity * baseR * amplitudes[i]) * (1 + Math.sin(t * speed + phases[i])) / 2
				const ri    = r + delta
				return { x: cx + ri * Math.cos(angle), y: cy + ri * Math.sin(angle) }
			})
		}

		// Catmull-Rom → cubic Bézier conversion for a closed smooth curve
		toPath = pts => {
			const len = pts.length
			const k   = 1 / 6

			const c1x = i => pts[i].x + (pts[(i + 1) % len].x - pts[(i - 1 + len) % len].x) * k
			const c1y = i => pts[i].y + (pts[(i + 1) % len].y - pts[(i - 1 + len) % len].y) * k
			const c2x = i => pts[(i + 1) % len].x - (pts[(i + 2) % len].x - pts[i].x) * k
			const c2y = i => pts[(i + 1) % len].y - (pts[(i + 2) % len].y - pts[i].y) * k

			let d = `M${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`
			for (let i = 0; i < len; i++) {
				const nx = pts[(i + 1) % len]
				d += ` C${c1x(i).toFixed(2)} ${c1y(i).toFixed(2)} ${c2x(i).toFixed(2)} ${c2y(i).toFixed(2)} ${nx.x.toFixed(2)} ${nx.y.toFixed(2)}`
			}
			return d + 'Z'
		}

		// Update all three SVG paths for the current time value
		render = t => {
			if (!this.baseR) return
			const { ring1Width, ring2Width, gap, baseR } = this

			// Clip at baseR — inner edge of ring1 starts here
			this.clipShape.setAttribute('d', this.toPath(this.blobPts(baseR, t)))
			// Ring1 centered at baseR + ring1Width/2 → spans [baseR, baseR + ring1Width]
			this.ringEls[0].setAttribute('d', this.toPath(this.blobPts(baseR + ring1Width / 2, t)))
			// Ring2 centered after the gap → spans [baseR + ring1Width + gap, … + ring2Width]
			this.ringEls[1].setAttribute('d', this.toPath(this.blobPts(baseR + ring1Width + gap + ring2Width / 2, t)))
		}

		// gsap.ticker callback receives absolute time in seconds
		tick = time => this.render(time + this.timeOffset)

		setupResizeObserver = () => {
			this.ro = new ResizeObserver(this.measure)
			this.ro.observe(this.container)
		}

		setupIntersectionObserver = () => {
			this.io = new IntersectionObserver(([entry]) => {
				if (entry.isIntersecting && !this.active) {
					gsap.ticker.add(this.tick)
					this.active = true
				} else if (!entry.isIntersecting && this.active) {
					gsap.ticker.remove(this.tick)
					this.active = false
				}
			}, { threshold: 0.1 })
			this.io.observe(this.container)
		}

		destroy = () => {
			gsap.ticker.remove(this.tick)
			this.ro?.disconnect()
			this.io?.disconnect()
			if (this.img) {
				this.img.style.clipPath       = ''
				this.img.style.webkitClipPath = ''
			}
			this.svg?.remove()
		}
	}

	containers.forEach(container => {
		const config = getConfigByAtt(container, attributeId, false)
		container.imageMask = new ImageMask(container, config)
	})
})
