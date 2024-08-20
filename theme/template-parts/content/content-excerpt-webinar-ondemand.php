<?php
/**
 * Template part for displaying post archives and search results
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package pictau_tw
 */
$post_type = get_post_type();
$pods = pods( $post_type, get_the_id() );
$category = ($pods->field('webinar_category')) ? $pods->field('webinar_category')[0]['name'] : false;

?>

<article id="post-<?php the_ID(); ?>" <?php post_class('card-webinar'); ?> data-anim_any>

	<?php
		echo sprintf( '<a href="%s" rel="bookmark">', esc_url( get_permalink() ) );
	?>
	<div class="featured-img">
	<?php
		pictau_post_thumbnail();
	?>
	</div>
	<div class="description">
		<div class="content">
		<?php
			if ($category) {
				echo '<span class="category">' . $category . '</span>';
			}

			the_title( sprintf( '<h2 class="entry-title">', esc_url( get_permalink() ) ), '</h2>' );

		// echo sprintf( '<a href="%s" rel="bookmark">', esc_url( get_permalink() ) );
		?>
			<div <?php pictau_content_class( 'entry-content' ); ?>>
				<?php echo get_excerpt(380); ?>
			</div><!-- .entry-content -->
		</div>
		<div class="read-more">
			<figure>
				<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"/><line x1="40" y1="128" x2="216" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="144 56 216 128 144 200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></svg>
			</figure>
		</div>
		<?php
		?>
	</div><!-- .entry-header -->



	</a>
</article><!-- #post-${ID} -->
