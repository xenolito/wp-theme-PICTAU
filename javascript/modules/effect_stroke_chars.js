/**
 * Make duplicated stroker text and places target z-index in between the 2...

 */

const hyphenToCamelcase = (str) => {
	return str.replace(/-([a-z])/g, (k) => k[1].toUpperCase());
};

document.addEventListener('DOMContentLoaded', () => {
	const attribute = 'data-stroke-chars';

	const strokes = document.querySelectorAll(`[${attribute}]`);

	if (!strokes.length) return;

	strokes.forEach((stroker) => {
		const dts = hyphenToCamelcase(attribute.split('data-')[1]);
		const attInBetween = 'data-stroke-chars-inbetween';

		const toStrokeSelector = stroker.dataset[dts];
		const inBetweenTargetSelector =
			stroker.dataset[hyphenToCamelcase(attInBetween.split('data-')[1])];

		const toStrokeElement = stroker.querySelector(toStrokeSelector);
		const inBetweenTargetElement = stroker.querySelector(
			inBetweenTargetSelector
		);

		const charColor = window.getComputedStyle(toStrokeElement)['color'];

		// console.log(
		// 	'toStrokeSelector ',
		// 	toStrokeSelector,
		// 	'inBetweenTargetSelector',
		// 	inBetweenTargetSelector,
		// 	charColor
		// );

		const strokeContainer = document.createElement('div');
		strokeContainer.setAttribute('class', 'strokeContainer');

		toStrokeElement.before(strokeContainer);

		strokeContainer.prepend(toStrokeElement);
		strokeContainer.style.display = 'grid';
		strokeContainer.style.gridTemplateColumns = '1fr';

		const strokedElement = toStrokeElement.cloneNode(true);
		// copiamos las clases...
		strokedElement.setAttribute(
			'class',
			`${toStrokeElement.classList.toString().replace(',', ' ')} stroked`
		);
		strokedElement.style.webkitTextStroke = `2px ${charColor}`;
		strokedElement.style.color = 'transparent';

		strokeContainer.append(strokedElement);

		// posicionamos el inBetween target entre los 2 elementos de texto no-stroked -> inBetween -> stroked
		strokeContainer
			.querySelector('.stroked')
			.before(inBetweenTargetElement);

		strokeContainer.querySelectorAll(':scope > *').forEach((el, index) => {
			el.style.gridRowStart = '1';
			el.style.gridColumnStart = '1';
			el.style.zIndex = index + 1;
		});
	});

	// if (!pinElement) return; // element with pinSelector not found!
});
