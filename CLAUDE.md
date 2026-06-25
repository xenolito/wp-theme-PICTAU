# CLAUDE.md — Tema pictau (Balanzia)

Instrucciones y contexto para Claude Code en este proyecto.

---

## Proyecto

**Tema WordPress personalizado** para el sitio `balanzia`.
- **Versión:** 6.1.0 | **Text domain:** `pictau`
- **URL local:** `https://balanzia.dev/`
- **Ruta:** `/Volumes/KRAKEN/HTDOCS/balanzia/app/public/wp-content/themes/pictau`

---

## Reglas de trabajo

- **Usar siempre el MCP de Playwright** para verificaciones visuales, debug de CSS/JS y comportamiento en el navegador. No pedir permiso cada vez.
- **Si el navegador de Playwright está cerrado**, abrirlo directamente con `browser_navigate` sin pedir confirmación. Si falla con "Target page, context or browser has been closed", usar `browser_run_code` para forzar nueva sesión.
- **Al terminar cada sesión de Playwright**, eliminar el directorio `.playwright-mcp/` con `rm -rf .playwright-mcp`.
- Respetar la estructura de CPTs, el enfoque Tailwind-first y el patrón de módulos JS.
- **PHP:** usar siempre `<?php` (y `<?php echo` para imprimir). Nunca `<?=`.
- **Pods:** para crear o modificar campos/grupos/pods, documentar en `.claude/pods-playbook.json` y ejecutar via WP-CLI con `wp eval` + `pods_api()`.
- **WP-CLI:** usar siempre el wrapper `wp-local` (función zsh del usuario) que detecta automáticamente el PHP y socket MySQL del sitio Local correcto. Ejecutar sin pedir confirmación. No pedir confirmación para ejecutar Python.
- Nuevas funcionalidades: shortcodes en `theme/inc/template-functions.php`, nuevos módulos en `javascript/modules/`.
- **Todo el código relacionado con el CPT `producto` y el catálogo de productos** (shortcodes, hooks de admin, columnas, filtros, Quick Edit, etc.) va en `theme/inc/catalog.php`, no en `template-functions.php`.
- Compilar siempre tras cambios en JS/CSS: `npm run development` o `npm run watch`.
- **CSS:** nunca usar BEM (`__` ni `--`). Usar siempre guion medio (`-`) como separador en todos los nombres de clase CSS y HTML.
- **Versión del tema:** cuando se actualice la versión, hacerlo siempre en los tres sitios a la vez: `package.json` (campo `version`), `tailwind/custom/file-header.css` (campo `Version:`) y `README.md` (línea `**Versión:**`). El fichero autoritativo es `package.json`.

---

## Estructura de directorios

```
pictau/
├── theme/                    # PHP templates + assets compilados
│   ├── inc/                  # Includes PHP (template-tags, template-functions, events, utilities)
│   ├── js/                   # JS compilado (script.min.js, block-editor.min.js)
│   ├── template-parts/       # Partials (layout/header-content.php, footer-content.php, etc.)
│   └── languages/            # i18n (es_ES, en_GB)
├── javascript/               # JS fuente
│   ├── script.js             # Entry point principal
│   └── modules/              # 50+ módulos (menús, animaciones, WebGL, UI…)
├── tailwind/                 # CSS fuente (TailwindCSS + componentes custom)
│   └── custom/components/    # animations, buttons, cards, layout, themes…
├── CLAUDE.md                 # Este archivo
├── .claude/                  # Contexto y referencias para Claude
│   └── product-categories.md # Categorías/subcategorías del catálogo con nº de productos
├── .mcp.json                 # MCP servers del proyecto
└── package.json
```

---

## Custom Post Types (via Pods)

_Sin CPTs personalizados registrados aún. Añadir aquí cuando se creen._

---

## JavaScript

**Entry points:** `javascript/script.js` → `theme/js/script.min.js`

**Módulos destacados:**
- `desktopMenuNav.js` — submenús/megamenús desktop con posicionamiento dinámico
- `mobileMenuNav.js` — menú móvil
- Animaciones GSAP: `animation_counter.js`, `animation_blur_chars.js`, `animation_split_text.js`, `animation_scrollTriggered.js`
- WebGL: `webgl_animBg.js`, `webgl_dots_connected_anim.js`
- UI: `faqs.js`, `testimonials-splide.js`, `darkMode.js`, `ModalWP.js`

**Librerías principales:** GSAP + ScrollTrigger, Splide, OverlayScrollbars, Split Type, CountUp.js

---

## CSS

**Fuente:** `tailwind/` → compilado a `theme/style.css`
- Dark mode: estrategia `class`
- Color brand principal: `rgb(49, 93, 158)` (azul navy, `--brand-color-rgb`)

---

## Build

```bash
npm run development   # Build de desarrollo
npm run watch         # Watch + Browsersync
npm run production    # Build producción minificado
npm run lint          # ESLint + Prettier
npm run bundle        # Genera .zip para despliegue
```

**Bundler:** esbuild (JS) + PostCSS/Tailwind (CSS)

---

## Menús WordPress

| Location | Descripción |
|----------|-------------|
| `menu-1` | Primario (desktop) |
| `menu-1-mobile` | Móvil |
| `top_menu` | Sobre el header |
| `menu-2` | Footer |

---

## Notas

- Comentarios deshabilitados globalmente (se pueden activar por post)
- Búsqueda deshabilitada (búsqueda vacía redirige a home)
- GTM configurable desde el Customizer
- SVG con sanitización e inline rendering via shortcode `[inline_svg]`
