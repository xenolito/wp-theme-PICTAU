/**
 * Catalog Category Menu — toggle expand/collapse for parent categories
 *
 * Works with the [catalog-category-menu] shortcode output.
 */
export function initCatalogMenu() {
	document.querySelectorAll( '.catalog-menu-toggle' ).forEach( ( btn ) => {
		btn.addEventListener( 'click', () => {
			const li       = btn.closest( 'li' );
			const expanded = li.dataset.expanded === 'true';

			li.dataset.expanded = expanded ? 'false' : 'true';
			btn.setAttribute( 'aria-expanded', String( ! expanded ) );
		} );
	} );
}
