import { expect, test } from '@playwright/test';

import { compareRegions, loadReference, measureRegions } from '../scripts/lib/geometry.mjs';

const reference = loadReference();
const [width, height] = reference.viewport;

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
