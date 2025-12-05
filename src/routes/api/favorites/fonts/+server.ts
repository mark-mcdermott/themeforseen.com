import { json, error } from '@sveltejs/kit';
import { eq, and, desc } from 'drizzle-orm';
import { createDb, savedFontPairings } from '$lib/server/db';
import { generateId } from '$lib/server/stripe';
import type { RequestHandler } from './$types';

// GET - List all saved font pairings for the user
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

	const pairings = await db
		.select()
		.from(savedFontPairings)
		.where(eq(savedFontPairings.userId, locals.user.id))
		.orderBy(desc(savedFontPairings.createdAt));

	return json({ pairings });
};

// POST - Save a new font pairing
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
	const { pairingName, notes } = body;

	if (!pairingName || typeof pairingName !== 'string') {
		error(400, 'Pairing name is required');
	}

	// Check if already saved
	const [existing] = await db
		.select()
		.from(savedFontPairings)
		.where(
			and(
				eq(savedFontPairings.userId, locals.user.id),
				eq(savedFontPairings.pairingName, pairingName)
			)
		)
		.limit(1);

	if (existing) {
		error(400, 'Font pairing already saved');
	}

	const [saved] = await db
		.insert(savedFontPairings)
		.values({
			id: generateId(),
			userId: locals.user.id,
			pairingName,
			notes: notes || null
		})
		.returning();

	return json({ pairing: saved }, { status: 201 });
};

// DELETE - Remove a saved font pairing
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
	const { pairingName } = body;

	if (!pairingName || typeof pairingName !== 'string') {
		error(400, 'Pairing name is required');
	}

	await db
		.delete(savedFontPairings)
		.where(
			and(
				eq(savedFontPairings.userId, locals.user.id),
				eq(savedFontPairings.pairingName, pairingName)
			)
		);

	return json({ success: true });
};
