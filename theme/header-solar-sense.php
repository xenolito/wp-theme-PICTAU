<?php
/**
 * The header the Solar Sense Landing Page
 *
 * This is the template that displays the `head` element and everything up
 * until the `#content` element.
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package pictau_tw
 */

?><!doctype html>
<html <?php language_attributes(); ?> data-overlayscrollbars-initialize >
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="profile" href="https://gmpg.org/xfn/11">
	<?php wp_head(); ?>
</head>

<body <?php body_class('solar-sense'); ?> data-overlayscrollbars-initialize>
<?php wp_body_open(); ?>
<div id="page" class="theme-first">
	<?php get_template_part( 'template-parts/layout/header', 'content-solar-sense' ); ?>
	<div id="content">
