import { expect, test } from '@playwright/test';

import map from '../src/assets/map/contiguous-us.json' with { type: 'json' };

/** The tube's content: all of it real, and all of it still under reduced motion. */

test('the clock shows station time, in Austin', async ({ page }) => {
	await page.goto('/');

	const station = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', hour: 'numeric', minute: '2-digit', hour12: true });
	const parts = Object.fromEntries(station.formatToParts(new Date()).map(({ type, value }) => [type, value]));

	await expect(page.locator('[data-clock="time"]')).toHaveText(/^\d{1,2}:\d{2}$/);
	await expect(page.locator('[data-clock="meridiem"]')).toHaveText(parts.dayPeriod!);
	await expect(page.locator('[data-clock="date"]')).toHaveText(/^[A-Z]{3} [A-Z]{3} \d{1,2} \d{4}$/);

	// Within a minute of the test's own reading of the same zone
	const shown = await page.locator('[data-clock="time"]').textContent();
	const [hour, minute] = shown!.split(':').map(Number);
	const expected = Number(parts.hour) * 60 + Number(parts.minute);
	expect(Math.abs(hour! * 60 + minute! - expected)).toBeLessThanOrEqual(1);
});

test('the chart draws every contiguous state and the nation round them', async ({ page }) => {
	await page.goto('/');

	await expect(page.locator('.chart__state')).toHaveCount(map.states.length);
	await expect(page.locator('.chart__nation')).toHaveCount(1);
	await expect(page.locator('.chart__isobar')).toHaveCount(7);
	await expect(page.locator('.chart__centre')).toHaveText(['H', 'L']);
	expect(await page.locator('.chart__front-symbol').count()).toBeGreaterThan(8);
});

test('the tube sits behind the readouts, and the readouts stay real text', async ({ page }) => {
	await page.goto('/');

	const order = await page.evaluate(() => {
		const screen = document.querySelector('[data-crt-screen]')!;
		const children = [...screen.children].map((child) => child.className.baseVal ?? child.className);
		return { first: children[0], last: children[children.length - 1] };
	});
	expect(order.first).toContain('chart');
	expect(order.last).toBe('screen__noise');
	await expect(page.locator('[data-readout="palette"]')).toHaveText(/\S/);
});

test.describe('under reduced motion', () => {
	test.use({ reducedMotion: 'reduce' });

	test('nothing on the tube moves', async ({ page }) => {
		await page.goto('/');

		const animations = await page.evaluate(() =>
			['[data-crt-screen]', '.chart__isobars', '.chart__front', '.screen__noise'].map((selector) => getComputedStyle(document.querySelector(selector)!).animationName)
		);
		expect(animations).toEqual(['none', 'none', 'none', 'none']);
		expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
	});
});

test('the tube moves, a little', async ({ page }) => {
	await page.goto('/');

	const animations = await page.evaluate(() =>
		['[data-crt-screen]', '.chart__isobars', '.screen__noise'].map((selector) => getComputedStyle(document.querySelector(selector)!).animationName)
	);
	expect(animations).toEqual(['flicker', 'drift', 'noise']);
});
