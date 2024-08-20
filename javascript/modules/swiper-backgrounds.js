import Swiper from 'swiper';
import { Pagination, Autoplay, EffectFade } from 'swiper/modules';

document.addEventListener('DOMContentLoaded', () => {
	document.querySelectorAll('.slider-bg').forEach((el) => {
		let autoplayDelay = el.dataset?.slider_autoplay_delay;

		const swiperBg = new Swiper('.slider-bg', {
			modules: [Pagination, Autoplay, EffectFade],
			loop: true,
			// effect: 'flip',
			effect: 'fade',
			fadeEffect: {
				crossFade: true,
			},
			// flipEffect: {
			// 	slideShadows: false,
			// },
			slidesPerView: 1,
			spaceBetween: 0,
			// centeredSlides: true,
			preventClicks: false,
			autoplay: {
				delay: autoplayDelay || 2000,
				pauseOnMouseEnter: false,
				disableOnInteraction: false,
				waitForTransition: true,
			},
			speed: 1200,
		});
	});
});
