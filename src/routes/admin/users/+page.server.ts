import { error, redirect } from '@sveltejs/kit';
import { desc } from 'drizzle-orm';
import { createDb, users } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
	// Must be logged in
	if (!locals.user) {
		redirect(302, '/login');
	}

	// Must be admin
	if (!locals.user.isAdmin) {
		error(403, 'Admin access required');
	}

	if (!platform?.env?.DATABASE_URL) {
		error(500, 'Database not configured');
	}

	const db = createDb(platform.env.DATABASE_URL);

	const allUsers = await db
		.select({
			id: users.id,
			email: users.email,
			name: users.name,
			isAdmin: users.isAdmin,
			createdAt: users.createdAt
		})
		.from(users)
		.orderBy(desc(users.createdAt));

	return { users: allUsers };
};
