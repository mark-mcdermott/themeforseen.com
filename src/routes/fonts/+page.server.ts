import { redirect } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import { createDb, customFonts } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	if (!locals.user.isPremium) {
		redirect(302, '/pricing');
	}

	const databaseUrl = platform?.env?.DATABASE_URL;
	let userFonts: {
		id: string;
		name: string;
		family: string;
		format: string;
		weight: string;
		style: string;
		fileSize: number;
		createdAt: Date;
	}[] = [];

	if (databaseUrl) {
		const db = createDb(databaseUrl);
		userFonts = await db
			.select({
				id: customFonts.id,
				name: customFonts.name,
				family: customFonts.family,
				format: customFonts.format,
				weight: customFonts.weight,
				style: customFonts.style,
				fileSize: customFonts.fileSize,
				createdAt: customFonts.createdAt
			})
			.from(customFonts)
			.where(eq(customFonts.userId, locals.user.id))
			.orderBy(desc(customFonts.createdAt));
	}

	return { userFonts };
};
