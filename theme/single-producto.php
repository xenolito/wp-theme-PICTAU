<?php

/**
 * The template for displaying single producto posts
 *
 * @package pictau_tw
 */

get_header();
?>

<section id="primary">
	<main id="main">

		<?php
		while ( have_posts() ) :
			the_post();
			get_template_part( 'template-parts/content/content', 'single-producto' );
		endwhile;
		?>

	</main><!-- #main -->
</section><!-- #primary -->

<?php
get_footer();
