<?php
/**
 * Template part for displaying PAGES
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package pictau_tw
 */

 //! whatch out!! this template has been deeply modified to be used for a specific customer (sensormatic honduras), restore the original template.

$post_type = get_post_type();

$pods = false;
$subheader = false;
$has_featured_img = false;
$has_featured_img_cssClass = false;


if (function_exists( 'pods')) {
	$pods = pods( $post_type, get_the_id() );
	$subheader = $pods->field('subheader') !== '' ? $pods->field('subheader') : false;
	$has_featured_img = has_post_thumbnail() ? true : false;
	$has_featured_img_cssClass = $has_featured_img ? 'has-bg-img' : 'no-bg-img';
}




?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>


	<header class="entry-header has-bg <?php echo $has_featured_img_cssClass ?>">
		<div class="header-default-bg">
			<figure class="is-bg only-img">
				<img src="<?php echo myImageLink() . '/bg-sections.webp' ?>" alt="header-bg">
			</figure>
		</div>

		<!-- div class="header-default-bg is-bg full-width full-height" -->
		<div class="entry-header-content layout-site-width">
			<?php
			if ( !is_front_page() && has_post_thumbnail()) {
				pictau_post_thumbnail('header-hero');
			}
			else if (!is_front_page()) {
				the_title( '<h1 class="entry-title" data-anim_any data-anim_any_whattoanim="chars" data-anim_any_animation="clippedFromBottom" data-anim_any_waitpageload="true" data-anim_any_duration="1" data-anim_any_stagger="0.05" >', '</h1>' );
			}

			if ($subheader) {
			?>
			<div class="header-subtitle">
				<div class="left-border"></div>
						<p data-anim_any data-anim_any_animation="clippedFromLeft" data-anim_any_whattoanim="lines" data-anim_any_duration="1.6" data-anim_any_whattoanim="lines" data-anim_any_delay="0.9" data-anim_any_stagger="0.15">
							<?php echo $subheader; ?>
						</p>
				</div>
			</div>
			<?php
			}
			?>
			<div class="header-cover-loading"></div>
	</header><!-- .entry-header -->


	<div <?php pictau_content_class( 'entry-content' ); ?>>
		<?php
		the_content();

		wp_link_pages(
			array(
				'before' => '<div>' . __( 'Pages:', 'pictau' ),
				'after'  => '</div>',
			)
		);
		?>
	</div><!-- .entry-content -->

</article><!-- #post-<?php the_ID(); ?> -->
