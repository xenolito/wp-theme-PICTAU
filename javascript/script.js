/**
 * Front-end JavaScript
 *
 * The JavaScript code you place here will be processed by esbuild. The output
 * file will be created at `../theme/js/script.min.js` and enqueued in
 * `../theme/functions.php`.
 *
 * For esbuild documentation, please see:
 * https://esbuild.github.io/
 */

import isTouch from './modules/isTouchDevice'

// import './modules/avif-webp'
import signature from '@xenolito/console-signature'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { OverlayScrollbars } from 'overlayscrollbars'
import './modules/contactForm7'
import './modules/modalContactForm7'
// import './modules/desktopMenuNav'
import './modules/desktopMenuNavAnchor'
import './modules/mobileMenuNav'
// import './modules/darkMode-default-dark'
import './modules/smooth_scroll' // lenis
// import './modules/scrollTrigger_rive'
import './modules/scrollTrigger_css-class'
import './modules/scrollTriggerHorizontal'
// import './modules/scrollTriggerOverlapVertical'
import './modules/scrollTrigger_pin'
// import './modules/animation_scrollTriggered'
import './modules/animation_counter'
// import './modules/animation_split_text'
// import './modules/animation_blur_chars'
// import './modules/animation_headers'
import './modules/animation_any'
// import './modules/animation_float'
import './modules/marquee'
import './modules/testimonials-splide'
import './modules/hero_slider'
import './modules/imgcompare'
import './modules/faqs'
// import './modules/mouse_pointer'
// import './modules/parallax_header'
// import './modules/parallax_footer'
// import './modules/effect_stroke_chars'
// import './modules/bg_body_color_change'
// import './modules/webgl_animBg'
import './modules/logosGridFilter'
// import './modules/slider_videoBg_trigger_anim'
// import './modules/video_play_scrolltriggered'
// import './modules/navigation_dot'
import './modules/scrollToAName'
import './modules/style-header-by-section'
import './modules/video-trigger'
// import './modules/lang_switcher'
import './modules/social_share_buttons'
// import './modules/browser_lang_redirection'
import './modules/event_selector'
// import './modules/webgl_dots_connected_anim'
import './modules/webgl_grid_background'
import './modules/image_mask_animated'
import './modules/stickysection'
import './modules/parallax'
// import './modules/fix_chatbot_meow_lenis'
// import './modules/__intro_anim' //! remove/update. This is a specific intro animation for the home page slider for this customer.
import { initImageLoaderCover } from './modules/imageLoaderCover'
import { initCatalogMenu } from './modules/catalogMenu'

document.addEventListener('DOMContentLoaded', () => {
	// console.clear()
	checkIfTouchDevice()
	signature()
	setScrollBars()
	// initImageLoaderCover('.slider-cover', sliderInit)
	initCatalogMenu()

	if (!document.querySelector('#masthead')) return

	// setPageTransitions()

	const body = document.querySelector('body')

	if (body.classList.contains('fixed-header')) {
		animateFixedHeaderOnScroll()
	} else if (body.classList.contains('fixed-autohide-header')) {
		setupAutoHideHeader()
	}

	// setBackgrounds()
})

const sliderInit = (window.sliderInit = (index, splide) => {
	const splideRoot = splide.root

	if (splide.root) {
		const activeSlide = splide.Components.Slides.getAt(splide.index).slide
		const slideStartAnimation = activeSlide.querySelector('#slider-start-animation')
		if (slideStartAnimation) {
			slideStartAnimation.headerAnimation.play()
		}
		// console.log(slideStartAnimation.headerAnimation)
	}
})

const setPageTransitions = () => {
	window.addEventListener('load', () => {
		const transition = document.querySelector('.pct-page-transition-2')
		const anchors = document.querySelectorAll('a:not([href^="#"]):not([target="_blank"])')
		window.pageTransition = true

		setTimeout(() => {
			transition.classList.remove('is-active')
		}, 500)

		anchors.forEach(anchor => {
			anchor.addEventListener('click', e => {
				e.preventDefault()
				let target = e.currentTarget
				transition.classList.add('is-active')
				console.log(target)
				setTimeout(() => {
					document.location.href = target
				}, 500)
			})
		})
	})
}

const checkIfTouchDevice = () => {
	if (isTouch()) document.documentElement.classList.add('touch-device')
}

const setScrollBars = () => {
	window.overlayscrollbars = OverlayScrollbars(document.querySelector('body'), {
		paddingAbsolute: false,
		showNativeOverlaidScrollbars: false,
		update: {
			elementEvents: [['.faq-question', 'click', '[data-modal]']],
		},
		scrollbars: {
			theme: 'os-theme-dark',
			visibility: 'auto',
			autoHide: 'always',
			autoHideDelay: 1300,
			autoHideSuspend: false,
			dragScroll: true,
			clickScroll: false,
			// pointers: ['mouse', 'touch', 'pen'],
			pointers: ['mouse', 'touch'],
		},
		overflow: {
			x: 'clip',
			// y: 'scroll',
		},
	})
}

const setupAutoHideHeader = () => {
	// console.log('auto hide header SETUP', window.pictauMobileNav.showing);
	const headerAnimation = gsap
		.from('#masthead', {
			yPercent: -100,
			// paused: true,
			duration: 0.5,
			ease: 'power2.out',
		})
		.progress(1)

	ScrollTrigger.create({
		start: 'top top',
		end: 'max',
		onUpdate: self => {
			if (window.pictauMobileNav.showing && self.direction !== -1) window.pictauMobileNav.reset()
			if (self.direction === -1) {
				// scrolling towards top of the page
				headerAnimation.play()
			} else {
				headerAnimation.reverse()
			}
		},
		invalidateOnRefresh: true,
		markers: true,
	})
}

const animateFixedHeaderOnScroll = () => {
	const body = document.querySelector('body')
	const header = document.querySelector('#masthead')

	const target = document.querySelector('#content .slider') ?? document.querySelector('#content .entry-header')

	const headerHeight = () => {
		return header.getBoundingClientRect().height
	}

	const headerDim = header.getBoundingClientRect()

	const setHeaderScrolledStatus = status => {
		if (status) {
			header.classList.add('scrolledHeader')
			body.classList.add('scrolledHeader')
		} else {
			header.classList.remove('scrolledHeader')
			body.classList.remove('scrolledHeader')
		}
	}

	const st = ScrollTrigger.create({
		trigger: target,
		start: () => `bottom top+=${headerHeight()}px`,
		onEnter: () => {
			setHeaderScrolledStatus(true)
		},
		onLeaveBack: () => {
			setHeaderScrolledStatus(false)
		},
		markers: false,
	})
}
