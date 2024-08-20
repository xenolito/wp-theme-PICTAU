<?php
/*
Template Name: MAINTENANCE MODE
Requires free plugin: LightStart and Maintenance Mode ( https://wordpress.org/plugins/wp-maintenance-mode )
*/
?>
<?php

/* $qode_options_proya, $wp_query, $qode_toolbar, $qodeIconCollections; */

global $wp_query;
$id = $wp_query->get_queried_object_id();

$custom_logo_id = get_theme_mod( 'custom_logo' );
$logo = wp_get_attachment_image_src( $custom_logo_id , 'full' );

$brandLogo = ( has_custom_logo() ) ? '<img src="' . esc_url( $logo[0] ) . '" alt="' . get_bloginfo( 'name' ) . '">' : '<h1>' . get_bloginfo('name') . '</h1>';

$customer_company_name = get_option('pictau_custom_wp_mail_from_name');
$customer_company_email = get_option('pictau_custom_wp_mail_address');
?>

<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="profile" href="https://gmpg.org/xfn/11">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>

<?php
get_template_part( 'title' );

while (have_posts()) :
  the_post();
?>
<style>
/*? Maintenance page */
body:has(.pct-maintenance) {
	--main-color: #002c90;
	--cta-color: #ff1053;
	--main-gradient: linear-gradient(135deg, #1893ec, #1893ec, #261095);

	width: 100%;
	height: 100dvh;
	background-color: #fff;
	min-width: 320px;
	font-family: var(--def-font-family);
	margin: 0;
	font-size: 16px !important;
	display: block;
	position: relative;
	background: var(--main-gradient);
	color: #fff;

	.pct-maintenance {
		max-width: unset;
		display: grid;
		place-content: center;
		width: 100vw;
		height: 100dvh;
		padding: 3rem;

		.maintenance-card {
			display: flex;
    	flex-flow: column;
    	align-items: center;
			background-color: rgba(255, 255, 255, 0.1);
			border: 2px solid rgba(255, 255, 255, 0.2);
			color: white;
			padding: 3rem;
			border-radius: 12px;
			max-width: 800px;
			width: 100%;
			> * {
				text-align: center;
				letter-spacing: 1.5px;
			}

			figure {
				width: auto;
				display: flex;
    		justify-content: center;
				img {
					max-height: 100px;
					height: 100px;
					object-fit: contain;
				}
			}



			h1 {
				font-size: clamp(1.2rem, 5vw, 3rem);
				padding: 2rem 0;
				text-align: center;
				line-height: 1.2;
				color: white !important;
			}

			p {
				font-size: 18px;
				font-weight: 200;
			}

			.wp-block-buttons {
				margin-top: 2rem;
				gap: 2rem;
				color: white;

				.wp-block-button {
					&:last-of-type {
						a {
							background-color: #343434;
							color: white;
						}
					}

					a {
						background-color: white;
						min-width: 180px;
						border-radius: 999px;
						padding: 0.8rem 2rem;
						text-transform: uppercase;
						font-size: 0.8rem;
	          border: 1px solid rgba(255,255,255,0.3);
            transition: all .3s ease;
						color: #343434;
						scale: 1;
						&:hover {
							background-color: var(--cta-color);
              scale: 1.1;
							color: white;
						}
					}
				}
			}
		}
	}
}
</style>
<div class="wp-block-group pct-maintenance is-layout-constrained wp-block-group-is-layout-constrained">
  <div class="wp-block-group maintenance-card is-layout-constrained wp-block-group-is-layout-constrained">
    <figure class="wp-block-image size-full brand-logo">
      <?php echo $brandLogo; ?>
    </figure>
    <h1 class="wp-block-heading">Estamos preparando una nueva web para ti.</h1>
    <p>Disculpa las molestias</p>
    <div class="wp-block-buttons is-content-justification-center is-layout-flex wp-container-core-buttons-layout-1 wp-block-buttons-is-layout-flex">
      <div class="wp-block-button">
        <a class="wp-block-button__link wp-element-button" href="mailto:<?php echo $customer_company_email; ?>">Contáctanos</a>
      </div>
      <div class="wp-block-button">
        <a class="wp-block-button__link wp-element-button" href="/pictau">Entrar</a>
      </div>
    </div>
  </div>
</div>

<?php
// the_content();
endwhile;

wp_footer();
?>
</body>
</html>