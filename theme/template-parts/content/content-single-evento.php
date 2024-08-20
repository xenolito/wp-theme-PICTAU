<?php
/**
 * Template part for displaying single posts
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package pictau_tw
 */

$post_type = get_post_type();
$pods = pods( $post_type, get_the_id() );
// $subheader = $pods->field('subheader') !== '' ? $pods->field('subheader') : false;

?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>



	<section class="wp-block-group alignfull pct-section no-pt is-layout-constrained wp-block-group-is-layout-constrained">
		<div <?php pictau_content_class( 'entry-content landing-has-slider' ); ?>>
			<?php
			the_title('<h1 class="screen-reader-text">', '</h1>');


			the_content(
				sprintf(
					wp_kses(
						/* translators: %s: Name of current post. Only visible to screen readers. */
						__( 'Continue reading<span class="sr-only"> "%s"</span>', 'pictau' ),
						array(
							'span' => array(
								'class' => array(),
							),
						)
					),
					get_the_title()
				)
			);

			wp_link_pages(
				array(
					'before' => '<div>' . __( 'Pages:', 'pictau' ),
					'after'  => '</div>',
				)
			);
			?>
		</div><!-- .entry-content -->
	</section>


</article><!-- #post-${ID} -->
