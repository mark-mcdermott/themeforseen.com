import { redirect } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import { createDb, savedPalettes, savedFontPairings } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	if (!locals.user.isPremium) {
		redirect(302, '/pricing');
	}

	const databaseUrl = platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		return {
			palettes: [],
			fontPairings: []
		};
	}

	const db = createDb(databaseUrl);

	const [palettes, fontPairings] = await Promise.all([
		db
			.select()
			.from(savedPalettes)
			.where(eq(savedPalettes.userId, locals.user.id))
			.orderBy(desc(savedPalettes.createdAt)),
		db
			.select()
			.from(savedFontPairings)
			.where(eq(savedFontPairings.userId, locals.user.id))
			.orderBy(desc(savedFontPairings.createdAt))
	]);

	return {
		palettes,
		fontPairings
	};
};
