document.addEventListener('DOMContentLoaded', () => {
	const videoTriggers = document.querySelectorAll('.youtube-trigger')

	if (!videoTriggers.length) return

	videoTriggers.forEach(videoTrigger => {
		const youtubeId = videoTrigger.dataset.youtube_id
		const injectHTML = `<figure class="wp-block-embed is-type-video is-provider-youtube wp-block-embed-youtube wp-embed-aspect-16-9 wp-has-aspect-ratio"><div class="wp-block-embed__wrapper"><iframe width="500" height="281" src="https://www.youtube.com/embed/${youtubeId}?rel=0&showinfo=0&autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen=""></iframe></div></figure>`

		if (!youtubeId) {
			console.log('⛔️ No "youtube_id" attribute for video trigger', videoTrigger)
			return
		}

		videoTrigger.addEventListener('click', e => {
			videoTrigger.classList.toggle('is-active')

			const videoElement = document.createElement('div')
			videoElement.innerHTML = injectHTML
			videoTrigger.append(videoElement)
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
