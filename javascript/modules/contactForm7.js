/**
 * @author oscar.rey.tajes@gmail.com
 * @version 3.8
 * TODO checkbox when form inside a modelWP.js, won't work when focused + spacebar pressed
 */

/* ------------------------------------------------------------------------------------------------------*\

    CONTACT FORM 7 EVENTS

\*------------------------------------------------------------------------------------------------------ */
import ModalWP from './ModalWP'
import { getConfigByAtt } from './attributesToConfigObj'

// Circle Radio buttons Icons
const iconRadioCheckedSVG =
	'<svg width="30" height="30" class="icon icon-tabler icon-tabler-circle-check" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path class="bg" d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 12l2 2l4 -4" /></svg>'

const iconRadioUncheckedSVG = `<svg width="30" height="30" class="icon icon-tabler icon-tabler-circle" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path class="bg" d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /></svg>`

// Square Check Icons
const iconCheckedSVG =
	'<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-square-check"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" /><path class="bg" d="M9 12l2 2l4 -4" /></svg>'

const iconUncheckedSVG = `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-square"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path class="bg" d="M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" /></svg>`

const iconCogSVG = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-settings-filled" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14.647 4.081a.724 .724 0 0 0 1.08 .448c2.439 -1.485 5.23 1.305 3.745 3.744a.724 .724 0 0 0 .447 1.08c2.775 .673 2.775 4.62 0 5.294a.724 .724 0 0 0 -.448 1.08c1.485 2.439 -1.305 5.23 -3.744 3.745a.724 .724 0 0 0 -1.08 .447c-.673 2.775 -4.62 2.775 -5.294 0a.724 .724 0 0 0 -1.08 -.448c-2.439 1.485 -5.23 -1.305 -3.745 -3.744a.724 .724 0 0 0 -.447 -1.08c-2.775 -.673 -2.775 -4.62 0 -5.294a.724 .724 0 0 0 .448 -1.08c-1.485 -2.439 1.305 -5.23 3.744 -3.745a.722 .722 0 0 0 1.08 -.447c.673 -2.775 4.62 -2.775 5.294 0zm-2.647 4.919a3 3 0 1 0 0 6a3 3 0 0 0 0 -6z" stroke-width="0" fill="currentColor" /></svg>`

const iconAlert = `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="currentColor"  class="icon icon-tabler icons-tabler-filled icon-tabler-alert-square-rounded"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 2l.642 .005l.616 .017l.299 .013l.579 .034l.553 .046c4.687 .455 6.65 2.333 7.166 6.906l.03 .29l.046 .553l.041 .727l.006 .15l.017 .617l.005 .642l-.005 .642l-.017 .616l-.013 .299l-.034 .579l-.046 .553c-.455 4.687 -2.333 6.65 -6.906 7.166l-.29 .03l-.553 .046l-.727 .041l-.15 .006l-.617 .017l-.642 .005l-.642 -.005l-.616 -.017l-.299 -.013l-.579 -.034l-.553 -.046c-4.687 -.455 -6.65 -2.333 -7.166 -6.906l-.03 -.29l-.046 -.553l-.041 -.727l-.006 -.15l-.017 -.617l-.004 -.318v-.648l.004 -.318l.017 -.616l.013 -.299l.034 -.579l.046 -.553c.455 -4.687 2.333 -6.65 6.906 -7.166l.29 -.03l.553 -.046l.727 -.041l.15 -.006l.617 -.017c.21 -.003 .424 -.005 .642 -.005zm.01 13l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-.01 -8a1 1 0 0 0 -.993 .883l-.007 .117v4l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-4l-.007 -.117a1 1 0 0 0 -.993 -.883z" /></svg>`

// const resetForm = form => {
// 	form.reset()
// }

window.addEventListener('load', () => {
	const formContainers = document.querySelectorAll('.wpcf7')

	if (!formContainers.length) return

	const getFormModalContent = form => {
		return form.querySelector('[data-modal]')
	}

	let formCount = 0

	formContainers.forEach(formContainer => {
		formCount += 1
		const form = formContainer.querySelector('form')
		const messageOKElement = getFormModalContent(form)
		const submitButton = form.querySelector('button#submit')

		const insideModal = formContainer.closest('[data-modal]') ?? false // check if the form is inside a modal

		if (messageOKElement) {
			form.messageOK = messageOKElement.cloneNode(true)
			// form.modal = new ModalWP(messageOKElement, { onclose: { callback: resetForm, arg: form }, autoclose: 6000 })
			form.modal = new ModalWP(messageOKElement, { nested: insideModal })

			// form.modal.show()
		} else {
			const messageOK = form.querySelector('.wpcf7-response-output')
			form.modal = new ModalWP(messageOK, { nested: insideModal })
		}

		messageOKElement.style.display = 'none'

		//! ERROR DE VALIDACIÓN, ALGÚN CAMPO NO ES CORRECTO O ES OBLIGATORIO Y ESTÁ VACÍO
		formContainer.addEventListener('wpcf7invalid', event => {
			const formContainer = event.currentTarget
			// const formContainer = document.querySelector(`[id='${event.detail.unitTag}']`)
			const form = formContainer.querySelector('form')

			const btsubmit = formContainer.querySelector('.wpcf7-submit')
			btsubmit.classList.remove('active')
			btsubmit.classList.remove('showIcon')
			// console.log('ERROR DE VALIDACIÓN contactFormId', event.detail.contactFormId)
			// console.log('ERROR DE VALIDACIÓN unitTag', event.detail.unitTag)

			if (form.modal) {
				const message = event.detail.apiResponse.message
				showErrorMessage(message)
			}
		})

		const showErrorMessage = message => {
			const fragChecked = document.createRange().createContextualFragment(iconAlert)

			const errorMessageContainer = document.createElement('div')
			const errorContent = document.createElement('div')
			errorMessageContainer.append(errorContent)
			errorContent.classList.add('error-content')
			errorContent.innerHTML = message
			errorContent.prepend(fragChecked)

			form.modal.show({ content: errorMessageContainer, autoclose: 5000 })
			// form.modal.show({ closecallback: {}, content: errorMessageContainer })
		}

		//! ALL OK, BEFORE SEND
		// A nivel de documento (sirve para todos los formularios CF7 de la página)
		formContainer.addEventListener('wpcf7beforesubmit', event => {
			const inputs = event.detail.inputs // [{ name: 'your-name', value: 'Oscar' }, ...]
			const data = Object.fromEntries(inputs.map(i => [i.name, i.value]))

			// guardamos los campos que nos interesan para enviarlos a dataLayer cuando el formulario se envíe correctamente
			form.emailField = data.email ?? false
			form.productField = data.producto ?? document.title ?? 'contacto'

			// console.log('Antes de enviar, email:', emailField, 'producto:', productField)
		})

		//! ALL OK, SENT
		formContainer.addEventListener('wpcf7mailsent', event => {
			if (event.target.toCloseModal) clearInterval(event.target.toCloseModal)

			const btsubmit = form.querySelector('.wpcf7-submit')

			const modal = form.modal
			const closeCallback = insideModal ? insideModal.modalOBJ.close : false // reference to the modal object of the parent modal

			modal.show({ content: form.messageOK, showcallback: closeCallback })

			//! Enviamos email y producto a dataLayer (Google Tag Manager) si existe.
			if (window.dataLayer && typeof window.dataLayer.push === 'function') {
				window.dataLayer.push({
					email: form.emailField,
					producto: form.productField,
					event: 'form_enviado',
				})
			} else {
				console.warn('GTM no está disponible todavía')
			}

			if (btsubmit) {
				setTimeout(() => {
					btsubmit.classList.remove('active')
					btsubmit.classList.remove('showIcon')
				}, 500)
			}
		})

		//! ERROR, SPAM ACTIVITY
		formContainer.addEventListener('wpcf7spam', event => {
			const message = event.detail.apiResponse.message ?? 'SPAM ACTIVITY'

			if (form.modal) {
				showErrorMessage(message)
			}
			const btsubmit = form.querySelector('.wpcf7-submit')
			btsubmit.classList.remove('active')
			btsubmit.classList.remove('showIcon')
			btsubmit.innerText = 'Volver a enviar'
		})

		//! OK, PERO EL SERVIDOR NO HA PODIDO ENVIAR EL MAIL. PROBLEMA EN EL SERVIDOR SMTP¿?
		formContainer.addEventListener('wpcf7mailfailed', event => {
			const message = event.detail.apiResponse.message ?? false

			if (form.modal) {
				showErrorMessage(message)
			}

			const btsubmit = form.querySelector('.wpcf7-submit')
			btsubmit.classList.remove('active')
			btsubmit.classList.remove('showIcon')
			btsubmit.innerText = 'Volver a enviar'
		})

		// ADD cog icon for working animation...
		const iconSubmitCog = document.createRange().createContextualFragment(iconCogSVG)
		submitButton.append(iconSubmitCog)

		// ! SUBMIT BUTTON CLICK EVENT...
		submitButton.addEventListener('click', e => {
			e.preventDefault()

			const bt = e.currentTarget
			const btClasses = bt.classList

			if (btClasses.contains('active') || btClasses.contains('success')) {
				return
			}
			clearTimeout(window.fto)

			//? fijamos el valor inicial de width para que en el css la animación "to:" funcione...
			// bt.style.width = `${bt.offsetWidth}px`
			bt.classList.add('active')

			bt.addEventListener(
				'animationend',
				() => {
					bt.classList.add('showIcon')
				},
				{ once: true }
			)

			window.fto = setTimeout(function () {
				const form = bt.closest('form')
				window.wpcf7.submit(form)
			}, 800)

			//! Testing errors
			// triggerEvent(formContainer, 'wpcf7mailfailed', { apiResponse: { message: 'PROBLEMA EN EL SERVIDOR SMTP' } })
			// triggerEvent(formContainer, 'wpcf7spam', { apiResponse: { message: 'SPAM ACTIVITY DETECTED<br>Please contact us at support@bankinplay.com' } })
		})
	})
})

const triggerEvent = (formContainer, eventType, detail) => formContainer.dispatchEvent(new CustomEvent(eventType, { detail }))

//! Enable checkbox and radio button to be toggled by spacebar when focused
const enableSwitchBySpacebar = focusedElement => {
	focusedElement.addEventListener('keydown', e => {
		if (document.activeElement === e.target && e.code === 'Space') {
			e.preventDefault()
			const inputTarget = e.target.closest('label').querySelector('input') || e.target.closest('#legal-input').querySelector('input')
			inputTarget.checked = !inputTarget.checked
		}
	})
}

//! checkbox customized with svg
const checkList = document.querySelectorAll('.wpcf7-checkbox:not(.pct-legal-acceptance)')
if (checkList.length) {
	checkList.forEach(check => {
		check.classList.add('novalidate')

		const targetList = check.querySelectorAll('.wpcf7-list-item')

		targetList.forEach(item => {
			const target = item.querySelector('.wpcf7-list-item-label')

			const iconContainer = document.createElement('div')
			iconContainer.classList.add('check-icon-container')
			iconContainer.setAttribute('tabindex', '0')
			target.prepend(iconContainer)

			const fragUnchecked = document.createRange().createContextualFragment(iconUncheckedSVG)
			iconContainer.append(fragUnchecked)

			const fragChecked = document.createRange().createContextualFragment(iconCheckedSVG)
			iconContainer.append(fragChecked)

			//!allow spacebar to toggle checkbox when focused
			enableSwitchBySpacebar(iconContainer)
		})
	})
}

//! radiobutton customized with svg
const radioList = document.querySelectorAll('.wpcf7-radio:not(.pct-legal-acceptance)')
if (radioList.length) {
	radioList.forEach(radio => {
		radio.classList.add('novalidate')

		const targetList = radio.querySelectorAll('.wpcf7-list-item')

		targetList.forEach(item => {
			const target = item.querySelector('.wpcf7-list-item-label')

			const iconContainer = document.createElement('div')
			iconContainer.classList.add('radio-icon-container')
			iconContainer.setAttribute('tabindex', '0')
			target.prepend(iconContainer)

			const fragUnchecked = document.createRange().createContextualFragment(iconRadioUncheckedSVG)
			iconContainer.append(fragUnchecked)

			const fragChecked = document.createRange().createContextualFragment(iconRadioCheckedSVG)
			iconContainer.append(fragChecked)

			//!enable radio button to be toggled by spacebar when focused
			enableSwitchBySpacebar(iconContainer)
		})
	})
}

//! LEGAL CHECKBOX
let cId = 0 // to set an unique id for each checkbox...

document.querySelectorAll('.pct-legal-acceptance').forEach(el => {
	const legalEl = el
	cId += 1
	const check = legalEl.querySelector('input[type="checkbox"]')
	const label = legalEl.parentNode.parentNode.querySelector('.pct-label-for-legal')

	legalEl.classList.add('novalidate')

	check.setAttribute('id', `${label.getAttribute('for')}${cId.toString()}`)
	const newLabel = document.createElement('label')
	newLabel.setAttribute('for', `${label.getAttribute('for')}${cId.toString()}`)
	newLabel.setAttribute('class', 'checkIcon')
	newLabel.setAttribute('tabindex', '0')

	newLabel.innerHTML = label.innerHTML
	check.parentNode.appendChild(newLabel)

	// set noCheckedIcon with base64 svg
	const target_iconUnchecked = legalEl.querySelector('i.ico-unchecked')
	const target_iconChecked = legalEl.querySelector('i.ico-checked')

	const fragUnchecked = document.createRange().createContextualFragment(iconUncheckedSVG)
	target_iconUnchecked.append(fragUnchecked)

	const fragChecked = document.createRange().createContextualFragment(iconCheckedSVG)
	target_iconChecked.append(fragChecked)

	check.style.display = 'none'
	label.remove()
	legalEl.querySelector('.wpcf7-list-item-label').remove()

	//!enable radio button to be toggled by spacebar when focused
	enableSwitchBySpacebar(newLabel)
})
