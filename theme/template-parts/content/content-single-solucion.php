<?php
/**
 * Template part for displaying POSTS
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package pictau_tw
 */

$post_type = get_post_type();
$pods = pods( $post_type, get_the_id() );
$subheader = $pods->field('subheader') !== '' ? $pods->field('subheader') : false;

$custom_header_img = $pods->field('custom_header_img')  ? $pods->field('custom_header_img._src.full') : false;


?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
	<header class="entry-header has-bg only-img" data-parallax_header data-parallax_header_whattoanim=".is-bg">
	<?php
		if ($custom_header_img) {
		?>
			<figure class="is-bg only-img">
				<img src="<?= $custom_header_img ?>" alt="<?= $pods->field('post_title') ?>">
			</figure>
			<div class="header-dark-overlay-bottom"></div>
		<?php
		}
		else if ( has_post_thumbnail()) {
			pictau_post_thumbnail('is-bg only-img');
			?>
			<div class="header-dark-overlay"></div>
			<?php
		}
		else {
		?>
		<div class="header-default-bg">
			<?php //echo do_shortcode('[anim-bg color="#8ba939" origin="95%,90%" speed="1.5" size="1500"]'); ?>
			<?php //echo do_shortcode('[anim-bg color="#4e03e7" origin="95%,90%" speed="1.5" size="1500"]'); ?>
			<?= do_shortcode('[anim-bg color="#0251b3" origin="95%,90%" speed="1.5" size="1500"]'); ?>
			<?= do_shortcode('[anim-bg color="#ffff00" origin="80%,120%" speed="1.5"]'); ?>
			<?= do_shortcode('[anim-bg color="#8AA738" origin="80%,120%" speed="1.5"]'); ?>
		</div>
		<?php


		}

	?>

		<!-- div class="header-default-bg is-bg full-width full-height" -->
		<div class="entry-header-content layout-site-width">
			<?php
			if ( !is_front_page() ) {
				the_title( '<h1 class="entry-title smaller" data-anim_any data-anim_any_whattoanim="chars" data-anim_any_animation="clippedFromBottom" data-anim_any_waitpageload="true" data-anim_any_duration="1" data-anim_any_stagger="0.01" >', '</h1>' );
			}

			if ($subheader) {
			?>
			<div class="header-subtitle">
				<div class="left-border"></div>
						<p data-anim_any data-anim_any_animation="clippedFromLeft" data-anim_any_whattoanim="lines" data-anim_any_duration="1.6" data-anim_any_whattoanim="lines" data-anim_any_delay="0.9" data-anim_any_stagger="0.15">
							<?= $subheader; ?>
						</p>
				</div>
			</div>
			<?php
			}
			?>
			<div class="header-cover-loading"></div>
	</header><!-- .entry-header -->


	<!--div <?php //pictau_content_class( 'entry-content has-sidebar' ); ?>-->
	<div <?php pictau_content_class( 'entry-content' ); ?>>


			<!--h1>template-parts/conent/content-single.php</h1-->
					<?php
		the_content();

		/*
		wp_link_pages(
			array(
				'before' => '<div>' . __( 'Pages:', 'pictau' ),
				'after'  => '</div>',
			)
		);
		*/
		?>

		</div>
		<!-- sidebar -->
		<!--div class="sidebar">
			<?php
				// get_sidebar('primary');
			?>
		</div-->
		<!-- .sidebar -->




	</div><!-- .entry-content -->

</article><!-- #post-<?php the_ID(); ?> -->
