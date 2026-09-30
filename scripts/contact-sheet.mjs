/**
 * Renders the machine under the themes in design/reference/contact-sheet.json,
 * by day and by night, and lays the captures out on one sheet:
 * compare/contact-sheet.png. The materials test measures the same renders;
 * this is for looking at them.
 *
 * Usage: pnpm build && pnpm contact-sheet
 */
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';
import sharp from 'sharp';

import { prepare, untilReporting } from './lib/conditions.mjs';
import { DIST, serve } from './lib/serve.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = join(ROOT, 'compare');
const PORT = 4333;
const VIEWPORT = { width: 1536, height: 1024 };
const TILE = { width: 512, height: 341 };
const CAPTION = 34;
const GUTTER = 12;
const COLUMNS = 4;

const { themes } = JSON.parse(readFileSync(join(ROOT, 'design/reference/contact-sheet.json'), 'utf8'));

if (!existsSync(join(DIST, 'index.html'))) {
	console.error('dist/index.html is missing. Run `pnpm build` first.');
	process.exit(1);
}

mkdirSync(OUT, { recursive: true });
const server = await serve(PORT);
const browser = await chromium.launch();
const tiles = [];

for (const { name, reason } of themes) {
	for (const mode of ['day', 'night']) {
		const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 1 });
		await page.route(/fonts\.(googleapis|gstatic|cdnfonts)\.com/, (route) => route.abort());
		await prepare(page, name, mode);
		await page.goto(`http://localhost:${PORT}/`);
		await untilReporting(page);
		await page.waitForTimeout(500);
		const image = await sharp(await page.screenshot()).resize(TILE.width, TILE.height).png().toBuffer();
		await page.close();
		tiles.push({ image, name, mode, reason });
		console.log(`${name}, ${mode}`);
	}
}

await browser.close();
server.close();

const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const caption = (tile) =>
	Buffer.from(
		`<svg width="${TILE.width}" height="${CAPTION}" xmlns="http://www.w3.org/2000/svg">
			<text x="0" y="14" font-family="Menlo, monospace" font-size="12" fill="#e8f2f1">${escape(tile.name)} · ${tile.mode}</text>
			<text x="0" y="29" font-family="Menlo, monospace" font-size="10" fill="#8fb3b0">${escape(tile.reason)}</text>
		</svg>`
	);

const rows = Math.ceil(tiles.length / COLUMNS);
const cell = { width: TILE.width + GUTTER, height: TILE.height + CAPTION + GUTTER };
const sheet = sharp({
	create: { width: COLUMNS * cell.width + GUTTER, height: rows * cell.height + GUTTER, channels: 3, background: '#0b1d1f' },
});

await sheet
	.composite(
		tiles.flatMap((tile, i) => {
			const left = GUTTER + (i % COLUMNS) * cell.width;
			const top = GUTTER + Math.floor(i / COLUMNS) * cell.height;
			return [
				{ input: tile.image, left, top },
				{ input: caption(tile), left, top: top + TILE.height + 4 },
			];
		})
	)
	.png()
	.toFile(join(OUT, 'contact-sheet.png'));

console.log(`\n  ${tiles.length} renders on compare/contact-sheet.png\n`);
