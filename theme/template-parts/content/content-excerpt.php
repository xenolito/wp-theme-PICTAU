<?php

/**
 * Template part for displaying post archives and search results
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package pictau_tw
 */
?>

<?php
// $args is an array of key => value pairs passed to the template by get_template_part()
// for instance from home.php (blog page)
$is_featured = array_key_exists('featured', $args) ? 'featured' : '';
$show_cat = array_key_exists('show_category', $args);
$single_post = array_key_exists('single_post', $args);
$thumbnail_size = array_key_exists('thumbnail_size', $args) ? $args['thumbnail_size'] : false;
$view_transition = array_key_exists('view_transition', $args) ? $args['view_transition'] : false;

//! Duotone featured images
$is_duotone = false;
$duotone = ($is_duotone) ? 'duotone duotone-A' : '';

if (!function_exists('getPostCategoryWithMainCat')) {
	function getPostCategoryWithMainCat($post_id = null)
	{
		if (null === $post_id) {
			$post_id = get_the_ID();
		}
		$has_main_category = get_post_meta($post_id, '_categoria_principal', true);
		// retrieves the main_category if exists, or the first one.
		if ($has_main_category) {
			$cat = get_category($has_main_category);
			if ($cat && ! is_wp_error($cat)) {
				return $cat;
			}
		}
		$cats = get_the_category($post_id);
		if (!empty($cats)) {
			return $cats[0];
		}
		return false;
	}
}



//!  SINGLE POST
if ($single_post) {


	// $cat_id = get_post_meta(get_the_ID(), '_categoria_principal', true);
	// if ($cat_id) {
	// 	$cat = get_category($cat_id);
	// 	echo 'Categoría principal: <a href="' . get_category_link($cat) . '">' . esc_html($cat->name) . '</a>';
	// }


?>
	<header class="entry-header single-post">
		<div class="content">
			<?php
			if ($show_cat) {
				$category = getPostCategoryWithMainCat(get_the_ID());

				if ($category) {
					$output = '<div class="cat">';
					$output .= '<a href="' . get_category_link($category->term_id) . '" rel="bookmark">' . $category->name . '</a>';
					$output .= '</div>';
					echo $output;
				}

				// $categories = get_the_category();
				// if (!empty($categories)) {
				// 	$category = $categories[0];
				// 	$output = '<div class="cat">';
				// 	$output .= '<a href="' . get_category_link($category->term_id) . '" rel="bookmark">' . $category->name . '</a>';
				// 	$output .= '</div>';
				// 	echo $output;
				// }
			}
			?>

			<div class="description">
				<div class="title-date">
					<?php
					the_title(sprintf('<h1 class="entry-title single-post">', esc_url(get_permalink())), '</h1>');
					?>
					<div class="date-reading-time">
						<div class="date">
							<?php echo get_the_date('d-m-Y'); ?>
						</div>
						<?php echo reading_time(get_post_field('post_content', get_the_ID())) ?>
					</div>

				</div>
			</div>
		</div>
		<?php echo pictau_post_thumbnail($duotone, $thumbnail_size, $view_transition); ?>

	</header><!-- .entry-header -->
<?php
} else {
	//! NOT SINGLE POST
?>




	<article id="post-<?php the_ID(); ?>" <?php post_class($is_featured . ' excerpt'); ?>>
		<?php
		// echo sprintf( '<a href="%s" rel="bookmark">', esc_url( get_permalink() ) );
		?>
		<header class="entry-header">
			<?php
			// if ( is_sticky() && is_home() && ! is_paged() ) {
			// 	printf( '%s', esc_html_x( 'Featured', 'post', 'pictau' ) );
			// }

			?>
			<?php echo pictau_post_thumbnail($duotone, $thumbnail_size, $view_transition); ?>




			<div class="content">
				<?php
				if ($show_cat) {
					$category = getPostCategoryWithMainCat(get_the_ID());


					// $categories = get_the_category();
					if ($category) {
						$output = '<div class="cat">';
						$output .= '<a href="' . get_category_link($category->term_id) . '" rel="bookmark">' . $category->name . '</a>';
						$output .= '</div>';
						echo $output;
					}
				}
				?>

				<a href="<?php echo esc_url(get_permalink()); ?>" rel="bookmark">
					<div class="description">
						<div class="title-date">
							<?php
							the_title(sprintf('<h2 class="entry-title">', esc_url(get_permalink())), '</h2>');
							?>
							<div class="date">
								<?php echo get_the_date('d-m-Y'); ?>
							</div>
						</div>
						<figure class="entry-cta">
							<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256">
								<rect width="256" height="256" fill="none" />
								<line x1="40" y1="128" x2="216" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" />
								<polyline points="144 56 216 128 144 200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" />
							</svg>
						</figure>
					</div>
				</a>
			</div>
		</header><!-- .entry-header -->
		<!--div <?php //pictau_content_class( 'entry-content' );
						?>>
			<?php //echo get_excerpt(380);
			?>
		</div -->
		<!-- .entry-content -->
		</a>
	</article><!-- #post-${ID} -->

<?php
}

?>