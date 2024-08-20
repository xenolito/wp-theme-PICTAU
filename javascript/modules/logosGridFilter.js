/**
 *  * Logos Grid Filterd Builder 1.0.0
 * https://pictau.com
 *
 * @license Copyright 2008-2024, Oscar Rey Tajes. All rights reserved.
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
 * ** Element with "logos-grid <flip-effect>". This is the grid container of our items to show as grid. The "flip-effect" class is optionall and will launch a new DOM restructure for using a perspective css 3d flip effect (up to you and your css)
 * ** Element with attribute data-filter="string". This are the grid items with the data-filter attribute conatining the filter name that this item belongs to. It will be used to construct the filter UI. Any item can have multiple filters comma separated for ex. data-filter="finance,services". This makes possible to any item to belong or show for multiple filters.
 *
 *
 *
 */

const spaceToDash = str => {
	// return str.replace(' ', '-')
	return str.replace(/\s+/g, '-')
}

const dashToSpace = str => {
	return str.replace(/-+/g, ' ')
}

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
			this.viewAllFilterString = this.filterUI.dataset.filterviewall

			if (!this.filterUI || !this.viewAllFilterString || this.viewAllFilterString === '') return

			this.filterItemsUI = new Array()

			if (this.gridItemsContainer.classList.contains('flip-effect')) {
				this.updateGridDOMForFlipEffect()
			} else {
				this.items = this.gridItemsContainer.querySelectorAll('[data-filter]')
			}

			this.getFilters()

			this.setupFiltersUI()

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
			const targetSelector = this.status.dataset.filtername

			this.items.forEach(item => {
				if (targetSelector === 'all') {
					item.style.display = 'grid'
				} else {
					item.style.display = item.classList.contains(targetSelector) ? 'grid' : 'none'
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

			itemsTarget.forEach(item => {
				const filter = item.dataset.filter && item.dataset.filter !== '' ? item.dataset.filter : false

				if (!filter) return

				const newGridItem = document.createElement('card')
				newGridItem.setAttribute('data-filter', item.dataset.filter)
				newGridItem.classList.add('flip-card-container')
				item.classList.add('flip-card-front')
				const flipCard = document.createElement('div')
				flipCard.classList.add('flip-card')
				newGridItem.append(flipCard)

				const flipCardBack = document.createElement('div')
				flipCardBack.classList.add('flip-card-back')
				flipCardBack.innerHTML = `<h3>${item.querySelector('img').getAttribute('alt')}</h3><div>${filtersListToHTML(item.dataset.filter)}</div>`

				item.before(newGridItem)
				item.removeAttribute('data-filter')

				flipCard.append(item)
				flipCard.append(flipCardBack)

				this.items.push(newGridItem)

				newGridItem.style.cursor = 'pointer'

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
