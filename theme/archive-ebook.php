<?php
/**
 * The template for displaying archive pages
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package pictau_tw
 */

$post_type = get_post_type();
$pods = pods( $post_type, get_the_id() );
$subheader = $pods->field('subheader') !== '' ? $pods->field('subheader') : false;

$img = ( is_home() && get_option('page_for_posts') ) ? wp_get_attachment_image(get_post_thumbnail_id(get_option('page_for_posts')),'full') : false;
$has_featured_img_cssClass = $img ? 'has-bg-img' : 'no-bg-img';

get_header();

?>

<section id="primary">
	<main id="main">
		<article>

			<?php if ( have_posts() ) : ?>
			<header class="entry-header has-bg <?php echo $has_featured_img_cssClass ?>">
				<?php
					if ( $img ) {
						echo '<figure class="is-bg only-img">'. $img . '</figure>';
						?>
						<div class="header-dark-overlay"></div>
						<?php
					}
					else {
					?>
					<div class="header-default-bg">
						<?php //echo do_shortcode('[anim-bg color="#8ba939" origin="95%,90%" speed="1.5" size="1500"]'); ?>
						<?php //echo do_shortcode('[anim-bg color="#4e03e7" origin="95%,90%" speed="1.5" size="1500"]'); ?>
						<?php echo do_shortcode('[anim-bg color="#0251b3" origin="95%,90%" speed="1.5" size="1500"]'); ?>
						<?php echo do_shortcode('[anim-bg color="#ffff00" origin="80%,120%" speed="1.5"]'); ?>
						<?php echo do_shortcode('[anim-bg color="#8AA738" origin="80%,120%" speed="1.5"]'); ?>
					</div>
					<?php


					}

				?>

					<!-- div class="header-default-bg is-bg full-width full-height" -->
					<div class="entry-header-content layout-site-width">
						<?php
						echo '<h1 class="page-title">'. __('e-books','pictau') . '</h1>';
						// the_archive_title( '<h1 class="page-title">', '</h1>' );
						?>
						<div class="header-subtitle">
							<div class="left-border"></div>
									<p data-anim_any data-anim_any_animation="clippedFromLeft" data-anim_any_whattoanim="lines" data-anim_any_duration="1.6" data-anim_any_whattoanim="lines" data-anim_any_delay="0.9" data-anim_any_stagger="0.15">
									<?php echo __('Descubre a través de estos interesantes libros electrónicos cómo las nuevas tecnologías y el Business Intelligence pueden ayudarte a sacar el mayor partido a tus datos.','pictau') ?>

									</p>
							</div>
						</div>
						<div class="header-cover-loading"></div>
			</header><!-- .entry-header -->




			<section class="entry-content pct-section">
			<?php
				// echo do_shortcode('[category-ui]');

			?>
					<div class="archive-grid-2cols">
			<?php
			// Start the Loop.
			while ( have_posts() ) :
				the_post();
				get_template_part( 'template-parts/content/content', 'excerpt-ebook' );

				// End the loop.
			endwhile;

			?>
					</div>
			<?php
			// Previous/next page navigation.
			// pictau_the_posts_navigation();
			echo posts_navigation();

			else :

			// If no content, include the "No posts found" template.
			get_template_part( 'template-parts/content/content', 'none' );

			endif;
			?>
			</section>
		</article>
	</main><!-- #main -->
</section><!-- #primary -->

<?php
get_footer();
