import { expect, test, type Page } from '@playwright/test';
import { colorThemes, fontPairings, getAllThemeTags } from 'theme-forseen/data';

import { factory } from '../src/lib/product';

const station = colorThemes.find((theme) => theme.name === factory.theme)!;
const count = new Intl.NumberFormat('en-US');

const readout = (page: Page, name: string) => page.locator(`[data-readout="${name}"]`);
const drawer = (page: Page, selector: string) => page.locator('theme-forseen').locator(selector);
const chassis = (page: Page) => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim());

async function untilReporting(page: Page): Promise<void> {
	await page.waitForFunction(() => document.querySelector('theme-forseen')?.state != null);
}

/** Notes how the page stood once parsed, which is before ThemeForseen is sent for. */
async function noteFirstPaint(page: Page): Promise<void> {
	await page.addInitScript(() => {
		document.addEventListener('DOMContentLoaded', () => {
			Object.assign(window, {
				__firstPaint: {
					chassis: getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim(),
					palette: document.querySelector('[data-readout="palette"]')?.textContent,
					mode: document.querySelector('[data-readout="mode"]')?.textContent,
					thrown: document.querySelector<HTMLInputElement>('day-night-switch input:checked')?.value,
					reporting: document.querySelector('theme-forseen')?.state != null,
				},
			});
		});
	});
}

const firstPaint = (page: Page) => page.evaluate(() => (window as unknown as { __firstPaint: Record<string, unknown> }).__firstPaint);

test.beforeEach(async ({ page }) => {
	// The faces ThemeForseen asks its font hosts for are not what is under test.
	await page.route(/fonts\.(googleapis|gstatic|cdnfonts)\.com/, (route) => route.abort());
});

test.describe('as it leaves the factory', () => {
	test('the station wears its own theme and says so', async ({ page }) => {
		await page.goto('/');
		await untilReporting(page);

		expect(await chassis(page)).toBe(station.light.background);
		await expect(readout(page, 'palette')).toHaveText(factory.theme);
		await expect(readout(page, 'type')).toHaveText('Geist + Inter');
		await expect(readout(page, 'mode')).toHaveText('Day');
		await expect(readout(page, 'exploration')).toHaveText('Standby');
	});

	test('the tube reports the size of the collection as the package has it', async ({ page }) => {
		await page.goto('/');

		const counts = page.locator('.screen__counts dd');
		await expect(counts).toHaveText([colorThemes.length, fontPairings.length, getAllThemeTags().length].map((size) => count.format(size)));
	});

	test('the signal locks once ThemeForseen reports in', async ({ page }) => {
		await page.goto('/');
		await untilReporting(page);

		await expect(page.locator('[data-crt-screen]')).toHaveAttribute('data-signal', 'locked');
	});

	test('ThemeForseen is sent for only after the page has loaded', async ({ page }) => {
		await noteFirstPaint(page);
		await page.goto('/');

		expect(await firstPaint(page)).toMatchObject({ reporting: false, chassis: station.light.background });
	});
});

test.describe('exploring', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: 'Open drawer' }).click();
		await untilReporting(page);
		await expect(drawer(page, '.drawer')).toHaveClass(/open/);
	});

	test('the bay opens the drawer and the station reports it', async ({ page }) => {
		await expect(readout(page, 'exploration')).toHaveText('Active');
		await expect(page.locator('[data-bay-status]')).toHaveText('Deployed');

		await drawer(page, '.close-btn').click();

		await expect(readout(page, 'exploration')).toHaveText('Standby');
		await expect(page.locator('[data-bay-status]')).toHaveText('Stowed');
	});

	test('a theme repaints the machine and the tube reports it', async ({ page }) => {
		await drawer(page, '.theme-item[data-index="1"]').click();

		await expect(readout(page, 'palette')).toHaveText(colorThemes[1]!.name);
		expect(await chassis(page)).toBe(colorThemes[1]!.light.background);
		await expect(page.locator('.console')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
	});

	test('a font pairing resets the headline and the tube reports it', async ({ page }) => {
		const pairing = fontPairings[3]!;
		await drawer(page, '.font-item[data-index="3"]').click();

		await expect(readout(page, 'type')).toHaveText(`${pairing.heading} + ${pairing.body}`);
		const headline = await page.locator('#hero-title').evaluate((title) => getComputedStyle(title).fontFamily);
		expect(headline).toContain(pairing.heading);
	});

	test('a selection is on the page again before ThemeForseen is', async ({ page }) => {
		await drawer(page, '.theme-item[data-index="1"]').click();
		await expect(readout(page, 'palette')).toHaveText(colorThemes[1]!.name);

		await noteFirstPaint(page);
		await page.reload();

		expect(await firstPaint(page)).toMatchObject({
			reporting: false,
			chassis: colorThemes[1]!.light.background,
			palette: colorThemes[1]!.name,
		});

		await untilReporting(page);
		expect(await chassis(page)).toBe(colorThemes[1]!.light.background);
	});
});

test.describe('day and night', () => {
	test('the switch takes the station into night', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('radio', { name: 'Night' }).check({ force: true });

		await expect(readout(page, 'mode')).toHaveText('Night');
		expect(await chassis(page)).toBe(station.dark.background);
		await expect(readout(page, 'palette')).toHaveText(factory.theme);
	});

	test('the slot between the legends throws the switch', async ({ page }) => {
		await page.goto('/');

		await page.locator('.switch__track').click();
		await expect(page.getByRole('radio', { name: 'Night' })).toBeChecked();
		await expect(readout(page, 'mode')).toHaveText('Night');

		await page.locator('.switch__track').click();
		await expect(page.getByRole('radio', { name: 'Day' })).toBeChecked();
		await expect(readout(page, 'mode')).toHaveText('Day');
	});

	test('the switch follows the drawer', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: 'Open drawer' }).click();
		await drawer(page, '.mode-btn[data-mode="dark"]').click();

		await expect(page.getByRole('radio', { name: 'Night' })).toBeChecked();
		await expect(readout(page, 'mode')).toHaveText('Night');
	});

	test('night is on the page again before ThemeForseen is', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('radio', { name: 'Night' }).check({ force: true });
		await expect(readout(page, 'mode')).toHaveText('Night');

		await noteFirstPaint(page);
		await page.reload();

		expect(await firstPaint(page)).toMatchObject({
			reporting: false,
			chassis: station.dark.background,
			mode: 'Night',
			thrown: 'night',
		});
	});

	test.describe('for a visitor whose system is dark', () => {
		test.use({ colorScheme: 'dark' });

		test('a first visit is by night, from the first paint', async ({ page }) => {
			await noteFirstPaint(page);
			await page.goto('/');

			expect(await firstPaint(page)).toMatchObject({
				reporting: false,
				chassis: station.dark.background,
				mode: 'Night',
				thrown: 'night',
			});

			await untilReporting(page);
			await expect(readout(page, 'mode')).toHaveText('Night');
			expect(await chassis(page)).toBe(station.dark.background);
		});
	});
});
