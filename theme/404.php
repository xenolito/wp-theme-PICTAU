<?php
/**
 * The template for displaying 404 pages (not found)
 *
 * @link https://codex.wordpress.org/Creating_an_Error_404_Page
 *
 * @package pictau_tw
 */

get_header();
?>

	<section id="primary">
		<main id="main">

			<article id="post-404">
				<header class="entry-header has-bg">
					<div class="header-default-bg">
						<?php //echo do_shortcode('[anim-bg color="#8ba939" origin="95%,90%" speed="1.5" size="1500"]'); ?>
						<?php //echo do_shortcode('[anim-bg color="#4e03e7" origin="95%,90%" speed="1.5" size="1500"]'); ?>
						<?php echo do_shortcode('[anim-bg color="#0251b3" origin="70%,50%" speed="1.5" size="1500"]'); ?>
						<?php echo do_shortcode('[anim-bg color="#ff0000" origin="50%,60%" speed="1.5" size="3500"]'); ?>
						<?php echo do_shortcode('[anim-bg color="#8AA738" origin="60%,75%" speed="1.5"]'); ?>
					</div>

					<!-- div class="header-default-bg is-bg full-width full-height" -->
					<div class="entry-header-content layout-site-width">
						<?php
						echo '<h1 class="page-title">'. __('404: Oh, oh...', 'pictau') . '</h1>';
						// the_archive_title( '<h1 class="page-title">', '</h1>' );
						?>
						<div class="header-subtitle">
							<div class="left-border"></div>
									<p data-anim_any data-anim_any_animation="clippedFromLeft" data-anim_any_whattoanim="lines" data-anim_any_duration="1.6" data-anim_any_whattoanim="lines" data-anim_any_delay="0.9" data-anim_any_stagger="0.15">
									<?php echo __('No hemos encontrado eso ¯\_(ツ)_/¯','pictau') ?>

									</p>
							</div>
						</div>
						<div class="header-cover-loading"></div>
			</header><!-- .entry-header -->



				<div <?php pictau_content_class( 'entry-content' ); ?>>


					<p class="text-center text-[1.7rem] pt-[.5rem] mt-0">
						<?php esc_html_e( 'Prueba otro contenido por favor.', 'pictau' ); ?>
					</p>

					<div class="text-[var(--main-color)] min-w-[300px] max-w-[650px] mx-[auto] py-[3rem]" data-astro-cid-zetdm5md="">
						<svg class="text-slate-800 dark:text-[var(--main-color)]" id="Not_found" data-name="Not found" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 482.17 305.29">
  <g id="_404_Not_found" data-name=" 404 Not found">
    <path id="_background" fill="currentColor" data-name=" background" d="M39.53,259.69c17.1,6.8,33.8,12.9,50.4,18.3h357.8c42.2-35.9,37.4-112.9,28.2-163.5-10.1-56.3-120.6-83.3-171.9-96.9C192.23-12.21,96.63,21.19,27.53,101.59.23,133.29-22.27,234.99,39.53,259.69h0Z" isolation="isolate" opacity=".1" stroke-width="0"/>
    <g id="Personaje">
      <path d="M187.43,174.99s-20.1-5.2-29.9-14.3c-14.4-13.4-18.6-32.3-18.6-32.3" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="2"/>
      <path d="M328.13,176.79s6.5,23.1,13.4,25c7.4,2,26-16.2,26-16.2" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="2"/>
      <path d="M326.83,101.59h-107.3l-32.6,31.3v150.6c0,4,4.3,7.6,8.3,7.6h131.6c4,0,6.3-3.6,6.3-7.6V108.59c0-4-2.3-7-6.3-7h0Z" fill="#fff" stroke="currentColor" stroke-miterlimit="10" stroke-width="2"/>
      <path d="M219.13,101.89v23.5c0,4-3.3,7.3-7.3,7.3h-24.7" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="2"/>
      <path d="M236.93,181.39s6.5-8.6,22.8-8.6,22.8,8.6,22.8,8.6" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="2"/>
      <g>
        <line x1="201.83" y1="238.59" x2="317.53" y2="238.59" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="2"/>
        <line x1="201.83" y1="254.49" x2="317.53" y2="254.49" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="2"/>
        <line x1="201.83" y1="270.29" x2="259.63" y2="270.29" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="2"/>
      </g>
      <g>
        <line x1="288.83" y1="150.19" x2="278.33" y2="160.69" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="2"/>
        <line x1="278.33" y1="150.19" x2="288.63" y2="160.49" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="2"/>
        <line x1="241.33" y1="151.39" x2="230.83" y2="161.89" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="2"/>
        <line x1="230.83" y1="151.39" x2="241.03" y2="161.69" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="2"/>
      </g>
      <g>
        <line x1="222.83" y1="290.69" x2="222.83" y2="305.29" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="2"/>
        <line x1="287.43" y1="290.69" x2="287.43" y2="305.29" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="2"/>
      </g>
    </g>
    <line id="palo" x1="124.43" y1="54.79" x2="148.33" y2="171.19" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="2"/>
    <g id="Cartel">
      <path id="cartel-shadow" fill="currentColor" d="M249.23,53.49c.8,3.8-.7,7.2-3.7,7.8l-109.5,22.5c-3,.6-6-1.9-6.7-5.7l-9.6-46.7c-.8-3.8,1-7.3,3.9-7.9L233.13,1.09c3-.6,5.7,2,6.5,5.8l9.6,46.7v-.1Z" isolation="isolate" opacity=".7" stroke-width="0"/>
      <path d="M253.43,56.59c.8,3.8-.7,7.2-3.7,7.8l-109.5,22.5c-3,.6-6-1.9-6.7-5.7l-9.6-46.7c-.8-3.8,1-7.3,3.9-7.9L237.43,4.09c3-.6,5.7,2,6.5,5.8l9.6,46.7h-.1Z" fill="currentColor" stroke-width="0"/>
    </g>
    <path id="borde_cartel" data-name="borde cartel" d="M249.23,53.49c.8,3.8-.7,7.2-3.7,7.8l-109.5,22.5c-3,.6-6-1.9-6.7-5.7l-9.6-46.7c-.8-3.8,1-7.3,3.9-7.9L233.13,1.09c3-.6,5.7,2,6.5,5.8l9.6,46.7v-.1Z" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="2"/>
    <g id="_404" data-name=" 404">
      <path d="M146.83,59.29l-.8-4,11.5-25.9,4-.8,4.5,22.7,4.9-1,.8,4-4.9,1,1.8,8.9-4,.8-1.8-8.9s-16,3.2-16,3.2ZM150.93,54.39l11.2-2.2-3.1-15.6-8.1,17.8h0Z" fill="#fff" stroke-width="0"/>
      <path d="M172.23,44.99c-1-4.9-.7-9.2.9-13.1,1.8-4.3,4.7-6.9,8.8-7.7s7.8.4,11.1,3.8c2.9,3,4.9,6.9,5.9,11.8,1,4.9.7,9.2-.9,13.1-1.8,4.3-4.7,6.9-8.8,7.7s-7.8-.4-11.1-3.8c-2.9-3-4.9-6.9-5.9-11.8ZM176.23,44.19c.8,3.9,2.2,7,4.2,9.4,2.3,2.7,5,3.8,8.1,3.2,3-.6,5.1-2.6,6.2-6,.9-2.9,1-6.4.2-10.3-.8-3.9-2.2-7-4.1-9.4-2.3-2.7-5-3.8-8.1-3.2-3.1.6-5.2,2.6-6.2,6-1,2.9-1,6.4-.3,10.3h0Z" fill="#fff" stroke-width="0"/>
      <path d="M202.93,48.19l-.8-4,11.5-25.9,4-.8,4.5,22.7,4.9-1,.8,4-4.9,1,1.8,8.9-4,.8-1.8-8.9s-16,3.2-16,3.2ZM207.03,43.29l11.2-2.2-3.1-15.6-8.1,17.8h0Z" fill="#fff" stroke-width="0"/>
    </g>
  </g>
</svg>
					</div>
					<div class="wp-block-buttons is-layout-flex wp-block-buttons-is-layout-flex justify-center mt-[2rem]">
						<div class="wp-block-button">
							<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="wp-block-button__link wp-element-button"><?php echo esc_html_e( 'Vover a Inicio', 'pictau' ); ?></a>
						</div>
					</div>


				</div><!-- .entry-content -->
			</article>
		</main><!-- #main -->
	</section><!-- #primary -->

<?php
get_footer();
