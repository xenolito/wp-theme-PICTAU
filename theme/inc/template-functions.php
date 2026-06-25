<?php

/**
 * Functions which enhance the theme by hooking into WordPress
 *
 * @package pictau_tw
 * @version 2.2.0;
 * @forked original project from:  https://underscoretw.com/
 * @author modified and adapted by: Pictau, @xenolito, oscar.rey.tajes@gmail.com
 *
 */

/*------------------------------------------------------------------------------------------------------*\
						//!WP MAIL FROM CUSTOMIZATION AND MAINTENANCE PAGE INFO
\*------------------------------------------------------------------------------------------------------*/
// Filters only run when values are explicitly saved in the Customizer.
add_action('init', function () {
	$site_name     = get_theme_mod('pictau_site_name', '');
	$contact_email = get_theme_mod('pictau_contact_email', '');

	if ($site_name !== '') {
		add_filter('wp_mail_from_name', function () use ($site_name) {
			return $site_name;
		});
	}

	if ($contact_email !== '') {
		add_filter('wp_mail_from', function () use ($contact_email) {
			return $contact_email;
		});
	}
});



/*------------------------------------------------------------------------------------------------------*
 // !PERMITIR LA SUBIDA DE ARCHIVOS .html A LA BIBLIOTECA DE MEDIOS !OJO CON ESTO
\*------------------------------------------------------------------------------------------------------*/
add_filter('upload_mimes', function ($mimes) {
	$mimes['html|htm'] = 'text/html';
	return $mimes;
});

/*------------------------------------------------------------------------------------------------------*
            //! DISABLE SERACH FEATURES
\*------------------------------------------------------------------------------------------------------*/
function disable_search_query($query, $error = true)
{
	if (is_admin()) {
		return;
	}

	if (isset($_GET['s']) && empty($_GET['s'])) {
		wp_redirect(home_url());
		exit;
	}

	if ($query->is_search()) {
		$query->is_search = false;
		$query->query_vars['s'] = false;
		$query->query['s'] = false;

		if ($error) {
			$query->is_404 = true;
		}
	}
}
add_action('parse_query', 'disable_search_query');
add_filter('get_search_form', '__return_null');




//! MEDIA CHANGES: DISABLE "Organize my files by month and year"
update_option('uploads_use_yearmonth_folders', 0);




//! FIX MEDIA IMAGE VIEWER @ BACKOFFICE
add_action('admin_head', 'my_custom_fonts');

function my_custom_fonts()
{
	echo '<style> .edit-attachment-frame .attachment-media-view .details-image { object-fit: contain; }</style>';
}


//! Default image size when inserted using a image block
function default_image_size_bloq($settings, $context)
{
	if (! empty($context->post) && 	'post' === $context->post->post_type) {
		$settings['imageDefaultSize'] = 'full';
	}
	return $settings;
}

add_filter('block_editor_settings_all', 'default_image_size_bloq', 10, 2);


/**
 * Add a pingback url auto-discovery header for single posts, pages, or attachments.
 */
function pictau_pingback_header()
{
	if (is_singular() && pings_open()) {
		printf('<link rel="pingback" href="%s">', esc_url(get_bloginfo('pingback_url')));
	}
}
add_action('wp_head', 'pictau_pingback_header');

/**
 * Changes comment form default fields.
 *
 * @param array $defaults The default comment form arguments.
 *
 * @return array Returns the modified fields.
 */
function pictau_comment_form_defaults($defaults)
{
	$comment_field = $defaults['comment_field'];

	// Adjust height of comment form.
	$defaults['comment_field'] = preg_replace('/rows="\d+"/', 'rows="5"', $comment_field);

	return $defaults;
}
add_filter('comment_form_defaults', 'pictau_comment_form_defaults');

//! DISABLE COMMENTS
add_action('admin_init', function () {
	// Redirect any user trying to access comments page
	global $pagenow;

	if ($pagenow === 'edit-comments.php') {
		wp_safe_redirect(admin_url());
		exit;
	}

	// Remove comments metabox from dashboard
	remove_meta_box('dashboard_recent_comments', 'dashboard', 'normal');

	// Disable support for comments and trackbacks in post types
	foreach (get_post_types() as $post_type) {
		if (post_type_supports($post_type, 'comments')) {
			remove_post_type_support($post_type, 'comments');
			remove_post_type_support($post_type, 'trackbacks');
		}
	}
});

// Close comments on the front-end
add_filter('comments_open', '__return_false', 20, 2);
add_filter('pings_open', '__return_false', 20, 2);

// Hide existing comments
add_filter('comments_array', '__return_empty_array', 10, 2);

// Remove comments page in menu
add_action('admin_menu', function () {
	remove_menu_page('edit-comments.php');
});

// Remove comments links from admin bar
add_action('init', function () {
	if (is_admin_bar_showing()) {
		remove_action('admin_bar_menu', 'wp_admin_bar_comments_menu', 60);
	}
});


/**
 * Filters the default archive titles.
 */
function pictau_get_the_archive_title()
{
	if (is_category()) {
		$title = single_term_title('', false);
	} elseif (is_tag()) {
		$title = __('Tag Archives: ', 'pictau') . '<span>' . single_term_title('', false) . '</span>';
	} elseif (is_author()) {
		$title = __('Author Archives: ', 'pictau') . '<span>' . get_the_author_meta('display_name') . '</span>';
	} elseif (is_year()) {
		$title = __('Yearly Archives: ', 'pictau') . '<span>' . get_the_date(_x('Y', 'yearly archives date format', 'pictau')) . '</span>';
	} elseif (is_month()) {
		$title = __('Monthly Archives: ', 'pictau') . '<span>' . get_the_date(_x('F Y', 'monthly archives date format', 'pictau')) . '</span>';
	} elseif (is_day()) {
		$title = __('Daily Archives: ', 'pictau') . '<span>' . get_the_date() . '</span>';
	} elseif (is_post_type_archive()) {
		$cpt   = get_post_type_object(get_queried_object()->name);
		$title = sprintf(
			/* translators: %s: Post type singular name */
			esc_html__('%s Archives', 'pictau'),
			$cpt->labels->singular_name
		);
	} elseif (is_tax()) {
		$tax   = get_taxonomy(get_queried_object()->taxonomy);
		$title = sprintf(
			/* translators: %s: Taxonomy singular name */
			esc_html__('%s Archives', 'pictau'),
			$tax->labels->singular_name
		);
	} else {
		$title = __('Archives:', 'pictau');
	}
	return $title;
}
add_filter('get_the_archive_title', 'pictau_get_the_archive_title');

/**
 * Determines whether the post thumbnail can be displayed.
 */
function pictau_can_show_post_thumbnail()
{
	return apply_filters('pictau_can_show_post_thumbnail', ! post_password_required() && ! is_attachment() && has_post_thumbnail());
}

/**
 * Returns the size for avatars used in the theme.
 */
function pictau_get_avatar_size()
{
	return 60;
}

/**
 * Create the continue reading link
 *
 * @param string $more_string The string shown within the more link.
 */
function pictau_continue_reading_link($more_string)
{

	if (! is_admin()) {
		$continue_reading = sprintf(
			/* translators: %s: Name of current post. */
			wp_kses(__('Continue reading %s', 'pictau'), array('span' => array('class' => array()))),
			the_title('<span class="sr-only">"', '"</span>', false)
		);

		$more_string = '<a href="' . esc_url(get_permalink()) . '">' . $continue_reading . '</a>';
	}

	return $more_string;
}

// Filter the excerpt more link.
add_filter('excerpt_more', 'pictau_continue_reading_link');

// Filter the content more link.
add_filter('the_content_more_link', 'pictau_continue_reading_link');

/**
 * Outputs a comment in the HTML5 format.
 *
 * This function overrides the default WordPress comment output in HTML5
 * format, adding the required class for Tailwind Typography. Based on the
 * `html5_comment()` function from WordPress core.
 *
 * @param WP_Comment $comment Comment to display.
 * @param array      $args    An array of arguments.
 * @param int        $depth   Depth of the current comment.
 */
function pictau_html5_comment($comment, $args, $depth)
{
	$tag = ('div' === $args['style']) ? 'div' : 'li';

	$commenter          = wp_get_current_commenter();
	$show_pending_links = ! empty($commenter['comment_author']);

	if ($commenter['comment_author_email']) {
		$moderation_note = __('Your comment is awaiting moderation.', 'pictau');
	} else {
		$moderation_note = __('Your comment is awaiting moderation. This is a preview; your comment will be visible after it has been approved.', 'pictau');
	}
?>
	<<?php echo esc_attr($tag); ?> id="comment-<?php comment_ID(); ?>" <?php comment_class($comment->has_children ? 'parent' : '', $comment); ?>>
		<article id="div-comment-<?php comment_ID(); ?>" class="comment-body">
			<footer class="comment-meta">
				<div class="comment-author vcard">
					<?php
					if (0 !== $args['avatar_size']) {
						echo get_avatar($comment, $args['avatar_size']);
					}
					?>
					<?php
					$comment_author = get_comment_author_link($comment);

					if ('0' === $comment->comment_approved && ! $show_pending_links) {
						$comment_author = get_comment_author($comment);
					}

					printf(
						/* translators: %s: Comment author link. */
						wp_kses_post(__('%s <span class="says">says:</span>', 'pictau')),
						sprintf('<b class="fn">%s</b>', wp_kses_post($comment_author))
					);
					?>
				</div><!-- .comment-author -->

				<div class="comment-metadata">
					<?php
					printf(
						'<a href="%s"><time datetime="%s">%s</time></a>',
						esc_url(get_comment_link($comment, $args)),
						esc_attr(get_comment_time('c')),
						esc_html(
							sprintf(
								/* translators: 1: Comment date, 2: Comment time. */
								__('%1$s at %2$s', 'pictau'),
								get_comment_date('', $comment),
								get_comment_time()
							)
						)
					);

					edit_comment_link(__('Edit', 'pictau'), ' <span class="edit-link">', '</span>');
					?>
				</div><!-- .comment-metadata -->

				<?php if ('0' === $comment->comment_approved) : ?>
					<em class="comment-awaiting-moderation"><?php echo esc_html($moderation_note); ?></em>
				<?php endif; ?>
			</footer><!-- .comment-meta -->

			<div <?php pictau_content_class('comment-content'); ?>>
				<?php comment_text(); ?>
			</div><!-- .comment-content -->

			<?php
			if ('1' === $comment->comment_approved || $show_pending_links) {
				comment_reply_link(
					array_merge(
						$args,
						array(
							'add_below' => 'div-comment',
							'depth'     => $depth,
							'max_depth' => $args['max_depth'],
							'before'    => '<div class="reply">',
							'after'     => '</div>',
						)
					)
				);
			}
			?>
		</article><!-- .comment-body -->
	<?php
}




// ! Customizer styling css
function PICTAU_custom_customize_enqueue()
{
	wp_enqueue_style('customizer-css', get_stylesheet_directory_uri() . '/customizer/customizer.css');
}
add_action('customize_controls_enqueue_scripts', 'PICTAU_custom_customize_enqueue');


//! walker for menu descriptions
/**
 * Create HTML list of nav menu items.
 * Replacement for the native Walker, using the description.
 *
 * @see    https://wordpress.stackexchange.com/q/14037/
 * @author fuxia
 */

if (!class_exists('Main_Nav_Walker')) {
	class Main_Nav_Walker extends Walker_Nav_Menu
	{
		/**
		 * Start the element output.
		 *
		 * @param  string 				$output	Passed by reference. Used to append additional content.
		 * @param  object 				$item		Menu item data object.
		 * @param  int 						$depth	Depth of menu item. May be used for padding.
		 * @param  array|object 	$args		Additional strings. Actually always an instance of stdClass. But this is WordPress.
		 * @return void
		 */

		//!  Next 2 funcs used to wrap submenu levels <ul> with an additional <div class="sub-menu-wrapper"> used for mobile css grid to show / hide submenus
		public function start_lvl(&$output, $depth = 1, $args = array())
		{
			$output .= "<div class=\"sub-menu-wrapper\"><ul class=\"sub-menu\">";
		}

		public function end_lvl(&$output, $depth = 1, $args = array())
		{
			$output .= "</ul></div>";
		}


		function start_el(&$output, $item, $depth = 0, $args = array(), $id = 0)
		{
			// $output .= '<h2>PINK</h2>';

			// Identify if menu item is a shortcode
			$has_shortcode = false;
			$item_tt = $item->post_title;

			$has_shortcode = (strpos($item_tt, '[') !== false && strpos($item_tt, ']') !== false) ? true : false;


			$classes = empty($item->classes) ? array() : (array) $item->classes;

			$class_names = join(' ', apply_filters('nav_menu_css_class', array_filter($classes), $item));

			if ($has_shortcode) {
				$class_names .= " menu-item-is-shortcode";
			}

			// Check if menu has children to add an svg icon...
			$submenuIcon = '';
			if (in_array('menu-item-has-children', $classes)) {
				$submenuIcon .= '<svg class="icon icon-tabler icon-tabler-chevron-right" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 6l6 6l-6 6" /></svg>';
			}

			! empty($class_names)
				and $class_names = ' class="' . esc_attr($class_names) . '"';

			$output .= "<li id='menu-item-" . $item->ID . "'" . $class_names . ">";



			$attributes  = '';


			! empty($item->attr_title)
				and $attributes .= ' title="'  . esc_attr($item->attr_title) . '"';
			! empty($item->target)
				and $attributes .= ' target="' . esc_attr($item->target) . '"';
			! empty($item->xfn)
				and $attributes .= ' rel="'    . esc_attr($item->xfn) . '"';
			! empty($item->url)
				and $attributes .= ' href="'   . esc_attr($item->url) . '"';


			// if ( $has_shortcode ) {
			// 	echo '--'. $item_tt . '--';
			// }

			$description = (! empty($item->description) and 0 == $depth)
				? '<small class="nav_desc">' . esc_attr($item->description) . '</small>' : '';


			$title = apply_filters('the_title', $item->title, $item->ID);


			$linkTagStart = ($item->url && $item->url !== '#') ? "<a $attributes>" : "<div class=\"menu-item-nolink\" $attributes>";
			$linkTagEnd = ($item->url && $item->url !== '#') ? "</a>" : '</div>';


			$item_output = $args->before
				. $linkTagStart
				. $args->link_before
				. $title
				. $submenuIcon
				. $linkTagEnd
				. $args->link_after
				. $description
				. $args->after;

			// Since $output is called by reference we don't need to return anything.
			$output .= apply_filters(
				'walker_nav_menu_start_el',
				$item_output,
				$item,
				$depth,
				$args
			);
		}
	}
}

// ! CUSTOMIZER

function customize_theme_pictau($wp_customize)
{
	// Add Panel
	$wp_customize->add_panel('PICTAU', array(
		'title' => __('THEME CUSTOMIZER', 'pictau'),
		// 'description'	=> '<div class="description-pictau-panel"><img src="https://www.pictau.com/xen_media//logo-login-pictau.png" /><p>Pictau panel description</p></div>',
		'priority'		=> '360'
	));

	// Site information — client name and contact email (used by mail filters and plugins)
	$wp_customize->add_section('pictau_site_info', array(
		'title'    => esc_html__('Site Information', 'pictau'),
		'panel'    => 'PICTAU',
		'priority' => 10,
	));

	$wp_customize->add_setting('pictau_site_name', array(
		'default'           => '',
		'sanitize_callback' => 'sanitize_text_field',
		'transport'         => 'refresh',
	));

	$wp_customize->add_control('pictau_site_name', array(
		'label'       => esc_html__('Client name (wp_mail_from_name)', 'pictau'),
		'description' => esc_html__('Used as the sender name in WordPress emails. Available via get_theme_mod(\'pictau_site_name\').', 'pictau'),
		'section'     => 'pictau_site_info',
		'type'        => 'text',
	));

	$wp_customize->add_setting('pictau_contact_email', array(
		'default'           => '',
		'sanitize_callback' => 'sanitize_email',
		'transport'         => 'refresh',
	));

	$wp_customize->add_control('pictau_contact_email', array(
		'label'       => esc_html__('Contact email (wp_mail_from)', 'pictau'),
		'description' => esc_html__('Used as the sender address in WordPress emails. Available via get_theme_mod(\'pictau_contact_email\').', 'pictau'),
		'section'     => 'pictau_site_info',
		'type'        => 'email',
	));


	// Add Header Behaviour Section
	$wp_customize->add_section('main_header_behavior', array(
		'title' => 'Header behaviour',
		'panel'	=> 'PICTAU'
	));

	$wp_customize->add_setting(
		'header_behavior',
		array('default' => 'fixed-header')
	);

	$wp_customize->add_control('header_behavior', array(
		'label'   	=> __('Header Behavior', 'pictau'),
		'section' 	=> 'main_header_behavior',
		'settings'	=> 'header_behavior',
		'type'    	=> 'select',
		'choices'		=> array(
			'fixed-header'		=> __('fixed', 'pictau'),
			'fixed-autohide-header' => __('fixed autohide', 'pictau'),
			'normal-header'	=> __('normal', 'pictau'),
		)
	));



	// Add Header Width Definition
	$wp_customize->add_section('main_header_width', array(
		'title' => 'Header Width',
		'panel'	=> 'PICTAU'
	));

	$wp_customize->add_setting(
		'header_width',
		array('default' => 'header-width-constrained')
	);

	$wp_customize->add_control('header_width', array(
		'label'   	=> __('Header Width', 'pictau'),
		'section' 	=> 'main_header_width',
		'settings'	=> 'header_width',
		'type'    	=> 'select',
		'choices'		=> array(
			'header-width-constrained'		=> __('Layout constrained', 'pictau'),
			'header-width-full' => __('Full width', 'pictau'),
			'header-width-centered' => __('Centered', 'pictau'),
		)
	));


	// Add Footer Section shortcode
	// TODO Autodetect multilanguage and offer other languages custom inputs
	$wp_customize->add_section('footer', array(
		'title' => 'Footer',
		'panel'	=> 'PICTAU'
	));

	// $default_lang = function_exists('pll_the_languages') ? pll_default_language('locale') : '';

	if (function_exists('pll_the_languages')) {
		/**
		 * @disregard P1009 Undefined type
		 */
		$languages = pll_languages_list(array(
			'fields'	=> 'locale'
		));

		foreach ($languages as $lang) {
			$setting_id = 'pictau_block_footer_' . $lang;

			$wp_customize->add_setting(
				$setting_id,
				array('default' => get_theme_mod($setting_id) ? get_theme_mod($setting_id) : '')
			);

			$wp_customize->add_control($setting_id, array(
				'label'   	=> __('Pictau Block shortcode Footer [' . $lang . ']', 'pictau'),
				'section' 	=> 'footer',
				'settings'	=> $setting_id,
				// 'description'	=> 'pictau block shortcode here...',
				'type'    	=> 'textarea',
				'input_attrs'	=> array(
					'style'	=> 'height: 2em; border: 1px solid black',
					'placeholder'	=> 'pictau block shortcode for [' . $lang . '] here...',
				),
			));
		}
	} else {

		$wp_customize->add_setting(
			'pictau_block_footer',
			array('default' => get_theme_mod('pictau_block_footer') ? get_theme_mod('pictau_block_footer') : '')
		);

		$wp_customize->add_control('pictau_block_footer', array(
			'label'   	=> __('Pictau Block shortcode Footer', 'pictau'),
			'section' 	=> 'footer',
			'settings'	=> 'pictau_block_footer',
			// 'description'	=> 'pictau block shortcode here...' . print_r(pll_languages_list()),
			'description'	=> 'pictau block shortcode here...',
			'placeholder'	=> 'hola',
			'type'    	=> 'textarea',
		));
	}

	// Add Catalog Section (only if product_category taxonomy exists)
	if ( taxonomy_exists( 'product_category' ) ) {
		$wp_customize->add_section( 'pictau_catalog', array(
			'title' => __( 'Catálogo', 'pictau' ),
			'panel' => 'PICTAU',
		) );

		$wp_customize->add_setting( 'catalog_swatches_limit', array(
			'default'           => 10,
			'sanitize_callback' => 'absint',
		) );

		$wp_customize->add_control( 'catalog_swatches_limit', array(
			'label'       => __( 'Máximo de swatches por card de producto', 'pictau' ),
			'description' => __( 'Si hay más variantes de color, se muestra un indicador "+N". Mínimo 1.', 'pictau' ),
			'section'     => 'pictau_catalog',
			'settings'    => 'catalog_swatches_limit',
			'type'        => 'number',
			'input_attrs' => array( 'min' => 1, 'max' => 30 ),
		) );
	}

	// Add Google Tag Manager Section (GTM)
	$wp_customize->add_section('google_tag_manager', array(
		'title' => 'Google Tag Manager (GTM)',
		'panel'	=> 'PICTAU'
	));

	$wp_customize->add_setting(
		'GTM_ID',
		array('default' => get_theme_mod('GTM_ID') ? get_theme_mod('GTM_ID') : '')
	);

	$wp_customize->add_control('GTM_ID', array(
		'label'   	=> __('GTM ID', 'pictau'),
		'section' 	=> 'google_tag_manager',
		'settings'	=> 'GTM_ID',
		'description'	=> 'Enter your Google Tag Manager ID here (e.g., GTM-XXXXXXX).<br><br>⚠️ This will load GTM script on all your pages!<br>If you are using a GDPR cookie consent plugin, make sure to configure it properly to avoid loading GTM before user consent (Use your cookie consent plugin to load GTM instead?).',
		'type'    	=> 'text',
	));
}

add_action('customize_register', 'customize_theme_pictau');


//! Add mobile meta "theme-color" to CUSTOMIZER
function color_customizer($wp_customize)
{
	$wp_customize->add_section('mobile_theme_color', array(
		'title' => 'Theme Color Mobile',
		'panel'	=> 'PICTAU',
		'description' => __('This color will be used for the mobile "theme-color" meta tag<br><strong>Note:</strong> This will only affect mobile browsers that support this feature.<br><br>If you\'re using Contact Form 7, this color will be used for the html email templates on the header and footer sections. 🙌', 'pictau'),
	));



	$wp_customize->add_setting(
		'colorThemeMobile',
		array(
			'default' => '#000000',
			'sanitize_callback' => 'sanitize_hex_color',
			// 'capability' => 'edit_theme_options'
		)
	);

	$wp_customize->add_control(
		new WP_Customize_Color_Control(
			$wp_customize,
			'colorThemeMobile',
			array(
				'label' => __('Color Section Title', 'pictau'),
				'section' => 'mobile_theme_color',
				'settings' => 'colorThemeMobile'
			)
		)
	);
}

add_action('customize_register', 'color_customizer');

//! CUSTOM FAVICON: Allows to use svg images as favicon without cropping
function favicon_customizer($wp_customize)
{
	// Add a section
	$wp_customize->add_section('favicon_customizer', array(
		'title'    => __('Favicon SVG ⚠️', 'pictau'),
		'priority' => 30,
		'panel'	=> 'PICTAU',
		'description' => __('This image will be used as favicon. It will be nice if you use "@media (prefers-color-scheme: dark)" to adjust the svg colors for dark mode.<br><hr>⚠️ <strong>Beware!</strong> Safari does not support SVG favicons. I you use this feature, make sure to upload a .png version with the same filename for Safari Browsers.<br><br>It is also a good practice to use a "favicon.ico" (32bit, transparent background) on the root of your WP folder for admin pages. <br><br>Check support at <a href="https://caniuse.com/link-icon-svg" target="_blank">https://caniuse.com/link-icon-svg</a>', 'pictau'),
	));

	// Add a setting to store the image URL
	$wp_customize->add_setting('favicon_svg', array(
		'default'           => '',
		'sanitize_callback' => 'esc_url_raw',
	));

	// Add the image control
	$wp_customize->add_control(new WP_Customize_Image_Control($wp_customize, 'favicon_svg', array(
		'label'    => __('Selecciona tu imagen', 'pictau'),
		'section'  => 'favicon_customizer',
		'settings' => 'favicon_svg',
	)));
}
add_action('customize_register', 'favicon_customizer');

function add_favicon_to_head()
{
	$favicon_svg = get_theme_mod('favicon_svg');
	$favicon_no_extension = set_url_scheme(preg_replace('/\.[^.]+$/', '', $favicon_svg), 'https');


	if ($favicon_svg) {
		// remove_action('wp_head', 'wp_site_icon', 99);
		// remove_action('admin_head', 'wp_site_icon', 99);

		echo '<link rel="icon" type="image/svg+xml" href="' . esc_url($favicon_no_extension) . '.svg">';
		echo '<link rel="icon" type="image/png" href="' . esc_url($favicon_no_extension) . '.png?v=3.1" sizes="32x32" />';
	}
}
add_action('wp_head', 'add_favicon_to_head');
// add_action( 'admin_head', 'add_favicon_to_head' );


function theme_color()
{
	$color = get_theme_mod('colorThemeMobile', 'transparent');
	if ($color) {
		echo '<meta name="theme-color" content="' . $color . '" />';
	}
}

add_action('wp_head', 'theme_color');




/*------------------------------------------------------------------------------------------------------*
//!print header behavior from customizer to body classes
\*------------------------------------------------------------------------------------------------------*/


function header_behavior_body_class($classes)
{
	$classes[] = get_theme_mod('header_behavior', 'fixed-header');
	return $classes;
}

add_filter('body_class', 'header_behavior_body_class');

/*------------------------------------------------------------------------------------------------------*
//!print header width from customizer to body classes
\*------------------------------------------------------------------------------------------------------*/


function header_width_body_class($classes)
{
	$classes[] = get_theme_mod('header_width', 'header-width-constrained');
	return $classes;
}

add_filter('body_class', 'header_width_body_class');


/*------------------------------------------------------------------------------------------------------*
//!print header default theme class
\*------------------------------------------------------------------------------------------------------*/


function body_default_theme_class($classes)
{
	$classes[] = 'theme-default';
	return $classes;
}

add_filter('body_class', 'body_default_theme_class');





//! Social icons

function pictau_social($atts)
{

	extract(shortcode_atts(array(), $atts));

	$output = '<div class="social-icons">';

	$output .= '<a class="social-item" href="#" aria-label="linkedin" target="_blank"><i class="pcticon-linkedin"></i></a>';
	$output .= '<a class="social-item" href="#" target="_blank"><i class="pcticon-twitter-x"></i></a>';
	$output .= '<a class="social-item" href="#" aria-label="facebook" target="_blank"><i class="pcticon-youtube"></i></a>';


	$output .= '</div>';


	// echo $output;
	return $output;
}

add_shortcode('social', 'pictau_social');



//! Copyright FOOTER inc. PICTAU logo

function pictau_copyright($atts)
{
	// ob_start();

	extract(shortcode_atts(array(), $atts));

	// Obtener ID del logo
	$custom_logo_id = get_theme_mod('custom_logo');

	// Obtener la URL del logo
	$logo_url = wp_get_attachment_image_url($custom_logo_id, 'full');
	// $logo_filename = basename($logo_url); //! restore this for default theme logo
	$logo_filename = 'logo_PDJIT.svg';



	$output = '	<div class="pct-copyright">
								<div class="company-logo">' . do_shortcode('[svg filename="' . $logo_filename . '"]') . '
								<p class="company-logo-copy">50 años al servicio de la construcción.<br>Lideres en prefabricados de hormigón.</p>
								</div>
								<div class="copy">
									<ul class="copy-contact">
											<li><a href="tel:+34980691938">+34 980 69 19 38</a></li>
											<li><a href="mailto:info@prefabricadosduero.com">info@prefabricadosduero.com</a></li>
									</ul>
									<ul>
										<li>© ' . apply_shortcodes('[myYear]') . ' ' . get_bloginfo('name') . '</li>
									</ul>
								</div>
							</div>';


	echo $output;
	return;
}

add_shortcode('pictau-copyright', 'pictau_copyright');



/*------------------------------------------------------------------------------------------------------*\

						//! SETTING PICTAU's CUSTOM SHORTCODES

\*------------------------------------------------------------------------------------------------------*/

//Shortcode API images
function myImageLink()
{
	return wp_upload_dir()['baseurl'];
}
add_shortcode('myPics', 'myImageLink');
// end shortcode images


//Shortcode API images
function myImageSRCsets($atts)
{

	extract(shortcode_atts(array(
		"id" 		=> '',
		"size"		=> 'full'
	), $atts));

	return wp_get_attachment_image($id, $size);
}
add_shortcode('myImg', 'myImageSRCsets');
// end shortcode images

// Show post featured image
function featured_image_b($atts)
{
	$atts = shortcode_atts(array(
		"id" 		=> '',
		"size"		=> 'full'
	), $atts);

	// Si el post tiene imagen destacada
	if (has_post_thumbnail()) {
		$image_html = get_the_post_thumbnail(null, $atts['size']);
		return '<figure>' . $image_html . '</figure>';
	}

	return '⛔️ No featured image found';
}
add_shortcode('featured-b-image', 'featured_image_b');

// Show post featured image
function featured_image($atts)
{
	$atts = shortcode_atts(array(
		"id" 		=> '',
		"size"		=> 'full'
	), $atts);

	// Si el post tiene imagen destacada
	if (has_post_thumbnail()) {
		return pictau_post_thumbnail('is-bg only-img');
	}

	return '⛔️ No featured image found';
}
add_shortcode('featured-image', 'featured_image');






//Shortcode API baseURL
function myBaseURL()
{
	return get_option('home');
}
add_shortcode('myBaseURL', 'myBaseURL');


//Shortcode API baseURL
function getThemeURL()
{
	return get_stylesheet_directory();
}

add_shortcode('myThemeURL', 'getThemeURL');


//shortcode for current year in footer

function myYearCredits()
{
	return date('Y');
}
add_shortcode('myYear', 'myYearCredits');

function currentDate($atts = [])
{
	extract(shortcode_atts(array(
		"format"	=> 'd-m-Y',
	), $atts));

	$currentDate = date_i18n($format);
	return $currentDate;
}
add_shortcode('current-date', 'currentDate');





function siteDomainURL()
{
	return site_url();
}

add_shortcode('siteURL', 'siteDomainURL');


//! PÁGINA DE LOGIN: CORREJIMOS LOGO Y LINKS */

function custom_login_logo()
{
	$custom_logo_id = get_theme_mod('custom_logo');
	$logo = wp_get_attachment_image_src($custom_logo_id, 'full');

	$brandLogoURL = has_custom_logo() ? esc_url($logo[0]) : 'https://www.pictau.com/xen_media/logoPictau@2x.png';

	echo '<style type="text/css">h1 a { background-image: url(' . $brandLogoURL . ') !important; background-size:contain !important; }</style>';
}
add_action('login_head', 'custom_login_logo');

function my_login_logo_url()
{
	return get_bloginfo('url');
}

add_filter('login_headerurl', 'my_login_logo_url');

function my_login_logo_url_title()
{
	return 'Powered by PICTAU';
}

add_filter('login_headertext', 'my_login_logo_url_title');

function my_custom_login()
{
	echo '<link rel="stylesheet" type="text/css" href="' . get_bloginfo('stylesheet_directory') . '/login-styles/custom-login-styles.css" />';
}

add_action('login_head', 'my_custom_login');


function login_checked_remember_me()
{
	add_filter('login_footer', 'rememberme_checked');
}
add_action('init', 'login_checked_remember_me');

function rememberme_checked()
{
	echo "<script>document.getElementById('rememberme').checked = true;</script>";
}


/*------------------------------------------------------------------------------------------------------*
//! REST API - FORCE REQUIRE AUTHENTICATION to expose the API
\*------------------------------------------------------------------------------------------------------*/
// Disable some endpoints for unauthenticated users
// add_filter( 'rest_endpoints', 'disable_default_endpoints' );
function disable_default_endpoints($endpoints)
{
	$endpoints_to_remove = array(
		'/oembed/1.0',
		// '/wp/v2',
		'/wp/v2/media',
		'/wp/v2/types',
		'/wp/v2/statuses',
		'/wp/v2/taxonomies',
		'/wp/v2/tags',
		'/wp/v2/users',
		'/wp/v2/comments',
		'/wp/v2/settings',
		'/wp/v2/themes',
		'/wp/v2/blocks',
		'/wp/v2/oembed',
		'/wp/v2/posts',
		'/wp/v2/pages',
		'/wp/v2/block-renderer',
		'/wp/v2/search',
		'/wp/v2/categories'
	);

	if (! is_user_logged_in()) {
		foreach ($endpoints_to_remove as $rem_endpoint) {
			// $base_endpoint = "/wp/v2/{$rem_endpoint}";
			foreach ($endpoints as $maybe_endpoint => $object) {
				if (stripos($maybe_endpoint, $rem_endpoint) !== false) {
					unset($endpoints[$maybe_endpoint]);
				}
			}
		}
	}
	return $endpoints;
}





/*------------------------------------------------------------------------------------------------------*
//!						FAVICON + DARK MODE
\*------------------------------------------------------------------------------------------------------*/

function favicon_theme()
{
	$media_url = wp_upload_dir()['baseurl'];

	?>
		<!-- <link rel="icon" href="<?php echo $media_url; ?>/favicon-mld.svg">
<link rel="mask-icon" href="<?php echo $media_url; ?>/favicon-mld.svg" color="#000000">
<link rel="apple-touch-icon" href="<?php echo $media_url; ?>/favicon512.png">
<link rel="manifest" href="<?php echo $media_url; ?>/site.webmanifest">
<meta name="theme-color" content="#ffffff"> -->
	<?php
}

// add_action('wp_head','favicon_theme');

// ! Add head's link rel preload for fonts located at [theme/fonts] dir...
function preload_fonts()
{
	$fontsDir = get_template_directory_uri() . '/fonts';

	foreach (glob(get_template_directory() . '/fonts/*') as $file) {
		echo '<link rel="preload" as="font" href="' . $fontsDir . '/' . basename($file) . '" crossorigin />';
	}
}

add_action('wp_head', 'preload_fonts', 2);




//! Enable shortcodes for menu navigation items (used on "navigation label")
if (!has_filter('wp_nav_menu', 'do_shortcode')) {
	add_filter('wp_nav_menu', 'shortcode_unautop');
	add_filter('wp_nav_menu', 'do_shortcode', 11);
}

// Remove empty <p> tags generated by wpautop around shortcode blocks in the_content
add_filter( 'the_content', function( $content ) {
	return preg_replace( '/<p>(\s|&nbsp;)*<\/p>/i', '', $content );
}, 20 );



/*------------------------------------------------------------------------------------------------------*\

						//!DISABLE EMOJIs

\*------------------------------------------------------------------------------------------------------*/
function disable_wp_emojicons()
{

	// all actions related to emojis
	remove_action('admin_print_styles', 'print_emoji_styles');
	remove_action('wp_head', 'print_emoji_detection_script', 7);
	remove_action('admin_print_scripts', 'print_emoji_detection_script');
	remove_action('wp_print_styles', 'print_emoji_styles');
	remove_filter('wp_mail', 'wp_staticize_emoji_for_email');
	remove_filter('the_content_feed', 'wp_staticize_emoji');
	remove_filter('comment_text_rss', 'wp_staticize_emoji');

	// filter to remove TinyMCE emojis
	add_filter('tiny_mce_plugins', 'disable_emojicons_tinymce');
}
add_action('init', 'disable_wp_emojicons');

function disable_emojicons_tinymce($plugins)
{
	if (is_array($plugins)) {
		return array_diff($plugins, array('wpemoji'));
	} else {
		return array();
	}
}




/*------------------------------------------------------------------------------------------------------*\

						//!WIDGET ARCHIVOS: CUSTOMIZED

\*------------------------------------------------------------------------------------------------------*/
// Function to get archives list with limited months
function wpb_limit_archives()
{

	$my_archives = wp_get_archives(array(
		'type' => 'monthly',
		'limit' => 6,
		'echo' => 0
	));

	return '<ul>' . $my_archives . '</ul>';
}

// Create a shortcode
add_shortcode('pct_wdgt_custom_archives', 'wpb_limit_archives');

// Enable shortcode execution in text widget
add_filter('widget_text', 'do_shortcode');






/*------------------------------------------------------------------------------------------------------*\

						//!RETRIEVE LOGGED IN USER ROLE

\*------------------------------------------------------------------------------------------------------*/

function get_user_role()
{
	if (is_user_logged_in()) {
		$user = wp_get_current_user();
		$role = (array) $user->roles;
		return $role[0];
	} else {
		return false;
	}
}



/*------------------------------------------------------------------------------------------------------*\

						//!ADD CLASS TO BODY (usr-ga-excluded) TO IDENTIFY USER ROLES (This will be used to exclude logged in admins, editors... anyone except subscriber or customer) TO BE EXCLUDED FROM  GA tracking)

\*------------------------------------------------------------------------------------------------------*/


add_filter('body_class', 'addUserRole_BodyClass');

function addUserRole_BodyClass($classes)
{
	$user_role = get_user_role();


	if ($user_role && $user_role !== 'subscriber' && $user_role !== 'customer') {
		$classes[] = 'usr-ga-excluded';
	}
	// return the $classes array
	return $classes;
}


/*------------------------------------------------------------------------------------------------------*
                        //!DISABLE AUTOUPDATE TRANSLATIONS
\*------------------------------------------------------------------------------------------------------*/

add_filter('auto_update_translation', '__return_false');
add_filter('async_update_translation', '__return_false');



/*------------------------------------------------------------------------------------------------------*
//!REMOVE jquery-migrate.js
\*------------------------------------------------------------------------------------------------------*/
function remove_jquery_migrate($scripts)
{

	if (! is_admin() && isset($scripts->registered['jquery'])) {

		$script = $scripts->registered['jquery'];

		if ($script->deps) {
			$script->deps = array_diff($script->deps, array('jquery-migrate'));
		}
	}
}
add_action('wp_default_scripts', 'remove_jquery_migrate');



//! Allow SVG Uplodas via MEDIA library
add_filter('wp_check_filetype_and_ext', function ($data, $file, $filename, $mimes) {

	global $wp_version;
	if ($wp_version !== '4.7.1') {
		return $data;
	}

	$filetype = wp_check_filetype($filename, $mimes);

	return [
		'ext'             => $filetype['ext'],
		'type'            => $filetype['type'],
		'proper_filename' => $data['proper_filename']
	];
}, 10, 4);

function cc_mime_types($mimes)
{
	$mimes['svg'] = 'image/svg+xml';
	$mimes['riv'] = 'application/octet-stream';
	return $mimes;
}
add_filter('upload_mimes', 'cc_mime_types');

function fix_svg()
{
	echo '<style type="text/css">
        .attachment-266x266, .thumbnail img {
             width: 100% !important;
             height: auto !important;
        }
        </style>';
}
add_action('admin_head', 'fix_svg');


//! INLINE SVG IMAGES
/**
 * Get an SVG file from the imgs/ folder in the theme, update its attributes if necessary and return it as a string.
 *
 * @author Aurooba Ahmed
 * @see https://aurooba.com/inline-svgs-in-your-wordpress-code-with-this-helper-function/
 *
 * @param string $filename The name of the SVG file to get.
 * @param array $attributes (optional) An array of attributes to add/modify to the SVG file.
 * @return string|null The SVG file as a string or an empty return if there was an error.
 */
function get_svg($filename, $attributes = array())
{
	static $svg_cache = [];

	$upload_path = wp_upload_dir()['path'];
	$cache_key   = $filename . serialize($attributes);

	if (isset($svg_cache[$cache_key])) {
		return $svg_cache[$cache_key];
	}

	// Get the SVG file.
	$svg = file_get_contents($upload_path . '/' . $filename);

	// If there was an error retrieving the SVG file, return a WP_Error object.
	if (! $svg) {
		return '<div style="margin: 1rem 1rem"><p style="display: inline-flex;padding: 2rem; background-color: #343434; color:white;"> ⛔️ file not found in the uploads dir:&nbsp;<u> ' . $filename . '</u></p></div>';
	}

	// Initialize the SVG tag processor.
	$update_svg = new WP_HTML_Tag_Processor($svg);
	$update_svg->next_tag('svg');

	// If there are attributes to add, add them.
	if (! empty($attributes)) {
		foreach ($attributes as $attribute => $value) {
			// If the attribute is 'class', add the class to the SVG file without overwriting the existing classes.
			if ('class' === $attribute) {
				$update_svg->add_class($value);
				continue;
			}
			// Otherwise, set/update the attribute with the new value
			$update_svg->set_attribute($attribute, $value);
		}
	}

	$stringSvg = $update_svg->get_updated_html();
	// remove any part of the string containing "<?xml ..... >"
	$pattern = '/<\?xml.*?\?>/';
	$sanitizedSvg = preg_replace($pattern, '', $stringSvg);

	$svg_cache[$cache_key] = $sanitizedSvg;
	return $sanitizedSvg;
}


function inline_svg($atts, $content)
{
	extract(shortcode_atts(array(
		"filename"	=> null,
		"class"			=> '',
		"width"			=> '',
		"height"		=> '',
		"figure"		=> false
	), $atts));

	if (!$filename) return;

	if ($figure) {
		// Si viene el atributo "figure" como true, entonces envolvemos el SVG en un <figure> con las clases indicadas
		$css_class = $class ? 'class="' .  esc_attr($class) . '"' : '';
		unset($atts['class']);
		$svg = get_svg($filename, $atts);

		return '<figure ' . $css_class . '>' . $svg . '</figure>';
	}

	$svg = get_svg($filename, $atts);
	return $svg;
}

add_shortcode('svg', 'inline_svg');


//! AUTOMATIC REPLACE svg sources for img blocks on page content


function wp_svg_inline_replacer($matches)
{
	$src = $matches[1];
	$parts = explode('/xen_media/', $src);

	// get the string after the last slash /
	$patternForSrc = '/\/([^\/]+)$/';

	preg_match($patternForSrc, $matches[1], $matches);

	$svg = get_svg($matches[1]);

	// Limpieza básica de seguridad
	$svg = preg_replace('/<script.*?<\/script>/is', '', $svg);
	$svg = preg_replace('/on\w+="[^"]*"/i', '', $svg);

	return $svg;
}

function wp_svg_inline_filter($content)
{
	// global $post;
	$pattern = '/<img[^>]*\bsrc="([^"]*\.svg)"[^>]*>/i';

	$content = preg_replace_callback($pattern, 'wp_svg_inline_replacer', $content);
	return $content;
}

add_filter('the_content', 'wp_svg_inline_filter');
add_filter('wp_nav_menu',  'wp_svg_inline_filter');


//! SITE LOGO — renders custom_logo inline if SVG, otherwise as <img>
function site_logo_shortcode($atts = [])
{
	$atts = shortcode_atts(array(
		'class'  => '',
		'width'  => '',
		'height' => '',
	), $atts);

	$logo_id = get_theme_mod('custom_logo');
	if (!$logo_id) return '';

	if (get_post_mime_type($logo_id) === 'image/svg+xml') {
		$file_path = get_attached_file($logo_id);
		$svg = $file_path ? file_get_contents($file_path) : false;
		if (!$svg) return '';

		$processor = new WP_HTML_Tag_Processor($svg);
		$processor->next_tag('svg');
		if ($atts['class'])  $processor->add_class($atts['class']);
		if ($atts['width'])  $processor->set_attribute('width', $atts['width']);
		if ($atts['height']) $processor->set_attribute('height', $atts['height']);

		return preg_replace('/<\?xml.*?\?>/s', '', $processor->get_updated_html());
	}

	return wp_get_attachment_image($logo_id, 'full', false, array(
		'class' => $atts['class'] ?: 'site-logo',
	));
}
add_shortcode('site-logo', 'site_logo_shortcode');


//!  CHECK IF REQUIRED PLUGIN IS INSTALLED AND ACTIVATED

function checkPluginActive($plugin_name)
{
	$plugin_active = in_array($plugin_name . '/' . $plugin_name . '.php', apply_filters('active_plugins', get_option('active_plugins')));
	return $plugin_active;
}


//! REMOVE THE "EDIT POST" LINK from pages when logged in...
function wpse_remove_edit_post_link($link)
{
	return '';
}
add_filter('edit_post_link', 'wpse_remove_edit_post_link');



function pct_options($atts)
{

	extract(shortcode_atts(array(), $atts));


	return get_option('large_size_w');
}

add_shortcode('options', 'pct_options');




//! Remove empty <a></a> tags for menu items when using shortcode as "title attributes" or "Etiqueta de navegación" and no 'URL' set
add_filter('wp_nav_menu_items', 'remove_a_tag_when_shortcode', 10, 2);
function remove_a_tag_when_shortcode($items, $args)
{
	// $mm = $args->menu;
	// $mm = 'xx';
	$pattern = '/<a>/';
	$outputString = preg_replace($pattern, '', $items);
	return $outputString;
}


//! Darkmode switcher for tailwindcss
function darkmode_switcher()
{
	$output = '';
	$output .= '<div class="dark-mode-switcher flex flex-col justify-center">
	<label class="relative cursor-pointer">
				<input type="checkbox" name="light-switch" class="light-switch sr-only" />
				<div class="icon-container">
					<svg class="dark:hidden light-theme-icon" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256">
						<rect width="256" height="256" fill="none"/>
						<circle cx="128" cy="128" r="56" opacity="0.3"/>
						<line x1="128" y1="40" x2="128" y2="32" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
						<circle cx="128" cy="128" r="56" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
						<line x1="64" y1="64" x2="56" y2="56" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
						<line x1="64" y1="192" x2="56" y2="200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
						<line x1="192" y1="64" x2="200" y2="56" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
						<line x1="192" y1="192" x2="200" y2="200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
						<line x1="40" y1="128" x2="32" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
						<line x1="128" y1="216" x2="128" y2="224" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
						<line x1="216" y1="128" x2="224" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
					</svg>
					<svg class="hidden dark:block dark-theme-icon" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256">
						<rect width="256" height="256" fill="none"/>
						<path d="M210.69,158.18A96.78,96.78,0,0,1,192,160,96.08,96.08,0,0,1,97.82,45.31,88,88,0,1,0,210.69,158.18Z" opacity="0.3"/>
						<line x1="208" y1="120" x2="208" y2="72" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
						<line x1="232" y1="96" x2="184" y2="96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
						<line x1="160" y1="32" x2="160" y2="64" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
						<line x1="176" y1="48" x2="144" y2="48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
						<path d="M210.69,158.18A96.78,96.78,0,0,1,192,160,96.08,96.08,0,0,1,97.82,45.31,88,88,0,1,0,210.69,158.18Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
					</svg>
				</div>
        <span class="sr-only">Switch to light / dark version</span>
    </label>
</div>';

	return $output;
}

add_shortcode('dark-switcher', 'darkmode_switcher');



//! CONDITIONAL LOAD JS BY SHORTCODE

/**
 * Register scripts.
 *
 * @link https://www.wpexplorer.com/load-scripts-shortcode/
 */
function my_register_scripts()
{
	// wp_register_script(
	// 	'anim-bg-canvas',
	// 	get_stylesheet_directory_uri() . '/js/animBg.js',
	// 	[],
	// 	'1.0.0',
	// 	true
	// );

	wp_register_script(
		'rive-player',
		get_stylesheet_directory_uri() . '/js/rivePlayer.js',
		[],
		'1.0.0',
		true
	);
}
add_action('wp_enqueue_scripts', 'my_register_scripts');


//! ANIMATED BACKGROUNDS CANVAS PIXI
function animated_bg_canvas($atts = [], $content = '')
{

	extract(shortcode_atts(array(
		"color" 		=> '#ff0000',
		"origin"		=> false,
		"speed"			=> false,
		"autopause"	=> 1
	), $atts));


	// Enqueue our script.
	wp_enqueue_script('anim-bg-canvas');

	$newOrigin = ($origin) ? explode(",", $origin) : false;
	$hasOrigin = $newOrigin ? ',\'origin\':{\'x\': \'' . $newOrigin[0] . '\', \'y\':\'' . $newOrigin[1] . '\'}' : '';
	$customSpeed = $speed ? ', \'speed\':' . $speed . ' ' : '';

	// Output shortcode.
	return '<canvas class="anim-bg" data-has_abg="{\'colors\': { \'a\' : \'' . $color . '\'}' . $hasOrigin . $customSpeed . ',\'autopause\':' . $autopause . '}"></canvas>';
}
// add_shortcode('anim-bg', 'animated_bg_canvas');


//! VIDEO AS BACKGROUND
function video_as_background($atts = [], $content = '')
{

	extract(shortcode_atts(array(
		"overlayopacity" 	=> false,
		"src"							=> false,
		"mobile"			=> false,
		"poster"					=> false,
		"noautoplay"				=> false,
		"webm"						=> false,
		"callback"				=> false,
		"align"						=> 'center'

	), $atts));

	$isAutoplay = $noautoplay ? '' : 'autoplay';
	$hasOverlayOpacity = $overlayopacity ? 'data-overlayopacity="' . $overlayopacity . '"' : '';

	$output = '<div data-video ' . $hasOverlayOpacity . '>';

	if (!$src) return '⛔️ No "src" attribute for video background shortcut';

	$videoList = explode(',', $src);

	$numVideos = count($videoList);

	$mediaQuery = ($mobile) ? 'media="(min-width: 769px)"' : '';

	// media="(min-width: 600px)"

	if (count($videoList) > 1) {
		$src = $videoList[array_rand($videoList)];
	}


	$output .= '<video class="video-bg" style="object-position: ' . $align . ';" ' . $isAutoplay . ' muted loop playsinline preload="metadata" poster="' . wp_upload_dir()['baseurl'] . '/' . $src . '.webp" aria-label="intro video">';
	$output .= '<source src="' . wp_upload_dir()['baseurl'] . '/' . $src . '.mp4" ' . $mediaQuery . ' type="video/mp4">';
	if ($mobile) {
		$output .= '<source src="' . wp_upload_dir()['baseurl'] . '/' . $src . $mobile . '.mp4" type="video/mp4">';
	}
	if ($webm) {
		$output .= '<source src="' . wp_upload_dir()['baseurl'] . '/' . $src . '.webm"  ' . $mediaQuery . ' type="video/webm">';
		$output .= '<source src="' . wp_upload_dir()['baseurl'] . '/' . $src . $mobile . '.webm" type="video/webm">';
	}

	$output .= '</video></div>';


	// Output shortcode.
	return $output;
}
add_shortcode('video-bg', 'video_as_background');


function preload_videos()
{
	global $post;


	if (has_shortcode($post->post_content, 'video-bg')) {
		$pattern = '/\[video-bg[^\]]*]/';

		preg_match_all($pattern, $post->post_content, $matches);

		foreach ($matches as $shortcodes) {
			$patternSrc = '/src="([^"]+)"/';

			foreach ($shortcodes as $video) {
				if (preg_match($patternSrc, $video, $matches)) {
					// Extract the content between quotes
					$result = $matches[1];
					// echo 'video to preload: ' . $result . ' <--';
					echo '<link rel="preload" as="video" href="' .  wp_upload_dir()['baseurl'] . '/' . $result . '.mp4">';
				}
			}
		}
	}
}

// add_action('wp_head', 'preload_videos');

//! HERO SLIDER: preload first image found in the first slide content for LCP optimization
function hero_slider_preload()
{
	global $post;
	if (!is_singular() || empty($post->post_content)) return;
	if (!has_shortcode($post->post_content, 'hero-slider')) return;
	if (!post_type_exists('slide')) return;

	$sc_atts   = [];
	$is_random = false;
	if (preg_match('/\[hero-slider\b([^\]]*)\]/i', $post->post_content, $sc_match)) {
		$sc_atts   = shortcode_parse_atts($sc_match[1] ?? '');
		$is_random = isset($sc_atts['random']) && ($sc_atts['random'] === 'yes' || $sc_atts['random'] === '1');
	}

	$limit     = isset($sc_atts['limit']) ? intval($sc_atts['limit']) : -1;
	$category  = isset($sc_atts['category']) ? sanitize_text_field($sc_atts['category']) : '';
	$curr_lang = function_exists('pll_current_language') ? pll_current_language() : 'es';

	// When random=yes: preload all slide images (order unknown, one will be LCP)
	// When random=no: preload only the first slide with fetchpriority="high"
	$query_args = [
		'post_type'      => 'slide',
		'posts_per_page' => $is_random ? $limit : 1,
		'no_found_rows'  => true,
		'lang'           => $curr_lang,
	];
	if (!$is_random) {
		$query_args['meta_key'] = 'orden';
		$query_args['orderby']  = 'meta_value_num';
		$query_args['order']    = 'ASC';
	}
	if ($category) {
		$query_args['tax_query'] = [ [
			'taxonomy' => 'slide_category',
			'field'    => 'slug',
			'terms'    => $category,
		] ];
	}

	$query = new WP_Query($query_args);
	if (!$query->have_posts()) return;

	while ($query->have_posts()) {
		$query->the_post();
		$slide_content = get_the_content();
		if (!preg_match('/<img[^>]+src=["\']([^"\']+)["\'][^>]*/i', $slide_content, $matches)) continue;
		$img_src = $matches[1];
		if (!$img_src) continue;
		$priority = $is_random ? '' : ' fetchpriority="high"';
		echo '<link rel="preload" as="image" href="' . esc_url($img_src) . '"' . $priority . '>';
	}
	wp_reset_postdata();
}
add_action('wp_head', 'hero_slider_preload', 2);

//! IMAGE RANDOM: preload image(s) in <head> for LCP optimization
function image_random_preload()
{
	global $post;
	if (!is_singular() || empty($post->post_content)) return;
	if (!has_shortcode($post->post_content, 'image-random')) return;

	if (!preg_match('/\[image-random\b([^\]]*)\]/i', $post->post_content, $sc_match)) return;

	$sc_atts = shortcode_parse_atts($sc_match[1] ?? '');
	$src_raw = isset($sc_atts['src']) ? $sc_atts['src'] : '';
	if (empty($src_raw)) return;

	$images = array_values(array_filter(array_map('trim', explode(',', $src_raw))));
	if (empty($images)) return;

	$is_random = !isset($sc_atts['random']) || !in_array($sc_atts['random'], ['no', '0', 'false'], true);
	$base_url  = wp_upload_dir()['baseurl'];

	if (!$is_random || count($images) === 1) {
		echo '<link rel="preload" as="image" href="' . esc_url($base_url . '/' . ltrim($images[0], '/')) . '" fetchpriority="high">';
	} else {
		foreach ($images as $image) {
			echo '<link rel="preload" as="image" href="' . esc_url($base_url . '/' . ltrim($image, '/')) . '">';
		}
	}
}
add_action('wp_head', 'image_random_preload', 2);

//! IMAGE RANDOM SHORTCODE
function image_random_shortcode($atts = [], $content = '')
{
	$atts = shortcode_atts([
		'src'    => '',
		'random' => 'yes',
		'class'  => '',
		'width'  => '',
		'height' => '',
	], $atts);

	if (empty($atts['src'])) return '';

	$images = array_values(array_filter(array_map('trim', explode(',', $atts['src']))));
	if (empty($images)) return '';

	$random      = !in_array($atts['random'], ['no', '0', 'false'], true);
	$base_url    = wp_upload_dir()['baseurl'];
	$class_attr  = !empty($atts['class']) ? ' class="' . esc_attr($atts['class']) . '"' : '';
	$width_attr  = !empty($atts['width'])  ? ' width="'  . absint($atts['width'])  . '"' : '';
	$height_attr = !empty($atts['height']) ? ' height="' . absint($atts['height']) . '"' : '';
	$first_url   = esc_url($base_url . '/' . ltrim($images[0], '/'));

	$output  = '<figure' . $class_attr . '>';
	$output .= '<img src="' . $first_url . '" loading="eager" fetchpriority="high"' . $width_attr . $height_attr . ' alt="">';
	$output .= '</figure>';

	if ($random && count($images) > 1) {
		$all_urls = array_map(function ($img) use ($base_url) {
			return $base_url . '/' . ltrim($img, '/');
		}, $images);

		$output .= '<script>(function(){';
		$output .= 'var i=document.currentScript.previousElementSibling.querySelector(\'img\');';
		$output .= 'if(!i)return;';
		$output .= 'var s=' . wp_json_encode($all_urls) . ';';
		$output .= 'i.src=s[Math.floor(Math.random()*s.length)];';
		$output .= '})();</script>';
	}

	return $output;
}
add_shortcode('image-random', 'image_random_shortcode');

//! POLYLANG UTILS: get the provided slug for the current language
function getLocalizedSlug($slug)
{
	if (function_exists('pll_the_languages')) {
		/**
		 * @disregard P1009 Undefined type
		 */

		$localizedSlug = get_the_permalink(pll_get_post(get_page_by_path($slug)->ID));
		return $localizedSlug;
	}
	return '';
}

//! LANGUAGE SWITCHER
function pl_get_current_lang()
{
	if (function_exists('pll_current_language')) {
		return pll_current_language();
	}
	return null;
}

function get_lang_flag_src($lang)
{

	return wp_upload_dir()['baseurl'] . '/flag-' . $lang . '.svg';


	if (function_exists('pll_the_languages')) {
		$languages = pll_the_languages(array('raw' => 1));
		foreach ($languages as $key => $value) {
			if ($value['slug'] === $lang) {
				return $value['flag'];
			}
		}
		// return '🇪🇸';
	}
}

function language_switcher($atts = [], $content = '')
{

	extract(shortcode_atts(array(
		"flag" 	=> false,
		"ui"		=> false // < false | horizontal | vertical (default === false) >
	), $atts));

	$isHorizontal = ($ui === 'horizontal') ? 'horizontal' : '';

	$output = '<div class="lang-switcher ' . $isHorizontal . '">';

	if (function_exists('pll_the_languages')) {

		// $output .= '<div class="current-lang">'. pl_get_current_lang() . ' --- <img width="30" height="30" src="' . get_lang_flag_src(pl_get_current_lang()) . '" /></div>';

		$output .= '<div class="current-lang"><img class="lang-flag" width="30" height="30" alt="flag-' . pl_get_current_lang() . '" src="' . get_lang_flag_src(pl_get_current_lang()) . '" />';

		if ($isHorizontal) {
			$output .= '<svg class="icon icon-tabler icon-tabler-chevron-right" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M9 6l6 6l-6 6"></path></svg>';
		}

		$output .= '</div>';

		// $output .= '<label class="relative">';
		// $output .= '	<input type="checkbox" name="lang-switch" class="lang-switch sr-only">';
		// $output .= '	<div class="switcher-container">';
		// $output .= '		<span class="switch-head"></span>';
		// $output .= '		<div class="lang-list">';

		$languages = pll_the_languages(array('raw' => 1));

		$numItems = count($languages);
		$i = 0;

		if ($numItems > 1) {
			$output .= '<div class="lang-list"><ul>';

			foreach ($languages as $key => $value) {
				// $current_lang = $value['current_lang'] ? 'current' : '';
				$current_lang = $value['current_lang'] ? true : false;

				// print_r($value);

				if (! $current_lang) {
					$output .= '<li class="lang-item lang-code-' . $value['slug'] . '">';
					$output .= '	<a  href="' . $value['url'] . '">';
					$output .= '		<img class="lang-flag" width="30" height="30" alt="flag-' . $value['name'] . '" src="' . get_lang_flag_src($value['slug']) . '" />';
					$output .= '		<div class="lang-name">' . $value['name'] . '</div>';
					// $output .= ' (' . $value['slug'] . ')';
					$output .= '	</a>';
					$output .= '</li>';
				}
			}

			$output .= '</ul></div>';
		}




		// $output .= '		</div>';
		// $output .= '	</div>';
		// $output .= '<span class="sr-only">Switch language to ES / EN</span>';
		// $output .= '</label>';

	}

	$output .= '</div>';
	// Output shortcode.
	return $output;
}
add_shortcode('lang-switcher', 'language_switcher');


//! UTILITY: function that extracts width and height values from an <img> tag string
function extractWidthHeight($str)
{
	$result = [];

	// Regular expression to match the width attribute
	if (preg_match('/width="(\d+)"/', $str, $widthMatch)) {
		$result['width'] = $widthMatch[1];
	}

	// Regular expression to match the height attribute
	if (preg_match('/height="(\d+)"/', $str, $heightMatch)) {
		$result['height'] = $heightMatch[1];
	}

	return $result;
}


//! INLINE SVG WHEN TAG "<img>" found with attribute "src" containing any reference to a .svg source. Depends on "wp_svg_inline_filter()" function.
function img_to_svg($atts = [], $content = '')
{

	extract(shortcode_atts(array(
		"limit" 	=> 0,
	), $atts));

	return wp_svg_inline_filter($content);
}
add_shortcode('svg-inline', 'img_to_svg');


//! REGISTER TRANSLATABLE STRING @POLYLANG FOR TRANSLATION

add_action('init', function () {
	if (function_exists('pll_the_languages')) {
		/**
		 * @disregard P1009 Undefined type
		 */
		pll_register_string('button_info', 'Solicita información');
	}
});


//! Categories filter UI
function category_ui_filter($atts = [], $content = '')
{

	extract(shortcode_atts(array(
		"id"	=> ''
	), $atts));

	$output = '<div class="cat-filter"><div class="cat-filter--grid">';

	// $categories = get_the_terms(get_the_ID(), 'category');

	$args = array(
		'post_status' => array('publish', 'private')
	);

	$categories = get_categories($args);

	if (!$categories) return;

	$current_cat = get_category(get_query_var('cat'));
	$current_cat_name = property_exists($current_cat, 'name') ? $current_cat->name : false;

	//loop through categories
	foreach ($categories as $category) {
		//get variables
		$slug   = $category->slug;
		// $link   = get_term_link($category->term_id);
		$link   = get_category_link($category->term_id);
		$descr  = $category->description;
		$name   = $category->name;
		$is_current_cat = ($name === $current_cat_name) ? 'current' : '';

		//echo your content
		$output .= '<a class="cat-filter-item bt-link ' . $is_current_cat  . '" href="' . $link . '">' . $name . '</a>';
	}

	$output .= '</div></div>';

	return $output;
}
add_shortcode('category-ui', 'category_ui_filter');


//! Utility: Formated date used by Pods field Date, used for Event CPT.
function getFormattedFecha($date)
{

	$fecha = date($date);
	$dia = date('d', strtotime($fecha));
	$mes = date('F', strtotime($fecha));
	$ano = date('Y', strtotime($fecha));
	$hora = date('G', strtotime($fecha));
	$minutos = date('i', strtotime($fecha));
	$minutos_nonzero = intval($minutos) === 0 ? '' : ':' . intval($minutos);

	$resFecha = array(
		"dia"	=> $dia,
		"mes"	=> $mes,
		"ano"	=> $ano,
		"hora"	=> $hora,
		"minutos"	=> $minutos_nonzero
	);

	return $resFecha;
}


//! GET PICTAU BLOCKS CPT ID by TITLE (so we can use it with do_shortcode('[pictau_blocks id="<>"]'))
function get_pictau_blocks_ID_by_title($title)
{

	$page = get_posts(
		array(
			// 'name'      => 'footer', // by post slug
			'title'      => $title, // by post title
			'post_type' => 'pictau_blocks', // post type of your preference
			'lang'       => '', // disable Polylang language filter so we always find the post
		)
	);
	// First/lowest ID taken if many objects
	if ($page && $page = $page[0]) return $page->ID;
	return null;
}



//! GET PICTAU BLOCKS CPT by TITLE
function pictau_block_cpt_id_by_title($atts = [], $content = '')
{

	$atts = shortcode_atts(array(
		"title"	=> null,
		"mostrar"	=> "si"
	), $atts);
	$title = $atts['title'];
	$mostrar = $atts['mostrar'];

	$output = '';

	if ($mostrar && $mostrar !== 'no') {
		$content_id = get_pictau_blocks_ID_by_title($title);

		if ($content_id) {
			// If Polylang is active, swap to the translated version (falls back to original if no translation)
			if (function_exists('pll_current_language')) {
				$translated_id = pll_get_post($content_id, pll_current_language());
				if ($translated_id) {
					$content_id = $translated_id;
				}
			}
			$output .= do_shortcode('[pictau-blocks id="' . $content_id . '"]');
		}
	}

	return $output;
}
add_shortcode('pct-cpt-block', 'pictau_block_cpt_id_by_title');

//! RIVE PLAYER RUNTIME
function rive_runtime($atts = [], $content = '')
{

	extract(shortcode_atts(array(
		"src"		=> null,
		"font"	=> 'inter2.ttf',
		"i18n"	=> false
	), $atts));

	// Enqueue our script.
	wp_enqueue_script('rive-player');

	$fontUrl = ($font) ? 'data-rivefont="' . get_stylesheet_directory_uri() . '/assets/' . $font . '"' : null;
	$i18nData = ($i18n) ? 'data-rivei18n="' . $i18n . '"' : null;
	// $fontUrl = ($font) ? 'data-rivefont="' . $font . '"' : null;



	return '<canvas data-rive="' . $src . '" ' . $fontUrl . $i18nData . ' ></canvas>';
}
add_shortcode('rive', 'rive_runtime');







//! LIMIT POSTS EXCERPT AND ADD CUSTOM ELLIPSIS
function get_excerpt($count = 380)
{
	global $post;
	$permalink = get_permalink($post->ID);
	$has_custom_excerpt = ($post->post_excerpt) ? true : false;
	// If custom excerpt is present, then use it before the post content istself...
	$excerpt = ($has_custom_excerpt) ? get_the_excerpt() : get_the_content();

	$excerpt = strip_tags($excerpt);

	if (!$has_custom_excerpt) {
		$excerpt = substr($excerpt, 0, $count);
		$excerpt = substr($excerpt, 0, strripos($excerpt, " "));
		$excerpt = $excerpt . '...';
	}

	return '<p>' . $excerpt . '</p>';
}


//! CUSTOMIZE PAGINATION LINKS ON ARCHIVE PAGES
function wpdocs_get_paginated_links($query)
{
	// When we're on page 1, 'paged' is 0, but we're counting from 1,
	// so we're using max() to get 1 instead of 0
	$currentPage = max(1, get_query_var('paged', 1));

	// This creates an array with all available page numbers, if there
	// is only *one* page, max_num_pages will return 0, so here we also
	// use the max() function to make sure we'll always get 1
	$pages = range(1, max(1, $query->max_num_pages));

	// Now, map over $pages and return the page number, the url to that
	// page and a boolean indicating whether that number is the current page
	return array_map(function ($page) use ($currentPage) {
		return (object) array(
			"isCurrent" => $page == $currentPage,
			"page" => $page,
			"url" => get_pagenum_link($page)
		);
	}, $pages);
}


//! HIDE FROM THE FRONTEND ALL POSTS THAT ARE NOT PUBLISHED
function ocultar_todas_las_entradas_privadas($query)
{

	// Aseguramos que solo afecta al frontend y a la query principal
	if (is_admin() || ! $query->is_main_query()) {
		return;
	}
	// ⚠️ Si es una previsualización (draft o private), NO TOCAR post_status
	if (is_preview()) {
		return;
	}
	// ⚠️ Si es singular y el usuario puede ver el post (por ejemplo privado propio), NO tocar
	if (is_singular()) {
		return;
	}
	// Ocultar privadas del frontend normal
	$query->set('post_status', 'publish');
}
add_action('pre_get_posts', 'ocultar_todas_las_entradas_privadas');



function posts_navigation()
{
	global $wp_query;

	$paginatedLinks = wpdocs_get_paginated_links($wp_query);

	$output = '<nav class="navigation pagination">';
	$output .= '	<div class="nav-links">';

	foreach ($paginatedLinks as $link) :
		$current = $link->isCurrent;
		$isCurrent = $current ? 'current' : '';



		if ($link->isCurrent):
			$output .= '<div class="nav-item ' . $isCurrent . '">';
			$output .= '	<div class="item-content">' . $link->page . '</div>';
			$output .= '</div>';

		else :
			$output .= '<a class="nav-item bt-link" href="' . $link->url  . '">';
			$output .= '	<div class="item-content">';
			$output .= 			$link->page;
			$output .= '	</div>';
			$output .= '</a>';
		endif;



	endforeach;

	$output .= '</a>';
	$output .= '	</nav>';

	return $output;
}


//! CHANGE ARCHIVE POSTS PERPAGE

add_filter('pre_get_posts', 'custom_change_posts_per_page');
/**
 * Change Posts Per Page for Archive pages (can be set for specific custom post types)
 *
 * @param object $query data
 *
 */
function custom_change_posts_per_page($query)
{


	if (!is_admin() && $query->is_main_query()) {
		$query->set('posts_per_page', '9');
	}

	if ($query->is_post_type_archive('ebook') && ! is_admin() && $query->is_main_query()) {
		$query->set('posts_per_page', '10');
	}

	return $query;
}

//! AMBIENTE ARCHIVE — ORDER BY "orden" (nulls al final)

add_action( 'pre_get_posts', function ( $query ) {
	if ( is_admin() || ! $query->is_main_query() || ! $query->is_post_type_archive( 'ambiente' ) ) {
		return;
	}
	$query->set( '_pictau_ambiente_orden', 'ASC' );
	$query->set( 'orderby', 'none' );
} );

add_filter( 'posts_clauses', function ( $clauses, $query ) {
	if ( ! $query->get( '_pictau_ambiente_orden' ) ) {
		return $clauses;
	}
	global $wpdb;
	$clauses['join'] .= " LEFT JOIN {$wpdb->postmeta} AS pictau_amb_orden"
		. " ON ( {$wpdb->posts}.ID = pictau_amb_orden.post_id"
		. " AND pictau_amb_orden.meta_key = 'orden' )";
	$clauses['orderby'] = "CASE WHEN pictau_amb_orden.meta_value IS NULL"
		. " OR pictau_amb_orden.meta_value = '' THEN 1 ELSE 0 END ASC,"
		. " CAST( pictau_amb_orden.meta_value AS SIGNED ) ASC,"
		. " {$wpdb->posts}.post_title ASC";
	return $clauses;
}, 10, 2 );


//! READING TIME FOR POSTS
function reading_time($content)
{
	$word_count = str_word_count(strip_tags($content ?? ''));
	$time_to_read = ceil($word_count / 200);
	$icon = '<svg width="26" height="26" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"/><circle cx="128" cy="128" r="88" opacity="0.15" fill="currentColor"/><polyline points="128 80 128 128 168 152" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/><polyline points="184 104 224 104 224 64" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/><path d="M188.4,192a88,88,0,1,1,1.83-126.23C202,77.69,211.72,88.93,224,104" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/></svg>';
	return '<div class="reading-time">' . $icon . $time_to_read . ' ' . __('minutes', 'pictau') . '</div>';
}



//! CUSTOM CONTACT FORM 7 TAG / INPUT --> used for paywall pdf for e-book download (CPT ebook)

add_action('wpcf7_init', 'custom_add_form_tag_paywall_pdf');

function custom_add_form_tag_paywall_pdf()
{
	wpcf7_add_form_tag('paywallpdf', 'custom_paywallpdf_form_tag_handler'); // "paywallpdf" is the type of the form-tag
}

function custom_paywallpdf_form_tag_handler($tag)
{
	$post_type = get_post_type();
	$pods = pods($post_type, get_the_id());
	$pdf_url = $pods->field('ebook_pdf._src');
	if (isset($pdf_url)) {
		return $pdf_url;
	} else {
		return '#';
	}
}



//!  AVOID WP CHANGING BLOCKQUOTES (DOUBLE QUOTES) TO << / >> QUOTES in Spanish. THIS IS A BUG IN WP
add_filter('no_texturize_tags', 'my_no_texturzie_tags');
function my_no_texturzie_tags($tags)
{
	$tags[] = 'p';
	$tags[] = 'q';
	$tags[] = 'blockquote';
	$tags[] = 'h1';
	$tags[] = 'h2';
	$tags[] = 'h3';
	return $tags;
}


//! CONTACT FORM 7 REMOVE AUTO P TAGS
// add_filter('wpcf7_autop_or_not', '__return_false');





//! BROWSER LANGUAGE REDIRECTION ON MULTILINGUAL SITE
// function redirect_based_on_browser_language() {
//     $user_language = substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2);
//     $supported_languages = array('en','fr', 'es-co'); // Add your supported languages here

// 		echo '<h1>'. $user_language . '</h1>';


//     if (in_array($user_language, $supported_languages)) {
//         $language_code = $user_language;
// 				$redirect_url = home_url('/' . $language_code . '/');
// 				wp_redirect($redirect_url);
// 				exit;
//     }

// 		return;

// }
// add_action('template_redirect', 'redirect_based_on_browser_language');





//! Copiar campos de archivo/imagen/video de Pods al duplicar con Yoast Duplicate Post.
add_action('dp_duplicate_post', function ($new_post_id, $post) {
	if (!function_exists('pods') || !class_exists('PodsAPI')) {
		return; // Pods no disponible
	}

	$original_id = $post->ID;
	$post_type   = get_post_type($original_id);

	// Cargamos la definición del Pod para conocer sus campos
	$api = pods_api();
	$pod_def = $api->load_pod(['name' => $post_type]);
	if (empty($pod_def) || empty($pod_def['fields'])) {
		return; // No es un Pod o no hay campos definidos
	}

	// Instancias Pods del original y del nuevo
	$pod_old = pods($post_type, $original_id);
	$pod_new = pods($post_type, $new_post_id);

	if (!$pod_old || !$pod_new) {
		return;
	}

	// Tipos de campo Pods que queremos copiar explícitamente
	$file_like_types = ['file', 'image', 'video', 'avatar', 'media'];

	$updates = [];

	foreach ($pod_def['fields'] as $field_name => $field_def) {
		if (!in_array($field_def['type'], $file_like_types, true)) {
			continue;
		}

		// Obtenemos el valor "raw" del original
		$val = $pod_old->field($field_name, true);

		// Normalizamos a array de IDs (Pods puede devolver arrays de arrays)
		if (is_array($val)) {
			$ids = [];
			foreach ($val as $item) {
				if (is_array($item) && isset($item['ID'])) {
					$ids[] = (int) $item['ID'];
				} elseif (is_numeric($item)) {
					$ids[] = (int) $item;
				}
			}
			$val = $ids;
		}

		// Si es vacío, evitamos sobrescribir valores por accidente
		if (!empty($val)) {
			$updates[$field_name] = $val;
		}
	}

	if (!empty($updates)) {
		// Guardamos todos los file/image/video fields en el post duplicado
		$pod_new->save($updates);
	}
}, 10, 2);

// (Opcional) Asegurar que Yoast no filtra metadatos de Pods
add_filter('duplicate_post_should_copy_meta', function ($should_copy, $meta_key) {
	// Fuerza copiar metadatos relacionados con Pods si aparecieran como postmeta
	if (strpos($meta_key, 'pods_') === 0 || strpos($meta_key, '_pods_') === 0) {
		return true;
	}
	return $should_copy;
}, 10, 2);




//! Oculta automáticamente en Yoast SEO todos los CPT sin archive (has_archive = false)

// 1) Evita que Yoast genere el enlace de archivo para CPT sin archive
add_filter('wpseo_sitemap_post_type_archive_link', function ($link, $post_type) {
	$obj = get_post_type_object($post_type);
	if (!$obj) return $link;

	if (empty($obj->has_archive)) {
		return false; // No mostrar enlace de archivo
	}

	return $link;
}, 10, 2);

// 2) Elimina del sitemap_index.xml los bloques de CPT sin archive
add_filter('wpseo_sitemap_index', function ($sitemap_index) {
	$cpts = get_post_types(['public' => true, '_builtin' => false], 'objects');

	foreach ($cpts as $pt => $obj) {
		if (empty($obj->has_archive)) {
			$pattern = '#<sitemap>.*?' . preg_quote($pt . '-sitemap.xml', '#') . '.*?</sitemap>#is';
			$sitemap_index = preg_replace($pattern, '', $sitemap_index);
		}
	}

	return $sitemap_index;
});

// 3) Evita que Yoast genere el sitemap de posts individuales de CPT sin archive
add_filter('wpseo_sitemap_entries_per_page', function ($n, $post_type = null) {
	// Algunas versiones de Yoast solo pasan $n
	if (!$post_type) {
		return $n;
	}

	$obj = get_post_type_object($post_type);
	if ($obj && empty($obj->has_archive)) {
		// No generar sitemap para este CPT
		return 0;
	}

	return $n;
}, 10, 2);






/**
 * !Functions which enhance the theme by hooking into WordPress.
 */
require get_template_directory() . '/inc/utilities.php';

//! Sepeculative loading in WP 6.8+ --> disable
// add_filter( 'wp_speculation_rules_configuration', '__return_null' );


// When a category is deleted, remove stale _categoria_principal meta from its posts.
add_action('deleted_term', function ($term_id, $tt_id, $taxonomy) {
	if ($taxonomy !== 'category') {
		return;
	}
	$post_ids = get_posts(array(
		'post_type'   => 'post',
		'numberposts' => -1,
		'fields'      => 'ids',
		'meta_query'  => array(
			array(
				'key'   => '_categoria_principal',
				'value' => $term_id,
			),
		),
	));
	foreach ($post_ids as $post_id) {
		delete_post_meta($post_id, '_categoria_principal');
	}
}, 10, 3);


require get_template_directory() . '/inc/catalog.php';
