<?php
/**
 * Template part for displaying the footer content
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package pictau_tw
 */

?>

<section id="footer">
	<!-- do_shortcode('[anim-bg color="#003f66" origin="80%,50%" speed="1.2"]') -->
	<?php
		// echo do_shortcode('[anim-bg color="#006644" origin="70%,100%" speed="1.2"]');
		// echo do_shortcode('[anim-bg color="#2d5a7d" origin="100%,50%" speed="1.2"]');
	?>
	<div class="footer-container">
	<?php
		$required_plugin = checkPluginActive('pictau-blocks-gutenberg');
		$user_role = get_user_role();
		$show_err_msg = ($user_role === 'administrator' || $user_role === 'editor');

		if ($required_plugin)	{
			// $str = (function_exists('pll_the_languages')) ? do_shortcode('[pictau-blocks id="1862"]') : do_shortcode( get_theme_mod('pictau_block_footer') );


			// $str = (function_exists('pll_the_languages') && get_locale() !== 'es_ES'  ) ? do_shortcode('[pictau-blocks id="1862"]') : do_shortcode( get_theme_mod('pictau_block_footer') );

			$str='';

			// $curr_lang = pll_current_language('locale');
			// $str .= get_theme_mod('pictau_block_footer_'.$curr_lang);
			// $default_lang = function_exists('pll_the_languages') ? pll_default_language('locale') : '';


			if ( function_exists('pll_the_languages')) {
				$str = '';
				/**
				* @disregard P1009 Undefined type
				*/
				$curr_lang = pll_current_language('locale');
				$str .= do_shortcode( get_theme_mod('pictau_block_footer_'.$curr_lang) );

				//if current language missing, use the default language setting for this customizer shortcode...
				if ( !strlen($str) ) {
					/**
					* @disregard P1009 Undefined type
					*/
					$str .= do_shortcode( get_theme_mod('pictau_block_footer_'. pll_default_language('locale')) );
				}
			}
			else {
				if (get_theme_mod('pictau_block_footer')) {
					$str .= do_shortcode( get_theme_mod('pictau_block_footer') );
				}
				else {
					$str .= '⛔️ Please, use the WP Customizer to define a pictau block for footer content';
				}
			}

			if ( !strlen($str) ) {
				if ($show_err_msg) {
					echo '<p>⛔️ You need to create a "Pictau Block" for footer and set its shortcode @ customizer --> PICTAU Theme Customizer --> Footer</p>';
				}
			}
			else {
				echo $str;
			}
		}
		else if ($show_err_msg) {
			echo '<p>⛔️ Please, install and activate PICTAU BLOCKS GUTENBERG and create a pictau block for footer, and setup at Customizer --> PICTAU Theme customizer... </p>' . get_theme_mod('pictau_block_footer') . '  -- required plugin: ' . $required_plugin;
		}

		?>
	</div>
	<div class="copyright-container bg-dark">
		<?php echo apply_shortcodes('[pictau-copyright]'); ?>
	</div>

</section><!-- #colophon -->
