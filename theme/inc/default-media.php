<?php
/**
 * Importa a la biblioteca de medios las imágenes de theme/assets/ al activar el tema.
 *
 * @package pictau_tw
 */

// Extensiones de imagen a importar. theme/assets/ también contiene ficheros no-imagen
// (p.ej. inter2.ttf, una fuente usada en template-functions.php) que deben ignorarse.
const PICTAU_DEFAULT_MEDIA_EXTENSIONS = array( 'svg', 'png', 'jpg', 'jpeg', 'gif', 'webp' );

add_action( 'after_switch_theme', 'pictau_import_default_media' );
function pictau_import_default_media() {
	$dir = get_template_directory() . '/assets';
	if ( ! is_dir( $dir ) ) {
		return;
	}

	foreach ( scandir( $dir ) as $filename ) {
		$ext = strtolower( pathinfo( $filename, PATHINFO_EXTENSION ) );
		if ( ! in_array( $ext, PICTAU_DEFAULT_MEDIA_EXTENSIONS, true ) ) {
			continue;
		}

		$title = ucwords( str_replace( array( '-', '_' ), ' ', pathinfo( $filename, PATHINFO_FILENAME ) ) );
		$mime  = 'svg' === $ext ? 'image/svg+xml' : 'image/' . ( 'jpg' === $ext ? 'jpeg' : $ext );

		pictau_import_theme_asset( $filename, $title, $mime );
	}
}

/**
 * Importa un único fichero de theme/assets/ como adjunto, si no se ha importado ya
 * (marcado con el meta _pictau_bundled_asset). Idempotente: si el usuario borra el
 * adjunto de la biblioteca, se volverá a crear en la siguiente activación del tema.
 */
function pictau_import_theme_asset( $filename, $title, $mime_type ) {
	$existing = get_posts( array(
		'post_type'      => 'attachment',
		'post_status'    => 'inherit',
		'posts_per_page' => 1,
		'fields'         => 'ids',
		'meta_key'       => '_pictau_bundled_asset',
		'meta_value'     => $filename,
	) );
	if ( ! empty( $existing ) ) {
		return;
	}

	// Puede que el fichero ya se haya subido manualmente (con el mismo nombre) antes de
	// existir esta importación automática. Si es así, solo lo marcamos como "nuestro" en
	// vez de crear un duplicado con sufijo "-1" en el nombre de archivo.
	global $wpdb;
	$attachment_id = $wpdb->get_var( $wpdb->prepare(
		"SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = '_wp_attached_file' AND ( meta_value = %s OR meta_value LIKE %s ) LIMIT 1",
		$filename,
		'%/' . $wpdb->esc_like( $filename )
	) );
	if ( $attachment_id ) {
		update_post_meta( $attachment_id, '_pictau_bundled_asset', $filename );
		return;
	}

	$source = get_template_directory() . '/assets/' . $filename;
	if ( ! file_exists( $source ) ) {
		return;
	}

	require_once ABSPATH . 'wp-admin/includes/image.php';

	$uploaded = wp_upload_bits( $filename, null, file_get_contents( $source ) );
	if ( ! empty( $uploaded['error'] ) ) {
		return;
	}

	$attachment_id = wp_insert_attachment( array(
		'post_mime_type' => $mime_type,
		'post_title'     => $title,
		'post_content'   => '',
		'post_status'    => 'inherit',
	), $uploaded['file'] );

	if ( is_wp_error( $attachment_id ) || ! $attachment_id ) {
		return;
	}

	$metadata = wp_generate_attachment_metadata( $attachment_id, $uploaded['file'] );
	wp_update_attachment_metadata( $attachment_id, $metadata );

	update_post_meta( $attachment_id, '_pictau_bundled_asset', $filename );
	update_post_meta( $attachment_id, '_wp_attachment_image_alt', $title );
}
