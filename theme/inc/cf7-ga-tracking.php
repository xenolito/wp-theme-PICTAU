<?php
/**
 * Seguimiento GA4 / GTM configurable por formulario Contact Form 7
 *
 * Añade una pestaña "Seguimiento GA4 / GTM" al editor de CF7 para activar,
 * por formulario, el envío de eventos de envío/conversión a window.dataLayer
 * (GTM) y/o window.gtag (GA4), detectados en tiempo de ejecución por
 * javascript/modules/contactForm7.js. El tema nunca carga GTM/GA4 por sí
 * mismo: solo envía eventos si ya están presentes en la página.
 *
 * Cargado condicionalmente desde utilities.php solo si CF7 está activo.
 *
 * @package pictau_tw
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Pictau_CF7_GA_Tracking {

	private static ?self $instance = null;

	public static function instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	private function __construct() {
		$this->init_hooks();
	}

	private function init_hooks(): void {
		add_filter( 'wpcf7_editor_panels', [ $this, 'add_editor_panel' ] );
		add_action( 'wpcf7_after_save', [ $this, 'save_editor_panel' ] );
		add_filter( 'wpcf7_form_hidden_fields', [ $this, 'inject_hidden_fields' ] );
	}

	// =========================================================================
	// ADMIN — Panel en el editor CF7
	// =========================================================================

	public function add_editor_panel( array $panels ): array {
		$panels['pct-ga-tracking'] = [
			'title'    => esc_html__( 'Seguimiento GA4 / GTM', 'pictau' ),
			'callback' => [ $this, 'render_editor_panel' ],
		];
		return $panels;
	}

	public function render_editor_panel( WPCF7_ContactForm $form ): void {
		$id = $form->id();

		$enabled          = (bool) get_post_meta( $id, '_pct_ga_enabled', true );
		$track_all_meta   = get_post_meta( $id, '_pct_ga_track_all_attempts', true );
		$track_all        = ( $track_all_meta === '' ) ? true : ( $track_all_meta === '1' );
		$submit_event     = get_post_meta( $id, '_pct_ga_submit_event', true );
		$lead_event       = get_post_meta( $id, '_pct_ga_lead_event', true );
		$value            = get_post_meta( $id, '_pct_ga_value', true );
		$currency         = get_post_meta( $id, '_pct_ga_currency', true );
		$default_source   = get_post_meta( $id, '_pct_ga_default_source', true );
		$default_medium   = get_post_meta( $id, '_pct_ga_default_medium', true );
		$default_campaign = get_post_meta( $id, '_pct_ga_default_campaign', true );
		?>
		<div class="pct-cf7-ga-tracking-panel" style="padding: 1em 0;">

			<h2 style="margin-top: 0;"><?php esc_html_e( 'Seguimiento GA4 / GTM', 'pictau' ); ?></h2>

			<p class="description">
				<?php esc_html_e( 'Esta pestaña nunca carga Google Tag Manager ni Google Analytics — eso lo gestiona siempre el plugin/módulo de cookies del sitio. Aquí solo se configura qué eventos enviar a window.dataLayer / window.gtag cuando ya están presentes en la página; si no lo están, no se envía nada y no se produce ningún error.', 'pictau' ); ?>
			</p>

			<p>
				<label>
					<input type="checkbox" name="pct_ga_enabled" value="1" <?php checked( $enabled ); ?> />
					<?php esc_html_e( 'Activar seguimiento GA4/GTM para este formulario', 'pictau' ); ?>
				</label>
			</p>

			<p>
				<label>
					<input type="checkbox" name="pct_ga_track_all_attempts" value="1" <?php checked( $track_all ); ?> />
					<?php esc_html_e( 'Registrar evento de envío en cualquier intento (incluso sin éxito)', 'pictau' ); ?>
				</label>
				<p class="description"><?php esc_html_e( 'Si lo desmarcas, el evento de envío solo se disparará junto con el de conversión, nunca en fallos o spam.', 'pictau' ); ?></p>
			</p>

			<table class="form-table">
				<tr>
					<th scope="row"><label for="pct_ga_submit_event"><?php esc_html_e( 'Evento de envío', 'pictau' ); ?></label></th>
					<td>
						<input type="text" id="pct_ga_submit_event" name="pct_ga_submit_event" class="regular-text" value="<?php echo esc_attr( $submit_event ); ?>" placeholder="form_submit" />
						<p class="description"><?php esc_html_e( 'Se dispara en cualquier intento de envío procesado por el servidor (éxito, fallo de correo, spam), salvo que desmarques la casilla de arriba.', 'pictau' ); ?></p>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="pct_ga_lead_event"><?php esc_html_e( 'Evento de conversión', 'pictau' ); ?></label></th>
					<td>
						<input type="text" id="pct_ga_lead_event" name="pct_ga_lead_event" class="regular-text" value="<?php echo esc_attr( $lead_event ); ?>" placeholder="generate_lead" />
						<p class="description"><?php esc_html_e( 'Se dispara solo si el envío tiene éxito. "generate_lead" es el nombre recomendado por GA4 para leads.', 'pictau' ); ?></p>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="pct_ga_value"><?php esc_html_e( 'Valor de conversión (opcional)', 'pictau' ); ?></label></th>
					<td>
						<input type="number" step="0.01" id="pct_ga_value" name="pct_ga_value" class="small-text" value="<?php echo esc_attr( $value ); ?>" />
						<input type="text" id="pct_ga_currency" name="pct_ga_currency" class="small-text" maxlength="3" value="<?php echo esc_attr( $currency ); ?>" placeholder="EUR" style="text-transform:uppercase; width:5em;" />
						<p class="description"><?php esc_html_e( 'Útil para pujas por valor en Google Ads. Deja el valor en blanco si no aplica.', 'pictau' ); ?></p>
					</td>
				</tr>
				<tr>
					<th scope="row"><?php esc_html_e( 'Fuente / Medio / Campaña por defecto', 'pictau' ); ?></th>
					<td>
						<input type="text" name="pct_ga_default_source" class="regular-text" value="<?php echo esc_attr( $default_source ); ?>" placeholder="<?php esc_attr_e( 'ej. website', 'pictau' ); ?>" style="margin-bottom:4px;" /><br />
						<input type="text" name="pct_ga_default_medium" class="regular-text" value="<?php echo esc_attr( $default_medium ); ?>" placeholder="<?php esc_attr_e( 'ej. organico', 'pictau' ); ?>" style="margin-bottom:4px;" /><br />
						<input type="text" name="pct_ga_default_campaign" class="regular-text" value="<?php echo esc_attr( $default_campaign ); ?>" placeholder="<?php esc_attr_e( 'ej. nombre del formulario', 'pictau' ); ?>" />
						<p class="description"><?php esc_html_e( 'Solo se usan cuando no llegan utm_source/utm_medium/utm_campaign reales por la URL (tráfico sin campaña activa). Si llegan por URL, esos valores siempre tienen prioridad.', 'pictau' ); ?></p>
					</td>
				</tr>
			</table>

		</div>
		<?php
	}

	// =========================================================================
	// ADMIN — Guardado
	// =========================================================================

	public function save_editor_panel( WPCF7_ContactForm $contact_form ): void {
		$id = $contact_form->id();

		$this->save_checkbox( $id, '_pct_ga_enabled', isset( $_POST['pct_ga_enabled'] ) );
		// A diferencia de los demás campos, se escribe siempre de forma explícita ('1'/'0'),
		// nunca se borra, para distinguir "nunca configurado" (por defecto marcado) de "desmarcado a propósito".
		update_post_meta( $id, '_pct_ga_track_all_attempts', isset( $_POST['pct_ga_track_all_attempts'] ) ? '1' : '0' );
		$this->save_text( $id, '_pct_ga_submit_event', $_POST['pct_ga_submit_event'] ?? '' );
		$this->save_text( $id, '_pct_ga_lead_event', $_POST['pct_ga_lead_event'] ?? '' );
		$this->save_number( $id, '_pct_ga_value', $_POST['pct_ga_value'] ?? '' );
		$this->save_currency( $id, '_pct_ga_currency', $_POST['pct_ga_currency'] ?? '' );
		$this->save_text( $id, '_pct_ga_default_source', $_POST['pct_ga_default_source'] ?? '' );
		$this->save_text( $id, '_pct_ga_default_medium', $_POST['pct_ga_default_medium'] ?? '' );
		$this->save_text( $id, '_pct_ga_default_campaign', $_POST['pct_ga_default_campaign'] ?? '' );
	}

	private function save_checkbox( int $post_id, string $meta_key, bool $checked ): void {
		update_post_meta( $post_id, $meta_key, $checked ? '1' : '' );
	}

	private function save_text( int $post_id, string $meta_key, $raw ): void {
		$value = sanitize_text_field( wp_unslash( (string) $raw ) );
		if ( $value === '' ) {
			delete_post_meta( $post_id, $meta_key );
		} else {
			update_post_meta( $post_id, $meta_key, $value );
		}
	}

	private function save_number( int $post_id, string $meta_key, $raw ): void {
		$raw = trim( (string) $raw );
		if ( $raw === '' || ! is_numeric( $raw ) ) {
			delete_post_meta( $post_id, $meta_key );
		} else {
			update_post_meta( $post_id, $meta_key, (string) floatval( $raw ) );
		}
	}

	private function save_currency( int $post_id, string $meta_key, $raw ): void {
		$value = strtoupper( substr( sanitize_text_field( wp_unslash( (string) $raw ) ), 0, 3 ) );
		if ( $value === '' ) {
			delete_post_meta( $post_id, $meta_key );
		} else {
			update_post_meta( $post_id, $meta_key, $value );
		}
	}

	// =========================================================================
	// FRONTEND — Exposición de la configuración vía hidden fields
	// =========================================================================

	public function inject_hidden_fields( array $hidden ): array {
		$form = WPCF7_ContactForm::get_current();
		if ( ! $form ) {
			return $hidden;
		}

		$id = $form->id();

		$track_all_meta = get_post_meta( $id, '_pct_ga_track_all_attempts', true );

		$hidden['pct_ga_enabled']            = get_post_meta( $id, '_pct_ga_enabled', true ) ? '1' : '';
		$hidden['pct_ga_track_all_attempts'] = ( $track_all_meta === '' || $track_all_meta === '1' ) ? '1' : '0';
		$hidden['pct_ga_submit_event']      = get_post_meta( $id, '_pct_ga_submit_event', true ) ?: 'form_submit';
		$hidden['pct_ga_lead_event']        = get_post_meta( $id, '_pct_ga_lead_event', true ) ?: 'generate_lead';
		$hidden['pct_ga_value']             = get_post_meta( $id, '_pct_ga_value', true );
		$hidden['pct_ga_currency']          = get_post_meta( $id, '_pct_ga_currency', true ) ?: 'EUR';
		$hidden['pct_ga_default_source']    = get_post_meta( $id, '_pct_ga_default_source', true );
		$hidden['pct_ga_default_medium']    = get_post_meta( $id, '_pct_ga_default_medium', true );
		$hidden['pct_ga_default_campaign']  = get_post_meta( $id, '_pct_ga_default_campaign', true );

		return $hidden;
	}
}

Pictau_CF7_GA_Tracking::instance();
