# Informe: viabilidad de conectar Outlook (cuenta gestionada por terceros) en FluentBooking

**Fecha:** 2026-09-01
**Contexto:** el cliente necesita usar Outlook como calendario de reservas (en vez de Google Calendar). Su cuenta de Outlook está gestionada por una empresa externa, que le provee el correo/calendario y controla sus permisos.

---

## 1. Cómo funciona la integración de Outlook en FluentBooking

Revisando el código de la integración (`fluent-booking-pro/app/Services/Integrations/Calendars/Outlook/`), FluentBooking **no requiere que nosotros ni el cliente registremos ninguna app en Azure/Entra ID**. El plugin ya trae su propia app de Microsoft integrada (`OutlookHelper::getApiConfig()`, marcada como `is_system_defined: yes`), del tipo **multi-tenant**: sirve para cualquier cuenta Microsoft, sea personal o de una organización.

El flujo de conexión (`Bootstrap.php::handleAuthCallback`) es:

1. WP Admin → Fluent Booking → Calendarios → calendario personal ("Simple") del host → pestaña **"Calendar Settings" → "Remote Calendars"**.
2. Botón para conectar Outlook → abre el login oficial de Microsoft (`login.microsoftonline.com`, con un relay intermedio en `fluentbooking.com`).
3. El usuario inicia sesión con sus credenciales de Microsoft y concede permisos (principalmente `Calendars.ReadWrite` + `offline_access`).
4. Vuelve a FluentBooking ya conectado. La conexión es **por host** (cada persona conecta su propia cuenta), no a nivel global del sitio.

Como extra: si además se quiere que FluentBooking genere enlaces de reunión de MS Teams automáticamente, esa opción (`teams_enabled`) solo funciona con cuentas **work/school** (Microsoft 365), no con una outlook.com personal.

## 2. Requisito crítico: tiene que ser una cuenta Microsoft real

Como el mecanismo usa Microsoft Graph API vía OAuth contra `login.microsoftonline.com`, la integración **solo funciona si el buzón vive realmente en la nube de Microsoft** (Microsoft 365/Exchange Online, o una outlook.com/live personal) con una identidad Entra ID/Azure AD detrás.

Esto es fácil de confundir: que el cliente "use la app Outlook" como cliente de correo **no implica** que su buzón esté en Microsoft 365. Si el correo está alojado en un servidor propio de la empresa (Exchange on-prem sin sincronizar a la nube, o cualquier otro servidor de correo) y Outlook solo se usa como cliente vía IMAP/POP/EWS sin login de Microsoft de por medio, **no hay ninguna cuenta Microsoft/Graph a la que conectarse** — y la integración no puede funcionar, independientemente de los permisos que conceda el administrador de esa empresa.

## 3. Confirmación directa de FluentBooking

Se contactó con el soporte de FluentBooking planteando este mismo escenario. Su respuesta:

> "FluentBooking's Outlook integration works through Microsoft's official Outlook/Microsoft Graph connection. So if your Outlook calendar is hosted on a private company mail server and does not use Microsoft 365/Microsoft login, it likely cannot be connected through the Outlook integration."

Confirma exactamente el punto 2: sin autenticación Microsoft real detrás del buzón, no hay integración posible, tal como se veía en el código.

## 4. Cómo verificar si la cuenta del cliente es válida

Comprobación rápida y concluyente: intentar iniciar sesión con esa cuenta en **https://outlook.office.com** (o `https://portal.office.com`).

- **Si entra y ve su calendario ahí** → es una cuenta Microsoft 365 real, la integración es viable (ver punto 5 para el único posible bloqueo adicional).
- **Si no entra** (ese correo no existe como cuenta Microsoft, solo como buzón en su propio servidor) → la integración de Outlook de FluentBooking no es viable con esa cuenta tal como está montada actualmente.

## 5. Si es una cuenta Microsoft 365 real: único punto a confirmar con la empresa gestora

Algunos tenants corporativos de Microsoft 365 restringen el **consentimiento de usuario** a apps de terceros (política de Entra ID "Users can consent to apps..."). Si está restringido, al conectar aparecerá un aviso tipo *"Need admin approval"*, y el administrador de esa empresa tendría que:

- dar consentimiento a nivel de organización (admin consent) para la app, o
- añadirla explícitamente a la lista de apps permitidas, identificándola por su App ID: `db98d3d0-c944-41f8-bb01-555c913a903b`, solicitando los scopes `Calendars.ReadWrite` + `offline_access` + `openid`/`email`/`User.Read`.

No hace falta compartir ningún secreto ni credencial nuestra — solo ese App ID, si el admin necesita autorizarlo explícitamente.

## 6. Resumen / próximos pasos

1. Pedir al cliente (o directamente a la empresa que le gestiona la cuenta) que confirme si puede entrar en `outlook.office.com` con esas credenciales.
2. **Si sí:** intentar la conexión normal desde FluentBooking. Si aparece un aviso de aprobación de admin, pasar a esa empresa el App ID de arriba para que lo autoricen.
3. **Si no:** la cuenta actual no es compatible con esta integración. Alternativas a valorar con el cliente:
   - Que la empresa migre/sincronice ese buzón a Microsoft 365 (fuera de nuestro alcance, depende de ellos).
   - Revisar si el calendario debe ser necesariamente Outlook, o si Google Calendar (ya soportado y funcionando) es una alternativa aceptable.
   - FluentBooking, según lo visto en el código de integraciones (`Bootstrap.php` de cada calendario en `fluent-booking-pro/app/Services/Integrations/Calendars/`), solo soporta remotamente Google Calendar, Outlook/Microsoft Graph y Apple/iCloud — no hay soporte genérico CalDAV para conectar un servidor de correo propio.
