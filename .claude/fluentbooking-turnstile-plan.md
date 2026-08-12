# Plan: Cloudflare Turnstile en el formulario de reserva de FluentBooking

**Estado:** planificado, NO implementado todavía. Documentado el 2026-08-12 tras
investigar hooks disponibles; a la espera de que el usuario cree el widget de
Turnstile en Cloudflare (site key + secret key) para retomarlo en una sesión
futura.

**Por qué:** FluentBooking (free 2.2.0) + FluentBooking Pro (2.2.1), las
versiones instaladas en este proyecto, **no traen ningún sistema antispam**
(ni reCAPTCHA, ni hCaptcha, ni Turnstile, ni honeypot, ni rate-limiting propio
del plugin). Confirmado por grep exhaustivo en todo el código PHP/JS de ambos
plugins (`captcha|turnstile|recaptcha|hcaptcha|spam`) — cero resultados
relevantes, ni siquiera como feature oculta/no documentada.

---

## Modo elegido

**Invisible.** Sin checkbox visible; Cloudflare solo reta con un desafío
visual si detecta comportamiento sospechoso. Mínima fricción para usuarios
legítimos.

## Dónde van las credenciales

Nueva sección en el Customizer del tema, dentro del panel `PICTAU` (mismo
panel que usa `theme/inc/cf7-email-branding.php`), cargada **solo si
FluentBooking está activo** (`class_exists('FluentBooking\App\App')` o
`defined('FLUENT_BOOKING_PLUGIN_VERSION')` — verificar la constante exacta que
expone el plugin al arrancar antes de implementar). Sección propuesta:
"Ajustes de FluentBooking" con dos campos de texto: `fluentbooking_turnstile_site_key`
y `fluentbooking_turnstile_secret_key` (theme_mods, no hace falta control
custom con preview — son simples inputs de texto, igual que cualquier
`WP_Customize_Setting` + `WP_Customize_Control` estándar de tipo `text`).

Archivo nuevo sugerido: `theme/inc/fluentbooking-turnstile.php`, cargado
condicionalmente (patrón igual que `cf7-email-branding.php` con CF7) desde
`utilities.php` o `functions.php`, solo si el plugin está activo.

---

## Backend (PHP) — hook confirmado, sin tocar núcleo del plugin

### Puntos de entrada de creación de reserva (los dos deben cubrirse)

1. **`FluentBooking\App\Hooks\Handlers\FrontEndHandler::ajaxScheduleMeeting()`**
   — el AJAX público real que usa el calendario embebido para visitantes
   anónimos. Enganchado en:
   `add_action('wp_ajax_nopriv_fluent_cal_schedule_meeting', ...)` +
   `add_action('wp_ajax_fluent_cal_schedule_meeting', ...)`
   (`app/Hooks/Handlers/FrontEndHandler.php:36-37`).
2. **`FluentBooking\App\Http\Controllers\BookingController::createBooking()`**
   — mismo flujo pero para cuando un host logueado crea una reserva manual
   desde el admin (ruta `POST bookings/create/{event_id}`, gateada por
   `CalendarEventPolicy`, ver `app/Http/Routes/api.php:66`). Menos crítico
   para antispam (requiere login), pero conviene cubrirlo por consistencia si
   se reutiliza el mismo filtro.

Ambos métodos llaman al mismo filtro con la misma firma:

```php
$validationConfig = apply_filters('fluent_booking/schedule_validation_rules_data', [
    'rules'    => $rules,
    'messages' => $messages,
], $postedData, $calendarEvent);
```

(`FrontEndHandler.php:802`, `BookingController.php:123`)

### Mecanismo de validación custom del plugin (framework `wpfluent`)

El validador (`FluentBooking\Framework\Validator\Validator`,
`vendor/wpfluent/framework/src/WPFluent/Validator/Validator.php`) soporta
reglas custom al estilo Laravel vía `extend()`:

```php
$app = \FluentBooking\App\App::getInstance();
$app->validator->extend('turnstile', function ($attribute, $value, $rules, $data) {
    // devolver un string (mensaje de error) = falla la validación
    // devolver null/false = pasa
    if (empty($value)) {
        return __('Por favor, completa la verificación de seguridad.', 'pictau');
    }

    $response = wp_remote_post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
        'body' => [
            'secret'   => get_theme_mod('fluentbooking_turnstile_secret_key'),
            'response' => $value,
            'remoteip' => $_SERVER['REMOTE_ADDR'] ?? '',
        ],
    ]);

    if (is_wp_error($response)) {
        return null; // fail-open en caso de error de red con Cloudflare — no bloquear reservas legítimas por un problema de infra
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);

    if (empty($body['success'])) {
        return __('La verificación de seguridad no es válida. Recarga la página e inténtalo de nuevo.', 'pictau');
    }

    return null;
});
```

Confirmado leyendo `Validator.php:654-708`: `extend()` guarda el callback en
`static::$customRules` (propiedad estática — persiste entre instancias, así
que basta con llamar `extend()` una vez por request, p.ej. dentro del propio
callback del filtro de abajo, sin necesidad de un hook de arranque aparte).
El método mágico `__call()` que despacha las reglas custom siempre `return
true` a nivel de "aprobado/rechazado" por el mecanismo normal, pero escribe
directamente en `$this->messages[$attribute][$rule]` cuando el callback
devuelve un string truthy — y es precisamente `count($this->messages)` lo que
usa `fails()` para decidir si la validación falla (`Validator.php:522-529`).
Es decir: **devolver un string desde el callback SÍ basta para bloquear la
reserva** con el mismo código de error 422 que ya usa el plugin para "nombre
requerido", etc. — la SPA ya sabe pintar ese error sin cambios adicionales.

### El filtro en sí

```php
add_filter('fluent_booking/schedule_validation_rules_data', function ($validationConfig, $postedData, $calendarEvent) {
    if (!class_exists('\FluentBooking\App\App')) {
        return $validationConfig;
    }

    // registrar la regla (ver bloque anterior)...

    $validationConfig['rules']['cf-turnstile-response'] = 'required|turnstile';
    $validationConfig['messages']['cf-turnstile-response.required'] = __('Por favor, completa la verificación de seguridad.', 'pictau');

    return $validationConfig;
}, 10, 3);
```

Ir en `theme/inc/fluentbooking-turnstile.php`, cargado solo si el plugin está
activo (mismo patrón condicional que `fluentbooking-compat.php`, que sí se
carga siempre porque no depende de que el plugin esté activo del todo —
revisar cómo está condicionado actualmente antes de decidir si crear un
archivo nuevo o añadir a `fluentbooking-compat.php` existente).

---

## Frontend (JS) — la parte delicada

El formulario público es una SPA compilada (Vue/Svelte, webpack) en
`wp-content/plugins/fluent-booking/assets/public/js/app.js` (~450 KB
minificado). **No existe** ningún tipo de campo "HTML personalizado" en el
editor de campos de reserva del plugin, ni ningún evento/hook JS documentado
para inyectar un campo en su payload interno antes del envío.

### Cómo envía la reserva la SPA (confirmado leyendo el bundle)

```js
me.$post(window.fluentCalendarPublicVars.ajaxurl, r)
```

donde `r` es un objeto plano con `action: "fluent_cal_schedule_meeting"` +
todos los campos del formulario. `me.$post` es un wrapper tipo axios que usa
`XMLHttpRequest` internamente (confirmado: la cadena `"XMLHttpRequest"`
aparece en el bundle). El body se envía como **JSON**, no
`application/x-www-form-urlencoded` — confirmado también del lado PHP: el
método `Request::all()` del framework `wpfluent`
(`vendor/wpfluent/framework/src/WPFluent/Http/Request/Request.php:260-276`)
detecta `Content-Type: application/json` y decodifica `php://input`
explícitamente, algo que no haría falta si fuese un POST tradicional
`$_POST`.

### Estrategia de inyección propuesta

Nuevo módulo JS en `javascript/modules/` (p.ej.
`fluentbookingTurnstile.js`), cargado condicionalmente solo si
`window.fluentCalendarPublicVars` existe (variable global que el plugin
localiza solo cuando su shortcode/bloque está presente en la página — evita
cargar Turnstile en páginas sin calendario):

1. Cargar el script de Cloudflare
   (`https://challenges.cloudflare.com/turnstile/v0/api.js`) de forma
   diferida.
2. Renderizar el widget en modo **invisible**
   (`data-size="invisible"` o `execution: 'execute'` vía API JS), posicionado
   cerca del formulario. Como el formulario se monta dinámicamente (Vue lo
   inyecta tras seleccionar slot), usar un `MutationObserver` sobre el
   contenedor del calendario para detectar cuándo aparece el paso de
   "detalles del asistente" (nombre/email) y montar el widget ahí, o
   simplemente montarlo una vez al cargar la página en un `<div>` oculto
   fijo — al ser invisible no importa mucho su posición en el DOM, solo que
   exista antes del submit.
3. **Parchear `XMLHttpRequest.prototype.send`** (guardando la referencia
   original) para detectar la petición saliente: si el body (string) es JSON
   y `JSON.parse(body).action === 'fluent_cal_schedule_meeting'`, inyectar
   `cf-turnstile-response` con el token obtenido del callback de Turnstile,
   volver a `JSON.stringify()` y llamar al `send()` original con el body
   modificado. Si por lo que sea no hay token disponible todavía en el
   momento del envío (carrera entre widget y submit), dejar pasar la
   petición tal cual — el backend la rechazará con el mensaje de validación
   normal (fail-safe, nunca fail-open del lado del cliente).

Es una técnica "hacky" pero estándar para añadir campos a peticiones AJAX de
terceros sin acceso a su código fuente — y como la validación real vive en
el backend (ver sección anterior), un fallo en la inyección JS nunca abre un
agujero de seguridad: en el peor caso, una reserva legítima se rechaza con
el error de verificación (habría que vigilar esto en producción tras el
despliegue, por si la detección del payload necesita ajuste fino contra la
build real del bundle, que puede cambiar entre versiones del plugin).

---

## Pendiente antes de implementar

- El usuario debe crear el widget en el dashboard de Cloudflare → Turnstile
  para el dominio de producción (y añadir `balanzia.dev`/dominio local si se
  quiere probar en desarrollo) y proporcionar site key + secret key.
- Verificar la constante/clase exacta que expone `fluent-booking.php` para
  detectar "plugin activo" de forma robusta (candidatos vistos en el código:
  `FLUENT_BOOKING_PLUGIN_VERSION`, o simplemente
  `class_exists('FluentBooking\App\App')`).
- Decidir si el filtro PHP va en un archivo nuevo
  (`theme/inc/fluentbooking-turnstile.php`) o se añade a
  `theme/inc/fluentbooking-compat.php` existente.
- Probar en real contra la build de `app.js` instalada en ese momento — el
  bundle puede cambiar de nombre de variables/estructura en updates del
  plugin, así que conviene volver a grepear `fluent_cal_schedule_meeting` en
  el bundle antes de dar por bueno el parche de `XMLHttpRequest` si ha pasado
  tiempo entre esta investigación y la implementación.
- Verificar con Playwright tras implementar: que el widget invisible no
  rompe el layout del formulario, que una reserva legítima se completa sin
  fricción, y que revisar la consola no muestra errores (carga del script de
  Cloudflare, CSP si el `.htaccess` del proyecto tiene política estricta —
  habría que añadir `https://challenges.cloudflare.com` a `script-src` y
  `frame-src`/`connect-src` si el sitio usa la CSP documentada en
  `CLAUDE.md` global del usuario).
