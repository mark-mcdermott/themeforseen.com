import sharp from 'sharp';

const EDGES = ['left', 'top', 'right', 'bottom'];

/**
 * Finds lettering inside a box by its ink, and returns each piece's bounding
 * box in image coordinates. The same routine reads the reference and the page,
 * so whatever it misjudges it misjudges the same way in both.
 */
export async function findInk(image, probe) {
	const { box, split, ink = 'dark', threshold = 110, minSize = 4, minInk = 2, gap = 1 } = probe;
	const [left, top, right, bottom] = box;
	const width = right - left;
	const height = bottom - top;

	const pixels = await sharp(image).extract({ left, top, width, height }).removeAlpha().greyscale().raw().toBuffer();
	const marked = (x, y) => (ink === 'dark' ? pixels[y * width + x] < threshold : pixels[y * width + x] > threshold);

	const along = split === 'lines' ? height : width;
	const across = split === 'lines' ? width : height;
	const at = (a, c) => (split === 'lines' ? marked(c, a) : marked(a, c));

	const bands = [];
	let start = null;
	let last = null;

	for (let a = 0; a < along; a++) {
		let count = 0;
		for (let c = 0; c < across; c++) if (at(a, c)) count++;

		if (count >= (split === 'lines' ? minInk : 1)) {
			if (start === null) start = a;
			last = a;
		} else if (start !== null && a - last > gap) {
			bands.push([start, last]);
			start = null;
		}
	}
	if (start !== null) bands.push([start, last]);

	return bands
		.filter(([from, to]) => to - from + 1 >= (split === 'lines' ? minSize : 3))
		.map(([from, to]) => {
			let low = across;
			let high = -1;
			for (let a = from; a <= to; a++) {
				for (let c = 0; c < across; c++) {
					if (at(a, c)) {
						if (c < low) low = c;
						if (c > high) high = c;
					}
				}
			}

			return split === 'lines'
				? [left + low, top + from, left + high + 1, top + to + 1]
				: [left + from, top + low, left + to + 1, top + high + 1];
		});
}

/**
 * Pairs each piece of lettering in the reference with the same piece in the
 * page. A probe may carry `page` overrides for where the page's lettering is
 * deliberately a different ink from the reference's.
 */
export async function compareInk(reference, page, probes, tolerance) {
	const rows = [];

	for (const probe of probes) {
		const expected = await findInk(reference, probe);
		const actual = await findInk(page, { ...probe, ...probe.page });

		expected.forEach((box, i) => {
			const found = actual[i];
			const checked = probe.edges ?? EDGES;
			const deltas = found ? found.map((value, k) => (checked.includes(EDGES[k]) ? value - box[k] : 0)) : null;

			rows.push({
				probe: probe.name,
				piece: i + 1,
				expected: box,
				actual: found ?? null,
				deltas,
				pass: deltas !== null && deltas.every((delta) => Math.abs(delta) <= (probe.tolerance ?? tolerance)),
			});
		});

		if (actual.length !== expected.length) {
			rows.push({ probe: probe.name, piece: null, expected: expected.length, actual: actual.length, deltas: null, pass: false, count: true });
		}
	}

	return rows;
}
