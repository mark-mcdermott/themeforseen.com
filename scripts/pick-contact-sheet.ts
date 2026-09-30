/**
 * Chooses the themes for the contact sheet: the ones in the collection that
 * are hardest on the machine's structure, each for a different reason, so
 * that a system which survives them survives the rest. Writes
 * design/reference/contact-sheet.json.
 *
 * Usage: pnpm pick-themes
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { colorThemes, type ColorTheme } from 'theme-forseen/data';

import { contrast, distance, toOklch } from '../src/lib/color';
import { factory } from '../src/lib/product';

type Palette = ColorTheme['light'];
type Pick = { name: string; reason: string };

const OUT = fileURLToPath(new URL('../design/reference/contact-sheet.json', import.meta.url));

const named = (theme: ColorTheme) => theme.name;
const chroma = (hex: string) => toOklch(hex).c;
const lightness = (hex: string) => toOklch(hex).l;

/** The theme whose palette scores highest, among those not yet chosen. */
function pick(chosen: Pick[], reason: string, score: (light: Palette, dark: Palette, theme: ColorTheme) => number): void {
	const taken = new Set(chosen.map((p) => p.name));
	const best = colorThemes
		.filter((theme) => !taken.has(theme.name))
		.map((theme) => ({ theme, score: score(theme.light, theme.dark, theme) }))
		.sort((a, b) => b.score - a.score)[0];
	if (!best) throw new Error(`Nothing left to pick for: ${reason}`);
	chosen.push({ name: named(best.theme), reason });
}

const chosen: Pick[] = [
	{ name: factory.theme, reason: 'the factory theme' },
	{ name: colorThemes[0]!.name, reason: 'what a first visit got before there was a factory theme' },
];

pick(chosen, 'the darkest chassis a light mode has', (light) => -lightness(light.background));
pick(chosen, 'the lightest chassis a dark mode has', (_, dark) => lightness(dark.background));
pick(chosen, 'a chassis of middling lightness, where a seam has to choose which way to go', (light) => -Math.abs(lightness(light.background) - 0.55));
pick(chosen, 'the least contrast between ink and chassis', (light) => -contrast(light.text, light.background));
pick(chosen, 'the most vivid primary', (light) => chroma(light.primary));
pick(chosen, 'no colour at all', (light) => -(chroma(light.primary) + chroma(light.accent) + chroma(light.extra)));
pick(chosen, 'a primary the same as the chassis, so a key can vanish', (light) => -distance(light.primary, light.background));
pick(chosen, 'an accent the same as the ink', (light) => -distance(light.accent, light.text));
pick(chosen, 'the palest primary and accent, where white lettering fails', (light) => lightness(light.primary) + lightness(light.accent));
pick(chosen, 'a primary and accent that are opposites, where the cloud has to choose its way round', (light) => {
	const turn = Math.abs(((toOklch(light.primary).h - toOklch(light.accent).h + 540) % 360) - 180);
	return -turn - (chroma(light.primary) < 0.08 || chroma(light.accent) < 0.08 ? 1000 : 0);
});

writeFileSync(OUT, JSON.stringify({ note: 'Themes the contact sheet and the materials test render, chosen by scripts/pick-contact-sheet.ts.', themes: chosen }, null, '\t') + '\n');
for (const { name, reason } of chosen) console.log(`${name.padEnd(24)} ${reason}`);
