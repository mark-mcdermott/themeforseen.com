/**
 * Traces the outlines of the reference's CRT and writes them to
 * design/reference/crt-contours.json, so the drawn tube can be held against
 * them all the way round and not just at its bounding box.
 *
 * Rays leave the tube's centre one degree apart. Along each, from the outside
 * in, the housing reads:
 *
 *   rim        a thin bright line where the faceplate turns into the funnel
 *   aperture   where the funnel ends and the black recess begins
 *   lip        a thin lit line inside the recess
 *   glass      where the recess ends and the tube's face begins
 *
 * A ray that crosses a screw, a scratch or lettering reads wrongly. Those
 * points disagree with their neighbours and are dropped.
 *
 * Usage: node scripts/trace-crt.mjs
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

import { loadReference } from './lib/geometry.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = fileURLToPath(new URL('../design/reference/crt-contours.json', import.meta.url));

const CENTRE = [750, 361];
const STEP = 0.25;
/** How far in from the rim the recess can lie. */
const DEPTH = 60;

/**
 * Two ways to tell the recess from its lit line, as lightness out of 255 above
 * the darkest thing a ray crosses. Where the funnel is lit the first is sure
 * of itself. In the upper corners the funnel is nearly as dark as the recess,
 * and only the second can tell them apart.
 */
const READINGS = [
	{ black: 8, lit: 13 },
	{ black: 3.5, lit: 8 },
];

/** Rays start inside these, so neither the faceplate nor its screws enter a profile. */
const INSIDE_RIM = [483, 147, 1018, 570];
const INSIDE_FACEPLATE = [475, 139, 1025, 578];

const reference = loadReference();
const { data, info } = await sharp(`${ROOT}${reference.source}`).removeAlpha().raw().toBuffer({ resolveWithObject: true });

function lightness(x, y) {
	const at = (px, py) => {
		const i = (py * info.width + px) * 3;
		return (data[i] + data[i + 1] + data[i + 2]) / 3;
	};
	const x0 = Math.floor(x);
	const y0 = Math.floor(y);
	const fx = x - x0;
	const fy = y - y0;

	return at(x0, y0) * (1 - fx) * (1 - fy) + at(x0 + 1, y0) * fx * (1 - fy) + at(x0, y0 + 1) * (1 - fx) * fy + at(x0 + 1, y0 + 1) * fx * fy;
}

/** How far a ray travels before it leaves a box. */
function reach([left, top, right, bottom], cos, sin) {
	const limits = [];
	if (cos > 1e-9) limits.push((right - CENTRE[0]) / cos);
	if (cos < -1e-9) limits.push((left - CENTRE[0]) / cos);
	if (sin > 1e-9) limits.push((bottom - CENTRE[1]) / sin);
	if (sin < -1e-9) limits.push((top - CENTRE[1]) / sin);
	return Math.min(...limits);
}

function profile(cos, sin, from, to) {
	const radii = [];
	const direction = Math.sign(to - from);
	for (let r = from; direction * (to - r) > 0; r += direction * STEP) radii.push(r);
	return { radii, values: radii.map((r) => lightness(CENTRE[0] + r * cos, CENTRE[1] + r * sin)) };
}

/** The lit line between two black bands, and where those bands begin and end. */
function readRecess({ radii, values }, levels) {
	const darkest = Math.min(...values);
	const black = values.map((value) => value < darkest + levels.black);
	const window = Math.round(5 / STEP);

	for (let i = window; i < radii.length - window; i++) {
		const peak = values[i] >= darkest + levels.lit && values[i] === Math.max(...values.slice(i - 3, i + 4));
		if (!peak || !black.slice(i - window, i).includes(true) || !black.slice(i + 1, i + window + 1).includes(true)) continue;

		let outer = i - 1;
		while (outer > 0 && !black[outer]) outer--;
		while (outer > 0 && black[outer - 1]) outer--;

		let inner = i + 1;
		while (inner < radii.length - 1 && !black[inner]) inner++;
		while (inner < radii.length - 1 && black[inner + 1]) inner++;

		return { aperture: radii[outer], lip: radii[i], glass: radii[inner] };
	}
	return null;
}

function readRim(cos, sin, aperture) {
	const { radii, values } = profile(cos, sin, aperture + 2, reach(INSIDE_FACEPLATE, cos, sin));
	if (radii.length < 8) return null;

	const median = [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
	const brightest = values.indexOf(Math.max(...values));
	const atTheEdge = brightest > values.length - 1 - 1 / STEP;

	return !atTheEdge && values[brightest] - median > 18 ? radii[brightest] : null;
}

/** Radius may change this much per degree along a true outline, and no more. */
const STEEPEST = 6;
const SHORTEST_RUN = 12;
/** Degrees either side that a reading is judged against, and how many of them must be there. */
const REACH = 6;
const QUORUM = 7;
const AGREEMENT = 1.5;

/** Readings that follow one another without a jump, as runs around the circle. */
function runs(readings) {
	const known = readings.flatMap((radius, degrees) => (radius === null ? [] : [{ degrees, radius }]));
	const follows = (a, b) => Math.abs(b.radius - a.radius) <= STEEPEST * ((b.degrees - a.degrees + 360) % 360) + 1;
	const breaks = known.flatMap((reading, i) => (follows(known.at(i - 1), reading) ? [] : [i]));

	if (!breaks.length) return [known];

	return breaks.map((start, i) => {
		const end = breaks[(i + 1) % breaks.length];
		return end > start ? known.slice(start, end) : [...known.slice(start), ...known.slice(0, end)];
	});
}

/** The radius a smooth outline would have here: a parabola through the readings around it. */
function expected(readings, degrees) {
	const near = [];
	for (let k = -REACH; k <= REACH; k++) {
		const radius = k === 0 ? null : readings[(degrees + k + 360) % 360];
		if (radius !== null) near.push([k, radius]);
	}
	if (near.length < QUORUM) return null;

	const sum = (power, weighted = false) => near.reduce((total, [k, radius]) => total + k ** power * (weighted ? radius : 1), 0);
	const [s0, s1, s2, s3, s4] = [0, 1, 2, 3, 4].map((power) => sum(power));
	const [t0, t1, t2] = [0, 1, 2].map((power) => sum(power, true));
	const determinant = (m) =>
		m[0] * (m[4] * m[8] - m[5] * m[7]) - m[1] * (m[3] * m[8] - m[5] * m[6]) + m[2] * (m[3] * m[7] - m[4] * m[6]);

	return determinant([t0, s1, s2, t1, s2, s3, t2, s3, s4]) / determinant([s0, s1, s2, s1, s2, s3, s2, s3, s4]);
}

/**
 * Keeps the readings that belong to the outline. A stray reading either jumps
 * away from its neighbours, which breaks the run it sits in, or stands off the
 * curve its neighbours describe.
 */
function agreeing(readings) {
	let kept = readings.map(() => null);
	for (const run of runs(readings)) if (run.length >= SHORTEST_RUN) for (const { degrees, radius } of run) kept[degrees] = radius;

	for (let pass = 0; pass < 3; pass++) {
		kept = kept.map((radius, degrees) => {
			if (radius === null) return null;
			const smooth = expected(kept, degrees);
			return smooth !== null && Math.abs(radius - smooth) <= AGREEMENT ? radius : null;
		});
	}
	return kept;
}

const rays = Array.from({ length: 360 }, (_, degrees) => {
	const angle = (degrees * Math.PI) / 180;
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);
	const start = reach(INSIDE_RIM, cos, sin);
	const inward = profile(cos, sin, start, start - DEPTH);
	const recess = READINGS.reduce((found, levels) => found ?? readRecess(inward, levels), null);

	return { cos, sin, ...recess, rim: recess ? readRim(cos, sin, recess.aperture) : null };
});

const contours = Object.fromEntries(
	['rim', 'aperture', 'lip', 'glass'].map((name) => {
		const radii = agreeing(rays.map((ray) => ray[name] ?? null));
		const points = rays.flatMap((ray, i) =>
			radii[i] === null ? [] : [[CENTRE[0] + radii[i] * ray.cos, CENTRE[1] + radii[i] * ray.sin].map((value) => Math.round(value * 10) / 10)]
		);
		return [name, points];
	})
);

const lines = Object.entries(contours).map(([name, points]) => `\t\t${JSON.stringify(name)}: ${JSON.stringify(points)}`);

writeFileSync(
	OUT,
	`{
	"source": ${JSON.stringify(reference.source)},
	"tolerance": 3,
	"note": "Outlines of the CRT traced from the reference by scripts/trace-crt.mjs, as [x, y] in its own pixels, clockwise from three o'clock. Do not edit by hand.",
	"contours": {
${lines.join(',\n')}
	}
}
`
);

for (const [name, points] of Object.entries(contours)) {
	const xs = points.map(([x]) => x);
	const ys = points.map(([, y]) => y);
	console.log(`  ${name.padEnd(9)} ${String(points.length).padStart(3)} points   box [${Math.min(...xs)}, ${Math.min(...ys)}, ${Math.max(...xs)}, ${Math.max(...ys)}]`);
}
