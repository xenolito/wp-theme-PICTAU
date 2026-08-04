<?php
/**
 * Plantilla base para nuevos formularios Contact Form 7
 *
 * Añade una pestaña "Plantilla Base" al editor de CF7 con un botón que rellena
 * el contenido de las pestañas Formulario, Correo y Correo (2) con una plantilla
 * base predefinida, para agilizar la creación de formularios nuevos.
 *
 * Cargado condicionalmente desde utilities.php solo si CF7 está activo.
 *
 * @package pictau_tw
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Pictau_CF7_Form_Template {

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
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_editor_scripts' ] );
	}

	// =========================================================================
	// ADMIN — Panel en el editor CF7
	// =========================================================================

	/**
	 * Añade la pestaña "Plantilla Base" en el editor de formularios CF7.
	 *
	 * @param array $panels
	 * @return array
	 */
	public function add_editor_panel( array $panels ): array {
		$panels['pct-form-template'] = [
			'title'    => esc_html__( 'Plantilla Base', 'pictau' ),
			'callback' => [ $this, 'render_editor_panel' ],
		];
		return $panels;
	}

	/**
	 * Renderiza el contenido de la pestaña Plantilla en el editor CF7.
	 *
	 * @param WPCF7_ContactForm $form
	 */
	public function render_editor_panel( WPCF7_ContactForm $form ): void {
		?>
		<div class="pct-cf7-template-panel" style="padding: 1em 0;">

			<h2 style="margin-top: 0;"><?php esc_html_e( 'Plantilla base', 'pictau' ); ?></h2>

			<p>
				<?php esc_html_e( 'Rellena automáticamente el contenido de las pestañas "Formulario", "Correo" y "Correo (2)" con la plantilla base de contacto del tema.', 'pictau' ); ?>
			</p>
			<p class="description">
				<?php esc_html_e( 'Los campos de "Correo (2)" se rellenan aunque no esté activada su casilla "Usar correo electrónico (2)", por si se activa más adelante. El campo "De" de Correo (2) no se toca: se deja el valor automático de CF7. Si esas pestañas ya tienen contenido, se pedirá confirmación antes de sobrescribirlo.', 'pictau' ); ?>
			</p>

			<p style="margin-top: 1.5em;">
				<button type="button" id="pct-cf7-template-fill" class="button button-primary">
					<?php esc_html_e( 'Rellenar con plantilla base', 'pictau' ); ?>
				</button>
				<span id="pct-cf7-template-feedback" style="margin-left: 0.75em; display: none; font-style: italic;"></span>
			</p>

			<?php if ( $this->is_polylang_active() ) : ?>
				<p>
					<button type="button" id="pct-cf7-template-fill-multilang" class="button button-secondary">
						<?php esc_html_e( 'Rellenar con plantilla base Multiidioma', 'pictau' ); ?>
					</button>
					<span id="pct-cf7-template-feedback-multilang" style="margin-left: 0.75em; display: none; font-style: italic;"></span>
				</p>
				<p class="description">
					<?php esc_html_e( 'Igual que la anterior, pero con los textos envueltos en {llaves} para que sean traducibles con Polylang (ver pestaña Polylang).', 'pictau' ); ?>
				</p>
			<?php endif; ?>

		</div>
		<?php
	}

	/**
	 * Comprueba si Polylang está activo, mismo criterio que cf7-polylang.php.
	 */
	private function is_polylang_active(): bool {
		return function_exists( 'pll_register_string' );
	}

	// =========================================================================
	// ADMIN — JS del editor
	// =========================================================================

	public function enqueue_editor_scripts(): void {
		$screen = get_current_screen();
		if ( ! $screen || false === strpos( $screen->id, 'wpcf7' ) ) {
			return;
		}

		$blocks = $this->build_fill_button_script(
			'pct-cf7-template-fill',
			'pct-cf7-template-feedback',
			$this->get_form_template(),
			$this->get_mail_template(),
			$this->get_mail_2_subject(),
			$this->get_mail_2_body()
		);

		if ( $this->is_polylang_active() ) {
			$blocks .= $this->build_fill_button_script(
				'pct-cf7-template-fill-multilang',
				'pct-cf7-template-feedback-multilang',
				$this->get_form_template_multilang(),
				$this->get_mail_template_multilang(),
				$this->get_mail_2_subject_multilang(),
				$this->get_mail_2_body_multilang()
			);
		}

		wp_add_inline_script( 'wpcf7-admin', "document.addEventListener('DOMContentLoaded', function () {\n{$blocks}});" );
	}

	/**
	 * Genera el bloque JS que engancha el click de un botón "rellenar plantilla"
	 * a los textareas/inputs de Formulario, Correo y Correo (2) del editor CF7.
	 *
	 * El campo "De" de Correo (2) (`#wpcf7-mail-2-sender`) y su checkbox de activación
	 * (`#wpcf7-mail-2-active`) nunca se tocan: el primero se deja con el valor automático
	 * que ya trae CF7, y el segundo lo decide el usuario — solo se dejan los campos
	 * rellenos por si los activa más tarde.
	 */
	private function build_fill_button_script( string $button_id, string $feedback_id, string $form_template, string $mail_template, string $mail_2_subject, string $mail_2_body ): string {
		$confirm_msg = esc_js( __( 'Esto sobrescribirá el contenido actual de las pestañas Formulario, Correo y Correo (2) con la plantilla base. ¿Continuar?', 'pictau' ) );
		$done_msg    = esc_js( __( 'Plantilla aplicada. Revisa las pestañas Formulario, Correo y Correo (2), y recuerda guardar.', 'pictau' ) );

		return "(function () {
	var btn = document.getElementById('{$button_id}');
	if (!btn) return;

	btn.addEventListener('click', function () {
		var formEl = document.getElementById('wpcf7-form');
		var mailEl = document.getElementById('wpcf7-mail-body');
		var headersEl = document.getElementById('wpcf7-mail-additional-headers');
		var mail2RecipientEl = document.getElementById('wpcf7-mail-2-recipient');
		var mail2SubjectEl = document.getElementById('wpcf7-mail-2-subject');
		var mail2BodyEl = document.getElementById('wpcf7-mail-2-body');
		if (!formEl || !mailEl) return;

		var hasContent = formEl.value.trim() !== '' || mailEl.value.trim() !== '' || (mail2BodyEl && mail2BodyEl.value.trim() !== '');
		if (hasContent && !window.confirm('{$confirm_msg}')) return;

		formEl.value = " . wp_json_encode( $form_template ) . ";
		mailEl.value = " . wp_json_encode( $mail_template ) . ";

		formEl.dispatchEvent(new Event('change', { bubbles: true }));
		mailEl.dispatchEvent(new Event('change', { bubbles: true }));

		if (headersEl) {
			headersEl.value = " . wp_json_encode( $this->get_mail_additional_headers() ) . ";
			headersEl.dispatchEvent(new Event('change', { bubbles: true }));
		}

		if (mail2RecipientEl) {
			mail2RecipientEl.value = " . wp_json_encode( $this->get_mail_2_recipient() ) . ";
			mail2RecipientEl.dispatchEvent(new Event('change', { bubbles: true }));
		}

		if (mail2SubjectEl) {
			mail2SubjectEl.value = " . wp_json_encode( $mail_2_subject ) . ";
			mail2SubjectEl.dispatchEvent(new Event('change', { bubbles: true }));
		}

		if (mail2BodyEl) {
			mail2BodyEl.value = " . wp_json_encode( $mail_2_body ) . ";
			mail2BodyEl.dispatchEvent(new Event('change', { bubbles: true }));
		}

		var feedback = document.getElementById('{$feedback_id}');
		if (feedback) {
			feedback.textContent = '{$done_msg}';
			feedback.style.display = 'inline';
		}
	});
})();
";
	}

	// =========================================================================
	//! Plantilla base
	// =========================================================================

	/**
	 * Copia del formulario "Lead" (post 76992, hash b3cd5c0), el formulario que
	 * alimenta el modal `lead` del sitio. Para actualizar la plantilla cuando ese
	 * formulario cambie, basta con volver a copiar su contenido en estos dos métodos.
	 */
	private function get_form_template(): string {
		return <<<'FORM'
<div class="pct-form-pasti">
  [text* nombre placeholder "Nombre y Apellidos*"]
  [text* empresa placeholder "Empresa*"]
  [email* email placeholder "Email*"]
  [text* telefono placeholder "Teléfono*"]
  [text* provincia placeholder "Provincia*"]
  <label for="pct-select-empleados" class="sr-only">Empleados</label>
  [select* empleados id:pct-select-empleados class:pct-select first_as_label "Empleados*" "1-10" "11-50" "51-100" "101-250" "Más de 250"]
  [hidden producto]

  <div class="pct-form-2cols">
  <h3>Áreas que quieres mejorar</h3>
  [checkbox area-interes-ventas use_label_element "Ventas"]
  [checkbox area-interes-margenes use_label_element "Márgenes"]
  [checkbox area-interes-finanzas use_label_element "Finanzas"]
  [checkbox area-interes-stock use_label_element "Stock"]
  [checkbox area-interes-crm use_label_element "CRM"]
  [checkbox area-interes-operaciones use_label_element "Operaciones"]
  [checkbox area-interes-reporting use_label_element "Reporting"]
  [checkbox area-interes-otro use_label_element "Otro"]
  </div>

  <div>
    <div class="legal-content"><span class="pct-form-element pct-legal">[checkbox* legal-check id:legal-input class:pct-legal-acceptance "legal-acceptance"]<label class="pct-label-for-legal" for="legalinput-cf"><span class="display-as-block"><i class="ico-unchecked"></i><i class="ico-checked"></i></span><span class="display-as-block">Al enviar este formulario confirmo que he leído y acepto la <a class="pct-lk-privacidad" href="/politica-privacidad" style="text-decoration:underline">Política de Privacidad</a></span></label></span></div><div><button id="submit" class="wpcf7-form-control wpcf7-submit bg-bt-submit"><span>Enviar</span> <i class="fas fa-cog fa-spin"></i></button></div>[response]</div>
  </div>

<div data-modal="contacto-msg-sent-ok">
  <h3>Gracias por tu Mensaje</h3>
  <p>¡Nos pondremos en contacto contigo lo antes posible!</p>
</div>
FORM;
	}

	/**
	 * Cabeceras adicionales del correo. CF7 precarga "Reply-To: [your-email]"
	 * por defecto en formularios nuevos, pero el campo de email de esta plantilla
	 * se llama [email], no [your-email] — hay que sobrescribir la cabecera para
	 * que el Reply-To apunte al campo real. Común a la plantilla normal y a la
	 * multiidioma (no lleva texto traducible).
	 */
	private function get_mail_additional_headers(): string {
		return 'Reply-To: [email]';
	}

	/**
	 * Destinatario de Correo (2) (autorespuesta al propio remitente del formulario).
	 * Común a la plantilla normal y a la multiidioma — no lleva texto traducible.
	 */
	private function get_mail_2_recipient(): string {
		return '[email]';
	}

	private function get_mail_2_subject(): string {
		return 'Gracias por contactar con [_site_title]';
	}

	private function get_mail_2_body(): string {
		return <<<'MAIL2'
<h2>¡Gracias por contactar con nosotros!</h2>
<p>Gracias por tu interés, [nombre].<br>Hemos recibido tu solicitud.<br> En breve nos pondremos en contacto contigo.</p>
MAIL2;
	}

	private function get_mail_2_subject_multilang(): string {
		return '{Gracias por contactar con} [_site_title]';
	}

	private function get_mail_2_body_multilang(): string {
		return <<<'MAIL2'
<h2>{¡Gracias por contactar con nosotros!}</h2>
<p>{Gracias por tu interés}, [nombre].<br>{Hemos recibido tu solicitud.}<br> {En breve nos pondremos en contacto contigo.}</p>
MAIL2;
	}

	private function get_mail_template(): string {
		return <<<'MAIL'
<strong>De:</strong> [nombre] --> [email]<br>
<strong>Empresa:</strong> [empresa]<br>
<strong>Provincia:</strong> [provincia]<br>
<strong>Empleados:</strong> [empleados]<br>
<strong>Teléfono:</strong> [telefono]<br>
<strong>Producto:</strong> [producto]<br>
<h3>Areas de interés:</h3>
[area-interes-ventas]<br>
[area-interes-margenes]<br>
[area-interes-finanzas]<br>
[area-interes-stock]<br>
[area-interes-crm]<br>
[area-interes-operaciones]<br>
[area-interes-reporting]<br>
[area-interes-otro]
<br><br>
<hr><br>
Has recibido este lead desde: [pagina_url]
MAIL;
	}

	// =========================================================================
	//! Plantilla base — versión Multiidioma (tokens {} para Polylang)
	// =========================================================================

	/**
	 * Misma base que get_form_template()/get_mail_template() (formulario "Lead",
	 * post 76992, hash b3cd5c0), con los textos envueltos en {llaves} para que
	 * theme/inc/cf7-polylang.php los registre automáticamente como strings
	 * traducibles en Polylang. El cuerpo del correo no lleva llaves (no se
	 * traduce, es la notificación interna al admin del sitio).
	 */
	private function get_form_template_multilang(): string {
		return <<<'FORM'
<div class="pct-form-pasti">
  [text* nombre placeholder "{Nombre y Apellidos}*"]
  [text* empresa placeholder "{Empresa}*"]
  [email* email placeholder "Email*"]
  [text* telefono placeholder "{Teléfono}*"]
  [text* provincia placeholder "{Provincia}*"]
  <label for="pct-select-empleados-ml" class="sr-only">{Empleados}</label>
  [select* empleados id:pct-select-empleados-ml class:pct-select first_as_label "{Empleados*}" "{1-10}" "{11-50}" "{51-100}" "{101-250}" "{Más de 250}"]
  [hidden producto]

  <div class="pct-form-2cols">
  <h3>{Áreas que quieres mejorar}</h3>
  [checkbox area-interes-ventas use_label_element "{Ventas}"]
  [checkbox area-interes-margenes use_label_element "{Márgenes}"]
  [checkbox area-interes-finanzas use_label_element "{Finanzas}"]
  [checkbox area-interes-stock use_label_element "{Stock}"]
  [checkbox area-interes-crm use_label_element "{CRM}"]
  [checkbox area-interes-operaciones use_label_element "{Operaciones}"]
  [checkbox area-interes-reporting use_label_element "{Reporting}"]
  [checkbox area-interes-otro use_label_element "{Otro}"]
  </div>

  <div>
    <div class="legal-content"><span class="pct-form-element pct-legal">[checkbox* legal-check id:legal-input class:pct-legal-acceptance "legal-acceptance"]<label class="pct-label-for-legal" for="legalinput-cf"><span class="display-as-block"><i class="ico-unchecked"></i><i class="ico-checked"></i></span><span class="display-as-block">{Al enviar este formulario confirmo que he leído y acepto la}  <a class="pct-lk-privacidad" {href="/politica-privacidad"} style="text-decoration:underline">{Política de Privacidad}</a></span></label></span></div><div><button id="submit" class="wpcf7-form-control wpcf7-submit bg-bt-submit"><span>{Enviar}</span> <i class="fas fa-cog fa-spin"></i></button></div>[response]</div>
  </div>

<div data-modal="contacto-msg-sent-ok">
  <h3>{Gracias por tu Mensaje}</h3>
  <p>{¡Nos pondremos en contacto contigo lo antes posible!}</p>
</div>
FORM;
	}

	private function get_mail_template_multilang(): string {
		return <<<'MAIL'
<strong>De:</strong> [nombre] --> [email]<br>
<strong>Empresa:</strong> [empresa]<br>
<strong>Provincia:</strong> [provincia]<br>
<strong>Empleados:</strong> [empleados]<br>
<strong>Teléfono:</strong> [telefono]<br>
<strong>Producto:</strong> [producto]<br>
<h3>Areas de interés:</h3>
[area-interes-ventas]<br>
[area-interes-margenes]<br>
[area-interes-finanzas]<br>
[area-interes-stock]<br>
[area-interes-crm]<br>
[area-interes-operaciones]<br>
[area-interes-reporting]<br>
[area-interes-otro]
<br><br>
<hr><br>
Has recibido este lead desde: [pagina_url]
MAIL;
	}
}

Pictau_CF7_Form_Template::instance();
