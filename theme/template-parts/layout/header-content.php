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

$brandLogo = ( has_custom_logo() ) ? '<img src="' . esc_url( $logo[0] ) . '" alt="' . get_bloginfo( 'name' ) . '">' : '<h1>' . get_bloginfo('name') . '</h1>';

?>

<header id="masthead" class="site-header <?php echo $headerBehavior;  ?>">
	<div>
		<?php
		// IF THERE IS TOP MENU...
		if ( has_nav_menu('top_menu') ) :
		?>
		<div class="above-header-wrap">
			<div class="above-header-content mx-auto">
			<?php
			wp_nav_menu(
				array(
					'container' 			=> 'nav',
					'container_class'	=> 'flex w-[100%] justify-center',
					'theme_location'	=> 'top_menu',
					'menu_id'        	=> 'top-menu',
					'menu_class'			=> 'top-nav-container flex items-center w-[100%] justify-end gap-[var(--menu-items-gap)]',
					'items_wrap'			=> '<ul id="%1$s" class="%2$s" aria-label="submenu">%3$s</ul>',
					'walker'					=> new Main_Nav_Walker
					)
			);
			?>
			</div>
		</div>
		<?php
		endif; ?>

		<div class="main-header-wrap">
			<div class="main-header-content">
				<div class="logo-brand">
					<a href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home" aria-label="home page"><?php echo wp_svg_inline_filter($brandLogo); ?></a>
				</div>
				<div class="main-navigation-wrap flex justify-end">
					<?php
					if ( has_nav_menu('menu-1') ): wp_nav_menu( $mainNavMenu); else: echo '⛔️ Please, create a "Primary" menu'; endif;
					if ( has_nav_menu('menu-1-mobile') ): wp_nav_menu( $mainNavMenuMobile ); else: echo '  ⛔️ Please, create a "Mobile" menu'; endif;
					?>
				</div>
			</div>
		</div>
	</div>
	<!-- #site-navigation -->

</header><!-- #masthead -->
