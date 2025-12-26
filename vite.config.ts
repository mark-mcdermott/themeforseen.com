import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	build: {
		rollupOptions: {
			// theme-forseen is a local linked package only available in dev
			external: ['theme-forseen']
		}
	},
	ssr: {
		// Externalize theme-forseen for SSR builds
		external: ['theme-forseen']
	}
});
