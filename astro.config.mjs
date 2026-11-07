// @ts-check
import { defineConfig } from 'astro/config';

// Project site: https://azidoazideazide.github.io/go-worker-pool/
// `base` matches the GitHub repository name.
export default defineConfig({
	site: 'https://azidoazideazide.github.io',
	base: '/go-worker-pool',
	output: 'static',
	markdown: {
		// Dual themes: light colors inline, dark colors as --shiki-dark CSS variables.
		// site.css switches to the dark variables under html[data-theme='dark'].
		shikiConfig: {
			themes: { light: 'github-light', dark: 'github-dark' },
			defaultColor: 'light',
		},
	},
});
