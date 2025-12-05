import { redirect } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import { createDb, abTests, customPalettes } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	if (!locals.user.isPremium) {
		redirect(302, '/pricing');
	}

	const databaseUrl = platform?.env?.DATABASE_URL;
	let tests: {
		id: string;
		name: string;
		description: string | null;
		variantAName: string;
		variantAPalette: string;
		variantAFont: string | null;
		variantBName: string;
		variantBPalette: string;
		variantBFont: string | null;
		shareCode: string;
		votesA: number;
		votesB: number;
		isPublic: boolean;
		createdAt: Date;
	}[] = [];

	let userPalettes: { id: string; name: string }[] = [];

	if (databaseUrl) {
		const db = createDb(databaseUrl);

		tests = await db
			.select({
				id: abTests.id,
				name: abTests.name,
				description: abTests.description,
				variantAName: abTests.variantAName,
				variantAPalette: abTests.variantAPalette,
				variantAFont: abTests.variantAFont,
				variantBName: abTests.variantBName,
				variantBPalette: abTests.variantBPalette,
				variantBFont: abTests.variantBFont,
				shareCode: abTests.shareCode,
				votesA: abTests.votesA,
				votesB: abTests.votesB,
				isPublic: abTests.isPublic,
				createdAt: abTests.createdAt
			})
			.from(abTests)
			.where(eq(abTests.userId, locals.user.id))
			.orderBy(desc(abTests.createdAt));

		userPalettes = await db
			.select({ id: customPalettes.id, name: customPalettes.name })
			.from(customPalettes)
			.where(eq(customPalettes.userId, locals.user.id))
			.orderBy(desc(customPalettes.createdAt));
	}

	return { tests, userPalettes };
};
