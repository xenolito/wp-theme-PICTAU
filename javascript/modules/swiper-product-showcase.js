import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'
import { getConfigByAtt } from './attributesToConfigObj'
import Swiper from 'swiper'
import { Pagination, Autoplay, EffectFade, EffectCoverflow, EffectCards } from 'swiper/modules'

gsap.registerPlugin(ScrollTrigger)
gsap.registerPlugin(CustomEase)

const hyphenToCamelcase = str => {
	return str.replace(/-([a-z])/g, k => k[1].toUpperCase())
}

const getRandom = (min, max) => {
	return Math.random() * (max - min) + min
}

// Se espera a window.load (no DOMContentLoaded) para que ScrollTrigger mida la posición del
// elemento [data-swiper] contra el layout final de la página, ya con todas las imágenes de
// otras secciones cargadas (si se crea antes, con la página aún más corta de lo que será,
// puede calcular mal si el elemento ya está o no dentro del viewport).
window.addEventListener('load', () => {
	const attributeId = 'swiper'
	const swiperContainer = document.querySelectorAll(`[data-${attributeId}]`)

	if (!swiperContainer.length) return

	const SwiperShowcase = class {
		constructor(targetDOMElement, config = {}) {
			const { delay = 1000, triggerstart = null, slidesperview = 1.1, markers = false } = config

			this.swiperContainer = targetDOMElement
			this.slidesperview = slidesperview
			this.markers = markers === 'true' || markers === '1' ? true : false
			this.delay = delay
			this.triggerstart = !triggerstart ? `top bottom` : `top ${triggerstart}`

			this.setupSwiper()
		}

		play = () => {
			// this.swiper.enable()
			this.swiper.autoplay.start()
		}

		pause = () => {
			// autoplay.pause() with waitForTransition (default) auto-resumes itself
			// once the in-flight transition ends, so it can't be used to fully stop
			// the slider while it's outside the viewport. stop() has no such side effect.
			this.swiper.autoplay.stop()
		}

		setupSwiper = () => {
			// Create the element needed by swiper.js (.swiper-wrapper) inside our swiper container and move all swiperContainer childs there...
			this.swiperWrapper = document.createElement('div')
			this.swiperWrapper.classList.add('swiper-wrapper')
			this.swiperWrapper.append(...this.swiperContainer.childNodes)
			this.swiperContainer.append(this.swiperWrapper)

			this.slides = this.swiperWrapper.querySelectorAll(':scope > *')
			this.slides.forEach(slide => {
				slide.classList.add('swiper-slide')
				const img = slide.querySelector('img')
				img.setAttribute('loading', 'eager')
				img.setAttribute('decoding', 'sync')
				// console.log(img)
			})

			this.swiperContainer.style.opacity = '1'

			this.swiper = new Swiper(this.swiperContainer, {
				modules: [Pagination, Autoplay, EffectFade, EffectCoverflow],
				effect: 'coverflow',
				// enabled: false,
				coverflowEffect: {
					rotate: 50,
					stretch: 0,
					depth: 50,
					modifier: 1,
					slideShadows: true,
				},
				// on: {
				// 	slideChange: function () {
				// 		if (this.activeIndex === 0) {
				// 			this.lazy.loadInSlide(this.slides.length - 3)
				// 		}
				// 	},
				// },
				loop: true,
				slidesPerView: this.slidesperview,
				spaceBetween: 0,
				centeredSlides: true,
				centerInsufficientSlides: true,
				preventClicks: true,
				allowTouchMove: true,
				autoplay: {
					// enabled: false es imprescindible: si se omite, Swiper normaliza autoplay.enabled
					// a true automáticamente (por pasar un objeto) y arranca su propio autoplay al
					// inicializarse, ANTES de que este módulo llegue a llamar a autoplay.stop() más
					// abajo. Con delay 0, ese primer arranque interno programa su siguiente slide vía
					// requestAnimationFrame sin guardar el id en ningún sitio (swiper autoplay.mjs),
					// así que autoplay.stop() no puede cancelarlo: ese slideNext "huérfano" se ejecuta
					// igualmente un frame después, sin que el propio autoplay lo registre (running ya
					// es false cuando dispara beforeTransitionStart), y compite con el play() real
					// disparado por el ScrollTrigger si este entra en el viewport casi al momento
					// (recarga con el swiper ya visible), rompiendo la cadena de auto-reinicio tras la
					// primera transición. Con enabled:false, Swiper nunca arranca por su cuenta y nuestro
					// propio play()/pause() (ver ScrollTrigger más abajo) es la única fuente que lo hace.
					enabled: false,
					delay: 0,
					pauseOnMouseEnter: false,
					disableOnInteraction: false,
				},
				speed: 2600,
				// breakpoints: {
				// 	// when window width is >= 480px
				// 	480: {
				// 		slidesPerView: 1,
				// 	},
				// 	// 1120: {
				// 	// 	slidesPerView: 2,
				// 	// },
				// 	1460: {
				// 		slidesPerView: 1,
				// 	},
				// },
			})

			// Margen de seguridad adicional: si el elemento ya está dentro del viewport al crear
			// el ScrollTrigger, su onEnter se dispara en el mismo tick, sin que el navegador haya
			// pintado aún la posición de reposo del swiper. El doble rAF garantiza que ya hubo un
			// pintado real antes de evaluar el estado inicial del ScrollTrigger y, si procede,
			// arrancar el autoplay.
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					this.st = ScrollTrigger.create({
						trigger: this.swiperContainer,
						start: this.triggerstart,
						end: 'bottom top',
						// animation: this.timeLine,
						onEnter: () => this.play(),
						onLeave: () => this.pause(),
						onEnterBack: () => this.play(),
						onLeaveBack: () => this.pause(),
						scrub: 0.5,
						// pin: this.targetToAnim,
						// pinSpacer: false,
						invalidateOnRefresh: true,
						// markers: true,
						markers: this.markers,
						// pinReparent: true,
					})
				})
			})
		}
	}

	swiperContainer.forEach(swiperContainer => {
		const datasets = swiperContainer.dataset
		const config = getConfigByAtt(swiperContainer, attributeId)

		// console.log('CONFIG ', config)

		const customSwiper = new SwiperShowcase(swiperContainer, config)
		swiperContainer.customSwiper = customSwiper
	})
})
