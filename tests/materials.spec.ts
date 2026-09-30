import { expect, test, type Page } from '@playwright/test';

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { prepare, resolveTokens, untilReporting } from '../scripts/lib/conditions.mjs';
import { contrast, distance, toOklch } from '../src/lib/color';

/**
 * The materials system under the themes least like the factory's. Structure
 * has to stay legible under every one of them; decoration is allowed to fade.
 * `pnpm contact-sheet` renders the same set for looking at.
 */
const sheet = fileURLToPath(new URL('../design/reference/contact-sheet.json', import.meta.url));
const { themes } = JSON.parse(readFileSync(sheet, 'utf8')) as { themes: { name: string; reason: string }[] };

const TOKENS = [
	'--color-bg',
	'--color-text',
	'--color-primary',
	'--color-accent',
	'--color-extra',
	'--seam',
	'--edge-hi',
	'--edge-lo',
	'--recess',
	'--label-ink',
	'--on-primary',
	'--on-accent',
	'--on-extra',
	'--cloud-ink',
	'--cloud-1',
	'--cloud-2',
	'--cloud-3',
	'--cloud-4',
	'--cloud-5',
];

const lightness = (hex: string) => toOklch(hex).l;
const apart = (a: string, b: string) => Math.abs(lightness(a) - lightness(b));

async function tokensUnder(page: Page, name: string, mode: 'day' | 'night'): Promise<Record<string, string>> {
	await prepare(page, name, mode);
	await page.goto('/');
	await untilReporting(page);
	return resolveTokens(page, TOKENS);
}

test.beforeEach(async ({ page }) => {
	await page.route(/fonts\.(googleapis|gstatic|cdnfonts)\.com/, (route) => route.abort());
});

for (const { name, reason } of themes) {
	for (const mode of ['day', 'night'] as const) {
		test(`${name}, ${mode}: ${reason}`, async ({ page }) => {
			const t = await tokensUnder(page, name, mode);
			const faults: string[] = [];
			const hold = (ok: boolean, fault: string) => {
				if (!ok) faults.push(fault);
			};

			// Structure: seams and edges are the chassis colour moved a fixed distance in lightness, whatever the ink does.
			// Lightness, not a WCAG ratio, is the measure: next to black the ratio understates a step the eye sees plainly.
			hold(apart(t['--seam']!, t['--color-bg']!) >= 0.25, `seam only ${apart(t['--seam']!, t['--color-bg']!).toFixed(2)} in lightness from the chassis`);
			hold(
				apart(t['--edge-hi']!, t['--color-bg']!) >= 0.1 || apart(t['--edge-lo']!, t['--color-bg']!) >= 0.1,
				'neither edge stands off the chassis'
			);
			hold(lightness(t['--recess']!) < lightness(t['--color-bg']!) || lightness(t['--color-bg']!) < 0.15, 'recess is not deeper than the chassis');

			// Lettering on the chassis follows the theme's own ink, and must not lose it
			hold(
				contrast(t['--label-ink']!, t['--color-bg']!) >= Math.min(3, contrast(t['--color-text']!, t['--color-bg']!) * 0.8),
				`labels on chassis ${contrast(t['--label-ink']!, t['--color-bg']!).toFixed(2)}:1, the ink itself ${contrast(t['--color-text']!, t['--color-bg']!).toFixed(2)}:1`
			);

			// Lettering on a coloured surface is black or white, and far from the surface
			for (const role of ['primary', 'accent', 'extra']) {
				const on = t[`--on-${role}`]!;
				const surface = t[`--color-${role}`]!;
				hold(on === '#000000' || on === '#ffffff', `on-${role} is ${on}, neither black nor white`);
				hold(apart(on, surface) >= 0.3, `on-${role} only ${apart(on, surface).toFixed(2)} in lightness from ${role}`);
			}

			// The cloud's bands keep clear of the outline and of one another
			const bands = [1, 2, 3, 4, 5].map((i) => t[`--cloud-${i}`]!);
			for (const [i, band] of bands.entries()) {
				hold(apart(band, t['--cloud-ink']!) >= 0.2, `band ${i + 1} within ${apart(band, t['--cloud-ink']!).toFixed(2)} of the outline`);
				for (const [j, other] of bands.entries()) {
					if (j > i) hold(distance(band, other) >= 0.03, `bands ${i + 1} and ${j + 1} are the same colour`);
				}
			}

			expect(faults).toEqual([]);
		});
	}
}
