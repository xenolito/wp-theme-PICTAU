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

/**
 * Marca (color + logo) en la página de confirmación/cancelación/reprogramación
 * de reservas de FluentBooking (?fluent-booking=booking&meeting_hash=...).
 *
 * Es una página HTML totalmente aparte (app/Views/landing/confirmation_page.php),
 * fuera del tema por completo (sin wp_head()/header.php) — solo carga el CSS
 * propio del plugin (public/saas_public.css), así que no hay ninguna variable
 * ni clase del tema disponible ahí. El plugin tampoco expone ningún ajuste de
 * marca (color/logo) para esta página — solo el tema claro/oscuro (Ajustes →
 * General → "Tema", en FluentBooking\App\Services\Helper::getGlobalSettings()).
 *
 * El propio plugin sí expone el filtro 'fluent_booking/booking_confirmation_page_vars'
 * (LandingPageHandler::showBookingConfimationPage()) para modificar los datos
 * de esta página sin tocar su código — aquí se usa para añadir un <style> con
 * el color de marca (sobreescribe --fcal_primary_color, la variable que usa
 * saas_public.css para enlaces/icono "reservado"/textos destacados — el botón
 * "Cancelar reserva" no la usa, va con un color fijo #292929 en el CSS del
 * plugin, así que se sobreescribe aparte) y el logo del sitio (Personalizar →
 * Identidad del sitio → Logo), centrado sobre la tarjeta vía ::before.
 */
add_filter(
	'fluent_booking/booking_confirmation_page_vars',
	function ( $data ) {
		$brand_color = '#fe6c00'; // mismo naranja de marca usado en el resto del tema (--main-color)
		$logo_id     = get_theme_mod( 'custom_logo' );
		$logo_url    = $logo_id ? wp_get_attachment_image_url( $logo_id, 'full' ) : false;

		ob_start();
		?>
		<style>
			:root, .fcal-dark-mode {
				--fcal_primary_color: <?php echo esc_html( $brand_color ); ?> !important;
			}
			.fcal_cancellation_wrap .fcal_btn.fcal_btn_primary {
				background-color: <?php echo esc_html( $brand_color ); ?> !important;
				border-color: <?php echo esc_html( $brand_color ); ?> !important;
			}
			<?php if ( $logo_url ) : ?>
			.confirmation_page .fcal_conf_wrap {
				position: relative;
				padding-top: 90px;
			}
			.confirmation_page .fcal_conf_wrap::before {
				content: "";
				position: absolute;
				top: 0px;
				left: 50%;
				width: 100%;
				height: 80px;
				aspect-ratio: 16/9;
				transform: translateX(-50%);
				background: url('<?php echo esc_url( $logo_url ); ?>') no-repeat center / contain;
				background-size: 50% auto;
				background-color: <?php echo esc_html( $brand_color ); ?>;
			}
			<?php endif; ?>
		</style>
		<?php
		$data['body'] .= ob_get_clean();

		return $data;
	}
);

/**
 * Logo en la pantalla de login del dashboard frontend de FluentBooking
 * (fluent-booking-pro) cuando se visita sin sesión iniciada — a diferencia
 * del dashboard ya autenticado o de la página de confirmación/cancelación,
 * esta vista SÍ carga el CSS del tema (ver la regla .fbs_login_form en
 * tailwind/custom/components/style.css), así que el logo se resuelve más
 * simple inyectándolo aquí, vía el único filtro que expone el plugin para
 * esta pantalla (FrontendRenderer::getAuthContent()), en vez de por CSS.
 */
add_filter(
	'fluent_boards/login_header',
	function ( $heading ) {
		$logo_id  = get_theme_mod( 'custom_logo' );
		$logo_url = $logo_id ? wp_get_attachment_image_url( $logo_id, 'full' ) : false;

		if ( ! $logo_url ) {
			return $heading;
		}

		return '<img class="fbs_login_logo" src="' . esc_url( $logo_url ) . '" alt="' . esc_attr( get_bloginfo( 'name' ) ) . '" />' . $heading;
	}
);

