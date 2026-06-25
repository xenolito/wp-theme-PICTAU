# Plan: Catálogo de productos — CPT + Taxonomía + Visualizador 3D + Shortcode de navegación

## Context

Se necesita implementar un catálogo de 115 productos de prefabricados de hormigón con:
- 13 categorías padre, algunas con subcategorías (máx. 2 niveles)
- URLs que reflejen la jerarquía: `/productos/categoria/subcategoria/producto`
- Un shortcode `[catalog-category-menu]` para el árbol de navegación de categorías
- Un visualizador 3D interactivo por producto (React/Three.js SPA ya desarrollada)

El tema no tiene WooCommerce. Usa Pods para CPTs. Todos los CPTs existentes siguen el mismo patrón de templates.

---

## Categorías (product-categories.md)

```
BORDILLOS → MONOCAPA (7), DOBLECAPA (14)
ADOQUINES Y BALDOSAS → ADOQUINES (8), BALDOSAS (7)
BALDOSA HIDRÁULICA (7) — sin subcategorías
BLOQUES → ESTÁNDAR (5), LISO (3), SPLIT (8), PIEZAS ESPECIALES (10)
BOVEDILLAS Y CASETONES (12) — sin subcategorías
TUBOS Y CONOS → TUBOS HM (5), TUBOS HA (6)
ARQUETAS → CON/SIN FONDO (2), TAPAS (1)
MARCOS (1), FORJADOS Y FERRALLAS (1), ÁRIDO ENSACADO (1),
ÁRIDOS (4), HORMIGONES (1), TRANSPORTE Y MAQUINARIA (12)
```

---

## Arquitectura técnica

### Paso 1 — Pods Admin: CPT + Taxonomía (todo desde el admin, sin código custom)

**CPT `producto`:**
- Slug público: `producto` | Label: Productos / Producto
- Public: true | `has_archive`: false (las categorías son el "archivo")
- Rewrite slug en Pods: `producto` (URLs: `/producto/nombre-producto/`)
- Campos Pods sugeridos: `subtitulo` (text), `ficha_tecnica` (file/PDF), `galeria` (image multi), `productos_relacionados` (relationship → producto), `visualizer_model_id` (text)
- Polylang: activar soporte bilingüe en Polylang > Tipos de contenido

**Taxonomía `product_category`:**
- Slug de registro: `product_category`
- Label: Categorías de producto / Categoría de producto
- Hierarchical: true ← imprescindible
- Attached to: `producto`
- Rewrite slug en Pods: `productos` (URLs: `/productos/bordillos/monocapa/`)
- Hierarchical rewrite: activar en Pods si está disponible; si no, se hace en PHP (ver nota)

**Tras crear en Pods**: Ajustes > Permalinks > Guardar (flush rewrite rules).

> **Nota sobre rewrite jerárquico:** Pods puede no exponer la opción `hierarchical => true` en el rewrite de la taxonomía. Si los slugs de subcategoría no incluyen el path del padre (`/productos/monocapa/` en vez de `/productos/bordillos/monocapa/`), añadir esto en `theme/functions.php`:
> ```php
> add_action('init', function () {
>     if (taxonomy_exists('product_category')) {
>         global $wp_taxonomies;
>         $wp_taxonomies['product_category']->rewrite = [
>             'slug'         => 'productos',
>             'hierarchical' => true,
>             'with_front'   => false,
>         ];
>     }
> }, 20);
> ```
> Después, guardar Permalinks de nuevo.

**Estructura de URLs resultante (todo Pods, sin PHP extra):**

| Tipo | URL |
|------|-----|
| Categoría padre | `/productos/bordillos/` |
| Subcategoría | `/productos/bordillos/monocapa/` |
| Producto individual | `/producto/nombre-producto/` |

> **Migración futura a URLs jerárquicas para productos:** Se puede añadir en cualquier momento (~60 líneas de PHP en `functions.php`) sin tocar templates, shortcode ni CSS. Solo requeriría configurar redirects 301 con el plugin Redirection para no romper SEO.
> Ver sección **"Opción futura: URLs jerárquicas de producto"** al final de este documento.

---

### Paso 2 — Templates

Siguiendo el patrón exacto de los CPTs existentes del tema:

**`theme/taxonomy-product_category.php`** — nueva
```php
<?php get_header(); ?>
<section id="primary">
  <main id="main">
    <?php
    $term = get_queried_object();
    // Render: título, descripción de la categoría, grid de productos
    // Shortcode del menú lateral: echo do_shortcode('[catalog-category-menu]');
    // Loop de WP_Query filtrando por $term
    ?>
  </main>
</section>
<?php get_footer(); ?>
```

**`theme/single-producto.php`** — nueva (igual patrón que `single-servicio.php`)
```php
<?php get_header(); ?>
<section id="primary"><main id="main">
  <?php while (have_posts()) : the_post();
    get_template_part('template-parts/content/content', 'single-producto');
  endwhile; ?>
</main></section>
<?php get_footer(); ?>
```

**`theme/template-parts/content/content-single-producto.php`** — nueva
- Usa `pods('producto', get_the_id())` para campos custom
- Incluye: header con imagen, título, subtítulo, descripción, ficha técnica (PDF), galería, productos relacionados
- Incluye el shortcode `[catalog-category-menu]` en el sidebar izquierdo
- Incluye el visualizador 3D si `visualizer_model_id` está definido

---

### Paso 3 — Shortcode `[catalog-category-menu]`

**Archivo:** `theme/inc/template-functions.php` (al final, siguiendo el patrón existente)

**Lógica:**
1. `get_terms(['taxonomy' => 'product_category', 'hide_empty' => false, 'parent' => 0])` → categorías raíz
2. Para cada categoría raíz, `get_terms(['parent' => $term->term_id])` → subcategorías
3. Detectar término activo: `get_queried_object()` en taxonomy archive; en single producto, obtener el término del post
4. Detectar padre del término activo para expandirlo por defecto
5. Renderizar `<ul>` anidado con:
   - `data-expanded` en padres activos
   - clase `is-active` en término actual
   - clase `has-children` + botón toggle en términos con hijos
6. El shortcode acepta atributo `title` (ej. `[catalog-category-menu title="Productos"]`)

**Atributos:** `title` (string, default "Productos")

**Output HTML:**
```html
<nav class="catalog-category-menu">
  <h3 class="catalog-menu__title">Productos</h3>
  <ul class="catalog-menu__list">
    <li class="has-children [is-active-parent]" data-expanded="[true|false]">
      <a href="/productos/bordillos/">BORDILLOS</a>
      <button class="catalog-menu__toggle" aria-expanded="[true|false]">−</button>
      <ul class="catalog-menu__children">
        <li class="[is-active]"><a href="/productos/bordillos/monocapa/">MONOCAPA</a></li>
        <li><a href="/productos/bordillos/doblecapa/">DOBLECAPA</a></li>
      </ul>
    </li>
    <li><a href="/productos/baldosa-hidraulica/">BALDOSA HIDRÁULICA</a></li>
    <!-- ... -->
  </ul>
</nav>
```

---

### Paso 4 — CSS

**Archivo:** `tailwind/custom/components/catalog-menu.css` — nuevo

Estilos para:
- `.catalog-category-menu` — contenedor (border-right en desktop, sin border en mobile)
- `.catalog-menu__title` — título de la sección (tipografía bold uppercase)
- `.catalog-menu__list` / `.catalog-menu__children` — listas sin bullets, padding izquierdo para hijos
- `.catalog-menu__toggle` — botón +/- (inline, sin background)
- `.is-active > a` — color primario (`text-primary`, `font-semibold`)
- `.is-active-parent > a` — color primario sin bold
- Transición para collapse/expand (max-height o display)
- `[data-expanded="false"] .catalog-menu__children` — `hidden`

Importar en `tailwind/custom/components/style.css`.

---

### Paso 5 — JS

**Archivo:** `javascript/modules/catalogMenu.js` — nuevo

```js
export function initCatalogMenu() {
  document.querySelectorAll('.catalog-menu__toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const li = btn.closest('li');
      const expanded = li.dataset.expanded === 'true';
      li.dataset.expanded = expanded ? 'false' : 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      btn.textContent = expanded ? '+' : '−';
    });
  });
}
```

Importar y llamar en `javascript/script.js`:
```js
import { initCatalogMenu } from './modules/catalogMenu.js';
initCatalogMenu();
```

---

## Integración del Visualizador 3D

### Contexto del proyecto visualizador

- **Ruta fuente:** `/Volumes/KRAKEN/PICTAU/WEB/PREFABRICADOS-DUERO/PD-3D_VISUALIZER`
- **Stack:** React 19 + React Three Fiber + Three.js, build con Vite
- **Embedding:** `<div id="viewer_3d" model="..." ui screenshot></div>` + script encolado
- **Por producto:** `models/{modelId}/config.json` + `model.gltf` + `model.bin` (+ variante bisel)
- **Compartidos:** `textures/`, `envmaps/`, `assets/` (chunks JS/CSS hasheados)
- **Shortcode:** `[pd_3d_viewer model="..."]`
- **Traducciones:** `window.pd3dLabels` inyectado via `wp_localize_script`

---

### Arquitectura de despliegue: Plugin WordPress `pd3d-visualizer`

**Opción elegida: Plugin WordPress independiente** (no en el tema).

**Razones:**
- Assets independientes del tema, actualizables solos
- Patrón WordPress estándar para apps JS
- URL predecible: `WP_PLUGIN_URL/pd3d-visualizer/dist/`

**Estructura del plugin:**

```
wp-content/plugins/pd3d-visualizer/
├── pd3d-visualizer.php       ← Plugin principal (shortcode + enqueue + localize)
└── dist/                     ← Build de Vite (copiado desde PD-3D_VISUALIZER/dist/)
    ├── assets/               ← JS/CSS hasheados (bundles React + Three.js)
    ├── models/               ← Por producto: config.json + .gltf + .bin
    ├── textures/             ← PBR textures compartidas (webp)
    ├── envmaps/              ← HDR environment maps
    ├── basis/                ← Codec Three.js
    └── draco/                ← Codec Three.js
```

---

### Ajuste en el visualizador: Base URL dinámica

El visualizador carga assets con paths absolutos (`/models/...`). En WordPress hay que apuntar al plugin.

**En el plugin PHP:** inyectar `window.pd3dConfig.baseUrl` via `wp_localize_script`.

**Cambio mínimo en `src/hooks/useModelConfig.js`:**
```js
const baseUrl = window.pd3dConfig?.baseUrl ?? '/';
const configUrl = `${baseUrl}models/${modelId}/config.json`;
```
Y en los loaders de `Aparejo.jsx`: usar `baseUrl` como prefijo para gltf y textures.

---

### Campo Pods en CPT `producto`

**Campo:** `visualizer_model_id`
- Tipo: `text`
- Label: "ID modelo 3D"
- No requerido
- Valor ejemplo: `baldosa_colegiata_40x20`

Solo el `model_id`, no la URL completa. La URL base la gestiona el plugin.

---

### Plugin PHP: `pd3d-visualizer.php`

```php
<?php
/**
 * Plugin Name: PD 3D Visualizer
 * Description: Visualizador 3D interactivo para el catálogo de productos.
 * Version: 1.0.0
 */

defined('ABSPATH') || exit;

add_shortcode('pd_3d_viewer', function ($atts) {
    $atts = shortcode_atts([
        'model'      => '',
        'ui'         => '1',
        'screenshot' => '0',
        'wet'        => '0',
    ], $atts);

    if (empty($atts['model'])) return '';

    pd3d_enqueue_assets();

    $attrs  = 'model="' . esc_attr($atts['model']) . '"';
    $attrs .= $atts['ui']         ? ' ui'         : '';
    $attrs .= $atts['screenshot'] ? ' screenshot' : '';
    $attrs .= $atts['wet']        ? ' wet'        : '';

    return '<div id="viewer_3d" class="pd3d-viewer" ' . $attrs . '></div>';
});

function pd3d_enqueue_assets() {
    static $enqueued = false;
    if ($enqueued) return;
    $enqueued = true;

    $dist = plugin_dir_url(__FILE__) . 'dist/';
    $dir  = plugin_dir_path(__FILE__) . 'dist/assets/';

    $js_file  = glob($dir . 'index-*.js')[0]  ?? null;
    $css_file = glob($dir . 'index-*.css')[0] ?? null;

    if ($js_file) {
        $js_handle = 'pd3d-visualizer';
        wp_enqueue_script($js_handle, $dist . 'assets/' . basename($js_file), [], null, true);
        wp_localize_script($js_handle, 'pd3dConfig', [
            'baseUrl' => $dist,
            'labels'  => pd3d_get_labels(),
        ]);
    }
    if ($css_file) {
        wp_enqueue_style('pd3d-visualizer', $dist . 'assets/' . basename($css_file), [], null);
    }
}

function pd3d_get_labels() {
    $lang = function_exists('pll_current_language') ? pll_current_language() : 'es';
    return [
        'lang'       => $lang,
        'screenshot' => $lang === 'en' ? 'Download image' : 'Descargar imagen',
    ];
}
```

---

### Integración en `content-single-producto.php`

```php
$model_id = $pods->field('visualizer_model_id');
if ($model_id) {
    echo '<div class="producto-viewer">';
    echo do_shortcode('[pd_3d_viewer model="' . esc_attr($model_id) . '" ui="1" screenshot="1"]');
    echo '</div>';
}
```

---

### Workflow de actualización del visualizador

```
1. Desarrollar en PD-3D_VISUALIZER/
2. npm run build  →  genera dist/
3. npm run deploy:wp  →  rsync a wp-content/plugins/pd3d-visualizer/dist/
```

Script a añadir en `PD-3D_VISUALIZER/package.json`:
```json
"deploy:wp": "rsync -av --delete dist/ /Volumes/KRAKEN/HTDOCS/prefabricadosduero/app/public/wp-content/plugins/pd3d-visualizer/dist/"
```

---

## Archivos a crear/modificar

| Acción | Archivo |
|--------|---------|
| Modificar (solo si necesario) | `theme/functions.php` |
| Modificar | `theme/inc/template-functions.php` |
| Modificar | `javascript/script.js` |
| Modificar | `tailwind/custom/components/style.css` |
| Crear | `theme/taxonomy-product_category.php` |
| Crear | `theme/single-producto.php` |
| Crear | `theme/template-parts/content/content-single-producto.php` |
| Crear | `tailwind/custom/components/catalog-menu.css` |
| Crear | `javascript/modules/catalogMenu.js` |
| Crear | `wp-content/plugins/pd3d-visualizer/pd3d-visualizer.php` |
| Copiar build | `wp-content/plugins/pd3d-visualizer/dist/` |
| Modificar | `PD-3D_VISUALIZER/src/hooks/useModelConfig.js` |
| Modificar | `PD-3D_VISUALIZER/src/Aparejo.jsx` |

---

## Orden de implementación

1. **Pods Admin**: crear taxonomía `product_category` (jerárquica, slug `productos`) y CPT `producto` (slug `producto`) con campos
2. Guardar Permalinks en WP Admin
3. **(Opcional) PHP** en `theme/functions.php`: solo si el rewrite jerárquico de la taxonomía no funciona desde Pods
4. **Crear categorías** con la estructura del archivo `.claude/product-categories.md`
5. **Plugin** `pd3d-visualizer`: crear PHP + copiar dist
6. **Ajuste visualizador**: `useModelConfig.js` + `Aparejo.jsx` para `baseUrl` dinámica
7. **Templates**: `taxonomy-product_category.php`, `single-producto.php`, `content-single-producto.php`
8. **Shortcode** `[catalog-category-menu]` en `template-functions.php`
9. **CSS** `catalog-menu.css` + importar en `style.css`
10. **JS** `catalogMenu.js` + importar en `script.js`
11. **Build tema**: `npm run development`
12. **Verificación** con Playwright

---

## Verificación

1. Crear 2-3 productos de prueba con y sin `visualizer_model_id`
2. Verificar con Playwright:
   - `/productos/bordillos/` → taxonomy archive con grid de productos
   - `/productos/bordillos/monocapa/` → taxonomy archive filtrado
   - `/producto/nombre-producto/` → single con menú lateral activo + visualizador 3D
   - Botones +/- del menú colapsan/expanden categorías con hijos
   - Visualizador carga assets desde el plugin (sin 404s en Network)
3. Verificar `get_permalink()` de productos
4. Comprobar flush de permalinks

---

## Notas

- **Polylang**: activar soporte en Polylang > Tipos de contenido tras crear CPT/taxonomía. Los `get_terms()` del shortcode filtran por `pll_current_language()`.
- **Pods vs PHP para taxonomía**: si Pods no permite `rewrite => hierarchical`, crear la taxonomía en PHP y solo el CPT en Pods.
- **flush_rewrite_rules()**: NO llamar en `init`. Solo guardar Permalinks desde el admin.

---

## Opción futura: URLs jerárquicas de producto

Para migrar a `/productos/bordillos/monocapa/nombre-producto/`:

### A. Rewrite tags y reglas (`theme/functions.php`)

```php
add_action('init', function () {
    add_rewrite_tag('%product_cat1%', '([^/]+)');
    add_rewrite_tag('%product_cat2%', '([^/]+)');

    add_rewrite_rule(
        '^productos/([^/]+)/([^/]+)/([^/]+)/?$',
        'index.php?post_type=producto&name=$matches[3]&product_cat1=$matches[1]&product_cat2=$matches[2]',
        'top'
    );
    add_rewrite_rule(
        '^productos/([^/]+)/([^/]+)/?$',
        'index.php?post_type=producto&name=$matches[2]&product_cat1=$matches[1]',
        'top'
    );
}, 20);
```

### B. Filtro `request` — desambiguar 2 segmentos

```php
add_filter('request', function ($vars) {
    if (
        isset($vars['post_type'], $vars['name'], $vars['product_cat1'])
        && $vars['post_type'] === 'producto'
        && !isset($vars['product_cat2'])
    ) {
        $parent = get_term_by('slug', $vars['product_cat1'], 'product_category');
        if ($parent) {
            $child = get_term_by('slug', $vars['name'], 'product_category');
            if ($child && (int) $child->parent === (int) $parent->term_id) {
                unset($vars['post_type'], $vars['name'], $vars['product_cat1']);
                $vars['product_category'] = $vars['product_cat1'] . '/' . $vars['name'];
            }
        }
    }
    return $vars;
});
```

### C. Filtro `post_type_link`

```php
add_filter('post_type_link', function ($post_link, $post) {
    if ($post->post_type !== 'producto') return $post_link;
    $terms = get_the_terms($post->ID, 'product_category');
    if (!$terms || is_wp_error($terms)) return home_url('/productos/' . $post->post_name . '/');
    usort($terms, fn($a, $b) => $b->parent - $a->parent);
    $term      = $terms[0];
    $ancestors = array_reverse(get_ancestors($term->term_id, 'product_category', 'taxonomy'));
    $parts     = [];
    foreach ($ancestors as $anc_id) {
        $parts[] = get_term($anc_id, 'product_category')->slug;
    }
    $parts[] = $term->slug;
    $parts[] = $post->post_name;
    return home_url('/productos/' . implode('/', $parts) . '/');
}, 10, 2);
```

> Tras activar: guardar Permalinks + configurar redirects 301 con el plugin Redirection.
