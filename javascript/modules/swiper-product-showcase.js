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

document.addEventListener('DOMContentLoaded', () => {
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
			// this.swiper.autoplay.start()
			this.swiper.autoplay.resume()
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

			// this.swiper.autoplay.stop()
			this.swiper.autoplay.pause()

			this.st = ScrollTrigger.create({
				trigger: swiperContainer,
				start: this.triggerstart,
				end: 'bottom top',
				// animation: this.timeLine,
				onEnter: () => this.play(),
				scrub: 0.5,
				// pin: this.targetToAnim,
				// pinSpacer: false,
				invalidateOnRefresh: true,
				// markers: true,
				markers: this.markers,
				// pinReparent: true,
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
