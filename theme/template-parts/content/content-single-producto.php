<?php

/**
 * Template part for displaying single producto posts
 *
 * @package pictau_tw
 */

$pods              = pods( 'producto', get_the_id() );
$subtitulo         = $pods->field( 'subtitulo' );
$caract_tecnicas   = $pods->field( 'caracteristicas_tecnicas' );
$ficha             = $pods->field( 'ficha_tecnica' );
$catalogo          = $pods->field( 'catalogo_producto' );
$manual_colocacion = $pods->field( 'manual_colocacion' );
$galeria           = $pods->field( 'galeria' );
$model_id        = $pods->field( 'visualizer_model_id' );
$relacionados    = $pods->field( 'productos_relacionados' );
$tabla_espec     = $pods->field( 'tabla_especificaciones' );
$medidas_cotas   = $pods->field( 'medidas_cotas' );
$free_layout          = $pods->field( 'free_layout' );
$certificado           = $pods->field( 'certificado' );
$certificado_nombre    = $pods->field( 'certificado_nombre' );
$certificado_imagen    = $pods->field( 'certificado_imagen' );
$declaracion_ambiental = $pods->field( 'declaracion_ambiental' );
$norma_une             = $pods->field( 'norma_une' );
$footer_tabla          = $pods->field( 'footer_tabla_adicional' );

// Active category for breadcrumb + sidebar
// Prefer a child term (parent !== 0) so the breadcrumb always shows the deepest level.
// get_the_terms() returns terms alphabetically, so without this the parent term can end up
// first in the array when its name sorts before the child's name (e.g. "Adoquines y Baldosas"
// before "Baldosas"), causing only one breadcrumb level to render.
$terms       = get_the_terms( get_the_id(), 'product_category' );
$active_term = null;
if ( $terms && ! is_wp_error( $terms ) ) {
	foreach ( $terms as $term ) {
		if ( $term->parent ) {
			$active_term = $term;
			break;
		}
	}
	if ( ! $active_term ) {
		$active_term = $terms[0];
	}
}
$parent_term = ( $active_term && $active_term->parent ) ? get_term( $active_term->parent, 'product_category' ) : null;


// Si no hay relacionados manuales, mostrar hermanos de la misma categoría (excluyendo el producto actual)
$relacionados_list = $relacionados;
if ( empty( $relacionados_list ) && $active_term ) {
	$sibling_ids = get_posts( [
		'post_type'      => 'producto',
		'posts_per_page' => -1,
		'post__not_in'   => [ get_the_id() ],
		'fields'         => 'ids',
		'tax_query'      => [ [
			'taxonomy' => 'product_category',
			'field'    => 'term_id',
			'terms'    => $active_term->term_id,
		] ],
	] );
	$relacionados_list = array_map( fn( $id ) => [ 'ID' => $id ], $sibling_ids );
}

// Ordenar relacionados por el campo "orden" (menor = primero; sin valor va al final)
if ( ! empty( $relacionados_list ) ) {
	usort( $relacionados_list, function ( $a, $b ) {
		$id_a  = is_array( $a ) ? ( $a['ID'] ?? 0 ) : (int) $a;
		$id_b  = is_array( $b ) ? ( $b['ID'] ?? 0 ) : (int) $b;
		$ord_a = (int) get_post_meta( $id_a, 'orden', true );
		$ord_b = (int) get_post_meta( $id_b, 'orden', true );
		if ( ! $ord_a && ! $ord_b ) return 0;
		if ( ! $ord_a ) return 1;
		if ( ! $ord_b ) return -1;
		return $ord_a - $ord_b;
	} );
}

?>

<article id="post-<?php the_ID(); ?>" <?php post_class( 'single-producto' ); ?>>


	<div class="entry-content single-producto-body layout-site-width">
		<div class="single-producto-main">
			<div class="product-content">
				<section class="viewer-section">
					<div class="product-viewer<?php echo $model_id ? ' has-model' : ''; ?><?php echo $free_layout ? ' free-layout' : ''; ?>">
					<?php if ( $model_id ) : ?>
						<?php echo do_shortcode( '[pd_3d_viewer model="' . esc_attr( $model_id ) . '" ui="1" screenshot="1" bgtext="1" ui-target="#portal-ui"]' ); ?>
					<!-- Sin modelo 3D, pero con imagen destacada o placeholder -->
					<?php elseif ( ! $free_layout ) : ?>
							<div class="product-image-placeholder">
								<?php if ( has_post_thumbnail() ) : ?>
									<?php the_post_thumbnail( 'large', [ 'class' => 'product-placeholder-img' ] ); ?>
								<?php else : ?>
									<span class="subcat-card-image-placeholder">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
											<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
										</svg>
									</span>
								<?php endif; ?>
							</div>
					<?php endif; ?>
						<!-- Sin modelo 3D ni imagen destacada		 -->
						<div class="viewer-header">
							<?php if ( ! $free_layout && $active_term ) : ?>
								<?php
									$bc_links = [];
									if ( $parent_term ) {
										$bc_links[] = '<a href="' . esc_url( get_term_link( $parent_term ) ) . '">' . esc_html( $parent_term->name ) . '</a>';
									}
									$bc_links[] = '<a href="' . esc_url( get_term_link( $active_term ) ) . '">' . esc_html( $active_term->name ) . '</a>';
									echo '<nav class="entry-breadcrumb" aria-label="' . esc_attr__( 'Breadcrumb', 'pictau' ) . '">';
									echo implode( ' <span aria-hidden="true"> / </span> ', $bc_links );
									echo '</nav>';
								?>
							<?php endif; ?>

							<?php if ( $subtitulo ) : ?>
							<p class="has-text-align-center header-tag"><?php echo esc_html( $subtitulo ); ?></p>
							<?php endif; ?>

							<?php the_title( '<h1 class="entry-title">', '</h1>' ); ?>



						</div>
						<!-- Con free layout, el bloque de características técnicas se muestra al final del contenido para que no interfiera con el diseño personalizado que se quiera hacer desde el editor. -->
						<?php if ( ! $free_layout ) : ?>
						<div class="viewer-ui">
							<div id="portal-ui"></div>
							<?php if ( $caract_tecnicas && count( $caract_tecnicas ) > 0 ) : ?>
								<div class="product-tech-features">
									<h3><?php echo esc_html__( 'Características técnicas', 'pictau' ); ?></h3>
									<div class="tech-features-description">
										<?php foreach ( $caract_tecnicas as $img ) :
											$src = ! empty( $img['ID'] ) ? wp_get_attachment_url( $img['ID'] ) : '';
											$alt = $img['post_title'] ?? '';
											if ( ! $src ) continue;
										?>
										<figure class="tech-feature-item">
											<img src="<?php echo esc_url( $src ); ?>" alt="<?php echo esc_attr( $alt ); ?>" loading="lazy">
										</figure>
										<?php endforeach; ?>
									</div>

								<?php
								$ficha_url    = $ficha ? ( wp_get_attachment_url( $ficha['ID'] ) ?: '' ) : '';
								$catalogo_url = $catalogo ? ( wp_get_attachment_url( $catalogo['ID'] ) ?: '' ) : '';
								$manual_url   = $manual_colocacion ? ( wp_get_attachment_url( $manual_colocacion['ID'] ) ?: '' ) : '';
								if ( $ficha_url || $catalogo_url || $manual_url ) :
								?>
								<div class="documentation">
									<div class="wp-block-buttons is-layout-flex wp-block-buttons-is-layout-flex">
										<?php if ( $ficha_url ) : ?>
										<div class="wp-block-button pdf-before download bt-download"><a class="wp-block-button__link wp-element-button" href="<?php echo esc_url( $ficha_url ); ?>" target="_blank" rel="noopener noreferrer"><svg class="ico-pdf" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M14 3v4a1 1 0 0 0 1 1h4"></path><path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v4"></path><path d="M5 18h1.5a1.5 1.5 0 0 0 0 -3h-1.5v6"></path><path d="M17 18h2"></path><path d="M20 15h-3v6"></path><path d="M11 15v6h1a2 2 0 0 0 2 -2v-2a2 2 0 0 0 -2 -2h-1"></path></svg><span><?php echo esc_html__( 'Ficha técnica', 'pictau' ); ?></span><svg class="ico-download" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.1"><path d="M12 21c-4.97 0-9-4.03-9-9c0-4.97 4.03-9 9-9"></path><path class="svg-dl-ring" stroke-dasharray="2 4" stroke-dashoffset="6" d="M12 3c4.97 0 9 4.03 9 9c0 4.97-4.03 9-9 9"></path><path d="M12 8v7.5"></path><path d="M12 15.5l3.5-3.5M12 15.5l-3.5-3.5"></path></g></svg></a></div>
										<?php endif; ?>
										<?php if ( $catalogo_url ) : ?>
										<div class="wp-block-button pdf-before download bt-download"><a class="wp-block-button__link wp-element-button" href="<?php echo esc_url( $catalogo_url ); ?>" target="_blank" rel="noopener noreferrer"><svg class="ico-pdf" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M14 3v4a1 1 0 0 0 1 1h4"></path><path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v4"></path><path d="M5 18h1.5a1.5 1.5 0 0 0 0 -3h-1.5v6"></path><path d="M17 18h2"></path><path d="M20 15h-3v6"></path><path d="M11 15v6h1a2 2 0 0 0 2 -2v-2a2 2 0 0 0 -2 -2h-1"></path></svg><span><?php echo esc_html__( 'Catálogo', 'pictau' ); ?></span><svg class="ico-download" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.1"><path d="M12 21c-4.97 0-9-4.03-9-9c0-4.97 4.03-9 9-9"></path><path class="svg-dl-ring" stroke-dasharray="2 4" stroke-dashoffset="6" d="M12 3c4.97 0 9 4.03 9 9c0 4.97-4.03 9-9 9"></path><path d="M12 8v7.5"></path><path d="M12 15.5l3.5-3.5M12 15.5l-3.5-3.5"></path></g></svg></a></div>
										<?php endif; ?>
										<?php if ( $manual_url ) : ?>
										<div class="wp-block-button pdf-before download bt-download"><a class="wp-block-button__link wp-element-button" href="<?php echo esc_url( $manual_url ); ?>" target="_blank" rel="noopener noreferrer"><svg class="ico-pdf" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M14 3v4a1 1 0 0 0 1 1h4"></path><path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v4"></path><path d="M5 18h1.5a1.5 1.5 0 0 0 0 -3h-1.5v6"></path><path d="M17 18h2"></path><path d="M20 15h-3v6"></path><path d="M11 15v6h1a2 2 0 0 0 2 -2v-2a2 2 0 0 0 -2 -2h-1"></path></svg><span><?php echo esc_html__( 'Manual técnico de colocación', 'pictau' ); ?></span><svg class="ico-download" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.1"><path d="M12 21c-4.97 0-9-4.03-9-9c0-4.97 4.03-9 9-9"></path><path class="svg-dl-ring" stroke-dasharray="2 4" stroke-dashoffset="6" d="M12 3c4.97 0 9 4.03 9 9c0 4.97-4.03 9-9 9"></path><path d="M12 8v7.5"></path><path d="M12 15.5l3.5-3.5M12 15.5l-3.5-3.5"></path></g></svg></a></div>
										<?php endif; ?>
									</div>
								</div>
								<?php endif; ?>

								</div>
							<?php endif; ?>
							<?php
							$cert_url     = $certificado ? ( wp_get_attachment_url( $certificado['ID'] ) ?: '' ) : '';
							$cert_img_src = $certificado_imagen ? ( $pods->field( 'certificado_imagen._src.full' ) ?? '' ) : '';
							$decl_url     = $declaracion_ambiental ? ( wp_get_attachment_url( $declaracion_ambiental['ID'] ) ?: '' ) : '';
							if ( $cert_url || $decl_url ) :
							?>
							<div class="certs">
								<h3><?php echo esc_html__( 'Certificaciones', 'pictau' ); ?></h3>
								<div class="certs-content">

									<?php if ( $decl_url ) : ?>
									<a class="cert-btn img-footer" href="<?php echo esc_url( $decl_url ); ?>" target="_blank" rel="noopener noreferrer">
										<img height="100" width="auto" src="<?php echo do_shortcode('[myPics]') ?>/logoGlobalEPD.webp" alt="GlobalEPD" width="300" height="110" loading="lazy">
										<span class="img-footer">GlobalEPD EN 16757-011</span>
									</a>
									<?php endif; ?>


									<?php if ( $cert_url ) : ?>
									<a class="cert-btn<?php echo $cert_img_src ? ' cert-btn-img' : ''; ?>" href="<?php echo esc_url( $cert_url ); ?>" target="_blank" rel="noopener noreferrer">
										<?php if ( $cert_img_src ) : ?>
											<img height="100" width="auto" src="<?php echo esc_url( $cert_img_src ); ?>" alt="AENOR" loading="lazy">
										<?php else : ?>
											<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 15m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/><path d="M13 17.5v4.5l2 -1.5l2 1.5v-4.5"/><path d="M10 19h-5a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v8"/></svg>
										<?php endif; ?>
									</a>
									<?php endif; ?>


								</div>
							</div>
							<?php endif; ?>
							<div class="viewer-cta">
								<?php
								// Pedir presupuesto CTA
								echo do_shortcode( '[pct-cpt-block title="CTA ficha de producto" mostrar="si"]' );
								?>
							</div>
						</div>
						<?php endif; ?>
					</div>





				</section>
				<section class="pct-section single-producto-content entry-content-inner">
					<div class="product-specs">
						<?php if ( $tabla_espec ) : ?>
							<div class="product-spec-table">
								<h3 class="pre-decoration"><?php echo esc_html__( 'Tabla de especificaciones', 'pictau' ); ?></h3>
								<div class="table-container">
									<?php echo wp_kses_post( $tabla_espec ); ?>
								</div>
								<div class="spec-footer">
									<?php if ( $norma_une ) : ?>
									<p><?php echo esc_html__( 'Fabricados conforme a la norma ', 'pictau' ) . '<strong>' . esc_html( $norma_une ) . '</strong>'; ?></p>
									<?php endif; ?>
									<?php if ( $footer_tabla ) : ?>
									<?php echo wp_kses_post( $footer_tabla ); ?>
									<?php endif; ?>

								</div>
							</div>
						<?php endif; ?>

						<?php if ( $medidas_cotas ) :
							$mc_src = $pods->field( 'medidas_cotas._src.full' ) ?? '';
							$mc_alt = is_array( $medidas_cotas ) ? ( $medidas_cotas['post_title'] ?? '' ) : '';
						?>
							<div class="product-measures">
								<h3 class="pre-decoration"><?php echo esc_html__( 'Medidas y cotas', 'pictau' ); ?></h3>
								<img src="<?php echo esc_url( $mc_src ); ?>" alt="<?php echo esc_attr( $mc_alt ); ?>" loading="lazy">
							</div>
						<?php endif; ?>
					</div>

					<?php the_content(); ?>


				</section>

				<?php if ( $galeria && count( $galeria ) > 0 ) : ?>
					<div class="single-producto-gallery">
						<h2 class="single-producto-section-title"><?php echo esc_html__( 'Galería', 'pictau' ); ?></h2>
						<div class="gallery-grid">
							<?php foreach ( $galeria as $img ) :
								$src = ! empty( $img['ID'] ) ? wp_get_attachment_url( $img['ID'] ) : '';
								$alt = $img['post_title'] ?? '';
								if ( ! $src ) continue;
							?>
								<figure class="gallery-grid-item">
									<img src="<?php echo esc_url( $src ); ?>" alt="<?php echo esc_attr( $alt ); ?>" loading="lazy">
								</figure>
							<?php endforeach; ?>
						</div>
					</div>
				<?php endif; ?>

				<?php if ( $relacionados_list && count( $relacionados_list ) > 0 ) : ?>
					<section class="pct-section single-producto-related">
						<h3 class="single-producto-section-title"><?php echo esc_html__( 'Productos relacionados', 'pictau' ); ?></h3>
						<div class="catalog-grid catalog-grid--related">
							<?php foreach ( $relacionados_list as $rel ) :
								$rel_id    = is_array( $rel ) ? ( $rel['ID'] ?? 0 ) : (int) $rel;
								$rel_title = get_the_title( $rel_id );
								$rel_url   = get_permalink( $rel_id );
								$rel_thumb = get_the_post_thumbnail( $rel_id, 'medium' );
								$rel_pods  = pods( 'producto', $rel_id );
								$rel_sub   = $rel_pods->field( 'subtitulo' );
							?>
								<article class="catalog-card style-2">
									<a href="<?php echo esc_url( $rel_url ); ?>" class="catalog-card-link">
										<?php if ( $rel_thumb ) : ?>
											<figure class="catalog-card-image"><?php echo $rel_thumb; ?></figure>
										<?php endif; ?>
										<div class="catalog-card-body">
											<h3 class="catalog-card-title"><?php echo esc_html( $rel_title ); ?></h3>
											<?php if ( $rel_sub ) : ?>
												<p class="catalog-card-subtitle"><?php echo esc_html( $rel_sub ); ?></p>
											<?php endif; ?>
										</div>
									</a>
								</article>
							<?php endforeach; ?>
						</div>
					</section>
				<?php endif; ?>
			</div><!-- .product-content -->
		</div><!-- .single-producto-main -->

	</div><!-- .entry-content -->

</article><!-- #post-<?php the_ID(); ?> -->



<?php
	echo do_shortcode( '[pct-cpt-block title="Modal Lead Producto" mostrar="si"]' );
?>
