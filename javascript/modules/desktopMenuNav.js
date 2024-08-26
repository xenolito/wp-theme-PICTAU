// @param	HTMLElement	headerContainerElement	Header element, needed to be container of submenus container
// @param	String 			visualPositioning				'visuallyUnderParent'|'fullWidth'

// const iconRight = `<svg class="icon icon-tabler icon-tabler-chevron-right" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 6l6 6l-6 6" /></svg>`;

// TODO When click on a submenu or megamenu background it triggers the "hide menu" action --> change this

const makeMainNavSubmenusLayout = (headerContainerElement, visualPositioning) => {
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

	const positionChildUnderParent = childElement => {
		const headerWrapperHeight = headerContainerElement.offsetHeight
		const offsetY = headerWrapperHeight * 0.5 + 5
		// const offsetY = 12;
		let offsetX = 0 // for centering the child relative to parent

		const submenuContainerPos = childElement.parentElement.getBoundingClientRect()
		const parent = childElement.parentMenuItem
		const parentPos = parent.getBoundingClientRect()
		offsetX = parent.offsetWidth - childElement.offsetWidth

		childElement.style.top = `${parentPos.y - submenuContainerPos.y + offsetY}px`
		// childElement.style.left = `${parentPos.x + offsetX * 0.5}px`;
		childElement.style.translate = `${parentPos.x + offsetX * 0.5}px 0`

		// check submenu doesnt overflow window's left limit
		const overflowWindowLeftLimit = childElement.getBoundingClientRect().x

		// console.log(overflowWindowLeftLimit);

		if (overflowWindowLeftLimit <= 0) {
			// console.log(
			// 	'movemos a la derecha, antes: ',
			// 	overflowWindowLeftLimit,
			// 	' después: ',
			// 	childElement.getBoundingClientRect().x +
			// 		overflowWindowLeftLimit * -1
			// );
			// childElement.style.translate = `${
			// 	childElement.getBoundingClientRect().x +
			// 	overflowWindowLeftLimit * -1
			// }px 0`;

			// console.log(
			// 	`calc( ${
			// 		childElement.getBoundingClientRect().x +
			// 		overflowWindowLeftLimit * -1
			// 	}px + var(--def-layout-x-padding))`
			// );

			childElement.style.translate = `calc( ${childElement.getBoundingClientRect().x + overflowWindowLeftLimit * -1}px + var(--def-layout-x-padding))`
		}
		// console.log('submenu x position', overflowWindowLeftLimit);

		// check submenu doesnt overflow window right limit
		const overflowWindowWidthRight = childElement.getBoundingClientRect().x + childElement.offsetWidth - window.innerWidth

		// console.log('overflowWindowWithRight', overflowWindowWidthRight);

		const offsetOverFlowRight = overflowWindowWidthRight > 0 ? overflowWindowWidthRight : 0

		// console.log('offsetOverflowRight', offsetOverFlowRight);

		if (offsetOverFlowRight) {
			// childElement.style.left = `${
			// 	childElement.getBoundingClientRect().x -
			// 	Math.round(offsetOverFlowRight + offsetY)
			// }px`;
			childElement.style.translate = `${childElement.getBoundingClientRect().x - Math.round(offsetOverFlowRight + offsetY)}px 0`
		}
	}

	const showChildren = parentMenu => {
		positionChildUnderParent(parentMenu.submenu)
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
			// const targetToAddIcon = menuItem.querySelector('a');
			// const iconIsParent = document
			// 	.createRange()
			// 	.createContextualFragment(iconRight);
			// targetToAddIcon.append(iconIsParent);

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
					//hide current visible submenu
					if (ev.currentTarget.status.showing) {
						hideCurrentSubmenu()
						// hideChildren(
						// 	ev.currentTarget.status.showing.parentMenuItem
						// );
					}
					ev.currentTarget.status.showing = ev.currentTarget.submenu

					showChildren(ev.currentTarget)
				})
				menuItem.addEventListener('mouseout', ev => {
					ev.currentTarget.status.ttHide = setTimeout(hideCurrentSubmenu, delayToAutoHide)
					// hideChildren(ev.currentTarget);
				})

				// positionChildUnderParent(submenuContainer);
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
	const mainHeaderWrap = '.main-header-wrap'
	const targetDom = document.querySelector(mainHeaderWrap)

	if (!targetDom) {
		console.log(`⛔️ Main Header element selector "${mainHeaderWrap}" not matched @ DOM\nReview your css class markup or html`)
		return
	}
	makeMainNavSubmenusLayout(targetDom, 'visuallyUnderParent')
})
