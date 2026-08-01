/**
 * Interacciones del editor de cabeceras CSP en el Theme Customizer.
 * Vanilla JS, sin build — mismo criterio que customizer.css (solo se carga
 * en el contexto de admin del Customizer, vía customize_controls_enqueue_scripts).
 *
 * Delegación de eventos sobre document: el Customizer puede montar/(re)pintar
 * el control después de que este script ya se haya ejecutado (o volver a
 * pintarlo si el usuario navega entre secciones), por lo que enganchar
 * listeners directamente a los botones en un init() de una sola vez podía
 * quedarse enganchado a nodos que ya no estaban en el DOM — el clic no hacía
 * nada, sin errores en consola. Delegar sobre document evita depender de ese
 * timing: siempre encuentra los elementos actuales en el momento del clic.
 */
( function () {
	'use strict';

	function getEditor( target ) {
		return target.closest( '.pictau-csp-editor' );
	}

	function setBusy( editor, busy ) {
		editor.querySelectorAll( '.pictau-csp-defaults, .pictau-csp-apply, .pictau-csp-revert' ).forEach( function ( btn ) {
			btn.disabled = busy;
		} );
	}

	function clearFeedback( editor ) {
		var message    = editor.querySelector( '.pictau-csp-message' );
		var errorsList = editor.querySelector( '.pictau-csp-errors' );
		message.textContent = '';
		message.style.color = '';
		errorsList.style.display = 'none';
		errorsList.innerHTML = '';
	}

	function showErrors( editor, errors ) {
		var errorsList = editor.querySelector( '.pictau-csp-errors' );
		errorsList.innerHTML = '';
		( errors || [] ).forEach( function ( err ) {
			var li = document.createElement( 'li' );
			li.textContent = err;
			errorsList.appendChild( li );
		} );
		errorsList.style.display = errors && errors.length ? 'block' : 'none';
	}

	function showMessage( editor, text, isError ) {
		var message = editor.querySelector( '.pictau-csp-message' );
		message.textContent = text;
		message.style.color = isError ? '#b32d2e' : '#046b39';
	}

	/**
	 * Tras un apply/revert con éxito, el servidor devuelve el estado (texto,
	 * estilo, si existe bloque) recién calculado — se usa para refrescar el
	 * párrafo de estado en el DOM. Sin esto, un aviso "fuera de sincronía"
	 * (calculado en el render PHP inicial) se quedaba mostrado indefinidamente
	 * aunque el "Aplicar cambios" hubiera funcionado y ya no fuera cierto.
	 */
	function updateStatus( editor, data ) {
		if ( ! data || typeof data.text !== 'string' ) {
			return;
		}

		var status = editor.querySelector( '.pictau-csp-status' );

		if ( status ) {
			status.textContent = data.text;
			status.setAttribute( 'style', data.style || '' );
		}

		if ( typeof data.exists === 'boolean' ) {
			editor.dataset.markerExists = data.exists ? '1' : '0';
		}
	}

	/**
	 * El botón "Restaurar backup anterior" solo se pinta en PHP si ya había un
	 * backup al cargar la página. Tras el primer "Aplicar cambios" con éxito
	 * ya existe backup, así que hay que añadir el botón sin esperar a un reload.
	 */
	function ensureRevertButton( editor, hasBackup ) {
		if ( ! hasBackup || editor.querySelector( '.pictau-csp-revert' ) ) {
			return;
		}

		var actions = editor.querySelector( '.pictau-csp-actions' );

		if ( ! actions ) {
			return;
		}

		var btn = document.createElement( 'button' );
		btn.type = 'button';
		btn.className = 'button pictau-csp-revert';
		btn.textContent = ( pictauCspData.i18n && pictauCspData.i18n.revertLabel ) || 'Restaurar backup anterior';
		actions.appendChild( btn );
	}

	/**
	 * Tras aplicar/revertir con éxito, dispara el botón "Publicar" nativo del
	 * Customizer. Sin esto, el .htaccess ya está escrito (AJAX propio, al
	 * margen del changeset) pero el checkbox "Activar..." sigue marcado como
	 * cambio sin publicar, y WP muestra su alerta de "perderás los cambios"
	 * al cerrar el personalizador aunque ya no sea cierto. Si no hay nada
	 * pendiente de publicar, el botón está disabled y el .click() no hace nada.
	 */
	function triggerCustomizerPublish() {
		var saveBtn = document.getElementById( 'save' );
		if ( saveBtn && ! saveBtn.disabled ) {
			saveBtn.click();
		}
	}

	function ajax( action, extraParams ) {
		var body = new URLSearchParams( Object.assign(
			{ action: action, nonce: pictauCspData.nonce },
			extraParams || {}
		) );

		return fetch( pictauCspData.ajaxUrl, {
			method: 'POST',
			credentials: 'same-origin',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: body.toString(),
		} ).then( function ( response ) {
			return response.json().then( function ( json ) {
				return { ok: response.ok, json: json };
			} );
		} );
	}

	document.addEventListener( 'click', function ( event ) {
		if ( typeof pictauCspData === 'undefined' ) {
			return;
		}

		var i18n = pictauCspData.i18n || {};

		var defaultsBtn = event.target.closest( '.pictau-csp-defaults' );
		if ( defaultsBtn ) {
			var editor = getEditor( defaultsBtn );
			if ( editor ) {
				editor.querySelector( '.pictau-csp-textarea' ).value = pictauCspData.defaultTemplate;
				clearFeedback( editor );
			}
			return;
		}

		var applyBtn = event.target.closest( '.pictau-csp-apply' );
		if ( applyBtn ) {
			var editor = getEditor( applyBtn );
			if ( ! editor || ! window.confirm( i18n.confirmApply || 'Confirm?' ) ) {
				return;
			}

			var textarea = editor.querySelector( '.pictau-csp-textarea' );

			clearFeedback( editor );
			setBusy( editor, true );
			showMessage( editor, i18n.applying || '', false );

			ajax( 'pictau_csp_apply', { csp_content: textarea.value } )
				.then( function ( result ) {
					setBusy( editor, false );

					if ( result.ok && result.json && result.json.success ) {
						var successData = result.json.data || {};
						showMessage( editor, successData.message, false );
						updateStatus( editor, successData );
						ensureRevertButton( editor, successData.hasBackup );
						triggerCustomizerPublish();
					} else {
						var data = result.json && result.json.data ? result.json.data : {};
						showMessage( editor, data.message || i18n.genericError, true );
						showErrors( editor, data.errors );
					}
				} )
				.catch( function () {
					setBusy( editor, false );
					showMessage( editor, i18n.genericError || 'Error', true );
				} );
			return;
		}

		var revertBtn = event.target.closest( '.pictau-csp-revert' );
		if ( revertBtn ) {
			var editor = getEditor( revertBtn );
			if ( ! editor || ! window.confirm( i18n.confirmRevert || 'Confirm?' ) ) {
				return;
			}

			clearFeedback( editor );
			setBusy( editor, true );
			showMessage( editor, i18n.reverting || '', false );

			ajax( 'pictau_csp_revert', {} )
				.then( function ( result ) {
					setBusy( editor, false );

					if ( result.ok && result.json && result.json.success ) {
						var successData = result.json.data || {};
						showMessage( editor, successData.message, false );
						updateStatus( editor, successData );
						ensureRevertButton( editor, successData.hasBackup );
						triggerCustomizerPublish();
					} else {
						var data = result.json && result.json.data ? result.json.data : {};
						showMessage( editor, data.message || i18n.genericError, true );
					}
				} )
				.catch( function () {
					setBusy( editor, false );
					showMessage( editor, i18n.genericError || 'Error', true );
				} );
		}
	} );
} )();
