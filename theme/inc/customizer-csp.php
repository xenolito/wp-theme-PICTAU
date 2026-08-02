<?php
/**
 * Gestión de cabeceras Content-Security-Policy (CSP) vía .htaccess desde el Theme Customizer.
 *
 * Añade una sección "Seguridad (CSP)" al panel PICTAU. La casilla de activación
 * solo revela el editor; el contenido nunca se escribe en el .htaccess hasta que
 * el usuario pulsa "Aplicar cambios" (AJAX explícito, no ligado a "Publicar").
 *
 * Medidas de seguridad:
 * - Solo usuarios con capability 'manage_options'.
 * - Nonce dedicado, distinto del nonce estándar del Customizer.
 * - Whitelist estricta de directivas permitidas (Header/IfModule mod_headers/SetEnvIf/comentarios).
 * - Backup automático (opción + copia física .htaccess.pictau-bak) antes de cada escritura.
 * - Auto-verificación (petición HTTP interna a la home) tras escribir, con rollback
 *   automático si el sitio deja de responder correctamente.
 *
 * @package pictau_tw
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Pictau_CSP_Manager {

	const MARKER_CSP      = 'Pictau CSP';
	const MARKER_SECURITY = 'Pictau Security Rules';
	const OPTION_BACKUP   = 'pictau_csp_last_backup';
	const OPTION_CURRENT  = 'pictau_csp_current_content';
	const SETTING_ENABLED = 'pictau_csp_enabled';
	const NONCE_ACTION    = 'pictau_csp_action';
	const MAX_LENGTH      = 8000;

	/**
	 * Patrones de línea permitidos dentro del bloque CSP editable.
	 * Cualquier línea que no encaje con ninguno se rechaza.
	 */
	const ALLOWED_LINE_PATTERNS = array(
		'/^\s*$/',                                             // línea vacía
		'/^\s*#.*$/',                                          // comentario
		'/^\s*<IfModule\s+mod_headers\.c>\s*$/i',
		'/^\s*<\/IfModule>\s*$/i',
		'/^\s*SetEnvIf(NoCase)?\s+\S+\s+.+$/i',
		'/^\s*Header\s+(always\s+set|set|append|unset|edit|merge)\s+\S+.*$/i',
	);

	/**
	 * Nombres de cabecera que este tema gestiona. Se usan para detectar
	 * directivas Header preexistentes fuera de los marcadores propios
	 * (añadidas a mano o por otro plugin antes de usar esta funcionalidad).
	 */
	const MANAGED_HEADER_NAMES = array(
		'Content-Security-Policy',
		'X-Content-Type-Options',
		'Cross-Origin-Opener-Policy',
		'Cross-Origin-Resource-Policy',
		'Permissions-Policy',
		'Strict-Transport-Security',
	);

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
		add_action( 'customize_register', array( $this, 'register' ) );
		add_action( 'customize_controls_enqueue_scripts', array( $this, 'enqueue_control_assets' ) );
		add_action( 'customize_save_' . self::SETTING_ENABLED, array( $this, 'maybe_disable_on_save' ) );
		add_action( 'admin_notices', array( $this, 'maybe_render_sync_notice' ) );

		add_action( 'wp_ajax_pictau_csp_apply', array( $this, 'ajax_apply' ) );
		add_action( 'wp_ajax_pictau_csp_revert', array( $this, 'ajax_revert' ) );
	}

	/**
	 * Aviso en todo wp-admin (para usuarios manage_options) que combina dos
	 * situaciones a vigilar:
	 * - CSP "activada" en BD pero sin aplicar en el .htaccess de este servidor
	 *   (típico tras restaurar solo la BD, p.ej. UpdraftPlus, en una migración).
	 * - Directivas de cabecera preexistentes fuera del bloque del tema (añadidas
	 *   a mano o por otro plugin) que podrían entrar en conflicto con la CSP.
	 * Se repite en cada carga de admin a propósito: es un recordatorio, no una
	 * alerta puntual descartable.
	 */
	public function maybe_render_sync_notice(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$out_of_sync = $this->is_out_of_sync();
		$foreign     = $this->get_foreign_header_directives();

		if ( ! $out_of_sync && empty( $foreign ) ) {
			return;
		}
		?>
		<div class="notice notice-warning">
			<p><strong><?php esc_html_e( 'Pictau — Seguridad (CSP)', 'pictau' ); ?></strong></p>
			<?php if ( $out_of_sync ) : ?>
				<p><?php esc_html_e( 'La gestión de cabeceras CSP está marcada como activa, pero este servidor no tiene ninguna directiva escrita en su .htaccess (habitual tras restaurar solo la base de datos en una migración). Ve a Apariencia → Personalizar → THEME CUSTOMIZER → Seguridad (CSP) y pulsa "Aplicar cambios" para escribirla en este servidor.', 'pictau' ); ?></p>
			<?php endif; ?>
			<?php if ( ! empty( $foreign ) ) : ?>
				<p><?php esc_html_e( 'Se han detectado directivas de cabecera (CSP u otras) en el .htaccess fuera del bloque gestionado por el tema — posiblemente añadidas a mano o por otro plugin. El editor de Seguridad (CSP) no las modifica ni las elimina; revísalas manualmente, ya que podrían entrar en conflicto con la política gestionada por el tema:', 'pictau' ); ?></p>
				<ul style="font-family:Menlo,Consolas,monospace;font-size:11px;">
					<?php foreach ( $foreign as $line ) : ?>
						<li><?php echo esc_html( $line ); ?></li>
					<?php endforeach; ?>
				</ul>
			<?php endif; ?>
		</div>
		<?php
	}

	// =========================================================================
	// CUSTOMIZER
	// =========================================================================

	public function register( WP_Customize_Manager $wp_customize ): void {
		if ( ! $this->is_environment_supported() ) {
			return;
		}

		require_once __DIR__ . '/customizer-csp-control.php';

		$description = esc_html__( 'Gestiona la cabecera Content-Security-Policy y cabeceras de seguridad adicionales, escritas directamente en el .htaccess del sitio. Los cambios del editor no se aplican hasta pulsar "Aplicar cambios".', 'pictau' );

		$foreign = $this->get_foreign_header_directives();

		if ( ! empty( $foreign ) ) {
			$description .= '<p style="color:#b32d2e;font-weight:600;">'
				. esc_html__( '⚠️ Se han detectado directivas de cabecera ya existentes en el .htaccess, fuera de este bloque (añadidas a mano o por otro plugin). Este editor no las modifica ni las elimina — revísalas y elimínalas manualmente si entran en conflicto, o "Aplicar cambios" se rechazará hasta entonces:', 'pictau' )
				. '</p><ul style="font-family:Menlo,Consolas,monospace;font-size:11px;font-weight:normal;color:#b32d2e;">';

			foreach ( $foreign as $line ) {
				$description .= '<li>' . esc_html( $line ) . '</li>';
			}

			$description .= '</ul>';
		}

		$wp_customize->add_section(
			'pictau_csp',
			array(
				'title'       => esc_html__( 'Seguridad (CSP)', 'pictau' ),
				'panel'       => 'PICTAU',
				'priority'    => 200,
				'description' => $description,
			)
		);

		$wp_customize->add_setting(
			self::SETTING_ENABLED,
			array(
				'default'           => false,
				'sanitize_callback' => 'rest_sanitize_boolean',
				'capability'        => 'manage_options',
				'transport'         => 'refresh',
			)
		);

		$wp_customize->add_control(
			self::SETTING_ENABLED,
			array(
				'type'        => 'checkbox',
				'section'     => 'pictau_csp',
				'label'       => esc_html__( 'Activar gestión de cabeceras CSP para este sitio', 'pictau' ),
				'description' => esc_html__( 'Al marcarla se muestra el editor de la política. No se escribe nada en el .htaccess hasta pulsar "Aplicar cambios".', 'pictau' ),
			)
		);

		$wp_customize->add_control(
			new Pictau_Customize_CSP_Control(
				$wp_customize,
				'pictau_csp_editor',
				array(
					'section'         => 'pictau_csp',
					'settings'        => self::SETTING_ENABLED,
					'active_callback' => static function () use ( $wp_customize ) {
						$setting = $wp_customize->get_setting( self::SETTING_ENABLED );
						return $setting && (bool) $setting->value();
					},
				)
			)
		);
	}

	public function enqueue_control_assets(): void {
		if ( ! $this->is_environment_supported() ) {
			return;
		}

		wp_enqueue_script(
			'pictau-csp-control',
			get_stylesheet_directory_uri() . '/customizer/csp-control.js',
			array(),
			wp_get_theme()->get( 'Version' ),
			true
		);

		wp_localize_script(
			'pictau-csp-control',
			'pictauCspData',
			array(
				'ajaxUrl'         => admin_url( 'admin-ajax.php' ),
				'nonce'           => wp_create_nonce( self::NONCE_ACTION ),
				'defaultTemplate' => $this->get_default_template(),
				'i18n'            => array(
					'confirmApply'  => esc_html__( '¿Seguro que quieres aplicar estas directivas al .htaccess del sitio? Se creará una copia de seguridad automática y se verificará que el sitio sigue respondiendo.', 'pictau' ),
					'confirmRevert' => esc_html__( '¿Restaurar la copia de seguridad anterior?', 'pictau' ),
					'applying'      => esc_html__( 'Aplicando y verificando…', 'pictau' ),
					'reverting'     => esc_html__( 'Restaurando…', 'pictau' ),
					'genericError'  => esc_html__( 'Ha ocurrido un error inesperado.', 'pictau' ),
					'revertLabel'   => esc_html__( 'Restaurar backup anterior', 'pictau' ),
				),
			)
		);
	}

	/**
	 * Si se desmarca la casilla y se publica desde el Customizer, se elimina
	 * de verdad el bloque CSP del .htaccess (con backup + auto-verificación).
	 * Marcarla no escribe nada — solo la desactivación tiene efecto inmediato aquí.
	 */
	public function maybe_disable_on_save( WP_Customize_Setting $setting ): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		// $setting->value() aún devuelve el valor previo aquí (update() todavía no
		// se ha ejecutado); post_value() es el nuevo valor que se va a persistir.
		if ( $setting->post_value() ) {
			return;
		}

		if ( null === $this->get_current_block_content() ) {
			return; // no había nada que quitar
		}

		$this->backup_current_state();

		if ( $this->remove_csp_block() ) {
			delete_option( self::OPTION_CURRENT );

			if ( ! $this->self_test() ) {
				$this->restore_backup();
			}
		}
	}

	// =========================================================================
	// AJAX
	// =========================================================================

	public function ajax_apply(): void {
		check_ajax_referer( self::NONCE_ACTION, 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => esc_html__( 'Sin permisos suficientes.', 'pictau' ) ), 403 );
		}

		if ( ! $this->is_environment_supported() ) {
			wp_send_json_error( array( 'message' => esc_html__( 'El fichero .htaccess no existe o no tiene permisos de escritura.', 'pictau' ) ), 500 );
		}

		$raw = isset( $_POST['csp_content'] ) ? wp_unslash( (string) $_POST['csp_content'] ) : '';
		$raw = str_replace( "\r\n", "\n", $raw );
		$raw = trim( $raw, "\n" );

		list( $valid, $errors ) = $this->validate_directives( $raw );

		if ( ! $valid ) {
			wp_send_json_error(
				array(
					'message' => esc_html__( 'El contenido no es válido. Corrige las líneas indicadas y vuelve a intentarlo.', 'pictau' ),
					'errors'  => $errors,
				),
				400
			);
		}

		$foreign = $this->get_foreign_header_directives();

		if ( ! empty( $foreign ) ) {
			wp_send_json_error(
				array(
					'message' => esc_html__( 'Hay directivas de cabecera ya existentes en el .htaccess, fuera del bloque gestionado por el tema. Elimínalas manualmente antes de aplicar, para evitar cabeceras duplicadas o en conflicto:', 'pictau' ),
					'errors'  => $foreign,
				),
				409
			);
		}

		$this->backup_current_state();
		$this->ensure_security_block();

		if ( ! $this->write_csp_block( $raw ) ) {
			wp_send_json_error( array( 'message' => esc_html__( 'No se ha podido escribir en el .htaccess.', 'pictau' ) ), 500 );
		}

		if ( ! $this->self_test() ) {
			$this->restore_backup();
			wp_send_json_error(
				array(
					'message' => esc_html__( 'El sitio dejó de responder correctamente tras aplicar los cambios. Se ha restaurado automáticamente la configuración anterior. Revisa la política CSP e inténtalo de nuevo.', 'pictau' ),
				),
				500
			);
		}

		update_option( self::OPTION_CURRENT, $raw, false );
		set_theme_mod( self::SETTING_ENABLED, true );

		wp_send_json_success(
			array_merge(
				array(
					'message'   => esc_html__( 'Cabeceras CSP aplicadas y verificadas correctamente.', 'pictau' ),
					'hasBackup' => $this->has_backup(),
				),
				$this->get_status_info()
			)
		);
	}

	public function ajax_revert(): void {
		check_ajax_referer( self::NONCE_ACTION, 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => esc_html__( 'Sin permisos suficientes.', 'pictau' ) ), 403 );
		}

		if ( ! $this->has_backup() ) {
			wp_send_json_error( array( 'message' => esc_html__( 'No hay ninguna copia de seguridad disponible.', 'pictau' ) ), 404 );
		}

		if ( ! $this->restore_backup() ) {
			wp_send_json_error( array( 'message' => esc_html__( 'No se ha podido restaurar la copia de seguridad.', 'pictau' ) ), 500 );
		}

		if ( ! $this->self_test() ) {
			wp_send_json_error( array( 'message' => esc_html__( 'El sitio no responde correctamente tras restaurar. Revisa el .htaccess manualmente.', 'pictau' ) ), 500 );
		}

		wp_send_json_success(
			array_merge(
				array(
					'message'   => esc_html__( 'Copia de seguridad restaurada correctamente.', 'pictau' ),
					'hasBackup' => $this->has_backup(),
				),
				$this->get_status_info()
			)
		);
	}

	// =========================================================================
	// LECTURA / PLANTILLA
	// =========================================================================

	/**
	 * Contenido actualmente activo del bloque CSP editable, o null si no existe.
	 * Se usa como fuente de verdad la última aplicación exitosa (OPTION_CURRENT);
	 * si no existe (p.ej. primera visita), se intenta leer directamente del .htaccess.
	 */
	public function get_current_block_content(): ?string {
		$stored = get_option( self::OPTION_CURRENT, null );

		if ( is_string( $stored ) && '' !== $stored ) {
			return $stored;
		}

		return $this->read_block_from_file();
	}

	/**
	 * Detecta el caso típico de una migración: la base de datos dice que la CSP
	 * está activada (theme_mod SETTING_ENABLED = true, arrastrado por un restore
	 * de BD, p.ej. UpdraftPlus), pero el .htaccess de ESTE servidor no contiene
	 * ningún directiva real — porque UpdraftPlus no restaura el .htaccess de la
	 * raíz junto con la BD. Sirve de recordatorio para volver a pulsar "Aplicar
	 * cambios" tras migrar a otro servidor.
	 */
	public function is_out_of_sync(): bool {
		if ( ! get_theme_mod( self::SETTING_ENABLED ) ) {
			return false;
		}

		return null === $this->read_block_from_file();
	}

	/**
	 * Texto/estilo del párrafo de estado del editor, calculado en un único
	 * sitio para que tanto el render inicial (control PHP) como las respuestas
	 * AJAX de aplicar/revertir puedan mostrar siempre el estado real y
	 * actualizado — sin esto, el aviso de "fuera de sincronía" se quedaba
	 * mostrado tras un "Aplicar cambios" exitoso, porque solo se calculaba al
	 * cargar la página y el JS nunca lo refrescaba.
	 *
	 * @return array{text: string, style: string, exists: bool}
	 */
	public function get_status_info(): array {
		$exists      = null !== $this->get_current_block_content();
		$out_of_sync = $this->is_out_of_sync();

		if ( $out_of_sync ) {
			return array(
				'text'   => esc_html__( '⚠️ Marcada como activa en la base de datos, pero este servidor no tiene ninguna directiva en su .htaccess (típico tras restaurar solo la BD en una migración). El contenido de abajo es el que estaba activo antes de migrar — revísalo y pulsa "Aplicar cambios" para escribirlo aquí.', 'pictau' ),
				'style'  => 'color:#b32d2e;font-weight:600;',
				'exists' => $exists,
			);
		}

		if ( $exists ) {
			return array(
				'text'   => esc_html__( 'Ya existen directivas CSP gestionadas por el tema en el .htaccess. Puedes editarlas abajo.', 'pictau' ),
				'style'  => '',
				'exists' => true,
			);
		}

		return array(
			'text'   => esc_html__( 'No se han encontrado directivas CSP del tema en el .htaccess. Se muestra la plantilla por defecto; no se guardará nada hasta pulsar "Aplicar cambios".', 'pictau' ),
			'style'  => '',
			'exists' => false,
		);
	}

	/**
	 * Detecta directivas Header de los nombres que este tema gestiona
	 * (MANAGED_HEADER_NAMES) que ya existen en el .htaccess FUERA de los
	 * marcadores propios (WordPress, Pictau CSP, Pictau Security Rules) —
	 * p.ej. añadidas a mano o por otro plugin antes de usar esta funcionalidad.
	 * Esta herramienta nunca las toca ni las elimina: si coexistieran con las
	 * que gestiona el tema, Apache podría aplicar ambas de forma impredecible
	 * (normalmente prevalece la última en orden de procesamiento).
	 *
	 * @return string[] líneas conflictivas tal cual aparecen en el fichero
	 */
	public function get_foreign_header_directives(): array {
		$path = $this->get_htaccess_path();

		if ( ! $path || ! file_exists( $path ) ) {
			return array();
		}

		$file_lines = file( $path, FILE_IGNORE_NEW_LINES );

		if ( false === $file_lines ) {
			return array();
		}

		$own_markers          = array( 'WordPress', self::MARKER_CSP, self::MARKER_SECURITY );
		$inside               = false;
		$foreign              = array();
		$header_names_pattern = implode( '|', array_map( 'preg_quote', self::MANAGED_HEADER_NAMES ) );
		$header_line_pattern  = '/^\s*Header\s+(always\s+set|set|append|merge)\s+["\']?(' . $header_names_pattern . ')\b/i';

		foreach ( $file_lines as $line ) {
			$is_marker_line = false;

			foreach ( $own_markers as $marker ) {
				if ( str_contains( $line, '# BEGIN ' . $marker ) ) {
					$inside         = true;
					$is_marker_line = true;
					break;
				}

				if ( str_contains( $line, '# END ' . $marker ) ) {
					$inside         = false;
					$is_marker_line = true;
					break;
				}
			}

			if ( $is_marker_line || $inside ) {
				continue;
			}

			if ( preg_match( $header_line_pattern, $line ) ) {
				$foreign[] = trim( $line );
			}
		}

		return $foreign;
	}

	/**
	 * Fallback cuando OPTION_CURRENT no está disponible (p.ej. tras una edición
	 * manual del .htaccess). Se apoya en extract_from_markers() de WordPress,
	 * que descarta las líneas de comentario — incluida la instrucción que
	 * insert_with_markers() antepone siempre de forma automática. Sin este
	 * descarte, esa instrucción se reinterpretaría como "contenido real" y
	 * insert_with_markers() volvería a anteponer una copia fresca en cada
	 * escritura, duplicándola indefinidamente.
	 */
	private function read_block_from_file(): ?string {
		$path = $this->get_htaccess_path();

		if ( ! $path || ! file_exists( $path ) ) {
			return null;
		}

		if ( ! function_exists( 'extract_from_markers' ) ) {
			require_once ABSPATH . 'wp-admin/includes/misc.php';
		}

		$lines = extract_from_markers( $path, self::MARKER_CSP );

		if ( empty( $lines ) ) {
			return null;
		}

		return implode( "\n", $lines );
	}

	public function get_default_template(): string {
		$own_domains = implode( ' ', $this->get_own_domain_variants() );
		$own_domains_suffix = '' !== $own_domains ? ' ' . $own_domains : '';

		return <<<CSP
# CSP por defecto del tema pictau — dominios confirmados en el código: YouTube y Vimeo
# (embeds de vídeo), Google Tag Manager (lo inyecta el gestor de cookies del sitio) y GA4
# (analytics.google.com y *.google-analytics.com, con wildcard porque GA4 reparte las
# peticiones de medición entre subdominios regionales como region1.google-analytics.com
# según la localización del visitante), que GTM suele cargar en runtime aunque no esté
# hardcodeado en el tema — incluido por defecto para no romper el tracking.
# En img-src/style-src/script-src/font-src se incluyen también, calculadas en runtime a partir
# de home_url(), las variantes con y sin «www.» del propio dominio del sitio: una página
# servida sin pasar por el bootstrap normal de WordPress (p.ej. el modo mantenimiento,
# que puede responder en cualquiera de los dos hosts sin redirigir al canónico) referencia
# sus propios recursos con la URL absoluta de home_url(), que 'self' NO cubre si el host
# real de la petición es el otro — sin esto se bloquean imágenes/CSS/JS del propio sitio.
# En img-src se incluye también https://www.googletagmanager.com: GTM usa ese dominio
# como beacon de imagen (endpoint /td, fallback de Measurement Protocol/GA4), no solo
# para servir su script — sin esto el navegador bloquea esa petición aunque script-src
# ya permita cargar el script de GTM (detectado en producción de qlikparapymes).
# Opcional (descomenta si se usa el shortcode rive-player): WASM de Rive — añade
# https://cdn.jsdelivr.net https://unpkg.com a script-src/connect-src.
<IfModule mod_headers.c>
SetEnvIf Request_URI "^/wp-admin" csp_admin
SetEnvIf Request_URI "^/wp-login\\.php" csp_admin

# Publico
Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com{$own_domains_suffix}; style-src 'self' 'unsafe-inline'{$own_domains_suffix}; img-src 'self' data: https://i.ytimg.com https://www.googletagmanager.com{$own_domains_suffix}; font-src 'self' data:{$own_domains_suffix}; connect-src 'self' https://*.google-analytics.com https://analytics.google.com; frame-src 'self' https://www.youtube.com https://player.vimeo.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self';" env=!csp_admin

# wp-admin / wp-login: mas permisiva, area autenticada
Header set Content-Security-Policy "default-src 'self' https: data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https: wss:; frame-src 'self' https: blob:; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self';" env=csp_admin

# Cabeceras de seguridad adicionales
Header always set X-Content-Type-Options "nosniff"
Header always set Cross-Origin-Opener-Policy "same-origin"
Header always set Cross-Origin-Resource-Policy "same-origin"
Header always set Permissions-Policy "geolocation=(), camera=(), microphone=()"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
</IfModule>
CSP;
	}

	/**
	 * Variantes con y sin «www.» del dominio configurado en home_url(), como
	 * "https://host". Se calculan en runtime (nunca hardcodeadas) porque cada
	 * sitio que use este tema tiene su propio dominio; cubre el caso de páginas
	 * que puedan servirse en cualquiera de los dos hosts sin pasar por una
	 * redirección canónica previa (ver comentario en get_default_template()).
	 *
	 * @return string[]
	 */
	private function get_own_domain_variants(): array {
		$host = wp_parse_url( home_url(), PHP_URL_HOST );

		if ( ! $host ) {
			return array();
		}

		$alt = ( 0 === stripos( $host, 'www.' ) ) ? substr( $host, 4 ) : 'www.' . $host;

		return array( 'https://' . $host, 'https://' . $alt );
	}

	// =========================================================================
	// VALIDACIÓN
	// =========================================================================

	/**
	 * @return array{0: bool, 1: string[]}
	 */
	public function validate_directives( string $text ): array {
		$errors = array();

		if ( strlen( $text ) > self::MAX_LENGTH ) {
			$errors[] = sprintf(
				/* translators: %d: número máximo de caracteres */
				esc_html__( 'El contenido supera el límite de %d caracteres.', 'pictau' ),
				self::MAX_LENGTH
			);
			return array( false, $errors );
		}

		if ( '' === trim( $text ) ) {
			$errors[] = esc_html__( 'El contenido no puede estar vacío.', 'pictau' );
			return array( false, $errors );
		}

		if ( false !== strpos( $text, '<?php' ) || false !== strpos( $text, '<?=' ) ) {
			$errors[] = esc_html__( 'No se permiten etiquetas PHP en el contenido.', 'pictau' );
		}

		$lines            = preg_split( "/\n/", $text );
		$if_module_depth  = 0;
		$has_header_line  = false;

		foreach ( $lines as $index => $line ) {
			$line_number = $index + 1;
			$matched     = false;

			foreach ( self::ALLOWED_LINE_PATTERNS as $pattern ) {
				if ( preg_match( $pattern, $line ) ) {
					$matched = true;
					break;
				}
			}

			if ( ! $matched ) {
				$errors[] = sprintf(
					/* translators: 1: número de línea, 2: contenido de la línea */
					esc_html__( 'Línea %1$d no permitida: "%2$s"', 'pictau' ),
					$line_number,
					trim( $line )
				);
				continue;
			}

			if ( preg_match( '/^\s*<IfModule\s+mod_headers\.c>\s*$/i', $line ) ) {
				++$if_module_depth;
			} elseif ( preg_match( '/^\s*<\/IfModule>\s*$/i', $line ) ) {
				--$if_module_depth;

				if ( $if_module_depth < 0 ) {
					$errors[] = sprintf(
						/* translators: %d: número de línea */
						esc_html__( 'Línea %d: etiqueta </IfModule> sin apertura correspondiente.', 'pictau' ),
						$line_number
					);
					$if_module_depth = 0;
				}
			} elseif ( preg_match( '/^\s*Header\s+/i', $line ) ) {
				$has_header_line = true;
			}
		}

		if ( $if_module_depth > 0 ) {
			$errors[] = esc_html__( 'Falta cerrar un bloque <IfModule mod_headers.c> con </IfModule>.', 'pictau' );
		}

		if ( ! $has_header_line ) {
			$errors[] = esc_html__( 'El contenido debe incluir al menos una directiva Header.', 'pictau' );
		}

		return array( empty( $errors ), $errors );
	}

	// =========================================================================
	// ESCRITURA / BACKUP / VERIFICACIÓN
	// =========================================================================

	private function write_csp_block( string $content ): bool {
		if ( ! function_exists( 'insert_with_markers' ) ) {
			require_once ABSPATH . 'wp-admin/includes/misc.php';
		}

		$path = $this->get_htaccess_path();

		return $path && (bool) insert_with_markers( $path, self::MARKER_CSP, explode( "\n", $content ) );
	}

	/**
	 * Elimina el bloque CSP por completo (marcadores BEGIN/END incluidos).
	 * No se usa insert_with_markers() con un array vacío porque esa función
	 * SIEMPRE antepone su propia instrucción comentada, dejando un bloque
	 * "vacío" con comentarios residuales en vez de desaparecer del todo.
	 */
	private function remove_csp_block(): bool {
		return $this->strip_marker_block( self::MARKER_CSP );
	}

	private function strip_marker_block( string $marker ): bool {
		$path = $this->get_htaccess_path();

		if ( ! $path || ! file_exists( $path ) ) {
			return true;
		}

		$original = file( $path, FILE_IGNORE_NEW_LINES );

		if ( false === $original ) {
			return false;
		}

		$begin     = '# BEGIN ' . $marker;
		$end       = '# END ' . $marker;
		$has_block = false;

		foreach ( $original as $line ) {
			if ( str_contains( $line, $begin ) ) {
				$has_block = true;
				break;
			}
		}

		if ( ! $has_block ) {
			return true; // nada que limpiar
		}

		if ( ! is_writable( $path ) ) {
			return false;
		}

		$inside = false;
		$result = array();

		foreach ( $original as $line ) {
			if ( str_contains( $line, $begin ) ) {
				$inside = true;
				continue;
			}

			if ( str_contains( $line, $end ) ) {
				$inside = false;
				continue;
			}

			if ( ! $inside ) {
				$result[] = $line;
			}
		}

		return false !== file_put_contents( $path, implode( "\n", $result ) . "\n" );
	}

	/**
	 * Bloque fijo, NO editable por el usuario, para bloquear métodos TRACE/TRACK.
	 * Se aplica una sola vez (si no existe ya) al primer "Aplicar" exitoso.
	 * Deliberadamente separado del bloque CSP editable: usar RewriteRule requeriría
	 * ampliar la whitelist de validate_directives(), aumentando mucho la superficie
	 * de riesgo de un textarea editable por un admin.
	 */
	private function ensure_security_block(): void {
		if ( ! function_exists( 'insert_with_markers' ) ) {
			require_once ABSPATH . 'wp-admin/includes/misc.php';
		}

		$path = $this->get_htaccess_path();

		if ( ! $path ) {
			return;
		}

		if ( ! empty( extract_from_markers( $path, self::MARKER_SECURITY ) ) ) {
			return;
		}

		insert_with_markers(
			$path,
			self::MARKER_SECURITY,
			array(
				'<IfModule mod_rewrite.c>',
				'RewriteCond %{REQUEST_METHOD} ^(TRACE|TRACK)',
				'RewriteRule .* - [F]',
				'</IfModule>',
			)
		);
	}

	private function backup_current_state(): void {
		update_option(
			self::OPTION_BACKUP,
			array(
				'content'   => $this->get_current_block_content(),
				'timestamp' => time(),
			),
			false
		);

		$path = $this->get_htaccess_path();

		if ( $path && file_exists( $path ) ) {
			// Copia física adicional: sigue siendo recuperable por FTP/SSH aunque wp-admin quede inaccesible.
			@copy( $path, $path . '.pictau-bak' );
		}
	}

	public function has_backup(): bool {
		return is_array( get_option( self::OPTION_BACKUP ) );
	}

	private function restore_backup(): bool {
		$backup = get_option( self::OPTION_BACKUP );

		if ( ! is_array( $backup ) || ! array_key_exists( 'content', $backup ) ) {
			return false;
		}

		if ( null === $backup['content'] ) {
			$ok = $this->remove_csp_block();

			if ( $ok ) {
				delete_option( self::OPTION_CURRENT );
			}

			return $ok;
		}

		if ( ! function_exists( 'insert_with_markers' ) ) {
			require_once ABSPATH . 'wp-admin/includes/misc.php';
		}

		$path = $this->get_htaccess_path();
		$ok   = $path && (bool) insert_with_markers( $path, self::MARKER_CSP, explode( "\n", $backup['content'] ) );

		if ( $ok ) {
			update_option( self::OPTION_CURRENT, $backup['content'], false );
		}

		return $ok;
	}

	/**
	 * Petición interna a la home para comprobar que el sitio sigue respondiendo
	 * tras escribir en el .htaccess. sslverify se desactiva porque es una
	 * comprobación interna de alcanzabilidad, no una petición sensible a terceros.
	 *
	 * Solo se considera "sitio roto" un fallo de conexión o un código 500: es lo
	 * que devuelve Apache cuando el .htaccess tiene una directiva que no puede
	 * parsear (PHP nunca llega a ejecutarse). Otros códigos — incluidos 503/403
	 * generados por plugins propios como el modo mantenimiento, o cualquier 4xx —
	 * significan que PHP se ha ejecutado con normalidad y el .htaccess es válido.
	 */
	private function self_test(): bool {
		$response = wp_remote_get(
			home_url( '/' ),
			array(
				'timeout'   => 10,
				'sslverify' => false,
				'headers'   => array( 'Cache-Control' => 'no-cache' ),
			)
		);

		if ( is_wp_error( $response ) ) {
			return false;
		}

		$code = (int) wp_remote_retrieve_response_code( $response );

		return $code > 0 && 500 !== $code;
	}

	// =========================================================================
	// ENTORNO
	// =========================================================================

	private function get_htaccess_path(): ?string {
		if ( ! function_exists( 'get_home_path' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
		}

		$path = get_home_path() . '.htaccess';

		return $path ?: null;
	}

	private function is_environment_supported(): bool {
		$path = $this->get_htaccess_path();

		if ( ! $path ) {
			return false;
		}

		return file_exists( $path ) ? is_writable( $path ) : is_writable( dirname( $path ) );
	}
}

Pictau_CSP_Manager::instance();
