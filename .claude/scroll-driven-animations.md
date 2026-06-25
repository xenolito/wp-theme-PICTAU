# OBJETIVO
Vamos a hacer otro componente js para nuestro tema WP, basado estrictametne en el patrón de otros que ya tenemos en /javascript/modules/ como hero_slider.js


# REFERENCIAS
/Users/orey/Desktop/lenis_gsap.html


# DEFINICIÓN
Lee mi conversación con Gemini que tienes en la página de referencia.

- El atributo target será data-stickysection, sin mas prefijos.
- La duración del efecto visual definido por la altura del animation-wrapper será el atributo "data-scrollduration" y la medida será una altura, por defecto 300vh.
- El atributo lo añadiremos al bloque gutenberg en el editor en el panel lateral en Bloque -> Atributos HTML

Haz las pruebas y verificaciones en la página /scroll/

Pregunta lo que necesites.


¿Por que has cambiado smooth_scroll.js?
lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time) => {
	lenis.raf(time * 1000)
})
gsap.ticker.lagSmoothing(0)