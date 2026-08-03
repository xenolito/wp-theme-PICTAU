<?php
/**
 * Sección "CF7 emails" en el Customizer: color y logo del email HTML de CF7.
 *
 * Registra, dentro del panel PICTAU, un color de fondo compartido para la
 * cabecera y el pie del email de Contact Form 7, un selector de logo dedicado
 * (media uploader nativo, por defecto usa el mismo custom_logo del sitio) y un
 * control custom con la vista previa en vivo (color + logo + aviso de formato
 * no seguro para Outlook).
 *
 * La resolución de valores (con su cadena de fallback) vive en
 * theme/inc/cf7_html_email_templates.php, no aquí — ese archivo se carga
 * siempre (con o sin CF7 activo), mientras que esta sección de Customizer solo
 * tiene sentido mostrarla si CF7 está activo.
 *
 * Cargado condicionalmente desde utilities.php solo si CF7 está activo.
 *
 * @package pictau_tw
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Pictau_CF7_Email_Branding {

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
		add_action( 'customize_register', [ $this, 'register' ] );
		add_action( 'customize_controls_enqueue_scripts', [ $this, 'enqueue_control_assets' ] );
	}

	// =========================================================================
	// CUSTOMIZER
	// =========================================================================

	public function register( WP_Customize_Manager $wp_customize ): void {
		require_once __DIR__ . '/cf7-email-branding-control.php';

		$wp_customize->add_section( 'pictau_cf7_email_branding', [
			'title'       => esc_html__( 'CF7 emails', 'pictau' ),
			'panel'       => 'PICTAU',
			'description' => esc_html__( 'Color de fondo y logo del email HTML de Contact Form 7 (cabecera y pie). Si no se configura nada aquí, se usa un color por defecto y el logo general del sitio.', 'pictau' ),
		] );

		$wp_customize->add_setting( 'cf7_email_brand_color', [
			'default'           => pct_cf7_get_email_brand_color(),
			'sanitize_callback' => 'sanitize_hex_color',
			'transport'         => 'refresh',
		] );

		$wp_customize->add_control(
			new WP_Customize_Color_Control( $wp_customize, 'cf7_email_brand_color', [
				'label'    => esc_html__( 'Color de fondo (cabecera y pie)', 'pictau' ),
				'section'  => 'pictau_cf7_email_branding',
				'settings' => 'cf7_email_brand_color',
			] )
		);

		$wp_customize->add_setting( 'cf7_email_logo', [
			'default'           => '',
			'sanitize_callback' => 'esc_url_raw',
			'transport'         => 'refresh',
		] );

		$wp_customize->add_control(
			new WP_Customize_Image_Control( $wp_customize, 'cf7_email_logo', [
				'label'       => esc_html__( 'Logo del email', 'pictau' ),
				'description' => esc_html__( 'Si no se selecciona ninguno, se usa el logo general del sitio (Identidad del sitio).', 'pictau' ),
				'section'     => 'pictau_cf7_email_branding',
				'settings'    => 'cf7_email_logo',
			] )
		);

		$wp_customize->add_control(
			new Pictau_Customize_CF7_Email_Preview_Control( $wp_customize, 'pictau_cf7_email_preview', [
				'section'  => 'pictau_cf7_email_branding',
				'settings' => 'cf7_email_brand_color',
				'priority' => 30,
			] )
		);
	}

	// =========================================================================
	// ADMIN — JS del panel de controles (preview reactivo)
	// =========================================================================

	public function enqueue_control_assets(): void {
		wp_enqueue_script(
			'pictau-cf7-email-branding-control',
			get_stylesheet_directory_uri() . '/customizer/cf7-email-branding-control.js',
			[ 'jquery', 'customize-controls' ],
			wp_get_theme()->get( 'Version' ),
			true
		);

		$default_logo_id  = pct_cf7_get_email_logo_attachment_id();
		$default_logo_img = $default_logo_id ? wp_get_attachment_image_src( $default_logo_id, 'medium' ) : false;

		wp_localize_script(
			'pictau-cf7-email-branding-control',
			'pictauCf7EmailBranding',
			[
				'defaultLogoUrl'         => $default_logo_img ? $default_logo_img[0] : '',
				'siteName'               => get_bloginfo( 'name' ),
				'svgConversionSupported' => pct_cf7_email_svg_conversion_supported(),
				'i18n'                   => [
					'svgConvertible'    => esc_html__( 'Logo en SVG: se genera automáticamente una versión PNG para Outlook y el resto de clientes de correo. Conversión disponible en este servidor.', 'pictau' ),
					'svgNotConvertible' => esc_html__( 'Logo en SVG y este servidor no puede convertirlo automáticamente a PNG (sin Imagick ni binarios de conversión disponibles). Outlook no lo mostrará — sube manualmente una versión en JPG, PNG o WEBP.', 'pictau' ),
					'unsafeFormat'      => esc_html__( 'Formato de imagen no recomendado para email (Outlook y otros clientes pueden no mostrarlo correctamente). Usa JPG, PNG o WEBP.', 'pictau' ),
				],
			]
		);
	}
}

Pictau_CF7_Email_Branding::instance();
