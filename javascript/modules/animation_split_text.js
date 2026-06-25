import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitType from 'split-type'
import debounce from 'lodash/debounce'

gsap.registerPlugin(ScrollTrigger)

document.addEventListener('DOMContentLoaded', () => {
	const target = document.querySelectorAll('[data-split_text]')

	if (!target.length) return

	target.forEach(el => {
		console.log('⛔️ Deprecated --> data-split_text', el.innerHTML)
		const elementsToAnim = el.dataset.split_text_element ?? 'chars'
		const durations = {
			chars: 0.2,
			words: 0.5,
			lines: 1,
		}

		const staggers = {
			chars: 5,
			words: 1,
			lines: 0.3,
		}

		el.style.fontKerning = 'none'
		el.style.userSelect = 'none'

		let typeSplit = new SplitType(el, {
			types: 'lines, words, chars',
			tagName: 'span',
		})

		el.querySelectorAll('.line').forEach(line => {
			line.style.clipPath = 'polygon(0 0, 100% 0, 120% 100%, 0% 120%)'
			// line.querySelectorAll('.word').forEach((word) => {
			// 	word.style.textTransform = 'none';
			// 	// word.style.overflow = 'auto';
			// });
		})

		let tl = gsap.timeline({
			scrollTrigger: {
				trigger: el,
				start: 'top center+=30%',
				end: 'bottom center-=30%',
				// toggleActions: 'play none none reverse',
				//? toggleActions: 'restart   reverse   none          none',
				//? 							  onEnter	  onLeave	  onEnterBack	  onLeaveBack
				// scrub: true,
				onEnter: () => {
					gsap.to(typeSplit[elementsToAnim], {
						y: '0%',
						opacity: 1,
						duration: durations[elementsToAnim],
						ease: 'power1.out',
						delay: 0.3,
						stagger: {
							amount: staggers[elementsToAnim],
						},
					})
				},
				// onLeave: () => console.log('onLeave'),
				// onEnterBack: () => console.log('onEnterBack'),
				onLeaveBack: () => {
					gsap.to(typeSplit[elementsToAnim], {
						y: '100%',
						opacity: 0,
						duration: 0.3,
						ease: 'power3.out',
						stagger: {
							amount: staggers[elementsToAnim] * 0.5,
							from: 'end',
						},
					})
				},
				invalidateOnRefresh: true,
				// markers: true,
			},
		})

		let getTargetsToAnim = () => {
			const selector = elementsToAnim.replace(/s([^s]*)$/, '$1')
			return el.querySelectorAll(`.${selector}`)
		}

		gsap.set(typeSplit[elementsToAnim], {
			y: '120%',
			opacity: 0,
		})

		// const resizeObserver = new ResizeObserver(
		// 	debounce(([entry]) => {
		// 		typeSplit.split();
		// 		if (tl.scrollTrigger.progress === 0) {
		// 			gsap.set(typeSplit[elementsToAnim], {
		// 				y: '120%',
		// 				opacity: 0,
		// 			});
		// 		}
		// 	}, 500)
		// );
		// resizeObserver.observe(el.parentElement);
	})
})
