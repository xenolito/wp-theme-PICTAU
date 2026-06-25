# OBJETIVO
Crear para este tema WordPress un componente/modulo js para convertir un DOM específico hecho con gutenberg en un comparador de 2 imágenes tipo antes/después con un slider para el usuario.

# DEFINICIÓN
- Stack: vanilla javascript.
- Usaremos el mismo patrón que hero_slider.js para la inicialización y funcionamiento, que importaremos en script.js.
- como attributeId usaremos "imgcompare"
- tenemos una funcionalidad muy similar implementado en el plugin pct-ambientes-moodboards, aunque hecho con react. Pero puedes basarte en la parte de interactividad para migrarlo a vanilla js. Muy importante el funcionamiento en dispositivos touch/mobile, donde debemos asegurarnos de que el usuario, una vez hace touch en el handler, no dispare en ningún momento el scroll de la página hasta que haga un tapfinish o similar. Esto está solucionado en el plugin de ejemplo que te he indicado.
- El DOM lo generaremos a través del editor de WordPress (gutenberg), y consistirá en un bloque grupo con los atributos necesarios, que dentro tendrá sólo 2 bloques imágenes, que son las que se usarán para implementar el compare.
- Icono del handler: Podemos usar el mismo icono del plugin pct-ambientes-moodboards, pero asegurándonos que está hardcodeado su svg como hacemos en el módulo contactForm7.js con "iconRadioCheckedSVG", o similar, para que no dependamos de un archivo svg separado.

# FUNCIONALIDAD ALTERNATIVA via atributo/param de configuración.
- Modo para mostrar el handler animado sin interacción por parte del usuario. Es sólo como si quisiéramos demostrar la funcionalidad, para incitar al usuario a interactuar.
- Tendremos una configuración adicional via atributo, siguiendo el patrón del módulo ejemplo hero-slider.js, que llamaremos data-imgcompare_showoff, de tipo booleano.
- En este modo, el handler no es intarctuable por el usuario.
- El handler se mueve de derecha a izquierda, en intervalos distintos y a velocidades distintas, de modo orgánico, como si un humano estuviera interactuando con él. Posibilidad de definir el tiempo de inicio de la animación o un rango de tiempos de inicio, para que si tengo más de uno en la página, cada uno comience en un tiempo distinto. La animación debe ser única para cada elemento de la página si hubiera más de uno.
- Ten en cuenta que el bloque grupo que contiene las imágenes, podrá tener un enlace <a href> para ir a otra página.


Pregunta todo lo que necesites.
Implementamos primero el modo funcional interactivo (DEFINICIÓN) y una vez esté listo, te pediré que continúes con el de la FUNCIONALIDAD ALTERNATIVA.
