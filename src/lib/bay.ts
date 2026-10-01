/**
 * How the bay's interior is served. The picture in the bay and the preload in
 * the page's head have to agree on this, or the preload fetches a file the
 * picture never uses.
 */
import interior from '@/assets/photos/bay-interior.webp';

export const bayInterior = {
	src: interior,
	widths: [430, 645, 860],
	/** The cavity is 450 of the console's 1510 units. Below the console there is no cavity. */
	sizes: '(min-width: 1280px) 30vw, 1px',
	/** Only a console has a bay */
	media: '(min-width: 1280px)',
	/** A dark, grainy photograph behind plates and shadow: it does not need much */
	quality: 40,
} as const;
