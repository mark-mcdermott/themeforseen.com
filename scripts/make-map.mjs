/**
 * Makes the CRT's map of the contiguous United States from Natural Earth's
 * 1:110m data (public domain): the states, and the nation's outline drawn
 * over them. Projected with the Albers conic the USGS uses for the lower
 * forty-eight, simplified, rounded, and written to src/assets/map/contiguous-us.json.
 *
 * Usage: pnpm make-map
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SOURCE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/';
const OUT = fileURLToPath(new URL('../src/assets/map/contiguous-us.json', import.meta.url));
const WIDTH = 1000;
/** Douglas-Peucker tolerance, in units of the 1000-wide drawing. */
const TOLERANCE = 1.4;

const radians = (degrees) => (degrees * Math.PI) / 180;

/** Albers equal-area conic, USGS parameters for the contiguous states. */
function albers() {
	const phi1 = radians(29.5), phi2 = radians(45.5), phi0 = radians(37.5), lambda0 = radians(-96);
	const n = (Math.sin(phi1) + Math.sin(phi2)) / 2;
	const c = Math.cos(phi1) ** 2 + 2 * n * Math.sin(phi1);
	const rho = (phi) => Math.sqrt(c - 2 * n * Math.sin(phi)) / n;
	const rho0 = rho(phi0);
	return ([longitude, latitude]) => {
		const theta = n * (radians(longitude) - lambda0);
		const r = rho(radians(latitude));
		// y grows southward on the screen, so the conic's northward y is flipped
		return [r * Math.sin(theta), r * Math.cos(theta) - rho0];
	};
}

function simplify(points, tolerance) {
	if (points.length < 3) return points;
	const [first, last] = [points[0], points[points.length - 1]];
	let farthest = 0, index = 0;
	for (let i = 1; i < points.length - 1; i++) {
		const [x, y] = points[i];
		const [x1, y1] = first, [x2, y2] = last;
		const length = Math.hypot(x2 - x1, y2 - y1);
		const distance = length === 0 ? Math.hypot(x - x1, y - y1) : Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) / length;
		if (distance > farthest) { farthest = distance; index = i; }
	}
	if (farthest <= tolerance) return [first, last];
	return [...simplify(points.slice(0, index + 1), tolerance).slice(0, -1), ...simplify(points.slice(index), tolerance)];
}

const fetchJson = async (file) => (await fetch(SOURCE + file)).json();
const [states, countries] = await Promise.all([fetchJson('ne_110m_admin_1_states_provinces.geojson'), fetchJson('ne_110m_admin_0_countries.geojson')]);

const project = albers();
const rings = (geometry) => (geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates).map((polygon) => polygon[0]);

const contiguous = states.features.filter((feature) => !['Alaska', 'Hawaii'].includes(feature.properties.name));
const usa = countries.features.find((feature) => feature.properties.ADM0_A3 === 'USA');
const mainland = rings(usa.geometry).sort((a, b) => b.length - a.length)[0];

const projected = contiguous.map((feature) => ({ name: feature.properties.name, rings: rings(feature.geometry).map((ring) => ring.map(project)) }));
const all = projected.flatMap((state) => state.rings.flat());
const minX = Math.min(...all.map(([x]) => x)), maxX = Math.max(...all.map(([x]) => x));
const minY = Math.min(...all.map(([, y]) => y)), maxY = Math.max(...all.map(([, y]) => y));
const scale = WIDTH / (maxX - minX);
const fit = ([x, y]) => [(x - minX) * scale, (y - minY) * scale];
const height = Math.ceil((maxY - minY) * scale);

const path = (ring) => {
	const points = simplify(ring.map(fit), TOLERANCE).map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`);
	return `M${points.join('L')}Z`;
};

const out = {
	source: 'Natural Earth 1:110m, admin 0 and admin 1, public domain. Albers equal-area conic, standard parallels 29.5 and 45.5, central meridian -96.',
	viewBox: `0 0 ${WIDTH} ${height}`,
	nation: path(mainland.map(project)),
	states: projected.map((state) => ({ name: state.name, d: state.rings.map(path).join('') })),
};

writeFileSync(OUT, JSON.stringify(out) + '\n');
console.log(`${out.states.length} states, ${(JSON.stringify(out).length / 1024).toFixed(1)} KB, viewBox ${out.viewBox}`);
