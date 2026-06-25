<?php
/**
 * Block Attributes — implementación nativa de atributos HTML en bloques Gutenberg.
 * Reemplaza el plugin attributes-for-blocks (skadev).
 *
 * @package pictau_tw
 */

defined( 'ABSPATH' ) || exit;

define(
	'PICTAU_BLOCK_ATTR_UNSUPPORTED',
	array(
		'core/freeform',
		'core/html',
		'core/shortcode',
		'core/legacy-widget',
	)
);

/**
 * Registra el atributo blockAttributes en todos los bloques soportados.
 *
 * @param array  $args Argumentos del tipo de bloque.
 * @param string $name Nombre del bloque.
 * @return array
 */
function pictau_block_attributes_register_args( $args, $name ) {
	if ( in_array( $name, PICTAU_BLOCK_ATTR_UNSUPPORTED, true ) ) {
		return $args;
	}
	if ( ! isset( $args['attributes'] ) || ! is_array( $args['attributes'] ) ) {
		$args['attributes'] = array();
	}
	$args['attributes']['blockAttributes'] = array(
		'type'    => 'object',
		'default' => array(),
	);
	return $args;
}
add_filter( 'register_block_type_args', 'pictau_block_attributes_register_args', 10, 2 );

/**
 * Fusiona un nuevo valor en el valor existente de un atributo HTML.
 *
 * - class: unión con espacio, sin duplicados.
 * - style: unión con punto y coma, normalizado.
 * - otros: $value reemplaza $existing.
 *
 * @param string $attribute Nombre del atributo HTML.
 * @param string $existing  Valor actual del atributo.
 * @param string $value     Valor nuevo a añadir.
 * @return string
 */
function pictau_block_attributes_merge( $attribute, $existing, $value ) {
	$existing = (string) $existing;
	$value    = (string) $value;

	if ( 'style' === $attribute ) {
		$normalize = function ( $s ) {
			$s = preg_replace( '/\s*:\s*/', ':', $s );
			$s = preg_replace( '/\s*;\s*/', ';', $s );
			$s = rtrim( trim( $s ), ';' );
			return $s;
		};
		$existing = $normalize( $existing );
		$value    = $normalize( $value );
		if ( '' === $existing ) {
			return $value;
		}
		if ( '' === $value || $existing === $value ) {
			return $existing;
		}
		return $existing . ';' . $value;
	}

	if ( 'class' === $attribute ) {
		$existing_classes = array_filter( explode( ' ', $existing ) );
		$new_classes      = array_filter( explode( ' ', $value ) );
		foreach ( $new_classes as $cls ) {
			if ( ! in_array( $cls, $existing_classes, true ) ) {
				$existing_classes[] = $cls;
			}
		}
		return implode( ' ', $existing_classes );
	}

	return $value;
}

/**
 * Aplica los atributos blockAttributes al HTML renderizado del bloque.
 *
 * @param string $block_content HTML del bloque.
 * @param array  $block         Datos del bloque.
 * @return string
 */
function pictau_block_attributes_render( $block_content, $block ) {
	if ( in_array( $block['blockName'], PICTAU_BLOCK_ATTR_UNSUPPORTED, true ) ) {
		return $block_content;
	}

	$stored = isset( $block['attrs']['blockAttributes'] ) ? $block['attrs']['blockAttributes'] : array();
	if ( empty( $stored ) || ! is_array( $stored ) ) {
		return $block_content;
	}

	$tags = new WP_HTML_Tag_Processor( $block_content );
	if ( ! $tags->next_tag() ) {
		return $block_content;
	}

	foreach ( $stored as $attr => $value ) {
		$existing = (string) $tags->get_attribute( $attr );
		$merged   = pictau_block_attributes_merge( $attr, $existing, (string) $value );
		$tags->set_attribute( $attr, $merged );
	}

	return $tags->get_updated_html();
}
add_filter( 'render_block', 'pictau_block_attributes_render', 10, 2 );

/**
 * Elimina los valores de blockAttributes del contenido guardado
 * para usuarios sin capacidad unfiltered_html.
 *
 * @param string $content Contenido del post.
 * @return string
 */
function pictau_block_attributes_sanitize( $content ) {
	if ( false === strpos( $content, '<!-- wp:' ) ) {
		return $content;
	}
	if ( false === strpos( $content, 'blockAttributes' ) ) {
		return $content;
	}

	// Cargar funciones de usuario si aún no están disponibles (pre_kses dispara temprano).
	if ( ! defined( 'SECURE_AUTH_COOKIE' ) ) {
		if ( ! function_exists( 'wp_cookie_constants' ) ) {
			require ABSPATH . WPINC . '/default-constants.php';
		}
		wp_cookie_constants();
	}
	if ( ! function_exists( 'wp_get_current_user' ) ) {
		require ABSPATH . WPINC . '/pluggable.php';
	}

	if ( current_user_can( 'unfiltered_html' ) ) {
		return $content;
	}

	if ( preg_match_all( '/\\\\?"blockAttributes\\\\?"\s*:\s*\{[^}]*\}/', $content, $matches ) ) {
		foreach ( $matches[0] as $match ) {
			$empty = '"blockAttributes":{}';
			if ( wp_unslash( $match ) !== $match ) {
				$empty = wp_slash( $empty );
			}
			$content = str_replace( $match, $empty, $content );
		}
	}

	return $content;
}
add_filter( 'pre_kses', 'pictau_block_attributes_sanitize' );
