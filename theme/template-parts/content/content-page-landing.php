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
$has_featured_img = false;
$has_featured_img_cssClass = false;


if (function_exists( 'pods')) {
	$pods = pods( $post_type, get_the_id() );
	$subheader = $pods->field('subheader') !== '' ? $pods->field('subheader') : false;
	$has_featured_img = has_post_thumbnail() ? true : false;
	$has_featured_img_cssClass = $has_featured_img ? 'has-bg-img' : 'no-bg-img';
}




?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>




	<div <?php pictau_content_class( 'entry-content' ); ?>>
		<?php
		the_content();
		?>
	</div><!-- .entry-content -->

</article><!-- #post-<?php the_ID(); ?> -->
