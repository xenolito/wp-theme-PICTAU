<?php
/**
 * Template part for displaying the header content
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package pictau_tw
 */

$headerBehavior = get_theme_mod( 'header_behavior', 'fixed-header' );
$hasMenuMobile = has_nav_menu('menu-1-mobile');

$mobileSwticher = '<figure id="menu-switcher" class="mobile-menu-switcher"><span></span><span></span><span></span></figure>';

$mainNavMenu = array(
	'container'				=> 'nav',
	'container_class'	=> 'main-nav-desktop',
	'container_label'	=> 'mi-label',
	'theme_location'	=> 'menu-1',
	'menu_id'					=> 'primary-menu',
	'menu_class'			=> 'main-menu-desktop',
	'items_wrap'			=> '<ul id="%1$s" class="%2$s" aria-label="primary-menu">%3$s</ul>',
	'walker'					=> new Main_Nav_Walker
);

$mainNavMenuMobile = array(
	'container'				=> 'nav',
	'container_class'	=> 'main-nav-mobile',
	'container_label'	=> 'mi-label',
	'theme_location'	=> $hasMenuMobile ? 'menu-1-mobile' : 'menu-1',
	'menu_id'					=> 'primary-menu',
	'menu_class'			=> 'main-menu-mobile',
	'items_wrap'			=> '<div class="mmobile-ui">'. $mobileSwticher .'</div><div class="primary-menu-wrapper"><ul id="%1$s" class="%2$s" aria-label="primary-menu">%3$s</ul></div>',
	'walker'					=> new Main_Nav_Walker
);

$custom_logo_id = get_theme_mod( 'custom_logo' );
$logo = wp_get_attachment_image_src( $custom_logo_id , 'full' );

$brandLogo = '<img src="' . wp_upload_dir()['baseurl'] . '/logo-solar-sense.svg' . '" alt="solar-sense-logo">';




?>
<header id="masthead" class="site-header <?php echo $headerBehavior;  ?>">
	<div>
		<div class="main-header-wrap">
			<div class="main-header-content">
				<div class="logo-brand">
					<a href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home" aria-label="home page"><?php echo wp_svg_inline_filter($brandLogo); ?></a>
				</div>
				<div class="main-navigation-wrap flex justify-end">
					<nav class="main-nav-desktop">
						<ul id="primary-menu" class="main-menu-desktop" aria-label="primary-menu">
							<li class="menu-item menu-item-type-post_type menu-item-object-page">
								<a href="#quienes-somos">Quiénes somos</a>
							</li>
							<li class="menu-item menu-item-type-post_type menu-item-object-page">
								<a href="#servicios">Servicios</a>
							</li>
							<li class="menu-item menu-item-type-post_type menu-item-object-page">
								<a href="#noticias">Noticias</a>
							</li>
							<li class="menu-item menu-item-type-post_type menu-item-object-page">
								<a href="#contacto">Contacto</a>
							</li>
						</ul>
					</nav>
					<nav class="main-nav-mobile">
						<div class="mmobile-ui">
							<figure id="menu-switcher" class="mobile-menu-switcher" style="cursor: pointer; pointer-events: all;">
								<span></span><span></span><span></span></figure>
						</div>
						<div class="primary-menu-wrapper">
							<ul id="primary-menu" class="main-menu-mobile" aria-label="primary-menu">
								<li class="menu-item menu-item-type-post_type menu-item-object-page">
									<a href="#quienes-somos">Quiénes somos</a>
								</li>
								<li class="menu-item menu-item-type-post_type menu-item-object-page">
									<a href="#servicios">Servicios</a>
								</li>
								<li class="menu-item menu-item-type-post_type menu-item-object-page">
									<a href="#noticias">Noticias</a>
								</li>
								<li class="menu-item menu-item-type-post_type menu-item-object-page">
									<a href="#contacto">Contacto</a>
								</li>
							</ul>
						</div>
					</nav>
				</div>
			</div>
		</div>
	</div>
	<!-- #site-navigation -->

</header><!-- #masthead -->
