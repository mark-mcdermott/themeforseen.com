import { expect, test } from '@playwright/test';

import { fileURLToPath } from 'node:url';

import { compareContours, loadContours, measureContours } from '../scripts/lib/contours.mjs';
import { compareRegions, loadReference, measureRegions } from '../scripts/lib/geometry.mjs';
import { compareInk } from '../scripts/lib/ink.mjs';

const reference = loadReference();
const contours = loadContours();
const [width, height] = reference.viewport;

/**
 * The reference was matched on macOS. Other platforms rasterise the same fonts
 * a little differently, so lettering is given more room there. Edges are laid
 * out by CSS and are held to the same tolerance everywhere.
 */
const renderingSlack = process.platform === 'darwin' ? 0 : 3;

test.describe('canonical viewport', () => {
	test.use({ viewport: { width, height } });

	test(`every edge sits within ${reference.tolerance} px of the reference`, async ({ page }) => {
		await page.goto('/');

		const rows = compareRegions(reference, await measureRegions(page));
		const off = rows
			.filter((row) => !row.pass)
			.map((row) => `${row.region} ${row.edge}: reference ${row.expected}, page ${row.actual ?? 'missing'}`);

		expect(off).toEqual([]);
	});

	test(`the tube's outlines hold within ${contours.tolerance} px of the reference all the way round`, async ({ page }) => {
		await page.goto('/');

		const rows = compareContours(contours, await measureContours(page));
		const off = rows
			.filter((row) => !row.pass)
			.map((row) => (row.worst === null ? `${row.contour}: not drawn` : `${row.contour}: ${row.worst} px at its worst`));

		expect(off).toEqual([]);
	});

	test(`lettering sits within ${reference.type.tolerance + renderingSlack} px of the reference`, async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => document.fonts.ready);

		const source = fileURLToPath(new URL(`../${reference.source}`, import.meta.url));
		const capture = await page.screenshot({ clip: { x: 0, y: 0, width, height } });
		const probes = reference.type.probes.map((probe: { tolerance?: number }) => ({
			...probe,
			tolerance: (probe.tolerance ?? reference.type.tolerance) + renderingSlack,
		}));
		const rows = await compareInk(source, capture, probes, reference.type.tolerance + renderingSlack);
		const off = rows
			.filter((row) => !row.pass)
			.map((row) => (row.count ? `${row.probe}: reference has ${row.expected} pieces, page has ${row.actual}` : `${row.probe} #${row.piece}: off by ${JSON.stringify(row.deltas)}`));

		expect(off).toEqual([]);
	});

	test('the machine fits the viewport without scrolling sideways', async ({ page }) => {
		await page.goto('/');
		const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
		expect(overflow).toBeLessThanOrEqual(0);
	});
});

for (const size of [
	{ name: 'wide desktop', width: 1920, height: 1080 },
	{ name: 'small desktop', width: 1280, height: 800 },
	{ name: 'tablet', width: 820, height: 1180 },
	{ name: 'phone', width: 390, height: 844 },
]) {
	test(`${size.name}: nothing overflows sideways`, async ({ page }) => {
		await page.setViewportSize(size);
		await page.goto('/');
		const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
		expect(overflow).toBeLessThanOrEqual(0);
	});
}

test('the console keeps its proportions as it grows', async ({ page }) => {
	const ratios: number[] = [];

	for (const viewportWidth of [1280, 1536, 1680]) {
		await page.setViewportSize({ width: viewportWidth, height: 1100 });
		await page.goto('/');
		const [left, top, right, bottom] = (await measureRegions(page)).chassis;
		ratios.push((right - left) / (bottom - top));
	}

	for (const ratio of ratios) expect(ratio).toBeCloseTo(1510 / 993, 2);
});

test('the console stops growing past its maximum width', async ({ page }) => {
	await page.setViewportSize({ width: 2400, height: 1400 });
	await page.goto('/');
	const [left, , right] = (await measureRegions(page)).chassis;
	expect(right - left).toBeLessThanOrEqual(1680);
});
