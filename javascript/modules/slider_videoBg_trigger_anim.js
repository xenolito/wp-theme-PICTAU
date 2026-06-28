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
	const slider = document.querySelector('.slider.anim-intro')

	if (!slider) return

	window.introTween = gsap.timeline({
		paused: true,
	})

	const firstHeader = slider.querySelector('h1:first-of-type')
	const headersToAnim = slider.querySelectorAll('h1')

	const cover = slider.querySelector('.slider-cover')
	const video = slider.querySelector('.video-bg')
	if (video) window.video_intro = video

	// console.log(video)

	let headerAnimLaunched = false
	// h1.headerAnimation.play()

	// Define (just define, not play) the cover animation (fade out) and trigger the header animations when the cover is fading out.
	if (cover) {
		window.introTween.to(cover, {
			opacity: 0,
			duration: 1.2,
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
			// 	console.log('cover animation finished', header.headerAnimation.play())
			// },
		})
	}

	window.introTween.add(firstHeader.headerAnimation, '>-75%')

	setTimeout(() => {
		window.introTween.play()
		if (cover) {
			cover.style.pointerEvents = 'none'
		}
		if (video && !video.autoplay) window.video_intro.play()
	}, 50)
})
