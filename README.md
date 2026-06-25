# Tema PICTAU para WordPress 7.x

Tema WordPress personalizado (marca blanca). Diseñado para proyectos a medida con soporte para catálogos de productos, CPTs via Pods, animaciones GSAP y un sistema de bloques Gutenberg extendido.

- **Versión:** 6.2.0
- **Text domain:** `pictau`
- **Stack:** PHP 8+, WordPress 6+, TailwindCSS 3, esbuild, PostCSS

---

## Entorno de desarrollo

- Local by Flywheel (o similar) con PHP 8+ y MySQL
- Node.js 18+ y npm
- WP-CLI (para operaciones de Pods vía `wp eval`)

## Plugins recomendados

- [Contact Form 7](https://es.wordpress.org/plugins/contact-form-7/)
- [Contact Form 7 Registro de envios + GDPR](https://github.com/xenolito/WordPress-Plugin-Contact-Form-7_Registro-envios-GDPR)
- [Contact Form CFDB7](https://es.wordpress.org/plugins/contact-form-cfdb7/)
- [Polylang](https://es.wordpress.org/plugins/polylang/)
- [CPT i18n slugs – Slugs traducibles para CPT (Polylang + Pods)](https://github.com/xenolito/WordPress-Plugin-Polylang-Addon-CPT-i18n-slugs)
- [GDPR Cookie Compliance](https://es.wordpress.org/plugins/gdpr-cookie-compliance/)
- [Loco Translate](https://es.wordpress.org/plugins/loco-translate/)
- [Maintenance Mode by Pictau](https://github.com/xenolito/WordPress-Plugin-Maintenance-Mode-by-Pictau)
- [Multilingual CF7 with Polylang](https://es.wordpress.org/plugins/multilingual-contact-form-7-with-polylang/)
- [PCT Gallery](https://github.com/xenolito/WordPress-Plugin-Image-Gallery)
- [Pictau Blocks Gutenberg](https://github.com/xenolito/wordpress-pictau-blocks-plugin)
- [Pods](https://es.wordpress.org/plugins/pods/)
- [WP Hide Login](https://es.wordpress.org/plugins/wps-hide-login/)
- [WP Mail SMTP](https://es.wordpress.org/plugins/wp-mail-smtp/)
- [Yoast Duplicate Post](https://es.wordpress.org/plugins/duplicate-post/)
- [Updraft Plus – Backup and Restore](https://es.wordpress.org/plugins/updraftplus/)

---

## Instalación y build

```bash
npm install          # Instalar dependencias
npm run development  # Build de desarrollo (con source maps)
npm run watch        # Watch + Browsersync
npm run production   # Build de producción (minificado)
npm run lint         # ESLint + Prettier
npm run bundle       # Generar .zip para despliegue
```

> **BrowserSync — configurar dominio/proxy:** edita [`bs.config.cjs`](bs.config.cjs) en la raíz del tema y ajusta el valor de `proxy` a la URL local del sitio:
> ```js
> proxy: 'https://mi-sitio.dev/',
> ```

---

## Estructura

```
pictau/
├── theme/
│   ├── inc/
│   │   ├── template-functions.php  # Shortcodes y hooks
│   │   ├── template-tags.php
│   │   ├── utilities.php
│   │   ├── events.php
│   │   └── block-attributes.php    # Atributos HTML en bloques Gutenberg
│   ├── js/                          # JS compilado
│   ├── template-parts/
│   │   ├── layout/
│   │   └── content/
│   ├── taxonomy-product_category.php
│   ├── single-producto.php
│   └── style.css                    # CSS compilado
├── javascript/
│   ├── script.js                    # Entry point JS
│   └── modules/                     # 60+ módulos
├── tailwind/
│   ├── style.css                    # Entry point CSS
│   └── custom/components/
├── .claude/
│   └── pods-playbook.json           # Historial de operaciones Pods
├── CLAUDE.md
└── package.json
```

---

## Custom Post Types y taxonomías (Pods)

Los CPTs y taxonomías se crean y gestionan mediante el plugin Pods. Las operaciones se documentan en `.claude/pods-playbook.json` y se ejecutan via WP-CLI.

El tema incluye soporte nativo para el catálogo de productos:

| Slug | Tipo | Descripción |
|------|------|-------------|
| `producto` | CPT | Productos del catálogo |
| `product_category` | Taxonomía | Categorías de producto (jerárquica) |

El resto de CPTs del proyecto se definen según las necesidades de cada cliente.

### Campos del CPT `producto`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `subtitulo` | text | Subtítulo corto |
| `ficha_tecnica` | file (any, single) | PDF de ficha técnica |
| `galeria` | file (images, multi) | Galería de imágenes |
| `visualizer_model_id` | text | ID del modelo 3D (requiere plugin `pd3d-visualizer`) |
| `orden` | number | Orden de aparición dentro de la categoría (menor = primero; vacío = al final, ordenado por título) |
| `productos_relacionados` | relationship | Productos relacionados (hasta 10) |

### Campos de la taxonomía `product_category`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `orden` | number | Orden en el menú lateral (menor = primero; sin valor = al final) |
| `imagen_destacada` | file (image, single) | Imagen de la categoría para el grid de subcategorías |
| `subtitulo` | text | Subtítulo corto de la categoría (se muestra bajo el título en el archive) |
| `icono` | file (image, single) | Icono SVG representativo de la categoría (usado en `[megamenu-cat-by-cpt]`) |
| `menu_desc` | text | Descripción corta que se muestra en el ítem del megamenú (`[megamenu-cat-by-cpt]`) |
| `faqs` | wysiwyg (Quill) | Preguntas frecuentes de la categoría. Con herencia: si la subcategoría no tiene FAQs, se muestran las de la categoría padre |
| `faqs_collapsables` | boolean | Si está activo, las FAQs se renderizan como acordeón colapsable en lugar de HTML plano |

---

## Catálogo de productos

### `taxonomy-product_category.php`

Archive de `product_category`. Detecta automáticamente si la categoría tiene subcategorías:

- **Categoría padre** → grid de subcategorías (`.subcat-grid`) con imagen destacada, ordenadas por `orden`.
- **Categoría hoja** → grid de productos (`.catalog-grid`) con paginación.

#### Ordenación de productos por campo `orden`

Los productos se ordenan dentro de su categoría por el campo `orden` (meta del CPT `producto`):

1. Se obtienen todos los IDs de la categoría con una primera query (`fields => 'ids'`).
2. Se priman los metas con `update_meta_cache()` y se ordena en PHP con `usort()`.
3. Productos **con** `orden` definido (incluyendo `0`) aparecen primero, ordenados por valor ASC.
4. Productos **sin** `orden` aparecen al final, ordenados por título.
5. La query final usa `post__in` + `orderby => post__in` para respetar el orden calculado y mantener la paginación correcta.

#### Color swatches en las cards de producto

Cada `.catalog-card` muestra los swatches de color disponibles si el producto tiene `visualizer_model_id` y más de 1 variante. Los datos se leen del `config.json` del plugin `pd3d-visualizer`:

```
wp-content/plugins/pd3d-visualizer/dist/models/{model_id}/config.json
→ textures.Diffuse.groups[].variants
```

- Modo `tint`: todos los variantes comparten la misma imagen base (`baseTexture`) + overlay CSS (`mix-blend-mode: multiply`) con el hex del color.
- Modo `texture`: cada variante tiene su propia imagen thumbnail.
- URL de thumbnails: `dist/textures/texture_diffuse_{id}_thumb.{format}`

**Límite de swatches visible:**
- Hardcoded en `taxonomy-product_category.php`: `$max = 10` (línea ~194).
- Configurable desde **Apariencia → Personalizar → THEME CUSTOMIZER → Catálogo** (setting `catalog_swatches_limit`, default `10`).
- La sección solo aparece si la taxonomía `product_category` existe (`taxonomy_exists()`).
- En PHP: `max( 1, (int) get_theme_mod('catalog_swatches_limit', 10) )`

> **Mejora pendiente:** actualmente se hace `file_exists()` + `file_get_contents()` + `json_decode()` por cada producto con `visualizer_model_id` en cada carga de página. Si el catálogo crece, añadir caché con `wp_cache_get/set` por `model_id` para evitar releer el mismo `config.json` varias veces en una misma request.

### `single-producto.php`

Ficha de producto: header con imagen, breadcrumb, sidebar con `[catalog-category-menu]`, descripción, visualizador 3D, galería y ficha técnica PDF.

#### FAQs en la ficha de producto

El template `content-single-producto.php` muestra un bloque de FAQs al final del contenido del CPT si la categoría asignada al producto tiene el campo `faqs` relleno.

**Lógica de herencia:**
1. Se busca el campo `faqs` en la subcategoría asignada al producto.
2. Si está vacío, se usa el valor de la categoría padre.
3. Si ninguna tiene FAQs, no se renderiza nada.

**Renderizado condicional:**
- Si `faqs_collapsables` es `false` (defecto): el HTML del campo se vuelca tal cual con `wp_kses_post()`.
- Si `faqs_collapsables` es `true`: el HTML pasa por `pictau_format_faqs_collapsable()` (`theme/inc/utilities.php`), que lo transforma en el layout colapsable `.pct-faqs` / `.faq` que gestiona `javascript/modules/faqs.js`.

**Patrón de parseo para el layout colapsable:**
- `<p><strong>Texto</strong></p>` → pregunta (el `<strong>` se extrae como texto plano)
- Todo el contenido hasta la siguiente `<p><strong>` → respuesta (puede incluir múltiples `<p>`, `<ul>`, etc.)
- Los `<p>&nbsp;</p>` que inserta Quill como separadores se descartan automáticamente.

### Datos estructurados — Schema.org Product (Yoast SEO)

Las fichas de producto emiten un nodo `schema.org/Product` en el grafo JSON-LD de Yoast para habilitar rich results, Google Imágenes y Google Lens.

**Implementación:** `theme/inc/catalog.php` — clase `Pictau_Product_Schema_Piece` + filtro `wpseo_breadcrumb_links`.

#### Nodo `Product` generado

| Propiedad | Fuente |
|---|---|
| `name` | `post_title` |
| `sku` | `post_name` (slug) |
| `description` | `post_content` limpio (55 palabras) |
| `image` | Imagen destacada + galería (`galeria`) con `width`/`height` |
| `brand` | Referencia `@id` al nodo `Organization` de Yoast |
| `category` | Términos de `product_category` (`padre > hijo`) |
| `offers` | `Offer` con `price: 0` (workaround B2B), `InStock`, `priceCurrency: EUR`, `seller` → `Organization` |
| `additionalProperty` | Norma UNE (`norma_une`) · EPD/DAP (`declaracion_ambiental` → URL del PDF) |
| `hasCertification` | Nodo `Certification` con PDF, imagen y `issuedBy` (`certificado` + `certificado_nombre` + `certificado_imagen`) |
| `isRelatedTo` | Productos relacionados (`productos_relacionados`): nodos `Product` mínimos |
| `mainEntityOfPage` | Referencia al nodo `WebPage` de Yoast |
| `inLanguage` | BCP-47 vía Polylang (`pll_current_language`) o `get_bloginfo('language')` |

> **`offers` con `price: 0`:** Google exige al menos uno de `offers`, `review` o `aggregateRating` para considerar el nodo `Product` elegible como rich result; y si se incluye `offers`, exige `price`. Para productos B2B sin precio público, `price: 0` es el workaround estándar que satisface el validador sin que Google muestre el valor en los resultados.

> **`brand`:** es una referencia `@id` (`{"@id": "<site>#organization"}`), no un nodo duplicado. Requiere que Yoast esté configurado como **Organización** (ver configuración más abajo).

#### BreadcrumbList con jerarquía completa

El filtro `wpseo_breadcrumb_links` inyecta la cadena completa de `product_category` (categoría padre → subcategoría → producto) en el nodo `BreadcrumbList` de Yoast. Sin este filtro, Yoast solo incluye dos niveles (Portada → Producto) porque el CPT `producto` no tiene archivo público.

El filtro respeta el **término primario de Yoast** si está definido (`WPSEO_Primary_Term`); si no, usa el primer término asignado.

#### Configuración requerida en Yoast (panel WP Admin)

| Sección | Ajuste | Valor |
|---|---|---|
| **Representación del sitio** | Tipo de entidad | Organización |
| | Nombre y logo | Nombre del sitio + logotipo |
| **Tipos de contenido › Producto** | Tipo de esquema | `ItemPage` |
| | Tipo de artículo | Ninguno |
| **Breadcrumbs › Tipos de contenido** | Taxonomía para `producto` | Categorías de producto |

#### Validación

- [Google Rich Results Test](https://search.google.com/test/rich-results) → debe aparecer resultado tipo **Product**.
- [Schema Markup Validator](https://validator.schema.org/) → sin errores de tipo.
- DevTools (Sources): un único `<script type="application/ld+json">` con `@graph` que contiene `WebPage`, `ImageObject`, `BreadcrumbList`, `WebSite`, `Organization` y `Product`.

### Títulos SEO — Jerarquía de categorías (Yoast)

Filtros `wpseo_title` en `theme/inc/catalog.php` que enriquecen automáticamente los títulos de página con la cadena de categorías, respetando el resto del formato de Yoast (`%%sep%%`, `%%sitename%%`, paginación).

#### Archives de subcategoría (`product_category`)

Cuando la categoría tiene padre, el nombre del padre se antepone al nombre del término con ` / ` como separador.

| URL | Título generado |
|-----|-----------------|
| `/productos/categoria-padre/` | `Categoría Padre - Nombre Sitio` |
| `/productos/categoria-padre/subcategoria/` | `Categoría Padre / Subcategoría - Nombre Sitio` |

**Plantilla Yoast para `product_category`** (ajustada en WP Admin → Yoast SEO → Categorías de producto):
```
%%term_title%% %%page%% %%sep%% %%sitename%%
```
> Se eliminó el literal "archivos" que Yoast incluye por defecto.

#### Fichas de producto (`producto`)

Construye la cadena completa de ancestros de la categoría primaria (Yoast) o primer término asignado, y la antepone al título del post.

| Producto | Categoría asignada | Título generado |
|----------|--------------------|-----------------|
| Producto A | Categoría › Subcategoría | `Categoría / Subcategoría / Producto A - Nombre Sitio` |

La jerarquía se construye recorriendo `WP_Term::parent` hacia arriba. Funciona con cualquier profundidad de anidamiento. Si Yoast tiene un título personalizado guardado para el término o el post, ese toma precedencia (Yoast ejecuta sus overrides antes del filtro).

#### Fallback sin Yoast SEO

Cuando Yoast no está activo, el filtro `document_title_parts` (WordPress nativo) aplica el mismo patrón jerárquico. Ambos filtros conviven sin interferirse: el de `document_title_parts` tiene un guard `defined('WPSEO_VERSION')` que lo desactiva cuando Yoast está presente.

| Situación | Filtro activo |
|-----------|--------------|
| Yoast activo | `wpseo_title` |
| Yoast inactivo | `document_title_parts` |

La única diferencia es el separador entre título y nombre del sitio: Yoast usa ` - ` y WordPress nativo usa ` – ` (en-dash). El contenido del título es idéntico en ambos casos.

---

## Bloques Gutenberg — FAQs colapsables

### Bloque de grupo con clase `pct-faqs collapsable`

Cualquier bloque de **Grupo** de Gutenberg con las clases CSS `pct-faqs collapsable` se transforma automáticamente en un acordeón de FAQs al renderizar en el frontend.

**Cómo usarlo en el editor:**
1. Insertar un bloque **Grupo** en cualquier página o tipo de contenido.
2. En el panel derecho → *Avanzado → Clases CSS adicionales*: `pct-faqs collapsable`.
3. Añadir párrafos dentro del grupo siguiendo el patrón:
   - `<p><strong>Pregunta?</strong></p>` → se convierte en pregunta del acordeón
   - Los párrafos siguientes hasta el próximo `<p><strong>` → respuesta

**Comportamiento:**
- El filtro `render_block_core/group` en `theme/inc/utilities.php` intercepta el renderizado solo para bloques con ambas clases — el resto de grupos no se ven afectados (early-exit por `str_contains`).
- El HTML del bloque se transforma mediante `pictau_format_faqs_collapsable()` en la estructura `.pct-faqs.collapsable` / `.faq` que gestiona `javascript/modules/faqs.js`.
- `pictau_format_faqs_collapsable()` **siempre incluye `collapsable`** en el `<div>` raíz del output, ya que la función solo se invoca cuando se quiere el acordeón.
- `faqs.js` solo activa el acordeón en elementos `.pct-faqs.collapsable` — un grupo con solo `pct-faqs` (sin `collapsable`) se renderiza tal cual y el JS no lo toca.

**Patrón de parseo:** igual que el de las FAQs de las categorías de producto (ver sección anterior).

---

## Bloques Gutenberg — Comparador de imágenes (imgcompare)

Convierte un bloque **Grupo** de Gutenberg con dos imágenes hijas en un comparador antes/después con slider arrastrable. Módulo JS: `javascript/modules/imgcompare.js`.

### Configuración en el editor

1. Insertar un bloque **Grupo** con exactamente 2 bloques **Imagen** dentro.
2. Seleccionar el bloque Grupo y en **Avanzado**:
   - **Atributos adicionales** → añadir `data-imgcompare` (sin valor)
   - **Clases CSS adicionales** → añadir `imgcompare`

> La clase `imgcompare` es necesaria solo para el preview visual en el editor. En el frontend, el módulo JS se inicializa únicamente por el atributo `data-imgcompare`.

### Preview en el editor

Cuando el bloque tiene la clase `imgcompare`, el editor muestra las dos imágenes superpuestas al 50% con la línea separadora y el botón del handler (no interactivo). Al seleccionar cualquiera de las dos imágenes para editarla, el overlay desaparece y ambas imágenes vuelven al flujo normal — esto permite cambiar o editar cada imagen con normalidad. Al deseleccionar, el preview vuelve a activarse.

### Modo interactivo (por defecto)

El usuario arrastra el handler para revelar la imagen antes/después. Funciona con ratón y con touch (el toque sobre el handler bloquea el scroll de la página mientras se arrastra).

**CSS:** `tailwind/custom/components/img-compare.css`
**Atributo de activación:** `data-imgcompare`

### Modo showoff

El handler se anima automáticamente de forma orgánica (distintas velocidades y easings) simulando interacción humana, para incitar al usuario a usar el slider. El handler no es interactuable en este modo.

**Atributos adicionales en el editor:**

| Atributo | Valor | Descripción |
|---|---|---|
| `data-imgcompare_showoff` | `true` | Activa el modo showoff |
| `data-imgcompare_startdelay` | `2` ó `"1-4"` | Segundos de delay antes de arrancar la animación. Acepta un rango `"min-max"` para que múltiples instancias en la misma página arranquen en momentos aleatorios distintos |

**Optimización de rendimiento:** la animación (y su delay) no empieza hasta que el bloque entra en el viewport (IntersectionObserver). Si el bloque sale del viewport, la animación se pausa; al volver a entrar, se reanuda desde donde estaba.

---

## Bloques Gutenberg — Slider de testimonials (testimonials-splide)

Convierte un bloque **Grupo** de Gutenberg en un slider Splide de testimonios (o cualquier contenido en formato carrusel). Módulo JS: `javascript/modules/testimonials-splide.js`.

**Atributo de activación:** `data-testimonials`

### Configuración en el editor

1. Insertar un bloque **Grupo** exterior → añadir el atributo `data-testimonials` vía el panel **Atributos HTML**.
2. Añadir dentro un **Grupo por cada slide** con el contenido deseado (mínimo 2).

### Estructura HTML requerida

Los hijos directos del outer Group son los slides. El módulo crea el `splide__track` y el `splide__list` programáticamente y mueve los hijos dentro.

```
📦 Group (outer)    ← data-testimonials aquí
  ├── 📦 Group (slide 1)
  ├── 📦 Group (slide 2)
  └── 📦 Group (slide N…)
```

Se requieren al menos 2 hijos directos.

### Atributos de configuración (en el bloque exterior)

| Atributo | Valor de ejemplo | Descripción |
|---|---|---|
| `data-testimonials` | *(vacío)* | **Activa el slider** (requerido) |
| `data-testimonials_nopagination` | `true` | Oculta los puntos/paginación |
| `data-testimonials_autoplay` | `3000` | Autoplay cada N ms. `pauseOnHover` activo automáticamente |
| `data-testimonials_arrows` | `1` | Muestra flechas nativas de Splide |
| `data-testimonials_customarrows` | `#mis-flechas` | Selector CSS de un bloque externo con flechas custom (primer hijo = prev, último hijo = next) |
| `data-testimonials_visibleslides` | `3` | Nº de slides visibles en desktop (>1000 px). Default: `2` |
| `data-testimonials_speed` | `600` | Duración de la transición entre slides en ms. Default: `900` |
| `data-testimonials_gap` | `3rem` | Espacio entre slides. Acepta cualquier valor CSS (`rem`, `px`, `clamp(…)`). Default: `clamp(2rem, 5vw, 4.8rem)` |
| `data-testimonials_padding` | `4rem` | Padding del track (efecto "peek": cuánto se asoman los slides adyacentes por los laterales). Acepta cualquier valor CSS. Default: `clamp(5.6rem, 10vw, 9.6rem)`. En móvil (≤535 px) siempre se aplica `2rem` independientemente de este valor |
| `data-testimonials_draggable` | `true` | Habilita drag con ratón |
| `data-testimonials_log` | `1` | Activa logging en consola para debug |

### Comportamiento por defecto

| Breakpoint | Slides visibles | Padding lateral |
|---|---|---|
| >1000 px | 2 (configurable con `data-testimonials_visibleslides`) | `clamp(5.6rem, 10vw, 9.6rem)` |
| ≤1000 px | 1 | `clamp(5.6rem, 10vw, 9.6rem)` |
| ≤535 px | 1 | `2rem` |

- **Gap entre slides:** `clamp(2rem, 5vw, 4.8rem)` — configurable con `data-testimonials_gap`
- **Tipo de loop:** `loop` si hay más de 2 slides; `slide` si hay ≤2
- **Paginación:** visible por defecto
- **Flechas:** ocultas por defecto
- **Autoplay:** desactivado por defecto
- **Easing de transición:** `cubic-bezier(0.2, 1, 0.3, 1)` (hardcoded)
- **Velocidad de transición:** 900 ms (configurable con `data-testimonials_speed`)

### Autoplay y visibilidad (IntersectionObserver)

Cuando el autoplay está activo (`data-testimonials_autoplay`), el módulo registra un `IntersectionObserver` sobre el contenedor. En cuanto el slider sale completamente del viewport se pausa el autoplay (`Components.Autoplay.pause()`); al volver a entrar se reanuda (`Components.Autoplay.play()`). Con `threshold: 0` basta con que un píxel sea visible para reactivarlo. Si no hay autoplay configurado, el observer no se crea.

### `customarrows` — flechas externas

Si se usa `data-testimonials_customarrows`, el bloque apuntado debe tener exactamente **2 hijos directos**: el primero actúa como botón "anterior" y el último como botón "siguiente". En móvil (≤535 px), si `customarrows` está activo, las flechas nativas se ocultan automáticamente.

---

## Shortcodes

### `[catalog-category-menu]`

Menú lateral de categorías con expand/collapse animado (CSS `grid-template-rows`). Ordena por `orden` (sin valor → al final). Compatible con Polylang.

**Link directo al producto cuando hay 1 solo producto:** si una categoría hoja (sin subcategorías) tiene exactamente `count === 1`, el link del menú apunta directamente al permalink del producto en lugar de al archive de la categoría. Esto evita un paso innecesario al usuario. La detección usa `$term->count` (ya en memoria, sin queries extra) y solo lanza una `WP_Query` adicional cuando se cumple la condición.

### `[product-grid]`

Grid de productos de una categoría con filtro opcional por variante del visualizador 3D. Genera el mismo markup `.catalog-grid` / `.catalog-card.style-2` que `taxonomy-product_category.php`.

**Atributos:**

| Atributo | Requerido | Descripción |
|----------|-----------|-------------|
| `category` | Sí* | Slug o lista de slugs separados por coma de `product_category`. Cada slug puede ser categoría o subcategoría; los productos de subcategorías hijo se incluyen automáticamente (`include_children = true`). *Opcional si se usa `only`. |
| `variant` | No | Nombre (o parte del nombre) del grupo de variante a filtrar. Insensible a tildes y caracteres especiales. Si se omite, se muestran todos los productos de la categoría. |
| `color` | No | Valor inicial del visualizador. Si se proporciona, se añade `?color=<valor>` a la URL de cada card. |
| `wet` | No | Estado de visualización húmedo/seco. Si se proporciona (`true` o `false`), se añade `?wet=<valor>` a la URL de cada card. |
| `only` | No | Lista de IDs de producto separados por coma. Cuando está presente, se ignora `category` y se devuelven únicamente esos productos (publicados), en el orden declarado. Compatible con `variant` y `color`. |
| `class` | No | Clase o clases CSS adicionales (separadas por espacio) que se añaden al elemento `.catalog-grid`. |

**Filtrado:** cuando se especifica `variant`, solo aparecen productos cuyo `config.json` tenga al menos un grupo con `name` que contenga la cadena normalizada (sin tildes, sin símbolos). Sin `variant`, se muestran todos los productos de la categoría; los que tengan `visualizer_model_id` con `config.json` válido obtienen swatches automáticamente.

**Ordenación:** con `category`, misma lógica que el archive — campo `orden` ASC (productos sin `orden` al final, ordenados por título). Con `only`, se respeta el orden de los IDs declarados.

**Swatches:** se muestran todas las variantes (todos los grupos del config.json). Respeta el límite configurable en **Apariencia → Personalizar → THEME CUSTOMIZER → Catálogo** (`catalog_swatches_limit`, default `10`).

**Ejemplos:**
```
[product-grid category="mi-categoria" variant="variante-a"]
[product-grid category="categoria-a,categoria-b"]
[product-grid only="101,102,103"]
```

### `[megamenu-cat-by-cpt cpt="..."]`

Megamenú jerárquico de taxonomías para cualquier CPT. Muestra las categorías de primer nivel como grupos con icono y las de segundo nivel como enlaces navegables.

**Atributo:**

| Atributo | Requerido | Descripción |
|----------|-----------|-------------|
| `cpt` | Sí | Slug del CPT; auto-detecta la primera taxonomía registrada |
| `level` | No | Niveles de profundidad: `1` = solo primer nivel, `2` = primer y segundo nivel, sin valor = todos los niveles |

**Comportamiento:**

- Las categorías de primer nivel se renderizan con el mismo HTML que los ítems de `[megamenu-cpt-by-cat]`: `.mega-menu-item` > `.item-icon` (icono del campo `icono` de la taxonomía, inline-izado como SVG) + `.item-content` (nombre enlazado a su archive).
- Las categorías de segundo nivel se listan como `<ul class="tax-child-list">` de enlaces.
- **Categorías vacías** (sin hijos y sin productos directos) se omiten automáticamente.
- **Link directo al producto** cuando una categoría (primer o segundo nivel) tiene exactamente 1 producto: el link apunta al permalink del producto en lugar del archive de la categoría. Mismo comportamiento que `[catalog-category-menu]`.
- Ordenación por meta `orden` (mismo criterio que el resto del catálogo).
- Output final procesado con `wp_svg_inline_filter()` para SVG inline automático.

**Ejemplo de uso:**
```
[megamenu-cat-by-cpt cpt="producto"]
```

### `[hero-slider]`

Slider full-width above-the-fold basado en Splide.js y el CPT `slide`. El contenido de cada slide se edita con el editor de bloques de WordPress. Los slides se ordenan por el campo Pods `orden`.

**Atributos:**

| Atributo | Tipo | Default | Descripción |
|---|---|---|---|
| `delay` | float (s) | `7.5` | Intervalo de autoplay en segundos |
| `draggable` | yes/no | `yes` | Habilitar arrastre (drag) de slides |
| `arrows` | yes/no | `no` | Mostrar flechas nativas de Splide |
| `bullets` | yes/no | `yes` | Mostrar paginación (bullets) |
| `customarrows` | string | `''` | CSS selector del contenedor de flechas custom (primer hijo = prev, último hijo = next) |
| `callback` | string | `''` | Nombre de función JS global a llamar tras cada slide-in (`window[callback](newIndex, splide)`) |
| `limit` | int | `-1` | Máximo de slides a mostrar (-1 = todos) |
| `transition` | slide/fade | `slide` | Transición entre slides. `slide` = desplazamiento lateral con loop infinito; `fade` = crossfade con rewind |
| `fade_speed` | float (s) | `0.8` | Duración del crossfade en segundos. Solo aplica cuando `transition="fade"` |
| `category` | string | `''` | Slug de `slide_category` para filtrar los slides mostrados. Sin valor = todos los slides |
| `pauseonfocus` | yes/no | `no` | Pausar el autoplay al pasar el cursor encima o al recibir foco de teclado |
| `random` | yes/no | `no` | Aleatoriza el orden de los slides en cada carga (ignora el campo `orden`) |
| `loader` | true/false/no/0 | `true` | Muestra u oculta el spinner SVG de carga |

**CPT `slide` — estructura:**

El contenido de cada slide se edita con el editor de bloques de WordPress (Gutenberg). El shortcode renderiza directamente `get_the_content()` de cada post de tipo `slide`.

Campo Pods adicional y taxonomía:

| Campo / Taxonomía | Tipo | Descripción |
|---|---|---|
| `orden` | Número | Orden de aparición (menor = primero) |
| `slide_category` | Taxonomía jerárquica | Categoría interna del slide (sólo visible en admin). Permite filtrar slides por contexto con el atributo `category` del shortcode. |
| `slide_callback` | Texto | Nombre de función JS global (`window[fn]`) a ejecutar cuando este slide queda activo. |

**Admin — Listado de slides:**

El listado de slides en el panel de WordPress incluye:
- Columna **Categoría**: muestra la `slide_category` asignada con enlace a filtro.
- Columna **Orden**: muestra el valor del campo `orden` (ordenable).
- Dropdown de filtro por categoría en la barra de filtros del listado.

**Módulo JS:** `javascript/modules/hero_slider.js`

- Atributo de activación: `data-heroslider`
- Con 1 slide: deshabilita autoplay, loop, arrows y bullets automáticamente.
- Callbacks: evento `ready` para el slide inicial + evento `moved` en cada transición posterior.

#### Pausa por visibilidad (IntersectionObserver)

Cuando el slider tiene más de un slide, el módulo registra un `IntersectionObserver` sobre el contenedor `[data-heroslider]`. En cuanto el slider sale completamente del viewport se pausan:

- **Autoplay de Splide** (`Components.Autoplay.pause()`) — detiene el timer del `interval`.
- **Efecto Ken Burns** — `animation-play-state: paused` sobre `.ken-burns img` dentro del slider, congelando la animación en el frame actual.

Al volver a entrar en el viewport se reanuda todo desde el punto en que quedó (`Components.Autoplay.play()` + eliminar clase `slider-paused`).

La implementación añade/elimina la clase `slider-paused` en `[data-heroslider]`. El CSS correspondiente está en `tailwind/custom/components/layout.css`:

```css
[data-heroslider].slider-paused .ken-burns img {
    animation-play-state: paused;
}
```

#### Loader / spinner

El shortcode emite un `.hero-slider-loader` (hermano del `[data-heroslider]`) con un SVG spinner animado mediante CSS `@keyframes`. El loader es visible desde el primer frame de pintura y desaparece cuando el slider se revela.

> **Por qué CSS animation y no SMIL (`animateTransform`):** Chrome pausa el timeline SVG SMIL hasta que el documento alcanza el estado `complete` (`window.load`). Usando CSS `@keyframes` la animación arranca en el primer frame de pintura, sin depender del estado de carga del documento.

#### Ciclo de vida del reveal (sin tiempos fijos)

El reveal está ligado a la carga real de la imagen del primer slide, no a temporizadores arbitrarios:

1. **HTML parseado** → `[data-heroslider]` a `opacity: 0`, loader visible y girando.
2. **Primera imagen del primer slide carga** (`img.onload` o `img.complete`) → se añade la clase `splide-ready` al contenedor.
3. **CSS transition** `opacity: 0 → 1` (2 s) en el slider; el loader desaparece con su propia transition (0.3 s).
4. **`window.load`** → `splide.refresh()` para corregir dimensiones + `revealSlider()` como fallback idempotente.

**Caso imagen cacheada:** `img.complete && img.naturalWidth > 0` es `true` en el mismo tick de `DOMContentLoaded`. Para que la CSS transition funcione, se usa un doble `requestAnimationFrame` antes de añadir `splide-ready`, garantizando que el browser pinta al menos un frame con `opacity: 0` antes de iniciar la transición.

**CSS del componente** (en `tailwind/custom/components/layout.css`):

```css
.hero-slider-container {
    aspect-ratio: 16 / 7;
    overflow: hidden;
    position: relative;
    background: hsl(0, 0%, 47%);
}

[data-heroslider] {
    opacity: 0;
    transition: opacity 2s ease;
    cursor: default !important;
    &.splide-ready { opacity: 1; }
}

.hero-slider-loader {
    position: absolute;
    inset: 0;
    display: grid;
    place-content: center;
    z-index: 10;
    transition: opacity 0.3s ease;
    pointer-events: none;
    & svg {
        animation: hero-loader-spin 0.75s linear infinite;
        transform-origin: center;
    }
}
[data-heroslider].splide-ready ~ .hero-slider-loader { opacity: 0; }

@keyframes hero-loader-spin { to { transform: rotate(360deg); } }

.hero-slide-image { position: absolute; inset: 0; margin: 0; }
.hero-slide-image img { width: 100%; height: 100%; object-fit: cover; }
.splide__slide { position: relative; overflow: hidden; }
.hero-slide-content { position: relative; z-index: 2; }
```

**Ejemplo:**
```
[hero-slider delay="6000" draggable="yes" bullets="yes" arrows="no"]
[hero-slider transition="fade" delay="4000" bullets="yes"]
[hero-slider delay="4000" customarrows="#mis-flechas" bullets="no" callback="onSlideChanged"]
[hero-slider category="home" delay="7.5" bullets="yes"]
```

### `[image-random]`

Renderiza una imagen aleatoria de una lista en un `<figure><img>`. Diseñado para usarse como hero image: emite automáticamente `<link rel="preload" as="image">` en `<head>` para optimizar el LCP. La aleatorización ocurre en el cliente (JS inline), por lo que el HTML es determinístico y compatible con cualquier sistema de caché (WP Super Cache, Varnish, CloudFlare, etc.).

**Implementación:** `theme/inc/template-functions.php` — `image_random_shortcode()` + `image_random_preload()`.

**Atributos:**

| Atributo | Tipo | Default | Descripción |
|---|---|---|---|
| `src` | string | *(requerido)* | Lista de imágenes separadas por coma. Rutas relativas al directorio de uploads (`wp_upload_dir()['baseurl']`) |
| `random` | yes/no/true/false/1/0 | `yes` | `no`/`0`/`false` → siempre la primera imagen, sin JS, sin datos extra |
| `class` | string | `''` | Clases CSS adicionales para el elemento `<figure>` |
| `width` | int | `''` | Atributo `width` del `<img>` (en px). Evita el CLS al reservar espacio antes de que cargue la imagen |
| `height` | int | `''` | Atributo `height` del `<img>` (en px) |

**Comportamiento según `random`:**

- `random=no` o lista de 1 imagen: PHP renderiza solo la primera; 1 `<link rel="preload" fetchpriority="high">` en `<head>`.
- `random=yes` con ≥ 2 imágenes: PHP emite la primera como `src` inicial (cacheable); un `<script>` inline elige aleatoriamente en el cliente cada visita; se emite un `<link rel="preload">` para cada imagen de la lista.

**Ejemplos:**
```
[image-random src="2024/hero1.webp, 2024/hero2.webp, 2024/hero3.avif" width="1920" height="1080" class="hero-figure"]
[image-random src="2024/hero.webp" random="no" width="1920" height="1080"]
```

---

### `[pd_3d_viewer]`

Embebe el visualizador 3D React (requiere el plugin `pd3d-visualizer`).

| Atributo | Descripción |
|----------|-------------|
| `model` | ID del modelo (requerido) |
| `ui` | Mostrar controles de UI |
| `screenshot` | Botón de captura |
| `bgtext` | Nombre del color en el fondo |
| `leva` | Panel debug Leva |
| `wet` | Toggle vista húmeda/seca |
| `ui-target` | Selector CSS del elemento externo para la UI (React portal) |

---

## Botones Gutenberg — inyección de SVG por clase

Definido en `theme/inc/utilities.php` mediante el filtro `render_block_core/button`.

Cuando un bloque botón tiene una clase CSS de la tabla siguiente, se inyecta automáticamente el SVG correspondiente dentro del `<a>`. El contenido de texto del botón queda envuelto en un `<span>`; los tags void iniciales (`<img>`, `<figure>`, etc.) quedan fuera.

Se pueden combinar múltiples iconos añadiendo múltiples clases.

### Clases de icono disponibles

| Clave | Variantes de clase | SVG inyectado | Clase del SVG |
|-------|--------------------|--------------|---------------|
| `download` | `download` · `download-before` · `download-after` | Flecha de descarga | `ico-download` |
| `pdf` | `pdf` · `pdf-before` · `pdf-after` | Icono PDF | `ico-pdf` |
| `external` | `external` · `external-before` · `external-after` | Enlace externo | `ico-external` |

Para añadir un nuevo icono, añade una entrada al array `$svg_map` en `theme/inc/utilities.php`.

### Posición del icono

El sufijo `-before` / `-after` en la propia clase del icono controla su posición. Sin sufijo, el icono va después del texto (defecto).

| Clase | Comportamiento |
|-------|----------------|
| `download` | SVG después del `<span>` (defecto) |
| `download-after` | SVG después del `<span>` (explícito) |
| `download-before` | SVG antes del `<span>` |

**Ejemplo en el editor:** panel derecho → *Avanzado* → *Clases CSS adicionales*:
```
download-before
```

**HTML resultante:**
```html
<a class="wp-block-button__link wp-element-button">
  <svg class="ico-download" ...></svg>
  <span>Texto del botón</span>
</a>
```

> **Nota técnica:** el filtro solo se dispara si el bloque se renderiza mediante `do_blocks()`. El plugin `pictau-blocks-gutenberg` ejecuta `do_blocks()` antes de `apply_shortcodes()` para que el hook funcione en bloques reutilizables del CPT `pictau_blocks`.

---

## Bloques Gutenberg — Enlace de grupo

Cualquier bloque de **Grupo** puede convertirse en un área clickable completa añadiéndole una URL desde el editor, sin necesidad de clases CSS adicionales.

**Cómo usarlo en el editor:**
1. Insertar o seleccionar un bloque **Grupo**.
2. En la barra de herramientas del bloque aparece un icono de link (cadena).
3. Hacer clic en el icono → se abre un popover igual al del bloque imagen nativo con:
   - Campo URL con autocompletado de páginas y posts del sitio.
   - Cuando hay enlace activo: URL truncada + botones **Editar**, **Eliminar** y **Copiar**.
   - Al editar: sección **Avanzado** con checkbox **Abrir en una nueva pestaña**.
4. Pulsar **Aplicar** para guardar. El icono queda resaltado (estado activo).
5. Para eliminar: abrir el popover → botón **Eliminar el enlace**.

**Resultado en el frontend:**

```html
<!-- Sin "nueva pestaña" -->
<a href="https://ejemplo.com" class="group-link-wrapper">
  <div class="wp-block-group ...">...</div>
</a>

<!-- Con "Abrir en una nueva pestaña" -->
<a href="https://ejemplo.com" target="_blank" rel="noopener noreferrer" class="group-link-wrapper">
  <div class="wp-block-group ...">...</div>
</a>
```

**Atributos del bloque:**
- `groupLink` — URL de destino.
- `groupLinkTarget` — `_blank` si está activo "Abrir en nueva pestaña", vacío en caso contrario.

**Implementación:**
- **JS** (`javascript/block-editor.js`): filtro `blocks.registerBlockType` registra `groupLink` y `groupLinkTarget` en `core/group`; filtro `editor.BlockEdit` añade `ToolbarButton` + `Popover` con `__experimentalLinkControl`.
- **PHP** (`theme/inc/utilities.php`): filtro `render_block_core/group` (priority 20) envuelve el bloque con `<a>` generando automáticamente `target` y `rel` si procede.
- **CSS**: `.group-link-wrapper { display: block; color: inherit; text-decoration: none; }` — evita que Tailwind Typography aplique estilos de enlace al contenido interno.

> **Nota:** no combinar con bloques que tengan la clase `pct-faqs collapsable`. Evitar anidar elementos `<a>` o botones dentro del grupo enlazado.

---

## Bloques Gutenberg — Atributos HTML personalizados

Funcionalidad integrada en el tema que permite añadir cualquier atributo HTML al elemento raíz de cualquier bloque Gutenberg directamente desde el editor, sin plugins de terceros. Reemplaza el plugin `attributes-for-blocks` (skadev).

**Archivos:**
- `theme/inc/block-attributes.php` — registro del atributo, renderizado server-side y sanitización.
- `javascript/modules/block-attributes.js` — panel en el editor (importado desde `block-editor.js`).

### Panel en el editor

Al seleccionar cualquier bloque, el panel **Atributos HTML** aparece en la barra lateral del bloque (*pestaña Bloque*), justo antes de la sección *Avanzado*, visible sin necesidad de expandir nada.

**Añadir un atributo:**
1. Escribir el nombre del atributo en el campo de texto (p. ej. `data-foo`).
2. Pulsar **Añadir** o `Enter`.
3. Aparece la fila del atributo con un campo de valor y un botón × para eliminarlo.

**Atributos especiales:**

| Atributo | Comportamiento en el merge |
|---|---|
| `class` | Se une con espacio a las clases nativas del bloque, sin duplicados |
| `style` | Se une con `;` a los estilos inline existentes, normalizado. Dispone de un editor visual de propiedades CSS (botón de lápiz en la fila) |
| Resto | Reemplaza el valor existente |

**Editor CSS visual para `style`:** al hacer clic en el botón ✏ de la fila `style`, se despliega una sub-tabla de pares `propiedad / valor` que compila y sincroniza el atributo `style` en tiempo real.

### Presets GSAP

La sección **Presets GSAP** (colapsable, cerrada por defecto) ofrece acceso rápido a los `data-attributes` de los módulos de animación del tema. Al hacer clic en un preset, sus atributos se añaden o fusionan con los existentes.

| Preset | Atributos añadidos |
|---|---|
| **Anim Any** | `data-anim_any=""` |
| **Blur In** | `data-blur_chars=""` |
| **Blur Out** | `data-blur_chars="out"` |
| **ScrollTrigger** | `data-anim_scrolltriggered=""` |
| **ScrollTrigger + Pin** | `data-anim_scrolltriggered=""` + `data-anim_scrolltriggered_pin=""` |
| **AnimMask** | `data-animask=""` |
| **AnimMask Config** | `data-animask=""` + `data-animask_points="8"` + `data-animask_intensity="0.12"` + `data-animask_speed="1"` |
| **Split Text** | `data-split_text=""` |
| **Counter** | `class="pct-counter"` |

### Bloques no soportados

El panel no aparece en los siguientes tipos de bloque:
`core/freeform`, `core/html`, `core/shortcode`, `core/legacy-widget`.

### Implementación técnica

| Capa | Mecanismo |
|---|---|
| **Schema JS** | Filtro `blocks.registerBlockType` — registra el atributo `blockAttributes: {type: object}` en todos los bloques soportados |
| **Panel editor** | Filtro `editor.BlockEdit` — HOC que añade `InspectorControls` + `PanelBody` con el UI del panel |
| **Bloques estáticos** | Filtro `blocks.getSaveContent.extraProps` — aplica los atributos al HTML serializado (excepto `style`, gestionado por PHP) |
| **Renderizado PHP** | Hook `render_block` — aplica los atributos al primer tag del HTML del bloque mediante `WP_HTML_Tag_Processor` |
| **Sanitización** | Hook `pre_kses` — limpia los valores de `blockAttributes` para usuarios sin capacidad `unfiltered_html` |
| **Schema PHP** | Hook `register_block_type_args` — registra `blockAttributes` en el lado PHP para coherencia |

### Migración desde el plugin `attributes-for-blocks`

El contenido generado por el plugin `attributes-for-blocks` (skadev) almacena los atributos en la clave `attributesForBlocks` del comentario de bloque. El sistema nativo del tema usa `blockAttributes`. Para migrar posts existentes existe el skill de Claude Code `/wp-migrate-afb`.

**Uso:**

```
/wp-migrate-afb              # migra todos los posts que contengan attributesForBlocks
/wp-migrate-afb 74380        # migra un post concreto por ID
/wp-migrate-afb slide        # migra todos los posts del post type indicado
```

El skill verifica primero que el tema activo tiene `block-attributes.php`. La operación es **idempotente** (ejecutarlo sobre contenido ya migrado no produce cambios). No modifica el HTML inline del bloque — solo renombra la clave en el JSON del comentario de bloque.

---

## Image Mask Animated (`image_mask_animated.js`)

Aplica una máscara blob orgánica animada sobre imágenes, con dos rings de stroke concéntricos y paralelos que se animan de forma continua.

**Archivo:** `javascript/modules/image_mask_animated.js`

### Mecanismo

- El módulo inyecta un SVG programáticamente dentro del contenedor. El SVG contiene un `<clipPath>` que enmascara la imagen y dos `<path>` de ring rendereados fuera del área recortada (`overflow: visible`).
- Al inicializar aplica `user-select: none` y `pointer-events: none` al elemento `<picture>` o `<figure>` que envuelve la imagen.
- El blob se genera paramétricamente cada frame: N puntos en círculo perturbados por ondas seno con fase propia → convertidos a curvas Bézier cúbicas mediante la fórmula Catmull-Rom. La perturbación es exclusivamente inward: `delta = -(intensity × baseR × amplitudes[i]) × (1 + sin(t)) / 2`.
- Los tres paths (clip + ring1 + ring2) comparten los mismos puntos base a radio distinto, garantizando que siempre sean paralelos.
- Animación gestionada con `gsap.ticker`. Un `IntersectionObserver` pausa y reanuda el ticker cuando el elemento entra/sale del viewport. Un `ResizeObserver` recalcula las dimensiones del SVG al cambiar el layout.
- Cada instancia recibe un `timeOffset` aleatorio para que múltiples burbujas en la misma página no queden sincronizadas.

### HTML requerido

```html
<div data-animask>
  <picture>
    <img src="foto.jpg" alt="...">
  </picture>
</div>
```

### Data-attributes

| Atributo | Default | Descripción |
|---|---|---|
| `data-animask` | — | Activa el módulo en el elemento |
| `data-animask_points` | `8` | Número de puntos del blob (3–20) |
| `data-animask_intensity` | `0.12` | Profundidad de contracción inward como fracción del radio base |
| `data-animask_speed` | `1` | Velocidad de la animación (multiplicador en Hz) |
| `data-animask_gap` | `20` | Separación en px entre el borde exterior de ring1 y el interior de ring2 |
| `data-animask_ringcolor` | — | Color para ambos rings a la vez (sobreescribe `ring1color` y `ring2color`) |
| `data-animask_ringopacity` | — | Opacidad para ambos rings a la vez (sobreescribe `ring1opacity` y `ring2opacity`) |
| `data-animask_ring1width` | `12` | Grosor del ring interior en px |
| `data-animask_ring1color` | `#ffffff` | Color del ring interior |
| `data-animask_ring1opacity` | `0.85` | Opacidad del ring interior (0–1) |
| `data-animask_ring2width` | `2` | Grosor del ring exterior en px |
| `data-animask_ring2color` | `#ffffff` | Color del ring exterior |
| `data-animask_ring2opacity` | `0.85` | Opacidad del ring exterior (0–1) |

La instancia queda accesible en `container.imageMask`. Expone `destroy()` para limpiar observers, ticker y clip-path.

---

## Bloques Gutenberg — Efecto parallax (`parallax.js`)

Módulo de parallax vertical vinculado al scroll. El elemento se desplaza proporcionalmente al scroll desde su posición CSS sin ningún salto al inicializar. Basado en Lenis (`window.lenis.on('scroll', ...)`) + GSAP (`gsap.set`).

**Archivo:** `javascript/modules/parallax.js`

### Activación

En el panel **Atributos HTML** del bloque, añadir un único atributo con el valor de profundidad:

```html
<div data-parallax="0.3">...</div>
```

### Parámetro de profundidad (`depth`)

| Valor | Movimiento por px de scroll | Descripción |
|-------|----------------------------|-------------|
| `0` | 0 px | Sin movimiento |
| `0.1` | 0.1 px | Sutil |
| `0.5` | 0.5 px | Moderado (por defecto) |
| `1` | 1 px | Igual de rápido que el scroll |

**Fórmula:** `y = -(scroll - initialScroll) × depth`

El desplazamiento es siempre relativo al scroll en el momento de carga de la página (`initialScroll`), por lo que `y = 0` al inicializar. Acepta valores decimales.

### Notas de implementación

- Sin ScrollTrigger — el desplazamiento se aplica en cada evento `scroll` de Lenis vía `gsap.set`.
- Fallback a `window.addEventListener('scroll', ...)` si Lenis no está disponible.
- La instancia queda accesible en `element.parallax`. Expone `destroy()` para limpiar el listener y el transform.

---

## Bloques Gutenberg — Navegación por puntos (`navigation_dot.js`)

Genera una barra de navegación lateral con puntos, uno por cada sección contenida en el bloque marcado. Al hacer scroll, el punto correspondiente a la sección visible se marca como activo. Pensado para páginas one-page con secciones verticales.

**Archivo:** `javascript/modules/navigation_dot.js`

### Activación

Atributo `data-dotnav` en el **contenedor** que envuelve las secciones:

```html
<div data-dotnav="article" data-position="left">...</div>
```

| Atributo | Valor por defecto | Descripción |
|---|---|---|
| `data-dotnav` | `section` | Selector CSS de los hijos que se convierten en ítems de nav. Vacío → usa `section`. |
| `data-position` | `right` | Posición de la barra: `right` o `left`. |

### Secciones hijas

Cada sección que deba aparecer en la barra necesita:

- Atributo `id` — se usa como destino del enlace (`href="#id"`).
- Atributo `data-label` — texto de la etiqueta flotante al hacer hover. Si está vacío o ausente, la sección se omite del nav.

### Lógica de activación

Usa ScrollTrigger con `start: 'top+=10% 50%'` / `end: 'bottom 50%'`. El punto se activa cuando el top de la sección cruza el centro del viewport. Solo un punto está activo a la vez.

---

## Animaciones con `data-anim_any`

Módulo de animaciones de entrada basado en GSAP + ScrollTrigger. Se incluye siempre en `script.js` — cualquier elemento del DOM con el atributo `data-anim_any` se anima automáticamente al entrar en el viewport.

**Archivo:** `javascript/modules/animation_any.js`

### Activación

```html
<h2 data-anim_any>Título animado</h2>
```

En el editor Gutenberg: panel **Atributos HTML** → preset **Anim Any**.

### Data-attributes

| Atributo | Default | Descripción |
|---|---|---|
| `data-anim_any` | — | Activa el módulo. Sin valor = configuración por defecto |
| `data-anim_any_animation` | `slideFromBottom` | Tipo de animación. Ver tabla de tipos |
| `data-anim_any_whattoanim` | `self` | Qué animar: `self` = el elemento completo; `chars`, `words` o `lines` = SplitType sobre el texto |
| `data-anim_any_duration` | `1.5` | Duración de la animación en segundos |
| `data-anim_any_delay` | `0.33` | Retardo inicial antes de empezar (s) |
| `data-anim_any_stagger` | `0.1` | Desfase entre chars/words/lines cuando `whattoanim` ≠ `self` (s) |
| `data-anim_any_slideamount` | `100` | Distancia de desplazamiento en px para las animaciones de tipo `slide*` |
| `data-anim_any_repeat` | `true` | Si `true`, la animación se revierte al hacer scroll hacia arriba. `false` o `0` para desactivar |
| `data-anim_any_autoplay` | `true` | Si `true`, la animación arranca con ScrollTrigger al entrar en el viewport |
| `data-anim_any_triggerstart` | — | Posición personalizada del ScrollTrigger (p.ej. `"center bottom"`) |
| `data-anim_any_nextanim` | — | Encadena otro elemento al terminar esta animación |
| `data-anim_any_callback` | — | Función JS global a ejecutar al completar la animación |
| `data-anim_any_matchmedia` | — | Media query CSS (sin `@media`). P.ej. `"min-width: 1024px"` solo anima en desktop |
| `data-anim_any_markers` | `false` | `true` activa los marcadores de debug de ScrollTrigger |
| `data-anim_any_log` | `false` | `true` activa logging en consola |

### Tipos de animación

| Valor | Descripción |
|---|---|
| `slideFromBottom` | Desliza desde abajo (por defecto) |
| `slideFromTop` | Desliza desde arriba |
| `slideFromLeft` | Desliza desde la izquierda |
| `slideFromRight` | Desliza desde la derecha |
| `clippedFromBottom` | Clip-path + deslizamiento desde abajo |
| `clippedFromLeft` | Clip-path + deslizamiento desde la izquierda, con soporte para `.left-border` |
| `clippedFromTop` | Clip-path + deslizamiento desde arriba, con soporte para `.top-border` |
| `blurIn` | Desenfoque + escala aleatorio por char/word, fade-in |

### Encadenamiento (`nextanim`)

```
data-anim_any_nextanim="<selector>[, <tiempo>]"
```

| Ejemplo | Comportamiento |
|---|---|
| `".mi-subtitulo"` | Arranca 1.5 s **antes** de que termine la primera (por defecto) |
| `".mi-subtitulo, -0.3"` | Arranca 0.3 s antes de que termine la primera |
| `".mi-subtitulo, 0"` | Arranca exactamente cuando termina la primera |
| `".mi-subtitulo, 0.8"` | Arranca 0.8 s **después** de que termine la primera |

**Encadenamiento infinito A → B → C → N:** cada elemento puede tener su propio `nextanim`, creando cadenas de cualquier longitud.

```html
<h2 data-anim_any data-anim_any_nextanim=".subtitulo, -0.5">
  Título principal
</h2>
<p class="subtitulo"
   data-anim_any
   data-anim_any_animation="slideFromLeft"
   data-anim_any_nextanim=".cta-btn">
  Subtítulo descriptivo
</p>
<a class="cta-btn" data-anim_any data-anim_any_animation="slideFromBottom">
  Acción
</a>
```

### Callback

```
data-anim_any_callback="<nombre_función>[, <delay_ms>]"
```

Llama a `window[nombre_función]()` al terminar la animación. El delay opcional es en **milisegundos**.

---

## Admin — listado de productos

El listado de WP Admin para el CPT `producto` incluye:

- **Columna de imagen destacada** (primera columna, 60×60 px).
- **Filtro por categoría** — dropdown jerárquico de `product_category` sobre la tabla.
- **Columna Categoría** — muestra las categorías asignadas como enlaces que activan el filtro al hacer clic.

---

## CSS

Fuente en `tailwind/` → `theme/style.css`.

- Dark mode: estrategia `class`
- Los colores de marca se definen por proyecto en `tailwind/custom/components/all-themes.css` via variables CSS (`--brand-color-rgb`, etc.)

---

## JavaScript

Entry: `javascript/script.js` → `theme/js/script.min.js`

| Módulo | Descripción |
|--------|-------------|
| `catalogMenu.js` | Toggle expand/collapse del menú lateral |
| `desktopMenuNav.js` | Submenús/megamenús desktop |
| `mobileMenuNav.js` | Menú móvil |
| `darkMode.js` | Toggle dark/light |
| `faqs.js` | Acordeón de FAQs |
| `hero_slider.js` | Slider full-width above-the-fold (Splide). Atributo: `data-heroslider`. |
| `imgcompare.js` | Comparador antes/después con slider. Atributo: `data-imgcompare`. |
| `testimonials-splide.js` | Slider de testimonios (Splide). Atributo: `data-testimonials`. |
| `animation_any.js` | Animaciones de entrada con GSAP + ScrollTrigger. Atributo: `data-anim_any`. |
| `parallax.js` | Efecto parallax vertical. Atributo: `data-parallax="<depth>"`. |
| `navigation_dot.js` | Navegación lateral por puntos para páginas one-page. Atributo: `data-dotnav`. |

Librerías: GSAP + ScrollTrigger, Splide, OverlayScrollbars, Split Type, CountUp.js

---

## Pods playbook

Operaciones Pods documentadas en `.claude/pods-playbook.json`, ejecutadas vía `wp-local` (wrapper WP-CLI para Local by Flywheel):

```bash
wp-local eval 'pods_api()->save_field([...])'
```

---

## Customizer — Configuración global del tema

Panel **Apariencia → Personalizar → THEME CUSTOMIZER**.

### Site Information (`priority: 10`)

| Setting key | Control | Descripción |
|---|---|---|
| `pictau_site_name` | Text | Nombre del cliente. Usado como `wp_mail_from_name` si está relleno. |
| `pictau_contact_email` | Email | Email de contacto global. Usado como `wp_mail_from` si está relleno. |

Los filtros `wp_mail_from` y `wp_mail_from_name` **solo se registran** si el valor está guardado (no vacío). Si el campo está vacío, WordPress usa su comportamiento por defecto.

El plugin **Maintenance Mode by PICTAU** consume `pictau_contact_email` directamente.

---

## Notas

- PHP: siempre `<?php echo` (nunca `<?=`)
- Comentarios deshabilitados globalmente
- Búsqueda vacía redirige a home
- GTM configurable desde el Customizer
- SVG inline via `[inline_svg]`
