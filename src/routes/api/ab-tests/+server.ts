import { json, error } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import { createDb, abTests } from '$lib/server/db';
import type { RequestHandler } from './$types';

function generateShareCode(): string {
	const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
	let code = '';
	for (let i = 0; i < 8; i++) {
		code += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return code;
}

// GET - List all tests for the current user
export const GET: RequestHandler = async ({ locals, platform }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!locals.user.isPremium) {
		throw error(403, 'Premium subscription required');
	}

	const databaseUrl = platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		throw error(500, 'Database not configured');
	}

	const db = createDb(databaseUrl);
	const tests = await db
		.select()
		.from(abTests)
		.where(eq(abTests.userId, locals.user.id))
		.orderBy(desc(abTests.createdAt));

	return json({ tests });
};

// POST - Create a new A/B test
export const POST: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!locals.user.isPremium) {
		throw error(403, 'Premium subscription required');
	}

	const databaseUrl = platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		throw error(500, 'Database not configured');
	}

	const data = await request.json();
	const {
		name,
		description,
		variantAName,
		variantAPalette,
		variantAFont,
		variantBName,
		variantBPalette,
		variantBFont,
		isPublic = true
	} = data;

	if (!name || !variantAPalette || !variantBPalette) {
		throw error(400, 'Missing required fields');
	}

	const db = createDb(databaseUrl);
	const id = crypto.randomUUID();
	const shareCode = generateShareCode();

	await db.insert(abTests).values({
		id,
		userId: locals.user.id,
		name,
		description: description || null,
		variantAName: variantAName || 'Variant A',
		variantAPalette,
		variantAFont: variantAFont || null,
		variantBName: variantBName || 'Variant B',
		variantBPalette,
		variantBFont: variantBFont || null,
		isPublic,
		shareCode,
		votesA: 0,
		votesB: 0
	});

	return json({
		success: true,
		test: {
			id,
			shareCode,
			name
		}
	});
};

// DELETE - Remove a test
export const DELETE: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const databaseUrl = platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		throw error(500, 'Database not configured');
	}

	const { id } = await request.json();
	if (!id) {
		throw error(400, 'Test ID required');
	}

	const db = createDb(databaseUrl);

	// Verify ownership
	const test = await db
		.select({ userId: abTests.userId })
		.from(abTests)
		.where(eq(abTests.id, id))
		.limit(1);

	if (!test.length || test[0].userId !== locals.user.id) {
		throw error(404, 'Test not found');
	}

	await db.delete(abTests).where(eq(abTests.id, id));

	return json({ success: true });
};
