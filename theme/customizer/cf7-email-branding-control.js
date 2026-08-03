/**
 * Preview en vivo (color + logo + aviso de formato) para la sección "CF7 emails"
 * del Customizer. Escucha los settings nativos cf7_email_brand_color / cf7_email_logo
 * vía la API wp.customize() y actualiza el bloque .pictau-cf7-email-preview-box
 * sin recargar nada (no usa selective refresh ni postMessage).
 */
( function ( $ ) {
	'use strict';

	// Cache de resoluciones SVG -> PNG ya pedidas al servidor en esta sesión del
	// Customizer, para no repetir la petición admin-ajax en cada tecla/cambio.
	var resolvedLogoCache = {};

	// Resuelve la URL "efectiva" a mostrar en el preview: si no es SVG, se usa tal
	// cual (no hace falta ir al servidor); si es SVG, el JS no puede generar el PNG
	// por sí mismo (requiere Imagick/binarios en servidor), así que se pide la
	// misma resolución que usa el email real vía admin-ajax (pct_cf7_get_effective_email_logo_image()).
	function resolveLogoUrl( rawUrl, callback ) {
		var data = window.pictauCf7EmailBranding || {};

		if ( ! rawUrl ) {
			callback( data.defaultLogoUrl || '' );
			return;
		}

		if ( 'svg' !== getExtension( rawUrl ) ) {
			callback( rawUrl );
			return;
		}

		if ( resolvedLogoCache.hasOwnProperty( rawUrl ) ) {
			callback( resolvedLogoCache[ rawUrl ] );
			return;
		}

		if ( ! data.ajaxUrl ) {
			callback( '' );
			return;
		}

		$.post( data.ajaxUrl, {
			action: 'pct_cf7_resolve_email_logo_preview',
			nonce: data.nonce,
			logo_url: rawUrl
		} ).done( function ( response ) {
			var resolved = ( response && response.success && response.data && response.data.url ) || '';
			resolvedLogoCache[ rawUrl ] = resolved;
			callback( resolved );
		} ).fail( function () {
			callback( '' );
		} );
	}

	function getExtension( url ) {
		if ( ! url ) {
			return '';
		}
		var clean = url.split( '?' )[ 0 ].split( '#' )[ 0 ];
		var match = clean.match( /\.([a-z0-9]+)$/i );
		return match ? match[ 1 ].toLowerCase() : '';
	}

	function getFormatWarning( url ) {
		var data = window.pictauCf7EmailBranding || {};
		var ext = getExtension( url );

		if ( ! ext || [ 'jpg', 'jpeg', 'png', 'webp' ].indexOf( ext ) !== -1 ) {
			return null;
		}

		if ( 'svg' === ext ) {
			return data.svgConversionSupported
				? { level: 'info', message: data.i18n && data.i18n.svgConvertible }
				: { level: 'warning', message: data.i18n && data.i18n.svgNotConvertible };
		}

		return { level: 'warning', message: data.i18n && data.i18n.unsafeFormat };
	}

	function updateNotice( $preview, url ) {
		var $notice = $preview.find( '.pictau-cf7-email-preview-format-notice' );
		var warning = getFormatWarning( url );

		if ( ! warning || ! warning.message ) {
			$notice.remove();
			return;
		}

		if ( ! $notice.length ) {
			$notice = $( '<p class="pictau-cf7-email-preview-format-notice"></p>' );
			$preview.find( '.pictau-cf7-email-preview-box' ).after( $notice );
		}

		$notice
			.attr( 'class', 'pictau-cf7-email-preview-format-notice pictau-cf7-email-preview-format-' + warning.level )
			.text( ( 'warning' === warning.level ? '⚠️ ' : 'ℹ️ ' ) + warning.message );
	}

	function updatePreview( color, logoUrl ) {
		var $preview = $( '.pictau-cf7-email-preview' );
		var $box = $preview.find( '.pictau-cf7-email-preview-box' );
		if ( ! $box.length ) {
			return;
		}

		$box.css( 'background-color', color );

		var data = window.pictauCf7EmailBranding || {};

		// El aviso de formato se basa en la extensión de la URL seleccionada (cruda),
		// no en la resuelta: sigue siendo válido aunque la resolución tarde/falle.
		updateNotice( $preview, logoUrl || data.defaultLogoUrl || '' );

		resolveLogoUrl( logoUrl, function ( effectiveLogo ) {
			var $img = $box.find( '.pictau-cf7-email-preview-logo' );
			var $fallbackText = $box.find( '.pictau-cf7-email-preview-fallback-text' );

			if ( effectiveLogo ) {
				if ( ! $img.length ) {
					$img = $( '<img class="pictau-cf7-email-preview-logo" alt="">' ).appendTo( $box );
				}
				$img.attr( 'src', effectiveLogo );
				$fallbackText.remove();
			} else {
				$img.remove();
				if ( ! $fallbackText.length ) {
					$( '<span class="pictau-cf7-email-preview-fallback-text"></span>' )
						.text( data.siteName || '' )
						.appendTo( $box );
				}
			}
		} );
	}

	wp.customize( 'cf7_email_brand_color', function ( value ) {
		value.bind( function ( newColor ) {
			updatePreview( newColor, wp.customize( 'cf7_email_logo' ).get() );
		} );
	} );

	wp.customize( 'cf7_email_logo', function ( value ) {
		value.bind( function ( newLogoUrl ) {
			updatePreview( wp.customize( 'cf7_email_brand_color' ).get(), newLogoUrl );
		} );
	} );

} )( jQuery );
