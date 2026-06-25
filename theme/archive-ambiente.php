<?php

/**
 * The template for displaying the ambiente archive
 *
 * @package pictau_tw
 */

get_header();

?>

<section id="primary">
	<main id="main">
		<article>

			<?php if ( have_posts() ) : ?>
				<header class="entry-header has-bg no-bg-img">
					<div class="header-default-bg">
						<div class="header-canvas" data-webgldots_density="6" data-webgldots data-webgldots_target=".webgldots-container" data-webgldots_color="#ffffff" data-webgldots_speed="0.5" data-webgldots_size="1.5">
							<div class="webgldots-container"></div>
						</div>
					</div>

					<div class="entry-header-content layout-site-width rows-center flex flex-col justify-center py-10">
						<p class="has-text-align-center header-tag"><?php echo esc_html__( 'Visualizadores interactivos', 'pictau' ); ?></p>
						<h1 class="page-title no-pb"><?php echo esc_html__( 'Ambientes', 'pictau' ); ?></h1>
						<p class="center no-pt bigger max-reading-width">
							<?php echo esc_html__( 'Visualiza cómo quedarían nuestros productos en distintos ambientes exteriores y encuentra la combinación perfecta para tu proyecto', 'pictau' ); ?>
						</p>
					</div>

					<div class="header-cover-loading"></div>
				</header><!-- .entry-header -->

				<section class="entry-content pct-section no-pt">

					<div class="archive-grid-2cols pct-section">
						<?php
						while ( have_posts() ) :
							the_post();
							get_template_part( 'template-parts/content/content', 'excerpt-ambiente' );
						endwhile;
						?>
					</div>
				</section>

			<?php else : ?>
				<?php get_template_part( 'template-parts/content/content', 'none' ); ?>
			<?php endif; ?>

		</article>
	</main><!-- #main -->
</section><!-- #primary -->

<?php
get_footer();
