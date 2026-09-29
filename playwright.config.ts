import { defineConfig, devices } from '@playwright/test';

const PORT = 4331;

export default defineConfig({
	testDir: 'tests',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	reporter: process.env.CI ? 'github' : 'list',
	use: { baseURL: `http://localhost:${PORT}` },
	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
				// Without this, Chromium on Linux snaps every glyph to a whole pixel and
				// a line of small lettering drifts several pixels from where macOS sets it.
				launchOptions: { args: ['--font-render-hinting=none'] },
			},
		},
	],
	webServer: {
		command: `node scripts/serve.mjs ${PORT}`,
		url: `http://localhost:${PORT}`,
		reuseExistingServer: !process.env.CI,
	},
});
