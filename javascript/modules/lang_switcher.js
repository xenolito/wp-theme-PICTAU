/**
 * Language Switcher for WP with Polylang
 * @author Oscar Rey Tajes @xenolito
 * @Date ©2025
 * @version 1.0
 * @description Language switcher will store the last lang chosen by the switcher on localStorage.
 *
 */

document.addEventListener('DOMContentLoaded', () => {
	const langSwitchers = document.querySelectorAll('.lang-switcher')

	if (!langSwitchers.length) return

	langSwitchers.forEach(switcher => {
		class LangSwitcher {
			constructor(switcher) {
				this.switcher = switcher
				this.isHorizontal = this.switcher.classList.contains('horizontal')
				this.langList = this.switcher.querySelector('.lang-list')

				if (!this.langList) return

				this.langListContainer = this.langList.querySelector('ul')
				this.currentLang = this.switcher.querySelector('.current-lang')
				this.langItems = this.switcher.querySelectorAll('.lang-item')
				this.langCodes = this.switcher.querySelectorAll('.lang-code')
				this.rightMarginAllowed = 32

				this.storeLastChange()

				if (this.isHorizontal) {
					this.setupHorizontal()
				} else {
					this.setup()
				}
			}

			storeLastChange = () => {
				const lastLang = localStorage.getItem('lang_switched')
				this.langItems.forEach(item => {
					item.querySelector('a').addEventListener('click', e => {
						// e.preventDefault()

						const classList = Array.from(e.currentTarget.parentElement.classList)
						const langCode = classList.find(el => el.indexOf('lang-code-') === 0).split('lang-code-')[1]
						localStorage.setItem('lang_switched_by_ui', langCode)
					})
					// console.log(item)
				})
			}

			setup = () => {
				this.cToHide = null

				this.currentLang.addEventListener('mouseover', ev => {
					clearTimeout(this.cToHide)
					this.show()
				})

				this.currentLang.addEventListener('mouseout', ev => {
					this.timerToHide()
				})

				this.langList.addEventListener('mouseover', ev => {
					clearTimeout(this.cToHide)
					// this.show()
				})

				this.langList.addEventListener('mouseout', ev => {
					this.timerToHide()
				})
			}

			show = () => {
				this.updateXPos()
				this.switcher.classList.add('showing')
			}

			hide = () => {
				this.switcher.classList.remove('showing')
				this.updateXPos(true)
			}

			timerToHide = () => {
				this.cToHide = setTimeout(() => {
					this.hide()
				}, 300)
			}

			updateXPos = reset => {
				clearTimeout(this.cToReset)
				if (reset) {
					this.cToReset = setTimeout(() => {
						this.langListContainer.style.translate = `0px 0`
					}, 300)
					return
				}

				const pos = this.langList.getBoundingClientRect()
				const currentRightMargin = window.innerWidth - pos.x - pos.width

				if (currentRightMargin < this.rightMarginAllowed) {
					this.langListContainer.style.translate = `${currentRightMargin - this.rightMarginAllowed}px 0`
				}
			}

			setupHorizontal = () => {
				// console.log('switcher', this.switcher)

				this.currentLang.addEventListener('click', e => {
					e.preventDefault()
					this.switcher.classList.toggle('showing')
				})
			}
		}

		new LangSwitcher(switcher)
	})
})
