<?php

/**
 * Template part POST'S RELATED POSTS by category
 *
 *
 * @package pictau_tw
 */

$post_type = get_post_type();
// $pods = false;
// $subheader = false;
// $custom_header_img = false;

$related_by = array_key_exists('related_by', $args);
$categories = get_the_category();




if (!empty($categories)) {

	$cat = $categories[0];

	$args = array(
		'posts_per_page'	=> 3,
		'post_type'		=> 'post',
		'cat'		=> $cat->term_id,
		'orderby'			=> 'date',
		'order'			=> 'DESC',
		'post_status'			=> 'publish',
		'post__not_in'	=> array($post->ID)
	);

	$query_cats = new WP_Query($args);

	if ($query_cats->have_posts()) {
	?>
		<section class="pct-section theme-color-A">
		<div class="related-posts" data-anim_any data-anim_any_delay="0.01" data-anim_any_duration="1" data-anim_any_slideamount="50">
		<?php


		?>
			<h2 class="wp-block-heading"><?php echo __('More posts about', 'pictau') . ' ' . $cat->name ?></h2>

			<section class="category-entries">
				<div class="entries-grid">
					<?php
					while ($query_cats->have_posts()) :
						$query_cats->the_post();
						get_template_part('template-parts/content/content', 'excerpt', array('thumbnail_size' => 'medium_large'));


					endwhile;
					?>
				</div>
				<div class="category-link">
					<a href="<?php echo get_category_link($cat->term_id); ?>"> <?php echo __('All about', 'pictau') . ' ' . $cat->name; ?><svg xmlns="http://www.w3.org/2000/svg" width="20" height="10" fill="none" class="button-arrow-right">
							<path fill="currentColor" fill-rule="evenodd" d="M15.207.293 19.914 5l-4.707 4.707-1.414-1.414L16.086 6H0V4h16.086l-2.293-2.293z" clip-rule="evenodd"></path>
						</svg></a>
				</div>
			</section>
		</div>
	</section>
	<?php
		wp_reset_postdata();
	}




}

?>
