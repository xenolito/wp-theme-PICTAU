/**
 * Trigger a modal with a contact form 7 form.
 *
 * The modal HTML element should have the attribute data-modalform="<modal unique ID>".
 *
 *
 * The trigger (button / anchor) element should have the attribute data-modalform_target="<modal unique ID>" which will be used to identify the modal to open.
 * the trigger (button / anchor) element should also need the attribute data-modalform_input_name="<form input name target>".
 * the trigger (button / anchor) element should also need the attribute data-modalform_input_data="<content to set/pass to the form input target>".
 *
 * @license Copyright 2025, Oscar Rey Tajes. All rights reserved.
 * @author: Oscar Rey Tajes, oscar.rey.tajes@gmail.com
 *
 * @param data-webgldots_target=".xxx", optional. If present, will set the target element to apply the effect, value in css selector format, default first child of the container element
 */

import { OverlayScrollbars, ScrollbarsHidingPlugin, SizeObserverPlugin, ClickScrollPlugin } from 'overlayscrollbars'
import { getConfigByAtt } from './attributesToConfigObj'
import ModalWP from './ModalWP'

const hyphenToCamelcase = str => {
	return str.replace(/-([a-z])/g, k => k[1].toUpperCase())
}

document.addEventListener('DOMContentLoaded', () => {
	const attributeId = 'modalform'
	const modals = document.querySelectorAll(`[data-${attributeId}]`)

	if (!modals.length) return

	const ModalForm = class {
		constructor(targetDOMElement, config = {}) {
			const { modalform = 'modal', inputtarget = false } = config

			this.modalContent = targetDOMElement
			this.modalID = modalform

			this.modal = new ModalWP(this.modalContent, {
				id: this.modalID,
				form: true,
			})

			// this.form = this.modal.modalContent.querySelector('form')

			this.form = this.modal.popupContent.querySelector('form')

			if (!this.form) {
				console.warn(`⚠️ El modal "${this.modalID}" (data-modalform="${this.modalID}") no contiene ningún <form>. Comprueba que el formulario de Contact Form 7 referenciado dentro de este bloque exista y no haya sido borrado. Los triggers data-modalform_target="${this.modalID}" no abrirán este modal.`, this.modal.modal)
				return
			}

			// this.setupModal()
			this.bindFoundLinks()

			return this
		}

		replaceTemplateTags = (text, tags) => {
			// Si no hay texto, devolver false
			if (!text) return false

			// Verificar si hay patrones de dobles llaves
			const hasTemplatePattern = /\{\{[^}]*\}\}/g.test(text)

			// Si no encuentra ningún patrón, devolver false
			if (!hasTemplatePattern) return false

			// Reemplazar las plantillas con los valores
			return text.replace(/\{\{([^}]*)\}\}/g, (match, key) => {
				const trimmedKey = key.trim()
				// Si la key está vacía o no existe en tags, devolver string vacío
				if (!trimmedKey || !(trimmedKey in tags)) {
					return ''
				}
				return tags[trimmedKey] || ''
			})
		}

		bindFoundLinks = () => {
			const h1 = document.querySelector('h1')

			if (!h1) {
				console.warn(`⚠️ No se encontró un elemento <h1> para extraer el título del documento. Se usará el título de la página (document.title) como alternativa para las plantillas de tags como {{title}}.`)
			}

			const tags = {
				title: h1 ? h1.textContent : document.title,
			}

			document.addEventListener('click', e => {
				const link = e.target.closest(`[data-modalform_target="${this.modalID}"]`)
				if (!link) return

				e.preventDefault()

				const formInputData = link.dataset['modalform_input_data'] ? link.dataset['modalform_input_data'] : false
				const formInputTargetName = link.dataset['modalform_input_name'] ? link.dataset['modalform_input_name'] : false

				if (formInputTargetName) {
					const processedData = this.replaceTemplateTags(formInputData, tags)
					const dataToPass = processedData !== false ? processedData : formInputData

					this.passDataToForm(formInputTargetName, dataToPass)
				}

				this.modal.show({ closecallback: this.resetPassedDataToForm })
			})
		}

		passDataToForm = (inputFieldTargetName, data) => {
			this.inputTarget = this.form.querySelector(`input[name="${inputFieldTargetName}"]`)

			if (!this.inputTarget) return

			this.inputTarget.value = data ? data : ''
		}

		resetPassedDataToForm = () => {
			if (this.inputTarget) this.inputTarget.value = ''
		}
	}

	modals.forEach((modal, index) => {
		const config = getConfigByAtt(modal, attributeId, true)
		// form.modal = new ModalWP(messageOKElement)
		// console.log('config', config)
		modal.modal = new ModalForm(modal, config)
	})
})
