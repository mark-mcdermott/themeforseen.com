// Printful API integration
// API docs: https://developers.printful.com/docs/

interface PrintfulRecipient {
	name: string;
	address1: string;
	address2?: string;
	city: string;
	state_code?: string;
	country_code: string;
	zip: string;
	email: string;
}

interface PrintfulOrderItem {
	sync_variant_id: string; // Printful sync variant ID (from synced products)
	quantity: number;
	files?: {
		url: string;
		type: string; // 'default', 'back', etc.
	}[];
}

interface PrintfulOrderRequest {
	recipient: PrintfulRecipient;
	items: PrintfulOrderItem[];
	retail_costs?: {
		subtotal: string;
		shipping: string;
		total: string;
	};
}

interface PrintfulOrder {
	id: number;
	external_id: string;
	status: string;
	shipping: string;
	created: number;
	recipient: PrintfulRecipient;
	items: PrintfulOrderItem[];
}

export class PrintfulClient {
	private apiKey: string;
	private storeId?: string;
	private baseUrl = 'https://api.printful.com';

	constructor(apiKey: string, storeId?: string) {
		this.apiKey = apiKey;
		this.storeId = storeId;
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<T> {
		const headers: Record<string, string> = {
			Authorization: `Bearer ${this.apiKey}`,
			'Content-Type': 'application/json'
		};

		// Add store ID header if configured (required for multi-store accounts)
		if (this.storeId) {
			headers['X-PF-Store-Id'] = this.storeId;
		}

		const response = await fetch(`${this.baseUrl}${endpoint}`, {
			...options,
			headers: {
				...headers,
				...options.headers
			}
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error?.message || `Printful API error: ${response.status}`);
		}

		return data.result;
	}

	// Create a new order
	async createOrder(
		orderId: string,
		recipient: PrintfulRecipient,
		items: PrintfulOrderItem[],
		retailCosts?: { subtotal: number; shipping: number; total: number }
	): Promise<PrintfulOrder> {
		const orderData: PrintfulOrderRequest & { external_id: string } = {
			external_id: orderId,
			recipient,
			items
		};

		if (retailCosts) {
			orderData.retail_costs = {
				subtotal: (retailCosts.subtotal / 100).toFixed(2),
				shipping: (retailCosts.shipping / 100).toFixed(2),
				total: (retailCosts.total / 100).toFixed(2)
			};
		}

		return this.request<PrintfulOrder>('/orders', {
			method: 'POST',
			body: JSON.stringify(orderData)
		});
	}

	// Confirm a draft order (moves to production)
	async confirmOrder(orderId: number): Promise<PrintfulOrder> {
		return this.request<PrintfulOrder>(`/orders/${orderId}/confirm`, {
			method: 'POST'
		});
	}

	// Get order status
	async getOrder(orderId: number): Promise<PrintfulOrder> {
		return this.request<PrintfulOrder>(`/orders/${orderId}`);
	}

	// Get order by external ID (your order ID)
	async getOrderByExternalId(externalId: string): Promise<PrintfulOrder> {
		return this.request<PrintfulOrder>(`/orders/@${externalId}`);
	}

	// Calculate shipping rates for an order
	async calculateShipping(
		recipient: Partial<PrintfulRecipient>,
		items: { variant_id: number; quantity: number }[]
	): Promise<{ id: string; name: string; rate: string; currency: string }[]> {
		return this.request('/shipping/rates', {
			method: 'POST',
			body: JSON.stringify({ recipient, items })
		});
	}

	// Get product variants (for syncing)
	async getProductVariants(productId: number): Promise<unknown> {
		return this.request(`/products/${productId}`);
	}
}

// Factory function
export function createPrintfulClient(apiKey: string, storeId?: string): PrintfulClient {
	return new PrintfulClient(apiKey, storeId);
}
