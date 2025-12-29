import { vi } from 'vitest';

// Mock data storage
export const mockData = {
	users: new Map<string, any>(),
	sessions: new Map<string, any>(),
	licenses: new Map<string, any>(),
	abTests: new Map<string, any>(),
	abTestVotes: new Map<string, any>(),
	orders: new Map<string, any>()
};

// Reset mock data between tests
export function resetMockData() {
	mockData.users.clear();
	mockData.sessions.clear();
	mockData.licenses.clear();
	mockData.abTests.clear();
	mockData.abTestVotes.clear();
	mockData.orders.clear();
}

// Create a mock user
export function createMockUser(overrides: Partial<any> = {}) {
	const user = {
		id: crypto.randomUUID(),
		email: 'test@example.com',
		passwordHash: 'pbkdf2:100000:salt:hash',
		name: 'Test User',
		avatarUrl: null,
		isAdmin: false,
		isPremium: false,
		stripeCustomerId: null,
		createdAt: new Date(),
		updatedAt: new Date(),
		...overrides
	};
	mockData.users.set(user.id, user);
	return user;
}

// Create a mock A/B test
export function createMockAbTest(userId: string, overrides: Partial<any> = {}) {
	const test = {
		id: crypto.randomUUID(),
		userId,
		name: 'Test A/B Test',
		description: 'A test description',
		variantAName: 'Variant A',
		variantAPalette: 'ocean',
		variantAFont: null,
		variantBName: 'Variant B',
		variantBPalette: 'forest',
		variantBFont: null,
		isPublic: true,
		shareCode: Math.random().toString(36).substring(2, 10),
		votesA: 0,
		votesB: 0,
		createdAt: new Date(),
		endsAt: null,
		...overrides
	};
	mockData.abTests.set(test.id, test);
	return test;
}

// Create a mock order
export function createMockOrder(overrides: Partial<any> = {}) {
	const order = {
		id: crypto.randomUUID(),
		email: 'customer@example.com',
		userId: null,
		stripeSessionId: null,
		stripePaymentIntentId: null,
		printfulOrderId: null,
		status: 'pending',
		shippingAddress: null,
		items: [
			{
				productId: 'womens-relaxed-tee',
				variantId: 'womens-relaxed-tee-m',
				printfulSyncVariantId: '5096077618',
				quantity: 1,
				price: 2000
			}
		],
		subtotal: 2000,
		shipping: 0,
		total: 2000,
		trackingNumber: null,
		trackingUrl: null,
		createdAt: new Date(),
		updatedAt: new Date(),
		...overrides
	};
	mockData.orders.set(order.id, order);
	return order;
}

// Mock database query builder
function createMockQueryBuilder(tableName: string) {
	let whereConditions: any[] = [];
	let limitValue: number | null = null;
	let selectFields: any = null;

	const builder = {
		select: (fields?: any) => {
			selectFields = fields;
			return builder;
		},
		from: () => builder,
		where: (condition: any) => {
			whereConditions.push(condition);
			return builder;
		},
		limit: (n: number) => {
			limitValue = n;
			return builder;
		},
		orderBy: () => builder,
		then: (resolve: any) => {
			// Simulate query execution
			const data = mockData[tableName as keyof typeof mockData];
			if (data instanceof Map) {
				let results = Array.from(data.values());
				// Apply limit
				if (limitValue) {
					results = results.slice(0, limitValue);
				}
				resolve(results);
			} else {
				resolve([]);
			}
		}
	};

	// Make it thenable
	(builder as any)[Symbol.toStringTag] = 'Promise';

	return builder;
}

// Mock database
export function createMockDb() {
	return {
		select: (fields?: any) => createMockQueryBuilder(''),
		insert: (table: any) => ({
			values: vi.fn().mockResolvedValue(undefined)
		}),
		update: (table: any) => ({
			set: () => ({
				where: vi.fn().mockResolvedValue(undefined)
			})
		}),
		delete: (table: any) => ({
			where: vi.fn().mockResolvedValue(undefined)
		})
	};
}
