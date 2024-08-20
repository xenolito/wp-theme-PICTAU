import { Rive } from '@rive-app/canvas-lite';

document.addEventListener('DOMContentLoaded', () => {
	const riveCanvases = document.querySelectorAll('canvas[data-type="rive"]');

	if (!riveCanvases.length) return;

	const r = new Rive({
		// src: 'https://cdn.rive.app/animations/vehicles.riv',
		src: '/xen_media/login_screen_character.riv',
		// OR the path to a discoverable and public Rive asset
		// src: '/public/example.riv',
		canvas: document.querySelector('canvas[data-type="rive"]'),
		autoplay: true,
		stateMachines: 'bumpy',
		onLoad: () => {
			r.resizeDrawingSurfaceToCanvas();
		},
	});
});
