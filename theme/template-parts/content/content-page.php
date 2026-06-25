<?php

/**
 * Template part for displaying PAGES
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package pictau_tw
 */

$post_type = get_post_type();

$pods = false;
$subheader = false;
$header_tag = false;
$has_featured_img = false;
$has_featured_img_cssClass = false;


if (function_exists('pods')) {
	$pods = pods($post_type, get_the_id());
	$subheader  = $pods->field('subheader') !== '' ? $pods->field('subheader') : false;
	$header_tag = $pods->field('header_tag') !== '' ? $pods->field('header_tag') : false;
	$has_featured_img = has_post_thumbnail() ? true : false;
	$has_featured_img_cssClass = $has_featured_img ? 'has-bg-img' : 'no-bg-img';
}




?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>

	<header class="entry-header has-bg no-bg-img">
		<div class="header-default-bg">
			<div class="header-canvas" data-webgldots_density="6" data-webgldots data-webgldots_target=".webgldots-container" data-webgldots_color="#ffffff" data-webgldots_speed="0.5" data-webgldots_size="1.5">
				<div class="webgldots-container"></div>
			</div>
		</div>

		<div class="entry-header-content layout-site-width rows-center flex flex-col justify-center py-10">
			<?php if ( $header_tag ) : ?>
				<p class="has-text-align-center header-tag"><?php echo esc_html( $header_tag ); ?></p>
			<?php endif; ?>
			<?php
			the_title('<h1 class="page-title no-pb">', '</h1>');

			if ($subheader) {
			?>
				<p class="center no-pt bigger max-reading-width">
					<?php echo $subheader; ?>
				</p>
			<?php
			}
			?>
		</div>
		<div class="header-cover-loading"></div>
	</header><!-- .entry-header -->





	<div <?php pictau_content_class('entry-content'); ?>>
		<?php
		the_content();

		?>
	</div><!-- .entry-content -->

</article><!-- #post-<?php the_ID(); ?> -->