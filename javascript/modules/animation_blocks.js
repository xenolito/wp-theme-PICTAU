import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
	const targetElements = document.querySelectorAll('[data-pctanim]');

	if (!targetElements.length) {
		// console.log('no hay elementos que animar')
		return;
	}

	// const initialDesp = '50' // initial displacement (from) for animation in px

	const defaultAnimSettings = {
		initialDesp: 80,
		initialDelay: 0,
		resetOnViewportExit: false,
	};

	targetElements.forEach((el) => {
		const animSettings = {
			...defaultAnimSettings,
			initialDesp:
				Number(el.dataset?.pctanim_desp) ||
				defaultAnimSettings.initialDesp,
			resetOnViewportExit:
				el.dataset?.pctanim_repeat === 'true' ||
				defaultAnimSettings.resetOnViewportExit,
		};

		const animMap = {
			fadeIn: { x: 0, y: 0 },
			fadeInFromRight: { x: animSettings.initialDesp, y: 0 },
			fadeInFromLeft: { x: animSettings.initialDesp * -1, y: 0 },
			fadeInFromBottom: { x: 0, y: animSettings.initialDesp },
			fadeInFromTop: { x: 0, y: animSettings.initialDesp * -1 },
			zoomOut: { x: 0, y: 0, z: 1.1 },
		};

		const anim = el.dataset.pctanim;
		const delayAnim =
			Number(el.dataset?.pctanim_delay) || animSettings.initialDelay;

		const getInitialPos = (anim) => {
			if (!animMap[anim]) return { x: 0, y: 0 };
			return animMap[anim];
		};

		const initialPos = {
			x: getInitialPos(anim).x,
			y: getInitialPos(anim).y,
			z: getInitialPos(anim)?.z || 1,
		};

		const setInitialPos = () => {
			el.style.opacity = '0';
			el.style.transform = `translate3d(${initialPos.x}px, ${initialPos.y}px, 0) scale(${initialPos.z})`;
		};

		setInitialPos();

		const triggerCallbackEnter = () => {
			tl.to(el, {
				x: 0,
				y: 0,
				opacity: 1,
				scale: 1,
				delay: delayAnim,
				duration: 0.8,
			});
		};

		const triggerCallbackExit = () => {
			tl.to(el, {
				x: initialPos.x,
				y: initialPos.y,
				opacity: 0,
				scale: initialPos.z,
				delay: 0,
				duration: 0.2,
			});
		};

		const sTrigger = {
			trigger: el,
			// start: 'top 80%',
			start: 'top bottom',
			// end: 'top bottom+=300px',
			ease: 'power4.out',
			onEnter: triggerCallbackEnter,
			onEnterBack: animSettings.resetOnViewportExit
				? triggerCallbackEnter
				: null,
			// onLeave: animSettings.resetOnViewportExit ? triggerCallbackExit :  null,
			onLeaveBack: animSettings.resetOnViewportExit
				? triggerCallbackExit
				: null,
		};

		let tl = gsap.timeline({
			scrollTrigger: sTrigger,
		});
	});
});
