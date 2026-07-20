<?php
/**
 * CPT Slide — hero slider ([hero-slider]).
 * Registrado nativamente en el tema (sustituye el Pod "slide" del plugin Pods).
 *
 * @package pictau_tw
 */

// =============================================================================
// CPT: Slide
// =============================================================================

add_action( 'init', 'pictau_register_slide_cpt', 0 );
function pictau_register_slide_cpt() {

	$labels = array(
		'name'               => _x( 'Slides', 'Post Type General Name', 'pictau' ),
		'singular_name'      => _x( 'Slide', 'Post Type Singular Name', 'pictau' ),
		'menu_name'          => esc_html__( 'Slides', 'pictau' ),
		'parent_item_colon'  => esc_html__( 'Slide padre', 'pictau' ),
		'all_items'          => esc_html__( 'Todos los slides', 'pictau' ),
		'view_item'          => esc_html__( 'Ver slide', 'pictau' ),
		'add_new_item'       => esc_html__( 'Añadir nuevo slide', 'pictau' ),
		'add_new'            => esc_html__( 'Añadir nuevo', 'pictau' ),
		'edit_item'          => esc_html__( 'Editar slide', 'pictau' ),
		'update_item'        => esc_html__( 'Actualizar slide', 'pictau' ),
		'search_items'       => esc_html__( 'Buscar slide', 'pictau' ),
		'not_found'          => esc_html__( 'No encontrado', 'pictau' ),
		'not_found_in_trash' => esc_html__( 'No encontrado en papelera', 'pictau' ),
	);

	$args = array(
		'label'               => esc_html__( 'Slides', 'pictau' ),
		'description'         => esc_html__( 'Slides del hero slider ([hero-slider])', 'pictau' ),
		'labels'              => $labels,
		'supports'            => array( 'title', 'editor', 'thumbnail', 'revisions', 'page-attributes' ),
		'show_in_rest'        => true,
		'taxonomies'          => array( 'slide_category' ),
		'hierarchical'        => false,
		'public'              => true,
		'show_ui'             => true,
		'show_in_menu'        => true,
		'show_in_nav_menus'   => false,
		'show_in_admin_bar'   => true,
		'menu_position'       => 26,
		'menu_icon'           => 'dashicons-images-alt2',
		'can_export'          => true,
		'has_archive'         => false,
		'exclude_from_search' => true,
		'publicly_queryable'  => false,
		'rewrite'             => false,
		'capability_type'     => 'page',
	);

	register_post_type( 'slide', $args );
}

// =============================================================================
// Taxonomía: Categoría de slide
// =============================================================================

add_action( 'init', 'pictau_register_slide_category_taxonomy', 0 );
function pictau_register_slide_category_taxonomy() {

	$labels = array(
		'name'              => _x( 'Categorías de slide', 'taxonomy general name', 'pictau' ),
		'singular_name'     => _x( 'Categoría de slide', 'taxonomy singular name', 'pictau' ),
		'search_items'      => esc_html__( 'Buscar categorías', 'pictau' ),
		'all_items'         => esc_html__( 'Todas las categorías', 'pictau' ),
		'parent_item'       => esc_html__( 'Categoría padre', 'pictau' ),
		'parent_item_colon' => esc_html__( 'Categoría padre:', 'pictau' ),
		'edit_item'         => esc_html__( 'Editar categoría', 'pictau' ),
		'update_item'       => esc_html__( 'Actualizar categoría', 'pictau' ),
		'add_new_item'      => esc_html__( 'Añadir nueva categoría', 'pictau' ),
		'new_item_name'     => esc_html__( 'Nombre de nueva categoría', 'pictau' ),
		'menu_name'         => esc_html__( 'Categorías de slide', 'pictau' ),
	);

	register_taxonomy( 'slide_category', array( 'slide' ), array(
		'labels'             => $labels,
		'hierarchical'       => true,
		'public'             => true,
		'show_ui'            => true,
		'publicly_queryable' => false,
		'show_in_nav_menus'  => false,
		'show_in_rest'       => true,
		'rewrite'            => false,
	) );
}

// Al activar el tema, crear la categoría "home" por defecto si no existe (idempotente).
// 'init' (prioridad 99, check_theme_switched) ya ha registrado la taxonomía arriba
// (prioridad 0) cuando WordPress dispara after_switch_theme en la misma pasada.
add_action( 'after_switch_theme', 'pictau_create_default_slide_category' );
function pictau_create_default_slide_category() {
	if ( ! term_exists( 'home', 'slide_category' ) ) {
		wp_insert_term( 'home', 'slide_category', array( 'slug' => 'home' ) );
	}
}

// =============================================================================
// META BOX: Datos del slide — sustituye el grupo de campos Pods "datos_slide"
// (orden, slide_callback, caducidad)
// =============================================================================

add_action( 'add_meta_boxes_slide', 'pictau_slide_fields_metabox' );
function pictau_slide_fields_metabox() {
	add_meta_box(
		'pictau_slide_fields',
		esc_html__( 'Datos del slide', 'pictau' ),
		'pictau_render_slide_fields_metabox',
		'slide',
		'normal',
		'high'
	);
}

function pictau_render_slide_fields_metabox( $post ) {
	$orden          = get_post_meta( $post->ID, 'orden', true );
	$slide_callback = get_post_meta( $post->ID, 'slide_callback', true );
	$caducidad      = get_post_meta( $post->ID, 'caducidad', true );
	if ( '0000-00-00 00:00:00' === $caducidad ) {
		$caducidad = '';
	}
	// <input type="datetime-local"> espera 'Y-m-d\TH:i' o 'Y-m-d\TH:i:s'
	$caducidad_input = $caducidad ? str_replace( ' ', 'T', $caducidad ) : '';

	wp_nonce_field( 'pictau_slide_fields_save', 'pictau_slide_fields_nonce' );
	?>
	<p>
		<label for="pictau_slide_orden"><strong><?php esc_html_e( 'Orden', 'pictau' ); ?></strong></label><br>
		<input type="number" id="pictau_slide_orden" name="pictau_slide_orden"
			value="<?php echo esc_attr( $orden ); ?>" min="0" step="1" class="regular-text">
		<p class="description"><?php esc_html_e( 'Orden de aparición (menor = primero, prioridad LCP). Vacío = último.', 'pictau' ); ?></p>
	</p>
	<p>
		<label for="pictau_slide_callback"><strong><?php esc_html_e( 'Callback JS', 'pictau' ); ?></strong></label><br>
		<input type="text" id="pictau_slide_callback" name="pictau_slide_callback"
			value="<?php echo esc_attr( $slide_callback ); ?>" maxlength="255" class="regular-text">
		<p class="description"><?php esc_html_e( 'Nombre de función JS global (window[fn]) a llamar cuando este slide queda activo. Misma firma que el callback global: fn(newIndex, splide).', 'pictau' ); ?></p>
	</p>
	<p>
		<label for="pictau_slide_caducidad"><strong><?php esc_html_e( 'Caducidad', 'pictau' ); ?></strong></label><br>
		<input type="datetime-local" id="pictau_slide_caducidad" name="pictau_slide_caducidad"
			value="<?php echo esc_attr( $caducidad_input ); ?>" step="1" class="regular-text">
		<p class="description"><?php esc_html_e( 'Fecha y hora en que el slide se despublicará automáticamente. Dejar vacío si no caduca.', 'pictau' ); ?></p>
	</p>
	<?php
}

add_action( 'save_post_slide', 'pictau_save_slide_fields_metabox' );
function pictau_save_slide_fields_metabox( $post_id ) {
	if ( ! isset( $_POST['pictau_slide_fields_nonce'] )
		|| ! wp_verify_nonce( $_POST['pictau_slide_fields_nonce'], 'pictau_slide_fields_save' ) ) {
		return;
	}
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	if ( isset( $_POST['pictau_slide_orden'] ) ) {
		$orden = sanitize_text_field( wp_unslash( $_POST['pictau_slide_orden'] ) );
		update_post_meta( $post_id, 'orden', $orden !== '' ? (int) $orden : '' );
	}

	if ( isset( $_POST['pictau_slide_callback'] ) ) {
		$cb = sanitize_text_field( wp_unslash( $_POST['pictau_slide_callback'] ) );
		update_post_meta( $post_id, 'slide_callback', mb_substr( $cb, 0, 255 ) );
	}

	if ( isset( $_POST['pictau_slide_caducidad'] ) ) {
		$raw = sanitize_text_field( wp_unslash( $_POST['pictau_slide_caducidad'] ) );
		if ( $raw === '' ) {
			update_post_meta( $post_id, 'caducidad', '' );
		} else {
			$raw = str_replace( 'T', ' ', $raw );
			$dt  = DateTime::createFromFormat( 'Y-m-d H:i:s', $raw ) ?: DateTime::createFromFormat( 'Y-m-d H:i', $raw );
			update_post_meta( $post_id, 'caducidad', $dt ? $dt->format( 'Y-m-d H:i:s' ) : '' );
		}
	}
}
