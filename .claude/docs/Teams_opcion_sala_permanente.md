# Teams / Google Meet: sala permanente como alternativa al Round Robin nativo

**Estado:** propuesta opcional, pendiente de decisión — no implementada.
**Contexto:** FluentBooking, evento tipo Round Robin con ubicación "Microsoft Teams" ([Round_Robin_Balanzia.docx](Round_Robin_Balanzia.docx) tiene el detalle original del caso).

---

## 1. Problema de partida

En un evento Round Robin con ubicación nativa "MS Teams", el invitado elige la ubicación **antes** de saber qué host le tocará (la asignación ocurre al reservar). FluentBooking genera el enlace de la reunión llamando a Microsoft Graph API con el token OAuth de Outlook **del host asignado**, así que:

- Si un host del equipo no tiene Outlook/Microsoft 365 conectado en FluentBooking, la reserva falla cuando le toca a él.
- Por eso la ubicación "Teams" en Round Robin obliga a que **todos** los hosts del equipo tengan Outlook conectado — no es una limitación de WordPress, es que la generación del enlace depende de esa cuenta concreta.
- Cada host no puede tener "su propia" ubicación distinta: la ubicación es una propiedad del tipo de evento, no de cada host, así que si solo hay una configurada (Teams), el invitado la ve fija, sin selector.

### Confirmación en el código del plugin

`fluent-booking-pro/app/Services/Integrations/Calendars/Outlook/Bootstrap.php:361-460` (método `createEvent`):

```php
'organizer' => [
    'emailAddress' => [
        'name'    => $calendarOwnerName,
        'address' => $calendarOwnerEmail   // cuenta Outlook del host asignado
    ]
],
'attendees' => $guestAttendees,  // invitado + additionalHosts + additionalGuests
```

- `organizer` se fija siempre a la cuenta Outlook conectada que crea el evento (el host asignado por el Round Robin).
- Si hay otros hosts implicados, entran en `attendees` con `'type' => 'required'` — **al mismo nivel que el invitado externo**, sin permisos de organizador. FluentBooking no promueve a nadie a co-organizador vía Graph API.
- Consecuencia: en un evento colectivo, el resto del equipo entra a la reunión como asistente normal (sin admitir desde la sala de espera, sin poder finalizar la reunión para todos, etc.) salvo que alguien los añada manualmente como co-organizador después de creado el evento.

## 2. Solución propuesta: sala permanente con co-organizadores fijos

En vez de depender de la ubicación nativa "MS Teams" de FluentBooking (que crea una reunión nueva por cada reserva, atada a la cuenta del host asignado), usar **una única reunión recurrente de Teams**, creada manualmente una vez, con todos los hosts ya configurados como co-organizadores.

### Cómo se monta

1. **Crear la reunión en Outlook/Teams**: una reunión recurrente (p. ej. "a diario" o sin fecha de fin) o una reunión de canal de un Team. Genera un único enlace fijo (`joinUrl`) que no cambia entre ocurrencias.
   - No existe un concepto de "sala Teams permanente" como tal — eso son los Teams Rooms (hardware físico), algo distinto. El equivalente práctico es esta reunión recurrente/de canal.
2. **Añadir co-organizadores**: desde "Opciones de reunión" (antes o después de crearla), añadir a todos los hosts del equipo como co-organizadores. A partir de ahí, cualquiera entra con permisos de organizador sin depender de quién "creó" la reunión.
3. **Configurar el enlace en FluentBooking**: en el tipo de evento, usar una **ubicación personalizada** (texto/enlace plano) con ese `joinUrl` fijo, en vez de la ubicación nativa "Microsoft Teams". Esto evita por completo el flujo de `Bootstrap.php` que llama a Graph API — no depende de qué cuenta esté conectada.

### Riesgo a compensar

Al ser un enlace fijo y reutilizado en todas las reservas, si dos citas se solapan (o el margen entre ellas es corto), ambos invitados pueden acabar en la misma sala a la vez — se pierde el aislamiento que da el sistema nativo (una reunión nueva y aislada por reserva). Mitigación:

- Buffers de tiempo generosos entre citas en la configuración del evento.
- El host admitiendo manualmente desde la sala de espera (lobby) en vez de entrada automática.

## 3. Misma lógica con Google Meet

El problema y la solución son equivalentes con Google Calendar/Meet — mismo patrón confirmado en el código, y misma vía de escape.

### Confirmación en el código del plugin

`fluent-booking-pro/app/Services/Integrations/Calendars/Google/Bootstrap.php:344-425` (método `createEvent`):

```php
"organizer" => [
    'display_name' => $calendarOwner['title'],
    'email'        => $calendarOwner['id']   // cuenta Google del host asignado
],
'attendees' => $attendees,  // invitado + additionalHosts + additionalGuests

// Solo si location_details.type == 'google_meet':
'conferenceData' => [
    'createRequest' => [
        'requestId'             => $booking->hash,
        'conferenceSolutionKey' => ['type' => 'hangoutsMeet']
    ]
]
```

Idéntico patrón que Outlook: `organizer` es siempre la cuenta Google conectada del host asignado por el Round Robin, y el resto de hosts implicados entran en `attendees` sin ningún rol especial. El link de Meet (`hangoutLink`) se genera nuevo en cada reserva, atado a esa cuenta.

### Solución equivalente: evento recurrente de Calendar con co-anfitriones fijos

1. **Crear el evento en Google Calendar** una sola vez, con repetición ("Personalizado" → sin fecha de fin, o diaria/semanal según convenga) y con Google Meet añadido. Al ser un evento recurrente, Google Calendar reutiliza el **mismo enlace de Meet** en todas las ocurrencias — no genera uno nuevo cada vez.
2. **Añadir co-anfitriones**: desde el propio evento de Calendar, en el detalle de Meet → **"Gestión del anfitrión" ("Host management")** → añadir como co-anfitriones a todos los hosts del equipo. Quedan fijados para toda la serie recurrente, no hay que repetirlo por ocurrencia.
   - ⚠️ Esta función de "Host management"/co-anfitriones requiere **Google Workspace** (Business Standard o superior; no disponible en cuentas Gmail personales) y que el administrador del dominio la tenga habilitada.
3. **Configurar el enlace en FluentBooking**: igual que con Teams, usar una **ubicación personalizada** (texto/enlace plano) con ese `meet.google.com/xxx-xxxx-xxx` fijo, en vez de la ubicación nativa "Google Meet" — evita el flujo de `Bootstrap.php` de Google y su dependencia de la cuenta conectada.

### Riesgo (igual que en Teams)

Mismo aviso: enlace fijo y compartido entre reservas → posible solapamiento si dos citas coinciden en el tiempo. Mismas mitigaciones: buffers entre citas + admisión manual desde la sala de espera ("solicitud de acceso") en vez de entrada automática.

## 4. Pendiente

- Decidir si se implementa como **calendario/tipo de evento alternativo** (opcional) junto al Round Robin nativo actual, no como sustituto.
- Si se implementa: crear la reunión/evento recurrente (Teams o Google Meet, según corresponda), añadir co-organizadores/co-anfitriones, y configurar la ubicación personalizada en el tipo de evento correspondiente.
- Si se opta por Google Meet: confirmar primero que el plan de Google Workspace del cliente incluye "Host management" (co-anfitriones).
