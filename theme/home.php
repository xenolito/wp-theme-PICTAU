<?php

/**
 * The template for blog index page
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package pictau_tw
 */
$post_type = get_post_type();
$pods = false;
$subheader = false;
$view_transition = false; //! Post Thumbnails will get a view-transition-name css style property with its ID.

if (function_exists('pods')) {
	$pods = pods($post_type, get_the_id());
	$subheader = $pods->field('subheader') !== '' ? $pods->field('subheader') : false;
}


$img = (is_home() && get_option('page_for_posts')) ? wp_get_attachment_image(get_post_thumbnail_id(get_option('page_for_posts')), 'full') : false;
$has_featured_img_cssClass = $img ? 'has-bg-img' : 'no-bg-img';

get_header();

?>

<section id="primary" class="theme-color-light">
	<main id="main">
		<article>
			<div>



				<?php if (have_posts()) : ?>
					<header class="entry-header has-bg <?php echo $has_featured_img_cssClass ?>">


						<!-- div class="header-default-bg is-bg full-width full-height" -->
						<div class="entry-header-content layout-site-width">
							<?php
							if (!is_front_page()) {
								single_post_title('<h1 class="entry-title sr-only" data-anim_any data-anim_any_whattoanim="chars" data-anim_any_animation="clippedFromBottom" data-anim_any_waitpageload="true" data-anim_any_duration="0.8" data-anim_any_delay="0.3" data-anim_any_stagger="0.035" >', '</h1>');
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


					<section class="entry-content pct-section alignfull no-pt">
						<?php
						// echo do_shortcode('[category-ui]');
						?>
						<section class="pct-section latest-entry" data-anim_any data-anim_any_delay="0.3" data-anim_any_duration="1" data-anim_any_slideamount="50">
							<!-- <section class="pct-section latest-entry no-pb"> -->

							<?php
							//! Get the latest single post as featured

							$sticky_posts = get_option('sticky_posts');

							if (!empty($sticky_posts)) {
								$the_query = new WP_Query(array(
									'post_type'		=> 'post',
									'post__in'			=> $sticky_posts,
									'ignore_sticky_posts' => 1,
									'posts_per_page'	=> 1,
									'post_status'			=> 'publish'
								));
							} else {
								$the_query = new WP_Query(array(
									'posts_per_page'	=> 1,
									'post_status'			=> 'publish',
									'post_type'		=> 'post',
									'ignore_sticky_posts' => 1,
								));
							}

							$featured_post_id = false;

							if ($the_query->have_posts()) {
								while ($the_query->have_posts()) :
									$the_query->the_post();
									$featured_post_id = get_the_ID();
									get_template_part('template-parts/content/content', 'excerpt', array('featured' => true, 'show_category' => true, 'view_transition' => $view_transition, 'thumbnail_size' => 'medium_large'));


								endwhile;
								wp_reset_postdata();
							}


							?>
						</section>
						<section class="pct-section latest-entries no-pt theme-color-A" data-anim_any data-anim_any_delay="0.6" data-anim_any_duration="1" data-anim_any_slideamount="50">
							<!-- <section class="pct-section latest-entries no-pt"> -->
							<?php
							//! Get the latest 4 posts
							$latest_entries = new WP_Query(array(
								'posts_per_page'	=> 4,
								'post_type'		=> 'post',
								'orderby'			=> 'date',
								'order'			=> 'DESC',
								'ignore_sticky_posts' => 1,
								// 'offset'			=> 1,
								'post__not_in'   => array($featured_post_id), // Excluimos el post que hemos destacado visualmente mas arriba
								'post_status'			=> 'publish'
							));


							if ($latest_entries->have_posts()) {
								while ($latest_entries->have_posts()) :
									$latest_entries->the_post();
									get_template_part('template-parts/content/content', 'excerpt', array('show_category' => true, 'view_transition' => $view_transition, 'thumbnail_size' => 'medium'));


								endwhile;
								wp_reset_postdata();
							}

							?>
						</section>

						<div class="categories">

							<?php
							//! Categories list with last 3 posts each
							$cats = get_categories();
							$max_posts_by_cat = 3;

							foreach ($cats as $cat) {
								$args = array(
									'posts_per_page'	=> $max_posts_by_cat,
									'post_type'		=> 'post',
									'cat'		=> $cat->term_id,
									'orderby'			=> 'date',
									'order'			=> 'DESC',
									'post_status'			=> 'publish',
									// 'no_found_rows' => false,
								);

								$query_cats = new WP_Query($args);

								$total_posts = $query_cats->found_posts;

								if ($query_cats->have_posts()) {

							?>
									<section class="pct-section category-entries" data-anim_any data-anim_any_delay="0.3" data-anim_any_duration="1" data-anim_any_slideamount="50">
										<!-- <section class="pct-section category-entries"> -->
										<h2><?php echo $cat->name; ?></h2>
										<div class="entries-grid">
											<?php
											while ($query_cats->have_posts()) :
												$query_cats->the_post();
												get_template_part('template-parts/content/content', 'excerpt', array('view_transition' => false, 'thumbnail_size' => 'medium'));


											endwhile;
											?>
										</div>
										<?php
										if ($total_posts > $max_posts_by_cat) {
										?>

											<div class="category-link">
												<a href="<?php echo get_category_link($cat->term_id); ?>"> <?php echo __('More about', 'pictau') . ' ' . $cat->name; ?><svg xmlns="http://www.w3.org/2000/svg" width="20" height="10" fill="none" class="button-arrow-right">
														<path fill="currentColor" fill-rule="evenodd" d="M15.207.293 19.914 5l-4.707 4.707-1.414-1.414L16.086 6H0V4h16.086l-2.293-2.293z" clip-rule="evenodd"></path>
													</svg></a>
											</div>
										<?php
										}
										?>
									</section>
							<?php
									wp_reset_postdata();
								}
								# code...
							}


							?>
						</div>


					<?php




				// Start the Loop.
				// while ( have_posts() ) :
				// 	the_post();
				// 	get_template_part( 'template-parts/content/content', 'excerpt' );

				// 	// End the loop.
				// endwhile;

				// Previous/next page navigation.
				// echo posts_navigation();

				else :

					// If no content, include the "No posts found" template.
					get_template_part('template-parts/content/content', 'none');

				endif;
					?>
					</section>
				</div>
		</article>
	</main><!-- #main -->
</section><!-- #primary -->

<?php
get_footer();
