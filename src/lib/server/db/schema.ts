import { pgTable, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';

// Users table for authentication
export const users = pgTable('users', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	name: text('name'),
	avatarUrl: text('avatar_url'),
	isAdmin: boolean('is_admin').notNull().default(false),
	isPremium: boolean('is_premium').notNull().default(false),
	stripeCustomerId: text('stripe_customer_id'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Sessions table for Lucia
export const sessions = pgTable('sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

// Licenses table for premium purchases
export const licenses = pgTable('licenses', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	licenseKey: text('license_key').notNull().unique(),
	stripePaymentIntentId: text('stripe_payment_intent_id'),
	stripeSessionId: text('stripe_session_id'),
	amountPaid: integer('amount_paid'), // in cents
	currency: text('currency').default('usd'),
	purchasedAt: timestamp('purchased_at', { withTimezone: true }).notNull().defaultNow(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Saved color palettes (favorites)
export const savedPalettes = pgTable('saved_palettes', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	paletteName: text('palette_name').notNull(), // References colorThemes[].name
	notes: text('notes'), // Optional user notes
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Saved font pairings (favorites)
export const savedFontPairings = pgTable('saved_font_pairings', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	pairingName: text('pairing_name').notNull(), // References fontPairings[].name
	notes: text('notes'), // Optional user notes
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Custom fonts (user-uploaded)
export const customFonts = pgTable('custom_fonts', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	name: text('name').notNull(), // Display name (e.g., "My Custom Font")
	family: text('family').notNull(), // CSS font-family name
	format: text('format').notNull(), // woff2, woff, ttf, otf
	weight: text('weight').notNull().default('400'), // 100-900
	style: text('style').notNull().default('normal'), // normal, italic
	fontData: text('font_data').notNull(), // Base64 encoded font data
	fileSize: integer('file_size').notNull(), // Size in bytes
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Custom color palettes (user-created)
export const customPalettes = pgTable('custom_palettes', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	light: jsonb('light').notNull(), // { primary, primaryShadow, accent, etc. }
	dark: jsonb('dark').notNull(),
	tags: text('tags').array(), // Optional tags
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// A/B Tests for comparing theme variants
export const abTests = pgTable('ab_tests', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	description: text('description'),
	// Variant A
	variantAName: text('variant_a_name').notNull().default('Variant A'),
	variantAPalette: text('variant_a_palette').notNull(), // Palette name or custom palette ID
	variantAFont: text('variant_a_font'), // Font pairing name (optional)
	// Variant B
	variantBName: text('variant_b_name').notNull().default('Variant B'),
	variantBPalette: text('variant_b_palette').notNull(),
	variantBFont: text('variant_b_font'),
	// Settings
	isPublic: boolean('is_public').notNull().default(true),
	shareCode: text('share_code').notNull().unique(), // Short code for sharing
	votesA: integer('votes_a').notNull().default(0),
	votesB: integer('votes_b').notNull().default(0),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	endsAt: timestamp('ends_at', { withTimezone: true }) // Optional end date
});

// Store orders for merch
export const orders = pgTable('orders', {
	id: text('id').primaryKey(),
	email: text('email').notNull(),
	userId: text('user_id').references(() => users.id, { onDelete: 'set null' }), // nullable for guest checkout
	stripeSessionId: text('stripe_session_id'),
	stripePaymentIntentId: text('stripe_payment_intent_id'),
	printfulOrderId: text('printful_order_id'),
	status: text('status').notNull().default('pending'), // pending, paid, processing, shipped, delivered, cancelled
	shippingAddress: jsonb('shipping_address'), // { name, address1, address2, city, state, zip, country }
	items: jsonb('items').notNull(), // [{ productId, variantId, quantity, price, printfulVariantId }]
	subtotal: integer('subtotal').notNull(), // in cents
	shipping: integer('shipping').notNull().default(0), // in cents
	total: integer('total').notNull(), // in cents
	trackingNumber: text('tracking_number'),
	trackingUrl: text('tracking_url'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Track individual votes to prevent duplicates
export const abTestVotes = pgTable('ab_test_votes', {
	id: text('id').primaryKey(),
	testId: text('test_id')
		.notNull()
		.references(() => abTests.id, { onDelete: 'cascade' }),
	visitorId: text('visitor_id').notNull(), // Fingerprint or session ID
	variant: text('variant').notNull(), // 'a' or 'b'
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type License = typeof licenses.$inferSelect;
export type NewLicense = typeof licenses.$inferInsert;
export type SavedPalette = typeof savedPalettes.$inferSelect;
export type NewSavedPalette = typeof savedPalettes.$inferInsert;
export type SavedFontPairing = typeof savedFontPairings.$inferSelect;
export type NewSavedFontPairing = typeof savedFontPairings.$inferInsert;
export type CustomPalette = typeof customPalettes.$inferSelect;
export type NewCustomPalette = typeof customPalettes.$inferInsert;
export type CustomFont = typeof customFonts.$inferSelect;
export type NewCustomFont = typeof customFonts.$inferInsert;
export type AbTest = typeof abTests.$inferSelect;
export type NewAbTest = typeof abTests.$inferInsert;
export type AbTestVote = typeof abTestVotes.$inferSelect;
export type NewAbTestVote = typeof abTestVotes.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
