<?php
/**
 * Template part for displaying post archives and search results
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package pictau_tw
 */

?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?> data-anim_any>

	<?php
		echo sprintf( '<a href="%s" rel="bookmark">', esc_url( get_permalink() ) );
	?>
	<header class="entry-header">
		<?php
		if ( is_sticky() && is_home() && ! is_paged() ) {
			printf( '%s', esc_html_x( 'Featured', 'post', 'pictau' ) );
		}

		?>
			<div class="title-date">
				<?php
				the_title( sprintf( '<h2 class="entry-title">', esc_url( get_permalink() ) ), '</h2>' );
				?>
				<div class="date">
					<?php echo get_the_date('d-m-Y'); ?>
				</div>
			</div>

			<figure>
				<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"/><line x1="40" y1="128" x2="216" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="144 56 216 128 144 200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></svg>
			</figure>
		<?php
		?>
	</header><!-- .entry-header -->

	<?php pictau_post_thumbnail(); ?>

	<div <?php pictau_content_class( 'entry-content' ); ?>>
		<?php echo get_excerpt(380); ?>
	</div><!-- .entry-content -->
	</a>
</article><!-- #post-${ID} -->
