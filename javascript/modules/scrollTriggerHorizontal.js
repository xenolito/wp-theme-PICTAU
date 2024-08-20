/**
 * Make contained element to scrolltrigger horizontally (default elements to scroll <scrollContainer>)

 */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const hyphenToCamelcase = str => {
	return str.replace(/-([a-z])/g, k => k[1].toUpperCase())
}

document.addEventListener('DOMContentLoaded', () => {
	const attribute = 'data-scrollhorizontal'
	const horizScrollContainers = document.querySelectorAll(`[${attribute}]`)

	if (!horizScrollContainers.length) return

	// console.log('SCROLL HORIZONTAL ENCONTRADO!!')

	horizScrollContainers.forEach(scrollContainer => {
		const dts = hyphenToCamelcase(attribute.split('data-')[1])

		const targetToScrollSelector = scrollContainer.dataset[dts] !== '' ? scrollContainer.dataset[dts] : ':scope > section'

		const horizScrollContainer = scrollContainer.querySelector(targetToScrollSelector)

		const getScrollAmount = () => {
			let scrollContainerWidth = horizScrollContainer.scrollWidth
			let scrollContainerDim = scrollContainer.getBoundingClientRect()
			let scrollContainerXpos = scrollContainerDim.x

			// console.log('scroll container Dimensions: ', scrollContainerDim)
			// console.log('scroll container width:', scrollContainerWidth)
			// console.log(' scroll Amount: ', -(scrollContainerWidth - window.innerWidth))
			// return -(scrollContainerWidth - window.innerWidth + scrollContainerXpos + scrollContainerDim.width)
			return -(scrollContainerWidth - window.innerWidth + scrollContainerXpos)
			// return -scrollContainerWidth
		}

		// console.log('scrollAmount', getScrollAmount());

		const tween = gsap.to(horizScrollContainer, {
			x: getScrollAmount,
			duration: 3,
			ease: 'none',
		})

		ScrollTrigger.create({
			trigger: scrollContainer,
			// start: 'top 20%',
			start: 'top 10%',
			end: () => `+=${getScrollAmount() * -1}`,
			pin: true,
			animation: tween,
			scrub: 1,
			invalidateOnRefresh: true,
			// markers: true,
		})

		// const nextSectionToPin = scrollContainer.parentElement.nextElementSibling;
	})
})
