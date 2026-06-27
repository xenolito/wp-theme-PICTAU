<?php
/**
 * Pictau Blocks — integrado como funcionalidad nativa del tema.
 *
 * Originalmente distribuido como plugin (wordpress-pictau-blocks-plugin).
 * Incluye: CPT pictau_blocks, columna de admin, página de ajustes, widget y shortcode.
 */



/*------------------------------------------------------------------------------------------------------*\

						CUSTOM POST TYPE "PICTAU BLOCKS"

\*------------------------------------------------------------------------------------------------------*/

add_action( 'init', 'custom_post_type_pictau_blocks', 0 );

function custom_post_type_pictau_blocks() {

	$labels = array(
		'name'               => _x( 'Pictau Blocks', 'Post Type General Name', 'pictau' ),
		'singular_name'      => _x( 'Pictau Block', 'Post Type Singular Name', 'pictau' ),
		'menu_name'          => esc_html__( 'Pictau Blocks', 'pictau' ),
		'parent_item_colon'  => esc_html__( 'Página padre', 'pictau' ),
		'all_items'          => esc_html__( 'Todos los Pictau Blocks', 'pictau' ),
		'view_item'          => esc_html__( 'Ver Pictau Block', 'pictau' ),
		'add_new_item'       => esc_html__( 'Añadir nuevo Pictau Block', 'pictau' ),
		'add_new'            => esc_html__( 'Añadir nuevo', 'pictau' ),
		'edit_item'          => esc_html__( 'Editar Pictau Block', 'pictau' ),
		'update_item'        => esc_html__( 'Actualizar Pictau Block', 'pictau' ),
		'search_items'       => esc_html__( 'Buscar Pictau Block', 'pictau' ),
		'not_found'          => esc_html__( 'No encontrado', 'pictau' ),
		'not_found_in_trash' => esc_html__( 'No encontrado en papelera', 'pictau' ),
	);

	$args = array(
		'label'               => esc_html__( 'pictau_blocks', 'pictau' ),
		'description'         => esc_html__( 'Bloques estáticos reutilizables', 'pictau' ),
		'labels'              => $labels,
		'supports'            => array( 'title', 'editor', 'revisions', 'page-attributes' ),
		'show_in_rest'        => true,
		'taxonomies'          => array( 'pictau_blocks' ),
		'hierarchical'        => true,
		'public'              => true,
		'show_ui'             => true,
		'show_in_menu'        => true,
		'show_in_nav_menus'   => true,
		'query_var'           => true,
		'show_in_admin_bar'   => true,
		'menu_position'       => 5,
		'menu_icon'           => 'dashicons-tagcloud',
		'can_export'          => true,
		'has_archive'         => false,
		'exclude_from_search' => true,
		'publicly_queryable'  => false,
		'capability_type'     => 'page',
	);

	register_post_type( 'pictau_blocks', $args );
}



/*------------------------------------------------------------------------------------------------------*\

						COLUMNA PERSONALIZADA EN LISTADO DE ADMIN

\*------------------------------------------------------------------------------------------------------*/

add_filter( 'manage_pictau_blocks_posts_columns', 'set_custom_edit_pictau_blocks_columns' );

function set_custom_edit_pictau_blocks_columns( $columns ) {
	unset( $columns['author'] );
	$columns['shortcode'] = esc_html__( 'Shortcode', 'pictau' );
	return $columns;
}

add_action( 'manage_pictau_blocks_posts_custom_column', 'custom_pictau_blocks_column', 10, 2 );

function custom_pictau_blocks_column( $column, $post_id ) {
	if ( 'shortcode' === $column ) {
		echo '[pictau-blocks id="' . intval( $post_id ) . '"]';
	}
}



/*------------------------------------------------------------------------------------------------------*\

						PÁGINA DE AJUSTES EN EL ADMIN

\*------------------------------------------------------------------------------------------------------*/

class pct_blocks_settingsPage {

	private $options;

	public function __construct() {
		add_action( 'admin_menu', array( $this, 'add_plugin_page' ) );
		add_action( 'admin_init', array( $this, 'page_init' ) );
	}

	public function add_plugin_page() {
		add_options_page(
			esc_html__( 'PICTAU-BLOCKS Settings ADMIN', 'pictau' ),
			esc_html__( 'PICTAU-BLOCKS Settings', 'pictau' ),
			'manage_options',
			'PICTAU-BLOCKS-setting-admin',
			array( $this, 'create_admin_page' )
		);
	}

	public function create_admin_page() {
		$this->options = get_option( 'pictau_blocks' );
		?>
		<style>
			#pct-blocks-footer {
				display: block;
				background-color: #148e65;
				padding: 30px 20px;
				color: #00de94;
			}
			#pct-blocks-footer a {
				color: #FFF;
				text-decoration: none;
				padding: 5px;
			}
			#pct-blocks-footer .dashicons {
				margin-right: 5px;
			}
			#pct-plugin-admin-content {
				background-color: #FFF;
				border-radius: 5px;
				padding: 2rem;
			}
			#pct-plugin-admin-content code {
				padding: 1rem;
			}
			#pct-plugin-admin-content ul {
				list-style: disc;
				padding-left: 2rem;
			}
		</style>
		<div class="wrap">
			<h1><?php esc_html_e( 'PICTAU BLOCKS MANAGER', 'pictau' ); ?></h1>
			<div id="pct-plugin-admin-content">
				<h2><?php esc_html_e( 'Cómo usar Pictau Blocks', 'pictau' ); ?></h2>
				<p><?php esc_html_e( 'Crea un post de tipo "Pictau Block" y usa el shortcode que aparece en la columna del listado para insertarlo en cualquier página o widget.', 'pictau' ); ?></p>
				<p><code>[pictau-blocks id="ID_DEL_BLOCK"]</code></p>
				<p><?php esc_html_e( 'El contenido del block puede incluir bloques Gutenberg y shortcodes. Los bloques sin shortcodes se cachean automáticamente durante 12 horas.', 'pictau' ); ?></p>
			</div>
			<div id="pct-blocks-footer">
				<?php esc_html_e( 'Pictau Blocks — funcionalidad nativa del tema Pictau.', 'pictau' ); ?>
				<a href="https://www.pictau.com" target="_blank">
					<span class="dashicons dashicons-admin-site"></span>www.pictau.com
				</a>
			</div>
		</div>
		<?php
	}

	public function page_init() {
		register_setting(
			'pictau_blocks_option_group',
			'pictau_blocks',
			array( $this, 'sanitize' )
		);

		add_settings_section(
			'setting_section_id',
			esc_html__( 'Ajustes', 'pictau' ),
			array( $this, 'print_section_info' ),
			'my-setting-admin'
		);
	}

	public function sanitize( $input ) {
		$new_input = array();
		if ( isset( $input['afmp_phone_number'] ) ) {
			$new_input['afmp_phone_number'] = sanitize_text_field( $input['afmp_phone_number'] );
		}
		return $new_input;
	}

	public function print_section_info() {
		echo esc_html__( 'Ajustes de Pictau Blocks:', 'pictau' );
	}
}



/*------------------------------------------------------------------------------------------------------*\

						WIDGET

\*------------------------------------------------------------------------------------------------------*/

add_action( 'widgets_init', function () {
	register_widget( 'pct_blocks_widget' );
} );

class pct_blocks_widget extends WP_Widget {

	public function __construct() {
		$widget_ops = array(
			'classname'   => 'pictau-block',
			'description' => esc_html__( 'Banner de Anuncios personalizados', 'pictau' ),
		);
		parent::__construct( 'pictau_block', esc_html__( 'Pictau Blocks', 'pictau' ), $widget_ops );
	}

	public function widget( $args, $instance ) {
		echo '<div id="pictau-block-widget" class="widget pictau-widget pictau-block">';

		if ( ! empty( $instance['title'] ) ) {
			echo $args['before_title'] . apply_filters( 'widget_title', $instance['title'] ) . $args['after_title'];
		}

		if ( ! empty( $instance['block_select'] ) ) {
			$post = get_post( $instance['block_select'] );
			if ( $post ) {
				echo do_shortcode( $post->post_content );
			}
		} else {
			echo esc_html__( 'No se ha seleccionado ningún block.', 'pictau' );
		}

		echo $args['after_widget'];
	}

	public function form( $instance ) {
		$instance     = wp_parse_args( (array) $instance, array( 'block_select' => '', 'title' => '' ) );
		$block_select = $instance['block_select'];
		$title        = $instance['title'];
		?>
		<p>
			<label for="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>" style="display:block;">
				<?php esc_html_e( 'Título:', 'pictau' ); ?>
			</label>
			<input
				class="widefat"
				id="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>"
				name="<?php echo esc_attr( $this->get_field_name( 'title' ) ); ?>"
				type="text"
				value="<?php echo esc_attr( $title ); ?>">
		</p>
		<?php
		$posts = get_posts( array(
			'posts_per_page' => 30,
			'offset'         => 0,
			'post_type'      => 'pictau_blocks',
		) );
		?>
		<div style="max-height:120px;overflow:auto;margin-bottom:2rem;">
			<label for="<?php echo esc_attr( $this->get_field_id( 'block_select' ) ); ?>" style="display:block;">
				<?php esc_html_e( 'Selecciona el block:', 'pictau' ); ?>
			</label>
			<select
				id="<?php echo esc_attr( $this->get_field_id( 'block_select' ) ); ?>"
				name="<?php echo esc_attr( $this->get_field_name( 'block_select' ) ); ?>"
				style="width:calc(100% - 2px);">
				<?php foreach ( $posts as $post ) : ?>
					<option value="<?php echo esc_attr( $post->ID ); ?>" <?php selected( $block_select, $post->ID ); ?>>
						<?php echo esc_html( get_the_title( $post->ID ) ); ?>
					</option>
				<?php endforeach; ?>
			</select>
		</div>
		<?php
	}

	public function update( $new_instance, $old_instance ) {
		$instance                 = $old_instance;
		$instance['title']        = ! empty( $new_instance['title'] ) ? sanitize_text_field( $new_instance['title'] ) : '';
		$instance['block_select'] = ! empty( $new_instance['block_select'] ) ? intval( $new_instance['block_select'] ) : '';
		return $instance;
	}
}



/*------------------------------------------------------------------------------------------------------*\

						SHORTCODE [pictau-blocks id="X"]

\*------------------------------------------------------------------------------------------------------*/

function get_pct_block( $atts ) {
	$atts = shortcode_atts( array( 'id' => '' ), $atts );

	if ( ! $atts['id'] ) {
		return '';
	}

	$id            = intval( $atts['id'] );
	$transient_key = 'pictau_block_' . $id;
	$cached        = get_transient( $transient_key );

	if ( false !== $cached ) {
		return $cached;
	}

	$post = get_post( $id );

	if ( ! $post ) {
		return '';
	}

	$has_shortcodes = (bool) preg_match( '/' . get_shortcode_regex() . '/s', $post->post_content );

	// do_blocks() aplica wpautop internamente; shortcode_unautop() elimina los <p> sobrantes antes de expandir.
	$output = shortcode_unautop( do_blocks( $post->post_content ) );
	$output = apply_shortcodes( $output );
	$buffer = preg_replace( '/<!--(.|s)*?-->/', '', $output );
	$buffer = preg_replace( '/<p(?![^>]*role=["\']status["\'])[^>]*>[\s\n\r]*<\/p>/i', '', $buffer );
	$buffer = wp_svg_inline_filter( $buffer );

	if ( ! $has_shortcodes ) {
		set_transient( $transient_key, $buffer, 12 * HOUR_IN_SECONDS );
	}

	return $buffer;
}

add_shortcode( 'pictau-blocks', 'get_pct_block' );

// Invalida el caché al guardar el CPT.
add_action( 'save_post_pictau_blocks', function ( $post_id ) {
	delete_transient( 'pictau_block_' . $post_id );
} );



/*------------------------------------------------------------------------------------------------------*\

						INIT

\*------------------------------------------------------------------------------------------------------*/

if ( is_admin() ) {
	new pct_blocks_settingsPage();
}
