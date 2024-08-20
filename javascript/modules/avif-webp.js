(function (document) {
	'use strict';

	var webpImage =
		'data:image/webp;base64,UklGRi4AAABXRUJQVlA4TCEAAAAvAUAAEB8wA' +
		'iMwAgSSNtse/cXjxyCCmrYNWPwmHRH9jwMA';
	var avifImage =
		'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUEAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAF0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgS0AAAAAABNjb2xybmNseAACAAIAAIAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAGVtZGF0EgAKBzgAPtAgIAkyUBAAAPWc41TP///4gHBX9H8XVK7gGeDllq8TYARA+8Tfsv7L+zPE24eIoIzE0WhHbrqcrTK9VEgEG/hwgB5rdCbvP8g3KYPdV88CvPJnptgQ';

	var webpClass = 'webp';
	var avifClass = 'avif';

	function alreadyTested(format) {
		if (!window.sessionStorage) {
			var test = window.sessionStorage.getItem(format + 'Support');
			if (test === 'false' || test === 'true') {
				return test === 'true';
			}
		}
		return null;
	}

	/**
	 * Test image format support.
	 * @param {String} format - 'webp' or 'avif'
	 * @param {String} imageSrc - base64 represantation of a 2x2 test image
	 * @param {Function} callback - Callback function.
	 */
	function testFormat(format, imageSrc, callback) {
		var tested = alreadyTested(format);

		if (tested === null) {
			var image = new Image();

			image.onload = image.onerror = function () {
				callback(format, image.height === 2);
			};
			image.src = imageSrc;
			return;
		}
		addClass(format, tested);
	}

	/**
	 * Add 'webp' class to html element if supported.
	 * @param {Boolean} support - WebP format support.
	 */
	function addClass(format, support) {
		if (support) {
			var el = document.documentElement;
			if (el.classList) {
				el.classList.add(format === 'webp' ? webpClass : avifClass);
			} else {
				el.className += ' ' + format === 'webp' ? webpClass : avifClass;
			}
			window.sessionStorage.setItem(format + 'Support', true);
		} else {
			window.sessionStorage.setItem(format + 'Support', false);
		}
	}

	testFormat('webp', webpImage, addClass);
	testFormat('avif', avifImage, addClass);
})(document);
