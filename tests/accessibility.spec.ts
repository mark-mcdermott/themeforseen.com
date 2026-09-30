import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * Both pages, at the console's width and at a phone's, by day and by night,
 * against WCAG 2.1 A and AA. The drawer is ThemeForseen's own and is left
 * out; its accessibility is the widget's milestone.
 */
for (const path of ['/', '/about/']) {
	for (const [name, viewport] of [
		['console', { width: 1536, height: 1024 }],
		['phone', { width: 390, height: 844 }],
	] as const) {
		for (const mode of ['day', 'night'] as const) {
			test(`${path} at ${name}, by ${mode}, has no accessibility violations`, async ({ page }) => {
				await page.setViewportSize(viewport);
				await page.emulateMedia({ colorScheme: mode === 'night' ? 'dark' : 'light' });
				await page.goto(path);
				await page.evaluate(() => document.fonts.ready);

				const results = await new AxeBuilder({ page })
					.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
					.exclude('theme-forseen')
					.analyze();

				expect(results.violations.map((violation) => `${violation.id}: ${violation.help} (${violation.nodes.map((node) => node.target.join(' ')).join('; ')})`)).toEqual([]);
			});
		}
	}
}
