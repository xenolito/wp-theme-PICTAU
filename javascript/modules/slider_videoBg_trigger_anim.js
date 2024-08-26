/**
 * Custom animation for slider mercanza MODEL A (launch May 2024)
 * if class "anim-intro" on slider, --> exec gsap animation for intro and (cover)
 *
 */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getConfigByAtt } from './attributesToConfigObj'

gsap.registerPlugin(ScrollTrigger)

// document.addEventListener('DOMContentLoaded', () => {
window.addEventListener('load', () => {
	const slider = document.querySelector('body.home .slider, .slider.has-video-bg')

	if (!slider) return

	window.introTween = gsap.timeline({
		paused: true,
	})

	const firstHeader = slider.querySelector('h1:first-of-type')
	const headersToAnim = slider.querySelectorAll('h1')

	const cover = slider.querySelector('.slider-cover')
	const video = slider.querySelector('.video-bg')
	window.video_intro = video

	// console.log(video)

	let headerAnimLaunched = false
	// h1.headerAnimation.play()

	window.introTween.to(cover, {
		opacity: 0,
		duration: 0.8,
		ease: 'power2.out',
		onUpdate: function () {
			if (this.progress() > 0.3 && !headerAnimLaunched) {
				headersToAnim.forEach(header => {
					header.headerAnimation.play()
				})
				// h1.headerAnimation.play()
				headerAnimLaunched = true
			}
		},
		// onStart: () => {}
		// onComplete: () => {
		// 	console.log('cover animation finished', h1.headerAnimation.play())
		// },
	})

	window.introTween.add(firstHeader.headerAnimation, '>-75%')

	const loader = cover.querySelector('.loader')
	if (loader) {
		const loaderTl = gsap.timeline()
		loaderTl.to(loader, { opacity: 0, duration: 0.3 })
		window.introTween.add(loaderTl, '<-1')
	}

	setTimeout(() => {
		window.introTween.play()
		window.video_intro.play()
	}, 50)

	// window.introTween.play()

	//! On scroll main slider
	const nextSection = document.querySelector('.slider + section')

	const nextSectionST = ScrollTrigger.create({
		trigger: nextSection,
		start: 'top bottom-=5%',
		onEnter: self => {
			headersToAnim.forEach(header => {
				header.headerAnimation.timeLine.reverse()
			})
			// h1.headerAnimation.timeLine.reverse()
		},
		onLeaveBack: () => {
			headersToAnim.forEach(header => {
				header.headerAnimation.timeLine.play()
			})
		},
		scrub: 1,
		// markers: true,
		// invalidateOnRefresh: true,
	})
})
