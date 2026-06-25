// @param	HTMLElement	headerContainerElement	Header element, needed to be container of submenus container
// @param	String 			visualPositioning				'visuallyUnderParent'|'fullWidth'
// @param	Object			options									{ safetyPadding: number } — px margin from viewport edges (fallback if --submenu-safety-horizontal-padding CSS var is not set)

const parseCssPxValue = value => {
	const trimmed = value.trim()
	if (!trimmed) return null
	if (trimmed.endsWith('rem')) {
		const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
		return parseFloat(trimmed) * rootFontSize
	}
	const px = parseFloat(trimmed)
	return isNaN(px) ? null : px
}

const makeMainNavSubmenusLayoutAnchor = (headerContainerElement, visualPositioning, { safetyPadding = 16 } = {}) => {
	const cssVarRaw = getComputedStyle(document.documentElement).getPropertyValue('--submenu-safety-horizontal-padding')
	const resolvedPadding = parseCssPxValue(cssVarRaw) ?? safetyPadding
	const visuallyBelowParent = visualPositioning === 'visuallyUnderParent'
	const delayToAutoHide = 400
	const status = {
		showing: null,
		ttHide: null,
	}

	// create Main Header Desktop submenus container
	const navHeaderSubmenusContainer = document.createElement('div')
	navHeaderSubmenusContainer.setAttribute('class', 'main-nav-desktop-submenus-wrap')
	headerContainerElement.prepend(navHeaderSubmenusContainer)

	// if not submenus present, don't do anything --> exit
	if (!document.querySelectorAll('.sub-menu').length) return

	// moves an element to a new parent
	const moveElementToNewParent = (el, newParent) => {
		newParent.append(el)
	}

	const positionChildCentered = childElement => {
		const headerWrapperHeight = headerContainerElement.offsetHeight
		const offsetY = headerWrapperHeight * 0.5 + 5

		const containerPos = childElement.parentElement.getBoundingClientRect()
		const parent = childElement.parentMenuItem
		const parentPos = parent.getBoundingClientRect()

		const submenuWidth = childElement.offsetWidth
		const viewportWidth = window.innerWidth

		childElement.style.top = `${parentPos.y - containerPos.y + offsetY}px`

		// If submenu is too wide to fit with safety margins on both sides, center it at viewport center.
		// CSS must ensure it never exceeds 100vw.
		if (submenuWidth > viewportWidth - resolvedPadding * 2) {
			const viewportCenteredX = viewportWidth / 2 - submenuWidth / 2 - containerPos.left
			childElement.style.translate = `${viewportCenteredX}px 0`
			return
		}

		// Center submenu horizontally under parent
		const parentCenterX = parentPos.left + parentPos.width / 2
		const centeredX = parentCenterX - submenuWidth / 2 - containerPos.left

		childElement.style.translate = `${centeredX}px 0`

		// Correct left viewport overflow (minimum nudge)
		const leftEdge = childElement.getBoundingClientRect().left
		if (leftEdge < resolvedPadding) {
			childElement.style.translate = `${centeredX + (resolvedPadding - leftEdge)}px 0`
		}

		// Correct right viewport overflow (minimum nudge)
		const rightEdge = childElement.getBoundingClientRect().right
		if (rightEdge > viewportWidth - resolvedPadding) {
			const currentX = parseFloat(childElement.style.translate)
			childElement.style.translate = `${currentX - (rightEdge - (viewportWidth - resolvedPadding))}px 0`
		}
	}

	const showChildren = parentMenu => {
		positionChildCentered(parentMenu.submenu)
		parentMenu.submenu.classList.add('showing')
		parentMenu.classList.add('opened')
	}

	const hideCurrentSubmenu = () => {
		if (status.showing) {
			status.showing.classList.remove('showing')
			status.showing.parentMenuItem.classList.remove('opened')
		}
	}

	//tarverse all menu items to find submenus to extract to navHeaderSubmenusContainer...
	document.querySelectorAll('.main-nav-desktop #primary-menu > .menu-item').forEach(menuItem => {
		const parentItemId = menuItem.getAttribute('id')

		// if has childs (submenus) then move them to the navHeaderSubmenuContainer
		const submenuElement = menuItem.querySelector('.sub-menu')

		if (submenuElement) {
			const submenuContainer = document.createElement('div')
			submenuContainer.setAttribute('class', `${parentItemId}-submenu sub-menu-container`)

			// set a reference to the parent
			submenuContainer.parentMenuItem = menuItem
			submenuContainer.status = status
			// add eventListener to stop autoHide
			submenuContainer.addEventListener('mouseover', ev => {
				clearTimeout(ev.currentTarget.status.ttHide)
			})

			submenuContainer.addEventListener('mouseout', ev => {
				ev.currentTarget.status.ttHide = setTimeout(hideCurrentSubmenu, delayToAutoHide)
			})

			// set a reference to the child submenu
			menuItem.submenu = submenuContainer
			menuItem.status = status

			navHeaderSubmenusContainer.append(submenuContainer)

			moveElementToNewParent(submenuElement, submenuContainer)

			if (visuallyBelowParent) {
				menuItem.addEventListener('click', ev => {
					if (ev.target.href === '#') ev.preventDefault()
				})

				menuItem.addEventListener('mouseover', ev => {
					clearTimeout(ev.currentTarget.status.ttHide)
					if (ev.currentTarget.status.showing) {
						hideCurrentSubmenu()
					}
					ev.currentTarget.status.showing = ev.currentTarget.submenu

					showChildren(ev.currentTarget)
				})
				menuItem.addEventListener('mouseout', ev => {
					ev.currentTarget.status.ttHide = setTimeout(hideCurrentSubmenu, delayToAutoHide)
				})
			}

			submenuContainer.querySelectorAll('.menu-item:not(.menu-item-is-shortcode)').forEach(el => {
				el.addEventListener('click', () => {
					hideCurrentSubmenu()
				})
			})
		}
	})
}

document.addEventListener('DOMContentLoaded', () => {
	if (!document.querySelector('#masthead')) return

	const mainHeaderWrap = '.main-header-wrap'
	const targetDom = document.querySelector(mainHeaderWrap)

	if (!targetDom) {
		console.log(`⛔️ Main Header element selector "${mainHeaderWrap}" not matched @ DOM\nReview your css class markup or html`)
		return
	}
	makeMainNavSubmenusLayoutAnchor(targetDom, 'visuallyUnderParent', { safetyPadding: 16 })
})
