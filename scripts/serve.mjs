/** Serves dist/ on the given port until stopped. Used by the test runner. */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { DIST, serve } from './lib/serve.mjs';

const port = Number(process.argv[2] ?? 4331);

if (!existsSync(join(DIST, 'index.html'))) {
	console.error('dist/index.html is missing. Run `pnpm build` first.');
	process.exit(1);
}

await serve(port);
console.log(`serving dist/ at http://localhost:${port}`);
