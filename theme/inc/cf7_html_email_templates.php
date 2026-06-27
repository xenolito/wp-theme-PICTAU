<?php

/**
 * Email HTML templates for Contact Form 7
 * Automattically add hidden fields for utm parameters and GCID
 *
 * @package pictau_tw
 */


add_action('wpcf7_before_send_mail', 'add_custom_content_to_cf7_email');

function add_custom_content_to_cf7_email($contact_form)
{
	// Get the submission instance
	$submission = WPCF7_Submission::get_instance();

	if ($submission) {
		// Retrieve the current posted data
		$posted_data = $submission->get_posted_data();

		// Retrieve the current mail template
		$mail = $contact_form->prop('mail');

		// Retrieve the current mail template for 'confirmation' email 2
		$mail_2 = $contact_form->prop('mail_2');

		// Add custom content
		// $additional_content = "\n\n---\nExtra Info: " . date('Y-m-d H:i:s');
		// $mail['body'] .= $additional_content;

		// Use an HTML template for the primary email
		$mail['body'] = email_HTMLtemplate_1($mail['body']);
		// $additional_content = email_HTMLtemplate_1($mail['body']);

		// Add custom content to the confirmation email
		// $mail_2['body'] .= $additional_content;
		$mail_2['body'] = email_HTMLtemplate_1($mail_2['body'], true);


		// Save modified mail template back
		$contact_form->set_properties(array('mail' => $mail));

		// Save modified mail template back
		$contact_form->set_properties(array('mail_2' => $mail_2));
	}
}


$logo = get_theme_mod('custom_logo');
$image = $logo ? wp_get_attachment_image_src($logo, 'full') : false;
$image_url = $image ? $image[0] : '';


$brandColor = get_theme_mod('colorThemeMobile', '#19222a');

// colorThemeMobile

$htmlEmailTemplateCssStyles = '
  <style>
    html,
    body {
      margin: 0 auto !important;
      padding: 0 !important;
      height: 100% !important;
      width: 100% !important;
      background: #f1f1f1;
      font-family: "Outfit", sans-serif;
      font-weight: 400;
      font-size: 15px;
      line-height: 1.8;
      color: rgba(0, 0, 0, .8);
		}

    * {
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
    }

    div[style*="margin: 16px 0"] {
      margin: 0 !important;
    }

		.brand-logo {
			filter: brightness(10);
		}

		body {
			-webkit-font-smoothing: antialiased;
			-moz-osx-font-smoothing: grayscale;
		}

		a[x-apple-data-detectors] {
			color: inherit !important;
			text-decoration: none !important;
		}

		.email-section {
			padding: 2.5em;
		}

    table,
    td {
      mso-table-lspace: 0pt !important;
      mso-table-rspace: 0pt !important;
    }

    table {
      border-spacing: 0 !important;
      border-collapse: collapse !important;
      table-layout: fixed !important;
      margin: 0 auto !important;
    }

    a {
      text-decoration: none;
    }

    *[x-apple-data-detectors],
    /* iOS */
    .unstyle-auto-detected-links *,
    .aBn {
      border-bottom: 0 !important;
      cursor: default !important;
      color: inherit !important;
      text-decoration: none !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
    }

		.email-container {
			width: 100% !important;
			margin: 2rem auto !important;
			max-width: 768px !important;
			overflow: hidden !important;
		}

		@media only screen and (max-width: 767px) {
			.email-container {
				margin: 0 auto !important;
			}
		}

		@media only screen and (max-width: 767px) {
			.no-bradius-mobile {
				border-radius: 0 !important;
			}
		}

		h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      font-family: "Outfit", sans-serif;
      color: #000000;
      margin-top: 0;
    }

   /*FOOTER*/

    .footer {
      color: rgba(255, 255, 255, .5);

    }

    .footer .heading {
      color: #ffffff;
      font-size: 20px;
    }

    .footer ul {
      margin: 0;
      padding: 0;
    }

    .footer ul li {
      list-style: none;
      margin-bottom: 10px;
    }

    .footer ul li a {
      color: rgba(255, 255, 255, 1);
    }

  </style>

';

$htmlEmailTemplateHeader = '
<!DOCTYPE html><html lang="es"><head> <meta charset="utf-8"> <!-- utf-8 works for most cases --> <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldnt be necessary --> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine --> <meta name="x-apple-disable-message-reformatting"> <!-- Disable auto-scale in iOS 10 Mail entirely --> <title>[_site_title]</title> <!-- The title tag shows in email notifications, like Android 4.4. --> <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap" rel="stylesheet"> <!-- CSS Reset : BEGIN -->' . $htmlEmailTemplateCssStyles . ' </head>';

$htmlEmailTemplateBodyContentHeader = '
	<body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #f1f1f1;">
		<center style="width: 100%; background-color: #f1f1f1;">
			<div style="display: none; font-size: 1px;max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
				&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
			</div>
			<div style="max-width: 768px; margin: 2rem auto; border-radius:8px;overflow:hidden;" class="email-container no-bradius-mobile">
			<!-- BEGIN BODY -->
				<table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto;">
					<tr>
						<td valign="center" style="padding:2em 2.5em; background-color: ' . $brandColor . '" class="header">
							<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
								<tr>
									<td width="100%" style="text-align: center;" align="center">
										<a href="https://[_site_domain]" style="text-align: center;">
											<img class="brand-logo" src="' . $image_url . '" width="200px" height="auto" style="display:block; margin: auto;">
										</a>
									</td>
								</tr>
							</table>
						</td>
					</tr>
					<tr>
						<td style="background: white;">
							<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
								<tr>
									<td class="email-section" style="background: white; padding: 0 36px;">
										<div class="heading-section" style="padding: 30px;">';

$htmlEmailTemplateBodyContentFooter = '
										</div>
									</td>
								</tr>
							</table>
						</td>
					</tr>
					<!-- 1 Column Text + Button : END -->
				</table>
				<table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto;">
					<tr>
						<td valign="middle" class="footer email-section" style="background-color: ' . $brandColor . '">
							<table width="100%" role="presentation" cellspacing="0" cellpadding="0" border="0">
								<tr>
									<td valign="top" width="100%" align="center">
										<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
											<tr>
												<td align="center" width="100%" cellpadding="25" style="padding: 0 25px; text-align: center;">
													<p style="color: white;">&copy; ' . date('Y') . ' [_site_title]<br>
														<a style="color:white !important; text-decoration: none !important;" href="https://[_site_domain]" target="_blank">[_site_domain]</a>
													</p>
												</td>
											</tr>
										</table>
									</td>
								</tr>
							</table>
						</td>
					</tr>
				</table>
			</div>
		</center>
	</body>
</html>';

function email_HTMLtemplate_1($message, $isMail2 = false)
{
	global $htmlEmailTemplateHeader, $htmlEmailTemplateBodyContentHeader, $htmlEmailTemplateBodyContentFooter;

	if (!$isMail2) {
		// For the primary email (mail 1), we can add tracking info
		$pairs = pct_cf7_collect_tracking();
		$tracking_html = pct_cf7_tracking_block_html($pairs);
		$message .= '<br><br><br>' . $tracking_html;
	}

	$html = $htmlEmailTemplateHeader . $htmlEmailTemplateBodyContentHeader . $message . $htmlEmailTemplateBodyContentFooter;

	return $html;
}






//! HELPERS para UTM y GCLID automácticos en CF7

// Añade campos ocultos con valores de GET a todos los formularios CF7
// SIEMPRE se crean los hidden fields (vacíos por defecto) para que existan
// aunque la página esté cacheada. JS los rellena en el cliente.
add_filter('wpcf7_form_hidden_fields', function ($hidden) {
	$keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', 'msclkid'];
	foreach ($keys as $k) {
		$name = strtolower($k);
		$val  = '';
		if (isset($_GET[$k]) && $_GET[$k] !== '') {
			$val = sanitize_text_field(wp_unslash($_GET[$k]));
		} elseif (isset($_GET[strtoupper($k)]) && $_GET[strtoupper($k)] !== '') {
			$val = sanitize_text_field(wp_unslash($_GET[strtoupper($k)]));
		}
		$hidden[$name] = $val;
	}
	return $hidden;
});

// JS: rellena los hidden fields desde la URL en el cliente (inmune a caché de página)
add_action('wp_footer', function () {
?>
	<script>
		(function() {
			var keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', 'msclkid'];
			var p = new URLSearchParams(window.location.search);
			keys.forEach(function(k) {
				var v = p.get(k) || p.get(k.toUpperCase()) || '';
				if (v) {
					document.querySelectorAll('input[name="' + k + '"]').forEach(function(el) {
						el.value = v;
					});
				}
			});
		})();
	</script>
<?php
});

// Convierte los separadores ' | ' del campo producto en saltos de línea en el email.
// Se usa wpcf7_mail_tag_replaced porque es el único hook que se dispara después de esc_html()
// y permite inyectar <br> en emails HTML sin que CF7 los vuelva a escapar.
add_filter('wpcf7_mail_tag_replaced', function ($replaced, $submitted, $html, $mail_tag) {
	if ($mail_tag->field_name() !== 'producto') {
		return $replaced;
	}
	if ($html) {
		return str_replace(' | ', '<br>', $replaced);
	}
	return str_replace(' | ', "\n", $replaced);
}, 10, 4);

// Asegura que los campos de tracking aparezcan en get_posted_data()
// (CF7 5.8+ puede no incluir hidden fields añadidos via wpcf7_form_hidden_fields)
add_filter('wpcf7_posted_data', function ($posted_data) {
	$keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', 'msclkid'];
	foreach ($keys as $k) {
		if (isset($_POST[$k]) && !isset($posted_data[$k])) {
			$posted_data[$k] = sanitize_text_field(wp_unslash($_POST[$k]));
		}
	}
	return $posted_data;
});


// Añade un bloque con UTM/GCLID al final del email de CF7
// Devuelve un array asociativo normalizado con las keys de tracking => valor
function pct_cf7_collect_tracking($keys = null)
{
	if ($keys === null) {
		$keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'GCLID', 'fbclid', 'msclkid'];
	}

	$submission = class_exists('WPCF7_Submission') ? WPCF7_Submission::get_instance() : null;
	$posted     = $submission ? (array) $submission->get_posted_data() : [];

	$pairs = [];
	foreach ($keys as $k) {
		$lname = strtolower($k);

		// 1º: datos del form (posted data de CF7, incluye wpcf7_posted_data filter)
		$val = $posted[$lname] ?? null;

		// 2º: respaldo por $_POST directo (por si get_posted_data no los incluye)
		if ($val === null || $val === '') {
			$val = isset($_POST[$lname]) ? $_POST[$lname] : null;
		}

		// 3º: respaldo por GET (min / MAYUS), por si no hay fields y llega por URL
		if ($val === null || $val === '') {
			if (isset($_GET[$k]))              $val = $_GET[$k];
			elseif (isset($_GET[strtoupper($k)])) $val = $_GET[strtoupper($k)];
		}

		if (is_array($val)) $val = reset($val);
		$val = sanitize_text_field(wp_unslash((string) $val));

		if ($val !== '') {
			$pairs[$lname] = $val; // normalizamos el nombre en minúsculas
		}
	}

	return $pairs;
}

// Construye el bloque HTML listo para inyectar en <body>
function pct_cf7_tracking_block_html(array $pairs)
{
	if (!$pairs) return '';
	$rows = '';
	foreach ($pairs as $k => $v) {
		$rows .= '<tr>
      <td style="padding:6px 8px;border:1px solid #eee;vertical-align:top;"><strong>' . esc_html(strtoupper($k)) . '</strong></td>
      <td style="padding:6px 8px;border:1px solid #eee;vertical-align:top;">' . esc_html($v) . '</td>
    </tr>';
	}

	return '<!-- Tracking (auto) -->
<table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation"
  style="margin-top:16px;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.45;">
  <thead>
    <tr>
      <th align="left" colspan="2"
        style="padding:8px 8px;background:#f6f6f6;border:1px solid #eee;text-transform:uppercase;letter-spacing:.02em;">
        Tracking
      </th>
    </tr>
  </thead>
  <tbody>' . $rows . '</tbody>
</table>';
}

// Versión texto plano (por si el email no es HTML)
function pct_cf7_tracking_block_text(array $pairs)
{
	if (!$pairs) return '';
	$lines = [];
	foreach ($pairs as $k => $v) {
		$lines[] = strtoupper($k) . ': ' . $v;
	}
	return "-- Tracking --\n" . implode("\n", $lines);
}
