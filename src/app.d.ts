// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: import('lucia').User | null;
			session: import('lucia').Session | null;
		}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env?: {
				DATABASE_URL?: string;
				STRIPE_SECRET_KEY?: string;
				STRIPE_WEBHOOK_SECRET?: string;
				STRIPE_PRICE_ID?: string;
				RESEND_API_KEY?: string;
			};
		}
	}
}

export {};
