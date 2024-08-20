/**
 * countup.js docs: https://github.com/inorganik/countUp.js
 *
 *
 */

import { CountUp } from 'countup.js'
// import { animaCounter } from 'anima-counters';

document.addEventListener('DOMContentLoaded', () => {
	document.querySelectorAll('.pct-counter .pct-counter-number').forEach(el => {
		const easingFn = function (t, b, c, d) {
			var ts = (t /= d) * t
			var tc = ts * t
			return b + c * (tc + -3 * ts + 3 * t)
		}

		const showPrefix = () => {
			el.parentElement.classList.add('show-prefix')
		}

		const hidePrefix = () => {
			el.parentElement.classList.remove('show-prefix')
			// console.log(el.getBoundingClientRect().width)
		}

		let options = {
			// easingFn,
			separator: '.',
			decimal: ',',
			duration: 2.5,
			enableScrollSpy: true,
			scrollSpyOnce: true,
			useEasing: true,
			smartEasingThreshold: 999,
			smartEasingAmount: 333,
			onCompleteCallback: showPrefix,
			onStartCallback: hidePrefix,
		}

		const number = Number(el.textContent)

		const countUp = new CountUp(el, number, options)
		countUp.start()
	})
})
