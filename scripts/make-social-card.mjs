/**
 * Renders the social card from the page itself: the built site at the
 * canonical viewport, the brand, hero and tube, at 1200 x 630.
 *
 * Usage: pnpm build && pnpm social-card
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';
import sharp from 'sharp';

import { DIST, serve } from './lib/serve.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PORT = 4335;

if (!existsSync(join(DIST, 'index.html'))) {
	console.error('dist/index.html is missing. Run `pnpm build` first.');
	process.exit(1);
}

const server = await serve(PORT);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1536, height: 1024 }, deviceScaleFactor: 2 });
await page.route(/fonts\.(googleapis|gstatic|cdnfonts)\.com/, (route) => route.abort());
await page.goto(`http://localhost:${PORT}/`);
await page.waitForFunction(() => document.querySelector('theme-forseen')?.state != null);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(600);
const capture = await page.screenshot();
await browser.close();
server.close();

// The brand, the hero and the tube, and the mouth of the bay: 1170 x 616 of the reference at 2x, the card's own 1.9 : 1
await sharp(capture)
	.extract({ left: 0, top: 0, width: 2340, height: 1232 })
	.resize(1200, 630)
	.jpeg({ quality: 88, mozjpeg: true })
	.toFile(join(ROOT, 'public/social-card.jpg'));

console.log('  public/social-card.jpg written, 1200 x 630');
