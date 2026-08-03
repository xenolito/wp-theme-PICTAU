<?php
/**
 * Control custom del Customizer con la vista previa de color + logo del email CF7.
 *
 * Cargado únicamente desde Pictau_CF7_Email_Branding::register(), enganchado a
 * customize_register — para ese momento WP_Customize_Control ya está
 * disponible (core lo requiere antes de disparar ese hook).
 *
 * @package pictau_tw
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Pictau_Customize_CF7_Email_Preview_Control extends WP_Customize_Control {

	public $type = 'pictau_cf7_email_preview';

	public function render_content() {
		$color_setting = $this->manager->get_setting( 'cf7_email_brand_color' );
		$logo_setting  = $this->manager->get_setting( 'cf7_email_logo' );

		$color = $color_setting ? $color_setting->value() : '';
		if ( ! $color ) {
			$color = pct_cf7_get_email_brand_color();
		}

		$logo_url        = $logo_setting ? $logo_setting->value() : '';
		$logo_attachment = $logo_url ? attachment_url_to_postid( $logo_url ) : 0;

		if ( ! $logo_attachment ) {
			// Sin logo de email configurado (o URL no resoluble): mismo fallback que el email real.
			$logo_attachment = pct_cf7_get_email_logo_attachment_id();
		}

		// Misma resolución que usa el email real (SVG -> PNG generado si es posible),
		// para que la vista previa muestre exactamente la imagen que se enviará.
		$logo_image = pct_cf7_get_effective_email_logo_image( $logo_attachment );
		$logo_url   = $logo_image ? $logo_image[0] : '';

		$warning = pct_cf7_get_email_logo_format_warning( $logo_attachment );
		?>
		<div class="pictau-cf7-email-preview">
			<p class="customize-control-title"><?php esc_html_e( 'Vista previa', 'pictau' ); ?></p>

			<div class="pictau-cf7-email-preview-box" style="background-color: <?php echo esc_attr( $color ); ?>;">
				<?php if ( $logo_url ) : ?>
					<img class="pictau-cf7-email-preview-logo" src="<?php echo esc_url( $logo_url ); ?>" alt="">
				<?php else : ?>
					<span class="pictau-cf7-email-preview-fallback-text"><?php echo esc_html( get_bloginfo( 'name' ) ); ?></span>
				<?php endif; ?>
			</div>

			<?php if ( $warning ) : ?>
				<p class="pictau-cf7-email-preview-format-notice pictau-cf7-email-preview-format-<?php echo esc_attr( $warning['level'] ); ?>">
					<?php echo 'warning' === $warning['level'] ? '⚠️ ' : 'ℹ️ '; ?><?php echo esc_html( $warning['message'] ); ?>
				</p>
			<?php endif; ?>

			<p class="description"><?php esc_html_e( 'Así se verán la cabecera y el pie del email de Contact Form 7.', 'pictau' ); ?></p>
		</div>
		<?php
	}
}
