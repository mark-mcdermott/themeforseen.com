/**
 * What the site knows about ThemeForseen, read from the package when the site
 * is built. Nothing here is copied from it: a new release changes these by
 * being installed.
 */
import { colorThemes, fontPairings, getAllThemeTags, type ColorTheme } from 'theme-forseen/data';
import widget from 'theme-forseen/package.json' with { type: 'json' };

type Palette = ColorTheme['light'];
type ColorRole = Exclude<keyof Palette, `h${number}Color`>;

/** The theme and pairing the station leaves the factory with, by their names in the collection. */
export const factory = { theme: 'Weather Station', fonts: 'Geist & Inter' } as const;

function named<Item extends { name: string }>(items: Item[], name: string, kind: string): Item {
	const item = items.find((candidate) => candidate.name === name);
	if (!item) throw new Error(`theme-forseen ${widget.version} has no ${kind} named "${name}".`);
	return item;
}

const theme = named(colorThemes, factory.theme, 'theme');
const pairing = named(fontPairings, factory.fonts, 'font pairing');

/** The custom properties ThemeForseen writes to <html>, by the role each one carries. */
const properties: Record<ColorRole, string> = {
	primary: '--color-primary',
	primaryShadow: '--color-primary-shadow',
	accent: '--color-accent',
	accentShadow: '--color-accent-shadow',
	background: '--color-bg',
	cardBackground: '--color-card-bg',
	text: '--color-text',
	extra: '--color-extra',
};

function settings(palette: Palette, scheme: 'light' | 'dark'): string {
	const colours = Object.entries(properties).map(([role, property]) => `${property}:${palette[role as ColorRole]}`);
	return [`color-scheme:${scheme}`, `--night:${scheme === 'dark' ? 1 : 0}`, ...colours].join(';');
}

/**
 * The station as it is before ThemeForseen has loaded, and without it: the
 * factory theme, by day or by night as the visitor's system asks.
 */
export const factoryStyles = `:root{${settings(theme.light, 'light')}}@media (prefers-color-scheme:dark){:root{${settings(theme.dark, 'dark')}}}`;

const count = new Intl.NumberFormat('en-US');

export const product = {
	version: widget.version,
	theme: theme.name,
	heading: pairing.heading,
	body: pairing.body,
	counts: {
		themes: count.format(colorThemes.length),
		pairings: count.format(fontPairings.length),
		tags: count.format(getAllThemeTags().length),
	},
} as const;
