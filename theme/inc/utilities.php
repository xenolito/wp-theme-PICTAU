<?php

/**
 * Utility Functions, usually unique for this customer/project
 *
 * @package pictau_tw
 */


//! CPTs by CATEGORY'  --> MEGAMNEU DESKTOP
function show_cpt_by_cat($atts = [], $content = '')
{

	extract(shortcode_atts(array(
		"limit"	=> 0,
		"cat"		=> false,
		"cpt"		=> false,
		"no_description"	=> false, // If true, will show the description of the category
	), $atts));


	if (!$cpt) return '⛔️ You must pass the CPT name on the shortcode: cpt="cpt name"';
	if (!$cat) return '⛔️ You must pass the CPT\'s Catergory name on the shortcode: cat="cpt category name"';

	$terms = get_terms([
		'taxonomy'	=> $cat,
		'hide_empty' => false, // o true
	]);

	// Ordenar manualmente por el campo 'orden' (meta personalizado)
	usort($terms, function ($a, $b) {
		$orden_a = (int) get_term_meta($a->term_id, 'orden', true);
		$orden_b = (int) get_term_meta($b->term_id, 'orden', true);
		return $orden_a <=> $orden_b;
	});


	$output = '';
	$catCount = 0;

	$output .= '<div class="mega-menu-container category-groups">';


	foreach ($terms as $term) {
		//! Apparently the language context is working for terms (not for pods) with Polylang 3.7+, otherwise, must use/check language with the following..
		//$translated_id = pll_get_term($term->term_id, $current_lang); // Uncommented for language context

		$taxonomy_name = $term->name;
		$taxonomy_id = $term->term_id;
		$taxonomy_slug = $term->slug;
		$has_items = get_term_by('id', $taxonomy_id, $cat)->count; // count number of custom posts in this category



		if ($has_items) {


			if ($catCount > 0) {
				$output .= '<div class="wp-block-group mmenu-separator"><hr class="wp-block-separator has-alpha-channel-opacity"></div>';
			}

			$output .= '<section class="wp-block-group category-group" data-count="' . $catCount . '" data-id="' . $taxonomy_id . '" data-name="' . $taxonomy_name . '"><h2 class="wp-block-heading category-title">' . $taxonomy_name . '</h2>';

			$curr_lang = function_exists('pll_current_language') ? pll_current_language() : 'es'; // default language is 'es' if Polylang is not installed

			// ! nueva query para cada categoria
			$query = new WP_Query([
				'post_type'  => $cpt,
				'meta_key'   => 'orden',
				'orderby'    => 'meta_value_num',
				'order'      => 'ASC',
				'posts_per_page' => -1,
				'tax_query'      => $term ? [
					[
						'taxonomy' => $term->taxonomy,      // Sustituye por el nombre de tu taxonomía
						'field'    => 'slug',    // Puede ser 'term_id', 'slug' o 'name'
						'terms'    => $term->slug,   // Sustituye por el término que quieres filtrar
					],
				] : null,
				'lang' => $curr_lang
			]);

			if ($query->have_posts()) {

				while ($query->have_posts()) {
					$query->the_post();
					$cpts = pods($cpt, get_the_ID());

					$nombre = $cpts->field('name');
					$id = $cpts->id();
					$link = $cpts->field('permalink');
					$imgSrc = $cpts->field('icon._src.full');
					$description = $cpts->field('subtitular');
					$order = $cpts->field('orden') ? $cpts->field('orden') : 0; // Default to 0 if orden is not set


					$output .= '<div class="wp-block-group item-list">';
					$output .= '	<div class="wp-block-group mega-menu-item" data-order="' . $order . '">
															<a href="' . $link . '">
																<div class="grid-item-content">
																	<div class="wp-block-group item-icon">
																		<img src="' . $imgSrc . '" alt="' . $nombre . '">
																	</div>
																	<div class="wp-block-group item-content">
																		<h3 class="wp-block-heading">' . $nombre . '</h3>';
					if ($description && !$no_description) {
						$output .= '				    	<p class="description">' . $description . '</p>';
					}
					$output .= '
																	</div>
																</div>
															</a>
														</div>';
					$output .= '</div>';
				}
				wp_reset_postdata();
			}



			$output .= '</section>';
			$catCount++;
		}
	}

	$output .= '</div>'; // Close mega-menu-container

	return wp_svg_inline_filter($output);
}
add_shortcode('megamenu-cpt-by-cat', 'show_cpt_by_cat');


//! GET CPT LIST FOR MEGAMENU
function megamenu_cpt($atts = [], $content = '')
{

	extract(shortcode_atts(array(
		"limit" 	=> 0,
		"cpt"			=> false
	), $atts));

	if (!$cpt) return '⛔️ You must define the attribute for the Custom Post Type: cpt="your cpt name"';

	$params = array(
		'limit' => $limit,
		'orderby' => 'orden ASC'
	);

	// If polylang plugin is installed, filter only 'current language' ones.
	if (function_exists('pll_current_language')) {
		$curr_lang = pll_current_language();
		$params['where'] = "language.slug = '" . $curr_lang . "'";
	}


	$pods = pods($cpt, $params);

	if ($pods->total() > 0) {
		$output = '';

		$output .= '<div class="mega-menu-container">';

		while ($pods->fetch()) {
			$link = $pods->field('permalink');
			$imgSrc = $pods->field('icon._src.full');
			$nombre = $pods->field('nombre');
			$description = $pods->field('descripcion');
			$cat = $pods->field('categoria_modulo.name') ? $pods->field('categoria_modulo.name')[0] : '';
			$orden = $pods->field('menu_order');

			$output .= '<div class="mega-menu-item">';
			$output .= '	<a href="' . $link . '" data-category="' . $cat . '" data-order="' . $orden . '">';
			$output .= '		<div class="grid-item-content">';
			$output .= '			<div class="item-icon">';
			$output .= '				<img src="' . $imgSrc . '" alt="' . $nombre . '">';
			$output .= '			</div>';
			$output .= '			<div class="item-content">';
			$output .= '					<h3 class="title">' . $nombre . '</h3>';
			if ($description) {
				$output .= '				<p class="description">' . $description . '</p>';
			}
			// $output .= '					<p class="description">@@@@@</p>';
			$output .= '			</div>';
			$output .= '		</div>';
			$output .= '	</a>';
			$output .= '</div>';
		}

		$output .= '</div>'; // Close mega-menu-container
	}


	return wp_svg_inline_filter($output);
}
add_shortcode('megamenu-cpt', 'megamenu_cpt');


//! GET CPT LIST FOR MOBILE MENU WITH CUSTOM ORDER (with icon svg inline)


function mobile_menu_cpt($atts = [], $content = '')
{

	extract(shortcode_atts(array(
		"limit" 	=> 0,
		"cpt"		=> false
	), $atts));

	if (!$cpt) return '⛔️ You must define the attribute for the Custom Post Type: cpt="your cpt name"';

	$curr_lang = function_exists('pll_current_language') ? pll_current_language() : 'es'; // default language is 'es' if Polylang is not installed

	$query = new WP_Query([
		'post_type'  => $cpt,
		'meta_key'   => 'orden',
		'orderby'    => 'meta_value_num',
		'order'      => 'ASC',
		// 'meta_query' => [ // Only if we want to exclude posts without 'orden' meta key, which will appear before the order = 1 width order = NULL
		// 	[
		// 		'key'     => 'orden',
		// 		'compare' => 'EXISTS',
		// 	]
		// ],
		'posts_per_page' => -1,
		'lang' => $curr_lang
	]);




	$output = '';

	if ($query->have_posts()) {

		while ($query->have_posts()) {
			$query->the_post();

			$pods = pods($cpt, get_the_ID());

			$link = $pods->field('permalink');
			$imgSrc = $pods->field('icon._src.full');
			$nombre = $pods->field('nombre');
			$cat = $pods->field('categoria_modulo.name') ? $pods->field('categoria_modulo.name')[0] : '';
			$orden = $pods->field('orden');

			$output .= '<div class="sub-menu-mobile-item">';
			$output .= '	<a href="' . $link . '" data-category="' . $cat . '" data-order="' . $orden . '">';
			$output .= '		<div class="grid-item-content">';
			$output .= '			<div class="item-icon">';
			$output .= '				<img src="' . $imgSrc . '" alt="' . $nombre . '">';
			$output .= '			</div>';
			$output .= '			<div class="item-title">';
			$output .= 					$nombre;
			$output .= '			</div>';
			$output .= '		</div>';
			$output .= '	</a>';
			$output .= '</div>';
		}
	}


	return wp_svg_inline_filter($output);
}
add_shortcode('mobile-menu-cpt', 'mobile_menu_cpt');



//! GET CPT LIST FOR SPLIDE SLIDER
function cpt_list_for_slider($atts = [], $content = '')
{

	$atts = shortcode_atts([
		'limit' => -1,
		'cpt'   => ''
	], $atts);

	$cpt   = sanitize_key($atts['cpt']);
	$limit = intval($atts['limit']);

	if (!$cpt) return '⛔️ You must define the attribute for the Custom Post Type: cpt="your cpt name"';

	$curr_lang = function_exists('pll_current_language') ? pll_current_language() : 'es'; // default language is 'es' if Polylang is not installed

	$query = new WP_Query([
		'post_type'  => $cpt,
		'meta_key'   => 'orden',
		'orderby'    => 'meta_value_num',
		'order'      => 'ASC',
		// 'meta_query' => [ // Only if we want to exclude posts without 'orden' meta key, which will appear before the order = 1 width order = NULL
		// 	[
		// 		'key'     => 'orden',
		// 		'compare' => 'EXISTS',
		// 	]
		// ],
		'posts_per_page' => $limit,
		'no_found_rows'  => true,
		// 'limit' => $limit,
		'lang' => $curr_lang
	]);




	$output = '';

	$total_posts = $query->found_posts;

	// $output .= '<h2>' . $total_posts . ' | lang: ' . $curr_lang . '</h2>';


	if ($query->have_posts()) {

		while ($query->have_posts()) {
			$query->the_post();

			$pods = pods($cpt, get_the_ID());

			$link = $pods->field('permalink');
			$imgSrc = $pods->field('icon._src.full');
			$nombre = $pods->field('nombre');
			$subtitular = $pods->field('subtitular');
			$description = $pods->field('descripcion');
			$cat = $pods->field('categoria_modulo.name') ? $pods->field('categoria_modulo.name')[0] : '';
			$orden = $pods->field('orden');


			$output .= '<a href="' . $link . '" class="no-decoration">
										<div class="wp-block-group slider-card slider-card-icon bordered is-layout-constrained wp-block-group-is-layout-constrained">
											<div class="wp-block-group is-layout-constrained wp-block-group-is-layout-constrained">
												<div class="wp-block-group header is-layout-constrained wp-block-group-is-layout-constrained">
													<h3 class="wp-block-heading">' . $nombre . '</h3>
													<figure class="wp-block-image size-full is-resized icon">
														<img src="' . $imgSrc . '" alt="' . $nombre . '">
													</figure>
												</div>
												<p class="bigger">' . $subtitular . '</p>
												<p>' . $description . '</p>
												<figure class="wp-block-image size-full is-resized cta-arrow no-bg">
													<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256">
														<rect width="256" height="256" fill="none"></rect>
														<line x1="40" y1="128" x2="216" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line>
														<polyline points="144 56 216 128 144 200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></polyline>
													</svg>
												</figure>
											</div>
										</div>
									</a>';
		}
		wp_reset_postdata();
	}


	return wp_svg_inline_filter($output);
}
add_shortcode('cpt-list-slider', 'cpt_list_for_slider');






//! GET MODULOS LIST AS <ul> for footer -- no icons
// function modulos_list($atts = [], $content = '')
// {

// 	extract(shortcode_atts(array(
// 		"limit" 	=> 0,
// 	), $atts));


// 	$params = array(
// 		'limit' => $limit,
// 		'orderby' => 'orden ASC',
// 	);

// 	if (function_exists('pll_current_language')) {
// 		$curr_lang = pll_current_language();
// 		$params['where'] = "language.slug = '" . $curr_lang . "'";
// 	}


// 	$pods = pods('modulo', $params);

// 	if ($pods->total() > 0) {
// 		$output = '<ul>';

// 		while ($pods->fetch()) {
// 			$link = $pods->field('permalink');
// 			$nombre = $pods->field('title');
// 			$cat = $pods->field('categoria_modulo.name') ? $pods->field('categoria_modulo.name')[0] : '';
// 			$orden = $pods->field('menu_order');

// 			$output .= '<li class="list-item">';
// 			$output .= '	<a href="' . $link . '" data-category="' . $cat . '" data-order="' . $orden . '">';
// 			$output .= 					$nombre;
// 			$output .= '	</a>';
// 			$output .= '</li>';
// 		}

// 		$output .= '</ul>';
// 	}

// 	return $output;
// }
// add_shortcode('modulos-list', 'modulos_list');


//! Return the CPT list for a specific categroy (if $term is provided) or all CPTs if no term is provided.
function getCPT_list($cpt, $term)
{

	$curr_lang = (function_exists('pll_current_language')) ? pll_current_language() : 'es'; // default language is 'es' if Polylang is not installed

	$query = new WP_Query([
		'post_type'  => $cpt,
		'meta_key'   => 'orden',
		'orderby'    => 'meta_value_num',
		'order'      => 'ASC',
		'posts_per_page' => -1,
		'tax_query'      => $term ? [
			[
				'taxonomy' => $term->taxonomy,      // Sustituye por el nombre de tu taxonomía
				'field'    => 'slug',    // Puede ser 'term_id', 'slug' o 'name'
				'terms'    => $term->slug,   // Sustituye por el término que quieres filtrar
			],
		] : null,
		'lang' => $curr_lang
	]);

	$output = '';



	if ($query->have_posts()) {
		$output .= '<ul class="wp-block-list cpt-category-list">';

		while ($query->have_posts()) {
			$query->the_post();

			$pods = pods($cpt, get_the_ID());

			$link = $pods->field('permalink');
			$nombre = $pods->field('nombre');
			$orden = $pods->field('orden');

			$output .= '<li class="list-item">
										<a href="' . $link . '" data-order="' . $orden . '">' . $nombre . '</a>
									</li>';
		}

		$output .= '</ul>';
		// Reseteamos los datos globales del post
		wp_reset_postdata();
	} else {
		$output .= '<p class="no-items-found">⛔️ No items found in this category</p>';
	}

	return $output;
}


//! GET MODULOS ORDERED LIST GROUPED BY CATEGORY AS <ul> for footer -- no icons
function cpt_list($atts = [], $content = '')
{
	extract(shortcode_atts(array(
		"limit"	=> 0,
		"cat"		=> false,
		"cpt"		=> false,
		"no_description"	=> false, // If true, will show the description of the category
	), $atts));


	if (!$cpt) return '⛔️ You must pass the CPT name on the shortcode: cpt="cpt name"';

	$output = '';

	if ($cat) { // Si agrupamos por categoría
		$terms = get_terms([
			'taxonomy'	=> $cat,
			'hide_empty' => false, // o true
		]);

		// Ordenar manualmente por el campo 'orden' (meta personalizado)
		usort($terms, function ($a, $b) {
			$orden_a = (int) get_term_meta($a->term_id, 'orden', true);
			$orden_b = (int) get_term_meta($b->term_id, 'orden', true);
			return $orden_a <=> $orden_b;
		});





		foreach ($terms as $term) {
			//! Apparently the language context is working for terms (not for pods) with Polylang 3.7+, otherwise, must use/check language with the following..
			//$translated_id = pll_get_term($term->term_id, $current_lang); // Uncommented for language context

			$taxonomy_name = $term->name;
			$taxonomy_id = $term->term_id;
			$taxonomy_slug = $term->slug;
			$has_items = get_term_by('id', $taxonomy_id, $cat)->count; // count number of custom posts in this category


			if ($has_items) {
				$output .= '<div class="category-group" data-id="' . $taxonomy_id . '" data-name="' . $taxonomy_name . '">
											<h3 class="category-title">' . $taxonomy_name . '</h3>';

				$output .= 			getCPT_list($cpt, $term);

				$output .= '</div>'; // Close mega-menu-container

			} else {
				$output .= '<p class="no-items-found">⛔️ No items found in this category</p>';
			}
		}
	} else { // Sin agrupar por categoría, todos los CPTs

		$output .= getCPT_list($cpt, null);
	}

	return $output;
}
add_shortcode('cpt-list-no-icons', 'cpt_list');


//! LOGOS CLIENTES CPT: cliente

function show_customer_logos($atts = [], $content = '')
{

	extract(shortcode_atts(array(
		"limit" 	=> 0,
	), $atts));

	$output = '';
	// $output .= '<h2>AREAS FEATURED</h2><br>';

	$params = array(
		'limit' => $limit,
		'orderby' => 't.post_title ASC'

	);

	// If polylang plugin is installed, filter only 'current language' ones.
	if (function_exists('pll_current_language')) {
		$curr_lang = pll_current_language();
		$params['where'] = "language.slug = '" . $curr_lang . "'";
	}

	$pods = pods('cliente', $params);

	if ($pods->total() > 0) {
		while ($pods->fetch()) {
			$imgSrc = $pods->field('logotipo._src.full');
			$WH = extractWidthHeight($pods->field('logotipo._img'));
			$imgWidth = $WH['width'];
			$imgHeight = $WH['height'];
			$nombre = $pods->field('nombre');
			$cat = (gettype($pods->field('cliente_category')) !== 'array') ? '' : $pods->field('cliente_category')[0]['name'];

			// $output .= print_r($cat);

			if ($imgWidth && $imgHeight && $imgSrc) {
				$output .= '<figure class="wp-block-image size-large" data-filter="' . $cat . '">';
				// $output .= $pods->field('logotipo._img');
				$output .= '	<img fetchpriority="high" decoding="async" width="' . $imgWidth . '" height="' . $imgHeight . '" src="' . $imgSrc . '" alt="' . $nombre . '" class="wp-image-2469">';
				$output .= '</figure>';
			}


			// $output .= $img;

		}
	}

	return $output;
}
add_shortcode('logos-clientes', 'show_customer_logos');


//! LOGOS PARTNERS CPT: partner

function show_partners_logos($atts = [], $content = '')
{

	extract(shortcode_atts(array(
		"limit" 	=> 0,
	), $atts));

	$output = '';
	// $output .= '<h2>AREAS FEATURED</h2><br>';

	$params = array(
		'limit' => $limit,
		'orderby' => 't.post_title ASC'

	);

	// If polylang plugin is installed, filter only 'current language' ones.
	if (function_exists('pll_current_language')) {
		$curr_lang = pll_current_language();
		$params['where'] = "language.slug = '" . $curr_lang . "'";
	}

	$pods = pods('partner', $params);

	if ($pods->total() > 0) {
		while ($pods->fetch()) {
			$imgSrc = $pods->field('logotipo._src.full');
			$WH = extractWidthHeight($pods->field('logotipo._img'));
			$imgWidth = $WH['width'];
			$imgHeight = $WH['height'];
			$nombre = $pods->field('nombre');
			$web = $pods->field('web');
			$cta_link_text = __('contacta', 'pictau'); // default text for the link to contact the partner
			// $tipo = $pods->field('tipo') ? $pods->field('tipo')[0]['name'] : '';
			$tipo = $pods->field('tipo') ? $pods->field('tipo') : ''; // Tipo de partner, puede ser p. ej. 'Gold', 'Platinum', etc.


			// $cat = (gettype($pods->field('partner_category')) !== 'array') ? '' : $pods->field('partner_category')[0]['name'];
			$cats = (gettype($pods->field('partner_category')) !== 'array') ? false : $pods->field('partner_category');
			$cat = $cats ? implode(',', array_column($cats, 'name')) : '';

			// $output .= print_r($cat);

			if ($cat && $imgWidth && $imgHeight && $imgSrc) {

				$output .= '<figure class="wp-block-image size-large" data-filter="' . $cat . '" data-link="' . $web . '" data-link_text="' . $cta_link_text . '"' . ($tipo ? ' data-type="' . $tipo . '"' : '') . '>';
				$output .= '	<img fetchpriority="high" decoding="async" width="' . $imgWidth . '" height="' . $imgHeight . '" src="' . $imgSrc . '" alt="' . $nombre . '" class="wp-image-2469">';
				$output .= '</figure>';
			}


			// $output .= $img;

		}
	}

	return $output;
}
add_shortcode('logos-partners', 'show_partners_logos');



//! CONTACT FORM 7 HTML TEMPLATES FOR SENT EMAILS
require get_template_directory() . '/inc/cf7_html_email_templates.php';

//! INTEGRACIÓN NATIVA CF7 + POLYLANG (reemplaza plugin externo)
if ( class_exists( 'WPCF7_ContactForm' ) && function_exists( 'pll_register_string' ) ) {
	require get_template_directory() . '/inc/cf7-polylang.php';
}



//! FEATURERD AREAS CARDS FOR HOMEPAGE WITH POD TEMPLATE

function show_cpt_featured_cards($atts = [], $content = '')
{

	extract(shortcode_atts(array(
		"limit" 	=> 0,
	), $atts));

	$output = '';
	// $output .= '<h2>AREAS FEATURED</h2><br>';

	$params = array(
		'limit' => $limit,
	);

	$pods = pods('area', $params);


	if ($pods->total() > 0) {
		while ($pods->fetch()) {
			$featured = $pods->field('featured')[0];

			if ($featured) {
				$output .= do_shortcode('[pods name="area" id="' . $pods->id() . '" template="Area Featured Card for Home page"]');
			}
		}
	}

	return $output;
}
add_shortcode('cpt-featured-cards', 'show_cpt_featured_cards');

//! CPT CARDS FOR HOMEPAGE
function show_cpt_cards($atts = [], $content = '')
{

	extract(shortcode_atts(array(
		"limit" 	=> 0,
		"cpt"		=> false
	), $atts));

	$output = '';

	$params = array(
		'limit' => $limit,
		'orderby' => 't.menu_order ASC'
	);


	$pods = pods($cpt, $params);

	if ($pods->total() > 0) {
		$index = 0;
		while ($pods->fetch()) {
			$index++;
			$featured = $pods->field('featured')[0];
			$nombre = $pods->field('nombre');
			$link = $pods->field('permalink');
			$icon = $pods->field('icon._src');
			$featured_img = $pods->field('post_thumbnail_url.full');
			$icon_output = '<img src="' . $icon . '" alt="' . $nombre . '">';
			$description = $pods->field('descripcion');
			$lang = $pods->field('language.slug')[0];

			$even = $index % 2 === 0 ? true : false;
			$anim_delay = $even ? ' data-anim_any_delay="0.2"' : '';



			if (function_exists('pll_current_language') && pll_current_language() === $lang) {

				$output .= '<a href="' . $link . '" class="card-item" data-anim_any data-anim_any_duration="1.5" data-anim_delay="1"' . $anim_delay . '>
											<div class="card shadow media-bg-glassy">
												<div class="wp-block-group">
													<figure class="wp-block-image size-large">
														<img fetchpriority="high" decoding="async" width="1024" height="705" src="' . $featured_img . '" alt="' .  $nombre . '">
													</figure>
													<div class="wp-block-group content">
														<div class="wp-block-group inner-card">
															<h2 class="wp-block-heading">' . $description . '</h2>
															<figure class="wp-block-image size-full is-resized cta-arrow">
																<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><line x1="40" y1="128" x2="216" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line><polyline points="144 56 216 128 144 200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></polyline></svg>
															</figure>
														</div>
													</div>
												</div>
											</div>
										</a>';
			}
		}
	}

	return $output;
}
add_shortcode('cpt-cards', 'show_cpt_cards');



//! BLOG/POSTS: AÑADIR FUNCIONALIDAD PARA DEFINIR UNA CATEGORÍA ASIGNADA A UN POST COMO PRINCIPAL O DESTACADA
// Añadimos el metabox
function categoria_principal_metabox()
{
	add_meta_box(
		'categoria_principal_metabox',
		'Categoría Principal',
		'render_categoria_principal_metabox',
		'post',
		'side',
		'high'
	);
}
add_action('add_meta_boxes', 'categoria_principal_metabox');


// Renderizar el campo de selección
function render_categoria_principal_metabox($post)
{
	$categorias = get_the_category($post->ID);
	$selected = get_post_meta($post->ID, '_categoria_principal', true);

	if (empty($categorias)) {
		echo __('Este post no tiene categorías asignadas.', 'pictau');
		return;
	}

	echo '<label for="categoria_principal_select">' . __('Selecciona una categoría principal:', 'pictau') . '</label><br>';
	echo '<select name="categoria_principal" id="categoria_principal_select">';
	foreach ($categorias as $cat) {
		$is_selected = ($selected == $cat->term_id) ? 'selected' : '';
		echo "<option value='{$cat->term_id}' $is_selected>{$cat->name}</option>";
	}
	echo '</select>';
	echo wp_nonce_field('guardar_categoria_principal', 'categoria_principal_nonce');
}

// 3. Guardar la categoría principal
function guardar_categoria_principal($post_id)
{
	if (!isset($_POST['categoria_principal_nonce']) || !wp_verify_nonce($_POST['categoria_principal_nonce'], 'guardar_categoria_principal')) {
		return;
	}
	if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
	if (!current_user_can('edit_post', $post_id)) return;

	if (isset($_POST['categoria_principal'])) {
		update_post_meta($post_id, '_categoria_principal', intval($_POST['categoria_principal']));
	}
}
add_action('save_post', 'guardar_categoria_principal', 100);


////! Mostrar la categoría principal en el frontend
function categoria_principal_admin_script_condicional()
{
	$screen = get_current_screen();
	if ($screen->base !== 'post' || $screen->post_type !== 'post') return;

?>
	<script>
		document.addEventListener('DOMContentLoaded', () => {
			if (!wp || !wp.data || !wp.apiFetch) return;

			const metabox = document.getElementById('categoria_principal_metabox');
			const select = document.getElementById('categoria_principal_select');
			if (!metabox || !select) return;

			let lastCatIds = [];

			const updateIfChanged = () => {
				const categories = wp.data.select('core/editor').getEditedPostAttribute('categories') || [];

				// Comparar con las anteriores para evitar parpadeo
				const isSame = categories.length === lastCatIds.length &&
					categories.every((id, i) => id === lastCatIds[i]);

				if (isSame) return;

				// Guardar estado actual
				lastCatIds = [...categories];

				// Mostrar u ocultar metabox
				if (categories.length > 1) {
					metabox.style.display = '';
				} else {
					metabox.style.display = 'none';
				}

				if (categories.length === 0) {
					select.innerHTML = '';
					return;
				}

				// Cargar los nombres vía API
				wp.apiFetch({
						path: '/wp/v2/categories?include=' + categories.join(',')
					})
					.then(results => {
						const current = select.value;
						select.innerHTML = '';

						results.forEach(cat => {
							const option = document.createElement('option');
							option.value = cat.id;
							option.textContent = cat.name;
							if (cat.id == current) option.selected = true;
							select.appendChild(option);
						});

						// Si ninguna opción coincide, seleccionamos la primera
						if (!select.value && select.options.length > 0) {
							select.options[0].selected = true;
						}
					});
			};

			// Ejecutar al cargar
			updateIfChanged();

			// Suscribirse y ejecutar solo si cambian las categorías
			wp.data.subscribe(() => {
				updateIfChanged();
			});
		});
	</script>
<?php
}
add_action('admin_footer-post.php', 'categoria_principal_admin_script_condicional');



//! AÑADE COLUMNA IMAGEN en el backoffice de vista de lista del CPT para el CTP definido
// Añadir la columna Featured Image al listado de un CPT
add_filter('manage_necesidad_posts_columns', 'agregar_columna_imagen');
function agregar_columna_imagen($columns)
{
	// Guarda las columnas originales
	$new = [];

	// Añadimos nuestra columna primero
	$new['thumbnail'] = __('Imagen', 'textdomain');

	// Ahora añadimos el resto
	return array_merge($new, $columns);
}

//! Añade una columna "Imagen" con el "featured image" al listado del backoffice para varios CPT
add_action('init', function () {

	// Array de CPT donde aplicar la funcionalidad
	$cpts = ['necesidad', 'ebook', 'producto', 'ambiente', 'slide']; // <-- personalizar los CPTs aquí

	foreach ($cpts as $cpt) {

		// Añadir la columna personalizada
		add_filter("manage_{$cpt}_posts_columns", function ($columns) {
			$new = [];
			$new['thumbnail'] = __('Imagen', 'textdomain');
			return array_merge($new, $columns);
		});

		// Rellenar la columna con la imagen destacada
		add_action("manage_{$cpt}_posts_custom_column", function ($column, $post_id) {
			if ($column === 'thumbnail') {
				if (has_post_thumbnail($post_id)) {
					echo get_the_post_thumbnail($post_id, [60, 60]);
				} else {
					echo '—';
				}
			}
		}, 10, 2);
	}
});


// add_action('manage_necesidad_posts_custom_column', 'mostrar_columna_imagen', 10, 2);
// function mostrar_columna_imagen($column, $post_id)
// {
// 	if ($column === 'thumbnail') {
// 		if (has_post_thumbnail($post_id)) {
// 			echo get_the_post_thumbnail($post_id, [60, 60]); // Tamaño pequeño
// 		} else {
// 			echo '—';
// 		}
// 	}
// }

// Opcional: hacer que la columna sea estrecha
add_action('admin_head', function () {
	echo '
	<style>
	.column-thumbnail {
		width: 70px; padding: 0 1rem !important;
		padding: 0 !important;
		text-align: center !important;
		vertical-align: middle !important;
		line-height: 0 !important;
		img {
			max-width: 40px;
			border-radius: 4px;
		}
	}
	</style>';
});



//! BLOG SECTION ANYWHERE, WITH FEATURED POST, PODS FEATURED POSTS, AND GRID OF LATEST POSTS

// Shortcode: [blog_section]
add_shortcode('blog_section', function ($atts = []) {
	if (!function_exists('get_template_part')) return '';

	$a = shortcode_atts([
		// Featured (fila 1)
		'featured_source'         => 'auto',
		'featured_thumb'          => 'medium_large',

		// Featured "Pods" (NUEVA fila 2)
		'pods_featured_count'     => 4,

		// Grid (fila 3)
		'count'                   => 4,
		'grid_thumb'              => 'medium',

		// Filtros opcionales
		'category'                => '',
		'tag'                     => '',

		// Visual
		'show_category'           => 'true',
		'view_transition'         => 'false',
		'wrapper_class'           => '',
	], $atts, 'blog_section');

	$show_category   = filter_var($a['show_category'], FILTER_VALIDATE_BOOLEAN);
	$view_transition = filter_var($a['view_transition'], FILTER_VALIDATE_BOOLEAN);

	ob_start();

	// Lista de IDs a excluir en Fila 3
	$exclude_ids = [];


	/* -----------------------------------------------------------
		! Destacado —> Featured original (sticky o latest)
		 ----------------------------------------------------------- */

?>

	<section class="pct-section blog-section <?php echo esc_attr($a['wrapper_class']); ?>">

		<section class="pct-section latest-entry" data-anim_any data-anim_any_delay="0.3" data-anim_any_duration="1" data-anim_any_slideamount="50">
			<?php
			$sticky_posts = get_option('sticky_posts');
			$use_sticky   = !empty($sticky_posts);

			if ($a['featured_source'] === 'sticky' && empty($sticky_posts)) {
				$use_sticky = false;
			} elseif ($a['featured_source'] === 'latest') {
				$use_sticky = false;
			}

			if ($use_sticky) {
				$featured_q = new WP_Query([
					'post_type'            => 'post',
					'post__in'             => $sticky_posts,
					'ignore_sticky_posts'  => 1,
					'posts_per_page'       => 1,
					'post_status'          => 'publish',
					'orderby'              => 'date',
					'order'                => 'DESC',
				]);
			} else {
				$featured_q = new WP_Query([
					'post_type'            => 'post',
					'ignore_sticky_posts'  => 1,
					'posts_per_page'       => 1,
					'post_status'          => 'publish',
					'orderby'              => 'date',
					'order'                => 'DESC',
				]);
			}

			$featured_post_id = 0;

			if ($featured_q->have_posts()) {
				while ($featured_q->have_posts()) {
					$featured_q->the_post();
					$featured_post_id = get_the_ID();
					$exclude_ids[]    = $featured_post_id;

					get_template_part(
						'template-parts/content/content',
						'excerpt',
						[
							'featured'        => true,
							'show_category'   => $show_category,
							'view_transition' => $view_transition,
							'thumbnail_size'  => $a['featured_thumb'],
						]
					);
				}
				wp_reset_postdata();
			}
			?>
		</section>
		<?php
		/*!-- -----------------------------------------------------------
		     //! Fila 2 — Posts con campo Pods "featured" = true
		     ----------------------------------------------------------- --*/
		?>


		<?php
		$pods_q = new WP_Query([
			'post_type'      => 'post',
			'posts_per_page' => (int) $a['pods_featured_count'],
			'meta_query'     => [
				[
					'key'     => 'featured',
					'value'   => '1',   // Valor típico guardado por Pods boolean Yes/No
					'compare' => '='
				]
			],
			'post__not_in'   => $exclude_ids,
			'post_status'    => 'publish',
			'orderby'        => 'date',
			'order'          => 'DESC',
		]);

		$pods_featured_ids = [];


		if ($pods_q->have_posts()) {
			echo '<section class="pct-section featured-posts latest-entries no-pt theme-color-A" data-anim_any data-anim_any_delay="0.45" data-anim_any_duration="1" data-anim_any_slideamount="50">';
			while ($pods_q->have_posts()) {
				$pods_q->the_post();
				$id = get_the_ID();
				$pods_featured_ids[] = $id;
				$exclude_ids[]       = $id;

				get_template_part(
					'template-parts/content/content',
					'excerpt',
					[
						'show_category'   => $show_category,
						'view_transition' => $view_transition,
						'thumbnail_size'  => $a['grid_thumb'], // misma plantilla que Fila 3
					]
				);
			}
			echo '</section>';
			wp_reset_postdata();
		}


		?>

		<?php
		/*-- -----------------------------------------------------------
		     //! Fila 3 — Últimos posts normales, excluyendo fila 1 y fila 2
		     ----------------------------------------------------------- --*/
		?>

		<section class="pct-section latest-entries no-pt theme-color-A" data-anim_any data-anim_any_delay="0.6" data-anim_any_duration="1" data-anim_any_slideamount="50">
			<?php
			$tax_query = [];

			if ($a['category'] !== '') {
				$tax_query[] = [
					'taxonomy' => 'category',
					'field'    => is_numeric($a['category']) ? 'term_id' : 'slug',
					'terms'    => is_numeric($a['category']) ? (int) $a['category'] : sanitize_title($a['category']),
				];
			}
			if ($a['tag'] !== '') {
				$tax_query[] = [
					'taxonomy' => 'post_tag',
					'field'    => is_numeric($a['tag']) ? 'term_id' : 'slug',
					'terms'    => is_numeric($a['tag']) ? (int) $a['tag'] : sanitize_title($a['tag']),
				];
			}

			$args = [
				'post_type'            => 'post',
				'posts_per_page'       => max(0, (int) $a['count']),
				'orderby'              => 'date',
				'order'                => 'DESC',
				'post__not_in'         => $exclude_ids, // Muy importante
				'ignore_sticky_posts'  => 1,
				'post_status'          => 'publish',
			];

			if (!empty($tax_query)) {
				$args['tax_query'] = $tax_query;
			}

			$latest_q = new WP_Query($args);

			if ($latest_q->have_posts()) {
				while ($latest_q->have_posts()) {
					$latest_q->the_post();

					get_template_part(
						'template-parts/content/content',
						'excerpt',
						[
							'show_category'   => $show_category,
							'view_transition' => $view_transition,
							'thumbnail_size'  => $a['grid_thumb'],
						]
					);
				}
				wp_reset_postdata();
			}
			?>
		</section>
	</section>

<?php
	return ob_get_clean();
});


//! Añadir estado personalizado "Destacada" en el listado de entradas si el custom field 'featured' está marcado. Complemento para el shortcode más arriba de [blog_section]

add_filter('display_post_states', function ($states, $post) {

	// Solo para posts
	if ($post->post_type !== 'post') {
		return $states;
	}

	// Solo si el post está publicado
	if ($post->post_status !== 'publish') {
		return $states;
	}

	// Comprobar el custom field 'featured' (Pods lo guarda como 0/1)
	$is_featured = get_post_meta($post->ID, 'featured', true);

	// Si está marcado, añadimos el estado
	if ($is_featured == '1') {
		$states['featured-post'] = ' <span style="background-color:yellow;display:inline-flex;padding: .2ch .5ch;border:1px solid #cdcd05;">Destacada</span>';
	}

	return $states;
}, 10, 2);



//! CASOS DE ÉXITO GRID FOR ARCHIVE PAGE
function casos_exito_grid($atts = [], $content = '')
{

	extract(shortcode_atts(array(
		"limit" 	=> 0,
	), $atts));

	$output = '';

	$params = array(
		'limit' => $limit,
		'orderby' => 't.post_date DESC'
	);

	// If polylang plugin is installed, filter only 'current language' ones.
	if (function_exists('pll_current_language')) {
		$curr_lang = pll_current_language();
		$params['where'] = "language.slug = '" . $curr_lang . "'";
	}


	$pods = pods('caso-exito', $params);


	if ($pods->total() > 0) {

		$output .= '<div class="casos-exito-grid">';

		while ($pods->fetch()) {
			$company = $pods->field('company');
			$link = $pods->field('permalink');


			$featured_img = $pods->field('post_thumbnail_url.full');
			$featured_img_dim = array(
				'w'	=> $pods->field('post_thumbnail.width'),
				'h'	=> $pods->field('post_thumbnail.height')
			);

			// $responsable = $pods->field('responsable');
			$cargo = $pods->field('cargo');
			$project_abstract = $pods->field('project_abstract');
			$testimonial_video = $pods->field('testimonial_video');
			$youtube_id = $pods->field('youtube_id');
			$video = '<figure class="restricted-video wp-block-embed is-type-video is-provider-youtube wp-block-embed-youtube wp-embed-aspect-16-9 wp-has-aspect-ratio"><div class="wp-block-embed__wrapper"><iframe width="500" height="281" src="https://www.youtube.com/embed/' . $youtube_id . '?feature=oembed?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen=""></iframe></div></figure>';
			$restricted_video_header = $pods->field('header_video');

			$output .= '<div class="caso-exito-item card bordered padd-min">';
			$output .= '	<div>';
			$output .= '		<div class="hero-image align-top">';
			// $output .= '	<a href="' . $link . '" class="hero-image align-top">';
			// $output .= 'Company: ' . $company;
			$output .=  '		<figure><img src="' . $featured_img . '" alt="' . $company . '" width="' . $featured_img_dim['w'] . '" height="' . $featured_img_dim['h'] . '"></figure>';
			// $output .=  '<a href="'. $link . '">'. $link .'</a>' . '<br>';
			$output .=  '		</div>';
			$output .=  '		<div>';
			$output .=  '		<div class="company-name">';
			$output .=  '			<h3>' . $company . '</h3>';
			$output .=  '		</div>';
			$output .=  '		<div class="description">';
			$output .=  			$project_abstract;
			$output .=  '		</div>';
			// $output .=  $video. '<br>';
			// $output .=  'Video Header: ' . $restricted_video_header . '<br>';
			// $output .=  'Testimonial Video: '. $testimonial_video . '<br>';
			// $output .= '	</a>';
			$output .= '	<div class="wp-block-buttons is-layout-flex wp-block-buttons-is-layout-flex">
											<div class="wp-block-button">
												<a href="' . $link . '" class="wp-block-button__link wp-element-button">' . __('Ver Caso de Éxito', 'pictau') . '</a>
											</div>
      							</div>
      							</div>
      							</div>';
			$output .= '</div>';

			// $featured = $pods->field('featured')[0];

			// if ($featured) {
			// 	$output .= do_shortcode('[pods name="area" id="'. $pods->id() .'" template="Area Featured Card for Home page"]');
			// }
		}

		$output .= '</div>';
	}

	return $output;
}
add_shortcode('casos-exito-list', 'casos_exito_grid');


//! Using Chatbot plugin AI Engine by Meow and multiple chatbots for different languages
// Plugin Configuration needed:
//  - Leave the 'Default' chatbot in the AI Engine plugin settings and set Site-Wide Chatbot: 'Default'. Whit this we make sure that all the pages load the chatbot script.
//  - Create different chatbots in the AI Engine plugin settings, one for each language needed
// 	- Assign each chatbot an ID (slug) that can be used in the shortcode [ai_engine_chatbot id="chatbot-id"].
// 	- In this example, we assume two chatbots with IDs 'eqm-es' for Spanish and 'eqm-en' for English.

// Detecta si AI Engine (free o pro) está activo
function is_ai_engine_active()
{

	// Asegurar que la función existe (en front-end no siempre está disponible)
	if (!function_exists('is_plugin_active')) {
		include_once ABSPATH . 'wp-admin/includes/plugin.php';
	}

	return (
		is_plugin_active('ai-engine/ai-engine.php') ||
		is_plugin_active('ai-engine-pro/ai-engine-pro.php')
	);
}


add_action('wp_footer', function () {

	// Cargar función is_plugin_active si no está disponible
	if (!function_exists('is_plugin_active')) {
		include_once(ABSPATH . 'wp-admin/includes/plugin.php');
	}

	// Verificamos si AI Engine está activo
	// Si AI Engine (free o pro) NO está activo → no hacemos nada
	if (!is_ai_engine_active()) return;

	// Verificamos si Polylang está activo
	if (!function_exists('pll_current_language')) return;

	$lang = pll_current_language(); // ej: es, en, fr

	switch ($lang) {
		case 'en':
			echo '<!-- CHATBOT EN -->' . do_shortcode('[mwai_chatbot id="chatbot-en"]') . '<!-- /CHATBOT EN -->';
			break;

		default: // Español u otro idioma por defecto
			echo '<!-- CHATBOT ES -->' . do_shortcode('[mwai_chatbot id="chatbot-es"]') . '<!-- /CHATBOT ES -->';
			break;
	}
}, 20);



//! Leyendo datos de config del chatbot para usarlos en JS, para personalizar el header móvil del chatbot

add_action('wp_footer', function () {

	if (wp_doing_ajax() || is_admin()) return;
	if (!is_ai_engine_active()) return;

	$all    = get_option('mwai_chatbots', []);
	$custom = get_option('mwai_chatbots_custom', []);
	$bots   = array_merge($all, $custom);

	// Ajustar orden → Default, ES, EN (o los que uses)
	$export = [
		"default" => [
			'headerSubtitle' => $bots[0]['headerSubtitle'] ?? '',
			'headerText'     => $bots[0]['headerText'] ?? ($bots[0]['aiName'] ?? ''),
			'aiAvatarUrl'    => $bots[0]['aiAvatarUrl'] ?? '',
		],
		"chatbot-es" => [
			'headerSubtitle' => $bots[1]['headerSubtitle'] ?? '',
			'headerText'     => $bots[1]['headerText'] ?? ($bots[1]['aiName'] ?? ''),
			'aiAvatarUrl'    => $bots[1]['aiAvatarUrl'] ?? '',
		],
		"chatbot-en" => [
			'headerSubtitle' => $bots[2]['headerSubtitle'] ?? '',
			'headerText'     => $bots[2]['headerText'] ?? ($bots[2]['aiName'] ?? ''),
			'aiAvatarUrl'    => $bots[2]['aiAvatarUrl'] ?? '',
		],
	];
?>
	<script>
		window.AIEngine_BOTS = <?php echo wp_json_encode($export); ?>;
	</script>
<?php
});


add_action('wp_footer', function () {

	if (!is_ai_engine_active()) return;
?>
	<script>
		window.addEventListener('load', function() {
			// document.addEventListener('DOMContentLoaded', function() {

			function applyMobileHeader() {

				// console.log('Applying mobile header customization...');

				document.querySelectorAll('.mwai-mobile-header').forEach(header => {

					if (header.dataset.aiengineDone) return;

					const chatRoot = header.closest('.mwai-chat');
					if (!chatRoot) return;

					const rootId = chatRoot.id;
					if (!rootId || !rootId.startsWith('mwai-chatbot-')) return;

					const botId = rootId.replace('mwai-chatbot-', '');
					if (!botId || !window.AIEngine_BOTS || !window.AIEngine_BOTS[botId]) return;

					const cfg = window.AIEngine_BOTS[botId];

					const finalTitle =
						(cfg.headerSubtitle && cfg.headerText) ?
						`<span class="chatbot-header-subtitle">${cfg.headerSubtitle}</span> <span class="chatbot-header-ai_name">${cfg.headerText}</span>` :
						(cfg.headerText || cfg.headerSubtitle || "Chatbot");

					const titleNode = header.querySelector('.mwai-mobile-header-title');
					if (titleNode) {
						titleNode.innerHTML = finalTitle;
					}

					// AVATAR MÓVIL
					if (cfg.aiAvatarUrl && !header.querySelector('.aiengine-avatar')) {

						let avatarSrc = cfg.aiAvatarUrl;

						if (!avatarSrc.match(/^https?:\/\//) && !avatarSrc.startsWith('/')) {
							const existingAvatar = document.querySelector('.mwai-window-box .mwai-avatar img');
							if (existingAvatar && existingAvatar.src) {
								const base = existingAvatar.src.replace(/[^\/]+$/, '');
								avatarSrc = base + avatarSrc;
							}
						}

						const img = document.createElement('img');
						img.src = avatarSrc;
						img.className = 'aiengine-avatar';
						img.style.width = '28px';
						img.style.height = '28px';
						img.style.borderRadius = '50%';
						img.style.marginRight = '10px';
						img.style.objectFit = 'cover';

						header.insertBefore(img, header.firstChild);
					}

					header.dataset.aiengineDone = "1";
				});
			}


			// 1. Seleccionar todas las .mwai-window-box existentes
			const boxes = document.querySelectorAll('.mwai-window-box');

			boxes.forEach(box => {
				// 2. Observar SOLO ESTA BOX porque es la que cambia dinámicamente
				const obs = new MutationObserver(() => applyMobileHeader(box));
				obs.observe(box, {
					childList: true,
					subtree: true
				});

				// 3. Ejecutar una vez por si el header ya está renderizado
				applyMobileHeader(box);
			});


		});
	</script>
<?php
});


//! END Leyendo datos de config del chatbot para usarlos en JS









/**
 * ! Obtener lista de URLs reales desde el sitemap XML
 * ! y añadirlas al contexto del chatbot.
 */
/**
 * EQM — Inyectar reglas + idioma + sitemap en UI Mode (non-stream)
 */

// === 1) Detectar automáticamente el sitemap activo (WP nativo o Yoast/RankMath) ===
function eqm_get_sitemap_urls()
{
	$cache_key = 'eqm_sitemap_urls';
	$cached = get_transient($cache_key);
	if ($cached !== false) return $cached;

	$domain = rtrim(home_url(), '/');

	// Intentamos ambos formatos (depende de Yoast o WP core)
	$sitemaps = [
		$domain . '/sitemap_index.xml',
		$domain . '/wp-sitemap.xml'
	];

	$urls = [];

	foreach ($sitemaps as $sitemap) {
		$response = wp_remote_get($sitemap);
		if (is_wp_error($response)) continue;
		$body = wp_remote_retrieve_body($response);

		preg_match_all('~<loc>([^<]+)</loc>~', $body, $matches);
		foreach ($matches[1] as $url) {
			if (strpos($url, $domain) === 0) {
				$urls[] = rtrim($url, '/');
			}
		}
	}

	$urls = array_unique($urls);
	set_transient($cache_key, $urls, 12 * HOUR_IN_SECONDS);
	return $urls;
}

function eqm_map_es_en_urls()
{
	if (!function_exists('pll_get_post')) {
		return []; // Polylang no disponible
	}

	$map = [];

	// Obtenemos todas las páginas finales indexables
	$pages = get_posts([
		'post_type' => 'page',
		'numberposts' => -1,
		'post_status' => 'publish'
	]);

	foreach ($pages as $page) {
		$id_es = pll_get_post($page->ID, 'es');
		$id_en = pll_get_post($page->ID, 'en');

		// Solo mapear si existe la traducción en ambos idiomas
		if ($id_es && $id_en) {
			$url_es = rtrim(get_permalink($id_es), '/');
			$url_en = rtrim(get_permalink($id_en), '/');

			// Creamos clave semántica para detección → texto normalizado
			$key = sanitize_title(get_the_title($id_es));

			$map[$key] = [
				'es' => $url_es,
				'en' => $url_en
			];
		}
	}

	return $map;
}

// === 3) Inyectar idioma + lista de URLs en el motor UI (modo Chat, sin streaming) ===
/**
 * EQM — Inyectar prompt + idioma + sitemap en modo UI Streaming
 */
add_filter('mwai_window_chatbot_settings', function ($settings, $botId) {

	error_log("🔥 MWAI WINDOW SETTINGS ejecutado para botId = [$botId]");

	// Normalizamos por si hubiera espacios invisibles
	$botId = trim($botId);

	// Aplica a ambos chatbots
	if ($botId !== 'chatbot-es' && $botId !== 'chatbot-en') {
		error_log("⛔ No se aplica a este botId.");
		return $settings;
	}

	error_log("✅ Aplicando reglas a: $botId");

	$map = eqm_map_es_en_urls();

	$rules = "\n\n📌 ASOCIACIONES AUTOMÁTICAS (NO INVENTAR URLS)\n" .
		"Usa siempre URLs del sitemap.\n" .
		"Si idioma = español → usar versión ES.\n" .
		"Si idioma = inglés → usar versión EN.\n\n";

	foreach ($map as $slug => $langs) {
		$rules .= "- Tema: {$slug}\n";
		if (isset($langs['es'])) $rules .= "  ES: {$langs['es']}\n";
		if (isset($langs['en'])) $rules .= "  EN: {$langs['en']}\n";
		$rules .= "\n";
	}

	$settings['instructions'] .= "\n\n" . $rules;
	return $settings;
}, 99, 2);

add_filter('mwai_ui_prepare_message', function ($message) {
	$patterns = [
		'analítica' => 'explotar-mis-datos-y-tomar-mejores-decisiones',
		'datos' => 'explotar-mis-datos-y-tomar-mejores-decisiones',
		'transformación digital' => 'transformacion-digital',
		'automatización' => 'transformacion-digital',
		'industria' => 'sectores/industria',
		'agroalimentario' => 'sectores/agroalimentario',
		'químico' => 'sectores/quimico',
		'transporte' => 'sectores/transporte',
		'servicios sanitarios' => 'sectores/servicios-sanitarios',
		'dynamics 365' => 'soluciones/dynamics-365-sales',
		'crm' => 'soluciones/dynamics-365-sales'
	];
	$message['eqm_topics'] = $patterns;
	return $message;
}, 20);


/**
 * !Forzar idioma de respuesta según idioma de la página (Polylang)
 */
add_filter('mwai_chat_system_message', function ($system_message) {

	if (!function_exists('pll_current_language')) {
		return $system_message; // Por si Polylang no está cargado
	}

	$lang = pll_current_language(); // ej: 'es' o 'en'

	if ($lang === 'en') {
		$system_message .= "\nResponde siempre en inglés británico.\n";
	} else {
		$system_message .= "\nResponde siempre en español de España.\n";
	}

	return $system_message;
}, 20);


// =============================================================================
// SHORTCODE: [megamenu-cat-by-cpt cpt="producto"]
// Muestra las taxonomías de un CPT en forma de megamenú jerárquico:
// - Primer nivel: grupos con icono (campo 'icono' de la taxonomía)
// - Segundo nivel: enlaces a las subcategorías
// =============================================================================

function megamenu_cat_by_cpt( $atts = [] ) {

	$atts = shortcode_atts( [
		'cpt'       => false,
		'level'     => 0,     // 0 = all levels, 1 = root only, 2 = root + children
		'separator' => 'true', // 'false' to hide group separators
	], $atts );

	$cpt           = $atts['cpt'];
	$max_level     = (int) $atts['level']; // 0 means no limit
	$show_sep      = $atts['separator'] !== 'false';

	if ( ! $cpt ) {
		return '⛔️ You must pass the CPT name on the shortcode: cpt="cpt_name"';
	}

	// Auto-detect the first taxonomy registered for this CPT
	$taxonomies = get_object_taxonomies( $cpt, 'objects' );
	if ( empty( $taxonomies ) ) {
		return '⛔️ No taxonomies found for CPT: ' . esc_html( $cpt );
	}
	$taxonomy = array_values( $taxonomies )[0]->name;

	// Get root-level terms (parent = 0)
	$root_terms = get_terms( [
		'taxonomy'   => $taxonomy,
		'parent'     => 0,
		'hide_empty' => false,
	] );

	if ( is_wp_error( $root_terms ) || empty( $root_terms ) ) {
		return '';
	}

	// Sort root terms by 'orden' meta
	usort( $root_terms, function ( $a, $b ) {
		$orden_a = (int) get_term_meta( $a->term_id, 'orden', true );
		$orden_b = (int) get_term_meta( $b->term_id, 'orden', true );
		return $orden_a <=> $orden_b;
	} );

	// Helper: returns the single CPT post permalink if a term has exactly 1 post,
	// or null otherwise. Only fires a WP_Query when $term->count === 1.
	$get_single_url = function ( $term_id ) use ( $cpt, $taxonomy ) {
		$q = new WP_Query( [
			'post_type'      => $cpt,
			'posts_per_page' => 1,
			'fields'         => 'ids',
			'no_found_rows'  => true,
			'tax_query'      => [ [
				'taxonomy'         => $taxonomy,
				'field'            => 'term_id',
				'terms'            => $term_id,
				'include_children' => false,
			] ],
		] );
		return ( $q->post_count === 1 ) ? get_permalink( $q->posts[0] ) : null;
	};

	$output   = '';
	$grp_count = 0;

	$output .= '<div class="mega-menu-container category-groups">';

	foreach ( $root_terms as $root ) {

		// Get direct children, sorted by 'orden'
		$children = get_terms( [
			'taxonomy'   => $taxonomy,
			'parent'     => $root->term_id,
			'hide_empty' => false,
		] );

		if ( is_wp_error( $children ) ) {
			$children = [];
		}

		usort( $children, function ( $a, $b ) {
			$orden_a = (int) get_term_meta( $a->term_id, 'orden', true );
			$orden_b = (int) get_term_meta( $b->term_id, 'orden', true );
			return $orden_a <=> $orden_b;
		} );

		$has_children = ! empty( $children );

		// Skip if no children and no direct products
		if ( ! $has_children && $root->count === 0 ) {
			continue;
		}

		// Separator between groups (not before the first, skipped if separator="false")
		if ( $show_sep && $grp_count > 0 ) {
			$output .= '<div class="wp-block-group mmenu-separator"><hr class="wp-block-separator has-alpha-channel-opacity"></div>';
		}

		// Icon and menu description via Pods
		$icon_src  = '';
		$menu_desc = '';
		if ( function_exists( 'pods' ) ) {
			$pods_term = pods( $taxonomy, $root->term_id );
			if ( $pods_term ) {
				$icon_src  = $pods_term->field( 'icono._src.full' );
				$menu_desc = $pods_term->field( 'menu_desc' );
			}
		}

		// If leaf with exactly 1 product, link directly to that product
		$root_single = ( ! $has_children && $root->count === 1 )
			? $get_single_url( $root->term_id )
			: null;
		$term_link = $root_single ?? get_term_link( $root );
		$term_name = esc_html( $root->name );

		$output .= '<section class="wp-block-group category-group" data-count="' . $grp_count . '" data-id="' . $root->term_id . '" data-name="' . esc_attr( $root->name ) . '">';

		// First-level term: same HTML as megamenu-cpt-by-cat product items
		$output .= '<div class="wp-block-group item-list">';
		$output .= '<div class="wp-block-group mega-menu-item">';
		$output .= '<a href="' . esc_url( $term_link ) . '">';
		$output .= '<div class="grid-item-content">';
		$output .= '<div class="wp-block-group item-icon">';
		if ( $icon_src ) {
			$output .= '<img src="' . esc_url( $icon_src ) . '" alt="' . $term_name . '">';
		}
		$output .= '</div>';
		$output .= '<div class="wp-block-group item-content">';
		$output .= '<h3 class="wp-block-heading">' . $term_name . '</h3>';
		if ( $menu_desc ) {
			$output .= '<p class="description">' . esc_html( $menu_desc ) . '</p>';
		}
		$output .= '</div>';
		$output .= '</div>';
		$output .= '</a>';
		$output .= '</div>';
		$output .= '</div>';

		// Second-level children (omit if level="1")
		if ( $has_children && ( $max_level === 0 || $max_level >= 2 ) ) {
			$output .= '<ul class="tax-child-list">';
			foreach ( $children as $child ) {
				// If child has exactly 1 product, link directly to that product
				$child_single = ( $child->count === 1 )
					? $get_single_url( $child->term_id )
					: null;
				$child_link = $child_single ?? get_term_link( $child );
				$child_name = esc_html( $child->name );
				$output .= '<li class="tax-child-item">';
				$output .= '<a href="' . esc_url( $child_link ) . '">' . $child_name . '</a>';
				$output .= '</li>';
			}
			$output .= '</ul>';
		}

		$output .= '</section>';
		$grp_count++;
	}

	$output .= '</div>'; // .mega-menu-container

	return wp_svg_inline_filter( $output );
}
add_shortcode( 'megamenu-cat-by-cpt', 'megamenu_cat_by_cpt' );


// =============================================================================
// SHORTCODE: [mobile-menu-cat-by-cpt cpt="producto"]
// Mobile equivalent of [megamenu-cat-by-cpt]: renders root-level taxonomy terms
// with the same HTML as [mobile-menu-cpt] (.sub-menu-mobile-item).
// =============================================================================

function mobile_menu_cat_by_cpt( $atts = [] ) {

	$atts = shortcode_atts( [
		'cpt'  => false,
		'icon' => 'true',
	], $atts );

	$cpt        = $atts['cpt'];
	$show_icons = filter_var( $atts['icon'], FILTER_VALIDATE_BOOLEAN );

	if ( ! $cpt ) {
		return '⛔️ You must pass the CPT name on the shortcode: cpt="cpt_name"';
	}

	// Auto-detect the first taxonomy registered for this CPT
	$taxonomies = get_object_taxonomies( $cpt, 'objects' );
	if ( empty( $taxonomies ) ) {
		return '⛔️ No taxonomies found for CPT: ' . esc_html( $cpt );
	}
	$taxonomy = array_values( $taxonomies )[0]->name;

	// Get root-level terms (parent = 0), sorted by 'orden' meta
	$root_terms = get_terms( [
		'taxonomy'   => $taxonomy,
		'parent'     => 0,
		'hide_empty' => false,
	] );

	if ( is_wp_error( $root_terms ) || empty( $root_terms ) ) {
		return '';
	}

	usort( $root_terms, function ( $a, $b ) {
		$orden_a = (int) get_term_meta( $a->term_id, 'orden', true );
		$orden_b = (int) get_term_meta( $b->term_id, 'orden', true );
		return $orden_a <=> $orden_b;
	} );

	// Helper: returns the single CPT post permalink if a term has exactly 1 post,
	// or null otherwise.
	$get_single_url = function ( $term_id ) use ( $cpt, $taxonomy ) {
		$q = new WP_Query( [
			'post_type'      => $cpt,
			'posts_per_page' => 1,
			'fields'         => 'ids',
			'no_found_rows'  => true,
			'tax_query'      => [ [
				'taxonomy'         => $taxonomy,
				'field'            => 'term_id',
				'terms'            => $term_id,
				'include_children' => false,
			] ],
		] );
		return ( $q->post_count === 1 ) ? get_permalink( $q->posts[0] ) : null;
	};

	$items = [];

	foreach ( $root_terms as $root ) {

		$has_children = ! empty( get_terms( [
			'taxonomy'   => $taxonomy,
			'parent'     => $root->term_id,
			'hide_empty' => false,
			'fields'     => 'ids',
			'number'     => 1,
		] ) );

		// Skip if no children and no direct products
		if ( ! $has_children && $root->count === 0 ) {
			continue;
		}

		// Icon via Pods
		$icon_src = '';
		if ( $show_icons && function_exists( 'pods' ) ) {
			$pods_term = pods( $taxonomy, $root->term_id );
			if ( $pods_term ) {
				$icon_src = $pods_term->field( 'icono._src.full' );
			}
		}

		// If leaf with exactly 1 product, link directly to that product
		$root_single = ( ! $has_children && $root->count === 1 )
			? $get_single_url( $root->term_id )
			: null;
		$term_link = $root_single ?? get_term_link( $root );
		$term_name = esc_html( $root->name );
		$orden     = (int) get_term_meta( $root->term_id, 'orden', true );

		$items[] = compact( 'term_link', 'term_name', 'orden', 'icon_src' );
	}

	if ( empty( $items ) ) {
		return '';
	}

	$output = '';

	if ( ! $show_icons ) {
		// Simple list mode
		$output .= '<ul class="wp-block-list cpt-category-list">';
		foreach ( $items as $item ) {
			$output .= '<li class="list-item">';
			$output .= '<a href="' . esc_url( $item['term_link'] ) . '" data-order="' . $item['orden'] . '">' . $item['term_name'] . '</a>';
			$output .= '</li>';
		}
		$output .= '</ul>';
	} else {
		// Card mode with icons
		foreach ( $items as $item ) {
			$output .= '<div class="sub-menu-mobile-item">';
			$output .= '<a href="' . esc_url( $item['term_link'] ) . '" data-category="' . $item['term_name'] . '" data-order="' . $item['orden'] . '">';
			$output .= '<div class="grid-item-content">';
			$output .= '<div class="item-icon">';
			if ( $item['icon_src'] ) {
				$output .= '<img src="' . esc_url( $item['icon_src'] ) . '" alt="' . $item['term_name'] . '">';
			}
			$output .= '</div>';
			$output .= '<div class="item-title">' . $item['term_name'] . '</div>';
			$output .= '</div>';
			$output .= '</a>';
			$output .= '</div>';
		}
	}

	return wp_svg_inline_filter( $output );
}
add_shortcode( 'mobile-menu-cat-by-cpt', 'mobile_menu_cat_by_cpt' );





// =============================================================================
// GUTENBERG BUTTON BLOCK — Inyectar SVG según clase CSS del botón
// Uso: añade al botón en el editor una clase con el nombre del icono + sufijo
// de posición opcional. Ejemplos:
//   "download"        → SVG download después del texto (defecto)
//   "download-before" → SVG download antes del texto
//   "download-after"  → SVG download después del texto (explícito)
// Se pueden combinar múltiples iconos: "download-before pdf-after"
// =============================================================================

add_filter( 'render_block_core/button', function ( $block_content, $block ) {

	$class_name = $block['attrs']['className'] ?? '';
	if ( ! $class_name ) {
		return $block_content;
	}

	// Mapa clave → SVG. Añadir o modificar entradas según necesidad.
	$svg_map = [

		'download' => '<svg class="svg-downloading" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.1"><path d="M12 21c-4.97 0-9-4.03-9-9c0-4.97 4.03-9 9-9"/><path class="svg-dl-ring" stroke-dasharray="2 4" stroke-dashoffset="6" d="M12 3c4.97 0 9 4.03 9 9c0 4.97-4.03 9-9 9"/><path d="M12 8v7.5"/><path d="M12 15.5l3.5-3.5M12 15.5l-3.5-3.5"/></g></svg>',

		'pdf'    => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-file-type-pdf"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v4" /><path d="M5 18h1.5a1.5 1.5 0 0 0 0 -3h-1.5v6" /><path d="M17 18h2" /><path d="M20 15h-3v6" /><path d="M11 15v6h1a2 2 0 0 0 2 -2v-2a2 2 0 0 0 -2 -2h-1" /></svg>',

		'arrow' => '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><line x1="40" y1="128" x2="216" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line><polyline points="144 56 216 128 144 200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></polyline></svg>',

	];

	$classes     = explode( ' ', $class_name );
	$before_svgs = [];
	$after_svgs  = [];

	foreach ( $svg_map as $key => $svg ) {
		// Añadir class="ico-{key}" al SVG
		$svg_with_class = preg_replace( '/<svg\b/', '<svg class="ico-' . $key . '"', $svg, 1 );

		if ( in_array( $key . '-before', $classes, true ) ) {
			$before_svgs[] = $svg_with_class;
		} elseif ( in_array( $key . '-after', $classes, true ) || in_array( $key, $classes, true ) ) {
			$after_svgs[] = $svg_with_class;
		}
	}

	if ( empty( $before_svgs ) && empty( $after_svgs ) ) {
		return $block_content;
	}

	$svgs_before = implode( '', $before_svgs );
	$svgs_after  = implode( '', $after_svgs );

	$block_content = preg_replace_callback(
		'/(<a\b[^>]*>)(.*?)(<\/a>)/s',
		function ( $m ) use ( $svgs_before, $svgs_after ) {
			$inner_html = $m[2];

			// Limpiar spans residuales del previsualizador del editor (pictau-svg-preview)
			// que pudieran haberse guardado en la BBDD con enfoques anteriores.
			$inner_html = preg_replace( '/<span\b[^>]*class="pictau-svg-preview"[^>]*>.*?<\/span>/s', '', $inner_html );

			// Tags void al inicio (img, figure, video, iframe…) → fuera del span
			preg_match( '/^((?:<(?:img|figure|video|iframe)\b[^>]*\/?>|\s)*)(.*)/s', $inner_html, $parts );
			$before_text = $parts[1] ?? '';
			$text        = $parts[2] ?? $inner_html;
			$span        = '<span>' . $text . '</span>';
			$inner       = $before_text . $svgs_before . $span . $svgs_after;
			return $m[1] . $inner . $m[3];
		},
		$block_content,
		1
	);

	return $block_content;
}, 10, 2 );


// =============================================================================
// FAQs colapsables: parseo, transformación HTML y filtro de bloque Gutenberg
// =============================================================================

function pictau_is_faq_question_node( DOMNode $node ): bool {
	if ( $node->nodeType !== XML_ELEMENT_NODE || $node->nodeName !== 'p' ) {
		return false;
	}
	foreach ( $node->childNodes as $child ) {
		if ( $child->nodeType === XML_ELEMENT_NODE ) {
			return $child->nodeName === 'strong';
		}
	}
	return false;
}

function pictau_format_faqs_collapsable( string $html ): string {
	if ( empty( trim( $html ) ) ) {
		return '';
	}

	$dom = new DOMDocument( '1.0', 'UTF-8' );
	libxml_use_internal_errors( true );
	$dom->loadHTML( '<html><head><meta charset="UTF-8"></head><body>' . $html . '</body></html>' );
	libxml_clear_errors();

	$body = $dom->getElementsByTagName( 'body' )->item( 0 );
	if ( ! $body ) {
		return $html;
	}

	$children = iterator_to_array( $body->childNodes );

	$faqs             = [];
	$current_question = null;
	$current_answer   = [];

	foreach ( $children as $node ) {
		if ( $node->nodeType !== XML_ELEMENT_NODE ) {
			continue;
		}
		if ( pictau_is_faq_question_node( $node ) ) {
			if ( null !== $current_question ) {
				$faqs[] = [ 'q' => $current_question, 'a' => $current_answer ];
			}
			$current_question = $node;
			$current_answer   = [];
		} elseif ( null !== $current_question ) {
			// Skip empty/nbsp-only paragraphs inserted by Quill as spacers
			if ( $node->nodeName === 'p' && trim( str_replace( "\u{00A0}", '', $node->textContent ) ) === '' ) {
				continue;
			}
			$current_answer[] = $node;
		}
	}
	if ( null !== $current_question ) {
		$faqs[] = [ 'q' => $current_question, 'a' => $current_answer ];
	}

	if ( empty( $faqs ) ) {
		return $html;
	}

	$out = '<div class="wp-block-group pct-faqs collapsable is-layout-constrained wp-block-group-is-layout-constrained">';
	foreach ( $faqs as $faq ) {
		$question_text = $faq['q']->textContent;
		$answer_html   = '';
		foreach ( $faq['a'] as $node ) {
			$answer_html .= $dom->saveHTML( $node );
		}
		$out .= '<div class="wp-block-group faq is-layout-constrained wp-block-group-is-layout-constrained">';
		$out .= '<p>' . esc_html( $question_text ) . '</p>';
		$out .= '<div class="wp-block-group is-layout-constrained wp-block-group-is-layout-constrained">';
		$out .= '<div class="wp-block-group is-layout-constrained wp-block-group-is-layout-constrained">';
		$out .= $answer_html;
		$out .= '</div>';
		$out .= '</div>';
		$out .= '</div>';
	}
	$out .= '</div>';

	return $out;
}

add_filter( 'render_block_core/group', 'pictau_render_faq_group_block', 10, 2 );

function pictau_render_faq_group_block( string $block_content, array $block ): string {
	$classes = $block['attrs']['className'] ?? '';
	if ( ! str_contains( $classes, 'pct-faqs' ) || ! str_contains( $classes, 'collapsable' ) ) {
		return $block_content;
	}

	$dom = new DOMDocument( '1.0', 'UTF-8' );
	libxml_use_internal_errors( true );
	$dom->loadHTML( '<html><head><meta charset="UTF-8"></head><body>' . $block_content . '</body></html>' );
	libxml_clear_errors();

	$body = $dom->getElementsByTagName( 'body' )->item( 0 );
	if ( ! $body ) {
		return $block_content;
	}
	$wrapper = null;
	foreach ( $body->childNodes as $node ) {
		if ( $node->nodeType === XML_ELEMENT_NODE ) {
			$wrapper = $node;
			break;
		}
	}
	if ( ! $wrapper ) {
		return $block_content;
	}
	$inner_html = '';
	foreach ( $wrapper->childNodes as $child ) {
		$inner_html .= $dom->saveHTML( $child );
	}

	return pictau_format_faqs_collapsable( $inner_html );
}

add_filter( 'render_block_core/group', 'pictau_render_group_link_block', 20, 2 );

function pictau_render_group_link_block( string $block_content, array $block ): string {
	$url = trim( $block['attrs']['groupLink'] ?? '' );
	if ( empty( $url ) ) {
		return $block_content;
	}

	$is_new_tab = ( $block['attrs']['groupLinkTarget'] ?? '' ) === '_blank';
	$target     = $is_new_tab ? ' target="_blank"' : '';

	$rel_parts  = $is_new_tab ? [ 'noopener', 'noreferrer' ] : [];
	$custom_rel = trim( $block['attrs']['groupLinkRel'] ?? '' );
	if ( ! empty( $custom_rel ) ) {
		foreach ( explode( ' ', $custom_rel ) as $r ) {
			if ( $r !== '' && ! in_array( $r, $rel_parts, true ) ) {
				$rel_parts[] = esc_attr( $r );
			}
		}
	}
	$rel = ! empty( $rel_parts ) ? ' rel="' . implode( ' ', $rel_parts ) . '"' : '';

	$extra_class = trim( $block['attrs']['groupLinkClass'] ?? '' );
	$class       = 'group-link-wrapper' . ( $extra_class !== '' ? ' ' . esc_attr( $extra_class ) : '' );

	return '<a href="' . esc_url( $url ) . '"' . $target . $rel . ' class="' . $class . '">' . $block_content . '</a>';
}

//! HERO SLIDER: CPT slide → Splide.js full-width hero slider
function hero_slider_shortcode($atts = [], $content = '')
{
	$atts = shortcode_atts([
		'delay'        => 7.5,
		'draggable'    => 'yes',
		'customarrows' => '',
		'arrows'       => 'no',
		'bullets'      => 'yes',
		'callback'     => '',
		'limit'        => -1,
		'transition'    => 'slide',
		'fade_speed'    => 0.8,
		'category'      => '',
		'pauseonfocus'  => 'no',
		'random'        => 'no',
		'loader'        => 'true',
	], $atts);

	if (!post_type_exists('slide')) return '';

	$limit     = intval($atts['limit']);
	$category  = sanitize_text_field($atts['category']);
	$random    = $atts['random'] === 'yes' || $atts['random'] === '1';
	$curr_lang = function_exists('pll_current_language') ? pll_current_language() : 'es';

	// Exclude slides whose caducidad datetime has already passed.
	// Pods saves '0000-00-00 00:00:00' when clearing a datetime field, so handle it alongside ''.
	$expiry_filter = [
		'relation' => 'OR',
		['key' => 'caducidad', 'compare' => 'NOT EXISTS'],
		['key' => 'caducidad', 'value' => ['', '0000-00-00 00:00:00'], 'compare' => 'IN'],
		['key' => 'caducidad', 'value' => current_time('mysql'), 'compare' => '>', 'type' => 'DATETIME'],
	];

	$query_args = [
		'post_type'      => 'slide',
		'posts_per_page' => -1, // fetch all; limit applied after PHP sort
		'no_found_rows'  => true,
		'lang'           => $curr_lang,
		'meta_query'     => $expiry_filter,
	];

	if ($category) {
		$query_args['tax_query'] = [ [
			'taxonomy' => 'slide_category',
			'field'    => 'slug',
			'terms'    => $category,
		] ];
	}

	$query = new WP_Query($query_args);

	if (!$query->have_posts()) {
		if (!current_user_can('edit_posts')) {
			$tagline = get_bloginfo('description');
			if (!$tagline) return '';
			return '<div class="hero-slider-fallback">'
				. '<h1>' . esc_html($tagline) . '</h1>'
				. '</div>';
		}
		$cat_label = $category ? ' category="' . esc_html($category) . '"' : '';
		return '<div class="hero-slider-empty-warning">'
			. '<p>' . sprintf(
				/* translators: %s: shortcode example */
				esc_html__('⚠ No hay slides disponibles para %s. Comprueba el CPT Slides.', 'pictau'),
				'<code>[hero-slider' . $cat_label . ']</code>'
			) . '</p>'
			. '<p><a href="' . esc_url(admin_url('edit.php?post_type=slide' . ($category ? '&slide_category=' . urlencode($category) : ''))) . '">'
			. esc_html__('Ver slides en el administrador →', 'pictau')
			. '</a></p>'
			. '</div>';
	}

	// Collect all slides with sorting metas for PHP-side ordering
	$slides_data = [];
	while ($query->have_posts()) {
		$query->the_post();
		$pid       = get_the_ID();
		$caducidad = get_post_meta($pid, 'caducidad', true);
		if ($caducidad === '0000-00-00 00:00:00') $caducidad = '';
		$orden_raw = get_post_meta($pid, 'orden', true);
		$slides_data[] = [
			'post'      => get_post(),
			'caducidad' => $caducidad,
			'orden'     => ($orden_raw !== '' && $orden_raw !== null) ? (int) $orden_raw : PHP_INT_MAX,
		];
	}
	wp_reset_postdata();

	// When any active slide has a caducidad, order by nearest expiry first (overrides random)
	$has_caducidad = !empty(array_filter($slides_data, fn($s) => !empty($s['caducidad'])));

	if ($has_caducidad) {
		usort($slides_data, function ($a, $b) {
			$a_has = !empty($a['caducidad']);
			$b_has = !empty($b['caducidad']);
			if ($a_has !== $b_has) return $a_has ? -1 : 1;
			if ($a_has) return strcmp($a['caducidad'], $b['caducidad']); // ISO datetime strings sort correctly
			return $a['orden'] <=> $b['orden'];
		});
	} elseif ($random) {
		shuffle($slides_data);
	} else {
		usort($slides_data, fn($a, $b) => $a['orden'] <=> $b['orden']);
	}

	if ($limit > 0) {
		$slides_data = array_slice($slides_data, 0, $limit);
	}

	$slides_output = '';

	foreach ($slides_data as $slide) {
		$GLOBALS['post'] = $slide['post'];
		setup_postdata($GLOBALS['post']);
		$pid      = $slide['post']->ID;
		$slide_cb = preg_replace('/[^a-zA-Z0-9_$]/', '', get_post_meta($pid, 'slide_callback', true));
		$cb_attr  = $slide_cb ? ' data-slide-callback="' . esc_attr($slide_cb) . '"' : '';
		$exp_attr = !empty($slide['caducidad']) ? ' data-slide-expiry="' . esc_attr(str_replace(' ', 'T', $slide['caducidad'])) . '"' : '';
		$slides_output .= '<div class="splide__slide"' . $cb_attr . $exp_attr . '>';
		$slide_content  = apply_filters('the_content', get_the_content());
		$slide_content  = preg_replace_callback('/<img\b[^>]+>/i', function ($m) {
			$img = preg_replace('/\s*loading=["\'][^"\']*["\']/i', '', $m[0]);
			$img = preg_replace('/\s*fetchpriority=["\'][^"\']*["\']/i', '', $img);
			return preg_replace('/<img\b/i', '<img loading="eager" fetchpriority="high"', $img);
		}, $slide_content, 1);
		$slides_output .= $slide_content;
		$slides_output .= '</div>';
	}
	wp_reset_postdata();

	$delay        = max(0.1, (float) $atts['delay']);
	$draggable    = sanitize_text_field($atts['draggable']);
	$customarrows = esc_attr($atts['customarrows']);
	$arrows       = sanitize_text_field($atts['arrows']);
	$bullets      = sanitize_text_field($atts['bullets']);
	$callback     = preg_replace('/[^a-zA-Z0-9_$]/', '', $atts['callback']);
	$transition   = in_array($atts['transition'], ['slide', 'fade'], true) ? $atts['transition'] : 'slide';
	$fade_speed   = max(0.1, (float) $atts['fade_speed']);
	$pauseonfocus = sanitize_text_field($atts['pauseonfocus']);

	$show_loader = ! in_array( $atts['loader'], [ 'false', '0', 'no' ], true );

	$loader = '';
	if ( $show_loader ) {
		$loader  = '<div class="hero-slider-loader" aria-hidden="true">';
		$loader .= '<svg class="hero-loader" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="40" height="40">';
		$loader .= '<path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/>';
		$loader .= '<path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"/>';
		$loader .= '</svg></div>';
	}

	$output  = '<div class="hero-slider-container">';
	$output .= '<div data-heroslider';
	$output .= ' data-heroslider_delay="'        . $delay        . '"';
	$output .= ' data-heroslider_draggable="'    . $draggable    . '"';
	$output .= ' data-heroslider_arrows="'       . $arrows       . '"';
	$output .= ' data-heroslider_bullets="'      . $bullets      . '"';
	$output .= ' data-heroslider_customarrows="' . $customarrows . '"';
	$output .= ' data-heroslider_callback="'     . $callback     . '"';
	$output .= ' data-heroslider_transition="'    . $transition   . '"';
	$output .= ' data-heroslider_fadespeed="'     . $fade_speed   . '"';
	$output .= ' data-heroslider_pauseonfocus="'  . $pauseonfocus . '"';
	$output .= '><div>' . $slides_output . '</div></div>';
	$output .= $loader;
	$output .= '</div>';

	return $output;
}
add_shortcode('hero-slider', 'hero_slider_shortcode');

// =============================================================================
// HERO SLIDER: Admin notice — aviso si alguna página usa [hero-slider] sin slides
// =============================================================================

add_action('admin_notices', 'hero_slider_admin_notice_empty');
function hero_slider_admin_notice_empty()
{
	if (!current_user_can('edit_posts')) return;
	if (!post_type_exists('slide')) return;

	global $wpdb;
	$pages = $wpdb->get_results(
		"SELECT ID, post_title, post_content
		 FROM {$wpdb->posts}
		 WHERE post_status = 'publish'
		   AND post_content LIKE '%[hero-slider%'
		   AND post_type NOT IN ('revision', 'attachment')"
	);
	if (empty($pages)) return;

	$warnings = [];

	foreach ($pages as $page) {
		if (!preg_match_all('/\[hero-slider\b([^\]]*)\]/i', $page->post_content, $matches)) continue;

		foreach ($matches[1] as $atts_str) {
			$atts     = shortcode_parse_atts($atts_str);
			$category = isset($atts['category']) ? sanitize_text_field($atts['category']) : '';

			$expiry_filter = [
				'relation' => 'OR',
				['key' => 'caducidad', 'compare' => 'NOT EXISTS'],
				['key' => 'caducidad', 'value' => ['', '0000-00-00 00:00:00'], 'compare' => 'IN'],
				['key' => 'caducidad', 'value' => current_time('mysql'), 'compare' => '>', 'type' => 'DATETIME'],
			];
			$query_args = [
				'post_type'      => 'slide',
				'post_status'    => 'publish',
				'posts_per_page' => 1,
				'fields'         => 'ids',
				'meta_query'     => $expiry_filter,
			];
			if ($category) {
				$query_args['tax_query'] = [[
					'taxonomy' => 'slide_category',
					'field'    => 'slug',
					'terms'    => $category,
				]];
			}

			$check = new WP_Query($query_args);
			if ($check->post_count > 0) continue;

			$cat_label  = $category ? ' category="' . esc_html($category) . '"' : '';
			$edit_url   = get_edit_post_link($page->ID);
			$slides_url = admin_url('edit.php?post_type=slide' . ($category ? '&slide_category=' . urlencode($category) : ''));

			$warnings[] = sprintf(
				'<li><strong>%s</strong> — %s <code>[hero-slider%s]</code>. <a href="%s">%s</a> | <a href="%s">%s</a></li>',
				esc_html($page->post_title),
				esc_html__('ningún slide disponible para', 'pictau'),
				$cat_label,
				esc_url($edit_url),
				esc_html__('Editar página', 'pictau'),
				esc_url($slides_url),
				esc_html__('Ver slides', 'pictau')
			);
		}
	}

	if (empty($warnings)) return;

	echo '<div class="notice notice-error is-dismissible">';
	echo '<p><strong>' . esc_html__('⚠ Hero Slider: sin slides disponibles', 'pictau') . '</strong></p>';
	echo '<ul>' . implode('', $warnings) . '</ul>';
	echo '</div>';
}

// =============================================================================
// HERO SLIDER: Saneamiento de caducidad — normaliza el zero-date de Pods
// =============================================================================

// Pods guarda '0000-00-00 00:00:00' al borrar un campo datetime. Lo convertimos a ''
// para que las queries y columnas admin lo traten correctamente como "sin caducidad".
add_action('save_post_slide', function ($post_id) {
	if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
	$caducidad = get_post_meta($post_id, 'caducidad', true);
	if ($caducidad === '0000-00-00 00:00:00') {
		update_post_meta($post_id, 'caducidad', '');
	}
}, 100);

// =============================================================================
// HERO SLIDER: WP-Cron — despublicar slide en su fecha de caducidad y limpiar caché
// =============================================================================

add_action('save_post_slide', 'hero_slider_schedule_expiry', 20, 2);
function hero_slider_schedule_expiry($post_id, $post)
{
	if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
	if (defined('DOING_CRON') && DOING_CRON) return;
	if ($post->post_status !== 'publish') return;

	$caducidad = get_post_meta($post_id, 'caducidad', true);

	// Cancel any previously scheduled event for this slide
	wp_clear_scheduled_hook('hero_slider_expire_slide', [$post_id]);

	if (!$caducidad) return;

	// Parse the stored datetime as WP timezone — same SOT as the meta_query filter
	// which uses current_time('mysql') (WP local time) for comparison.
	$dt = DateTime::createFromFormat('Y-m-d H:i:s', $caducidad, wp_timezone());
	$ts = $dt ? $dt->getTimestamp() : false;
	if ($ts && $ts > time()) {
		wp_schedule_single_event($ts, 'hero_slider_expire_slide', [$post_id]);
	}
}

add_action('hero_slider_expire_slide', 'hero_slider_do_expire');
function hero_slider_do_expire($post_id)
{
	if (get_post_status($post_id) !== 'publish') return;

	wp_update_post(['ID' => $post_id, 'post_status' => 'draft']);

	// Clear cache — supports multiple common cache plugins
	if (function_exists('wp_cache_clear_cache')) wp_cache_clear_cache();       // WP Super Cache
	do_action('cache_enabler_clear_complete_cache');                            // Cache Enabler
	do_action('w3tc_flush_all');                                                // W3 Total Cache
	if (function_exists('rocket_clean_domain')) rocket_clean_domain();          // WP Rocket
}

// Cancel scheduled event when slide is taken out of publish
add_action('transition_post_status', 'hero_slider_cancel_expiry_on_unpublish', 10, 3);
function hero_slider_cancel_expiry_on_unpublish($new_status, $old_status, $post)
{
	if ($post->post_type !== 'slide') return;
	if ($new_status !== 'publish' && $old_status === 'publish') {
		wp_clear_scheduled_hook('hero_slider_expire_slide', [$post->ID]);
	}
}

// =============================================================================
// ADMIN: Columnas "Categoría" + "Orden" en el listado de Slides
// =============================================================================

add_filter( 'manage_slide_posts_columns', function ( $columns ) {
	$new = [];
	foreach ( $columns as $key => $label ) {
		$new[ $key ] = $label;
		if ( 'title' === $key ) {
			$new['slide_category'] = esc_html__( 'Categoría', 'pictau' );
			$new['orden']          = esc_html__( 'Orden', 'pictau' );
			$new['caducidad']      = esc_html__( 'Caducidad', 'pictau' );
		}
	}
	return $new;
} );

add_action( 'manage_slide_posts_custom_column', function ( $column, $post_id ) {
	if ( 'slide_category' === $column ) {
		$terms = get_the_terms( $post_id, 'slide_category' );
		if ( $terms && ! is_wp_error( $terms ) ) {
			$links = array_map( function ( $term ) {
				return '<a href="' . esc_url( add_query_arg( [
					'post_type'     => 'slide',
					'slide_category' => $term->slug,
				], admin_url( 'edit.php' ) ) ) . '">' . esc_html( $term->name ) . '</a>';
			}, $terms );
			echo implode( ', ', $links );
		} else {
			echo '&mdash;';
		}
	}

	if ( 'orden' === $column ) {
		$pods  = pods( 'slide', $post_id );
		$orden = $pods ? $pods->field( 'orden' ) : '';
		$valor = ( $orden !== '' && $orden !== null ) ? (int) $orden : '';
		// data-orden used by Quick Edit JS to pre-populate the field
		echo '<span class="hidden" data-orden="' . esc_attr( $valor ) . '"></span>';
		echo $valor !== '' ? esc_html( $valor ) : '&mdash;';
	}

	if ( 'caducidad' === $column ) {
		$caducidad = get_post_meta( $post_id, 'caducidad', true );
		if ( $caducidad === '0000-00-00 00:00:00' ) $caducidad = '';
		if ( $caducidad ) {
			// Build display label using gmmktime + date_i18n($fmt, $ts, true) so no PHP/WP
			// timezone offset is applied — the stored Y-m-d H:i:s value is shown as-is,
			// matching what Pods displays in the edit form.
			$ts_display = false;
			if ( preg_match( '/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/', $caducidad, $m ) ) {
				$ts_display = gmmktime( (int) $m[4], (int) $m[5], (int) $m[6], (int) $m[2], (int) $m[3], (int) $m[1] );
			}
			$label = $ts_display !== false
				? date_i18n( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), $ts_display, true )
				: esc_html( $caducidad );
			// Parse stored datetime as WP timezone to get a real UTC timestamp for comparison
			$dt_cad = DateTime::createFromFormat( 'Y-m-d H:i:s', $caducidad, wp_timezone() );
			$ts  = $dt_cad ? $dt_cad->getTimestamp() : 0;
			$now = time(); // UTC Unix timestamp
			if ( $ts && $ts < $now ) {
				echo '<span style="color:#b91c1c;font-weight:600;" title="' . esc_attr__( 'Expirado', 'pictau' ) . '">'. esc_html( $label ) . ' &#9888;</span>';
			} elseif ( $ts && ( $ts - $now ) < 7 * DAY_IN_SECONDS ) {
				echo '<span style="color:#b45309;font-weight:600;" title="' . esc_attr__( 'Próximo a caducar', 'pictau' ) . '">' . esc_html( $label ) . ' &#9200;</span>';
			} else {
				echo esc_html( $label );
			}
		} else {
			echo '&mdash;';
		}
	}
}, 10, 2 );

add_filter( 'manage_edit-slide_sortable_columns', function ( $sortable ) {
	$sortable['orden'] = 'orden';
	return $sortable;
} );

// Quick Edit: campo "Orden"
add_action( 'quick_edit_custom_box', function ( $column_name, $post_type ) {
	if ( 'orden' !== $column_name || 'slide' !== $post_type ) {
		return;
	}
	?>
	<fieldset class="inline-edit-col-right">
		<div class="inline-edit-col">
			<label>
				<span class="title"><?php esc_html_e( 'Slide order', 'pictau' ); ?></span>
				<input type="number" name="pictau_orden_slide" class="pictau-orden-slide" value="" min="0" step="1">
			</label>
		</div>
	</fieldset>
	<?php
}, 10, 2 );

// Quick Edit: guardar el campo via Pods
add_action( 'save_post_slide', function ( $post_id ) {
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( ! isset( $_POST['pictau_orden_slide'] ) ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}
	$valor = $_POST['pictau_orden_slide'];
	$pods  = pods( 'slide', $post_id );
	if ( $pods ) {
		$pods->save( 'orden', $valor !== '' ? (int) $valor : null );
	}
} );

// Al guardar un slide, sincronizar la featured image con el primer bloque core/image del contenido
add_action( 'save_post_slide', function ( $post_id ) {
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
	if ( ! current_user_can( 'edit_post', $post_id ) ) return;

	$post = get_post( $post_id );
	if ( ! $post || empty( $post->post_content ) ) return;
	if ( ! has_blocks( $post->post_content ) ) return;

	foreach ( parse_blocks( $post->post_content ) as $block ) {
		if ( 'core/image' === $block['blockName'] && ! empty( $block['attrs']['id'] ) ) {
			set_post_thumbnail( $post_id, (int) $block['attrs']['id'] );
			break;
		}
	}
} );

// Quick Edit: JS para pre-rellenar el campo con el valor actual de la columna
add_action( 'admin_footer-edit.php', function () {
	$screen = get_current_screen();
	if ( ! $screen || 'slide' !== $screen->post_type ) {
		return;
	}
	?>
	<script>
	( function() {
		const inlineEditPost = window.inlineEditPost;
		if ( ! inlineEditPost ) return;

		const origEdit = inlineEditPost.edit;
		inlineEditPost.edit = function( id ) {
			origEdit.apply( this, arguments );

			const postId = typeof id === 'object' ? parseInt( this.getId( id ) ) : parseInt( id );
			const row    = document.querySelector( '#post-' + postId );
			if ( ! row ) return;

			const span  = row.querySelector( '.column-orden [data-orden]' );
			const input = document.querySelector( '#edit-' + postId + ' .pictau-orden-slide' );
			if ( ! span || ! input ) return;

			input.value = span.dataset.orden ?? '';
		};
	} )();
	</script>
	<?php
} );

// Dropdown filter por categoría en la barra de filtros del listado de slides
add_action( 'restrict_manage_posts', function ( $post_type ) {
	if ( 'slide' !== $post_type ) {
		return;
	}
	$terms = get_terms( [ 'taxonomy' => 'slide_category', 'hide_empty' => false ] );
	if ( empty( $terms ) || is_wp_error( $terms ) ) {
		return;
	}
	$selected = isset( $_GET['slide_category'] ) ? sanitize_text_field( wp_unslash( $_GET['slide_category'] ) ) : '';
	echo '<select name="slide_category">';
	echo '<option value="">' . esc_html__( 'Todas las categorías', 'pictau' ) . '</option>';
	foreach ( $terms as $term ) {
		printf(
			'<option value="%s"%s>%s</option>',
			esc_attr( $term->slug ),
			selected( $selected, $term->slug, false ),
			esc_html( $term->name )
		);
	}
	echo '</select>';
} );

// Aplicar el filtro de categoría en WP_Query del listado de slides
add_action( 'pre_get_posts', function ( $query ) {
	if ( ! is_admin() || ! $query->is_main_query() ) {
		return;
	}
	if ( ( $query->query_vars['post_type'] ?? '' ) !== 'slide' ) {
		return;
	}
	$slug = isset( $_GET['slide_category'] ) ? sanitize_text_field( wp_unslash( $_GET['slide_category'] ) ) : '';
	if ( $slug ) {
		$query->set( 'tax_query', [ [
			'taxonomy' => 'slide_category',
			'field'    => 'slug',
			'terms'    => $slug,
		] ] );
	}
} );


require get_template_directory() . '/inc/events.php';
