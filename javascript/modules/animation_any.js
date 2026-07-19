/**
 * Animation any for WP based on GSAP
 * version: 4.17.2
 *
 * ? changelog:
 * ? v4.17.2 — Fixed v4.17.1's fix being incomplete: it still used a temporary SplitType (even words-only) to capture the fixed HTML, but pre-existing .word spans get wrapped in a *second* layer by the real split that runs afterward (SplitType doesn't recognize its own previously-generated markup), leaving duplicate nested words/chars for the fixed prefix in every child but the first. prepareFixedWordsHTML() no longer uses SplitType at all: it counts words by walking the original text nodes directly (TreeWalker) and extracts clean HTML via a Range, with zero SplitType markup involved before the single real split runs.

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
				blankpause = 0.4, // typewriter inside cyclecontentinline: seconds the cursor keeps blinking alone at the start position after backspacing, before the next phrase starts typing
				fixedwords = 0, // cyclecontentinline: number of leading words (read from the first child only) extracted once into a static shared element before the target
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
			this.blankPause = Number(blankpause)
			this.fixedWords = Number(fixedwords)
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
				this.timeLine.to(
					elem,
					{
						scale: 1,
						opacity: 1,
						duration: this.duration,
						ease: entryEase,
					},
					offset
				)

				this.timeLine.to(
					elem,
					{
						filter: 'blur(0px)',
						duration: this.duration * 1.5,
						ease: 'expo.out',
						onComplete: () => {
							elem.style.willChange = 'auto'
						},
					},
					offset
				)
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
		// elementos de ese hijo. En la salida, el orden del stagger se invierte
		// (el último word/char en aparecer es el primero en desaparecer) para
		// cualquier preset, no solo typewriter — así la desaparición siempre
		// "deshace" la entrada en el mismo orden en que se construyó. Para
		// typewriter, cada char aparece/desaparece de golpe (sin fade, `duration`
		// no aplica aquí — solo `stagger` como velocidad de tecleo/borrado),
		// igual que al escribir en una terminal, moviendo el cursor junto a cada uno.
		tweenCycleInlineItem = (elements, preset, { entering, cursor, delay = 0 } = {}) => {
			if (preset.isTypewriter) {
				const ordered = entering ? elements : [...elements].reverse()
				const tl = gsap.timeline()

				ordered.forEach((el, i) => {
					const position = i === 0 ? delay : `+=${this.stagger}`

					tl.set(
						el,
						{
							opacity: entering ? 1 : 0,
							onComplete: () => {
								if (!cursor) return
								entering ? el.insertAdjacentElement('afterend', cursor) : el.insertAdjacentElement('beforebegin', cursor)
							},
						},
						position
					)
				})

				return tl
			}

			return gsap.to(entering ? elements : [...elements].reverse(), {
				...(entering ? preset.to : preset.from),
				duration: this.duration,
				delay,
				stagger: Number(this.stagger),
				ease: preset.ease,
			})
		}

		// data-anim_any_fixedwords: duplica las N primeras palabras del PRIMER
		// hijo (items[0]) al principio del resto de hijos (que se escriben ya
		// sin ellas), y las excluye del array de elementos animables en TODOS
		// los hijos para que el efecto de escribir/borrar nunca las toque.
		//
		// No se extraen a un elemento aparte (como hacía la v1 de esta
		// función): this.header es inline-grid, y un inline-grid/inline-block
		// es una caja atómica — participa en el flujo de línea de fuera como
		// un bloque indivisible, pero su contenido interno NUNCA se entremezcla
		// palabra a palabra con texto de fuera de esa caja. Por eso un
		// elemento "Qlik"/"para" fuera de this.header podía acabar saltando a
		// su propia línea entero en vez de dejar hueco a que siguiera "vender
		// mejor." a continuación, aunque cupiera. La única forma de que todo
		// haga line-wrap junto como un párrafo normal es que el texto fijo
		// viva DENTRO de esa misma caja atómica, en cada hijo.
		//
		// Se hace en DOS pasos separados por el único SplitType real de cada
		// item (el de la línea `new SplitType(item, ...)` en
		// setCycleContentInline). No se usa SplitType para nada aquí — ni
		// siquiera de forma temporal: cualquier marcado .word/.char suyo que
		// se cuele en el HTML clonado se volvería a envolver por el split
		// real posterior (SplitType no reconoce sus propios spans ya
		// existentes, los trata como contenido normal y los anida dentro de
		// unos nuevos), duplicando la estructura y dejando algunos chars sin
		// animar correctamente. Por eso este primer paso cuenta las palabras
		// recorriendo directamente los nodos de texto originales (TreeWalker)
		// y usa un Range para extraer el HTML limpio — sin ningún .word/.char
		// de por medio — antes de que exista ningún split.

		// Paso 1 (antes del split real): prepara el HTML de cada hijo para que
		// todos, incluido el primero, contengan ya el prefijo fijo.
		prepareFixedWordsHTML = items => {
			const firstItem = items[0]
			const walker = document.createTreeWalker(firstItem, NodeFilter.SHOW_TEXT)

			let totalWords = 0
			const textNodes = []
			while (walker.nextNode()) {
				textNodes.push(walker.currentNode)
				const matches = walker.currentNode.textContent.match(/\S+/g)
				if (matches) totalWords += matches.length
			}

			const n = Math.min(this.fixedWords, totalWords)
			if (n < this.fixedWords) {
				console.warn(`anim_any cyclecontentinline: data-anim_any_fixedwords pide ${this.fixedWords} palabra(s) pero el primer hijo solo tiene ${totalWords}, se usan ${n}`)
			}

			let fixedHTML = ''
			if (n > 0) {
				let wordCount = 0
				let boundaryNode = null
				let boundaryOffset = 0

				outer: for (const textNode of textNodes) {
					const re = /\S+/g
					let match
					while ((match = re.exec(textNode.textContent))) {
						wordCount++
						if (wordCount === n) {
							boundaryNode = textNode
							boundaryOffset = match.index + match[0].length
							break outer
						}
					}
				}

				const range = document.createRange()
				range.setStart(firstItem, 0)
				if (boundaryNode) {
					range.setEnd(boundaryNode, boundaryOffset)
				} else {
					range.selectNodeContents(firstItem) // n cubre todo el contenido de firstItem
				}
				const div = document.createElement('div')
				div.appendChild(range.cloneContents())
				// Un espacio de separación fijo entre el prefijo y la parte
				// variable de cada hijo, independiente del espacio en blanco
				// original (que el Range no incluye, al cortar justo al final
				// de la última palabra fija).
				fixedHTML = div.innerHTML + ' '
			}

			// Al resto de hijos (que se escriben ya sin el prefijo) se les
			// antepone una copia del mismo HTML.
			items.slice(1).forEach(item => item.insertAdjacentHTML('afterbegin', fixedHTML))

			this.fixedWordsCount = n
		}

		// Paso 2 (después del split real): en cada hijo (incluido el
		// primero, que ya lo llevaba de fábrica), las N primeras palabras
		// quedan fijas: se sacan del array de animables (elementsOf() ya no
		// las ve) y se dejan tal cual — nunca se les toca opacidad ni
		// transform, así que se quedan siempre a la vista.
		excludeFixedWordsFromAnimation = (items, splitOf) => {
			const n = this.fixedWordsCount
			items.forEach(item => {
				const itemWords = splitOf.get(item).words
				const fixedItemWords = itemWords.splice(0, n)
				splitOf.get(item).chars = splitOf.get(item).chars.filter(c => !fixedItemWords.some(w => w.contains(c)))
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

			// Si hay palabras fijas, preparar el HTML de cada hijo ANTES del
			// split real (ver nota en prepareFixedWordsHTML sobre por qué no
			// se puede splittear dos veces el mismo elemento).
			if (this.fixedWords > 0) this.prepareFixedWordsHTML(items)

			// Split una sola vez por frase (no en cada vuelta). Cada span de
			// SplitType ya envuelve justo su propio contenido (igual que en
			// setZoomBounceWords), así que transformOrigin:'center center' ya
			// queda centrado sin medir nada — a diferencia del cyclecontent de
			// bloque, aquí no hace falta getCycleContentOrigin.
			const splitOf = new Map(items.map(item => [item, new SplitType(item, { tagName: 'span' })]))
			if (this.fixedWords > 0) this.excludeFixedWordsFromAnimation(items, splitOf)
			const elementsOf = item => splitOf.get(item)[splitType]

			items.forEach(item => gsap.set(elementsOf(item), { transformOrigin: 'center center', ...preset.from }))

			const { cursor, blink } = preset.isTypewriter ? this.createCursorElement() : { cursor: null, blink: null }
			const sequence = this.cycleContentRandom ? shuffle(items) : items

			// createCursorElement() cuelga el cursor de this.header sin más (un
			// hijo de más en el grid), así que hasta que arranca el primer char
			// (y su onComplete lo reposiciona) el propio grid lo auto-coloca en
			// una fila implícita nueva -- se ve "caído" debajo de las palabras
			// fijas antes de que empiece el primer ciclo. Se posiciona ya desde
			// el principio justo donde entrará el primer char, para que nunca
			// haya un instante con el cursor mal situado.
			if (cursor) {
				const firstEl = elementsOf(sequence[0])[0]
				if (firstEl) firstEl.insertAdjacentElement('beforebegin', cursor)
			}

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
				// Con typewriter, el borrado deja el cursor ya en la posición
				// inicial (sin chars). Una pequeña pausa aquí hace que el
				// cursor siga parpadeando ahí unos milisegundos antes de que
				// empiece a escribirse la siguiente frase, en vez de saltar
				// directamente de un ciclo a otro. No aplica a otros presets
				// (reveal/zoomBounce no tienen cursor).
				if (preset.isTypewriter) loopTimeLine.to({}, { duration: this.blankPause })
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

			// Cada char aparece de golpe (sin fade, `duration` no aplica aquí),
			// igual que al escribir en una terminal — consistente con el mismo
			// comportamiento cuando typewriter se usa como cyclecontentanim
			// dentro de cyclecontentinline (ver tweenCycleInlineItem).
			elementsToAnim.forEach((char, i) => {
				this.timeLine.set(
					char,
					{
						opacity: 1,
						onComplete: () => char.insertAdjacentElement('afterend', cursor),
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
