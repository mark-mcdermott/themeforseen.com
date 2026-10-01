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

test('on a tall window the machine sits centred, with its plate beneath it', async ({ page }) => {
	await page.setViewportSize({ width: 1600, height: 1900 });
	await page.goto('/');
	const [, top, , bottom] = (await measureRegions(page)).chassis;
	const plate = await page.locator('.data-plate').boundingBox();

	expect(top).toBeGreaterThan(150);
	expect(1900 - bottom).toBeGreaterThan(150);
	expect(Math.abs(top - (1900 - (plate!.y + plate!.height)))).toBeLessThan(40);
	expect(plate!.y).toBeGreaterThan(bottom);
});

test('the console stops growing past its maximum width', async ({ page }) => {
	await page.setViewportSize({ width: 2400, height: 1400 });
	await page.goto('/');
	const [left, , right] = (await measureRegions(page)).chassis;
	expect(right - left).toBeLessThanOrEqual(1680);
});

/**
 * Below the console the modules recompose. Each must hold its own contents,
 * the header must fold its navigation behind a key, and the pictures must
 * keep their proportions.
 */
for (const size of [
	{ name: 'tablet, wide', width: 1024, height: 1100 },
	{ name: 'tablet', width: 820, height: 1180 },
	{ name: 'phone', width: 390, height: 844 },
]) {
	test.describe(size.name, () => {
		test.use({ viewport: { width: size.width, height: size.height } });

		test('every module holds its own contents', async ({ page }) => {
			await page.goto('/');
			await page.evaluate(() => document.fonts.ready);

			const spilling = await page.evaluate(() =>
				[...document.querySelectorAll<HTMLElement>('.panel:not(.panel--plain)')]
					.filter((panel) => panel.scrollHeight > panel.clientHeight + 1 || panel.scrollWidth > panel.clientWidth + 1)
					.map((panel) => `${panel.dataset.region}: ${panel.scrollWidth}x${panel.scrollHeight} in ${panel.clientWidth}x${panel.clientHeight}`)
			);
			expect(spilling).toEqual([]);
		});

		test('the navigation folds behind a key', async ({ page }) => {
			await page.goto('/');

			await expect(page.locator('.nav')).toBeHidden();
			await expect(page.locator('.menu__nav')).toBeHidden();
			await page.locator('summary').click();
			await expect(page.locator('.menu__nav')).toBeVisible();
			await expect(page.locator('.menu__link')).toHaveCount(5);
		});

		test('the tube keeps its proportions', async ({ page }) => {
			await page.goto('/');
			const [left, top, right, bottom] = (await measureRegions(page)).crt;
			expect((right - left) / (bottom - top)).toBeCloseTo(596 / 544, 1);
		});

		test('the bay is a controls module, not a slot', async ({ page }) => {
			await page.goto('/');
			await expect(page.locator('.bay__interior')).toBeHidden();
			await expect(page.getByRole('button', { name: 'Open drawer' })).toBeVisible();
		});
	});
}

test('on a phone the windows stack, each above its own caption', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');

	const boxes = await page.evaluate(() =>
		['demo-window-1', 'step-1', 'demo-window-2', 'step-2', 'step-3'].map((name) => {
			const element = document.querySelector(`[data-region="${name}"], [data-probe="${name}"]`)!;
			return element.getBoundingClientRect().top;
		})
	);
	expect([...boxes]).toEqual([...boxes].sort((a, b) => a - b));
});
