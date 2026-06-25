<?php

/**
 * The header for our theme
 *
 * This is the template that displays the `head` element and everything up
 * until the `#content` element.
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package pictau_tw
 */

?>
<!doctype html>
<html <?php language_attributes(); ?> data-overlayscrollbars-initialize>

<head>
	<meta charset="<?php bloginfo('charset'); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
	<link rel="profile" href="https://gmpg.org/xfn/11">
	<?php wp_head(); ?>
	<?php

	//! Add Google Tag Manager if GTM_ID is set in Customizer
	$gtm_id = get_theme_mod('GTM_ID');
	if (!empty($gtm_id)) {
	?>
		<!-- Google Tag Manager -->
		<script>
			(function(w, d, s, l, i) {
				w[l] = w[l] || [];
				w[l].push({
					'gtm.start': new Date().getTime(),
					event: 'gtm.js'
				});
				var f = d.getElementsByTagName(s)[0],
					j = d.createElement(s),
					dl = l != 'dataLayer' ? '&l=' + l : '';
				j.async = true;
				j.src =
					'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
				f.parentNode.insertBefore(j, f);
			})(window, document, 'script', 'dataLayer', '<?php echo esc_js($gtm_id); ?>');
		</script>
		<!-- End Google Tag Manager -->
	<?php
	}
	?>
</head>

<body <?php body_class('theme-color-light'); ?> data-overlayscrollbars-initialize>

	<?php wp_body_open(); ?>

	<div id="page" class="theme-first">
		<?php get_template_part('template-parts/layout/header', 'content'); ?>
		<div id="content">