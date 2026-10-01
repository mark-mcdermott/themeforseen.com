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
		// At the console's width the drawer is in its bay, deployed
		await expect(readout(page, 'exploration')).toHaveText('Active');
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
		await untilReporting(page);
		await expect(drawer(page, '.drawer')).toHaveClass(/open/);
	});

	test('the key beneath the bay stows and deploys the drawer, and the station reports it', async ({ page }) => {
		const key = page.locator('[data-bay-toggle]');
		const status = page.locator('.bay-controls [data-bay-status]');

		await expect(readout(page, 'exploration')).toHaveText('Active');
		await expect(status).toHaveText('Deployed');
		await expect(key).toHaveText('Stow');

		await key.click();
		await expect(drawer(page, '.drawer')).not.toHaveClass(/open/);
		await expect(readout(page, 'exploration')).toHaveText('Standby');
		await expect(status).toHaveText('Stowed');
		await expect(key).toHaveText('Deploy');

		await key.click();
		await expect(drawer(page, '.drawer')).toHaveClass(/open/);
		await expect(readout(page, 'exploration')).toHaveText('Active');
	});

	test("the drawer's own close stows it", async ({ page }) => {
		await drawer(page, '.close-btn').click();

		await expect(readout(page, 'exploration')).toHaveText('Standby');
		await expect(page.locator('.bay-controls [data-bay-status]')).toHaveText('Stowed');
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
		await untilReporting(page);
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

test.describe('the bay', () => {
	const box = (page: Page, selector: string) => page.locator(selector).evaluate((element) => element.getBoundingClientRect().toJSON());

	test.describe("at the console's width", () => {
		test.use({ viewport: { width: 1536, height: 1024 } });

		test.beforeEach(async ({ page }) => {
			await page.goto('/');
			await untilReporting(page);
		});

		test('the drawer sits in the bay, with no tab on the page', async ({ page }) => {
			const cavity = await box(page, '[data-drawer-bay]');
			const docked = await box(page, 'theme-forseen');

			await expect(page.locator('theme-forseen')).toHaveAttribute('docked', '');
			expect(docked.left).toBeCloseTo(cavity.left + 5, 0);
			expect(docked.right).toBeCloseTo(cavity.right - 5, 0);
			expect(docked.top).toBeCloseTo(cavity.top + 5, 0);
			expect(docked.bottom).toBeCloseTo(cavity.bottom - 5, 0);
			await expect(drawer(page, '.drawer-toggle')).toBeHidden();
		});

		test('opening on its selection leaves the page where it was', async ({ page }) => {
			expect(await page.evaluate(() => window.scrollY)).toBe(0);
		});

		test("the arrow keys are the page's until the pointer is on the drawer", async ({ page }) => {
			await page.mouse.move(300, 300);
			await page.keyboard.press('ArrowDown');
			await expect(readout(page, 'palette')).toHaveText(factory.theme);

			await drawer(page, '.themes-list').hover();
			await page.keyboard.press('ArrowUp');
			await expect(readout(page, 'palette')).not.toHaveText(factory.theme);
		});

		test('the drawer wears the chassis, by day and by night', async ({ page }) => {
			const surface = () => drawer(page, '.drawer').evaluate((element) => getComputedStyle(element).backgroundColor);
			const chassisColor = () => page.locator('.console').evaluate((element) => getComputedStyle(element).backgroundColor);

			expect(await surface()).toBe(await chassisColor());

			await page.getByRole('radio', { name: 'Night' }).check({ force: true });
			await expect(readout(page, 'mode')).toHaveText('Night');
			expect(await surface()).toBe(await chassisColor());
		});
	});

	test('the drawer keeps its proportions as the console scales', async ({ page }) => {
		const drawerWidth = async () => {
			await page.goto('/');
			await untilReporting(page);
			// In its own pixels, whatever the console's unit
			return drawer(page, '.drawer').evaluate((element) => element.clientWidth);
		};

		await page.setViewportSize({ width: 1536, height: 1024 });
		const canonical = await drawerWidth();
		await page.setViewportSize({ width: 1280, height: 800 });
		const small = await drawerWidth();

		expect(canonical).toBe(440);
		expect(Math.abs(small - canonical)).toBeLessThanOrEqual(1);
	});

	test.describe("below the console's width", () => {
		test.use({ viewport: { width: 1024, height: 900 } });

		test('there is no slot: the drawer waits behind its tab and opens over the page', async ({ page }) => {
			await page.goto('/');
			await untilReporting(page);

			await expect(page.locator('theme-forseen')).not.toHaveAttribute('docked');
			await expect(drawer(page, '.drawer')).not.toHaveClass(/open/);
			await expect(readout(page, 'exploration')).toHaveText('Standby');
			await expect(drawer(page, '.drawer-toggle')).toBeVisible();

			await page.getByRole('button', { name: 'Open drawer' }).click();
			await expect(drawer(page, '.drawer')).toHaveClass(/open/);
			await expect(readout(page, 'exploration')).toHaveText('Active');

			// Once it has slid in, it is against the window's right edge, from the top
			const edge = () => drawer(page, '.drawer').evaluate((element) => element.getBoundingClientRect().toJSON());
			await expect.poll(async () => (await edge()).right).toBe(1024);
			expect((await edge()).top).toBe(0);
		});
	});

	test('widening to the console docks the drawer, and narrowing puts it away', async ({ page }) => {
		await page.setViewportSize({ width: 1024, height: 900 });
		await page.goto('/');
		await untilReporting(page);
		await expect(drawer(page, '.drawer')).not.toHaveClass(/open/);

		await page.setViewportSize({ width: 1400, height: 900 });
		await expect(page.locator('theme-forseen')).toHaveAttribute('docked', '');
		await expect(drawer(page, '.drawer')).toHaveClass(/open/);

		await page.setViewportSize({ width: 1024, height: 900 });
		await expect(page.locator('theme-forseen')).not.toHaveAttribute('docked');
		await expect(drawer(page, '.drawer')).not.toHaveClass(/open/);
	});

	test('a page without a bay keeps the drawer behind its tab', async ({ page }) => {
		await page.goto('/about');
		await untilReporting(page);

		await expect(page.locator('theme-forseen')).not.toHaveAttribute('docked');
		await expect(drawer(page, '.drawer-toggle')).toBeVisible();
	});
});
