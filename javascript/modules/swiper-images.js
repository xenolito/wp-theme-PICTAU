/**
 * SWIPER LAYOURT FOR SLIDERS
 *
 * <!-- Slider main container -->
<div class="swiper">
  <!-- Additional required wrapper -->
  <div class="swiper-wrapper">
    <!-- Slides -->
    <div class="swiper-slide">Slide 1</div>
    <div class="swiper-slide">Slide 2</div>
    <div class="swiper-slide">Slide 3</div>
    ...
  </div>
  <!-- If we need pagination -->
  <div class="swiper-pagination"></div>

  <!-- If we need navigation buttons -->
  <div class="swiper-button-prev"></div>
  <div class="swiper-button-next"></div>

  <!-- If we need scrollbar -->
  <div class="swiper-scrollbar"></div>
</div>
 */

import Swiper from 'swiper'
import { Pagination, Autoplay, EffectFade } from 'swiper/modules'

document.addEventListener('DOMContentLoaded', () => {
	const swipers = document.querySelectorAll('.swiper-img-fade')

	if (!swipers.length) return

	swipers.forEach(el => {
		let autoplayDelay = el.dataset?.slider_autoplay_delay
		// console.log(autoplayDelay)

		const swiperBg = new Swiper('.swiper-img-fade', {
			modules: [Pagination, Autoplay, EffectFade],
			loop: true,
			// effect: 'flip',
			effect: 'fade',
			// fadeEffect: {
			// 	crossFade: true,
			// },
			// flipEffect: {
			// 	slideShadows: false,
			// },
			// slidesPerView: 1,
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
		})
	})
})
