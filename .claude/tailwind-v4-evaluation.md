# Evaluación: actualizar a Tailwind CSS v4

**Estado:** evaluación guardada el 2026-08-04. No se ha ejecutado ninguna migración — el proyecto sigue en Tailwind CSS 3.4.14.

## Contexto

El proyecto usa actualmente **Tailwind CSS 3.4.14**, compilado con la CLI de Tailwind (no Vite/postcss-cli) en **tres builds separados** (`style.css` frontend, `style-editor.css`, `style-editor-extra.css`), vía `postcss.config.js` con la cadena `postcss-import-ext-glob → postcss-import → tailwindcss/nesting → tailwindcss`.

La config (`tailwind/tailwind.config.js`) no es trivial:
- Usa `presets` para fusionar `tailwind-typography.config.js` (que construye la paleta `prose` con la función `theme()` en JS).
- Usa `corePlugins.preflight` condicionado por `process.env._TW_TARGET` para desactivar Preflight solo en el build del editor.
- Tiene un plugin propio del ecosistema `_tw`, **`@_tw/themejson`**, que lee `theme/theme.json` en build-time y vuelca sus colores/anchos al theme de Tailwind (con un script `watch:tailwind:themejson` dedicado para disparar el rebuild cuando cambia `theme.json`).
- El entry point (`tailwind/tailwind.css`) usa `@import "tailwindcss/base|components|utilities"` + un `@import-glob` no estándar (vía `postcss-import-ext-glob`) para cargar todos los componentes de `tailwind/custom/components/`.

## ¿Qué ventajas reporta v4?

- **Motor nuevo (Lightning CSS, Rust)**: rebuilds incrementales órdenes de magnitud más rápidos. Con 3 builds Tailwind corriendo en paralelo bajo `npm run watch` + Browsersync, esto es la ganancia más tangible en el día a día.
- **Nesting nativo**: ya no hace falta `tailwindcss/nesting` en el pipeline — el proyecto usa `&` de forma masiva en `buttons.css`, `layout.css`, `cards.css`, así que esto simplifica una dependencia real, no teórica.
- **Container queries nativas**: elimina la dependencia `@tailwindcss/container-queries`, que ya usáis activamente (`catalog.css` y otros).
- **CSS-first config (`@theme`)**: menos indirección JS↔CSS a largo plazo, pero **no aplica hoy** — ver más abajo.
- **Baseline de navegador más alto** (Safari 16.4+, Chrome 111+, Firefox 128+) que en principio es un requisito nuevo de v4, pero en la práctica el propio código ya asume ese nivel: usáis `:has()`, `container-type`, sintaxis de color relativo (`rgb(from var(...) ...)`), `svh/dvh`, `text-wrap: balance`. Es decir, v4 no os pide soportar menos navegadores de los que el CSS actual ya requiere de facto.
- Tailwind v3 sigue mantenido pero ya no recibe nuevas features — v4 es donde está el desarrollo activo de plugins/ecosistema oficial a futuro.

## ¿Vale la pena ahora mismo?

**Sí, pero no es urgente ni trivial "sin más".** El riesgo no está en Tailwind en sí, sino en tres piezas concretas de vuestra configuración:

1. **`@_tw/themejson`** (plugin custom que conecta `theme.json` ↔ Tailwind): es el punto más delicado. No hay confirmación pública de que la versión instalada (`0.2.0`) sea compatible con la API de plugins de v4. El propio generador `_tw` ha sido actualizado a v4 pero con un enfoque distinto (integración de `theme.json` vía config CSS), lo que sugiere que el plugin tal cual no es un "drop-in" para v4.
2. **`corePlugins: { preflight: ... }`**: esta opción **ya no existe en v4** (confirmado en la guía oficial de migración). El mecanismo que usáis para desactivar Preflight solo en el build del editor deja de funcionar tal cual.
3. **`tailwind-typography.config.js`**: preset JS que construye colores de `prose` vía la función `theme()` — funciona bien en v3, pero es exactamente el tipo de config dinámica que v4 no expresa de forma nativa en `@theme` (CSS estático).

La buena noticia: v4 incluye una **directiva de compatibilidad `@config`** que carga el `tailwind.config.js` tal cual (colores, `presets`, plugins con `addUtilities`/`theme()`) bajo el motor nuevo, sin reescribir nada de eso. Solo `corePlugins`, `safelist` y `separator` quedan fuera de esa compatibilidad — y el `corePlugins.preflight` es precisamente el único de esos tres que usáis, pero tiene solución directa y de bajo riesgo: en vez de desactivar Preflight por config, el entry CSS del editor simplemente no importa la capa `preflight.css` (v4 expone `theme.css`/`preflight.css`/`utilities.css` como imports independientes).

Esto abre una ruta de migración de **bajo riesgo**: actualizar el motor (`tailwindcss` v4 + `@tailwindcss/postcss`, dropear `tailwindcss/nesting` y `@tailwindcss/container-queries`) manteniendo `tailwind.config.js` cargado vía `@config`, y dejar la reescritura completa a `@theme` nativo (incluido el plugin `@_tw/themejson`) como un paso posterior, opcional y aislado — no hace falta hacerlo todo de golpe.

## Cómo cambiaría el settings/workflow

Si en el futuro se ejecuta la migración (ruta incremental recomendada), esto es lo que tocaría:

- **`package.json`**: `tailwindcss` → `^4.x`, añadir `@tailwindcss/postcss`, quitar `@tailwindcss/container-queries` (ya no hace falta, es nativo). Revisar si `postcss-import` / `postcss-import-ext-glob` siguen siendo necesarios delante de `@tailwindcss/postcss` para que el `@import-glob` de `tailwind/custom/components/` siga funcionando (a verificar en pruebas, no es un cambio de API documentado).
- **`postcss.config.js`**: `tailwindcss/nesting` desaparece (nesting nativo); `require('tailwindcss')` pasa a `require('@tailwindcss/postcss')`.
- **`tailwind/tailwind.css`**: las tres líneas `@import "tailwindcss/base|components|utilities"` pasan a `@import "tailwindcss";` (o imports por capa si se quiere mantener granularidad), más `@config "./tailwind.config.js";` para seguir usando la config JS actual.
- **`tailwind/tailwind-editor-extra.css`** (build del editor): en vez de depender de `corePlugins.preflight`, el import ahí excluye `preflight.css` explícitamente.
- **`tailwind.config.js`**: se mantiene casi igual en la ruta incremental (colores `brand`, `textColor`, `boxShadow`, `presets`, `@_tw/themejson`); solo se retira la clave `corePlugins`.
- **Scripts npm**: sin cambios de forma (`development:tailwind:*`, `watch:*`, `production:*` siguen invocando la CLI de Tailwind igual), pero merece la pena revisar si la CLI de v4 sigue aceptando exactamente los mismos flags (`--postcss`, `-c`, `-i/-o`, `--minify`, `--watch`).
- **Editor/IntelliSense**: `.vscode/tailwind.json` (custom data de at-rules) puede necesitar revisión si se usan las nuevas directivas (`@theme`, `@plugin`, `@utility`, `@variant`) en el futuro paso 2.
- **Herramienta de migración automática**: `npx @tailwindcss/upgrade` cubre ~90% de los cambios mecánicos en casos estándar, pero dado el `@import-glob` no estándar y el plugin custom, es previsible que aquí requiera intervención manual — no es un "run and done".

## Recomendación

Vale la pena a medio plazo por la velocidad de build y por quitar dos dependencias (`tailwindcss/nesting`, `@tailwindcss/container-queries`), pero **no hay presión por hacerlo ya** — v3 sigue funcionando sin problemas. Cuando se aborde, la vía de menor riesgo es la migración incremental (motor v4 + `@config` de compatibilidad), dejando la reescritura completa a `@theme` nativo — y en particular la sustitución/reescritura de `@_tw/themejson` — como una fase 2 separada y bien probada aparte, no como parte del mismo cambio.
