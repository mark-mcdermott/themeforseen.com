import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const REFERENCE = fileURLToPath(new URL('../../design/reference/crt-contours.json', import.meta.url));

export function loadContours() {
	return JSON.parse(readFileSync(REFERENCE, 'utf8'));
}

/** Every drawn outline that names itself, as page points about a pixel apart. */
export function measureContours(page) {
	return page.evaluate(() =>
		Object.fromEntries(
			[...document.querySelectorAll('[data-contour]')].map((path) => {
				const toPage = path.getScreenCTM();
				const length = path.getTotalLength();
				const count = Math.ceil(length);

				const points = Array.from({ length: count }, (_, i) => {
					const { x, y } = path.getPointAtLength((i / count) * length).matrixTransform(toPage);
					return [x + scrollX, y + scrollY];
				});

				return [path.getAttribute('data-contour'), points];
			})
		)
	);
}

function distanceToSegment([px, py], [ax, ay], [bx, by]) {
	const [dx, dy] = [bx - ax, by - ay];
	const along = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));

	return Math.hypot(px - (ax + along * dx), py - (ay + along * dy));
}

function distanceToOutline(point, outline) {
	let nearest = Infinity;
	for (let i = 0; i < outline.length; i++) {
		nearest = Math.min(nearest, distanceToSegment(point, outline[i], outline[(i + 1) % outline.length]));
	}
	return nearest;
}

/**
 * One row per outline: how far the reference's points stand from the drawn
 * line. The reference is traced at every degree it can be read, so a row
 * passes only if the line holds all the way round.
 */
export function compareContours(reference, measured) {
	const round = (value) => Math.round(value * 100) / 100;

	return Object.entries(reference.contours).map(([contour, points]) => {
		const drawn = measured[contour];
		if (!drawn) return { contour, points: points.length, worst: null, mean: null, pass: false };

		const distances = points.map((point) => distanceToOutline(point, drawn));
		const worst = Math.max(...distances);

		return {
			contour,
			points: points.length,
			worst: round(worst),
			mean: round(distances.reduce((sum, distance) => sum + distance, 0) / distances.length),
			pass: worst <= reference.tolerance,
		};
	});
}
