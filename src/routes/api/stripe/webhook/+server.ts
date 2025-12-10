import { json, error, text } from '@sveltejs/kit';
import { createStripe, generateLicenseKey, generateId } from '$lib/server/stripe';
import { createDb, users, licenses, orders } from '$lib/server/db';
import { createResend, sendLicenseEmail } from '$lib/server/email';
import { createPrintfulClient } from '$lib/server/printful';
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
		// Use async version for Cloudflare Workers compatibility
		event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
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

			// Check if this is a store order or premium purchase
			if (session.metadata?.type === 'store_order') {
				// Handle store order
				await handleStoreOrder(session, db, platform);
			} else {
				// Handle premium license purchase
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

// Handle store order: update order in DB, create Printful order
async function handleStoreOrder(
	session: {
		id: string;
		payment_intent?: string | { id: string } | null;
		amount_total?: number | null;
		shipping_cost?: { amount_total?: number } | null;
		customer_details?: { email?: string | null } | null;
		customer_email?: string | null;
		shipping_details?: {
			name?: string | null;
			address?: {
				line1?: string | null;
				line2?: string | null;
				city?: string | null;
				state?: string | null;
				postal_code?: string | null;
				country?: string | null;
			} | null;
		} | null;
		metadata?: { orderId?: string; type?: string } | null;
	},
	db: ReturnType<typeof createDb>,
	platform: App.Platform | undefined
) {
	const orderId = session.metadata?.orderId;
	if (!orderId) {
		console.error('No orderId in store order metadata');
		return;
	}

	// Get order from database
	const [order] = await db
		.select()
		.from(orders)
		.where(eq(orders.id, orderId))
		.limit(1);

	if (!order) {
		console.error(`Order ${orderId} not found`);
		return;
	}

	const email = session.customer_details?.email || session.customer_email || '';
	const shippingCost = session.shipping_cost?.amount_total || 0;
	const total = session.amount_total || 0;

	// Build shipping address from Stripe session
	const shippingAddress = session.shipping_details?.address
		? {
				name: session.shipping_details.name || '',
				address1: session.shipping_details.address.line1 || '',
				address2: session.shipping_details.address.line2 || '',
				city: session.shipping_details.address.city || '',
				state: session.shipping_details.address.state || '',
				zip: session.shipping_details.address.postal_code || '',
				country: session.shipping_details.address.country || ''
			}
		: null;

	// Update order in database
	await db
		.update(orders)
		.set({
			email,
			status: 'paid',
			stripePaymentIntentId:
				typeof session.payment_intent === 'string'
					? session.payment_intent
					: session.payment_intent?.id,
			shipping: shippingCost,
			total,
			shippingAddress,
			updatedAt: new Date()
		})
		.where(eq(orders.id, orderId));

	console.log(`Store order ${orderId} marked as paid`);

	// Create Printful order if API key is configured
	const printfulApiKey = platform?.env?.PRINTFUL_API_KEY;
	if (printfulApiKey && shippingAddress) {
		try {
			const printful = createPrintfulClient(printfulApiKey);

			// Get items from order
			const items = order.items as Array<{
				printfulSyncVariantId: string;
				quantity: number;
			}>;

			// Create Printful order
			const printfulOrder = await printful.createOrder(
				orderId,
				{
					name: shippingAddress.name,
					address1: shippingAddress.address1,
					address2: shippingAddress.address2,
					city: shippingAddress.city,
					state_code: shippingAddress.state,
					country_code: shippingAddress.country,
					zip: shippingAddress.zip,
					email
				},
				items.map((item) => ({
					sync_variant_id: item.printfulSyncVariantId,
					quantity: item.quantity
				})),
				{
					subtotal: order.subtotal,
					shipping: shippingCost,
					total
				}
			);

			// Confirm the order (send to production)
			await printful.confirmOrder(printfulOrder.id);

			// Update order with Printful ID
			await db
				.update(orders)
				.set({
					printfulOrderId: String(printfulOrder.id),
					status: 'processing',
					updatedAt: new Date()
				})
				.where(eq(orders.id, orderId));

			console.log(`Printful order ${printfulOrder.id} created for order ${orderId}`);
		} catch (printfulError) {
			// Log but don't fail - order is still paid
			console.error('Failed to create Printful order:', printfulError);
		}
	} else if (!printfulApiKey) {
		console.log('Printful API key not configured - skipping fulfillment');
	}
}
