import { neon } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

export function createDb(databaseUrl: string) {
	const sql = neon(databaseUrl);
	return drizzle(sql, { schema });
}

/**
 * Wraps a database operation with retry logic for cold start resilience.
 * Useful for Neon serverless + Cloudflare Workers where first requests can timeout.
 */
export async function withRetry<T>(
	operation: () => Promise<T>,
	maxRetries = 3,
	baseDelayMs = 100
): Promise<T> {
	let lastError: unknown;

	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			return await operation();
		} catch (error) {
			lastError = error;
			// Only retry on connection/timeout errors, not on data errors
			const errorMessage = String(error);
			const isRetryable =
				errorMessage.includes('fetch failed') ||
				errorMessage.includes('ECONNREFUSED') ||
				errorMessage.includes('timeout') ||
				errorMessage.includes('socket') ||
				errorMessage.includes('network');

			if (!isRetryable || attempt === maxRetries - 1) {
				throw error;
			}

			// Exponential backoff with jitter
			const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 50;
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}

	throw lastError;
}

export type Database = NeonHttpDatabase<typeof schema>;
export * from './schema';
