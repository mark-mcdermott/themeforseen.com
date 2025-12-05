import { json, error, text } from '@sveltejs/kit';
import { createStripe, generateLicenseKey, generateId } from '$lib/server/stripe';
import { createDb, users, licenses } from '$lib/server/db';
import { createResend, sendLicenseEmail } from '$lib/server/email';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, platform }) => {
	const stripeSecretKey = platform?.env?.STRIPE_SECRET_KEY;
	const webhookSecret = platform?.env?.STRIPE_WEBHOOK_SECRET;
	const databaseUrl = platform?.env?.DATABASE_URL;

	if (!stripeSecretKey || !webhookSecret || !databaseUrl) {
		error(500, 'Stripe not configured');
	}

	const stripe = createStripe(stripeSecretKey);
	const db = createDb(databaseUrl);

	const body = await request.text();
	const signature = request.headers.get('stripe-signature');

	if (!signature) {
		error(400, 'Missing stripe-signature header');
	}

	let event;
	try {
		event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
	} catch (err) {
		console.error('Webhook signature verification failed:', err);
		error(400, 'Invalid signature');
	}

	// Handle the event
	switch (event.type) {
		case 'checkout.session.completed': {
			const session = event.data.object;

			// Only process paid sessions
			if (session.payment_status !== 'paid') {
				break;
			}

			const userId = session.metadata?.userId;
			if (!userId) {
				console.error('No userId in session metadata');
				break;
			}

			// Generate license key
			const licenseKey = generateLicenseKey();

			// Create license record
			await db.insert(licenses).values({
				id: generateId(),
				userId,
				licenseKey,
				stripeSessionId: session.id,
				stripePaymentIntentId: session.payment_intent as string,
				amountPaid: session.amount_total,
				currency: session.currency,
				purchasedAt: new Date()
			});

			// Get user info for email
			const [user] = await db
				.select({ email: users.email, name: users.name })
				.from(users)
				.where(eq(users.id, userId))
				.limit(1);

			// Update user to premium
			await db
				.update(users)
				.set({
					isPremium: true,
					updatedAt: new Date()
				})
				.where(eq(users.id, userId));

			console.log(`License ${licenseKey} created for user ${userId}`);

			// Send license email
			const resendApiKey = platform?.env?.RESEND_API_KEY;
			if (resendApiKey && user?.email) {
				try {
					const resend = createResend(resendApiKey);
					await sendLicenseEmail(resend, {
						to: user.email,
						licenseKey,
						userName: user.name
					});
					console.log(`License email sent to ${user.email}`);
				} catch (emailError) {
					// Log but don't fail the webhook - license was still created
					console.error('Failed to send license email:', emailError);
				}
			}
			break;
		}

		case 'payment_intent.payment_failed': {
			const paymentIntent = event.data.object;
			console.error('Payment failed:', paymentIntent.id);
			break;
		}

		default:
			console.log(`Unhandled event type: ${event.type}`);
	}

	return text('ok');
};
