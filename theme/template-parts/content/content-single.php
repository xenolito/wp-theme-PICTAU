<?php

/**
 * Template part for displaying POSTS
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package pictau_tw
 */

$post_type = get_post_type();
$pods = false;
$subheader = false;
$custom_header_img = false;
$view_transition = false;

if (function_exists('pods')) {
	$pods = pods($post_type, get_the_id());
	$subheader = $pods->field('subheader') !== '' ? $pods->field('subheader') : false;
	$custom_header_img = $pods->field('custom_header_img')  ? $pods->field('custom_header_img._src.full') : false;
}




?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
	<header class="entry-header has-bg only-img">


	</header><!-- .entry-header -->


	<!--div <?php //pictau_content_class( 'entry-content has-sidebar' );
					?>-->
	<div <?php pictau_content_class('entry-content theme-color-light'); ?>>
		<div class="post-content">
			<?php
			get_template_part('template-parts/content/content', 'excerpt', array('single_post' => true, 'show_category' => true, 'view_transition' => $view_transition));
			?>
			<!--h1>template-parts/conent/content-single.php</h1-->
			<?php
			the_content();
			get_template_part('template-parts/content/social_share_buttons', null, array('single_post' => true));
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
	<?php
	get_template_part('template-parts/content/related_posts', null, array('related_by' => 'category'));
	?>

</article><!-- #post-<?php the_ID(); ?> -->