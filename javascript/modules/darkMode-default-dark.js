const Darkmode = class {
	constructor(config = {}) {
		const { theme = 'dark', switcher = '.light-switch', userAuto = true } = config

		this.theme = theme
		this.switcher = switcher
		this.userAuto = userAuto

		this.init()
	}

	init = () => {
		// console.log('dark mode default dark')
		const switcherDomElements = document.querySelectorAll(this.switcher)
		this.switchers = switcherDomElements.length ? switcherDomElements : null

		if (localStorage.getItem('dark-mode') === 'true' || !('dark-mode' in localStorage)) {
			this.switchToDark()
		} else {
			this.switchToLight()
		}

		if (this.switchers) {
			this.setSwitchersListeners()
		}
	}

	setSwitchersListeners = () => {
		this.switchers.forEach(switcher => {
			const { checked } = switcher
		})

		this.switchers.forEach((lightSwitch, i) => {
			lightSwitch.addEventListener('change', () => {
				const { checked } = lightSwitch

				if (lightSwitch.checked) {
					this.switchToDark()
				} else {
					this.switchToLight()
				}
			})
		})
	}

	switchToDark = () => {
		document.documentElement.classList.add(this.theme)
		localStorage.setItem('dark-mode', true)
		this.switched = true

		// If there is DOM UI switcher elements, update their state
		this.updateSwitchersState(true)
	}

	switchToLight = () => {
		document.documentElement.classList.remove(this.theme)
		localStorage.setItem('dark-mode', false)
		this.switched = false
		this.updateSwitchersState(false)
	}

	themeToDark = () => {
		// temporary switch theme, no saving state to localstorage
		document.documentElement.classList.add(this.theme)
	}

	themeToLight = () => {
		// temporary switch theme, no saving state to localstorage
		document.documentElement.classList.remove(this.theme)
	}

	switchTheme = () => {
		if (this.switched) this.switchToLight()
		else this.switchToDark()
	}

	updateSwitchersState = state => {
		if (this.switchers && this.switchers.length) {
			this.switchers.forEach(switcher => {
				switcher.checked = state
			})
		}
	}
}

window.darktheme = new Darkmode()
