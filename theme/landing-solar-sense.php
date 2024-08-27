<?php
/*
Template Name: LANDING SOLAR SENSE
*/


get_header('solar-sense');
?>

	<section id="primary">
		<main id="main">

			<?php

			/* Start the Loop */
			while ( have_posts() ) :
				the_post();

				get_template_part( 'template-parts/content/content', 'page-landing-solar-sense' );

			endwhile; // End of the loop.
			?>

		</main><!-- #main -->
	</section><!-- #primary -->

<?php
get_footer();