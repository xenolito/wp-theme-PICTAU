# OBJETIVO
Desarrollar un plugin de WordPress para mostrar una galería de imágenes paginada y con filtro de categorías


# DESCRIPCIÓN FUNCIONAL Y REQUISITOS
- Debemos seguir las últimas normas y guias de desarrollo para WordPress 7.x
- El rendimiento web vitals es crítico: lazy loading, link rel preload para primeras imágenes, etc.
- Preparado para multilingue i18n.
- El plugin creará un Custom post type de tipo "gallery" con sus propias categorías.
- Desarrollo preferiblemente con las herramientas nativas de WP (@wordpress/scripts) o con vite + vanilla js para un fácil mantenimiento y minificación del código final (recomiéndame la opción más mantenible y eficiente, muestrame pros y cons)
- La implementación en el front será a través de un shortcode en el editor (no hace falta en estas iteración crear un bloque de gutenberg), por ej. [pct-gallery ....]
- La paginación será a través de API-REST (preferiblemente) o AJAX u otra opción que me recomiendes. Podremos elegir via shortcode entre paginación estándar con números de página (1 2 3 4 sugientes ) o con un botón de "Cargar más" (por defecto) o incluso con infinite scroll: 3 opciones en total.
- El layout para el grid de imágenes, podemos elegir entre varias opciones via shortcode: metro (por defecto) o justified. Ver imágenes de referencia metro.png y justified.png respectivamente.
- Filtro por categorías: Tipo botones / pestañas. Inicialmente marcado el botón/pestaña de "todas"
- Animaciónes y transiciones: Al utilizar los filtros, queremos que el contenido filtrado se anime en el grid utilizando preferiblemente view-transitions api.
- Visualización de imágenes en tamaño completo: Al clicar en una imagen, lanzaremos un lightbox para visualizar la imagen en la resolución original. Sería muy interesante utilizar el mismo código / api / librería que ya incorpora WordPress en su bloque de galería de imágenes, para no tener que desarrollar todo este interfaz. Verifica y proponme soluciones.
  - El lightbox: debe tener las mismas funcionalidades que el de WP: Con background semitransparente:
    - con icono de cruz para cerrar el lightbox
    - con flechas izquierda / derecha para navegar por las imágenes de la galería filtrada. También accionable via teclado con las flechas de cursor derecha/izquierda.
    - Al cambiar de una imagen a otra dentro del lightbox, queremos una animación (preferiblemente view-transition) de zoom-out (la que sale) y zoom-in (la que entra.)
    - Posibilidad de que cada imagen muestre en el lightbox un texto de "pie de foto", activable via para de shortcode.












Haz 2 pasadas. Pregunta todo lo que necesites.
