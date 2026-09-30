/**
 * Makes the icon set from the brand files, into public/:
 *
 *   favicon.ico            16 px from the hand-tuned micro mark, 32 px from the vector
 *   apple-touch-icon.png   180 px, the mark on the chassis cream
 *   icon-192.png           for the manifest, with room round the mark
 *   icon-512.png
 *
 * The SVG favicon is written by hand and stays as it is.
 *
 * Usage: pnpm make-icons
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const BRAND = join(ROOT, 'design/brand');
const OUT = join(ROOT, 'public');

const INK = '#0d0f0e';
const CREAM = '#ecdfc9';

/** The filled mark, rendered `size` tall and centred in a `box` square; transparent unless a background is given. */
async function mark(size, box = size, background) {
	const svg = readFileSync(join(BRAND, 'logo-filled.svg'), 'utf8').replace('fill="currentColor"', `fill="${INK}"`);
	const rendered = await sharp(Buffer.from(svg)).resize({ height: size, fit: 'inside' }).png().toBuffer();
	const { width, height } = await sharp(rendered).metadata();
	return sharp({ create: { width: box, height: box, channels: 4, background: background ?? { r: 0, g: 0, b: 0, alpha: 0 } } })
		.composite([{ input: rendered, left: Math.round((box - width) / 2), top: Math.round((box - height) / 2) }])
		.png()
		.toBuffer();
}

/** An ICO holding PNG-encoded images, which every current browser reads. */
function ico(images) {
	const header = Buffer.alloc(6);
	header.writeUInt16LE(0, 0);
	header.writeUInt16LE(1, 2);
	header.writeUInt16LE(images.length, 4);

	let offset = 6 + 16 * images.length;
	const entries = images.map(({ size, png }) => {
		const entry = Buffer.alloc(16);
		entry.writeUInt8(size === 256 ? 0 : size, 0);
		entry.writeUInt8(size === 256 ? 0 : size, 1);
		entry.writeUInt8(0, 2);
		entry.writeUInt8(0, 3);
		entry.writeUInt16LE(1, 4);
		entry.writeUInt16LE(32, 6);
		entry.writeUInt32LE(png.length, 8);
		entry.writeUInt32LE(offset, 12);
		offset += png.length;
		return entry;
	});

	return Buffer.concat([header, ...entries, ...images.map(({ png }) => png)]);
}

const micro = await sharp(join(BRAND, 'favicon-src/cloud-logo-16px.png')).png().toBuffer();
writeFileSync(join(OUT, 'favicon.ico'), ico([{ size: 16, png: micro }, { size: 32, png: await mark(30, 32) }]));
writeFileSync(join(OUT, 'apple-touch-icon.png'), await mark(124, 180, CREAM));
writeFileSync(join(OUT, 'icon-192.png'), await mark(116, 192, CREAM));
writeFileSync(join(OUT, 'icon-512.png'), await mark(310, 512, CREAM));

console.log('  favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png written to public/');
