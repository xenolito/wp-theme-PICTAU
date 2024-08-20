// const iconRight = `<svg class="icon icon-tabler icon-tabler-chevron-right" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 6l6 6l-6 6" /></svg>`;

const makeMobileNav = (targetDom) => {
	const mobileHeader = targetDom;
	if (!mobileHeader) return;
	const mobileMenu = mobileHeader.querySelector('.main-nav-mobile');
	if (!mobileMenu) return;

	const MobileMenuNav = class {
		constructor(mobileHeader, headerNavigation, state = false) {
			this.showing = state;
			this.header = mobileHeader;
			this.menu = this.header.querySelector('.main-nav-mobile');
			this.menuToggler = document.querySelector('#menu-switcher');
			this.primaryMenu = this.menu.querySelector('#primary-menu');
			this.parentShowing = false;

			if (!this.menu || !this.menuToggler) {
				console.log(
					`⛔️ .main-nav-mobiel or #menu-switcher not found on DOM`
				);
			}

			this.addBlocker();
			this.buildSwitcherMenu();
			this.buildParentUI(this.menu);
			this.resetMenuOnClick();
		}

		reset = () => {
			this.showing = false;
			this.menu.classList.remove('nav-opened');
			if (this.parentShowing) {
				this.parentShowing.classList.remove('showing');
				this.parentShowing = false;
			}
			this.hideBlocker();
		};

		resetMenuOnClick = () => {
			this.menu
				// .querySelectorAll('.menu-item:not(:has(.sub-menu))')
				.querySelectorAll(
					'.menu-item:not(.menu-item-has-children):not(.menu-item-is-shortcode)'
				)
				.forEach((el) => {
					el.addEventListener('click', () => {
						this.reset();
					});
				});
		};

		buildParentUI = () => {
			this.menu
				.querySelectorAll('.menu-item:has(.sub-menu)')
				.forEach((el) => {
					const link = el.querySelector('a, .menu-item-nolink');

					link.addEventListener('click', (ev) => {
						ev.preventDefault();
						const parent = ev.currentTarget.parentElement;
						if (
							this.parentShowing &&
							this.parentShowing === parent
						) {
							this.parentShowing.classList.remove('showing');
							this.parentShowing = false;
						} else {
							if (this.parentShowing) {
								this.parentShowing.classList.remove('showing');
								this.parentShowing = false;
							}
							this.parentShowing = parent;
							this.parentShowing.classList.add('showing');
						}
					});
				});
		};

		buildSwitcherMenu = () => {
			this.body = document.querySelector('body');
			this.menuToggler.style.cursor = 'pointer';
			this.menuToggler.style.pointerEvents = 'all';

			this.menuToggler.addEventListener('click', () => {
				const mainNavOpened =
					this.menu.classList.contains('nav-opened');
				if (mainNavOpened) {
					// OCULTAR SUBMENÚS Y RESETEAR NAVEGACIÓN
					this.reset(350);
				} else {
					this.showing = true;
					this.menu.classList.add('nav-opened');
					this.showBlocker();
				}
			});
		};

		showBlocker = () => {
			this.body.classList.add('stop-scrolling');
			this.blocker.style.opacity = '1';
			this.blocker.style.pointerEvents = 'all';
		};

		hideBlocker = () => {
			this.body.classList.remove('stop-scrolling');
			this.blocker.style.pointerEvents = 'none';
			this.blocker.style.opacity = '0';
		};

		addBlocker = () => {
			this.blocker = document.createElement('div');
			this.blocker.setAttribute('class', 'submenu-bg-blocker');

			this.blocker.setAttribute(
				'style',
				`display: block;position: fixed;top: 0;left: 0;background-color: transparent;width: 100vw;height: 100vh;transition: all .3s ease;opacity: 0;pointer-events: none;`
			);

			this.header.prepend(this.blocker);

			this.blocker.addEventListener('click', () => {
				this.menuToggler.dispatchEvent(new Event('click'));
			});
		};
	};

	window.pictauMobileNav = new MobileMenuNav(mobileHeader);
};

document.addEventListener('DOMContentLoaded', () => {
	const mainHeaderWrap = '.main-header-wrap';
	const targetDom = document.querySelector(mainHeaderWrap);
	if (!targetDom) {
		console.log(
			`⛔️ Main Header element selector "${mainHeaderWrap}" not matched @ DOM\nReview your css class markup or html`
		);
		return;
	}
	makeMobileNav(targetDom, 'visuallyUnderParent');
});
