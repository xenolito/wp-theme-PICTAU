import { gsap } from 'gsap'
import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Selectores de contenedores con scroll interno propio conocidos en el sitio, para
// el `prevent` de Lenis de abajo. Añadir aquí cualquier widget nuevo con su propio
// scroll (el contenedor real con overflow, NUNCA un wrapper más grande — ver el
// caso de FluentBooking en el README, sección "Compatibilidad de scroll con
// widgets de terceros"):
//   - [data-overlayscrollbars-viewport] → viewport interno que crea OverlayScrollbars
//     al inicializarse sobre un <div> normal (ModalWP.js). OJO: NO aplica al
//     OverlayScrollbars de <body> en este mismo archivo (setScrollBars en script.js):
//     ese usa el modo especial para html/body que preserva el scroll nativo del
//     documento sin crear un viewport propio, así que nunca hace match aquí
//     (verificado con Playwright: solo existen 2 nodos con este atributo en toda
//     la página, ambos dentro de modales, ninguno envolviendo el contenido real).
//   - .fcal_slot_picker → lista de horas del widget FluentBooking ([fluent_booking]).
//   - .main-modal-content → panel del modal de cookies del plugin GDPR Cookie Compliance.
const NESTED_SCROLL_SELECTOR = '[data-overlayscrollbars-viewport], .fcal_slot_picker, .main-modal-content'

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
	// `prevent` en vez de `allowNestedScroll`: la propia doc de Lenis avisa de que
	// allowNestedScroll comprueba computedStyle + scrollHeight/clientHeight de CADA
	// nodo del composedPath() del evento (cacheado 2s, pero el primer barrido y cada
	// refresco del cache fuerza layout por nodo) — con el markup de Gutenberg de este
	// tema un wheel event normal recorre ~12+ niveles de wrappers .wp-block-group, así
	// que ese coste se paga en casi cualquier scroll de la página, no solo cerca de un
	// widget. `prevent` usa la misma señal (se llama nodo a nodo por el mismo
	// composedPath) pero con una comprobación mucho más barata: primero un
	// `.matches()` contra NESTED_SCROLL_SELECTOR (comparación de selector, no fuerza
	// layout) que descarta la inmensa mayoría de nodos al instante, y solo mide
	// overflow real (scrollHeight > clientHeight) para los 2-3 contenedores conocidos
	// que sí lo necesitan — igual de seguro que allowNestedScroll (no cede el control
	// si el contenedor no tiene overflow en ese momento, evitando la fuga hacia
	// window.scrollY que causó el bug original de FluentBooking) pero sin pagar el
	// coste en el resto del árbol.
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
