// Set the Preflight flag based on the build target.
const includePreflight = 'editor' === process.env._TW_TARGET ? false : true

module.exports = {
	darkMode: 'class',
	presets: [
		// Manage Tailwind Typography's configuration in a separate file.
		require('./tailwind-typography.config.js'),
	],
	content: [
		// Ensure changes to PHP files and `theme.json` trigger a rebuild.
		'./theme/**/*.php',
	],
	theme: {
		// Extend the default Tailwind theme.
		extend: {
			textColor: {
				header: 'var(--color-header)',
				content: 'var(--color-content)',
			},
			backgroundImage: {
				'gradient-A': 'linear-gradient(to top, rgb(252, 0, 141), rgb(252, 91, 42) 100%)',
				'gradient-footer': 'linear-gradient(to top, #f5350f 1%, rgb(252, 0, 141) 100%)',
				'gradient-footer-3': 'linear-gradient(to bottom, rgb(255, 0, 0) 20%, rgb(252, 0, 141) 100%)',
			},
			boxShadow: {
				card: '0 0 20px 4px rgba(244,67,54,.25)',
			},
		},
	},
	corePlugins: {
		// Disable Preflight base styles in builds targeting the editor.
		preflight: includePreflight,
	},
	plugins: [
		// Add Tailwind Typography (via _tw fork).
		// require('@_tw/typography'),

		// Extract colors and widths from `theme.json`.
		require('@_tw/themejson'),

		// Uncomment below to add additional first-party Tailwind plugins.
		// require('@tailwindcss/forms'),
		// require('@tailwindcss/aspect-ratio'),
		// require('@tailwindcss/container-queries'),
	],
}
