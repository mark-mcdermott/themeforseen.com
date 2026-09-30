/**
 * Puts the machine under a given theme, for captures and tests. Sets what
 * ThemeForseen reads at start, so the whole path runs for real: the widget
 * paints the page and the adapter follows it.
 */
import { colorThemes } from 'theme-forseen/data';

/** The position of a theme in the collection, by name; the first of that name, as the drawer would show it. */
export function indexOfTheme(name) {
	const index = colorThemes.findIndex((theme) => theme.name === name);
	if (index === -1) throw new Error(`No theme named "${name}" in the collection.`);
	return index;
}

/** Arranges for the next page load to come up under `name`, by day or by night. */
export async function prepare(page, name, mode) {
	await page.addInitScript(
		({ index, night }) => {
			localStorage.removeItem('tf01-conditions');
			localStorage.setItem('themeforseen-lighttheme', String(index));
			localStorage.setItem('themeforseen-darktheme', String(index));
			localStorage.setItem('themeforseen-darkmode', String(night));
		},
		{ index: indexOfTheme(name), night: mode === 'night' }
	);
}

export async function untilReporting(page) {
	await page.waitForFunction(() => document.querySelector('theme-forseen')?.state != null);
}

/**
 * The colours the page's tokens come to, as sRGB hex, read back through a
 * canvas so that a colour the browser holds in oklch comes out the same way
 * as one it holds in rgb.
 */
export async function resolveTokens(page, tokens) {
	return page.evaluate((names) => {
		const probe = document.createElement('div');
		document.body.append(probe);
		const canvas = new OffscreenCanvas(1, 1);
		const context = canvas.getContext('2d', { willReadFrequently: true });
		const hex = (name) => {
			probe.style.color = `var(${name})`;
			context.fillStyle = getComputedStyle(probe).color;
			context.fillRect(0, 0, 1, 1);
			const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
			return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
		};
		const resolved = Object.fromEntries(names.map((name) => [name, hex(name)]));
		probe.remove();
		return resolved;
	}, tokens);
}
