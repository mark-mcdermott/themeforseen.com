/**
 * The cloud's geometry, read from the brand file so there is one definition of
 * the mark. The file holds one compound path: the outer silhouette, then the
 * counter that makes the cloud hollow.
 */
import logo from '../../design/brand/logo.svg?raw';

const data = logo.match(/ d="([^"]+)"/)?.[1] ?? '';
const [outer = '', counter = ''] = data.match(/M[^M]+/g) ?? [];

export const cloud = {
	width: 288.46,
	height: 296.29,
	outer,
	counter,
	/** Where the counter sits, for laying bands across it. */
	counterBox: { x: 30.35, y: 30.36, width: 227.97, height: 106.68 },
} as const;

/** Band edges as fractions of the counter's height. The dome takes the largest share. */
export const bandEdges = [0, 0.34, 0.52, 0.7, 0.86, 1] as const;
