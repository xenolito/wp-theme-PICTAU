/**
 * ModalWP - A simple modal implementation using OverlayScrollbars
 * @author oscar.rey.tajes@gmail.com
 * @version 5.0
 */

import isSafari from './isSafari'
import { OverlayScrollbars, ScrollbarsHidingPlugin, SizeObserverPlugin, ClickScrollPlugin } from 'overlayscrollbars'
// import { getConfigByAtt } from './attributesToConfigObj'

const hyphenToCamelcase = str => {
	return str.replace(/-([a-z])/g, k => k[1].toUpperCase())
}

const iconClose =
	'<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"/><line x1="200" y1="56" x2="56" y2="200" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"/><line x1="200" y1="200" x2="56" y2="56" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"/></svg>'

/**
 * @author oscar.rey.tajes@gmail.com
 * @version 3.7
 * @license Copyright 2008-2025, Oscar Rey Tajes. All rights reserved.
 * @param targetDOMElement (HtmlElement)
 * @param config (object)
 * @param id (string) - Optional, if not provided a random ID will be generated
 * @param nested (modalObject | false) - If not false, the modal containing this nested modal
 * @param form (boolean) - If true, the modal contains a form
 * @param onclose (object)
 * @param callback (function)
 * @param arg (any)
 * @param autoclose (number)
 *
 */

const ModalWP = class {
	constructor(targetDOMElement, config = {}) {
		const { id = false, nested = false, onclose = false, autoclose = false, form = false } = config

		this.modalContent = targetDOMElement
		// this.modalID = this.modalContent.dataset.modal ?? window.crypto.randomUUID()
		// this.modalID = (this.modalContent.dataset.modal ?? id) ? id : window.crypto.randomUUID()

		this.modalID = id ? id : this.modalContent.dataset.modal ? this.modalContent.dataset.modal : window.crypto.randomUUID()
		this.nested = nested
		// this.modalID = window.crypto.randomUUID()
		this.hasForm = form ? true : false
		this.closeCallback = onclose
		this.autoclose = autoclose ? Number(autoclose) : false
		// if (this.hasForm && this.hasForm !== '') this.formInputNameTarget = form

		this.setupModal()
	}

	// No hace falta [data-lenis-prevent] en .modal/.popup: show() llama a lenis.stop()
	// (más abajo), y con Lenis parado + `allowNestedScroll: true` en smooth_scroll.js,
	// Lenis ya deja pasar el wheel/touch nativo hacia el contenedor con overflow real
	// (el viewport que crea OverlayScrollbars dentro de .content, ver setOverlayScrollbars)
	// sin necesidad de marcarlo a mano, y bloquea el resto del modal (backdrop, icono de
	// cerrar) con preventDefault por estar isStopped — así que la página no puede
	// scrollear detrás del modal fijo. Verificado con Playwright: scroll interno OK,
	// window.scrollY no se mueve ni sobre el backdrop ni sobre el contenido.
	setupModal = () => {
		this.modal = document.createElement('div')
		this.modal.setAttribute('id', `${this.modalID}-${window.crypto.randomUUID()}`)
		this.modal.setAttribute('data-modal', this.modalID)
		this.modal.style.setProperty('--modal-height', window.outerHeight + 'px')

		if (this.modalContent.classList.length) this.modal.setAttribute('class', this.modalContent.classList)
		this.modal.modalOBJ = this

		const backdrop = document.createElement('div')
		backdrop.classList.add('backdrop')
		this.modal.append(backdrop)

		this.closeUI = document.createElement('div')
		this.closeUI.classList.add('icon-close')
		this.closeUI.setAttribute('role', 'button')
		this.closeUI.setAttribute('tabindex', '0')
		this.closeUI.setAttribute('aria-label', 'Cerrar')
		this.closeUI.innerHTML = iconClose

		this.popup = document.createElement('div')
		this.popup.classList.add('content-wrapper')
		this.popup.classList.add('popup')
		if (this.nested) this.popup.classList.add('nested')
		this.modal.append(this.popup)

		this.popupContent = document.createElement('div')
		this.popupContent.classList.add('content')
		this.popup.append(this.popupContent)

		// this.popupContent.innerHTML = this.modalContent.innerHTML

		this.popup.append(this.closeUI)
		// this.modalContent.remove()

		document.querySelector('body').append(this.modal)

		// 	console.log(this.modalForm)

		// 	this.modalForm.modal = this
		// 	if (this.modalForm && this.formInputNameTarget) {
		// 		const inputTarget = this.modalForm.querySelector(`input[name="${this.formInputNameTarget}"]`)
		// 		if (inputTarget) {
		// 			this.formInputToUpdate = inputTarget
		// 		}
		// 	}
		// }

		this.setupModalCloseLinks()

		this.setupBackdropAsClose()
		this.setupFocusTrap()
		this.setModalContent(this.modalContent)
	}

	//! Atrapa el foco dentro de la modal: Tab en el último elemento vuelve al primero,
	//! Shift+Tab en el primero va al último (el icono de cerrar), sin salir nunca de la modal.
	setupFocusTrap = () => {
		this.modal.addEventListener('keydown', e => {
			if (e.code !== 'Tab' || !this.modal.classList.contains('showing')) return

			const focusableEls = Array.from(
				this.modal.querySelectorAll(
					'a[href], button:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
				)
			).filter(el => el.offsetParent !== null)

			if (!focusableEls.length) return

			const first = focusableEls[0]
			const last = focusableEls[focusableEls.length - 1]

			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault()
				last.focus()
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault()
				first.focus()
			}
		})
	}

	setModalContent = node => {
		const isHTMLElement = node.toString() === '[object HTMLDivElement]' || node.toString() == '[object HTMLElement]' ? true : false

		this.popupContent.innerHTML = ''

		if (isHTMLElement) {
			// Mueve los nodos reales (no clona vía innerHTML) para conservar los listeners ya enlazados
			// (p.ej. accesibilidad de teclado de checkboxes/radio de contactForm7.js). innerHTML + reparse
			// preserva atributos pero destruye cualquier listener añadido con addEventListener.
			while (node.firstChild) {
				this.popupContent.append(node.firstChild)
			}
		} else {
			this.popupContent.innerHTML = node
		}

		this.modalContent = this.popupContent // prevents memory leaks when removing original DOM node
		node.remove()

		if (this.overlayscrollbars) this.overlayscrollbars.destroy()
		this.setOverlayScrollbars()

		if (this.hasForm) {
			this.form = this.popup.querySelector('form')
		}
	}

	setOverlayScrollbars = () => {
		this.overlayscrollbars = OverlayScrollbars(this.popupContent, {
			paddingAbsolute: false,
			showNativeOverlaidScrollbars: false,
			scrollbars: {
				theme: 'os-theme-dark',
				visibility: 'visible',
				autoHide: 'leave',
				autoHideDelay: 1300,
				autoHideSuspend: false,
				dragScroll: true,
				clickScroll: false,
				pointers: ['mouse', 'touch'],
				// pointers: ['mouse'],
			},
			overflow: {
				x: 'hidden',
				// y: 'scroll',
			},
		})
	}

	setupModalCloseLinks = () => {
		this.closeUI.addEventListener('click', e => {
			this.close()
		})

		//! El icono de cerrar es un <div>, no un <button>: espacio/intro no lo activan de forma nativa.
		this.closeUI.addEventListener('keydown', e => {
			if (e.code !== 'Space' && e.code !== 'Enter') return
			e.preventDefault()
			this.close()
		})

		this.modal.querySelectorAll('[href*="#close"]').forEach(close => {
			close.addEventListener('click', e => {
				e.preventDefault()
				this.close()
			})
		})
	}

	/**
	 * Show the modal
	 * @param {number} autoclose - Time in ms to autoclose the modal
	 * @param {string} stringToForm - String to be set in the targeted form input
	 */
	show = (config = {}) => {
		const { autoclose, content = false, closecallback = null, showcallback, stringToForm } = config

		this.closeCallback = closecallback

		if (this.iToClose) clearTimeout(this.iToClose)

		if (stringToForm && this.formInputToUpdate) {
			this.formInputToUpdate.value = stringToForm
		}

		if (content) {
			this.setModalContent(content)
		}

		if (this.overlayscrollbars) this.overlayscrollbars.update()

		if (window.lenis) window.lenis.stop()

		this.modal.classList.add('showing')

		//! Mueve el foco al primer campo del formulario al mostrar la modal (accesibilidad de teclado).
		if (this.hasForm && this.form) {
			requestAnimationFrame(() => {
				const focusable = Array.from(
					this.form.querySelectorAll(
						'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [role="checkbox"], [role="radio"]'
					)
				).find(el => el.offsetParent !== null)

				if (focusable) focusable.focus()
			})
		}

		if (autoclose) {
			this.iToClose = setTimeout(() => this.close(closecallback), autoclose)
			return
		}

		if (this.autoclose) this.iToClose = setTimeout(() => this.close(), autoclose)

		if (showcallback) {
			showcallback()
		}
	}

	close = () => {
		if (isSafari() && window.lenis) {
			this.scrollPos = window.lenis.actualScroll //! used to fix Safari scroll position when closing the modal and restarting lenis with lenis.start()
		}

		// if (closecallback) console.log('closecallback', closecallback)

		if (this.closeCallback) {
			this.closeCallback()
		}

		if (this.iToClose) clearTimeout(this.iToClose)

		this.overlayscrollbars.update()
		this.modal.classList.remove('showing')

		if (window.lenis) window.lenis.start()

		if (isSafari()) {
			//! To fix Safari scroll position after lenis.start() ¯\_(ツ)_/¯
			window.scrollTo({
				top: this.scrollPos,
				left: 0,
				behavior: 'instant',
			})
		}

		if (this.form) {
			this.resetForm()
		}
	}

	resetForm = () => {
		this.form.reset()
	}

	setupBackdropAsClose = () => {
		const handleBackdropClick = e => {
			e.target.matches('.backdrop') && this.close()
		}
		this.modal.addEventListener('click', handleBackdropClick)
	}
}

export default ModalWP
