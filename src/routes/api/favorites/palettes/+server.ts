import { json, error } from '@sveltejs/kit';
import { eq, and, desc } from 'drizzle-orm';
import { createDb, savedPalettes } from '$lib/server/db';
import { generateId } from '$lib/server/stripe';
import type { RequestHandler } from './$types';

// GET - List all saved palettes for the user
export const GET: RequestHandler = async ({ locals, platform }) => {
	if (!locals.user) {
		error(401, 'Not authenticated');
	}

	if (!locals.user.isPremium) {
		error(403, 'Premium subscription required');
	}

	const databaseUrl = platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		error(500, 'Database not configured');
	}

	const db = createDb(databaseUrl);

	const palettes = await db
		.select()
		.from(savedPalettes)
		.where(eq(savedPalettes.userId, locals.user.id))
		.orderBy(desc(savedPalettes.createdAt));

	return json({ palettes });
};

// POST - Save a new palette
export const POST: RequestHandler = async ({ locals, platform, request }) => {
	if (!locals.user) {
		error(401, 'Not authenticated');
	}

	if (!locals.user.isPremium) {
		error(403, 'Premium subscription required');
	}

	const databaseUrl = platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		error(500, 'Database not configured');
	}

	const db = createDb(databaseUrl);

	const body = await request.json();
	const { paletteName, notes } = body;

	if (!paletteName || typeof paletteName !== 'string') {
		error(400, 'Palette name is required');
	}

	// Check if already saved
	const [existing] = await db
		.select()
		.from(savedPalettes)
		.where(
			and(
				eq(savedPalettes.userId, locals.user.id),
				eq(savedPalettes.paletteName, paletteName)
			)
		)
		.limit(1);

	if (existing) {
		error(400, 'Palette already saved');
	}

	const [saved] = await db
		.insert(savedPalettes)
		.values({
			id: generateId(),
			userId: locals.user.id,
			paletteName,
			notes: notes || null
		})
		.returning();

	return json({ palette: saved }, { status: 201 });
};

// DELETE - Remove a saved palette
export const DELETE: RequestHandler = async ({ locals, platform, request }) => {
	if (!locals.user) {
		error(401, 'Not authenticated');
	}

	if (!locals.user.isPremium) {
		error(403, 'Premium subscription required');
	}

	const databaseUrl = platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		error(500, 'Database not configured');
	}

	const db = createDb(databaseUrl);

	const body = await request.json();
	const { paletteName } = body;

	if (!paletteName || typeof paletteName !== 'string') {
		error(400, 'Palette name is required');
	}

	await db
		.delete(savedPalettes)
		.where(
			and(
				eq(savedPalettes.userId, locals.user.id),
				eq(savedPalettes.paletteName, paletteName)
			)
		);

	return json({ success: true });
};
