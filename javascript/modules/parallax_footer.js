import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

document.addEventListener('DOMContentLoaded', () => {
	const footer = document.querySelector('#footer')

	if (!footer) return

	footer.style.overflow = 'hidden'
	const footerContent = footer.querySelector('.footer-container')

	gsap.fromTo(
		footerContent,
		{
			yPercent: -20,
			opacity: 0,
		},
		{
			yPercent: 0,
			opacity: 1,
			scrollTrigger: {
				trigger: footer,
				// start: 'top bottom-=20%',
				start: 'top bottom',
				end: 'top center',
				scrub: true,
				// invalidateOnRefresh: true,
				// markers: true,
			},
		}
	)
})
