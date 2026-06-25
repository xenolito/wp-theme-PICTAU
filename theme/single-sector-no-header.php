<?php

/**
 * Template Name: Sector no header
 * Template Post Type: sector
 *
 * Template Description...
 **/
get_header();
?>

<section id="primary">
	<main id="main">

		<?php
		/* Start the Loop */
		while (have_posts()) :
			the_post();
			get_template_part('template-parts/content/content', 'single-sector-no-header');

			if (is_singular('post')) {
				// Previous/next post navigation.
				the_post_navigation(
					array(
						'next_text' => '<span aria-hidden="true">' . __('Next Post', 'pictau') . '</span> ' .
							'<span class="sr-only">' . __('Next post:', 'pictau') . '</span> <br/>' .
							'<span>%title</span>',
						'prev_text' => '<span aria-hidden="true">' . __('Previous Post', 'pictau') . '</span> ' .
							'<span class="sr-only">' . __('Previous post:', 'pictau') . '</span> <br/>' .
							'<span>%title</span>',
					)
				);
			}
		// End the loop.
		endwhile;
		?>

	</main><!-- #main -->
</section><!-- #primary -->

<?php
get_footer();
