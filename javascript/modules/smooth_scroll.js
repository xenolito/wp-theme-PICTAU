// import { gsap } from 'gsap';
// import { ScrollTrigger, ScrollSmoother } from 'gsap/ScrollTrigger';

// gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// ScrollSmoother.create({
// 	wrappper: document.querySelector('body'),
// 	smooth: 1, // how long (in seconds) it takes to "catch up" to the native scroll position
// 	effects: true, // looks for data-speed and data-lag attributes on elements
// 	smoothTouch: 0.1, // much shorter smoothing time on touch devices (default is NO smoothing on touch devices)
// });

import Lenis from '@studio-freight/lenis'

// smooth scroll
const lenis = new Lenis({
	// wrapper: document.querySelector('html'),
	// duration: 0.2,
	// lerp: 0.5,
	easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
	// direction: 'vertical',
	// gestureDirection: 'vertical',
	gestureOrientation: 'vertical',
	smoothWheel: true,
	infinite: false,
	autoResize: true,
	// normalizeWheel: true,
})

lenis.on('scroll', ({ scroll, limit, velocity, direction, progress }) => {
	// console.log({ scroll, limit, velocity, direction, progress });
})

function raf(time) {
	lenis.raf(time)
	requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

window.lenis = lenis

// Mutation observer for checking body classes for gdpr cookie plugin adding classes to body when popup showing
function onClassChange(node, callback) {
	let lastClassString = node.classList.toString()

	const mutationObserver = new MutationObserver(mutationList => {
		for (const item of mutationList) {
			if (item.attributeName === 'class') {
				const classString = node.classList.toString()
				if (classString !== lastClassString) {
					callback(mutationObserver)
					lastClassString = classString
					break
				}
			}
		}
	})

	mutationObserver.observe(node, { attributes: true })

	return mutationObserver
}

//! check if using the plugin --> GDPR Cookie Compliance Plugin (CCPA ready) https://es.wordpress.org/plugins/gdpr-cookie-compliance/
window.addEventListener('load', () => {
	if (document.querySelector('#moove_gdpr_cookie_modal')) {
		const gdprLBox = document.querySelector('#moove_gdpr_cookie_modal')
		const gdprMainModal = gdprLBox.querySelector('.main-modal-content')
		const gdprTabContent = gdprLBox.querySelector('.moove-gdpr-tab-content')
		const gdprRightTabContent = gdprLBox.querySelector('.moove-gdpr-modal-right-content')

		gdprLBox.setAttribute('data-lenis-prevent', '')
		// gdprTabContent.setAttribute('data-lenis-prevent', '')
		gdprMainModal.setAttribute('data-lenis-prevent', '')
		gdprRightTabContent.setAttribute('data-lenis-prevent', '')

		let nodeToObserve = document.querySelector('body')

		onClassChange(nodeToObserve, observer => {
			const modalShowing = nodeToObserve.classList.contains('moove_gdpr_overflow')
			if (modalShowing) {
				// console.log('GDPR MODAL SHOWING')
				window.lenis.stop()
			} else {
				// console.log('GDPR MODAL Hided!!')
				window.lenis.start()
			}
		})
	}
})
