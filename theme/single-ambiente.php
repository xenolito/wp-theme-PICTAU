<?php

/**
 * The template for displaying single ambiente posts
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
			get_template_part( 'template-parts/content/content', 'single-ambiente' );
		endwhile;
		?>

	</main><!-- #main -->
</section><!-- #primary -->

</div><!-- #content -->
</div><!-- #page -->

<?php wp_footer(); ?>
</body>
</html>
