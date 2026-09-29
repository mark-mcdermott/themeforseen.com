import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

export const DIST = fileURLToPath(new URL('../../dist', import.meta.url));

const MIME = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript',
	'.css': 'text/css',
	'.json': 'application/json',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.webp': 'image/webp',
	'.avif': 'image/avif',
	'.woff2': 'font/woff2',
};

/**
 * Serves the built site in the foreground. `astro preview` detaches when it is
 * not attached to a terminal, which test runners read as the server dying.
 */
export function serve(port) {
	const server = createServer((request, response) => {
		const path = normalize(decodeURIComponent(new URL(request.url ?? '/', 'http://x').pathname)).replace(
			/^(\.\.[/\\])+/,
			''
		);
		let file = join(DIST, path);
		if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');

		if (!existsSync(file)) {
			response.writeHead(404).end();
			return;
		}

		response.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
		createReadStream(file).pipe(response);
	});

	return new Promise((resolve, reject) => {
		server.once('error', reject);
		server.listen(port, () => resolve(server));
	});
}
