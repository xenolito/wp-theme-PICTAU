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

/**
 * Detecta si la request actual es el dashboard standalone en frontend
 * (front-app.php, /bookings#/ — mismo slug configurable en Ajustes de
 * FluentBooking que usa FrontendRenderer::getFronendSlug(), replicado aquí
 * porque ese método es protected y no hay filtro público que exponga el
 * resultado). Se usa para que otros hooks del tema (p.ej. preload_fonts() en
 * template-functions.php) puedan saltarse a sí mismos en esta vista, ya que
 * el CSS del tema nunca llega aquí (ver el comentario de arriba) y cualquier
 * <link rel="preload"> de fuentes del tema queda sin usar (aviso en consola
 * "was preloaded... but not used").
 */
function pictau_is_fluent_booking_standalone_frontend(): bool {
	if ( ! class_exists( '\FluentBooking\App\Services\Helper' ) ) {
		return false;
	}

	$settings = \FluentBooking\App\Services\Helper::getPrefSettins();

	if ( empty( $settings['frontend']['enabled'] ) || 'yes' !== $settings['frontend']['enabled'] ) {
		return false;
	}

	$render_type = empty( $settings['frontend']['render_type'] ) ? 'standalone' : $settings['frontend']['render_type'];

	if ( 'standalone' !== $render_type || empty( $settings['frontend']['slug'] ) ) {
		return false;
	}

	global $wp;
	$uri_parts = array_values( array_filter( explode( '/', trim( $wp->request ?? '', '/' ) ) ) );

	return isset( $uri_parts[0] ) && $uri_parts[0] === $settings['frontend']['slug'];
}

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
 * Logo en la pantalla de login SIN sesión iniciada — el mismo filtro
 * ('fluent_booking/login_header', con alias deprecado 'fluent_boards/login_header'
 * que es el que se sigue usando aquí) se dispara en DOS pantallas distintas de
 * FluentBooking, y ambas comparten esta única función:
 *
 * 1. Dashboard embebido en wp-admin sin sesión (body.fluentboards_page_fluent_booking,
 *    AdminMenuHandler): SÍ carga el CSS del tema, por eso el resto del look
 *    (tarjeta, inputs, botón) se completa con la regla .fbs_login_form en
 *    tailwind/custom/components/fluentbooking.css.
 * 2. Dashboard standalone en frontend (body.fluent_booking_page, /bookings#/,
 *    FrontendRenderer::getAuthContent() en fluent-booking-pro): el CSS del
 *    tema NUNCA llega aquí — enqueueAssets() desencola en wp_print_styles
 *    (prioridad 999999) cualquier estilo cuyo src sea del tema o de otro
 *    plugin, y se llama incluso en la pantalla de login (renderFullApp()).
 *    Verificado con Playwright: solo se cargan fluent-booking/admin.css y el
 *    CSS de gdpr-cookie-compliance (whitelisted vía 'fluent_booking/asset_listed_slugs'
 *    más abajo). El resto del look de esta pantalla se completa más abajo con
 *    un <style> inline en el hook 'fluent_booking/front_head', que al no ser
 *    un <link> encolado no pasa por esa desencolación.
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

/**
 * Estilo de marca en la pantalla de login/landing del dashboard standalone en
 * frontend (body.fluent_booking_page, /bookings#/ — ver el comentario del
 * filtro 'fluent_boards/login_header' justo arriba para el porqué de este
 * hook en vez de CSS del tema). 'fluent_booking/front_head' se dispara dentro
 * de <head> en app/Views/front-app.php tanto con sesión iniciada como sin
 * ella, así que cualquier regla aquí aplica a toda la vista, no solo al login.
 */
add_action(
	'fluent_booking/front_head',
	function () {
		$brand_color = 'hsl(26, 100%, 50%)'; // mismo valor que --main-color (all-themes.css)
		?>
		<style>
			.fcal_login_form_heading {
				display: flex;
				flex-flow: column;
				align-items: center;
				row-gap: 1rem;
				line-height: 1.4;
				color: white;
				background: <?php echo esc_html( $brand_color ); ?> !important;
				font-weight: 400 !important;
			}

			.fcal_login_form .fbs_login_logo {
				max-width: 250px;
				margin-bottom: 1.5rem;
				filter: invert(1);
				/* filter: invert(61%) sepia(88%) saturate(1650%) hue-rotate(350deg) brightness(82%) contrast(227%); */
			}
			.button-primary {
				background: <?php echo esc_html( $brand_color ); ?> !important;
			}
		</style>
		<?php
	}
);

/**
 * Icono del equipo (Round Robin/Colectivo) en el calendario público
 * ([fluent_booking id="..."] embebido en páginas normales del tema, p.ej.
 * /demo/) — sustituye el avatar individual del anfitrión que atiende
 * (oculto vía .fcal_author_wrapper .fcal_author_list en fluentbooking.css)
 * por el icono del sitio (Personalizar → Identidad del sitio → Icono del
 * sitio), para no revelar quién en concreto atenderá la reserva.
 *
 * A diferencia de la página de confirmación o el login del dashboard, esta
 * vista sí es una página normal del tema (wp_head()/wp_footer() propios),
 * así que se inyecta como <style> en wp_head en vez de vía un filtro del
 * plugin. Se resuelve aquí y no en el CSS estático del tema porque
 * get_site_icon_url() no está disponible en un fichero .css, y una URL
 * hardcodeada en el CSS compilado arrastraría el dominio del entorno donde
 * se compiló (local vs producción).
 */
add_action(
	'wp_head',
	function () {
		if ( ! is_singular() || ! has_shortcode( get_post()->post_content, 'fluent_booking' ) ) {
			return;
		}

		$icon_url = get_site_icon_url();

		if ( ! $icon_url ) {
			return;
		}
		?>
		<style>
			.fcal_cal_wrap .fcal_author_wrapper::before {
				content: '';
				display: inline-block;
				width: 32px;
				height: 32px;
				border-radius: 50%;
				background: url('<?php echo esc_url( $icon_url ); ?>') center / cover no-repeat;
				vertical-align: middle;
			}
		</style>
		<?php
	}
);

