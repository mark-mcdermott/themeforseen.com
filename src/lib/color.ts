/**
 * The little colour arithmetic the site needs, in OKLab and OKLCH, so that
 * "darker", "further from the ink" and "between these two" mean what the eye
 * means by them. Björn Ottosson's matrices; no dependency.
 */

export interface Oklch {
	/** Lightness, 0 to 1. */
	l: number;
	/** Chroma, 0 upwards; about 0.3 at the most vivid sRGB can show. */
	c: number;
	/** Hue in degrees. */
	h: number;
}

type Triple = [number, number, number];

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

function hexToRgb(hex: string): Triple {
	const digits = hex.replace('#', '');
	const wide = digits.length === 3 ? [...digits].map((d) => d + d).join('') : digits;
	const value = Number.parseInt(wide.slice(0, 6), 16);
	if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(wide)) throw new Error(`Not a hex colour: ${hex}`);
	return [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((channel) => channel / 255) as Triple;
}

const toLinear = (channel: number) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
const fromLinear = (channel: number) => (channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055);

function linearToOklab([r, g, b]: Triple): Triple {
	const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
	const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
	const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

	return [
		0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
		1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
		0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
	];
}

function oklabToLinear([L, a, b]: Triple): Triple {
	const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;

	return [
		4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
		-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
		-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
	];
}

export function toOklch(hex: string): Oklch {
	const [l, a, b] = linearToOklab(hexToRgb(hex).map(toLinear) as Triple);
	const h = ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
	return { l, c: Math.hypot(a, b), h };
}

const inGamut = (rgb: Triple) => rgb.every((channel) => channel >= -0.0005 && channel <= 1.0005);

function linearOf({ l, c, h }: Oklch): Triple {
	const radians = (h * Math.PI) / 180;
	return oklabToLinear([l, c * Math.cos(radians), c * Math.sin(radians)]);
}

/** The nearest sRGB colour: lightness and hue are kept and chroma is lowered until it fits. */
export function toHex(colour: Oklch): string {
	const l = clamp(colour.l, 0, 1);
	let low = 0;
	let high = Math.max(colour.c, 0);
	let linear = linearOf({ ...colour, l });

	if (!inGamut(linear)) {
		for (let i = 0; i < 20; i++) {
			const c = (low + high) / 2;
			linear = linearOf({ l, c, h: colour.h });
			if (inGamut(linear)) low = c;
			else high = c;
		}
		linear = linearOf({ l, c: low, h: colour.h });
	}

	return `#${linear
		.map((channel) => Math.round(clamp(fromLinear(clamp(channel, 0, 1)), 0, 1) * 255)
			.toString(16)
			.padStart(2, '0'))
		.join('')}`;
}

/** Perceptual distance in OKLab; about 0.02 is a just-noticeable difference. */
export function distance(a: string, b: string): number {
	const [l1, a1, b1] = linearToOklab(hexToRgb(a).map(toLinear) as Triple);
	const [l2, a2, b2] = linearToOklab(hexToRgb(b).map(toLinear) as Triple);
	return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}

/** The turn from one hue to another the short way round, between -180 and 180. */
export function shortTurn(from: number, to: number): number {
	const turn = (to - from) % 360;
	if (turn > 180) return turn - 360;
	if (turn < -180) return turn + 360;
	return turn;
}

/** Whether `hue` lies on the arc that starts at `from` and turns by `turn`. */
export function onArc(from: number, turn: number, hue: number): boolean {
	const along = (((hue - from) % 360) + 360) % 360;
	return turn >= 0 ? along <= turn : along >= 360 + turn;
}

/** A point on the way from one colour to another. The hue turns by `turn` degrees; by default the short way round. */
export function between(from: Oklch, to: Oklch, t: number, turn = shortTurn(from.h, to.h)): Oklch {
	return {
		l: from.l + (to.l - from.l) * t,
		c: from.c + (to.c - from.c) * t,
		h: (from.h + turn * t + 360) % 360,
	};
}

/** WCAG 2 contrast ratio, for tests and reports. */
export function contrast(a: string, b: string): number {
	const luminance = (hex: string) => {
		const [r, g, b] = hexToRgb(hex).map(toLinear);
		return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
	};
	const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (light! + 0.05) / (dark! + 0.05);
}

/** `rgb(r, g, b)` as the browser reports it, back to hex. */
export function rgbToHex(rgb: string): string {
	const channels = rgb.match(/[\d.]+/g)?.slice(0, 3).map(Number);
	if (!channels || channels.length !== 3) throw new Error(`Not an rgb() colour: ${rgb}`);
	return `#${channels.map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`;
}
