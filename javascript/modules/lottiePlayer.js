import { DotLottie } from '@lottiefiles/dotlottie-web';

DotLottie.setWasmUrl(`${wpGlobalVars.themeURL}/js/dotlottie-player.wasm`);

document.addEventListener('DOMContentLoaded', () => {
	const dotLottieCanvas = document.querySelector('canvas[id*="dotLottie-"]');

	if (!dotLottieCanvas) return;

	const src = '/xen_media/lottie-b.lottie';

	const dotLottiePlayer = new DotLottie({
		canvas: dotLottieCanvas,
		src,
		loop: true,
		autoplay: true,
	});
});
