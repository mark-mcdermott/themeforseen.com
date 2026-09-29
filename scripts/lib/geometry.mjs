import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const REFERENCE = fileURLToPath(new URL('../../design/reference/geometry.json', import.meta.url));
const EDGES = ['left', 'top', 'right', 'bottom'];

export function loadReference() {
	return JSON.parse(readFileSync(REFERENCE, 'utf8'));
}

/** Page rectangles of every element that names a region, as [left, top, right, bottom]. */
export function measureRegions(page) {
	return page.evaluate(() =>
		Object.fromEntries(
			[...document.querySelectorAll('[data-region]')].map((element) => {
				const box = element.getBoundingClientRect();
				const edges = [box.left + scrollX, box.top + scrollY, box.right + scrollX, box.bottom + scrollY];
				return [element.getAttribute('data-region'), edges.map((value) => Math.round(value * 10) / 10)];
			})
		)
	);
}

/** One row per edge: where the reference has it, where the page has it, and the gap. */
export function compareRegions(reference, measured) {
	return Object.entries(reference.regions).flatMap(([region, expected]) => {
		const actual = measured[region];

		return EDGES.map((edge, i) => {
			const delta = actual ? Math.round((actual[i] - expected[i]) * 10) / 10 : null;
			return {
				region,
				edge,
				expected: expected[i],
				actual: actual ? actual[i] : null,
				delta,
				pass: delta !== null && Math.abs(delta) <= reference.tolerance,
			};
		});
	});
}
