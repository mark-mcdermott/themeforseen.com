import Stripe from 'stripe';

export function createStripe(secretKey: string) {
	return new Stripe(secretKey, {
		apiVersion: '2024-11-20.acacia'
	});
}

// Generate a unique license key
// Format: TF-XXXX-XXXX-XXXX-XXXX (where X is alphanumeric)
export function generateLicenseKey(): string {
	const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars: 0, O, I, 1
	const segments = 4;
	const segmentLength = 4;

	const parts: string[] = [];
	for (let i = 0; i < segments; i++) {
		let segment = '';
		for (let j = 0; j < segmentLength; j++) {
			segment += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		parts.push(segment);
	}

	return `TF-${parts.join('-')}`;
}

// Generate a unique ID for database records
export function generateId(): string {
	return crypto.randomUUID();
}
