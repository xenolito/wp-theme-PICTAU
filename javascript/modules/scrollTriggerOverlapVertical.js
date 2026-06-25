/**
 * Make contained element to scrolltrigger horizontally (default elements to scroll <cardsContainer>)

 */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(ScrollTrigger)
gsap.registerPlugin(CustomEase)

const hyphenToCamelcase = str => {
	return str.replace(/-([a-z])/g, k => k[1].toUpperCase())
}

document.addEventListener('DOMContentLoaded', () => {
	const attribute = 'data-scrolloverlapvertical'
	const overlapCardsContainer = document.querySelectorAll(`[${attribute}]`)

	if (!overlapCardsContainer.length) return

	overlapCardsContainer.forEach(cardsContainer => {
		//! dont animate the last one
		const cards = cardsContainer.querySelectorAll(':scope > section:not(:last-of-type)')

		// const cards = cardsContainer.querySelectorAll(':scope > section');

		// console.log('cards', cards);

		cards.forEach((card, index) => {
			const tl = gsap.timeline()
			const targetToAnim = card.querySelector(':scope > *')
			card.previousCard = index > 0 ? cards[index - 1] : null
			card.lastone = index === cards.length ? true : false
			card.targetToAnim = targetToAnim

			// card.targetToAnim.style.transition = 'all .3s ease';

			tl.to(targetToAnim, {
				scale: 0.6,
				yPercent: 15,
				// opacity: 0.8,
				ease: 'power4.out',
			})

			card.st = ScrollTrigger.create({
				trigger: card,
				// start: `top top+=10%`, //! EL SCROLLTRIGGER debe comenzar cuando la siguiente card entre en la parte inferior de la pantalla
				// end: `bottom top+=10%`,
				start: `bottom bottom-=35%`,
				// end: `bottom+=20% top`,
				end: `bottom+=20% top`,
				pin: true,
				pinSpacing: false,
				scrub: true,
				animation: tl,
				onEnter: st => {
					if (st.trigger.previousCard) {
						st.trigger.previousCard.targetToAnim.style.opacity = '0'
					}
				},
				onUpdate: st => {
					let scaleAmount = getComputedStyle(st.trigger.targetToAnim).transform.split('matrix(')[1].split(',')[0]

					st.trigger.targetToAnim.style.filter = `brightness(${Math.min(1, Math.max(0, Number(scaleAmount / 1.7) + 0.35))})`
				},
				// onLeave: (st) => {
				// 	if (!st.trigger.lastone) {
				// 		st.trigger.targetToAnim.style.opacity = '0';
				// 		console.log('last one onLeave');
				// 	}
				// },
				onLeaveBack: st => {
					if (!st.trigger.lastone && st.trigger.previousCard) st.trigger.previousCard.targetToAnim.style.opacity = '1'
				},
				onEnterBack: st => {
					st.trigger.targetToAnim.style.visibility = 'inherit'
				},
				invalidateOnRefresh: true,
				// markers: true,
			})
		})
		cardsContainer.style.overflow = 'hidden'
		cardsContainer.style.paddingBottom = '0'
	})
})
