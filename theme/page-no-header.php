<?php
/*
Template Name: NO page header
Requires free plugin: LightStart and Maintenance Mode ( https://wordpress.org/plugins/wp-maintenance-mode )
*/


get_header();
?>

	<section id="primary">
		<main id="main">

			<?php

			/* Start the Loop */
			while ( have_posts() ) :
				the_post();

				get_template_part( 'template-parts/content/content', 'page-noheader' );

			endwhile; // End of the loop.
			?>

		</main><!-- #main -->
	</section><!-- #primary -->

<?php
get_footer();