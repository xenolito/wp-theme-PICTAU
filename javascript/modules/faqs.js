document.addEventListener('DOMContentLoaded', () => {
	const faqs = document.querySelectorAll('.pct-faqs')

	if (!faqs.length) return

	const Faq = class {
		constructor(faqGroup, behaviour = 'all') {
			this.faqGroup = faqGroup
			this.behaviour = behaviour
			this.status = null
			this.iconClosed =
				'<svg class="iconClosed" xmlns="https://www.w3.org/2000/svg" fill="currentColor" width="12" height="12" viewBox="0 0 448 512"><path d="M432 256c0 17.69-14.33 32.01-32 32.01H256v144c0 17.69-14.33 31.99-32 31.99s-32-14.3-32-31.99v-144H48c-17.67 0-32-14.32-32-32.01s14.33-31.99 32-31.99H192v-144c0-17.69 14.33-32.01 32-32.01s32 14.32 32 32.01v144h144C417.7 224 432 238.3 432 256z"></path></svg>'
			this.iconOpened =
				'<svg class="iconOpened" fill="currentColor" xmlns="https://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 448 512"><path d="M400 288h-352c-17.69 0-32-14.32-32-32.01s14.31-31.99 32-31.99h352c17.69 0 32 14.3 32 31.99S417.7 288 400 288z"></path></svg>'

			if (!this.faqGroup) return

			this.buildFaqUI()
		}

		buildFaqUI = () => {
			// console.log('build faq layout', this.faqGroup);
			this.faqs = this.faqGroup.querySelectorAll('.faq')

			if (!this.faqs.length) return

			this.faqs.forEach(faq => {
				const questionGroup = document.createElement('div')
				questionGroup.setAttribute('class', 'faq-question')

				const questionContent = faq.querySelector(':scope > *:first-child')

				faq.prepend(questionGroup)
				questionGroup.append(questionContent)

				const statusIcon = document.createElement('div')
				statusIcon.setAttribute('class', 'faq-status')
				statusIcon.innerHTML = `${this.iconClosed} ${this.iconOpened}`
				questionGroup.prepend(statusIcon)

				questionGroup.addEventListener('click', ev => {
					const tgt = ev.currentTarget.parentElement

					if (this.isFaqOpened(tgt)) {
						this.closeFaq(tgt)
					} else {
						if (this.behaviour !== 'all') {
							// cerramos todas las preguntas abiertas
							this.faqs.forEach(faq => {
								if (faq.classList.contains('opened')) {
									this.closeFaq(faq)
								}
							})
						}

						this.openFaq(tgt)
					}
					if (this.pinnedSections.length) {
						// ! Update every pinned section scrollTrigger present on the page
						this.pinnedSections.forEach(pinContainer => {
							setTimeout(() => {
								pinContainer.pinElement.sT.refresh()
							}, 1000)
						})
					}
				})
			})
			this.faqGroup.style.opacity = '1'
			this.fixPinnedSectionsSideEffects()
		}

		fixPinnedSectionsSideEffects = () => {
			//! The faqs effect on document height makes sideffects on the scrollTrigger of pinned Sections present on the same page.
			//! To fix it, we need to update every pinned Section scrollTriggers every time we expand/collapse a faq.
			//! So we store every pinned section reference and update it on click event.
			this.pinnedSections = document.querySelectorAll(`[data-pin`)
		}

		openFaq = faq => {
			faq.classList.add('opened')
		}

		closeFaq = faq => {
			faq.classList.remove('opened')
		}

		isFaqOpened = faq => {
			return faq.classList.contains('opened')
		}
	}

	faqs.forEach(faqs => {
		const faqUI = new Faq(faqs)
	})
})
