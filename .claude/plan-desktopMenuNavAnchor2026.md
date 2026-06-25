# Plan: desktopMenuNavAnchor2026.js — CSS Anchor Positioning

## Contexto

El módulo `desktopMenuNavAnchor.js` gestiona el posicionamiento de los submenús del menú desktop calculando manualmente coordenadas con `getBoundingClientRect()` y seteando `top`/`translate` via JS en cada hover. CSS Anchor Positioning (disponible en Chrome 125+, Safari 18.2+) permite declarar ese posicionamiento en CSS, eliminando toda la matemática JS. El objetivo es crear un módulo alternativo `desktopMenuNavAnchor2026.js` que conviva con el original (el original actúa como fallback para browsers sin soporte).

---

## Archivos a modificar

| Archivo | Acción |
|---|---|
| `javascript/modules/desktopMenuNavAnchor2026.js` | **Crear** nuevo módulo |
| `javascript/modules/desktopMenuNavAnchor.js` | **Añadir guard** de 1 línea (línea 153) |
| `javascript/script.js` | **Añadir import** en línea 22 |
| `tailwind/custom/components/layout-navigation.css` | **Añadir ~35 líneas** CSS al final del bloque `/* Desktop submenus */` (después línea 608) |

---

## Decisiones arquitectónicas clave

### 1. La extracción DOM se mantiene
Los `.sub-menu` se siguen moviendo a `.main-nav-desktop-submenus-wrap` (igual que el módulo original). `.main-header-wrap` tiene `backdrop-filter: blur(7.5px)` que crea un stacking context — si los submenús quedasen in-place con `position: fixed`, quedarían contenidos dentro de ese contexto. La extracción al `.main-nav-desktop-submenus-wrap` (dentro del mismo `.main-header-wrap`, `position: relative`) es la solución más segura.

### 2. CSS Anchor Positioning reemplaza `positionChildCentered()`
El `li` padre recibe `anchor-name` via JS inline style. El `.sub-menu-container` extraído recibe `position-anchor` via JS inline style. El CSS declara `top: anchor(bottom)` + `left: anchor(center)` + `translate: -50% 0`. Los `@position-try` fallbacks manejan los overflows izquierdo/derecho que antes calculaba JS.

### 3. Los dos módulos no pueden correr simultáneamente
El módulo 2026 corre primero (browsers modernos). El módulo original tiene un guard que comprueba si `.main-nav-desktop-submenus-wrap` ya existe y en ese caso no hace nada. Así el original actúa como fallback transparente.

### 4. Scope CSS con `:has()`
El CSS nuevo se scopea con `.main-header-wrap:has(.main-nav-desktop.nav-anchor2026)` — la clase `nav-anchor2026` la añade el módulo 2026 al `<nav>` al inicializarse. Así las reglas nuevas no afectan al módulo original.

---

## Implementación

### A) `desktopMenuNavAnchor2026.js` (crear)

```js
const makeMainNavSubmenusLayout2026 = (headerContainerElement) => {
    const delayToAutoHide = 400
    const status = { showing: null, ttHide: null }

    // Igual que el original: crear contenedor y prepend
    const navHeaderSubmenusContainer = document.createElement('div')
    navHeaderSubmenusContainer.setAttribute('class', 'main-nav-desktop-submenus-wrap')
    headerContainerElement.prepend(navHeaderSubmenusContainer)

    // Activar scope CSS de Anchor Positioning
    const navDesktop = headerContainerElement.querySelector('.main-nav-desktop')
    if (navDesktop) navDesktop.classList.add('nav-anchor2026')

    if (!document.querySelectorAll('.sub-menu').length) return

    const showChildren = parentMenu => {
        parentMenu.submenu.classList.add('showing')
        parentMenu.classList.add('opened')
    }

    const hideCurrentSubmenu = () => {
        if (status.showing) {
            status.showing.classList.remove('showing')
            status.showing.parentMenuItem.classList.remove('opened')
        }
    }

    document.querySelectorAll('.main-nav-desktop #primary-menu > .menu-item').forEach(menuItem => {
        const parentItemId = menuItem.getAttribute('id')
        const submenuElement = menuItem.querySelector('.sub-menu')

        if (submenuElement) {
            // NUEVO: asignar anchor-name al li padre
            const anchorName = `--nav-anchor-${parentItemId}`
            menuItem.style.anchorName = anchorName

            const submenuContainer = document.createElement('div')
            submenuContainer.setAttribute('class', `${parentItemId}-submenu sub-menu-container`)

            // NUEVO: asignar position-anchor al container extraído
            submenuContainer.style.positionAnchor = anchorName

            submenuContainer.parentMenuItem = menuItem
            submenuContainer.status = status

            submenuContainer.addEventListener('mouseover', ev => { clearTimeout(ev.currentTarget.status.ttHide) })
            submenuContainer.addEventListener('mouseout', ev => {
                ev.currentTarget.status.ttHide = setTimeout(hideCurrentSubmenu, delayToAutoHide)
            })

            menuItem.submenu = submenuContainer
            menuItem.status = status

            navHeaderSubmenusContainer.append(submenuContainer)
            submenuContainer.append(submenuElement)

            menuItem.addEventListener('click', ev => { if (ev.target.href === '#') ev.preventDefault() })
            menuItem.addEventListener('mouseover', ev => {
                clearTimeout(ev.currentTarget.status.ttHide)
                if (ev.currentTarget.status.showing) hideCurrentSubmenu()
                ev.currentTarget.status.showing = ev.currentTarget.submenu
                showChildren(ev.currentTarget)
            })
            menuItem.addEventListener('mouseout', ev => {
                ev.currentTarget.status.ttHide = setTimeout(hideCurrentSubmenu, delayToAutoHide)
            })

            submenuContainer.querySelectorAll('.menu-item:not(.menu-item-is-shortcode)').forEach(el => {
                el.addEventListener('click', () => hideCurrentSubmenu())
            })
        }
    })
}

document.addEventListener('DOMContentLoaded', () => {
    // Feature detection: CSS Anchor Positioning
    if (!CSS.supports('anchor-name', '--test')) return

    if (!document.querySelector('#masthead')) return

    const targetDom = document.querySelector('.main-header-wrap')
    if (!targetDom) return

    makeMainNavSubmenusLayout2026(targetDom)
})
```

**Lo que se elimina respecto al original:**
- `parseCssPxValue()` (~5 líneas)
- Lectura de `--submenu-safety-horizontal-padding`
- `positionChildCentered()` (~40 líneas) con todos sus `getBoundingClientRect()`
- Parámetros `visualPositioning` y `safetyPadding`
- Llamada a `positionChildCentered()` en el `mouseover`

---

### B) Guard en `desktopMenuNavAnchor.js` (línea 153)

```js
document.addEventListener('DOMContentLoaded', () => {
    // Si el módulo 2026 ya inicializó el menú (anchor positioning soportado), no duplicar
    if (document.querySelector('.main-nav-desktop-submenus-wrap')) return  // ← AÑADIR

    if (!document.querySelector('#masthead')) return
    // ... resto sin cambios
})
```

---

### C) `script.js` línea 22

```js
// ANTES:
import './modules/desktopMenuNavAnchor'

// DESPUÉS:
import './modules/desktopMenuNavAnchor2026'  // primero; browsers modernos
import './modules/desktopMenuNavAnchor'       // fallback; guard interno evita doble ejecución
```

---

### D) CSS en `layout-navigation.css` (añadir después línea 608, tras el cierre del bloque `/* Desktop submenus */`)

```css
/* Desktop submenus — CSS Anchor Positioning (desktopMenuNavAnchor2026)
   Activo solo cuando .nav-anchor2026 está presente en .main-nav-desktop
   (clase añadida por JS si el browser soporta anchor-name) */
@supports (anchor-name: --test) {

    .main-header-wrap:has(.main-nav-desktop.nav-anchor2026) {

        .main-nav-desktop-submenus-wrap .sub-menu-container {
            /* Vertical: top del container alineado con el bottom del li anchor */
            top: anchor(bottom);

            /* Horizontal: centrado bajo el li anchor */
            left: anchor(center);
            translate: -50% 0;

            /* Fallbacks para overflow izquierdo y derecho */
            position-try-fallbacks: --submenu-nudge-from-left, --submenu-nudge-from-right;
        }

        /* Overflow izquierdo: anclar al borde izquierdo del li */
        @position-try --submenu-nudge-from-left {
            left: anchor(left);
            translate: 0 0;
        }

        /* Overflow derecho: anclar al borde derecho del li */
        @position-try --submenu-nudge-from-right {
            left: unset;
            right: anchor(right);
            translate: 0 0;
        }
    }
}
```

**Notas CSS:**
- `translate: -50% 0` va en `.sub-menu-container`, no en `.sub-menu`. No interfiere con la animación `translate: 0 10%` → `translate: 0` que ya existe en `.sub-menu`.
- El `padding-top: var(--paddTop)` existente en `.sub-menu-container` sigue dando la separación visual entre el header y el submenú.
- `max-width: var(--submenu-max-width)` y `min-width: var(--submenu-min-width)` siguen activos — controlan el caso del submenú más ancho que el viewport.

---

## Compilación y verificación

1. `npm run development` desde la raíz del tema para compilar JS + CSS.
2. Abrir `https://prefabricadosduero.dev/` con Playwright.
3. Verificar en DevTools → Elements que los `li.menu-item-has-children` tienen el atributo `style="anchor-name: --nav-anchor-menu-item-XXX"`.
4. Verificar que `.main-nav-desktop` tiene la clase `nav-anchor2026`.
5. Hacer hover sobre items con submenú — los submenús deben aparecer centrados bajo cada item, con las transiciones actuales.
6. Verificar overflow: items en los extremos del menú deben activar los fallbacks (submenú no se sale del viewport).
7. Comprobar consola: sin errores JS.
8. Para probar el fallback: en DevTools Console, ejecutar `CSS.supports('anchor-name', '--test')` → debe ser `true` en Chrome/Safari modernos.
