import { json, error } from '@sveltejs/kit';
import { createStripe } from '$lib/server/stripe';
import { createDb, users } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, platform, url }) => {
	// Must be logged in
	if (!locals.user) {
		error(401, 'You must be logged in to purchase');
	}

	// Already premium
	if (locals.user.isPremium) {
		error(400, 'You already have a premium license');
	}

	const stripeSecretKey = platform?.env?.STRIPE_SECRET_KEY;
	const stripePriceId = platform?.env?.STRIPE_PRICE_ID;
	const databaseUrl = platform?.env?.DATABASE_URL;

	if (!stripeSecretKey || !stripePriceId || !databaseUrl) {
		error(500, 'Stripe not configured');
	}

	const stripe = createStripe(stripeSecretKey);
	const db = createDb(databaseUrl);

	// Get or create Stripe customer
	let customerId = locals.user.stripeCustomerId;

	if (!customerId) {
		const customer = await stripe.customers.create({
			email: locals.user.email,
			metadata: {
				userId: locals.user.id
			}
		});
		customerId = customer.id;

		// Save customer ID to user
		await db
			.update(users)
			.set({ stripeCustomerId: customerId })
			.where(eq(users.id, locals.user.id));
	}

	// Create checkout session
	const session = await stripe.checkout.sessions.create({
		customer: customerId,
		payment_method_types: ['card'],
		line_items: [
			{
				price: stripePriceId,
				quantity: 1
			}
		],
		mode: 'payment',
		success_url: `${url.origin}/account?payment=success`,
		cancel_url: `${url.origin}/pricing?payment=cancelled`,
		metadata: {
			userId: locals.user.id
		}
	});

	return json({ url: session.url });
};
