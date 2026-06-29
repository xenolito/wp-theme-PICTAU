/* global wp */

/**
 * Block Attributes — panel de atributos HTML en bloques Gutenberg.
 * Equivalente al plugin attributes-for-blocks, integrado en el tema pictau.
 */

const UNSUPPORTED_BLOCKS = ['core/freeform', 'core/html', 'core/shortcode', 'core/legacy-widget']

const GSAP_PRESETS = [
	{
		id: 'anim-any',
		label: 'Anim Any',
		attributes: { 'data-anim_any': '' },
	},
	{
		id: 'blur-chars-in',
		label: 'Blur In',
		attributes: { 'data-blur_chars': '' },
	},
	{
		id: 'blur-chars-out',
		label: 'Blur Out',
		attributes: { 'data-blur_chars': 'out' },
	},
	{
		id: 'scroll-triggered',
		label: 'ScrollTrigger',
		attributes: { 'data-anim_scrolltriggered': '' },
	},
	{
		id: 'scroll-pin',
		label: 'ScrollTrigger + Pin',
		attributes: {
			'data-anim_scrolltriggered': '',
			'data-anim_scrolltriggered_pin': '',
		},
	},
	{
		id: 'animask',
		label: 'AnimMask',
		attributes: { 'data-animask': '' },
	},
	{
		id: 'animask-config',
		label: 'AnimMask Config',
		attributes: {
			'data-animask': '',
			'data-animask_points': '8',
			'data-animask_intensity': '0.12',
			'data-animask_speed': '1',
		},
	},
	{
		id: 'split-text',
		label: 'Split Text',
		attributes: { 'data-split_text': '' },
	},
	{
		id: 'counter',
		label: 'Counter',
		attributes: { class: 'pct-counter' },
	},
]

// ---------------------------------------------------------------------------
// Utilidades de parse/compile para el atributo style
// ---------------------------------------------------------------------------

function parseStyle(styleStr) {
	return (styleStr || '')
		.split(';')
		.map(s => s.trim())
		.filter(Boolean)
		.map(s => {
			const idx = s.indexOf(':')
			return { prop: s.slice(0, idx).trim(), val: s.slice(idx + 1).trim() }
		})
}

function compileStyle(rows) {
	return rows
		.filter(r => r.prop.trim())
		.map(r => `${r.prop.trim()}:${r.val.trim()}`)
		.join(';')
}

function mergeClass(existing, value) {
	const existingClasses = existing ? existing.split(' ').filter(Boolean) : []
	value
		.split(' ')
		.filter(Boolean)
		.forEach(cls => {
			if (!existingClasses.includes(cls)) existingClasses.push(cls)
		})
	return existingClasses.join(' ')
}

// ---------------------------------------------------------------------------
// Estilos del panel (inyectados una sola vez en el head del editor)
// ---------------------------------------------------------------------------
;(function injectStyles() {
	const id = 'pct-ba-styles'
	if (document.getElementById(id)) return
	const style = document.createElement('style')
	style.id = id
	style.textContent = `
		/* Sección dentro del PanelBody */
		.pct-ba-section {
			margin-top: 16px;
			padding: 0;
		}

		/* Input + botón Añadir: mismo alto y tocándose */
		.pct-ba-add-row .components-flex {
			gap: 0 !important;
			align-items: stretch !important;
		}
		.pct-ba-add-row .components-flex-block {
			min-width: 0;
		}
		.pct-ba-add-row .components-flex-block .components-text-control__input {
			border-radius: 2px 0 0 2px !important;
			border-right: 0 !important;
			height: 100%;
			box-sizing: border-box;
		}
		.pct-ba-add-row .components-flex-item .components-button.is-primary {
			border-radius: 0 2px 2px 0 !important;
			height: 100%;
			min-height: unset;
		}

		/* Espacio entre add-row y lista de atributos */
		.pct-ba-attr-list {
			display: flex;
			flex-direction: column;
			gap: 12px;
			margin-top: 20px;
		}

		/* Nombre del atributo encima de la fila */
		.pct-ba-attr-name {
			display: block;
			font-weight: 600;
			font-size: 12px;
			margin-bottom: 4px;
		}

		/* Eliminar margen inferior del TextControl de valor */
		.pct-ba-attr-item .components-base-control {
			margin-bottom: 0;
		}
		.pct-ba-attr-value-row {
			margin-top: 0;
		}

		/* Input de valor + botones: mismo alto y pegados */
		/* Nota: .pct-ba-attr-value-row ES el elemento flex (misma div) */
		.pct-ba-attr-value-row {
			gap: 0 !important;
		}
		.pct-ba-attr-value-row .components-text-control__input {
			border-top-right-radius: 0 !important;
			border-bottom-right-radius: 0 !important;
			border-right: 0 !important;
			box-sizing: border-box;
		}
		.pct-ba-attr-value-row .components-flex-item .components-button {
			height: 100%;
			width: 40px;
			min-height: unset;
			min-width: unset;
			padding: 0 !important;
			justify-content: center;
			border-top-left-radius: 0 !important;
			border-bottom-left-radius: 0 !important;
		}
		/* Botón de editar style (cuando hay dos botones): también pierde el borde derecho */
		.pct-ba-attr-value-row .pct-ba-style-toggle .components-button {
			border-right: 0 !important;
			border-top-right-radius: 0 !important;
			border-bottom-right-radius: 0 !important;
		}

		/* Presets */
		.pct-ba-presets {
			margin-top: 20px !important;
			border-top: 0 !important;

			button.components-button {
				border: 1px solid #e0e0e0;
			}
		}
		.pct-ba-presets-grid {
			display: flex;
			flex-wrap: wrap;
			gap: 4px;
		}

		/* Editor CSS visual */
		.pct-ba-style-editor {
			margin-top: 8px;
			padding: 8px;
			background: #f6f7f7;
			border-radius: 2px;
		}
		.pct-ba-add-style {
			margin-top: 4px !important;
		}


		/* Ordenar paneles del tab Settings: nuestro panel → Avanzado → resto */
		[id$="-settings-view"] {
			display: flex;
			flex-direction: column;
		}
		[id$="-settings-view"] > div:has(.pct-ba-panel) {
			order: -2;
		}
		[id$="-settings-view"] > div:has(.block-editor-block-inspector__advanced) {
			order: -1;
		}
	`
	document.head.appendChild(style)
})()

// ---------------------------------------------------------------------------
// Filter 1 — Registrar atributo blockAttributes en todos los bloques
// ---------------------------------------------------------------------------

wp.hooks.addFilter('blocks.registerBlockType', 'pictau/block-attributes-schema', function (settings, name) {
	if (UNSUPPORTED_BLOCKS.includes(name)) return settings
	return {
		...settings,
		attributes: {
			...settings.attributes,
			blockAttributes: {
				type: 'object',
				default: {},
			},
		},
	}
})

// ---------------------------------------------------------------------------
// Filter 2 — Panel InspectorAdvancedControls en el editor de bloques
// ---------------------------------------------------------------------------

wp.hooks.addFilter('editor.BlockEdit', 'pictau/block-attributes-panel', function (BlockEdit) {
	return function BlockAttributesEdit(props) {
		if (UNSUPPORTED_BLOCKS.includes(props.name)) {
			return wp.element.createElement(BlockEdit, props)
		}

		const { InspectorControls } = wp.blockEditor
		const { TextControl, Button, Flex, FlexItem, FlexBlock, PanelBody } = wp.components
		const { __ } = wp.i18n
		const { useState, useEffect, useRef } = wp.element
		const el = wp.element.createElement

		const blockAttrs = props.attributes.blockAttributes || {}
		const rows = Object.entries(blockAttrs)

		const [newAttrName, setNewAttrName] = useState('')
		const [isStyleOpen, setIsStyleOpen] = useState(false)
		const lastAddedKeyRef = useRef(null)
		const [styleRows, setStyleRows] = useState(() => parseStyle(blockAttrs.style))

		// Resincronizar styleRows cuando cambia el bloque seleccionado
		useEffect(() => {
			setStyleRows(parseStyle(blockAttrs.style))
			setNewAttrName('')
		}, [props.clientId])

		// Enfocar el input de valor del atributo recién añadido
		useEffect(() => {
			const key = lastAddedKeyRef.current
			if (!key) return
			lastAddedKeyRef.current = null
			const item = document.querySelector(`.pct-ba-attr-item[data-attr-key="${CSS.escape(key)}"]`)
			const input = item?.querySelector('.components-text-control__input')
			if (input) input.focus()
		}, [blockAttrs])

		function updateAttrs(updated) {
			props.setAttributes({ blockAttributes: updated })
		}

		function handleValueChange(key, value) {
			updateAttrs({ ...blockAttrs, [key]: value })
		}

		function handleRemove(key) {
			const updated = { ...blockAttrs }
			delete updated[key]
			if (key === 'style') setIsStyleOpen(false)
			updateAttrs(updated)
		}

		function handleAdd() {
			const key = newAttrName.trim()
			if (!key) return
			lastAddedKeyRef.current = key
			updateAttrs({ ...blockAttrs, [key]: '' })
			setNewAttrName('')
		}

		function handleAddKeyDown(e) {
			if (e.key === 'Enter') {
				e.preventDefault()
				handleAdd()
			}
		}

		function handlePreset(preset) {
			const updated = { ...blockAttrs }
			Object.entries(preset.attributes).forEach(([k, v]) => {
				if (k === 'class') {
					updated.class = mergeClass(updated.class || '', v)
				} else {
					updated[k] = v
				}
			})
			updateAttrs(updated)
		}

		// Editor CSS visual
		function handleStyleRowChange(index, field, value) {
			const updated = styleRows.map((r, i) => (i === index ? { ...r, [field]: value } : r))
			setStyleRows(updated)
			handleValueChange('style', compileStyle(updated))
		}

		function handleStyleRowAdd() {
			const updated = [...styleRows, { prop: '', val: '' }]
			setStyleRows(updated)
		}

		function handleStyleRowRemove(index) {
			const updated = styleRows.filter((_, i) => i !== index)
			setStyleRows(updated)
			handleValueChange('style', compileStyle(updated))
		}

		// ---- Render del editor CSS visual ----
		const styleEditor =
			isStyleOpen &&
			el(
				'div',
				{ className: 'pct-ba-style-editor' },
				styleRows.map((row, i) =>
					el(
						Flex,
						{ key: i, gap: 1, align: 'flex-end', className: 'pct-ba-style-row' },
						el(
							FlexBlock,
							null,
							el(TextControl, {
								label: i === 0 ? __('Propiedad', 'pictau') : undefined,
								hideLabelFromVision: i !== 0,
								value: row.prop,
								placeholder: 'opacity',
								onChange: v => handleStyleRowChange(i, 'prop', v),
								__nextHasNoMarginBottom: true,
							})
						),
						el(
							FlexBlock,
							null,
							el(TextControl, {
								label: i === 0 ? __('Valor', 'pictau') : undefined,
								hideLabelFromVision: i !== 0,
								value: row.val,
								placeholder: '0.5',
								onChange: v => handleStyleRowChange(i, 'val', v),
								__nextHasNoMarginBottom: true,
							})
						),
						el(
							FlexItem,
							null,
							el(Button, {
								icon: 'no-alt',
								isSmall: true,
								isDestructive: true,
								label: __('Eliminar propiedad CSS', 'pictau'),
								onClick: () => handleStyleRowRemove(i),
							})
						)
					)
				),
				el(
					Button,
					{
						variant: 'link',
						onClick: handleStyleRowAdd,
						className: 'pct-ba-add-style',
					},
					__('+ Añadir propiedad CSS', 'pictau')
				)
			)

		// ---- Render de la lista de atributos ----
		const attrList = rows.map(([key, value]) =>
			el(
				'div',
				{ key, className: 'pct-ba-attr-item', 'data-attr-key': key },
				el('strong', { className: 'pct-ba-attr-name' }, key),
				el(
					Flex,
					{ gap: 1, align: 'stretch', className: 'pct-ba-attr-value-row' },
					el(
						FlexBlock,
						null,
						el(TextControl, {
							label: key,
							hideLabelFromVision: true,
							value: value,
							placeholder: '',
							onChange: v => handleValueChange(key, v),
							__nextHasNoMarginBottom: true,
						})
					),
					key === 'style' &&
						el(
							FlexItem,
							{ className: 'pct-ba-style-toggle' },
							el(Button, {
								icon: isStyleOpen ? 'arrow-up-alt2' : 'edit',
								isSmall: true,
								label: isStyleOpen ? __('Cerrar editor CSS', 'pictau') : __('Editar estilo visualmente', 'pictau'),
								onClick: () => setIsStyleOpen(!isStyleOpen),
							})
						),
					el(
						FlexItem,
						null,
						el(Button, {
							icon: 'no-alt',
							variant: 'secondary',
							isSmall: true,
							label: __('Eliminar atributo', 'pictau'),
							onClick: () => handleRemove(key),
						})
					)
				),
				key === 'style' && styleEditor
			)
		)

		// ---- Render de presets GSAP ----
		const presetButtons = el(
			PanelBody,
			{ title: __('Presets GSAP', 'pictau'), initialOpen: false, className: 'pct-ba-presets' },
			el(
				'div',
				{ className: 'pct-ba-presets-grid' },
				GSAP_PRESETS.map(preset =>
					el(
						Button,
						{
							key: preset.id,
							variant: 'secondary',
							isSmall: true,
							onClick: () => handlePreset(preset),
						},
						preset.label
					)
				)
			)
		)

		// ---- Fila para añadir atributo ----
		const addRow = el(
			'div',
			{ className: 'pct-ba-add-row', onKeyDown: handleAddKeyDown },
			el(
				Flex,
				{ gap: 2, align: 'flex-end' },
				el(
					FlexBlock,
					null,
					el(TextControl, {
						label: __('Nombre del atributo', 'pictau'),
						hideLabelFromVision: true,
						placeholder: __('Nombre del atributo', 'pictau'),
						value: newAttrName,
						onChange: setNewAttrName,
						__nextHasNoMarginBottom: true,
					})
				),
				el(
					FlexItem,
					null,
					el(
						Button,
						{
							variant: 'primary',
							onClick: handleAdd,
							disabled: !newAttrName.trim(),
						},
						__('Añadir', 'pictau')
					)
				)
			)
		)

		return el(
			wp.element.Fragment,
			null,
			el(BlockEdit, props),
			el(
				InspectorControls,
				null,
				el(
					PanelBody,
					{ title: __('Atributos HTML', 'pictau'), initialOpen: true, className: 'pct-ba-panel' },
					el('div', { className: 'pct-ba-section' }, addRow, rows.length > 0 && el('div', { className: 'pct-ba-attr-list' }, ...attrList), presetButtons)
				)
			)
		)
	}
})

// ---------------------------------------------------------------------------
// Subscriber — Abrir panel "Avanzado" automáticamente al seleccionar un bloque
// ---------------------------------------------------------------------------
;(function () {
	let prevId = null
	wp.data.subscribe(function () {
		const id = wp.data.select('core/block-editor').getSelectedBlockClientId()
		if (id === prevId) return
		prevId = id
		if (!id) return
		setTimeout(function () {
			// Abrir panel Avanzado
			const advanced = document.querySelector('.block-editor-block-inspector__advanced')
			const advToggle = advanced?.querySelector('.components-panel__body-toggle')
			if (advToggle && !advanced.classList.contains('is-opened')) {
				advToggle.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
			}
			// Cerrar paneles del bloque que estén abiertos (excepto el nuestro)
			const slotContainer = document.querySelector('[id$="-settings-view"] > div:has(.pct-ba-panel)')
			if (slotContainer) {
				slotContainer.querySelectorAll('.components-panel__body.is-opened:not(.pct-ba-panel):not(.pct-ba-presets)').forEach(function (panel) {
					const toggle = panel.querySelector('.components-panel__body-toggle')
					if (toggle) toggle.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
				})
			}
		}, 300)
	})
})()

// ---------------------------------------------------------------------------
// Filter 3 — Aplicar atributos en bloques estáticos (getSaveContent)
// ---------------------------------------------------------------------------

wp.hooks.addFilter('blocks.getSaveContent.extraProps', 'pictau/block-attributes-extra-props', function (props, blockType, attributes) {
	const stored = attributes.blockAttributes
	if (!stored || typeof stored !== 'object' || !Object.keys(stored).length) {
		return props
	}

	const merged = { ...props }

	Object.entries(stored).forEach(([key, value]) => {
		if (key === 'class' || key === 'className') {
			merged.className = mergeClass(merged.className || '', value)
		} else if (key === 'style') {
			// PHP render_block gestiona style — omitir aquí para evitar conflictos
			// de tipo objeto vs string en la serialización del bloque.
		} else {
			merged[key] = value
		}
	})

	return merged
})
