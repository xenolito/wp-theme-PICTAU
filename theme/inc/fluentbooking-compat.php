<?php

/**
 * Compatibilidad con el dashboard frontend de FluentBooking (fluent-booking-pro).
 *
 * El dashboard de reservas en frontend (slug configurable en Ajustes de
 * FluentBooking, p.ej. /bookings) se renderiza con una plantilla propia del
 * plugin (app/Views/front-app.php) que sí llama a wp_head()/wp_footer(), pero
 * en "modo sin conflictos": en wp_print_styles (prioridad 999999) recorre
 * TODOS los estilos ya encolados y desencola cualquiera cuyo src pertenezca a
 * un plugin o al tema activo, salvo que coincida con una lista blanca de
 * slugs (por defecto solo fluent-crm/fluent-booking/fluent-booking-pro) — ver
 * FluentBooking\App\Hooks\Handlers\AdminMenuHandler::enqueueAssets(). Es
 * intencional: evita que el CSS del sitio corrompa el diseño de su propio
 * dashboard admin-style.
 *
 * Efecto colateral: el banner de consentimiento de cookies (GDPR Cookie
 * Compliance) sigue imprimiéndose vía wp_footer (hook distinto, no tocado por
 * el "no conflict mode" — por eso el HTML del banner sí aparece), pero su CSS
 * ya fue desencolado antes de llegar a imprimirse en wp_head — el banner
 * aparece sin ningún estilo aplicado, con los checkboxes/botones nativos del
 * navegador.
 *
 * El propio plugin expone el filtro 'fluent_booking/asset_listed_slugs' para
 * añadir excepciones a esa lista blanca sin tocar su código. Aquí solo se
 * añade el plugin de cookies (no el tema completo — el resto del CSS del
 * tema se sigue excluyendo a propósito, tal y como FluentBooking pretende,
 * para no romper el diseño de su propio dashboard).
 */

add_filter(
	'fluent_booking/asset_listed_slugs',
	function ( $slugs ) {
		$slugs[] = '\/gdpr-cookie-compliance\/';
		return $slugs;
	}
);
