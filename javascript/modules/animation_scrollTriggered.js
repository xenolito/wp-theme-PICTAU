import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

document.addEventListener('DOMContentLoaded', () => {
	const target = document.querySelectorAll('[data-anim_scrolltriggered]');

	if (!target.length) return;

	target.forEach((anim) => {
		// console.log(anim.dataset);

		const {
			anim_scrolltriggered: isST,
			anim_scrolltriggered_pin: toPin,
			anim_scrolltrigger: trigger,
		} = anim.dataset;

		const customTrigger = trigger === '' ? anim.closest('section') : anim;

		const pin =
			toPin === ''
				? anim.closest('.will-pin')
				: toPin
					? document.querySelector(toPin)
					: false;

		// console.log('pinned Element ', pin);
		// console.log('Trigger element ', customTrigger);
		// console.log('customTrigger', customTrigger);

		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: customTrigger || anim,
				scrub: true,
				pin: pin,
				start: 'top top',
				end: '+=100%',
				// markers: true,
			},
		});
	});
});
