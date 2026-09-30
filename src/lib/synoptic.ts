/**
 * The weather on the tube: a high, a low, the isobars round each, and a
 * front between them, in the screen's own pixels. None of it is a forecast;
 * it is the instrument's idea of weather, drawn to sit where the reference
 * draws it. Computed at build so the SVG carries plain paths.
 */

type Point = readonly [number, number];

export interface Centre {
	kind: 'H' | 'L';
	at: Point;
	/** Radii of the isobars round it, innermost first. */
	rings: number[];
	/** How far the rings wander from circles, as a share of their radius. */
	wobble: number;
	/** Turns the wobble so no two centres look alike. */
	phase: number;
}

export const centres: Centre[] = [
	{ kind: 'H', at: [377, 172], rings: [22, 46, 72], wobble: 0.16, phase: 0.6 },
	{ kind: 'L', at: [348, 268], rings: [18, 40, 64, 90], wobble: 0.2, phase: 2.1 },
];

/** The front's spine: two cubic curves from the top of the screen to its foot. */
export const front = {
	d: 'M322 8 C 380 40, 448 78, 466 130 C 484 182, 468 260, 432 372',
	curves: [
		[[322, 8], [380, 40], [448, 78], [466, 130]],
		[[466, 130], [484, 182], [468, 260], [432, 372]],
	] as Point[][],
	/** Distance between the symbols along the front. */
	pitch: 31,
	/** Radius of each symbol. */
	symbol: 7,
};

/** A closed isobar: a circle whose radius breathes with two slow harmonics. */
export function isobar({ at: [cx, cy], wobble, phase }: Centre, radius: number, steps = 48): string {
	const points: string[] = [];
	for (let i = 0; i < steps; i++) {
		const angle = (i / steps) * Math.PI * 2;
		const r = radius * (1 + wobble * (0.6 * Math.sin(2 * angle + phase) + 0.4 * Math.sin(3 * angle - phase * 1.7)));
		points.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`);
	}
	return `M${points.join('L')}Z`;
}

function cubicAt([p0, p1, p2, p3]: Point[], t: number): Point {
	const u = 1 - t;
	return [
		u ** 3 * p0![0] + 3 * u * u * t * p1![0] + 3 * u * t * t * p2![0] + t ** 3 * p3![0],
		u ** 3 * p0![1] + 3 * u * u * t * p1![1] + 3 * u * t * t * p2![1] + t ** 3 * p3![1],
	];
}

export interface Symbol {
	at: Point;
	/** Direction the symbol faces, in degrees, normal to the front. */
	angle: number;
}

/** Points spaced evenly along the front, with the outward normal at each, for the warm-front semicircles. */
export function frontSymbols(): Symbol[] {
	const samples: Point[] = front.curves.flatMap((curve) => Array.from({ length: 60 }, (_, i) => cubicAt(curve, i / 60)));
	const symbols: Symbol[] = [];
	let travelled = 0;
	let next = front.pitch / 2;

	for (let i = 1; i < samples.length; i++) {
		const [x0, y0] = samples[i - 1]!;
		const [x1, y1] = samples[i]!;
		const step = Math.hypot(x1 - x0, y1 - y0);
		if (travelled + step >= next) {
			// The symbol's flat side lies along the front; its dome stands off the western side
			const angle = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
			symbols.push({ at: [+((x0 + x1) / 2).toFixed(1), +((y0 + y1) / 2).toFixed(1)], angle: +angle.toFixed(1) });
			next += front.pitch;
		}
		travelled += step;
	}

	return symbols;
}
