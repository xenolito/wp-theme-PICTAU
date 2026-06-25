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
$view_transition = false; //! Post Thumbnails will get a view-transition-name css style property with its ID.

$img = ( is_home() && get_option('page_for_posts') ) ? wp_get_attachment_image(get_post_thumbnail_id(get_option('page_for_posts')),'full') : false;
$has_featured_img_cssClass = $img ? 'has-bg-img' : 'no-bg-img';

get_header();

?>

<section id="primary">
	<main id="main">
		<article>

			<?php
			// query_posts( 'posts_per_page=5' );
			if ( have_posts() ) : ?>
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
					<?php


					}

				?>

					<!-- div class="header-default-bg is-bg full-width full-height" -->
					<div class="entry-header-content layout-site-width">
						<?php
						the_archive_title( '<h1 class="page-title">', '</h1>' );
						?>
						<div class="goback-link">
							<a href="<?php echo get_permalink( get_option( 'page_for_posts' ) ); ?>">
								<?php echo __('Return to Blog','pictau') ?>
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="10" fill="none" class="button-arrow-right"><path fill="currentColor" fill-rule="evenodd" d="M15.207.293 19.914 5l-4.707 4.707-1.414-1.414L16.086 6H0V4h16.086l-2.293-2.293z" clip-rule="evenodd"></path></svg>
							</a>
						</div>
					</div>
			</header><!-- .entry-header -->




			<section class="entry-content theme-color-A">
			<?php
				// echo do_shortcode('[category-ui]');
			?>
				<section class="pct-section category-entries" data-anim_any data-anim_any_delay="0.3" data-anim_any_duration="1" data-anim_any_slideamount="50">
					<div class="entries-grid">



			<?php




			// Start the Loop.
			while ( have_posts() ) :
				the_post();
				get_template_part( 'template-parts/content/content', 'excerpt', array( 'view_transition' => $view_transition,'thumbnail_size' => 'medium') );

				// End the loop.
			endwhile;

			?>
					</div>
			<?php

					// Previous/next page navigation.
					// pictau_the_posts_navigation();
					echo posts_navigation();
			?>
				</section>
			<?php

			// Previous/next page navigation.
			// pictau_the_posts_navigation();
			// echo posts_navigation();

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
