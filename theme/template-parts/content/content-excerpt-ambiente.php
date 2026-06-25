<?php

/**
 * Template part for displaying ambiente archive cards
 *
 * @package pictau_tw
 */

$pod         = pods( 'ambiente', get_the_id() );
$ambient_id  = $pod ? $pod->field( 'ambient_id' ) : '';
$description = $pod ? $pod->field( 'description' ) : '';

?>

<article id="post-<?php the_ID(); ?>" <?php post_class( 'card-archive-post' ); ?> data-anim_any>

	<a href="<?php echo esc_url( get_permalink() ); ?>" rel="bookmark">
		<div class="featured-img">
			<?php echo pictau_post_thumbnail(); ?>
		</div>
		<div class="description">
			<div class="content">
				<?php the_title( '<h2 class="entry-title">', '</h2>' ); ?>
				<?php if ( $description ) : ?>
					<div class="ambient-desc"><?php echo wp_kses_post( $description ); ?></div>
				<?php endif; ?>
			</div>
			<div class="read-more">
				<figure>
					<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256">
						<rect width="256" height="256" fill="none" />
						<line x1="40" y1="128" x2="216" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" />
						<polyline points="144 56 216 128 144 200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" />
					</svg>
				</figure>
			</div>
		</div><!-- .description -->
	</a>

</article><!-- #post-<?php the_ID(); ?> -->
