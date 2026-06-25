<?php
//! EVENTS by CATEGORY' (Used @ subscribe to events form page)
function show_events_by_category($atts = [], $content = '')
{

  extract(shortcode_atts(array(
    "limit"              => 0,
    "cat"                => 'event_category',
    "cpt"                => 'event',
    "form_id"            => false,
    "form_field_target"  => false,
    "form_nothingselected_msg"  => false,
    "minutesbefore_to_enroll" => 30
  ), $atts));


  $date =


    $param = array(
      'limit' => $limit,
      'orderby' => 'orden ASC'
    );

  $curr_lang = pll_current_language();
  $pods = pods($cat, $param);

  $output = '';


  if ($pods->total() > 0) {
    $output = '';
    $catCount = 0;

    $no_events_output = true; // if no events are found for the current month...
    $output .= '<section class="events-container pct-2cols" data-event_selector data-event_selector_form="' . $form_id . '" data-event_selector_formfieldtarget="' . $form_field_target . '" data-event_selector_nothingselectedmsg="' . $form_nothingselected_msg . '">';

    $cat_count = 0;
    while ($pods->fetch()) {
      $cat_count++;
      $taxonomy_name = $pods->field('name');
      $taxonomy_id = $pods->id();
      $taxonomy_description = $pods->field('description');
      $has_items = get_term_by('id', $taxonomy_id, $cat)->count; // count number of custom posts in this category
      $has_current_month_events = false;

      if ($has_items) {
        $category_empty = true; // will change to true if any event is rendered for this category

        // if ($catCount > 0) {
        // 	$output .= '<div class="wp-block-group mmenu-separator"><hr class="wp-block-separator has-alpha-channel-opacity"></div>';
        // }

        $output .= '<section class="card wp-block-group event-category category-' . $cat_count . '" data-count="' . $catCount . '" data-id="' . $taxonomy_id . '" data-name="' . $taxonomy_name . '"><h3 class="wp-block-heading">' . $taxonomy_name . '</h3>';
        // $output .= '<p>'. $taxonomy_description .'</p>';
        $output .= '	<p class="description">' . $taxonomy_description . '</p>';
        $output .= '	<div class="events-grid">';
        $output .= '		<div class="container">';



        // ! nueva query para cada categoria
        $params = array(
          'limit' => -1,
          'where' => $cat . '.slug = "' . $pods->field('slug') . '"',
          'post_status' => array('publish', 'private'),
          'orderby' => 'fecha ASC'
        );

        $cpts = pods($cpt, $params);

        // $partner_groups .= '<div class="colab-group" data-group_name="'. $taxonomy_name . '" data-group_id="'. $taxonomy_id .'">' . pods($cpt, $params) . '</div>';
        while ($cpts->fetch()) {
          $nombre = $cpts->field('name');
          $id = $cpts->id();
          $link = $cpts->field('permalink');
          $imgSrc = $cpts->field('icon._src.full');
          $description = $cpts->field('subtitular');


          $currentMonthTesting = false; //'04'; //! ⛔️ FOR DEVELOPING / TESTING PURPOSES --> set value to false for production!!


          $event_date = new DateTime($cpts->field('fecha'));
          $eventMonth = $event_date->format('m');
          $eventMonth_name_short = date_i18n('M', strtotime($cpts->field('fecha')));
          $eventDay = $event_date->format('j'); // format('d') for two digits with leading zero
          $eventHour = $event_date->format('G');
          $eventMinutes = $event_date->format('i');
          // $eventHour = date_i18n('G', strtotime($cpts->field('fecha')));
          $eventDay_of_week_name = date_i18n('l', strtotime($cpts->field('fecha')));



          $currentDate = current_datetime();
          // $timeZone = get_option('timezone_string');
          // $useTimezone = new DateTimeZone(get_option('timezone_string') );


          $currentMonth = $currentMonthTesting ? $currentMonthTesting : $currentDate->format('m');
          $currentDay = $currentDate->format('d');


          /////////////////////////////////////////

          $evdate = $event_date->format('Y-m-d H:i');
          $currdate = $currentDate->format('Y-m-d H:i');


          $start = strtotime($evdate);
          $end = strtotime($currdate);
          // Calculate the difference in seconds (default unit for strtotime() is seconds)
          $difference_in_seconds = $end - $start;
          // Convert the difference from seconds to minutes
          $difference_in_minutes = $difference_in_seconds / 60;

          /////////////////////////////////////////

          $expired = $difference_in_minutes > -$minutesbefore_to_enroll; // 30 minutes (default) before the event will be shown as expired
          $expired_class = $expired ? 'expired' : '';



          //! Only events matching current month
          if ($eventMonth === $currentMonth) {
            $category_empty = false;
            $no_events_output = false;

            $output .= '<div class="event-item ' . $expired_class . ' event-id-' . $id . '" data-event_date="' . $evdate . '">';
            $output .= '	<div class="wp-block-group container">
																<div class="wp-block-group event">
																	<header>
																		<h4 class="day-number">' . $eventDay . ' ' . $eventMonth_name_short . '</h4>
																		<div class="toggle-ui">
																			<input type="checkbox" class="switcher" id="switcher-' . $id . '" autocomplete="off">
																			<label for="switcher-' . $id . '">
																				<span class="thumb"></span>
																			</label>
																		</div>
																	</header>
																	<p class="day-wn-hour">
																		<span class="day-of-week">' . $eventDay_of_week_name . '</span> ' . $eventHour . ':' . $eventMinutes . 'h
																	</p>
																	<p class="event-name">' . $nombre . '</p>
																</div>
														</div>';
            $output .= '</div>';
          }


          //! Only events matching next month (for testing purposes)
          // if ( ($currentMonth == '12' && $eventMonth == '01') || ($eventMonth == $currentMonth + 1) ) {
          // 	$category_empty = false;
          // 	$no_events_output = false;
          if (($currentMonth == '12' && $eventMonth == '01') || ($eventMonth == $currentMonth + 1)) {
            // if ($eventMonth === $currentMonth) {
            $category_empty = false;
            $no_events_output = false;

            $output .= '<div class="event-item ' . $expired_class . ' event-id-' . $id . '" >';
            $output .= '	<div class="wp-block-group container">
																<div class="wp-block-group event">
																	<header>
																		<h4 class="day-number">' . $eventDay . ' ' . $eventMonth_name_short . '</h4>
																		<div class="toggle-ui">
																			<input type="checkbox" class="switcher" id="switcher-' . $id . '" autocomplete="off">
																			<label for="switcher-' . $id . '">
																				<span class="thumb"></span>
																			</label>
																		</div>
																	</header>
																	<p class="day-wn-hour">
																		<span class="day-of-week">' . $eventDay_of_week_name . '</span> ' . $eventHour . ':' . $eventMinutes . 'h
																	</p>
																	<p class="event-name">' . $nombre . '</p>
																</div>
														</div>';
            $output .= '</div>';
          }
        }

        $output .= '		</div>';
        $output .= '	</div>';
        if ($category_empty) {
          $output .= '<div class="category-empty"></div>';
        }
        $output .= '</section>';
        $catCount++;
      }
    }

    $output .= '</section>';
  }

  if ($no_events_output) {
    $output = '<p class="no-events-found-current-month">⛔️ No events found for this month</p>';
  }

  // echo 'htmlToRender --->' . $htmlToRender;

  // echo $htmlToRender;
  return wp_svg_inline_filter($output);
}
add_shortcode('events-by-cat', 'show_events_by_category');


//! EVENTS by CATEGORY' admin list view Customizations
/**
 * Columna "Fecha" en el admin para el CPT "event" (Pods field: fecha)
 */

// 1) Añadir columna
add_filter('manage_edit-event_columns', function ($columns) {
  $new = [];
  foreach ($columns as $key => $label) {
    $new[$key] = $label;
    if ($key === 'title') {
      $new['event_fecha'] = __('Fecha del Evento', 'your-textdomain');
    }
  }
  if (!isset($new['event_fecha'])) {
    $new['event_fecha'] = __('Fecha del Evento', 'your-textdomain');
  }
  return $new;
});

// 2) Mostrar valor con formato + clase de estado
add_action('manage_event_posts_custom_column', function ($column, $post_id) {
  if ($column !== 'event_fecha') return;

  $raw = get_post_meta($post_id, 'fecha', true); // <-- cambia 'fecha' si tu meta key difiere
  if (!$raw) {
    echo '—';
    return;
  }

  try {
    $tz  = wp_timezone();
    $dt  = new DateTime($raw, $tz);  // evento
    $now = new DateTime('now', $tz); // ahora

    $ts = $dt->getTimestamp();

    // Estado
    if ($dt->format('Y-m-d') < $now->format('Y-m-d')) {
      $status = 'past'; // días anteriores
    } elseif ($dt->format('Y-m-d') > $now->format('Y-m-d')) {
      $status = 'future'; // días posteriores
    } else {
      // mismo día
      if ($dt < $now) {
        $status = 'today-past'; // hoy pero ya pasó
      } else {
        $status = 'today'; // hoy y aún no ha pasado
      }
    }

    // Formato como en front
    $day         = wp_date('j', $ts);
    $month_short = wp_date('M', $ts);
    $weekday     = wp_date('l', $ts);
    $time_hm     = wp_date('G:i', $ts);

    $label = "{$day} {$month_short} · {$weekday} {$time_hm}h";

    printf(
      '<span class="event-fecha-badge is-%s">%s</span>',
      esc_attr($status),
      esc_html($label)
    );
  } catch (Exception $e) {
    echo '—';
  }
}, 10, 2);

// 3) Ordenable por meta
add_filter('manage_edit-event_sortable_columns', function ($columns) {
  $columns['event_fecha'] = 'event_fecha';
  return $columns;
});
add_action('pre_get_posts', function ($query) {
  if (!is_admin() || !$query->is_main_query()) return;
  if ($query->get('orderby') === 'event_fecha') {
    $query->set('meta_key', 'fecha'); // <-- ajusta si tu campo se llama distinto
    $query->set('orderby', 'meta_value');
    $query->set('meta_type', 'DATETIME');
  }
});

// 4) Estilos admin
add_action('admin_head-edit.php', function () {
  $screen = get_current_screen();
  if (empty($screen) || $screen->post_type !== 'event') return;
?>
  <style>
    .edit-php.post-type-event td.column-event_fecha {
      white-space: nowrap;
    }

    .edit-php.post-type-event td.column-event_fecha .event-fecha-badge {
      font-weight: 600;
    }

    /* is past */
    .edit-php.post-type-event td.column-event_fecha .event-fecha-badge.is-past {
      color: rgba(154, 160, 166, 0.33);
    }

    /* today past */
    .edit-php.post-type-event td.column-event_fecha .event-fecha-badge.is-today-past {
      color: rgba(255, 140, 0, 0.33);
    }

    /* is today */
    .edit-php.post-type-event td.column-event_fecha .event-fecha-badge.is-today {
      color: blue;
    }

    /* future */
    .edit-php.post-type-event td.column-event_fecha .event-fecha-badge.is-future {
      color: #32cd32;
    }

    /* verde limón */
  </style>
  <?php
});



/**
 * Columna "Categoría" para el CPT "event" (taxonomía: event_category) + ordenable
 */

// 1) Añadir la columna (la situamos tras "Fecha del Evento" si existe)
add_filter('manage_edit-event_columns', function ($columns) {
  $insert_after = 'event_fecha'; // clave de la columna de fecha que ya añadimos antes
  $new = [];

  foreach ($columns as $key => $label) {
    $new[$key] = $label;
    if ($key === $insert_after) {
      $new['event_categoria'] = __('Categoría', 'your-textdomain');
    }
  }

  // Si no encontramos el hueco, la añadimos al final
  if (!isset($new['event_categoria'])) {
    $new['event_categoria'] = __('Categoría', 'your-textdomain');
  }
  return $new;
});

// 2) Rellenar la columna con las categorías (enlaces clicables para filtrar)
add_action('manage_event_posts_custom_column', function ($column, $post_id) {
  if ($column !== 'event_categoria') return;

  $taxonomy = 'event_category'; // <-- cambia si tu taxonomía tiene otro slug
  $terms = get_the_terms($post_id, $taxonomy);

  if (empty($terms) || is_wp_error($terms)) {
    echo '—';
    return;
  }

  // Ordena alfabéticamente por nombre para visualización
  usort($terms, function ($a, $b) {
    return strcasecmp($a->name, $b->name);
  });

  $links = array_map(function ($term) use ($taxonomy) {
    $url = add_query_arg([
      'post_type'      => 'event',
      $taxonomy        => $term->slug,
    ], admin_url('edit.php'));
    return sprintf(
      '<a href="%s">%s</a>',
      esc_url($url),
      esc_html($term->name)
    );
  }, $terms);

  echo implode(', ', $links);
}, 10, 2);

// 3) Declarar la columna como ordenable
add_filter('manage_edit-event_sortable_columns', function ($columns) {
  $columns['event_categoria'] = 'event_categoria';
  return $columns;
});

// 4) Aplicar orden por nombre de categoría usando JOIN a tablas de términos
add_filter('pre_get_posts', function ($query) {
  if (!is_admin() || !$query->is_main_query()) return;

  // Solo cuando se pide ordenar por nuestra columna
  if ($query->get('orderby') === 'event_categoria') {
    // Marcamos una bandera interna para usarla en posts_clauses
    $query->set('orderby', 'event_category_name');
  }
});

// 5) Reescribir los "clauses" SQL para ordenar por nombre de término
add_filter('posts_clauses', function ($clauses, $query) {
  if (!is_admin() || !$query->is_main_query()) return $clauses;
  if ($query->get('orderby') !== 'event_category_name') return $clauses;

  global $wpdb;

  $taxonomy = 'event_category'; // <-- cambia si tu taxonomía tiene otro slug
  $order    = strtoupper($query->get('order')) === 'DESC' ? 'DESC' : 'ASC';

  // JOIN a relaciones de términos (LEFT JOIN para no perder posts sin término)
  $join  = " LEFT JOIN {$wpdb->term_relationships} AS tr_ec ON ({$wpdb->posts}.ID = tr_ec.object_id)";
  $join .= " LEFT JOIN {$wpdb->term_taxonomy}   AS tt_ec ON (tr_ec.term_taxonomy_id = tt_ec.term_taxonomy_id AND tt_ec.taxonomy = %s)";
  $join .= " LEFT JOIN {$wpdb->terms}           AS t_ec  ON (tt_ec.term_id = t_ec.term_id)";

  // Evita duplicar joins si otro plugin ya los añade
  if (strpos($clauses['join'], 'tr_ec') === false) {
    $clauses['join'] .= $wpdb->prepare($join, $taxonomy);
  }

  // Asegurar un GROUP BY por post ID para evitar duplicados cuando hay múltiples términos
  if (empty($clauses['groupby'])) {
    $clauses['groupby'] = "{$wpdb->posts}.ID";
  } else {
    // Añadimos el ID si no está
    if (strpos($clauses['groupby'], "{$wpdb->posts}.ID") === false) {
      $clauses['groupby'] .= ", {$wpdb->posts}.ID";
    }
  }

  // Orden: primero los que sí tienen categoría, luego sin categoría, por nombre
  // (t_ec.name IS NULL será 1 para vacíos → los mandamos al final con ASC)
  $clauses['orderby'] = " (t_ec.name IS NULL) ASC, t_ec.name {$order} ";

  return $clauses;
}, 10, 2);




// +/+/+/+/+/+/+/+/+/+/+/+/+/+/+/+/+/+/+/+/+/+/+/+/+/+/+/+/+/+/+/+/+/+/+/+/+/+/+/+/+/







//! PRÓXIMOS EVENTOS - shortcode [next_events] PARA LA HOME

/**
 * Shortcode de próximos items por CPT (default: 'evento') basados en fecha_inicio >= ahora.
 * - Campo de fecha: 'fecha_inicio' (DATETIME 'Y-m-d H:i:s')
 * - Si hay Pods y el CPT es un Pod, usa pods() para obtener campos e imagen destacada.
 * - Si no, usa WP core (get_post_meta / featured image de WP).
 * - Shortcode: [proximos_eventos cpt="evento" limit="6"]
 * - Cache de fragmento (transient) con versión por CPT
 * - Invalidación al guardar/borrar/cambiar meta 'fecha_inicio' del CPT correspondiente
 * - TTL dinámico: hasta justo después del siguiente item (min 60s, máx 1h)
 */

if (!defined('ABSPATH')) exit;

/* =========================
 * Helpers de tiempo (TZ WP)
 * ========================= */
function pct_wp_now(): DateTimeImmutable
{
  return new DateTimeImmutable('now', wp_timezone());
}
function pct_now_mysql(): string
{
  return pct_wp_now()->format('Y-m-d H:i:s');
}
function pct_seconds_until_midnight(): int
{
  $now = pct_wp_now();
  $midnight = (new DateTimeImmutable('tomorrow', wp_timezone()))->setTime(0, 0, 0);
  return max(60, (int) ($midnight->getTimestamp() - $now->getTimestamp()));
}
function pct_parse_wp_datetime_to_ts(?string $str): ?int
{
  if (!$str) return null;
  try {
    $dt = new DateTimeImmutable($str, wp_timezone()); // interpreta en TZ WP
    return $dt->getTimestamp();
  } catch (Exception $e) {
    return null;
  }
}
function pct_clamp(int $v, int $min, int $max): int
{
  return max($min, min($max, $v));
}

/* =========================
 * Namespacing cache/versión
 * ========================= */
function pct_upcoming_events_ns(): string
{
  return 'pct_upcoming_events';
}
function pct_ver_option_key(string $cpt): string
{
  return pct_upcoming_events_ns() . '_ver_' . sanitize_key($cpt);
}
function pct_cache_version_get(string $cpt): int
{
  $v = (int) get_option(pct_ver_option_key($cpt), 1);
  return $v > 0 ? $v : 1;
}
function pct_purge_supercache_home(): void
{
  if (function_exists('wp_cache_clear_cache')) {
    // Evitamos llamada directa para no molestar a Intelephense
    call_user_func('wp_cache_clear_cache', 0);
  }
}
function pct_cache_version_bump(string $cpt): void
{
  $key = pct_ver_option_key($cpt);
  $v = pct_cache_version_get($cpt) + 1;
  update_option($key, $v, false);
  pct_purge_supercache_home();
}

/* =========================
 * Helpers Pods / Core fields
 * ========================= */
function pct_has_pods(): bool
{
  return function_exists('pods');
}

/**
 * Obtiene un objeto Pods para un post.
 */
function pct_get_pod(string $cpt, int $post_id)
{
  if (!pct_has_pods()) return null;
  try {
    $pod = pods($cpt, $post_id);
    // pods() puede devolver false si no existe el Pod
    return $pod ?: null;
  } catch (Throwable $e) {
    return null;
  }
}

/**
 * Lee un campo vía Pods si hay Pod, si no via core/meta.
 * - Para 'fecha_inicio' se espera string 'Y-m-d H:i:s'
 */
function pct_get_field(string $cpt, int $post_id, string $field)
{
  $pod = pct_get_pod($cpt, $post_id);
  if ($pod) {
    // Pods devuelve arrays/valores normalizados
    return $pod->field($field);
  }
  // Fallback a meta de WP
  return get_post_meta($post_id, $field, true);
}

/**
 * Imagen destacada (featured image) — intenta por Pods y luego core.
 * Devuelve array [url, alt, id] o null.
 * - En Pods, el "WP Featured Image" suele estar accesible como 'post_thumbnail' (campo mágico).
 *   También probamos 'thumbnail' y 'featured_image' por compatibilidad con Pods File/Image.
 */
function pct_get_featured_image(string $cpt, int $post_id, string $size = 'large'): ?array
{
  // 1) Intento vía Pods
  if ($pod = pct_get_pod($cpt, $post_id)) {
    // Prioridad a featured del core expuesto por Pods
    foreach (['post_thumbnail', 'thumbnail', 'featured_image'] as $k) {
      $val = $pod->field($k);
      if ($val) {
        // $val puede ser ID, URL o array del adjunto
        if (is_numeric($val)) {
          $id = (int) $val;
        } elseif (is_array($val)) {
          // Busca ID típico de Pods file
          $id = isset($val['ID']) ? (int) $val['ID'] : (isset($val['id']) ? (int) $val['id'] : 0);
          if (!$id && isset($val['guid'])) {
            $url = esc_url_raw($val['guid']);
            $alt = isset($val['post_title']) ? wp_strip_all_tags($val['post_title']) : '';
            return ['url' => $url, 'alt' => $alt, 'id' => 0];
          }
        } elseif (is_string($val) && filter_var($val, FILTER_VALIDATE_URL)) {
          // URL directa
          return ['url' => esc_url_raw($val), 'alt' => get_the_title($post_id), 'id' => 0];
        } else {
          $id = 0;
        }

        if (!empty($id)) {
          $url = wp_get_attachment_image_url($id, $size);
          if ($url) {
            $alt = get_post_meta($id, '_wp_attachment_image_alt', true);
            if ($alt === '') $alt = get_the_title($id);
            return ['url' => $url, 'alt' => $alt, 'id' => $id];
          }
        }
      }
    }
  }

  // 2) Fallback core WP
  $thumb_id = get_post_thumbnail_id($post_id);
  if ($thumb_id) {
    $url = wp_get_attachment_image_url($thumb_id, $size);
    if ($url) {
      $alt = get_post_meta($thumb_id, '_wp_attachment_image_alt', true);
      if ($alt === '') $alt = get_the_title($thumb_id);
      return ['url' => $url, 'alt' => $alt, 'id' => (int) $thumb_id];
    }
  }
  return null;
}

/* =========================
 * Render + fragment caching
 * ========================= */
function pct_upcoming_events_html(string $cpt = 'evento', int $limit = 6): string
{
  $cpt   = sanitize_key($cpt);
  $limit = max(1, (int) $limit);

  $ver = pct_cache_version_get($cpt);
  $cache_key = sprintf('%s:%d:cpt_%s:limit_%d', pct_upcoming_events_ns(), $ver, $cpt, $limit);

  $html = get_transient($cache_key);
  if ($html !== false) return $html;

  $now_mysql = pct_now_mysql();

  $q = new WP_Query([
    'post_type'           => $cpt,
    'post_status'         => 'publish',
    'posts_per_page'      => $limit,
    'ignore_sticky_posts' => true,
    'no_found_rows'       => true,
    'meta_key'            => 'fecha_inicio',
    'orderby'             => 'meta_value',
    'order'               => 'ASC',
    'meta_type'           => 'DATETIME', // si tu campo es DATE, cambia a 'DATE'
    'meta_query'          => [
      [
        'key'     => 'fecha_inicio',
        'value'   => $now_mysql,
        'compare' => '>=',
        'type'    => 'DATETIME',
      ],
    ],
  ]);

  //! RENDER SI NO HAY POSTS MATCHING

  if (!$q->have_posts()) {
    $html = '';
    // $html = '<div class="event-list is-empty"><p>No hay próximos eventos.</p></div>';
    set_transient($cache_key, $html, pct_seconds_until_midnight());
    return $html;
  }

  //! RENDER SI HAY POSTS MATCHING
  ob_start();
  echo '<section class="pct-section home-event-list no-pb">';
  $next_ts = null;

  while ($q->have_posts()) {
    $q->the_post();
    $id    = get_the_ID();
    $url   = get_permalink($id);
    $title = get_the_title($id);

    // Si Pods está activo y el CPT es un Pod:
    $pod = function_exists('pods') ? pods(get_post_type($id), $id) : null;

    // fecha_inicio con Pods o core:
    $inicio_raw = pct_get_field($cpt, $id, 'fecha_inicio');     // e.g. '2025-10-15 19:30:00'
    $inicio_ts  = pct_parse_wp_datetime_to_ts(is_string($inicio_raw) ? $inicio_raw : (string) $inicio_raw);
    if ($inicio_ts && ($next_ts === null || $inicio_ts < $next_ts)) {
      $next_ts = $inicio_ts;
    }
    $inicio_str = $inicio_ts ? wp_date(get_option('date_format') . ' ' . get_option('time_format'), $inicio_ts, wp_timezone()) : '';

    // Imagen destacada (Pods -> core)
    $img = pct_get_featured_image($cpt, $id, 'large');

  ?>

    <div class="wp-block-group next-event-card is-layout-constrained wp-block-group-is-layout-constrained">
      <div class="wp-block-group hero-img align-left is-layout-constrained wp-block-group-is-layout-constrained">
        <div class="wp-block-group is-layout-constrained wp-block-group-is-layout-constrained">
          <?php if ($img && !empty($img['url'])): ?>
            <a class="event-link" href="<?php echo esc_url($url); ?>">
              <figure class="event-thumb">
                <img src="<?php echo esc_url($img['url']); ?>" alt="<?php echo esc_attr($img['alt'] ?? $title); ?>" loading="lazy" decoding="async">
              </figure>
            </a>
          <?php endif; ?>
        </div>
      </div>
      <div class="wp-block-group description center-y is-layout-constrained wp-block-group-is-layout-constrained">
        <h3 class="wp-block-heading"><?php echo $pod->field('nombre') ?></h3>
        <p><?php echo $pod->field('description') ?></p>
        <div class="wp-block-buttons cta is-layout-flex wp-block-buttons-is-layout-flex">
          <div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="<?php echo esc_url($url); ?>"><?php echo __('Inscríbete ahora', 'pictau'); ?></a></div>
        </div>
      </div>
    </div>




<?php
  }
  echo '</section>';
  wp_reset_postdata();
  $html = ob_get_clean();

  // TTL dinámico: hasta justo después del próximo item (min 60s, máx 1h); si falla, hasta medianoche
  $now_ts = pct_wp_now()->getTimestamp();
  if ($next_ts && $next_ts > $now_ts) {
    $ttl = pct_clamp((int)($next_ts - $now_ts + 5), 60, HOUR_IN_SECONDS);
  } else {
    $ttl = pct_seconds_until_midnight();
  }

  // Marca de depuración (opcional, útil en desarrollo)
  $html .= '<!-- fragment ' . esc_html($cpt) . ' built ' . esc_html(wp_date('Y-m-d H:i:s', $now_ts)) . ' ver=' . $ver . ' ttl=' . $ttl . 's -->';

  set_transient($cache_key, $html, $ttl);
  return $html;
}

/* ==========
 * Shortcode
 * ========== */
// Uso: [proximos_eventos cpt="evento" limit="6"]
add_shortcode('proximos_eventos', function ($atts) {
  $atts = shortcode_atts([
    'cpt'   => 'evento',
    'limit' => 6,
  ], $atts, 'proximos_eventos');

  $cpt   = sanitize_key($atts['cpt']);
  $limit = (int) $atts['limit'];

  return pct_upcoming_events_html($cpt, $limit);
});

/* =========================
 * Invalidación de fragmento
 * ========================= */

// 1) Al guardar el post (título, estado, etc.) — versiona por CPT del post guardado
add_action('save_post', function ($post_id, $post, $update) {
  if (wp_is_post_revision($post_id)) return;
  if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
  $cpt = get_post_type($post_id);
  if (!$cpt) return;
  pct_cache_version_bump($cpt);
}, 10, 3);

// 2) Cambios de meta 'fecha_inicio' (Pods u otros) — versiona por CPT del post
foreach (['fecha_inicio'] as $meta_key) {
  add_action('added_post_meta', function ($meta_id, $post_id, $key, $value) use ($meta_key) {
    if ($key !== $meta_key) return;
    $cpt = get_post_type($post_id);
    if (!$cpt) return;
    pct_cache_version_bump($cpt);
  }, 10, 4);

  add_action('updated_post_meta', function ($meta_id, $post_id, $key, $value) use ($meta_key) {
    if ($key !== $meta_key) return;
    $cpt = get_post_type($post_id);
    if (!$cpt) return;
    pct_cache_version_bump($cpt);
  }, 10, 4);

  add_action('deleted_post_meta', function ($meta_ids, $post_id, $key, $value) use ($meta_key) {
    if ($key !== $meta_key) return;
    $cpt = get_post_type($post_id);
    if (!$cpt) return;
    pct_cache_version_bump($cpt);
  }, 10, 4);
}

// 3) Papelera / borrar
add_action('trashed_post', function ($post_id) {
  $cpt = get_post_type($post_id);
  if ($cpt) pct_cache_version_bump($cpt);
});
add_action('deleted_post', function ($post_id) {
  $cpt = get_post_type($post_id);
  if ($cpt) pct_cache_version_bump($cpt);
});

// 4) (Opcional) Re-cache diario: bump de versión de todos los CPT ya usados
add_action('init', function () {
  if (! wp_next_scheduled('pct_upcoming_recache_daily')) {
    wp_schedule_event(strtotime('tomorrow'), 'daily', 'pct_upcoming_recache_daily');
  }
});
add_action('pct_upcoming_recache_daily', function () {
  global $wpdb;
  $like = esc_sql(pct_upcoming_events_ns() . '_ver_%');
  $option_names = $wpdb->get_col("SELECT option_name FROM {$wpdb->options} WHERE option_name LIKE '{$like}'");
  if ($option_names) {
    foreach ($option_names as $opt_name) {
      $v = (int) get_option($opt_name, 1) + 1;
      update_option($opt_name, $v, false);
    }
    pct_purge_supercache_home();
  }
});
