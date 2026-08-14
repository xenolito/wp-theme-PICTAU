// FluentBooking — el desplegable de zona horaria (.svelte-select-list, gestionado
// por la librería svelte-select) se abre por defecto hacia abajo del trigger, y no
// expone ninguna opción de placement fijo ni una clase que distinga arriba/abajo:
// solo escribe top/left inline calculados desde la posición del trigger, y los
// recalcula en cada scroll para seguirlo (ver README, sección "Cómo mantiene la
// posición respecto al trigger al hacer scroll" — mismo mecanismo).
//
// Historial:
// 1. Detectado que, abierto hacia abajo (su comportamiento por defecto), en
//    ciertas posiciones de scroll quedaba recortado por el borde inferior del
//    viewport — el trigger es el último campo del formulario, así que suele
//    quedar en la mitad baja de la pantalla, sin hueco debajo. Fix inicial:
//    forzar "siempre hacia arriba" sobreescribiendo el `top` tras cada mutación
//    de estilo que dispara la propia librería (al abrir y en cada scroll).
// 2. Ese fix asumía que SIEMPRE hay hueco de sobra por encima del trigger, algo
//    cierto en el caso típico (recién cargada la página) pero falso al volver
//    con "atrás" desde la pantalla de horas a la de calendario: ese flujo puede
//    dejar el trigger pegado a la parte superior del viewport, y la fórmula
//    "hacia arriba" daba un `top` muy negativo.
// 3. Segundo intento: limitar ese `top` a un suelo fijo (justo debajo del header
//    fijo del sitio). Insuficiente — con el trigger cerca del techo, casi todo
//    el viewport queda DEBAJO de él, así que el suelo fijo dibujaba el
//    desplegable flotando lejos del trigger, montado sobre el resto de la
//    página, no sobre la tarjeta — igual de roto que el bug original.
// 4. Tercer intento: elegir arriba/abajo dinámicamente según cuál de los dos
//    lados tiene más hueco libre en el viewport (igual que Popper/Floating UI).
//    Matemáticamente correcto, pero seguía viéndose roto en verificación real:
//    quedaba una causa distinta sin resolver (ver punto 5).
// 5. Causa real encontrada instrumentando `scrollIntoView` con Playwright: al
//    abrir el desplegable, la propia librería svelte-select llama a
//    `elemento.scrollIntoView({block:'nearest'})` sobre el ítem "activo" (la
//    zona horaria ya seleccionada) para asegurarse de que sea visible. Ese
//    nodo sigue viviendo en el árbol DOM normal del widget (aunque
//    `.svelte-select-list` se pinte con `position:fixed`), así que
//    `scrollIntoView` recorre TODOS los antepasados con scroll — incluida la
//    página entera — y puede arrastrar un scroll real del documento (~140px
//    de golpe en las pruebas) justo al abrir, independientemente de cómo
//    posicionemos nosotros la lista después. Nuestro reposicionamiento se
//    ejecuta correctamente relativo al trigger, pero el trigger ya se ha
//    movido por este scroll fantasma que no controlábamos.
//
// 6. Con (a) y (b) ya resuelto el posicionamiento en sí (verificado con
//    Playwright), quedó un último caso: en el layout de escritorio (calendario
//    a 2 columnas), al abrir hacia abajo la lista aparecía POR DETRÁS de la
//    sección siguiente de la página (el bloque "Si prefieres..."), en vez de
//    recortada o mal colocada. Causa: `.fluent_booking_app` vive dentro de un
//    `<section class="pct-section">` con `position:relative; z-index:1` —
//    eso crea su propio "stacking context". Aunque `.svelte-select-list` es
//    `position:fixed` (pensado para escapar del flujo normal) y tiene
//    `z-index:2`, ese z-index solo compite DENTRO del stacking context de su
//    ancestro; no puede ganarle a un stacking context HERMANO (la siguiente
//    `pct-section`, con el mismo z-index:1 pero posterior en el DOM, que por
//    eso pinta encima).
//
//    Primer intento: reinsertar `.svelte-select-list` como hijo directo de
//    `<body>` (patrón "portal", como hacen Radix/Floating UI) para sacarla de
//    cualquier stacking context ajeno. Descartado: rompía la selección — la
//    librería usa el DOM real donde vive el nodo (no una referencia cacheada)
//    para su lógica de "click fuera"/selección, así que moverlo con
//    `appendChild` la desconecta de esa lógica y deja de funcionar como
//    selector. El fix correcto no es tocar el DOM, sino el propio stacking
//    context que atrapa la lista — ver `fluentbooking.css` (`.pct-section:has(
//    .fluent_booking_app)`), que sube el z-index de esa sección concreta por
//    encima de sus hermanas, sin mover ni un nodo del árbol de svelte-select.
//
// Fix definitivo — dos partes en JS (el resto, en CSS):
// a) Interceptar `scrollIntoView` SOLO para elementos dentro de
//    `.svelte-select-list`, para que el ítem activo se desplace usando el
//    scroll interno propio de la lista (ya tiene `overflow-y:auto`), sin
//    tocar el scroll de la página. El resto de `scrollIntoView` del sitio
//    (cualquier otro uso, del tema o de otros plugins) sigue funcionando
//    igual — el guard `.closest('.svelte-select-list')` limita el cambio
//    exclusivamente a los ítems de este desplegable.
// b) Igual que hace cualquier librería de posicionamiento de popovers
//    (Popper/Floating UI): decidir arriba/abajo dinámicamente según cuál de
//    los dos lados tiene más hueco libre en el viewport en ese momento, en
//    vez de forzar siempre la misma dirección. `.svelte-select-list` ya es
//    scrollable internamente, así que en el caso límite en que ninguno de
//    los dos lados tiene hueco de sobra, basta con anclarlo al lado con más
//    espacio y dejar que el scroll interno de la lista haga el resto.
const WIDGET_SELECTOR = '.fluent_booking_app'
const TRIGGER_SELECTOR = '.fcal_timezone_selector'
const LIST_SELECTOR = '.svelte-select-list'
const GAP = 6 // mismo margen que usa la librería entre el trigger y el desplegable
const VIEWPORT_MARGIN = 8 // aire mínimo respecto al borde del viewport en el lado elegido

// (a) scrollIntoView de los ítems del desplegable → solo scroll interno de la lista
const nativeScrollIntoView = Element.prototype.scrollIntoView
Element.prototype.scrollIntoView = function (...args) {
	const list = this.closest(LIST_SELECTOR)
	if (!list) return nativeScrollIntoView.apply(this, args)

	const itemRect = this.getBoundingClientRect()
	const listRect = list.getBoundingClientRect()
	if (itemRect.top < listRect.top) {
		list.scrollTop -= listRect.top - itemRect.top
	} else if (itemRect.bottom > listRect.bottom) {
		list.scrollTop += itemRect.bottom - listRect.bottom
	}
}

// (b) elegir arriba/abajo según hueco disponible
function repositionList(list) {
	const trigger = document.querySelector(TRIGGER_SELECTOR)
	if (!trigger) return

	const triggerRect = trigger.getBoundingClientRect()
	const listHeight = list.getBoundingClientRect().height

	const spaceAbove = triggerRect.top - GAP - VIEWPORT_MARGIN
	const spaceBelow = window.innerHeight - triggerRect.bottom - GAP - VIEWPORT_MARGIN

	// Preferimos arriba (comportamiento ya validado visualmente) salvo que no
	// quepa entera Y abajo sí haya más sitio real.
	const openAbove = listHeight <= spaceAbove || spaceAbove >= spaceBelow

	const top = openAbove
		? Math.max(triggerRect.top - listHeight - GAP, VIEWPORT_MARGIN)
		: Math.min(triggerRect.bottom + GAP, window.innerHeight - listHeight - VIEWPORT_MARGIN)

	const topPx = `${top}px`
	if (list.style.top !== topPx) list.style.top = topPx // el guard evita bucle infinito con el observer de abajo
}

function watchTimezoneList(list) {
	repositionList(list)
	new MutationObserver(() => repositionList(list)).observe(list, { attributes: true, attributeFilter: ['style'] })
}

document.addEventListener('DOMContentLoaded', () => {
	const widget = document.querySelector(WIDGET_SELECTOR)
	if (!widget) return

	// El desplegable se crea/destruye cada vez que se abre/cierra (no es un nodo
	// persistente), así que hace falta observar continuamente su aparición.
	new MutationObserver(() => {
		const list = document.querySelector(LIST_SELECTOR)
		if (list && !list.dataset.forcedUp) {
			list.dataset.forcedUp = '1'
			watchTimezoneList(list)
		}
	}).observe(widget, { childList: true, subtree: true })
})
