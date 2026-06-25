/**
 * Social share buttons logic for Social media
 * version: 1.0
 * @supports: Facebook, Twitter/X, Linkedin, Bluesky
 * @to-do: Support for: Whatsapp, Pinterest, Reddit, Tumblr, Email, Copy link
 * @license Copyright 2008-2025, Oscar Rey Tajes. All rights reserved.
 * @author: Oscar Rey Tajes, oscar.rey.tajes@gmail.com
 * © @xenolito 2025
 *
 */

import { getConfigByAtt } from './attributesToConfigObj'

const hyphenToCamelcase = str => {
	return str.replace(/-([a-z])/g, k => k[1].toUpperCase())
}

const getRandom = (min, max) => {
	return Math.random() * (max - min) + min
}

document.addEventListener('DOMContentLoaded', () => {
	const attributeId = 'socialshare'
	const socialButton = document.querySelectorAll(`[data-${attributeId}]`)

	if (!socialButton.length) return

	const SocialShareButton = class {
		constructor(socialButton, config = {}) {
			const { log = false, socialshare = '' } = config

			this.socialButton = socialButton
			this.company = socialshare !== '' ? socialshare : false
			this.log = log === 'true' || log === '1' ? true : false

			this.urls = {
				twitter: 'https://twitter.com/intent/tweet?text=',
				facebook: 'https://www.facebook.com/sharer/sharer.php?u=',
				linkedin: 'https://www.linkedin.com/feed/?linkOrigin=LI_BADGE&shareActive=true&shareUrl=',
				bluesky: 'https://bsky.app/intent/compose?text=',
			}

			if (!this.company) {
				console.log('⛔️ No social share company name found for ', this.socialButton.querySelector('svg').classList)
				return
			}

			this.setupSocialShareButton()
		}

		setupSocialShareButton = () => {
			this.socialButton.addEventListener('click', () => {
				const post = encodeURIComponent(this.getPostUrl())
				// const post = encodeURIComponent('https://www.mercanza.es/mercanza-se-une-como-patrocinador-de-dama-spain-para-impulsar-la-gestion-de-la-informacion-y-los-datos-en-espana/')
				const url = `${this.urls[this.company]}${post}`

				this.popup(url, 750, 630)
			})
		}

		popup = (url, width, height) => {
			const left = window.innerWidth / 2 - width / 2
			const top = window.innerHeight / 2 - height / 2
			const newWindow = window.open(url, 'center window', 'resizable = yes, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left)
			newWindow.focus()
		}

		getPostUrl = () => {
			const url = window.location.href
			return url
		}
	}

	socialButton.forEach(socialButton => {
		// const datasets = socialButton.dataset
		const config = getConfigByAtt(socialButton, attributeId, true)
		// console.log('CONFIG ', config)
		socialButton.SocialShareButton = new SocialShareButton(socialButton, config)
	})
})
