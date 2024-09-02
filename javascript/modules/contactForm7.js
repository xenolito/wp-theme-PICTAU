/**
 * @author oscar.rey.tajes@gmail.com
 * @version 3.1
 */

/* ------------------------------------------------------------------------------------------------------*\

    CONTACT FORM 7 EVENTS

\*------------------------------------------------------------------------------------------------------ */

// Circle Check Icons
// const iconCheckedSVG =
// 	'<svg width="30" height="30" class="icon icon-tabler icon-tabler-circle-check" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path class="bg" d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 12l2 2l4 -4" /></svg>'

// const iconUncheckedSVG = `<svg width="30" height="30" class="icon icon-tabler icon-tabler-circle" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path class="bg" d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /></svg>`

// Square Check Icons
const iconCheckedSVG =
	'<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-square-check"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" /><path class="bg" d="M9 12l2 2l4 -4" /></svg>'

const iconUncheckedSVG = `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-square"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path class="bg" d="M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" /></svg>`

const iconGogSVG = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-settings-filled" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14.647 4.081a.724 .724 0 0 0 1.08 .448c2.439 -1.485 5.23 1.305 3.745 3.744a.724 .724 0 0 0 .447 1.08c2.775 .673 2.775 4.62 0 5.294a.724 .724 0 0 0 -.448 1.08c1.485 2.439 -1.305 5.23 -3.744 3.745a.724 .724 0 0 0 -1.08 .447c-.673 2.775 -4.62 2.775 -5.294 0a.724 .724 0 0 0 -1.08 -.448c-2.439 1.485 -5.23 -1.305 -3.745 -3.744a.724 .724 0 0 0 -.447 -1.08c-2.775 -.673 -2.775 -4.62 0 -5.294a.724 .724 0 0 0 .448 -1.08c-1.485 -2.439 1.305 -5.23 3.744 -3.745a.722 .722 0 0 0 1.08 -.447c.673 -2.775 4.62 -2.775 5.294 0zm-2.647 4.919a3 3 0 1 0 0 6a3 3 0 0 0 0 -6z" stroke-width="0" fill="currentColor" /></svg>`

// const iconAlert = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-alert-circle-filled" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 2c5.523 0 10 4.477 10 10a10 10 0 0 1 -19.995 .324l-.005 -.324l.004 -.28c.148 -5.393 4.566 -9.72 9.996 -9.72zm.01 13l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-.01 -8a1 1 0 0 0 -.993 .883l-.007 .117v4l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-4l-.007 -.117a1 1 0 0 0 -.993 -.883z" stroke-width="0" fill="#ffffff" /></svg>`;

// const iconAlertB64 = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGNsYXNzPSJpY29uIGljb24tdGFibGVyIGljb24tdGFibGVyLWFsZXJ0LWNpcmNsZS1maWxsZWQiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZT0iI2ZmZmZmZiIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBzdHJva2U9Im5vbmUiIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMTIgMmM1LjUyMyAwIDEwIDQuNDc3IDEwIDEwYTEwIDEwIDAgMCAxIC0xOS45OTUgLjMyNGwtLjAwNSAtLjMyNGwuMDA0IC0uMjhjLjE0OCAtNS4zOTMgNC41NjYgLTkuNzIgOS45OTYgLTkuNzJ6bS4wMSAxM2wtLjEyNyAuMDA3YTEgMSAwIDAgMCAwIDEuOTg2bC4xMTcgLjAwN2wuMTI3IC0uMDA3YTEgMSAwIDAgMCAwIC0xLjk4NmwtLjExNyAtLjAwN3ptLS4wMSAtOGExIDEgMCAwIDAgLS45OTMgLjg4M2wtLjAwNyAuMTE3djRsLjAwNyAuMTE3YTEgMSAwIDAgMCAxLjk4NiAwbC4wMDcgLS4xMTd2LTRsLS4wMDcgLS4xMTdhMSAxIDAgMCAwIC0uOTkzIC0uODgzeiIgc3Ryb2tlLXdpZHRoPSIwIiBmaWxsPSIjZmZmZmZmIiAvPjwvc3ZnPg==`;

// trim polyfill : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
if (!String.prototype.trim) {
	;(function () {
		// Make sure we trim BOM and NBSP
		const rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g
		// eslint-disable-next-line
		String.prototype.trim = function () {
			return this.replace(rtrim, '')
		}
	})()
}

window.addEventListener('load', () => {
	document.querySelectorAll('.wpcf7 .wpcf7-submit').forEach(el => {
		// ADD cog icon for working animation...
		const targetForIcon = el.querySelector('i')
		if (!targetForIcon) {
			console.log('⛔️ "Contact Form 7" form code doesn\'t have a submit button with an <i> icon??')
			return
		}

		const iconSubmitCog = document.createRange().createContextualFragment(iconGogSVG)
		targetForIcon.append(iconSubmitCog)

		// ! SUBMIT BUTTON CLICK EVENT...
		el.addEventListener('click', e => {
			e.preventDefault()

			const bt = e.currentTarget
			const btClasses = bt.classList

			if (btClasses.contains('active') || btClasses.contains('success')) {
				return
			}
			clearTimeout(window.fto)

			//? fijamos el valor inicial de width para que en el css la animación "to:" funcione...
			bt.style.width = `${bt.offsetWidth}px`
			bt.classList.add('active')

			bt.addEventListener(
				'animationend',
				() => {
					bt.querySelector('i').classList.add('showIcon')
				},
				{ once: true }
			)

			window.fto = setTimeout(function () {
				const form = bt.closest('form')
				wpcf7.submit(form) // eslint-disable-line
			}, 800)
		})
	})
})

//! ERROR DE VALIDACIÓN, ALGÚN CAMPO NO ES CORRECTO O ES OBLIGATORIO Y ESTÁ VACÍO
document.addEventListener('wpcf7invalid', event => {
	const form = document.querySelector(`[id='${event.detail.unitTag}']`)

	const btsubmit = form.querySelector('.wpcf7-submit')
	btsubmit.classList.remove('active')
	btsubmit.querySelector('i').classList.remove('showIcon')
	// console.log('ERROR DE VALIDACIÓN contactFormId', event.detail.contactFormId)
	// console.log('ERROR DE VALIDACIÓN unitTag', event.detail.unitTag)
})

//! OK, PERO EL SERVIDOR NO HA PODIDO ENVIAR EL MAIL. PROBLEMA EN EL SERVIDOR SMTP¿?
document.addEventListener('wpcf7mailfailed', event => {
	const form = document.querySelector(`[id='${event.detail.unitTag}']`)
	const btsubmit = form.querySelector('.wpcf7-submit')
	btsubmit.classList.remove('active')
	btsubmit.querySelector('i').classList.remove('showIcon')
	btsubmit.innerText = 'Volver a enviar'
})

//! ERROR, SPAM ACTIVITY
document.addEventListener('wpcf7mailfailed', event => {
	console.log('SPAM ACTIVITY', event.detail.contactFormId)
	const form = document.querySelector(`[id='${event.detail.unitTag}']`)
	const btsubmit = form.querySelector('.wpcf7-submit')
	btsubmit.classList.remove('active')
	btsubmit.querySelector('i').classList.remove('showIcon')
	btsubmit.innerText = 'Volver a enviar'
})

//! ALL OK, SENT
document.addEventListener('wpcf7mailsent', event => {
	if (event.target.toCloseModal) clearInterval(event.target.toCloseModal)
	let modal = event.target.modal
	if (modal) {
		event.target.toCloseModal = setTimeout(() => {
			modal.close()
		}, 6000)
	}
	const form = document.querySelector(`[id='${event.detail.unitTag}']`)
	const btsubmit = form.querySelector('.wpcf7-submit')
	if (btsubmit)
		setTimeout(() => {
			btsubmit.classList.remove('active')
		}, 500)
})

//! checkbox customized with svg
const checkList = document.querySelectorAll('.wpcf7-checkbox:not(.pct-legal-acceptance)')
if (checkList.length) {
	checkList.forEach(check => {
		const targetList = check.querySelectorAll('.wpcf7-list-item')

		targetList.forEach(item => {
			const target = item.querySelector('.wpcf7-list-item-label')

			const iconContainer = document.createElement('div')
			iconContainer.classList.add('check-icon-container')
			target.prepend(iconContainer)

			const fragUnchecked = document.createRange().createContextualFragment(iconUncheckedSVG)
			iconContainer.append(fragUnchecked)

			const fragChecked = document.createRange().createContextualFragment(iconCheckedSVG)
			iconContainer.append(fragChecked)
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
})
