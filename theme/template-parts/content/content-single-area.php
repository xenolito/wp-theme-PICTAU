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

?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>

	<header class="entry-header area has-bg only-img full-vh" data-parallax_header data-parallax_header_whattoanim=".is-bg">
	<?php
		if ( has_post_thumbnail()) {
			pictau_post_thumbnail('is-bg only-img');
	?>
			<div class="header-dark-overlay"></div>
	<?php
		}
		else {
	?>
			<div class="header-default-bg">
				<?php echo do_shortcode('[anim-bg color="#8ba939" origin="65%,120%" speed="0.5"]'); ?>
				<?php echo do_shortcode('[anim-bg color="#ffff00" origin="80%,120%" speed="0.5"]'); ?>
				<?php echo do_shortcode('[anim-bg color="#8AA738" origin="80%,120%" speed="0.5"]'); ?>
			</div>
	<?php
		}
	?>
		<div class="entry-header-content">
	<?php
			the_title( '<h1 class="entry-title" data-anim_any data-anim_any_whattoanim="chars" data-anim_any_animation="blurIn" data-anim_any_waitpageload="true" data-anim_any_duration="1" data-anim_any_stagger="0.2" data-dot_pulsing >', '</h1>' );
		?>
			<div class="header-subtitle">
				<div class="left-border"></div>
				<p data-anim_any data-anim_any_animation="clippedFromLeft" data-anim_any_whattoanim="lines" data-anim_any_duration="1.6" data-anim_any_whattoanim="lines" data-anim_any_delay="0.9" data-anim_any_stagger="0.15" data-anim_any_chainanim=".cta">
					<?php echo $pods->field('subheading'); ?>
				</p>
			</div>
			<div class="cta" data-anim_any data-anim_any_duration="1" data-anim_any_delay="1">
				<div class="wp-block-buttons is-layout-flex wp-block-buttons-is-layout-flex">
					<div class="wp-block-button"><a href="<?php echo getLocalizedSlug('contacto') ?>" class="wp-block-button__link wp-element-button"><?php echo pll__('Solicita información'); ?></a></div>
				</div>
			</div>

		</div>
	</header><!-- .entry-header -->


	<section class="wp-block-group alignfull pct-section is-layout-constrained wp-block-group-is-layout-constrained">
		<div <?php pictau_content_class( 'entry-content' ); ?>>

			<?php
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
