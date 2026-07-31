<?php
/**
 * Plantilla base para nuevos formularios Contact Form 7
 *
 * Añade una pestaña "Plantilla Base" al editor de CF7 con un botón que rellena
 * el contenido de las pestañas Formulario y Correo con una plantilla base
 * predefinida, para agilizar la creación de formularios nuevos.
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
				<?php esc_html_e( 'Rellena automáticamente el contenido de las pestañas "Formulario" y "Correo" con la plantilla base de contacto del tema.', 'pictau' ); ?>
			</p>
			<p class="description">
				<?php esc_html_e( 'Si esas pestañas ya tienen contenido, se pedirá confirmación antes de sobrescribirlo.', 'pictau' ); ?>
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
			$this->get_mail_template()
		);

		if ( $this->is_polylang_active() ) {
			$blocks .= $this->build_fill_button_script(
				'pct-cf7-template-fill-multilang',
				'pct-cf7-template-feedback-multilang',
				$this->get_form_template_multilang(),
				$this->get_mail_template_multilang()
			);
		}

		wp_add_inline_script( 'wpcf7-admin', "document.addEventListener('DOMContentLoaded', function () {\n{$blocks}});" );
	}

	/**
	 * Genera el bloque JS que engancha el click de un botón "rellenar plantilla"
	 * a un par de textareas (Formulario / Correo) del editor CF7.
	 */
	private function build_fill_button_script( string $button_id, string $feedback_id, string $form_template, string $mail_template ): string {
		$confirm_msg = esc_js( __( 'Esto sobrescribirá el contenido actual de las pestañas Formulario y Correo con la plantilla base. ¿Continuar?', 'pictau' ) );
		$done_msg    = esc_js( __( 'Plantilla aplicada. Revisa las pestañas Formulario y Correo, y recuerda guardar.', 'pictau' ) );

		return "(function () {
	var btn = document.getElementById('{$button_id}');
	if (!btn) return;

	btn.addEventListener('click', function () {
		var formEl = document.getElementById('wpcf7-form');
		var mailEl = document.getElementById('wpcf7-mail-body');
		if (!formEl || !mailEl) return;

		var hasContent = formEl.value.trim() !== '' || mailEl.value.trim() !== '';
		if (hasContent && !window.confirm('{$confirm_msg}')) return;

		formEl.value = " . wp_json_encode( $form_template ) . ";
		mailEl.value = " . wp_json_encode( $mail_template ) . ";

		formEl.dispatchEvent(new Event('change', { bubbles: true }));
		mailEl.dispatchEvent(new Event('change', { bubbles: true }));

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
  [select* empleados class:pct-select first_as_label "Empleados*" "1-10" "11-50" "51-100" "101-250" "Más de 250"]
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
Has recibido este lead desde: [_url]
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
  [select* empleados class:pct-select first_as_label "{Empleados*}" "{1-10}" "{11-50}" "{51-100}" "{101-250}" "{Más de 250}"]
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
Has recibido este lead desde: [_url]
MAIL;
	}
}

Pictau_CF7_Form_Template::instance();
