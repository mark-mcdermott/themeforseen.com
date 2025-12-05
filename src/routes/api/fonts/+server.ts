import { json, error } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import { createDb, customFonts } from '$lib/server/db';
import type { RequestHandler } from './$types';

const MAX_FILE_SIZE = 500 * 1024; // 500KB per font file
const MAX_FONTS_PER_USER = 10;
const ALLOWED_FORMATS = ['woff2', 'woff', 'ttf', 'otf'];

// GET - Fetch all fonts for the current user
export const GET: RequestHandler = async ({ locals, platform }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!locals.user.isPremium) {
		throw error(403, 'Premium subscription required');
	}

	const databaseUrl = platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		throw error(500, 'Database not configured');
	}

	const db = createDb(databaseUrl);
	const fonts = await db
		.select({
			id: customFonts.id,
			name: customFonts.name,
			family: customFonts.family,
			format: customFonts.format,
			weight: customFonts.weight,
			style: customFonts.style,
			fileSize: customFonts.fileSize,
			createdAt: customFonts.createdAt
		})
		.from(customFonts)
		.where(eq(customFonts.userId, locals.user.id))
		.orderBy(desc(customFonts.createdAt));

	return json({ fonts });
};

// POST - Upload a new font
export const POST: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!locals.user.isPremium) {
		throw error(403, 'Premium subscription required');
	}

	const databaseUrl = platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		throw error(500, 'Database not configured');
	}

	const db = createDb(databaseUrl);

	// Check font limit
	const existingFonts = await db
		.select({ id: customFonts.id })
		.from(customFonts)
		.where(eq(customFonts.userId, locals.user.id));

	if (existingFonts.length >= MAX_FONTS_PER_USER) {
		throw error(400, `Maximum of ${MAX_FONTS_PER_USER} custom fonts allowed`);
	}

	const formData = await request.formData();
	const file = formData.get('file') as File | null;
	const name = formData.get('name') as string | null;
	const family = formData.get('family') as string | null;
	const weight = (formData.get('weight') as string) || '400';
	const style = (formData.get('style') as string) || 'normal';

	if (!file || !name || !family) {
		throw error(400, 'Missing required fields: file, name, family');
	}

	// Validate file size
	if (file.size > MAX_FILE_SIZE) {
		throw error(400, `File size exceeds maximum of ${MAX_FILE_SIZE / 1024}KB`);
	}

	// Get format from file extension
	const extension = file.name.split('.').pop()?.toLowerCase();
	if (!extension || !ALLOWED_FORMATS.includes(extension)) {
		throw error(400, `Invalid file format. Allowed: ${ALLOWED_FORMATS.join(', ')}`);
	}

	// Convert file to base64
	const arrayBuffer = await file.arrayBuffer();
	const base64 = Buffer.from(arrayBuffer).toString('base64');

	// Generate ID
	const id = crypto.randomUUID();

	// Insert into database
	await db.insert(customFonts).values({
		id,
		userId: locals.user.id,
		name,
		family,
		format: extension,
		weight,
		style,
		fontData: base64,
		fileSize: file.size
	});

	return json({
		success: true,
		font: {
			id,
			name,
			family,
			format: extension,
			weight,
			style,
			fileSize: file.size
		}
	});
};

// DELETE - Remove a font
export const DELETE: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!locals.user.isPremium) {
		throw error(403, 'Premium subscription required');
	}

	const databaseUrl = platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		throw error(500, 'Database not configured');
	}

	const { id } = await request.json();
	if (!id) {
		throw error(400, 'Font ID required');
	}

	const db = createDb(databaseUrl);

	// Verify ownership
	const font = await db
		.select({ userId: customFonts.userId })
		.from(customFonts)
		.where(eq(customFonts.id, id))
		.limit(1);

	if (!font.length || font[0].userId !== locals.user.id) {
		throw error(404, 'Font not found');
	}

	await db.delete(customFonts).where(eq(customFonts.id, id));

	return json({ success: true });
};
