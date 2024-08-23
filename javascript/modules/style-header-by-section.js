/**
 * Sections with class 'header-styler-section' will make the header style change when section intersects header  by adding a class to the header "section-styled"
 *
 */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

document.addEventListener('DOMContentLoaded', () => {
	const menuStylerSections = document.querySelectorAll('.header-styler-section')
	const header = document.querySelector('#masthead .main-header-wrap')

	if (!menuStylerSections.length || !header) return

	menuStylerSections.forEach(section => {
		let headerBottomTriggerCoord
		let headerTopTriggerCoord
		let sectionTopTrigger
		let sectionBottomTrigger

		const sT = ScrollTrigger.create({
			trigger: section,
			start: () => `top bottom`,
			end: () => `bottom ${header.getBoundingClientRect().y}px `,
			onLeave: obj => {
				header.classList.remove('styled-by-section')
			},
			onUpdate: obj => {
				headerBottomTriggerCoord = header.getBoundingClientRect().y + header.getBoundingClientRect().height
				headerTopTriggerCoord = header.getBoundingClientRect().y
				sectionTopTrigger = obj.trigger.getBoundingClientRect().y
				sectionBottomTrigger = obj.trigger.getBoundingClientRect().y + obj.trigger.getBoundingClientRect().height

				if (sectionTopTrigger <= headerBottomTriggerCoord) {
					header.classList.add('styled-by-section')
				}
				if (sectionBottomTrigger <= headerTopTriggerCoord || sectionTopTrigger > headerBottomTriggerCoord) {
					header.classList.remove('styled-by-section')
				}
			},
			// scrub: true,
			invalidateOnRefresh: true,
			markers: false,
		})
	})
})
