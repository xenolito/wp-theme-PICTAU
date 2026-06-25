// Arregla el scroll interno del chatbot Meow cuando se usa Lenis en la web
function fixChatScroll() {
	const scrollAreas = document.querySelectorAll('.mwai-window-box .mwai-body')
	if (!scrollAreas.length) return

	scrollAreas.forEach(el => {
		if (el.dataset.eqmLenisFixed) return
		el.dataset.eqmLenisFixed = '1'

		// Asegura scroll interno inmediato
		el.style.overflowY = 'auto'
		el.style.webkitOverflowScrolling = 'touch'

		// Previene que Lenis capture scroll hacia el body (fase de captura = crucial)
		const stop = e => e.stopImmediatePropagation()

		el.addEventListener('wheel', stop, { passive: false, capture: true })
		el.addEventListener('touchmove', stop, { passive: false, capture: true })

		// También evitar reflujo de scroll al llegar a top/bottom (mobile)
		el.addEventListener(
			'scroll',
			() => {
				if (el.scrollTop <= 0) el.scrollTop = 1
				else if (el.scrollTop + el.clientHeight >= el.scrollHeight) el.scrollTop = el.scrollHeight - el.clientHeight - 1
			},
			{ passive: true }
		)
	})
}

// Inicial
document.addEventListener('DOMContentLoaded', fixChatScroll)

// Re-aplicar cuando el chat se abre / re-renderiza (AI Engine redibuja el DOM)
new MutationObserver(fixChatScroll).observe(document.body, { childList: true, subtree: true })
