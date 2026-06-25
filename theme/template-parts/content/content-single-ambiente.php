<?php

/**
 * Template part for displaying single ambiente posts
 *
 * @package pictau_tw
 */

$pod        = pods( 'ambiente', get_the_id() );
$ambient_id = $pod->field( 'ambient_id' );
$back_url   = $pod->field( 'back_url' );

if ( ! $ambient_id ) {
	return;
}

$shortcode_atts = 'ambient="' . esc_attr( $ambient_id ) . '"';
if ( $back_url ) {
	$shortcode_atts .= ' back_url="' . esc_attr( $back_url ) . '"';
}

//! Desactivar el auto tour para todos los ambientes --> descomenta la siguiente línea: añadimos el attributo tour="false" a los shortcodes de los ambientes para desactivar el tour automático al cargar el ambiente. Si quieres activar el tour, simplemente elimina el atributo o ponlo a "true". Por ejemplo: [pct_ambient_viewer ambient="123" tour="false"] --- IGNORE ---
// $shortcode_atts .= ' tour="false"';

?>

<h1 class="screen-reader-text"><?php the_title(); ?></h1>


<?php

echo do_shortcode( '[pct_ambient_viewer ' . $shortcode_atts . ']' );

?>
<!-- modal lead producto -->
<?php echo do_shortcode( '[pct-cpt-block title="Modal Lead Producto" mostrar="si"]' ); ?>
