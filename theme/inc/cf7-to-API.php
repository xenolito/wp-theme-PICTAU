<?php
/**
 * Plugin to connect CF7 to API
 *
 * @package pictau_tw
 */


add_action('init', 'cf7_to_api_init');


function cf7_to_api_init() {

  // check that the plugin "Contact form 7" is active
  if(!in_array('contact-form-7/wp-contact-form-7.php', apply_filters('active_plugins', get_option('active_plugins'))))  return;

  // add_filter( 'body_class', function( $classes ) {
  //   return array_merge( $classes, array( 'cft-to-api' ) );
  // } );




  // Hook into wpcf7_mail_sent to integrate with Campaign Monitor
  add_action('wpcf7_mail_sent', 'cwpai_cf7_campaign_monitor_integration');


  /**
   * Integrates Contact Form 7 with Campaign Monitor upon form submission.
   *
   * @param WPCF7_ContactForm $cf7 The Contact Form 7 instance.
   */
  function cwpai_cf7_campaign_monitor_integration($cf7) {


      $submission = WPCF7_Submission::get_instance();
      if ($submission) {
          $data = $submission->get_posted_data();

          // Add your Campaign Monitor API key
          $api_key = 'LyjN+QIKadkQIpgO8VR3dTB6+4NKUkH3DCIQA02y+mwjTSqAYo1f66PjQG2rhAAUzo5WfrcD+LQ+5LhXuo3A9g/yJafxvT77fd9eAXIxckqnPf5CLU6KoqdwqKcnMbdzVHORP1g3GveuqONd+XoTMg==';
          $list_id = '9415813de64fd3605fac296e1664e71d';

          // Extract the necessary data from the form submission
          $email = isset($data['email']) ? $data['email'] : '';
          $first_name = isset($data['nombre']) ? $data['nombre'] : '';
          // $last_name = isset($data['your-last-name']) ? $data['your-last-name'] : '';

          // Prepare data for Campaign Monitor
          $subscriber_data = [
              'EmailAddress' => $email,
              // 'Name' => $first_name . ' ' . $last_name,
              'Name' => $first_name,
              'Resubscribe' => true
          ];

          // Initialize cURL
          $ch = curl_init();

          curl_setopt($ch, CURLOPT_URL, 'https://api.createsend.com/api/v3.3/subscribers/' . $list_id . '.json');
          curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
          curl_setopt($ch, CURLOPT_POST, 1);
          curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($subscriber_data));
          curl_setopt($ch, CURLOPT_HTTPHEADER, [
              'Content-Type: application/json',
              'Authorization: Basic ' . base64_encode($api_key . ':x')
          ]);

          // Execute cURL request
          $response = curl_exec($ch);

          // Check for cURL errors
          if (curl_errno($ch)) {
              error_log('Campaign Monitor API request error: ' . curl_error($ch));
          }

          curl_close($ch);
      }
  }


















  // add_action( 'wpcf7_before_send_mail', 'on_submit', 10, 3 );

  function on_submit( $form, &$abort, $submission ) {
    $form_id = $form->id();

    if ($form_id !== '6dc368c' || $form_id !== 'cfa5eca') {
      return;
    }

    $data = $submission->get_posted_data();

    $submission->set_response('PEPE');
  }





// add_action( 'wpcf7_before_send_mail', 'my_change_subject_mail' );

// function my_change_subject_mail($WPCF7_ContactForm)
// {
//   $wpcf7 = WPCF7_ContactForm :: get_current() ;
//   $submission = WPCF7_Submission :: get_instance() ;
//   if ($submission)  {
//     $posted_data = $submission->get_posted_data() ;
//     // nothing's here... do nothing...
//     if ( empty ($posted_data)) return ;

//     $subject = $posted_data['your-message'];
//     //$subject = substr($this->replace_tags( $template['subject'] ), 0, 50);
//     // do some replacements in the cf7 email body
//     $mail = $WPCF7_ContactForm->prop('mail') ;
//     $mail['subject'] = "this is an alternate subject" ;
//     // Save the email body
//     $WPCF7_ContactForm->set_properties( array("mail" => $mail)) ;
//     // error_log( print_r( $WPCF7_ContactForm, 1 ) );
//     // return current cf7 instance
//     return $WPCF7_ContactForm ;
//   }
// }



  // echo 'PINK PANTHER';


}


