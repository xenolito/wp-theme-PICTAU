# Reproducir el popup "Obtener acceso" de balanzia.ai como CF7 en el tema pictau

## Contexto

`balanzia.ai` es la landing SaaS de BalanzIA (React), cuyo popup "Solicitar Prioridad de Acceso" envía sus datos a un backend propio de la empresa:

```
POST https://apiwizard.balanzia.ai/api/Contacto
Body: { Email, NombreEmpresa, CIF, FullName, AceptedTerminos, AceptedPromociones }
```

(Investigado leyendo el bundle JS de esa landing — ver conversación previa; no requiere autenticación, es un alta pública.)

Queremos poder disparar el mismo alta desde la web actual (tema `pictau`), usando Contact Form 7 como venimos haciendo con el resto de formularios del sitio, y que sus datos acaben en el mismo backend de BalanzIA, replicando también el comportamiento de negocio de la landing original (detección de email/CIF ya registrados).

Decisiones ya confirmadas con el usuario:
- El envío reenvía los datos a la API externa **y además** dispara el email interno normal de CF7 (doble registro: BalanzIA + aviso local).
- Si la llamada a la API externa falla o da timeout (no un rechazo de negocio), el envío **se deja pasar igualmente** en la web (no se pierde el lead local por una caída puntual de BalanzIA).
- Este plan solo deja el mecanismo (formulario CF7 + modal) listo. **No se coloca ningún botón/CTA en ninguna plantilla todavía** — se enganchará después con el mecanismo `data-modalform_target` ya documentado en el README.

## Enfoque: proxy server-side, no `fetch()` desde el navegador

Se descarta llamar a `apiwizard.balanzia.ai` directamente desde JS del navegador:
- Requeriría CORS habilitado en ese dominio para el origen de este sitio (no verificado, y fuera de nuestro control).
- La CSP del sitio (`theme/inc/customizer-csp.php`, panel Customizer "Seguridad (CSP)") tiene un `connect-src` que no incluye ese dominio; tocarla es innecesario si evitamos el fetch de cliente.

En su lugar, la llamada se hace en PHP (`wp_remote_post`) enganchada al ciclo de vida de envío de CF7, igual que ya hace el tema con otras integraciones (`cf7_html_email_templates.php`, `cf7-ga-tracking.php`). Cero peticiones cross-origin desde el navegador, cero cambios de CSP.

## 1. Nuevo formulario CF7

Crear un formulario CF7 nuevo (vía wp-admin, como el resto — no hay mecanismo de creación por código en este proyecto; Pods playbook no aplica aquí, es contenido CF7 normal en `wp_posts`). Nombre propuesto: **"Acceso BalanzIA"**.

Campos (siguiendo el estilo de nombres ya usado en el formulario "Lead", post 76992 — ver `theme/inc/cf7-form-template.php`):

```
[email* email placeholder "Email corporativo*"]
[text* nombre-empresa placeholder "Nombre de empresa*"]
[text* cif placeholder "CIF*"]
[text* nombre-completo placeholder "Nombre completo*"]

[acceptance acepta-terminos] Acepto los <a href="/TerminosCondiciones">Términos y Condiciones, y la Política de Privacidad</a> [/acceptance]
[checkbox acepta-promos use_label_element "Quiero recibir información y promociones"]

[hidden pct-remote-target "balanzia-contacto"]
[submit "Enviar Solicitud"]
```

El campo oculto `pct-remote-target` es el marcador que usará el hook PHP (punto 2) para saber que **este** formulario, y solo este, debe reenviarse a BalanzIA — evita hardcodear un ID de post que puede variar entre entornos, y es portable si el formulario se exporta/reimporta.

Envolver el formulario en un modal siguiendo el patrón ya documentado en el README (`## Modales con formulario (Contact Form 7)`):

```html
<div data-modalform="acceso-balanzia">
  [contact-form-7 id="..." title="Acceso BalanzIA"]
</div>
```

Sin ningún disparador (`data-modalform_target="acceso-balanzia"`) todavía, según lo acordado.

Email interno (pestaña Correo de CF7): usar el botón "Plantilla Base" (`theme/inc/cf7-form-template.php`) como punto de partida y adaptar los campos al mail body real (Email/NombreEmpresa/CIF/NombreCompleto), o rellenarlo a mano — es contenido de post, no de código.

## 2. Nuevo include PHP: `theme/inc/cf7-balanzia-access-proxy.php`

Sigue el mismo patrón que `cf7-ga-tracking.php` / `cf7-form-template.php` / `cf7-polylang.php`: clase final singleton `Pictau_CF7_Balanzia_Access_Proxy`, `instance()`, constructor privado → `init_hooks()`, guard `ABSPATH`, comentario de cabecera explicando qué hace y que se carga condicionalmente.

Registrar en `theme/inc/utilities.php`, mismo bloque que el resto de includes CF7 (~línea 660), mismo guard:

```php
if ( class_exists( 'WPCF7_ContactForm' ) ) {
	require get_template_directory() . '/inc/cf7-balanzia-access-proxy.php';
}
```

### 2.1 Validación de CIF (hook `wpcf7_validate_text*`)

CF7 6.1.7 sigue disparando el filtro dinámico clásico por tipo de campo en la validación server-side (`includes/submission.php:579`, `apply_filters("wpcf7_validate_{$type}", $result, $tag)`, donde `$type` incluye el `*` de obligatoriedad — confirmado leyendo el core instalado). No existe hoy en el proyecto ninguna validación de CIF/NIF (comprobado); hay que portar el algoritmo que ya usa la landing React (mismo bundle):

- Regex de formato: `/^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/i` sobre el valor en mayúsculas.
- Dígito de control: suma de posiciones pares tal cual + suma de posiciones impares (dígitos 2 a 7, 0-indexed desde el segundo carácter) duplicados y con sus dígitos sumados si el doble supera 9; control = `(10 - total % 10) % 10`.
- Letra de control: índice `control` sobre la cadena `"JABCDEFGHI"`.
- Según la primera letra del CIF: `[ABEH]` → el último carácter debe ser el dígito; `[KPQS]` → debe ser la letra; el resto → válido con dígito o letra.

Implementar como método privado `is_valid_cif( string $cif ): bool` en la clase, y engancharlo así:

```php
add_filter( 'wpcf7_validate_text*', [ $this, 'validate_cif_field' ], 20, 2 );
```

Dentro, comprobar `$tag->name === 'cif'` **y** que el formulario actual es el nuestro (mismo criterio de marcador que en antes_send_mail, ver 2.2) antes de invalidar, para no interferir con otros formularios del sitio que puedan tener un campo `text*` cualquiera. Si no es válido: `$result->invalidate( $tag, esc_html__( 'El CIF no es válido', 'pictau' ) )`.

### 2.2 Reenvío a la API + detección de duplicados (hook `wpcf7_before_send_mail`)

```php
add_action( 'wpcf7_before_send_mail', [ $this, 'forward_to_balanzia' ], 10, 3 );

public function forward_to_balanzia( $contact_form, &$abort, $submission ) {
	$posted = $submission->get_posted_data();

	if ( ( $posted['pct-remote-target'] ?? '' ) !== 'balanzia-contacto' ) {
		return; // no es nuestro formulario
	}

	$payload = array(
		'Email'               => $posted['email'] ?? '',
		'NombreEmpresa'       => $posted['nombre-empresa'] ?? '',
		'CIF'                 => strtoupper( $posted['cif'] ?? '' ),
		'FullName'            => $posted['nombre-completo'] ?? '',
		'AceptedTerminos'     => true, // CF7 ya bloqueó el envío si no se aceptó (wpcf7_acceptance)
		'AceptedPromociones'  => ! empty( $posted['acepta-promos'] ),
	);

	$response = wp_remote_post( 'https://apiwizard.balanzia.ai/api/Contacto', array(
		'timeout' => 15,
		'headers' => array( 'Content-Type' => 'application/json' ),
		'body'    => wp_json_encode( $payload ),
	) );

	if ( is_wp_error( $response ) ) {
		error_log( '[Pictau CF7 Balanzia] Error de red: ' . $response->get_error_message() );
		return; // política acordada: fail-open, se deja pasar el envío local
	}

	$code = wp_remote_retrieve_response_code( $response );
	$body = json_decode( wp_remote_retrieve_body( $response ), true );

	if ( 200 !== $code ) {
		error_log( '[Pictau CF7 Balanzia] Respuesta inesperada HTTP ' . $code . ': ' . wp_remote_retrieve_body( $response ) );
		return; // fail-open también aquí
	}

	if ( 'emailYaRegistrado' === $body ) {
		$submission->set_status( 'mail_failed' );
		$submission->set_response( esc_html__( 'El correo electrónico ya está registrado en la lista de espera de BalanzIA.', 'pictau' ) );
		$abort = true;
		return;
	}

	if ( 'cifNoRegistrado' === $body ) {
		$submission->set_status( 'mail_failed' );
		$submission->set_response( esc_html__( 'El CIF introducido ya está registrado en la lista de espera de BalanzIA.', 'pictau' ) );
		$abort = true;
		return;
	}

	// Éxito: no se toca $abort → sigue el flujo normal de CF7 (envía el email interno también)
}
```

Notas de diseño ya verificadas contra el CF7 instalado (`includes/submission.php`):
- `wpcf7_before_send_mail` recibe `(&$abort, $submission)`. Si `set_status()`/`set_response()` se llaman **antes** de que `proceed()` decida el status final, CF7 respeta lo que ya hayamos puesto (solo pisa a `'aborted'`/mensaje por defecto si seguimos en `'init'` / respuesta vacía — confirmado leyendo `submission.php:110-122`).
- Reutilizar el status `'mail_failed'` (en vez de inventar uno nuevo) es deliberado: el frontend ya escucha exactamente ese caso. `contact-form-7/includes/js/index.js` mapea status `mail_failed` → evento DOM `wpcf7mailfailed`, y `javascript/modules/contactForm7.js:246-253` ya tiene un listener para ese evento que muestra `event.detail.apiResponse.message` en el modal de error existente (`ModalWP.js`). **No hace falta tocar nada de JS/CSS** — el mensaje personalizado se muestra solo, con la misma UI que cualquier otro fallo de CF7 del sitio.
- Como falta de aceptación de términos ya bloquea el envío antes de llegar a `before_send_mail` (CF7 lo resuelve en su propio `accepted()`), `AceptedTerminos` siempre puede fijarse a `true` aquí sin comprobarlo de nuevo.
- La respuesta de éxito de esa API, según el cliente HTTP de la landing (`o9.#n()` en su bundle), solo trata explícitamente el status 200; cualquier otro código se considera error. Por eso el proxy trata "no es 200" igual que un error de red (fail-open).

## 3. Documentación en README.md

Añadir una sección nueva siguiendo el patrón exacto de las 3 últimas secciones CF7 del README (`## Contact Form 7 — <nombre> (`theme/inc/<fichero>.php`)`), justo después de "Contact Form 7 — Pestaña 'Seguimiento GA4 / GTM'" (línea ~1953) y antes de "Biblioteca de medios":

```
## Contact Form 7 — Proxy de alta remota a BalanzIA (`theme/inc/cf7-balanzia-access-proxy.php`)
```

Documentar (solo funcionalidad/config, sin razonamiento de debugging): qué formulario/campo marcador activa el reenvío, el endpoint y payload, la política de fallo (fail-open) y que reutiliza el mecanismo de modales `data-modalform` ya existente.

## 4. Versión del tema

Nueva funcionalidad → bump de versión **minor** (6.1.0 → 6.2.0) en los 3 sitios a la vez, por convención del proyecto: `package.json` (`version`), `tailwind/custom/file-header.css` (`Version:`), `README.md` (`**Versión:**`).

## Ficheros afectados

- **Nuevo:** `theme/inc/cf7-balanzia-access-proxy.php`
- `theme/inc/utilities.php` — nuevo `require` condicional
- `README.md` — nueva sección + bump de versión
- `package.json`, `tailwind/custom/file-header.css` — bump de versión
- Contenido CF7 (formulario + email), creado vía wp-admin, no versionado en el repo de tema

## Verificación

1. `wp-local` — comprobar que el nuevo formulario existe y anotar su ID (`wp-local post list --post_type=wpcf7_contact_form`).
2. Playwright contra `https://balanzia.dev/` (o la página donde se coloque temporalmente el trigger para probar, ya que este plan no añade ningún CTA): abrir el modal, comprobar `browser_console_messages` sin errores tras cargar.
3. **Caso CIF inválido**: enviar con un CIF mal formado → comprobar que CF7 muestra el error inline sin llegar a disparar la llamada externa (se puede confirmar sin llamar a la API real).
4. **Caso feliz / duplicado**: aquí hay que tener cuidado — la API de BalanzIA es un backend de producción real. Antes de probar un envío que sí llegue a `wp_remote_post`, confirmar con el usuario qué datos de prueba son aceptables (o si prefiere validar el payload solo con `error_log`/un mock temporal antes de apuntar al endpoint real), para no crear altas de prueba en su lista de espera de producción.
5. Confirmar en consola/`error_log` que, si se simula una respuesta no-200 o un error de red (p. ej. apuntando temporalmente a una URL inválida), el email interno de CF7 se sigue enviando (política fail-open).
