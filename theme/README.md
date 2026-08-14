# Tema PICTAU para WordPress 7.x

Tema WordPress personalizado (marca blanca). Diseñado para proyectos a medida con soporte para catálogos de productos, CPTs via Pods, animaciones GSAP y un sistema de bloques Gutenberg extendido.

- **Versión:** 7.18.7
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
- [WP Armour - Honeypot Anti Spam ](https://es.wordpress.org/plugins/honeypot/)
- [Polylang](https://es.wordpress.org/plugins/polylang/)
- [CPT i18n slugs – Slugs traducibles para CPT (Polylang + Pods)](https://github.com/xenolito/WordPress-Plugin-Polylang-Addon-CPT-i18n-slugs)
- [GDPR Cookie Compliance](https://es.wordpress.org/plugins/gdpr-cookie-compliance/)
- [Loco Translate](https://es.wordpress.org/plugins/loco-translate/)
- [Maintenance Mode by Pictau](https://github.com/xenolito/WordPress-Plugin-Maintenance-Mode-by-Pictau)
- [PCT Gallery](https://github.com/xenolito/WordPress-Plugin-Image-Gallery)
- [Pods](https://es.wordpress.org/plugins/pods/)
- [WP Hide Login](https://es.wordpress.org/plugins/wps-hide-login/) (Optional)
- [WP Mail SMTP](https://es.wordpress.org/plugins/wp-mail-smtp/)
- [Updraft Plus – Backup and Restore](https://es.wordpress.org/plugins/updraftplus/)
- [WP Super Cache](https://es.wordpress.org/plugins/wp-super-cache/)

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

### Hooks versionados (`.githooks/`)

`.git/hooks/` nunca se versiona (es el directorio interno de metadatos de git, no un `.gitignore`). Por eso los hooks de este proyecto viven en `.githooks/` (versionado en el repo) y se activan configurando `core.hooksPath`:

- `.githooks/pre-commit` — si el commit toca `tailwind/`, `javascript/` o `postcss.config.js`, ejecuta `npm run production` y añade `theme/` al commit automáticamente. Evita desplegar por error un build de desarrollo (`npm run watch`, sin minificar) si se te olvida correr `npm run production` antes de commitear.
- `.githooks/post-commit` — el hook de publicación a `deploy-origin` (ver más abajo).

El script `postinstall` de `package.json` ejecuta `git config core.hooksPath .githooks` automáticamente en cada `npm install`, así que un checkout nuevo queda configurado sin pasos manuales.

### Cómo replicarlo en un proyecto nuevo

1. Crea el repo de despliegue vacío en GitHub (p. ej. `web-<proyecto>.git`) y añádelo como remote:
   ```bash
   git remote add deploy-origin git@github.com:usuario/web-<proyecto>.git
   ```

2. Copia `.githooks/post-commit` de este proyecto (ajustando `HEAD:theme` al nombre de la carpeta del tema si no se llama `theme`), añade `"postinstall": "git config core.hooksPath .githooks"` a los `scripts` de `package.json`, y corre `npm install` (o `git config core.hooksPath .githooks` directamente) para activarlo en el checkout actual.

3. En el servidor de producción, clona el repo de despliegue **directamente** en `wp-content/themes/<slug>/` (estructura plana — `style.css` y `functions.php` deben quedar directamente ahí, no anidados en una subcarpeta `theme/`).

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

## Custom Post Types y taxonomías

La mayoría de CPTs y taxonomías del proyecto se crean y gestionan mediante el plugin Pods. Las operaciones se documentan en `.claude/pods-playbook.json` y se ejecutan via WP-CLI.

El tema incluye soporte nativo para el catálogo de productos:

| Slug | Tipo | Descripción |
|------|------|-------------|
| `producto` | CPT | Productos del catálogo |
| `product_category` | Taxonomía | Categorías de producto (jerárquica) |

Además, dos CPTs se registran de forma **nativa en el tema** (sin depender de ningún plugin):

| Slug | Tipo | Descripción |
|------|------|-------------|
| `pictau_blocks` | CPT | Bloques estáticos reutilizables (`theme/inc/pictau-blocks-gutenberg.php`) |
| `slide` (+ `slide_category`) | CPT + Taxonomía | Slides del hero slider `[hero-slider]` (`theme/inc/slide-cpt.php`) |

`slide` se migró desde Pods en 2026-07 precisamente para que `[hero-slider]` funcione con solo activar el tema, sin depender de que Pods esté instalado. Ver la sección [`[hero-slider]`](#hero-slider) para el detalle de sus campos.

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
| `data-testimonials_slidewidth` | `380px` | Ancho de cada slide (la "cajita") en el breakpoint desktop (>535 px). Acepta cualquier valor CSS (`px`, `clamp(…)`, `vw`, `%`, `cqw`…). Splide calcula automáticamente cuántos slides caben por página según el ancho disponible — no se configura un número fijo de slides visibles. Default: `clamp(300px, 24vw, 420px)` |
| `data-testimonials_slidewidthmobile` | `clamp(180px, 66cqw, 280px)` | Igual que `data-testimonials_slidewidth` pero para el breakpoint móvil (≤535 px). Default: `66vw` (mismo valor histórico, relativo al viewport real) |
| `data-testimonials_speed` | `600` | Duración de la transición entre slides en ms. Default: `900` |
| `data-testimonials_gap` | `3rem` | Espacio entre slides. Acepta cualquier valor CSS (`rem`, `px`, `clamp(…)`). Default: `clamp(2rem, 5vw, 4.8rem)` |
| `data-testimonials_padding` | `4rem` | Padding del track (efecto "peek": cuánto se asoman los slides adyacentes por los laterales) en el breakpoint desktop (>535 px). Acepta cualquier valor CSS. Default: `clamp(5.6rem, 10vw, 9.6rem)` |
| `data-testimonials_paddingmobile` | `clamp(1rem, 6cqw, 2rem)` | Igual que `data-testimonials_padding` pero para el breakpoint móvil (≤535 px). Default: `0` (el peek en móvil lo controla `slidewidthmobile`, no este valor — ver nota) |
| `data-testimonials_draggable` | `true` | Habilita drag con ratón |
| `data-testimonials_lazyload` | *(vacío)* | **Activa** el componente `LazyLoad` nativo de Splide para las `<img>` de cada slide (siempre en modo `'nearby'`: carga solo las cercanas al slide activo). Es un flag booleano por **presencia** del atributo — el valor no importa (`data-testimonials_lazyload=""`, `="true"`, `="1"`... todo activa igual). Default: ausente = desactivado (sin tocar las imágenes, comportamiento histórico) |
| `data-testimonials_preloadpages` | `3` | Nº de "páginas" (`perPage`, con default `1` en Splide) de slides a precargar por delante/detrás del activo. Solo aplica con `lazyload` presente. Default: `2` (ya más generoso que el `1` de Splide). Súbelo si con autoplay rápido sigues viendo el slide entrante sin cargar |
| `data-testimonials_log` | `1` | Activa logging en consola para debug |

### `lazyload` — evitar el FOUC de imágenes con autoplay/drag rápido

Cuando los slides son `<img>` (p.ej. la variante `.slide-media`), WordPress marca automáticamente algunas de ellas con `loading="lazy"` nativo del navegador (todas menos las primeras). Ese lazy-load nativo decide cuándo pedir la imagen según su proximidad al **viewport del documento** — no tiene ni idea de que un elemento está dentro de un carrusel ni de cuál es el "slide activo". Con autoplay o drag rápidos, el slide que acaba de entrar por el lateral puede llevar varios segundos sin haber empezado siquiera a descargarse, produciendo un FOUC/imagen en blanco hasta que carga.

Con `data-testimonials_lazyload` presente en el bloque (cualquier valor, incluido vacío), el módulo (antes de montar Splide, en `setupDOM()`) convierte cada `<img src="..." loading="lazy">` de los slides a `<img data-splide-lazy="...">` (y `srcset` → `data-splide-lazy-srcset`), quitando el atributo `loading` para que el navegador no decida nada por su cuenta. Splide pasa entonces a controlar la carga con su propio componente `LazyLoad` en modo `'nearby'`: en cuanto un slide entra en la ventana `data-testimonials_preloadpages` (medida en distancia al índice activo, no en scroll de página), le asigna el `src` real. Mientras carga, añade la clase `is-loading` al `.splide__slide` y un spinner (`.splide__spinner`, ya estilado en `splide.min.css`) dentro del contenedor de la imagen.

**Por qué el valor del atributo no importa:** `getConfigByAtt()` (`javascript/modules/attributesToConfigObj.js`, compartida por ~25 módulos del tema) convierte cualquier atributo con valor vacío a `false` — así que un `data-testimonials_lazyload=""` (equivalente a `data-testimonials=""` para activar el slider) llegaría ya como `false` a través de `config`, indistinguible de "atributo ausente". Por eso `lazyload` es la única opción del módulo que se lee directamente del `dataset` del elemento en vez de a través de `config`: lo único que importa es que la clave exista.

**No soporta `'sequential'`** (carga todas en orden, una a una) — solo tenía sentido como alternativa a `'nearby'` y no hay caso de uso real para ello aquí; si en el futuro hiciera falta, habría que reintroducir un valor explícito distinto de vacío para elegir el modo.

**Nota:** con pocos slides (p.ej. 5) y un `preloadpages` generoso, la ventana de precarga puede cubrir el carrusel entero desde el primer instante — en ese caso no hay diferido visible, todo carga de inmediato, lo cual es correcto (no un fallo del mecanismo, simplemente no hace falta diferir nada con tan pocos slides).

**Límite del parseo de atributos:** `getConfigByAtt()` (`javascript/modules/attributesToConfigObj.js`) obtiene el nombre de cada opción haciendo `key.split('_')[1]` sobre el dataset — por eso el nombre tras `data-testimonials_` debe ser **una sola palabra sin guion bajo** (`slidewidthmobile`, no `slidewidth_mobile`); un guion bajo adicional se interpretaría como otro separador y la opción colisionaría con otra ya existente.

### Comportamiento por defecto

| Breakpoint | Ancho del slide | Slides visibles | Padding lateral |
|---|---|---|---|
| >535 px | `fixedWidth: clamp(300px, 24vw, 420px)` (configurable con `data-testimonials_slidewidth`) | automático — tantos como quepan según el ancho disponible | `clamp(5.6rem, 10vw, 9.6rem)` (configurable con `data-testimonials_padding`) |
| ≤535 px | `fixedWidth: 66vw` (configurable con `data-testimonials_slidewidthmobile`) | 1 (centrado, con `focus: center`) | `0` (configurable con `data-testimonials_paddingmobile`) |

`focus: 'center'` está activo en **todos** los breakpoints (no solo en móvil): el slide activo queda siempre centrado en el track, con los vecinos asomando simétricamente a ambos lados.

**Slide con ancho fijo y nº de slides automático (`fixedWidth` sin `perPage`):** el ancho de cada slide es fijo (`data-testimonials_slidewidth`, un `clamp()` por defecto para que crezca/encoja algo con el viewport pero sin superar un máximo), y en vez de indicarle a Splide un número de slides visibles, se omite `perPage` — Splide entonces calcula solo cuántas "cajitas" caben en el ancho disponible del track (incluido el cálculo de clones para el loop infinito, que usa `ceil(anchoDelTrack / anchoDelSlide)` en vez de basarse en `perPage`). Resultado: en viewports anchos aparecen automáticamente más slides por página, sin tocar configuración.

**Breakpoint móvil (≤535 px) — `fixedWidth` + `padding` configurables por separado:** el ancho/padding del breakpoint móvil son independientes de `data-testimonials_slidewidth`/`data-testimonials_padding` (Splide solo sobrescribe en cada breakpoint las claves que se le indican; sin esta separación, el valor del desktop seguiría activo en móvil y competiría por el mismo espacio). Por defecto siguen usando los valores históricos relativos al **viewport real** (`66vw` / `padding: 0`), correctos para el uso full-bleed habitual del `[data-testimonials]` genérico.

**Instancias anidadas en un contenedor más estrecho que el viewport** (p.ej. un slider dentro de una card, no full-bleed): tanto `vw` como `%` fallan aquí — `vw` mide contra el viewport real, no contra el contenedor; y `%` puede colapsar por referencia circular con el ancho de `.splide__list` (que depende de sus propios hijos) o quedar distorsionado si el `padding` del track (también configurable) se come buena parte del espacio disponible antes de que el `%` se calcule. La solución es usar **Container Queries**: establecer `container-type: inline-size` en un ancestro del slider (por CSS, en `style.css`) y usar `cqw` en `data-testimonials_slidewidth`/`_padding`/`_slidewidthmobile`/`_paddingmobile` — así el cálculo siempre es relativo al ancho real del contenedor, sea cual sea el viewport o cuánto padding intermedio haya. Ejemplo real: `.auto-slide.slide-media` en `tailwind/custom/components/style.css` (slider de capturas dentro de una card en la home).

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

### Anti-FOUC / anti-CLS durante el montaje

El bloque exterior arranca con `opacity: 0` y una regla `&:not(.splide) { display: grid; > * { grid-area: 1 / 1; } }` — mientras el JS no ha añadido la clase `.splide` (aún no ha reestructurado el DOM en `.splide__track`/`.splide__list`), los slides en bruto se apilan unos sobre otros (grid) en vez de mostrarse en columna. Así, el alto del bloque antes de montar Splide ya es ~ el de una sola tarjeta (el más alto de los slides superpuestos), en vez de la suma de todos los slides — evita el salto de layout (CLS) grande que se produciría al colapsar una columna larga en una sola fila al montar el carrusel. El módulo añade la clase `splide-ready` justo después de `new Splide(...).mount()`, lo que dispara la transición `opacity` a `1` (`transition: opacity 0.4s ease`) — así el bloque no se ve hasta que Splide está configurado.

---

## Bloques Gutenberg — Marquee infinito de logos (marquee)

Convierte un bloque **Grupo** de Gutenberg en una cinta de logos (u otro contenido) con scroll horizontal infinito. Módulo JS: `javascript/modules/marquee.js`.

**Atributo de activación:** `data-marquee`

### Estructura HTML requerida

El outer Group debe contener un **único Group interior** ("slide"), y dentro de ese, los items (normalmente bloques de imagen). El módulo clona ese slide una vez y lo coloca a continuación del original, para lograr el scroll infinito sin salto (los dos slides idénticos se desplazan juntos y el bucle se reinicia de forma invisible).

```
📦 Group (outer)       ← data-marquee aquí
  └── 📦 Group (slide) ← único hijo directo
        ├── 🖼️ Image (item 1)
        ├── 🖼️ Image (item 2)
        └── 🖼️ Image (item N…)
```

Se requieren al menos **5 items** dentro del slide.

### Atributos de configuración (en el bloque exterior)

| Atributo | Valor de ejemplo | Descripción |
|---|---|---|
| `data-marquee` | *(vacío)* | **Activa el marquee** (requerido) |
| `data-marquee_speed` | `20000` | Duración en ms para completar un ciclo completo de scroll. Default: `30000` |
| `data-marquee_reverse` | `1` | Invierte el sentido del scroll (izquierda→derecha en vez de derecha→izquierda) |
| `data-marquee_log` | `1` | Activa logging en consola para debug |

### Comportamiento por defecto

- **Dirección:** derecha → izquierda (configurable con `data-marquee_reverse`)
- **Velocidad:** 30000ms (30s) por ciclo completo, lineal, infinito — configurable con `data-marquee_speed`
- **Máscara horizontal:** degradado radial (`mask-image`) para difuminar los bordes izquierdo/derecho
- **Altura de cada logo:** 60px (`.item img`), controlada por CSS, no por el módulo JS

### Anti-FOUC / anti-CLS durante el montaje

Mismo problema y misma solución que en el slider de testimonios (ver sección anterior), adaptada a que aquí solo hay un slide (no varios independientes): el bloque exterior arranca con `opacity: 0`, y mientras el JS no ha añadido la clase `.marquee`, el slide en bruto y sus items ya se muestran en una fila (`display: flex; flex-flow: row nowrap`) con la misma altura de imagen final (60px), en vez de apilados en columna con el alto natural (sin restringir) de cada imagen. Así el alto del bloque no cambia al montar el marquee real — antes colapsaba de una columna de imágenes a tamaño natural a una fila de 60px de golpe. El módulo añade la clase `marquee-ready` al final de `setupDOM()` (tras clonar el slide), lo que dispara la transición `opacity` a `1` (`transition: opacity 0.4s ease`).

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

Slider full-width above-the-fold basado en Splide.js y el CPT `slide` (registrado nativamente en el tema, `theme/inc/slide-cpt.php` — sin dependencia de plugins). El contenido de cada slide se edita con el editor de bloques de WordPress. Los slides se ordenan por el campo `orden`.

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

Campos y taxonomía (meta box nativo en `theme/inc/slide-cpt.php`, sin Pods):

| Campo / Taxonomía | Tipo | Descripción |
|---|---|---|
| `orden` | Número | Orden de aparición (menor = primero). El slide con menor `orden` es el primero. |
| `caducidad` | Datetime | Fecha y hora de expiración automática del slide. Ver sección _Caducidad_ más abajo. |
| `slide_category` | Taxonomía jerárquica | Categoría interna del slide (sólo visible en admin). Permite filtrar slides por contexto con el atributo `category` del shortcode. |
| `slide_callback` | Texto | Nombre de función JS global (`window[fn]`) a ejecutar cuando este slide queda activo. Firma: `fn(newIndex, splideInstance)`. Dispara en el montaje inicial (evento `ready`) y en cada transición posterior (evento `moved`). Se ejecuta después del `callback` global si ambos están definidos. |

Al activar el tema, se crea automáticamente el término `home` en `slide_category` si no existe ya (hook `after_switch_theme`, idempotente — no duplica el término en reactivaciones posteriores). Así el sitio queda listo para usar `[hero-slider category="home"]` sin tener que crear la categoría a mano.

**Admin — Listado de slides:**

El listado de slides en el panel de WordPress incluye:
- Columna **Categoría**: muestra la `slide_category` asignada con enlace a filtro.
- Columna **Orden**: muestra el valor del campo `orden` (ordenable).
- Columna **Caducidad**: muestra la fecha/hora de expiración con indicadores visuales (⚠ rojo = ya expirado, ⏰ naranja = caduca en < 7 días).
- Dropdown de filtro por categoría en la barra de filtros del listado.

#### Caducidad — expiración automática de slides

Cada slide puede tener una fecha+hora de caducidad en el campo `caducidad` (formato `Y-m-d H:i:s`). El sistema es **triple capa** para garantizar que un slide no aparezca incluso con caché activa (WP Super Cache, WP Rocket, etc.):

**Capa 1 — Filtro PHP (server-side):** el shortcode usa un `meta_query` que excluye slides cuya `caducidad` haya pasado. Garantiza que en cada carga fresca el slide ya no se renderiza. El filtro también incluye `0000-00-00 00:00:00` como valor equivalente a "sin caducidad" (sentinel heredado de la época en que el campo se gestionaba con Pods, previo a la migración a CPT nativo; se mantiene por compatibilidad con datos antiguos). Un hook `save_post_slide` (priority 100) normaliza ese valor a `''` en el momento del guardado para que la base de datos quede limpia.

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

**Accesibilidad:** el `<video>` lleva `aria-hidden="true"` (nunca `aria-label`) — es contenido puramente decorativo (`muted loop`, sin controles), y darle un nombre accesible sin subtítulos hace que Lighthouse pida un `<track kind="captions">` que no aplica aquí. Ocultarlo del árbol de accesibilidad es la recomendación estándar para vídeo de fondo decorativo.

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

### Presets

La sección **Presets** (colapsable, cerrada por defecto) ofrece acceso rápido a combinaciones de `data-attributes` ya usadas en el tema (animaciones GSAP, modales CF7, etc.) — no está limitada a un solo tipo de funcionalidad. Al hacer clic en un preset, sus atributos se añaden o fusionan con los existentes.

| Preset | Atributos añadidos |
|---|---|
| **Anim Any** | `data-anim_any=""` |
| **Counter** | `class="pct-counter"` |
| **Typewriter** | `data-anim_any=""` + `data-anim_any_animation="cyclecontentinline"` + `data-anim_any_cyclecontentanim="typewriter"` + `data-anim_any_fixedwords="1"` + `data-anim_any_duration="0.5"` + `data-anim_any_stagger="0.08"` + `data-anim_any_holdtime="2"` + `data-anim_any_repeat="false"` + `data-anim_any_cursorchar="_"` (misma configuración que `.cycle-inline-2`; aplicar al bloque grupo que contiene los ciclos — ver [Ciclo de texto inline](#ciclo-de-texto-inline-cyclecontentinline)) |
| **Open Modal trigger** | `data-modalform_target="lead"` + `data-modalform_input_name="producto"` + `data-modalform_input_data="Estoy interesado en: {{title}}"` — mismos atributos que el botón "Más información" de la home. Aplicar al bloque botón/enlace que debe abrir el modal (ver [Modales con formulario](#modales-con-formulario-contact-form-7--modalwpjs--modalcontactform7js)) |
| **Is CF7 modal** | `data-modalform="lead"` — marca el bloque (normalmente un Grupo) como modal CF7; su valor debe coincidir con el `data-modalform_target` de los triggers que lo abren |

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
| `cyclecontentinline` | Como `cyclecontent`, pero para ciclos de texto inline (sigue a otro texto en la misma línea), con split por word/char. Ver sección dedicada más abajo |
| `typewriter` | Revela los chars uno a uno tipo máquina de escribir, con cursor parpadeante. Params: `data-anim_any_cursorchar` (default `\|`), `data-anim_any_cursorblink` (default 0.5s). También reutilizable como `data-anim_any_cyclecontentanim="typewriter"` dentro de `cyclecontentinline` |

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
| `data-anim_any_cyclecontentrandom` | — | Cualquier valor no vacío (`"1"`, `"true"`, lo que sea) baraja el orden de aparición de los hijos. Sin el atributo (o vacío), sigue el orden del DOM |
| `data-anim_any_duration` | `1.5` | Duración de la transición de entrada y de salida de cada hijo |
| `data-anim_any_stagger` | `0.1` | Aquí no hay elementos en paralelo: se reutiliza como **tiempo que cada hijo permanece visible** antes de empezar a desaparecer |
| `data-anim_any_delay` | `0.33` | Retardo antes de la entrada del primer hijo |

**Animaciones soportadas para `cyclecontentanim`:** `reveal`, `slideFromBottom`, `slideFromTop`, `slideFromLeft`, `slideFromRight`, `zoomIn`, `zoomBounce`, `rotateX`, `clippedFromBottom`. Un nombre no soportado (p.ej. `clippedFromLeft`, `blurIn`) cae a `reveal` con un aviso en consola.

**Notas:**
- La transición es siempre secuencial (el hijo visible desaparece del todo antes de que el siguiente empiece a aparecer), sin solape.
- **Scroll**: igual que el resto de animaciones, arranca al entrar en el viewport. A diferencia de las animaciones de una sola pasada, `cyclecontent` además **se pausa** al salir de pantalla por abajo (no sigue animando en bucle infinito fuera de la vista) y **se reanuda** donde se quedó al volver a entrar desde abajo. Al salir por arriba (scroll hacia atrás, antes del punto de inicio): con `data-anim_any_repeat="true"` (default) vuelve al estado inicial oculto, lista para repetirse si se vuelve a entrar; con `data-anim_any_repeat="false"` se queda congelada tal cual estaba.
- No combinar con `data-anim_any_nextanim`: al repetirse el timeline entero, el elemento encadenado se relanzaría en cada vuelta del bucle, no solo una vez.
- Cada hijo conserva su propia alineación/estilo tal cual (texto a la izquierda, centrado, un `<div>` con cualquier contenido...) — `cyclecontent` no toca su tamaño ni posición. Para los presets con transform (`zoomIn`, `zoomBounce`, `rotateX`), el `transform-origin` se calcula automáticamente midiendo dónde cae el contenido ya renderizado de cada hijo, así que el zoom/rotación siempre pivota sobre lo que se ve — no sobre el centro de la caja completa — sea cual sea su alineación o ancho.
- Ese cálculo se repite justo antes de cada entrada/salida (no solo una vez al cargar), así que si la ventana cambia de ancho entre medias (p.ej. un texto largo pasa a ocupar más líneas en móvil), el `transform-origin` se autocorrige solo en el siguiente turno del ciclo — no hace falta escuchar `resize` ni usar `matchMedia`.
- `data-anim_any_whattoanim` no aplica a esta animación (no usa SplitType).
- El barajado (`cyclecontentrandom`) se sortea **una sola vez** al montar la animación (Fisher-Yates); el bucle repite siempre esa misma secuencia, no se reordena en cada vuelta.

### Ciclo de texto inline (`cyclecontentinline`)

Como `cyclecontent`, pero pensado para un ciclo de **frases cortas** que sigue a otro texto estático en la **misma línea** (p.ej. `Qlik <frase que cambia>`). El contenedor pasa a `display:inline-grid` (mismo truco de stacking sin layout shift que `cyclecontent`, pero sin forzar ancho de bloque), y cada frase se anima **por palabra o char** en vez de como un bloque completo — vía `data-anim_any_whattoanim` (`words` por defecto, o `chars`; `lines` no aplica aquí).

Estructura recomendada en Gutenberg: un bloque grupo con el texto fijo + un grupo anidado (el target del ciclo) con las frases alternativas como hijos directos — igual patrón que ya usa `cyclecontent` para el rotador de bloque, solo que el grupo target lleva además una regla CSS para quedar en la misma fila que el texto fijo (ver nota de layout más abajo).

```html
<div class="cycle-inline-wrapper">
  <h2>Qlik</h2>
  <div data-anim_any
       data-anim_any_animation="cyclecontentinline"
       data-anim_any_whattoanim="words"
       data-anim_any_cyclecontentanim="zoomBounce"
       data-anim_any_duration="0.5"
       data-anim_any_stagger="0.08"
       data-anim_any_holdtime="2"
       data-anim_any_repeat="false">
    <h2>para vender mejor.</h2>
    <h2>para controlar márgenes.</h2>
    <h2>para entender tus datos.</h2>
  </div>
</div>
```

| Atributo | Default | Descripción |
|---|---|---|
| `data-anim_any_whattoanim` | `words` | `words` \| `chars`. Split de cada frase para su transición de entrada/salida (no soporta `lines`) |
| `data-anim_any_cyclecontentanim` | `reveal` | Nombre de otra animación de `anim_any` a reutilizar para la transición de cada frase — misma idea que en `cyclecontent`. Soportados: `reveal`, `zoomBounce`, `typewriter` |
| `data-anim_any_cyclecontentrandom` | — | Misma semántica que en `cyclecontent`: cualquier valor no vacío baraja el orden de las frases |
| `data-anim_any_holdtime` | `2` | Tiempo que cada frase permanece visible antes de empezar a desaparecer. A diferencia de `cyclecontent`, aquí `stagger` **no** se repurpone como hold-time — recupera su significado estándar (tiempo entre words/chars), porque siempre hay elementos en paralelo que espaciar |
| `data-anim_any_duration` | `1.5` | Duración de la transición de cada word/char. **No aplica si `cyclecontentanim="typewriter"`**: ahí cada char aparece/desaparece de golpe, sin fade |
| `data-anim_any_stagger` | `0.1` | Tiempo entre words/chars (significado estándar). Con `typewriter`, es la velocidad de tecleo/borrado |
| `data-anim_any_delay` | `0.33` | Retardo antes de la primera frase |
| `data-anim_any_fixedwords` | `0` (desactivado) | Número de palabras fijas al principio, leídas **solo del primer hijo** — ver sección dedicada más abajo |

**Notas:**
- Igual comportamiento de scroll que `cyclecontent` (arranca al entrar en viewport, se pausa al salir por abajo, se reanuda donde se quedó, y al salir por arriba respeta `data-anim_any_repeat`).
- No hace falta `getCycleContentOrigin`: cada word/char de SplitType ya envuelve justo su propio contenido, así que el `transform-origin` centrado no necesita medirse ni recalcularse en resize.
- **Orden de salida**: para cualquier `cyclecontentanim` (no solo `typewriter`), el word/char que apareció **último** es el primero en desaparecer, y así sucesivamente hacia atrás — la salida siempre "deshace" la entrada en el mismo orden en que se construyó, en vez de desvanecerse en el mismo orden en que apareció.
- Con `cyclecontentanim="typewriter"`, cada char aparece y desaparece **de golpe** (sin fade), igual que al escribir en una terminal — ver la sección de `typewriter` más abajo.
- **Layout**: si hay un texto fijo escrito a mano como sibling (p.ej. un "Qlik" en su propio bloque, antes del target), tiene que poder fluir en la misma línea que el target del ciclo. `display:flex` **no sirve** para esto: un flex row nunca fusiona sus hijos en la misma línea de texto compartida (cada flex item es su propia caja, así que "Qlik" podía acabar partiéndose en su propia columna estrecha en vez de fluir junto al resto). En `tailwind/custom/components/animations.css`, el wrapper que los contiene vuelve a comportarse como bloque (anula el `display:flex` que WP aplica por defecto a los grupos para el espaciado con blockGap — selector `:has(> [data-anim_any_animation="cyclecontentinline"])`, igual de agnóstico al className del bloque), y cada pieza estática pasa a `display:inline`; el propio target ya es `inline-grid` (puesto por JS) y encaja sin más en ese mismo flujo. Esa misma regla neutraliza el `width:100%`/`margin` que WP fuerza en los hijos directos de un layout "constrained", y añade un `margin-right: 0.25em` sobre cada pieza fija (`> *:not(:last-child)`, escala con el font-size real de cada una vía `em`, no con `column-gap` en el wrapper — ver detalle en el propio CSS).

  **Límite de este mecanismo:** un `inline-grid` sigue siendo una **caja atómica** — participa en la línea de fuera como un bloque indivisible, pero nunca entremezcla su contenido interno palabra a palabra con el texto de un sibling externo. Un "Qlik" así solo puede convivir en la misma línea o saltar *entero* a la siguiente; nunca dejará hueco a mitad de camino para que, por ejemplo, la primera palabra del ciclo continúe justo detrás en la misma línea. Para eso — que texto fijo y ciclo se comporten como un único párrafo que se reparte y ajusta de línea junto, palabra a palabra — hace falta que el texto fijo viva **dentro** de la propia caja del ciclo: usar `data-anim_any_fixedwords` (ver sección dedicada más abajo) en vez de (o además de) un sibling externo.
- No combinar con `data-anim_any_nextanim` (misma limitación que `cyclecontent`: el bucle infinito relanzaría el encadenado en cada vuelta).

#### Palabras fijas (`data-anim_any_fixedwords`)

Marca que las **N primeras palabras** de la frase queden fijas y visibles siempre, iguales para todos los hijos — pensado para casos como "para vender mejor.", "para controlar márgenes.", "para entender tus datos.", donde todas las variantes comparten un inicio común ("para") que no tiene sentido animar en cada ciclo.

**Patrón de autoría: las N palabras fijas se leen exclusivamente del primer hijo.** El resto de hijos se escriben ya sin ellas — no hace falta repetirlas:

```html
<div data-anim_any
     data-anim_any_animation="cyclecontentinline"
     data-anim_any_cyclecontentanim="zoomBounce"
     data-anim_any_fixedwords="1">
  <h2>para vender mejor.</h2>
  <h2>controlar márgenes.</h2>
  <h2>entender tus datos.</h2>
</div>
```

En el setup, esas N palabras se **duplican** (no se clonan a un elemento aparte) al principio de cada uno de los demás hijos, y se excluyen del array de elementos animables en todos ellos — nunca se les toca opacidad ni transform, así que se quedan siempre a la vista sin que el efecto de aparición/borrado las alcance.

**Por qué se duplican dentro de cada hijo, en vez de extraerse a un elemento aparte (como hacía una versión anterior de esta función):** `this.header` (el target del ciclo) es `display:inline-grid` — una **caja atómica**: participa en el flujo de línea de fuera como un bloque indivisible, pero su contenido interno nunca se entremezcla palabra a palabra con texto de fuera de esa caja. Un texto fijo colocado *fuera* de ella (como sibling) podía acabar saltando entero a su propia línea en vez de fluir junto con el resto de la frase, aunque cupiera de sobra — exactamente el mismo motivo por el que dos elementos `display:flex` tampoco se fusionan en una única línea de texto compartida. La única forma de que la palabra fija haga *line-wrap* junto con el resto como un párrafo normal es que viva **dentro** de esa misma caja atómica, en cada hijo.

**Notas:**
- Si `data-anim_any_fixedwords` pide más palabras de las que tiene el primer hijo, se usa el máximo disponible (aviso en consola).
- Compatible con cualquier `cyclecontentanim` (`reveal`, `zoomBounce`, `typewriter`).
- Al duplicarse dentro de cada hijo (en vez de vivir en un elemento aparte), la palabra fija también participa del truco de "no layout shift" del stacking en grid: el ancho/alto del target se sigue calculando sobre el texto completo (fijo + variable) de cada variante.

### Máquina de escribir (`typewriter`)

Revela los chars del target uno a uno **de golpe** (sin fade, como al escribir en una terminal real), con un cursor parpadeante que se desplaza junto al último char revelado. Usable suelto o como `data-anim_any_cyclecontentanim="typewriter"` dentro de `cyclecontentinline` (en ese caso, la salida de cada frase es un efecto "backspace": los chars desaparecen uno a uno en orden inverso, también de golpe).

```html
<p data-anim_any
   data-anim_any_animation="typewriter"
   data-anim_any_stagger="0.05"
   data-anim_any_cursorchar="_"
   data-anim_any_cursorblink="0.4">
  Texto que se escribe solo
</p>
```

| Atributo | Default | Descripción |
|---|---|---|
| `data-anim_any_stagger` | `0.1` | Tiempo de espera entre la aparición de un char y el siguiente (velocidad de tecleo) |
| `data-anim_any_delay` | `0.33` | Retardo antes del primer char |
| `data-anim_any_cursorchar` | `\|` | Carácter usado como cursor |
| `data-anim_any_cursorblink` | `0.5` | Duración en segundos de cada medio-ciclo de parpadeo del cursor (yoyo infinito) |
| `data-anim_any_blankpause` | `0.4` | Solo dentro de `cyclecontentinline`: segundos que el cursor sigue parpadeando solo, ya en la posición inicial (sin chars), después de terminar el "backspace" de una frase y antes de que empiece a escribirse la siguiente |

**Nota:** `data-anim_any_duration` no aplica — cada char aparece/desaparece instantáneamente (`gsap.set`, no `gsap.to`), no hay transición que durar. Solo `stagger` (velocidad) y `delay` (espera inicial) controlan el ritmo.

**Notas:**
- `data-anim_any_whattoanim` se ignora — siempre trabaja por `chars`.
- El cursor es un único nodo que se reubica junto al char actual (`insertAdjacentElement`) en vez de crearse/destruirse, así nunca cambia el ancho reservado por el texto y no hay layout shift.
- El parpadeo del cursor está enganchado al propio timeline de la animación (no al timeline global), así se pausa/reanuda igual que el resto de la animación en scroll.
- En el efecto "backspace" (salida dentro de `cyclecontentinline`), cada char desaparece de golpe (sin fade) y el cursor se reposiciona en ese mismo instante — si desaparecieran con transición, el cursor (que se movía a su posición final antes de que el fade terminase) se veía "adelantarse" a un char que técnicamente aún seguía visible.

### Rendimiento — instanciación diferida (IntersectionObserver + requestIdleCallback)

Instanciar cada `[data-anim_any]` hace `SplitType` (envuelve el texto en spans → escribe DOM) + `ScrollTrigger.create()` (mide la posición → lee layout). Hacerlo con **todos** los elementos de golpe en `DOMContentLoaded` es *layout thrashing*: en páginas con muchos `[data-anim_any]`, Lighthouse lo reporta como **"Forced reflow"** en la carga inicial. Desde **v4.18.0** del módulo, la instanciación se reparte:

- **Grupos.** Los elementos conectados por `data-anim_any_chainanim`/`data-anim_any_nextanim` se agrupan en un pre-pass y **siempre se instancian juntos y en orden del DOM** (el "master"/disparador debe existir antes que el encadenado). Un elemento sin encadenar es un grupo de 1.
- **Eager (síncrono, en la carga):** grupos cerca del viewport inicial, y **cualquier grupo con un elemento `autoplay=0`** (propio o forzado por ser target de un `nextanim`). Estos últimos deben instanciarse ya porque esperan un `.play()` externo que llega antes que cualquier callback del observer — p.ej. el `<h1>` del hero-slider, que `script.js` arranca vía `headerAnimation.play()` (ver [Reveal del `.slider-cover`](#reveal-del-slider-cover-y-animación-del-header-data-anim_any)). Son baratos: con `autoplay=0` no crean `ScrollTrigger` propio.
- **Diferido (lazy):** el resto se instancia vía `IntersectionObserver` (`rootMargin: 600px`) cuando se acerca al viewport, repartiendo el coste a lo largo del scroll en vez de una ráfaga al cargar.
- **Blindaje `requestIdleCallback` (v4.18.1):** el trabajo de layout de cada grupo diferido se ejecuta en tiempo muerto del navegador, fuera de cualquier frame de scroll activo, para que el reflow de crear el `ScrollTrigger` no produzca micro-jank. Se marca el grupo y se deja de observar de forma síncrona; solo la preparación se difiere. `timeout` de 500 ms como cota de seguridad (muy por debajo de lo que tarda el usuario en recorrer los 600 px de `rootMargin`), y fallback a `setTimeout` en Safari < 17.

No hay nada que configurar por atributo: es automático y transparente. El único efecto observable es que un `[data-anim_any]` lejano no tiene su `headerAnimation` creado hasta que te acercas a él (relevante solo si algún código externo intenta llamar a `.play()` sobre un elemento que aún no ha entrado en el `rootMargin` — en ese caso, dale `data-anim_any_autoplay="0"` para forzar su instanciación eager).

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
- **Orden de compilación de `tailwind/custom/components/`**: todos los ficheros de ese directorio se importan automáticamente vía `@import-glob` (orden alfabético), **excepto** `components.css`, `all-themes.css` y `style.css`, que se excluyen de ese glob y se importan explícitamente al final, en ese orden fijo (`components` → `all-themes` → `style`), para que ganen siempre la cascada frente al resto de componentes sin depender de `!important`. Ver `tailwind/tailwind.css`. Cualquier otro fichero nuevo en `components/` entra automáticamente en el glob salvo que se añada también a esa lista de exclusión.

---

## Rendimiento — Critical CSS

`theme/style.css` (Tailwind compilado) se carga de forma **asíncrona** para eliminar el render-blocking que detecta Lighthouse: el contenido above-the-fold se pinta con un CSS crítico inline generado en build time, y el stylesheet completo se activa en cuanto termina de descargarse (patrón *preload + swap*).

**Cómo funciona:**
- `node_scripts/generate-critical-css.js` usa el paquete [`critical`](https://github.com/addyosmani/critical) (Puppeteer) para extraer el CSS above-the-fold de dos perfiles de plantilla, renderizados contra el dev server local (`https://balanzia.dev/`) en viewport móvil y escritorio:
  - `home` → portada (con hero slider) → `theme/critical/home.css`
  - `default` → resto de plantillas (page/single/archive) → `theme/critical/default.css`
- `pictau_inline_critical_css()` (`theme/inc/template-functions.php`, hook `wp_head` prioridad `1`) imprime el critical CSS correspondiente inline en un `<style id="pictau-critical-css">`, eligiendo perfil con `is_front_page()`. Si el archivo no existe, no hace nada (no rompe el sitio).
- `pictau_async_style_loader_tag()` (`theme/functions.php`, filtro `style_loader_tag`) reescribe el `<link>` de `pictau-style` a `rel="preload" as="style" onload="this.rel='stylesheet'"`, con fallback `<noscript>` para JS deshabilitado.

**`theme/style.css` NO se recorta — el critical CSS es una copia, no una extracción.** `generate-critical-css.js` llama a `critical.generate()` con `inline: false` y **sin** `extract: true` (su valor por defecto). Esto significa que las reglas above-the-fold quedan duplicadas: aparecen tanto en `theme/critical/*.css` (inline en el `<head>`) como dentro del `style.css` completo que se carga después de forma asíncrona — el build de Tailwind es totalmente independiente del critical CSS, no sabe que existe. Es intencional: la propia librería `critical` avisa de que `extract: true` genera un CSS async **único por página** (rompe el cache compartido de `style.css?ver=...` entre páginas) y añade fragilidad de sincronización — con `inline: false` (nuestro caso) sería aún más delicado mantenerlo correcto en cada build. El coste de los pocos KB duplicados del above-the-fold es bajo comparado con esa complejidad.

**Scripts npm:**
```bash
npm run critical         # recompila tailwind (production, minify) + genera ambos perfiles
npm run critical:home    # solo portada
npm run critical:default # solo plantilla genérica
```
`npm run critical` **no** forma parte de `watch` (Puppeteer es demasiado lento para cada guardado). Se regenera automáticamente en dos puntos del workflow:
- **`git commit`** — `.githooks/pre-commit` lo ejecuta (junto con `npm run production`) siempre que el commit incluya cambios en `tailwind/`, `javascript/` o `postcss.config.js`, y añade `theme/critical/*.css` al propio commit. Si el commit no toca esos paths, no se regenera (no hace falta).
- **`npm run bundle`** — último paso de la secuencia `production → critical → zip`, incondicional, como red de seguridad antes de empaquetar/desplegar.

Antes de generar, se comprueba que el sitio local (`https://balanzia.dev/`) responde 200 (`node_scripts/lib/site-preflight.js`). Si está caído o en modo mantenimiento, falla rápido (<1s) con un **banner rojo** imposible de pasar por alto en vez de colgar Puppeteer varios minutos — y en el caso del `pre-commit`, **aborta el commit**. Si la generación termina bien, se imprime la contrapartida en **banner verde** (mismo módulo, `printSuccess()`) con el perfil, tamaño y URL usada — para que sea igual de evidente que el critical CSS se está generando activamente en este proyecto (recuerda que es una feature desactivable, ver abajo).

Tras desplegar o regenerar el critical CSS, **purgar la caché de WP Super Cache** (`wp-local cache flush` o desde el admin) para que no se sirva HTML cacheado con una versión antigua del `<style>` inline.

**Desactivar el critical CSS:**
- **Runtime (por sitio):** Personalizar > PICTAU > Rendimiento > "Activar critical CSS inline" (`theme_mod` `pictau_critical_css_enabled`, **activado por defecto**). Al desmarcarlo, `pictau_inline_critical_css()` no imprime el `<style>` y `pictau_async_style_loader_tag()` no reescribe el `<link>` — vuelve a la carga normal (bloqueante) del stylesheet completo, sin critical CSS de por medio (evita el FOUC que daría cargar de forma asíncrona sin un critical CSS de respaldo).
- **Build (por proyecto):** crear el fichero marcador `.critical-css-disabled` en la raíz del tema (`touch .critical-css-disabled && git add .critical-css-disabled && git commit`). Tanto `.githooks/pre-commit` como `generate-critical-css.js` (y por tanto `npm run bundle`) lo detectan y omiten la generación sin fallar. Para reactivar, borrar el archivo y commitear. Recomendado para proyectos forkados de este tema que no quieran usar critical CSS: mantiene el código del framework idéntico entre proyectos, sin tener que borrar nada.

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
| `marquee.js` | Cinta infinita de logos con scroll horizontal. Atributo: `data-marquee`. |
| `animation_any.js` | Animaciones de entrada con GSAP + ScrollTrigger. Atributo: `data-anim_any`. |
| `parallax.js` | Efecto parallax vertical. Atributo: `data-parallax="<depth>"`. |
| `navigation_dot.js` | Navegación lateral por puntos para páginas one-page. Atributo: `data-dotnav`. |
| `ModalWP.js` | Clase genérica de modal (OverlayScrollbars). Construye la estructura DOM del modal a partir de cualquier elemento pasado por constructor. No conoce `data-modalform`; solo lee `data-modal` como fallback de ID. Ver [Modales con formulario (Contact Form 7)](#modales-con-formulario-contact-form-7--modalwpjs--modalcontactform7js). |
| `modalContactForm7.js` | Consumidor de `ModalWP.js` para modales con formulario CF7 disparados por click. Atributos: `data-modalform`, `data-modalform_target`, `data-modalform_input_name`, `data-modalform_input_data`. |
| `contactForm7.js` | Eventos de formularios CF7 (validación, envío, checkboxes/radios custom). También usa `ModalWP.js` (sin formulario) para mostrar el mensaje de éxito tras el envío. |
| `fluentbooking_timezone_dropdown_upward.js` | Posiciona el desplegable de zona horaria de FluentBooking (arriba o abajo del trigger según el espacio disponible). |
| `scrollToAName.js` | Scroll suave (Lenis/GSAP) al hacer click en enlaces `<a href="#ancla">` de la propia página, y al cargar con un hash en la URL. Ver [Dashboard de reservas de FluentBooking (frontend) — compatibilidad](#dashboard-de-reservas-de-fluentbooking-frontend--compatibilidad) para el caso de apps con rutas tipo SPA en la misma página. |

Librerías: GSAP + ScrollTrigger, Splide, OverlayScrollbars, Split Type, CountUp.js

---

## Dashboard de reservas de FluentBooking (frontend) — compatibilidad

FluentBooking Pro puede generar una página en el frontend (slug configurable en sus ajustes, p.ej. `/bookings`) con un dashboard tipo SPA (rutas con hash: `/bookings#/`, `/bookings#/calendars`...) donde cada usuario dado de alta ve sus propias reservas. Dos problemas de compatibilidad detectados y arreglados:

### 1. `scrollToAName.js` rompía la navegación por click del dashboard

**Síntoma:** clickar en las pestañas del dashboard (Calendarios, Reservas, Disponibilidad...) no navegaba — la URL no cambiaba y no había ningún error nuevo en consola. Cambiar el hash a mano con JS (`window.location.hash = '#/calendars'`) sí funcionaba, confirmando que el router de la SPA estaba bien.

**Causa:** `scrollToAName.js` trataba cualquier `<a href="...#algo">` que apuntara al mismo origin+pathname como "ancla nuestra", y le hacía `preventDefault()` **incondicionalmente** antes de comprobar si el destino existía. Los enlaces de navegación internos del dashboard (`https://sitio.com/bookings#/calendars`) tienen el mismo origin+pathname que la página actual (`/bookings`), así que encajaban como "misma página" — el `preventDefault()` bloqueaba el cambio nativo de `location.hash` del navegador, que es justo lo que el router de la SPA necesita (no hace falta ni JS propio para eso: cambiar solo el hash de la URL es un comportamiento nativo del navegador si no se previene el click).

**Fix:** antes de interceptar un click "a la misma página", ahora se comprueba primero que el destino sea `top` o un elemento que exista de verdad en la página — mismo criterio que ya usaba el otro caso del módulo ("enlace a otra URL"). Si no hay coincidencia, no se adjunta ningún listener y el click sigue su comportamiento nativo.

De paso, esto también evitó un segundo bug relacionado: al cargar `/bookings#/`, el módulo intentaba `document.querySelector('#/')` para hacer scroll al hash de la URL — `#/` no es un selector CSS válido, lanzaba `SyntaxError`. Ahora `document.querySelector()` va envuelto en un `safeQuerySelector()` con try/catch en los 3 sitios del módulo donde se usa, tratando cualquier hash no válido como selector igual que "no existe el ancla" en vez de romper la carga de la página. Esto es una corrección general, no específica de FluentBooking — cualquier URL con enrutado tipo SPA basado en hash (React Router, Vue Router, etc.) habría roto lo mismo.

Verificado con Playwright: las 4 pestañas del dashboard navegan correctamente por click, cada una cambiando la URL como corresponde.

### 2. Banner de cookies (GDPR Cookie Compliance) sin estilos en el dashboard

**Síntoma:** el banner de consentimiento de cookies aparecía al final de la página del dashboard, con los checkboxes/botones nativos del navegador, sin ningún estilo aplicado.

**Causa:** FluentBooking Pro renderiza este dashboard con una plantilla propia (`app/Views/front-app.php`) que sí llama a `wp_head()`/`wp_footer()`, pero en un **"modo sin conflictos"** deliberado: en `wp_print_styles` (prioridad 999999) recorre todos los estilos ya encolados y desencola cualquiera cuyo origen sea un plugin o el tema activo, salvo que coincida con una lista blanca de slugs (por defecto solo `fluent-crm`/`fluent-booking`/`fluent-booking-pro`) — ver `FluentBooking\App\Hooks\Handlers\AdminMenuHandler::enqueueAssets()`. Es intencional por su parte, para que el CSS del sitio no rompa el diseño de su propio dashboard admin-style. El CSS del tema queda correctamente excluido (no se toca), pero el CSS del plugin GDPR Cookie Compliance también caía — y su banner sí se imprime (vía `wp_footer`, un hook distinto al que hace el barrido), así que aparecía sin estilos.

**Fix:** [theme/inc/fluentbooking-compat.php](theme/inc/fluentbooking-compat.php) engancha el filtro que el propio plugin expone para esto (`fluent_booking/asset_listed_slugs`) y añade el plugin GDPR a la lista blanca — sin tocar código de terceros ni afectar al resto de la exclusión.

Verificado con Playwright (cookies borradas para forzar que el banner aparezca): el banner sale con sus estilos normales, igual que en el resto del sitio.

### 3. `global_admin.js` — bug de FluentBooking, no arreglable desde el tema

El bundle de administración del plugin lanza `Cannot read properties of null (reading 'getAttribute')` en todas las páginas del dashboard: busca `document.getElementById('fcal_server_timestamp')`, un elemento que su plantilla de wp-admin real inyecta en el pie de página (`AdminMenuHandler::changeFooter()`, vía los filtros `admin_footer_text`/`update_footer`) para mostrar un reloj de "hora del servidor" — pero ese elemento nunca se renderiza en `front-app.php`, la plantilla que usa este dashboard de frontend. No bloquea nada funcional (script aparte, con su propio IIFE, no relacionado con el router de la app), solo ensucia la consola. Reportado como pendiente de arreglar por FluentBooking, no parcheable de forma robusta desde el tema (JS minificado de terceros).

---

## Compatibilidad de scroll con widgets de terceros (Lenis) — `prevent` + `NESTED_SCROLL_SELECTOR`

Lenis (`javascript/modules/smooth_scroll.js`) intercepta la rueda del ratón/touch de toda la página para su scroll suavizado. Cualquier widget de terceros con su propio scroll interno (dropdowns, listas largas, modales) necesita que Lenis le ceda el control del evento, o Lenis se queda con él y el scroll interno del widget no funciona.

**Caso detectado:** el widget del plugin [FluentBooking](https://wordpress.org/plugins/fluent-booking/) (shortcode `[fluent_booking id="..."]`) — la lista de horas (`.fcal_slot_picker`, renderizada con Svelte) quedaba bloqueada: la rueda del ratón no hacía scroll dentro del widget.

**Intento 1 (retirado): `data-lenis-prevent` en todo el wrapper.** Un módulo `fluentbooking_lenis_fix.js` añadía `data-lenis-prevent` a `.fluent_booking_app` (el contenedor exterior del widget) en `DOMContentLoaded`. Arreglaba el scroll interno, pero causaba **saltos de scroll en toda la página** al pasar la rueda por el widget — reportado como "saltos raros" al cruzar el punto donde se oculta el above-header, aunque no tenía relación con el header: coincidía porque el widget caía en esa misma zona de scroll. Causa: `.fluent_booking_app` es mucho más grande que la única zona con overflow real (`.fcal_slot_picker`) — al pasar el ratón por las partes del wrapper *sin* overflow, Lenis soltaba igualmente el control del wheel (`data-lenis-prevent` no distingue si el nodo puede scrollear o no), pero al no haber ningún contenedor que absorbiera ese scroll nativo, el evento sin `preventDefault()` acababa moviendo `window.scrollY` por detrás de Lenis. Su loop en RAF seguía animando hacia el `targetScroll` ya desincronizado y, al recuperar el control, saltaba de golpe a esa posición obsoleta.

**Intento 2 (retirado): `allowNestedScroll: true`.** Opción nativa de Lenis: en cada wheel/touch comprueba, nodo a nodo por el `composedPath()` completo del evento, si tiene overflow real (`computedStyle.overflowY` + `scrollHeight > clientHeight`, cacheado 2s por nodo) antes de cederle el control. Soluciona el bug de arriba (solo cede cuando el nodo puede absorber el scroll de verdad) y no requiere marcar nada a mano. Pero la propia documentación de Lenis avisa: *"Can create performance issues since it checks the DOM tree on every scroll event"* — y aquí no es un caso teórico: el markup de bloques de Gutenberg anida bastante (un `<h1>` normal dentro de un `header.entry-header` está a ~12 niveles de `<body>`), así que cada wheel event de un scroll normal de página, en cualquier parte, paga ese coste por nodo (`getComputedStyle` + lectura de `scrollHeight`/`clientHeight`, que fuerza layout si el cache de 2s ha expirado) — no solo cerca de un widget con scroll propio.

**Fix actual: `prevent` con selector explícito.** `prevent: node => node.matches?.(NESTED_SCROLL_SELECTOR) && node.scrollHeight > node.clientHeight` en la config de Lenis. Usa la misma señal que `allowNestedScroll` (se llama nodo a nodo por el mismo `composedPath()`) pero mucho más barata: primero un `.matches()` contra `NESTED_SCROLL_SELECTOR` (comparación de selector, no fuerza layout) que descarta al instante la inmensa mayoría de nodos del árbol, y solo mide overflow real en los contenedores que sí están en la lista — misma seguridad que `allowNestedScroll` (nunca cede el control si el contenedor no tiene overflow en ese momento, evitando la fuga hacia `window.scrollY` del intento 1) sin pagar el coste en el resto de la página.

`NESTED_SCROLL_SELECTOR` (constante al principio de `smooth_scroll.js`) mantiene la lista de contenedores conocidos con scroll propio — **siempre el contenedor real con overflow, nunca un wrapper más grande** (esa fue la causa del intento 1):
- `[data-overlayscrollbars-viewport]` → viewport interno que crea OverlayScrollbars al inicializarse sobre un `<div>` normal (`ModalWP.js`, `setOverlayScrollbars`). **No** aplica al `OverlayScrollbars(document.body, ...)` de `setScrollBars()` en `script.js`: ese usa el modo especial para `<html>`/`<body>` que preserva el scroll nativo del documento sin crear un viewport propio (verificado con Playwright: solo existen 2 nodos con este atributo en toda la página, ambos dentro de modales).
- `.fcal_slot_picker` → lista de horas de FluentBooking.
- `.svelte-select-list` → lista del desplegable de zona horaria de FluentBooking (componente Svelte Select). Vive en un subárbol del DOM distinto a `.fcal_slot_picker` (cuelga de `.fcal_timezone_select`, no de `.fcal_calendar_slot_wrap`), así que hace falta como entrada aparte. Es la clase estable que asigna la librería; el sufijo hash tipo `svelte-82qwg8` que la acompaña en el DOM sí puede cambiar entre builds del plugin, por eso no forma parte del selector.
- `.main-modal-content` → panel del modal de cookies del plugin GDPR Cookie Compliance.

**`data-lenis-prevent` ya no se usa en ningún sitio del tema.** Tanto `ModalWP.js` como el modal de cookies GDPR (`smooth_scroll.js`) llaman a `lenis.stop()` mientras están abiertos, así que Lenis no anima nada de por sí; su fallback nativo cuando está `isStopped` es `event.preventDefault()` salvo que el `prevent` de arriba diga lo contrario — exactamente lo que hacía falta: el contenido interno sigue scrolleando, y el resto del overlay (backdrop, icono de cerrar) queda bloqueado sin que la página se mueva detrás. Verificado con Playwright: scroll interno intacto en los tres casos (FluentBooking, modal, y el scroll normal de página a través del punto donde se oculta el above-header), `window.scrollY` no se mueve nunca por detrás de ninguno de los tres.

**Añadir un widget nuevo con scroll interno:** localizar el contenedor real con `overflow: auto/scroll` (no el wrapper que lo envuelve) y añadirlo a `NESTED_SCROLL_SELECTOR`. Si el contenido se genera 100% por JS y tarda en montar su overflow, comprobar primero que el selector ya existe en el DOM a tiempo del primer wheel event; si no, usar un `MutationObserver` como en `fix_chatbot_meow_lenis.js`.

---

## Modales con formulario (Contact Form 7) — `ModalWP.js` / `modalContactForm7.js`

Sistema de modales disparados por click para alojar un formulario de Contact Form 7, sin depender de plugins de terceros.

**`ModalWP.js`** es una clase de modal genérica y agnóstica al formulario: recibe un `targetDOMElement` y un `config` (`id`, `nested`, `form`, `onclose`, `autoclose`) y construye la estructura DOM (backdrop, wrapper con `OverlayScrollbars`, botón de cierre). No escanea el documento por sí misma.

**`modalContactForm7.js`** es el módulo consumidor que detecta los modales y sus disparadores:

- El **modal** es cualquier elemento con `data-modalform="<id>"`.
- El **disparador** (botón/enlace) necesita `data-modalform_target="<id>"` para abrir el modal cuyo ID coincida.
- Opcionalmente, el disparador puede pasar datos al formulario contenido en el modal:
  - `data-modalform_input_name="<name del input hidden>"`
  - `data-modalform_input_data="<valor a asignar>"`, que admite tags de plantilla `{{title}}` (título del `<h1>` del documento), sustituidos vía `replaceTemplateTags`.
- Ambos atributos de datos son **opcionales**: si el formulario no necesita input hidden (formulario genérico), el disparador puede omitirlos y el modal se abre igualmente sin tocar el formulario.
- Al cerrar el modal, el input hidden rellenado se resetea a vacío (`resetPassedDataToForm`).

Ejemplo de uso (ver `theme/inc/catalog.php`):

```php
<div data-modalform_input_name="producto" data-modalform_input_data="Información sobre {{title}}" data-modalform_target="lead">
	<a href="#modal-lead">Solicita información</a>
</div>
```

`contactForm7.js` usa `ModalWP.js` de forma independiente (sin `form: true`) para mostrar el mensaje de confirmación/error tras el envío del formulario, no como modal disparado por click.

**Foco automático al mostrar un formulario:** cuando la modal se crea con `{ form: true }` (caso de `modalContactForm7.js`), `show()` mueve el foco al primer campo focuseable y visible del formulario (excluye ocultos, como el input real — `display:none` — de checkboxes/radio personalizados). No aplica a los modales de mensaje OK/error, que se crean sin `form: true`.

**`setModalContent()` mueve nodos reales, no clona por `innerHTML`:** el contenido se traslada al popup con `appendChild` de los hijos reales del nodo origen (no `popupContent.innerHTML = node.innerHTML`). Esto es necesario porque `contactForm7.js` decora los checkboxes/radio (iconos accesibles, listeners de teclado) **antes** de que la modal mueva el formulario a su contenido — un clonado vía `innerHTML` serializa y reparsea el HTML, preservando atributos (`role`, `aria-checked`, `tabindex`) pero destruyendo cualquier listener añadido con `addEventListener`. Mover los nodos reales conserva esos listeners intactos.

**Icono de cerrar (`.icon-close`) accesible por teclado:** es un `<div>`, no un `<button>`, así que recibe `role="button"`, `tabindex="0"` y `aria-label="Cerrar"` en `setupModal()`, más un listener `keydown` propio (`Space`/`Enter`) en `setupModalCloseLinks()` para activarlo — un `<div>` no dispara `click` automáticamente con esas teclas. Al estar en el DOM justo después del contenido del formulario, el tabulador lo alcanza como último elemento del recorrido. Esto aplica a **cualquier** instancia de `ModalWP` (mismo código en la clase), incluida la modal de mensaje de error/éxito que `contactForm7.js` reutiliza tras un fallo de validación.

**Focus trap (`setupFocusTrap()`):** el foco nunca sale de la modal mientras está abierta. En el keydown `Tab` sobre `this.modal`, si el foco está en el último elemento focuseable (normalmente `.icon-close`) el tabulador vuelve al primero; con `Shift+Tab` en el primero, va al último. La lista de elementos focuseables se recalcula en cada pulsación (no se cachea), ya que el contenido de la modal puede cambiar (`setModalContent()`).

---

## Accesibilidad de teclado en checkboxes/radio personalizados (`contactForm7.js`)

Los checkboxes y radio buttons de CF7 se estilizan ocultando el `<input>` real (`display:none`, ver `tailwind/custom/components/forms.css`) e inyectando un `<span class="check-icon-container"|"radio-icon-container" role="checkbox"|"radio" tabindex="0" aria-checked="...">` con los SVGs de estado. El estado visual (marcado/desmarcado) lo gestiona CSS puro vía `:has(:checked)`, sin JS adicional.

- **Barra espaciadora**: `enableSwitchBySpacebar(focusedElement, inputTarget)` recibe una referencia directa al `<input>` real (nunca se busca por `closest()`/`querySelector()`, frágil ante cambios de estructura). Para checkboxes alterna el valor; para radios, solo lo marca (nunca lo desmarca al repetir espacio, igual que el comportamiento nativo) y dispara un evento `change` para mantener consistencia con CF7 (revalida en `change`, igual que con un clic nativo).
- **`aria-checked`** se mantiene sincronizado tanto al usar teclado como al marcar con el ratón (listener `change` en el input real). En radio buttons, al seleccionar uno se resincroniza `aria-checked` de todo el grupo (los demás pasan a `false`).
- El checkbox de aceptación legal (`.pct-legal-acceptance`) sigue el mismo mecanismo; su `<label class="checkIcon">` recibe la referencia al input directamente en vez de intentar localizarlo por estructura DOM (antes fallaba: el label se crea como hermano del input, no como envoltorio).
- **Nombre accesible**: `check-icon-container` tiene `role="checkbox"` pero su propio subárbol solo contiene los SVG de estado (sin texto), así que un lector de pantalla no anunciaba nada al llegar a él (detectado por Lighthouse: "ARIA toggle fields do not have accessible names"). Se captura el texto de `.wpcf7-list-item-label` antes de insertar el icono como hermano, y se aplica como `aria-label` del icono.

---

## Dimensiones explícitas en imágenes del footer (`pictau_add_missing_image_dimensions`)

El contenido del footer viene de un "Pictau Block" editado en wp-admin (`get_theme_mod('pictau_block_footer')`, renderizado en `theme/template-parts/layout/footer-content.php`), así que sus `<img>` no pasan por ningún control del tema — si se insertan sin `width`/`height` explícitos, Lighthouse lo marca ("Image elements do not have explicit width and height") y puede provocar CLS.

En vez de editar el contenido del bloque en la BD, `pictau_add_missing_image_dimensions()` (`theme/inc/template-functions.php`) post-procesa el HTML ya renderizado del footer: para cada `<img>` sin `width`/`height`, resuelve su `src` a la ruta de fichero local (`pictau_url_to_local_path()`) y calcula las dimensiones reales con `getimagesize()`. Las imágenes que ya traen `width`/`height` no se tocan. Coste medido: ~0,04 ms por ejecución sobre el contenido real del footer — irrelevante, y en la práctica solo corre en un *cache miss* si hay page cache activo.

Portado desde `qlik-para-pymes` (2026-08-05), donde resolvió el mismo aviso de Lighthouse para los logos de partners del footer.

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

### Favicon SVG claro/oscuro (`priority: 30`)

Sección **Favicon SVG**, implementada en `favicon_customizer()` / `add_favicon_to_head()` (`theme/inc/template-functions.php`).

Permite subir dos variantes del favicon — icono negro para modo claro (`favicon_svg`) e icono blanco para modo oscuro (`favicon_svg_dark`) — y el navegador elige automáticamente cuál mostrar según el `prefers-color-scheme` del sistema operativo del visitante, sin JS.

**Funcionamiento:**
- Cada variante sube un `.svg`; si además existe un `.png` con el **mismo nombre de archivo** (subido por separado a la Biblioteca de medios), se sirve también como `<link rel="icon" type="image/png" sizes="32x32">` — fallback para navegadores sin soporte de SVG en el favicon.
- Si solo se rellena una variante, se sirve sin atributo `media` (favicon único, sin cambio de tema).
- Si se rellenan ambas, cada `<link>` incluye `media="(prefers-color-scheme: light|dark)"` — soportado de forma fiable en Firefox y Safari; en navegadores basados en Chromium se aplica en la carga inicial de la pestaña, pero no siempre se re-evalúa en caliente si el usuario cambia el tema del SO con la pestaña ya abierta (limitación conocida del motor, no del tema).
- En cuanto se rellena alguna variante, se desactiva el Site Icon nativo de WordPress (`remove_action('wp_head'/'admin_head'/'login_head', 'wp_site_icon', 99)`) para evitar `<link rel="icon">` duplicados/en conflicto.
- `add_favicon_to_head()` también se engancha a `login_head`, así que la pantalla de login (`wp-login.php`) muestra el mismo favicon claro/oscuro en vez del icono por defecto de WordPress.

### Seguridad (CSP) — cabeceras Content-Security-Policy

Desde **v7.12.0**. Sección `Apariencia → Personalizar → THEME CUSTOMIZER → Seguridad (CSP)`, implementada en `theme/inc/customizer-csp.php` (clase `Pictau_CSP_Manager`) + `theme/inc/customizer-csp-control.php` (control custom del Customizer) + `theme/customizer/csp-control.js`.

Permite activar y editar la cabecera `Content-Security-Policy` (y cabeceras de seguridad adicionales: `X-Content-Type-Options`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`, `Permissions-Policy`, `Strict-Transport-Security`) escritas directamente en el `.htaccess` de la raíz del sitio, sin depender de un plugin PHP (evita el problema de cabeceras que desaparecen con plugins de caché de página — ver la sección de CSP en `CLAUDE.md`).

**Funcionamiento:**
- **Opt-in explícito**: la casilla "Activar gestión de cabeceras CSP" solo revela el editor; no escribe nada por sí sola.
- Al abrir el editor, si ya existen directivas CSP del tema en el `.htaccess` se muestran para editar; si no existen, se muestra la plantilla por defecto del tema (dominios confirmados en el código: YouTube/Vimeo para embeds de vídeo, Google Tag Manager (en `script-src` para el script, y también en `img-src` para su beacon de imagen `/td`, fallback de Measurement Protocol/GA4 — sin esto el navegador bloquea esa petición aunque `script-src` ya permita cargar el script); más GA4 — `analytics.google.com` y `*.google-analytics.com` (con wildcard, porque GA4 reparte la medición entre subdominios regionales como `region1.google-analytics.com` según la localización del visitante) — incluido por defecto en `connect-src` aunque no esté hardcodeado en el tema, porque GTM suele cargarlo en runtime) — pero **no se guarda nada hasta pulsar "Aplicar cambios"**.
- La plantilla por defecto añade también, en `img-src`/`style-src`/`script-src`/`font-src`, las variantes con y sin `www.` del dominio propio del sitio (calculadas en runtime a partir de `home_url()`, nunca hardcodeadas). Esto cubre páginas que puedan servirse en cualquiera de los dos hosts sin pasar por el bootstrap/redirección canónica normal de WordPress (p. ej. una página de mantenimiento estática) — sin esto, `'self'` no cubre el host "equivocado" y se bloquean imágenes/CSS/JS/fuentes del propio sitio. Esta plantilla **no** implementa ninguna redirección canónica apex↔www por su cuenta — es responsabilidad de cada instalación, vía `.htaccess`, si así lo requiere (no todos los clientes usan `www.` o el mismo esquema).
- Botón **"Usar valores por defecto del tema"** repone la plantilla en el textarea.
- Botón **"Aplicar cambios"**: valida el contenido contra una whitelist estricta de directivas (`Header`, `<IfModule mod_headers.c>`, `SetEnvIf`, comentarios y líneas vacías — cualquier otra directiva, como `RewriteRule` o `php_value`, se rechaza), comprueba que no haya directivas de cabecera ya existentes en el `.htaccess` fuera del bloque del tema (si las hay, rechaza aplicar hasta que se resuelvan a mano, para evitar cabeceras duplicadas/en conflicto), crea una copia de seguridad (opción en BD + fichero físico `.htaccess.pictau-bak`), escribe el bloque (marcador `# BEGIN/END Pictau CSP`, vía `insert_with_markers()` de WordPress), hace una **auto-verificación** (petición HTTP interna a la home) y, si tiene éxito, dispara automáticamente el botón "Publicar" del Customizer para que no queden cambios sin guardar. Si el sitio deja de responder correctamente (error 500 real de Apache), se **revierte automáticamente** al contenido anterior.
- Botón **"Restaurar backup anterior"** (visible si hay copia de seguridad) revierte manualmente.
- Al desmarcar la casilla y pulsar "Publicar" en el Customizer, se elimina de verdad el bloque CSP del `.htaccess` (marcadores incluidos, sin dejar comentarios residuales) — mismo backup + auto-verificación.
- El bloqueo de métodos `TRACE`/`TRACK` (marcador independiente `# BEGIN/END Pictau Security Rules`) se aplica una única vez, de forma fija y no editable, la primera vez que se aplica una política — deliberadamente fuera del textarea editable para no tener que permitir `RewriteRule` en la whitelist, y permanece aunque luego se desactive la CSP (hardening sin downside).
- Avisos en wp-admin (`admin_notices`, para `manage_options`) si: la CSP está "activada" en BD pero no aplicada en el `.htaccess` de este servidor (típico tras un restore de solo BD, p.ej. UpdraftPlus, en una migración), o si se detectan directivas de cabecera ajenas al tema fuera de su bloque.
- Solo disponible para usuarios con capability `manage_options`, con nonce dedicado (`pictau_csp_action`) distinto del nonce estándar del Customizer.

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

### Personalización desde el Customizer: color y logo del email

Apariencia → Personalizar → THEME CUSTOMIZER → **CF7 emails** (sección visible solo si Contact Form 7 está activo, implementada en `theme/inc/cf7-email-branding.php` + `theme/inc/cf7-email-branding-control.php` + `theme/customizer/cf7-email-branding-control.js`). Permite sobreescribir, sin tocar código:

- **Color de fondo** (`cf7_email_brand_color`, hex): usado tanto en la cabecera como en el pie del email — un único color compartido, no configurables por separado. Si no se ha guardado ningún valor, cae al valor por defecto `#19222a`.
- **Logo del email** (`cf7_email_logo`, media uploader nativo de WordPress): si no se selecciona ninguno, se usa el mismo logo general del sitio (Identidad del sitio → `custom_logo`), incluyendo el mismo pipeline automático SVG → PNG descrito arriba. Si la URL guardada no resuelve a un adjunto local (p. ej. tras una migración de sitio), también cae al logo general.
- **Vista previa en vivo**: dentro del propio panel del Customizer se muestra un bloque con el color y el logo elegidos (o los heredados por defecto), actualizándose al instante al cambiar cualquiera de los dos valores, sin necesidad de guardar ni de mirar el iframe de previsualización del sitio. Si el logo efectivo es un SVG, la vista previa muestra el **PNG realmente generado para el email** (mismo `pct_cf7_get_effective_email_logo_image()` que usa el envío real), no el SVG original — así el color forzado por `pct_cf7_email_logo_color` (blanco por defecto) es visible tal cual se verá en el email. El renderizado inicial del control (`theme/inc/cf7-email-branding-control.php`) resuelve esto en PHP; al cambiar el logo en vivo desde el media uploader, el JS del control no puede generar el PNG por sí mismo (requiere Imagick/binarios en servidor) y pide la resolución vía `admin-ajax.php` (`wp_ajax_pct_cf7_resolve_email_logo_preview` en `theme/inc/cf7-email-branding.php`), cacheando el resultado por URL para no repetir la petición.
- **Aviso de formato no seguro para Outlook**: si el logo efectivo (el elegido para el email, o el `custom_logo` general si no se ha elegido ninguno) no está en JPG, PNG o WEBP, aparece un aviso bajo la vista previa:
  - Si es SVG y el servidor puede convertirlo automáticamente (ver pipeline arriba): aviso informativo confirmando que se generará un PNG.
  - Si es SVG y el servidor **no** puede convertirlo (sin Imagick ni binarios): aviso de advertencia pidiendo subir manualmente una versión JPG/PNG/WEBP — más visible que el aviso genérico de `admin_notices` que ya existía para este mismo caso, porque aparece justo donde se elige el logo.
  - Cualquier otro formato no recomendado: mismo aviso de advertencia.

Funciones públicas de resolución (`theme/inc/cf7_html_email_templates.php`), reutilizables si se necesita el mismo color/logo/aviso del email en otro contexto:

```php
pct_cf7_get_email_brand_color();            // string, hex
pct_cf7_get_email_logo_attachment_id();     // int, attachment ID (0 si no hay ninguno resoluble)
pct_cf7_get_email_logo_format_warning($id); // null, o ['level' => 'info'|'warning', 'message' => string]
```

### Último fallback: sin logo utilizable → `<h1>` con el nombre del sitio

Si no hay logo configurado, o es SVG y no se pudo generar/encontrar un PNG (servidor sin Imagick ni binarios de conversión disponibles), el header del email muestra `<h1>{nombre del sitio}</h1>` en vez de una imagen rota. Usa el mismo color configurable (`pct_cf7_email_logo_color`) y la tipografía del resto de la plantilla.

### Aviso en el admin

Si el servidor no puede generar el PNG (sin Imagick ni binarios de conversión disponibles), aparece un aviso en el panel de administración (visible solo para `manage_options`) indicando que hay que subir manualmente un PNG junto al SVG del logo, con el sufijo `-email.png`. El estado se cachea en un transient (`pct_cf7_email_logo_png_unsupported`, 12h) para no reintentar la generación en cada email enviado.

### Auto-tracking: UTM/GCLID y URL real de la página (`[pagina_url]`)

El tema inyecta automáticamente, vía el filtro `wpcf7_form_hidden_fields`, un conjunto de hidden fields en **todos** los formularios CF7 del sitio sin necesidad de añadir `[hidden ...]` en la pestaña Formulario:

- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `gclid`, `fbclid`, `msclkid` — precargados en servidor desde `$_GET` (min/MAYÚS) y sobrescritos en cliente (`wp_footer`) desde `window.location.search`, inmune a caché de página.
- `pagina_url` — la URL completa de la página que aloja el formulario, precargada en servidor desde `$_SERVER['REQUEST_URI']` y sobrescrita en cliente desde `window.location.href`.

Un filtro adicional en `wpcf7_posted_data` garantiza que estos campos lleguen a `get_posted_data()` aunque CF7 (5.8+) no los incluya automáticamente por venir de `wpcf7_form_hidden_fields` y no de un tag declarado en el Formulario.

**`[pagina_url]` sustituye al special mail tag `[_url]` de CF7**, que no es fiable: desde que CF7 envía los formularios vía REST API (fetch a `/wp-json/contact-form-7/v1/contact-forms/{id}/feedback`), `[_url]` solo funciona si el navegador envía `HTTP_REFERER` y coincide con `home_url()` (`WPCF7_Submission::get_request_url()`); si falla esa condición, cae al URI de la propia petición REST y `[_url]` devuelve la URL del endpoint `feedback` en vez de la página del formulario. Usar siempre `[pagina_url]` en las plantillas de correo, nunca `[_url]`. La pestaña "Plantilla Base" (ver abajo) ya lo usa por defecto.

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

El panel y sus botones funcionan tanto al editar un formulario existente como en la pantalla **"Añadir nuevo"** de CF7 (el script se encola comprobando que `$screen->id` contiene `wpcf7`, no una comparación exacta contra `toplevel_page_wpcf7`, ya que ambas pantallas tienen screen ids distintos).

### Página Polylang > String Translations

Cuando se filtra por el grupo "Contact Form 7 Error Messages", aparece un aviso con el botón **"Importar mensajes de error desde CF7"** que ejecuta la misma importación masiva para todos los idiomas configurados en Polylang.

### Archivos `.mo` de CF7

La importación busca los archivos `.mo` de CF7 en:
1. `WP_LANG_DIR/plugins/contact-form-7-{locale}.mo`
2. `WP_PLUGIN_DIR/contact-form-7/languages/contact-form-7-{locale}.mo`

Para locales no ingleses, construye un mapa inverso (traducción → msgid inglés) para poder buscar correctamente en el `.mo` del idioma destino.

---

## Contact Form 7 — Pestaña "Plantilla Base" (`theme/inc/cf7-form-template.php`)

Añade una pestaña **Plantilla Base** en el editor de CF7 (al mismo nivel que Formulario/Correo/Mensajes), cargada condicionalmente desde `theme/inc/utilities.php` solo si CF7 está activo.

Contiene un botón **"Rellenar con plantilla base"** que, sin necesidad de guardar ni recargar, rellena directamente:

- El textarea de la pestaña **Formulario** (`#wpcf7-form`).
- El textarea de **Cuerpo del mensaje** de la pestaña Correo (`#wpcf7-mail-body`, solo Mail 1).
- El textarea de **Cabeceras adicionales** de la pestaña Correo (`#wpcf7-mail-additional-headers`, solo Mail 1), con `Reply-To: [email]`. CF7 precarga por defecto `Reply-To: [your-email]` en formularios nuevos, pero el campo de email de esta plantilla se llama `[email]`, no `[your-email]` — sin este ajuste el Reply-To quedaría roto (apuntando a un campo inexistente).
- Los campos **Para** (`#wpcf7-mail-2-recipient`), **Asunto** (`#wpcf7-mail-2-subject`) y **Cuerpo del mensaje** (`#wpcf7-mail-2-body`) de **Correo (2)** (autorespuesta al remitente), aunque su casilla "Usar correo electrónico (2)" no esté marcada — así queda listo por si se activa más adelante. El campo **De** de Correo (2) (`#wpcf7-mail-2-sender`) y la propia casilla de activación (`#wpcf7-mail-2-active`) nunca se tocan: el primero se deja con el valor automático que ya trae CF7, la segunda la decide el usuario.

Si el formulario o el correo (incluido Correo (2)) ya tienen contenido, pide confirmación antes de sobrescribir; las cabeceras adicionales se rellenan siempre que exista el campo (no forman parte de esa comprobación de confirmación).

El contenido de la plantilla está hardcodeado en varios métodos privados del propio archivo (`get_form_template()`, `get_mail_template()`, `get_mail_additional_headers()`, `get_mail_2_recipient()`, `get_mail_2_subject()` y `get_mail_2_body()`) — es una copia del formulario **"Lead"** (post 76992, hash `b3cd5c0`, el que alimenta el modal `lead` del sitio). Para actualizar la plantilla cuando ese formulario cambie, basta con volver a copiar su contenido en esos métodos.

**Accesibilidad:** el campo `[select* empleados class:pct-select first_as_label ...]` no tiene ningún `<label>` HTML asociado (Lighthouse: "Select elements do not have associated label elements") — CF7 no soporta un atributo `aria-label:"..."` genérico en las opciones del tag (comprobado en `modules/select.php` del propio plugin, solo procesa `class`, `id`, `tabindex`, `autocomplete`, `size`, etc.). El fix es un `<label for="pct-select-empleados" class="sr-only">Empleados</label>` justo antes del shortcode, con `id:pct-select-empleados` añadido al `[select*]` para que el `for` apunte al id real. **Importante:** este `<label>` solo llega a formularios ya creados si se vuelve a pulsar "Rellenar con plantilla base" — editar este método no actualiza retroactivamente el contenido ya guardado en la BD del formulario CF7 (mismo criterio que el resto de esta plantilla).

El pie del correo (Mail 1) usa `[pagina_url]`, no el special mail tag `[_url]` de CF7 (poco fiable en envíos vía REST API — ver [Auto-tracking: UTM/GCLID y URL real de la página](#contact-form-7--plantilla-html-de-email-compatibilidad-outlook)). Al copiar contenido de un formulario existente a esta plantilla, sustituir siempre `[_url]` por `[pagina_url]` si aparece.

**Botón "Rellenar con plantilla base Multiidioma"** — visible únicamente si Polylang está activo (`function_exists('pll_register_string')`, mismo criterio que `cf7-polylang.php`). Hace lo mismo que el botón base, pero con una plantilla distinta (`get_form_template_multilang()` / `get_mail_template_multilang()` / `get_mail_2_subject_multilang()` / `get_mail_2_body_multilang()`): misma base que la plantilla "Lead" del botón anterior, con los textos de la pestaña Formulario y de Correo (2) envueltos en `{llaves}` para que la pestaña Polylang del editor los detecte y registre como strings traducibles automáticamente. El cuerpo de Mail 1 no lleva llaves porque es la notificación interna al admin del sitio (no se traduce); el de Correo (2) sí, porque es la autorespuesta que recibe el propio lead/visitante y debe mostrarse en su idioma. Las cabeceras adicionales (`get_mail_additional_headers()`) y el destinatario de Correo (2) (`get_mail_2_recipient()`, `[email]`) son comunes a ambos botones, no llevan texto traducible.

Disponible tanto al editar un formulario existente (`admin.php?page=wpcf7&post=X&action=edit`) como en la pantalla **"Añadir nuevo"** (`admin.php?page=wpcf7-new`) — el script se encola comprobando que `$screen->id` contiene `wpcf7`, en vez de una comparación exacta contra `toplevel_page_wpcf7`, porque ambas pantallas usan screen ids distintos.

---

## Contact Form 7 — Pestaña "Seguimiento GA4 / GTM" (`theme/inc/cf7-ga-tracking.php`)

Añade una pestaña **Seguimiento GA4 / GTM** en el editor de CF7 para activar, por formulario, el envío de eventos a `window.dataLayer` (Google Tag Manager) y/o `window.gtag` (GA4 directo). Cargada condicionalmente desde `theme/inc/utilities.php` solo si CF7 está activo.

**Esta pestaña nunca carga GTM ni GA4.** El tema es de uso "marca blanca": cada cliente puede tener GTM, GA4 directo, ambos o ninguno cargado por su propio gestor de cookies (banner de consentimiento), y no se sabe de antemano cuál. `javascript/modules/contactForm7.js` detecta en tiempo de ejecución si `window.dataLayer`/`window.gtag` existen antes de enviar nada; si no existen, no se envía ni se produce ningún error.

### Campos del panel (por formulario)

- **Activar seguimiento GA4/GTM para este formulario** — checkbox, desactivado por defecto (opt-in).
- **Registrar evento de envío en cualquier intento** (`pct_ga_track_all_attempts`) — checkbox, **marcado por defecto**. Desmarcado: el evento de envío no se dispara en fallos/spam — se dispara igualmente, pero solo en el momento del éxito, junto con el evento de conversión (no desaparece del todo, para no romper embudos/exploraciones de GA4 que comparen envíos vs. conversiones).
- **Evento de envío** (`pct_ga_submit_event`, default `form_submit`) — se dispara en cualquier intento de envío procesado por el servidor (éxito, fallo de correo, spam) vía el evento nativo `wpcf7submit`, salvo que el checkbox anterior esté desmarcado (ver arriba).
- **Evento de conversión** (`pct_ga_lead_event`, default `generate_lead`, nombre recomendado por GA4 para leads) — se dispara solo si el envío tiene éxito, vía `wpcf7mailsent`.
- **Valor de conversión** (opcional) + **moneda** (default `EUR`) — útil para pujas por valor en Google Ads. Solo se incluyen en el evento de conversión si hay valor informado.
- **Fuente / Medio / Campaña por defecto** — usados como fallback de `utm_source`/`utm_medium`/`utm_campaign` únicamente cuando no llega el parámetro real por la URL (tráfico sin campaña activa: orgánico, directo, referral). Si llega el parámetro real por URL, ese valor siempre tiene prioridad. Mapean directo a las dimensiones nativas Source/Medium/Campaign de GA4.

### Cómo se guarda y se expone al frontend

La configuración se persiste como post meta (`_pct_ga_*`) del formulario, guardada en el hook `wpcf7_after_save` (reutiliza el nonce que ya verifica CF7 al guardar, sin necesitar uno propio). Para exponerla al frontend sin duplicar lógica, se inyecta como hidden fields adicionales vía el filtro `wpcf7_form_hidden_fields` — el mismo mecanismo que ya usa el tema para los campos UTM/GCLID (ver sección de arriba), así que `contactForm7.js` los lee directamente de `event.detail.inputs` en `wpcf7beforesubmit`, sin necesidad de `wp_localize_script`.

### Política de datos — sin PII

Los eventos enviados **nunca incluyen datos personales** del formulario (email, nombre, teléfono, mensaje, etc.), solo: `event`, `form_id`, `form_destination` (URL de la página), `producto` (interés/servicio — no es un dato personal, permite diferenciar leads por servicio, con la misma cadena de fallback que ya existía: campo `producto` del formulario → contexto pasado por `ModalWP`/`modalContactForm7.js` al abrir el popup → `document.title` → `'contacto'`), los campos de campaña (`utm_*`, `gclid`, `fbclid`, `msclkid`) y, solo en el evento de conversión, `value`/`currency`. Esto evita el riesgo de suspensión de cuenta/campaña por incumplir las políticas de Google de no identificar usuarios.

---

## Biblioteca de medios — assets por defecto (`theme/inc/default-media.php`)

Al activar el tema, se importan automáticamente a la biblioteca de medios todas las imágenes que haya en `theme/assets/` (extensiones `svg`, `png`, `jpg`, `jpeg`, `gif`, `webp`; otros ficheros de esa carpeta, como `inter2.ttf`, se ignoran). El título del adjunto se genera a partir del nombre de fichero (p.ej. `flag-en.svg` → "Flag En").

**Idempotente:** cada import queda marcado con el meta `_pictau_bundled_asset` en el adjunto; en reactivaciones posteriores del tema no se duplica. Si el fichero ya existía previamente en la biblioteca con el mismo nombre (subido a mano antes de existir esta funcionalidad), se reutiliza ese adjunto en vez de crear uno nuevo con sufijo `-1`. Si el usuario borra el adjunto de la biblioteca, se vuelve a crear en la siguiente activación del tema (mismo comportamiento que la categoría `home` de `slide_category`, ver arriba).

Para añadir una nueva imagen por defecto al framework, basta con colocar el fichero en `theme/assets/` — no requiere tocar código.

## Notas

- PHP: siempre `<?php echo` (nunca `<?=`)
- Comentarios deshabilitados globalmente
- Búsqueda vacía redirige a home
- GTM/GA4 los carga siempre el gestor de cookies del sitio, nunca el tema (GDPR); el tema solo envía eventos si detecta que ya están presentes (ver pestaña "Seguimiento GA4 / GTM" de CF7)
- SVG inline via `[svg filename="..."]` (desde carpeta del tema) y `[svg-inline]` (convierte `<img src="*.svg">` en inline)
