# Decisión: formulario "Obtener acceso" — no duplicar lógica de negocio del SaaS en el WP

## Contexto

El popup "Solicitar Prioridad de Acceso" de balanzia.ai (SPA React) envía sus datos a
`POST https://apiwizard.balanzia.ai/api/Contacto`, la misma API que sirve el resto del
SaaS. Al plantear sustituir esa landing por la nueva web en WordPress, se evaluó si
replicar ese formulario con Contact Form 7 (WP) + un proxy PHP hacia ese endpoint, o
enlazar/redirigir a una página ya servida por el propio SaaS.

## Decisión

**No implementar el formulario en WP (ni con CF7 ni con fetch propio).** El WP debe
limitarse a enlazar/redirigir al formulario ya existente, servido por la infraestructura
del SaaS (SPA o una página standalone equivalente).

## Por qué

- El formulario no es un simple "nombre + email → correo" (para lo que CF7 está
  pensado): incluye validación no trivial (dígito de control del CIF español) y,
  sobre todo, interpretación de **códigos de respuesta de negocio** del propio
  endpoint (`emailYaRegistrado`, `cifNoRegistrado`) para mostrar mensajes específicos.
- Esa lógica ya existe, está probada y la mantiene el equipo del SaaS. Reimplementarla
  en el tema WP (vía `wpcf7_before_send_mail` + `wp_remote_post` + JS a medida para
  interpretar la respuesta JSON) crea una segunda fuente de verdad (SOT) que se
  desincroniza en silencio en cuanto cambien los campos, las reglas de validación o
  los códigos de respuesta en el backend del SaaS — el WP no se enteraría.
- `apiwizard.balanzia.ai` es la API central del producto (sirve también el blog vía
  `/api/Articulos/...`); la landing es solo un cliente más de esa API. El patrón sano
  es "frontend tonto + lógica de negocio centralizada en la API", y ese principio debe
  aplicarse igual al *formulario* (validaciones + interpretación de respuestas), no
  solo al almacenamiento de los datos.
- Redirigir/enlazar reutiliza el componente ya construido sin duplicar una sola línea
  de lógica de negocio: cualquier cambio futuro (nuevos campos, nuevas validaciones,
  nuevos códigos de error) se refleja automáticamente sin tocar el tema.
- Evita además tener que abrir/mantener CORS para el nuevo origen (navegación completa
  en vez de AJAX cross-origin desde el dominio del WP hacia `apiwizard.balanzia.ai`).

## Alternativa intermedia (solo si el salto de dominio es inaceptable para negocio)

Si por UX el formulario debe vivir visualmente *dentro* de la página WP (sin salto de
página), la alternativa sería un módulo JS propio del tema (patrón
`javascript/modules/`) que haga `fetch` directo a `apiwizard.balanzia.ai/api/Contacto`
— pero sigue duplicando la lógica de validación/interpretación de códigos de error, así
que solo se justifica si el salto de dominio es inaceptable.

## Pendiente de verificar (no confirmado)

- Si el formulario existe hoy *solo* embebido en la SPA de balanzia.ai, o si ya hay (o
  se puede exponer) una URL standalone equivalente a la que enlazar el botón "Obtener
  acceso" del nuevo WP.
- Si se redirige a otro (sub)dominio, configurar **cross-domain tracking en GA4/GTM**
  (dominios enlazados) para no romper el funnel de analítica al verse como sesión
  nueva en el dominio destino.
