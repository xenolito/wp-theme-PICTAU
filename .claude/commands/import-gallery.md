---
description: Importa imágenes de una carpeta local como gallery_item posts en WordPress (pct-gallery plugin), asignando galería y categoría.
---

Importa imágenes de una carpeta local como posts de tipo `gallery_item` en el plugin `pct-gallery` de WordPress.

## Argumentos

`$ARGUMENTS` contiene: `<folder_path> "<gallery_name>" "<category_name>"`

- **folder_path**: ruta absoluta a la carpeta con las imágenes (JPG, JPEG, PNG, WebP, GIF)
- **gallery_name**: nombre de la galería (`pct_gallery` taxonomy) — se crea si no existe
- **category_name**: nombre de la categoría (`gallery_category` taxonomy) — se crea si no existe

## Proceso

1. **Listar imágenes** en la carpeta usando Bash. Formatos aceptados: jpg, jpeg, png, webp, gif (case-insensitive). Ordenar alfabéticamente.

2. **Derivar título** por imagen: nombre de archivo sin extensión, sustituyendo `_` y `-` por espacios en blanco, luego capitalizar la primera letra de cada palabra (ucwords).

3. **Escribir un script PHP temporal** en `/tmp/pct_gallery_import.php` que:
   - Obtenga o cree el término `pct_gallery` con el nombre indicado (usando `get_term_by('name', ...)` o `wp_insert_term`)
   - Obtenga o cree el término `gallery_category` con el nombre indicado
   - Por cada archivo de imagen, en orden:
     a. Compruebe si ya existe un `gallery_item` con ese título asignado a esa galería (para evitar duplicados) — si existe, lo omite y lo indica en el output
     b. Importe el archivo a la librería de medios con `media_sideload_image()` o manual con `wp_insert_attachment()` + `wp_generate_attachment_metadata()`
     c. Establezca el título, el texto alternativo (`_wp_attachment_image_alt`) y el caption del attachment igual al título derivado
     d. Cree el post `gallery_item` con `wp_insert_post(['post_type'=>'gallery_item','post_title'=>$title,'post_excerpt'=>$title,'post_status'=>'publish'])`
     e. Establezca la imagen destacada con `set_post_thumbnail($post_id, $attachment_id)`
     f. Asigne las taxonomías con `wp_set_post_terms($post_id, [$gallery_term_id], 'pct_gallery')` y `wp_set_post_terms($post_id, [$cat_term_id], 'gallery_category')`
     g. Imprima por pantalla el resultado: "OK: {título}" o "SKIP: {título} (ya existe)"
   - Al final, imprima el resumen: N creados, M omitidos

4. **Ejecutar** el script con `wp-local eval-file /tmp/pct_gallery_import.php`

5. **Eliminar** el archivo temporal `/tmp/pct_gallery_import.php`

6. **Reportar** el resultado al usuario con el resumen de items creados/omitidos.

## Notas importantes

- Usar siempre `wp-local` (no `wp`) para WP-CLI — es el wrapper de Local by Flywheel
- Sitio WordPress: `prefabricadosduero.dev`
- CPT: `gallery_item` | Taxonomías: `pct_gallery`, `gallery_category`
- PHP: siempre `<?php` (nunca `<?=`)
- Si `media_sideload_image()` no está disponible fuera de admin, cargar `wp-admin/includes/media.php`, `wp-admin/includes/file.php` y `wp-admin/includes/image.php` antes de usarla
- El script debe incluir `define('WP_USE_THEMES', false);` no es necesario (wp-cli ya bootstrapea WP)
- Si la carpeta no existe o no contiene imágenes, informar al usuario y no ejecutar nada
