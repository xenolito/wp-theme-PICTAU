<?php

/**
 * Template part for displaying CASOS DE EXITO singular_name
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package pictau_tw
 */

$post_type = get_post_type();
$pods = pods($post_type, get_the_id());
$category = ($pods->field('webinar_category')) ? $pods->field('webinar_category')[0]['slug'] : false;
$cat_pod = $category ? pods('webinar_category', $category) : false;

$cat_img = ($cat_pod && $cat_pod->field('category_img')) ? '<figure>' . $cat_pod->field('category_img._img.full') . '</figure>' : false;
$custom_header_img = $pods->field('custom_header_img')  ? $pods->field('custom_header_img._src.full') : false;

$above_header = $category ? ($cat_img ? $cat_img : $cat_pod->field('name')) : '';


?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
	<header class="entry-header has-bg  theme-color-dark transparent-header <?php echo $has_featured_img_cssClass ?>">
		<div class="header-default-bg">
			<div class="header-canvas" data-webgldots_density="6" data-webgldots data-webgldots_target=".webgldots-container" data-webgldots_color="#ffffff" data-webgldots_speed="0.5" data-webgldots_size="1.5">
				<div class="webgldots-container"></div>
			</div>
		</div>
		<div class="header-overlay"></div>

		<!-- div class="header-default-bg is-bg full-width full-height" -->
		<div class="entry-header-content layout-site-width rows-center flex flex-col justify-center">
			<?php
			if (!is_front_page()) {

				the_title('<h1 class="entry-title no-pb" data-anim_any data-anim_any_whattoanim="chars" data-anim_any_animation="clippedFromBottom" data-anim_any_waitpageload="true" data-anim_any_duration="0.8" data-anim_any_delay="0.3" data-anim_any_stagger="0.035" >', '</h1>');

			?>
				<p class="has-text-align-center bigger" data-anim_any data-anim_any_delay="0.25"><?php echo __('Casos de éxito EQM', 'pictau') ?></p>
			<?php

			}
			?>
		</div>

		<div class="header-cover-loading"></div>
	</header><!-- .entry-header -->


	<!--div <?php //pictau_content_class( 'entry-content has-sidebar' );
					?>-->
	<div <?php pictau_content_class('entry-content'); ?>>
		<div class="post-content">
			<!--h1>template-parts/conent/content-single.php</h1-->
			<?php

			the_content();


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