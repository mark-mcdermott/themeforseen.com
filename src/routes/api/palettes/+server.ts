import { json, error } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import { createDb, customPalettes } from '$lib/server/db';
import { generateId } from '$lib/server/stripe';
import type { RequestHandler } from './$types';

// Color mode schema for validation
interface ColorMode {
	primary: string;
	primaryShadow: string;
	accent: string;
	accentShadow: string;
	background: string;
	cardBackground: string;
	text: string;
	extra: string;
	h1Color: 'primary' | 'accent' | 'text';
	h2Color: 'primary' | 'accent' | 'text';
	h3Color: 'primary' | 'accent' | 'text';
}

function isValidHexColor(color: string): boolean {
	return /^#[0-9A-Fa-f]{6}$/.test(color);
}

function isValidHeadingColor(value: string): value is 'primary' | 'accent' | 'text' {
	return ['primary', 'accent', 'text'].includes(value);
}

function validateColorMode(mode: unknown, modeName: string): ColorMode {
	if (!mode || typeof mode !== 'object') {
		throw new Error(`${modeName} mode is required`);
	}

	const m = mode as Record<string, unknown>;
	const colorFields = ['primary', 'primaryShadow', 'accent', 'accentShadow', 'background', 'cardBackground', 'text', 'extra'];
	const headingFields = ['h1Color', 'h2Color', 'h3Color'];

	for (const field of colorFields) {
		if (typeof m[field] !== 'string' || !isValidHexColor(m[field] as string)) {
			throw new Error(`${modeName}.${field} must be a valid hex color (e.g., #FF0000)`);
		}
	}

	for (const field of headingFields) {
		if (!isValidHeadingColor(m[field] as string)) {
			throw new Error(`${modeName}.${field} must be 'primary', 'accent', or 'text'`);
		}
	}

	return m as unknown as ColorMode;
}

// GET - List all custom palettes for the user
export const GET: RequestHandler = async ({ locals, platform }) => {
	if (!locals.user) {
		error(401, 'Not authenticated');
	}

	if (!locals.user.isPremium) {
		error(403, 'Premium subscription required');
	}

	const databaseUrl = platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		error(500, 'Database not configured');
	}

	const db = createDb(databaseUrl);

	const palettes = await db
		.select()
		.from(customPalettes)
		.where(eq(customPalettes.userId, locals.user.id))
		.orderBy(desc(customPalettes.createdAt));

	return json({ palettes });
};

// POST - Create a new custom palette
export const POST: RequestHandler = async ({ locals, platform, request }) => {
	if (!locals.user) {
		error(401, 'Not authenticated');
	}

	if (!locals.user.isPremium) {
		error(403, 'Premium subscription required');
	}

	const databaseUrl = platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		error(500, 'Database not configured');
	}

	const db = createDb(databaseUrl);

	const body = await request.json();
	const { name, light, dark, tags } = body;

	if (!name || typeof name !== 'string' || name.trim().length === 0) {
		error(400, 'Palette name is required');
	}

	if (name.length > 100) {
		error(400, 'Palette name must be 100 characters or less');
	}

	// Validate color modes
	let validatedLight: ColorMode;
	let validatedDark: ColorMode;

	try {
		validatedLight = validateColorMode(light, 'light');
		validatedDark = validateColorMode(dark, 'dark');
	} catch (e) {
		error(400, (e as Error).message);
	}

	// Validate tags if provided
	let validatedTags: string[] | null = null;
	if (tags) {
		if (!Array.isArray(tags) || tags.some((t) => typeof t !== 'string')) {
			error(400, 'Tags must be an array of strings');
		}
		validatedTags = tags.map((t: string) => t.trim().toLowerCase()).filter((t: string) => t.length > 0);
	}

	const [created] = await db
		.insert(customPalettes)
		.values({
			id: generateId(),
			userId: locals.user.id,
			name: name.trim(),
			light: validatedLight,
			dark: validatedDark,
			tags: validatedTags
		})
		.returning();

	return json({ palette: created }, { status: 201 });
};

// PUT - Update an existing custom palette
export const PUT: RequestHandler = async ({ locals, platform, request }) => {
	if (!locals.user) {
		error(401, 'Not authenticated');
	}

	if (!locals.user.isPremium) {
		error(403, 'Premium subscription required');
	}

	const databaseUrl = platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		error(500, 'Database not configured');
	}

	const db = createDb(databaseUrl);

	const body = await request.json();
	const { id, name, light, dark, tags } = body;

	if (!id || typeof id !== 'string') {
		error(400, 'Palette ID is required');
	}

	// Verify ownership
	const [existing] = await db
		.select()
		.from(customPalettes)
		.where(eq(customPalettes.id, id))
		.limit(1);

	if (!existing) {
		error(404, 'Palette not found');
	}

	if (existing.userId !== locals.user.id) {
		error(403, 'Not authorized to edit this palette');
	}

	// Build update object
	const updates: Record<string, unknown> = { updatedAt: new Date() };

	if (name !== undefined) {
		if (typeof name !== 'string' || name.trim().length === 0) {
			error(400, 'Palette name cannot be empty');
		}
		if (name.length > 100) {
			error(400, 'Palette name must be 100 characters or less');
		}
		updates.name = name.trim();
	}

	if (light !== undefined) {
		try {
			updates.light = validateColorMode(light, 'light');
		} catch (e) {
			error(400, (e as Error).message);
		}
	}

	if (dark !== undefined) {
		try {
			updates.dark = validateColorMode(dark, 'dark');
		} catch (e) {
			error(400, (e as Error).message);
		}
	}

	if (tags !== undefined) {
		if (tags === null) {
			updates.tags = null;
		} else if (Array.isArray(tags)) {
			updates.tags = tags.map((t: string) => t.trim().toLowerCase()).filter((t: string) => t.length > 0);
		} else {
			error(400, 'Tags must be an array of strings or null');
		}
	}

	const [updated] = await db
		.update(customPalettes)
		.set(updates)
		.where(eq(customPalettes.id, id))
		.returning();

	return json({ palette: updated });
};

// DELETE - Remove a custom palette
export const DELETE: RequestHandler = async ({ locals, platform, request }) => {
	if (!locals.user) {
		error(401, 'Not authenticated');
	}

	if (!locals.user.isPremium) {
		error(403, 'Premium subscription required');
	}

	const databaseUrl = platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		error(500, 'Database not configured');
	}

	const db = createDb(databaseUrl);

	const body = await request.json();
	const { id } = body;

	if (!id || typeof id !== 'string') {
		error(400, 'Palette ID is required');
	}

	// Verify ownership
	const [existing] = await db
		.select()
		.from(customPalettes)
		.where(eq(customPalettes.id, id))
		.limit(1);

	if (!existing) {
		error(404, 'Palette not found');
	}

	if (existing.userId !== locals.user.id) {
		error(403, 'Not authorized to delete this palette');
	}

	await db.delete(customPalettes).where(eq(customPalettes.id, id));

	return json({ success: true });
};
