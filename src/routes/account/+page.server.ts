import { fail, redirect } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import { createDb, users, licenses } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	let license = null;

	if (locals.user.isPremium && platform?.env?.DATABASE_URL) {
		const db = createDb(platform.env.DATABASE_URL);
		const [userLicense] = await db
			.select({
				licenseKey: licenses.licenseKey,
				purchasedAt: licenses.purchasedAt
			})
			.from(licenses)
			.where(eq(licenses.userId, locals.user.id))
			.orderBy(desc(licenses.purchasedAt))
			.limit(1);

		license = userLicense || null;
	}

	return {
		user: {
			id: locals.user.id,
			email: locals.user.email,
			name: locals.user.name,
			isPremium: locals.user.isPremium
		},
		license
	};
};

export const actions: Actions = {
	default: async ({ request, locals, platform }) => {
		if (!locals.user) {
			return fail(401, { error: 'Not authenticated' });
		}

		const databaseUrl = platform?.env?.DATABASE_URL;
		if (!databaseUrl) {
			return fail(500, { error: 'Database not configured' });
		}

		const db = createDb(databaseUrl);

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const email = formData.get('email') as string;

		if (!email || !email.includes('@')) {
			return fail(400, { error: 'Valid email is required' });
		}

		try {
			await db
				.update(users)
				.set({
					name: name?.trim() || null,
					email: email.toLowerCase().trim(),
					updatedAt: new Date()
				})
				.where(eq(users.id, locals.user.id));

			return { success: true };
		} catch (e) {
			if ((e as { code?: string }).code === '23505') {
				return fail(400, { error: 'Email already in use' });
			}
			return fail(500, { error: 'Failed to update profile' });
		}
	}
};
