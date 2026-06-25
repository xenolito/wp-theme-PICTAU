<?php

/**
 * Template part for displaying CPT
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package pictau_tw
 */

$post_type = get_post_type();
$pods = pods($post_type, get_the_id());

?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>

	<header class="entry-header has-glassy-card has-bg only-img full-vh theme-color-dark transparent-header" data-parallax_header data-parallax_header_whattoanim=".is-bg">
		<?php
		if (has_post_thumbnail()) {
			echo pictau_post_thumbnail('is-bg only-img');
		?>
			<div class="header-dark-overlay"></div>
		<?php
		} else {
		?>
			<div class="header-default-bg">
				<div class="header-canvas">
					<canvas class="webgl-bkp-intro" data-breakmobile="710,0.07" data-mode="header" data-bgcolor="#60768a"></canvas>
				</div>
				<!--script type="module" src="./script.js"></script-->
				<script type="module" src="/wp-content/themes/pictau/theme/js/home_slider.js"></script>
			</div>
			<div class="header-overlay"></div>
		<?php
		}
		?>
		<div class="entry-header-content">
			<div class="glassy-card">

				<?php
				the_title('<h1 class="entry-title">', '</h1>');
				?>
				<div class="header-subtitle">
					<div class="left-border"></div>
					<p data-anim_any data-anim_any_animation="clippedFromLeft" data-anim_any_whattoanim="lines" data-anim_any_duration="1.6" data-anim_any_whattoanim="lines" data-anim_any_delay="0.9" data-anim_any_stagger="0.15" data-anim_any_chainanim=".cta">
						Subheading ¿?
						<?php //echo $pods->field('subheading');
						?>
					</p>
				</div>

			</div>
		</div>
	</header><!-- .entry-header -->


	<section class="wp-block-group alignfull pct-section is-layout-constrained wp-block-group-is-layout-constrained">
		<div <?php pictau_content_class('entry-content'); ?>>

			<?php
			the_content(
				sprintf(
					wp_kses(
						/* translators: %s: Name of current post. Only visible to screen readers. */
						__('Continue reading<span class="sr-only"> "%s"</span>', 'pictau'),
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
					'before' => '<div>' . __('Pages:', 'pictau'),
					'after'  => '</div>',
				)
			);
			?>
		</div><!-- .entry-content -->
	</section>


</article><!-- #post-${ID} -->