// Livid embeds implement the player.js protocol (https://github.com/embedly/player.js) over postMessage
const LIVID_ORIGIN = 'https://livid.com'
const PLAYERJS_CONTEXT = 'player.js'
const PLAYERJS_VERSION = '2.0'

const createLividPlayer = iframe => {
	let isReady = false
	let pendingMethod = null

	const send = (method, value) => {
		const message = { context: PLAYERJS_CONTEXT, version: PLAYERJS_VERSION, method }
		if (value !== undefined) message.value = value
		iframe.contentWindow?.postMessage(JSON.stringify(message), LIVID_ORIGIN)
	}

	window.addEventListener('message', e => {
		if (e.origin !== LIVID_ORIGIN || e.source !== iframe.contentWindow) return

		let data = e.data
		if (typeof data === 'string') {
			try {
				data = JSON.parse(data)
			} catch {
				return
			}
		}

		if (data?.context !== PLAYERJS_CONTEXT || data.event !== 'ready') return

		isReady = true
		if (pendingMethod) {
			send(pendingMethod)
			pendingMethod = null
		}
	})

	// Asks the receiver to (re)emit "ready" in case it fired before this listener was attached
	iframe.addEventListener('load', () => send('addEventListener', 'ready'))

	const call = method => {
		if (isReady) {
			send(method)
			return
		}
		pendingMethod = method
		send('addEventListener', 'ready')
	}

	return {
		play: () => call('play'),
		pause: () => call('pause')
	}
}

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

			if (!vimeoIframe) {
				console.log('⛔️ No Vimeo iframe found for video trigger', videoTrigger)
				return
			}

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
		} else if (video_source === 'livid') {
			const lividIframe = videoTrigger.querySelector('iframe[src*="livid.com/embed"]')

			if (!lividIframe) {
				console.log('⛔️ No Livid iframe found for video trigger', videoTrigger)
				return
			}

			videoTrigger.player = createLividPlayer(lividIframe)
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
			} else if (video_source === 'livid') {
				videoTrigger.player.play()
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
