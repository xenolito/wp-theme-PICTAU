/**
 * Multiple cpt events selector for contact form 7 (used @ bankinplay.com)
 * version: 1.4
 * @license Copyright 2008-2025, Oscar Rey Tajes. All rights reserved.
 * @author: Oscar Rey Tajes, oscar.rey.tajes@gmail.com
 * © @xenolito 2025
 *
 */

import { getConfigByAtt } from './attributesToConfigObj'

const hyphenToCamelcase = str => {
	return str.replace(/-([a-z])/g, k => k[1].toUpperCase())
}

const getRandom = (min, max) => {
	return Math.random() * (max - min) + min
}

document.addEventListener('DOMContentLoaded', () => {
	const attributeId = 'event_selector'
	const eventsContainer = document.querySelectorAll(`[data-${attributeId}]`)

	if (!eventsContainer.length) return

	const EventSelector = class {
		constructor(eventContainer, config = {}) {
			const { log = false, form = false, formfieldtarget = false, nothingselectedmsg = false } = config

			// console.log('repeat hardcoded', repeat)

			this.eventContainer = eventContainer
			this.form = document.querySelector(`form#${form}`)
			this.formfieldTargetName = formfieldtarget
			this.nothingselectedmsg = nothingselectedmsg

			this.enrolled = []

			this.log = log === 'true' || log === '1' ? true : false

			if (this.log) console.log(`log activated for ${this.eventContainer} with class: ${this.eventContainer.classList}`)
			if (!this.form) {
				console.warn(
					'⛔️ missing form id or wrong id --> form not found!. Please add an id to the CF7 form an set it at the shortcode\'s attribute [events-by-cat form_id="<formID>"] for linking it to the event selector'
				)
				return
			}

			this.formData = new FormData(this.form)

			if (!this.formData.has(this.formfieldTargetName)) {
				console.warn(
					'⛔️ missing form field target for storing events or wrong id --> Please, make sure the CF7 form has a field with the id provided by the shortcode\'s attribute [events-by-cat form_field_target="<formfieldtargetID>"] for linking it to the event selector'
				)
				return
			}

			this.formfieldTarget = this.form.querySelector(`[name="${this.formfieldTargetName}"`)
			this.nothing_selected = this.form.querySelector(`.${this.nothingselectedmsg}`)

			if (!this.nothing_selected) {
				console.warn(
					'⛔️ Warning, missing Nothing selected htmlElement for user message when there in no selection to be used for enrollment.\nPlease check the shortcode\'s attribute [events-by-cat form_nothingselected_msg="<css class name>"] for linking it to the event selector'
				)
			}

			this.init()
		}

		setupUI = () => {
			// this.formfieldTarget.style.display = 'none'

			this.disableFormSend()
			this.events = this.eventContainer.querySelectorAll('.event-item:not(.expired)')
			// console.log('setupUI', this.events.length, this.events)

			this.events.forEach(event => {
				event.data = {
					day: event.querySelector('.day-number').innerText,
					dayNumber: Number(event.querySelector('.day-number').innerText.split(' ')[0]),
					time: event.querySelector('.day-wn-hour').innerText,
					name: event.querySelector('.event-name').innerText,
				}

				event.switcher = event.querySelector('.toggle-ui input')

				event.addEventListener('click', e => {
					this.add(event)
					this.updateForm()
				})
			})
		}

		init = () => {
			this.setupUI()
		}

		add = event => {
			if (event.classList.contains('enrolled')) {
				this.remove(event)
				return
			}
			event.classList.add('enrolled')

			if (event.switcher) {
				event.switcher.checked = true
			}

			this.clean(event)
			this.enrolled = [...this.enrolled, event]
		}

		remove = event => {
			event.classList.remove('enrolled')
			if (event.switcher) {
				event.switcher.checked = false
			}

			this.clean(event)
		}

		clean = event => {
			// remove event if already enrolled
			this.enrolled = this.enrolled.filter(e => e !== event)
		}

		updateForm = () => {
			// Ordena los elementos this.enrolled por la fecha del atributo data-event_date
			const enrolledSorted = [...this.enrolled].sort((a, b) => {
				const da = a.getAttribute('data-event_date') || ''
				const db = b.getAttribute('data-event_date') || ''

				// Parse seguro: 2025-09-30 21:30 -> 2025-09-30T21:30 (hora local del navegador)
				const ta = Date.parse(da.replace(' ', 'T'))
				const tb = Date.parse(db.replace(' ', 'T'))

				// Fallbacks: los que no puedan parsearse van al final; si son iguales, ordena por nombre
				if (isNaN(ta) && isNaN(tb)) return a.data.name.localeCompare(b.data.name)
				if (isNaN(ta)) return 1
				if (isNaN(tb)) return -1
				if (ta === tb) return a.data.name.localeCompare(b.data.name)
				return ta - tb
			})

			const dataToSend = enrolledSorted.map(e => `${e.data.day} / ${e.data.time} -- ${e.data.name} \r\n--------------\r\n `)

			this.formfieldTarget.value = dataToSend.join('')
			this.updateEnrolledFormUI()
		}

		// updateForm = () => {
		// 	const dataToSend = this.enrolled.map(e => `${e.data.day} / ${e.data.time} -- ${e.data.name} \r\n--------------\r\n `)
		// 	console.log('dataToSend: ', dataToSend)
		// 	dataToSend.sort()
		// 	this.formfieldTarget.value = dataToSend.join('')
		// 	this.updateEnrolledFormUI()
		// }

		updateEnrolledFormUI = () => {
			if (!this.form.querySelector('.enrolled-ui')) {
				this.enrolledUI = document.createElement('div')
				this.enrolledUI.classList.add('enrolled-ui')
				this.enrolledUI_container = document.createElement('div')
				this.enrolledUI_container.classList.add('container')
				this.enrolledUI.append(this.enrolledUI_container)

				const appendBefore = this.nothing_selected ?? this.formfieldTarget
				appendBefore.before(this.enrolledUI)
			}
			this.enrolledUI_container.replaceChildren()

			// const enrolledTemp = this.enrolled.sort((a, b) => a.data.dayNumber - b.data.dayNumber)

			const enrolledTemp = [...this.enrolled].sort((a, b) => {
				const ta = Date.parse((a.getAttribute('data-event_date') || '').replace(' ', 'T'))
				const tb = Date.parse((b.getAttribute('data-event_date') || '').replace(' ', 'T'))
				if (isNaN(ta) && isNaN(tb)) return a.data.name.localeCompare(b.data.name)
				if (isNaN(ta)) return 1
				if (isNaN(tb)) return -1
				if (ta === tb) return a.data.name.localeCompare(b.data.name)
				return ta - tb
			})

			if (!enrolledTemp.length) {
				this.disableFormSend()
				return
			}

			enrolledTemp.forEach(elem => {
				const clone = elem.cloneNode(true)
				this.enrolledUI_container.append(clone)
			})

			this.enableFormSend()
		}

		disableFormSend = () => {
			if (this.nothing_selected) this.nothing_selected.style.display = 'flex'
			this.bt_submit = this.form.querySelector('#submit')
			this.legal = this.form.querySelector('.legal-content')

			this.bt_submit.classList.add('disabled')
			this.legal.style.display = 'none'
		}

		enableFormSend = () => {
			if (this.nothing_selected) this.nothing_selected.style.display = 'none'
			// this.bt_submit = this.form.querySelector('#submit')
			// this.legal = this.form.querySelector('.legal-content')

			this.bt_submit.classList.remove('disabled')
			this.legal.style.display = 'block'
		}
	}

	eventsContainer.forEach(eventContainer => {
		const config = getConfigByAtt(eventContainer, attributeId, true)
		// console.log('CONFIG ', config)
		eventContainer.eventSelector = new EventSelector(eventContainer, config)
	})
})
