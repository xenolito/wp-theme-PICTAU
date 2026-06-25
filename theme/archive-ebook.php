<?php

/**
 * The template for displaying archive pages
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package pictau_tw
 */

$post_type = get_post_type();
$pods = pods($post_type, get_the_id());
$subheader = $pods->field('subheader') !== '' ? $pods->field('subheader') : false;

$img = (is_home() && get_option('page_for_posts')) ? wp_get_attachment_image(get_post_thumbnail_id(get_option('page_for_posts')), 'full') : false;
$has_featured_img_cssClass = $img ? 'has-bg-img' : 'no-bg-img';

get_header();

?>

<section id="primary">
	<main id="main">
		<article>

			<?php if (have_posts()) : ?>
				<header class="entry-header has-bg  theme-color-dark transparent-header <?php echo $has_featured_img_cssClass ?>">
					<div class="header-default-bg">
						<div class="header-canvas" data-webgldots_density="6" data-webgldots data-webgldots_target=".webgldots-container" data-webgldots_color="#ffffff" data-webgldots_speed="0.5" data-webgldots_size="1.5">
							<div class="webgldots-container"></div>
						</div>
					</div>

					<!-- div class="header-default-bg is-bg full-width full-height" -->
					<div class="entry-header-content layout-site-width rows-center flex flex-col justify-center py-10">
						<?php
						echo '<h1 class="page-title no-pb"><em>' . __('e-books', 'pictau') . '</em></h1>';
						?>

						<p class="center no-pt bigger max-reading-width">
							<?php echo __('Descubre a través de estos e-books la información más actualizada que te permita sacar el mayor beneficio para tu empresa', 'pictau') ?>

						</p>
					</div>
					</div>

					<div class=" header-cover-loading">
					</div>
				</header><!-- .entry-header -->




				<section class="entry-content pct-section">
					<?php
					// echo do_shortcode('[category-ui]');

					?>
					<div class="archive-grid-2cols">
						<?php
						// Start the Loop.
						while (have_posts()) :
							the_post();
							get_template_part('template-parts/content/content', 'excerpt-ebook');

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
				get_template_part('template-parts/content/content', 'none');

			endif;
				?>
				</section>
		</article>
	</main><!-- #main -->
</section><!-- #primary -->

<?php
get_footer();
