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
