/* global wp */

/**
 * Block editor modifications
 *
 * This file is loaded only by the block editor. Use it to modify the block
 * editor via its APIs.
 *
 * The JavaScript code you place here will be processed by esbuild, and the
 * output file will be created at `../theme/js/block-editor.min.js` and
 * enqueued in `../theme/functions.php`.
 *
 * For esbuild documentation, please see:
 * https://esbuild.github.io/
 */

// =============================================================================
// GUTENBERG BUTTON BLOCK — Previsualización de SVG en el editor
// Espeja la lógica del filtro PHP render_block_core/button de utilities.php.
//
// Estrategia: en lugar de inyectar nodos en el <a> contenteditable (que
// ProseMirror gestiona y sobreescribiría), se inyecta un <style> en el <head>
// del iframe con CSS ::before/::after scoped al clientId del bloque.
// Así ProseMirror nunca interfiere con la previsualización.
//
// IMPORTANTE: mantener SVG_MAP sincronizado con $svg_map en utilities.php.
// Limitación del editor: solo se previsualiza 1 icono "before" y 1 "after"
// (CSS solo dispone de ::before y ::after). En el frontend se renderizan todos.
// =============================================================================

;(function () {
	const { addFilter } = wp.hooks
	const { createElement: el, useEffect } = wp.element

	// Mapa clave → SVG. Debe mantenerse sincronizado con $svg_map en utilities.php.
	const SVG_MAP = {
		download:
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.1"><path d="M12 21c-4.97 0-9-4.03-9-9c0-4.97 4.03-9 9-9"/><path stroke-dasharray="2 4" stroke-dashoffset="6" d="M12 3c4.97 0 9 4.03 9 9c0 4.97-4.03 9-9 9"/><path d="M12 8v7.5"/><path d="M12 15.5l3.5-3.5M12 15.5l-3.5-3.5"/></g></svg>',
		pdf: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v4"/><path d="M5 18h1.5a1.5 1.5 0 0 0 0 -3h-1.5v6"/><path d="M17 18h2"/><path d="M20 15h-3v6"/><path d="M11 15v6h1a2 2 0 0 0 2 -2v-2a2 2 0 0 0 -2 -2h-1"/></svg>',
		external:
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
	}

	/**
	 * Analiza la className y devuelve qué iconos van antes y después.
	 * Misma lógica que el PHP: {key}-before → before, {key}-after / {key} → after.
	 */
	function detectIcons(className) {
		if (!className) return { before: [], after: [] }
		const classes = className.split(' ')
		const before = []
		const after = []
		Object.keys(SVG_MAP).forEach(key => {
			if (classes.includes(key + '-before')) before.push(key)
			else if (classes.includes(key + '-after') || classes.includes(key)) after.push(key)
		})
		return { before, after }
	}

	/**
	 * Convierte un SVG string a una CSS mask-image data URI.
	 * Reemplaza currentColor por black: en una mask solo importa la opacidad,
	 * no el color. background-color: currentColor hereda el color del texto del botón.
	 */
	function svgToMaskUrl(svgStr) {
		const maskSvg = svgStr
			.replace(/stroke="currentColor"/g, 'stroke="black"')
			.replace(/fill="currentColor"/g, 'fill="black"')
		return `url("data:image/svg+xml,${encodeURIComponent(maskSvg)}")`
	}

	addFilter('editor.BlockEdit', 'pictau/button-svg-preview', BlockEdit => {
		return function ButtonSvgPreview(props) {
			if (props.name !== 'core/button') return el(BlockEdit, props)

			const className = props.attributes.className || ''

			useEffect(() => {
				const iframe = document.querySelector('iframe[name="editor-canvas"]')
				const iframeDoc = iframe?.contentDocument
				if (!iframeDoc) return

				const styleId = `pictau-btn-${props.clientId}`

				// Limpiar estilo anterior de este bloque
				iframeDoc.querySelector(`#${styleId}`)?.remove()

				const { before, after } = detectIcons(className)
				if (!before.length && !after.length) return

				const sel = `[data-block="${props.clientId}"] .wp-block-button__link`
				const lines = [
					`${sel} { display: inline-flex !important; align-items: center !important; gap: 0.4em !important; }`,
				]

				// ::before — primer icono "before"
				if (before.length > 0) {
					const maskUrl = svgToMaskUrl(SVG_MAP[before[0]])
					lines.push(
						`${sel}::before { content: '' !important; display: inline-block !important; flex-shrink: 0; width: 1em; height: 1em; background-color: currentColor; -webkit-mask: ${maskUrl} no-repeat center / contain; mask: ${maskUrl} no-repeat center / contain; }`
					)
				}

				// ::after — primer icono "after"
				if (after.length > 0) {
					const maskUrl = svgToMaskUrl(SVG_MAP[after[0]])
					lines.push(
						`${sel}::after { content: '' !important; display: inline-block !important; flex-shrink: 0; width: 1em; height: 1em; background-color: currentColor; -webkit-mask: ${maskUrl} no-repeat center / contain; mask: ${maskUrl} no-repeat center / contain; }`
					)
				}

				const style = iframeDoc.createElement('style')
				style.id = styleId
				style.textContent = lines.join('\n')
				iframeDoc.head.appendChild(style)

				// Cleanup: eliminar el style al desmontar o al cambiar className/clientId
				return () => iframeDoc.querySelector(`#${styleId}`)?.remove()
			}, [className, props.clientId])

			return el(BlockEdit, props)
		}
	})

	// =============================================================================
	// CORE/GROUP — Enlace de grupo: ToolbarButton + LinkControl (igual que imagen)
	// Atributos sin source → almacenados solo en el delimitador del bloque para
	// evitar errores de validación. El <a> lo aplica render_block_core/group (p.20).
	// =============================================================================

	const { useState } = wp.element

	// 1. Registrar atributos groupLink, groupLinkTarget, groupLinkRel, groupLinkClass
	addFilter(
		'blocks.registerBlockType',
		'pictau/group-link-attribute',
		function ( settings, name ) {
			if ( name !== 'core/group' ) return settings
			return {
				...settings,
				attributes: {
					...settings.attributes,
					groupLink:      { type: 'string', default: '' },
					groupLinkTarget:{ type: 'string', default: '' },
					groupLinkRel:   { type: 'string', default: '' },
					groupLinkClass: { type: 'string', default: '' },
				},
			}
		}
	)

	// 2. ToolbarButton + URLPopover (mismo componente que el bloque imagen de WP core)
	//    renderSettings activa el chevron (↓) con toggle nueva pestaña + rel + clase CSS.
	addFilter(
		'editor.BlockEdit',
		'pictau/group-link-toolbar',
		function ( BlockEdit ) {
			return function GroupLinkToolbar( props ) {
				if ( props.name !== 'core/group' ) return el( BlockEdit, props )

				const { BlockControls, URLPopover, URLInput } = wp.blockEditor
				const { ToolbarGroup, ToolbarButton, Button, ToggleControl, TextControl } = wp.components

				const [ isPopoverOpen, setIsPopoverOpen ] = useState( false )
				const [ isEditing, setIsEditing ]         = useState( false )
				const [ toolbarBtnEl, setToolbarBtnEl ]   = useState( null )

				const groupLink       = props.attributes.groupLink       || ''
				const groupLinkTarget = props.attributes.groupLinkTarget || ''
				const groupLinkRel    = props.attributes.groupLinkRel    || ''
				const groupLinkClass  = props.attributes.groupLinkClass  || ''

				function openPopover() {
					setIsPopoverOpen( true )
					setIsEditing( ! groupLink )
				}

				function closePopover() {
					setIsPopoverOpen( false )
					setIsEditing( false )
				}

				function removeLink() {
					props.setAttributes( { groupLink: '', groupLinkTarget: '', groupLinkRel: '', groupLinkClass: '' } )
					closePopover()
				}

				return el(
					wp.element.Fragment,
					null,
					el( BlockEdit, props ),
					el(
						BlockControls,
						null,
						el(
							ToolbarGroup,
							null,
							el( 'span', { ref: setToolbarBtnEl },
								el( ToolbarButton, {
									icon: 'admin-links',
									label: groupLink ? 'Editar enlace de grupo' : 'Añadir enlace de grupo',
									isActive: !! groupLink,
									onClick: function () { isPopoverOpen ? closePopover() : openPopover() },
								} )
							)
						)
					),
					isPopoverOpen && el(
						URLPopover,
						{
							anchor: toolbarBtnEl,
							onClose: closePopover,
							renderSettings: function () {
								return el(
									'div',
									{ style: { padding: '0 16px 8px' } },
									el( ToggleControl, {
										__nextHasNoMarginBottom: true,
										label: 'Abrir en una nueva pestaña',
										checked: groupLinkTarget === '_blank',
										onChange: function ( val ) {
											props.setAttributes( { groupLinkTarget: val ? '_blank' : '' } )
										},
									} ),
									el( TextControl, {
										__nextHasNoMarginBottom: true,
										label: 'Relación del enlace',
										value: groupLinkRel,
										onChange: function ( val ) {
											props.setAttributes( { groupLinkRel: val } )
										},
									} ),
									el( TextControl, {
										__nextHasNoMarginBottom: true,
										label: 'Clase CSS del enlace',
										value: groupLinkClass,
										onChange: function ( val ) {
											props.setAttributes( { groupLinkClass: val } )
										},
									} )
								)
							},
						},
						isEditing
							? el(
								'form',
								{
									className: 'block-editor-url-popover__row',
									onSubmit: function ( e ) { e.preventDefault(); setIsEditing( false ) },
								},
								el( URLInput, {
									value: groupLink,
									onChange: function ( val ) { props.setAttributes( { groupLink: val } ) },
									__nextHasNoMarginBottom: true,
								} ),
								el( Button, {
									icon: 'yes',
									label: 'Aplicar',
									type: 'submit',
									className: 'is-compact',
								} )
							)
							: el(
								'div',
								{ className: 'block-editor-url-popover__link-viewer block-editor-format-toolbar__link-container-content' },
								el( 'a', {
									href: groupLink,
									target: '_blank',
									rel: 'noreferrer noopener',
									className: 'block-editor-url-popover__link-viewer-url',
									onClick: function ( e ) { e.preventDefault() },
								}, groupLink ),
								el( Button, {
									icon: 'edit',
									label: 'Editar el enlace',
									className: 'is-compact',
									onClick: function () { setIsEditing( true ) },
								} ),
								el( Button, {
									icon: 'editor-unlink',
									label: 'Eliminar el enlace',
									className: 'is-compact',
									onClick: removeLink,
								} )
							)
					)
				)
			}
		}
	)
})()

wp.domReady(() => {
	/**
	 * Add support for Tailwind Typography's `lead` class via a block style.
	 */
	wp.blocks.registerBlockStyle('core/paragraph', {
		name: 'lead',
		label: 'Lead',
	})
})

import './modules/block-attributes.js'
