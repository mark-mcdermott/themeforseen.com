import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { createDb, customFonts } from '$lib/server/db';
import type { RequestHandler } from './$types';

const MIME_TYPES: Record<string, string> = {
	woff2: 'font/woff2',
	woff: 'font/woff',
	ttf: 'font/ttf',
	otf: 'font/otf'
};

// GET - Serve the font file
export const GET: RequestHandler = async ({ params, locals, platform }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const databaseUrl = platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		throw error(500, 'Database not configured');
	}

	const db = createDb(databaseUrl);
	const font = await db
		.select({
			userId: customFonts.userId,
			fontData: customFonts.fontData,
			format: customFonts.format,
			family: customFonts.family
		})
		.from(customFonts)
		.where(eq(customFonts.id, params.id))
		.limit(1);

	if (!font.length) {
		throw error(404, 'Font not found');
	}

	// Only allow owner to access their fonts
	if (font[0].userId !== locals.user.id) {
		throw error(403, 'Access denied');
	}

	const fontBuffer = Buffer.from(font[0].fontData, 'base64');
	const mimeType = MIME_TYPES[font[0].format] || 'application/octet-stream';

	return new Response(fontBuffer, {
		headers: {
			'Content-Type': mimeType,
			'Content-Length': fontBuffer.length.toString(),
			'Cache-Control': 'private, max-age=31536000',
			'Content-Disposition': `inline; filename="${font[0].family}.${font[0].format}"`
		}
	});
};
