<?php
/**
 * Control custom del Customizer para el editor de cabeceras CSP.
 *
 * Cargado únicamente desde Pictau_CSP_Manager::register(), enganchado a
 * customize_register — para ese momento WP_Customize_Control ya está
 * disponible (core lo requiere antes de disparar ese hook).
 *
 * @package pictau_tw
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Pictau_Customize_CSP_Control extends WP_Customize_Control {

	public $type = 'pictau_csp_editor';

	public function render_content() {
		$manager = Pictau_CSP_Manager::instance();
		$current = $manager->get_current_block_content();
		$default = $manager->get_default_template();
		$value   = null !== $current ? $current : $default;
		$status  = $manager->get_status_info();
		?>
		<div class="pictau-csp-editor" data-marker-exists="<?php echo $status['exists'] ? '1' : '0'; ?>">
			<p class="pictau-csp-status description" <?php echo $status['style'] ? 'style="' . esc_attr( $status['style'] ) . '"' : ''; ?>>
				<?php echo $status['text']; // ya escapado por esc_html__() en get_status_info(). ?>
			</p>

			<textarea
				class="pictau-csp-textarea"
				rows="18"
				spellcheck="false"
				style="width:100%;font-family:Menlo,Consolas,monospace;font-size:11px;line-height:1.5;"
			><?php echo esc_textarea( $value ); ?></textarea>

			<p class="pictau-csp-actions">
				<button type="button" class="button pictau-csp-defaults">
					<?php esc_html_e( 'Usar valores por defecto del tema', 'pictau' ); ?>
				</button>
				<button type="button" class="button button-primary pictau-csp-apply">
					<?php esc_html_e( 'Aplicar cambios', 'pictau' ); ?>
				</button>
				<?php if ( $manager->has_backup() ) : ?>
					<button type="button" class="button pictau-csp-revert">
						<?php esc_html_e( 'Restaurar backup anterior', 'pictau' ); ?>
					</button>
				<?php endif; ?>
			</p>

			<ul class="pictau-csp-errors" style="display:none;color:#b32d2e;"></ul>
			<div class="pictau-csp-message" aria-live="polite"></div>
		</div>
		<?php
	}
}
