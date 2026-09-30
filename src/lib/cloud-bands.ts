/**
 * The five bands inside the cloud, from the active palette.
 *
 * The palette's three chromatic roles, accent, primary and extra, are the
 * anchors. Sorted dark to light, they make a path through OKLCH, and the bands
 * are five stops along it: the anchors themselves and the colours halfway
 * between them. So the factory palette's teal, orange and amber give teal,
 * green, orange, orange and amber: the brand's stripes, from three colours
 * that are really in the theme.
 *
 * Between two anchors the hue turns the short way round, unless the two are
 * close to opposite, when either way is as short: then it turns through the
 * other anchors' hues if it can, and otherwise through green, which is the
 * way the brand's stripes go.
 *
 * Anchors that are grey, or that repeat one another, are left out, and a
 * palette with one colour or none still gets five bands from it. Every band
 * is kept well away from the ink that outlines the cloud, so none can vanish
 * into it, and each stands a little out from the band above it, so none can
 * vanish into its neighbour.
 */
import { between, distance, onArc, shortTurn, toHex, toOklch, type Oklch } from './color';

export interface ChromaticRoles {
	primary: string;
	accent: string;
	extra: string;
}

export type CloudBands = [string, string, string, string, string];

const BANDS = 5;
/** Below this chroma a colour reads as grey. */
const GREY = 0.03;
/** Anchors closer than this are the same colour to the eye. */
const SAME = 0.06;
/** How far, in lightness, a band keeps from the ink. */
const CLEAR_OF_INK = 0.22;
/** The least a band stands out from the one above it, in lightness. */
const STEP = 0.04;
/** The lightest and darkest a band is allowed to be. */
const LIGHTNESS = { lo: 0.12, hi: 0.92 };
/** Hues this far apart are as good as opposite, and the way round between them is a choice. */
const OPPOSITE = 150;
/** The hue the turn goes through when nothing else decides it. */
const GREEN = 130;

function anchors({ accent, primary, extra }: ChromaticRoles): Oklch[] {
	const distinct = [accent, primary, extra].filter(
		(hex, i, all) => toOklch(hex).c >= GREY && all.slice(0, i).every((seen) => distance(seen, hex) >= SAME)
	);

	if (distinct.length >= 2) return distinct.map(toOklch).sort((a, b) => a.l - b.l);

	// One colour: the band runs from a deeper version of it to a lighter one, turning a little in hue
	const base = distinct[0] ? toOklch(distinct[0]) : { l: 0.55, c: 0, h: 0 };
	return [
		{ l: Math.max(base.l - 0.18, 0.12), c: base.c, h: (base.h - 30 + 360) % 360 },
		{ l: Math.min(base.l + 0.18, 0.92), c: base.c, h: (base.h + 30) % 360 },
	];
}

function turnOf(path: Oklch[], segment: number): number {
	const from = path[segment]!.h;
	const short = shortTurn(from, path[segment + 1]!.h);
	if (Math.abs(short) < OPPOSITE) return short;

	const long = short - Math.sign(short) * 360;
	const others = path.filter((_, i) => i !== segment && i !== segment + 1).map((anchor) => anchor.h);
	const through = (turn: number) => others.filter((hue) => onArc(from, turn, hue)).length;

	if (through(short) !== through(long)) return through(short) > through(long) ? short : long;
	return onArc(from, short, GREEN) ? short : long;
}

function stops(path: Oklch[]): Oklch[] {
	const last = path.length - 1;

	return Array.from({ length: BANDS }, (_, i) => {
		const along = (i * last) / (BANDS - 1);
		const segment = Math.min(Math.floor(along), last - 1);
		return between(path[segment]!, path[segment + 1]!, along - segment, turnOf(path, segment));
	});
}

const clamp = (value: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, value));

/** The bands' lightnesses, dark to light, kept on the far side of the ink and a step apart. */
function spaced(lightnesses: number[], ink: number): number[] {
	const room = ink > 0.5 ? { lo: LIGHTNESS.lo, hi: ink - CLEAR_OF_INK } : { lo: ink + CLEAR_OF_INK, hi: LIGHTNESS.hi };
	const out = lightnesses.map((l) => clamp(l, room.lo, room.hi));

	for (let i = 1; i < out.length; i++) out[i] = Math.max(out[i]!, out[i - 1]! + STEP);
	const over = out[out.length - 1]! - room.hi;
	if (over > 0) for (let i = 0; i < out.length; i++) out[i] = Math.max(out[i]! - over, room.lo);

	return out;
}

export function cloudBands(roles: ChromaticRoles, ink: string): CloudBands {
	const path = stops(anchors(roles));
	const lightnesses = spaced(
		path.map((band) => band.l),
		toOklch(ink).l
	);

	return path.map((band, i) => toHex({ ...band, l: lightnesses[i]! })) as CloudBands;
}
