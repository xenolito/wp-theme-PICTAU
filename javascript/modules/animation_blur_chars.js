import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import debounce from 'lodash/debounce';

document.addEventListener('DOMContentLoaded', () => {
	const target = document.querySelectorAll('[data-blur_chars]');

	if (!target.length) return;

	target.forEach((el) => {
		const fadeOut =
			el.dataset.blur_chars === 'out' || el.dataset.blur_chars === ''
				? true
				: false;

		const customTrigger =
			el.dataset.blur_chars_trigger &&
			el.dataset.blur_chars_trigger !== ''
				? document.querySelector(el.dataset.blur_chars_trigger)
				: false;

		const pin =
			el.dataset.blur_chars_pinsection === ''
				? el.closest('section')
				: false;

		gsap.set(el, { opacity: fadeOut ? 1 : 0 });

		el.style.fontKerning = 'none';
		el.style.userSelect = 'none';

		let typeSplit = new SplitType(el, {
			types: 'lines, chars',
			tagName: 'span',
		});

		const letters = el.querySelectorAll('.char');

		gsap.set(letters, {
			willChange: 'auto',
		});

		const getRandom = (min, max) => {
			return Math.random() * (max - min) + min;
		};

		const getTriggerStart = () => {
			if (fadeOut) {
				if (customTrigger) {
					return `top bottom`;
				} else {
					return `top center`;
				}
			} else {
				// fadeIn
				if (customTrigger) {
					return `top bottom`;
				} else {
					return `top center`;
				}
			}
		};

		const getTriggerEnd = () => {
			if (fadeOut) {
				if (customTrigger) {
					return `top+=100px bottom`;
				} else {
					return `bottom center`;
				}
			} else {
				// fadeIn
				if (customTrigger) {
					return `top+=20% bottom`;
				} else {
					return `top center-=20%`;
				}
			}
		};

		let triggerDimSetup = {
			start: getTriggerStart(),
			end: getTriggerEnd(),
		};

		// console.log(
		// 	'fadeOut',
		// 	fadeOut,
		// 	'customTrigger',
		// 	customTrigger,
		// 	triggerDimSetup
		// );

		// console.log('pin', pin);

		letters.forEach((letter, index) => {
			const randomBlurPx = getRandom(0, 50);
			const blur = { amount: randomBlurPx, target: letter };

			const animBlur = gsap.fromTo(
				blur,
				{
					amount: fadeOut ? 0 : randomBlurPx,
					color: 'red',
				},
				{
					amount: fadeOut ? randomBlurPx : 0,
					// ease: 'expo.in',
					onUpdate: () => {
						blur.target.style.filter = `blur(${blur.amount}px)`;
					},
					scrollTrigger: {
						trigger: pin ? pin : customTrigger ? customTrigger : el,
						start: pin ? 'top top' : triggerDimSetup.start,
						end: pin ? '+=100% top' : triggerDimSetup.end,
						scrub: getRandom(0, 1),
						invalidateOnRefresh: true,
						// markers: true,
					},
				}
			);
		});

		//? Auto add margin-bottom for next sections to catch up
		// pin.style.marginBottom = `${pin.offsetHeight}px`;

		const elFade = gsap.fromTo(
			el,
			{
				opacity: fadeOut ? 1 : 0,
				scale: fadeOut ? 1 : 1.5,
			},
			{
				opacity: fadeOut ? 0 : 1,
				scale: fadeOut ? 1.5 : 1,
				// ease: 'expo.in',
				scrollTrigger: {
					trigger: pin ? pin : customTrigger ? customTrigger : el,
					start: pin ? 'top top' : triggerDimSetup.start,
					end: pin ? '+=100% top' : triggerDimSetup.end,
					scrub: 1,
					pin: pin,
					invalidateOnRefresh: true,
					// markers: true,
					// pinSpacing: false,
				},
			}
		);

		// console.log('trigger start', pin ? 'top top' : triggerDimSetup.start);
	});
});
