<?php

/**
 * Catalog — CPT Productos, taxonomía product_category.
 * Shortcodes, columnas de admin, filtros y Quick Edit relacionados
 * con el catálogo de productos.
 *
 * @package pictau_tw
 */


// =============================================================================
// ADMIN: Columna "Orden" en el listado de Categorías de producto
// =============================================================================

add_filter( 'manage_edit-product_category_columns', function ( $columns ) {
	$columns['orden'] = __( 'Orden', 'pictau' );
	return $columns;
} );

add_filter( 'manage_product_category_custom_column', function ( $content, $column_name, $term_id ) {
	if ( 'orden' !== $column_name ) {
		return $content;
	}
	$valor = (int) get_term_meta( $term_id, 'orden', true );
	return $valor ?: '—';
}, 10, 3 );

// Hacer la columna "Orden" ordenable en el listado
add_filter( 'manage_edit-product_category_sortable_columns', function ( $sortable ) {
	$sortable['orden'] = 'orden';
	return $sortable;
} );

// =============================================================================
//! SHORTCODE: [catalog-category-menu] — Árbol de navegación del catálogo
// =============================================================================

/**
 * Shortcode [catalog-category-menu title="Productos"]
 *
 * Renders a hierarchical navigation menu for product_category taxonomy.
 * Auto-detects the active term and expands its parent.
 *
 * @param array $atts Shortcode attributes.
 * @return string HTML output.
 */
add_shortcode( 'catalog-category-menu', function ( $atts ) {
	$atts = shortcode_atts( [ 'title' => __( 'Productos', 'pictau' ) ], $atts );

	// Detect current term
	$active_term_id  = 0;
	$active_parent   = 0;

	$queried = get_queried_object();

	if ( $queried instanceof WP_Term && $queried->taxonomy === 'product_category' ) {
		// Taxonomy archive
		$active_term_id = (int) $queried->term_id;
		$active_parent  = (int) $queried->parent;
	} elseif ( is_singular( 'producto' ) ) {
		// Single product: pick first assigned term
		$terms = get_the_terms( get_the_id(), 'product_category' );
		if ( $terms && ! is_wp_error( $terms ) ) {
			// Sort: subcategories first (parent > 0)
			usort( $terms, function ( $a, $b ) { return $b->parent - $a->parent; } );
			$active_term_id = (int) $terms[0]->term_id;
			$active_parent  = (int) $terms[0]->parent;
		}
	}

	// Get root categories (sorted by custom 'orden' meta field)
	$lang_args = [];
	if ( function_exists( 'pll_current_language' ) ) {
		$lang_args['lang'] = pll_current_language();
	}

	$root_terms = get_terms( array_merge( [
		'taxonomy'   => 'product_category',
		'parent'     => 0,
		'hide_empty' => false,
	], $lang_args ) );

	if ( is_wp_error( $root_terms ) || empty( $root_terms ) ) {
		return '';
	}

	usort( $root_terms, function ( $a, $b ) {
		$raw_a   = get_term_meta( $a->term_id, 'orden', true );
		$raw_b   = get_term_meta( $b->term_id, 'orden', true );
		$orden_a = ( $raw_a !== '' ) ? (int) $raw_a : PHP_INT_MAX;
		$orden_b = ( $raw_b !== '' ) ? (int) $raw_b : PHP_INT_MAX;
		return $orden_a <=> $orden_b;
	} );

	// Helper: returns the single product's permalink if the term has exactly 1 product,
	// or null otherwise. Only fires a WP_Query when $term->count === 1.
	$get_single_product_url = function ( $term_id ) {
		$q = new WP_Query( [
			'post_type'      => 'producto',
			'posts_per_page' => 1,
			'fields'         => 'ids',
			'tax_query'      => [ [
				'taxonomy'         => 'product_category',
				'field'            => 'term_id',
				'terms'            => $term_id,
				'include_children' => false,
			] ],
		] );
		return ( $q->post_count === 1 ) ? get_permalink( $q->posts[0] ) : null;
	};

	ob_start();
	?>
	<nav class="catalog-category-menu" aria-label="<?php echo esc_attr( $atts['title'] ); ?>">
		<?php if ( $atts['title'] ) : ?>
			<h3 class="catalog-menu-title"><?php echo esc_html( $atts['title'] ); ?></h3>
		<?php endif; ?>

		<ul class="catalog-menu-list">
			<?php foreach ( $root_terms as $root ) :
				$children = get_terms( array_merge( [
					'taxonomy'   => 'product_category',
					'parent'     => $root->term_id,
					'hide_empty' => false,
				], $lang_args ) );

				if ( ! is_wp_error( $children ) && ! empty( $children ) ) {
					usort( $children, function ( $a, $b ) {
						$raw_a   = get_term_meta( $a->term_id, 'orden', true );
						$raw_b   = get_term_meta( $b->term_id, 'orden', true );
						$orden_a = ( $raw_a !== '' ) ? (int) $raw_a : PHP_INT_MAX;
						$orden_b = ( $raw_b !== '' ) ? (int) $raw_b : PHP_INT_MAX;
						return $orden_a <=> $orden_b;
					} );
				}

				$has_children     = ! is_wp_error( $children ) && ! empty( $children );
				$is_active        = ( $active_term_id === (int) $root->term_id );
				// Expand if this root IS the active term, or IS the parent of the active term
				$is_active_parent = $has_children && (
					( $active_parent === (int) $root->term_id ) ||
					( ! $is_active && $active_term_id === (int) $root->term_id )
				);
				$expanded         = $is_active || $is_active_parent;

				$li_classes = [];
				if ( $has_children )     $li_classes[] = 'has-children';
				if ( $is_active )        $li_classes[] = 'is-active';
				if ( $is_active_parent ) $li_classes[] = 'is-active-parent';

				// If leaf category with exactly 1 product, link directly to that product
				$root_single_url = ( ! $has_children && $root->count === 1 )
					? $get_single_product_url( $root->term_id )
					: null;
				$root_href = $root_single_url ?? get_term_link( $root );
			?>
				<li class="catalog-menu-item <?php echo esc_attr( implode( ' ', $li_classes ) ); ?>"
				    data-expanded="<?php echo $expanded ? 'true' : 'false'; ?>">

					<div class="catalog-menu-item-row">
						<a href="<?php echo esc_url( $root_href ); ?>">
							<?php echo esc_html( $root->name ); ?>
						</a>

						<?php if ( $has_children ) : ?>
							<button class="catalog-menu-toggle"
							        aria-expanded="<?php echo $expanded ? 'true' : 'false'; ?>"
							        aria-label="<?php echo esc_attr( sprintf( __( 'Expandir %s', 'pictau' ), $root->name ) ); ?>">
								<span class="catalog-menu-toggle-icon" aria-hidden="true"></span>
							</button>
						<?php endif; ?>
					</div>

					<?php if ( $has_children ) : ?>
						<ul class="catalog-menu-children">
							<?php foreach ( $children as $child ) :
								$is_child_active = ( $active_term_id === (int) $child->term_id );

								// If leaf category with exactly 1 product, link directly to that product
								$child_single_url = ( $child->count === 1 )
									? $get_single_product_url( $child->term_id )
									: null;
								$child_href = $child_single_url ?? get_term_link( $child );
							?>
								<li class="catalog-menu-item <?php echo $is_child_active ? 'is-active' : ''; ?>">
									<a href="<?php echo esc_url( $child_href ); ?>">
										<?php echo esc_html( $child->name ); ?>
									</a>
								</li>
							<?php endforeach; ?>
						</ul>
					<?php endif; ?>

				</li>
			<?php endforeach; ?>
		</ul>
	</nav>
	<?php
	return ob_get_clean();
} );

// =============================================================================
// ADMIN: Filtro por categoría en el listado de Productos
// =============================================================================

add_action( 'restrict_manage_posts', function ( $post_type ) {
	if ( 'producto' !== $post_type ) {
		return;
	}
	$selected = isset( $_GET['product_category'] ) ? sanitize_text_field( $_GET['product_category'] ) : '';
	wp_dropdown_categories( [
		'show_option_all' => __( 'Todas las categorías', 'pictau' ),
		'taxonomy'        => 'product_category',
		'name'            => 'product_category',
		'orderby'         => 'name',
		'selected'        => $selected,
		'hierarchical'    => true,
		'show_count'      => false,
		'hide_empty'      => false,
		'value_field'     => 'slug',
	] );
} );

add_action( 'parse_query', function ( $query ) {
	global $pagenow;
	if ( ! is_admin() || 'edit.php' !== $pagenow ) {
		return;
	}
	if ( ( $query->query_vars['post_type'] ?? '' ) !== 'producto' ) {
		return;
	}
	$cat = isset( $_GET['product_category'] ) ? sanitize_text_field( $_GET['product_category'] ) : '';
	if ( $cat ) {
		$query->query_vars['tax_query'] = [
			[
				'taxonomy' => 'product_category',
				'field'    => 'slug',
				'terms'    => $cat,
			],
		];
	}
} );

// =============================================================================
// ADMIN: Columna "Categoría" + "Orden catálogo" en el listado de Productos
// =============================================================================

// Registrar la columna "Orden catálogo" como ordenable
add_filter( 'manage_edit-producto_sortable_columns', function ( $sortable ) {
	$sortable['orden_catalogo'] = 'orden_catalogo';
	return $sortable;
} );

// Aplicar el ordenamiento cuando se selecciona la columna
add_action( 'pre_get_posts', function ( $query ) {
	if ( ! is_admin() || ! $query->is_main_query() ) {
		return;
	}
	if ( ( $query->query_vars['post_type'] ?? '' ) !== 'producto' ) {
		return;
	}
	if ( 'orden_catalogo' === $query->get( 'orderby' ) ) {
		$order = strtoupper( $query->get( 'order' ) ?: 'ASC' );
		// Guardamos la dirección en un query var propio para leerlo en posts_clauses
		$query->set( '_pictau_orden_sort', $order );
		// Vaciamos orderby para que WP no genere su propio ORDER BY
		$query->set( 'orderby', 'none' );
	}
} );

// LEFT JOIN propio + ORDER BY con NULLs siempre al final
add_filter( 'posts_clauses', function ( $clauses, $query ) {
	$order = $query->get( '_pictau_orden_sort' );
	if ( ! $order ) {
		return $clauses;
	}

	global $wpdb;
	$order = in_array( $order, [ 'ASC', 'DESC' ], true ) ? $order : 'ASC';

	// LEFT JOIN con alias propio para tener control total del nombre de tabla
	$clauses['join'] .= " LEFT JOIN {$wpdb->postmeta} AS pictau_orden_meta"
		. " ON ( {$wpdb->posts}.ID = pictau_orden_meta.post_id"
		. " AND pictau_orden_meta.meta_key = 'orden' )";

	// NULLs y vacíos siempre al final, independientemente de la dirección
	$clauses['orderby'] = "CASE WHEN pictau_orden_meta.meta_value IS NULL"
		. " OR pictau_orden_meta.meta_value = '' THEN 1 ELSE 0 END ASC,"
		. " CAST( pictau_orden_meta.meta_value AS SIGNED ) {$order}";

	return $clauses;
}, 10, 2 );

add_filter( 'manage_producto_posts_columns', function ( $columns ) {
	$columns['product_category'] = __( 'Categoría', 'pictau' );
	$columns['orden_catalogo']   = __( 'Orden catálogo', 'pictau' );
	return $columns;
} );

add_action( 'manage_producto_posts_custom_column', function ( $column, $post_id ) {
	if ( 'product_category' === $column ) {
		$terms = get_the_terms( $post_id, 'product_category' );
		if ( $terms && ! is_wp_error( $terms ) ) {
			$links = array_map( function ( $term ) {
				return '<a href="' . esc_url( add_query_arg( [
					'post_type'        => 'producto',
					'product_category' => $term->slug,
				], admin_url( 'edit.php' ) ) ) . '">' . esc_html( $term->name ) . '</a>';
			}, $terms );
			echo implode( ', ', $links );
		} else {
			echo '—';
		}
	}

	if ( 'orden_catalogo' === $column ) {
		$pods  = pods( 'producto', $post_id );
		$orden = $pods ? $pods->field( 'orden' ) : '';
		$valor = ( $orden !== '' && $orden !== null ) ? (int) $orden : '';
		// data-orden used by Quick Edit JS to pre-populate the field
		echo '<span class="hidden" data-orden="' . esc_attr( $valor ) . '"></span>';
		echo $valor !== '' ? esc_html( $valor ) : '—';
	}
}, 10, 2 );

// Quick Edit: campo "Orden catálogo"
add_action( 'quick_edit_custom_box', function ( $column_name, $post_type ) {
	if ( 'orden_catalogo' !== $column_name || 'producto' !== $post_type ) {
		return;
	}
	?>
	<fieldset class="inline-edit-col-right">
		<div class="inline-edit-col">
			<label>
				<span class="title"><?php esc_html_e( 'Orden catálogo', 'pictau' ); ?></span>
				<input type="number" name="pictau_orden_catalogo" class="pictau-orden-catalogo" value="" min="0" step="1">
			</label>
		</div>
	</fieldset>
	<?php
}, 10, 2 );

// Quick Edit: guardar el campo via Pods
add_action( 'save_post_producto', function ( $post_id ) {
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( ! isset( $_POST['pictau_orden_catalogo'] ) ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}
	$valor = $_POST['pictau_orden_catalogo'];
	$pods  = pods( 'producto', $post_id );
	if ( $pods ) {
		$pods->save( 'orden', $valor !== '' ? (int) $valor : null );
	}
} );

// Quick Edit: JS para pre-rellenar el campo con el valor actual de la columna
add_action( 'admin_footer-edit.php', function () {
	$screen = get_current_screen();
	if ( ! $screen || 'producto' !== $screen->post_type ) {
		return;
	}
	?>
	<script>
	( function() {
		const inlineEditPost = window.inlineEditPost;
		if ( ! inlineEditPost ) return;

		const origEdit = inlineEditPost.edit;
		inlineEditPost.edit = function( id ) {
			origEdit.apply( this, arguments );

			const postId   = typeof id === 'object' ? parseInt( this.getId( id ) ) : parseInt( id );
			const row      = document.querySelector( '#post-' + postId );
			if ( ! row ) return;

			const span     = row.querySelector( '.column-orden_catalogo [data-orden]' );
			const input    = document.querySelector( '#edit-' + postId + ' .pictau-orden-catalogo' );
			if ( ! span || ! input ) return;

			input.value = span.dataset.orden ?? '';
		};
	} )();
	</script>
	<?php
} );

// =============================================================================
//! SHORTCODE: [pedir-presupuesto] — Botón de solicitud de presupuesto
// =============================================================================

/**
 * Shortcode [pedir-presupuesto]
 *
 * Renders a modal-trigger button pre-filled with the current product name.
 * Intended for use inside single producto pages.
 *
 * @return string HTML output.
 */
/**
 * Shortcode [pedir-presupuesto]
 *
 * Renders a modal-trigger button pre-filled with the current product name.
 * Intended for use inside single producto pages.
 *
 * @return string HTML output.
 */
add_shortcode( 'pedir-presupuesto', function () {
	$terms = get_the_terms( get_the_ID(), 'product_category' );
	$prefix = '';
	if ( $terms && ! is_wp_error( $terms ) ) {
		$sorted = wp_list_sort( $terms, 'parent', 'ASC' );
		$prefix = implode( ' / ', wp_list_pluck( $sorted, 'name' ) ) . ' / ';
	}
	$product_name = $prefix . get_the_title();
	$input_data   = esc_attr( $product_name );

	return '<div class="wp-block-buttons is-layout-flex wp-block-buttons-is-layout-flex"><div class="wp-block-button arrow" data-modalform_input_name="producto" data-modalform_input_data="Información sobre ' . $product_name . '" data-modalform_target="lead"><a class="wp-block-button__link wp-element-button" href="#modal-lead">' . esc_html__( 'Solicita información', 'pictau' ) . '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><line x1="40" y1="128" x2="216" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line><polyline points="144 56 216 128 144 200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></polyline></svg></a></div></div>';
} );




// =============================================================================
//! SHORTCODE: [whole-catalog-grid] — Grid de todas las categorías raíz del catálogo
// =============================================================================

/**
 * Shortcode [whole-catalog-grid]
 *
 * Renders a grid of top-level product_category terms (parent = 0).
 * Only categories that have at least one producto post (direct or via children)
 * are included. Ordered by the 'orden' term meta field.
 *
 * @return string HTML output.
 */
add_shortcode( 'whole-catalog-grid', function () {
	$root_terms = get_terms( [
		'taxonomy'   => 'product_category',
		'parent'     => 0,
		'hide_empty' => false,
	] );

	if ( is_wp_error( $root_terms ) || empty( $root_terms ) ) {
		return '';
	}

	// Sort by 'orden' meta (nulls last, then by name)
	usort( $root_terms, function ( $a, $b ) {
		$oa = (int) get_term_meta( $a->term_id, 'orden', true );
		$ob = (int) get_term_meta( $b->term_id, 'orden', true );
		if ( $oa === $ob ) {
			return strcmp( $a->name, $b->name );
		}
		if ( ! $oa ) return 1;
		if ( ! $ob ) return -1;
		return $oa - $ob;
	} );

	// Filter: keep only categories that have at least one producto
	$visible = array_filter( $root_terms, function ( $term ) {
		$q = new WP_Query( [
			'post_type'      => 'producto',
			'posts_per_page' => 1,
			'fields'         => 'ids',
			'no_found_rows'  => false,
			'tax_query'      => [ [
				'taxonomy'         => 'product_category',
				'field'            => 'term_id',
				'terms'            => $term->term_id,
				'include_children' => true,
			] ],
		] );
		return $q->found_posts > 0;
	} );

	if ( empty( $visible ) ) {
		return '';
	}

	// Helper: returns the single product's permalink if the term has exactly 1 direct product
	$get_single_product_url = function ( $term_id ) {
		$q = new WP_Query( [
			'post_type'      => 'producto',
			'posts_per_page' => 1,
			'fields'         => 'ids',
			'tax_query'      => [ [
				'taxonomy'         => 'product_category',
				'field'            => 'term_id',
				'terms'            => $term_id,
				'include_children' => false,
			] ],
		] );
		return ( $q->post_count === 1 ) ? get_permalink( $q->posts[0] ) : null;
	};

	ob_start();
	?>
	<section class="pct-section category-grid-section home-grid">
		<div class="subcat-grid">
			<?php foreach ( $visible as $i => $term ) :
				$img_field = get_term_meta( $term->term_id, 'imagen_destacada', true );
				if ( is_array( $img_field ) ) {
					$img_id = (int) ( $img_field['ID'] ?? ( $img_field[0]['ID'] ?? 0 ) );
				} else {
					$img_id = (int) $img_field;
				}
				$subtitulo = get_term_meta( $term->term_id, 'subtitulo', true );
				$menu_desc = get_term_meta( $term->term_id, 'menu_desc', true );

				$children     = get_terms( [ 'taxonomy' => 'product_category', 'parent' => $term->term_id, 'hide_empty' => false ] );
				$has_children = ! is_wp_error( $children ) && ! empty( $children );
				$single_url   = ( ! $has_children && $term->count === 1 ) ? $get_single_product_url( $term->term_id ) : null;
				$card_href    = $single_url ?? get_term_link( $term );
			?>
				<a href="<?php echo esc_url( $card_href ); ?>" class="subcat-card" data-anim_any>
					<div class="card-media">
						<figure class="subcat-card-image">
							<?php if ( $img_id ) : ?>
								<?php echo wp_get_attachment_image( $img_id, 'medium_large' ); ?>
							<?php else : ?>
								<span class="subcat-card-image--placeholder">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
										<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
									</svg>
								</span>
							<?php endif; ?>
						</figure>
						<svg class="is-foreground" width="512" height="467" version="1.1" id="pd-brand-shape" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 512 467"><path fill="currentColor" d="M511,154.2c-19.5-27.2-81.8-114.1-103.1-144C403.2,3.8,395.8,0,388,0h-12.7c-5.6,0-8.8,6.3-5.5,10.8l64.7,89.8 c10.9,15.2,17,34.5,18.2,54.4c0.3,4.2,3.8,7.5,8,7.5h46C511.1,162.5,513.5,157.7,511,154.2 M301.1,162.5c0,0-83.6-116.6-109.1-152.2 C187.5,3.8,180,0,172.2,0H45.5c-13.3-0.1-21,14.9-13.3,25.7c32.8,45.8,98,136.8,98,136.8L18.5,317.7l0,0C6.9,333.3,0,352.5,0,373.4 c0,51.6,41.9,93.5,93.5,93.5h0.1l0,0h170.6c-51.6,0-93.5-41.9-93.5-93.5c0-22.6,8-43.4,21.3-59.5L301.1,162.5L301.1,162.5z"/></svg>
					</div>
					<div class="subcat-card-body">
						<div>
							<h2 class="subcat-card-title"><?php echo esc_html( $term->name ); ?></h2>
							<?php if ( $subtitulo ) : ?>
								<p class="header-tag close-tag"><?php echo esc_html( $subtitulo ); ?></p>
							<?php endif; ?>
							<?php if ( $menu_desc ) : ?>
								<p class="subcat-card-desc"><?php echo esc_html( $menu_desc ); ?></p>
							<?php endif; ?>
						</div>
					</div>
					<div class="fake-cta-icon">
						<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><line x1="40" y1="128" x2="216" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line><polyline points="144 56 216 128 144 200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></polyline></svg>
					</div>
				</a>
			<?php endforeach; ?>
		</div>
	</section>
	<?php
	return ob_get_clean();
} );


// =============================================================================


// =============================================================================
//! SHORTCODE: [product-grid] — Grid de productos con filtro opcional de variante
// =============================================================================

/**
 * Shortcode [product-grid category="slug1,slug2" variant="fusion" color="fusion_xxx"]
 *
 * Renders a .catalog-grid of producto posts assigned to one or more
 * product_category slugs (comma-separated). If variant is specified, only
 * products whose pd3d-visualizer config.json has a matching group name are
 * shown (accent- and symbol-insensitive, e.g. "fusion" matches "Fusión®").
 * Optionally appends ?color=<value> to each product permalink.
 *
 * @param array $atts  category (required), variant (optional), color (optional).
 * @return string HTML output.
 */
add_shortcode( 'product-grid', function ( $atts ) {
	$atts = shortcode_atts( [
		'category' => '',
		'color'    => '',
		'variant'  => '',
		'only'     => '',
		'class'    => '',
		'wet'      => '',
	], $atts );

	$color       = sanitize_text_field( $atts['color'] );
	$wet         = sanitize_text_field( $atts['wet'] );
	$extra_class = implode( ' ', array_map( 'sanitize_html_class', array_filter( explode( ' ', $atts['class'] ) ) ) );

	$normalize = function( $str ) {
		$str = mb_strtolower( $str, 'UTF-8' );
		$str = iconv( 'UTF-8', 'ASCII//TRANSLIT//IGNORE', $str );
		$str = preg_replace( '/[^a-z0-9]/', '', $str );
		return $str;
	};

	$variant        = sanitize_text_field( $atts['variant'] );
	$variant_needle = $variant !== '' ? $normalize( $variant ) : '';

	$only_ids = array_values( array_filter(
		array_map( 'intval', explode( ',', $atts['only'] ) ),
		fn( $id ) => $id > 0
	) );

	// Acepta uno o varios slugs separados por coma
	$term_ids = [];
	if ( empty( $only_ids ) ) {
		$raw_slugs = array_filter( array_map( 'sanitize_title', explode( ',', $atts['category'] ) ) );
		if ( empty( $raw_slugs ) ) {
			return '';
		}
		foreach ( $raw_slugs as $slug ) {
			$t = get_term_by( 'slug', trim( $slug ), 'product_category' );
			if ( $t && ! is_wp_error( $t ) ) {
				$term_ids[] = $t->term_id;
			}
		}
		if ( empty( $term_ids ) ) {
			return '';
		}
	}

	// 1. Una sola query para todos los IDs + caché de meta y términos en 2 queries adicionales.
	//    Después se agrupa en PHP usando el índice del slug en $term_ids como clave primaria
	//    y el campo 'orden' como clave secundaria — sin queries extra por producto.
	if ( ! empty( $only_ids ) ) {
		$all_ids_query = new WP_Query( [
			'post_type'      => 'producto',
			'posts_per_page' => count( $only_ids ),
			'post__in'       => $only_ids,
			'orderby'        => 'post__in',
			'fields'         => 'ids',
			'no_found_rows'  => true,
			'post_status'    => 'publish',
		] );
	} else {
		$all_ids_query = new WP_Query( [
			'post_type'      => 'producto',
			'posts_per_page' => -1,
			'fields'         => 'ids',
			'no_found_rows'  => true,
			'tax_query'      => [ [
				'taxonomy'         => 'product_category',
				'field'            => 'term_id',
				'terms'            => $term_ids,
				'include_children' => true,
			] ],
			'orderby'        => 'title',
			'order'          => 'ASC',
		] );
	}

	$raw_ids = $all_ids_query->posts;
	if ( empty( $raw_ids ) ) {
		return '';
	}

	// Prima caché de post-meta (necesario para variant/swatches y ordenación por 'orden')
	update_meta_cache( 'post', $raw_ids );

	if ( empty( $only_ids ) ) {
		update_object_term_cache( $raw_ids, 'product_category' );

		// Índice term_id → posición del slug en el array original (0, 1, 2…)
		$term_position = array_flip( $term_ids );

		// Calcula el group_index de un producto: posición del primer term_id coincidente.
		// get_the_terms() devuelve los términos ya desde caché (0 queries).
		$get_group = function ( $post_id ) use ( $term_ids, $term_position ) {
			$terms = get_the_terms( $post_id, 'product_category' );
			if ( ! $terms || is_wp_error( $terms ) ) {
				return PHP_INT_MAX;
			}
			$min = PHP_INT_MAX;
			foreach ( $terms as $t ) {
				// Comprueba el término y todos sus ancestros para cubrir include_children
				$tid = (int) $t->term_id;
				if ( isset( $term_position[ $tid ] ) ) {
					$min = min( $min, $term_position[ $tid ] );
				}
				$parent = (int) $t->parent;
				while ( $parent ) {
					if ( isset( $term_position[ $parent ] ) ) {
						$min = min( $min, $term_position[ $parent ] );
					}
					$ancestor = get_term( $parent, 'product_category' );
					$parent   = ( $ancestor && ! is_wp_error( $ancestor ) ) ? (int) $ancestor->parent : 0;
				}
			}
			return $min;
		};

		usort( $raw_ids, function ( $a, $b ) use ( $get_group ) {
			$ga = $get_group( $a );
			$gb = $get_group( $b );
			if ( $ga !== $gb ) {
				return $ga - $gb;
			}
			// Dentro del mismo grupo: orden ASC, sin orden → al final por título
			$orden_a = get_post_meta( $a, 'orden', true );
			$orden_b = get_post_meta( $b, 'orden', true );
			$has_a   = ( $orden_a !== '' && $orden_a !== null );
			$has_b   = ( $orden_b !== '' && $orden_b !== null );
			if ( $has_a && ! $has_b ) {
				return -1;
			}
			if ( ! $has_a && $has_b ) {
				return 1;
			}
			if ( $has_a && $has_b ) {
				$diff = (int) $orden_a - (int) $orden_b;
				if ( $diff !== 0 ) {
					return $diff;
				}
			}
			return strcmp( get_the_title( $a ), get_the_title( $b ) );
		} );
	}

	// Deduplica manteniendo la primera aparición (por si un producto pertenece a varios grupos)
	$seen    = [];
	$all_ids = [];
	foreach ( $raw_ids as $id ) {
		if ( ! isset( $seen[ $id ] ) ) {
			$all_ids[]   = $id;
			$seen[ $id ] = true;
		}
	}

	// 3. Filtrar productos y construir swatches.
	//    - Con variant: solo productos que tengan un grupo cuyo nombre normalizado contenga la needle.
	//    - Sin variant: todos los productos de la categoría; los que tienen config.json obtienen swatches.
	$product_data = [];
	$vc_base_url  = content_url( '/plugins/pd3d-visualizer/dist/textures/' );

	foreach ( $all_ids as $post_id ) {
		$model_id = get_post_meta( $post_id, 'visualizer_model_id', true );
		$swatches = [];

		if ( $model_id ) {
			$config_file = WP_CONTENT_DIR . '/plugins/pd3d-visualizer/dist/models/'
			               . sanitize_file_name( $model_id ) . '/config.json';

			if ( file_exists( $config_file ) ) {
				$vc_config = json_decode( file_get_contents( $config_file ), true );
				$vc_groups = $vc_config['textures']['Diffuse']['groups'] ?? [];
				$vc_format = $vc_config['textures']['format'] ?? 'webp';

				if ( $variant_needle !== '' ) {
					$has_match = false;
					foreach ( $vc_groups as $group ) {
						if ( strpos( $normalize( $group['name'] ?? '' ), $variant_needle ) !== false ) {
							$has_match = true;
							break;
						}
					}
					if ( ! $has_match ) {
						continue;
					}
				}

				foreach ( $vc_groups as $group ) {
					$mode         = $group['mode'] ?? 'tint';
					$base_texture = $group['baseTexture'] ?? '';
					foreach ( $group['variants'] as $value ) {
						$thumb_id = ( $mode === 'tint' ) ? $base_texture : $value;
						$hex      = ( $mode === 'tint' ) ? $value : '';
						if ( $thumb_id === '' ) {
							continue;
						}
						$swatches[] = [
							'img'  => $vc_base_url . 'texture_diffuse_' . $thumb_id . '_thumb.' . $vc_format,
							'hex'  => $hex,
							'mode' => $mode,
						];
					}
				}
				$swatches = array_unique( $swatches, SORT_REGULAR );

			} elseif ( $variant_needle !== '' ) {
				continue;
			}
		} elseif ( $variant_needle !== '' ) {
			continue;
		}

		$product_data[ $post_id ] = [
			'model_id' => $model_id ?: '',
			'swatches' => $swatches,
		];
	}

	if ( empty( $product_data ) ) {
		return '';
	}

	// 4. Second query ordered by post__in to preserve custom sort
	$product_ids    = array_keys( $product_data );
	$products_query = new WP_Query( [
		'post_type'      => 'producto',
		'posts_per_page' => count( $product_ids ),
		'post__in'       => $product_ids,
		'orderby'        => 'post__in',
		'no_found_rows'  => true,
	] );

	if ( ! $products_query->have_posts() ) {
		return '';
	}

	$max_swatches = max( 1, (int) get_theme_mod( 'catalog_swatches_limit', 10 ) );

	ob_start();
	?>
	<div class="catalog-grid<?php echo $extra_class ? ' ' . esc_attr( $extra_class ) : ''; ?>" data-anim_any data-anim_any_delay="0.2" data-anim_any_duration="0.8" data-anim_any_slideamount="40">
		<?php while ( $products_query->have_posts() ) : $products_query->the_post();
			$pid      = get_the_ID();
			$pdata    = $product_data[ $pid ];
			$swatches = $pdata['swatches'];
			$model_id = $pdata['model_id'];

			$permalink = get_permalink();
			if ( $color ) {
				$permalink = add_query_arg( 'color', $color, $permalink );
			}
			if ( $wet !== '' ) {
				$permalink = add_query_arg( 'wet', $wet, $permalink );
			}

			$pods_p = pods( 'producto', $pid );
			$sub    = $pods_p->field( 'subtitulo' );
		?>
			<article id="post-<?php the_ID(); ?>" <?php post_class( 'catalog-card style-2' ); ?>>
				<a href="<?php echo esc_url( $permalink ); ?>" class="catalog-card-link">
					<?php if ( has_post_thumbnail() ) : ?>
						<figure class="catalog-card-image">
							<?php the_post_thumbnail( 'medium' ); ?>
						</figure>
					<?php else : ?>
						<figure class="catalog-card-image catalog-card-image--placeholder">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
								<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
							</svg>
						</figure>
					<?php endif; ?>
					<div class="catalog-card-body">
						<h2 class="catalog-card-title"><?php the_title(); ?></h2>
						<?php if ( $sub ) : ?>
							<p class="catalog-card-subtitle"><?php echo esc_html( $sub ); ?></p>
						<?php endif; ?>
						<?php if ( count( $swatches ) > 1 || $model_id ) : ?>
						<div class="product-variants">
							<?php if ( $model_id ) : ?>
							<div class="has-3d">
								<svg class="icon-3d-rotate" width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.6799 15.2265C17.1295 14.9624 18.7301 14.8017 20.453 14.7667L19.084 16.1362C18.7422 16.478 18.7422 17.0317 19.084 17.3735C19.2549 17.5444 19.4788 17.6299 19.7026 17.6299C19.9265 17.6299 20.1504 17.5444 20.3213 17.3735L23.8179 13.8761L20.3213 10.3778C19.9795 10.036 19.4258 10.036 19.084 10.3778C18.7422 10.7188 18.7422 11.2733 19.084 11.6151L20.4845 13.0167C18.9465 13.0461 17.4713 13.1733 16.0862 13.3929C17.2032 9.16432 19.2157 6.60352 21.1416 6.60352C23.3018 6.60352 25.4363 9.77539 26.4497 14.4956C26.8203 16.2209 27.0016 18.0712 27.0435 19.9801L25.6943 18.6305C25.3525 18.2887 24.7988 18.2887 24.457 18.6305C24.1152 18.9723 24.1152 19.526 24.457 19.8678L27.9536 23.3652L31.4519 19.8678C31.7937 19.526 31.7937 18.9723 31.4519 18.6305C31.1101 18.2887 30.5564 18.2887 30.2146 18.6305L28.7968 20.0478C28.7583 17.9904 28.5627 15.9947 28.1621 14.1282C26.9316 8.40735 24.2417 4.85352 21.1416 4.85352C18.0467 4.85352 15.4409 8.44954 14.2131 13.7592C8.90271 14.987 5.30615 17.593 5.30615 20.6881C5.30615 21.6187 5.62402 22.5227 6.24951 23.3755C6.42212 23.6096 6.68701 23.7327 6.95532 23.7327C7.13647 23.7327 7.31763 23.678 7.47314 23.5635C7.86279 23.2764 7.94653 22.7295 7.66113 22.3398C7.25952 21.7938 7.05615 21.2375 7.05615 20.6881C7.05615 18.7627 9.61749 16.7501 13.8465 15.6329C13.5955 17.2159 13.4546 18.9107 13.4546 20.6881C13.4546 21.0154 13.458 21.3401 13.4683 21.6614C13.4836 22.1339 13.8733 22.5073 14.3433 22.5073C14.3518 22.5073 14.3621 22.5073 14.3723 22.5065C14.8542 22.4911 15.2336 22.0869 15.2183 21.6033C15.208 21.3008 15.2046 20.9966 15.2046 20.6881C15.2046 18.6983 15.3806 16.8697 15.6799 15.2265Z" fill="currentColor"/><path d="M26.3504 30.396C25.9112 30.196 25.3917 30.3926 25.1934 30.8352C24.0689 33.3371 22.5924 34.7727 21.1414 34.7727C19.9674 34.7727 18.7591 33.8242 17.7406 32.0998C17.4928 31.6846 16.9561 31.5461 16.5409 31.7922C16.1256 32.0383 15.9871 32.5749 16.2332 32.9919C17.6004 35.3008 19.2975 36.5227 21.1414 36.5227C23.3443 36.5227 25.349 34.7573 26.7896 31.553C26.9879 31.112 26.7913 30.5942 26.3504 30.396Z" fill="currentColor"/><path d="M32.2141 15.1356C31.78 14.9331 31.2571 15.1194 31.052 15.5586C30.8469 15.997 31.0366 16.5174 31.4758 16.7216C33.8599 17.8333 35.2271 19.2791 35.2271 20.6881C35.2271 22.8492 32.0552 24.9837 27.3333 25.9971C25.3936 26.4141 23.3103 26.626 21.1416 26.626C20.658 26.626 20.2666 27.0174 20.2666 27.501C20.2666 27.9846 20.658 28.376 21.1416 28.376C23.4333 28.376 25.6414 28.1521 27.7024 27.7095C33.4224 26.479 36.9771 23.7891 36.9771 20.6881C36.9771 18.5391 35.2852 16.5678 32.2141 15.1356Z" fill="currentColor"/><path d="M11.8481 27.0054C11.7832 26.9438 11.7131 26.8874 11.6362 26.8362C11.7952 26.7029 11.9302 26.5422 12.0378 26.3594C12.1609 26.1475 12.2241 25.9031 12.2241 25.6348C12.2241 25.2776 12.1318 24.9512 11.9507 24.6641C11.7747 24.3838 11.5303 24.1582 11.2244 23.9941C10.604 23.6592 9.76318 23.6746 9.12915 23.9993C8.80103 24.165 8.53784 24.3992 8.34302 24.6948C8.14648 24.9973 8.04736 25.3391 8.04736 25.7134C8.04736 25.9185 8.11743 26.1013 8.24902 26.2432C8.53784 26.5508 9.03174 26.5354 9.29834 26.2192C9.41797 26.0706 9.47949 25.8928 9.47949 25.6895C9.47949 25.6006 9.50342 25.5271 9.55981 25.4519C9.62305 25.3647 9.7102 25.2981 9.82642 25.2434C10.0862 25.1152 10.4468 25.1187 10.6416 25.3015C10.739 25.3938 10.7834 25.4963 10.7834 25.6348C10.7834 25.7288 10.7612 25.8057 10.7117 25.8757C10.6501 25.9646 10.5767 26.0312 10.4878 26.0808C10.4023 26.1287 10.3169 26.1509 10.228 26.1509C10.0195 26.1509 9.83325 26.2261 9.6897 26.3696C9.54614 26.5132 9.47095 26.6978 9.47095 26.9062C9.47095 27.113 9.54443 27.2976 9.68799 27.4463C9.82983 27.5933 10.0178 27.6702 10.228 27.6702C10.3665 27.6702 10.4861 27.7043 10.5955 27.7761C10.71 27.8496 10.7971 27.9453 10.8655 28.0735C10.9321 28.1965 10.9663 28.3418 10.9663 28.5059C10.9663 28.7537 10.8997 28.9365 10.7612 29.0613C10.5083 29.2886 10.0247 29.3416 9.67432 29.1433C9.5376 29.0647 9.43164 28.9622 9.34961 28.8289C9.271 28.699 9.2334 28.5623 9.2334 28.4102C9.2334 28.2034 9.16675 28.0205 9.03857 27.877C8.77026 27.5813 8.28662 27.571 8.00293 27.8735C7.87134 28.0154 7.80127 28.2017 7.80127 28.4102C7.80127 28.8357 7.90723 29.2236 8.11572 29.5654C8.32251 29.9089 8.61133 30.1807 8.97021 30.3755C9.3291 30.5703 9.74097 30.6694 10.1956 30.6694C10.6023 30.6694 10.9817 30.5771 11.3235 30.3926C11.667 30.208 11.9456 29.9517 12.1541 29.6287C12.3643 29.2988 12.4702 28.9246 12.4702 28.5144C12.4702 28.2222 12.4207 27.947 12.3232 27.6958C12.2207 27.4326 12.0618 27.2002 11.8481 27.0054Z" fill="currentColor"/><path d="M18.9062 25.833C18.7405 25.4126 18.4995 25.0435 18.1919 24.7324C17.8826 24.4197 17.5151 24.177 17.0999 24.0095C16.6863 23.842 16.2231 23.7566 15.7241 23.7566H14.2834C14.0784 23.7566 13.8938 23.8301 13.7451 23.9736C13.5981 24.1172 13.5195 24.3069 13.5195 24.5205V29.9055C13.5195 30.114 13.5964 30.302 13.7417 30.4473C13.887 30.5925 14.075 30.6694 14.2834 30.6694H15.7241C16.2231 30.6694 16.6863 30.584 17.0981 30.4165C17.5151 30.249 17.8826 30.0063 18.1902 29.6936C18.4995 29.3826 18.7405 29.0117 18.9062 28.5879C19.0686 28.1675 19.1523 27.7026 19.1523 27.2087C19.1523 26.7148 19.0686 26.2517 18.9062 25.833ZM17.6553 27.2087C17.6553 27.6104 17.5715 27.9658 17.4058 28.2683L17.4041 28.27C17.2383 28.5742 17.0161 28.8066 16.7256 28.981C16.4402 29.1519 16.1035 29.2373 15.7241 29.2373H15.0474V25.1887H15.7241C16.1035 25.1887 16.4419 25.2742 16.7273 25.4417C17.0161 25.6125 17.2383 25.8433 17.4058 26.1458C17.5732 26.45 17.6553 26.7986 17.6553 27.2087Z" fill="currentColor"/></svg>
							</div>
							<?php endif; ?>
							<?php if ( count( $swatches ) > 1 ) :
								$shown = array_slice( $swatches, 0, $max_swatches );
								$extra = count( $swatches ) - count( $shown );
							?>
								<div class="catalog-card-swatches">
									<?php foreach ( $shown as $swatch ) : ?>
										<span class="catalog-card-swatch"
										      style="background-image:url(<?php echo esc_url( $swatch['img'] ); ?>);">
											<?php if ( $swatch['mode'] === 'tint' && $swatch['hex'] !== '' ) : ?>
												<span class="catalog-card-swatch-tint"
												      style="background-color:#<?php echo esc_attr( $swatch['hex'] ); ?>;"></span>
											<?php endif; ?>
										</span>
									<?php endforeach; ?>
									<?php if ( $extra > 0 ) : ?>
										<span class="catalog-card-swatch catalog-card-swatch--more">+<?php echo (int) $extra; ?></span>
									<?php endif; ?>
								</div>
							<?php endif; ?>
						</div>
						<?php endif; ?>
					</div>
				</a>
			</article>
		<?php endwhile; wp_reset_postdata(); ?>
	</div>
	<?php
	return ob_get_clean();
} );


// =============================================================================
//! BREADCRUMBS: inyecta la jerarquía de product_category en el breadcrumb de
//  Yoast (afecta al HTML y al nodo BreadcrumbList del schema).
// =============================================================================

add_filter(
	'wpseo_breadcrumb_links',
	function( $crumbs ) {
		if ( ! is_singular( 'producto' ) ) {
			return $crumbs;
		}

		$post_id = get_the_ID();
		$terms   = get_the_terms( $post_id, 'product_category' );

		if ( ! $terms || is_wp_error( $terms ) ) {
			return $crumbs;
		}

		// Usar el término primario de Yoast si está disponible, si no el primero.
		$primary_term_id = 0;
		if ( class_exists( 'WPSEO_Primary_Term' ) ) {
			$wpseo_primary = new WPSEO_Primary_Term( 'product_category', $post_id );
			$primary_term_id = (int) $wpseo_primary->get_primary_term();
		}

		$primary = null;
		foreach ( $terms as $t ) {
			if ( $t->term_id === $primary_term_id ) {
				$primary = $t;
				break;
			}
		}
		if ( ! $primary ) {
			$primary = $terms[0];
		}

		// Construir la cadena de ancestros (raíz → término actual).
		$chain   = array();
		$current = $primary;
		while ( $current ) {
			array_unshift( $chain, $current );
			$current = $current->parent ? get_term( $current->parent, 'product_category' ) : null;
		}

		// Convertir a crumbs de Yoast e insertar tras el primero (home).
		$term_crumbs = array();
		foreach ( $chain as $term ) {
			$term_crumbs[] = array(
				'text' => $term->name,
				'url'  => get_term_link( $term, 'product_category' ),
			);
		}

		array_splice( $crumbs, 1, 0, $term_crumbs );

		return $crumbs;
	},
	10
);


// =============================================================================
//! SCHEMA.ORG: Nodo Product para fichas de producto (single 'producto')
// Inyectado en el grafo JSON-LD de Yoast via wpseo_schema_graph_pieces.
// =============================================================================

if (
	class_exists( 'Yoast\WP\SEO\Generators\Schema\Abstract_Schema_Piece' )
	&& ! class_exists( 'Pictau_Product_Schema_Piece' )
) {

	/**
	 * Genera el nodo schema.org/Product para el CPT 'producto'.
	 *
	 * @package pictau_tw
	 */
	class Pictau_Product_Schema_Piece
		extends \Yoast\WP\SEO\Generators\Schema\Abstract_Schema_Piece {

		/** @var string */
		public $identifier = 'pictau-product';

		/**
		 * Solo se necesita en fichas individuales de producto.
		 *
		 * @return bool
		 */
		public function is_needed() {
			return is_singular( 'producto' );
		}

		/**
		 * Construye y devuelve el nodo Product.
		 *
		 * @return array|false
		 */
		public function generate() {
			$post_id = $this->context->id;
			$post    = $this->context->post;

			if ( ! function_exists( 'pods' ) ) {
				return false;
			}

			$pods = pods( 'producto', $post_id );
			if ( ! $pods ) {
				return false;
			}

			$canonical  = $this->context->canonical;
			$product_id = $canonical . '#product';

			$data = array(
				'@type'            => 'Product',
				'@id'              => $product_id,
				'name'             => get_the_title( $post_id ),
				'url'              => $canonical,
				'sku'              => $post->post_name,
				'mainEntityOfPage' => array( '@id' => $this->context->main_schema_id ),
				'inLanguage'       => $this->get_language(),
			);

			$description = $this->get_description();
			if ( $description ) {
				$data['description'] = $description;
			}

			$images = $this->get_images( $pods, $post_id );
			if ( ! empty( $images ) ) {
				$data['image'] = count( $images ) === 1 ? $images[0] : $images;
			}

			if ( $this->context->site_represents_reference ) {
				$data['brand'] = $this->context->site_represents_reference;
			}

			$terms = get_the_terms( $post_id, 'product_category' );
			if ( $terms && ! is_wp_error( $terms ) ) {
				$data['category'] = implode( ' > ', wp_list_pluck( $terms, 'name' ) );
			}

			// price: 0 es el workaround estándar B2B para satisfacer la validación
			// de Google (exige offers|review|aggregateRating para rich results).
			$offer = array(
				'@type'         => 'Offer',
				'price'         => 0,
				'priceCurrency' => 'EUR',
				'availability'  => 'https://schema.org/InStock',
				'itemCondition' => 'https://schema.org/NewCondition',
				'url'           => $canonical,
			);
			if ( $this->context->site_represents_reference ) {
				$offer['seller'] = $this->context->site_represents_reference;
			}
			$data['offers'] = $offer;

			$props = $this->get_additional_properties( $pods );
			if ( ! empty( $props ) ) {
				$data['additionalProperty'] = $props;
			}

			$cert = $this->get_certification( $pods );
			if ( ! empty( $cert ) ) {
				$data['hasCertification'] = $cert;
			}

			$related = $this->get_related_products( $pods );
			if ( ! empty( $related ) ) {
				$data['isRelatedTo'] = $related;
			}

			return $data;
		}

		/**
		 * Descripción limpia a partir del post_content (sin HTML ni shortcodes).
		 *
		 * @return string
		 */
		private function get_description() {
			$raw = $this->context->post->post_content;
			if ( empty( $raw ) ) {
				return '';
			}
			return wp_trim_words( wp_strip_all_tags( do_shortcode( $raw ) ), 55, '' );
		}

		/**
		 * Devuelve ImageObject(s): imagen destacada + galería Pods.
		 *
		 * @param object $pods    Objeto Pods del producto.
		 * @param int    $post_id ID del post.
		 * @return array
		 */
		private function get_images( $pods, $post_id ) {
			$images   = array();
			$thumb_id = get_post_thumbnail_id( $post_id );

			if ( $thumb_id ) {
				$meta = wp_get_attachment_metadata( $thumb_id );
				$url  = wp_get_attachment_image_url( $thumb_id, 'full' );
				if ( $url ) {
					$img = array(
						'@type' => 'ImageObject',
						'@id'   => $this->context->canonical . '#primaryimage',
						'url'   => $url,
					);
					if ( ! empty( $meta['width'] ) ) {
						$img['width']  = $meta['width'];
						$img['height'] = $meta['height'];
					}
					$images[] = $img;
				}
			}

			$galeria = $pods->field( 'galeria' );
			if ( is_array( $galeria ) ) {
				foreach ( $galeria as $img_data ) {
					$id = ! empty( $img_data['ID'] ) ? (int) $img_data['ID'] : 0;
					if ( ! $id ) {
						continue;
					}
					$url  = wp_get_attachment_image_url( $id, 'full' );
					$meta = wp_get_attachment_metadata( $id );
					if ( ! $url ) {
						continue;
					}
					$gimg = array(
						'@type' => 'ImageObject',
						'url'   => $url,
					);
					if ( ! empty( $img_data['post_title'] ) ) {
						$gimg['caption'] = $img_data['post_title'];
					}
					if ( ! empty( $meta['width'] ) ) {
						$gimg['width']  = $meta['width'];
						$gimg['height'] = $meta['height'];
					}
					$images[] = $gimg;
				}
			}

			return $images;
		}

		/**
		 * PropertyValue nodes para norma UNE y Declaración Ambiental (EPD).
		 *
		 * @param object $pods Objeto Pods del producto.
		 * @return array
		 */
		private function get_additional_properties( $pods ) {
			$props = array();

			$norma = $pods->field( 'norma_une' );
			if ( $norma ) {
				$props[] = array(
					'@type'       => 'PropertyValue',
					'name'        => esc_html__( 'Norma de fabricación', 'pictau' ),
					'value'       => $norma,
					'description' => sprintf(
						// translators: %s: norma UNE, e.g. "UNE-EN 1341".
						esc_html__( 'Fabricado conforme a la norma %s', 'pictau' ),
						$norma
					),
				);
			}

			$decl_raw = $pods->field( 'declaracion_ambiental' );
			if ( $decl_raw && ! empty( $decl_raw['ID'] ) ) {
				$decl_url = wp_get_attachment_url( $decl_raw['ID'] );
				if ( $decl_url ) {
					$props[] = array(
						'@type' => 'PropertyValue',
						'name'  => esc_html__( 'Declaración Ambiental de Producto (DAP/EPD)', 'pictau' ),
						'value' => $decl_url,
						'url'   => $decl_url,
					);
				}
			}

			return $props;
		}

		/**
		 * Nodo Certification para el certificado AENOR u otro.
		 *
		 * @param object $pods Objeto Pods del producto.
		 * @return array
		 */
		private function get_certification( $pods ) {
			$certs       = array();
			$certificado = $pods->field( 'certificado' );

			if ( empty( $certificado['ID'] ) ) {
				return $certs;
			}

			$cert_url = wp_get_attachment_url( $certificado['ID'] );
			if ( ! $cert_url ) {
				return $certs;
			}

			$cert_nombre = $pods->field( 'certificado_nombre' );
			$cert_imagen = $pods->field( 'certificado_imagen' );

			$cert_node = array(
				'@type'    => 'Certification',
				'name'     => $cert_nombre
					? $cert_nombre
					: esc_html__( 'Certificación AENOR', 'pictau' ),
				'url'      => $cert_url,
				'issuedBy' => array(
					'@type' => 'Organization',
					'name'  => 'AENOR',
					'url'   => 'https://www.aenor.com',
				),
			);

			if ( ! empty( $cert_imagen['ID'] ) ) {
				$img_url = wp_get_attachment_image_url( (int) $cert_imagen['ID'], 'medium' );
				if ( $img_url ) {
					$cert_node['image'] = array(
						'@type' => 'ImageObject',
						'url'   => $img_url,
					);
				}
			}

			$certs[] = $cert_node;

			return $certs;
		}

		/**
		 * Referencias a productos relacionados (nodos Product mínimos).
		 *
		 * @param object $pods Objeto Pods del producto.
		 * @return array
		 */
		private function get_related_products( $pods ) {
			$related_raw = $pods->field( 'productos_relacionados' );
			$result      = array();

			if ( empty( $related_raw ) || ! is_array( $related_raw ) ) {
				return $result;
			}

			foreach ( $related_raw as $rel ) {
				$rel_id = is_array( $rel ) ? ( $rel['ID'] ?? 0 ) : (int) $rel;
				if ( ! $rel_id ) {
					continue;
				}
				$result[] = array(
					'@type' => 'Product',
					'name'  => get_the_title( $rel_id ),
					'url'   => get_permalink( $rel_id ),
				);
			}

			return $result;
		}

		/**
		 * Código de idioma BCP-47 compatible con Polylang.
		 *
		 * @return string
		 */
		private function get_language() {
			if ( function_exists( 'pll_current_language' ) ) {
				$locale = pll_current_language( 'locale' );
				if ( $locale ) {
					return str_replace( '_', '-', $locale );
				}
			}
			return get_bloginfo( 'language' );
		}
	}
}

add_filter(
	'wpseo_schema_graph_pieces',
	function( $pieces, $context ) {
		if ( class_exists( 'Pictau_Product_Schema_Piece' ) ) {
			$pieces[] = new Pictau_Product_Schema_Piece();
		}
		return $pieces;
	},
	10,
	2
);

/**
 * Devuelve el término más profundo (más específico) de un array de WP_Term.
 * Evita que al asignar padre e hijo, el título use el padre en lugar del hijo.
 */
function pictau_deepest_product_term( array $terms ): WP_Term {
	$deepest  = $terms[0];
	$max_depth = 0;
	foreach ( $terms as $t ) {
		$depth = count( get_ancestors( $t->term_id, 'product_category', 'taxonomy' ) );
		if ( $depth > $max_depth ) {
			$max_depth = $depth;
			$deepest   = $t;
		}
	}
	return $deepest;
}

// Títulos de archive: subcategorías de producto incluyen el nombre del padre.
// Ejemplo: archivo "30x30" (padre "Baldosa Hidráulica") → "Baldosa Hidráulica 30x30 - Sitio".
add_filter( 'wpseo_title', function ( $title ) {
	if ( ! is_tax( 'product_category' ) ) {
		return $title;
	}
	$term = get_queried_object();
	if ( ! $term instanceof WP_Term || ! $term->parent ) {
		return $title;
	}
	$parent = get_term( $term->parent, 'product_category' );
	if ( ! $parent instanceof WP_Term ) {
		return $title;
	}
	return str_replace( $term->name, $parent->name . ' / ' . $term->name, $title );
} );

// Títulos de ficha de producto: prefija la jerarquía completa de categorías.
// Ejemplo: "4 pastillas" en Baldosa Hidráulica / 20x20 → "Baldosa Hidráulica / 20x20 / 4 pastillas - Sitio".
add_filter( 'wpseo_title', function ( $title ) {
	if ( ! is_singular( 'producto' ) ) {
		return $title;
	}
	$post_id = get_the_ID();

	// Siempre el término más profundo asignado: el primary term de Yoast puede
	// apuntar al padre, lo que excluiría la subcategoría de la cadena.
	$terms = get_the_terms( $post_id, 'product_category' );
	if ( ! $terms || is_wp_error( $terms ) ) {
		return $title;
	}
	$term = pictau_deepest_product_term( $terms );

	// Construye la cadena de ancestros de mayor a menor.
	$chain   = [ $term->name ];
	$current = $term;
	while ( $current->parent ) {
		$parent = get_term( $current->parent, 'product_category' );
		if ( ! $parent instanceof WP_Term ) {
			break;
		}
		array_unshift( $chain, $parent->name );
		$current = $parent;
	}

	// Yoast usa el post_title crudo (sin wptexturize ni entidades HTML),
	// mientras que get_the_title() devuelve entidades. Usar el título en bruto.
	$raw_title = get_post( $post_id )->post_title;
	$prefix    = implode( ' / ', $chain ) . ' / ';

	return str_replace( $raw_title, $prefix . $raw_title, $title );
} );

// Fallback de títulos cuando Yoast SEO no está activo.
// Replica el mismo patrón jerárquico usando el filtro nativo de WordPress.
add_filter( 'document_title_parts', function ( $parts ) {
	if ( defined( 'WPSEO_VERSION' ) ) {
		return $parts; // Yoast activo: lo gestiona wpseo_title.
	}

	if ( is_tax( 'product_category' ) ) {
		$term = get_queried_object();
		if ( $term instanceof WP_Term && $term->parent ) {
			$parent = get_term( $term->parent, 'product_category' );
			if ( $parent instanceof WP_Term ) {
				$parts['title'] = $parent->name . ' / ' . $term->name;
			}
		}
	} elseif ( is_singular( 'producto' ) ) {
		$post_id = get_the_ID();
		$terms   = get_the_terms( $post_id, 'product_category' );
		if ( $terms && ! is_wp_error( $terms ) ) {
			$term    = pictau_deepest_product_term( $terms );
			$chain   = [ $term->name ];
			$current = $term;
			while ( $current->parent ) {
				$parent = get_term( $current->parent, 'product_category' );
				if ( ! $parent instanceof WP_Term ) {
					break;
				}
				array_unshift( $chain, $parent->name );
				$current = $parent;
			}
			$parts['title'] = implode( ' / ', $chain ) . ' / ' . get_the_title( $post_id );
		}
	}

	return $parts;
} );

