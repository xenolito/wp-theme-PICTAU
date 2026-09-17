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
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="theme-color" content="#1a1a1b">
	<?php wp_head(); ?>
</head>

<body <?php body_class('theme-color-light'); ?> data-overlayscrollbars-initialize>

	<?php wp_body_open(); ?>

	<div id="page" class="theme-first">
		<?php get_template_part('template-parts/layout/header', 'content'); ?>
		<div id="content">