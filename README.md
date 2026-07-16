# Tema PICTAU para WordPress 7.x

Tema WordPress personalizado (marca blanca). Diseñado para proyectos a medida con soporte para catálogos de productos, CPTs via Pods, animaciones GSAP y un sistema de bloques Gutenberg extendido.

- **Versión:** 7.3.0
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
- [Polylang](https://es.wordpress.org/plugins/polylang/)
- [CPT i18n slugs – Slugs traducibles para CPT (Polylang + Pods)](https://github.com/xenolito/WordPress-Plugin-Polylang-Addon-CPT-i18n-slugs)
- [GDPR Cookie Compliance](https://es.wordpress.org/plugins/gdpr-cookie-compliance/)
- [Loco Translate](https://es.wordpress.org/plugins/loco-translate/)
- [Maintenance Mode by Pictau](https://github.com/xenolito/WordPress-Plugin-Maintenance-Mode-by-Pictau)
- [PCT Gallery](https://github.com/xenolito/WordPress-Plugin-Image-Gallery)
- ~~[Pictau Blocks Gutenberg](https://github.com/xenolito/wordpress-pictau-blocks-plugin)~~ — **integrado en el tema desde v7.0.0**, desinstalar si estaba activo
- [Pods](https://es.wordpress.org/plugins/pods/)
- [WP Hide Login](https://es.wordpress.org/plugins/wps-hide-login/)
- [WP Mail SMTP](https://es.wordpress.org/plugins/wp-mail-smtp/)
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

## Despliegue a producción — subtree publish a repo separado

Este proyecto usa dos repos de GitHub:

- **Repo de desarrollo** (`origin`) — el monorepo completo: `theme/` (PHP + assets compilados), `javascript/` y `tailwind/` (fuentes), tooling, etc. Es donde se trabaja y se hace `npm run production`.
- **Repo de despliegue** (`deploy-origin`, p. ej. `web-balanzia.git`) — contiene **solo** el contenido de `theme/`, aplanado a la raíz (sin `javascript/`, `tailwind/`, `node_modules/`...). Es lo que se clona/actualiza en el servidor de producción, en `wp-content/themes/<slug>/`.

La sincronización entre ambos es automática: un hook de git local publica un snapshot de `theme/` en el repo de despliegue en cada commit a `main`.

### Cómo replicarlo en un proyecto nuevo

1. Crea el repo de despliegue vacío en GitHub (p. ej. `web-<proyecto>.git`) y añádelo como remote:
   ```bash
   git remote add deploy-origin git@github.com:usuario/web-<proyecto>.git
   ```

2. Crea `.git/hooks/post-commit` (no se versiona — hay que crearlo a mano en cada máquina/checkout) con este contenido, ajustando `--prefix` al nombre de la carpeta del tema si no se llama `theme`:

   ```sh
   #!/bin/sh
   # Tras cada commit en main, publica un snapshot de theme/ en la rama deploy
   # y la sube a su propio remote (deploy-origin).
   #
   # No usamos "git subtree split": recorre TODO el historial de main en cada
   # ejecucion (coste creciente con cada commit, sin cache real entre llamadas).
   # Como deploy solo necesita el estado actual de theme/ (no su historial
   # replicado), usamos "git commit-tree" para crear el commit directamente a
   # partir del arbol de theme/ en HEAD: coste O(1), no depende del numero de
   # commits en main.
   branch=$(git symbolic-ref --short HEAD)
   if [ "$branch" = "main" ]; then
     tree=$(git rev-parse HEAD:theme)
     parent=$(git rev-parse deploy 2>/dev/null)
     msg=$(git log -1 --pretty=%s)

     if [ -n "$parent" ]; then
       new_commit=$(git commit-tree "$tree" -p "$parent" -m "$msg")
     else
       new_commit=$(git commit-tree "$tree" -m "$msg")
     fi

     git branch -f deploy "$new_commit" >/dev/null
     git push deploy-origin deploy:main
   fi
   ```

3. Dale permisos de ejecución:
   ```bash
   chmod +x .git/hooks/post-commit
   ```

4. En el servidor de producción, clona el repo de despliegue **directamente** en `wp-content/themes/<slug>/` (estructura plana — `style.css` y `functions.php` deben quedar directamente ahí, no anidados en una subcarpeta `theme/`).

### Por qué `git commit-tree` y no `git subtree split`

`git subtree split --prefix=theme` recorre **todo** el historial de `main` en cada ejecución (sin cache real entre llamadas), así que el coste crece con cada commit nuevo del proyecto. Como el repo de despliegue no necesita el historial replicado — solo el estado actual de `theme/` para publicarlo/sincronizarlo con el servidor — `git commit-tree` logra el mismo resultado (mismo árbol de archivos, mismo mensaje de commit) en tiempo constante, tomando directamente el árbol de `theme/` en el `HEAD` actual (`git rev-parse HEAD:theme`) y encadenándolo al último commit de `deploy`.

### Al restaurar backups (UpdraftPlus u otro) en producción

**No restaurar nunca el componente "Themes"** de un backup sobre un servidor que use este pipeline. El código del tema debe sincronizarse *solo* vía este mecanismo de git — un restore de "Themes" desde un backup hecho en local recrearía la estructura de desarrollo (con `theme/` anidado) encima de la estructura plana esperada en producción, duplicando archivos y rompiendo la ruta que WordPress tiene activada (`template`/`stylesheet`). Usa UpdraftPlus solo para base de datos y `uploads`.

---

## Estructura

```
pictau/
├── theme/
│   ├── inc/
│   │   ├── template-functions.php       # Shortcodes y hooks
│   │   ├── template-tags.php
│   │   ├── utilities.php
│   │   ├── events.php
│   │   ├── block-attributes.php         # Atributos HTML en bloques Gutenberg
│   │   ├── clone-post.php               # Clonación nativa de posts
│   │   └── pictau-blocks-gutenberg.php  # CPT, widget y shortcode Pictau Blocks
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
| `pauseonfocus` | yes/no | `no` | Pausar el autoplay al pasar el cursor encima o al recibir foco de teclado. `yes` = pausa al hacer hover o al recibir foco |
| `random` | yes/no | `no` | Aleatoriza el orden de los slides en cada carga (ignora el campo `orden`). En lugar del preload del primer slide, emite un `<link rel="preload">` para la imagen de **todos** los slides (hasta `limit`), sin `fetchpriority`, para que el navegador los descargue en paralelo desde `<head>` y cualquier slide que aparezca primero ya esté en caché |
| `loader` | true/false/no/0 | `true` | Muestra u oculta el spinner SVG de carga. Por defecto visible. Para ocultarlo: `loader="false"`, `loader="no"` o `loader="0"` |

**CPT `slide` — estructura:**

El contenido de cada slide se edita con el editor de bloques de WordPress (Gutenberg). El shortcode renderiza directamente `get_the_content()` de cada post de tipo `slide`.

Campo Pods adicional y taxonomía:

| Campo / Taxonomía | Tipo | Descripción |
|---|---|---|
| `orden` | Número | Orden de aparición (menor = primero). El slide con menor `orden` es el primero. |
| `caducidad` | Datetime | Fecha y hora de expiración automática del slide. Ver sección _Caducidad_ más abajo. |
| `slide_category` | Taxonomía jerárquica | Categoría interna del slide (sólo visible en admin). Permite filtrar slides por contexto con el atributo `category` del shortcode. |
| `slide_callback` | Texto | Nombre de función JS global (`window[fn]`) a ejecutar cuando este slide queda activo. Firma: `fn(newIndex, splideInstance)`. Dispara en el montaje inicial (evento `ready`) y en cada transición posterior (evento `moved`). Se ejecuta después del `callback` global si ambos están definidos. |

**Admin — Listado de slides:**

El listado de slides en el panel de WordPress incluye:
- Columna **Categoría**: muestra la `slide_category` asignada con enlace a filtro.
- Columna **Orden**: muestra el valor del campo `orden` (ordenable).
- Columna **Caducidad**: muestra la fecha/hora de expiración con indicadores visuales (⚠ rojo = ya expirado, ⏰ naranja = caduca en < 7 días).
- Dropdown de filtro por categoría en la barra de filtros del listado.

#### Caducidad — expiración automática de slides

Cada slide puede tener una fecha+hora de caducidad en el campo Pods `caducidad` (formato `Y-m-d H:i:s`). El sistema es **triple capa** para garantizar que un slide no aparezca incluso con caché activa (WP Super Cache, WP Rocket, etc.):

**Capa 1 — Filtro PHP (server-side):** el shortcode usa un `meta_query` que excluye slides cuya `caducidad` haya pasado. Garantiza que en cada carga fresca el slide ya no se renderiza. El filtro también incluye `0000-00-00 00:00:00` como valor equivalente a "sin caducidad" (Pods guarda ese valor cuando el usuario borra el campo datetime y guarda). Un hook `save_post_slide` (priority 100) normaliza ese valor a `''` en el momento del guardado para que la base de datos quede limpia.

**Capa 2 — Filtro JS (client-side):** el módulo `hero_slider.js` elimina del DOM, antes de montar Splide, cualquier `.splide__slide[data-slide-expiry]` cuya fecha haya pasado. Esto cubre páginas servidas desde caché con HTML obsoleto.

**Capa 3 — WP Cron (proactivo):** al guardar un slide publicado con `caducidad`, se programa un `wp_schedule_single_event()` en ese timestamp. Cuando el cron dispara:
1. El slide pasa a estado `draft` (despublicado).
2. Se limpia la caché del plugin de caché activo (WP Super Cache → `wp_cache_clear_cache()`, WP Rocket → `rocket_clean_domain()`, W3 Total Cache → `w3tc_flush_all`, Cache Enabler → `cache_enabler_clear_complete_cache`).

Si el slide se despublica o elimina antes de su caducidad, el cron programado se cancela automáticamente.

**Ordenación cuando hay slides con caducidad:**

Cuando cualquier slide activo tiene `caducidad` fijada, el atributo `random` queda sin efecto y el orden sigue esta prioridad:
1. Slides **con** caducidad: por fecha de caducidad ASC (el más próximo a expirar, primero).
2. Slides **sin** caducidad: por campo `orden` ASC.

Si ningún slide activo tiene caducidad: se respeta `random="yes"` o el orden por `orden`.

**Módulo JS:** `javascript/modules/hero_slider.js`

- Atributo de activación: `data-heroslider`
- Callbacks: evento `ready` para el slide inicial + evento `moved` en cada transición posterior.

#### Modo single-slide (1 slide disponible)

Cuando solo hay un slide activo, el módulo JS **omite Splide por completo**: no se instancia el carrusel ni se añaden arrows, bullets ni drag. El HTML wrapper se mantiene intacto para que el CSS siga funcionando, y se añade la clase `hero-slider-single` al `.hero-slider-container`. El reveal sigue ligado a la carga de la primera imagen, igual que en el modo multi-slide.

CSS requerido para que el contenedor ocupe el 100% sin `.splide__track` (en `tailwind/custom/components/layout.css`):

```css
.hero-slider-single [data-heroslider] > div { width: 100%; height: 100%; }
.hero-slider-single .splide__slide        { width: 100%; height: 100%; }
```

#### Estado vacío — sin slides disponibles

Cuando ningún slide pasa los filtros de la query (todos en draft, todos expirados, ninguno en la categoría indicada), el shortcode devuelve contenido distinto según el usuario:

| Situación | Output del shortcode |
|---|---|
| Usuario **no logueado** (o sin `edit_posts`) | `<div class="hero-slider-fallback"><h1>Descripción corta del sitio</h1></div>` — texto tomado de `get_bloginfo('description')` (campo **Descripción corta** en Ajustes → General). Si ese campo está vacío, no se renderiza nada. |
| Usuario **editor / admin** (`edit_posts`) | Bloque rojo `.hero-slider-empty-warning` con el shortcode que falla como referencia y un enlace directo al listado de slides del CPT en el admin. |

#### Aviso en el panel de administración

Un hook `admin_notices` revisa en cada carga del admin si existe alguna página publicada que use `[hero-slider]` sin slides disponibles (publicados, no expirados). Si detecta el caso, muestra un aviso de error (`.notice.notice-error`) agrupado **por página** (una única línea aunque la página contenga varios `[hero-slider]` con distintos atributos, p.ej. uno sin filtro y otro con `category="..."`) con:

- El título de la página afectada.
- El o los shortcodes exactos que no tienen slides, cada uno con su propio enlace al listado de slides filtrado por su categoría.
- Un enlace a editar la página.

La comprobación usa `post_status => 'publish'` explícito para evitar falsos negativos en contexto admin, donde `WP_Query` sin `post_status` incluye los borradores del usuario logueado.

**Refresco tras Quick Edit / Edición en lote (sin recargar la página):** el listado de slides (`edit.php?post_type=slide`) cambia el estado de un slide vía AJAX (`action=inline-save` / `inline-save-bulk`), sin recarga de página, lo que dejaría el aviso ya pintado desactualizado. Para evitarlo:

- `pictau_hero_slider_notice_html()` contiene la lógica de cálculo del aviso (extraída de `hero_slider_admin_notice_empty()`, que ahora solo la envuelve en `<div id="hero-slider-empty-notice">`).
- Un endpoint AJAX propio (`wp_ajax_hero_slider_refresh_notice`) devuelve el HTML recalculado.
- En la pantalla `edit-slide` se engancha un listener a `ajaxComplete` (vía `wp_add_inline_script` sobre el handle `inline-edit-post`) que, tras cada guardado por Quick Edit o Edición en lote, pide el HTML actualizado y sustituye el contenido de `#hero-slider-empty-notice` en el DOM.

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
/* Reservar espacio — prevenir CLS */
.hero-slider-container {
    aspect-ratio: 16 / 7;
    overflow: hidden;
    position: relative;
    background: hsl(0, 0%, 47%); /* placeholder mientras carga */
}

/* Ocultar hasta reveal; JS añade .splide-ready */
[data-heroslider] {
    opacity: 0;
    transition: opacity 2s ease;
    cursor: default !important;
    &.splide-ready { opacity: 1; }
}

/* Loader: visible mientras [data-heroslider] no tenga .splide-ready */
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

/* Imagen full-bleed */
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

#### Preload de la imagen de fondo (LCP)

`hero_slider_preload()` (`theme/inc/template-functions.php`, hook `wp_head` prioridad 2) emite un `<link rel="preload" as="image">` para la imagen de fondo del slide que se mostrará primero, optimizando el LCP.

**Solo cuenta la imagen de fondo real del slide**, identificada por la convención `is-bg` (la misma clase que usa `pictau_post_thumbnail('is-bg only-img')`): el preload busca específicamente un `<img>` dentro de un `<figure class="...is-bg...">`. Si el slide no tiene ninguna imagen `is-bg` (por ejemplo, uno que usa `[video-bg]` como fondo), no se emite ningún preload para ese slide — el LCP allí lo cubre el vídeo, no una imagen. Antes de este filtro, la regex cogía ciegamente el primer `<img>` del contenido del slide, lo que en un slide con `[video-bg]` acababa precargando por error cualquier otra imagen presente (p.ej. un icono decorativo oculto), generando un aviso de "preloaded but not used" en devtools sin optimizar nada realmente.

**`imagesrcset` / `imagesizes` en el preload:** además del `src` base, el `<link rel="preload">` incluye `imagesrcset` e `imagesizes` calculados con las mismas funciones de WordPress core que generan el `srcset`/`sizes` del `<img>` real (`wp_calculate_image_srcset()` / `wp_calculate_image_sizes()`, a partir del `wp-image-{ID}` y las dimensiones del archivo en el `src`). Sin esto, el navegador podía preload-ear el candidato base (p.ej. la variante de 1024px) pero, en una pantalla de alta densidad (Retina), renderizar un candidato distinto del `srcset` del `<img>` (p.ej. 2048px) — dos peticiones de red diferentes, y la primera marcada como "no usada". Con `imagesrcset`/`imagesizes` idénticos en ambos, el algoritmo de selección de candidato del navegador es el mismo en el preload y en el render, así que siempre coinciden en la misma variante.

> Nota: `imagesrcset`/`imagesizes` en un `<link rel="preload">` funcionan igual que `srcset`/`sizes` en un `<img>` — el navegador descarga **una única** variante (la que mejor encaja según `imagesizes` + la densidad de píxeles de la pantalla), nunca todas las listadas.

### `[video-bg]`

Vídeo de fondo a pantalla completa (`<video class="video-bg" autoplay muted loop playsinline>`), pensado como fondo de una sección hero — usado tanto suelto en una sección estática como dentro de un slide de `[hero-slider]`.

**Implementación:** `theme/inc/template-functions.php` — `video_as_background()`.

**Atributos:**

| Atributo | Tipo | Default | Descripción |
|---|---|---|---|
| `src` | string | *(requerido)* | Ruta relativa (sin extensión) dentro de `wp_upload_dir()`. Se resuelve a `{src}.mp4` / `{src}.webp` (poster) y, si se indica, `{src}.webm`. Admite una lista separada por comas: se elige uno al azar en cada carga (`array_rand`). |
| `mobile` | string | `''` | Sufijo añadido a `src` para servir una variante distinta en móvil (`<source media="(min-width: 769px)">` para la versión desktop). |
| `poster` | string | `''` | Se usa junto con `src` para el atributo `poster` del `<video>` (`{src}.webp`). |
| `overlayopacity` | float | `false` | Si se indica, añade `data-overlayopacity` al wrapper, que activa un overlay oscuro semitransparente (`::after`, ver `layout.css`) para mejorar el contraste del texto superpuesto. |
| `noautoplay` | bool | `false` | Si está presente, el `<video>` no lleva el atributo `autoplay` nativo — queda a la espera de que `revealSlideCover()` (ver más abajo) llame a `.play()` manualmente. |
| `webm` | bool | `false` | Añade también fuentes `.webm` (desktop y, si hay `mobile`, su variante). |
| `align` | string | `center` | `object-position` del vídeo. |

**Ejemplo:**
```
[video-bg overlayopacity="5.01" src="balanzia_hero" mobile="_mobile" poster="balanzia_hero"]
```

#### Reveal del `.slider-cover` y animación del header (`data-anim_any`)

Patrón habitual de hero con vídeo de fondo (usado en la home dentro de `[hero-slider]` y en páginas sueltas como `/balanzia-financial-reporting/`):

```
<section class="slider anim-intro has-video-bg">
  [video-bg src="..."]
  <div class="slider-cover">…</div>       <!-- overlay negro a pantalla completa -->
  <div class="content">
    <h1 data-anim_any data-anim_any_autoplay="0" ...>…</h1>   <!-- ver animation_any.js -->
  </div>
</section>
```

- `.slider-cover` es un overlay negro (`position: absolute; inset: 0`) que oculta el contenido hasta que el vídeo está listo. Sus reglas de posicionamiento viven en `tailwind/custom/components/layout.css`, bajo el selector `.slider:not(:has(.hero-slider-fallback))` — **no dependen de ninguna clase relacionada con vídeo**, así que se aplican igual a un slide sin `[video-bg]`.
- El `<h1>` (y su cadena `data-anim_any_nextanim` hacia el resto de elementos) normalmente lleva `data-anim_any_autoplay="0"`: `animation_any.js` no le crea un `ScrollTrigger` propio, así que se queda pausado hasta que algo externo llama a `.play()` sobre `header.headerAnimation`.

**Módulo JS:** `javascript/script.js` — `activateHeroSlide(el)`:
1. Reproduce la animación del primer `<h1 data-anim_any>` encontrado dentro de `el` (`el.querySelector('h1[data-anim_any]')?.headerAnimation?.play()`).
2. Llama a `revealSlideCover(el)`, que:
   - Si `el` no tiene `.video-bg`, hace fade de `.slider-cover` a `opacity: 0` inmediatamente.
   - Si tiene vídeo, lo reproduce (si no tenía `autoplay` nativo) y espera a que esté listo (`video.readyState >= 3` o evento `loadeddata`/`error`) antes de hacer el fade.
   - Marca `.slider-cover` con `dataset.covered = 'done'` para no repetir el fade si `el` se reactiva más tarde.

`activateHeroSlide()` se invoca desde dos sitios, cubriendo los dos casos posibles:

| Caso | Disparador | Dónde |
|---|---|---|
| Slide dentro de `[hero-slider]` (Splide) | `window.sliderInit(index, splide)` — callback del shortcode (`callback="sliderInit"`), disparado en el montaje inicial (`ready`) y en cada transición (`moved`). Identifica el slide activo por índice de Splide, no por orden en el DOM. | `javascript/script.js` |
| Sección estática sin `[hero-slider]` (sin Splide) | `window.addEventListener('load', ...)`, una única vez por página. Recorre todo `.slider.anim-intro` que **no** contenga `[data-heroslider]` como descendiente (para no reprocesar los que ya gestiona `sliderInit`). | `javascript/script.js` |

**Ejemplo de uso sin `[hero-slider]`** (`/balanzia-financial-reporting/`): un Group block con clase `slider anim-intro has-video-bg` conteniendo `[video-bg]` + `.slider-cover` + el `<h1 data-anim_any>` directamente, sin CPT `slide` ni Splide de por medio.

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

### `[svg]`

Renderiza un archivo SVG inline directamente desde la carpeta del tema, con sanitización automática.

**Atributos:**

| Atributo | Tipo | Default | Descripción |
|---|---|---|---|
| `filename` | string | *(requerido)* | Nombre del archivo SVG (sin extensión) dentro de la carpeta de SVGs del tema |
| `class` | string | `''` | Clases CSS adicionales |
| `width` | string | `''` | Atributo `width` del SVG |
| `height` | string | `''` | Atributo `height` del SVG |
| `figure` | bool | `false` | Si `true`, envuelve el SVG en un `<figure>` con las clases indicadas en `class` |

**Ejemplo:**
```
[svg filename="logo-marca" class="w-32 h-auto"]
[svg filename="icono-flecha" figure="true" class="my-icon"]
```

### `[svg-inline]`

Convierte cualquier etiqueta `<img src="*.svg">` encontrada dentro del bloque de contenido en SVG inline. Útil para hacer SVGs externos editables con CSS. Depende de la función `wp_svg_inline_filter()`.

**Ejemplo:**
```
[svg-inline]
  <img src="/wp-content/uploads/2024/logo.svg" class="brand-logo">
[/svg-inline]
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
| `zoomIn` | Zoom-in sobre el elemento completo. Param: `zoomIn,<escala>` (default 1.2) |
| `rotateX` | Rotación sobre el eje X. Params: `rotateX,<grados>[,bottom]` (default 90°) |
| `zoomBounce` | Zoom-in con rebote elástico suave por char/word (por defecto `words`). Param: `zoomBounce,<escala inicial>` (default 0.35) |
| `reveal` | Fade-in de solo opacidad (sin transform) por char/word/line, según `whattoanim` |
| `cyclecontent` | Cicla los hijos directos del target uno a uno, en bucle infinito. Ver sección dedicada más abajo |

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

### Rotador de contenido (`cyclecontent`)

Cicla los **hijos directos** del target (p.ej. varios `<h2>` dentro de un `<div data-anim_any>`) uno a uno, en bucle infinito, todos apilados en la misma posición mediante CSS Grid (`display:grid` + todos los hijos en `grid-row:1/grid-column:1`). El contenedor se dimensiona automáticamente a la altura del hijo más alto — como ninguno usa `display:none` (solo cambian opacidad/transform), no hay layout shift al pasar de un hijo más bajo a uno más alto.

```html
<div data-anim_any
     data-anim_any_animation="cyclecontent"
     data-anim_any_cyclecontentanim="reveal"
     data-anim_any_duration="0.5"
     data-anim_any_stagger="1.5"
     data-anim_any_repeat="false">
  <h2>Texto 1</h2>
  <h2>Texto 2</h2>
  <h2>Texto 3</h2>
</div>
```

| Atributo | Default | Descripción |
|---|---|---|
| `data-anim_any_cyclecontentanim` | `reveal` | Nombre de **otra** animación de `anim_any` a reutilizar como transición de entrada/salida de cada hijo (aplicada al elemento completo, sin split de chars/words/lines) |
| `data-anim_any_duration` | `1.5` | Duración de la transición de entrada y de salida de cada hijo |
| `data-anim_any_stagger` | `0.1` | Aquí no hay elementos en paralelo: se reutiliza como **tiempo que cada hijo permanece visible** antes de empezar a desaparecer |
| `data-anim_any_delay` | `0.33` | Retardo antes de la entrada del primer hijo |

**Animaciones soportadas para `cyclecontentanim`:** `reveal`, `slideFromBottom`, `slideFromTop`, `slideFromLeft`, `slideFromRight`, `zoomIn`, `zoomBounce`, `rotateX`, `clippedFromBottom`. Un nombre no soportado (p.ej. `clippedFromLeft`, `blurIn`) cae a `reveal` con un aviso en consola.

**Notas:**
- La transición es siempre secuencial (el hijo visible desaparece del todo antes de que el siguiente empiece a aparecer), sin solape.
- Se recomienda `data-anim_any_repeat="false"`: el comportamiento de reversa al hacer scroll hacia atrás (`data-anim_any_repeat`) no está pensado para timelines en bucle infinito.
- No combinar con `data-anim_any_nextanim`: al repetirse el timeline entero, el elemento encadenado se relanzaría en cada vuelta del bucle, no solo una vez.
- Cada hijo conserva su propia alineación/estilo tal cual (texto a la izquierda, centrado, un `<div>` con cualquier contenido...) — `cyclecontent` no toca su tamaño ni posición. Para los presets con transform (`zoomIn`, `zoomBounce`, `rotateX`), el `transform-origin` se calcula automáticamente midiendo dónde cae el contenido ya renderizado de cada hijo, así que el zoom/rotación siempre pivota sobre lo que se ve — no sobre el centro de la caja completa — sea cual sea su alineación o ancho.
- Ese cálculo se repite justo antes de cada entrada/salida (no solo una vez al cargar), así que si la ventana cambia de ancho entre medias (p.ej. un texto largo pasa a ocupar más líneas en móvil), el `transform-origin` se autocorrige solo en el siguiente turno del ciclo — no hace falta escuchar `resize` ni usar `matchMedia`.
- `data-anim_any_whattoanim` no aplica a esta animación (no usa SplitType).

---

## Admin — listado de productos

El listado de WP Admin para el CPT `producto` incluye:

- **Columna de imagen destacada** (primera columna, 60×60 px).
- **Filtro por categoría** — dropdown jerárquico de `product_category` sobre la tabla.
- **Columna Categoría** — muestra las categorías asignadas como enlaces que activan el filtro al hacer clic.

---

## Blog — Entradas destacadas

Las entradas (`post`) tienen un campo booleano nativo `featured` (sin depender de Pods),
gestionado desde un metabox en el editor:

- **Metabox "Entrada destacada"** — checkbox "Marcar como destacada" en la barra lateral
  del editor de entradas. Guarda `update_post_meta($post_id, 'featured', '1'|'0')`
  (`theme/inc/utilities.php`, funciones `featured_post_metabox()` / `guardar_featured_post()`).
- **Listado de WP Admin** — las entradas marcadas muestran un tag amarillo "Destacada"
  junto al título (filtro `display_post_states`, `theme/inc/utilities.php`).
- **Home del blog** (`theme/home.php`) — estructura de tres bloques:
  1. **Destacada principal**: la entrada fijada (sticky) si existe, si no la más reciente.
     El campo `featured` no interviene aquí.
  2. **Fila de destacadas**: hasta 4 entradas con `featured = 1` (excluyendo la del punto
     1), ordenadas por fecha. Solo se renderiza si existe al menos una.
  3. **Últimas entradas**: rejilla de las 4 últimas, excluyendo las ya mostradas arriba.

`archive.php` (categorías/etiquetas) no usa esta lógica; es un listado estándar.

- **Shortcode `[blog_section]`** (`theme/inc/utilities.php`) — misma estructura de tres
  filas para insertar en cualquier página. Atributos: `featured_source` (`auto`|`sticky`|`latest`),
  `featured_thumb`, `featured_count` (nº de destacadas en la fila 2, antes `pods_featured_count`),
  `count`, `grid_thumb`, `category`, `tag`, `show_category`, `view_transition`, `wrapper_class`.
  Usa el mismo campo nativo `featured` que el home del blog (ya no depende de Pods).

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
| `hero_slider.js` | Slider full-width above-the-fold (Splide). Atributo: `data-heroslider`. Reveal ligado a carga de primera imagen. |
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

## Pictau Blocks — Bloques reutilizables

Funcionalidad integrada en el tema desde **v7.0.0** (anteriormente distribuida como plugin independiente `wordpress-pictau-blocks-plugin`).

Permite crear bloques de contenido estático reutilizables editados con Gutenberg e insertarlos en cualquier página, widget o template mediante un shortcode.

**Archivo:** `theme/inc/pictau-blocks-gutenberg.php`

### CPT `pictau_blocks`

Tipo de contenido interno (no público, excluido de búsqueda) que almacena cada bloque. El contenido se edita con el editor de bloques de WordPress.

### Shortcode `[pictau-blocks id="X"]`

Renderiza el contenido del block con ID `X`. Procesa bloques Gutenberg (`do_blocks`) y shortcodes anidados (`apply_shortcodes`). Limpia comentarios HTML de Gutenberg y tags `<p>` vacíos del output.

**Caché con transients:** los bloques sin shortcodes dinámicos se cachean automáticamente durante 12 horas. El caché se invalida al guardar el CPT.

**Columna en el admin:** el listado de `pictau_blocks` muestra el shortcode listo para copiar en cada fila.

### Widget

Widget nativo `Pictau Blocks` disponible en **Apariencia → Widgets** y en el editor de widgets del Customizer. Permite seleccionar un block del CPT y renderizarlo en cualquier sidebar o área de widgets.

### Página de ajustes

Disponible en **Ajustes → PICTAU-BLOCKS Settings** con documentación de uso.

### Migración desde el plugin

Si el plugin `wordpress-pictau-blocks-plugin` está activo al mismo tiempo que el tema, el tema muestra un aviso de error en el admin con un botón directo para desactivarlo — evitando así cualquier error PHP fatal por colisión de funciones. Una vez desactivado el plugin, el tema toma el control automáticamente sin pérdida de datos (los posts `pictau_blocks` existentes se conservan).

---

## Admin — Clonación de contenidos

Implementada en `theme/inc/clone-post.php` (nativa del tema, sin plugin externo).

Aparece el enlace **Clonar** en la fila de cada contenido y como **bulk action** en los listados del admin. El clon se crea siempre como **borrador**.

**Post types soportados:** todos los públicos con UI (`post`, `page`, `pictau_blocks`, `gallery_item`) excepto tipos internos de WP, Pods y plugins de terceros.

**Qué se copia:** título, contenido, extracto, autor, template, taxonomías asignadas y todos los post meta (excepto `_edit_lock`, `_edit_last`, `_wp_old_slug` y meta con prefijo `_dp_`).

**Seguridad:** nonce por post ID (`pictau_clone_{post_id}`) + `current_user_can('edit_post')`.

> Reemplaza el plugin **Yoast Duplicate Post** — desinstalarlo si estaba activo.

---

## Contact Form 7 — Plantilla HTML de email (compatibilidad Outlook)

Implementado en `theme/inc/cf7_html_email_templates.php`. Envuelve el cuerpo de los emails de CF7 (`mail` y `mail_2`, hook `wpcf7_before_send_mail`) en una plantilla HTML basada en tablas, compatible con Outlook (motor de renderizado Word) y el resto de clientes de correo.

### Fixes de compatibilidad Outlook aplicados

- Envoltorio condicional `<!--[if mso]>...<![endif]-->` con tabla de ancho fijo (768px), ya que Outlook ignora `max-width` en `<div>`.
- Atributos `width`/`height` del logo en valores numéricos (Outlook ignora atributos inválidos como `width="200px"` o `height="auto"` y renderiza la imagen a su tamaño nativo).
- `valign="middle"` en vez de valores inválidos (el único valor válido en tablas es `top`/`middle`/`bottom`/`baseline`).
- `align="center"` + `role="presentation"` en todas las tablas anidadas del footer.
- Namespaces `xmlns:v` / `xmlns:o` en el `<html>` para condicionales MSO.

### Logo del email: SVG → PNG automático

Outlook y la mayoría de webmails (Gmail, Outlook.com) no renderizan SVG en el cuerpo de un email. Si el `custom_logo` del sitio (Personalizar → Identidad del sitio) está subido en formato SVG, el tema genera automáticamente una versión PNG para usar en el email — sin intervención manual y funcionando igual en cualquier proyecto/cliente que use este tema:

1. **Caché en disco**: se guarda como `<nombre-del-svg>-email.png`, junto al SVG original.
2. **Regeneración automática**: si el SVG es más reciente que el PNG cacheado (p. ej. tras subir un logo nuevo desde el Customizer), se regenera solo en el siguiente email enviado.
3. **Motor de conversión** (`pct_cf7_generate_email_logo_png()`), por orden de preferencia:
   - **Imagick** (extensión PHP) — vía preferida, presente en la mayoría de hostings WordPress gestionados.
   - **Binario del sistema** (`rsvg-convert`, o `convert`/`magick` de ImageMagick) — solo si `shell_exec()` está habilitado y el binario existe en el `PATH` del servidor (comprobado con `command -v` antes de ejecutar nada).
4. **Color del logo**: si el SVG usa `fill`/`stroke="currentColor"` (habitual en logos pensados para heredar color por CSS al renderizarse inline en la web), se sustituye por un color fijo antes de rasterizar, ya que fuera de un documento HTML no hay contexto CSS que lo resuelva. Color por defecto: blanco. Configurable por sitio:
   ```php
   add_filter('pct_cf7_email_logo_color', function () {
       return '#000000';
   });
   ```

### Último fallback: sin logo utilizable → `<h1>` con el nombre del sitio

Si no hay logo configurado, o es SVG y no se pudo generar/encontrar un PNG (servidor sin Imagick ni binarios de conversión disponibles), el header del email muestra `<h1>{nombre del sitio}</h1>` en vez de una imagen rota. Usa el mismo color configurable (`pct_cf7_email_logo_color`) y la tipografía del resto de la plantilla.

### Aviso en el admin

Si el servidor no puede generar el PNG (sin Imagick ni binarios de conversión disponibles), aparece un aviso en el panel de administración (visible solo para `manage_options`) indicando que hay que subir manualmente un PNG junto al SVG del logo, con el sufijo `-email.png`. El estado se cachea en un transient (`pct_cf7_email_logo_png_unsupported`, 12h) para no reintentar la generación en cada email enviado.

---

## Contact Form 7 + Polylang — Integración nativa

Integración nativa que reemplaza el plugin externo "Multilingual Contact Form 7 with Polylang". Implementada en `theme/inc/cf7-polylang.php` y cargada condicionalmente desde `theme/inc/utilities.php` cuando ambos plugins (CF7 y Polylang) están activos.

### Funcionalidades

**Tokens `{X}` en formularios:** cualquier texto entre llaves (`{Texto de ejemplo}`) en el editor CF7 se registra automáticamente como string traducible en Polylang (grupo "Contact Form 7"). En el frontend se sustituye por su traducción al idioma activo.

- Los tokens en atributos `value=` de campos no-submit se protegen y **no se traducen** (preservan el valor técnico).
- Compatibilidad con campos `select`/`radio`/`checkbox` con pipes (`{Opción}|val`): el valor técnico tras el pipe se restaura en los datos enviados.
- Compatibilidad con plantillas de email: sujeto y cuerpo con tokens `{X}` se traducen al idioma del formulario.
- Bloques `<style>` se neutralizan antes de aplicar el regex para evitar falsos positivos con propiedades CSS.

**Mensajes de error CF7:** los mensajes de validación del formulario (éxito, error de validación, spam, etc.) se registran en Polylang bajo el grupo "Contact Form 7 Error Messages" y se traducen en frontend.

**Locale forzado en AJAX:** las respuestas AJAX del formulario usan siempre el idioma correcto mediante cascada: `_wpcf7_locale` (POST) → cookie `pll_language` → `pll_current_language()`.

**Caché por formulario:** los tokens se escanean una sola vez por formulario y se cachean en transientes (`WEEK_IN_SECONDS`). El caché se invalida automáticamente al guardar el formulario.

### Panel Polylang en el editor CF7

Cada formulario tiene una pestaña **Polylang** en el editor con:

- Lista de los tokens traducibles detectados en el formulario.
- Aviso si hay strings huérfanas (eliminadas del formulario pero aún en el registro).
- **"Traducir campos del formulario"** — enlace directo a Polylang > String Translations filtrado por el grupo "Contact Form 7".
- **"Traducir mensajes de error"** — enlace directo a Polylang > String Translations filtrado por el grupo "Contact Form 7 Error Messages".
- **"Importar mensajes de error desde CF7"** — importa las traducciones de los mensajes de error directamente desde los archivos `.mo` del plugin CF7 a Polylang, sin salida de pantalla. Muestra el resultado inline (importadas / omitidas por idioma).
- **"Limpiar strings huérfanas"** — elimina del registro interno las strings que ya no existen en ningún formulario, sin recargar la página.

### Página Polylang > String Translations

Cuando se filtra por el grupo "Contact Form 7 Error Messages", aparece un aviso con el botón **"Importar mensajes de error desde CF7"** que ejecuta la misma importación masiva para todos los idiomas configurados en Polylang.

### Archivos `.mo` de CF7

La importación busca los archivos `.mo` de CF7 en:
1. `WP_LANG_DIR/plugins/contact-form-7-{locale}.mo`
2. `WP_PLUGIN_DIR/contact-form-7/languages/contact-form-7-{locale}.mo`

Para locales no ingleses, construye un mapa inverso (traducción → msgid inglés) para poder buscar correctamente en el `.mo` del idioma destino.

---

## Notas

- PHP: siempre `<?php echo` (nunca `<?=`)
- Comentarios deshabilitados globalmente
- Búsqueda vacía redirige a home
- GTM configurable desde el Customizer
- SVG inline via `[svg filename="..."]` (desde carpeta del tema) y `[svg-inline]` (convierte `<img src="*.svg">` en inline)
