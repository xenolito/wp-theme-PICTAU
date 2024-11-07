document.addEventListener('DOMContentLoaded', () => {
	const langSwitchers = document.querySelectorAll('.lang-switcher')

	if (!langSwitchers.length) return

	langSwitchers.forEach(switcher => {
		class LangSwitcher {
			constructor(switcher) {
				this.switcher = switcher
				this.langList = this.switcher.querySelector('.lang-list')
				this.langListContainer = this.langList.querySelector('ul')
				this.currentLang = this.switcher.querySelector('.current-lang')
				this.langItems = this.switcher.querySelectorAll('.lang-item')
				this.langCodes = this.switcher.querySelectorAll('.lang-code')
				this.rightMarginAllowed = 32

				this.setup()
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
					console.log('reset')
					return
				}

				const pos = this.langList.getBoundingClientRect()
				const currentRightMargin = window.innerWidth - pos.x - pos.width

				if (currentRightMargin < this.rightMarginAllowed) {
					this.langListContainer.style.translate = `${currentRightMargin - this.rightMarginAllowed}px 0`
				}
			}
		}

		new LangSwitcher(switcher)
	})
})
