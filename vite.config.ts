import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'node',
		globals: true,
		setupFiles: ['./src/tests/setup.ts'],
		alias: {
			'$app/environment': new URL('./src/tests/mocks/app-environment.ts', import.meta.url).pathname
		}
	}
});
