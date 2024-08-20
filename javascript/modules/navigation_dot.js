import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getConfigByAtt } from './attributesToConfigObj'

gsap.registerPlugin(ScrollTrigger)

const hyphenToCamelcase = str => {
	return str.replace(/-([a-z])/g, k => k[1].toUpperCase())
}

document.addEventListener('DOMContentLoaded', () => {
	const attributeId = 'dotnav'
	const aNameSections = document.querySelectorAll(`[data-${attributeId}]`)

	if (!aNameSections.length) return

	const DotNavigation = class {
		constructor(targetDOMElement, config = {}) {
			const { dotnav: sectionSelector = 'section', position = 'right' } = config

			this.sectionsContainer = targetDOMElement
			this.sectionsSelector = sectionSelector !== '' ? sectionSelector : 'section'
			this.sections = this.sectionsContainer.querySelectorAll(this.sectionsSelector)
			this.position = position
			this.active = false

			if (!this.sections.length) return

			this.setupDotNavigation()
		}

		setupDotNavigation = () => {
			this.navContainer = document.createElement('nav')
			this.navContainer.classList.add('dot-navigation')
			this.navContainer.classList.add(`align-${this.position}`)
			this.navContainer.setAttribute('role', 'menu')
			this.sectionsContainer.prepend(this.navContainer)
			this.navItems = []

			this.sections.forEach(section => {
				section.label = section.dataset['label'] && section.dataset['label'] !== '' ? section.dataset['label'] : section.getAttribute('id')
				const navItem = document.createElement('a')
				navItem.classList.add('nav-item')
				navItem.setAttribute('href', `#${section.getAttribute('id')}`)
				navItem.setAttribute('aria-label', `#${section.getAttribute('id')}`)
				navItem.setAttribute('role', 'menuitem')
				navItem.navigation = this

				const navItemLabel = document.createElement('div')
				navItemLabel.classList.add('label')
				navItemLabel.innerHTML = section.label

				navItem.append(navItemLabel)

				this.navContainer.append(navItem)
				section.dotNavItem = navItem
				this.navItems.push(navItem)

				section.sT = ScrollTrigger.create({
					trigger: section,
					start: `top+=10% 50%`,
					end: 'bottom 50%',
					onEnter: () => {
						section.dotNavItem.navigation.setCurrent(section.dotNavItem)
					},
					onEnterBack: () => {
						section.dotNavItem.navigation.setCurrent(section.dotNavItem)
					},
					onLeave: () => {
						section.dotNavItem.navigation.unsetCurrent(section.dotNavItem)
					},
					onLeaveBack: () => {
						section.dotNavItem.navigation.unsetCurrent(section.dotNavItem)
					},
					markers: false,
					invalidateOnRefresh: true,
				})
			})

			// this.bindSections()
		}

		setCurrent = navItem => {
			this.unsetCurrent(this.active)
			this.active = navItem
			// console.log('navItem current', navItem)
			navItem.classList.add('showing')
		}

		unsetCurrent = navItem => {
			// console.log('unset active', this.active)
			if (this.active && this.active === navItem) this.active.classList.remove('showing')
			this.active = false
		}

		// bindSections = () => {

		// }
	}

	aNameSections.forEach(section => {
		const config = getConfigByAtt(section, attributeId, true)

		// console.log('CONFIG ', config)

		const dotNav = new DotNavigation(section, config)
		section.dotNav = dotNav
	})
})
