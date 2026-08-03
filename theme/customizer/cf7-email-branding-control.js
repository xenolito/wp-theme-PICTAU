/**
 * Preview en vivo (color + logo + aviso de formato) para la sección "CF7 emails"
 * del Customizer. Escucha los settings nativos cf7_email_brand_color / cf7_email_logo
 * vía la API wp.customize() y actualiza el bloque .pictau-cf7-email-preview-box
 * sin recargar nada (no usa selective refresh ni postMessage).
 */
( function ( $ ) {
	'use strict';

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
		var effectiveLogo = logoUrl || data.defaultLogoUrl || '';

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

		updateNotice( $preview, effectiveLogo );
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
