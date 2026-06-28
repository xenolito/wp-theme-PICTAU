<?php
/**
 * Integración nativa CF7 + Polylang
 *
 * Reemplaza el plugin externo "Multilingual Contact Form 7 with Polylang".
 * Cargado condicionalmente desde utilities.php solo si CF7 y Polylang están activos.
 *
 * Mejoras sobre el plugin original:
 * - Caché de registro de strings por transiente (invalidado en wpcf7_after_save)
 * - Regex con exclusión de contextos CSS (<style> blocks neutralizados con placeholders)
 * - Sin código deprecado PHP 8.2: usa PLL()->model->get_language() en vez de PLL_Language dinámico
 * - Detección de idioma en AJAX: cascada _wpcf7_locale → cookie → pll_current_language()
 * - Sistema unificado de mensajes: tokens {X} + strings cf7_msg_* en Polylang
 *
 * @package pictau_tw
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// No cargar si el plugin externo sigue activo, para evitar doble comportamiento
if ( class_exists( 'mlcf7pll\Plugin' ) ) {
	return;
}

final class Pictau_CF7_Polylang {

	const CACHE_KEY_PREFIX = 'pct_cf7pll_strings_';
	const PLUGIN_GROUP     = 'Contact Form 7';
	const MSG_GROUP        = 'Contact Form 7 Error Messages';
	const VALUE_PROT_OPEN  = 'PCT_CF7PLL_VALPROT_OPEN_';
	const VALUE_PROT_CLOSE = '_PCT_CF7PLL_VALPROT_CLOSE';
	const STRINGS_OPTION   = 'pct_cf7pll_all_strings';

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
		// Admin: registro de strings con caché
		add_action( 'admin_init',       [ $this, 'maybe_register_strings' ] );
		add_action( 'wpcf7_after_save', [ $this, 'invalidate_cache' ] );

		// Registro de mensajes default de CF7 como strings Polylang
		add_action( 'init', [ $this, 'register_cf7_message_strings' ], 20 );

		// Frontend y AJAX
		add_filter( 'wpcf7_form_elements',    [ $this, 'translate_form_elements' ] );
		add_filter( 'wpcf7_mail_components',  [ $this, 'translate_mail_components' ], 10 );
		add_filter( 'wpcf7_display_message',  [ $this, 'translate_cf7_messages' ], 10, 2 );
		add_filter( 'wpcf7_posted_data',      [ $this, 'fix_pipes_in_posted_data' ] );
		add_filter( 'get_post_metadata',      [ $this, 'fix_form_locale' ], 20, 5 );
		add_filter( 'load_textdomain_mofile', [ $this, 'fix_cf7_mofile' ] );

		// Panel en el editor CF7
		add_filter( 'wpcf7_editor_panels',    [ $this, 'add_editor_panel' ] );
		add_action( 'admin_enqueue_scripts',  [ $this, 'enqueue_editor_scripts' ] );

		// Botón de importación en Polylang > String Translations
		add_action( 'admin_notices',  [ $this, 'inject_cf7_translations_button' ] );
		add_action( 'admin_footer',   [ $this, 'print_translations_page_script' ] );

		// AJAX: limpiar strings huérfanas
		add_action( 'wp_ajax_pct_cf7pll_clear_orphans',       [ $this, 'ajax_clear_orphans' ] );
		// AJAX: importar traducciones de CF7 en Polylang
		add_action( 'wp_ajax_pct_cf7pll_import_translations', [ $this, 'ajax_import_cf7_translations' ] );
	}

	// =========================================================================
	// ADMIN — Registro de strings
	// =========================================================================

	/**
	 * Registra los strings {X} de todos los formularios CF7 en Polylang.
	 * Polylang necesita que pll_register_string() se llame en cada admin_init para
	 * mantener el grupo visible en String Translations. El transiente cachea solo el
	 * escaneo/parseo del contenido del formulario (costoso), no el registro en sí.
	 * Actualiza el registro histórico de strings para detectar huérfanas.
	 */
	public function maybe_register_strings(): void {
		if ( ! function_exists( 'pll_register_string' ) ) {
			return;
		}

		$forms           = WPCF7_ContactForm::find();
		$newly_collected = [];

		foreach ( $forms as $form ) {
			$cache_key = self::CACHE_KEY_PREFIX . $form->id();
			$cached    = get_transient( $cache_key );

			if ( false !== $cached && is_array( $cached ) ) {
				// Cache hit: strings ya escaneadas, re-registrar siempre en Polylang
				foreach ( $cached as $string ) {
					pll_register_string(
						'cf7-' . sanitize_title( $string ),
						$string,
						self::PLUGIN_GROUP
					);
				}
				continue;
			}

			// Cache miss: escanear el formulario y cachear la lista de strings
			$strings = $this->collect_strings_from_props( $form->get_properties() );
			foreach ( $strings as $string ) {
				pll_register_string(
					'cf7-' . sanitize_title( $string ),
					$string,
					self::PLUGIN_GROUP
				);
			}

			$newly_collected = array_merge( $newly_collected, $strings );
			set_transient( $cache_key, $strings, WEEK_IN_SECONDS );
		}

		if ( ! empty( $newly_collected ) ) {
			$this->track_registered_strings( array_unique( $newly_collected ) );
		}
	}

	/**
	 * Invalida el caché de un formulario cuando se guarda.
	 *
	 * @param WPCF7_ContactForm $form
	 */
	public function invalidate_cache( WPCF7_ContactForm $form ): void {
		delete_transient( self::CACHE_KEY_PREFIX . $form->id() );
	}

	/**
	 * Registra los mensajes default de CF7 como strings en Polylang.
	 * Permite traducirlos desde Polylang > String Translations sin depender de .mo files.
	 */
	public function register_cf7_message_strings(): void {
		if ( ! function_exists( 'pll_register_string' ) || ! function_exists( 'wpcf7_messages' ) ) {
			return;
		}

		foreach ( wpcf7_messages() as $key => $data ) {
			pll_register_string(
				'cf7_msg_' . $key,
				$data['default'],
				self::MSG_GROUP
			);
		}
	}

	/**
	 * Recorre recursivamente las propiedades del formulario y devuelve los tokens {X} encontrados.
	 * Función pura: solo recopila, no registra ni tiene efectos secundarios.
	 *
	 * @param array|string $props
	 * @return string[]
	 */
	private function collect_strings_from_props( $props ): array {
		if ( is_array( $props ) ) {
			$result = [];
			foreach ( $props as $value ) {
				$result = array_merge( $result, $this->collect_strings_from_props( $value ) );
			}
			return array_unique( $result );
		}

		if ( ! is_string( $props ) ) {
			return [];
		}

		return $this->extract_curly_strings( $props );
	}

	/**
	 * Acumula strings registradas en la WP option histórica.
	 * Se usa para detectar huérfanas: strings que ya no aparecen en ningún formulario.
	 *
	 * @param string[] $strings
	 */
	private function track_registered_strings( array $strings ): void {
		if ( empty( $strings ) ) {
			return;
		}
		$existing = get_option( self::STRINGS_OPTION, [] );
		$merged   = array_unique( array_merge( $existing, $strings ) );
		if ( $merged !== $existing ) {
			update_option( self::STRINGS_OPTION, $merged, false );
		}
	}

	/**
	 * Devuelve todos los tokens {X} presentes actualmente en todos los formularios CF7.
	 *
	 * @return string[]
	 */
	private function get_all_current_tokens(): array {
		$tokens = [];
		foreach ( WPCF7_ContactForm::find() as $form ) {
			$tokens = array_merge( $tokens, $this->collect_strings_from_props( $form->get_properties() ) );
		}
		return array_unique( $tokens );
	}

	// =========================================================================
	// FRONTEND — Traducción del formulario
	// =========================================================================

	/**
	 * Sustituye tokens {X} en el HTML renderizado del formulario.
	 * Protege value="" en campos que no sean submit para no romper selects/radios/checkboxes.
	 *
	 * @param string $content HTML del formulario
	 * @return string
	 */
	public function translate_form_elements( string $content ): string {
		$this->ensure_pll_string_textdomain();

		// Proteger value="{X}" en inputs que NO sean submit ni button
		$counter    = 0;
		$protections = [];

		$content = preg_replace_callback(
			'/(<input(?![^>]*type=["\'](?:submit|button)["\'])[^>]*)\bvalue="(\{[^{}]+\})"/i',
			function( $m ) use ( &$counter, &$protections ) {
				$placeholder              = self::VALUE_PROT_OPEN . $counter . self::VALUE_PROT_CLOSE;
				$protections[ $placeholder ] = $m[2];
				$counter++;
				return $m[1] . 'value="' . $placeholder . '"';
			},
			$content
		);

		// Traducir todos los tokens {X} restantes
		$content = $this->translate_curly_strings( $content );

		// Restaurar value="" protegidos (sin traducir)
		foreach ( $protections as $placeholder => $original ) {
			$content = str_replace( 'value="' . $placeholder . '"', 'value="' . $original . '"', $content );
		}

		return $content;
	}

	/**
	 * Traduce los componentes del email (subject, body, etc.) recursivamente.
	 *
	 * @param array $components
	 * @return array
	 */
	public function translate_mail_components( array $components ): array {
		$this->ensure_pll_string_textdomain();

		foreach ( $components as $key => $value ) {
			if ( is_array( $value ) ) {
				$components[ $key ] = $this->translate_mail_components( $value );
			} elseif ( is_string( $value ) ) {
				$components[ $key ] = $this->translate_curly_strings( $value );
			}
		}

		return $components;
	}

	/**
	 * Traduce los mensajes de respuesta de CF7 (éxito, error, validación).
	 * Primero intenta tokens {X}; si no, busca en strings Polylang registradas como cf7_msg_*;
	 * si no, usa el textdomain de CF7 con el .mo del idioma correcto.
	 *
	 * @param string $message
	 * @param string $status
	 * @return string
	 */
	public function translate_cf7_messages( string $message, string $status ): string {
		$this->ensure_pll_string_textdomain();

		// Si el mensaje contiene tokens {X}, traducirlos directamente
		if ( preg_match( '/\{[^{}]+\}/', $message ) ) {
			return $this->translate_curly_strings( $message );
		}

		// Intentar traducción vía strings Polylang registradas (cf7_msg_*)
		if ( function_exists( 'pll__' ) ) {
			$translated = pll__( $message );
			if ( $translated !== $message ) {
				return $translated;
			}
		}

		// Fallback: textdomain de CF7 con el .mo del idioma correcto
		return __( $message, 'contact-form-7' );
	}

	// =========================================================================
	// FRONTEND — Locale y AJAX
	// =========================================================================

	/**
	 * Reemplaza el metadato _locale del formulario por el idioma actual de Polylang.
	 * Garantiza que el atributo lang del <div role="form"> sea correcto.
	 *
	 * @param mixed  $value
	 * @param int    $object_id
	 * @param string $meta_key
	 * @param bool   $single
	 * @param string $meta_type
	 * @return mixed
	 */
	public function fix_form_locale( $value, int $object_id, string $meta_key, bool $single, string $meta_type ) {
		if ( '_locale' !== $meta_key ) {
			return $value;
		}

		$post = get_post( $object_id );
		if ( ! $post || 'wpcf7_contact_form' !== $post->post_type ) {
			return $value;
		}

		$locale = function_exists( 'pll_current_language' )
			? pll_current_language( 'locale' )
			: false;

		return $locale ?: $value;
	}

	/**
	 * Reemplaza el archivo .mo de CF7 por el del idioma Polylang activo en requests REST/AJAX.
	 *
	 * @param string $mofile
	 * @return string
	 */
	public function fix_cf7_mofile( string $mofile ): string {
		if ( false === strpos( $mofile, 'contact-form-7' ) ) {
			return $mofile;
		}

		// Solo actuar en contexto AJAX o REST de CF7
		$is_rest = defined( 'REST_REQUEST' ) && REST_REQUEST;
		$is_ajax = wp_doing_ajax();
		if ( ! $is_rest && ! $is_ajax ) {
			return $mofile;
		}

		$locale = $this->resolve_locale();
		if ( ! $locale ) {
			return $mofile;
		}

		// Reemplazar la locale en el nombre del archivo .mo
		return preg_replace( '/[a-z]{2}_[A-Z]{2}(?:_[a-zA-Z0-9]+)?\.mo$/', $locale . '.mo', $mofile );
	}

	// =========================================================================
	// FRONTEND — Fix pipes en select/radio/checkbox
	// =========================================================================

	/**
	 * Cuando un select/radio/checkbox usa pipes "{Etiqueta}|valor", el usuario
	 * ve la etiqueta traducida pero el formulario envía el valor del pipe.
	 * Este hook restaura el pipe value en los datos posteados.
	 *
	 * @param array $posted_data
	 * @return array
	 */
	public function fix_pipes_in_posted_data( array $posted_data ): array {
		if ( ! function_exists( 'pll__' ) || ! function_exists( 'pll_languages_list' ) ) {
			return $posted_data;
		}

		$submission = WPCF7_Submission::get_instance();
		if ( ! $submission ) {
			return $posted_data;
		}

		$contact_form = $submission->get_contact_form();
		if ( ! $contact_form ) {
			return $posted_data;
		}

		$tags  = $contact_form->scan_form_tags();
		$langs = pll_languages_list( [ 'fields' => 'slug' ] );

		foreach ( $tags as $tag ) {
			if ( ! in_array( $tag->basetype, [ 'radio', 'checkbox', 'select' ], true ) ) {
				continue;
			}

			if ( empty( $tag->pipes ) || ! $this->has_curly_bracket_values( $tag->values ) ) {
				continue;
			}

			$field_name = $tag->raw_name;
			if ( ! isset( $posted_data[ $field_name ] ) ) {
				continue;
			}

			$posted_values = (array) $posted_data[ $field_name ];
			$pipes_array   = $tag->pipes->to_array();

			foreach ( $pipes_array as $pipe ) {
				if ( 2 !== count( $pipe ) ) {
					continue;
				}

				$source_string = trim( $pipe[0], '{}' );
				$pipe_value    = $pipe[1];

				foreach ( $langs as $lang ) {
					$translated = pll_translate_string( $source_string, $lang );

					foreach ( $posted_values as $i => $val ) {
						if ( $val === $translated ) {
							$posted_data[ $field_name ][ $i ] = $pipe_value;
						}
					}
				}
			}
		}

		return $posted_data;
	}

	// =========================================================================
	// UTILIDADES PRIVADAS
	// =========================================================================

	/**
	 * Extrae todos los tokens {X} de un string de texto.
	 * Excluye tokens con punto y coma, dos puntos, saltos de línea, comillas o iguales
	 * (contextos CSS o atributos HTML).
	 *
	 * @param string $text
	 * @return string[]
	 */
	private function extract_curly_strings( string $text ): array {
		// Remover bloques <style> antes de buscar tokens
		$clean = preg_replace( '/<style\b[^>]*>.*?<\/style>/si', '', $text );

		preg_match_all( '/\{([^{};:\n\r]+?)\}/', $clean, $matches );

		return array_unique( $matches[1] );
	}

	/**
	 * Sustituye todos los tokens {X} en el texto por sus traducciones Polylang.
	 * Neutraliza bloques <style> con placeholders para no tocar CSS.
	 *
	 * @param string $text
	 * @return string
	 */
	private function translate_curly_strings( string $text ): string {
		// Proteger bloques <style> con placeholders
		$style_blocks = [];
		$text = preg_replace_callback(
			'/<style\b[^>]*>.*?<\/style>/si',
			function( $match ) use ( &$style_blocks ) {
				$key               = '__PCT_STYLE_' . count( $style_blocks ) . '__';
				$style_blocks[ $key ] = $match[0];
				return $key;
			},
			$text
		);

		// Traducir tokens {X} (excluye CSS-like: :  ;  {}  saltos de línea)
		$text = preg_replace_callback(
			'/\{([^{};:\n\r]+?)\}/',
			function( $match ) {
				$decoded    = html_entity_decode( $match[1], ENT_QUOTES );
				$translated = function_exists( 'pll__' ) ? pll__( $decoded ) : $decoded;
				return $translated;
			},
			$text
		);

		// Restaurar bloques <style>
		foreach ( $style_blocks as $key => $block ) {
			$text = str_replace( $key, $block, $text );
		}

		return $text;
	}

	/**
	 * Carga el textdomain 'pll_string' en contextos AJAX/REST donde Polylang
	 * no lo carga automáticamente. Usa la API estable de Polylang 3.x.
	 */
	private function ensure_pll_string_textdomain(): void {
		if ( is_textdomain_loaded( 'pll_string' ) ) {
			return;
		}

		if ( ! function_exists( 'PLL' ) || ! PLL() || ! PLL()->model ) {
			return;
		}

		$locale = $this->resolve_locale();
		if ( ! $locale ) {
			return;
		}

		$lang = PLL()->model->get_language( $locale );
		if ( ! $lang || ! class_exists( 'PLL_MO' ) ) {
			return;
		}

		$mo = new PLL_MO();
		$mo->import_from_db( $lang );
		// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		$GLOBALS['l10n']['pll_string'] = &$mo;
	}

	/**
	 * Detecta el locale activo con prioridad:
	 * 1. _wpcf7_locale en POST (lo envía siempre el JS de CF7)
	 * 2. Cookie pll_language (slug → locale)
	 * 3. pll_current_language('locale')
	 *
	 * @return string|false Locale (ej. 'es_ES') o false si no se puede determinar
	 */
	private function resolve_locale() {
		// 1. POST de CF7 REST/AJAX
		if ( ! empty( $_POST['_wpcf7_locale'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			return sanitize_text_field( wp_unslash( $_POST['_wpcf7_locale'] ) ); // phpcs:ignore WordPress.Security.NonceVerification
		}

		// 2. Cookie de Polylang (contiene slug como 'es', 'en')
		if ( ! empty( $_COOKIE['pll_language'] ) ) {
			$locale = $this->pll_slug_to_locale( sanitize_text_field( $_COOKIE['pll_language'] ) );
			if ( $locale ) {
				return $locale;
			}
		}

		// 3. API de Polylang (funciona en frontend normal y algunos contextos REST)
		if ( function_exists( 'pll_current_language' ) ) {
			$locale = pll_current_language( 'locale' );
			if ( $locale ) {
				return $locale;
			}
		}

		return false;
	}

	/**
	 * Convierte un slug de Polylang (ej. 'en') a locale (ej. 'en_GB').
	 *
	 * @param string $slug
	 * @return string|null
	 */
	private function pll_slug_to_locale( string $slug ): ?string {
		if ( ! function_exists( 'pll_languages_list' ) ) {
			return null;
		}

		$langs = pll_languages_list( [ 'fields' => [] ] );
		foreach ( $langs as $lang ) {
			if ( isset( $lang->slug ) && $lang->slug === $slug ) {
				return $lang->locale ?? null;
			}
		}

		return null;
	}

	/**
	 * Comprueba si alguno de los valores del tag contiene tokens {X}.
	 *
	 * @param array $values
	 * @return bool
	 */
	private function has_curly_bracket_values( array $values ): bool {
		foreach ( $values as $value ) {
			if ( is_string( $value ) && preg_match( '/\{[^{}]+\}/', $value ) ) {
				return true;
			}
		}
		return false;
	}

	// =========================================================================
	// ADMIN — Scripts del panel CF7
	// =========================================================================

	/**
	 * Encola el JS del botón "Limpiar strings huérfanas" en las páginas del editor CF7.
	 * Se hace aquí (no inline en el panel) porque CF7 filtra el contenido con wp_kses.
	 */
	public function enqueue_editor_scripts(): void {
		$screen = get_current_screen();
		if ( ! $screen || 'toplevel_page_wpcf7' !== $screen->id ) {
			return;
		}

		$nonce        = wp_create_nonce( 'pct_cf7pll_clear_orphans' );
		$import_nonce = wp_create_nonce( 'pct_cf7pll_import_translations' );
		$ajax_url     = esc_url( admin_url( 'admin-ajax.php' ) );
		$err_msg      = esc_js( __( 'Error al limpiar.', 'pictau' ) );
		$net_msg      = esc_js( __( 'Error de conexión.', 'pictau' ) );
		$importing    = esc_js( __( 'Importando…', 'pictau' ) );
		$import_err   = esc_js( __( 'Error al importar.', 'pictau' ) );
		$import_net   = esc_js( __( 'Error de conexión.', 'pictau' ) );
		$no_mo        = esc_js( __( 'sin .mo', 'pictau' ) );
		$imported_lbl = esc_js( __( 'importadas', 'pictau' ) );

		$script = "document.addEventListener('DOMContentLoaded', function () {

	// Botón: limpiar strings huérfanas
	var btn = document.getElementById('pct-cf7pll-clear-orphans');
	if (btn) {
		btn.addEventListener('click', function () {
			btn.disabled = true;
			var feedback = document.getElementById('pct-cf7pll-orphans-feedback');
			var body = new URLSearchParams({ action: 'pct_cf7pll_clear_orphans', nonce: '{$nonce}' });
			fetch('{$ajax_url}', { method: 'POST', body: body, credentials: 'same-origin' })
				.then(function (r) { return r.json(); })
				.then(function (data) {
					if (data.success) {
						document.getElementById('pct-cf7pll-orphans').style.display = 'none';
					} else {
						feedback.textContent = data.data && data.data.message ? data.data.message : '{$err_msg}';
						feedback.style.display = 'inline';
						btn.disabled = false;
					}
				})
				.catch(function () {
					feedback.textContent = '{$net_msg}';
					feedback.style.display = 'inline';
					btn.disabled = false;
				});
		});
	}

	// Botón: importar traducciones CF7 desde el panel del editor
	var importBtn = document.getElementById('pct-cf7pll-import-btn-editor');
	if (importBtn) {
		importBtn.addEventListener('click', function () {
			importBtn.disabled = true;
			var feedback = document.getElementById('pct-cf7pll-import-editor-feedback');
			feedback.textContent = '{$importing}';
			feedback.style.display = 'inline';
			var body = new URLSearchParams({ action: 'pct_cf7pll_import_translations', nonce: '{$import_nonce}' });
			fetch('{$ajax_url}', { method: 'POST', body: body, credentials: 'same-origin' })
				.then(function (r) { return r.json(); })
				.then(function (data) {
					if (data.success) {
						var parts = data.data.results.map(function (r) {
							return r.missing_mo ? r.name + ': {$no_mo}' : r.name + ': ' + r.imported + ' {$imported_lbl}';
						});
						feedback.textContent = parts.join(' · ');
						importBtn.disabled = false;
					} else {
						feedback.textContent = data.data && data.data.message ? data.data.message : '{$import_err}';
						importBtn.disabled = false;
					}
				})
				.catch(function () {
					feedback.textContent = '{$import_net}';
					importBtn.disabled = false;
				});
		});
	}

});";

		wp_add_inline_script( 'wpcf7-admin', $script );
	}

	// =========================================================================
	// ADMIN — AJAX
	// =========================================================================

	/**
	 * AJAX: elimina las strings huérfanas del registro histórico.
	 * Solo limpia nuestro option de tracking; las traducciones en Polylang se conservan.
	 */
	public function ajax_clear_orphans(): void {
		check_ajax_referer( 'pct_cf7pll_clear_orphans', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( [ 'message' => esc_html__( 'Sin permisos suficientes.', 'pictau' ) ], 403 );
		}

		$current = $this->get_all_current_tokens();
		update_option( self::STRINGS_OPTION, array_values( $current ), false );

		wp_send_json_success( [ 'message' => esc_html__( 'Strings huérfanas eliminadas del registro.', 'pictau' ) ] );
	}

	// =========================================================================
	// ADMIN — Panel en el editor CF7
	// =========================================================================

	/**
	 * Añade la pestaña "Polylang" en el editor de formularios CF7.
	 *
	 * @param array $panels
	 * @return array
	 */
	public function add_editor_panel( array $panels ): array {
		$panels['pct-polylang'] = [
			'title'    => esc_html__( 'Polylang', 'pictau' ),
			'callback' => [ $this, 'render_editor_panel' ],
		];
		return $panels;
	}

	/**
	 * Renderiza el contenido del panel Polylang en el editor CF7.
	 * Muestra los tokens del formulario actual, huérfanas detectadas y enlaces a Polylang.
	 *
	 * @param WPCF7_ContactForm $form
	 */
	public function render_editor_panel( WPCF7_ContactForm $form ): void {
		$form_tokens    = $this->collect_strings_from_props( $form->get_properties() );
		$all_registered = get_option( self::STRINGS_OPTION, [] );
		$all_current    = $this->get_all_current_tokens();
		$orphans        = array_values( array_diff( $all_registered, $all_current ) );

		$url_fields = add_query_arg(
			[ 'page' => 'mlang_strings', 'group' => self::PLUGIN_GROUP ],
			admin_url( 'admin.php' )
		);
		$url_messages = add_query_arg(
			[ 'page' => 'mlang_strings', 'group' => self::MSG_GROUP ],
			admin_url( 'admin.php' )
		);

		?>
		<div class="pct-cf7pll-panel" style="padding: 1em 0;">

			<h2 style="margin-top: 0;"><?php esc_html_e( 'Traducciones con Polylang', 'pictau' ); ?></h2>

			<?php if ( empty( $form_tokens ) ) : ?>
				<p class="description">
					<?php esc_html_e( 'Este formulario no tiene tokens traducibles. Envuelve los textos con {llaves} para marcarlos como traducibles.', 'pictau' ); ?>
				</p>
			<?php else : ?>
				<p>
					<?php
					printf(
						/* translators: %d: número de tokens */
						esc_html( _n(
							'Este formulario tiene %d token traducible:',
							'Este formulario tiene %d tokens traducibles:',
							count( $form_tokens ),
							'pictau'
						) ),
						count( $form_tokens )
					);
					?>
				</p>
				<ul style="margin: 0 0 1em 1.5em; list-style: disc;">
					<?php foreach ( $form_tokens as $token ) : ?>
						<li><code>{<?php echo esc_html( $token ); ?>}</code></li>
					<?php endforeach; ?>
				</ul>
			<?php endif; ?>

			<?php if ( ! empty( $orphans ) ) : ?>
				<div id="pct-cf7pll-orphans" class="notice notice-warning inline" style="margin: 1em 0;">
					<p>
						<strong>
							<?php
							printf(
								/* translators: %d: número de strings huérfanas */
								esc_html( _n(
									'%d string huérfana detectada:',
									'%d strings huérfanas detectadas:',
									count( $orphans ),
									'pictau'
								) ),
								count( $orphans )
							);
							?>
						</strong>
						<?php esc_html_e( 'Están en el registro de seguimiento pero ya no aparecen en ningún formulario.', 'pictau' ); ?>
					</p>
					<ul style="margin: 0 0 0.5em 1.5em; list-style: disc;">
						<?php foreach ( $orphans as $orphan ) : ?>
							<li><code><?php echo esc_html( $orphan ); ?></code></li>
						<?php endforeach; ?>
					</ul>
					<p style="margin-bottom: 1em;">
						<button type="button" id="pct-cf7pll-clear-orphans" class="button button-secondary">
							<?php esc_html_e( 'Limpiar strings huérfanas', 'pictau' ); ?>
						</button>
						<span id="pct-cf7pll-orphans-feedback" style="margin-left: 0.75em; display: none;"></span>
					</p>
				</div>
			<?php endif; ?>

			<p style="display: flex; gap: 0.5em; flex-wrap: wrap; margin-top: 1.5em; align-items: center;">
				<a href="<?php echo esc_url( $url_fields ); ?>" class="button button-primary" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:0.25em;">
					<?php esc_html_e( 'Traducir campos del formulario', 'pictau' ); ?>
					<span class="dashicons dashicons-external" style="font-size:16px;width:16px;height:16px;line-height:1;"></span>
				</a>
				<a href="<?php echo esc_url( $url_messages ); ?>" class="button button-secondary" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:0.25em;">
					<?php esc_html_e( 'Traducir mensajes de error', 'pictau' ); ?>
					<span class="dashicons dashicons-external" style="font-size:16px;width:16px;height:16px;line-height:1;"></span>
				</a>
				<button type="button" id="pct-cf7pll-import-btn-editor" class="button button-secondary">
					<?php esc_html_e( 'Importar mensajes de error desde CF7', 'pictau' ); ?>
				</button>
				<span id="pct-cf7pll-import-editor-feedback" style="display:none; font-style:italic;"></span>
			</p>

		</div>
		<?php
	}

	// =========================================================================
	// ADMIN — Importar traducciones CF7 en Polylang > String Translations
	// =========================================================================

	/**
	 * Muestra el botón de importación en Polylang > String Translations
	 * cuando el filtro activo es el grupo "Contact Form 7 Messages".
	 */
	public function inject_cf7_translations_button(): void {
		global $pagenow;
		if ( 'admin.php' !== $pagenow ) {
			return;
		}
		// phpcs:disable WordPress.Security.NonceVerification.Recommended
		$page  = sanitize_key( $_GET['page']  ?? '' );
		$group = sanitize_text_field( wp_unslash( $_GET['group'] ?? '' ) );
		// phpcs:enable
		if ( 'mlang_strings' !== $page || self::MSG_GROUP !== $group ) {
			return;
		}
		$nonce = wp_create_nonce( 'pct_cf7pll_import_translations' );
		?>
		<div id="pct-cf7pll-import-wrap" class="notice notice-info" style="display:flex; align-items:center; gap: 1em; flex-wrap: wrap; padding: 0.75em 1em;">
			<p style="margin: 0;">
				<strong><?php esc_html_e( 'Importar traducciones desde CF7', 'pictau' ); ?></strong>
				<?php esc_html_e( '— Rellena las traducciones vacías con las del archivo .mo del plugin Contact Form 7. No sobreescribe las que ya existen.', 'pictau' ); ?>
			</p>
			<button type="button" id="pct-cf7pll-import-btn" class="button button-primary"
				data-nonce="<?php echo esc_attr( $nonce ); ?>"
				data-ajaxurl="<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>">
				<?php esc_html_e( 'Importar mensajes de error desde CF7', 'pictau' ); ?>
			</button>
			<span id="pct-cf7pll-import-feedback" style="display:none;"></span>
		</div>
		<?php
	}

	/**
	 * Imprime en admin_footer el script del botón de importación.
	 * Se usa admin_footer en vez de wp_add_inline_script porque esta página
	 * no pertenece al editor CF7 y el handle wpcf7-admin no está disponible.
	 */
	public function print_translations_page_script(): void {
		global $pagenow;
		if ( 'admin.php' !== $pagenow ) {
			return;
		}
		// phpcs:disable WordPress.Security.NonceVerification.Recommended
		$page  = sanitize_key( $_GET['page']  ?? '' );
		$group = sanitize_text_field( wp_unslash( $_GET['group'] ?? '' ) );
		// phpcs:enable
		if ( 'mlang_strings' !== $page || self::MSG_GROUP !== $group ) {
			return;
		}

		$msg_importing  = esc_js( __( 'Importando…', 'pictau' ) );
		$msg_err        = esc_js( __( 'Error al importar.', 'pictau' ) );
		$msg_net        = esc_js( __( 'Error de conexión.', 'pictau' ) );
		$msg_done       = esc_js( __( 'Importación completada', 'pictau' ) );
		$msg_reload     = esc_js( __( 'Recarga la página para ver las traducciones actualizadas.', 'pictau' ) );
		$msg_imported   = esc_js( __( 'importadas', 'pictau' ) );
		$msg_skipped    = esc_js( __( 'omitidas', 'pictau' ) );
		$msg_no_mo      = esc_js( __( 'Sin archivo .mo disponible para este idioma.', 'pictau' ) );
		?>
		<script>
		(function () {
			var btn = document.getElementById('pct-cf7pll-import-btn');
			if (!btn) return;
			btn.addEventListener('click', function () {
				btn.disabled = true;
				var feedback = document.getElementById('pct-cf7pll-import-feedback');
				feedback.textContent = '<?php echo $msg_importing; ?>';
				feedback.style.display = 'inline';

				var body = new URLSearchParams({ action: 'pct_cf7pll_import_translations', nonce: btn.dataset.nonce });
				fetch(btn.dataset.ajaxurl, { method: 'POST', body: body, credentials: 'same-origin' })
					.then(function (r) { return r.json(); })
					.then(function (data) {
						if (!data.success) {
							feedback.textContent = data.data && data.data.message ? data.data.message : '<?php echo $msg_err; ?>';
							btn.disabled = false;
							return;
						}
						var results = data.data.results;
						var rows = '';
						results.forEach(function (r) {
							if (r.missing_mo) {
								rows += '<li><strong>' + r.name + '</strong> (' + r.locale + '): <?php echo $msg_no_mo; ?></li>';
							} else {
								rows += '<li><strong>' + r.name + '</strong>: ' + r.imported + ' <?php echo $msg_imported; ?>, ' + r.skipped + ' <?php echo $msg_skipped; ?>.</li>';
							}
						});
						var wrap = document.getElementById('pct-cf7pll-import-wrap');
						wrap.className = 'notice notice-success';
						wrap.style.display = 'block';
						wrap.innerHTML = '<p><strong><?php echo $msg_done; ?></strong></p>'
							+ (rows ? '<ul style="margin: 0.25em 0 0.5em 1.25em; list-style: disc;">' + rows + '</ul>' : '')
							+ '<p><em><?php echo $msg_reload; ?></em></p>';
					})
					.catch(function () {
						feedback.textContent = '<?php echo $msg_net; ?>';
						feedback.style.display = 'inline';
						btn.disabled = false;
					});
			});
		})();
		</script>
		<?php
	}

	/**
	 * AJAX: importa traducciones de los mensajes CF7 desde los archivos .mo del plugin.
	 * Solo rellena las traducciones vacías en Polylang; no sobreescribe las existentes.
	 *
	 * Los .mo de CF7 mapean desde los msgids en inglés (idioma original del plugin).
	 * Si el idioma por defecto del sitio no es inglés, se construye un mapa inverso
	 * usando el .mo del idioma por defecto para obtener el msgid inglés de cada string,
	 * y con él se busca la traducción en el .mo del idioma destino.
	 */
	public function ajax_import_cf7_translations(): void {
		check_ajax_referer( 'pct_cf7pll_import_translations', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( [ 'message' => esc_html__( 'Sin permisos suficientes.', 'pictau' ) ], 403 );
		}

		if ( ! function_exists( 'PLL' ) || ! PLL() || ! class_exists( 'PLL_MO' ) ) {
			wp_send_json_error( [ 'message' => esc_html__( 'Polylang no está disponible.', 'pictau' ) ] );
		}

		$default_locale = function_exists( 'pll_default_language' ) ? pll_default_language( 'locale' ) : get_locale();

		// Forzar CF7 messages en el idioma por defecto del sitio.
		// fix_cf7_mofile() redirige el .mo de CF7 al idioma activo en contextos AJAX,
		// lo que haría que wpcf7_messages() devolviera strings en el idioma del usuario
		// en lugar del idioma base, rompiendo el mapa inverso de traducción.
		// Se desactiva el filter temporalmente para cargar el .mo del idioma correcto.
		remove_filter( 'load_textdomain_mofile', [ $this, 'fix_cf7_mofile' ] );
		unload_textdomain( 'contact-form-7' );
		$default_cf7_mo = $this->get_cf7_mofile_for_locale( $default_locale );
		if ( $default_cf7_mo ) {
			load_textdomain( 'contact-form-7', $default_cf7_mo );
		}
		$messages = function_exists( 'wpcf7_messages' ) ? wpcf7_messages() : [];
		add_filter( 'load_textdomain_mofile', [ $this, 'fix_cf7_mofile' ] );

		if ( empty( $messages ) ) {
			wp_send_json_error( [ 'message' => esc_html__( 'No se encontraron mensajes de CF7.', 'pictau' ) ] );
		}
		$languages      = PLL()->model->get_languages_list();

		// Mapa inverso: string en idioma por defecto → msgid inglés original del plugin.
		// Necesario cuando el idioma por defecto no es inglés (ej. es_ES → en).
		$reverse_map = $this->build_cf7_msgid_map( $messages, $default_locale );

		$results = [];

		foreach ( $languages as $lang ) {
			$result = [
				'name'       => $lang->name,
				'locale'     => $lang->locale,
				'imported'   => 0,
				'skipped'    => 0,
				'missing_mo' => false,
			];

			$mofile = $this->get_cf7_mofile_for_locale( $lang->locale );
			if ( ! $mofile ) {
				$result['missing_mo'] = true;
				$results[]            = $result;
				continue;
			}

			$cf7_mo = new MO();
			if ( ! $cf7_mo->import_from_file( $mofile ) ) {
				$result['missing_mo'] = true;
				$results[]            = $result;
				continue;
			}

			$pll_mo = new PLL_MO();
			$pll_mo->import_from_db( $lang );

			foreach ( $messages as $data ) {
				$source = $data['default']; // String en el idioma por defecto del sitio

				// Saltar si ya tiene traducción en Polylang
				if ( $pll_mo->translate( $source ) !== $source ) {
					$result['skipped']++;
					continue;
				}

				// Obtener el msgid inglés para buscar en el .mo destino
				$msgid = $reverse_map[ $source ] ?? null;
				if ( ! $msgid ) {
					$result['skipped']++;
					continue;
				}

				$translated = $cf7_mo->translate( $msgid );
				if ( '' === $translated ) {
					$result['skipped']++;
					continue;
				}

				$pll_mo->add_entry( new Translation_Entry( [
					'singular'     => $source,
					'translations' => [ $translated ],
				] ) );
				$result['imported']++;
			}

			if ( $result['imported'] > 0 ) {
				$pll_mo->export_to_db( $lang );
			}

			$results[] = $result;
		}

		wp_send_json_success( [ 'results' => $results ] );
	}

	/**
	 * Construye un mapa de strings del idioma por defecto → msgid inglés original de CF7.
	 *
	 * Si el idioma por defecto ya es inglés, el mapa es identidad (string = msgid).
	 * En caso contrario, carga el .mo del idioma por defecto y construye el mapa inverso:
	 * traducción_en_default → msgid_inglés.
	 *
	 * @param array  $messages       Resultado de wpcf7_messages() en el idioma actual
	 * @param string $default_locale Locale por defecto del sitio (ej. 'es_ES')
	 * @return array<string, string> Mapa: string_fuente → msgid_inglés
	 */
	private function build_cf7_msgid_map( array $messages, string $default_locale ): array {
		// Si el idioma por defecto es inglés, los strings fuente ya SON los msgids
		if ( str_starts_with( $default_locale, 'en_' ) ) {
			$map = [];
			foreach ( $messages as $data ) {
				$s         = $data['default'];
				$map[ $s ] = $s;
			}
			return $map;
		}

		// Cargar el .mo del idioma por defecto para hacer el mapa inverso
		$mofile = $this->get_cf7_mofile_for_locale( $default_locale );
		if ( ! $mofile ) {
			return [];
		}

		$default_mo = new MO();
		if ( ! $default_mo->import_from_file( $mofile ) ) {
			return [];
		}

		// Mapa inverso: traducción_en_default (msgstr) → msgid_inglés (singular)
		$map = [];
		foreach ( $default_mo->entries as $entry ) {
			if ( ! empty( $entry->translations[0] ) ) {
				$map[ $entry->translations[0] ] = $entry->singular;
			}
		}

		return $map;
	}

	/**
	 * Localiza el archivo .mo de CF7 para un locale dado.
	 * Busca primero en el directorio global de idiomas de WP, luego en el plugin.
	 *
	 * @param string $locale Locale de WordPress (ej. 'en_GB')
	 * @return string|false Ruta al .mo o false si no existe
	 */
	private function get_cf7_mofile_for_locale( string $locale ) {
		$slug      = 'contact-form-7';
		$filename  = $slug . '-' . $locale . '.mo';
		$locations = [
			WP_LANG_DIR . '/plugins/' . $filename,
			WP_PLUGIN_DIR . '/' . $slug . '/languages/' . $filename,
		];

		foreach ( $locations as $path ) {
			if ( file_exists( $path ) ) {
				return $path;
			}
		}

		return false;
	}
}

Pictau_CF7_Polylang::instance();
