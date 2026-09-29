/**
 * Captures the built page at the canonical viewport and compares it with the
 * reference. Writes to compare/ (ignored):
 *
 *   capture.png        the page
 *   side-by-side.png   reference, then page
 *   blend.png          the two at 50%
 *   difference.png     where they differ; masked regions dimmed
 *   report.json        every measured edge and piece of lettering against the reference
 *
 * The two reports are the measures that matter. The reference is textured
 * concept art, so pixel difference is only a guide to where to look.
 *
 * Usage: pnpm build && pnpm compare
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';
import sharp from 'sharp';

import { compareRegions, loadReference, measureRegions } from './lib/geometry.mjs';
import { compareInk } from './lib/ink.mjs';
import { DIST, serve } from './lib/serve.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = join(ROOT, 'compare');
const PORT = 4332;

async function capture(width, height) {
	const browser = await chromium.launch();
	const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
	await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
	await page.evaluate(() => document.fonts.ready);

	const regions = await measureRegions(page);
	const image = await page.screenshot({ clip: { x: 0, y: 0, width, height } });
	await browser.close();

	return { regions, image };
}

async function writeImages(reference, image, regions) {
	const [width, height] = reference.viewport;
	const referenceImage = await sharp(join(ROOT, reference.source)).removeAlpha().toBuffer();

	await sharp(image).toFile(join(OUT, 'capture.png'));

	await sharp({ create: { width: width * 2 + 24, height, channels: 3, background: '#000' } })
		.composite([
			{ input: referenceImage, left: 0, top: 0 },
			{ input: image, left: width + 24, top: 0 },
		])
		.png()
		.toFile(join(OUT, 'side-by-side.png'));

	const half = await sharp(image).ensureAlpha(0.5).png().toBuffer();
	await sharp(referenceImage).composite([{ input: half }]).png().toFile(join(OUT, 'blend.png'));

	const dim = reference.masked
		.filter((name) => regions[name])
		.map((name) => {
			const [left, top, right, bottom] = regions[name].map(Math.round);
			return {
				input: { create: { width: right - left, height: bottom - top, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0.8 } } },
				left,
				top,
			};
		});

	await sharp(referenceImage)
		.composite([{ input: await sharp(image).removeAlpha().png().toBuffer(), blend: 'difference' }])
		.png()
		.toBuffer()
		.then((difference) => sharp(difference).composite(dim).png().toFile(join(OUT, 'difference.png')));
}

function printReport(rows, tolerance) {
	const failed = rows.filter((row) => !row.pass);
	const worst = Math.max(...rows.map((row) => Math.abs(row.delta ?? Infinity)));

	console.log('\n  region               edge     reference    page    off by');
	console.log('  ' + '-'.repeat(60));
	for (const row of rows) {
		const flag = row.pass ? ' ' : '!';
		const actual = row.actual === null ? 'missing' : String(row.actual);
		const delta = row.delta === null ? '' : (row.delta > 0 ? '+' : '') + row.delta;
		console.log(
			`${flag} ${row.region.padEnd(20)} ${row.edge.padEnd(8)} ${String(row.expected).padStart(9)} ${actual.padStart(7)} ${delta.padStart(9)}`
		);
	}
	console.log('  ' + '-'.repeat(60));
	console.log(`  ${rows.length} edges, ${failed.length} beyond ${tolerance} px, worst ${worst} px\n`);

	return failed.length;
}

function printLettering(rows, tolerance) {
	const sign = (value) => (value > 0 ? '+' : '') + value;

	console.log('  lettering                 piece   left   top  right bottom');
	console.log('  ' + '-'.repeat(60));
	for (const row of rows) {
		const flag = row.pass ? ' ' : '!';
		if (row.count) {
			console.log(`${flag} ${row.probe.padEnd(25)} reference has ${row.expected} pieces, page has ${row.actual}`);
			continue;
		}
		const deltas = row.deltas ? row.deltas.map((delta) => sign(delta).padStart(6)).join(' ') : '  not found in the page';
		console.log(`${flag} ${row.probe.padEnd(25)} ${String(row.piece).padStart(5)} ${deltas}`);
	}
	const failed = rows.filter((row) => !row.pass).length;
	console.log('  ' + '-'.repeat(60));
	console.log(`  ${rows.length} pieces, ${failed} beyond ${tolerance} px\n`);

	return failed;
}

if (!existsSync(join(DIST, 'index.html'))) {
	console.error('dist/index.html is missing. Run `pnpm build` first.');
	process.exit(1);
}

mkdirSync(OUT, { recursive: true });
const reference = loadReference();
const server = await serve(PORT);

try {
	const { regions, image } = await capture(...reference.viewport);
	const rows = compareRegions(reference, regions);

	await writeImages(reference, image, regions);
	const lettering = await compareInk(join(ROOT, reference.source), image, reference.type.probes, reference.type.tolerance);

	writeFileSync(
		join(OUT, 'report.json'),
		JSON.stringify({ viewport: reference.viewport, edges: { tolerance: reference.tolerance, rows }, lettering: { tolerance: reference.type.tolerance, rows: lettering } }, null, '\t')
	);

	const quiet = process.argv.includes('--brief');
	const edgeFailures = quiet ? rows.filter((row) => !row.pass).length : printReport(rows, reference.tolerance);
	if (quiet) console.log(`\n  ${rows.length} edges, ${edgeFailures} beyond ${reference.tolerance} px\n`);
	const letteringFailures = printLettering(lettering, reference.type.tolerance);

	console.log(`  images and report written to compare/`);
	process.exitCode = edgeFailures || letteringFailures ? 1 : 0;
} finally {
	server.close();
}
