import Swiper from 'swiper'
import { Pagination, Autoplay, EffectFade, EffectCoverflow } from 'swiper/modules'

document.addEventListener('DOMContentLoaded', () => {
	const sliders = document.querySelectorAll('.slider-webinars')
	if (!sliders.length) return

	sliders.forEach(ev => {
		const swiper = new Swiper('.slider-webinars', {
			modules: [Pagination, Autoplay, EffectFade, EffectCoverflow],
			effect: 'coverflow',
			loop: true,
			slidesPerView: 1,
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
			speed: 5600,
			breakpoints: {
				// when window width is >= 480px
				480: {
					slidesPerView: 2,
				},
				// 1120: {
				// 	slidesPerView: 2,
				// },
				1460: {
					slidesPerView: 3,
				},
			},
		})

		swiper.on('sliderMove', () => {
			console.log('draggin slider ???')
		})
	})
})
