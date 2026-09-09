import { gsap } from 'gsap'
import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const NESTED_SCROLL_SELECTOR = '[data-overlayscrollbars-viewport], .fcal_slot_picker, .svelte-select-list, .fcal_date_event_details, .main-modal-content, .fframe_app'

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

	prevent: node => node.matches?.(NESTED_SCROLL_SELECTOR) && node.scrollHeight > node.clientHeight,
})

lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add(time => {
	lenis.raf(time * 1000)
})
gsap.ticker.lagSmoothing(0)

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
		// No hace falta [data-lenis-prevent] en el modal ni en sus paneles internos
		// (.main-modal-content, .moove-gdpr-modal-right-content): con `allowNestedScroll: true`
		// arriba, Lenis ya cede el wheel/touch nativo a cualquier nodo con overflow real (esos
		// paneles ya declaran overflow-y:auto en el CSS del propio plugin) sin marcarlo a mano;
		// y como más abajo se llama a lenis.stop() mientras el modal está abierto, el resto del
		// overlay queda bloqueado por el fallback isStopped → preventDefault(), igual que en
		// ModalWP.js (ver ese módulo para el mismo patrón, verificado con Playwright).
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
