// Evita que Lenis intercepte el scroll dentro del widget de FluentBooking
// ([fluent_booking id="..."]): la lista de horas y el desplegable de zona
// horaria tienen su propio scroll interno (Svelte), y sin esto Lenis
// capturaba la rueda del ratón/touch como si fuera scroll de la página,
// bloqueando ambos.
//
// `.fluent_booking_app` ya viene renderizado como placeholder vacío en el
// HTML del servidor (el plugin lo hidrata luego con Svelte), así que basta
// con DOMContentLoaded: no hace falta esperar a que termine de montar nada,
// el atributo en este contenedor exterior cubre también a los hijos que
// añada después, porque Lenis comprueba el composedPath() del evento.
document.addEventListener('DOMContentLoaded', () => {
	document.querySelectorAll('.fluent_booking_app').forEach(el => {
		el.setAttribute('data-lenis-prevent', '')
	})
})
