/**
 * Custom properties the site derives from a palette, over and above the ones
 * ThemeForseen writes. Written into the page for the factory theme at build,
 * and by the adapter whenever the conditions change, so that both agree.
 */
import { cloudBands, type ChromaticRoles } from './cloud-bands';

export type DerivedFrom = ChromaticRoles & { text: string };

export function derivedProperties(palette: DerivedFrom): Record<string, string> {
	const bands = cloudBands(palette, palette.text);
	return Object.fromEntries(bands.map((band, i) => [`--cloud-${i + 1}`, band]));
}
