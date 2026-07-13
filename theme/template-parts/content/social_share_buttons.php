<?php
/**
 * Template part POST sharing buttons to social
 * ! expects/needs social_share_button.js
 *
 *
 * @package pictau_tw
 */

$post_type = get_post_type();
// $pods = false;
// $subheader = false;
// $custom_header_img = false;

$single_post = array_key_exists('single_post', $args);



?>

<div class="social-share-buttons">
	<button aria-label="twitter" data-socialshare="twitter">
		<figure>
			<svg class="ico-twitter" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.3319 5.92804L13.5437 0H12.3087L7.78327 5.14724L4.16883 0H0L5.46574 7.78354L0 14H1.2351L6.01406 8.56434L9.83117 14H14L8.3316 5.92804H8.3319ZM6.64026 7.85211L6.08647 7.07705L1.68013 0.909776H3.57717L7.13314 5.88696L7.68693 6.66202L12.3093 13.1316H10.4122L6.64026 7.85241V7.85211Z" fill="currentColor" /></svg>
		</figure>
	</button>
	<button aria-label="linkedin" data-socialshare="linkedin">
		<figure>
			<svg class="ico-linkedin" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.82969 15.3006V5.44839H0.554962V15.3006H3.83003H3.82969ZM2.19301 4.10347C3.33473 4.10347 4.04553 3.34694 4.04553 2.40148C4.02416 1.43449 3.33473 0.699066 2.21472 0.699066C1.09394 0.699066 0.361938 1.43449 0.361938 2.4014C0.361938 3.34685 1.07248 4.10338 2.17155 4.10338H2.19275L2.19301 4.10347ZM5.64229 15.3006H8.91676V9.79928C8.91676 9.50521 8.93813 9.21038 9.02464 9.00034C9.26126 8.41178 9.80007 7.80254 10.7049 7.80254C11.8896 7.80254 12.3637 8.70593 12.3637 10.0305V15.3006H15.6381V9.65164C15.6381 6.62559 14.0228 5.21741 11.8684 5.21741C10.102 5.21741 9.32623 6.20467 8.89522 6.87709H8.91702V5.44873H5.64246C5.6852 6.37299 5.64221 15.3009 5.64221 15.3009L5.64229 15.3006Z" fill="currentColor"/></svg>
		</figure>
	</button>
	<button aria-label="facebook" data-socialshare="facebook">
		<figure>
			<svg class="ico-facebook" width="8" height="18" viewBox="0 0 8 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.76647 0.5H5.2004C3.67761 0.5 1.98383 1.17811 1.98383 3.51522C1.99127 4.32956 1.98383 5.10945 1.98383 5.98717H0.222168V8.95529H2.03835V17.5H5.37567V8.89891H7.57842L7.77772 5.97885H5.31817C5.31817 5.97885 5.32367 4.67988 5.31817 4.30265C5.31817 3.37908 6.22582 3.43197 6.28042 3.43197C6.71234 3.43197 7.55215 3.4333 7.76773 3.43197V0.5H7.76647Z" fill="currentColor"/></svg>
		</figure>
	</button>
	<button aria-label="bluesky" data-socialshare="bluesky">
		<figure>
			<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="1.25"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-brand-bluesky"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6.335 5.144c-1.654 -1.199 -4.335 -2.127 -4.335 .826c0 .59 .35 4.953 .556 5.661c.713 2.463 3.13 2.75 5.444 2.369c-4.045 .665 -4.889 3.208 -2.667 5.41c1.03 1.018 1.913 1.59 2.667 1.59c2 0 3.134 -2.769 3.5 -3.5c.333 -.667 .5 -1.167 .5 -1.5c0 .333 .167 .833 .5 1.5c.366 .731 1.5 3.5 3.5 3.5c.754 0 1.637 -.571 2.667 -1.59c2.222 -2.203 1.378 -4.746 -2.667 -5.41c2.314 .38 4.73 .094 5.444 -2.369c.206 -.708 .556 -5.072 .556 -5.661c0 -2.953 -2.68 -2.025 -4.335 -.826c-2.293 1.662 -4.76 5.048 -5.665 6.856c-.905 -1.808 -3.372 -5.194 -5.665 -6.856z" /></svg>
		</figure>
	</button>

</div>