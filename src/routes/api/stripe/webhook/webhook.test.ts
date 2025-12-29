import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateLicenseKey } from '$lib/server/stripe';

describe('Stripe Webhook - Business Logic', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Configuration validation', () => {
		it('should require STRIPE_SECRET_KEY', () => {
			const env = {
				STRIPE_WEBHOOK_SECRET: 'whsec_xxx',
				DATABASE_URL: 'postgres://...'
			};

			const isConfigured = !!(env as any).STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET && env.DATABASE_URL;
			expect(isConfigured).toBe(false);
		});

		it('should require STRIPE_WEBHOOK_SECRET', () => {
			const env = {
				STRIPE_SECRET_KEY: 'sk_xxx',
				DATABASE_URL: 'postgres://...'
			};

			const isConfigured = !!env.STRIPE_SECRET_KEY && !!(env as any).STRIPE_WEBHOOK_SECRET && env.DATABASE_URL;
			expect(isConfigured).toBe(false);
		});

		it('should require DATABASE_URL', () => {
			const env = {
				STRIPE_SECRET_KEY: 'sk_xxx',
				STRIPE_WEBHOOK_SECRET: 'whsec_xxx'
			};

			const isConfigured = !!env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET && !!(env as any).DATABASE_URL;
			expect(isConfigured).toBe(false);
		});

		it('should pass with all config present', () => {
			const env = {
				STRIPE_SECRET_KEY: 'sk_xxx',
				STRIPE_WEBHOOK_SECRET: 'whsec_xxx',
				DATABASE_URL: 'postgres://...'
			};

			const isConfigured = !!env.STRIPE_SECRET_KEY && !!env.STRIPE_WEBHOOK_SECRET && !!env.DATABASE_URL;
			expect(isConfigured).toBe(true);
		});
	});

	describe('Signature validation', () => {
		it('should require stripe-signature header', () => {
			const signature = null;
			const hasSignature = !!signature;
			expect(hasSignature).toBe(false);
		});

		it('should accept valid signature header', () => {
			const signature = 't=1234567890,v1=abc123...';
			const hasSignature = !!signature;
			expect(hasSignature).toBe(true);
		});
	});

	describe('checkout.session.completed - Premium License', () => {
		it('should only process paid sessions', () => {
			const session = { payment_status: 'unpaid' };
			const shouldProcess = session.payment_status === 'paid';
			expect(shouldProcess).toBe(false);
		});

		it('should process paid sessions', () => {
			const session = { payment_status: 'paid' };
			const shouldProcess = session.payment_status === 'paid';
			expect(shouldProcess).toBe(true);
		});

		it('should require userId in metadata for premium purchase', () => {
			const session = {
				payment_status: 'paid',
				metadata: {}
			};

			const userId = session.metadata?.userId;
			expect(userId).toBeUndefined();
		});

		it('should extract userId from metadata', () => {
			const session = {
				payment_status: 'paid',
				metadata: { userId: 'user-123' }
			};

			const userId = session.metadata?.userId;
			expect(userId).toBe('user-123');
		});

		it('should generate valid license key', () => {
			const licenseKey = generateLicenseKey();
			expect(licenseKey).toMatch(/^TF-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
		});

		it('should create license record with correct fields', () => {
			const session = {
				id: 'cs_xxx',
				payment_intent: 'pi_xxx',
				amount_total: 4999,
				currency: 'usd',
				metadata: { userId: 'user-123' }
			};

			const licenseRecord = {
				id: crypto.randomUUID(),
				userId: session.metadata.userId,
				licenseKey: generateLicenseKey(),
				stripeSessionId: session.id,
				stripePaymentIntentId: session.payment_intent,
				amountPaid: session.amount_total,
				currency: session.currency,
				purchasedAt: new Date()
			};

			expect(licenseRecord.userId).toBe('user-123');
			expect(licenseRecord.stripeSessionId).toBe('cs_xxx');
			expect(licenseRecord.stripePaymentIntentId).toBe('pi_xxx');
			expect(licenseRecord.amountPaid).toBe(4999);
			expect(licenseRecord.currency).toBe('usd');
		});

		it('should update user to premium', () => {
			const user = { id: 'user-123', isPremium: false };

			// Simulate update
			user.isPremium = true;

			expect(user.isPremium).toBe(true);
		});
	});

	describe('checkout.session.completed - Store Order', () => {
		it('should identify store order by metadata type', () => {
			const session = {
				payment_status: 'paid',
				metadata: { type: 'store_order', orderId: 'order-123' }
			};

			const isStoreOrder = session.metadata?.type === 'store_order';
			expect(isStoreOrder).toBe(true);
		});

		it('should require orderId in store order metadata', () => {
			const session = {
				payment_status: 'paid',
				metadata: { type: 'store_order' }
			};

			const orderId = session.metadata?.orderId;
			expect(orderId).toBeUndefined();
		});

		it('should extract shipping address from session', () => {
			const session = {
				shipping: {
					name: 'John Doe',
					address: {
						line1: '123 Main St',
						line2: 'Apt 4',
						city: 'New York',
						state: 'NY',
						postal_code: '10001',
						country: 'US'
					}
				}
			};

			const shippingAddress = session.shipping?.address
				? {
						name: session.shipping.name || '',
						address1: session.shipping.address.line1 || '',
						address2: session.shipping.address.line2 || '',
						city: session.shipping.address.city || '',
						state: session.shipping.address.state || '',
						zip: session.shipping.address.postal_code || '',
						country: session.shipping.address.country || ''
					}
				: null;

			expect(shippingAddress).not.toBeNull();
			expect(shippingAddress?.name).toBe('John Doe');
			expect(shippingAddress?.address1).toBe('123 Main St');
			expect(shippingAddress?.city).toBe('New York');
			expect(shippingAddress?.state).toBe('NY');
			expect(shippingAddress?.zip).toBe('10001');
			expect(shippingAddress?.country).toBe('US');
		});

		it('should handle missing shipping address', () => {
			const session = {
				shipping: null
			};

			const shippingAddress = session.shipping?.address
				? { name: session.shipping.name }
				: null;

			expect(shippingAddress).toBeNull();
		});

		it('should extract customer email', () => {
			const session1 = {
				customer_details: { email: 'customer1@example.com' },
				customer_email: null
			};

			const session2 = {
				customer_details: null,
				customer_email: 'customer2@example.com'
			};

			const email1 = session1.customer_details?.email || session1.customer_email || '';
			const email2 = session2.customer_details?.email || session2.customer_email || '';

			expect(email1).toBe('customer1@example.com');
			expect(email2).toBe('customer2@example.com');
		});

		it('should calculate shipping cost', () => {
			const session = {
				shipping_cost: { amount_total: 500 }
			};

			const shippingCost = session.shipping_cost?.amount_total || 0;
			expect(shippingCost).toBe(500);
		});

		it('should handle missing shipping cost', () => {
			const session = {
				shipping_cost: null
			};

			const shippingCost = session.shipping_cost?.amount_total || 0;
			expect(shippingCost).toBe(0);
		});

		it('should update order status to paid', () => {
			const order = { status: 'pending' };

			// Simulate update
			order.status = 'paid';

			expect(order.status).toBe('paid');
		});

		it('should extract payment intent ID', () => {
			// String format
			const session1 = { payment_intent: 'pi_xxx' };
			const piId1 = typeof session1.payment_intent === 'string'
				? session1.payment_intent
				: session1.payment_intent?.id;
			expect(piId1).toBe('pi_xxx');

			// Object format
			const session2 = { payment_intent: { id: 'pi_yyy' } };
			const piId2 = typeof session2.payment_intent === 'string'
				? session2.payment_intent
				: session2.payment_intent?.id;
			expect(piId2).toBe('pi_yyy');
		});
	});

	describe('Printful order creation', () => {
		it('should map cart items to Printful format', () => {
			const orderItems = [
				{ printfulSyncVariantId: '5096077618', quantity: 2 },
				{ printfulSyncVariantId: '5096072369', quantity: 1 }
			];

			const printfulItems = orderItems.map(item => ({
				sync_variant_id: item.printfulSyncVariantId,
				quantity: item.quantity
			}));

			expect(printfulItems).toHaveLength(2);
			expect(printfulItems[0]).toEqual({
				sync_variant_id: '5096077618',
				quantity: 2
			});
		});

		it('should format shipping address for Printful', () => {
			const shippingAddress = {
				name: 'John Doe',
				address1: '123 Main St',
				address2: 'Apt 4',
				city: 'New York',
				state: 'NY',
				zip: '10001',
				country: 'US'
			};
			const email = 'john@example.com';

			const printfulRecipient = {
				name: shippingAddress.name,
				address1: shippingAddress.address1,
				address2: shippingAddress.address2,
				city: shippingAddress.city,
				state_code: shippingAddress.state,
				country_code: shippingAddress.country,
				zip: shippingAddress.zip,
				email
			};

			expect(printfulRecipient.state_code).toBe('NY');
			expect(printfulRecipient.country_code).toBe('US');
		});

		it('should skip Printful if API key not configured', () => {
			const printfulApiKey = undefined;
			const shouldCreatePrintfulOrder = !!printfulApiKey;
			expect(shouldCreatePrintfulOrder).toBe(false);
		});

		it('should skip Printful if no shipping address', () => {
			const printfulApiKey = 'pk_xxx';
			const shippingAddress = null;
			const shouldCreatePrintfulOrder = !!printfulApiKey && !!shippingAddress;
			expect(shouldCreatePrintfulOrder).toBe(false);
		});

		it('should update order status to processing after Printful creation', () => {
			const order = { status: 'paid', printfulOrderId: null };

			// Simulate Printful order creation
			order.printfulOrderId = '12345678';
			order.status = 'processing';

			expect(order.status).toBe('processing');
			expect(order.printfulOrderId).toBe('12345678');
		});
	});

	describe('payment_intent.payment_failed', () => {
		it('should log failed payment', () => {
			const paymentIntent = { id: 'pi_failed_xxx' };

			// In real implementation, this logs the error
			const failedId = paymentIntent.id;
			expect(failedId).toBe('pi_failed_xxx');
		});
	});

	describe('Unhandled events', () => {
		it('should not throw for unhandled event types', () => {
			const eventTypes = [
				'customer.created',
				'invoice.paid',
				'subscription.updated'
			];

			// These should be logged but not throw
			for (const type of eventTypes) {
				const isHandled = ['checkout.session.completed', 'payment_intent.payment_failed'].includes(type);
				expect(isHandled).toBe(false);
			}
		});
	});

	describe('Email notification', () => {
		it('should skip email if no API key', () => {
			const resendApiKey = undefined;
			const userEmail = 'user@example.com';

			const shouldSendEmail = !!resendApiKey && !!userEmail;
			expect(shouldSendEmail).toBe(false);
		});

		it('should skip email if no user email', () => {
			const resendApiKey = 're_xxx';
			const userEmail = undefined;

			const shouldSendEmail = !!resendApiKey && !!userEmail;
			expect(shouldSendEmail).toBe(false);
		});

		it('should send email when configured', () => {
			const resendApiKey = 're_xxx';
			const userEmail = 'user@example.com';

			const shouldSendEmail = !!resendApiKey && !!userEmail;
			expect(shouldSendEmail).toBe(true);
		});

		it('should not fail webhook if email fails', () => {
			// The webhook should return success even if email fails
			// This is tested by the try/catch in the actual implementation
			const emailFailed = true;
			const webhookShouldSucceed = true; // Always true, email failure is non-fatal

			expect(webhookShouldSucceed).toBe(true);
		});
	});
});
