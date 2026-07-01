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

	setupModal = () => {
		this.modal = document.createElement('div')
		this.modal.setAttribute('id', `${this.modalID}-${window.crypto.randomUUID()}`)
		this.modal.setAttribute('data-modal', this.modalID)
		this.modal.setAttribute('data-lenis-prevent', '')
		this.modal.style.setProperty('--modal-height', window.outerHeight + 'px')

		if (this.modalContent.classList.length) this.modal.setAttribute('class', this.modalContent.classList)
		this.modal.modalOBJ = this

		const backdrop = document.createElement('div')
		backdrop.classList.add('backdrop')
		this.modal.append(backdrop)

		this.closeUI = document.createElement('div')
		this.closeUI.classList.add('icon-close')
		this.closeUI.innerHTML = iconClose

		this.popup = document.createElement('div')
		this.popup.classList.add('content-wrapper')
		this.popup.classList.add('popup')
		if (this.nested) this.popup.classList.add('nested')
		this.popup.setAttribute('data-lenis-prevent', '')
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
		this.setModalContent(this.modalContent)
	}

	setModalContent = node => {
		const isHTMLElement = node.toString() === '[object HTMLDivElement]' || node.toString() == '[object HTMLElement]' ? true : false

		this.popupContent.innerHTML = isHTMLElement ? node.innerHTML : node

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
			update: {
				// elementEvents: [['[data-modal]', '.content']],
				elementEvents: [['[data-modal]']],
			},
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
