import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'
import { getConfigByAtt } from './attributesToConfigObj'

gsap.registerPlugin(ScrollTrigger)
gsap.registerPlugin(CustomEase)

const hyphenToCamelcase = str => {
	return str.replace(/-([a-z])/g, k => k[1].toUpperCase())
}

const getRandom = (min, max) => {
	return Math.random() * (max - min) + min
}

document.addEventListener('DOMContentLoaded', () => {
	const attributeId = 'video_scroll'
	const videosOnScroll = document.querySelectorAll(`[data-${attributeId}]`)

	if (!videosOnScroll.length) return

	const VideoPlayOnScroll = class {
		constructor(targetDOMElement, config = {}) {
			const { controls = false, triggerstart = null, markers = false } = config

			this.videoContainer = targetDOMElement
			this.video = this.videoContainer.querySelector('video')
			this.markers = markers
			this.controls = controls && controls !== '0' ? true : false
			this.triggerstart = !triggerstart ? `top 20%` : `top ${triggerstart}`

			this.setupVideo()
		}

		play = () => {
			this.video.play()
		}

		setupVideo = () => {
			if (!this.video) return
			this.video.setAttribute('muted', true)
			this.video.setAttribute('playsinline', true)
			this.video.setAttribute('preload', 'auto')
			if (!this.controls) {
				this.video.removeAttribute('controls')
			}

			this.video.addEventListener('canplay', () => {
				this.videoContainer.style.opacity = '1'
			})

			this.video.addEventListener('loadeddata', () => {
				this.videoContainer.style.opacity = '1'
			})

			gsap.set(this.video, {
				// zIndex: -1,
				clipPath: 'border-box',
			})

			this.st = ScrollTrigger.create({
				trigger: this.video,
				start: this.triggerstart,
				end: 'bottom top',
				// animation: this.timeLine,
				onEnter: () => this.play(),
				scrub: 0.5,
				// pin: this.targetToAnim,
				// pinSpacer: false,
				invalidateOnRefresh: true,
				// markers: true,
				markers: this.markers,
				// pinReparent: true,
			})
		}
	}

	videosOnScroll.forEach(video => {
		const datasets = video.dataset
		const config = getConfigByAtt(video, attributeId)

		// console.log('CONFIG ', config)

		const videoPlayer = new VideoPlayOnScroll(video, config)
		video.videoPlayer = videoPlayer
	})
})
