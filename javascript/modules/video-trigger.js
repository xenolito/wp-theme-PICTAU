document.addEventListener('DOMContentLoaded', () => {
	const videoTriggers = document.querySelectorAll('.video-trigger')

	if (!videoTriggers.length) return

	videoTriggers.forEach(videoTrigger => {
		const sourceType = videoTrigger.dataset['video_source']

		const { video_source, video_id } = videoTrigger.dataset

		let injectHTML = ''

		if (!video_source && !video_id) return

		if (video_source === 'youtube') {
			injectHTML = `<figure class="wp-block-embed is-type-video is-provider-youtube wp-block-embed-youtube wp-embed-aspect-16-9 wp-has-aspect-ratio"><div class="wp-block-embed__wrapper"><iframe width="500" height="281" src="https://www.youtube.com/embed/${video_id}?rel=0&showinfo=0&autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen=""></iframe></div></figure>`
		} else if (video_source === 'vimeo') {
			const vimeoIframe = videoTrigger.querySelector('iframe')

			if (!window.Vimeo) {
				var sc = document.createElement('script')
				sc.src = 'https://player.vimeo.com/api/player.js'
				vimeoIframe.parentElement.appendChild(sc)
			}

			window.addEventListener('load', () => {
				videoTrigger.player = new window.Vimeo.Player(vimeoIframe)

				// console.log('all loaded', window.Vimeo, videoTrigger.player)
			})

			// document.getElementsByTagName('head')[0].appendChild(tag)
		}

		// const youtubeId = videoTrigger.dataset.youtube_id

		// if (!youtubeId) {
		// 	console.log('⛔️ No "youtube_id" attribute for video trigger', videoTrigger)
		// 	return
		// }

		videoTrigger.addEventListener('click', e => {
			videoTrigger.classList.toggle('is-active')

			if (video_source === 'youtube') {
				const videoElement = document.createElement('div')
				console.log('play youtube')
				videoElement.innerHTML = injectHTML
				videoTrigger.append(videoElement)
			} else if (video_source === 'vimeo') {
				videoTrigger.player.play()
				console.log('play vimeo', videoTrigger.player)
			}
		})
	})

	/*

*/

	// const videoTriggers = document.querySelectorAll('[data-video-trigger]')

	// if (!videoTriggers.length) return

	// videoTriggers.forEach(videoTrigger => {
	// 	const video = videoTrigger.querySelector('video')
	// 	const videoTrigger = videoTrigger.querySelector('.video-trigger')

	// 	if (!video || !videoTrigger) return

	// 	video.addEventListener('click', e => {
	// 		videoTrigger.classList.toggle('is-active')
	// 	})
	// })
})
