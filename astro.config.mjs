// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	site: 'https://themeforseen.com',
	server: { port: 4330 },
	vite: { plugins: [tailwindcss()] },
});
