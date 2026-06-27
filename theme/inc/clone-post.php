<?php
/**
 * Clone Post — funcionalidad de clonación nativa del tema.
 *
 * Añade un enlace "Clonar" en la fila de cada post y una bulk action
 * para todos los post types con UI en el admin (posts, pages y CPTs).
 * El clon se crea siempre como borrador (draft).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Devuelve los post types que admiten clonación.
 * Incluye todos los tipos públicos + los que tienen UI aunque no sean públicos.
 *
 * @return string[]
 */
function pictau_clone_get_supported_post_types() {
	$public   = get_post_types( [ 'public' => true ], 'names' );
	$with_ui  = get_post_types( [ 'show_ui' => true, 'publicly_queryable' => false ], 'names' );
	$all      = array_unique( array_merge( array_values( $public ), array_values( $with_ui ) ) );

	// Excluir tipos internos de WP y de plugins que no tienen sentido clonar.
	$excluded = [
		// Core WP internos.
		'attachment', 'revision', 'nav_menu_item', 'custom_css', 'customize_changeset',
		'oembed_cache', 'user_request', 'wp_block', 'wp_template', 'wp_template_part',
		'wp_global_styles', 'wp_navigation', 'wp_font_family', 'wp_font_face',
		// Pods internos.
		'_pods_template', '_pods_pod', '_pods_group', '_pods_field',
		// Plugins de terceros.
		'wpcf7_contact_form',
	];

	return array_values( array_diff( $all, $excluded ) );
}

/**
 * Clona un post: crea un borrador con los mismos datos, meta y taxonomías.
 *
 * @param  int $post_id ID del post original.
 * @return int|WP_Error ID del nuevo post o WP_Error en caso de fallo.
 */
function pictau_clone_post( $post_id ) {
	$post = get_post( $post_id );

	if ( ! $post || 'revision' === $post->post_type ) {
		return new WP_Error( 'invalid_post', esc_html__( 'Post no válido.', 'pictau' ) );
	}

	$new_post_data = [
		'post_title'   => $post->post_title,
		'post_content' => $post->post_content,
		'post_excerpt' => $post->post_excerpt,
		'post_status'  => 'draft',
		'post_type'    => $post->post_type,
		'post_author'  => $post->post_author,
		'post_parent'  => $post->post_parent,
		'menu_order'   => $post->menu_order,
		'comment_status' => $post->comment_status,
		'ping_status'  => $post->ping_status,
	];

	$new_id = wp_insert_post( wp_slash( $new_post_data ), true );

	if ( is_wp_error( $new_id ) ) {
		return $new_id;
	}

	// Copiar post meta (con blacklist de campos internos/técnicos).
	$excluded_meta = [ '_edit_lock', '_edit_last', '_wp_old_slug', '_wp_trash_meta_status', '_wp_trash_meta_time' ];
	$all_meta      = get_post_meta( $post_id );

	if ( $all_meta ) {
		foreach ( $all_meta as $meta_key => $meta_values ) {
			// Excluir meta del plugin duplicate-post y meta técnica de WP.
			if ( str_starts_with( $meta_key, '_dp_' ) ) {
				continue;
			}
			if ( in_array( $meta_key, $excluded_meta, true ) ) {
				continue;
			}
			foreach ( $meta_values as $meta_value ) {
				add_post_meta( $new_id, $meta_key, maybe_unserialize( $meta_value ) );
			}
		}
	}

	// Copiar taxonomías y términos asignados.
	$taxonomies = get_object_taxonomies( $post->post_type );
	foreach ( $taxonomies as $taxonomy ) {
		$terms = wp_get_object_terms( $post_id, $taxonomy, [ 'fields' => 'ids' ] );
		if ( ! is_wp_error( $terms ) && ! empty( $terms ) ) {
			wp_set_object_terms( $new_id, $terms, $taxonomy );
		}
	}

	return $new_id;
}

/**
 * Handler para la acción de clonar un post individual desde la fila del admin.
 */
function pictau_clone_action_handler() {
	if ( ! isset( $_GET['action'], $_GET['post'] ) || 'pictau_clone' !== $_GET['action'] ) {
		return;
	}

	$post_id = absint( $_GET['post'] );

	check_admin_referer( 'pictau_clone_' . $post_id );

	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		wp_die( esc_html__( 'No tienes permisos para clonar este contenido.', 'pictau' ) );
	}

	$post = get_post( $post_id );
	if ( ! $post ) {
		wp_die( esc_html__( 'El contenido original no existe.', 'pictau' ) );
	}

	if ( ! in_array( $post->post_type, pictau_clone_get_supported_post_types(), true ) ) {
		wp_die( esc_html__( 'Este tipo de contenido no admite clonación.', 'pictau' ) );
	}

	$new_id = pictau_clone_post( $post_id );

	if ( is_wp_error( $new_id ) ) {
		wp_die( esc_html( $new_id->get_error_message() ) );
	}

	$redirect = add_query_arg(
		[
			'post_type'    => ( 'post' !== $post->post_type ) ? $post->post_type : false,
			'pictau_cloned' => 1,
		],
		admin_url( 'edit.php' )
	);

	wp_safe_redirect( $redirect );
	exit;
}
add_action( 'admin_action_pictau_clone', 'pictau_clone_action_handler' );

/**
 * Añade el enlace "Clonar" en la fila de post types no-page.
 *
 * @param  array    $actions Acciones existentes.
 * @param  \WP_Post $post    Post actual.
 * @return array
 */
function pictau_clone_row_action( $actions, $post ) {
	if ( ! in_array( $post->post_type, pictau_clone_get_supported_post_types(), true ) ) {
		return $actions;
	}

	if ( ! current_user_can( 'edit_post', $post->ID ) ) {
		return $actions;
	}

	$url = wp_nonce_url(
		add_query_arg(
			[
				'action' => 'pictau_clone',
				'post'   => $post->ID,
			],
			admin_url( 'admin.php' )
		),
		'pictau_clone_' . $post->ID
	);

	$actions['pictau_clone'] = sprintf(
		'<a href="%s">%s</a>',
		esc_url( $url ),
		esc_html__( 'Clonar', 'pictau' )
	);

	return $actions;
}
add_filter( 'post_row_actions', 'pictau_clone_row_action', 10, 2 );
add_filter( 'page_row_actions', 'pictau_clone_row_action', 10, 2 );

/**
 * Registra la bulk action "Clonar" para cada post type soportado.
 */
function pictau_clone_register_bulk_actions() {
	foreach ( pictau_clone_get_supported_post_types() as $post_type ) {
		add_filter(
			'bulk_actions-edit-' . $post_type,
			function ( $bulk_actions ) {
				$bulk_actions['pictau_clone_bulk'] = esc_html__( 'Clonar', 'pictau' );
				return $bulk_actions;
			}
		);

		add_filter(
			'handle_bulk_actions-edit-' . $post_type,
			'pictau_clone_bulk_handler',
			10,
			3
		);
	}
}
add_action( 'admin_init', 'pictau_clone_register_bulk_actions' );

/**
 * Handler para la bulk action de clonación.
 *
 * @param  string $redirect_to URL de redirección base.
 * @param  string $action      Nombre de la acción.
 * @param  int[]  $post_ids    IDs seleccionados.
 * @return string URL de redirección con resultado.
 */
function pictau_clone_bulk_handler( $redirect_to, $action, $post_ids ) {
	if ( 'pictau_clone_bulk' !== $action ) {
		return $redirect_to;
	}

	$cloned = 0;
	foreach ( $post_ids as $post_id ) {
		$post_id = absint( $post_id );
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			continue;
		}
		$result = pictau_clone_post( $post_id );
		if ( ! is_wp_error( $result ) ) {
			$cloned++;
		}
	}

	return add_query_arg( 'pictau_cloned', $cloned, $redirect_to );
}

/**
 * Muestra un aviso admin tras clonar uno o varios posts.
 */
function pictau_clone_admin_notice() {
	if ( ! isset( $_GET['pictau_cloned'] ) ) {
		return;
	}

	$count = absint( $_GET['pictau_cloned'] );

	if ( $count < 1 ) {
		return;
	}

	$message = $count === 1
		? esc_html__( 'Se ha creado 1 borrador clonado correctamente.', 'pictau' )
		: sprintf(
			/* translators: %d: número de borradores creados */
			esc_html__( 'Se han creado %d borradores clonados correctamente.', 'pictau' ),
			$count
		);

	printf(
		'<div class="notice notice-success is-dismissible"><p>%s</p></div>',
		$message
	);
}
add_action( 'admin_notices', 'pictau_clone_admin_notice' );
