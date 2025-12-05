import { json, error } from '@sveltejs/kit';
import { eq, and, sql } from 'drizzle-orm';
import { createDb, abTests, abTestVotes } from '$lib/server/db';
import type { RequestHandler } from './$types';

// POST - Submit a vote
export const POST: RequestHandler = async ({ params, request, platform, cookies }) => {
	const databaseUrl = platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		throw error(500, 'Database not configured');
	}

	const { variant } = await request.json();
	if (!variant || !['a', 'b'].includes(variant)) {
		throw error(400, 'Invalid variant. Must be "a" or "b"');
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
		throw error(403, 'This test is not accepting votes');
	}

	// Check if test has ended
	if (testData.endsAt && new Date(testData.endsAt) < new Date()) {
		throw error(400, 'This test has ended');
	}

	// Get or create visitor ID from cookie
	let visitorId = cookies.get('ab_visitor');
	if (!visitorId) {
		visitorId = crypto.randomUUID();
		cookies.set('ab_visitor', visitorId, {
			path: '/',
			maxAge: 60 * 60 * 24 * 365, // 1 year
			httpOnly: true,
			sameSite: 'lax'
		});
	}

	// Check if already voted
	const existingVote = await db
		.select()
		.from(abTestVotes)
		.where(and(eq(abTestVotes.testId, testData.id), eq(abTestVotes.visitorId, visitorId)))
		.limit(1);

	if (existingVote.length) {
		throw error(400, 'You have already voted on this test');
	}

	// Record the vote
	await db.insert(abTestVotes).values({
		id: crypto.randomUUID(),
		testId: testData.id,
		visitorId,
		variant
	});

	// Update vote count
	if (variant === 'a') {
		await db
			.update(abTests)
			.set({ votesA: sql`${abTests.votesA} + 1` })
			.where(eq(abTests.id, testData.id));
	} else {
		await db
			.update(abTests)
			.set({ votesB: sql`${abTests.votesB} + 1` })
			.where(eq(abTests.id, testData.id));
	}

	// Get updated counts
	const updated = await db
		.select({ votesA: abTests.votesA, votesB: abTests.votesB })
		.from(abTests)
		.where(eq(abTests.id, testData.id))
		.limit(1);

	return json({
		success: true,
		votesA: updated[0]?.votesA || 0,
		votesB: updated[0]?.votesB || 0
	});
};

// GET - Get current results
export const GET: RequestHandler = async ({ params, platform }) => {
	const databaseUrl = platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		throw error(500, 'Database not configured');
	}

	const db = createDb(databaseUrl);

	const test = await db
		.select({
			votesA: abTests.votesA,
			votesB: abTests.votesB,
			isPublic: abTests.isPublic
		})
		.from(abTests)
		.where(eq(abTests.shareCode, params.code))
		.limit(1);

	if (!test.length) {
		throw error(404, 'Test not found');
	}

	return json({
		votesA: test[0].votesA,
		votesB: test[0].votesB
	});
};
