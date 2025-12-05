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

	// Load user's custom palettes
	const databaseUrl = platform?.env?.DATABASE_URL;
	let userPalettes: { id: string; name: string; light: unknown; dark: unknown }[] = [];

	if (databaseUrl) {
		const db = createDb(databaseUrl);
		userPalettes = await db
			.select({
				id: customPalettes.id,
				name: customPalettes.name,
				light: customPalettes.light,
				dark: customPalettes.dark
			})
			.from(customPalettes)
			.where(eq(customPalettes.userId, locals.user.id))
			.orderBy(desc(customPalettes.createdAt));
	}

	return { userPalettes };
};
