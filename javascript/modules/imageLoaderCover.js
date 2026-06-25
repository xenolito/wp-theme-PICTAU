export function initImageLoaderCover(coverSelector, callback) {
	document.querySelectorAll('figure.has-imgloadercover img').forEach(img => {
		const wrapper = img.closest('figure')
		const cover = document.querySelector(coverSelector)
		if (!wrapper && !cover) return

		const markLoaded = () => {
			wrapper.classList.add('loaded')
			if (cover) cover.classList.add('fade-out')
			if (callback) callback()
		}

		if (img.complete && img.naturalWidth > 0) {
			markLoaded()
		} else {
			img.addEventListener('load', markLoaded, { once: true })
			img.addEventListener('error', markLoaded, { once: true })
		}
	})
}
