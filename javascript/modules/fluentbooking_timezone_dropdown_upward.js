// FluentBooking — el desplegable de zona horaria (.svelte-select-list, gestionado
// por la librería svelte-select) se abre por defecto hacia abajo del trigger, y no
// expone ninguna opción de placement fijo ni una clase que distinga arriba/abajo:
// solo escribe top/left inline calculados desde la posición del trigger, y los
// recalcula en cada scroll para seguirlo (ver README, sección "Cómo mantiene la
// posición respecto al trigger al hacer scroll" — mismo mecanismo).
//
// Cuando se abre hacia abajo, en ciertas posiciones de scroll queda recortado
// visualmente por el contenido siguiente de la página. Investigado a fondo (ver
// historial): no es arreglable con overflow/z-index/position en los ancestros. En
// cambio, cuando se abre hacia arriba se mantiene dentro del propio widget y se ve
// correcto. Como no hay una opción de configuración para fijar la dirección,
// forzamos "siempre hacia arriba" nosotros: en cuanto el nodo del desplegable
// aparece en el DOM, observamos sus propias mutaciones de `style` (las mismas que
// dispara la librería al abrir y en cada scroll) y sobreescribimos el `top`
// inmediatamente después con la fórmula "hacia arriba", usando el mismo trigger y
// margen (6px) que ya usa la librería para "hacia abajo".
const WIDGET_SELECTOR = '.fluent_booking_app'
const TRIGGER_SELECTOR = '.fcal_timezone_selector'
const GAP = 6 // mismo margen que usa la librería entre el trigger y el desplegable

function repositionAbove(list) {
	const trigger = document.querySelector(TRIGGER_SELECTOR)
	if (!trigger) return

	const top = `${trigger.getBoundingClientRect().top - list.getBoundingClientRect().height - GAP}px`
	if (list.style.top !== top) list.style.top = top // el guard evita bucle infinito con el observer de abajo
}

function watchTimezoneList(list) {
	repositionAbove(list)
	new MutationObserver(() => repositionAbove(list)).observe(list, { attributes: true, attributeFilter: ['style'] })
}

document.addEventListener('DOMContentLoaded', () => {
	const widget = document.querySelector(WIDGET_SELECTOR)
	if (!widget) return

	// El desplegable se crea/destruye cada vez que se abre/cierra (no es un nodo
	// persistente), así que hace falta observar continuamente su aparición.
	new MutationObserver(() => {
		const list = document.querySelector('.svelte-select-list')
		if (list && !list.dataset.forcedUp) {
			list.dataset.forcedUp = '1'
			watchTimezoneList(list)
		}
	}).observe(widget, { childList: true, subtree: true })
})
