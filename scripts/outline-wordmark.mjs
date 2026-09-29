/**
 * Writes the wordmark as outlines, so the brand does not depend on a font
 * being loaded and never changes with the theme.
 *
 * Set in Sofia Sans Extra Condensed 900 (SIL Open Font License), chosen by
 * laying candidates over the reference: at the reference's cap height it
 * matches the mark's width with no tracking at all.
 *
 * Usage: node scripts/outline-wordmark.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import opentype from 'opentype.js';

const require = createRequire(import.meta.url);
const FONT = require.resolve('@fontsource/sofia-sans-extra-condensed/files/sofia-sans-extra-condensed-latin-900-normal.woff');
const OUT = fileURLToPath(new URL('../src/assets/brand/wordmark.json', import.meta.url));

const TEXT = 'THEMEFORSEEN';
const SIZE = 1000;

const buffer = readFileSync(FONT);
const font = opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));

// Glyphs are placed by hand. The library's own shaping stops on a substitution
// lookup this font carries, and capitals need nothing but advances and kerning.
const scale = SIZE / font.unitsPerEm;
const glyphs = [...TEXT].map((character) => font.charToGlyph(character));
const path = new opentype.Path();
let pen = 0;

glyphs.forEach((glyph, i) => {
	path.extend(glyph.getPath(pen, 0, SIZE));
	const next = glyphs[i + 1];
	pen += (glyph.advanceWidth + (next ? font.getKerningValue(glyph, next) : 0)) * scale;
});

const box = path.getBoundingBox();

// Shift so the ink starts at the origin and the baseline sits on the bottom edge.
const round = (value) => Math.round(value * 10) / 10;
const d = path.commands
	.map((command) => {
		const x = (value) => round(value - box.x1);
		const y = (value) => round(value - box.y1);

		switch (command.type) {
			case 'M':
			case 'L':
				return `${command.type}${x(command.x)} ${y(command.y)}`;
			case 'Q':
				return `Q${x(command.x1)} ${y(command.y1)} ${x(command.x)} ${y(command.y)}`;
			case 'C':
				return `C${x(command.x1)} ${y(command.y1)} ${x(command.x2)} ${y(command.y2)} ${x(command.x)} ${y(command.y)}`;
			default:
				return 'Z';
		}
	})
	.join('');

const wordmark = { text: TEXT, width: round(box.x2 - box.x1), height: round(box.y2 - box.y1), d };
writeFileSync(OUT, JSON.stringify(wordmark, null, '\t') + '\n');

console.log(`${TEXT}: ${wordmark.width} x ${wordmark.height}, ${d.length} characters of path data`);
