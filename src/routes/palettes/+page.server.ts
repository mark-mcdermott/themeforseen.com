import { redirect } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import { createDb, customPalettes } from '$lib/server/db';
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
		return { palettes: [] };
	}

	const db = createDb(databaseUrl);

	const palettes = await db
		.select()
		.from(customPalettes)
		.where(eq(customPalettes.userId, locals.user.id))
		.orderBy(desc(customPalettes.createdAt));

	return { palettes };
};
