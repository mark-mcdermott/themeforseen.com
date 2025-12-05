import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { createDb, abTests, customPalettes } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	const databaseUrl = platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		throw error(500, 'Database not configured');
	}

	const db = createDb(databaseUrl);

	// Find the test by share code
	const test = await db
		.select()
		.from(abTests)
		.where(eq(abTests.shareCode, params.code))
		.limit(1);

	if (!test.length) {
		throw error(404, 'Test not found');
	}

	const testData = test[0];

	// Check if test is public
	if (!testData.isPublic) {
		throw error(403, 'This test is not available');
	}

	// Get custom palette data if needed
	let variantAPaletteData = null;
	let variantBPaletteData = null;

	// Check if palettes are custom (by checking if they exist in customPalettes)
	const customPaletteA = await db
		.select({ light: customPalettes.light, dark: customPalettes.dark })
		.from(customPalettes)
		.where(eq(customPalettes.name, testData.variantAPalette))
		.limit(1);

	if (customPaletteA.length) {
		variantAPaletteData = customPaletteA[0];
	}

	const customPaletteB = await db
		.select({ light: customPalettes.light, dark: customPalettes.dark })
		.from(customPalettes)
		.where(eq(customPalettes.name, testData.variantBPalette))
		.limit(1);

	if (customPaletteB.length) {
		variantBPaletteData = customPaletteB[0];
	}

	return {
		test: {
			name: testData.name,
			description: testData.description,
			variantAName: testData.variantAName,
			variantAPalette: testData.variantAPalette,
			variantAFont: testData.variantAFont,
			variantBName: testData.variantBName,
			variantBPalette: testData.variantBPalette,
			variantBFont: testData.variantBFont,
			votesA: testData.votesA,
			votesB: testData.votesB,
			shareCode: testData.shareCode
		},
		variantAPaletteData,
		variantBPaletteData
	};
};
