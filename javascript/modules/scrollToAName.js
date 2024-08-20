/**
 * Custom animation for slider mercanza MODEL A (launch May 2024)
 * if class "anim-intro" on slider, --> exec gsap animation for intro and (cover)
 *
 */

import { gsap } from 'gsap'
// import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/all'
import { getConfigByAtt } from './attributesToConfigObj'

gsap.registerPlugin(ScrollToPlugin)

document.addEventListener('DOMContentLoaded', () => {
	// window.addEventListener('load', () => {
	const aNames = document.querySelectorAll('a[href*="#"]')
	if (!aNames.length) return

	const linkToSamePage = linkElement => {
		const { origin, pathname, hash } = new URL(document.location)
		return (origin === linkElement.origin && pathname === linkElement.pathname) ?? false
	}

	aNames.forEach(a => {
		const hrefValue = a.getAttribute('href')

		if (hrefValue.split('#')[1].length && linkToSamePage(a)) {
			// const aTarget = console.log(hrefValue, hrefValue.split('#')[1])
			a.addEventListener('click', e => {
				e.preventDefault()
				const target = e.target.getAttribute('href').split('#')[1]

				const filteredTarget = target === 'top' ? false : target

				//automatic offset if WP menu is present
				const offset_WP_menu = document.querySelector('#masthead').getBoundingClientRect() ?? 0

				if (document.querySelector(`#${target}`) || !filteredTarget) {
					gsap.to(window, {
						duration: 0.7,
						scrollTo: {
							y: filteredTarget ? `#${filteredTarget}` : 0,
							offsetY: offset_WP_menu.height ?? 0,
						},
						ease: 'expo.inOut',
						onComplete: () => {
							history.pushState(null, null, `#${target}`)
						},
					})
				}
			})
		}
	})

	if (window.location.hash) {
		const target = window.location.hash.split('#')[1]
		gsap.to(window, {
			duration: 0.7,
			scrollTo: {
				y: `#${target}`,
				offsetY: 0,
			},
			ease: 'expo.inOut',
		})
	}
})
