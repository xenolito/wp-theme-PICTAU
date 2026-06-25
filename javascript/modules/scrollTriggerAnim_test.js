import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitType from 'split-type'

gsap.registerPlugin(ScrollTrigger)

document.addEventListener('DOMContentLoaded', () => {
	const headingFallingDown = document.querySelectorAll('.heading-falling-down')

	if (!headingFallingDown.length) return

	headingFallingDown.forEach(container => {
		//? Heading animations
		// const heading = container.querySelector('.header-split')

		// if (!heading) return

		// const headingSplit = new SplitType(heading, {
		// 	types: 'chars',
		// 	// linesClass: 'lineChild',
		// })

		const letters = container.querySelectorAll('figure')

		const getRandom = (min, max) => {
			return Math.random() * (max - min) + min
		}

		letters.forEach((letter, index) => {
			const randomYpercent = getRandom(70, 900)

			gsap.fromTo(
				letter,
				{
					yPercent: -randomYpercent,
					opacity: 0,
				},
				{
					yPercent: 0,
					opacity: 1,
					scrollTrigger: {
						trigger: container,
						// start: 'top bottom',
						start: () => `0 80%`,
						// end: 'bottom center',
						end: () => `0 25%`,
						scrub: true,
						invalidateOnRefresh: true,
						// refreshPriority: 0,
						// onEnter: () => darktheme.themeToDark(),
						// onLeave: () => darktheme.themeToLight(),
						// onEnterBack: () => darktheme.themeToDark(),
						// onLeaveBack: () => darktheme.themeToLight(),
						// markers: true,
					},
				}
			)
		})
	})

	//TODO Images animation parallax
	const imgs = gsap.utils.toArray('.space img')

	imgs.forEach(img => {
		const speed = img.dataset.speed

		gsap.to(img, {
			yPercent: speed * 50,
			ease: 'none',
			scrollTrigger: {
				trigger: img,
				start: 'top bottom',
				invalidateOnRefresh: true,
				scrub: true,
			},
		})
	})
})

if (document.querySelector('.animated-element')) {
	let tl = gsap.timeline({
		scrollTrigger: {
			trigger: '.animated-element',
			start: 'top center',
			// end: '100% 0%',
			end: '100% 30%',
			// scrub: true,
			// markers: true,
			invalidateOnRefresh: true,
			toggleActions: 'play pause play reverse',
		},
	})

	// tl.from('.animated-element', {
	// 	x: '-300%',
	// });

	tl.to('.animated-element', {
		x: '0%',
		duration: 1,
	})
}

//? gsap snap

//! Section trigger theme change to dark
// if (document.querySelector('.xsection')) {
// 	const sectionChangeTheme = ScrollTrigger.create({
// 		trigger: document.querySelector('.xsection'),
// 		// invalidateOnRefresh: true,
// 		start: `top 80%`,
// 		end: 'bottom 50%',
// 		onEnter: () => {
// 			window.darktheme.themeToDark();
// 		},
// 		onLeave: () => {
// 			window.darktheme.themeToLight();
// 		},
// 		onEnterBack: () => {
// 			window.darktheme.themeToDark();
// 		},
// 		onLeaveBack: () => {
// 			window.darktheme.themeToLight();
// 		},

// 		//? toggleActions: 'restart   reverse   none          none',
// 		//? 							  onEnter	  onLeave	  onEnterBack	  onLeaveBack
// 		scrub: true,
// 		invalidateOnRefresh: true,
// 		// toggleClass: 'red',
// 		// pin: targetToPin,
// 		// pinSpacing: false,
// 		// markers: true,
// 	});
// }
