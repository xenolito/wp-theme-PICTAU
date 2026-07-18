/**
 * Animation any for WP based on GSAP
 * version: 4.15.2
 *
 * ? changelog:
 * ? v4.15.2 — Changed cyclecontentinline's data-anim_any_holdtime default from 1.5 to 2.
 * ? v4.15.1 — Fixed cyclecontentinline's typewriter "backspace" exit: chars faded out over `duration` while the cursor jumped to its final (post-deletion) position right at onStart, so the cursor visually got ahead of a char that was still mid-fade. Chars now disappear instantly (gsap.set, no fade) on exit, with the cursor moved in that same onComplete — entrance (fade-in) is unchanged, only the backspace side was affected.
 * ? v4.15.0 — Added cyclecontentinline animation: a sibling of cyclecontent for inline text cycles that follow other static text on the same line (e.g. "Qlik <cycling phrase>"). Container stacks via display:inline-grid (same no-layout-shift grid trick), and each phrase's enter/exit is split per data-anim_any_whattoanim (words/chars, no lines) instead of animating the whole child at once. data-anim_any_holdtime replaces stagger's block-cyclecontent meaning here, since stagger reclaims its standard "time between split elements" meaning. Also added typewriter, a new standalone animation (data-anim_any_animation="typewriter") that reveals chars sequentially with a blinking cursor (data-anim_any_cursorchar / data-anim_any_cursorblink), reusable both on its own and as data-anim_any_cyclecontentanim="typewriter" inside cyclecontentinline (renders as a "backspace" effect on exit).
 * ? v4.14.1 — Fixed cyclecontent never pausing when scrolled out of view: it relied solely on the default ScrollTrigger toggleAction ("play" on enter), so once started its repeat:-1 nested loop kept animating forever in the background regardless of scroll position. Added explicit onLeave (pause) / onEnterBack (play) handlers, and made onLeaveBack pause(0) (repeat=true) or pause() (repeat=false) instead of the generic progress(0.7)+reverse() hack, which isn't meaningful for an infinite timeline.
 * ? v4.14.0 — Added data-anim_any_cyclecontentrandom: any non-empty value ('1', 'true', anything) shuffles the cycling order of cyclecontent's children once at setup (Fisher-Yates), instead of following DOM order.
 * ? v4.13.1 — Fixed cyclecontent transform-origin going stale on resize: it was measured once when the animation was set up, so a viewport resize afterwards (e.g. a long child rewrapping to more lines on mobile) left the pivot point pointing at its old, no-longer-correct position. Now recalculated in each tween's onStart (entrance + every loop exit/enter), so it always reflects the current layout — no resize listener or matchMedia needed since it self-corrects on every cycle.
 * ? v4.13.0 — Reworked cyclecontent transform-origin fix (superseding v4.12.2's justifySelf/width:auto approach, which fought WP/Tailwind's constrained-layout CSS — width:100% *and* a max-width var on direct children — and still ended up centering items regardless of justify-self). Each child now keeps its own natural size/alignment (whatever text-align or layout it already had) untouched; instead, getCycleContentOrigin() measures the child's actually-rendered content via a DOM Range and sets transform-origin to its measured center in px. Works regardless of alignment or content type (text, a div with arbitrary content, etc).
 * ? v4.12.2 — Fixed cyclecontent transform-origin: grid items stretch to fill the shared cell by default, so a left-aligned short child's visual center didn't match its box's 50%/50% transform-origin (scale/rotate presets like zoomBounce looked off-center). Added justifySelf/alignSelf 'start' plus an explicit width:'auto' override (WP/Tailwind's constrained-layout CSS forces width:100% on direct children regardless of justifySelf) so each child shrinks to its own natural size within the cell.
 * ? v4.12.1 — Fixed cyclecontent double-reveal: the one-time entrance tween for the first child was inside the same timeline as `repeat(-1)`, so every loop iteration re-fired it right after the loop's own last step had already brought that child back, causing two near-instant reveals instead of respecting the stagger hold. Moved the infinite loop into its own nested timeline so the entrance tween never repeats.
 * ? v4.12.0 — Added cyclecontent animation: cycles a target's direct children one at a time in an infinite loop, all stacked at the same grid cell (no layout shift regardless of each child's height). Reuses another anim_any animation's from/to/ease as the enter/exit transition via data-anim_any_cyclecontentanim (default 'reveal'). data-anim_any_stagger is repurposed here as the hold time each child stays fully visible.
 * ? v4.11.0 — Added reveal animation: opacity-only fade-in (no transform) per char/word/line, same split-by-whattoanim pattern as clippedFromBottom.
 * ? v4.10.0 — Added zoomBounce animation: per-word zoom-in with a mild elastic bounce (opacity/scale split into two aligned tweens so opacity doesn't oscillate with the elastic ease). Inline param sets the starting scale, e.g. 'zoomBounce,0.35'.
 * ? v4.9.3 — Fixed repeat not working at all: `repeat` was destructured from config in the constructor but never assigned to `this.repeat`, so the `onLeaveBack` check (`if (this.repeat)`) always read `undefined` and animations never reversed on scrolling back up past the trigger, regardless of the data-anim_any_repeat value. This was the root cause of the TODO below, which is now resolved and removed.
 * ? v4.9.2 — Fixed nextanim timing: chained targets (no explicit data-anim_any_delay) now get delay=0 in pre-pass, so nextAnimDelay controls the visual overlap directly without the default 0.33s shifting the start. Explicit delay attributes are preserved. Also improved absolutePos fallback from tlDuration to Math.max(0.001, rawPos) to maximise overlap on very short animations.
 * ? v4.9.1 — Fixed nextanim callback not firing when animation duration <= |nextAnimDelay|: position clamped to tlDuration instead of t=0 (GSAP skips callbacks at t=0 on play())
 * ? v4.9.0 — Added nextanim param: chain an element's animation after this one fires ('.selector' or '.selector,-0.5' to start 0.5s before end)
 * ? v4.8.1 — Added callback function after animation complete (must exist at window scope)
 * ? Added matchmedia param: disable animation if query doesn't match (e.g. "min-width: 1024px")
 * ? Added zoomIn and rotateX animations from v3.1
 * ? Added chainanim param from v3.1
 * ? Merged animation_any_V1.js (v4.8.1) as single canonical file
 * ? setClippedFromBottom: replaced clipPath polygon with clip-path inset(-0.4em 0 0 0) for diacritic-safe masking
 *
 * © @xenolito 2026
 *
 */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'
import SplitType from 'split-type'
import { getConfigByAtt } from './attributesToConfigObj'

gsap.registerPlugin(ScrollTrigger)
gsap.registerPlugin(CustomEase)

/**
 * /**
 * AnimationAny for WordPress 1.0.1
 * https://pictau.com
 *
 * @license Copyright 2008-2024, Oscar Rey Tajes. All rights reserved.
 * @author: Oscar Rey Tajes, oscar.rey.tajes@gmail.com
 *
 * available animations for data-anim-header attribute: data-anim-any"
 * 			'blurIn' --> Random start blur in each char / word
 * 			'clippedFromBottom'	--> clipped slide from bottom in each char / word
 *    	'slideFromBottom' (default)		--> slide from botton in each char / word / line
 * 			'slideFromLeft'			--> slide from left in each char / word
 * 			'slideFromTop'			--> slide from Top in each char / word
 * 			'slideFromRight'		--> slide from Right in each char / word
 * 			'zoomIn'				--> zoom in from scale. param: 'zoomIn,1.2' (default scale 1.2)
 * 			'rotateX'				--> rotate from X axis. params: 'rotateX,90' or 'rotateX,90,bottom'
 * 			'zoomBounce'			--> zoom in per char / word with a mild elastic bounce. param: 'zoomBounce,0.35' (default start scale 0.35)
 * 			'reveal'				--> opacity-only fade in per char / word / line, no transform
 * 			'cyclecontent'			--> cycles the target's direct children (e.g. several h2), one at a time in an infinite loop, all stacked at the same position (CSS grid). param via data-anim_any_cyclecontentanim: name of another anim_any animation reused as the enter/exit transition (default 'reveal'). data-anim_any_cyclecontentrandom: any non-empty value randomizes the cycling order (shuffled once at setup)
 * 			'cyclecontentinline'	--> like cyclecontent, but for inline text cycles (display:inline-grid) split per word/char via data-anim_any_whattoanim, so it can follow other static text on the same line. Same data-anim_any_cyclecontentanim/cyclecontentrandom as cyclecontent; data-anim_any_holdtime sets the time each phrase stays visible (stagger here means time between words/chars, its standard meaning)
 * 			'typewriter'			--> reveals chars one by one with a blinking cursor. params: data-anim_any_cursorchar (cursor character, default '|'), data-anim_any_cursorblink (blink half-cycle seconds, default 0.5). Also usable as data-anim_any_cyclecontentanim="typewriter" inside cyclecontentinline
 *TODO 	'blurOut' 				--> Random start blur out each char / word
 */

const hyphenToCamelcase = str => {
	return str.replace(/-([a-z])/g, k => k[1].toUpperCase())
}

const getRandom = (min, max) => {
	return Math.random() * (max - min) + min
}

const shuffle = arr => {
	const shuffled = arr.slice()
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
	}
	return shuffled
}

document.addEventListener('DOMContentLoaded', () => {
	const attributeId = 'anim_any'
	const headerToAnim = document.querySelectorAll(`[data-${attributeId}]`)

	if (!headerToAnim.length) return

	const HeaderAnimation = class {
		constructor(targetDOMElement, config = {}) {
			const {
				animation = 'slideFromBottom',
				repeat = true,
				whattoanim = 'self',
				delay = 0.33,
				duration = 1.5,
				stagger = 0.1,
				autoplay = true,
				triggerstart = null,
				markers = false,
				chainanim = false,
				nextanim = false, // next animation to play after this one: '.selector' or '.selector, 1.5' where 1.5 is seconds to wait after completion
				callback = false, // callback function to call after animation complete
				slideamount = 100,
				scalestart = 3, // blurIn: initial scale per character before animating to 1
				matchmedia = false, // disable animation if matchmedia query does not match (e.g. "min-width: 1024px")
				cyclecontentanim = 'reveal', // cyclecontent/cyclecontentinline: name of the anim_any animation to reuse for each item's enter/exit
				cyclecontentrandom = false, // cyclecontent/cyclecontentinline: any non-empty value ('1', 'true', anything) randomizes the cycling order
				holdtime = 2, // cyclecontentinline: time each phrase stays fully visible before exiting
				cursorchar = '|', // typewriter: character used as the blinking cursor
				cursorblink = 0.5, // typewriter: seconds per blink half-cycle
				log = false,
			} = config

			const [animationName, animParam, originParam] = animation.split(',').map(s => s.trim())

			this.header = targetDOMElement
			this.whattoanim = whattoanim
			this.animation = animationName
			if (this.animation === 'blurIn' && this.whattoanim === 'self') {
				this.whattoanim = 'chars'
			}
			if (this.animation === 'zoomBounce' && this.whattoanim === 'self') {
				this.whattoanim = 'words'
			}
			if (this.animation === 'typewriter') {
				this.whattoanim = 'chars'
			}
			this.markers = markers === 'true' || markers === '1' ? true : false
			this.slideamount = slideamount
			this.log = log === 'true' || log === '1' ? true : false
			this.delay = Number(delay)
			this.duration = Number(duration)
			this.autoplay = Number(autoplay)
			this.repeat = repeat === 'false' ? false : Boolean(repeat)
			this.stagger = stagger
			this.scaleStart = Number(scalestart)
			this.zoomStartScale = animParam !== undefined ? Number(animParam) : 1.2
			this.rotateXStartAngle = animParam !== undefined ? Number(animParam) : 90
			this.zoomBounceStartScale = animParam !== undefined ? Number(animParam) : 0.35
			this.rotateXOriginY = originParam === 'bottom' ? '100%' : '0%'
			this.cycleContentAnim = cyclecontentanim
			this.cycleContentRandom = Boolean(cyclecontentrandom)
			this.holdTime = Number(holdtime)
			this.cursorChar = cursorchar
			this.cursorBlink = Number(cursorblink)
			this.chainanim = chainanim
			this.matchmedia = matchmedia ?? false

			if (this.matchmedia) this.mquery = window.matchMedia(`(${this.matchmedia})`)

			this.nextanim = nextanim
			this.callback = callback

			this.triggerstart = !triggerstart ? `${this.animation === 'slideFromBottom' && this.whattoanim === 'self' ? `top-=${this.slideamount}` : 'top'} bottom-=18%` : `top ${triggerstart}`

			if (!this.matchmedia || (this.mquery && this.mquery.matches)) {
				this.setupAnimation()
			} else {
				return
			}
		}

		play = () => {
			if (!this.matchmedia || (this.mquery && this.mquery.matches)) {
				this.timeLine.play()
			} else return
		}

		setupAnimation = () => {
			this.timeLine = gsap.timeline({
				paused: !this.autoplay,
			})

			if (this.nextanim) {
				const parts = this.nextanim.split(',')
				const selector = parts[0].trim()
				this.nextAnimDelay = parts[1] ? Number(parts[1].trim()) : -1.5
				this.nextToAnimate = document.querySelector(selector)
			}

			if (this.callback) {
				const [callbackFunc, callbackDelay = 0] = this.callback.split(',')
				this.callbackFunc = callbackFunc
				this.callbackDelay = Number(callbackDelay)

				this.timeLine.eventCallback('onComplete', () => {
					if (window[this.callbackFunc] === undefined) {
						console.warn(`Callback function "${this.callbackFunc}" does not exist in the global scope (window). Please ensure it is defined before using it in the animation.`)
						return
					}
					setTimeout(() => {
						window[this.callbackFunc]()
					}, this.callbackDelay)
				})
			}

			if (this.chainanim) {
				this.setupChainedAnimations()
			}

			// if this element animation is chained to a previous one via chainanim
			if (this.header.animChainedTo) {
				this.chainedTo = this.header.animChainedTo.headerAnimation
				this.chainedTo.masterTimeLine.add(this.timeLine, '>-70%')
			}

			if (this.markers) console.log(this.triggerstart)

			if (this.autoplay && !this.chainedTo) {
				// cyclecontent es un timeline infinito (repeat:-1 anidado): el truco
				// progress(0.7)+reverse() de más abajo asume una animación de duración
				// finita y no tiene un resultado sensato aquí (progress() sobre un
				// timeline con un hijo infinito no representa una fracción útil). Por
				// eso, para cyclecontent, se controla con play()/pause() directos en
				// vez de dejar que el toggleAction por defecto ("play" en onEnter) sea
				// lo único que lo toque: si no, seguiría animando en bucle para
				// siempre aunque el usuario haya hecho scroll mucho más abajo.
				const isCycleContent = this.animation === 'cyclecontent' || this.animation === 'cyclecontentinline'

				this.trigger = ScrollTrigger.create({
					trigger: this.header,
					start: this.triggerstart,
					end: 'top top',
					animation: this.masterTimeLine ? this.masterTimeLine : this.timeLine,
					onLeave: isCycleContent ? () => this.timeLine.pause() : undefined,
					onEnterBack: isCycleContent ? () => this.timeLine.play() : undefined,
					onLeaveBack: st => {
						if (isCycleContent) {
							// repeat=true: vuelve al estado inicial (oculto), lista para
							// repetirse si se vuelve a entrar. repeat=false: se queda
							// congelada donde esté, igual que el resto de animaciones.
							this.repeat ? this.timeLine.pause(0) : this.timeLine.pause()
							return
						}
						if (this.repeat) {
							st.animation.progress(0.7) //! Check and test this...
							st.animation.reverse()
						}
					},
					markers: this.markers,
				})
			}

			//! Setup the chosen animation
			this.animation === 'blurIn' && this.setBlurInAnimation()
			this.animation === 'clippedFromBottom' && this.setClippedFromBottom()
			this.animation === 'clippedFromLeft' && this.setClippedFromLeft()
			this.animation === 'clippedFromTop' && this.setClippedFromTop()
			this.animation === 'slideFromBottom' && this.setSlideTo('up')
			this.animation === 'slideFromTop' && this.setSlideTo('down')
			this.animation === 'slideFromLeft' && this.setSlideTo('right')
			this.animation === 'slideFromRight' && this.setSlideTo('left')
			this.animation === 'zoomIn' && this.setZoomInAnimation()
			this.animation === 'rotateX' && this.setRotateXAnimation()
			this.animation === 'zoomBounce' && this.setZoomBounceWords()
			this.animation === 'reveal' && this.setReveal()
			this.animation === 'cyclecontent' && this.setCycleContent()
			this.animation === 'cyclecontentinline' && this.setCycleContentInline()
			this.animation === 'typewriter' && this.setTypewriter()

			// Add nextanim call after tweens so ">" resolves to the end of the last tween
			if (this.nextanim && this.nextToAnimate) {
				const tlDuration = this.timeLine.duration()
				const rawPos = tlDuration + this.nextAnimDelay
				// GSAP won't fire callbacks at t=0 (playhead starts there). For animations
				// too short to honour the full offset, fire as early as possible instead of
				// falling back to the end of the timeline (which would start the target late).
				const absolutePos = Math.max(0.001, rawPos)
				this.timeLine.call(
					() => {
						this.nextToAnimate.headerAnimation?.play()
					},
					[],
					absolutePos
				)
			}
		}

		setupChainedAnimations = () => {
			const chainedAnimations = Array.from(this.chainanim.split(','))

			chainedAnimations.forEach(targetEl => {
				let elementAnimToChain = this.header.parentElement.parentElement.querySelector(targetEl)
				if (elementAnimToChain) this.chainElementAnimation(elementAnimToChain)
			})

			this.masterTimeLine = gsap.timeline({
				paused: true,
			})
			this.masterTimeLine.add(this.timeLine)
		}

		chainElementAnimation = elementWithAnimation => {
			elementWithAnimation.animChainedTo = this.header
		}

		setSlideTo = dir => {
			const startPosition = {
				x: dir === 'left' ? this.slideamount : dir === 'right' ? this.slideamount * -1 : 0,
				y: dir === 'up' ? this.slideamount : dir === 'down' ? this.slideamount * -1 : 0,
			}

			if (this.whattoanim !== 'self') {
				this.typeSplit = new SplitType(this.header, {
					tagName: 'span',
				})

				if (this.header.hasAttribute('data-dot_pulsing')) {
					this.typeSplit.chars.push(this.addDotPulsing(this.typeSplit))
				}
			}

			let elementsToAnim = this.whattoanim !== 'self' ? this.typeSplit[this.whattoanim] : this.header
			gsap.set(this.header, { opacity: 1 })

			if (this.whattoanim !== 'self') {
				this.typeSplit.lines.forEach(line => {
					line.style.clipPath = `polygon(0 -10px, 100% -10px, 100% 100%, 0% 100%)`
					line.style.userSelect = 'none'
				})
			}

			gsap.set(elementsToAnim, {
				pointerEvents: 'none',
			})

			this.timeLine.fromTo(
				elementsToAnim,
				{
					y: () => startPosition.y,
					x: () => startPosition.x,
					opacity: 0,
					pointerEvents: 'none',
				},
				{
					y: 0,
					x: 0,
					opacity: 1,
					pointerEvents: 'all',
					duration: this.duration,
					delay: this.delay,
					stagger: this.stagger,
					ease: 'power4.out',
				}
			)
		}

		setClippedFromBottom = () => {
			this.typeSplit = new SplitType(this.header, {
				tagName: 'span',
			})

			if (this.header.hasAttribute('data-dot_pulsing')) {
				this.typeSplit.chars.push(this.addDotPulsing(this.typeSplit))
			}

			let elementsToAnim = this.typeSplit[this.whattoanim]
			gsap.set(this.header, { opacity: 1 })

			this.typeSplit.lines.forEach(line => {
				line.style.clipPath = `inset(-0.4em 0 0 0)`
				line.style.userSelect = 'none'
			})

			gsap.set(elementsToAnim, {
				yPercent: 150,
			})

			this.timeLine.to(elementsToAnim, {
				yPercent: 0,
				duration: this.duration,
				delay: this.delay,
				stagger: this.stagger,
				ease: CustomEase.create('custom', 'M0,0 C0.104,0.204 -0.267,1.054 1,1 '),
			})
		}

		setClippedFromLeft = () => {
			this.typeSplit = new SplitType(this.header, {
				tagName: 'span',
			})

			let leftBorder = this.header.parentElement.querySelector('.left-border')

			this.borderLeftPadding = leftBorder && getComputedStyle(this.header)['padding-left'] ? getComputedStyle(this.header)['padding-left'].split('px')[0] : 0

			if (leftBorder) {
				this.leftBorderDelay = this.delay
				this.delay = 0
			}

			leftBorder &&
				gsap.set(leftBorder, {
					scaleY: 0,
					transformOrigin: 'bottom',
				})

			leftBorder &&
				this.timeLine.fromTo(
					leftBorder,
					{
						scaleY: 0,
						immediateRender: false,
					},
					{
						scaleY: 1,
						duration: 0.5,
						ease: 'power1.out',
						delay: this.leftBorderDelay,
					}
				)

			if (this.header.hasAttribute('data-dot_pulsing')) {
				this.typeSplit.chars.push(this.addDotPulsing(this.typeSplit))
			}

			let elementsToAnim = this.typeSplit[this.whattoanim]
			gsap.set(this.header, {
				opacity: 1,
				clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
			})

			gsap.set(elementsToAnim, {
				xPercent: -100,
				x: this.borderLeftPadding * -1,
			})

			this.timeLine.to(
				elementsToAnim,
				{
					xPercent: 0,
					x: 0,
					stagger: this.stagger,
					duration: this.duration,
					ease: 'power4.inOut',
				},
				'>-0.3'
			)
		}

		setClippedFromTop = () => {
			this.typeSplit = new SplitType(this.header, {
				tagName: 'span',
			})

			let topBorder = this.header.parentElement.querySelector('.top-border')

			this.borderTopPadding = topBorder && getComputedStyle(this.header)['padding-top'] ? getComputedStyle(this.header)['padding-top'].split('px')[0] : 0

			if (topBorder) {
				this.topBorderDelay = this.delay
				this.delay = 0
			}

			topBorder &&
				gsap.set(topBorder, {
					scaleX: 0,
					transformOrigin: 'left',
				})

			topBorder &&
				this.timeLine.fromTo(
					topBorder,
					{
						scaleX: 0,
						immediateRender: false,
					},
					{
						scaleX: 1,
						duration: 0.5,
						ease: 'power1.out',
						delay: this.topBorderDelay,
					}
				)

			if (this.header.hasAttribute('data-dot_pulsing')) {
				this.typeSplit.chars.push(this.addDotPulsing(this.typeSplit))
			}

			let elementsToAnim = this.typeSplit[this.whattoanim]
			gsap.set(this.header, {
				opacity: 1,
				clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
			})

			gsap.set(elementsToAnim, {
				xPercent: -100,
				x: this.borderTopPadding * -1,
			})

			this.timeLine.to(
				elementsToAnim,
				{
					xPercent: 0,
					x: 0,
					stagger: this.stagger,
					duration: this.duration,
					ease: 'power4.inOut',
				},
				'>-0.3'
			)
		}

		setBlurInAnimation = () => {
			this.typeSplit = new SplitType(this.header, {
				tagName: 'span',
			})

			if (this.header.hasAttribute('data-dot_pulsing')) {
				this.typeSplit.chars.push(this.addDotPulsing(this.typeSplit))
			}

			let elementsToAnim = this.typeSplit[this.whattoanim]
			const staggerWindow = this.stagger * elementsToAnim.length
			const entryEase = CustomEase.create('custom', 'M0,0 C0.104,0.204 -0.267,1.054 1,1 ')

			elementsToAnim.forEach(elem => {
				elem.style.userSelect = 'none'
				elem.style.filter = `blur(${getRandom(0, 50)}px)`
				elem.style.willChange = 'filter, transform, opacity'
			})

			// El contenedor empieza en opacity:0 por CSS — lo revelamos para que los chars lo gestionen
			gsap.set(this.header, { opacity: 1 })
			gsap.set(elementsToAnim, { scale: this.scaleStart, opacity: 0 })

			elementsToAnim.forEach(elem => {
				const offset = gsap.utils.random(0, staggerWindow)

				// Posición absoluta en el timeline (no delay interno) para garantizar sincronía
				this.timeLine.to(elem, {
					scale: 1,
					opacity: 1,
					duration: this.duration,
					ease: entryEase,
				}, offset)

				this.timeLine.to(elem, {
					filter: 'blur(0px)',
					duration: this.duration * 1.5,
					ease: 'expo.out',
					onComplete: () => { elem.style.willChange = 'auto' },
				}, offset)
			})
		}

		setRotateXAnimation = () => {
			gsap.set(this.header, {
				opacity: 0,
				rotationX: this.rotateXStartAngle,
				transformPerspective: 800,
				transformOrigin: `50% ${this.rotateXOriginY}`,
			})
			this.timeLine.fromTo(
				this.header,
				{ opacity: 0, rotationX: this.rotateXStartAngle },
				{
					opacity: 1,
					rotationX: 0,
					duration: this.duration,
					delay: this.delay,
					ease: 'power3.out',
				}
			)
		}

		setZoomInAnimation = () => {
			gsap.set(this.header, { opacity: 0, scale: this.zoomStartScale })
			this.timeLine.fromTo(
				this.header,
				{ opacity: 0, scale: this.zoomStartScale },
				{
					opacity: 1,
					scale: 1,
					duration: this.duration,
					delay: this.delay,
					ease: 'power3.out',
				}
			)
		}

		getCycleContentPreset = name => {
			const presets = {
				reveal: {
					from: { opacity: 0 },
					to: { opacity: 1 },
					ease: 'power1.out',
				},
				slideFromBottom: {
					from: { y: this.slideamount, opacity: 0 },
					to: { y: 0, opacity: 1 },
					ease: 'power4.out',
				},
				slideFromTop: {
					from: { y: this.slideamount * -1, opacity: 0 },
					to: { y: 0, opacity: 1 },
					ease: 'power4.out',
				},
				slideFromLeft: {
					from: { x: this.slideamount * -1, opacity: 0 },
					to: { x: 0, opacity: 1 },
					ease: 'power4.out',
				},
				slideFromRight: {
					from: { x: this.slideamount, opacity: 0 },
					to: { x: 0, opacity: 1 },
					ease: 'power4.out',
				},
				zoomIn: {
					from: { opacity: 0, scale: this.zoomStartScale },
					to: { opacity: 1, scale: 1 },
					ease: 'power3.out',
				},
				zoomBounce: {
					from: { opacity: 0, scale: this.zoomBounceStartScale },
					to: { opacity: 1, scale: 1 },
					ease: 'elastic.out(1, 0.5)',
				},
				rotateX: {
					from: { opacity: 0, rotationX: this.rotateXStartAngle },
					to: { opacity: 1, rotationX: 0 },
					// Solo fija transformPerspective aquí: la X del transform-origin la
					// calcula setCycleContent a partir del contenido real (getCycleContentOrigin),
					// para respetar la alineación de cada hijo; aquí solo se ajusta la Y
					// (arriba/abajo) según el parámetro rotateX,<grados>,<top|bottom>.
					setup: items => gsap.set(items, { transformPerspective: 800 }),
					originY: this.rotateXOriginY,
					ease: 'power3.out',
				},
				clippedFromBottom: {
					from: { yPercent: 150, opacity: 0 },
					to: { yPercent: 0, opacity: 1 },
					setup: items =>
						items.forEach(item => {
							item.style.clipPath = 'inset(-0.4em 0 0 0)'
							item.style.userSelect = 'none'
						}),
					ease: CustomEase.create('custom', 'M0,0 C0.104,0.204 -0.267,1.054 1,1 '),
				},
				typewriter: {
					from: { opacity: 0 },
					to: { opacity: 1 },
					ease: 'none',
					// Marca que setCycleContentInline() debe montar el cursor y animar
					// char a char (con salida en orden inverso, efecto "backspace") en
					// vez de un tween en paralelo con stagger como reveal/zoomBounce.
					isTypewriter: true,
				},
			}

			return presets[name]
		}

		// Mide dónde cae realmente el contenido renderizado de un hijo (un Range
		// sobre sus nodos da el rectángulo visual real, sirva lo que sirva de
		// contenido: texto alineado a cualquier lado, un <div> con lo que sea
		// dentro...) y lo expresa en px relativos a la propia caja del hijo. Así el
		// transform-origin siempre pivota sobre lo que se ve, sin importar que la
		// caja del hijo ocupe todo el ancho de la fila (layouts "constrained" de WP
		// suelen forzar width:100% en los hijos directos) ni cómo esté alineado.
		getCycleContentOrigin = item => {
			const itemRect = item.getBoundingClientRect()
			const range = document.createRange()
			range.selectNodeContents(item)
			const contentRect = range.getBoundingClientRect()

			if (!contentRect.width || !contentRect.height) {
				return { x: itemRect.width / 2, y: itemRect.height / 2 }
			}

			return {
				x: contentRect.left + contentRect.width / 2 - itemRect.left,
				y: contentRect.top + contentRect.height / 2 - itemRect.top,
			}
		}

		setCycleContent = () => {
			const items = Array.from(this.header.children)

			if (items.length < 2) {
				console.warn('anim_any cyclecontent: se necesitan al menos 2 elementos hijos para ciclar')
				return
			}

			let preset = this.getCycleContentPreset(this.cycleContentAnim)
			if (!preset) {
				console.warn(`anim_any cyclecontent: la animación "${this.cycleContentAnim}" no está soportada para ciclar, se usa "reveal"`)
				preset = this.getCycleContentPreset('reveal')
			}

			// Todos los hijos apilados en la misma celda de grid: el contenedor se
			// dimensiona automáticamente al más alto (sigue "en flujo", solo cambia
			// opacidad/transform), así que no hay layout shift al ciclar. No se toca
			// el tamaño/alineación propios de cada hijo (cada uno conserva su
			// text-align o el que traiga), solo se centra el transform-origin sobre
			// su contenido real (ver getCycleContentOrigin).
			gsap.set(this.header, { opacity: 1, display: 'grid' })
			gsap.set(items, { gridRow: 1, gridColumn: 1 })

			// El origin se recalcula en el onStart de cada tween (ver applyOrigin más
			// abajo), no solo aquí una vez: si la ventana cambia de ancho entre medias
			// (p.ej. el texto largo del hijo 3 pasa a ocupar más líneas en móvil), la
			// posición guardada al montar la animación quedaría obsoleta y el zoom/
			// rotación pivotaría fuera de donde está ahora el texto. Al recalcular justo
			// antes de que cada hijo entre o salga, siempre usa el layout actual.
			const applyOrigin = item => {
				const origin = this.getCycleContentOrigin(item)
				item.style.transformOrigin = `${origin.x}px ${preset.originY ?? `${origin.y}px`}`
			}

			items.forEach(applyOrigin)
			preset.setup?.(items)
			gsap.set(items, { ...preset.from, pointerEvents: 'none' })

			// Orden de aparición: el del DOM salvo que data-anim_any_cyclecontentrandom
			// pida barajarlo. Se sortea una sola vez al montar la animación y el bucle
			// repite siempre esa misma secuencia (no se reordena en cada vuelta).
			const sequence = this.cycleContentRandom ? shuffle(items) : items

			// Entrada única del primer elemento (respeta duration/delay como el resto de
			// animaciones). Va fuera del timeline que se repite: si estuviera dentro,
			// cada vuelta del bucle la volvería a disparar justo después de que el
			// último paso del bucle ya hubiera vuelto a mostrar este mismo elemento,
			// produciendo un doble "reveal" seguido en vez de esperar el stagger.
			this.timeLine.to(sequence[0], {
				...preset.to,
				pointerEvents: 'auto',
				duration: this.duration,
				delay: this.delay,
				ease: preset.ease,
				onStart: () => applyOrigin(sequence[0]),
			})

			// Bucle infinito independiente: hold (stagger = tiempo visible) -> sale el
			// actual -> entra el siguiente. Al repetirse, retoma en su propio t=0 (el
			// "hold" del elemento que el paso anterior ya dejó visible), sin re-disparar
			// ninguna entrada extra.
			const loopTimeLine = gsap.timeline({ repeat: -1 })
			sequence.forEach((item, i) => {
				const nextItem = sequence[(i + 1) % sequence.length]
				loopTimeLine.to({}, { duration: Number(this.stagger) })
				loopTimeLine.to(item, { ...preset.from, pointerEvents: 'none', duration: this.duration, ease: preset.ease, onStart: () => applyOrigin(item) })
				loopTimeLine.to(nextItem, { ...preset.to, pointerEvents: 'auto', duration: this.duration, ease: preset.ease, onStart: () => applyOrigin(nextItem) })
			})

			this.timeLine.add(loopTimeLine)
		}

		// Nodo de cursor único, compartido entre todas las frases de un
		// cyclecontentinline (solo una es visible a la vez, por el stacking de
		// grid) o el único target de un typewriter suelto. Se reubica con
		// insertAdjacentElement junto a cada char en vez de crearse/destruirse,
		// así nunca añade ni quita contenido de la caja (no hay layout shift).
		// El tween de parpadeo (repeat:-1) se devuelve sin añadir todavía al
		// timeline: hay que añadirlo el último, en this.timeLine.add(blink, 0),
		// después de construir el resto de tweens/timelines — un hijo con
		// duración infinita antes que otros rompería el posicionamiento por
		// defecto ("al final del timeline") de cualquier .add() posterior.
		createCursorElement = () => {
			const cursor = document.createElement('span')
			cursor.textContent = this.cursorChar
			cursor.style.display = 'inline-block'
			this.header.appendChild(cursor)

			const blink = gsap.to(cursor, {
				opacity: 0,
				duration: this.cursorBlink,
				repeat: -1,
				yoyo: true,
				ease: 'none',
			})

			return { cursor, blink }
		}

		// Construye el tween/timeline de entrada o salida de una frase de
		// cyclecontentinline ya splitteada (elements = words o chars de un hijo
		// concreto). Para presets normales (reveal/zoomBounce/...) es un stagger
		// tween igual que setReveal/setZoomBounceWords, aplicado solo a los
		// elementos de ese hijo. Para typewriter, anima char a char (en orden
		// inverso en la salida, efecto "backspace") moviendo el cursor junto a
		// cada uno.
		tweenCycleInlineItem = (elements, preset, { entering, cursor, delay = 0 } = {}) => {
			if (preset.isTypewriter) {
				const ordered = entering ? elements : [...elements].reverse()
				const tl = gsap.timeline()

				ordered.forEach((el, i) => {
					const position = i === 0 ? delay : `+=${this.stagger}`

					if (entering) {
						// El cursor se coloca al arrancar el fade-in: así ya está
						// esperando en la posición donde va a aparecer el char,
						// igual que el punto de inserción de una máquina de escribir real.
						tl.to(
							el,
							{
								opacity: 1,
								duration: this.duration,
								ease: preset.ease,
								onStart: () => cursor && el.insertAdjacentElement('afterend', cursor),
							},
							position
						)
					} else {
						// Borrado instantáneo (sin fade): si el char desaparecía con
						// duration/ease y el cursor se movía en el mismo onStart, el
						// cursor quedaba a la izquierda de un char que técnicamente
						// aún seguía visible (mid-fade), como si "adelantara" al
						// borrado real. Al quitarlo de golpe, cursor y desaparición
						// del char quedan sincronizados.
						tl.set(
							el,
							{
								opacity: 0,
								onComplete: () => cursor && el.insertAdjacentElement('beforebegin', cursor),
							},
							position
						)
					}
				})

				return tl
			}

			return gsap.to(elements, {
				...(entering ? preset.to : preset.from),
				duration: this.duration,
				delay,
				stagger: Number(this.stagger),
				ease: preset.ease,
			})
		}

		setCycleContentInline = () => {
			const items = Array.from(this.header.children)

			if (items.length < 2) {
				console.warn('anim_any cyclecontentinline: se necesitan al menos 2 elementos hijos para ciclar')
				return
			}

			let preset = this.getCycleContentPreset(this.cycleContentAnim)
			if (!preset) {
				console.warn(`anim_any cyclecontentinline: la animación "${this.cycleContentAnim}" no está soportada, se usa "reveal"`)
				preset = this.getCycleContentPreset('reveal')
			}

			// Igual truco de stacking que cyclecontent, pero inline-grid en vez de
			// grid: el contenedor no fuerza ancho de bloque, así puede seguir a
			// otro texto en la misma línea (p.ej. "Qlik <frase cíclica>").
			gsap.set(this.header, { opacity: 1, display: 'inline-grid' })
			gsap.set(items, { gridRow: 1, gridColumn: 1 })

			// typewriter siempre trabaja char a char, sea cual sea whattoanim.
			const splitType = preset.isTypewriter ? 'chars' : this.whattoanim

			// Split una sola vez por frase (no en cada vuelta). Cada span de
			// SplitType ya envuelve justo su propio contenido (igual que en
			// setZoomBounceWords), así que transformOrigin:'center center' ya
			// queda centrado sin medir nada — a diferencia del cyclecontent de
			// bloque, aquí no hace falta getCycleContentOrigin.
			const splitOf = new Map(items.map(item => [item, new SplitType(item, { tagName: 'span' })]))
			const elementsOf = item => splitOf.get(item)[splitType]

			items.forEach(item => gsap.set(elementsOf(item), { transformOrigin: 'center center', ...preset.from }))

			const { cursor, blink } = preset.isTypewriter ? this.createCursorElement() : { cursor: null, blink: null }
			const sequence = this.cycleContentRandom ? shuffle(items) : items

			const enter = (item, delay = 0) => this.tweenCycleInlineItem(elementsOf(item), preset, { entering: true, cursor, delay })
			const exit = item => this.tweenCycleInlineItem(elementsOf(item), preset, { entering: false, cursor })

			// Entrada inicial fuera del timeline que se repite, mismo motivo que en
			// cyclecontent: si estuviera dentro, cada vuelta del bucle la volvería a
			// disparar justo después de que el último paso ya hubiera vuelto a
			// mostrar esta misma frase.
			this.timeLine.add(enter(sequence[0], this.delay))

			const loopTimeLine = gsap.timeline({ repeat: -1 })
			sequence.forEach((item, i) => {
				const nextItem = sequence[(i + 1) % sequence.length]
				loopTimeLine.to({}, { duration: Number(this.holdTime) })
				loopTimeLine.add(exit(item))
				loopTimeLine.add(enter(nextItem))
			})

			this.timeLine.add(loopTimeLine)

			// Se añade el último y en posición absoluta 0 (ver nota en createCursorElement).
			if (blink) this.timeLine.add(blink, 0)
		}

		setTypewriter = () => {
			this.typeSplit = new SplitType(this.header, {
				tagName: 'span',
			})

			let elementsToAnim = this.typeSplit.chars
			gsap.set(this.header, { opacity: 1 })
			gsap.set(elementsToAnim, { opacity: 0 })

			const { cursor, blink } = this.createCursorElement()

			elementsToAnim.forEach((char, i) => {
				this.timeLine.to(
					char,
					{
						opacity: 1,
						duration: this.duration,
						ease: 'none',
						onStart: () => char.insertAdjacentElement('afterend', cursor),
					},
					i === 0 ? this.delay : `+=${this.stagger}`
				)
			})

			// Se añade el último y en posición absoluta 0 (ver nota en createCursorElement).
			this.timeLine.add(blink, 0)
		}

		setReveal = () => {
			this.typeSplit = new SplitType(this.header, {
				tagName: 'span',
			})

			if (this.header.hasAttribute('data-dot_pulsing')) {
				this.typeSplit.chars.push(this.addDotPulsing(this.typeSplit))
			}

			let elementsToAnim = this.typeSplit[this.whattoanim]
			gsap.set(this.header, { opacity: 1 })
			gsap.set(elementsToAnim, { opacity: 0 })

			this.timeLine.to(elementsToAnim, {
				opacity: 1,
				duration: this.duration,
				delay: this.delay,
				stagger: this.stagger,
				ease: 'power1.out',
			})
		}

		setZoomBounceWords = () => {
			this.typeSplit = new SplitType(this.header, {
				tagName: 'span',
			})

			if (this.header.hasAttribute('data-dot_pulsing')) {
				this.typeSplit.chars.push(this.addDotPulsing(this.typeSplit))
			}

			let elementsToAnim = this.typeSplit[this.whattoanim]
			gsap.set(this.header, { opacity: 1 })
			gsap.set(elementsToAnim, {
				opacity: 0,
				scale: this.zoomBounceStartScale,
				transformOrigin: 'center center',
			})

			// Fade rápido y sin ease elástico: si la opacidad usara la misma ease que
			// el scale, oscilaría junto con el rebote y parpadearía.
			this.timeLine.to(elementsToAnim, {
				opacity: 1,
				duration: Math.min(this.duration * 0.45, 0.4),
				delay: this.delay,
				stagger: this.stagger,
				ease: 'power2.out',
			})

			// Zoom con rebote elástico suave, arrancando a la vez que el fade anterior
			this.timeLine.to(
				elementsToAnim,
				{
					scale: 1,
					duration: this.duration,
					stagger: this.stagger,
					ease: 'elastic.out(1, 0.5)',
				},
				'<'
			)
		}

		addDotPulsing = splitObj => {
			const splittedCharDot = document.createElement('span')
			splittedCharDot.setAttribute('class', 'char mz-dot-char')
			const lastChar = splitObj.chars[splitObj.chars.length - 1]
			lastChar.after(splittedCharDot)
			return splittedCharDot
		}
	}

	// Pre-pass: collect chained targets so their autoplay can be overridden before instantiation
	const chainedTargets = new Set()
	headerToAnim.forEach(header => {
		const config = getConfigByAtt(header, attributeId)
		if (!config.nextanim) return
		const selector = config.nextanim.split(',')[0].trim()
		const target = document.querySelector(selector)
		if (target && target.hasAttribute(`data-${attributeId}`)) {
			chainedTargets.add(target)
		}
	})

	headerToAnim.forEach(header => {
		const config = getConfigByAtt(header, attributeId)
		if (chainedTargets.has(header)) {
			config.autoplay = '0'
			// Strip the default auto-play delay for chained targets: their timing is
			// already controlled by the triggering element's nextAnimDelay offset, so
			// an additional default delay would shift the visual start unexpectedly.
			// An explicit data-anim_any_delay attribute is preserved as-is.
			if (config.delay === undefined) config.delay = '0'
		}
		const headerAnimation = new HeaderAnimation(header, config)
		header.headerAnimation = headerAnimation
	})
})
