<?php

/**
 * Template for product_category taxonomy archive
 *
 * @package pictau_tw
 */

get_header();

$term        = get_queried_object();
$term_name   = $term ? $term->name : '';
$term_desc   = $term ? term_description( $term->term_id, 'product_category' ) : '';
$parent_term = ( $term && $term->parent ) ? get_term( $term->parent, 'product_category' ) : null;

// FAQs: solo se muestran si la categoría actual tiene el campo, sin herencia del padre
$faqs              = $term ? get_term_meta( $term->term_id, 'faqs', true ) : '';
$faqs_intro        = $term ? get_term_meta( $term->term_id, 'faqs_intro', true ) : '';
$faqs_collapsables = $term ? (bool) get_term_meta( $term->term_id, 'faqs_collapsables', true ) : false;

// Detect if current term has child categories
$child_terms  = get_terms( [
	'taxonomy'   => 'product_category',
	'parent'     => $term->term_id,
	'hide_empty' => false,
] );
$has_children = ! is_wp_error( $child_terms ) && ! empty( $child_terms );

// Sort children by 'orden' meta (unset → PHP_INT_MAX so they appear last)
if ( $has_children ) {
	usort( $child_terms, function ( $a, $b ) {
		$raw_a   = get_term_meta( $a->term_id, 'orden', true );
		$raw_b   = get_term_meta( $b->term_id, 'orden', true );
		$orden_a = ( $raw_a !== '' ) ? (int) $raw_a : PHP_INT_MAX;
		$orden_b = ( $raw_b !== '' ) ? (int) $raw_b : PHP_INT_MAX;
		return $orden_a <=> $orden_b;
	} );
}

?>

<section id="primary" class="catalog-archive">
	<main id="main">
		<section class="pct-section catalog-archive-body">

			<aside class="catalog-archive-sidebar">
				<?php echo do_shortcode( '[catalog-category-menu]' ); ?>
			</aside>

			<div class="catalog-archive-content">
				<header class="entry-header catalog-archive-header">

					<div class="no-post-thumbnail-header">
					</div>

					<div class="entry-header-content">
						<?php $term_subtitle = $term ? get_term_meta( $term->term_id, 'subtitulo', true ) : ''; ?>
						<?php if ( $term_subtitle ) : ?>
							<p class="catalog-archive-subtitle header-tag"><?php echo esc_html( $term_subtitle ); ?></p>
						<?php endif; ?>
						<?php if ( $parent_term ) : ?>
						<div class="catalog-archive-breadcrumb">
							<a class="header-tag" href="<?php echo esc_url( get_term_link( $parent_term ) ); ?>">
								> <?php echo esc_html( $parent_term->name ); ?>
							</a>
						</div>
						<?php endif; ?>

						<h1 class="entry-title"><?php echo esc_html( $term_name ); ?></h1>
					</div>

				</header>


				<?php if ( $term_desc ) : ?>
					<div class="catalog-archive-description">
						<?php echo $term_desc; ?>
					</div>
				<?php endif; ?>

				<?php if ( $has_children ) : ?>

					<section class="pct-section category-grid-section">
						<?php
						// Display child categories in a grid
						// (The $child_terms array is already sorted by 'orden' meta)
						?>
					<?php /* ── Subcategory grid ── */ ?>

						<div class="subcat-grid">
							<?php foreach ( $child_terms as $child ) :
								$img_field = get_term_meta( $child->term_id, 'imagen_destacada', true );
								if ( is_array( $img_field ) ) {
									$img_id = (int) ( $img_field['ID'] ?? ( $img_field[0]['ID'] ?? 0 ) );
								} else {
									$img_id = (int) $img_field;
								}
							?>
								<a href="<?php echo esc_url( get_term_link( $child ) ); ?>" class="subcat-card">
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
											<p class="header-tag close-tag"><?php echo esc_html( $term_name ); ?></p>
											<h2 class="subcat-card-title"><?php echo esc_html( $child->name ); ?></h2>
											<?php if ( $child->description ) : ?>
												<p class="subcat-card-desc"><?php echo esc_html( wp_strip_all_tags( $child->description ) ); ?></p>
											<?php endif; ?>
										</div>
										<div class="fake-cta-icon">
											 ver más
											 <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><line x1="40" y1="128" x2="216" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line><polyline points="144 56 216 128 144 200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></polyline></svg>
										</div>
									</div>
								</a>
							<?php endforeach; ?>
						</div>
					</section>

				<?php else : ?>

					<?php /* ── Product grid ── */ ?>
					<?php
					$paged    = get_query_var( 'paged' ) ? get_query_var( 'paged' ) : 1;
					$per_page = 24;

					// Get all matching IDs to sort by custom 'orden' meta in PHP
					// (handles products without the field — they appear last, ordered by title)
					$all_ids_query = new WP_Query( [
						'post_type'      => 'producto',
						'posts_per_page' => -1,
						'fields'         => 'ids',
						'no_found_rows'  => true,
						'tax_query'      => [
							[
								'taxonomy'         => 'product_category',
								'field'            => 'term_id',
								'terms'            => $term->term_id,
								'include_children' => false,
							],
						],
						'orderby'        => 'title',
						'order'          => 'ASC',
					] );

					$all_ids = $all_ids_query->posts;

					// Prime meta cache to avoid N individual queries
					update_meta_cache( 'post', $all_ids );

					usort( $all_ids, function ( $a, $b ) {
						$orden_a = get_post_meta( $a, 'orden', true );
						$orden_b = get_post_meta( $b, 'orden', true );
						$has_a   = ( $orden_a !== '' && $orden_a !== null );
						$has_b   = ( $orden_b !== '' && $orden_b !== null );

						// Products with 'orden' set come before those without
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
						// Fallback: alphabetical by title
						return strcmp( get_the_title( $a ), get_the_title( $b ) );
					} );

					$total_products        = count( $all_ids );
					$max_num_pages         = (int) ceil( $total_products / $per_page );
					$offset                = ( $paged - 1 ) * $per_page;
					$paged_ids             = array_slice( $all_ids, $offset, $per_page );

					$products_query = new WP_Query( [
						'post_type'      => 'producto',
						'posts_per_page' => $per_page,
						'post__in'       => ! empty( $paged_ids ) ? $paged_ids : [ 0 ],
						'orderby'        => 'post__in',
						'no_found_rows'  => true,
					] );
					$products_query->found_posts   = $total_products;
					$products_query->max_num_pages = $max_num_pages;
					?>

					<?php if ( $products_query->have_posts() ) : ?>
						<div class="catalog-grid" data-anim_any data-anim_any_delay="0.2" data-anim_any_duration="0.8" data-anim_any_slideamount="40">
							<?php while ( $products_query->have_posts() ) : $products_query->the_post();

								// Collect color swatches from 3D visualizer config.json (if model_id set)
								$model_id = get_post_meta( get_the_ID(), 'visualizer_model_id', true );
								$swatches = [];
								if ( $model_id ) {
									$config_file = WP_CONTENT_DIR . '/plugins/pd3d-visualizer/dist/models/'
									               . sanitize_file_name( $model_id ) . '/config.json';
									if ( file_exists( $config_file ) ) {
										$vc_config = json_decode( file_get_contents( $config_file ), true );
										$vc_format = $vc_config['textures']['format'] ?? 'webp';
										$vc_groups = $vc_config['textures']['Diffuse']['groups'] ?? [];
										$vc_url    = content_url( '/plugins/pd3d-visualizer/dist/textures/' );

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
													'img'  => $vc_url . 'texture_diffuse_' . $thumb_id . '_thumb.' . $vc_format,
													'hex'  => $hex,
													'mode' => $mode,
												];
											}
										}
										$swatches = array_unique( $swatches, SORT_REGULAR );
									}
								}
							?>
								<article id="post-<?php the_ID(); ?>" <?php post_class( 'catalog-card style-2' ); ?>>
									<a href="<?php echo esc_url( get_permalink() ); ?>" class="catalog-card-link">
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
											<?php
											$pods_p = pods( 'producto', get_the_id() );
											$sub    = $pods_p->field( 'subtitulo' );
											if ( $sub ) :
											?>
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
													$max   = max( 1, (int) get_theme_mod( 'catalog_swatches_limit', 10 ) );
													$shown = array_slice( $swatches, 0, $max );
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
						$big = 999999999;
						echo paginate_links( [
							'base'    => str_replace( $big, '%#%', esc_url( get_pagenum_link( $big ) ) ),
							'format'  => '?paged=%#%',
							'current' => $paged,
							'total'   => $products_query->max_num_pages,
						] );
						?>

					<?php else : ?>
						<p class="catalog-archive-empty"><?php echo esc_html__( 'No hay productos en esta categoría todavía.', 'pictau' ); ?></p>
					<?php endif; ?>

				<?php endif; ?>

				<?php if ( $faqs ) : ?>
				<div class="product-faqs">
					<!--h2 class="product-faqs-title"><?php echo esc_html__( 'Preguntas frecuentes sobre ', 'pictau' ) . esc_html( $term->name ); ?></h2-->
					<h2 class="product-faqs-title"><?php echo esc_html__( 'Preguntas frecuentes', 'pictau' ); ?></h2>
					<?php if ( $faqs_intro ) : ?>
					<div class="product-faqs-intro"><?php echo wp_kses_post( $faqs_intro ); ?></div>
					<?php endif; ?>
					<div class="pct-faqs">
						<?php
						$faqs_output = $faqs_collapsables
							? pictau_format_faqs_collapsable( $faqs )
							: $faqs;
						echo wp_kses_post( $faqs_output );
						?>
					</div>
				</div>
				<?php endif; ?>

			</div><!-- .catalog-archive-content -->

		</section><!-- .catalog-archive-body -->

	</main><!-- #main -->
</section><!-- #primary -->

<?php
get_footer();
