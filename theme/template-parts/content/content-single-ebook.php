<?php
/**
 * Template part for displaying WEBINARS ON DEMAND
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package pictau_tw
 */

$post_type = get_post_type();
$pods = pods( $post_type, get_the_id() );
// $category = ($pods->field('webinar_category')) ? $pods->field('webinar_category')[0]['slug'] : false;
// $cat_pod = $category ? pods('webinar_category', $category) : false;

// $cat_img = ($cat_pod && $cat_pod->field('category_img') ) ? '<figure>' . $cat_pod->field('category_img._img.full') . '</figure>' : false;
// $custom_header_img = $pods->field('custom_header_img')  ? $pods->field('custom_header_img._src.full') : false;

// $above_header = $category ? ( $cat_img ? $cat_img : $cat_pod->field('name') ) : '';


?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
	<header class="entry-header has-bg only-img no-bg-img">
		<div class="header-default-bg">
			<?php //echo do_shortcode('[anim-bg color="#8ba939" origin="95%,90%" speed="1.5" size="1500"]'); ?>
			<?php //echo do_shortcode('[anim-bg color="#4e03e7" origin="95%,90%" speed="1.5" size="1500"]'); ?>
			<?php echo do_shortcode('[anim-bg color="#0251b3" origin="50%,50%" speed="1.5" size="1500"]'); ?>
			<?php echo do_shortcode('[anim-bg color="#ffff00" origin="70%,60%" speed="1.5" size="1500"]'); ?>
			<?php echo do_shortcode('[anim-bg color="#8AA738" origin="60%,75%" speed="1.5 size="1500""]'); ?>
		</div>

		<!-- div class="header-default-bg is-bg full-width full-height" -->
		<div class="entry-header-content layout-site-width">
			<div class="above-header">
				e-book gratuito
			</div>
			<?php


				the_title( '<h1 class="entry-title smaller" data-anim_any data-anim_any_whattoanim="chars" data-anim_any_animation="clippedFromBottom" data-anim_any_waitpageload="true" data-anim_any_duration="1" data-anim_any_stagger="0.01" >', '</h1>' );

			?>
			<div class="header-cover-loading"></div>
	</header><!-- .entry-header -->


	<!--div <?php //pictau_content_class( 'entry-content has-sidebar' ); ?>-->
	<div <?php pictau_content_class( 'entry-content' ); ?>>
		<div class="post-content">
			<!--h1><?php echo $pods->field('ebook_pdf._src') ?></h1-->
			<!--h1>template-parts/conent/content-single.php</h1-->
		<?php

		if (isset($_GET['view']) && $pods->field('restricted_video_youtube_id')) {
				echo $pods->field('restricted_content');
				echo '<div class="content">';
				echo '	<figure class="restricted-video wp-block-embed is-type-video is-provider-youtube wp-block-embed-youtube wp-embed-aspect-16-9 wp-has-aspect-ratio"><div class="wp-block-embed__wrapper"><iframe width="500" height="281" src="https://www.youtube.com/embed/'. $pods->field('restricted_video_youtube_id') .'?feature=oembed?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen=""></iframe></div></figure>';
				echo '<div style="display:block; height: clamp(3rem, 8vw, 5rem);"></div>';
				// if ($pods->field('shortcode_form')) {
				// 	echo do_shortcode($pods->field('shortcode_form'));
				// }
				echo do_shortcode('[pictau-blocks id="'. get_pictau_blocks_ID_by_title('Video Restringido CTA') .'"]');

				echo '</div>';
		}
		else {

			the_content();
		}


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
