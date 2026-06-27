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
	<div>
		<p class="bg-pattern-footer"></p>

		<div class="footer-container">
			<?php
			$user_role    = get_user_role();
			$show_err_msg = ( $user_role === 'administrator' || $user_role === 'editor' );
			$str          = '';

			if ( function_exists( 'pll_the_languages' ) ) {
				/**
				 * @disregard P1009 Undefined type
				 */
				$curr_lang = pll_current_language( 'locale' );
				$str      .= do_shortcode( get_theme_mod( 'pictau_block_footer_' . $curr_lang ) );

				// Si el idioma actual no tiene block configurado, usa el idioma por defecto.
				if ( ! strlen( $str ) ) {
					/**
					 * @disregard P1009 Undefined type
					 */
					$str .= do_shortcode( get_theme_mod( 'pictau_block_footer_' . pll_default_language( 'locale' ) ) );
				}
			} else {
				$str .= do_shortcode( get_theme_mod( 'pictau_block_footer' ) );
			}

			if ( ! strlen( $str ) && $show_err_msg ) {
				echo '<p style="background-color:#fb9500;color:white;padding:10px;border-radius:5px;">⛔️ ' . esc_html__( 'Crea un "Pictau Block" para el footer y asígnalo en Personalizar → PICTAU Theme Customizer → Footer', 'pictau' ) . '</p>';
			} else {
				echo $str;
			}
			?>
		</div>
		<div class="copyright-container">
			<?php echo apply_shortcodes('[pictau-copyright]'); ?>
		</div>

	</div>


</section><!-- #colophon -->