/**
 * The CRT's housing, measured from the reference and given in its pixels.
 *
 * Every outline is one construction: a rectangle whose sides bow outward and
 * whose corners are rounded, drawn as eight cubic curves. The numbers are
 * fitted to the outlines traced into design/reference/crt-contours.json, and
 * the tests hold the drawn paths against those all the way round.
 */

export type Box = { x: number; y: number; width: number; height: number };

export type Outline = Box & {
	/** How far the middle of each side stands out from its ends. */
	bow: { top: number; side: number; bottom: number };
	/** Corner radius of the upper pair and of the lower pair. */
	radius: { top: number; bottom: number };
};

export const housing = {
	module: { x: 452, y: 97, width: 596, height: 544 },
	label: { x: 475, y: 103, width: 551, height: 28 },
	faceplate: { x: 465, y: 135, width: 570, height: 456 },
	sill: { x: 452, y: 606, width: 596, height: 35 },
} as const satisfies Record<string, Box>;

/** From the outside in: each lies within the one before. */
export const outlines = {
	/** Where the faceplate turns down into the funnel. */
	rim: { x: 479, y: 142, width: 542.5, height: 432.5, bow: { top: 6, side: 1.5, bottom: 2.5 }, radius: { top: 27.5, bottom: 27.5 } },
	/** Where the funnel ends and the recess begins. */
	aperture: { x: 490, y: 155, width: 520.5, height: 413.5, bow: { top: 12.5, side: 10, bottom: 12 }, radius: { top: 35, bottom: 38 } },
	/** The tube's own edge, catching a little light inside the recess. */
	lip: { x: 493.5, y: 158.5, width: 513, height: 406.5, bow: { top: 12, side: 10, bottom: 12 }, radius: { top: 35.5, bottom: 35.5 } },
	/** Where the face of the tube comes out of the recess's shadow. */
	glass: { x: 500.5, y: 163, width: 498.5, height: 400, bow: { top: 12, side: 8.5, bottom: 11.5 }, radius: { top: 34, bottom: 38 } },
} as const satisfies Record<string, Outline>;

export type OutlineName = keyof typeof outlines;

type Point = readonly [number, number];
type Curve = readonly [Point, Point, Point, Point];

/** How far a corner's handles reach, as a share of its radius. A circle's reach 0.55; these corners are a little squarer. */
const CORNER_REACH = 0.62;

const add = (a: Point, b: Point): Point => [a[0] + b[0], a[1] + b[1]];
const subtract = (a: Point, b: Point): Point => [a[0] - b[0], a[1] - b[1]];
const scale = (a: Point, by: number): Point => [a[0] * by, a[1] * by];
const unit = (a: Point): Point => scale(a, 1 / Math.hypot(a[0], a[1]));

/** A side that leaves `from`, stands `bow` out at its middle, and arrives at `to`. */
function side(from: Point, to: Point, bow: number, outward: Point): Curve {
	const third = scale(subtract(to, from), 1 / 3);
	const push = scale(outward, (bow * 4) / 3);

	return [from, add(add(from, third), push), add(subtract(to, third), push), to];
}

/** A corner that carries on in the direction one side ends and hands over in the direction the next begins. */
function corner(before: Curve, after: Curve, radius: number): Curve {
	const reach = CORNER_REACH * radius;
	const leaving = unit(subtract(before[3], before[2]));
	const arriving = unit(subtract(after[1], after[0]));

	return [before[3], add(before[3], scale(leaving, reach)), subtract(after[0], scale(arriving, reach)), after[0]];
}

/** The eight curves of an outline, clockwise from the top side. */
function curves({ x, y, width, height, bow, radius }: Outline): [Curve, ...Curve[]] {
	const left = x + bow.side;
	const right = x + width - bow.side;
	const top = y + bow.top;
	const bottom = y + height - bow.bottom;

	const above = side([left + radius.top, top], [right - radius.top, top], bow.top, [0, -1]);
	const beside = side([right, top + radius.top], [right, bottom - radius.bottom], bow.side, [1, 0]);
	const below = side([right - radius.bottom, bottom], [left + radius.bottom, bottom], bow.bottom, [0, 1]);
	const before = side([left, bottom - radius.bottom], [left, top + radius.top], bow.side, [-1, 0]);

	return [
		above,
		corner(above, beside, radius.top),
		beside,
		corner(beside, below, radius.bottom),
		below,
		corner(below, before, radius.bottom),
		before,
		corner(before, above, radius.top),
	];
}

/** Path data for an outline, measured from `origin`: by default its own corner. */
export function outlinePath(outline: Outline, origin: Pick<Box, 'x' | 'y'> = outline): string {
	const write = ([px, py]: Point) => `${+(px - origin.x).toFixed(2)} ${+(py - origin.y).toFixed(2)}`;
	const all = curves(outline);

	return [`M${write(all[0][0])}`, ...all.map(([, leaving, arriving, end]) => `C${write(leaving)} ${write(arriving)} ${write(end)}`), 'Z'].join('');
}

/** Custom properties that place a box within its parent, for `.crt__part`. */
export function place(box: Box, parent: Pick<Box, 'x' | 'y'>): string {
	return `--x:${box.x - parent.x};--y:${box.y - parent.y};--w:${box.width};--h:${box.height}`;
}
