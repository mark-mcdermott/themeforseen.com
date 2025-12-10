import { fail, redirect } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import { createDb, users, licenses } from '$lib/server/db';
import { createLucia } from '$lib/server/auth';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, platform, url, cookies }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	const databaseUrl = platform?.env?.DATABASE_URL;

	// If payment=success, refresh the session to get updated isPremium status
	if (url.searchParams.get('payment') === 'success' && databaseUrl && locals.session) {
		const db = createDb(databaseUrl);
		const lucia = createLucia(db);

		// Invalidate the old session
		await lucia.invalidateSession(locals.session.id);

		// Create a new session with fresh user data
		const newSession = await lucia.createSession(locals.user.id, {});
		const sessionCookie = lucia.createSessionCookie(newSession.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '/',
			...sessionCookie.attributes
		});

		// Redirect to remove the query param and load with fresh session
		redirect(302, '/account?upgraded=true');
	}

	let license = null;

	if (locals.user.isPremium && databaseUrl) {
		const db = createDb(databaseUrl);
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

	// Check if we just upgraded (for showing toast)
	const justUpgraded = url.searchParams.get('upgraded') === 'true';

	return {
		user: {
			id: locals.user.id,
			email: locals.user.email,
			name: locals.user.name,
			isPremium: locals.user.isPremium
		},
		license,
		justUpgraded
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
