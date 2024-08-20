import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { OverlayScrollbars, ScrollbarsHidingPlugin, SizeObserverPlugin, ClickScrollPlugin } from 'overlayscrollbars'
import { getConfigByAtt } from './attributesToConfigObj'

gsap.registerPlugin(ScrollTrigger)

const hyphenToCamelcase = str => {
	return str.replace(/-([a-z])/g, k => k[1].toUpperCase())
}

const iconClose =
	'<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"/><line x1="200" y1="56" x2="56" y2="200" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"/><line x1="200" y1="200" x2="56" y2="56" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"/></svg>'

document.addEventListener('DOMContentLoaded', () => {
	const attributeId = 'modal'
	const modals = document.querySelectorAll(`[data-${attributeId}]`)

	if (!modals.length) return

	const Modal = class {
		constructor(targetDOMElement, config = {}) {
			const { modal = 'modal', form = false } = config

			this.modalContent = targetDOMElement
			this.modalID = modal
			this.hasForm = form ? true : false
			if (this.hasForm && this.hasForm !== '') this.formInputNameTarget = form

			this.setupModal()
		}

		setupModal = () => {
			this.modal = document.createElement('div')
			this.modal.setAttribute('id', this.modalID)
			this.modal.setAttribute('data-modal', this.modalID)
			this.modal.setAttribute('data-lenis-prevent', '')
			this.modal.setAttribute('class', this.modalContent.classList)

			const backdrop = document.createElement('div')
			backdrop.classList.add('backdrop')
			this.modal.append(backdrop)

			this.closeUI = document.createElement('div')
			this.closeUI.classList.add('icon-close')
			this.closeUI.innerHTML = iconClose

			this.popup = document.createElement('div')
			this.popup.classList.add('content-wrapper')
			this.popup.setAttribute('data-lenis-prevent', '')
			this.modal.append(this.popup)

			this.popupContent = document.createElement('div')
			this.popupContent.classList.add('content')
			this.popup.append(this.popupContent)

			this.modalContent.before(this.modal)
			this.popupContent.innerHTML = this.modalContent.innerHTML

			this.popup.append(this.closeUI)
			this.modalContent.remove()

			if (this.hasForm) {
				this.modalForm = this.popup.querySelector('form')
				this.modalForm.modal = this
				if (this.modalForm && this.formInputNameTarget) {
					const inputTarget = this.modalForm.querySelector(`input[name="${this.formInputNameTarget}"]`)
					if (inputTarget) {
						this.formInputToUpdate = inputTarget
					}
				}
			}

			this.bindFoundLinks()
			this.setupBackdropAsClose()
			this.setOverlayScrollbars()
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

		bindFoundLinks = () => {
			const targetLinks = document.querySelectorAll(`[href="#modal-${this.modalID}"]`)

			if (!targetLinks.length) return
			targetLinks.forEach(link => {
				link.addEventListener('click', e => {
					e.preventDefault()
					let stringToForm
					if (this.hasForm) {
						stringToForm = e.target.dataset['form_content'] ? e.target.dataset['form_content'] : e.target.parentElement.dataset['form_content'] ? e.target.parentElement.dataset['form_content'] : false

						// if (e.target.classList.contains('wp-block-button__link') && !e.target.getAttribute('onclick')) {
						// } else if (e.target.dataset['form_content']) {
						// 	stringToForm = e.target.dataset['form_content']
						// }
					}

					// console.log('stringToForm', stringToForm)
					this.show(stringToForm)
				})
			})
			this.setupModalCloseLinks()
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

		show = stringToForm => {
			if (stringToForm && this.formInputToUpdate) {
				this.formInputToUpdate.value = stringToForm
			}
			this.modal.classList.add('showing')
			window.lenis.stop()
		}

		close = () => {
			window.lenis.start()
			this.overlayscrollbars.update()
			this.modal.classList.remove('showing')

			setTimeout(() => {
				this.popup.querySelector('h3').scrollIntoView(false)
				if (this.hasForm) this.resetForm()
			}, 300)
		}

		resetForm = () => {
			if (this.modalForm.getAttribute('data-status')) this.modalForm.setAttribute('data-status', 'init')
			this.modalForm.classList.remove('sent')

			if (this.formInputToUpdate) this.formInputToUpdate.value = ''
		}

		setupBackdropAsClose = () => {
			const handleBackdropClick = e => {
				e.target.matches('.backdrop') && this.close()
			}
			this.modal.addEventListener('click', handleBackdropClick)
		}
	}

	modals.forEach(modal => {
		const config = getConfigByAtt(modal, attributeId, true)

		// console.log('CONFIG ', config)

		const modalElement = new Modal(modal, config)
		modal.modal = modalElement
	})
})
