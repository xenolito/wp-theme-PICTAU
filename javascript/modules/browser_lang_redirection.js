/**
 * Browser language automatic redirection
 * @author Oscar Rey Tajes @xenolito
 * @Date ©2025
 * @version 1.1
 * @description If user use language switcher, it is saved at localStorage and this automatic change will stop running.
 *
 */

document.addEventListener('DOMContentLoaded', () => {
	if (localStorage.getItem('lang_switched_by_ui')) return

	const isHomePage = document.querySelector('body.home')

	if (!isHomePage) return

	const domain = window.location.origin
	const path = window.location.pathname.split('/')[1].toLocaleLowerCase()

	const locales = {
		default: 'en',
		fr: 'fr',
		en: 'en',
		it: 'it',
		co: 'es-co',
		es: 'es',
	}

	const getLang = () => {
		const userLang = navigator.language || navigator.userLanguage
		const lang = userLang.split('-')[0].toLowerCase()

		const locale = userLang.split('-')[1].toLowerCase()

		if (lang === 'es' && locale === 'co') {
			return locales[locale]
		}
		if (!locales[lang]) return locales.en

		return locales[lang]
	}

	const redirect = locales[getLang()] === 'es' ? `${domain}/` : `${domain}/${getLang()}`

	// console.log('redirect', redirect, 'current path:', path, 'getLang:', getLang(), window.location.href)

	if (isHomePage && redirect && path !== getLang() && redirect !== window.location.href) {
		// console.log(path !== locales[getLang()], locales[getLang()])
		// console.log('REDIRECCIÓN=>', path, '=>', redirect)
		window.location.href = redirect
	}
})
