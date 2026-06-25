/**
 *  * Logos Grid Filterd Builder 1.5.0
 * Added use of viewTransition API to animate the grid filter changes
 * https://pictau.com
 *
 * @license Copyright 2008-2025, Oscar Rey Tajes. All rights reserved.
 * @author: Oscar Rey Tajes, oscar.rey.tajes@gmail.com
 *
 * Makes a grid from html elements (figure, div, ...) which contains a data attribute to set the "string" to be filtered with.
 * It automatically creates the html DOM filters elements extracted from any grid element data attribute.
 *
 * Example:
 *
 * <div class="filtered-grid">
 *    <div class="filter-ui" data-filterviewall="Ver todos">
 *    </div>
 *    <div class="logos-grid flip-effect">
 *      <figure data-filter="services"></figure>
 *      <figure data-filter="finance, services"></figure>
 *      ...
 *    </div>
 * </div>
 *
 * ** Element with "filtered-grid" class. This will be the grid container and the trigger to match for this whole module.
 * ** Elemnent with "filter-ui" class. This will contain de data attribute for the string used by the "view all" default intial filter. It is important to provide as data-filterviewall="<viewallstring>", useful for i18n.
 * ** Element with "logos-grid <flip-effect>". This is the grid container of our items to show as grid. The "flip-effect" class is optional and will launch a new DOM restructure for using a perspective css 3d flip effect (up to you and your css)
 * ** Element with attribute data-filter="<string>". This are the grid items with the data-filter attribute conatining the filter name that this item belongs to. It will be used to construct the filter UI. Any item can have multiple filters comma separated for ex. data-filter="finance,services". This makes possible to any item to belong or show for multiple filters.
 * ** Element with attribute data-link="<url>". This is optional and will be used to create a link around the grid item, useful for linking to the partner website or any other link.
 *
 *
 *
 */

import { flip } from 'lodash'

const spaceToDash = str => {
	// return str.replace(' ', '-')
	return str.replace(/\s+/g, '-')
}

const dashToSpace = str => {
	return str.replace(/-+/g, ' ')
}

const iconArrowRightSVG =
	'<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><line x1="40" y1="128" x2="216" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line><polyline points="144 56 216 128 144 200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></polyline></svg>'

window.addEventListener('load', () => {
	const classSelector = '.filtered-grid'
	const gridFilteredContainers = document.querySelectorAll(classSelector)

	if (!gridFilteredContainers.length) return

	const GridFiltered = class {
		constructor(targetDOMElement) {
			this.gridFilteredContainer = targetDOMElement
			this.gridItemsContainer = this.gridFilteredContainer.querySelector('.logos-grid')
			if (!this.gridItemsContainer) return
			this.status = false

			this.init()
		}

		init = () => {
			this.filterUI = this.gridFilteredContainer.querySelector('[data-filterviewall]')
			this.viewAllFilterString = this.filterUI?.dataset.filterviewall

			this.hasFilter = true

			if (!this.filterUI || !this.viewAllFilterString || this.viewAllFilterString === '') this.hasFilter = false

			this.filterItemsUI = new Array()

			if (this.gridItemsContainer.classList.contains('flip-effect')) {
				this.updateGridDOMForFlipEffect()
			} else {
				this.items = this.gridItemsContainer.querySelectorAll('[data-filter]')
			}

			if (this.hasFilter) {
				this.getFilters()
				this.setupFiltersUI()
			}

			setTimeout(() => {
				this.gridFilteredContainer.style.opacity = '1'
				this.gridFilteredContainer.style.scale = '1'
			}, 1000)
		}

		getFilters = () => {
			let filters_temp = new Array()

			filters_temp = Array.from(this.items).map(item => {
				const filters = Array.from(item.dataset['filter'].split(','))

				filters.forEach(filter => {
					item.classList.add(spaceToDash(filter))
				})

				return filters
			})

			let allFilters = new Array()

			filters_temp.forEach(filterArr => {
				filterArr.forEach(filter => {
					allFilters.push(filter)
				})
			})

			this.filters = allFilters.filter((value, index) => allFilters.indexOf(value) === index)

			// Order alphabetically
			this.filters.sort()

			// console.log('filters', this.filters)
		}

		setupFiltersUI = () => {
			this.addFilterUI(this.viewAllFilterString, 'all')

			this.filters.forEach(filter => {
				this.addFilterUI(filter)
			})
		}

		addFilterUI = (filterStr, attributeContent, checked) => {
			let filter = document.createElement('div')
			filter.setAttribute('data-filtername', attributeContent ? attributeContent : spaceToDash(filterStr))
			filter.innerHTML = filterStr
			this.filterUI.append(filter)
			// default init status
			if (attributeContent == 'all') {
				filter.classList.add('checked')
				this.status = filter
			}

			filter.addEventListener('click', e => {
				this.setStatus(e.target)
			})

			this.filterItemsUI.push(filter)
		}

		setStatus = elem => {
			if (this.status) this.status.classList.remove('checked')
			elem.classList.add('checked')
			this.status = elem
			this.updateGrid()
		}

		updateGrid = () => {
			if (!document.startViewTransition) {
				console.log('⛔️ View Transition API not supported by your browser')
				this.updateItems()
			} else {
				const transition = document.startViewTransition(() => {
					this.updateItems()
				})
			}
		}

		updateItems = () => {
			const targetSelector = this.status.dataset.filtername
			this.items.forEach(item => {
				if (targetSelector === 'all') {
					// item.style.display = 'grid'
					item.classList.remove('hidden')
				} else {
					if (item.classList.contains(targetSelector)) {
						item.classList.remove('hidden')
					} else {
						item.classList.add('hidden')
					}
				}
			})
		}

		updateGridDOMForFlipEffect = () => {
			const itemsTarget = this.gridItemsContainer.querySelectorAll('[data-filter]')

			const filtersListToHTML = csv => {
				let fl = Array.from(csv.split(','))
				let output = ''
				fl.forEach(f => {
					output += `<span>${f}</span>`
				})
				return output
			}

			this.items = new Array()

			itemsTarget.forEach((item, index) => {
				const filter = item.dataset.filter && item.dataset.filter !== '' ? item.dataset.filter : false
				const link = item.dataset.link && item.dataset.link !== '' ? item.dataset.link : false
				const linkText = item.dataset.link_text && item.dataset.link_text !== '' ? item.dataset.link_text : 'Web'
				const tipo = item.dataset.type && item.dataset.type !== '' ? item.dataset.type : false

				let atag = null
				let cta = null

				// console.log('item', item, 'filter', filter, 'link', link)

				if (!filter) return

				const newGridItem = document.createElement('card')
				newGridItem.setAttribute('data-filter', item.dataset.filter)
				newGridItem.classList.add('flip-card-container')
				if (tipo) {
					newGridItem.classList.add(`type-${tipo.toLowerCase()}`)
				}

				newGridItem.style.viewTransitionName = `item-${index}`

				item.classList.add('flip-card-front')

				if (link) {
					atag = document.createElement('a')
					atag.classList.add('flip-card-link')
					atag.setAttribute('href', `https://${link}`)
					atag.setAttribute('target', `_blank`)
					atag.setAttribute('rel', `noopener noreferrer`)
					// newGridItem.append(atag)

					cta = document.createElement('figure')
					cta.classList.add('flip-card-cta')

					const fragCta = document.createRange().createContextualFragment(iconArrowRightSVG)
					cta.append(fragCta)
				}

				const flipCard = document.createElement('div')
				flipCard.classList.add('flip-card')

				newGridItem.append(flipCard)

				if (link) flipCard.append(cta)

				const flipCardBack = document.createElement('div')
				flipCardBack.classList.add('flip-card-back')
				flipCardBack.innerHTML = `<h3>${item.querySelector('img').getAttribute('alt')}</h3><div>${filtersListToHTML(item.dataset.filter)}</div>${link ? `<div class="flip-card-link-cta">${linkText}</div>` : ''}`

				item.before(newGridItem)
				item.removeAttribute('data-filter')

				flipCard.append(item)

				if (link) {
					flipCard.append(atag)
					atag.append(flipCardBack)
				} else {
					flipCard.append(flipCardBack)
				}

				this.items.push(newGridItem)

				// newGridItem.style.cursor = 'pointer'

				newGridItem.addEventListener('mouseover', e => {
					clearTimeout(newGridItem.tOut)
					e.currentTarget.classList.add('is-flipped')
				})
				newGridItem.addEventListener('mouseout', e => {
					newGridItem.tOut = setTimeout(window.cleanFlip, 180, newGridItem)
				})

				window.cleanFlip = tgt => {
					tgt.classList.remove('is-flipped')
				}
			})
		}
	}

	gridFilteredContainers.forEach(gridFiltered => {
		gridFiltered.gridFilteredContainer = new GridFiltered(gridFiltered)
	})
})
